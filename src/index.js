import { Graph, GraphNode } from "./graphscript/Graph";
import { DOMService } from "./graphscript/services/dom/DOM.service";
import { Router } from "./graphscript/services/router/Router";

import transform from "./transform.js";
import getFnParamInfo from "./parse.js";

const isNode = 'process' in globalThis

class ESPlugin {

    // Private
    #initial;
    #options;
    #instance;
    #graph;
    #router;
    #cache = {}
    #plugins = {}
    #active = false

    plugins = {}

    #toRun = false
    #runProps = true

    // Restricted
    get initial() { return this.#initial }

    get instance() { return this.#instance }

    get graph() { return this.#graph }
    set graph(v) { this.#graph = v }

    constructor(node, options = {}) {

        // Get Base Initial Object
        this.#initial = node;
        this.#options = options;

        // Create One Router for the Plugin Set
        this.#router = (options._router) ? options._router : options._router = new Router({
                linkServices: false,
                includeClassName: false,
            })

        do { this.#initial = this.initial.initial ?? this.initial } while (this.initial instanceof ESPlugin)

        const isFunction = typeof this.initial === 'function'
        const hasDefault = 'default' in this.initial
        let hasGraph = !!node.graph

        if (!hasDefault && !hasGraph) {
            let newNode = { graph: { nodes: {} } }
            for (let namedExport in node) newNode.graph.nodes[namedExport] = { default: node[namedExport] }
            this.#initial = newNode
            hasGraph = true
            this.#runProps = false
        }

        // Parse ESPlugins (with default export)
        if (hasDefault || isFunction) {
            this.graph = this.#create(options.tag ?? 'defaultESPluginTag', this.initial)
        }

        // Parse Graphs
        if (hasGraph) {

            const toNotify = []

            // Instantiate Components First
            const nodes = this.initial.graph.nodes
            for (let tag in nodes) {
                const node2 = nodes[tag];
                if (!(node2 instanceof ESPlugin)) {
                    const clonedOptions = Object.assign({}, Object.assign(options));
                    const plugin = new ESPlugin(node2, Object.assign(clonedOptions, { tag }));
                    this.#plugins[tag] = plugin
                    toNotify.push(plugin)
                } else this.#cache[tag] = this.#plugins[tag] = node2
            }

            // Store Plugins with Unique Names ("Graph Paths")
            const thisTag = this.#options.tag
            toNotify.forEach((o) => {

                let tag = o.#options.tag
                if (thisTag) tag = `${thisTag}.${tag}`
                this.plugins[o.#options.tag] = o // basic tag

                // Notify User of New Plugins
                if (typeof options.onPlugin === "function") options.onPlugin(tag, o)
            })

        }

        Object.defineProperty(this, 'tag', {
            get: () => this.graph?.tag,
            enumerable: true
        })
    }

    #createTree = () => {
        let tree = {}
        for (let tag in this.#plugins) {

            // Recreate Graph from Initial Values (stored here)
            let thisNode = this.#plugins[tag].graph
            if (this.#cache[tag]) {
                let gs = this.#cache[tag].graph
                const ref = (gs.node) ? gs.node : gs
                thisNode = {}
                for (let key in ref._initial) thisNode[key] = ref[key] // take the node's state
                thisNode.tag = tag // adjust tag
                gs.state.triggers = {} //remove subs
            }

            tree[tag] = this.#create(tag, thisNode); // create new plugin
        }
        

        let listeningFor = {}
        let quickLookup = {}

        let resolve = (path) => {
            if (quickLookup[path] === undefined) {
                const splitEdge = path.split('.')
                const first = splitEdge.shift()
                const lastKey = splitEdge.pop()
                let last = tree[first]
                if (last) {
                    splitEdge.forEach(str => last = last.nodes.get(str))
                    const resolved = lastKey ? last.nodes.get(lastKey) : last
                    quickLookup[path] = { resolved, last, lastKey }
                } else console.error(`Target associated with ${path} was not found`)
            }

            return quickLookup[path]
        }

        let activate = async (edges, data) => {

            for (let input in edges) {
                let {resolved, last, lastKey} = resolve(input)

                // Will pass to children natively
                if (resolved) {
                    const target = resolved.node ?? resolved
                    if (Array.isArray(data)) target.run(...data); 
                    else target.run(data); 
                } 
                
                // Set values / run functions + pass to registered listeners
                else {
                    const target = last.node ?? last
                    let res;
                    if (typeof target[lastKey] === 'function') {
                        if (Array.isArray(data)) res = await target[lastKey](...data); 
                        else res = await target[lastKey](data); 
                    } else res = target[lastKey] = data
                    if (listeningFor[input]) activate(listeningFor[input], res)
                } 
            }
        }

        // Subscribe to Edges
        const edges = this.initial.graph.edges
        for (let output in edges) {
            let o = resolve(output)

            // For Conventional Edges
            if (o?.resolved) {
                if (!o.resolved.children) o.resolved.children = {}

                // Update (and listen to) any ESM export  
                const callback = (data) => {
                    activate(edges[output], data)
                }
                if (o.resolved instanceof GraphNode) o.resolved.subscribe(callback)
                else this.#router.state.subscribeTrigger(o.resolved.tag, callback)

                // Maintain Native Children (to pass info and utilize graphscript core)
                // for (let input in edges[output]) o.resolved.children[input.split('.').pop()] = true
            } 
            
            // For Listening to ESM Attribute Assignment
            else listeningFor[output] = edges[output]
        }

        return tree

    }


    #activate = () => {

        // Compose Graph Tree from Components   
        if (this.initial.graph) {
            let tree = this.#createTree()
            const props = this.#instance ?? this.initial

            this.graph = (isNode ? new Graph(tree, this.#options.tag, props) : new DOMService({ routes: tree, name: this.#options.tag, props: this.#runProps ? props : undefined }, this.#options.parentNode))

            this.#router.load(this.graph)

            for (let tag in this.#plugins) {
                const cache = this.#cache[tag]
                if (cache)  cache.graph = tree[tag] // update graph
            }

        }
    }

    start = async (defer) => {

        if (this.#active === false){
        this.#active = true

        // Initialize Plugins
        const activateFuncs = []
        for (let key in this.plugins) {
            const o = this.plugins[key];
            await o.start((f) => {
                activateFuncs.push(f)
            });
        }

        // Activate Self
        this.#activate();

        const f = async () => {
            for (let f of activateFuncs) await f();
            if (this.#toRun) await this.run();
        }

        // Subscribe to Ports
        const graph = this.initial.graph
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
            if (lastNode) lastNode.subscribe((...args) => {
                for (let tag in lastNode.graph.children) this.#runGraph(lastNode.graph.children[tag], ...args);
            });
    
            // Proxy the first node (if no default behavior?)
              if (firstNode) this.#initial.operator = async function (...args) {
                  await firstNode.run(...args);
              };
        }

        if (typeof defer === "function") defer(f);
        else await f();
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
        if (!("default" in info) || info instanceof Graph) return info; // just a graph
        else {

            let activeInfo;
            if (info instanceof ESPlugin) {
                activeInfo = info.instance
                info = info.initial
            }

            const args = getFnParamInfo(info.default) ?? new Map();
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
                        args.get(key).state = v;
                        if (input === key) this.#toRun = true;
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

export default ESPlugin;
