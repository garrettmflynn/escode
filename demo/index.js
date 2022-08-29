(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // plugins/example.js
  var example_exports = {};
  __export(example_exports, {
    attributes: () => attributes,
    default: () => example_default,
    nExecutions: () => nExecutions,
    tagName: () => tagName
  });
  var nExecutions = 0;
  var tagName = "button";
  var attributes = {
    innerHTML: "Click Me",
    onclick: function() {
      this.run();
    }
  };
  function example_default() {
    this.nExecutions++;
    return this.nExecutions;
  }

  // plugins/log.js
  var log_exports = {};
  __export(log_exports, {
    default: () => log_default
  });
  function log_default(...args) {
    console.log(`[${this.tag}]`, ...args);
  }

  // plugins/api.js
  var api_exports = {};
  __export(api_exports, {
    add: () => add,
    divide: () => divide,
    multiply: () => multiply,
    subtract: () => subtract
  });
  var add = (a, b) => a + b;
  var subtract = (a, b) => a - b;
  var multiply = (a, b) => a * b;
  var divide = (a, b) => a / b;

  // src/graphscript/Graph.ts
  function parseFunctionFromText(method = "") {
    let getFunctionBody = (methodString) => {
      return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, "$2$3$4");
    };
    let getFunctionHead = (methodString) => {
      let startindex = methodString.indexOf("=>") + 1;
      if (startindex <= 0) {
        startindex = methodString.indexOf("){");
      }
      if (startindex <= 0) {
        startindex = methodString.indexOf(") {");
      }
      return methodString.slice(0, methodString.indexOf("{", startindex) + 1);
    };
    let newFuncHead = getFunctionHead(method);
    let newFuncBody = getFunctionBody(method);
    let newFunc;
    if (newFuncHead.includes("function")) {
      let varName = newFuncHead.split("(")[1].split(")")[0];
      newFunc = new Function(varName, newFuncBody);
    } else {
      if (newFuncHead.substring(0, 6) === newFuncBody.substring(0, 6)) {
        let varName = newFuncHead.split("(")[1].split(")")[0];
        newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf("{") + 1, newFuncBody.length - 1));
      } else {
        try {
          newFunc = (0, eval)(newFuncHead + newFuncBody + "}");
        } catch {
        }
      }
    }
    return newFunc;
  }
  var state = {
    pushToState: {},
    data: {},
    triggers: {},
    setState(updateObj) {
      Object.assign(state.data, updateObj);
      for (const prop of Object.getOwnPropertyNames(updateObj)) {
        if (state.triggers[prop])
          state.triggers[prop].forEach((obj) => obj.onchange(state.data[prop]));
      }
      return state.data;
    },
    subscribeTrigger(key, onchange) {
      if (key) {
        if (!state.triggers[key]) {
          state.triggers[key] = [];
        }
        let l = state.triggers[key].length;
        state.triggers[key].push({ idx: l, onchange });
        return state.triggers[key].length - 1;
      } else
        return void 0;
    },
    unsubscribeTrigger(key, sub) {
      let idx = void 0;
      let triggers = state.triggers[key];
      if (triggers) {
        if (!sub)
          delete state.triggers[key];
        else {
          let obj = triggers.find((o) => {
            if (o.idx === sub) {
              return true;
            }
          });
          if (obj)
            triggers.splice(idx, 1);
          return true;
        }
      }
    },
    subscribeTriggerOnce(key, onchange) {
      let sub;
      let changed = (value) => {
        onchange(value);
        state.unsubscribeTrigger(key, sub);
      };
      sub = state.subscribeTrigger(key, changed);
    }
  };
  function merge(props) {
    for (let k in props) {
      if (k === "_state")
        continue;
      else {
        this[k] = props[k];
        this._state[k] = props[k];
        Object.defineProperty(this, k, {
          get: () => this._state[k],
          set: (v) => this._state[k] = v,
          enumerable: true
        });
      }
    }
  }
  var GraphNode = class {
    constructor(properties = {}, parentNode, graph) {
      this.nodes = /* @__PURE__ */ new Map();
      this._initial = {};
      this._state = {};
      this.state = state;
      this.isLooping = false;
      this.isAnimating = false;
      this.looper = void 0;
      this.animation = void 0;
      this.forward = true;
      this.backward = false;
      this.runSync = false;
      this.firstRun = true;
      this.DEBUGNODE = false;
      this.merge = merge;
      this.operator = (...args) => {
        return args;
      };
      this.runOp = (...args) => {
        if (this.DEBUGNODE)
          console.time(this.tag);
        let result = this.operator(...args);
        if (result instanceof Promise) {
          result.then((res) => {
            if (res !== void 0)
              this.setState({ [this.tag]: res });
            if (this.DEBUGNODE) {
              console.timeEnd(this.tag);
              if (result !== void 0)
                console.log(`${this.tag} result:`, result);
            }
            ;
            return res;
          });
        } else {
          if (result !== void 0)
            this.setState({ [this.tag]: result });
          if (this.DEBUGNODE) {
            console.timeEnd(this.tag);
            if (result !== void 0)
              console.log(`${this.tag} result:`, result);
          }
          ;
        }
        return result;
      };
      this.setOperator = (operator) => {
        if (typeof operator !== "function")
          return operator;
        this.operator = operator.bind(this);
        return operator;
      };
      this.runAsync = (...args) => {
        return new Promise((res, rej) => {
          res(this.run(...args));
        });
      };
      this.transformArgs = (args = []) => args;
      this.isRunSync = () => {
        return !(this.children && this.forward || this.parent && this.backward || this.repeat || this.delay || this.frame || this.recursive || this.branch);
      };
      this.run = (...args) => {
        if (typeof this.transformArgs === "function")
          args = this.transformArgs(args, this);
        if (this.firstRun) {
          this.firstRun = false;
          this.runSync = this.isRunSync();
          if (this.animate && !this.isAnimating) {
            this.runAnimation(this.animation, args);
          }
          if (this.loop && typeof this.loop === "number" && !this.isLooping) {
            this.runLoop(this.looper, args);
          }
          if (this.loop || this.animate)
            return;
        }
        if (this.runSync) {
          let res = this.runOp(...args);
          return res;
        }
        return new Promise(async (resolve) => {
          if (this) {
            let run = (node, tick = 0, ...input) => {
              return new Promise(async (r) => {
                tick++;
                let res = await node.runOp(...input);
                if (node.repeat) {
                  while (tick < node.repeat) {
                    if (node.delay) {
                      setTimeout(async () => {
                        r(await run(node, tick, ...input));
                      }, node.delay);
                      break;
                    } else if (node.frame && window?.requestAnimationFrame) {
                      requestAnimationFrame(async () => {
                        r(await run(node, tick, ...input));
                      });
                      break;
                    } else
                      res = await node.runOp(...input);
                    tick++;
                  }
                  if (tick === node.repeat) {
                    r(res);
                    return;
                  }
                } else if (node.recursive) {
                  while (tick < node.recursive) {
                    if (node.delay) {
                      setTimeout(async () => {
                        r(await run(node, tick, ...res));
                      }, node.delay);
                      break;
                    } else if (node.frame && window?.requestAnimationFrame) {
                      requestAnimationFrame(async () => {
                        r(await run(node, tick, ...res));
                      });
                      break;
                    } else
                      res = await node.runOp(...res);
                    tick++;
                  }
                  if (tick === node.recursive) {
                    r(res);
                    return;
                  }
                } else {
                  r(res);
                  return;
                }
              });
            };
            let runnode = async () => {
              let res = await run(this, void 0, ...args);
              if (res !== void 0) {
                if (this.backward && this.parent instanceof GraphNode) {
                  if (Array.isArray(res))
                    await this.runParent(this, ...res);
                  else
                    await this.runParent(this, res);
                }
                if (this.children && this.forward) {
                  if (Array.isArray(res))
                    await this.runChildren(this, ...res);
                  else
                    await this.runChildren(this, res);
                }
                if (this.branch) {
                  this.runBranch(this, res);
                }
              }
              return res;
            };
            if (this.delay) {
              setTimeout(async () => {
                resolve(await runnode());
              }, this.delay);
            } else if (this.frame && window?.requestAnimationFrame) {
              requestAnimationFrame(async () => {
                resolve(await runnode());
              });
            } else {
              resolve(await runnode());
            }
          } else
            resolve(void 0);
        });
      };
      this.runParent = async (n, ...args) => {
        if (n.backward && n.parent) {
          if (typeof n.parent === "string") {
            if (n.graph && n.graph?.get(n.parent)) {
              n.parent = n.graph;
              if (n.parent)
                this.nodes.set(n.parent.tag, n.parent);
            } else
              n.parent = this.nodes.get(n.parent);
          }
          if (n.parent instanceof GraphNode)
            await n.parent.run(...args);
        }
      };
      this.runChildren = async (n, ...args) => {
        if (typeof n.children === "object") {
          for (const key in n.children) {
            if (typeof n.children[key] === "string") {
              if (n.graph && n.graph?.get(n.children[key])) {
                n.children[key] = n.graph.get(n.children[key]);
                if (!n.nodes.get(n.children[key].tag))
                  n.nodes.set(n.children[key].tag, n.children[key]);
              }
              if (!n.children[key] && n.nodes.get(n.children[key]))
                n.children[key] = n.nodes.get(n.children[key]);
            } else if (typeof n.children[key] === "undefined" || n.children[key] === true) {
              if (n.graph && n.graph?.get(key)) {
                n.children[key] = n.graph.get(key);
                if (!n.nodes.get(n.children[key].tag))
                  n.nodes.set(n.children[key].tag, n.children[key]);
              }
              if (!n.children[key] && n.nodes.get(key))
                n.children[key] = n.nodes.get(key);
            }
            if (n.children[key]?.runOp)
              await n.children[key].run(...args);
          }
        }
      };
      this.runBranch = async (n, output) => {
        if (n.branch) {
          let keys = Object.keys(n.branch);
          await Promise.all(keys.map(async (k) => {
            if (typeof n.branch[k].if === "object")
              n.branch[k].if = stringifyFast(n.branch[k].if);
            let pass = false;
            if (typeof n.branch[k].if === "function") {
              pass = n.branch[k].if(output);
            } else {
              if (typeof output === "object") {
                if (stringifyFast(output) === n.branch[k].if)
                  pass = true;
              } else if (output === n.branch[k].if)
                pass = true;
            }
            if (pass) {
              if (n.branch[k].then.run) {
                if (Array.isArray(output))
                  await n.branch[k].then.run(...output);
                else
                  await n.branch[k].then.run(...output);
              } else if (typeof n.branch[k].then === "function") {
                if (Array.isArray(output))
                  await n.branch[k].then(...output);
                else
                  await n.branch[k].then(output);
              } else if (typeof n.branch[k].then === "string") {
                if (n.graph)
                  n.branch[k].then = n.graph.nodes.get(n.branch[k].then);
                else
                  n.branch[k].then = n.nodes.get(n.branch[k].then);
                if (n.branch[k].then.run) {
                  if (Array.isArray(output))
                    await n.branch[k].then.run(...output);
                  else
                    await n.branch[k].then.run(...output);
                }
              }
            }
            return pass;
          }));
        }
      };
      this.runAnimation = (animation = this.animation, args = []) => {
        this.animation = animation;
        if (!animation)
          this.animation = this.operator;
        if (this.animate && !this.isAnimating && "requestAnimationFrame" in window) {
          this.isAnimating = true;
          let anim = async () => {
            if (this.isAnimating) {
              if (this.DEBUGNODE)
                console.time(this.tag);
              let result = this.animation.call(this, ...args);
              if (result instanceof Promise) {
                result = await result;
              }
              if (this.DEBUGNODE) {
                console.timeEnd(this.tag);
                if (result !== void 0)
                  console.log(`${this.tag} result:`, result);
              }
              ;
              if (result !== void 0) {
                if (this.tag)
                  this.setState({ [this.tag]: result });
                if (this.backward && this.parent?.run) {
                  if (Array.isArray(result))
                    await this.runParent(this, ...result);
                  else
                    await this.runParent(this, result);
                }
                if (this.children && this.forward) {
                  if (Array.isArray(result))
                    await this.runChildren(this, ...result);
                  else
                    await this.runChildren(this, result);
                }
                if (this.branch) {
                  this.runBranch(this, result);
                }
                this.setState({ [this.tag]: result });
              }
              requestAnimationFrame(anim);
            }
          };
          requestAnimationFrame(anim);
        }
      };
      this.runLoop = (loop = this.looper, args = [], timeout = this.loop) => {
        this.looper = loop;
        if (!loop)
          this.looper = this.operator;
        if (typeof timeout === "number" && !this.isLooping) {
          this.isLooping = true;
          let looping = async () => {
            if (this.isLooping) {
              if (this.DEBUGNODE)
                console.time(this.tag);
              let result = this.looper.call(this, ...args);
              if (result instanceof Promise) {
                result = await result;
              }
              if (this.DEBUGNODE) {
                console.timeEnd(this.tag);
                if (result !== void 0)
                  console.log(`${this.tag} result:`, result);
              }
              ;
              if (result !== void 0) {
                if (this.tag)
                  this.setState({ [this.tag]: result });
                if (this.backward && this.parent?.run) {
                  if (Array.isArray(result))
                    await this.runParent(this, ...result);
                  else
                    await this.runParent(this, result);
                }
                if (this.children && this.forward) {
                  if (Array.isArray(result))
                    await this.runChildren(this, ...result);
                  else
                    await this.runChildren(this, result);
                }
                if (this.branch) {
                  this.runBranch(this, result);
                }
                this.setState({ [this.tag]: result });
              }
              setTimeout(async () => {
                await looping();
              }, timeout);
            }
          };
          looping();
        }
      };
      this.setParent = (parent) => {
        this.parent = parent;
        if (this.backward)
          this.runSync = false;
      };
      this.setChildren = (children) => {
        this.children = children;
        if (this.forward)
          this.runSync = false;
      };
      this.add = (n = {}) => {
        if (typeof n === "function")
          n = { operator: n };
        if (!(n instanceof GraphNode))
          n = new GraphNode(n, this, this.graph);
        this.nodes.set(n.tag, n);
        if (this.graph) {
          this.graph.nodes.set(n.tag, n);
          this.graph.nNodes = this.graph.nodes.size;
        }
        return n;
      };
      this.remove = (n) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n?.tag) {
          this.nodes.delete(n.tag);
          if (this.children[n.tag])
            delete this.children[n.tag];
          if (this.graph) {
            this.graph.nodes.delete(n.tag);
            this.graph.nNodes = this.graph.nodes.size;
          }
          this.nodes.forEach((n2) => {
            if (n2.nodes.get(n2.tag)) {
              n2.nodes.delete(n2.tag);
              if (n2.children[n2.tag])
                delete n2.children[n2.tag];
              if (n2.parent?.tag === n2.tag)
                delete n2.parent;
            }
          });
          if (n.ondelete)
            n.ondelete(n);
        }
      };
      this.append = (n, parentNode = this) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n?.nodes) {
          parentNode.addChildren(n);
          if (n.forward)
            n.runSync = false;
        }
      };
      this.subscribe = (callback, tag = this.tag) => {
        if (callback.run) {
          return this.subscribeNode(callback);
        } else
          return this.state.subscribeTrigger(tag, callback);
      };
      this.unsubscribe = (sub, tag = this.tag) => {
        return this.state.unsubscribeTrigger(tag, sub);
      };
      this.addChildren = (children) => {
        if (!this.children)
          this.children = {};
        if (typeof children === "object") {
          Object.assign(this.children, children);
        }
        this.convertChildrenToNodes();
        if (this.forward)
          this.runSync = false;
      };
      this.callParent = (...args) => {
        if (typeof this.parent === "string") {
          if (this.graph && this.graph?.get(this.parent)) {
            this.parent = this.graph;
            if (this.parent)
              this.nodes.set(this.parent.tag, this.parent);
          } else
            this.parent = this.nodes.get(this.parent);
        }
        if (typeof this.parent?.operator === "function")
          return this.parent.runOp(...args);
      };
      this.callChildren = (...args) => {
        let result;
        if (typeof this.children === "object") {
          for (const key in this.children) {
            if (this.children[key]?.runOp)
              this.children[key].runOp(...args);
          }
        }
        return result;
      };
      this.getProps = (n = this) => {
        return {
          tag: n.tag,
          operator: n.operator,
          graph: n.graph,
          children: n.children,
          parent: n.parent,
          forward: n.forward,
          backward: n.bacward,
          loop: n.loop,
          animate: n.animate,
          frame: n.frame,
          delay: n.delay,
          recursive: n.recursive,
          repeat: n.repeat,
          branch: n.branch,
          oncreate: n.oncreate,
          DEBUGNODE: n.DEBUGNODE,
          ...this._initial
        };
      };
      this.setProps = (props = {}) => {
        let tmp = Object.assign({}, props);
        if (tmp.children) {
          this.addChildren(props.children);
          delete tmp.children;
        }
        if (tmp.operator) {
          this.setOperator(props.operator);
          delete tmp.operator;
        }
        Object.assign(tmp, props);
        this.runSync = this.isRunSync();
      };
      this.removeTree = (n) => {
        if (n) {
          if (typeof n === "string")
            n = this.nodes.get(n);
        }
        if (n?.nodes) {
          let checked = {};
          const recursivelyRemove = (node) => {
            if (typeof node.children === "object" && !checked[node.tag]) {
              checked[node.tag] = true;
              for (const key in node.children) {
                if (node.children[key].stopNode)
                  node.children[key].stopNode();
                if (node.children[key].tag) {
                  if (this.nodes.get(node.children[key].tag))
                    this.nodes.delete(node.children[key].tag);
                  this.nodes.forEach((n2) => {
                    if (n2.nodes.get(node.children[key].tag))
                      n2.nodes.delete(node.children[key].tag);
                    if (n2.children[key] instanceof GraphNode)
                      delete n2.children[key];
                  });
                  recursivelyRemove(node.children[key]);
                }
              }
            }
          };
          if (n.stopNode)
            n.stopNode();
          if (n.tag) {
            this.nodes.delete(n.tag);
            if (this.children[n.tag])
              delete this.children[n.tag];
            if (this.parent?.tag === n.tag)
              delete this.parent;
            if (this[n.tag] instanceof GraphNode)
              delete this[n.tag];
            this.nodes.forEach((n2) => {
              if (n2?.tag) {
                if (n2.nodes.get(n2.tag))
                  n2.nodes.delete(n2.tag);
                if (n2.children[n2.tag] instanceof GraphNode)
                  delete n2.children[n2.tag];
              }
            });
            recursivelyRemove(n);
            if (this.graph)
              this.graph.removeTree(n, checked);
            else if (n.ondelete)
              n.ondelete(n);
          }
        }
      };
      this.checkNodesHaveChildMapped = (n, child, checked = {}) => {
        let tag = n.tag;
        if (!tag)
          tag = n.name;
        if (!checked[tag]) {
          checked[tag] = true;
          if (n.children) {
            if (child.tag in n.children) {
              if (n.children[child.tag] instanceof GraphNode) {
                if (!n.nodes.get(child.tag))
                  n.nodes.set(child.tag, child);
                n.children[child.tag] = child;
                if (!n.firstRun)
                  n.firstRun = true;
              }
            }
          }
          if (n.parent instanceof GraphNode) {
            if (n.nodes.get(child.tag))
              n.parent.nodes.set(child.tag, child);
            if (n.parent.children) {
              this.checkNodesHaveChildMapped(n.parent, child, checked);
            } else if (n.nodes) {
              n.nodes.forEach((n2) => {
                if (!checked[n2.tag]) {
                  this.checkNodesHaveChildMapped(n2, child, checked);
                }
              });
            }
          }
          if (n.graph) {
            if (n.parent && n.parent.name !== n.graph.name) {
              n.graph.nodes.forEach((n2) => {
                if (!checked[n2.tag]) {
                  this.checkNodesHaveChildMapped(n2, child, checked);
                }
              });
            }
          }
        }
      };
      this.convertChildrenToNodes = (n = this) => {
        if (n?.children) {
          for (const key in n.children) {
            if (!(n.children[key] instanceof GraphNode)) {
              if (typeof n.children[key] === "object") {
                if (!n.children[key].tag)
                  n.children[key].tag = key;
                if (!n.nodes.get(n.children[key].tag)) {
                  n.children[key] = new GraphNode(n.children[key], n, n.graph);
                  this.checkNodesHaveChildMapped(n, n.children[key]);
                }
              } else {
                if (typeof n.children[key] === "undefined" || n.children[key] == true) {
                  n.children[key] = n.graph.get(key);
                  if (!n.children[key])
                    n.children[key] = n.nodes.get(key);
                } else if (typeof n.children[key] === "string") {
                  let k = n.children[key];
                  n.children[key] = n.graph.get(k);
                  if (!n.children[key])
                    n.children[key] = n.nodes.get(key);
                }
                if (n.children[key] instanceof GraphNode) {
                  n.nodes.set(n.children[key].tag, n.children[key]);
                  this.checkNodesHaveChildMapped(n, n.children[key]);
                  if (!(n.children[key].tag in n))
                    n[n.children[key].tag] = n.children[key];
                }
              }
            }
          }
        }
        return n.children;
      };
      this.stopLooping = (n = this) => {
        n.isLooping = false;
      };
      this.stopAnimating = (n = this) => {
        n.isAnimating = false;
      };
      this.stopNode = (n = this) => {
        n.stopAnimating(n);
        n.stopLooping(n);
      };
      this.subscribeNode = (n) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n.tag)
          this.nodes.set(n.tag, n);
        if (n)
          return this.state.subscribeTrigger(this.tag, (res) => {
            if (Array.isArray(res))
              n.run(...res);
            else
              n.run(res);
          });
      };
      this.print = (n = this, printChildren = true, nodesPrinted = []) => {
        let dummyNode = new GraphNode();
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n instanceof GraphNode) {
          nodesPrinted.push(n.tag);
          let jsonToPrint = {
            tag: n.tag,
            operator: n.operator.toString()
          };
          if (n.parent)
            jsonToPrint.parent = n.parent.tag;
          if (typeof n.children === "object") {
            for (const key in n.children) {
              if (typeof n.children[key] === "string")
                return n.children[key];
              if (nodesPrinted.includes(n.children[key].tag))
                return n.children[key].tag;
              else if (!printChildren) {
                return n.children[key].tag;
              } else
                return n.children[key].print(n.children[key], printChildren, nodesPrinted);
            }
          }
          for (const prop in n) {
            if (prop === "parent" || prop === "children")
              continue;
            if (typeof dummyNode[prop] === "undefined") {
              if (typeof n[prop] === "function") {
                jsonToPrint[prop] = n[prop].toString();
              } else if (typeof n[prop] === "object") {
                jsonToPrint[prop] = JSON.stringifyWithCircularRefs(n[prop]);
              } else {
                jsonToPrint[prop] = n[prop];
              }
            }
          }
          return JSON.stringify(jsonToPrint);
        }
      };
      this.reconstruct = (json) => {
        let parsed = reconstructObject(json);
        if (parsed)
          return this.add(parsed);
      };
      this.setState = this.state.setState;
      this.DEBUGNODES = (debugging = true) => {
        this.DEBUGNODE = debugging;
        this.nodes.forEach((n) => {
          if (debugging)
            n.DEBUGNODE = true;
          else
            n.DEBUGNODE = false;
        });
      };
      if (typeof properties === "function") {
        properties = { operator: properties };
      }
      if (typeof properties === "object") {
        if (properties instanceof GraphNode && properties._initial)
          Object.assign(properties, properties._initial);
        if (properties instanceof Graph) {
          let source = properties;
          properties = {
            source,
            operator: (input) => {
              if (typeof input === "object") {
                let result = {};
                for (const key in input) {
                  if (typeof source[key] === "function") {
                    if (Array.isArray(input[key]))
                      result[key] = source[key](...input[key]);
                    else
                      result[key] = source[key](input[key]);
                  } else {
                    source[key] = input[key];
                    result[key] = source[key];
                  }
                }
                return result;
              }
              return source;
            }
          };
          if (source.operator)
            properties.operator = source.operator;
          if (source.children)
            properties.children = source.children;
          if (source.forward)
            properties.forward = source.forward;
          if (source.backward)
            properties.backward = source.backward;
          if (source.repeat)
            properties.repeat = source.repeat;
          if (source.recursive)
            properties.recursive = source.recursive;
          if (source.loop)
            properties.loop = source.loop;
          if (source.animate)
            properties.animate = source.animate;
          if (source.looper)
            properties.looper = source.looper;
          if (source.animation)
            properties.animation = source.animation;
          if (source.delay)
            properties.delay = source.delay;
          if (source.tag)
            properties.tag = source.tag;
          if (source.oncreate)
            properties.oncreate = source.oncreate;
          if (source.node) {
            if (source.node._initial)
              Object.assign(properties, source.node._initial);
          }
          if (source._initial)
            Object.assign(properties, source._initial);
          this.nodes = source.nodes;
          source.node = this;
          if (graph) {
            source.nodes.forEach((n) => {
              if (!graph.nodes.get(n.tag)) {
                graph.nodes.set(n.tag, n);
                graph.nNodes++;
              }
            });
          }
        }
        if (properties.tag && (graph || parentNode)) {
          let hasnode;
          if (graph?.nodes) {
            hasnode = graph.nodes.get(properties.tag);
          }
          if (!hasnode && parentNode?.nodes) {
            hasnode = parentNode.nodes.get(properties.tag);
          }
          if (hasnode) {
            this.merge(hasnode);
            if (!this.source)
              this.source = hasnode;
            let props = hasnode.getProps();
            delete props.graph;
            delete props.parent;
            for (let k in props)
              properties[k] = props[k];
          }
        }
        if (properties?.operator) {
          properties.operator = this.setOperator(properties.operator);
        }
        if (!properties.tag && graph) {
          properties.tag = `node${graph.nNodes}`;
        } else if (!properties.tag) {
          properties.tag = `node${Math.floor(Math.random() * 1e10)}`;
        }
        let keys = Object.getOwnPropertyNames(this);
        for (const key in properties) {
          if (!keys.includes(key))
            this._initial[key] = properties[key];
        }
        if (properties.children)
          this._initial.children = Object.assign({}, properties.children);
        this.merge(properties);
        if (!this.tag) {
          if (graph) {
            this.tag = `node${graph.nNodes}`;
          } else {
            this.tag = `node${Math.floor(Math.random() * 1e10)}`;
          }
        }
        if (graph) {
          this.graph = graph;
          if (graph.nodes.get(this.tag)) {
            this.tag = `${this.tag}${graph.nNodes + 1}`;
          }
          graph.nodes.set(this.tag, this);
          graph.nNodes++;
        }
        if (parentNode) {
          this.parent = parentNode;
          if (parentNode instanceof GraphNode || parentNode instanceof Graph)
            parentNode.nodes.set(this.tag, this);
        }
        if (typeof properties.tree === "object") {
          for (const key in properties.tree) {
            if (typeof properties.tree[key] === "object") {
              if ((!properties.tree[key]).tag) {
                properties.tree[key].tag = key;
              }
            }
            let node = new GraphNode(properties.tree[key], this, graph);
            this.nodes.set(node.tag, node);
          }
        }
        if (this.children)
          this.convertChildrenToNodes(this);
        if (this.parent instanceof GraphNode || this.parent instanceof Graph)
          this.checkNodesHaveChildMapped(this.parent, this);
        if (typeof this.oncreate === "function")
          this.oncreate(this);
        if (!this.firstRun)
          this.firstRun = true;
      } else
        return properties;
    }
  };
  var Graph = class {
    constructor(tree, tag, props) {
      this.nNodes = 0;
      this.nodes = /* @__PURE__ */ new Map();
      this.state = state;
      this._state = {};
      this.tree = {};
      this.merge = merge;
      this.add = (n = {}) => {
        let props = n;
        if (!(n instanceof GraphNode))
          n = new GraphNode(props, this, this);
        else {
          this.nNodes = this.nodes.size;
          if (n.tag) {
            this.tree[n.tag] = props;
            this.nodes.set(n.tag, n);
          }
        }
        return n;
      };
      this.setTree = (tree = this.tree) => {
        if (!tree)
          return;
        for (const node in tree) {
          const n = this.nodes.get(node);
          if (!n) {
            if (typeof tree[node] === "function") {
              this.add({ tag: node, operator: tree[node] });
            } else if (typeof tree[node] === "object" && !Array.isArray(tree[node])) {
              if (!tree[node].tag)
                tree[node].tag = node;
              let newNode = this.add(tree[node]);
              if (tree[node].aliases) {
                tree[node].aliases.forEach((a) => {
                  this.nodes.set(a, newNode);
                });
              }
            } else {
              this.add({ tag: node, operator: (...args) => {
                return tree[node];
              } });
            }
          } else {
            if (typeof tree[node] === "function") {
              n.setOperator(tree[node]);
            } else if (typeof tree[node] === "object") {
              if (tree[node] instanceof GraphNode) {
                this.add(tree[node]);
              } else if (tree[node] instanceof Graph) {
                let source = tree[node];
                let properties = {};
                if (source.operator)
                  properties.operator = source.operator;
                if (source.children)
                  properties.children = source.children;
                if (source.forward)
                  properties.forward = source.forward;
                if (source.backward)
                  properties.backward = source.backward;
                if (source.repeat)
                  properties.repeat = source.repeat;
                if (source.recursive)
                  properties.recursive = source.recursive;
                if (source.loop)
                  properties.loop = source.loop;
                if (source.animate)
                  properties.animate = source.animate;
                if (source.looper)
                  properties.looper = source.looper;
                if (source.animation)
                  properties.animation = source.animation;
                if (source.delay)
                  properties.delay = source.delay;
                if (source.tag)
                  properties.tag = source.tag;
                if (source.oncreate)
                  properties.oncreate = source.oncreate;
                if (source.node?._initial)
                  Object.assign(properties, source.node._initial);
                properties.nodes = source.nodes;
                properties.source = source;
                n.setProps(properties);
              } else {
                n.setProps(tree[node]);
              }
            }
          }
        }
        this.nodes.forEach((node) => {
          if (typeof node.children === "object") {
            for (const key in node.children) {
              if (typeof node.children[key] === "string") {
                if (this.nodes.get(node.children[key])) {
                  node.children[key] = this.nodes.get(node.children[key]);
                }
              } else if (node.children[key] === true || typeof node.children[key] === "undefined") {
                if (this.nodes.get(key)) {
                  node.children[key] = this.nodes.get(key);
                }
              }
              if (node.children[key] instanceof GraphNode) {
                node.checkNodesHaveChildMapped(node, node.children[key]);
              }
            }
          }
          if (typeof node.parent === "string") {
            if (this.nodes.get(node.parent)) {
              node.parent = this.nodes.get(node.parent);
              node.nodes.set(node.parent.tag, node.parent);
            }
          }
        });
      };
      this.get = (tag) => {
        return this.nodes.get(tag);
      };
      this.set = (n) => {
        return this.nodes.set(n.tag, n);
      };
      this.run = (n, ...args) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n?.run)
          return n.run(...args);
        else
          return void 0;
      };
      this.runAsync = (n, ...args) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n?.run)
          return new Promise((res, rej) => {
            res(n.run(...args));
          });
        else
          return new Promise((res, rej) => {
            res(void 0);
          });
      };
      this.removeTree = (n, checked) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n?.nodes) {
          if (!checked)
            checked = {};
          const recursivelyRemove = (node) => {
            if (node.children && !checked[node.tag]) {
              checked[node.tag] = true;
              if (Array.isArray(node.children)) {
                node.children.forEach((c) => {
                  if (c.stopNode)
                    c.stopNode();
                  if (c.tag) {
                    if (this.nodes.get(c.tag))
                      this.nodes.delete(c.tag);
                  }
                  this.nodes.forEach((n2) => {
                    if (n2.nodes.get(c.tag))
                      n2.nodes.delete(c.tag);
                  });
                  recursivelyRemove(c);
                });
              } else if (typeof node.children === "object") {
                if (node.stopNode)
                  node.stopNode();
                if (node.tag) {
                  if (this.nodes.get(node.tag))
                    this.nodes.delete(node.tag);
                }
                this.nodes.forEach((n2) => {
                  if (n2.nodes.get(node.tag))
                    n2.nodes.delete(node.tag);
                });
                recursivelyRemove(node);
              }
            }
          };
          if (n.stopNode)
            n.stopNode();
          if (n.tag) {
            this.nodes.delete(n.tag);
            this.nodes.forEach((n2) => {
              if (n2.nodes.get(n2.tag))
                n2.nodes.delete(n2.tag);
            });
            this.nNodes = this.nodes.size;
            recursivelyRemove(n);
          }
          if (n.ondelete)
            n.ondelete(n);
        }
        return n;
      };
      this.remove = (n) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n?.nodes) {
          if (n.stopNode)
            n.stopNode();
          if (n?.tag) {
            if (this.nodes.get(n.tag)) {
              this.nodes.delete(n.tag);
              this.nodes.forEach((n2) => {
                if (n2.nodes.get(n2.tag))
                  n2.nodes.delete(n2.tag);
              });
            }
          }
          if (n.ondelete)
            n.ondelete(n);
        }
        return n;
      };
      this.append = (n, parentNode) => {
        parentNode.addChildren(n);
      };
      this.callParent = async (n, ...args) => {
        if (n?.parent) {
          return await n.callParent(...args);
        }
      };
      this.callChildren = async (n, ...args) => {
        if (n?.children) {
          return await n.callChildren(...args);
        }
      };
      this.subscribe = (n, callback) => {
        if (!callback)
          return;
        if (n?.subscribe && typeof callback === "function") {
          return n.subscribe(callback);
        } else if (callback instanceof GraphNode || typeof callback === "string")
          return this.subscribeNode(n, callback);
        else if (typeof n == "string") {
          return this.state.subscribeTrigger(n, callback);
        }
      };
      this.unsubscribe = (tag, sub) => {
        return this.state.unsubscribeTrigger(tag, sub);
      };
      this.subscribeNode = (inputNode, outputNode) => {
        let tag;
        if (inputNode?.tag)
          tag = inputNode.tag;
        else if (typeof inputNode === "string")
          tag = inputNode;
        if (typeof outputNode === "string")
          outputNode = this.nodes.get(outputNode);
        if (inputNode && outputNode) {
          let sub = this.state.subscribeTrigger(tag, (res) => {
            if (Array.isArray(res))
              outputNode.run(...res);
            else
              outputNode.run(res);
          });
          return sub;
        }
      };
      this.stopNode = (n) => {
        if (typeof n === "string") {
          n = this.nodes.get(n);
        }
        if (n?.stopNode) {
          n.stopNode();
        }
      };
      this.print = (n, printChildren = true) => {
        if (n?.print)
          return n.print(n, printChildren);
        else {
          let printed = `{`;
          this.nodes.forEach((n2) => {
            printed += `
"${n2.tag}:${n2.print(n2, printChildren)}"`;
          });
          return printed;
        }
      };
      this.reconstruct = (json) => {
        let parsed = reconstructObject(json);
        if (parsed)
          return this.add(parsed);
      };
      this.create = (operator, parentNode, props) => {
        return createNode(operator, parentNode, props, this);
      };
      this.setState = this.state.setState;
      this.DEBUGNODES = (debugging = true) => {
        this.nodes.forEach((n) => {
          if (debugging)
            n.DEBUGNODE = true;
          else
            n.DEBUGNODE = false;
        });
      };
      this.tag = tag ? tag : `graph${Math.floor(Math.random() * 1e11)}`;
      if (props) {
        this.merge(props);
        this._initial = props;
      }
      if (tree || Object.keys(this.tree).length > 0)
        this.setTree(tree);
    }
  };
  function reconstructObject(json = "{}") {
    try {
      let parsed = typeof json === "string" ? JSON.parse(json) : json;
      const parseObj = (obj) => {
        for (const prop in obj) {
          if (typeof obj[prop] === "string") {
            let funcParsed = parseFunctionFromText(obj[prop]);
            if (typeof funcParsed === "function") {
              obj[prop] = funcParsed;
            }
          } else if (typeof obj[prop] === "object") {
            parseObj(obj[prop]);
          }
        }
        return obj;
      };
      return parseObj(parsed);
    } catch (err) {
      console.error(err);
      return void 0;
    }
  }
  var stringifyWithCircularRefs = function() {
    const refs = /* @__PURE__ */ new Map();
    const parents = [];
    const path = ["this"];
    function clear() {
      refs.clear();
      parents.length = 0;
      path.length = 1;
    }
    function updateParents(key, value) {
      var idx = parents.length - 1;
      var prev = parents[idx];
      if (typeof prev === "object") {
        if (prev[key] === value || idx === 0) {
          path.push(key);
          parents.push(value.pushed);
        } else {
          while (idx-- >= 0) {
            prev = parents[idx];
            if (typeof prev === "object") {
              if (prev[key] === value) {
                idx += 2;
                parents.length = idx;
                path.length = idx;
                --idx;
                parents[idx] = value;
                path[idx] = key;
                break;
              }
            }
            idx--;
          }
        }
      }
    }
    function checkCircular(key, value) {
      if (value != null) {
        if (typeof value === "object") {
          if (key) {
            updateParents(key, value);
          }
          let other = refs.get(value);
          if (other) {
            return "[Circular Reference]" + other;
          } else {
            refs.set(value, path.join("."));
          }
        }
      }
      return value;
    }
    return function stringifyWithCircularRefs2(obj, space) {
      try {
        parents.push(obj);
        return JSON.stringify(obj, checkCircular, space);
      } finally {
        clear();
      }
    };
  }();
  if (JSON.stringifyWithCircularRefs === void 0) {
    JSON.stringifyWithCircularRefs = stringifyWithCircularRefs;
  }
  var stringifyFast = function() {
    const refs = /* @__PURE__ */ new Map();
    const parents = [];
    const path = ["this"];
    function clear() {
      refs.clear();
      parents.length = 0;
      path.length = 1;
    }
    function updateParents(key, value) {
      var idx = parents.length - 1;
      if (parents[idx]) {
        var prev = parents[idx];
        if (typeof prev === "object") {
          if (prev[key] === value || idx === 0) {
            path.push(key);
            parents.push(value.pushed);
          } else {
            while (idx-- >= 0) {
              prev = parents[idx];
              if (typeof prev === "object") {
                if (prev[key] === value) {
                  idx += 2;
                  parents.length = idx;
                  path.length = idx;
                  --idx;
                  parents[idx] = value;
                  path[idx] = key;
                  break;
                }
              }
              idx++;
            }
          }
        }
      }
    }
    function checkValues(key, value) {
      let val;
      if (value != null) {
        if (typeof value === "object") {
          let c = value.constructor.name;
          if (key && c === "Object") {
            updateParents(key, value);
          }
          let other = refs.get(value);
          if (other) {
            return "[Circular Reference]" + other;
          } else {
            refs.set(value, path.join("."));
          }
          if (c === "Array") {
            if (value.length > 20) {
              val = value.slice(value.length - 20);
            } else
              val = value;
          } else if (c.includes("Set")) {
            val = Array.from(value);
          } else if (c !== "Object" && c !== "Number" && c !== "String" && c !== "Boolean") {
            val = "instanceof_" + c;
          } else if (c === "Object") {
            let obj = {};
            for (const prop in value) {
              if (value[prop] == null) {
                obj[prop] = value[prop];
              } else if (Array.isArray(value[prop])) {
                if (value[prop].length > 20)
                  obj[prop] = value[prop].slice(value[prop].length - 20);
                else
                  obj[prop] = value[prop];
              } else if (value[prop].constructor.name === "Object") {
                obj[prop] = {};
                for (const p in value[prop]) {
                  if (Array.isArray(value[prop][p])) {
                    if (value[prop][p].length > 20)
                      obj[prop][p] = value[prop][p].slice(value[prop][p].length - 20);
                    else
                      obj[prop][p] = value[prop][p];
                  } else {
                    if (value[prop][p] != null) {
                      let con = value[prop][p].constructor.name;
                      if (con.includes("Set")) {
                        obj[prop][p] = Array.from(value[prop][p]);
                      } else if (con !== "Number" && con !== "String" && con !== "Boolean") {
                        obj[prop][p] = "instanceof_" + con;
                      } else {
                        obj[prop][p] = value[prop][p];
                      }
                    } else {
                      obj[prop][p] = value[prop][p];
                    }
                  }
                }
              } else {
                let con = value[prop].constructor.name;
                if (con.includes("Set")) {
                  obj[prop] = Array.from(value[prop]);
                } else if (con !== "Number" && con !== "String" && con !== "Boolean") {
                  obj[prop] = "instanceof_" + con;
                } else {
                  obj[prop] = value[prop];
                }
              }
            }
            val = obj;
          } else {
            val = value;
          }
        } else {
          val = value;
        }
      }
      return val;
    }
    return function stringifyFast2(obj, space) {
      parents.push(obj);
      let res = JSON.stringify(obj, checkValues, space);
      clear();
      return res;
    };
  }();
  if (JSON.stringifyFast === void 0) {
    JSON.stringifyFast = stringifyFast;
  }
  function createNode(operator, parentNode, props, graph) {
    if (typeof props === "object") {
      props.operator = operator;
      return new GraphNode(props, parentNode, graph);
    }
    return new GraphNode({ operator }, parentNode, graph);
  }

  // src/graphscript/services/dom/DOMElement.js
  var DOMElement = class extends HTMLElement {
    template = function(self = this, props) {
      return `<div> Custom Fragment Props: ${JSON.stringify(props)} </div>`;
    };
    props = {};
    useShadow = false;
    styles;
    oncreate;
    onresize;
    ondelete;
    onchanged;
    renderonchanged = false;
    FRAGMENT;
    STYLE;
    attachedShadow = false;
    obsAttributes = ["props", "options", "onchanged", "onresize", "ondelete", "oncreate", "template"];
    get observedAttributes() {
      return this.obsAttributes;
    }
    get obsAttributes() {
      return this.obsAttributes;
    }
    set obsAttributes(att) {
      if (typeof att === "string") {
        this.obsAttributes.push(att);
      } else if (Array.isArray(att))
        this.obsAttributes = att;
    }
    static get tag() {
      return this.name.toLowerCase() + "-";
    }
    static addElement(tag = this.tag, cls = this, extend = void 0) {
      addCustomElement(cls, tag, extend);
    }
    attributeChangedCallback = (name, old, val) => {
      if (name === "onchanged") {
        let onchanged = val;
        if (typeof onchanged === "string")
          onchanged = parseFunctionFromText2(onchanged);
        if (typeof onchanged === "function") {
          this.onchanged = onchanged;
          this.state.data.props = this.props;
          this.state.unsubscribeTrigger("props");
          this.state.subscribeTrigger("props", this.onchanged);
          let changed = new CustomEvent("changed", { detail: { props: this.props, self: this } });
          this.state.subscribeTrigger("props", () => {
            this.dispatchEvent(changed);
          });
        }
      } else if (name === "onresize") {
        let onresize = val;
        if (typeof onresize === "string")
          onresize = parseFunctionFromText2(onresize);
        if (typeof onresize === "function") {
          if (this.ONRESIZE) {
            try {
              window.removeEventListener("resize", this.ONRESIZE);
            } catch (err) {
            }
          }
          this.ONRESIZE = (ev) => {
            this.onresize(this.props, this);
          };
          this.onresize = onresize;
          window.addEventListener("resize", this.ONRESIZE);
        }
      } else if (name === "ondelete") {
        let ondelete = val;
        if (typeof ondelete === "string")
          ondelete = parseFunctionFromText2(ondelete);
        if (typeof ondelete === "function") {
          this.ondelete = () => {
            if (this.ONRESIZE)
              window.removeEventListener("resize", this.ONRESIZE);
            this.state.unsubscribeTrigger("props");
            if (ondelete)
              ondelete(this.props, this);
          };
        }
      } else if (name === "oncreate") {
        let oncreate = val;
        if (typeof oncreate === "string")
          oncreate = parseFunctionFromText2(oncreate);
        if (typeof oncreate === "function") {
          this.oncreate = oncreate;
        }
      } else if (name === "renderonchanged") {
        let rpc = val;
        if (typeof this.renderonchanged === "number")
          this.unsubscribeTrigger(this.renderonchanged);
        if (typeof rpc === "string")
          rpc = parseFunctionFromText2(rpc);
        if (typeof rpc === "function") {
          this.renderonchanged = this.state.subscribeTrigger("props", (p) => {
            this.render(p);
            rpc(this, p);
          });
        } else if (rpc != false)
          this.renderonchanged = this.state.subscribeTrigger("props", this.render);
      } else if (name === "props") {
        let newProps = val;
        if (typeof newProps === "string")
          newProps = JSON.parse(newProps);
        Object.assign(this.props, newProps);
        this.state.setState({ props: this.props });
      } else if (name === "template") {
        let template = val;
        this.template = template;
        this.render(this.props);
        let created = new CustomEvent("created", { detail: { props: this.props } });
        this.dispatchEvent(created);
      } else {
        let parsed = val;
        if (name.includes("eval_")) {
          name = name.split("_");
          name.shift();
          name = name.join();
          parsed = parseFunctionFromText2(val);
        } else if (typeof val === "string") {
          try {
            parsed = JSON.parse(val);
          } catch (err) {
            parsed = val;
          }
        }
        this[name] = parsed;
        if (name !== "props" && this.props)
          this.props[name] = parsed;
      }
    };
    connectedCallback() {
      if (!this.props)
        this.props = {};
      let newProps = this.getAttribute("props");
      if (typeof newProps === "string")
        newProps = JSON.parse(newProps);
      Object.assign(this.props, newProps);
      this.state.setState({ props: this.props });
      Array.from(this.attributes).forEach((att) => {
        let name = att.name;
        let parsed = att.value;
        if (name.includes("eval_") || name.includes("()")) {
          if (name.includes("eval_"))
            name = name.split("_");
          else if (name.includes("()"))
            name = name.substring(0, name.indexOf("("));
          name.shift();
          name = name.join();
          parsed = parseFunctionFromText2(att.value);
        } else if (typeof att.value === "string") {
          try {
            parsed = JSON.parse(att.value);
          } catch (err) {
            parsed = att.value;
          }
        }
        if (!this[name]) {
          Object.defineProperties(this, att, {
            value: parsed,
            writable: true,
            get() {
              return this[name];
            },
            set(val) {
              this.setAttribute(name, val);
            }
          });
        }
        this[name] = parsed;
        if (name !== "props")
          this.props[name] = parsed;
        this.obsAttributes.push(name);
      });
      let resizeevent = new CustomEvent("resized", { detail: { props: this.props, self: this } });
      let changed = new CustomEvent("changed", { detail: { props: this.props, self: this } });
      let deleted = new CustomEvent("deleted", { detail: { props: this.props, self: this } });
      let created = new CustomEvent("created", { detail: { props: this.props, self: this } });
      this.render(this.props);
      this.dispatchEvent(created);
      this.state.subscribeTrigger("props", () => {
        this.dispatchEvent(changed);
      });
      if (typeof this.onresize === "function") {
        if (this.ONRESIZE) {
          try {
            window.removeEventListener("resize", this.ONRESIZE);
          } catch (err) {
          }
        }
        this.ONRESIZE = (ev) => {
          this.onresize(this, this.props);
          this.dispatchEvent(resizeevent);
        };
        window.addEventListener("resize", this.ONRESIZE);
      }
      if (typeof this.ondelete === "function") {
        let ondelete = this.ondelete;
        this.ondelete = (props = this.props) => {
          if (this.ONRESIZE)
            window.removeEventListener("resize", this.ONRESIZE);
          this.state.unsubscribeTrigger("props");
          this.dispatchEvent(deleted);
          ondelete(this, props);
        };
      }
      if (typeof this.onchanged === "function") {
        this.state.data.props = this.props;
        this.state.subscribeTrigger("props", this.onchanged);
      }
      if (this.renderonchanged) {
        let rpc = this.renderonchanged;
        if (typeof this.renderonchanged === "number")
          this.unsubscribeTrigger(this.renderonchanged);
        if (typeof rpc === "string")
          rpc = parseFunctionFromText2(rpc);
        if (typeof rpc === "function") {
          this.renderonchanged = this.state.subscribeTrigger("props", (p) => {
            this.render(p);
            rpc(this, p);
          });
        } else if (rpc !== false)
          this.renderonchanged = this.state.subscribeTrigger("props", this.render);
      }
    }
    constructor() {
      super();
    }
    delete = () => {
      this.remove();
      if (typeof this.ondelete === "function")
        this.ondelete(this.props);
    };
    render = (props = this.props) => {
      if (typeof this.template === "function")
        this.templateResult = this.template(this, props);
      else
        this.templateResult = this.template;
      if (this.styles)
        this.templateResult = `<style>${this.styles}</style>${this.templateResult}`;
      const t = document.createElement("template");
      if (typeof this.templateResult === "string")
        t.innerHTML = this.templateResult;
      else if (this.templateResult instanceof HTMLElement) {
        if (this.templateResult.parentNode) {
          this.templateResult.parentNode.removeChild(this.templateResult);
        }
        t.appendChild(this.templateResult);
      }
      const fragment = t.content;
      if (this.FRAGMENT) {
        if (this.useShadow) {
          if (this.STYLE)
            this.shadowRoot.removeChild(this.STYLE);
          this.shadowRoot.removeChild(this.FRAGMENT);
        } else
          this.removeChild(this.FRAGMENT);
      }
      if (this.useShadow) {
        if (!this.attachedShadow) {
          this.attachShadow({ mode: "open" }).innerHTML = "<slot></slot>";
          this.attachedShadow = true;
        }
        if (this.styles) {
          let style = document.createElement("style");
          style.textContent = this.styles;
          this.shadowRoot.prepend(style);
          this.STYLE = style;
        }
        this.shadowRoot.prepend(fragment);
        this.FRAGMENT = this.shadowRoot.childNodes[0];
      } else {
        this.prepend(fragment);
        this.FRAGMENT = this.childNodes[0];
      }
      let rendered = new CustomEvent("rendered", { detail: { props: this.props, self: this } });
      this.dispatchEvent(rendered);
      if (this.oncreate)
        this.oncreate(this, props);
    };
    state = {
      pushToState: {},
      data: {},
      triggers: {},
      setState(updateObj) {
        Object.assign(this.pushToState, updateObj);
        if (Object.keys(this.triggers).length > 0) {
          for (const prop of Object.getOwnPropertyNames(this.triggers)) {
            if (this.pushToState[prop]) {
              this.data[prop] = this.pushToState[prop];
              delete this.pushToState[prop];
              this.triggers[prop].forEach((obj) => {
                obj.onchanged(this.data[prop]);
              });
            }
          }
        }
        return this.pushToState;
      },
      subscribeTrigger(key, onchanged = (res) => {
      }) {
        if (key) {
          if (!this.triggers[key]) {
            this.triggers[key] = [];
          }
          let l = this.triggers[key].length;
          this.triggers[key].push({ idx: l, onchanged });
          return this.triggers[key].length - 1;
        } else
          return void 0;
      },
      unsubscribeTrigger(key, sub) {
        let idx = void 0;
        let triggers = this.triggers[key];
        if (triggers) {
          if (!sub)
            delete this.triggers[key];
          else {
            let obj = triggers.find((o) => {
              if (o.idx === sub) {
                return true;
              }
            });
            if (obj)
              triggers.splice(idx, 1);
            return true;
          }
        }
      },
      subscribeTriggerOnce(key = void 0, onchanged = (value) => {
      }) {
        let sub;
        let changed = (value) => {
          onchanged(value);
          this.unsubscribeTrigger(key, sub);
        };
        sub = this.subscribeTrigger(key, changed);
      }
    };
    get props() {
      return this.props;
    }
    set props(newProps = {}) {
      this.setAttribute("props", newProps);
    }
    get template() {
      return this.template;
    }
    set template(template) {
      this.setAttribute("template", template);
    }
    get render() {
      return this.render;
    }
    get delete() {
      return this.delete;
    }
    get state() {
      return this.state;
    }
    get onchanged() {
      return this.onchanged;
    }
    set onchanged(onchanged) {
      this.setAttribute("onchanged", onchanged);
    }
    get styles() {
      return this.styles;
    }
    set styles(templateStr) {
      this.styles = templateStr;
      if (this.querySelector("style")) {
        this.querySelector("style").innerHTML = templateStr;
      } else {
        this.render();
      }
    }
    get renderonchanged() {
      return this.renderonchanged;
    }
    set renderonchanged(onchanged) {
      this.setAttribute("renderonchanged", onchanged);
    }
    get onresize() {
      return this.props;
    }
    set onresize(onresize) {
      this.setAttribute("onresize", onresize);
    }
    get ondelete() {
      return this.props;
    }
    set ondelete(ondelete) {
      this.setAttribute("ondelete", ondelete);
    }
    get oncreate() {
      return this.oncreate;
    }
    set oncreate(oncreate) {
      this.setAttribute("oncreated", oncreate);
    }
  };
  function addCustomElement(cls, tag, extend = null) {
    try {
      if (extend) {
        if (tag)
          window.customElements.define(tag, cls, { extends: extend });
        else
          window.customElements.define(cls.name.toLowerCase() + "-", cls, { extends: extend });
      } else {
        if (tag)
          window.customElements.define(tag, cls);
        else
          window.customElements.define(cls.name.toLowerCase() + "-", cls);
      }
    } catch (err) {
    }
  }
  function parseFunctionFromText2(method) {
    let getFunctionBody = (methodString) => {
      return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, "$2$3$4");
    };
    let getFunctionHead = (methodString) => {
      let startindex = methodString.indexOf(")");
      return methodString.slice(0, methodString.indexOf("{", startindex) + 1);
    };
    let newFuncHead = getFunctionHead(method);
    let newFuncBody = getFunctionBody(method);
    let newFunc;
    try {
      if (newFuncHead.includes("function")) {
        let varName = newFuncHead.split("(")[1].split(")")[0];
        newFunc = new Function(varName, newFuncBody);
      } else {
        if (newFuncHead.substring(0, 6) === newFuncBody.substring(0, 6)) {
          let varName = newFuncHead.split("(")[1].split(")")[0];
          newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf("{") + 1, newFuncBody.length - 1));
        } else {
          try {
            newFunc = (0, eval)(newFuncHead + newFuncBody + "}");
          } catch (err) {
            newFunc = (0, eval)(method);
          }
        }
      }
    } catch (err) {
    }
    return newFunc;
  }

  // src/graphscript/services/Service.ts
  var Service = class extends Graph {
    constructor(options = {}) {
      super(void 0, options.name ? options.name : `service${Math.floor(Math.random() * 1e14)}`, options.props);
      this.routes = {};
      this.loadDefaultRoutes = false;
      this.keepState = true;
      this.firstLoad = true;
      this.init = (options) => {
        if (options)
          options = Object.assign({}, options);
        else
          options = {};
        if (options.customRoutes)
          Object.assign(options.customRoutes, this.customRoutes);
        else
          options.customRoutes = this.customRoutes;
        if (options.customChildren)
          Object.assign(options.customChildren, this.customChildren);
        else
          options.customChildren = this.customChildren;
        if (Array.isArray(options.routes)) {
          options.routes.forEach((r) => {
            this.load(r, options.includeClassName, options.routeFormat, options.customRoutes, options.customChildren);
          });
        } else if (options.routes || (Object.keys(this.routes).length > 0 || this.loadDefaultRoutes) && this.firstLoad)
          this.load(options.routes, options.includeClassName, options.routeFormat, options.customRoutes, options.customChildren);
      };
      this.load = (routes, includeClassName = true, routeFormat = ".", customRoutes, customChildren) => {
        if (!routes && !this.loadDefaultRoutes && (Object.keys(this.routes).length > 0 || this.firstLoad))
          return;
        if (this.firstLoad)
          this.firstLoad = false;
        if (customRoutes)
          customRoutes = Object.assign(this.customRoutes, customRoutes);
        else
          customRoutes = this.customRoutes;
        if (customChildren)
          customChildren = Object.assign(this.customChildren, customChildren);
        let service;
        let allRoutes = {};
        if (routes) {
          if (!(routes instanceof Graph) && routes?.name) {
            if (routes.module) {
              let mod = routes;
              routes = {};
              Object.getOwnPropertyNames(routes.module).forEach((prop) => {
                if (includeClassName)
                  routes[mod.name + routeFormat + prop] = routes.module[prop];
                else
                  routes[prop] = routes.module[prop];
              });
            } else if (typeof routes === "function") {
              service = new routes({ loadDefaultRoutes: this.loadDefaultRoutes });
              service.load();
              routes = service.routes;
            }
          } else if (routes instanceof Graph || routes.source instanceof Graph) {
            service = routes;
            routes = {};
            let name;
            if (includeClassName) {
              name = service.name;
              if (!name) {
                name = service.tag;
                service.name = name;
              }
              if (!name) {
                name = `graph${Math.floor(Math.random() * 1e15)}`;
                service.name = name;
                service.tag = name;
              }
            }
            if (service.customRoutes && !this.customRoutes)
              this.customRoutes = service.customRoutes;
            else if (service.customRoutes && this.customRoutes)
              Object.assign(this.customRoutes, service.customRoutes);
            if (service.customChildren && !this.customChildren)
              this.customChildren = service.customChildren;
            else if (service.customChildren && this.customChildren)
              Object.assign(this.customChildren, service.customChildren);
            service.nodes.forEach((node) => {
              routes[node.tag] = node;
              let checked = {};
              let checkChildGraphNodes = (nd, par) => {
                if (!checked[nd.tag] || par && includeClassName && !checked[par?.tag + routeFormat + nd.tag]) {
                  if (!par)
                    checked[nd.tag] = true;
                  else
                    checked[par.tag + routeFormat + nd.tag] = true;
                  if (nd instanceof Graph || nd.source instanceof Graph) {
                    if (includeClassName) {
                      let nm = nd.name;
                      if (!nm) {
                        nm = nd.tag;
                        nd.name = nm;
                      }
                      if (!nm) {
                        nm = `graph${Math.floor(Math.random() * 1e15)}`;
                        nd.name = nm;
                        nd.tag = nm;
                      }
                    }
                    nd.nodes.forEach((n) => {
                      if (includeClassName && !routes[nd.tag + routeFormat + n.tag])
                        routes[nd.tag + routeFormat + n.tag] = n;
                      else if (!routes[n.tag])
                        routes[n.tag] = n;
                      checkChildGraphNodes(n, nd);
                    });
                  }
                }
              };
              checkChildGraphNodes(node);
            });
          } else if (typeof routes === "object") {
            let name = routes.constructor.name;
            if (name === "Object") {
              name = Object.prototype.toString.call(routes);
              if (name)
                name = name.split(" ")[1];
              if (name)
                name = name.split("]")[0];
            }
            if (name && name !== "Object") {
              let module = routes;
              routes = {};
              Object.getOwnPropertyNames(module).forEach((route) => {
                if (includeClassName)
                  routes[name + routeFormat + route] = module[route];
                else
                  routes[route] = module[route];
              });
            }
          }
          if (service instanceof Graph && service.name && includeClassName) {
            routes = Object.assign({}, routes);
            for (const prop in routes) {
              let route = routes[prop];
              delete routes[prop];
              routes[service.name + routeFormat + prop] = route;
            }
          }
        }
        if (this.loadDefaultRoutes) {
          let rts = Object.assign({}, this.defaultRoutes);
          if (routes) {
            Object.assign(rts, this.routes);
            routes = Object.assign(rts, routes);
          } else
            routes = Object.assign(rts, this.routes);
          this.loadDefaultRoutes = false;
        }
        if (!routes)
          routes = this.routes;
        let incr = 0;
        for (const tag in routes) {
          incr++;
          let childrenIter = (route, routeKey) => {
            if (typeof route === "object") {
              if (!route.tag)
                route.tag = routeKey;
              if (typeof route?.children === "object") {
                nested:
                  for (const key in route.children) {
                    incr++;
                    if (typeof route.children[key] === "object") {
                      let rt = route.children[key];
                      if (rt.tag && allRoutes[rt.tag])
                        continue;
                      if (customChildren) {
                        for (const k2 in customChildren) {
                          rt = customChildren[k2](rt, key, route, routes, allRoutes);
                          if (!rt)
                            continue nested;
                        }
                      }
                      if (rt.id && !rt.tag) {
                        rt.tag = rt.id;
                      }
                      let k;
                      if (rt.tag) {
                        if (allRoutes[rt.tag]) {
                          let randkey = `${rt.tag}${incr}`;
                          allRoutes[randkey] = rt;
                          rt.tag = randkey;
                          childrenIter(allRoutes[randkey], key);
                          k = randkey;
                        } else {
                          allRoutes[rt.tag] = rt;
                          childrenIter(allRoutes[rt.tag], key);
                          k = rt.tag;
                        }
                      } else {
                        if (allRoutes[key]) {
                          let randkey = `${key}${incr}`;
                          allRoutes[randkey] = rt;
                          rt.tag = randkey;
                          childrenIter(allRoutes[randkey], key);
                          k = randkey;
                        } else {
                          allRoutes[key] = rt;
                          childrenIter(allRoutes[key], key);
                          k = key;
                        }
                      }
                      if (service?.name && includeClassName) {
                        allRoutes[service.name + routeFormat + k] = rt;
                        delete allRoutes[k];
                      } else
                        allRoutes[k] = rt;
                    }
                  }
              }
            }
          };
          allRoutes[tag] = routes[tag];
          childrenIter(routes[tag], tag);
        }
        top:
          for (const route in allRoutes) {
            if (typeof allRoutes[route] === "object") {
              let r = allRoutes[route];
              if (typeof r === "object") {
                if (customRoutes) {
                  for (const key in customRoutes) {
                    r = customRoutes[key](r, route, allRoutes);
                    if (!r)
                      continue top;
                  }
                }
                if (r.get) {
                  if (typeof r.get == "object") {
                  }
                }
                if (r.post) {
                }
                if (r.delete) {
                }
                if (r.put) {
                }
                if (r.head) {
                }
                if (r.patch) {
                }
                if (r.options) {
                }
                if (r.connect) {
                }
                if (r.trace) {
                }
                if (r.post && !r.operator) {
                  allRoutes[route].operator = r.post;
                } else if (!r.operator && typeof r.get == "function") {
                  allRoutes[route].operator = r.get;
                }
              }
            }
          }
        for (const route in routes) {
          if (typeof routes[route] === "object") {
            if (this.routes[route]) {
              if (typeof this.routes[route] === "object")
                Object.assign(this.routes[route], routes[route]);
              else
                this.routes[route] = routes[route];
            } else
              this.routes[route] = routes[route];
          } else if (this.routes[route]) {
            if (typeof this.routes[route] === "object")
              Object.assign(this.routes[route], routes[route]);
            else
              this.routes[route] = routes[route];
          } else
            this.routes[route] = routes[route];
        }
        if (service) {
          for (const key in this.routes) {
            if (this.routes[key] instanceof GraphNode) {
              this.nodes.set(key, this.routes[key]);
              this.nNodes = this.nodes.size;
            }
          }
        } else
          this.setTree(this.routes);
        for (const prop in this.routes) {
          if (this.routes[prop]?.aliases) {
            let aliases = this.routes[prop].aliases;
            aliases.forEach((a) => {
              if (service?.name && includeClassName)
                routes[service.name + routeFormat + a] = this.routes[prop];
              else
                routes[a] = this.routes[prop];
            });
          }
        }
        return this.routes;
      };
      this.unload = (routes = this.routes) => {
        if (!routes)
          return;
        let service;
        if (!(routes instanceof Service) && typeof routes === "function") {
          service = new Service();
          routes = service.routes;
        } else if (routes instanceof Service) {
          routes = routes.routes;
        }
        for (const r in routes) {
          delete this.routes[r];
          if (this.nodes.get(r))
            this.remove(r);
        }
        return this.routes;
      };
      this.handleMethod = (route, method, args) => {
        let m = method.toLowerCase();
        let src = this.nodes.get(route);
        if (!src) {
          src = this.routes[route];
          if (!src)
            src = this.tree[route];
        }
        if (src?.[m]) {
          if (!(src[m] instanceof Function)) {
            if (args)
              src[m] = args;
            return src[m];
          } else
            return src[m](args);
        } else
          return this.handleServiceMessage({ route, args, method });
      };
      this.transmit = (...args) => {
        if (typeof args[0] === "object") {
          if (args[0].method) {
            return this.handleMethod(args[0].route, args[0].method, args[0].args);
          } else if (args[0].route) {
            return this.handleServiceMessage(args[0]);
          } else if (args[0].node) {
            return this.handleGraphNodeCall(args[0].node, args[0].args);
          } else if (this.keepState) {
            if (args[0].route)
              this.setState({ [args[0].route]: args[0].args });
            if (args[0].node)
              this.setState({ [args[0].node]: args[0].args });
          }
          return args;
        } else
          return args;
      };
      this.receive = (...args) => {
        if (args[0]) {
          if (typeof args[0] === "string") {
            let substr = args[0].substring(0, 8);
            if (substr.includes("{") || substr.includes("[")) {
              if (substr.includes("\\"))
                args[0] = args[0].replace(/\\/g, "");
              if (args[0][0] === '"') {
                args[0] = args[0].substring(1, args[0].length - 1);
              }
              ;
              args[0] = JSON.parse(args[0]);
            }
          }
        }
        if (typeof args[0] === "object") {
          if (args[0].method) {
            return this.handleMethod(args[0].route, args[0].method, args[0].args);
          } else if (args[0].route) {
            return this.handleServiceMessage(args[0]);
          } else if (args[0].node) {
            return this.handleGraphNodeCall(args[0].node, args[0].args);
          } else if (this.keepState) {
            if (args[0].route)
              this.setState({ [args[0].route]: args[0].args });
            if (args[0].node)
              this.setState({ [args[0].node]: args[0].args });
          }
          return args;
        } else
          return args;
      };
      this.pipe = (source, destination, endpoint, method, callback) => {
        if (source instanceof GraphNode) {
          if (callback)
            return source.subscribe((res) => {
              let mod = callback(res);
              if (mod !== void 0)
                this.transmit({ route: destination, args: mod, method });
              else
                this.transmit({ route: destination, args: res, method }, endpoint);
            });
          else
            return this.subscribe(source, (res) => {
              this.transmit({ route: destination, args: res, method }, endpoint);
            });
        } else if (typeof source === "string")
          return this.subscribe(source, (res) => {
            this.transmit({ route: destination, args: res, method }, endpoint);
          });
      };
      this.pipeOnce = (source, destination, endpoint, method, callback) => {
        if (source instanceof GraphNode) {
          if (callback)
            return source.state.subscribeTriggerOnce(source.tag, (res) => {
              let mod = callback(res);
              if (mod !== void 0)
                this.transmit({ route: destination, args: mod, method });
              else
                this.transmit({ route: destination, args: res, method }, endpoint);
            });
          else
            return this.state.subscribeTriggerOnce(source.tag, (res) => {
              this.transmit({ route: destination, args: res, method }, endpoint);
            });
        } else if (typeof source === "string")
          return this.state.subscribeTriggerOnce(source, (res) => {
            this.transmit({ route: destination, args: res, method }, endpoint);
          });
      };
      this.terminate = (...args) => {
        this.nodes.forEach((n) => {
          n.stopNode();
        });
      };
      this.recursivelyAssign = (target, obj) => {
        for (const key in obj) {
          if (typeof obj[key] === "object") {
            if (typeof target[key] === "object")
              this.recursivelyAssign(target[key], obj[key]);
            else
              target[key] = this.recursivelyAssign({}, obj[key]);
          } else
            target[key] = obj[key];
        }
        return target;
      };
      this.defaultRoutes = {
        "/": {
          get: () => {
            return this.print();
          },
          aliases: [""]
        },
        ping: () => {
          console.log("ping");
          return "pong";
        },
        echo: (...args) => {
          this.transmit(...args);
          return args;
        },
        assign: (source) => {
          if (typeof source === "object") {
            Object.assign(this, source);
            return true;
          }
          return false;
        },
        recursivelyAssign: (source) => {
          if (typeof source === "object") {
            this.recursivelyAssign(this, source);
            return true;
          }
          return false;
        },
        log: {
          post: (...args) => {
            console.log("Log: ", ...args);
          },
          aliases: ["info"]
        },
        error: (message) => {
          let er = new Error(message);
          console.error(message);
          return er;
        },
        state: (key) => {
          if (key) {
            return this.state.data[key];
          } else
            return this.state.data;
        },
        printState: (key) => {
          if (key) {
            return stringifyWithCircularRefs(this.state.data[key]);
          } else
            return stringifyWithCircularRefs(this.state.data);
        },
        spliceTypedArray: this.spliceTypedArray,
        transmit: this.transmit,
        receive: this.receive,
        load: this.load,
        unload: this.unload,
        pipe: this.pipe,
        terminate: this.terminate,
        run: this.run,
        subscribe: this.subscribe,
        subscribeNode: this.subscribeNode,
        unsubscribe: this.unsubscribe,
        stopNode: this.stopNode,
        get: this.get,
        add: this.add,
        remove: this.remove,
        setTree: this.setTree,
        setState: this.setState,
        print: this.print,
        reconstruct: this.reconstruct,
        handleMethod: this.handleMethod,
        handleServiceMessage: this.handleServiceMessage,
        handleGraphNodeCall: this.handleGraphNodeCall
      };
      if (options.name)
        this.name = options.name;
      else
        options.name = this.tag;
      if ("loadDefaultRoutes" in options) {
        this.loadDefaultRoutes = options.loadDefaultRoutes;
        this.routes = Object.assign(this.defaultRoutes, this.routes);
      }
      if (options || Object.keys(this.routes).length > 0)
        this.init(options);
    }
    handleServiceMessage(message) {
      let call;
      if (typeof message === "object") {
        if (message.route)
          call = message.route;
        else if (message.node)
          call = message.node;
      }
      if (call) {
        if (Array.isArray(message.args))
          return this.run(call, ...message.args);
        else
          return this.run(call, message.args);
      } else
        return message;
    }
    handleGraphNodeCall(route, args) {
      if (!route)
        return args;
      if (args?.args) {
        this.handleServiceMessage(args);
      } else if (Array.isArray(args))
        return this.run(route, ...args);
      else
        return this.run(route, args);
    }
    isTypedArray(x) {
      return ArrayBuffer.isView(x) && Object.prototype.toString.call(x) !== "[object DataView]";
    }
    spliceTypedArray(arr, start2, end) {
      let s = arr.subarray(0, start2);
      let e;
      if (end) {
        e = arr.subarray(end + 1);
      }
      let n;
      if (s.length > 0 || e?.length > 0)
        n = new arr.constructor(s.length + e.length);
      if (s.length > 0)
        n.set(s);
      if (e && e.length > 0)
        n.set(e, s.length);
      return n;
    }
  };

  // src/graphscript/services/dom/DOM.service.ts
  var DOMService = class extends Service {
    constructor(options, parentNode, interpreters) {
      super({ props: options?.props, name: options?.name ? options.name : `dom${Math.floor(Math.random() * 1e15)}` });
      this.loadDefaultRoutes = false;
      this.keepState = true;
      this.parentNode = document.body;
      this.interpreters = {
        md: (template, options) => {
          if (typeof markdownit === "undefined") {
            document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/markdown-it@latest/dist/markdown-it.min.js'><\/script>`);
          }
          let md = globalThis.markdownit();
          let html = md.render(template);
          options.template = html;
        },
        jsx: (template, options) => {
          if (!options.parentNode)
            options.parentNode = this.parentNode;
          if (typeof options.parentNode === "string")
            options.parentNode = document.getElementById(options.parentNode);
          if (typeof ReactDOM === "undefined") {
            document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/react@latest/umd/react.production.min.js'><\/script>
                    <script src='https://unpkg.com/react-dom@latest/umd/react-dom.production.min.js'><\/script>`);
          }
          options.template = "";
          let onrender = options.onrender;
          options.onrender = (self, info) => {
            const modal = ReactDOM.createPortal(template, options.id);
            onrender(self, info);
          };
        }
      };
      this.customRoutes = {
        "dom": (r, route, routes) => {
          if (r.template) {
            if (!r.tag)
              r.tag = route;
            this.addComponent(r, r.generateChildElementNodes);
          } else if (r.context) {
            if (!r.tag)
              r.tag = route;
            this.addCanvasComponent(r);
          } else if (r.tagName || r.element) {
            if (!r.tag)
              r.tag = route;
            this.addElement(r, r.generateChildElementNodes);
          }
          return r;
        }
      };
      this.customChildren = {
        "dom": (rt, routeKey, route, routes, checked) => {
          if ((route.tag || route.id) && (route.template || route.context || route.tagName || route.element) && (rt.template || rt.context || rt.tagName || rt.element) && !rt.parentNode) {
            if (route.tag)
              rt.parentNode = route.tag;
            if (route.id)
              rt.parentNode = route.id;
          }
          return rt;
        }
      };
      this.elements = {};
      this.components = {};
      this.templates = {};
      this.resolveNode = (element, options) => {
        let node;
        if (this.nodes.get(options.id)?.element?.parentNode?.id === options.parentNode || this.nodes.get(options.id)?.parentNode === options.parentNode) {
          node = this.nodes.get(options.id);
        } else {
          node = new GraphNode(options, options.parentNode ? this.nodes.get(options.parentNode) : this.parentNode, this);
        }
        node.element = element;
        const initialOptions = options._initial ?? options;
        for (let key in initialOptions) {
          if (typeof initialOptions[key] === "function")
            initialOptions[key] = initialOptions[key].bind(node);
          else if (key === "attributes") {
            for (let key2 in initialOptions.attributes) {
              if (typeof initialOptions.attributes[key2] === "function") {
                initialOptions.attributes[key2] = initialOptions.attributes[key2].bind(node);
              }
            }
          }
        }
        return node;
      };
      this.addElement = (options, generateChildElementNodes = false) => {
        let elm = this.createElement(options);
        let oncreate = options.onrender;
        if (!options.element)
          options.element = elm;
        if (!options.operator)
          options.operator = function(props) {
            if (typeof props === "object")
              for (const key in props) {
                if (this.element) {
                  if (typeof this.element[key] === "function" && typeof props[key] !== "function") {
                    if (Array.isArray(props[key]))
                      this.element[key](...props[key]);
                    else
                      this.element[key](props[key]);
                  } else if (key === "style") {
                    Object.assign(this.element[key], props[key]);
                  } else
                    this.element[key] = props[key];
                }
              }
            return props;
          };
        let node = this.resolveNode(elm, options);
        elm.node = node;
        let divs = Array.from(elm.querySelectorAll("*"));
        if (generateChildElementNodes) {
          divs = divs.map((d, i) => this.addElement({ element: d }));
        }
        this.elements[options.id] = { element: elm, node, parentNode: options.parentNode, divs };
        if (!node.ondelete)
          node.ondelete = (node2) => {
            elm.remove();
            if (options.onremove)
              options.onremove(elm, this.elements[options.id]);
          };
        if (options.onresize) {
          let onresize = options.onresize;
          options.onresize = (ev) => {
            onresize(ev, elm, this.elements[options.id]);
          };
          window.addEventListener("resize", options.onresize);
        }
        this.resolveParentNode(elm, options, oncreate);
        return this.elements[options.id];
      };
      this.createElement = (options) => {
        let elm;
        if (options.element) {
          if (typeof options.element === "string") {
            elm = document.querySelector(options.element);
            if (!elm)
              elm = document.getElementById(options.element);
          } else
            elm = options.element;
        } else if (options.tagName)
          elm = document.createElement(options.tagName);
        else if (options.id && document.getElementById(options.id))
          elm = document.getElementById(options.id);
        if (!elm)
          return void 0;
        this.updateOptions(options, elm);
        return elm;
      };
      this.updateOptions = (options, element) => {
        if (!options.id && options.tag)
          options.id = options.tag;
        if (!options.tag && options.id)
          options.tag = options.id;
        if (!options.id)
          options.id = `${options.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
        if (typeof options.parentNode === "string" && document.getElementById(options.parentNode))
          options.parentNode = document.getElementById(options.parentNode);
        if (!options.parentNode) {
          if (!this.parentNode)
            this.parentNode = document.body;
          options.parentNode = this.parentNode;
        }
        element.id = options.id;
        if (options.style)
          Object.assign(element.style, options.style);
        if (options.attributes) {
          for (let key in options.attributes) {
            if (typeof options.attributes[key] === "function")
              element[key] = (...args) => options.attributes[key](...args);
            else
              element[key] = options.attributes[key];
          }
        }
        if (!options.attributes?.innerHTML && options.innerHTML) {
          element.innerHTML = options.innerHTML;
        } else if (!options.attributes?.innerText && options.innerText) {
          element.innerText = options.innerText;
        }
        return options;
      };
      this.addComponent = (options, generateChildElementNodes = true) => {
        if (options.onrender) {
          let oncreate = options.onrender;
          options.onrender = (element) => {
            oncreate(element, options);
          };
        }
        if (options.onresize) {
          let onresize = options.onresize;
          options.onresize = (element) => {
            onresize(element, options);
          };
        }
        if (options.onremove) {
          let ondelete = options.onremove;
          options.onremove = (self) => {
            ondelete(self, options);
          };
        }
        if (typeof options.renderonchanged === "function") {
          let renderonchanged = options.renderonchanged;
          options.renderonchanged = (element) => {
            renderonchanged(element, options);
          };
        }
        if (options.interpreter && options.interpreter !== "wc") {
          this.interpreters[options.interpreter](options.template, options);
        }
        class CustomElement extends DOMElement {
          constructor() {
            super(...arguments);
            this.props = options.props;
            this.styles = options.styles;
            this.useShadow = options.useShadow;
            this.template = options.template;
            this.oncreate = options.onrender;
            this.onresize = options.onresize;
            this.ondelete = options.onremove;
            this.renderonchanged = options.renderonchanged;
          }
        }
        if (!options.tagName)
          options.tagName = `custom-element${Math.random() * 1e15}`;
        CustomElement.addElement(options.tagName);
        let elm = document.createElement(options.tagName);
        let completeOptions = this.updateOptions(options, elm);
        this.templates[completeOptions.id] = completeOptions;
        let divs = Array.from(elm.querySelectorAll("*"));
        if (generateChildElementNodes) {
          divs = divs.map((d) => this.addElement({ element: d }));
        }
        if (!options.element)
          options.element = elm;
        if (!options.operator)
          options.operator = function op(props) {
            if (typeof props === "object")
              for (const key in props) {
                if (this.element) {
                  if (typeof this.element[key] === "function" && typeof props[key] !== "function") {
                    if (Array.isArray(props[key]))
                      this.element[key](...props[key]);
                    else
                      this.element[key](props[key]);
                  } else if (key === "style") {
                    Object.assign(this.element[key], props[key]);
                  } else
                    this.element[key] = props[key];
                }
              }
            return props;
          };
        let node = this.resolveNode(elm, options);
        if (!node.ondelete)
          node.ondelete = (node2) => {
            elm.delete();
          };
        elm.node = node;
        this.components[completeOptions.id] = {
          element: elm,
          class: CustomElement,
          node,
          divs,
          ...completeOptions
        };
        this.resolveParentNode(elm, options);
        return this.components[completeOptions.id];
      };
      this.addCanvasComponent = (options) => {
        if (!options.canvas) {
          options.template = `<canvas `;
          if (options.width)
            options.template += `width="${options.width}"`;
          if (options.height)
            options.template += `height="${options.height}"`;
          options.template += ` ></canvas>`;
        } else
          options.template = options.canvas;
        if (options.onrender) {
          let oncreate = options.onrender;
          options.onrender = (element) => {
            oncreate(element, options);
          };
        }
        if (options.onresize) {
          let onresize = options.onresize;
          options.onresize = (element) => {
            onresize(element, options);
          };
        }
        if (options.ondelete) {
          let ondelete = options.onremove;
          options.onremove = (element) => {
            ondelete(element, options);
          };
        }
        if (typeof options.renderonchanged === "function") {
          let renderonchanged = options.renderonchanged;
          options.renderonchanged = (element) => {
            renderonchanged(element, options);
          };
        }
        class CustomElement extends DOMElement {
          constructor() {
            super(...arguments);
            this.props = options.props;
            this.styles = options.styles;
            this.template = options.template;
            this.oncreate = options.onrender;
            this.onresize = options.onresize;
            this.ondelete = options.onremove;
            this.renderonchanged = options.renderonchanged;
          }
        }
        if (!options.tagName)
          options.tagName = `custom-element${Math.random() * 1e15}`;
        CustomElement.addElement(options.tagName);
        let elm = document.createElement(options.tagName);
        const completeOptions = this.updateOptions(options, elm);
        let animation = () => {
          if (this.components[completeOptions.id]?.animating) {
            this.components[completeOptions.id].draw(this.components[completeOptions.id].element, this.components[completeOptions.id]);
            requestAnimationFrame(animation);
          }
        };
        this.templates[completeOptions.id] = completeOptions;
        if (!options.element)
          options.element = elm;
        if (!options.operator)
          options.operator = function op(props) {
            if (typeof props === "object")
              for (const key in props) {
                if (this.element) {
                  if (typeof this.element[key] === "function" && typeof props[key] !== "function") {
                    if (Array.isArray(props[key]))
                      this.element[key](...props[key]);
                    else
                      this.element[key](props[key]);
                  } else if (key === "style") {
                    Object.assign(this.element[key], props[key]);
                  } else
                    this.element[key] = props[key];
                }
              }
            return props;
          };
        let node = this.resolveNode(elm, options);
        elm.node = node;
        if (!node.ondelete)
          node.ondelete = (node2) => {
            elm.delete();
          };
        let canvas = elm.querySelector("canvas");
        if (completeOptions.style)
          Object.assign(canvas.style, completeOptions.style);
        let context;
        if (typeof completeOptions.context === "object")
          context = options.context;
        else if (typeof completeOptions.context === "string")
          context = canvas.getContext(completeOptions.context);
        this.components[completeOptions.id] = {
          element: elm,
          class: CustomElement,
          template: completeOptions.template,
          canvas,
          node,
          ...completeOptions
        };
        this.components[completeOptions.id].context = context;
        elm.canvas = canvas;
        elm.context = context;
        node.canvas = canvas;
        node.context = context;
        this.resolveParentNode(elm, options);
        node.runAnimation(animation);
        return this.components[completeOptions.id];
      };
      this.resolveParentNode = (elm, options, oncreate) => {
        if (!elm.parentNode) {
          setTimeout(() => {
            if (typeof options.parentNode === "string")
              options.parentNode = document.getElementById(options.parentNode);
            if (typeof options.parentNode === "object") {
              options.parentNode.appendChild(elm);
            }
            if (oncreate)
              oncreate(elm, this.elements[options.id]);
          }, 0.01);
        }
      };
      this.terminate = (element) => {
        if (typeof element === "object") {
          if (element.animating)
            element.animating = false;
          if (element.element)
            element = element.element;
        } else if (typeof element === "string" && this.components[element]) {
          if (this.components[element].node.isAnimating)
            this.components[element].node.stopNode();
          if (this.components[element].divs)
            this.components[element].divs.forEach((d) => this.terminate(d));
          let temp = this.components[element].element;
          delete this.components[element];
          element = temp;
        } else if (typeof element === "string" && this.elements[element]) {
          if (this.elements[element].divs)
            this.elements[element].divs.forEach((d) => this.terminate(d));
          let temp = this.elements[element].element;
          if (this.elements[element].onresize)
            window.removeEventListener("resize", this.elements[element].onresize);
          if (this.elements[element].ondelete)
            this.elements[element].ondelete(temp, this.elements[element]);
          delete this.elements[element];
          element = temp;
        }
        if (element) {
          if (this.nodes.get(element.id)) {
            this.removeTree(element.id);
          }
          if (element instanceof DOMElement)
            element.delete();
          else if (element?.parentNode) {
            element.parentNode.removeChild(element);
          }
          return true;
        }
        return false;
      };
      this.defaultRoutes = {
        addElement: this.addElement,
        addComponent: this.addComponent,
        addCanvasComponent: this.addCanvasComponent,
        terminate: this.terminate
      };
      if (options?.parentNode)
        parentNode = options.parentNode;
      if (typeof parentNode === "string")
        parentNode = document.getElementById(parentNode);
      if (parentNode instanceof HTMLElement)
        this.parentNode = parentNode;
      if (interpreters) {
        Object.assign(this.interpreters, interpreters);
      }
      this.init(options);
    }
  };

  // src/graphscript/services/struct/datastructures/DataStructures.ts
  function Struct(structType = "struct", assignProps = {}, parentUser = { _id: "" }, parentStruct = { structType: "struct", _id: "" }) {
    function randomId(tag = "") {
      return `${tag + Math.floor(Math.random() + Math.random() * Math.random() * 1e16)}`;
    }
    let struct = {
      _id: randomId(structType + "defaultId"),
      structType,
      ownerId: parentUser?._id,
      timestamp: Date.now(),
      parent: { structType: parentStruct?.structType, _id: parentStruct?._id }
    };
    if (!struct.ownerId)
      delete struct.ownerId;
    if (!struct?.parent?._id)
      delete struct.parent;
    if (Object.keys(assignProps).length > 0)
      Object.assign(struct, assignProps);
    return struct;
  }
  function ProfileStruct(tag = "", assignProps = {}, parentUser = { _id: "" }, parentStruct = { structType: "struct", _id: "" }) {
    let props = {
      tag,
      name: "",
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      sex: "",
      birthday: "",
      type: "",
      userRoles: {},
      socials: {},
      data: {},
      id: ""
    };
    let struct = Struct("profile", props, parentUser, parentStruct);
    return Object.assign(struct, assignProps);
  }

  // src/graphscript/services/router/Router.ts
  var Router = class extends Service {
    constructor(options) {
      super(options);
      this.name = "router";
      this.connections = {};
      this.sources = {};
      this.services = {};
      this.serviceConnections = {};
      this.users = {};
      this.addUser = async (info, connections, config, receiving) => {
        if (!info._id) {
          info._id = `user${Math.floor(Math.random() * 1e15)}`;
        }
        let user = ProfileStruct(info._id, info);
        if (connections) {
          for (const key in connections) {
            if (typeof connections[key] === "object") {
              if (!connections[key].connection._id) {
                await new Promise((res, rej) => {
                  let start2 = performance.now();
                  let checker = () => {
                    if (!connections[key].connection._id) {
                      if (performance.now() - start2 > 3e3) {
                        delete connections[key];
                        rej(false);
                      } else {
                        setTimeout(() => {
                          checker();
                        }, 100);
                      }
                    } else {
                      res(true);
                    }
                  };
                  checker();
                }).catch((er) => {
                  console.error("Connections timed out:", er);
                });
              }
            }
          }
          for (const key in connections) {
            connections[key] = this.addConnection(connections[key], user._id);
          }
        }
        if (config) {
          for (const c in config) {
            this.openConnection(config[c].service, config[c], user._id, config[c].args);
          }
        }
        let send = (message, ...a) => {
          let connection = this.getConnection(user._id, "send");
          if (connection?.send)
            return connection.send(message, ...a);
        };
        let request = (message, method, ...a) => {
          let connection = this.getConnection(user._id, "request");
          if (connection?.request)
            return connection.request(message, method, ...a);
        };
        let post = (route, args, method, ...a) => {
          let connection = this.getConnection(user._id, "post");
          if (connection?.post)
            return connection.post(route, args, method, ...a);
        };
        let run = (route, args, method, ...a) => {
          let connection = this.getConnection(user._id, "run");
          if (connection?.run)
            return connection.run(route, args, method, ...a);
        };
        let subscribe = (route, callback, ...a) => {
          let connection = this.getConnection(user._id, "subscribe");
          if (connection?.subscribe)
            return connection.subscribe(route, callback, ...a);
        };
        let unsubscribe = (route, sub, ...a) => {
          let connection = this.getConnection(user._id, "unsubscribe");
          if (connection?.unsubscribe)
            return connection.unsubscribe(route, sub, ...a);
        };
        let terminate = () => {
          return this.removeUser(user);
        };
        user.send = send;
        user.request = request;
        user.post = post;
        user.run = run;
        user.subscribe = subscribe;
        user.unsubscribe = unsubscribe;
        user.terminate = terminate;
        this.users[user._id] = user;
        if (connections && !receiving) {
          let connectionIds = {};
          let pass = false;
          Object.keys(connections).map((k, i) => {
            if (connections[k]?._id) {
              connectionIds[`${i}`] = connections[k]?._id;
              pass = true;
            }
          });
          if (pass) {
            user.send({
              route: "addUser",
              args: [
                { _id: user._id },
                connectionIds,
                void 0,
                true
              ]
            });
          }
        }
        return user;
      };
      this.getConnection = (sourceId, hasMethod) => {
        if (this.sources[sourceId]) {
          if (this.order) {
            for (let i = 0; i < this.order.length; i++) {
              let k = this.order[i];
              for (const key in this.sources[sourceId]) {
                if (this.sources[sourceId][key].service) {
                  if (typeof this.sources[sourceId][key].service === "object") {
                    if (this.sources[sourceId][key].service.tag === k) {
                      if (this.sources[sourceId][key].connectionType && this.sources[sourceId][key].service?.name) {
                        if (!this.serviceConnections[this.sources[sourceId][key].service.name]) {
                          this.removeConnection(this.sources[sourceId][key]);
                          continue;
                        }
                      }
                      return this.sources[sourceId][key];
                    }
                  } else if (this.sources[sourceId][key].service === k) {
                    if (this.sources[sourceId][key].connectionType && this.sources[sourceId][key].service?.name) {
                      if (!this.serviceConnections[this.sources[sourceId][key].service.name])
                        this.removeConnection(this.sources[sourceId][key]);
                      continue;
                    }
                    return this.sources[sourceId][key];
                  }
                }
              }
            }
          } else {
            for (const k in this.sources[sourceId]) {
              if (this.sources[sourceId][k].connectionType && this.sources[sourceId][k].service?.name) {
                if (!this.serviceConnections[this.sources[sourceId][k].service.name]) {
                  this.removeConnection(this.sources[sourceId][k]);
                  continue;
                }
              }
              if (hasMethod && this.sources[sourceId][k][hasMethod]) {
                return this.sources[sourceId][k];
              } else {
                return this.sources[sourceId][k];
              }
            }
          }
        } else if (this.order) {
          for (let i = 0; i < this.order.length; i++) {
            let k = this.order[i];
            if (this.sources[sourceId][k].connectionType && this.sources[sourceId][k].service?.name) {
              if (!this.serviceConnections[this.sources[sourceId][k].service.name]) {
                this.removeConnection(this.sources[sourceId][k]);
                continue;
              }
            }
            if (hasMethod && this.sources[k][sourceId]?.[hasMethod]) {
              return this.sources[k][sourceId];
            } else {
              return this.sources[k][sourceId];
            }
          }
        }
        if (typeof sourceId === "string" && this.connections[sourceId] && this.connections[sourceId].send) {
          return this.connections[sourceId];
        }
      };
      this.addConnection = (options, source) => {
        let settings = {};
        if (typeof options === "string") {
          if (this.connections[options]) {
            options = this.connections[options];
          } else {
            for (const j in this.serviceConnections) {
              for (const k in this.serviceConnections[j]) {
                if (this.serviceConnections[j][k][options]) {
                  options = { connection: this.serviceConnections[j][k][options] };
                  options.service = j;
                  settings.connectionType = j;
                  break;
                }
              }
            }
          }
          if (typeof options === "string" && this.nodes.get(options))
            options = { connection: this.nodes.get(options) };
        }
        if (!options || typeof options === "string")
          return void 0;
        if (source)
          settings.source = source;
        if (options.connection instanceof GraphNode) {
          settings.connection = options.connection;
          let node = settings.connection;
          settings.send = async (message) => {
            if (message.method) {
              if (Array.isArray(message.args)) {
                return node[message.method]?.(...message.args);
              } else
                return node[message.method]?.(message.args);
            } else {
              if (Array.isArray(message.args)) {
                return node.run(...message.args);
              } else
                return node.run(message.args);
            }
          };
          settings.request = async (message, method) => {
            if (method) {
              if (Array.isArray(message.args)) {
                return node[method]?.(...message.args);
              } else
                return node[method]?.(message.args);
            } else {
              if (Array.isArray(message.args)) {
                return node.run(...message.args);
              } else
                return node.run(message.args);
            }
          };
          settings.post = async (route, args, method) => {
            if (route && node.get(route)) {
              let n = node.get(route);
              if (method) {
                if (Array.isArray(args)) {
                  return n[method]?.(...args);
                } else
                  return n[method]?.(args);
              } else {
                if (Array.isArray(args)) {
                  return n.run(...args);
                } else
                  return n.run(args);
              }
            } else {
              if (method) {
                if (Array.isArray(args)) {
                  return node[method]?.(...args);
                } else
                  return node[method]?.(args);
              } else {
                if (Array.isArray(args)) {
                  return node.run(...args);
                } else
                  return node.run(args);
              }
            }
          };
          settings.run = settings.post;
          settings.subscribe = async (route, callback) => {
            return node.subscribe(callback, route);
          };
          settings.unsubscribe = async (route, sub) => {
            return node.unsubscribe(sub, route);
          };
          settings.terminate = () => {
            node.graph.remove(node);
            return true;
          };
          settings.onclose = options.onclose;
          if (settings.onclose) {
            let oldondelete;
            if (node.ondelete)
              oldondelete = node.ondelete;
            node.ondelete = (n) => {
              if (settings.onclose)
                settings.onclose(settings, n);
              if (oldondelete)
                oldondelete(n);
            };
          }
        } else if (options.connection instanceof Graph) {
          if (options.connection.nodes.get("open"))
            settings.service = options.connection;
          let graph = settings.connection;
          settings.send = async (message) => {
            if (Array.isArray(message.args))
              graph.run(message.route, ...message.args);
            else
              graph.run(message.route, message.args);
          };
          settings.request = async (message, method) => {
            if (!message.route)
              return void 0;
            if (method) {
              if (Array.isArray(message.args)) {
                return graph.nodes.get(message.route)[method]?.(...message.args);
              } else
                return graph.nodes.get(message.route)[method]?.(message.args);
            } else {
              if (Array.isArray(message.args)) {
                return graph.run(message.route, ...message.args);
              } else
                return graph.run(message.route, message.args);
            }
          };
          settings.post = async (route, args, method) => {
            if (route && graph.get(route)) {
              let n = graph.get(route);
              if (method) {
                if (Array.isArray(args)) {
                  return n[method]?.(...args);
                } else
                  return n[method]?.(args);
              } else {
                if (Array.isArray(args)) {
                  return n.run(...args);
                } else
                  return n.run(args);
              }
            }
          };
          settings.run = settings.post;
          settings.subscribe = async (route, callback) => {
            return graph.subscribe(route, callback);
          };
          settings.unsubscribe = async (route, sub) => {
            return graph.unsubscribe(route, sub);
          };
          settings.terminate = (n) => {
            graph.remove(n);
            return true;
          };
        } else if (!(options._id && this.connections[options._id])) {
          let c = options.connection;
          if (typeof c === "string") {
            if (this.connections[c])
              c = this.connections[c];
            else if (options.service) {
              if (typeof options.service === "string") {
                options.service = this.services[options.service];
              }
              if (typeof options.service === "object") {
                if (options.service.connections) {
                  for (const key in options.service.connections) {
                    if (options.service.connections[key][c]) {
                      c = options.service.connections[key][c];
                      settings.connectionType = key;
                      break;
                    }
                  }
                }
              }
            } else {
              for (const j in this.serviceConnections) {
                for (const k in this.serviceConnections[j]) {
                  if (this.serviceConnections[j][k][c]) {
                    c = this.serviceConnections[j][k][c];
                    options.service = j;
                    settings.connectionType = j;
                    break;
                  }
                }
              }
            }
          }
          if (typeof c !== "object")
            return void 0;
          settings._id = c._id;
          settings.send = c.send;
          settings.request = c.request;
          settings.run = c.run;
          settings.post = c.post;
          settings.subscribe = c.subscribe;
          settings.unsubscribe = c.unsubscribe;
          settings.terminate = c.terminate;
          settings.onclose = options.onclose;
          if (settings.onclose) {
            if (!(c.onclose && settings.onclose.toString() === c.onclose.toString())) {
              let oldonclose = c.onclose;
              c.onclose = (...args) => {
                if (settings.onclose)
                  settings.onclose(settings, ...args);
                if (oldonclose)
                  oldonclose(...args);
              };
            }
          } else {
            let oldonclose = c.onclose;
            c.onclose = (...args) => {
              this.removeConnection(settings);
              if (oldonclose)
                oldonclose(...args);
            };
          }
          if (options.service) {
            if (typeof options.service === "string")
              options.service = this.services[options.service];
            settings.service = options.service;
          } else if (c.graph)
            settings.service = c.graph;
        }
        if (!settings.source && options.source) {
          settings.source = options.source;
        } else if (!settings.source && options.service) {
          settings.source = typeof options.service === "object" ? options.service.name : void 0;
        } else if (!settings.source && (settings.connection instanceof GraphNode || settings.connection instanceof Graph)) {
          settings.source = "local";
          if (!this.order.indexOf("local"))
            this.order.unshift("local");
        }
        if (!settings._id)
          settings._id = `connection${Math.floor(Math.random() * 1e15)}`;
        if (settings.source) {
          if (!this.sources[settings.source])
            this.sources[settings.source] = {};
          this.sources[settings.source][settings._id] = settings;
        }
        if (!this.connections[settings._id])
          this.connections[settings._id] = settings;
        return settings;
      };
      this.removeConnection = (connection, terminate = false) => {
        if (typeof connection === "object" && connection._id)
          connection = connection._id;
        if (typeof connection === "string") {
          if (this.connections[connection]) {
            if (terminate && this.connections[connection])
              this.connections[connection].terminate();
            delete this.connections[connection];
            for (const key in this.sources) {
              if (this.sources[key][connection])
                delete this.sources[key][connection];
            }
            return true;
          } else if (this.sources[connection]) {
            for (const key in this.sources[connection]) {
              this.removeConnection(this.sources[connection][key], terminate);
            }
            return true;
          }
        }
      };
      this.addService = (service, connections, includeClassName, routeFormat, syncServices, source, order) => {
        this.load(service, includeClassName, routeFormat, this.customRoutes, this.customChildren);
        this.services[service.name] = service;
        if (connections) {
          if (typeof connections === "string")
            this.addServiceConnections(service, connections, source);
          else {
            for (const c in connections) {
              this.addServiceConnections(service, c, source);
            }
          }
        }
        if (syncServices)
          this.syncServices();
        if (order)
          this.order = order;
        else {
          if (!this.order)
            this.order = [];
          this.order.push(service.name);
        }
      };
      this.addServiceConnections = (service, connectionsKey, source) => {
        if (typeof service === "string") {
          service = this.services[service];
        }
        if (connectionsKey && service[connectionsKey]) {
          let newConnections = {};
          if (!this.serviceConnections[service.name])
            this.serviceConnections[service.name] = {};
          this.serviceConnections[service.name][connectionsKey] = service[connectionsKey];
          for (const key in service[connectionsKey]) {
            if (!this.connections[key]) {
              newConnections[key] = this.addConnection({ connection: service[connectionsKey][key], service }, source);
              newConnections[key].connectionType = connectionsKey;
            }
          }
          return newConnections;
        }
      };
      this.openConnection = async (service, options, source, ...args) => {
        if (typeof service === "string") {
          service = this.services[service];
        }
        if (service instanceof Service) {
          let connection = service.run("open", options, ...args);
          if (connection instanceof Promise) {
            return connection.then(async (info) => {
              if (!info._id) {
                await new Promise((res, rej) => {
                  let start2 = performance.now();
                  let checker = () => {
                    if (!info._id) {
                      if (performance.now() - start2 > 3e3) {
                        rej(false);
                      } else {
                        setTimeout(() => {
                          checker();
                        }, 100);
                      }
                    } else {
                      res(true);
                    }
                  };
                  checker();
                }).catch((er) => {
                  console.error("Connections timed out:", er);
                });
              }
              if (info._id)
                this.addConnection({ connection: info, service }, source);
            });
          } else if (connection) {
            if (!connection._id) {
              await new Promise((res, rej) => {
                let start2 = performance.now();
                let checker = () => {
                  if (!connection._id) {
                    if (performance.now() - start2 > 3e3) {
                      rej(false);
                    } else {
                      setTimeout(() => {
                        checker();
                      }, 100);
                    }
                  } else {
                    res(true);
                  }
                };
                checker();
              }).catch((er) => {
                console.error("Connections timed out:", er);
              });
            }
            if (connection._id)
              return this.addConnection({ connection, service }, source);
          }
        }
      };
      this.terminate = (connection) => {
        if (typeof connection === "string")
          connection = this.connections[connection];
        return connection.terminate();
      };
      this.subscribeThroughConnection = (route, relay, endpoint, callback, ...args) => {
        if (typeof relay === "string") {
          relay = this.getConnection(relay, "run");
        }
        if (typeof relay === "object")
          return new Promise((res, rej) => {
            relay.run("routeConnections", [route, endpoint, relay._id, ...args]).then((sub) => {
              this.subscribe(endpoint, (res2) => {
                if (res2?.callbackId === route) {
                  if (!callback)
                    this.setState({ [endpoint]: res2.args });
                  else if (typeof callback === "string") {
                    this.setState({ [callback]: res2.args });
                  } else
                    callback(res2.args);
                }
              });
              res(sub);
            }).catch(rej);
          });
      };
      this.routeConnections = (route, transmitter, receiver, ...args) => {
        let rxsrc;
        if (typeof receiver === "string") {
          if (this.sources[receiver]) {
            rxsrc = receiver;
          }
          receiver = this.getConnection(receiver, "send");
        }
        if (typeof transmitter === "string") {
          transmitter = this.getConnection(transmitter, "subscribe");
        }
        if (transmitter?.subscribe && receiver?.send) {
          let res = new Promise((res2, rej) => {
            transmitter.subscribe(route, transmitter._id, (res3) => {
              if (!this.connections[receiver._id] && rxsrc) {
                if (this.sources[rxsrc]) {
                  rxsrc = receiver;
                  Object.keys(this.sources[rxsrc]).forEach((k) => {
                    if (this.sources[receiver][k].send) {
                      receiver = this.sources[receiver][k];
                    }
                  });
                }
              }
              if (this.connections[receiver._id])
                receiver.send({ callbackId: route, args: res3 });
            }, ...args).then((sub) => {
              res2(sub);
            });
          });
          return res;
        }
      };
      this.syncServices = () => {
        for (const name in this.services) {
          if ("users" in this.services[name])
            this.services[name].users = this.users;
          this.nodes.forEach((n, tag) => {
            if (!this.services[name].nodes.get(n.tag)) {
              this.services[name].nodes.set(tag, n);
            }
          });
        }
      };
      this.setUserData = (user, data) => {
        if (user) {
          if (typeof user === "string") {
            user = this.users[user];
            if (!user)
              return false;
          }
        }
        if (data) {
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        }
        if (typeof data === "object") {
          this.recursivelyAssign(user, data);
          return true;
        }
      };
      this.routes = {
        addUser: this.addUser,
        removeUser: this.removeUser,
        getConnection: this.getConnection,
        addConnection: this.addConnection,
        removeConnection: this.removeConnection,
        addService: this.addService,
        addServiceConnections: this.addServiceConnections,
        openConnection: this.openConnection,
        terminate: this.terminate,
        routeConnections: this.routeConnections,
        subscribeThroughConnection: this.subscribeThroughConnection,
        syncServices: this.syncServices
      };
      this.load(this.routes);
      if (options) {
        if (options.order)
          this.order = options.order;
        if (options.services) {
          for (const key in options.services) {
            let opt = options.services[key];
            if (opt instanceof Service) {
              opt.service.name = key;
              opt.service.tag = key;
              this.addService(opt.service, opt.connections, options.includeClassName, options.routeFormat, options.syncServices);
            } else if (typeof opt === "function") {
              let service = new opt();
              service.name = key;
              service.tag = key;
              if (service)
                this.addService(service, service.connections, options.includeClassName, options.routeFormat, options.syncServices);
            } else {
              if (typeof opt.service === "function") {
                let service = new opt.service({ name: key });
                service.name = key;
                service.tag = key;
                if (service)
                  this.addService(service, void 0, options.includeClassName, options.routeFormat, options.syncServices);
                opt.service = service;
              } else if (opt.service instanceof Service) {
                opt.service.name = key;
                opt.service.tag = key;
                this.addService(opt.service, void 0, options.includeClassName, options.routeFormat, options.syncServices);
              }
              if (typeof opt.service === "object") {
                if (opt.connections) {
                  if (Array.isArray(opt.connections)) {
                    opt.connections.forEach((k) => {
                      this.addServiceConnections(opt[key].service, k);
                    });
                  } else
                    this.addServiceConnections(opt.service, opt.connections);
                }
                if (opt.config) {
                  for (const c in opt.config) {
                    this.openConnection(opt.service, opt.config[c], opt.config[c].source, opt.config[c].args);
                  }
                }
              }
            }
          }
        }
      }
    }
    removeUser(profile, terminate) {
      if (terminate)
        this.removeConnection(profile, terminate);
      if (typeof profile === "string")
        profile = this.users[profile];
      if (typeof profile === "object" && profile._id) {
        delete this.users[profile._id];
        if (profile.onclose)
          profile.onclose(profile);
      }
      return true;
    }
  };

  // src/transform.ts
  var transform_default = (tag, node) => {
    const args = node.arguments;
    const instanceTree = {};
    Array.from(args.entries()).forEach(([arg], i) => {
      instanceTree[arg] = {
        tag: arg,
        operator: function(input) {
          const o = args.get(arg);
          o.state = input;
          if (i === 0)
            return this.graph.node.run();
          return input;
        }
      };
    });
    const originalOperator = node.operator;
    node.operator = function(...argsArr) {
      let updatedArgs = [];
      let i = 0;
      args.forEach((o, k) => {
        const argO = args.get(k);
        const currentArg = argO.spread ? argsArr.slice(i) : argsArr[i];
        let update = currentArg !== void 0 ? currentArg : o.state;
        argO.state = update;
        if (!argO.spread)
          update = [update];
        updatedArgs.push(...update);
        i++;
      });
      return originalOperator.call(this ?? node, ...updatedArgs);
    };
    const gGraph = new Graph(instanceTree, tag, node);
    const gNode = new GraphNode(gGraph);
    return gNode;
  };

  // src/parse.js
  var ARGUMENT_NAMES = /([^,]*)/g;
  function getFnParamInfo(fn) {
    var fstr = fn.toString();
    const openPar = fstr.indexOf("(");
    const closePar = fstr.indexOf(")");
    const getFirstBracket = (str, offset = 0) => {
      const fb = offset + str.indexOf("{");
      if (fb < closePar && fb > openPar) {
        return getFirstBracket(str.slice(fb), offset + fb);
      } else
        return fb;
    };
    const firstBracket = getFirstBracket(fstr);
    let innerMatch;
    if (firstBracket === -1 || closePar < firstBracket)
      innerMatch = fstr.slice(fstr.indexOf("(") + 1, fstr.indexOf(")"));
    else
      innerMatch = fstr.match(/([a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\)) =>/)?.[1];
    if (!innerMatch)
      return void 0;
    const matches = innerMatch.match(ARGUMENT_NAMES).filter((e) => !!e);
    const info = /* @__PURE__ */ new Map();
    matches.forEach((v) => {
      let [name, value] = v.split("=");
      name = name.trim();
      name = name.replace(/\d+$/, "");
      const spread = name.includes("...");
      name = name.replace("...", "");
      try {
        if (name)
          info.set(name, {
            state: value ? (0, eval)(`(${value})`) : value,
            spread
          });
      } catch (e) {
        info.set(name, {});
        console.warn(`Argument ${name} could not be parsed for`, fn.toString(), value);
      }
    });
    return info;
  }
  var parse_default = getFnParamInfo;

  // src/index.js
  var isNode = "process" in globalThis;
  var ESPlugin = class {
    #initial;
    #instance;
    #graphscript;
    #router;
    #toRun = false;
    get initial() {
      return this.#initial;
    }
    get instance() {
      return this.#instance;
    }
    get graphscript() {
      return this.#graphscript;
    }
    set graphscript(v) {
      this.#graphscript = v;
    }
    constructor(node, options = {}) {
      this.#router = options._router;
      this.#initial = node;
      do {
        this.#initial = this.initial.initial ?? this.initial;
      } while (this.initial instanceof ESPlugin);
      const isFunction = typeof this.initial === "function";
      const hasDefault = "default" in this.initial;
      let hasGraph = !!node.graph;
      let runProps = true;
      if (!hasDefault && !hasGraph) {
        let newNode = { graph: { nodes: {} } };
        for (let namedExport in node)
          newNode.graph.nodes[namedExport] = { default: node[namedExport] };
        this.#initial = newNode;
        hasGraph = true;
        runProps = false;
      }
      if (hasDefault || isFunction)
        this.graphscript = this.#create(options.tag ?? "defaultESPluginTag", this.initial);
      if (hasGraph) {
        const hasGraphs = {};
        for (let tag in this.initial.graph.nodes) {
          const node2 = this.initial.graph.nodes[tag];
          if (!(node2 instanceof ESPlugin)) {
            const clonedOptions = Object.assign({}, Object.assign(options));
            this.initial.graph.nodes[tag] = new ESPlugin(node2, Object.assign(clonedOptions, { tag }));
            if (typeof options.onPlugin === "function")
              options.onPlugin(this.initial.graph.nodes[tag]);
          } else
            hasGraphs[tag] = node2;
        }
        let tree = {};
        for (let tag in this.initial.graph.nodes) {
          let thisNode = this.initial.graph.nodes[tag];
          if (hasGraphs[tag]) {
            const gs = hasGraphs[tag].graphscript;
            thisNode = gs._state;
            thisNode.tag = tag;
            gs.state.triggers = {};
            thisNode.isNewKey = true;
          }
          const innerNode = this.#create(tag, thisNode);
          tree[tag] = innerNode.graphscript ?? innerNode;
          if (hasGraphs[tag])
            hasGraphs[tag].graphscript = tree[tag];
        }
        const edges = this.initial.graph.edges;
        for (let output in edges) {
          const splitEdge = output.split(".");
          const first = splitEdge.shift();
          let outNode = tree[first];
          splitEdge.forEach((str) => outNode = outNode.nodes.get(str));
          if (!outNode.children)
            outNode.children = {};
          for (let input in edges[output]) {
            const tag = input.split(".").pop();
            outNode.children[tag] = true;
          }
        }
        const ports = node.graph?.ports;
        const props = this.#instance ?? node;
        this.graphscript = isNode ? new Graph(tree, options.tag, props) : new DOMService({ routes: tree, name: options.tag, props: runProps ? props : void 0 }, options.parentNode);
        if (!this.#router)
          this.#router = this.graphscript = new Router({
            routes: this.graphscript,
            linkServices: false,
            includeClassName: false
          });
        if (ports) {
          let input = ports.input;
          let output = ports.output;
          node.operator = async function(...args) {
            await this.nodes.get(input).run(...args);
          };
          this.graphscript.state.triggers = {};
          const gotOutput = this.graphscript.get(output);
          gotOutput.subscribe((...args) => {
            for (let tag in this.graphscript.children)
              this.#runGraph(this.graphscript.children[tag], ...args);
          });
        }
      }
      Object.defineProperty(this, "tag", {
        get: () => this.graphscript?.tag,
        enumerable: true
      });
    }
    init = async () => {
      if (this.#toRun)
        await this.run();
    };
    #create = (tag, info) => {
      if (typeof info === "function")
        info = { default: info };
      if (!("default" in info) || info instanceof Graph)
        return info;
      else {
        let activeInfo;
        if (info instanceof ESPlugin) {
          activeInfo = info.instance;
          info = info.initial;
        }
        const args = parse_default(info.default) ?? /* @__PURE__ */ new Map();
        if (args.size === 0)
          args.set("default", {});
        let argsArray = Array.from(args.entries());
        const input = argsArray[0][0];
        if (info.arguments) {
          const isArray = Array.isArray(info.arguments);
          let i = 0;
          for (let key in info.arguments) {
            const v = info.arguments[key];
            if (isArray) {
              argsArray[i].state = v;
              if (i == 0)
                this.#toRun = true;
            } else {
              args.get(key).state = v;
              if (input === key)
                this.#toRun = true;
            }
            i++;
          }
        }
        const gsIn = {
          arguments: args,
          operator: info.default,
          tag,
          default: info.default
        };
        var props = Object.getOwnPropertyNames(info);
        const onActive = ["arguments", "default", "tag", "operator"];
        props.forEach((key) => {
          if (!onActive.includes(key))
            gsIn[key] = info[key];
        });
        if (activeInfo) {
          for (let key in activeInfo) {
            if (!onActive.includes(key))
              gsIn[key] = activeInfo[key];
          }
        }
        this.#instance = gsIn;
        return transform_default(tag, gsIn);
      }
    };
    #runGraph = async (graph = this.graphscript, ...args) => {
      if (graph instanceof Graph) {
        if (graph.node)
          return graph.node.run(...args);
        else {
          if (args.length === 0)
            return this.#runDefault(graph);
          else if (graph.nodes.has(args[0]))
            return graph.run(...args);
          else
            return this.#runDefault(graph, ...args);
        }
      } else
        return await graph.run(...args);
    };
    #runDefault = (graph, ...args) => graph.run(graph.nodes.values().next().value, ...args);
    run = async (...args) => this.#runGraph(this.graphscript, ...args);
  };
  var src_default = ESPlugin;

  // index.js
  var start = async () => {
    const instance = new src_default(example_exports);
    await instance.init();
    console.log("example", example_exports);
    const e2 = Object.assign({}, example_exports);
    e2.attributes = Object.assign({}, e2.attributes);
    e2.attributes.innerHTML = "Click Me Too";
    const secondInstance = new src_default(e2);
    await secondInstance.init();
    const apiInstance = new src_default(api_exports);
    await apiInstance.init();
    const apiRes = await apiInstance.run("add", 1, 2);
    console.log("apiRes: 1 + 2 =", apiRes);
    const res = await instance.run();
    console.log("instance without graph context", res);
    const esGraph = new src_default({
      graph: {
        nodes: {
          first: instance,
          second: secondInstance,
          log: log_exports
        },
        edges: {
          first: { log: {} },
          second: { log: {} }
        }
      }
    });
    await esGraph.init();
    await instance.run();
    await secondInstance.run();
  };
  start();
})();
