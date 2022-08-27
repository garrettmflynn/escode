import { GraphNode } from "./graphscript/Graph";
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
        

        // Parse Graphs
        if (node.graph) {

            // create graph tree
            let tree = {}
            for (let tag in this.initial.graph.nodes) {
                const innerNode = this.initial.graph.nodes[tag]
                tree[tag] = this.#create(tag, innerNode) // create new plugin (to be copied later)
            }

            const edges = this.initial.graph.edges
            for (let output in edges) {
                const outNode = tree[output]
                if (!outNode.children) outNode.children = {}
                for (let input in edges[output]) outNode.children[input] = true
            }

            this.graphscript = (isNode) ? new Graph(tree) : new DOMService({ routes: tree }, options.parentNode)

            // Create ES Plugins Inside the Graph
            for (let tag in this.initial.graph.nodes) {
                const node = this.initial.graph.nodes[tag]
                if (!(node instanceof ESPlugin)) {
                    const clonedOptions = Object.assign({}, Object.assign(options))
                    this.initial.graph.nodes[tag] = new ESPlugin(node, Object.assign(clonedOptions, { tag }))

                    if (typeof options.onPlugin === 'function') options.onPlugin(node.graph.nodes[tag])
                }

                // Transfer Essential Info
                else {
                    const got = this.graphscript.nodes.get(tag)
                    if (got) node.graphscript = got
                }
            }
        }

        // Parse ESPlugins (with default export)
        if ('default' in this.initial) {
            this.graphscript = new GraphNode(this.#create(options.tag ?? 'defaultESPluginTag', this.initial))    
        }


        let tag = this.graphscript?.tag
        Object.defineProperty(this, 'tag', {
            get: () => this.graphscript?.tag,
            enumerable: true
        })
    }

    #create = (tag, info) => {

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

    run = async (...args) => await this.graphscript.run(...args) // Call Graphscript by Proxy
}

export default ESPlugin;
