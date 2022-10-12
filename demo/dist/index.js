(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

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
          if (typeof v === "string") {
            const newValue = document.querySelector(v);
            if (newValue)
              v = newValue;
            else
              v = document.getElementById(v);
          }
          if (v?.element instanceof Element)
            v = v.element;
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
      console.warn("Element not found for", id2);
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
          const name = val.constructor.name;
          if (name === "Object" || name === "Array") {
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
    if (esm2.element)
      esm2.element.component = esm2;
    let initialesm = esm2._initial ?? esm2;
    for (let key in initialesm) {
      if (typeof initialesm[key] === "function") {
        const desc = Object.getOwnPropertyDescriptor(initialesm, key);
        if (desc && desc.get && !desc.set)
          initialesm = Object.assign({}, initialesm);
        const og = initialesm[key];
        initialesm[key] = (...args) => og.call(esm2, ...args);
      } else if (key === "attributes") {
        for (let key2 in initialesm.attributes) {
          if (typeof initialesm.attributes[key2] === "function") {
            const og = initialesm.attributes[key2];
            initialesm.attributes[key2] = (...args) => og.call(esm2, ...args);
          }
        }
      }
    }
    return esm2;
  };

  // components/button.js
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
      this.default({ value: true, _internal: true });
      const onMouseUp = () => {
        this.default({ value: false, _internal: true });
        globalThis.removeEventListener("mouseup", onMouseUp);
      };
      globalThis.addEventListener("mouseup", onMouseUp);
    }
  };
  var cache = null;
  function button_default(input) {
    const value = input?.value ?? input;
    const isInternal = input?._internal;
    if (isInternal) {
      if (this.cache) {
        if (value)
          return this.cache;
      } else
        return value;
    } else if (value)
      this.cache = value;
  }

  // components/container.js
  var container_exports = {};
  __export(container_exports, {
    attributes: () => attributes2,
    componentToMove: () => componentToMove,
    tagName: () => tagName2
  });
  var tagName2 = "div";
  var componentToMove;
  var attributes2 = {
    innerHTML: `Click Me to Reparent Button`,
    onclick: function() {
      if (this.componentToMove) {
        if (typeof this.componentToMove === "string") {
          const el = document.getElementById(this.componentToMove);
          if (el.component)
            this.componentToMove = el.component;
          else
            return console.error("component not found");
        }
        this.componentToMove.parentNode = this.element;
      }
    }
  };

  // ../libraries/common/check.js
  var moduleStringTag = "[object Module]";
  var esm = (object) => {
    const res = object && (!!Object.keys(object).reduce((a, b) => {
      const desc = Object.getOwnPropertyDescriptor(object, b);
      const isModule = desc && desc.get && !desc.set ? 1 : 0;
      return a + isModule;
    }, 0) || Object.prototype.toString.call(object) === moduleStringTag);
    return !!res;
  };

  // ../libraries/esmonitor/src/utils.ts
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

  // ../libraries/esmonitor/src/Poller.ts
  var defaultSamplingRate = 60;
  var Poller = class {
    constructor(listeners, sps) {
      this.listeners = {};
      this.setOptions = (opts = {}) => {
        for (let key in opts)
          this[key] = opts[key];
      };
      this.add = (info) => {
        const sub = info.sub;
        this.listeners[sub] = info;
        this.start();
      };
      this.get = (sub) => this.listeners[sub];
      this.remove = (sub) => {
        delete this.listeners[sub];
        if (!Object.keys(this.listeners).length)
          this.stop();
      };
      this.poll = (listeners) => {
        iterateSymbols(listeners, (sym, value) => {
          let { path, callback, current, history } = value;
          if (!isSame(current, history)) {
            callback(path.output, current);
            if (typeof current === "object") {
              if (Array.isArray(current))
                history = [...current];
              else
                history = { ...current };
            } else
              listeners[sym].history = current;
          }
        });
      };
      this.start = (listeners = this.listeners) => {
        if (!this.sps)
          this.sps = defaultSamplingRate;
        else if (!this.#pollingId) {
          this.#pollingId = setInterval(() => this.poll(listeners), 1e3 / this.sps);
        }
      };
      this.stop = () => {
        if (this.#pollingId)
          clearInterval(this.#pollingId);
      };
      if (listeners)
        this.listeners = listeners;
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
      const listeners = this.listeners;
      const nListeners = Object.keys(listeners).length;
      if (nListeners) {
        this.stop();
        this.start();
      }
    }
  };

  // ../libraries/esmonitor/src/listeners.ts
  var listeners_exports = {};
  __export(listeners_exports, {
    functions: () => functions,
    getters: () => getters
  });
  var register = (info, collection) => {
    if (!collection[info.path.absolute])
      collection[info.path.absolute] = {};
    collection[info.path.absolute][info.sub] = info;
  };
  var get = (info, collection) => collection[info.path.absolute];
  var handler = (info, collection, subscribeCallback) => {
    if (!get(info, collection)) {
      let parent = info.parent;
      let val = parent[info.last];
      subscribeCallback(val, parent);
    }
    register(info, collection);
  };
  var getters = (info, collection) => {
    handler(info, collection, (value, parent) => {
      let val = value;
      Object.defineProperty(parent, info.last, {
        get: () => val,
        set: async (v) => {
          const listeners = Object.assign({}, collection[info.path.absolute]);
          await iterateSymbols(listeners, (_, o) => o.callback(o.path.output, v));
          val = v;
        },
        enumerable: true
      });
    });
  };
  var functions = (info, collection) => {
    handler(info, collection, (_, parent) => {
      parent[info.last] = async function(...args) {
        const listeners = Object.assign({}, collection[info.path.absolute]);
        const output = await info.original.call(this, ...args);
        await iterateSymbols(listeners, (_2, o) => o.callback(o.path.output, output));
        return output;
      };
    });
  };

  // ../libraries/esmonitor/src/Monitor.ts
  var Monitor = class {
    constructor(opts = {}) {
      this.poller = new Poller();
      this.options = {
        pathFormat: "relative"
      };
      this.listenerLookup = {};
      this.listeners = {
        polling: this.poller.listeners,
        functions: {},
        getters: {}
      };
      this.references = {};
      this.get = (path) => {
        if (typeof path === "string")
          path = path.split(".");
        path = [...path];
        let ref = this.references;
        path.forEach((str) => {
          if (str in ref)
            ref = ref[str];
          else {
            console.error(`Could not get path: ${path.join(".")}`);
            return;
          }
        });
        return ref;
      };
      this.set = (path, value) => {
        if (typeof path === "string")
          path = path.split(".");
        path = [...path];
        let ref = this.references;
        const copy = [...path];
        const last = copy.pop();
        copy.forEach((str) => {
          if (str in ref)
            ref = ref[str];
          else {
            console.error(`Could not set path: ${path.join(".")}`);
            return;
          }
        });
        ref[last] = value;
      };
      this.on = (absPath, callback) => {
        const split = absPath.split(".");
        const id2 = split[0];
        return this.listen(id2, callback, split.slice(1));
      };
      this.createInfo = (id2, callback, path, original2) => {
        if (typeof path === "string")
          path = path.split(".");
        const relativePath = path.join(".");
        const refs = this.references;
        const get2 = this.get;
        const set = this.set;
        const info = {
          id: id2,
          path: {
            absolute: [id2, ...path].join("."),
            relative: relativePath,
            parent: [id2, ...path.slice(0, -1)].join(".")
          },
          callback,
          get current() {
            return get2(info.path.absolute);
          },
          set current(val) {
            set(info.path.absolute, val);
          },
          get parent() {
            return get2(info.path.parent);
          },
          get reference() {
            return refs[id2];
          },
          set reference(val) {
            refs[id2] = val;
          },
          original: original2,
          history: typeof original2 === "object" ? Object.assign({}, original2) : original2,
          sub: Symbol("subscription"),
          last: path.slice(-1)[0]
        };
        info.path.output = info.path[this.options.pathFormat];
        this.listenerLookup[info.sub] = info.path.absolute;
        return info;
      };
      this.listen = (id2, callback, path = [], __internal = {}) => {
        const reference = this.references[id2];
        if (!reference) {
          console.error(`Reference ${id2} does not exist.`);
          return;
        }
        if (!__internal.poll)
          __internal.poll = esm(reference);
        if (!this.references[id2])
          this.references[id2] = reference;
        let ref = this.get([id2, ...path]);
        const toMonitorInternally = (val, allowArrays = false) => {
          const first = val && typeof val === "object";
          if (!first)
            return false;
          else if (allowArrays)
            return true;
          else
            return !Array.isArray(val);
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
                  if (__internal.poll) {
                    console.warn(`Skipping subscription to ${[id2, ...newPath].join(".")} since its parent is ESM.`);
                  } else {
                    const info = this.createInfo(id2, callback, newPath, val);
                    this.add("functions", info);
                    subs[info.path.absolute] = info.sub;
                  }
                } else {
                  const internalSubs = this.listen(id2, callback, newPath, __internal);
                  Object.assign(subs, internalSubs);
                }
              }
            }
          };
          drill(ref);
          return subs;
        } else {
          const info = this.createInfo(id2, callback, path, ref);
          try {
            if (__internal.poll)
              this.poller.add(info);
            else if (typeof ref === "function")
              this.add("functions", info);
            else
              this.add("getters", info);
          } catch (e) {
            console.warn("Fallback to polling", e);
            this.poller.add(info);
          }
          return {
            [info.path.absolute]: info.sub
          };
        }
      };
      this.add = (type, info) => {
        if (listeners_exports[type])
          listeners_exports[type](info, this.listeners[type]);
        else
          this.listeners[type][info.path.absolute][info.sub] = info;
      };
      this.remove = (subs) => {
        if (!subs) {
          subs = subs = {
            ...this.listeners.functions,
            ...this.listeners.getters,
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
        const absPath = this.listenerLookup[sub];
        const polling = this.poller.get(sub);
        const funcs = this.listeners.functions[absPath];
        const func = funcs?.[sub];
        const getters2 = this.listeners.getters[absPath];
        const getter = getters2?.[sub];
        if (polling)
          this.poller.remove(sub);
        else if (func) {
          delete funcs[sub];
          if (!Object.getOwnPropertySymbols(funcs).length)
            func.current = func.original;
        } else if (getter) {
          delete getters2[sub];
          if (!Object.getOwnPropertySymbols(getters2).length) {
            const parent = getter.parent;
            const last = getter.last;
            const value = parent[last];
            Object.defineProperty(parent, last, { value });
          }
        } else
          return false;
        delete this.listenerLookup[sub];
      };
      Object.assign(this.options, opts);
      this.poller.setOptions(opts.polling);
    }
  };

  // ../libraries/esmonitor/src/index.ts
  var src_default = Monitor;

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
  var app = document.getElementById("app");
  var statesDiv = document.getElementById("states");
  var removeButton = Object.assign({}, button_exports);
  removeButton.attributes = Object.assign({}, removeButton.attributes);
  removeButton.attributes.innerHTML = "Remove Listeners";
  var monitor = new src_default({
    pathFormat: "absolute",
    polling: {
      sps: 60
    }
  });
  var id = "test";
  var esmId = "testESM";
  var moveButtonId = "button";
  monitor.set(esmId, basic_exports);
  var paragraphs = {};
  var logUpdate = (path, update) => {
    let p = paragraphs[path];
    if (!p) {
      p = paragraphs[path] = document.createElement("p");
      statesDiv.appendChild(p);
    }
    p.innerHTML = `<b>${path}:</b> ${JSON.stringify(update)}`;
  };
  var wasl = {
    components: {
      [id]: {
        esSrc: basic_exports
      },
      ["container1"]: {
        componentToMove: moveButtonId,
        esSrc: container_exports,
        parentNode: app
      },
      ["container2"]: {
        componentToMove: moveButtonId,
        esSrc: container_exports,
        parentNode: app
      },
      ["container3"]: {
        componentToMove: moveButtonId,
        esSrc: container_exports,
        parentNode: app
      },
      [moveButtonId]: {
        esSrc: button_exports,
        parentNode: "container1"
      }
    },
    listeners: {
      [`${moveButtonId}.attributes.onmousedown`]: {
        [`${id}.imports`]: true
      }
    }
  };
  for (let name in wasl.components) {
    const copy = Object.assign({}, wasl.components[name]);
    const esSrc = copy.esSrc;
    delete copy.esSrc;
    const merged = Object.assign(Object.assign({}, esSrc), copy);
    const instance = create_default(name, merged);
    monitor.set(name, instance);
    wasl.components[name] = instance;
  }
  var onOutput = (name, ...args) => {
    logUpdate(name, ...args);
    for (let key in wasl.listeners[name]) {
      let target = wasl.listeners[name][key];
      const type = typeof target;
      const noDefault = type !== "function" && !target?.default;
      if (type === "string")
        target = wasl.listeners[name][key] = wasl.components[listening];
      else if (noDefault) {
        const path = key.split(".");
        target = wasl.components;
        path.forEach((str) => target = target[str]);
      }
      if (target?.default)
        target.default(...args);
      else if (typeof target === "function")
        target(...args);
      else
        console.log("Unsupported listener...", target);
    }
  };
  for (let path in wasl.listeners) {
    monitor.on(path, onOutput);
    const id2 = path.split(".")[0];
    const defaultPath = `${id2}.default`;
    monitor.on(`${id2}.default`, onOutput);
    logUpdate(path, void 0);
    logUpdate(defaultPath, void 0);
  }
  var component = create_default("wasl", wasl);
  console.log("WASL", component);
})();
