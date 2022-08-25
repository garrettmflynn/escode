import getFnParamInfo from "./parse.js";

const isNode = 'process' in globalThis

class ESPlugin {
  tag;
  graph;
  parent;

  // Components
  tagName;
  style;
  attributes;

  #toRun = false

  constructor(node, options={}) {

    // Declare Private ParentNode Property
    let parentNode;
    Object.defineProperty(this, 'parentNode', {
      get: () => parentNode,
      set: (el) => {
        parentNode = el

        if (el) {
          if (this.element){
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

        if (this.parentNode){
            this.parentNode.appendChild(el); // add to DOM
            if (typeof this.onrender === "function") this.onrender(); // onrender support
        }
    },
    enumerable: true
    })

    this.tag = options.tag ?? 'graph' // or top-level graph;
    Object.assign(this, node);
    this.parent = options.parent;

    const getParentNode = () => options.parentNode ?? this.parent?.parentNode
    this.parentNode = getParentNode()

    // Parse Graphs
    if (this.graph) {
      for (let tag in this.graph.nodes) {
        const node = this.graph.nodes[tag]
        if (!(node instanceof ESPlugin)) {
          const clonedOptions = Object.assign({}, Object.assign(options))
          this.graph.nodes[tag] = new ESPlugin(node, Object.assign(clonedOptions, {
            tag,
            parent: this,
          }))

          if (typeof options.onPlugin === 'function') options.onPlugin(this.graph.nodes[tag])
        } 
        
        // At Least Transfer Parent
        else {
            node.tag = tag
            node.parent = this
        }
      }
    }

    // Parse ESPlugins (with default export)
    // console.log('check', this.tag, options._arguments, this.default)

    if ('default' in this) {

      if (options._arguments !== false){

      const args = getFnParamInfo(node.default) ?? new Map();
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

        this.graph = { nodes: {}, ports: {
          input,
          output: input
        } };

        Array.from(args.entries()).forEach(([arg], i) => {
          const module = {
            default: async (input) => {
              const o = args.get(arg);
              o.state = input;
              if (i === 0) {
                const res = await this.run(); // first argument is a proxy for this node
                return res
              } else return input;
            },
          };

          const clonedOptions = Object.assign({}, Object.assign(options))

          this.graph.nodes[arg] = new ESPlugin(module, Object.assign(clonedOptions, {
            tag: arg,
            parent: this,
            _arguments: false,
          }));

          if (typeof options.onPlugin === 'function') options.onPlugin(this.graph.nodes[arg])

        });

        // Create Proper Global Operator for the Instance
        const originalDefault = this.default.bind(this);

        this.default = async (...argsArr) => {
          let updatedArgs = [];
          let i = 0;
          args.forEach((o, k) => {
            const argO = args.get(k);
            const currentArg = argO.spread ? argsArr.slice(i) : argsArr[i];
            let update = currentArg !== undefined ? currentArg : o.state;
            argO.state = update;
            if (!argO.spread) update = [update];
            updatedArgs.push(...update);
            i++;
          });

          const res = await originalDefault(...updatedArgs);

          return res
        };
      }

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
      if (isNode){} else {

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

  init = () => {
    if (this.#toRun) this.run()
  }

  run = async (...args) => {
    let results = {
      default: {},
      children: {}
    };

    // Is a Graph
    if (!('default' in this) && this.graph) {
      const input = this.graph.ports?.input;
      if (input) {
        const output = this.graph.ports?.output;
        const outputFallback = (this.graph.nodes[output].graph?.ports) ? `${output}.${this.graph.nodes[output].graph.ports.input}` : output;

        const node = this.graph.nodes[input];
        const res = await node.run(...args);
        results.children = Object.assign(results.children, res.children)
        results.default = (res.children[output] ?? res.children[outputFallback]).default
      }
    }

    // Is a Node
    else {
      results.default = await this.default(...args); // check if defined
    }

    // Forward results to Children
    if ( results.default !== undefined) {
      // run children if defined

      const edgesTarget = this.parent;
      const runIfMatch = async (target, tag) => {
        const newTag = target.tag ? (tag ? `${target.tag}.${tag}` : target.tag) : tag;

        if (target?.graph?.edges) {

          // Check If a Deep Output Port
          const splitTags = tag.split('.')
          let isOutput = target;
          for (let i in splitTags.slice(0, -1)){
            const str = splitTags[i]
            const innerPorts = target.graph.nodes[str]?.graph?.ports
            const plusOne = Number.parseInt(i)+1
            if (innerPorts?.output === splitTags[plusOne]) isOutput = target.graph.nodes[str]
            else {
              isOutput = undefined
              break;
            }
          }


            const found = (
              target.graph.edges[tag] ?? // reference with simple name
              target.graph.edges[newTag] ?? // reference with complex nested name
              ((isOutput) ? target.graph.edges[splitTags[0]] : undefined) // deep output port
              )

   
            for (let tag in found) {
              let toRun = target;
              tag.split(".").forEach((str) => (toRun = toRun.graph.nodes[str])); // drill based on separator

              const args = !Array.isArray(results.default) ? [results.default] : results.default; // handle non-arrays
              const res = await toRun.run(...args); // run children (without tracking)
              results.children[tag] = ('default' in res) ? res.default : res

              // flatten children
              for (let child in res.children) results.children[child] = res.children[child]
          }
        }

        if (target.parent) await runIfMatch(target.parent, newTag); // move upwards in the graph hierarchy
      };

      if (edgesTarget) await runIfMatch(edgesTarget, this.tag);
    }

    this.#toRun = false

    return results
  };
}

export default ESPlugin;
