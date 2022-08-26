(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // plugins/example.js
  var example_exports = {};
  __export(example_exports, {
    default: () => example_default,
    nExecutions: () => nExecutions
  });
  var nExecutions = 0;
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

  // src/Graph.ts
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
  var GraphNode = class {
    constructor(properties = {}, parentNode, graph) {
      this.nodes = /* @__PURE__ */ new Map();
      this._initial = {};
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
      this.run = (...args) => {
        if (typeof this.transformArgs === "function")
          args = this.transformArgs(args, this);
        if (this.firstRun) {
          this.firstRun = false;
          if (!(this.children && this.forward || this.parent && this.backward || this.repeat || this.delay || this.frame || this.recursive || this.branch))
            this.runSync = true;
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
              if (n.branch[k].then instanceof GraphNode) {
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
                if (n.branch[k].then instanceof GraphNode) {
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
        if (n instanceof GraphNode) {
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
        if (n instanceof GraphNode) {
          parentNode.addChildren(n);
          if (n.forward)
            n.runSync = false;
        }
      };
      this.subscribe = (callback, tag = this.tag) => {
        if (callback instanceof GraphNode) {
          return this.subscribeNode(callback);
        } else
          return this.state.subscribeTrigger(tag, callback);
      };
      this.unsubscribe = (sub, tag = this.tag) => {
        this.state.unsubscribeTrigger(tag, sub);
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
        if (!(this.children && this.forward || this.parent && this.backward || this.repeat || this.delay || this.frame || this.recursive))
          this.runSync = true;
      };
      this.removeTree = (n) => {
        if (n) {
          if (typeof n === "string")
            n = this.nodes.get(n);
        }
        if (n instanceof GraphNode) {
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
            if (n.nodes.get(child.tag) && !n.parent.nodes.get(child.tag))
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
                  if (n.graph) {
                    let props = n.children[key].getProps();
                    delete props.parent;
                    delete props.graph;
                    if (n.source instanceof Graph) {
                      n.children[key] = new GraphNode(props, n, n.source);
                    } else {
                      n.children[key] = new GraphNode(props, n, n.graph);
                    }
                  }
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
            for (let k in properties)
              this[k] = hasnode[k];
            if (!this.source)
              this.source = hasnode;
            let props = hasnode.getProps();
            delete props.graph;
            delete props.parent;
            console.log(props);
            Object.assign(properties, props);
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
        for (let k in properties)
          this[k] = properties[k];
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
      this.tree = {};
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
        if (n instanceof GraphNode)
          return n.run(...args);
        else
          return void 0;
      };
      this.runAsync = (n, ...args) => {
        if (typeof n === "string")
          n = this.nodes.get(n);
        if (n instanceof GraphNode)
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
        if (n instanceof GraphNode) {
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
        if (n instanceof GraphNode) {
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
        if (n instanceof GraphNode && typeof callback === "function") {
          return n.subscribe(callback);
        } else if (callback instanceof GraphNode || typeof callback === "string")
          return this.subscribeNode(n, callback);
        else if (typeof n == "string") {
          return this.state.subscribeTrigger(n, callback);
        }
      };
      this.unsubscribe = (tag, sub) => {
        this.state.unsubscribeTrigger(tag, sub);
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
        if (n instanceof GraphNode) {
          n.stopNode();
        }
      };
      this.print = (n = void 0, printChildren = true) => {
        if (n instanceof GraphNode)
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
        for (let k in props)
          this[k] = props[k];
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

  // src/transform.ts
  var transform_default = (tag, node) => {
    const args = node.arguments;
    const instanceTree = {};
    Array.from(args.entries()).forEach(([arg], i) => {
      instanceTree[arg] = {
        tag: arg,
        operator: (input) => {
          const o = args.get(arg);
          o.state = input;
          if (i === 0)
            return node.run();
          return input;
        }
      };
    });
    const originalOperator = node.operator.bind(node);
    node.operator = (...argsArr) => {
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
      return originalOperator(...updatedArgs);
    };
    return new Graph(instanceTree, tag, node);
  };

  // src/old/parse.js
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

  // src/old/index.js
  var isNode = "process" in globalThis;
  var ESPlugin = class {
    tag;
    graph;
    parent;
    element;
    parentNode;
    children = {};
    tagName;
    style;
    attributes;
    #toRun = false;
    _initial;
    _trueInitial;
    _instance;
    constructor(node, options = {}) {
      this._initial = node;
      this._trueInitial = node;
      do {
        this._initial = this._initial._initial ?? this._initial;
      } while (this._initial instanceof ESPlugin);
      let parentNode;
      Object.defineProperty(this, "parentNode", {
        get: () => parentNode,
        set: (el) => {
          parentNode = el;
          if (el) {
            if (this.element) {
              parentNode.appendChild(this.element);
              if (typeof this.onrender === "function")
                this.onrender();
            } else {
            }
          } else if (this.element)
            this.element.remove();
        },
        enumerable: true
      });
      let element;
      Object.defineProperty(this, "element", {
        get: () => element,
        set: (el) => {
          element = el;
          if (this.parentNode) {
            this.parentNode.appendChild(el);
            if (typeof this.onrender === "function")
              this.onrender();
          }
        },
        enumerable: true
      });
      for (let k in node)
        this[k] = node[k];
      this.parent = options.parent;
      const getParentNode = () => options.parentNode ?? this.parent?.parentNode;
      this.parentNode = getParentNode();
      if (this.graph) {
        let tree = {};
        for (let tag in this._initial.graph.nodes) {
          const innerNode = this._initial.graph.nodes[tag];
          tree[tag] = this.#create(tag, innerNode);
        }
        const edges = this._initial.graph.edges;
        for (let output in edges) {
          const outNode = tree[output];
          if (!outNode.children)
            outNode.children = {};
          for (let input in edges[output])
            outNode.children[input] = true;
        }
        this._graphscript = new Graph(tree);
        this.tag = this._graphscript.tag;
        for (let tag in this._initial.graph.nodes) {
          const node2 = this._initial.graph.nodes[tag];
          if (!(node2 instanceof ESPlugin)) {
            const clonedOptions = Object.assign({}, Object.assign(options));
            this._initial.graph.nodes[tag] = new ESPlugin(node2, Object.assign(clonedOptions, {
              tag,
              parent: this
            }));
            if (typeof options.onPlugin === "function")
              options.onPlugin(this.graph.nodes[tag]);
          } else {
            node2.tag = tag;
            node2.parent = this;
            node2.init();
          }
        }
      }
      if ("default" in this._initial) {
        this.tag = options.tag ?? "defaultESPluginTag";
        this._graphscript = new GraphNode(this.#create(this.tag, this._initial));
      }
      if (options.activate !== false) {
        if (typeof this.oncreate === "function")
          this.oncreate();
        if (this.loop) {
          setInterval(() => {
            this.run();
          }, this.loop);
        }
        if (isNode) {
        } else {
          if (this.tagName)
            this.element = document.createElement(this.tagName);
          this.parentNode = getParentNode() ?? document.body;
          if (this.element) {
            if (this.attributes) {
              for (let attribute in this.attributes) {
                const value = this.attributes[attribute];
                if (typeof value === "function") {
                  const boundValue = value.bind(this);
                  this.element[attribute] = (ev) => boundValue(ev);
                } else
                  this.element[attribute] = value;
              }
            }
          }
        }
      }
    }
    init = async () => {
      if ("default" in this._initial) {
        if (this.parent) {
          const got = this.parent._graphscript.nodes.get(this.tag);
          if (got)
            this._graphscript = got;
        }
        if (this.#toRun)
          await this.run();
      }
    };
    #create = (tag, info) => {
      let activeInfo;
      if (info instanceof ESPlugin) {
        activeInfo = info._instance;
        info = info._initial;
      }
      const args = parse_default(info.default) ?? /* @__PURE__ */ new Map();
      if (args.size === 0)
        args.set("default", {});
      const input = args.keys().next().value;
      if (this.arguments) {
        for (let key in this.arguments) {
          const o = args.get(key);
          o.state = this.arguments[key];
          if (input === key)
            this.#toRun = true;
        }
      }
      this.arguments = args;
      const gsIn = {
        arguments: args,
        operator: info.default,
        tag
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
      this._instance = gsIn;
      return transform_default(tag, gsIn);
    };
    run = async (...args) => await this._graphscript.run(...args);
  };
  var old_default = ESPlugin;

  // index.js
  var start = async () => {
    const instance = new old_default(example_exports);
    const secondInstance = new old_default(example_exports);
    await instance.init();
    await secondInstance.init();
    const res = await instance.run();
    console.log("instance without graph context", res);
    const esGraph = new old_default({
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
