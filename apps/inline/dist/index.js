(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // ../../libraries/external/graphscript/services/EventHandler.ts
  var EventHandler = class {
    constructor(data) {
      this.pushToState = {};
      this.data = {};
      this.triggers = {};
      this.setState = (updateObj) => {
        Object.assign(this.data, updateObj);
        for (const prop of Object.getOwnPropertyNames(updateObj)) {
          if (this.triggers[prop])
            this.triggers[prop].forEach((obj) => obj.onchange(this.data[prop]));
        }
        return this.data;
      };
      this.setValue = (key, value2) => {
        this.data[key] = value2;
        if (this.triggers[key])
          this.triggers[key].forEach((obj) => obj.onchange(this.data[key]));
      };
      this.subscribeTrigger = (key, onchange) => {
        if (key) {
          if (!this.triggers[key]) {
            this.triggers[key] = [];
          }
          let l = this.triggers[key].length;
          this.triggers[key].push({ idx: l, onchange });
          return this.triggers[key].length - 1;
        } else
          return void 0;
      };
      this.unsubscribeTrigger = (key, sub) => {
        let triggers = this.triggers[key];
        if (triggers) {
          if (!sub)
            delete this.triggers[key];
          else {
            let idx = void 0;
            let obj = triggers.find((o, i) => {
              if (o.idx === sub) {
                idx = i;
                return true;
              }
            });
            if (obj)
              triggers.splice(idx, 1);
            return true;
          }
        }
      };
      this.subscribeTriggerOnce = (key, onchange) => {
        let sub;
        let changed = (value2) => {
          onchange(value2);
          this.unsubscribeTrigger(key, sub);
        };
        sub = this.subscribeTrigger(key, changed);
      };
      if (typeof data === "object")
        this.data = data;
    }
  };

  // ../../libraries/external/graphscript/index.ts
  var state = new EventHandler();
  var GraphNode = class {
    constructor(properties, parent, graph) {
      this._node = {
        tag: `node${Math.floor(Math.random() * 1e15)}`,
        unique: `${Math.random()}`,
        state
      };
      this._subscribe = (callback, key) => {
        if (key) {
          if (!this._node.localState) {
            this._addLocalState(this);
          }
          if (typeof callback === "string") {
            if (this._node.graph)
              callback = this._node.graph.get(callback);
            else
              callback = this._node.graph.nodes.get(callback);
          }
          if (typeof callback === "function") {
            return this._node.events.subscribeTrigger(key, callback);
          } else if (callback?._node)
            return this._node.events.subscribeTrigger(key, (state2) => {
              if (callback._node.operator)
                callback._node.operator(state2);
            });
        } else {
          if (typeof callback === "string") {
            if (this._node.graph)
              callback = this._node.graph.get(callback);
            else
              callback = this._node.graph.nodes.get(callback);
          }
          if (typeof callback === "function") {
            return this._node.state.subscribeTrigger(this._node.tag, callback);
          } else if (callback?._node)
            return this._node.state.subscribeTrigger(this._node.tag, (res) => {
              if (callback._node.operator)
                callback._node.operator(res);
            });
        }
      };
      this._subscribeState = (callback) => {
        if (typeof callback === "string") {
          if (this._node.graph)
            callback = this._node.graph.get(callback);
          else
            callback = this._node.graph.nodes.get(callback);
        }
        if (typeof callback === "function") {
          return this._node.state.subscribeTrigger(this._node.unique, callback);
        } else if (callback?._node)
          return this._node.state.subscribeTrigger(this._node.unique, (state2) => {
            if (callback?._node.operator)
              callback._node.operator(state2);
          });
      };
      this._unsubscribe = (sub, key) => {
        if (key && this._node.events)
          return this._node.events.unsubscribeTrigger(key, sub);
        else
          return this._node.state.unsubscribeTrigger(this._node.tag, sub);
      };
      this._setOperator = (fn) => {
        fn = fn.bind(this);
        this._node.operator = (...args) => {
          let result = fn(...args);
          if (typeof result?.then === "function") {
            result.then((res) => {
              if (res !== void 0)
                this._node.state.setValue(this._node.tag, res);
            }).catch(console.error);
          } else if (result !== void 0)
            this._node.state.setValue(this._node.tag, result);
          return result;
        };
        return this._node.operator;
      };
      if (typeof properties === "function") {
        properties = {
          _node: {
            operator: properties,
            tag: properties.name
          }
        };
      } else if (typeof properties === "string") {
        if (graph?.get(properties)) {
          properties = graph.get(properties);
        }
      }
      if (typeof properties === "object") {
        if (typeof properties._node === "string") {
          if (graph?.get(properties._node)) {
            properties = graph.get(properties._node);
          } else
            properties._node = {};
        } else if (!properties._node)
          properties._node = {};
        if (parent)
          properties._node.parent = parent;
        if (graph)
          properties._node.graph = graph;
        for (const key in properties) {
          if (typeof properties[key] === "function")
            properties[key] = properties[key].bind(this);
        }
        if (typeof properties.default === "function")
          properties.default = this._setOperator(properties.default);
        else if (properties._node.operator) {
          if (typeof properties._node.operator === "string") {
            if (graph) {
              let n = graph.get(properties._node.operator);
              if (n)
                properties._node.operator = n._node.operator;
              if (!properties._node.tag && properties._node.operator.name)
                properties._node.tag = properties._node.operator.name;
            }
          }
          if (typeof properties._node.operator === "function")
            properties._node.operator = this._setOperator(properties._node.operator);
        }
        if (!properties._node.tag) {
          if (properties._node.operator?.name)
            properties._node.tag = properties._node.operator.name;
          else
            properties._node.tag = `node${Math.floor(Math.random() * 1e15)}`;
        }
        if (parent?._node && (!(parent instanceof Graph) || properties instanceof Graph))
          properties._node.tag = parent._node.tag + "." + properties._node.tag;
        if (parent instanceof Graph && properties instanceof Graph) {
          if (properties._node.loaders)
            Object.assign(parent._node.loaders ? parent._node.loaders : {}, properties._node.loaders);
          if (parent._node.mapGraphs) {
            properties._node.nodes.forEach((n) => {
              parent._node.nodes.set(properties._node.tag + "." + n._node.tag, n);
            });
            let ondelete = () => {
              properties._node.nodes.forEach((n) => {
                parent._node.nodes.delete(properties._node.tag + "." + n._node.tag);
              });
            };
            if (Array.isArray(this._node.ondelete)) {
              this._node.ondelete.push(ondelete);
            } else if (this._node.ondelete) {
              this._node.ondelete = [ondelete, this._node.ondelete];
            } else
              this._node.ondelete = [ondelete];
          }
        }
        properties._node.initial = properties;
        properties._node = Object.assign(this._node, properties._node);
        Object.assign(this, properties);
        if (properties._node.operator && parent instanceof GraphNode && parent._node.operator) {
          let sub = parent._subscribe(this);
          let ondelete = () => {
            parent?._unsubscribe(sub);
          };
          if (Array.isArray(this._node.ondelete)) {
            this._node.ondelete.push(ondelete);
          } else if (this._node.ondelete) {
            this._node.ondelete = [ondelete, this._node.ondelete];
          } else
            this._node.ondelete = [ondelete];
        }
        if (properties instanceof Graph)
          this._node.source = properties;
        if (typeof this._node.oncreate === "function") {
          this._node.oncreate(this);
        } else if (Array.isArray(this._node.oncreate)) {
          this._node.oncreate.forEach((o) => {
            o(this);
          });
        }
      }
    }
    _addLocalState(props) {
      if (!props)
        return;
      if (!this._node.localState) {
        this._node.localState = {};
      }
      if (!this._node.events) {
        this._node.events = new EventHandler(this._node.localState);
      }
      let localState = this._node.localState;
      for (let k in props) {
        if (typeof props[k] === "function") {
          if (!k.startsWith("_")) {
            let fn = props[k].bind(this);
            props[k] = (...args) => {
              let result = fn(...args);
              if (typeof result?.then === "function") {
                result.then((res) => {
                  this._node.events.setValue(k, res);
                }).catch(console.error);
              } else
                this._node.events.setValue(k, result);
              return result;
            };
            this[k] = props[k];
          }
        } else {
          localState[k] = props[k];
          let definition = {
            get: () => {
              return localState[k];
            },
            set: (v) => {
              if (this._node.state.triggers[this._node.unique]) {
                this._node.state.setValue(this._node.unique, this);
              }
              this._node.events.setValue(k, v);
            },
            enumerable: true,
            configurable: true
          };
          Object.defineProperty(this, k, definition);
          const ogProps = this._node.initial;
          let dec = Object.getOwnPropertyDescriptor(ogProps, k);
          if (dec === void 0 || dec?.configurable)
            Object.defineProperty(ogProps, k, definition);
        }
      }
    }
  };
  var Graph = class {
    constructor(options) {
      this._node = {
        tag: `graph${Math.floor(Math.random() * 1e15)}`,
        nodes: /* @__PURE__ */ new Map(),
        state
      };
      this.recursiveSet = (t, parent, listeners2 = {}) => {
        for (const key in t) {
          let p = t[key];
          if (typeof p === "function")
            p = { _node: { operator: p } };
          else if (typeof p === "string")
            p = this._node.tree[p];
          else if (typeof p === "boolean")
            p = this._node.tree[key];
          if (typeof p === "object") {
            if (!p._node)
              p._node = {};
            if (!p._node.tag)
              p._node.tag = key;
            if (this.get(p._node.tag))
              continue;
            for (const l in this._node.loaders) {
              this._node.loaders[l](p, parent, this);
            }
            let nd = new GraphNode(p, parent, this);
            t[key] = nd;
            this._node.tree[nd._node.tag] = p;
            this.set(nd._node.tag, nd);
            if (nd._node.listeners) {
              listeners2[nd._node.tag] = nd._node.listeners;
            } else if (nd._node.children) {
              nd._node.children = Object.assign({}, nd._node.children);
              this.recursiveSet(nd._node.children, nd, listeners2);
            }
          }
        }
        return listeners2;
      };
      this.get = (tag) => {
        return this._node.nodes.get(tag);
      };
      this.set = (tag, node) => {
        this._node.nodes.set(tag, node);
      };
      this.getProps = (node, getInitial) => {
        if (typeof node === "string")
          node = this.get(node);
        if (node instanceof GraphNode) {
          let cpy;
          if (getInitial)
            cpy = Object.assign({}, this._node.tree[node._node.tag]);
          else {
            cpy = Object.assign({}, node);
            delete cpy._unsubscribe;
            delete cpy._setOperator;
            delete cpy._node;
            delete cpy._subscribeState;
            delete cpy._subscribe;
          }
        }
      };
      this.subscribe = (node, key, callback) => {
        if (!(node instanceof GraphNode))
          node = this.get(node);
        let sub;
        if (node instanceof GraphNode) {
          sub = node._subscribe(callback, key);
          let ondelete = () => {
            node._unsubscribe(sub, key);
          };
          if (node._node.ondelete) {
            if (Array.isArray(node._node.ondelete)) {
              node._node.ondelete.push(ondelete);
            } else
              node._node.ondelete = [ondelete, node._node.ondelete];
          } else
            node._node.ondelete = [ondelete];
        }
        return sub;
      };
      this.unsubscribe = (node, key, sub) => {
        if (node instanceof GraphNode) {
          return node._unsubscribe(sub, key);
        } else
          return this.get(node)?._unsubscribe(sub, key);
      };
      this.setState = (update) => {
        this._node.state.setState(update);
      };
      if (options) {
        recursivelyAssign.call(this, this._node, options);
        if (options.tree)
          this.setTree(options.tree);
      }
    }
    setTree(tree2) {
      this._node.tree = Object.assign(this._node.tree ? this._node.tree : {}, tree2);
      let cpy = Object.assign({}, tree2);
      delete cpy._node;
      let listeners2 = this.recursiveSet(cpy, this);
      if (tree2._node) {
        if (!tree2._node.tag)
          tree2._node._tag = `tree${Math.floor(Math.random() * 1e15)}`;
        for (const l in this._node.loaders) {
          this._node.loaders[l](tree2, this, this);
        }
        let node = new GraphNode(tree2, this, this);
        this._node.nodes.set(node._node.tag, node);
        if (node._node.listeners) {
          listeners2[node._node.tag] = node._node.listeners;
        }
      }
      this.setListeners(listeners2);
    }
    setLoaders(loaders, replace) {
      if (replace)
        this._node.loaders = loaders;
      else
        Object.assign(this._node.loaders, loaders);
      return this._node.loaders;
    }
    add(properties, parent) {
      let listeners2 = {};
      if (typeof parent === "string")
        parent = this.get(parent);
      let node = new GraphNode(properties, parent, this);
      this._node.nodes.set(node._node.tag, node);
      if (node._node.listeners) {
        listeners2[node._node.tag] = node._node.listeners;
      }
      if (node._node.children) {
        node._node.children = Object.assign({}, node._node.children);
        this.recursiveSet(node._node.children, node, listeners2);
      }
      this.setListeners(listeners2);
      return node;
    }
    remove(node, clearListeners = true) {
      this.unsubscribe(node);
      if (typeof node === "string")
        node = this.get(node);
      if (node instanceof GraphNode) {
        this._node.nodes.delete(node._node.tag);
        delete this._node.tree[node._node.tag];
        if (clearListeners) {
          this.clearListeners(node);
        }
        if (typeof node._node.ondelete === "function")
          node._node.ondelete(node);
        else if (Array.isArray(node._node.ondelete)) {
          node._node.ondelete.forEach((o) => {
            o(node);
          });
        }
        const recursiveRemove = (t) => {
          for (const key in t) {
            this.unsubscribe(t[key]);
            this._node.nodes.delete(t[key]._node.tag);
            delete this._node.tree[t[key]._node.tag];
            this._node.nodes.delete(key);
            delete this._node.tree[key];
            t[key]._node.tag = t[key]._node.tag.substring(t[key]._node.tag.lastIndexOf(".") + 1);
            if (clearListeners) {
              this.clearListeners(t[key]);
            }
            if (typeof t[key]?._node?.ondelete === "function")
              t[key]._node.ondelete(t[key]);
            else if (Array.isArray(t[key]?._node.ondelete)) {
              t[key]?._node.ondelete.forEach((o) => {
                o(node);
              });
            }
            if (t[key]._node.children) {
              recursiveRemove(t[key]._node.children);
            }
          }
        };
        if (node._node.children) {
          recursiveRemove(node._node.children);
        }
      }
      if (node?._node.tag && node?._node.parent) {
        delete node?._node.parent;
        node._node.tag = node._node.tag.substring(node._node.tag.indexOf(".") + 1);
      }
      return node;
    }
    run(node, ...args) {
      if (typeof node === "string")
        node = this.get(node);
      if (node?._node?.operator) {
        return node?._node?.operator(...args);
      }
    }
    setListeners(listeners2) {
      for (const key in listeners2) {
        let node = this.get(key);
        if (typeof listeners2[key] === "object") {
          for (const k in listeners2[key]) {
            let n = this.get(k);
            let sub;
            let fn = listeners2[key][k].bind(node);
            listeners2[key][k] = fn;
            if (!n) {
              let tag = k.substring(0, k.lastIndexOf("."));
              n = this.get(tag);
              if (n) {
                sub = this.subscribe(n, k.substring(k.lastIndexOf(".") + 1), listeners2[key][k]);
                if (!node._node.listenerSubs)
                  node._node.listenerSubs = {};
                node._node.listenerSubs[k] = sub;
              }
            } else {
              sub = this.subscribe(n, void 0, listeners2[key][k]);
              if (!node._node.listenerSubs)
                node._node.listenerSubs = {};
              node._node.listenerSubs[k] = sub;
            }
          }
        }
      }
    }
    clearListeners(node, listener) {
      if (typeof node === "string")
        node = this.get(node);
      if (node?._node.listenerSubs) {
        for (const key in node._node.listenerSubs) {
          if (listener && key !== listener)
            continue;
          if (typeof node._node.listenerSubs[key] !== "number")
            continue;
          let n = this.get(key);
          if (!n) {
            n = this.get(key.substring(0, key.lastIndexOf(".")));
            if (n)
              this.unsubscribe(n, key.substring(key.lastIndexOf(".") + 1), node._node.listenerSubs[key]);
          } else {
            this.unsubscribe(n, void 0, node._node.listenerSubs[key]);
          }
          delete node._node.listeners[key];
          delete node._node.listenerSubs[key];
        }
      }
    }
  };
  function recursivelyAssign(target, obj) {
    for (const key in obj) {
      if (obj[key]?.constructor.name === "Object" && !Array.isArray(obj[key])) {
        if (target[key]?.constructor.name === "Object" && !Array.isArray(target[key]))
          recursivelyAssign(target[key], obj[key]);
        else
          target[key] = recursivelyAssign({}, obj[key]);
      } else {
        target[key] = obj[key];
        if (typeof target[key] === "function")
          target[key] = target[key].bind(this);
      }
    }
    return target;
  }

  // ../showcase/demos/graph/index.esc.js
  var index_esc_exports = {};
  __export(index_esc_exports, {
    esDOM: () => esDOM,
    esElement: () => esElement,
    esListeners: () => esListeners
  });

  // ../showcase/demos/graph/components/nodeA.esc.js
  var nodeA_esc_exports = {};
  __export(nodeA_esc_exports, {
    jump: () => jump,
    x: () => x,
    y: () => y
  });

  // ../showcase/demos/graph/utils/index.js
  var getTopNode = (target) => {
    while (target.esParent && target.esParent.hasAttribute("__isescomponent")) {
      const component = target.esParent.esComponent;
      if (component.esParent)
        target = component;
      else
        break;
    }
    return target.esElement;
  };

  // ../showcase/demos/graph/components/nodeA.esc.js
  var x = 1;
  var y = 2;
  function jump() {
    const id = this._node ? "escXgs" : "esc";
    const escDiv = document.getElementById(id) ?? getTopNode(this);
    escDiv.insertAdjacentHTML("beforeend", `<li>jump!</li>`);
    return "jumped!";
  }

  // ../showcase/demos/graph/components/nodeB.esc.js
  var nodeB_esc_exports = {};
  __export(nodeB_esc_exports, {
    x: () => x2,
    y: () => y2
  });
  var x2 = 3;
  var y2 = 4;

  // ../showcase/demos/graph/components/nodeC.esc.js
  var nodeC_esc_exports = {};
  __export(nodeC_esc_exports, {
    z: () => z
  });
  var z = 4;

  // ../showcase/demos/graph/components/nodeD.esc.js
  var nodeD_esc_exports = {};
  __export(nodeD_esc_exports, {
    default: () => nodeD_esc_default
  });
  var nodeD_esc_default = (a, b, c) => {
    return a + b + c;
  };

  // ../showcase/demos/graph/index.esc.js
  var escId = "esc";
  var escxgsId = "escXgs";
  var esElement = "div";
  var esDOM = {
    nodeA: {
      esCompose: nodeA_esc_exports
    },
    nodeB: {
      esCompose: nodeB_esc_exports,
      esDOM: {
        nodeC: {
          esCompose: nodeC_esc_exports,
          default: function(a) {
            this.z += a;
            const id = this._node ? escxgsId : escId;
            const esmDiv = document.getElementById(id) ?? getTopNode(this);
            if (esmDiv)
              esmDiv.insertAdjacentHTML("beforeend", `<li>nodeC z prop added to</li>`);
            return this.z;
          }
        }
      }
    },
    nodeD: {
      esCompose: nodeD_esc_exports
    },
    nodeE: {
      esAnimate: 1,
      default: function() {
        const id = this._node ? escxgsId : escId;
        const esmDiv = document.getElementById(id) ?? getTopNode(this);
        if (esmDiv)
          esmDiv.insertAdjacentHTML("beforeend", `<li>looped!</li>`);
      }
    }
  };
  var esListeners = {
    "": {
      "nodeA.x": {
        value: function(newX) {
          const id = this._node ? escxgsId : escId;
          const esmDiv = document.getElementById(id) ?? getTopNode(this);
          if (esmDiv)
            esmDiv.insertAdjacentHTML("beforeend", `<li>nodeA x prop updated ${newX}</li>`);
        },
        esBind: "nodeB.nodeC"
      },
      "nodeA.jump": {
        value: function(jump3) {
          const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? getTopNode(this);
          if (esmDiv)
            esmDiv.insertAdjacentHTML("beforeend", `<li>nodeA ${jump3}</li>`);
        },
        esBind: "nodeB.nodeC"
      },
      "nodeB.x": {
        value: function(newX) {
          this.x = newX;
          const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? getTopNode(this);
          if (esmDiv)
            esmDiv.insertAdjacentHTML("beforeend", `<li>nodeB x prop changed: ${newX}</li>`);
          return newX;
        },
        esBind: "nodeA"
      },
      "nodeB.nodeC": {
        value: function(op_result) {
          const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? getTopNode(this);
          if (esmDiv)
            esmDiv.insertAdjacentHTML("beforeend", `<li>nodeC operator returned: ${op_result}</li>`);
          return op_result;
        },
        esBind: "nodeA"
      },
      "nodeB.nodeC.z": {
        value: function(newZ) {
          const esmDiv = document.getElementById(this._node ? escxgsId : escId) ?? getTopNode(this);
          if (esmDiv)
            esmDiv.insertAdjacentHTML("beforeend", `<li>nodeC z prop changed: ${newZ}</li>`);
          return newZ;
        },
        esBind: "nodeA"
      }
    }
  };

  // nodes/nodeA.js
  var nodeA_exports = {};
  __export(nodeA_exports, {
    _node: () => _node,
    jump: () => jump2,
    x: () => x3,
    y: () => y3
  });
  var x3 = 1;
  var y3 = 2;
  var jump2 = function() {
    const id = this._node ? "tree" : "gsXesc";
    const treeDiv = document.getElementById(id);
    treeDiv.innerHTML += `<li>jump!</li>`;
    return "jumped!";
  };
  var _node = {
    listeners: {
      "nodeB.x": function(newX) {
        this.x = newX;
        const id = this._node ? "tree" : "gsXesc";
        const treeDiv = document.getElementById(id);
        treeDiv.innerHTML += `<li>nodeB x prop changed: ${newX}</li>`;
      },
      "nodeB.nodeC": function(op_result) {
        const id = this._node ? "tree" : "gsXesc";
        const treeDiv = document.getElementById(id);
        treeDiv.innerHTML += `<li>nodeC operator returned: ${op_result}</li>`;
      },
      "nodeB.nodeC.z": function(newZ) {
        const id = this._node ? "tree" : "gsXesc";
        const treeDiv = document.getElementById(id);
        treeDiv.innerHTML += `<li>nodeC z prop changed: ${newZ}</li>`;
      }
    }
  };

  // tree.js
  var nodeAInstance = Object.assign({}, nodeA_exports);
  var tree = {
    nodeA: nodeAInstance,
    nodeB: {
      x: 3,
      y: 4,
      _node: {
        children: {
          nodeC: {
            z: 4,
            _node: {
              operator: function(a) {
                this.z += a;
                const id = this._node ? "tree" : "gsXesc";
                const div = document.getElementById(id);
                div.innerHTML += `<li>nodeC z prop added to</li>`;
                return this.z;
              },
              listeners: {
                "nodeA.x": function(newX) {
                  const id = this._node ? "tree" : "gsXesc";
                  const div = document.getElementById(id);
                  div.innerHTML += `<li>nodeA x prop updated ${newX}</li>`;
                },
                "nodeA.jump": function(jump3) {
                  const id = this._node ? "tree" : "gsXesc";
                  const div = document.getElementById(id);
                  div.innerHTML += `<li>nodeA ${jump3}</li>`;
                }
              }
            }
          }
        }
      }
    },
    nodeD: (a, b, c) => {
      return a + b + c;
    },
    nodeE: {
      _node: {
        loop: 1e3,
        operator: function() {
          const id = this._node ? "tree" : "gsXesc";
          const div = document.getElementById(id);
          div.innerHTML += `<li>looped!</li>`;
        }
      }
    }
  };
  var tree_default = tree;

  // ../../libraries/escomposer/src/schema/graphscript.ts
  var graphscript_exports = {};
  __export(graphscript_exports, {
    from: () => from,
    to: () => to
  });

  // ../../libraries/common/check.js
  var moduleStringTag = "[object Module]";
  var esm = (object) => {
    const res = object && (!!Object.keys(object).reduce((a, b) => {
      const desc = Object.getOwnPropertyDescriptor(object, b);
      const isModule = desc && desc.get && !desc.set ? 1 : 0;
      return a + isModule;
    }, 0) || Object.prototype.toString.call(object) === moduleStringTag);
    return !!res;
  };

  // ../../libraries/esmonitor/src/utils.ts
  var isSame = (a, b) => {
    if (a && typeof a === "object" && b && typeof b === "object") {
      const jA = JSON.stringify(a);
      const jB = JSON.stringify(b);
      return jA === jB;
    } else
      return a === b;
  };
  var iterateSymbols = (obj, callback) => {
    return Promise.all(Object.getOwnPropertySymbols(obj).map((sym) => callback(sym, obj[sym])));
  };
  var getPath = (type, info2) => {
    const pathType = info2.path[type];
    if (!pathType)
      throw new Error("Invalid Path Type");
    const filtered = pathType.filter((v) => typeof v === "string");
    return filtered.join(info2.keySeparator);
  };
  var getPathInfo = (path, options) => {
    let splitPath = path;
    if (typeof path === "string")
      splitPath = path.split(options.keySeparator);
    else if (typeof path === "symbol")
      splitPath = [path];
    return {
      id: splitPath[0],
      path: splitPath.slice(1)
    };
  };
  var runCallback = (callback, path, info2, output, setGlobal = true) => {
    if (callback instanceof Function) {
      if (output && typeof output === "object" && typeof output.then === "function")
        output.then((value2) => callback(path, info2, value2));
      else
        callback(path, info2, output);
    }
    if (setGlobal && window.ESMonitorState) {
      const callback2 = window.ESMonitorState.callback;
      window.ESMonitorState.state[path] = { output, value: info2 };
      runCallback(callback2, path, info2, output, false);
    }
  };

  // ../../libraries/esmonitor/src/Poller.ts
  var defaultSamplingRate = 60;
  var Poller = class {
    constructor(listeners2, sps) {
      this.listeners = {};
      this.setOptions = (opts = {}) => {
        for (let key in opts)
          this[key] = opts[key];
      };
      this.add = (info2) => {
        const sub = info2.sub;
        this.listeners[sub] = info2;
        this.start();
      };
      this.get = (sub) => this.listeners[sub];
      this.remove = (sub) => {
        delete this.listeners[sub];
        if (!Object.keys(this.listeners).length)
          this.stop();
      };
      this.poll = (listeners2) => {
        iterateSymbols(listeners2, (sym, o) => {
          let { callback, current, history } = o;
          if (!o.path.resolved)
            o.path.resolved = getPath("output", o);
          if (!isSame(current, history)) {
            runCallback(callback, o.path.resolved, {}, current);
            if (typeof current === "object") {
              if (Array.isArray(current))
                history = [...current];
              else
                history = { ...current };
            } else
              listeners2[sym].history = current;
          }
        });
      };
      this.start = (listeners2 = this.listeners) => {
        if (!this.sps)
          this.sps = defaultSamplingRate;
        else if (!this.#pollingId) {
          console.warn("[escode]: Starting Polling!");
          this.#pollingId = setInterval(() => this.poll(listeners2), 1e3 / this.sps);
        }
      };
      this.stop = () => {
        if (this.#pollingId) {
          console.warn("[escode]: Stopped Polling!");
          clearInterval(this.#pollingId);
          this.#pollingId = void 0;
        }
      };
      if (listeners2)
        this.listeners = listeners2;
      if (sps)
        this.sps = sps;
    }
    #pollingId;
    #sps;
    get sps() {
      return this.#sps;
    }
    set sps(sps) {
      this.#sps = sps;
      const listeners2 = this.listeners;
      const nListeners = Object.keys(listeners2).length;
      if (nListeners) {
        this.stop();
        this.start();
      }
    }
  };

  // ../../libraries/esmonitor/src/listeners.ts
  var listeners_exports = {};
  __export(listeners_exports, {
    functionExecution: () => functionExecution,
    functions: () => functions2,
    info: () => info,
    register: () => register,
    set: () => set,
    setterExecution: () => setterExecution,
    setters: () => setters
  });

  // ../../libraries/esmonitor/src/global.ts
  window.ESMonitorState = {
    state: {},
    callback: void 0,
    info: {}
  };
  var global_default = window.ESMonitorState;

  // ../../libraries/esmonitor/src/info.ts
  var performance = async (callback, args) => {
    const tic = globalThis.performance.now();
    const output = await callback(...args);
    const toc = globalThis.performance.now();
    return {
      output,
      value: toc - tic
    };
  };
  var infoFunctions = {
    performance
  };
  var get = (func, args, info2) => {
    let result = {
      value: {},
      output: void 0
    };
    const infoToGet = { ...global_default.info, ...info2 };
    for (let key in infoToGet) {
      if (infoToGet[key] && infoFunctions[key]) {
        const ogFunc = func;
        func = async (...args2) => {
          const o = await infoFunctions[key](ogFunc, args2);
          result.value[key] = o.value;
          return o.output;
        };
      }
    }
    result.output = func(...args);
    return result;
  };

  // ../../libraries/esmonitor/src/globals.ts
  var isProxy = Symbol("isProxy");
  var fromInspectable = Symbol("fromInspectable");

  // ../../libraries/common/standards.js
  var keySeparator = ".";
  var defaultPath = "default";
  var esSourceKey = "__esmpileSourceBundle";

  // ../../libraries/common/pathHelpers.ts
  var hasKey = (key, obj) => key in obj;
  var getFromPath = (baseObject, path, opts = {}) => {
    const fallbackKeys = opts.fallbacks ?? [];
    const keySeparator2 = opts.keySeparator ?? keySeparator;
    if (typeof path === "string")
      path = path.split(keySeparator2);
    else if (typeof path == "symbol")
      path = [path];
    let exists;
    path = [...path];
    let ref = baseObject;
    for (let i = 0; i < path.length; i++) {
      if (!ref) {
        const message = `Could not get path`;
        console.error(message, path, ref);
        throw new Error(message);
      }
      const str = path[i];
      if (!hasKey(str, ref) && "esDOM" in ref) {
        for (let i2 in fallbackKeys) {
          const key = fallbackKeys[i2];
          if (hasKey(key, ref)) {
            ref = ref[key];
            break;
          }
        }
      }
      exists = hasKey(str, ref);
      if (exists)
        ref = ref[str];
      else {
        ref = void 0;
        exists = true;
      }
    }
    if (opts.output === "info")
      return { value: ref, exists };
    else
      return ref;
  };
  var setFromPath = (path, value2, ref, opts = {}) => {
    const create3 = opts?.create ?? false;
    const keySeparator2 = opts?.keySeparator ?? keySeparator;
    if (typeof path === "string")
      path = path.split(keySeparator2);
    else if (typeof path == "symbol")
      path = [path];
    path = [...path];
    const copy = [...path];
    const last = copy.pop();
    for (let i = 0; i < copy.length; i++) {
      const str = copy[i];
      let has = hasKey(str, ref);
      if (create3 && !has) {
        ref[str] = {};
        has = true;
      }
      if (has)
        ref = ref[str];
      else {
        const message = `Could not set path`;
        console.error(message, path);
        throw new Error(message);
      }
      if (ref.esDOM)
        ref = ref.esDOM;
    }
    ref[last] = value2;
  };

  // ../../libraries/esmonitor/src/inspectable/handlers.ts
  var handlers_exports = {};
  __export(handlers_exports, {
    functions: () => functions,
    objects: () => objects
  });
  var functions = (proxy) => {
    return {
      apply: async function(target, thisArg, argumentsList) {
        try {
          let foo = target;
          const isFromInspectable = argumentsList[0]?.[fromInspectable];
          if (isFromInspectable) {
            foo = argumentsList[0].value;
            argumentsList = argumentsList.slice(1);
          }
          let listeners2 = proxy.listeners.functions;
          const pathStr = proxy.path.join(proxy.options.keySeparator);
          const toActivate = listeners2 ? listeners2[pathStr] : void 0;
          let output, executionInfo = {};
          if (toActivate) {
            executionInfo = functionExecution(thisArg, toActivate, foo, argumentsList);
            output = executionInfo.output;
          } else {
            output = foo.apply(thisArg, argumentsList);
            executionInfo = proxy?.state?.[pathStr]?.value ?? {};
          }
          const callback = proxy.options.callback;
          runCallback(callback, pathStr, executionInfo, output);
          return output;
        } catch (e) {
          console.warn(`Function failed:`, e, proxy.path);
        }
      }
    };
  };
  var objects = (proxy) => {
    return {
      get(target, prop, receiver) {
        if (prop === isProxy)
          return true;
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, newVal, receiver) {
        if (prop === isProxy)
          return true;
        const pathStr = [...proxy.path, prop].join(proxy.options.keySeparator);
        const isFromInspectable = newVal?.[fromInspectable];
        if (isFromInspectable)
          newVal = newVal.value;
        const listeners2 = proxy.listeners.setters;
        if (!target.hasOwnProperty(prop)) {
          if (typeof proxy.options.globalCallback === "function") {
            const id = proxy.path[0];
            set("setters", pathStr, newVal, proxy.options.globalCallback, { [id]: proxy.root }, proxy.listeners, proxy.options);
          }
        }
        if (newVal) {
          const newProxy = proxy.create(prop, target, newVal);
          if (newProxy)
            newVal = newProxy;
        }
        if (listeners2) {
          const toActivate = listeners2[pathStr];
          if (toActivate)
            setterExecution(toActivate, newVal);
        }
        const callback = proxy.options.callback;
        const info2 = proxy?.state?.[pathStr]?.value ?? {};
        runCallback(callback, pathStr, info2, newVal);
        if (isFromInspectable)
          return true;
        else
          return Reflect.set(target, prop, newVal, receiver);
      }
    };
  };

  // ../../libraries/esmonitor/src/inspectable/index.ts
  var canCreate = (parent, key, val) => {
    try {
      if (val === void 0)
        val = parent[key];
    } catch (e) {
      return e;
    }
    const alreadyIs = parent[key] && parent[key][isProxy];
    if (alreadyIs)
      return false;
    const type = typeof val;
    const isObject = type === "object";
    const isFunction = type == "function";
    const notObjOrFunc = !val || !(isObject || isFunction);
    if (notObjOrFunc)
      return false;
    if (val instanceof Element)
      return false;
    if (val instanceof EventTarget)
      return false;
    const isESM = isObject && esm(val);
    if (isFunction)
      return true;
    else {
      const desc = Object.getOwnPropertyDescriptor(parent, key);
      if (desc && (desc.value && desc.writable || desc.set)) {
        if (!isESM)
          return true;
      } else if (!parent.hasOwnProperty(key))
        return true;
    }
    return false;
  };
  var Inspectable = class {
    constructor(target = {}, opts = {}, name, parent) {
      this.path = [];
      this.listeners = {};
      this.state = {};
      this.set = (path, info2, update) => {
        this.state[path] = {
          output: update,
          value: info2
        };
        setFromPath(path, update, this.proxy, { create: true });
      };
      this.check = canCreate;
      this.create = (key, parent, val, set2 = false) => {
        const create3 = this.check(parent, key, val);
        if (val === void 0)
          val = parent[key];
        if (create3 && !(create3 instanceof Error)) {
          parent[key] = new Inspectable(val, this.options, key, this);
          return parent[key];
        }
        if (set2) {
          try {
            this.proxy[key] = val ?? parent[key];
          } catch (e) {
            const isESM = esm(parent);
            const path = [...this.path, key];
            console.error(`Could not set value (${path.join(this.options.keySeparator)})${isESM ? " because the parent is an ESM." : ""}`, isESM ? "" : e);
          }
        }
        return;
      };
      if (!opts.pathFormat)
        opts.pathFormat = "relative";
      if (!opts.keySeparator)
        opts.keySeparator = keySeparator;
      if (target.__esProxy)
        this.proxy = target.__esProxy;
      else if (target[isProxy])
        this.proxy = target;
      else {
        this.target = target;
        this.options = opts;
        this.parent = parent;
        if (this.parent) {
          this.root = this.parent.root;
          this.path = [...this.parent.path];
          this.state = this.parent.state ?? {};
        } else
          this.root = target;
        if (name)
          this.path.push(name);
        if (this.options.listeners)
          this.listeners = this.options.listeners;
        if (this.options.path) {
          if (this.options.path instanceof Function)
            this.path = this.options.path(this.path);
          else if (Array.isArray(this.options.path))
            this.path = this.options.path;
          else
            console.log("Invalid path", this.options.path);
        }
        if (this.path)
          this.path = this.path.filter((str) => typeof str === "string");
        if (!this.options.keySeparator)
          this.options.keySeparator = keySeparator;
        let type = this.options.type;
        if (type != "object")
          type = typeof target === "function" ? "function" : "object";
        const handler2 = handlers_exports[`${type}s`](this);
        this.proxy = new Proxy(target, handler2);
        Object.defineProperty(target, "__esProxy", { value: this.proxy, enumerable: false });
        Object.defineProperty(target, "__esInspectable", { value: this, enumerable: false });
        for (let key in target) {
          if (!this.parent) {
            let value2 = target[key];
            if (typeof value2 === "function") {
              target[key] = async (...args) => await this.proxy[key]({ [fromInspectable]: true, value: value2 }, ...args);
            } else {
              try {
                Object.defineProperty(target, key, {
                  get: () => value2,
                  set: (val) => {
                    value2 = val;
                    this.proxy[key] = { [fromInspectable]: true, value: val };
                  },
                  enumerable: true,
                  configurable: true
                });
              } catch (e) {
                console.error(`Could not reassign ${key} to a top-level setter...`);
              }
            }
          }
          this.create(key, target, void 0, true);
        }
      }
      return this.proxy;
    }
  };

  // ../../libraries/esmonitor/src/optionsHelpers.ts
  var setFromOptions = (path, value2, baseOptions, opts) => {
    const ref = opts.reference;
    const id = Array.isArray(path) ? path[0] : typeof path === "string" ? path.split(baseOptions.keySeparator)[0] : path;
    let isDynamic = opts.hasOwnProperty("static") ? !opts.static : false;
    if (isDynamic && !globalThis.Proxy) {
      isDynamic = false;
      console.warn("Falling back to using function interception and setters...");
    }
    if (isDynamic) {
      value2 = new Inspectable(value2, {
        pathFormat: baseOptions.pathFormat,
        keySeparator: baseOptions.keySeparator,
        listeners: opts.listeners,
        path: (path2) => path2.filter((str) => !baseOptions.fallbacks || !baseOptions.fallbacks.includes(str))
      }, id);
    }
    let options = { keySeparator: baseOptions.keySeparator, ...opts };
    setFromPath(path, value2, ref, options);
    return value2;
  };

  // ../../libraries/esmonitor/src/listeners.ts
  var info = (id, callback, path, originalValue, base, listeners2, options) => {
    if (typeof path === "string")
      path = path.split(options.keySeparator);
    const relativePath = path.join(options.keySeparator);
    const refs = base;
    const get3 = (path2) => {
      return getFromPath(base, path2, {
        keySeparator: options.keySeparator,
        fallbacks: options.fallbacks
      });
    };
    const set2 = (path2, value2) => setFromOptions(path2, value2, options, {
      reference: base,
      listeners: listeners2
    });
    let onUpdate = options.onUpdate;
    let infoToOutput = {};
    if (onUpdate && typeof onUpdate === "object" && onUpdate.callback instanceof Function) {
      infoToOutput = onUpdate.info ?? {};
      onUpdate = onUpdate.callback;
    }
    const absolute = [id, ...path];
    let pathInfo = {
      absolute,
      relative: relativePath.split(options.keySeparator),
      parent: absolute.slice(0, -1)
    };
    pathInfo.output = pathInfo[options.pathFormat];
    const completePathInfo = pathInfo;
    const info2 = {
      id,
      path: completePathInfo,
      keySeparator: options.keySeparator,
      infoToOutput,
      callback: (...args) => {
        const output = callback(...args);
        if (onUpdate instanceof Function)
          onUpdate(...args);
        return output;
      },
      get current() {
        return get3(info2.path.absolute);
      },
      set current(val) {
        set2(info2.path.absolute, val);
      },
      get parent() {
        return get3(info2.path.parent);
      },
      get reference() {
        return refs[id];
      },
      set reference(val) {
        refs[id] = val;
      },
      original: originalValue,
      history: typeof originalValue === "object" ? Object.assign({}, originalValue) : originalValue,
      sub: Symbol("subscription"),
      last: path.slice(-1)[0]
    };
    return info2;
  };
  var registerInLookup = (name, sub, lookups) => {
    if (lookups) {
      const id = Math.random();
      lookups.symbol[sub] = {
        name,
        id
      };
      if (!lookups.name[name])
        lookups.name[name] = {};
      lookups.name[name][id] = sub;
    }
  };
  var register = (info2, collection, lookups) => {
    const absolute = getPath("absolute", info2);
    if (!collection[absolute])
      collection[absolute] = {};
    collection[absolute][info2.sub] = info2;
    registerInLookup(absolute, info2.sub, lookups);
  };
  var listeners = {
    functions: functions2,
    setters
  };
  var set = (type, absPath, value2, callback, base, allListeners, options) => {
    const { id, path } = getPathInfo(absPath, options);
    const fullInfo = info(id, callback, path, value2, base, listeners, options);
    if (listeners[type])
      listeners[type](fullInfo, allListeners[type], allListeners.lookup);
    else {
      const path2 = getPath("absolute", fullInfo);
      allListeners[type][path2][fullInfo.sub] = fullInfo;
      if (allListeners.lookup)
        registerInLookup(path2, fullInfo.sub, allListeners.lookup);
    }
  };
  var get2 = (info2, collection) => collection[getPath("absolute", info2)];
  var handler = (info2, collection, subscribeCallback, lookups) => {
    if (!get2(info2, collection)) {
      let parent = info2.parent;
      let val = parent[info2.last];
      subscribeCallback(val, parent);
    }
    register(info2, collection, lookups);
  };
  var setterExecution = (listeners2, value2) => {
    return iterateSymbols(listeners2, (_, o) => {
      const path = getPath("output", o);
      runCallback(o.callback, path, {}, value2);
    });
  };
  function setters(info2, collection, lookups) {
    handler(info2, collection, (value2, parent) => {
      let val = value2;
      if (!parent[isProxy]) {
        let redefine = true;
        try {
          delete parent[info2.last];
        } catch (e) {
          console.error("Unable to redeclare setters. May already be a dynamic object...");
          redefine = false;
        }
        if (redefine) {
          try {
            Object.defineProperty(parent, info2.last, {
              get: () => val,
              set: async (v) => {
                val = v;
                const listeners2 = Object.assign({}, collection[getPath("absolute", info2)]);
                setterExecution(listeners2, v);
              },
              enumerable: true,
              configurable: true
            });
          } catch (e) {
            throw e;
          }
        }
      }
    }, lookups);
  }
  var functionExecution = (context, listeners2, func, args) => {
    listeners2 = Object.assign({}, listeners2);
    const keys = Object.getOwnPropertySymbols(listeners2);
    const infoTemplate = listeners2[keys[0]] ?? {};
    const executionInfo = get((...args2) => func.call(context, ...args2), args, infoTemplate.infoToOutput);
    iterateSymbols(listeners2, (_, o) => {
      const path = getPath("output", o);
      runCallback(o.callback, path, executionInfo.value, executionInfo.output);
    });
    return executionInfo;
  };
  function functions2(info2, collection, lookups) {
    handler(info2, collection, (_, parent) => {
      if (!parent[isProxy]) {
        parent[info2.last] = function(...args) {
          const listeners2 = collection[getPath("absolute", info2)];
          return functionExecution(this, listeners2, info2.original, args);
        };
      }
    }, lookups);
  }

  // ../../libraries/common/drill.js
  var drillSimple = (obj, callback, options) => {
    let accumulator = options.accumulator;
    if (!accumulator)
      accumulator = options.accumulator = {};
    const ignore = options.ignore || [];
    const path = options.path || [];
    const condition = options.condition || true;
    const seen = [];
    const fromSeen = [];
    let drill = (obj2, acc = {}, globalInfo) => {
      for (let key in obj2) {
        if (ignore.includes(key))
          continue;
        const val = obj2[key];
        const newPath = [...globalInfo.path, key];
        const info2 = {
          typeof: typeof val,
          name: val?.constructor?.name,
          simple: true,
          object: val && typeof val === "object",
          path: newPath
        };
        if (info2.object) {
          const name = info2.name;
          const isESM = esm(val);
          if (isESM || name === "Object" || name === "Array") {
            info2.simple = true;
            const idx = seen.indexOf(val);
            if (idx !== -1)
              acc[key] = fromSeen[idx];
            else {
              seen.push(val);
              const pass2 = condition instanceof Function ? condition(key, val, info2) : condition;
              info2.pass = pass2;
              acc[key] = callback(key, val, info2);
              if (pass2) {
                fromSeen.push(acc[key]);
                acc[key] = drill(val, acc[key], { ...globalInfo, path: newPath });
              }
            }
          } else {
            info2.simple = false;
            acc[key] = callback(key, val, info2);
          }
        } else
          acc[key] = callback(key, val, info2);
      }
      return acc;
    };
    return drill(obj, accumulator, { path });
  };

  // ../../libraries/esmonitor/src/Monitor.ts
  var createLookup = () => {
    return { symbol: {}, name: {} };
  };
  var Monitor = class {
    constructor(opts = {}) {
      this.poller = new Poller();
      this.options = {
        pathFormat: "relative",
        keySeparator
      };
      this.listeners = {
        polling: this.poller.listeners,
        functions: {},
        setters: {},
        lookup: createLookup()
      };
      this.references = {};
      this.get = (path, output) => {
        return getFromPath(this.references, path, {
          keySeparator: this.options.keySeparator,
          fallbacks: this.options.fallbacks,
          output
        });
      };
      this.set = (path, value2, opts = {}) => {
        const optsCopy = { ...opts };
        if (!optsCopy.reference)
          optsCopy.reference = this.references;
        if (!optsCopy.listeners)
          optsCopy.listeners = this.listeners;
        return setFromOptions(path, value2, this.options, optsCopy);
      };
      this.on = (absPath, callback) => {
        const info2 = getPathInfo(absPath, this.options);
        return this.listen(info2.id, callback, info2.path);
      };
      this.getInfo = (label, callback, path, original) => {
        const info2 = info(label, callback, path, original, this.references, this.listeners, this.options);
        const id = Math.random();
        const lookups = this.listeners.lookup;
        const name = getPath("absolute", info2);
        lookups.symbol[info2.sub] = {
          name,
          id
        };
        if (!lookups.name[name])
          lookups.name[name] = {};
        lookups.name[name][id] = info2.sub;
        return info2;
      };
      this.listen = (id, callback, path = [], __internal = {}) => {
        if (typeof path === "string")
          path = path.split(this.options.keySeparator);
        else if (typeof path === "symbol")
          path = [path];
        const arrayPath = path;
        let baseRef = this.references[id];
        if (!baseRef) {
          console.error(`Reference ${id} does not exist.`);
          return;
        }
        if (!__internal.poll)
          __internal.poll = esm(baseRef);
        if (!__internal.seen)
          __internal.seen = [];
        const __internalComplete = __internal;
        if (!this.references[id])
          this.references[id] = baseRef;
        let ref = this.get([id, ...arrayPath]);
        const toMonitorInternally = (val, allowArrays = false) => {
          const first = val && typeof val === "object";
          if (!first)
            return false;
          const isEl = val instanceof Element;
          if (isEl)
            return false;
          if (allowArrays)
            return true;
          else
            return !Array.isArray(val);
        };
        let subs = {};
        if (toMonitorInternally(ref, true)) {
          if (ref.__esInspectable)
            ref.__esInspectable.options.globalCallback = callback;
          drillSimple(ref, (_, __, drillInfo) => {
            if (drillInfo.pass)
              return;
            else {
              const fullPath = [...arrayPath, ...drillInfo.path];
              const internalSubs = this.listen(id, callback, fullPath, __internalComplete);
              Object.assign(subs, internalSubs);
            }
          }, {
            condition: (_, val) => toMonitorInternally(val)
          });
        }
        let info2;
        try {
          if (__internalComplete.poll) {
            info2 = this.getInfo(id, callback, arrayPath, ref);
            this.poller.add(info2);
          } else {
            let type = "setters";
            if (typeof ref === "function")
              type = "functions";
            info2 = this.getInfo(id, callback, arrayPath, ref);
            this.add(type, info2);
          }
        } catch (e) {
          console.error("Fallback to polling:", path, e);
          info2 = this.getInfo(id, callback, arrayPath, ref);
          this.poller.add(info2);
        }
        subs[getPath("absolute", info2)] = info2.sub;
        if (this.options.onInit instanceof Function) {
          const executionInfo = {};
          for (let key in info2.infoToOutput)
            executionInfo[key] = void 0;
          this.options.onInit(getPath("output", info2), executionInfo);
        }
        return subs;
      };
      this.add = (type, info2) => {
        if (listeners_exports[type])
          listeners_exports[type](info2, this.listeners[type], this.listeners.lookup);
        else
          this.listeners[type][getPath("absolute", info2)][info2.sub] = info2;
      };
      this.remove = (subs) => {
        if (!subs) {
          subs = {
            ...this.listeners.functions,
            ...this.listeners.setters,
            ...this.listeners.polling
          };
        }
        if (typeof subs !== "object")
          subs = { sub: subs };
        for (let key in subs) {
          let innerSub = subs[key];
          const handleUnsubscribe = (sub) => {
            const res = this.unsubscribe(sub);
            if (res === false)
              console.warn(`Subscription for ${key} does not exist.`, sub);
          };
          if (typeof innerSub !== "symbol")
            iterateSymbols(innerSub, handleUnsubscribe);
          else
            handleUnsubscribe(innerSub);
        }
        return true;
      };
      this.unsubscribe = (sub) => {
        const info2 = this.listeners.lookup.symbol[sub];
        const absPath = info2.name;
        const polling = this.poller.get(sub);
        const funcs = this.listeners.functions[absPath];
        const func = funcs?.[sub];
        const setters2 = this.listeners.setters[absPath];
        const setter = setters2?.[sub];
        if (polling)
          this.poller.remove(sub);
        else if (func) {
          delete funcs[sub];
          if (!Object.getOwnPropertySymbols(funcs).length) {
            func.current = func.original;
            delete this.listeners.functions[absPath];
          }
        } else if (setter) {
          delete setters2[sub];
          if (!Object.getOwnPropertySymbols(setters2).length) {
            const parent = setter.parent;
            const last = setter.last;
            const value2 = parent[last];
            Object.defineProperty(parent, last, { value: value2, writable: true });
            delete this.listeners.setters[absPath];
          }
        } else
          return false;
        delete this.listeners.lookup.symbol[sub];
        const nameLookup = this.listeners.lookup.name[info2.name];
        delete nameLookup[info2.id];
        if (!Object.getOwnPropertyNames(nameLookup).length)
          delete this.listeners.lookup.name[info2.name];
      };
      Object.defineProperty(this.listeners, "lookup", {
        value: createLookup(),
        enumerable: false,
        configurable: false
      });
      Object.assign(this.options, opts);
      this.poller.setOptions(opts.polling);
    }
  };

  // ../../libraries/esmonitor/src/index.ts
  var src_default = Monitor;

  // ../../libraries/escompose/src/utils.ts
  var isPromise = (o) => typeof o === "object" && typeof o.then === "function";
  var resolve = (object, callback) => {
    if (typeof object === "object" && Array.isArray(object) && object.find((v) => isPromise(v)))
      object = Promise.all(object);
    if (isPromise(object)) {
      return new Promise((resolvePromise) => {
        object.then(async (res) => {
          const output = callback ? callback(res) : res;
          resolvePromise(output);
        });
      });
    } else {
      return callback ? callback(object) : object;
    }
  };
  var merge = (main, override, path = []) => {
    const copy = Object.assign({}, main);
    if (override) {
      const keys = Object.keys(copy);
      const newKeys = new Set(Object.keys(override));
      keys.forEach((k) => {
        newKeys.delete(k);
        const thisPath = [...path, k];
        if (typeof override[k] === "object" && !Array.isArray(override[k])) {
          if (typeof copy[k] === "object")
            copy[k] = merge(copy[k], override[k], thisPath);
          else
            copy[k] = override[k];
        } else if (typeof override[k] === "function") {
          const original = copy[k];
          const isFunc = typeof original === "function";
          if (isFunc && !original.functionList)
            original.functionList = [original];
          const newFunc = override[k];
          if (!isFunc || !original.functionList.includes(newFunc)) {
            const func = copy[k] = function(...args) {
              if (isFunc)
                original.call(this, ...args);
              newFunc.call(this, ...args);
            };
            if (!func.functionList)
              func.functionList = [original];
            func.functionList.push(override);
          } else
            console.warn(`This function was already merged into ${thisPath.join(".")}. Ignoring duplicate.`);
        } else if (k in override)
          copy[k] = override[k];
      });
      newKeys.forEach((k) => copy[k] = override[k]);
    }
    return copy;
  };

  // ../../libraries/escompose/src/create/element.ts
  function checkESCompose(esCompose) {
    if (!esCompose)
      return false;
    const isArr = Array.isArray(esCompose);
    return isArr ? !esCompose.reduce((a, b) => a * (checkForInternalElements(b) ? 0 : 1), true) : checkForInternalElements(esCompose);
  }
  function checkForInternalElements(node) {
    if (node.esElement || checkESCompose(node.esCompose))
      return true;
    else if (node.esDOM)
      return check(node.esDOM);
  }
  function check(target) {
    for (let key in target) {
      const node = target[key];
      let res = checkForInternalElements(node);
      if (res)
        return true;
    }
  }
  function create(id, esm2, parent, states, utilities = {}) {
    let element = esm2.esElement;
    let info2;
    if (!(element instanceof Element)) {
      const mustShow = checkForInternalElements(esm2);
      const defaultTagName = mustShow ? "div" : "link";
      if (element === void 0)
        element = defaultTagName;
      else if (Array.isArray(element))
        element = document.createElement(...element);
      else if (typeof element === "object") {
        info2 = element;
        if (info2.selectors)
          element = document.querySelector(info2.selectors);
        else if (info2.id)
          element = document.getElementById(info2.id);
        else
          element = defaultTagName;
      }
      if (typeof element === "string")
        element = document.createElement(element);
      const noInput = Symbol("no input to the default function");
      if (!esm2.hasOwnProperty("default")) {
        esm2.default = function(input = noInput) {
          if (input !== noInput)
            this.esElement.innerText = input;
          return this.esElement;
        };
      }
    }
    if (!(element instanceof Element))
      console.warn("Element not found for", id);
    let intermediateStates = states || {};
    intermediateStates.element = element, intermediateStates.attributes = esm2.esAttributes, intermediateStates.parentNode = esm2.esParent ?? (parent?.esElement instanceof Element ? parent.esElement : void 0), intermediateStates.onresize = esm2.esOnResize, intermediateStates.onresizeEventCallback = void 0;
    const finalStates = intermediateStates;
    if (element instanceof Element) {
      if (typeof id !== "string")
        id = `${element.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
      if (!element.id)
        element.id = id;
    }
    let isReady;
    Object.defineProperty(esm2, "esReady", {
      value: new Promise((resolve3) => isReady = async () => {
        resolve3(true);
      }),
      writable: false,
      enumerable: false
    });
    Object.defineProperty(esm2, "__esReady", { value: isReady, writable: false, enumerable: false });
    const isEventListener = (key, value2) => key.slice(0, 2) === "on" && typeof value2 === "function";
    const handleAttribute = (key, value2, context) => {
      if (!isEventListener(key, value2) && typeof value2 === "function")
        return value2.call(context);
      else
        return value2;
    };
    const setAttributes = (attributes) => {
      if (esm2.esElement instanceof Element) {
        for (let key in attributes) {
          if (key === "style") {
            for (let styleKey in attributes.style)
              esm2.esElement.style[styleKey] = handleAttribute(key, attributes.style[styleKey], esm2);
          } else {
            const value2 = attributes[key];
            if (isEventListener(key, value2)) {
              const func = value2;
              esm2.esElement[key] = (...args) => {
                const context = esm2.__esProxy ?? esm2;
                return func.call(context ?? esm2, ...args);
              };
            } else
              esm2.esElement[key] = handleAttribute(key, value2, esm2);
          }
        }
      }
    };
    Object.defineProperty(esm2, "esAttributes", {
      get: () => states.attributes,
      set: (value2) => {
        states.attributes = value2;
        if (states.attributes)
          setAttributes(states.attributes);
      }
    });
    Object.defineProperty(esm2, "esElement", {
      get: function() {
        if (states.element instanceof Element)
          return states.element;
      },
      set: function(v) {
        if (v instanceof Element) {
          if (states.element !== v) {
            states.element.insertAdjacentElement("afterend", v);
            states.element.remove();
          }
          states.element = v;
          if (esm2.__isESComponent !== void 0) {
            for (let name in esm2.esDOM) {
              const component = esm2.esDOM[name];
              resolve(component, (res) => {
                res.esParent = v;
              });
            }
          }
          setAttributes(states.attributes);
        }
      },
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(esm2, "esParent", {
      get: function() {
        if (esm2.esElement instanceof Element)
          return esm2.esElement.parentNode;
      },
      set: (v) => {
        if (typeof v === "string") {
          const newValue = document.querySelector(v);
          if (newValue)
            v = newValue;
          else
            v = document.getElementById(v);
        }
        if (v?.esElement instanceof Element)
          v = v.esElement;
        if (esm2.esElement instanceof Element) {
          if (esm2.esElement.parentNode)
            esm2.esElement.remove();
          if (v instanceof Element) {
            const desiredPosition = esm2.esChildPosition;
            const nextPosition = v.children.length;
            let ref = esm2.esElement;
            const esCode = esm2.__esCode;
            if (esCode) {
              ref = esCode;
            }
            if (desiredPosition !== void 0 && desiredPosition < nextPosition)
              v.children[desiredPosition].insertAdjacentElement("beforebegin", ref);
            else
              v.appendChild(ref);
            if (esCode)
              esCode.setComponent(esm2);
          }
        } else {
          console.error("No element was created for this Component...", esm2);
        }
        if (v instanceof HTMLElement) {
          esm2.__esReady();
        }
      },
      enumerable: true
    });
    let onresize = esm2.esOnResize;
    Object.defineProperty(esm2, "esOnResize", {
      get: function() {
        return onresize;
      },
      set: function(foo) {
        states.onresize = foo;
        if (states.onresizeEventCallback)
          window.removeEventListener("resize", states.onresizeEventCallback);
        if (states.onresize) {
          states.onresizeEventCallback = (ev) => {
            if (states.onresize && esm2.esElement instanceof Element) {
              const context = esm2.__esProxy ?? esm2;
              return foo.call(context, ev);
            }
          };
          window.addEventListener("resize", states.onresizeEventCallback);
        }
      },
      enumerable: true
    });
    if (esm2.esCode) {
      let config = esm2.esCode;
      let cls = utilities.code?.class;
      if (!cls) {
        if (typeof esm2.esCode === "function")
          cls = esm2.esCode;
        else
          console.error("Editor class not provided in options.utilities.code");
      }
      if (cls) {
        let options = utilities.code?.options ?? {};
        options = typeof config === "boolean" ? options : { ...options, ...config };
        const esCode = new cls(options);
        esCode.start();
        Object.defineProperty(esm2, "__esCode", { value: esCode });
      }
    }
    if (esm2.esElement instanceof Element) {
      esm2.esElement.esComponent = esm2;
      esm2.esElement.setAttribute("__isescomponent", "");
    }
    if (!states) {
      esm2.esOnResize = finalStates.onresize;
      if (finalStates.parentNode)
        esm2.esParent = finalStates.parentNode;
    }
    return element;
  }

  // ../../libraries/escompose/src/create/component.ts
  var registry = {};
  var ogCreateElement = document.createElement;
  document.createElement = function(name, options) {
    const info2 = registry[name];
    const created = info2 && !info2.autonomous ? ogCreateElement.call(this, info2.tag, { is: name }) : ogCreateElement.call(this, name, options);
    return created;
  };
  var tagToClassMap = {
    li: "LI"
  };
  var isAutonomous = false;
  var define = (config, esm2) => {
    esm2 = Object.assign({}, esm2);
    if (!registry[config.name]) {
      const clsName = isAutonomous ? "" : tagToClassMap[config.extends] ?? config.extends[0].toUpperCase() + config.extends.slice(1);
      const BaseClass = new Function(`

        class ESComponentBase extends HTML${clsName}Element { 
            #properties;
            constructor(properties={}){
                super()
               this.#properties = properties
            }
        }
        return ESComponentBase;

        `)();
      class ESComponent extends BaseClass {
        constructor(properties) {
          super(properties);
          resolve(src_default2(esm2), (res) => {
            res.esElement = this;
            this.esComponent = res;
          });
        }
        connectedCallback() {
          console.log("Custom element added to page.");
          this.esComponent.__esReady();
        }
        disconnectedCallback() {
          console.log("Custom element removed from page.");
        }
        adoptedCallback() {
          console.log("Custom element moved to new page.");
        }
        attributeChangedCallback(name, oldValue, newValue) {
          console.log("Custom element attributes changed.", name, oldValue, newValue);
        }
      }
      registry[config.name] = {
        class: ESComponent,
        autonomous: isAutonomous,
        tag: config.extends
      };
      const cls = registry[config.name].class;
      if (isAutonomous)
        customElements.define(config.name, cls);
      else
        customElements.define(config.name, cls, { extends: config.extends });
    } else {
      console.log("Already created component...");
    }
  };

  // ../../libraries/common/clone.js
  var deep = (obj, opts = {}) => {
    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj = [...obj];
        opts.accumulator = [];
      } else {
        obj = { ...obj };
        opts.accumulator = {};
      }
    } else
      return obj;
    drillSimple(obj, (key, val, info2) => {
      if (info2.simple && info2.object)
        return Array.isArray(val) ? [] : {};
      else
        return val;
    }, opts);
    return opts.accumulator;
  };

  // ../../libraries/escompose/src/create/define.ts
  var value = (name, value2, object) => {
    Object.defineProperty(object, name, {
      value: value2,
      writable: false,
      configurable: false,
      enumerable: false
    });
  };

  // ../../libraries/escompose/src/create/index.ts
  var animations = {};
  var create_default = (id, esm2, parent, opts = {}) => {
    const states = {
      connected: false
    };
    const copy = deep(esm2);
    try {
      for (let name in esm2.esDOM) {
        const value2 = esm2.esDOM[name];
        const isUndefined = value2 == void 0;
        const type = isUndefined ? JSON.stringify(value2) : typeof value2;
        if (type != "object") {
          console.error(`Removing ${name} esDOM field that which is not an ES Component object. Got ${isUndefined ? type : `a ${type}`} instead.`);
          delete esm2.esDOM[name];
        }
      }
      let registry2 = esm2.esComponents ?? {};
      for (let key in registry2) {
        const esm3 = registry2[key];
        const info2 = esm3.esElement;
        if (info2.name && info2.extends)
          define(info2, esm3);
      }
      let el = create(id, esm2, parent, states, opts.utilities);
      const finalStates = states;
      esm2.esElement = el;
      const esConnectedAsync = async (onReadyCallback) => {
        let toRun = [];
        await esm2.esReady;
        states.connected = true;
        for (let name in esm2.esDOM) {
          let component = esm2.esDOM[name];
          if (typeof component === "object" && typeof component.then === "function")
            component = esm2.esDOM[name] = await component;
          const init = component.esConnected;
          if (typeof init === "function")
            toRun.push(...await init());
          else
            console.error(`Could not start component ${name} because it does not have an esConnected function`);
        }
        if (onReadyCallback)
          await onReadyCallback();
        if ("esTrigger" in esm2) {
          if (!Array.isArray(esm2.esTrigger))
            esm2.esTrigger = [];
          toRun.push({
            ref: esm2,
            args: esm2.esTrigger
          });
          delete esm2.esTrigger;
        }
        return toRun;
      };
      const esConnectedMain = () => {
        let source = esm2[esSourceKey];
        if (source) {
          if (typeof source === "function")
            source = esm2.esSource = source();
          delete esm2[esSourceKey];
          const path = esm2.__isESComponent;
          if (esm2.__esCode)
            esm2.__esCode.addFile(path, source);
        }
        const esCode = esm2.esParent?.esComponent?.__esCode;
        if (esCode)
          value("__esCode", esCode, esm2);
        const context = esm2.__esProxy ?? esm2;
        if (ogInit)
          ogInit.call(context);
        if (esm2.esAnimate) {
          let original = esm2.esAnimate;
          const id2 = Math.random();
          const interval = typeof original === "number" ? original : "global";
          if (!animations[interval]) {
            const info2 = animations[interval] = { objects: { [id2]: esm2 } };
            const objects2 = info2.objects;
            const runFuncs = () => {
              for (let key in objects2)
                objects2[key].default();
            };
            if (interval === "global") {
              const callback = () => {
                runFuncs();
                info2.id = window.requestAnimationFrame(callback);
              };
              callback();
              animations[interval].stop = () => {
                window.cancelAnimationFrame(info2.id);
                info2.cancel = true;
              };
            } else {
              runFuncs();
              info2.id = setInterval(() => runFuncs(), 1e3 / interval);
              animations[interval].stop = () => clearInterval(info2.id);
            }
          } else {
            esm2.default();
            animations[interval].objects[id2] = esm2;
          }
          esm2.esAnimate = {
            id: id2,
            original,
            stop: () => {
              delete animations[interval].objects[id2];
              esm2.esAnimate = original;
              if (Object.keys(animations[interval].objects).length === 0) {
                animations[interval].stop();
                delete animations[interval];
              }
            }
          };
        }
      };
      const ogInit = esm2.esConnected;
      esm2.esConnected = (onReadyCallback) => {
        if (opts.await) {
          return esConnectedAsync(async () => {
            if (onReadyCallback)
              await onReadyCallback();
            esConnectedMain();
          });
        } else {
          const toRun = esConnectedAsync(onReadyCallback);
          esConnectedMain();
          return toRun;
        }
      };
      const ogDelete = esm2.esDisconnected;
      esm2.esDisconnected = function() {
        if (this.esAnimate && typeof this.esAnimate.stop === "function")
          this.esAnimate.stop();
        if (this.esListeners)
          this.esListeners.__manager.clear();
        let target = this;
        while (target.esParent?.hasAttribute("__isescomponent")) {
          target = target.esElement.parentNode.esComponent;
          if (target.esListeners?.__manager)
            target.esListeners.__manager.clear(this.__isESComponent);
        }
        if (this.esDOM) {
          for (let name in this.esDOM) {
            const component = this.esDOM[name];
            if (typeof component.esDisconnected === "function")
              component.esDisconnected();
            else
              console.warn("Could not disconnect component because it does not have an esDisconnected function", name, this.esDOM);
          }
        }
        if (this.esElement instanceof Element) {
          this.esElement.remove();
          if (this.onremove) {
            const context2 = this.__esProxy ?? this;
            this.onremove.call(context2);
          }
        }
        if (this.__esCode)
          this.__esCode.remove();
        const context = this.__esProxy ?? this;
        if (ogDelete)
          ogDelete.call(context);
        this.esConnected = ogInit;
        this.esDisconnected = ogDelete;
        return this;
      };
      for (let key in esm2) {
        if (typeof esm2[key] === "function") {
          const desc = Object.getOwnPropertyDescriptor(esm2, key);
          if (desc && desc.get && !desc.set)
            esm2 = Object.assign({}, esm2);
          const og = esm2[key];
          esm2[key] = (...args) => {
            const context = esm2.__esProxy ?? esm2;
            return og.call(context, ...args);
          };
        }
      }
      const isESC = { value: "", enumerable: false };
      if (typeof id === "string") {
        if (parent?.__isESComponent)
          isESC.value = [parent.__isESComponent, id];
        else
          isESC.value = [id];
        isESC.value = isESC.value.join(keySeparator);
      }
      Object.defineProperty(esm2, "__isESComponent", isESC);
      Object.defineProperty(esm2, "esOriginal", { value: copy, enumerable: false });
      esm2.esOnResize = finalStates.onresize;
      esm2.esParent = finalStates.parentNode;
      return esm2;
    } catch (e) {
      console.error(`Failed to create an ES Component (${typeof id === "string" ? id : id.toString()}):`, e);
      return copy;
    }
  };

  // ../../libraries/escompose/src/index.ts
  var listenerObject = Symbol("listenerObject");
  var createErrorComponent = (message) => {
    return {
      esElement: "p",
      esDOM: {
        b: {
          esElement: "b",
          esAttributes: {
            innerText: "Error: "
          }
        },
        span: {
          esElement: "span",
          esAttributes: {
            innerText: message
          }
        }
      }
    };
  };
  var esCompile = (o, opts = {}) => {
    let uri = typeof o === "string" ? o : o.esURI;
    if (uri && opts.utilities) {
      return new Promise(async (resolve3) => {
        try {
          const bundleOpts = opts.utilities.bundle;
          const compileOpts = opts.utilities.compile;
          if (typeof bundleOpts.function === "function") {
            const options = bundleOpts.options ?? {};
            if (!options.bundler)
              options.bundler = "datauri";
            if (!options.bundle)
              options.collection = "global";
            const bundle = bundleOpts.function(uri, options);
            await bundle.resolve();
            o = Object.assign({}, bundle.result);
          } else if (typeof compileOpts.function === "function") {
            const resolved = await compileOpts.function(o, compileOpts.options);
            o = resolved;
          } else {
            throw new Error("Cannot transform esCompose string without a compose utility function");
          }
        } catch (e) {
          if (o.esReference) {
            console.warn("[escompose]: Falling back to ES Component reference...", e);
            o = o.esReference;
          } else
            o = createErrorComponent(e.message);
        }
        resolve3(deep(o));
      });
    }
    return deep(o);
  };
  var esMerge = (base, esCompose = {}, path = [], opts = {}) => {
    if (!Array.isArray(esCompose))
      esCompose = [esCompose];
    let promise = resolve(esCompose.map((o) => {
      const compiled = esCompile(o, opts);
      return resolve(compiled, (compiled2) => {
        let arr = [compiled2];
        let target = compiled2;
        while (target.esCompose) {
          const val = target.esCompose;
          delete target.esCompose;
          target = resolve(esCompile(val, opts));
          arr.push(target);
        }
        return arr;
      });
    }));
    return resolve(promise, (clonedEsCompose) => {
      const flat = clonedEsCompose.flat();
      let merged = Object.assign({}, base);
      delete merged.esCompose;
      flat.forEach((toCompose) => {
        merged = merge(toCompose, merged, path);
      });
      return merged;
    });
  };
  var esDrill = (o, id, toMerge = {}, parent, opts) => {
    const parentId = parent?.__isESComponent;
    const path = parentId ? [parentId, id] : typeof id === "string" ? [id] : [];
    const firstMerge = merge(toMerge, o, path);
    const merged = esMerge(firstMerge, o.esCompose, path, opts);
    const res = resolve(merged, (merged2) => {
      delete merged2.esCompose;
      const instance = create_default(id, merged2, parent, opts);
      const savePath = path.join(opts.keySeparator ?? keySeparator);
      if (opts?.components)
        opts.components[savePath] = { instance, depth: parent ? path.length + 1 : path.length };
      if (instance.esDOM) {
        let positions = /* @__PURE__ */ new Set();
        let position = 0;
        for (let name in instance.esDOM) {
          const base = instance.esDOM[name];
          const pos = base.esChildPosition;
          if (pos !== void 0) {
            if (positions.has(pos))
              console.warn(`[escompose]: Duplicate esChildPosition value of ${pos} found in ${name} of ${instance.__isESComponent}`);
            else
              positions.add(pos);
          } else {
            while (positions.has(position))
              position++;
            base.esChildPosition = position;
            positions.add(position);
          }
          const promise = esDrill(base, name, void 0, instance, opts);
          instance.esDOM[name] = promise;
          resolve2(promise, (res2) => {
            instance.esDOM[name] = res2;
          });
        }
      }
      return instance;
    });
    return res;
  };
  var initializedStatus = "INITIALIZED";
  var registeredStatus = "REGISTERED";
  var globalListeners = {};
  var ListenerManager = class {
    constructor(listeners2 = {}, root, context) {
      this.original = {};
      this.active = {};
      this.context = {};
      this.rootPath = "";
      this.status = "";
      this.#toRun = [];
      this.register = (listeners2) => {
        Object.defineProperty(listeners2, "__manager", {
          value: this,
          enumerable: false,
          writable: true
        });
        for (let toPath in listeners2) {
          const from2 = listeners2[toPath];
          if (!from2) {
            console.warn("Skipping empty listener:", toPath);
            continue;
          }
          if (from2 && typeof from2 === "object") {
            for (let fromPath in from2)
              this.add(fromPath, toPath, from2[fromPath]);
          } else {
            if (typeof toPath === "string")
              this.add(from2, toPath, toPath);
            else
              console.error("Improperly Formatted Listener", toPath);
          }
        }
        this.status = registeredStatus;
      };
      this.#initialize = (o) => {
        const res = this.context.monitor.get(o.path, "info");
        if (typeof res.value === "function") {
          const args = Array.isArray(o.args) ? o.args : [o.args];
          res.value(...args);
        } else
          console.error("Cannot yet trigger values...", o);
      };
      this.initialize = (o) => {
        if (!this.status)
          this.#toRun.push(o);
        else if (this.status === registeredStatus) {
          this.status = initializedStatus;
          this.#toRun.forEach(this.#initialize);
        } else
          this.#initialize(o);
      };
      this.#getAbsolutePath = (name) => {
        return !name || !this.rootPath || name.includes(this.rootPath) ? name : [this.rootPath, name].join(this.context.monitor.options.keySeparator);
      };
      this.#getPathInfo = (path) => {
        path = this.#getAbsolutePath(path);
        const array = [this.context.id, ...path.split(this.context.options.keySeparator)];
        const obj = this.context.monitor.get(array);
        if (obj?.hasOwnProperty("__isESComponent"))
          array.push(defaultPath);
        path = array.slice(1).join(this.context.options.keySeparator);
        const rel = this.rootPath ? path.replace(`${this.rootPath}.`, "") : path;
        return {
          absolute: {
            value: path,
            array
          },
          relative: {
            value: rel,
            array: rel.split(this.context.options.keySeparator)
          }
        };
      };
      this.add = (from2, to2, value2 = true, subscription = this.active[from2]?.sub) => {
        const fromInfo = this.#getPathInfo(from2);
        const toInfo = this.#getPathInfo(to2);
        if (!subscription) {
          subscription = this.context.monitor.on(fromInfo.absolute.array, (path, _, update) => {
            return passToListeners(this, path, update);
          });
        }
        if (!this.active[fromInfo.absolute.value])
          this.active[fromInfo.absolute.value] = {};
        const info2 = this.active[fromInfo.absolute.value][toInfo.absolute.value] = {
          value: value2,
          subscription,
          [listenerObject]: true
        };
        let base = this.original[toInfo.relative.value];
        if (!base)
          base = this.original[toInfo.relative.value] = {};
        if (typeof base !== "object") {
          if (typeof base === "function")
            base = this.original[toInfo.relative.value] = { [Symbol("function listener")]: base };
          else
            base = this.original[toInfo.relative.value] = { [base]: true };
        }
        base[fromInfo.relative.value] = value2;
        const args = value2.esTrigger;
        if (args)
          this.initialize({
            path: fromInfo.absolute.array,
            args
          });
        let target = globalListeners;
        const globalPath = fromInfo.absolute.array.slice(1);
        const last = globalPath.pop();
        globalPath.forEach((key) => {
          if (!target)
            target[key] = {};
          target = target[key];
        });
        target[last] = true;
        return info2;
      };
      this.remove = (from2, to2) => {
        const fromInfo = this.#getPathInfo(from2);
        const toInfo = this.#getPathInfo(to2);
        const toRemove = [
          { ref: this.active, path: [fromInfo.absolute.value, toInfo.absolute.value], unlisten: true },
          { ref: this.original, path: [toInfo.relative.value, fromInfo.relative.value] }
        ];
        toRemove.forEach((o) => {
          const { ref, path, unlisten } = o;
          let base = ref[path[0]];
          if (typeof base === "object") {
            const info2 = base[path[1]];
            delete base[path[1]];
            if (Object.keys(base).length === 0) {
              delete ref[path[0]];
              if (unlisten && info2.subscription) {
                this.context.monitor.remove(info2.subscription);
              }
            }
          } else
            delete ref[path[0]];
        });
      };
      this.clear = (name) => {
        const value2 = this.#getAbsolutePath(name);
        Object.keys(this.active).forEach((from2) => {
          Object.keys(this.active[from2]).forEach((to2) => {
            if (!value2 || from2.slice(0, value2.length) === value2 || to2.slice(0, value2.length) === value2)
              this.remove(from2, to2);
          });
        });
      };
      this.has = (from2) => !!this.active[from2];
      this.get = (from2) => this.active[from2];
      this.context = context;
      this.rootPath = root;
      let target = globalListeners;
      root.split(this.context.options.keySeparator).forEach((key) => {
        if (!target)
          target[key] = {};
        target = target[key];
      });
      if (target)
        console.error("AHHHHHHHH");
      this.register(listeners2);
    }
    #toRun;
    #initialize;
    #getAbsolutePath;
    #getPathInfo;
  };
  var setListeners = (context, components) => {
    let toRun = [];
    for (let root in components) {
      const info2 = components[root];
      const to2 = info2.instance.esListeners ?? {};
      const listeners2 = new ListenerManager(to2, root, context);
      info2.instance.esListeners = to2;
      toRun.push(listeners2.initialize);
    }
    return toRun;
  };
  var isConfigObject = (o) => "esFormat" in o || "esBranch" in o || "esTrigger" in o || "esBind" in o;
  function pass(from2, target, update, context) {
    const id = context.id;
    let parent, key, subscription;
    const isValue = target?.__value;
    parent = target.parent;
    key = target.key;
    subscription = target.subscription;
    const info2 = target.parent[key];
    target = info2.value;
    let config = info2?.esConfig;
    let ogValue = target;
    const type = typeof target;
    const checkIfSetter = (path, willSet) => {
      const info3 = context.monitor.get(path, "info");
      if (info3.exists) {
        const val = info3.value;
        const noDefault = typeof val !== "function" && !val?.default;
        const value2 = noDefault ? toSet : val;
        const res = {
          value: value2,
          subscription
        };
        if (willSet) {
          target = res.value;
          parent[key] = res;
        }
        return res;
      } else
        return { value: void 0 };
    };
    const transform = (willSet) => {
      const fullPath = [id];
      fullPath.push(...key.split(context.options.keySeparator));
      return checkIfSetter(fullPath, willSet);
    };
    const getPathArray = (latest) => {
      const path = [id];
      const topPath = [];
      topPath.push(...latest.split(context.options.keySeparator));
      path.push(...topPath);
      return path;
    };
    if (typeof target === "boolean") {
      if (!isValue)
        transform(true);
      else
        console.error("Cannot use a boolean for esListener...");
    } else if (type === "string") {
      const path = getPathArray(ogValue);
      checkIfSetter(path, true);
      if (isValue) {
        parent[key] = { [ogValue]: parent[key] };
        key = ogValue;
      }
    } else if (target && type === "object") {
      const isConfig = isConfigObject(ogValue);
      if (isConfig) {
        if ("value" in ogValue) {
          if (isValue) {
            target = parent[key] = ogValue.value;
          } else {
            target = parent[key].value = ogValue.value;
          }
        } else
          transform(true);
        if (ogValue) {
          if (ogValue)
            config = ogValue;
        }
        Object.defineProperty(parent[key], "esConfig", { value: config });
      }
    }
    let isValidInput = true;
    if (config) {
      if ("esBind" in config) {
        const path = getPathArray(config.esBind.original ?? config.esBind);
        if (typeof config.esBind === "string") {
          const res = context.monitor.get(path);
          if (!res)
            target = `because ${path.slice(1).join(context.options.keySeparator)} does not point correctly to an existing component.`;
          else {
            config.esBind = {
              value: res,
              original: config.esBind
            };
          }
        } else if (!config.esBind.value.esParent) {
          target = `because ${config.esBind.original ?? id.toString()} has become unparented.`;
        }
      } else {
        if ("esBranch" in config) {
          const isValid = config.esBranch.find((o) => {
            let localValid = [];
            if ("condition" in o)
              localValid.push(o.condition(update));
            if ("equals" in o)
              localValid.push(o.equals === update);
            const isValidLocal = localValid.length > 0 && localValid.reduce((a, b) => a && b, true);
            if (isValidLocal) {
              if ("value" in o)
                update = o.value;
            }
            return isValidLocal;
          });
          if (!isValid)
            isValidInput = false;
        }
        if ("esFormat" in config) {
          try {
            update = config.esFormat(update);
            if (update === void 0)
              isValidInput = false;
          } catch (e) {
            console.error("Failed to format arguments", e);
          }
        }
      }
    }
    if (isValidInput && update !== void 0) {
      const arrayUpdate = Array.isArray(update) ? update : [update];
      if (target === toSet) {
        const parentPath = [id];
        parentPath.push(...key.split(context.options.keySeparator));
        const idx = parentPath.pop();
        const info3 = context.monitor.get(parentPath, "info");
        info3.value[idx] = update;
      } else if (target?.default)
        target.default.call(target, ...arrayUpdate);
      else if (typeof target === "function") {
        const noContext = parent[key][listenerObject];
        if (noContext)
          target.call(config?.esBind?.value ?? context.instance, ...arrayUpdate);
        else
          target(...arrayUpdate);
      } else {
        let baseMessage = key ? `listener: ${from2} \u2014> ${key}` : `listener from ${from2}`;
        if (parent) {
          console.warn(`Deleting ${baseMessage}`, target);
          delete parent[key];
        } else
          console.error(`Failed to add ${baseMessage}`, target);
      }
    }
  }
  function passToListeners(listeners2, name, update) {
    const context = listeners2.context;
    const listenerGroups = [{
      info: listeners2.get(name),
      name
    }];
    listenerGroups.forEach((group) => {
      const info2 = group.info;
      if (info2) {
        if (info2[listenerObject]) {
          pass(name, {
            value: info2.value,
            parent: listeners2.active,
            key: group.name,
            subscription: info2.subscription,
            __value: true
          }, update, context);
        } else if (typeof info2 === "object") {
          for (let key in info2) {
            pass(name, {
              parent: info2,
              key,
              subscription: info2[key].subscription,
              value: info2[key].value
            }, update, context);
          }
        } else
          console.error("Improperly Formatted Listener", info2);
      }
    });
  }
  var toSet = Symbol("toSet");
  var create2 = (config, toMerge = {}, options = {}) => {
    let monitor;
    if (options.monitor instanceof src_default) {
      monitor = options.monitor;
      options.keySeparator = monitor.options.keySeparator;
    } else {
      if (!options.monitor)
        options.monitor = {};
      if (!options.monitor.keySeparator) {
        if (!options.keySeparator)
          options.keySeparator = keySeparator;
        options.monitor.keySeparator = options.keySeparator;
      }
      monitor = new src_default(options.monitor);
    }
    if (options.clone)
      config = deep(config);
    monitor.options.fallbacks = ["esDOM"];
    const fullOptions = options;
    const components = {};
    const drillOpts = {
      components,
      keySeparator: fullOptions.keySeparator,
      utilities: fullOptions.utilities,
      await: fullOptions.await
    };
    let instancePromiseOrObject;
    let context;
    const onConnected = (instance) => {
      const noParent = !instance.esParent;
      if (noParent)
        return instance;
      else
        return new Promise((resolve3) => {
          const possiblePromise = instance.esConnected(() => {
            if (context && options.listen !== false) {
              const toRun = setListeners(context, components);
              toRun.forEach((func) => func());
            }
          }, true);
          resolve(possiblePromise, (toRun) => {
            toRun.forEach((o) => o.ref.default(o.args));
            resolve3(instance);
          });
        });
    };
    if (options.nested?.parent && options.nested?.name) {
      instancePromiseOrObject = esDrill(config, options.nested.name, toMerge, options.nested.parent, drillOpts);
      return resolve(instancePromiseOrObject, onConnected);
    } else {
      const id = Symbol("root");
      instancePromiseOrObject = esDrill(config, id, toMerge, void 0, drillOpts);
      const set2 = (instance) => {
        monitor.set(id, instance, fullOptions.listeners);
        context = {
          id,
          instance,
          monitor,
          options: fullOptions
        };
        return onConnected(instance);
      };
      return resolve(instancePromiseOrObject, set2);
    }
  };
  var src_default2 = create2;
  var resolve2 = resolve;

  // ../../libraries/escomposer/src/schema/graphscript.ts
  var from = (gs) => {
    let globalListeners2 = { [""]: {} };
    const drill = (target, acc = {}, path = []) => {
      const nodeInfo = target._node;
      delete target._node;
      acc = Object.assign(acc, target);
      if (typeof target === "function" && path.length) {
        acc.default = target;
      } else if (nodeInfo) {
        if (nodeInfo.children) {
          acc.esDOM = {};
          for (let key in nodeInfo.children) {
            const child = nodeInfo.children[key];
            acc.esDOM[key] = drill(child, {}, [...path, key]);
          }
        }
        if (nodeInfo.listeners) {
          for (let key in nodeInfo.listeners) {
            globalListeners2[""][key] = {
              value: nodeInfo.listeners[key],
              esBind: path.join(".")
            };
          }
        }
        if (nodeInfo.operator && !acc.default)
          acc.default = nodeInfo.operator;
        if (nodeInfo.loop)
          acc.esAnimate = nodeInfo.loop / 1e3;
      }
      return acc;
    };
    if (!("_node" in gs))
      gs = {
        _node: {
          children: gs
        }
      };
    const esc = drill(gs);
    esc.esListeners = globalListeners2;
    return esc;
  };
  var to = (esc) => {
    let listeners2 = {};
    const drill = (target, acc = {}, prevKey = "") => {
      if (target.esListeners) {
        Object.keys(target.esListeners).forEach((str) => {
          Object.keys(target.esListeners[str]).forEach((key) => {
            const listener = target.esListeners[str][key];
            const targetStr = listener.esBind.split(".").slice(-1)[0] ?? key;
            if (!listeners2[targetStr])
              listeners2[targetStr] = {};
            listeners2[targetStr][key] = listener.value ?? listener;
          });
        });
      }
      if (target.esDOM) {
        if (!acc._node)
          acc._node = {};
        if (!acc._node.children)
          acc._node.children = {};
        drill(target.esDOM, acc._node.children, "esDOM");
      }
      Object.keys(target).forEach((key) => {
        if (prevKey === "esDOM") {
          if (!acc[key])
            acc[key] = target[key];
          acc[key]._node = {};
          if (listeners2[key]) {
            acc[key]._node.listeners = {
              ...acc[key]._node.listeners,
              ...listeners2[key]
            };
            delete listeners2[key];
          }
          drill(target[key], acc[key], key);
        }
        if (key === "default") {
          acc._node.operator = target[key];
          delete target[key];
        }
        if (key === "esAnimate")
          acc._node.loop = target[key] * 1e3;
      });
      return acc;
    };
    const component = create2(esc, void 0, { listen: false, await: false });
    const tree2 = drill({ esDOM: { component } })._node.children.component._node.children;
    tree2._node = { listeners: listeners2[""] };
    return tree2;
  };

  // index.js
  var divs = {};
  var toGS = "escXgs";
  var toESC = "gsXesc";
  var trees = [
    { id: "tree", value: tree_default },
    { id: "esc", value: index_esc_exports },
    { id: "escXgs", value: index_esc_exports },
    { id: "gsXesc", value: deep(tree_default) }
  ];
  var readouts = document.getElementById("readouts");
  for (let i in trees) {
    const o = trees[i];
    console.log(`------------------------ Loading ${o.id} ------------------------`);
    let tree2 = o.value;
    if (!divs[o.id]) {
      divs[o.id] = document.createElement("ol");
      divs[o.id].id = o.id;
      readouts.appendChild(divs[o.id]);
      divs[o.id].innerHTML = `<h1>${o.id}</h1>`;
    }
    const transformToESC = o.id == toESC;
    if (transformToESC)
      tree2 = graphscript_exports.from(tree2);
    if (o.id === "esc" || transformToESC) {
      const onConnected = (tree3) => {
        tree3.esDOM.nodeB.x += 1;
        tree3.esDOM.nodeB.esDOM.nodeC.default(4);
        tree3.esDOM.nodeA.jump();
        const popped2 = tree3.esDOM.nodeB.esDisconnected();
        divs[o.id].innerHTML += "<li><b>nodeB popped!</b></li>";
        popped2.x += 1;
        tree3.esDOM.nodeA.jump();
        setTimeout(() => {
          tree3.esDOM.nodeE.esDisconnected();
          divs[o.id].innerHTML += "<li><b>nodeE popped!</b></li>";
        }, 5500);
      };
      create2(tree2, { esParent: divs[o.id] }, { listen: true, clone: true, await: true }).then(onConnected);
      continue;
    } else if (o.id === toGS) {
      tree2 = graphscript_exports.to(tree2);
      console.log("Got", tree2);
    }
    let graph = new Graph({
      tree: tree2,
      loaders: {
        "looper": (props, parent, graph3) => {
          if (props._node.loop && typeof props._node.loop === "number") {
            let oncreate = (node) => {
              if (node._node.loop && typeof node._node.loop === "number") {
                node._node.isLooping = true;
                if (!node._node.looper) {
                  node._node.looper = () => {
                    if (node._node.isLooping) {
                      node._node.operator();
                      setTimeout(node._node.looper, node._node.loop);
                    }
                  };
                  node._node.looper();
                }
              }
            };
            if (typeof props._node.oncreate === "undefined")
              props._node.oncreate = [oncreate];
            else if (typeof props._node.oncreate === "function")
              props._node.oncreate = [oncreate, props._node.oncreate];
            else if (Array.isArray(props._node.oncreate))
              props._node.oncreate.unshift(oncreate);
            let ondelete = (node) => {
              if (node._node.isLooping)
                node._node.isLooping = false;
            };
            if (typeof props._node.ondelete === "undefined")
              props._node.ondelete = [ondelete];
            else if (typeof props._node.ondelete === "function")
              props._node.ondelete = [ondelete, props._node.ondelete];
            else if (Array.isArray(props._node.ondelete))
              props._node.ondelete.unshift(ondelete);
          }
        }
      }
    });
    graph.get("nodeB").x += 1;
    graph.run("nodeB.nodeC", 4);
    graph.get("nodeA").jump();
    let tree22 = {
      graph
    };
    let graph2 = new Graph({ tree: tree22 });
    let popped = graph.remove("nodeB");
    divs[o.id].innerHTML += "<li><b>nodeB popped!</b></li>";
    graph2.add(popped);
    popped.x += 1;
    graph.get("nodeA").jump();
    setTimeout(() => {
      graph.remove("nodeE");
      divs[o.id].innerHTML += "<li><b>nodeE popped!</b></li>";
    }, 5500);
  }
})();
