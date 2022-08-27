import { Graph } from "./graphscript/Graph";
import { DOMService } from "./graphscript/services/dom/DOM.service";

import transform from "./transform.js";
import getFnParamInfo from "./parse.js";

const isNode = 'process' in globalThis

class ESPlugin {
    
    // Private
    #initial;
    #instance;
    #graphscript;

    get initial() { return this.#initial }

    get instance() { return this.#instance }

    get graphscript() { return this.#graphscript }
    set graphscript(v) { this.#graphscript = v }

    constructor(node, options = {}) {

        // Get Base Initial Object
        this.#initial = node;
        do { this.#initial = this.initial.initial ?? this.initial } while (this.initial instanceof ESPlugin)
        
        const isFunction = typeof this.initial === 'function'
        const hasDefault = 'default' in this.initial
        let hasGraph = !!node.graph

        if (!hasDefault && !hasGraph) {
            let newNode = {graph: {nodes: {}}}
            for (let namedExport in node) newNode.graph.nodes[namedExport] = {default: node[namedExport]}
            this.#initial = newNode
            hasGraph = true
        }

        // Parse ESPlugins (with default export)
        if (hasDefault || isFunction) this.graphscript = this.#create(options.tag ?? 'defaultESPluginTag', this.initial)

        // Parse Graphs
        if (hasGraph) {

            // Instantiate Components First
            for (let tag in this.initial.graph.nodes) {
                const node2 = this.initial.graph.nodes[tag];
                if (!(node2 instanceof ESPlugin)) {
                    const clonedOptions = Object.assign({}, Object.assign(options));
                    this.initial.graph.nodes[tag] = new ESPlugin(node2, Object.assign(clonedOptions, { tag }));
                    // console.log(tag, this.initial.graph.nodes[tag])
                    if (typeof options.onPlugin === "function")
                    options.onPlugin(this.initial.graph.nodes[tag]);
                } else {
                    console.error('Gotta compensate')
                    const got = this.graphscript.nodes.get(tag);
                    if (got)
                    node2.graphscript = got;
                }
            }

            // Compose Graph Tree from Components   
            let tree = {}
            for (let tag in this.initial.graph.nodes) {
                const innerNode = this.#create(tag, this.initial.graph.nodes[tag]); // create new plugin
                tree[tag] = innerNode.graphscript ?? innerNode;
            }

            const edges = this.initial.graph.edges
            for (let output in edges) {
                const outNode = tree[output]
                if (!outNode.children) outNode.children = {}
                for (let input in edges[output]) outNode.children[input] = true
            }

            const props = this.#instance ?? node
            this.graphscript = isNode ? new Graph(tree, options.tag, props) : new DOMService({ routes: tree, name: options.tag, props }, options.parentNode);
        }

        Object.defineProperty(this, 'tag', {
            get: () => this.graphscript?.tag,
            enumerable: true
        })
    }

    #create = (tag, info) => {

        if (typeof info === 'function') info = {default: info} // transform function
        if (!("default" in info) || info instanceof Graph) return info; // just a graph
        else {

        let activeInfo;
        if (info instanceof ESPlugin){
            activeInfo = info.instance
            info = info.initial
        }

        const args = getFnParamInfo(info.default) ?? new Map();
        if (args.size === 0) args.set("default", {});
        const input = args.keys().next().value

        // merge with user-specified arguments
        if (info.arguments) {
            for (let key in info.arguments) {
                const o = args.get(key);
                o.state = info.arguments[key];
                if (input === key) this.run()  // run on initialization if setting the trigger
            }
        }

        const gsIn = {
            arguments: args,
            operator: info.default,
            tag
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

    run = async (...args) => await this.graphscript.run(...args) // Call Graphscript by Proxy
}

export default ESPlugin;
