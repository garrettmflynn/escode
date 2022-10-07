import { Graph, GraphNode } from "./graphscript/Graph";
import { DOMService } from "./graphscript/services/dom/DOM.service";
import { Router } from "./graphscript/services/router/Router";

import transform from "./transform.js";
import getFnParamInfo from "./parse.js";

const isNode = 'process' in globalThis

class ESComponent {

    // Private
    #initial;
    #options;
    #instance;
    #graph;
    #router;
    #cache = {}
    #components = {}
    #active = false

    listeners = {
        pool: {
            in: {},
            out: {}
        },
        active: {},
        includeParent: {}
    }

    components = {}

    #toRun = false
    #runProps = true

    // Restricted
    get initial() { return this.#initial }

    get instance() { return this.#instance }

    get graph() { return this.#graph }
    set graph(v) { this.#graph = v }

    constructor(node, options = {}, parent) {

        // Get Base Initial Object
        this.#initial = node;
        this.#options = options;

        // Create One Router for the Component Set
        this.#router = (options._router) ? options._router : options._router = new Router({
                linkServices: false,
                includeClassName: false,
            })

        do { this.#initial = this.initial.initial ?? this.initial } while (this.initial instanceof ESComponent)

        const hasDefault = 'default' in this.initial
        let hasComponents = !!node.components
        const parentHasComponents = !!parent?.components

        const isFunctionCollection = !parentHasComponents && !hasDefault && !hasComponents
        if (isFunctionCollection) {
            let newNode = { components: {} }
            for (let namedExport in node) newNode.components[namedExport] = { default: node[namedExport] }
            this.#initial = newNode
            hasComponents = true
            this.#runProps = false
        }

        // Parse Graphs
        if (hasComponents) {

            const toNotify = []

            // Instantiate Components First
            const components = this.initial.components
            for (let tag in components) {
                const node2 = components[tag];
                if (!(node2 instanceof ESComponent)) {
                    const clonedOptions = Object.assign({}, Object.assign(options));
                    const component = new ESComponent(node2, Object.assign(clonedOptions, { tag }), node);
                    this.#components[tag] = component
                    toNotify.push(component)
                } else this.#cache[tag] = this.#components[tag] = node2
            }

            // Store Components with Unique Names ("Graph Paths")
            const thisTag = this.#options.tag
            toNotify.forEach((o) => {

                let tag = o.#options.tag
                if (thisTag) tag = `${thisTag}.${tag}`
                this.components[o.#options.tag] = o // basic tag

                // Notify User of New Components
                if (typeof options.onComponent === "function") options.onComponent(tag, o)
            })

        } 

        // Parse ESComponents (with default export)
        else this.graph = this.#create(options.tag ?? 'defaultESComponentTag', this.initial)

        Object.defineProperty(this, 'tag', {
            get: () => this.graph?.tag,
            enumerable: true
        })
    }

    #createTree = () => {
        let tree = {}
        for (let tag in this.#components) {

            // Recreate Graph from Initial Values (stored here)
            let thisNode = this.#components[tag].graph
            if (this.#cache[tag]) {
                let gs = this.#cache[tag].graph
                const ref = (gs.node) ? gs.node : gs
                thisNode = {}
                for (let key in ref._initial) thisNode[key] = ref[key] // take the node's state
                thisNode.tag = tag // adjust tag
                gs.state.triggers = {} //remove subs
            }
            tree[tag] = this.#create(tag, thisNode); // create new component
        }

        return tree

    }


    #activate = () => {

        // Compose Graph Tree from Components   
        if (this.initial.components) {
            let tree = this.#createTree()
            const props = this.#instance ?? this.initial

            this.graph = (isNode ? new Graph(tree, this.#options.tag, props) : new DOMService({ routes: tree, name: this.#options.tag, props: this.#runProps ? props : undefined }, this.#options.parentNode))

            this.#router.load(this.graph)

            for (let tag in this.#components) {
                const cache = this.#cache[tag]
                if (cache)  cache.graph = tree[tag] // update graph
            }

        }
    }

    start = async (defer) => {

        if (this.#active === false){
        this.#active = true

        // Initialize Components
        const activateFuncs = []
        for (let key in this.components) {
            const o = this.components[key];
            await o.start((f) => {
                activateFuncs.push(f)
            });
        }

        // Activate Self
        this.#activate();

        const f = async (top) => {

            const toRun = []
            for (let f of activateFuncs) toRun.push(...await f(top)); // activate nested components
            
            // resolve missing children
            const listeners = [{reference: {}}, {reference: {}}]

            // listen to children if they exist
            let toListenTo = {
                ...this.initial.listeners
            }

            let listenTo = false
            for (let key in this.initial.children) {
                if (!(this.initial.children[key] instanceof GraphNode)) listenTo = true
            }

            const basePath = this.getPath()
            if (listenTo) {
                toListenTo[basePath] = true
            }
    
            Object.entries(toListenTo).forEach(([key, value]) => {
                for (let target in value)
                listeners[1].reference[target] = true;
                listeners[0].reference[key] = true;
            });

            const targets = [
                {
                reference: this.initial.children,
                condition: (child) => child === undefined,
                map: false // exclude children for path maps
                }, 
                ...listeners
            ]

            targets.forEach(o => {
            for (let path in o.reference) {
                if (!o.condition || o.condition(o.reference[path])){

                    // Initial Resolution
                    const updated = `${top.graph.name}.${path}`
                    let split = updated.split('.')

                    // Common
                    const lastKey = split.pop()

                    const absolute = path.split(".").slice(0, -1); // specified an absolute path
                    const relative = [...basePath ? basePath.split(".") : [], ...absolute]; // specified relative to current position
                    
                    let last = top.graph
                    let resolved = this.#router.nodes.get(updated);
                    if (resolved) last = this.#router.nodes.get(split.join('.')) ?? top.graph

                    // Backup Resolution
                    else { 
                        const get = (str, target) => target.nodes.get(str) ?? target[str]
                        split = relative
                        try {
                            split.forEach(str => last = get(str, last))
                            resolved = lastKey ? get(lastKey, last) : last
                        } catch {
                            last = top.graph;
                            split = absolute
                            absolute.forEach(str => last = get(str, last))
                            resolved = lastKey ? get(lastKey, last) : last
                        }
                    } 
                    const used = split.join(".")
                    const relJoin = relative.join(".")
                    const isSame = basePath === path
                    const mainPath = (basePath && !isSame && o.map !== false) ? `${basePath}.${path}` : path

                    o.reference[mainPath] = { resolved, last, lastKey, path: {
                        used,
                        absolute: (absolute) ? absolute.join('.') : null,
                        relative: (relative) ? relJoin : null
                    } }
                }
            } 
        })

            let listenerPool = {
                in: listeners[1].reference,
                out: listeners[0].reference
            }
            
            // Inherit Listeners (use full paths)
            const getKey = (key) => basePath ? `${basePath}.${key}` : key;
            for (let key in toListenTo) {
              const mainKey = getKey(key);
              const base = top.listeners.active[mainKey] = {}

              for (let inner in toListenTo[key]) {
                const newKey = getKey(inner)
                base[newKey] = toListenTo[key][inner];
              }
            }

            for (let key in this.listeners.includeParent) top.listeners.includeParent[key] = this.listeners.includeParent[key];


            for (let type in listenerPool) {
                top.listeners.pool[type] = {
                    ...listenerPool[type],
                    ...top.listeners.pool[type]
                }
            }

            this.listeners = top.listeners


            // Only Subscribe what is Necessary
            for (let key in listenerPool.out) {
                const node = listenerPool.out[key].resolved
                if (node instanceof GraphNode) {

                    // Mark as Subscribed 
                    const path = this.getPath(node, true)
                    if (this.listeners.includeParent[path]) this.listeners.includeParent[path] = true
                    
                    // Subscribe
                    this.subscribe(node)
                }
            }

            if (this.#toRun) toRun.push(this.run) // run on initialization
            return toRun
        }

        // Subscribe to Ports
        const graph = this.initial.components
        if (graph) {
            const ports = graph.ports;
            let firstNode, lastNode; 
    
            if (ports) {
                firstNode = await this.graph.get(ports.input)
                lastNode = this.graph.get(ports.output)
            } else {
              const nodes = Array.from(this.graph.nodes.values())
              firstNode = nodes[0]
              lastNode = nodes.slice(-1)[0]
            }
    
            // Subscribe to last node with a unique identifier
            if (lastNode)  {
                const path = this.getPath(lastNode, true)
                this.listeners.includeParent[path] = lastNode
                // this.subscribe(lastNode, {target: 'parent'});
            }
    
            // Proxy the first node (if no default behavior)
              if (firstNode && !this.#initial.default) this.#initial.operator = async function (...args) {  await firstNode.run(...args) };
              else this.#initial.operator = this.#initial.default
        }

        // Nested Components
        if (typeof defer === "function") defer(f);

        // Top-Level Component
        else {
            const toRun = await f(this);

            for (let key in this.listeners.includeParent) {
                const toResolve = this.listeners.includeParent[key]
                if (toResolve !== true) {
                    this.subscribe(toResolve)
                    this.listeners.includeParent[key] = true
                }
            }

            await Promise.all(toRun.map((f) => f()));
        }
    }

    }

    getPath = (graph=this.graph, includeTag = false) => {
        const basePath = []
        let target = graph
        do {
            if (target instanceof GraphNode) target = { node: target } // start correctly
            if (target.node){
                basePath.push(target.node.name)
                target = target.node.graph
            }
        } while (target.node)

        if (includeTag) return [...basePath.reverse(), graph.tag].join('.')
        else return basePath.reverse().join('.')
    }

    subscribe = (node) => {
       

        const path = this.getPath(node) || node.tag
        const targets = [node.children]
            
        // Resolving Active Information
        for (let key in this.listeners.active[path]) {
            const res = this.listeners.pool.in[key]
            if (res) this.listeners.active[path][key] = res
            else delete this.listeners.active[path][key]
        }

        targets.push(this.listeners.active[path]);
    
        // Aggregate Targets
        let aggregatedParent = false
        const aggregate = (arr) => {
          const aggregate = {}
          arr.forEach(o => {
            for (let key in o) {
              if (!(key in aggregate)) aggregate[key] = [ o[key] ];
              else {
                const ref1 = aggregate[key]
                const ref2 = o[key]

                const message = `Both children and listeners are declared for ${key}`
    
                const getId = (o) => o._unique ?? o.resolved._unique ?? o.last._unique
                const aggregateIds = ref1.map(getId)
                if (!aggregateIds.includes(getId(ref2))) {
                    console.warn(`${message}. Aggregating`, ref1, ref2)
                    ref1.push(ref2)
                } else console.warn(`${message}. Removing`, ref2)
              }
            }
          })
    
          return aggregate
        }
    
        let aggregated = aggregate(targets)
        // Subscribe to Node
        node.subscribe((args) => {
    
          // Add Parent to Aggregate
          if (path in this.listeners.includeParent && !aggregatedParent) {
            aggregated = aggregate([aggregated, node.graph.children])
            aggregatedParent = true
          }
    
            // Iterate through Multiple Targets
          for (let tag in aggregated)  aggregated[tag].forEach(info => this.resolve(args, info, aggregated))
        });
    }


    // Resolves information that should be passed to the location denoted in info
    resolve = (args, info) => {

        if (info.resolved instanceof GraphNode) info = info.resolved

        if (info instanceof GraphNode) {
            if (Array.isArray(args)) this.#runGraph(info, ...args)
            else this.#runGraph(info, args)
        } else {
            let res;

            // Call Function (with node)
            if (typeof info.resolved === "function") {
                if (Array.isArray(args)) res = info.resolved.call(info.last, ...args);
                else res = info.resolved.call(info.last, args);
            }
            
            // Replace Value
            else res = info.resolved = info.last[info.lastKey] = args;

            let resolved = this.listeners.active[`${info.path.used}.${info.lastKey}`] // absolute reference
            if (!resolved) resolved = this.listeners.active[info.lastKey] // relative reference

            for (let key in resolved) this.resolve(res, this.listeners.pool.in[key]) // Continue resolving
        }
    }

    stop = () => {
        if (this.#active === true){
            for (let k in this.nested) this.nested[k].stop()
            if (this.graph) this.graph.nodes.forEach((n) => {
                this.graph.removeTree(n) // remove from tree
                n.stopNode() // stop animating
                this.graph.state.triggers = {} //remove subs
            }) // destroy existing graph

            this.#active = false
        }

    }


    #create = (tag, info) => {

        if (typeof info === 'function') info = { default: info } // transform function
        if (!info || info instanceof Graph) return info; // just a graph
        else {

            let activeInfo;
            if (info instanceof ESComponent) {
                activeInfo = info.instance
                info = info.initial
            }


            const args = (info.default instanceof Function) ? getFnParamInfo(info.default) ?? new Map() : new Map();
            if (args.size === 0) args.set("default", {});

            // merge with user-specified arguments
            let argsArray = Array.from(args.entries())
            const input = argsArray[0][0]
            if (info.arguments) {
                const isArray = Array.isArray(info.arguments);
                let i = 0
                for (let key in info.arguments) {
                    const v = info.arguments[key];
                    if (isArray) {
                        argsArray[i].state = v;
                        if (i == 0) this.#toRun = true;
                    } else {
                        const got = args.get(key)
                        if (got) {
                            got.state = v;
                            if (input === key) this.#toRun = true;
                        }
                    }
                    i++
                }
            }

            const gsIn = {
                arguments: args,
                operator: info.default,
                tag,
                default: info.default // to use for reconstruction
            }


            var props = Object.getOwnPropertyNames(info)
            const onActive = ['arguments', 'default', 'tag', 'operator']
            props.forEach(key => {
                if (!onActive.includes(key)) gsIn[key] = info[key]
            })

            // Transfer Active Info 
            if (activeInfo) {
                for (let key in activeInfo) {
                    if (!onActive.includes(key)) gsIn[key] = activeInfo[key] // replace with active
                }
            }

            this.#instance = gsIn
            return transform(tag, gsIn) // add arguments as sub-graphs
        }
    }

    // Handle graph Run Syntax
    #runGraph = async (graph = this.graph, ...args) => {
        if (graph instanceof Graph) {
            if (graph.node) return graph.node.run(...args);
            else {
                if (args.length === 0) return this.#runDefault(graph);
                else if (graph.nodes.has(args[0])) return graph.run(...args);
                else return this.#runDefault(graph, ...args);
            }
        } else return await graph.run(...args);
    }

    #runDefault = (graph, ...args) => graph.run(graph.nodes.values().next().value, ...args);
    run = async (...args) => this.#runGraph(this.graph, ...args)
}

export default ESComponent;
