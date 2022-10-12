(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };

  // ../libraries/escompose/src/graphscript/Graph.ts
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
  var EventHandler = class {
    constructor() {
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
        let changed = (value) => {
          onchange(value);
          this.unsubscribeTrigger(key, sub);
        };
        sub = this.subscribeTrigger(key, changed);
      };
    }
  };
  var state = new EventHandler();
  function addLocalState(props) {
    if (!this._state)
      this._state = {};
    for (let k in props) {
      if (k === "_state" || k === "graph")
        continue;
      else {
        this._state[k] = props[k];
        if (k in this)
          this[k] = props[k];
        else
          Object.defineProperty(this, k, {
            get: () => {
              this._state[k];
            },
            set: (v) => {
              this._state[k] = v;
              if (this.state.triggers[this._unique])
                this.setState({ [this._unique]: this._state });
            },
            enumerable: true,
            configurable: true
          });
      }
    }
  }
  var GraphNode = class {
    constructor(properties = {}, parent, graph) {
      this.nodes = /* @__PURE__ */ new Map();
      this._initial = {};
      this._unique = `${Math.random()}`;
      this.state = state;
      this.isLooping = false;
      this.isAnimating = false;
      this.looper = void 0;
      this.animation = void 0;
      this.forward = true;
      this.backward = false;
      this.reactive = false;
      this.runSync = false;
      this.firstRun = true;
      this.DEBUGNODE = false;
      this.addLocalState = addLocalState;
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
        if (n?.node instanceof GraphNode)
          n = n.node;
        if (!(n instanceof GraphNode))
          n = new GraphNode(n.node ?? n, this, this.graph);
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
        if (typeof this._state === "object") {
          this.state.unsubscribeTrigger(this._unique);
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
      this.subscribe = (callback2, tag = this.tag) => {
        if (typeof callback2 === "string") {
          if (this.graph)
            callback2 = this.graph.get(callback2);
          else
            callback2 = this.nodes.get(callback2);
        }
        if (typeof callback2 === "function") {
          return this.state.subscribeTrigger(tag, callback2);
        } else if (callback2)
          return this.state.subscribeTrigger(tag, (res) => {
            callback2.run(res);
          });
      };
      this.unsubscribe = (sub, tag = this.tag) => {
        return this.state.unsubscribeTrigger(tag, sub);
      };
      this.subscribeState = (callback2) => {
        if (!this.reactive) {
          return void 0;
        } else {
          if (typeof callback2 === "string") {
            if (this.graph)
              callback2 = this.graph.get(callback2);
            else
              callback2 = this.nodes.get(callback2);
          }
          if (typeof callback2 === "function") {
            return this.state.subscribeTrigger(this._unique, callback2);
          } else if (callback2)
            return this.state.subscribeTrigger(this._unique, (_state) => {
              callback2.run(_state);
            });
        }
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
      this.getProps = (n = this, getInitial = true) => {
        let baseprops = {
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
          reactive: n.reactive,
          DEBUGNODE: n.DEBUGNODE
        };
        if (!getInitial) {
          let uniqueprops = {};
          for (const key in this._initial) {
            uniqueprops[key] = this[key];
          }
          return Object.assign(baseprops, uniqueprops);
        } else
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
            reactive: n.reactive,
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
                    if (n2.children?.[key] instanceof GraphNode)
                      delete n2.children[key];
                  });
                  if (node.children[key].ondelete && !this.graph)
                    node.children[key].ondelete(node.children[key]);
                  recursivelyRemove(node.children[key]);
                }
              }
            }
          };
          if (n.stopNode)
            n.stopNode();
          if (n.tag) {
            this.nodes.delete(n.tag);
            if (this.children?.[n.tag])
              delete this.children[n.tag];
            if (this.parent?.tag === n.tag)
              delete this.parent;
            if (this[n.tag] instanceof GraphNode)
              delete this[n.tag];
            this.nodes.forEach((n2) => {
              if (n2?.tag) {
                if (n2.nodes.get(n2.tag))
                  n2.nodes.delete(n2.tag);
                if (n2.children?.[n2.tag] instanceof GraphNode)
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
      this.setState = (data) => {
        this.state.setState(data);
      };
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
          if (source.oncreate)
            properties.oncreate = source.oncreate;
          if (source.node) {
            if (source.node._initial)
              Object.assign(properties, source.node._initial);
          }
          if (source._initial)
            Object.assign(properties, source._initial);
          if (source.tag)
            properties.tag = source.tag;
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
        if (typeof parent === "string") {
          if (graph)
            parent = graph.nodes.get(parent);
          else
            parent = void 0;
        }
        if (properties.tag && (graph || parent)) {
          let hasnode;
          if (graph?.nodes) {
            hasnode = graph.nodes.get(properties.tag);
          }
          if (!hasnode && parent?.nodes) {
            hasnode = parent.nodes.get(properties.tag);
          }
          if (hasnode) {
            if (this.reactive) {
              this.addLocalState(hasnode);
            }
            if (!this.source)
              this.source = hasnode;
            let props = hasnode.getProps();
            delete props.graph;
            delete props.parent;
            for (let k in props) {
              const desc = Object.getOwnPropertyDescriptor(properties, k);
              if (desc && desc.get && !desc.set)
                properties = Object.assign({}, properties);
              else
                properties[k] = props[k];
            }
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
        Object.assign(this, properties);
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
          this.state = graph.state;
        }
        if (this.reactive) {
          addLocalState(properties);
          if (typeof this.reactive === "function") {
            this.state.subscribeTrigger(this._unique, this.reactive);
          }
        }
        if (typeof parent === "object") {
          this.parent = parent;
          if (parent instanceof GraphNode || parent instanceof Graph)
            parent.nodes.set(this.tag, this);
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
        if (this.animation && !this.animate)
          this.animate = true;
      } else
        return properties;
    }
  };
  var Graph = class {
    constructor(tree, tag, props) {
      this.nNodes = 0;
      this.nodes = /* @__PURE__ */ new Map();
      this.state = new EventHandler();
      this._unique = `${Math.random()}`;
      this.tree = {};
      this.addLocalState = addLocalState;
      this.add = (n = {}) => {
        if (n?.node instanceof GraphNode)
          n = n.node;
        let props = n;
        if (!(n instanceof GraphNode))
          n = new GraphNode(props?.node ?? props, this, this);
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
        if (n) {
          if (typeof n === "string")
            n = this.nodes.get(n);
        }
        if (n?.nodes) {
          let checked2 = {};
          const recursivelyRemove = (node) => {
            if (typeof node.children === "object" && !checked2[node.tag]) {
              checked2[node.tag] = true;
              for (const key in node.children) {
                if (node.children[key]?.stopNode)
                  node.children[key].stopNode();
                if (node.children[key]?.tag) {
                  if (this.nodes.get(node.children[key].tag))
                    this.nodes.delete(node.children[key].tag);
                  this.nodes.forEach((n2) => {
                    if (n2.nodes.get(node.children[key].tag))
                      n2.nodes.delete(node.children[key].tag);
                    if (n2.children?.[key] instanceof GraphNode)
                      delete n2.children[key];
                  });
                  if (node.children[key].ondelete)
                    node.children[key].ondelete(node.children[key]);
                  recursivelyRemove(node.children[key]);
                }
              }
            }
          };
          if (n.stopNode)
            n.stopNode();
          if (n.tag) {
            this.nodes.delete(n.tag);
            if (this.parent?.tag === n.tag)
              delete this.parent;
            if (this[n.tag] instanceof GraphNode)
              delete this[n.tag];
            this.nodes.forEach((n2) => {
              if (n2?.tag) {
                if (n2.nodes.get(n2.tag))
                  n2.nodes.delete(n2.tag);
                if (n2.children?.[n2.tag] instanceof GraphNode)
                  delete n2.children[n2.tag];
              }
            });
            recursivelyRemove(n);
            if (n.ondelete)
              n.ondelete(n);
          }
        }
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
      this.subscribe = (n, callback2) => {
        if (!callback2)
          return;
        if (n?.subscribe && typeof callback2 === "function") {
          return n.subscribe(callback2);
        } else if (callback2 instanceof GraphNode || typeof callback2 === "string")
          return this.subscribeNode(n, callback2);
        else if (typeof n == "string") {
          return this.state.subscribeTrigger(n, callback2);
        }
      };
      this.unsubscribe = (tag, sub) => {
        return this.state.unsubscribeTrigger(tag, sub);
      };
      this.subscribeState = (callback2) => {
        if (!this.reactive) {
          return void 0;
        } else {
          if (typeof callback2 === "string") {
            if (this.graph)
              callback2 = this.graph.get(callback2);
            else
              callback2 = this.nodes.get(callback2);
          }
          if (typeof callback2 === "function") {
            return this.state.subscribeTrigger(this._unique, callback2);
          } else if (callback2)
            return this.state.subscribeTrigger(this._unique, (_state) => {
              callback2.run(_state);
            });
        }
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
      this.setState = (data) => {
        this.state.setState(data);
      };
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
        if (props.reactive) {
          this.addLocalState(props);
        } else
          Object.assign(this, props);
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

  // ../libraries/escompose/src/graphscript/services/dom/DOMElement.js
  var DOMElement = class extends HTMLElement {
    template = function(self2 = this, props) {
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
    attributeChangedCallback = (name2, old, val) => {
      if (name2 === "onchanged") {
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
      } else if (name2 === "onresize") {
        let onresize2 = val;
        if (typeof onresize2 === "string")
          onresize2 = parseFunctionFromText2(onresize2);
        if (typeof onresize2 === "function") {
          if (this.ONRESIZE) {
            try {
              window.removeEventListener("resize", this.ONRESIZE);
            } catch (err) {
            }
          }
          this.ONRESIZE = (ev) => {
            this.onresize(this.props, this);
          };
          this.onresize = onresize2;
          window.addEventListener("resize", this.ONRESIZE);
        }
      } else if (name2 === "ondelete") {
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
      } else if (name2 === "oncreate") {
        let oncreate = val;
        if (typeof oncreate === "string")
          oncreate = parseFunctionFromText2(oncreate);
        if (typeof oncreate === "function") {
          this.oncreate = oncreate;
        }
      } else if (name2 === "renderonchanged") {
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
      } else if (name2 === "props") {
        let newProps = val;
        if (typeof newProps === "string")
          newProps = JSON.parse(newProps);
        Object.assign(this.props, newProps);
        this.state.setState({ props: this.props });
      } else if (name2 === "template") {
        let template = val;
        this.template = template;
        this.render(this.props);
        let created = new CustomEvent("created", { detail: { props: this.props } });
        this.dispatchEvent(created);
      } else {
        let parsed = val;
        if (name2.includes("eval_")) {
          name2 = name2.split("_");
          name2.shift();
          name2 = name2.join();
          parsed = parseFunctionFromText2(val);
        } else if (typeof val === "string") {
          try {
            parsed = JSON.parse(val);
          } catch (err) {
            parsed = val;
          }
        }
        this[name2] = parsed;
        if (name2 !== "props" && this.props)
          this.props[name2] = parsed;
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
        let name2 = att.name;
        let parsed = att.value;
        if (name2.includes("eval_") || name2.includes("()")) {
          if (name2.includes("eval_"))
            name2 = name2.split("_");
          else if (name2.includes("()"))
            name2 = name2.substring(0, name2.indexOf("("));
          name2.shift();
          name2 = name2.join();
          parsed = parseFunctionFromText2(att.value);
        } else if (typeof att.value === "string") {
          try {
            parsed = JSON.parse(att.value);
          } catch (err) {
            parsed = att.value;
          }
        }
        if (!this[name2]) {
          Object.defineProperties(this, att, {
            value: parsed,
            writable: true,
            get() {
              return this[name2];
            },
            set(val) {
              this.setAttribute(name2, val);
            }
          });
        }
        this[name2] = parsed;
        if (name2 !== "props")
          this.props[name2] = parsed;
        this.obsAttributes.push(name2);
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
    set onresize(onresize2) {
      this.setAttribute("onresize", onresize2);
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

  // ../libraries/escompose/src/graphscript/services/Service.ts
  var Service = class extends Graph {
    constructor(options = {}) {
      super(void 0, options.name ? options.name : `service${Math.floor(Math.random() * 1e14)}`, options.props);
      this.routes = {};
      this.loadDefaultRoutes = false;
      this.keepState = true;
      this.firstLoad = true;
      this.customRoutes = {};
      this.customChildren = {};
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
            this.load(r, options.includeClassName, options.routeFormat, options.customRoutes, options.customChildren, options.sharedState);
          });
        } else if (options.routes || (Object.keys(this.routes).length > 0 || this.loadDefaultRoutes) && this.firstLoad)
          this.load(options.routes, options.includeClassName, options.routeFormat, options.customRoutes, options.customChildren, options.sharedState);
      };
      this.load = (routes, includeClassName = true, routeFormat = ".", customRoutes = this.customRoutes, customChildren = this.customChildren, sharedState = true) => {
        if (!routes && !this.loadDefaultRoutes && (Object.keys(this.routes).length > 0 || this.firstLoad))
          return;
        if (this.firstLoad)
          this.firstLoad = false;
        if (customRoutes)
          customRoutes = Object.assign(this.customRoutes, customRoutes);
        else
          customRoutes = this.customRoutes;
        let service;
        let allRoutes = {};
        if (routes) {
          if (!(routes instanceof Graph) && routes?.name && !routes.setTree) {
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
              if (sharedState)
                service.state = this.state;
              routes = service.routes;
              if (service.customRoutes && !this.customRoutes)
                this.customRoutes = service.customRoutes;
              else if (service.customRoutes && this.customRoutes)
                Object.assign(this.customRoutes, service.customRoutes);
              if (service.customChildren && !this.customChildren)
                this.customChildren = service.customChildren;
              else if (service.customChildren && this.customChildren)
                Object.assign(this.customChildren, service.customChildren);
            }
          } else if (routes instanceof Graph || routes.source instanceof Graph || routes.setTree) {
            service = routes;
            routes = {};
            if (sharedState)
              service.state = this.state;
            if (includeClassName) {
              let name2 = service.name;
              if (!name2) {
                name2 = service.tag;
                service.name = name2;
              }
              if (!name2) {
                name2 = `graph${Math.floor(Math.random() * 1e15)}`;
                service.name = name2;
                service.tag = name2;
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
                  if (nd instanceof Graph || nd.source instanceof Graph || nd.setTree) {
                    if (sharedState)
                      nd.state = this.state;
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
            let name2 = routes.constructor.name;
            if (name2 === "Object") {
              name2 = Object.prototype.toString.call(routes);
              if (name2)
                name2 = name2.split(" ")[1];
              if (name2)
                name2 = name2.split("]")[0];
            }
            if (name2 && name2 !== "Object") {
              let module = routes;
              routes = {};
              Object.getOwnPropertyNames(module).forEach((route) => {
                if (includeClassName)
                  routes[name2 + routeFormat + route] = module[route];
                else
                  routes[route] = module[route];
              });
            }
          }
          if ((service instanceof Graph || service?.setTree) && service.name && includeClassName) {
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
            if (this.routes[key] instanceof GraphNode || this.routes[key].constructor.name.includes("GraphNode")) {
              this.nodes.set(key, this.routes[key]);
              this.nNodes = this.nodes.size;
            }
          }
        } else
          this.setTree(this.routes);
        for (const prop in routes) {
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
      this.pipe = (source, destination, endpoint, method, callback2) => {
        if (source instanceof GraphNode) {
          if (callback2)
            return source.subscribe((res) => {
              let mod = callback2(res);
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
      this.pipeOnce = (source, destination, endpoint, method, callback2) => {
        if (source instanceof GraphNode) {
          if (callback2)
            return source.state.subscribeTriggerOnce(source.tag, (res) => {
              let mod = callback2(res);
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
          if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            if (typeof target[key] === "object" && !Array.isArray(target[key]))
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
    spliceTypedArray(arr, start, end) {
      let s = arr.subarray(0, start);
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

  // ../libraries/escompose/src/graphscript/services/dom/DOM.service.ts
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
          options.onrender = (self2, info) => {
            const modal = ReactDOM.createPortal(template, options.id);
            onrender(self2, info);
          };
        }
      };
      this.customRoutes = {
        "dom": (r, route, routes) => {
          if (!(r instanceof GraphNode)) {
            if (r.element?.parentNode?.id && r.graph?.parentNode?.id) {
              if (r.graph.parentNode.id === r.element.id) {
                r.parentNode = this.parentNode;
              }
            } else {
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
            }
          }
          return r;
        }
      };
      this.customChildren = {
        "dom": (rt, routeKey, parent, routes, checked) => {
          if ((parent.tag || parent.id) && (parent.template || parent.context || parent.tagName || parent.element) && (rt.template || rt.context || rt.tagName || rt.element) && !rt.parentNode) {
            if (parent.tag)
              rt.parentNode = parent.tag;
            if (parent.id)
              rt.parentNode = parent.id;
          }
          return rt;
        }
      };
      this.elements = {};
      this.components = {};
      this.templates = {};
      this.addElement = (options, generateChildElementNodes = false) => {
        let elm = this.createElement(options);
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
        let node = this.resolveGraphNode(elm, options);
        let divs = Array.from(elm.querySelectorAll("*"));
        if (generateChildElementNodes) {
          divs = divs.map((d, i) => this.addElement({ element: d }));
        }
        this.elements[options.id] = { element: elm, node, parentNode: options.parentNode, divs };
        if (!node.ondelete)
          node.ondelete = (node2) => {
            elm.remove();
            if (options.onremove)
              options.onremove.call(this.elements[options.id].node, elm, this.elements[options.id]);
          };
        if (options.onresize) {
          let onresize2 = options.onresize;
          options.onresize = (ev) => {
            onresize2.call(this.elements[options.id].node, ev, elm, this.elements[options.id]);
          };
          window.addEventListener("resize", options.onresize);
        }
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
        let p = options.parentNode;
        delete options.parentNode;
        Object.defineProperty(options, "parentNode", {
          get: function() {
            return element.parentNode;
          },
          set: (v) => {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
            this.resolveParentNode(element, v ? v : this.parentNode, options, options.onrender);
          },
          enumerable: true,
          configurable: true
        });
        options.parentNode = p ? p : this.parentNode;
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
      this.resolveParentNode = (elm, parentNode, options, oncreate) => {
        if (!elm.parentNode) {
          setTimeout(() => {
            if (typeof parentNode === "string")
              parentNode = document.getElementById(parentNode);
            if (parentNode && typeof parentNode === "object") {
              parentNode.appendChild(elm);
            }
            if (oncreate)
              oncreate.call(elm.node, elm, this.elements[options.id]);
            if (elm.node.animation || elm.node.animate) {
              elm.node.runAnimation();
            }
            if (elm.node.looper || typeof elm.node.loop === "number" && elm.node.loop) {
              elm.node.runLoop();
            }
          }, 0.01);
        }
      };
      this.resolveGraphNode = (element, options) => {
        let node;
        if (this.nodes.get(options.id)?.element?.parentNode?.id === options.parentNode || this.nodes.get(options.id)?.parentNode === options.parentNode) {
          node = this.nodes.get(options.id);
        } else {
          let parentId = options.parentNode instanceof HTMLElement ? options.parentNode?.id : typeof options.parentNode === "string" ? options.parentNode : void 0;
          let parent;
          if (parentId)
            parent = this.nodes.get(parentId);
          node = new GraphNode(options instanceof Graph ? options : Object.assign({}, options), parent, this);
        }
        delete node.parentNode;
        Object.defineProperty(node, "parentNode", {
          get: function() {
            return element.parentNode;
          },
          set: (v) => {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
            this.resolveParentNode(element, v ? v : this.parentNode, options, options.onrender);
          },
          enumerable: true,
          configurable: true
        });
        if (!node["element"])
          Object.defineProperty(node, "element", {
            get: () => element,
            set: (v) => {
              element = v;
              node.nodes.forEach((n) => {
                if (node.source?._unique === n.graph?._unique)
                  n.parentNode = element;
              });
            }
          });
        node.element = element;
        element.node = node;
        let initialOptions = options._initial ?? options;
        for (let key in initialOptions) {
          if (typeof initialOptions[key] === "function") {
            const desc = Object.getOwnPropertyDescriptor(initialOptions, key);
            if (desc && desc.get && !desc.set)
              initialOptions = Object.assign({}, initialOptions);
            initialOptions[key] = initialOptions[key].bind(node);
          } else if (key === "attributes") {
            for (let key2 in initialOptions.attributes) {
              if (typeof initialOptions.attributes[key2] === "function") {
                initialOptions.attributes[key2] = initialOptions.attributes[key2].bind(node);
              }
            }
          }
        }
        return node;
      };
      this.addComponent = (options, generateChildElementNodes = true) => {
        if (options.onrender) {
          let oncreate = options.onrender;
          options.onrender = (element) => {
            oncreate.call(element.node, element, options);
          };
        }
        if (options.onresize) {
          let onresize2 = options.onresize;
          options.onresize = (element) => {
            onresize2.call(element.node, element, options);
          };
        }
        if (options.onremove) {
          let ondelete = options.onremove;
          options.onremove = (element) => {
            ondelete.call(element.node, self, options);
          };
        }
        if (typeof options.renderonchanged === "function") {
          let renderonchanged = options.renderonchanged;
          options.renderonchanged = (element) => {
            renderonchanged.call(element.node, element, options);
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
        let node = this.resolveGraphNode(elm, options);
        if (!node.ondelete)
          node.ondelete = (node2) => {
            elm.delete();
          };
        this.components[completeOptions.id] = {
          element: elm,
          class: CustomElement,
          node,
          divs,
          ...completeOptions
        };
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
            oncreate.call(element.node, element, options);
          };
        }
        if (options.onresize) {
          let onresize2 = options.onresize;
          options.onresize = (element) => {
            onresize2.call(element.node, element, options);
          };
        }
        if (options.ondelete) {
          let ondelete = options.onremove;
          options.onremove = (element) => {
            ondelete.call(element.node, element, options);
          };
        }
        if (typeof options.renderonchanged === "function") {
          let renderonchanged = options.renderonchanged;
          options.renderonchanged = (element) => {
            renderonchanged.call(element.node, element, options);
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
        let node = this.resolveGraphNode(elm, options);
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
        return this.components[completeOptions.id];
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

  // ../libraries/escompose/src/graphscript/services/router/Router.ts
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
        let user = Object.assign({}, info);
        if (connections) {
          for (const key in connections) {
            if (typeof connections[key] === "object") {
              if (!connections[key].connection._id) {
                await new Promise((res, rej) => {
                  let start = performance.now();
                  let checker = () => {
                    if (!connections[key].connection._id) {
                      if (performance.now() - start > 3e3) {
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
        let subscribe = (route, callback2, ...a) => {
          let connection = this.getConnection(user._id, "subscribe");
          if (connection?.subscribe)
            return connection.subscribe(route, callback2, ...a);
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
            if (this.sources[k]?.[sourceId]) {
              if (this.sources[k][sourceId].connectionType && this.sources[k][sourceId].service?.name) {
                if (!this.serviceConnections[this.sources[k][sourceId].service.service.name]) {
                  this.removeConnection(this.sources[k][sourceId].service);
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
        }
        if (typeof sourceId === "string" && this.connections[sourceId] && this.connections[sourceId].send) {
          return this.connections[sourceId];
        }
      };
      this.getConnections = (sourceId, hasMethod, props) => {
        if (this.sources[sourceId]) {
          if (!props && !hasMethod)
            return this.sources[sourceId];
          let found = {};
          for (const key in this.sources[sourceId]) {
            if (typeof this.sources[sourceId][key] === "object") {
              if (!this.sources[sourceId][key]._id) {
                for (const k in this.sources[sourceId][key]) {
                  if (typeof this.sources[sourceId][key][k] === "object") {
                    let pass = true;
                    if (hasMethod && !this.sources[sourceId][key][k][hasMethod])
                      pass = false;
                    for (const p in props) {
                      if (typeof this.sources[sourceId][key][k][p] === "object" && typeof props[p] === "object") {
                        for (const pp in props[p]) {
                          if (props[p][pp] !== this.sources[sourceId][key][k][p][pp]) {
                            pass = false;
                            break;
                          }
                        }
                      } else if (this.sources[sourceId][key][k][p] !== props[p]) {
                        pass = false;
                      } else {
                        pass = false;
                        break;
                      }
                    }
                    if (pass) {
                      found[this.sources[sourceId][key][k]._id] = this.sources[sourceId][key][k];
                    }
                  }
                }
              } else {
                let pass = true;
                if (hasMethod && !this.sources[sourceId][key][hasMethod])
                  pass = false;
                for (const p in props) {
                  if (typeof this.sources[sourceId][key][p] === "object" && typeof props[p] === "object") {
                    for (const pp in props[p]) {
                      if (props[p][pp] !== this.sources[sourceId][key][p][pp]) {
                        pass = false;
                        break;
                      }
                    }
                  } else if (this.sources[sourceId][key][p] !== props[p]) {
                    pass = false;
                  } else {
                    pass = false;
                    break;
                  }
                }
                if (pass) {
                  if (this.getConnection(this.sources[sourceId][key], hasMethod))
                    found[this.sources[sourceId][key]._id] = this.sources[sourceId][key];
                }
              }
            }
          }
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
                  settings.connectionsKey = k;
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
          settings.subscribe = async (route, callback2) => {
            return node.subscribe(callback2, route);
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
          settings.subscribe = async (route, callback2) => {
            return graph.subscribe(route, callback2);
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
                      settings.connectionsKey = c;
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
                    settings.connectionsKey = k;
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
                if (this.users[settings.source] && Object.keys(this.sources[settings.source]).length === 0) {
                  this.removeUser(settings.source, false);
                }
                if (oldonclose)
                  oldonclose(...args);
              };
            }
          } else {
            let oldonclose = c.onclose;
            c.onclose = (...args) => {
              this.removeConnection(settings);
              if (this.users[settings.source] && Object.keys(this.sources[settings.source]).length === 0) {
                this.removeUser(settings.source, false);
              }
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
              else {
                for (const k in this.sources[key]) {
                  if (this.sources[key][k]?.[connection]) {
                    delete this.sources[key][connection];
                  }
                }
              }
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
                  let start = performance.now();
                  let checker = () => {
                    if (!info._id) {
                      if (performance.now() - start > 3e3) {
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
                let start = performance.now();
                let checker = () => {
                  if (!connection._id) {
                    if (performance.now() - start > 3e3) {
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
      this.subscribeThroughConnection = (route, relay, endpoint, callback2, ...args) => {
        if (typeof relay === "string") {
          relay = this.getConnection(relay, "run");
        }
        if (typeof relay === "object")
          return new Promise((res, rej) => {
            relay.run("routeConnections", [route, endpoint, relay._id, ...args]).then((sub) => {
              this.subscribe(endpoint, (res2) => {
                if (res2?.callbackId === route) {
                  if (!callback2)
                    this.setState({ [endpoint]: res2.args });
                  else if (typeof callback2 === "string") {
                    this.setState({ [callback2]: res2.args });
                  } else
                    callback2(res2.args);
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
        for (const name2 in this.services) {
          if ("users" in this.services[name2])
            this.services[name2].users = this.users;
          this.nodes.forEach((n, tag) => {
            if (!this.services[name2].nodes.get(n.tag)) {
              this.services[name2].nodes.set(n.tag, n);
            } else {
              if (!this.services[name2].nodes.get(tag) && n._UNIQUE !== this.services[name2].nodes.get(n.tag)._UNIQUE)
                this.services[name2].nodes.set(tag, n);
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

  // ../libraries/escompose/src/transform.ts
  var transform_default = (tag, node) => {
    const args = node.arguments;
    let graph;
    Array.from(args.keys()).forEach((arg, i) => node[`${arg}`] = args.get(arg).state);
    const originalOperator = node.operator;
    if (typeof originalOperator === "function") {
      node.operator = function(...argsArr) {
        let updatedArgs = [];
        let i = 0;
        args.forEach((o, k) => {
          const argO = args.get(k);
          const proxy = `${k}`;
          const currentArg = argO.spread ? argsArr.slice(i) : argsArr[i];
          const target = graph.node ?? graph;
          let update = currentArg !== void 0 ? currentArg : target[proxy];
          target[proxy] = update;
          if (!argO.spread)
            update = [update];
          updatedArgs.push(...update);
          i++;
        });
        return originalOperator.call(this ?? node, ...updatedArgs);
      };
    }
    graph = new Graph({}, tag, node);
    return graph;
  };

  // ../libraries/escompose/src/parse.js
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
      let [name2, value] = v.split("=");
      name2 = name2.trim();
      name2 = name2.replace(/\d+$/, "");
      const spread = name2.includes("...");
      name2 = name2.replace("...", "");
      try {
        if (name2)
          info.set(name2, {
            state: value ? (0, eval)(`(${value})`) : value,
            spread
          });
      } catch (e) {
        info.set(name2, {});
        console.warn(`Argument ${name2} could not be parsed for`, fn.toString(), value);
      }
    });
    return info;
  }
  var parse_default = getFnParamInfo;

  // ../libraries/escompose/src/index.ts
  var isNode = "process" in globalThis;
  var Component = class {
    constructor(esm2, options = {}, parent) {
      this.#cache = {};
      this.#components = {};
      this.#active = false;
      this.listeners = {
        pool: {
          in: {},
          out: {}
        },
        active: {},
        includeParent: {}
      };
      this.components = {};
      this.#toRun = false;
      this.#runProps = true;
      this.#ondelete = () => {
        this.element.remove();
        if (this.#instance.onremove && this.#instance.element instanceof Element)
          this.#instance.onremove.call(this);
      };
      this.#createTree = () => {
        let tree = {};
        for (let tag in this.#components) {
          let thisNode = this.#components[tag].graph;
          if (this.#cache[tag]) {
            let gs = this.#cache[tag].graph;
            const ref = gs.node ? gs.node : gs;
            thisNode = {};
            for (let key in ref._initial)
              thisNode[key] = ref[key];
            thisNode.tag = tag;
            gs.state.triggers = {};
          }
          tree[tag] = this.#create(tag, thisNode);
        }
        return tree;
      };
      this.#activate = () => {
        if (this.initial.components) {
          let tree = this.#createTree();
          const props = this.#instance ?? this.initial;
          this.graph = isNode ? new Graph(tree, this.#options.tag, props) : new DOMService({ routes: tree, name: this.#options.tag, props: this.#runProps ? props : void 0 }, this.#options.parentNode);
          this.#router.load(this.graph);
          for (let tag in this.#components) {
            const cache2 = this.#cache[tag];
            if (cache2)
              cache2.graph = tree[tag];
          }
        }
      };
      this.start = async (defer) => {
        if (this.#active === false) {
          this.#active = true;
          const activateFuncs = [];
          for (let key in this.components) {
            const o = this.components[key];
            await o.start((f2) => {
              activateFuncs.push(f2);
            });
          }
          this.#activate();
          const f = async (top) => {
            const toRun = [];
            for (let f2 of activateFuncs)
              toRun.push(...await f2(top));
            const listeners = [{ reference: {} }, { reference: {} }];
            let toListenTo = {
              ...this.initial.listeners
            };
            let listenTo = false;
            for (let key in this.initial.children) {
              if (!(this.initial.children[key] instanceof GraphNode))
                listenTo = true;
            }
            const basePath = this.getPath();
            if (listenTo) {
              toListenTo[basePath] = true;
            }
            Object.entries(toListenTo).forEach(([key, value]) => {
              for (let target in value)
                listeners[1].reference[target] = true;
              listeners[0].reference[key] = true;
            });
            const targets = [
              {
                reference: this.initial.children,
                condition: (child) => child === void 0,
                map: false
              },
              ...listeners
            ];
            targets.forEach((o) => {
              for (let path in o.reference) {
                if (!o.condition || o.condition(o.reference[path])) {
                  const updated = `${top.graph.name}.${path}`;
                  let split = updated.split(".");
                  const lastKey = split.pop();
                  const absolute = path.split(".").slice(0, -1);
                  const relative = [...basePath ? basePath.split(".") : [], ...absolute];
                  let last = top.graph;
                  let resolved = this.#router.nodes.get(updated);
                  if (resolved)
                    last = this.#router.nodes.get(split.join(".")) ?? top.graph;
                  else {
                    const get = (str, target) => target.nodes.get(str) ?? target[str];
                    split = relative;
                    try {
                      split.forEach((str) => last = get(str, last));
                      resolved = lastKey ? get(lastKey, last) : last;
                    } catch {
                      last = top.graph;
                      split = absolute;
                      absolute.forEach((str) => last = get(str, last));
                      resolved = lastKey ? get(lastKey, last) : last;
                    }
                  }
                  const used = split.join(".");
                  const relJoin = relative.join(".");
                  const isSame2 = basePath === path;
                  const mainPath = basePath && !isSame2 && o.map !== false ? `${basePath}.${path}` : path;
                  o.reference[mainPath] = { resolved, last, lastKey, path: {
                    used,
                    absolute: absolute ? absolute.join(".") : null,
                    relative: relative ? relJoin : null
                  } };
                }
              }
            });
            let listenerPool = {
              in: listeners[1].reference,
              out: listeners[0].reference
            };
            const getKey = (key) => basePath ? `${basePath}.${key}` : key;
            for (let key in toListenTo) {
              const mainKey = getKey(key);
              const base = top.listeners.active[mainKey] = {};
              for (let inner in toListenTo[key]) {
                const newKey = getKey(inner);
                base[newKey] = toListenTo[key][inner];
              }
            }
            for (let key in this.listeners.includeParent)
              top.listeners.includeParent[key] = this.listeners.includeParent[key];
            for (let type in listenerPool) {
              top.listeners.pool[type] = {
                ...listenerPool[type],
                ...top.listeners.pool[type]
              };
            }
            this.listeners = top.listeners;
            for (let key in listenerPool.out) {
              const node = listenerPool.out[key].resolved;
              if (node instanceof GraphNode) {
                const path = this.getPath(node, true);
                if (this.listeners.includeParent[path])
                  this.listeners.includeParent[path] = true;
                this.subscribe(node);
              }
            }
            if (this.#toRun)
              toRun.push(this.run);
            return toRun;
          };
          const graph = this.initial.components;
          if (graph) {
            const ports = graph.ports;
            let firstNode, lastNode;
            if (ports) {
              firstNode = await this.graph.get(ports.input);
              lastNode = this.graph.get(ports.output);
            } else {
              const nodes = Array.from(this.graph.nodes.values());
              firstNode = nodes[0];
              lastNode = nodes.slice(-1)[0];
            }
            if (lastNode) {
              const path = this.getPath(lastNode, true);
              this.listeners.includeParent[path] = lastNode;
            }
            if (firstNode && !this.#initial.default)
              this.#initial.operator = async function(...args) {
                await firstNode.run(...args);
              };
            else
              this.#initial.operator = this.#initial.default;
          }
          if (typeof defer === "function")
            defer(f);
          else {
            const toRun = await f(this);
            for (let key in this.listeners.includeParent) {
              const toResolve2 = this.listeners.includeParent[key];
              if (toResolve2 !== true) {
                this.subscribe(toResolve2);
                this.listeners.includeParent[key] = true;
              }
            }
            await Promise.all(toRun.map((f2) => f2()));
          }
        }
      };
      this.getPath = (graph = this.graph, includeTag = false) => {
        const basePath = [];
        let target = graph;
        do {
          if (target instanceof GraphNode)
            target = { node: target };
          if (target.node) {
            basePath.push(target.node.name);
            target = target.node.graph;
          }
        } while (target.node);
        if (includeTag)
          return [...basePath.reverse(), graph.tag].join(".");
        else
          return basePath.reverse().join(".");
      };
      this.subscribe = (node) => {
        const path = this.getPath(node) || node.tag;
        const targets = [node.children];
        for (let key in this.listeners.active[path]) {
          const res = this.listeners.pool.in[key];
          if (res)
            this.listeners.active[path][key] = res;
          else
            delete this.listeners.active[path][key];
        }
        targets.push(this.listeners.active[path]);
        let aggregatedParent = false;
        const aggregate = (arr) => {
          const aggregate2 = {};
          arr.forEach((o) => {
            for (let key in o) {
              if (!(key in aggregate2))
                aggregate2[key] = [o[key]];
              else {
                const ref1 = aggregate2[key];
                const ref2 = o[key];
                const message = `Both children and listeners are declared for ${key}`;
                const getId = (o2) => o2._unique ?? o2.resolved._unique ?? o2.last._unique;
                const aggregateIds = ref1.map(getId);
                if (!aggregateIds.includes(getId(ref2))) {
                  console.warn(`${message}. Aggregating`, ref1, ref2);
                  ref1.push(ref2);
                } else
                  console.warn(`${message}. Removing`, ref2);
              }
            }
          });
          return aggregate2;
        };
        let aggregated = aggregate(targets);
        node.subscribe((args) => {
          if (path in this.listeners.includeParent && !aggregatedParent) {
            aggregated = aggregate([aggregated, node.graph.children]);
            aggregatedParent = true;
          }
          for (let tag in aggregated)
            aggregated[tag].forEach((info) => this.resolve(args, info, aggregated));
        });
      };
      this.resolve = (args, info) => {
        if (info.resolved instanceof GraphNode)
          info = info.resolved;
        if (info instanceof GraphNode) {
          if (Array.isArray(args))
            this.#runGraph(info, ...args);
          else
            this.#runGraph(info, args);
        } else {
          let res;
          if (typeof info.resolved === "function") {
            if (Array.isArray(args))
              res = info.resolved.call(info.last, ...args);
            else
              res = info.resolved.call(info.last, args);
          } else
            res = info.resolved = info.last[info.lastKey] = args;
          let resolved = this.listeners.active[`${info.path.used}.${info.lastKey}`];
          if (!resolved)
            resolved = this.listeners.active[info.lastKey];
          for (let key in resolved)
            this.resolve(res, this.listeners.pool.in[key]);
        }
      };
      this.stop = () => {
        if (this.#active === true) {
          for (let k in this.nested)
            this.nested[k].stop();
          if (this.graph)
            this.graph.nodes.forEach((n) => {
              this.graph.removeTree(n);
              n.stopNode();
              this.graph.state.triggers = {};
            });
          this.#active = false;
        }
      };
      this.#create = (tag, info) => {
        if (typeof info === "function")
          info = { default: info };
        if (!info || info instanceof Graph)
          return info;
        else {
          let activeInfo;
          if (info instanceof Component) {
            activeInfo = info.instance;
            info = info.initial;
          }
          const args = info.default instanceof Function ? parse_default(info.default) ?? /* @__PURE__ */ new Map() : /* @__PURE__ */ new Map();
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
                const got = args.get(key);
                if (got) {
                  got.state = v;
                  if (input === key)
                    this.#toRun = true;
                }
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
      this.#runGraph = async (graph = this.graph, ...args) => {
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
      this.#runDefault = (graph, ...args) => graph.run(graph.nodes.values().next().value, ...args);
      this.run = async (...args) => this.#runGraph(this.graph, ...args);
      this.#initial = esm2;
      this.#options = options;
      this.#router = options._router ? options._router : options._router = new Router({
        linkServices: false,
        includeClassName: false
      });
      do {
        this.#initial = this.initial.initial ?? this.initial;
      } while (this.initial instanceof Component);
      if (parent)
        parent.components[this.#initial.id] = this;
      const hasDefault = "default" in this.initial;
      let hasComponents = !!esm2.components;
      const parentHasComponents = !!parent?.components;
      this.parent = parent;
      const isFunctionCollection = !parentHasComponents && !hasDefault && !hasComponents;
      if (isFunctionCollection) {
        let newNode = { components: {} };
        for (let namedExport in esm2)
          newNode.components[namedExport] = { default: esm2[namedExport] };
        this.#initial = newNode;
        hasComponents = true;
        this.#runProps = false;
      }
      if (hasComponents) {
        const toNotify = [];
        const components = this.initial.components;
        for (let tag in components) {
          const node2 = components[tag];
          if (!(node2 instanceof Component)) {
            const clonedOptions = Object.assign({}, Object.assign(options));
            const component = new Component(node2, Object.assign(clonedOptions, { tag }), esm2);
            this.#components[tag] = component;
            toNotify.push(component);
          } else
            this.#cache[tag] = this.#components[tag] = node2;
        }
        const thisTag = this.#options.tag;
        toNotify.forEach((o) => {
          let tag = o.#options.tag;
          if (thisTag)
            tag = `${thisTag}.${tag}`;
          this.components[o.#options.tag] = o;
          if (typeof options.onComponent === "function")
            options.onComponent(tag, o);
        });
      } else
        this.graph = this.#create(options.tag ?? "defaultComponentTag", this.initial);
      Object.defineProperty(this, "tag", {
        get: () => this.graph?.tag,
        enumerable: true
      });
    }
    #initial;
    #options;
    #instance;
    #graph;
    #router;
    #cache;
    #components;
    #active;
    #toRun;
    #runProps;
    get parentNode() {
      if (this.#instance.element instanceof Element)
        return this.#instance.element.parentNode;
    }
    set parentNode(v) {
      if (v instanceof Component)
        v = v.element;
      if (this.#instance.element instanceof Element) {
        if (this.#instance.element.parentNode)
          this.#instance.element.remove();
        if (v)
          v.appendChild(this.#instance.element);
      } else
        console.error("No element specified...");
    }
    get element() {
      if (this.#instance.element instanceof Element)
        return this.#instance.element;
    }
    set element(v) {
      if (this.#instance.element instanceof Element) {
        this.#instance.element = v;
        for (let name2 in this.components)
          this.components[name2].parentNode = v;
      } else
        console.error("No element specified...");
    }
    #ondelete;
    #onresize;
    set onresize(foo) {
      if (this.#onresize)
        window.removeEventListener("resize", this.#onresize);
      this.#onresize = (ev) => {
        if (onresize && this.#instance.element instanceof Element)
          foo.call(this, ev);
      };
      window.addEventListener("resize", this.#onresize);
    }
    get initial() {
      return this.#initial;
    }
    get instance() {
      return this.#instance;
    }
    get graph() {
      return this.#graph;
    }
    set graph(v) {
      this.#graph = v;
    }
    #createTree;
    #activate;
    #create;
    #runGraph;
    #runDefault;
  };
  var src_default = Component;

  // ../libraries/escompose/src/create/utils/update.ts
  var update_default = (id2, esm2, parent) => {
    if (!esm2.id && id2)
      esm2.id = id2;
    if (!esm2.id)
      esm2.id = `${esm2.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
    if (esm2.element instanceof Element) {
      let p = esm2.parentNode;
      delete esm2.parentNode;
      Object.defineProperty(esm2, "parentNode", {
        get: function() {
          if (esm2.element instanceof Element)
            return esm2.element.parentNode;
        },
        set: (v) => {
          if (esm2.element instanceof Element) {
            if (esm2.element.parentNode)
              esm2.element.remove();
            if (v)
              v.appendChild(esm2.element);
          }
        },
        enumerable: true,
        configurable: true
      });
      const parentEl = parent?.element instanceof Element ? parent.element : void 0;
      esm2.parentNode = p ? p : parentEl;
      esm2.element.id = esm2.id;
      if (esm2.attributes) {
        for (let key in esm2.attributes) {
          if (typeof esm2.attributes[key] === "function")
            esm2.element[key] = (...args) => esm2.attributes[key](...args);
          else
            esm2.element[key] = esm2.attributes[key];
        }
      }
      if (esm2.element instanceof HTMLElement) {
        if (esm2.style)
          Object.assign(esm2.element.style, esm2.style);
      }
    }
    return esm2;
  };

  // ../libraries/escompose/src/create/element.ts
  function add(id2, esm2, parent) {
    let elm = create(id2, esm2, parent);
    if (!esm2.element)
      esm2.element = elm;
    if (!esm2.default)
      esm2.default = function(props) {
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
    return esm2;
  }
  function create(id2, esm2, parent) {
    if (esm2.element) {
      if (typeof esm2.element === "string") {
        const elm = document.querySelector(esm2.element);
        if (!elm) {
          const elm2 = document.getElementById(esm2.element);
          if (elm2)
            esm2.element = elm2;
        } else
          esm2.element = elm;
      }
    } else if (esm2.tagName)
      esm2.element = document.createElement(esm2.tagName);
    else if (esm2.id) {
      const elm = document.getElementById(esm2.id);
      if (elm)
        esm2.element = elm;
    }
    if (!(esm2.element instanceof Element))
      throw new Error("Invalid element");
    update_default(id2, esm2, parent);
    return esm2.element;
  }

  // ../libraries/common/clone.js
  var deep = (obj) => {
    const seen = [];
    const fromSeen = [];
    let drill = (obj2, acc = {}) => {
      for (let key in obj2) {
        const val = obj2[key];
        if (val && typeof val === "object") {
          const name2 = val.constructor.name;
          if (name2 === "Object" || name2 === "Array") {
            console.log("Cnstructor", val.constructor.name);
            const idx = seen.indexOf(val);
            if (idx !== -1)
              acc[key] = fromSeen[idx];
            else {
              seen.push(val);
              acc[key] = Array.isArray(val) ? [] : {};
              fromSeen.push(acc[key]);
              acc[key] = drill(val, acc[key]);
            }
          } else
            acc[key] = val;
        } else
          acc[key] = val;
      }
      return acc;
    };
    return drill(obj);
  };

  // ../libraries/escompose/src/create/index.ts
  var create_default = (id2, esm2, parent) => {
    esm2 = deep(esm2);
    esm2 = add(id2, esm2, parent);
    const component = new src_default(esm2, parent?.options, parent);
    esm2.element.component = component;
    let initialesm = esm2._initial ?? esm2;
    for (let key in initialesm) {
      if (typeof initialesm[key] === "function") {
        const desc = Object.getOwnPropertyDescriptor(initialesm, key);
        if (desc && desc.get && !desc.set)
          initialesm = Object.assign({}, initialesm);
        initialesm[key] = initialesm[key].bind(component);
      } else if (key === "attributes") {
        for (let key2 in initialesm.attributes) {
          if (typeof initialesm.attributes[key2] === "function") {
            initialesm.attributes[key2] = initialesm.attributes[key2].bind(component);
          }
        }
      }
    }
    return component;
  };

  // ../components/ui/button.js
  var button_exports = {};
  __export(button_exports, {
    attributes: () => attributes,
    cache: () => cache,
    default: () => button_default,
    tagName: () => tagName
  });
  var tagName = "button";
  var attributes = {
    innerHTML: "Click Me",
    onmousedown: function() {
      this.run({ value: true, _internal: true });
      const onMouseUp = () => {
        this.run({ value: false, _internal: true });
        globalThis.removeEventListener("mouseup", onMouseUp);
      };
      globalThis.addEventListener("mouseup", onMouseUp);
    }
  };
  var cache = null;
  function button_default(input) {
    const value = input?.value ?? input;
    const isInternal = input?._internal;
    console.log("Clickied", value, isInternal);
    if (isInternal) {
      if (this.cache) {
        if (value)
          return this.cache;
      } else
        return value;
    } else if (value)
      this.cache = value;
  }

  // ../libraries/common/check.js
  var moduleStringTag = "[object Module]";
  var esm = (object2) => {
    const res = object2 && (!!Object.keys(object2).reduce((a, b) => {
      const desc = Object.getOwnPropertyDescriptor(object2, b);
      const isModule = desc && desc.get && !desc.set ? 1 : 0;
      return a + isModule;
    }, 0) || Object.prototype.toString.call(object2) === moduleStringTag);
    return !!res;
  };

  // ../libraries/esmonitor/index.js
  var isSame = (a, b) => {
    if (a && typeof a === "object") {
      const jA = JSON.stringify(a);
      const jB = JSON.stringify(b);
      return jA === jB;
    } else
      return a === b;
  };
  var defaultSamplingRate = 60;
  var Monitor = class {
    listeners = {
      polling: {},
      functions: {},
      getters: {}
    };
    references = {};
    #pollingId;
    #sps;
    polling = Object.defineProperties({}, {
      sps: {
        get: () => this.#sps,
        set: (sps) => {
          this.#sps = sps;
          if (this.#pollingId)
            clearInterval(this.#pollingId);
          this.#pollingId = setInterval(this.poll, 1e3 / sps);
        },
        enumerable: true
      }
    });
    constructor(opts = {}) {
      if (opts.polling)
        for (let key in opts.polling)
          this.polling[key] = opts.polling[key];
      this.sps = defaultSamplingRate;
    }
    poll = () => {
      const listeners = this.listeners.polling;
      for (let sym of Object.getOwnPropertySymbols(listeners)) {
        let { fullPath, callback: callback2, accessor, history, path } = listeners[sym];
        const ref = accessor();
        if (!isSame(ref, history)) {
          callback2(fullPath, ref);
          listeners[sym].history = typeof ref === "object" ? Object.assign({}, ref) : ref;
        }
      }
    };
    listen = (id2, callback2, opts = {}) => {
      const { reference } = opts;
      if (!opts.poll)
        opts.poll = esm(reference);
      const forcePoll = opts.poll;
      let path = opts.path ?? [];
      if (!this.references[id2])
        this.references[id2] = reference;
      let accessor = () => {
        let ref2 = this.references[id2];
        path.forEach((str) => {
          if (str in ref2)
            ref2 = ref2[str];
          else
            throw new Error(`Invalid path: ${path}`, this.references[name]);
        });
        return ref2;
      };
      let ref = accessor();
      const toMonitorInternally = (val, allowArrays = false) => {
        const first = val && typeof val === "object";
        if (!first)
          return false;
        else if (allowArrays)
          return true;
        else
          return !Array.isArray(val);
      };
      const createInfo = (path2, reference2) => {
        const fullPath = path2.join(".");
        return { id: id2, fullPath, callback: callback2, accessor, path: path2, history: typeof reference2 === "object" ? Object.assign({}, reference2) : reference2 };
      };
      if (toMonitorInternally(ref, true)) {
        let subs = {};
        const drill = (obj, path2 = []) => {
          for (let key in obj) {
            const val = obj[key];
            const newPath = [...path2, key];
            if (toMonitorInternally(val))
              drill(val, newPath);
            else {
              if (typeof val === "function") {
                if (forcePoll) {
                  console.warn(`Skipping subscription to ${[id2, ...newPath].join(".")} since its parent is ESM.`);
                } else {
                  const info = createInfo(newPath, obj);
                  const sub = this.monitorFunction(info);
                  Object.assign(subs, sub);
                }
              } else {
                const internalSubs = this.listen(id2, callback2, { ...opts, path: newPath });
                Object.assign(subs, internalSubs);
              }
            }
          }
        };
        drill(ref);
        return subs;
      } else {
        const info = createInfo(path, ref);
        const sub = info.sub = Symbol("subscription");
        try {
          if (forcePoll)
            this.listeners.polling[sub] = info;
          else if (typeof ref === "function")
            this.monitorFunction(info);
          else {
            let ref2 = this.references[info.id];
            const path2 = [...info.path];
            let last = path2.pop();
            path2.forEach((key) => ref2 = ref2[key]);
            let val = ref2[last];
            Object.defineProperty(ref2, last, {
              get: () => val,
              set: (v) => {
                info.callback(info.fullPath, v);
                val = v;
              },
              enumerable: true
            });
            this.listeners.getters[sub] = {
              ref: ref2,
              last
            };
          }
        } catch (e) {
          console.warn("Fallback to polling", e);
          this.listeners.polling[sub] = info;
        }
        return {
          [info.path.join(".")]: sub
        };
      }
    };
    monitorFunction = (info) => {
      let ref = this.references[info.id];
      const path = [...info.path];
      let last = path.pop();
      path.forEach((key) => ref = ref[key]);
      const original2 = ref[last];
      ref[last] = function(...args) {
        const output = original2.call(this, ...args);
        info.callback(info.fullPath, output);
        return output;
      };
      this.listeners.functions[info.sub] = {
        ref,
        last,
        original: original2
      };
    };
    stop = (subs) => {
      if (typeof subs !== "object")
        subs = { sub: subs };
      for (let key in subs) {
        const sub = subs[key];
        const polling = this.listeners.polling[sub];
        if (polling) {
          delete this.listeners.polling[sub];
          return true;
        }
        const func = this.listeners.functions[sub];
        if (func) {
          func.ref[func.last] = func.original;
          delete this.listeners.functions[sub];
          return true;
        }
        const getter = this.listeners.getters[sub];
        if (getter) {
          const ref = getter.ref;
          const last = getter.last;
          const value = ref[last];
          Object.defineProperty(ref, last, { value });
          delete this.listeners.getters[sub];
          return true;
        }
      }
    };
  };

  // ../libraries/esmpile/tests/basic/index.js
  var basic_exports = {};
  __export(basic_exports, {
    imports: () => imports
  });

  // ../libraries/esmpile/tests/basic/update.js
  var update_exports = {};
  __export(update_exports, {
    default: () => update_default2,
    mirror: () => mirror,
    nExecution: () => nExecution
  });

  // ../libraries/esmpile/tests/basic/dependency.js
  var toResolve;
  setTimeout(() => {
    toResolve = {
      test: true
    };
  }, 300);

  // ../libraries/esmpile/tests/basic/update.js
  var original = toResolve ? JSON.parse(JSON.stringify(toResolve)) : toResolve;
  var nExecution = 0;
  var mirror = 0;
  var update_default2 = () => {
    nExecution++;
    setTimeout(() => mirror = nExecution, 500);
    console.log(`original`, original);
    console.log(`namespace`, toResolve);
    console.log(`named`, toResolve);
    console.log(`nExecution`, nExecution);
    return toResolve === toResolve;
  };

  // ../libraries/esmpile/tests/basic/index.js
  var imports = update_exports;

  // index.js
  var section = document.querySelector("section");
  var movingButton = create_default("button", button_exports);
  var copy = Object.assign({}, button_exports);
  copy.attributes = Object.assign({}, copy.attributes);
  copy.attributes.innerHTML = "Remove Listeners";
  var removeButton = create_default("remove", copy);
  var counter = 0;
  var createContainer = () => {
    const container = create_default(`container${counter}`, {
      tagName: "div",
      attributes: {
        innerHTML: `Click Me to Reparent Button`,
        onclick: () => {
          movingButton.parentNode = container;
        }
      }
    });
    counter++;
    return container;
  };
  var container1 = createContainer();
  var container2 = createContainer();
  var container3 = createContainer();
  container1.parentNode = section;
  container2.parentNode = section;
  container3.parentNode = section;
  removeButton.parentNode = section;
  movingButton.parentNode = container1;
  var monitor = new Monitor({
    polling: {
      sps: 60
    }
  });
  var callback = (id2, path, update) => {
    const p = document.createElement("p");
    p.innerHTML = `<b>${id2}.${path}:</b> ${JSON.stringify(update)}`;
    section.appendChild(p);
  };
  var id = "test";
  var testSubs = monitor.listen(id, (...args) => {
    callback(id, ...args);
  }, {
    reference: basic_exports
  });
  var buttonSubs = monitor.listen(movingButton.instance.id, (...args) => {
    if (args[0] === "attributes.onmousedown")
      imports.default();
    callback(movingButton.instance.id, ...args);
  }, {
    reference: movingButton.instance,
    path: ["attributes", "onmousedown"]
  });
  var objectId = "object";
  var object = {
    test: true
  };
  var objectSubs = monitor.listen(objectId, (...args) => {
    callback(objectId, ...args);
  }, {
    reference: object
  });
  object.test = false;
  var removeSubs = monitor.listen(removeButton.instance.id, (...args) => {
    if (args[0] === "attributes.onmousedown") {
      monitor.stop(testSubs);
      monitor.stop(buttonSubs);
      monitor.stop(objectSubs);
      monitor.stop(removeSubs);
      object.test = true;
    }
    callback(removeButton.instance.id, ...args);
  }, {
    reference: removeButton.instance,
    path: ["attributes", "onmousedown"]
  });
})();