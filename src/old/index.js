import { Graph, GraphNode } from "../Graph.js";
import transform from "../transform.js";
import getFnParamInfo from "./parse.js";

const isNode = 'process' in globalThis

class ESPlugin {
    

    // Restricted
    tag;
    graph;
    parent;
    element;
    parentNode;
    children = {};

    // Components
    tagName;
    style;
    attributes;

    // Private
    #toRun = false
    _initial;
    _trueInitial;
    _instance;

    constructor(node, options = {}) {

        // Get Base Initial Object
        this._initial = node;
        this._trueInitial = node
        do { this._initial = this._initial._initial ?? this._initial } while (this._initial instanceof ESPlugin)

        // Declare Private ParentNode Property
        let parentNode;
        Object.defineProperty(this, 'parentNode', {
            get: () => parentNode,
            set: (el) => {
                parentNode = el

                if (el) {
                    if (this.element) {
                        parentNode.appendChild(this.element); // add to DOM
                        if (typeof this.onrender === "function") this.onrender(); // onrender support
                    } else {

                    }
                } else if (this.element) this.element.remove()
            },
            enumerable: true
        })

        // Declare Private Element Property
        let element;
        Object.defineProperty(this, 'element', {
            get: () => element,
            set: (el) => {
                element = el

                if (this.parentNode) {
                    this.parentNode.appendChild(el); // add to DOM
                    if (typeof this.onrender === "function") this.onrender(); // onrender support
                }
            },
            enumerable: true
        })

        for (let k in node) this[k] = node[k]

        this.parent = options.parent;

        const getParentNode = () => options.parentNode ?? this.parent?.parentNode
        this.parentNode = getParentNode()

        // Parse Graphs
        if (this.graph) {

            // create graph tree
            let tree = {}
            for (let tag in this._initial.graph.nodes) {
                const innerNode = this._initial.graph.nodes[tag]
                tree[tag] = this.#create(tag, innerNode) // create new plugin (to be copied later)
            }

            const edges = this._initial.graph.edges
            for (let output in edges) {
                const outNode = tree[output]
                if (!outNode.children) outNode.children = {}
                for (let input in edges[output]) outNode.children[input] = true
            }

            this._graphscript = new Graph(tree)
            this.tag = this._graphscript.tag

            // Create ES Plugins Inside the Graph
            for (let tag in this._initial.graph.nodes) {
                const node = this._initial.graph.nodes[tag]
                if (!(node instanceof ESPlugin)) {
                    const clonedOptions = Object.assign({}, Object.assign(options))
                    this._initial.graph.nodes[tag] = new ESPlugin(node, Object.assign(clonedOptions, {
                        tag,
                        parent: this,
                    }))

                    if (typeof options.onPlugin === 'function') options.onPlugin(this.graph.nodes[tag])
                }

                // Transfer Essential Info
                else {
                    node.tag = tag
                    node.parent = this
                    node.init()
                }
            }
        }

        // Parse ESPlugins (with default export)
        if ('default' in this._initial) {
                this.tag = options.tag ?? 'defaultESPluginTag' // or top-level graph;
                this._graphscript = new GraphNode(this.#create(this.tag, this._initial))    
        }

        // ---------------------- WASL Support ----------------------
        if (options.activate !== false) {
            if (typeof this.oncreate === "function") this.oncreate(); // oncreate support
            if (this.loop) {
                setInterval(() => {
                    this.run();
                }, this.loop);
            }

            // Basic Element Support
            if (isNode) { } else {

                if (this.tagName) this.element = document.createElement(this.tagName);

                this.parentNode = getParentNode() ?? document.body

                if (this.element) {
                    if (this.attributes) {
                        for (let attribute in this.attributes) {
                            const value = this.attributes[attribute];
                            if (typeof value === "function") {
                                const boundValue = value.bind(this);
                                this.element[attribute] = (ev) => boundValue(ev);
                            } else this.element[attribute] = value;
                        }
                    }
                }
            }
        }
    }

    // ---------------------- Run at Initialization (if desired) ----------------------
    init = async () => {

        if ('default' in this._initial){

            if (this.parent) {
                const got = this.parent._graphscript.nodes.get(this.tag)
                if (got) this._graphscript = got
            }

            if (this.#toRun) await this.run()
        }
    }

    #create = (tag, info) => {

        let activeInfo;
        if (info instanceof ESPlugin){
            activeInfo = info._instance
            info = info._initial
        }

        const args = getFnParamInfo(info.default) ?? new Map();
        if (args.size === 0) args.set("default", {});
        const input = args.keys().next().value

        // merge with user-specified arguments
        if (this.arguments) {
            for (let key in this.arguments) {
                const o = args.get(key);
                o.state = this.arguments[key];
                if (input === key) this.#toRun = true // run on initialization if setting the trigger
            }
        }

        this.arguments = args;

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


        this._instance = gsIn

        return transform(tag, gsIn) // add arguments as sub-graphs
    }

    // Call Graphscript by Proxy
    run = async (...args) => await this._graphscript.run(...args) 
}

export default ESPlugin;
