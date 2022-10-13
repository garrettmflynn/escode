(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // libraries/esmpile/tests/basic/index.js
  var basic_exports = {};
  __export(basic_exports, {
    imports: () => imports
  });

  // libraries/esmpile/tests/basic/update.js
  var update_exports = {};
  __export(update_exports, {
    default: () => update_default,
    mirror: () => mirror,
    nExecution: () => nExecution
  });

  // libraries/esmpile/tests/basic/dependency.js
  var toResolve;
  setTimeout(() => {
    toResolve = {
      test: true
    };
  }, 300);

  // libraries/esmpile/tests/basic/update.js
  var original = toResolve ? JSON.parse(JSON.stringify(toResolve)) : toResolve;
  var nExecution = 0;
  var mirror = 0;
  var update_default = () => {
    nExecution++;
    setTimeout(() => mirror = nExecution, 500);
    console.log(`original`, original);
    console.log(`namespace`, toResolve);
    console.log(`named`, toResolve);
    console.log(`nExecution`, nExecution);
    return toResolve === toResolve;
  };

  // libraries/esmpile/tests/basic/index.js
  var imports = update_exports;

  // components/ui/button.js
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
      this.default({ value: true, __internal: true });
      const onMouseUp = () => {
        this.default({ value: false, __internal: true });
        globalThis.removeEventListener("mouseup", onMouseUp);
      };
      globalThis.addEventListener("mouseup", onMouseUp);
    }
  };
  var cache = null;
  function button_default(input) {
    let res;
    const value = input?.value ?? input;
    const isInternal = input?.__internal;
    if (isInternal) {
      if (this.cache) {
        if (value !== void 0)
          res = this.cache;
      } else
        res = value;
    } else if (value !== void 0)
      this.cache = value;
    return res;
  }

  // libraries/common/pathHelpers.ts
  var hasKey = (key, obj) => {
    return obj.hasOwnProperty(key) || key in obj;
  };
  var getFromPath = (baseObject, path, opts = {}) => {
    const fallbackKeys = opts.fallbacks ?? [];
    const keySeparator = opts.keySeparator ?? ".";
    if (typeof path === "string")
      path = path.split(keySeparator);
    else if (typeof path == "symbol")
      path = [path];
    path = [...path];
    let ref = baseObject;
    for (let i = 0; i < path.length; i++) {
      if (!ref) {
        const message = `Could not get path`;
        console.error(message, path, ref);
        throw new Error(message);
      }
      const str = path[i];
      if (!hasKey(str, ref) && ref.hasOwnProperty("esComponents")) {
        for (let i2 in fallbackKeys) {
          const key = fallbackKeys[i2];
          if (hasKey(key, ref)) {
            ref = ref[key];
            break;
          }
        }
      }
      if (hasKey(str, ref))
        ref = ref[str];
      else if (i === path.length - 1) {
        console.error(`Final path key not found: ${str}`, path, ref, baseObject);
        return;
      }
    }
    return ref;
  };
  var setFromPath = (path, value, ref, opts = {}) => {
    const create3 = opts?.create ?? false;
    const keySeparator = opts?.keySeparator ?? ".";
    if (typeof path === "string")
      path = path.split(keySeparator);
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
      if (ref.esComponents)
        ref = ref.esComponents;
    }
    ref[last] = value;
  };

  // libraries/common/check.js
  var moduleStringTag = "[object Module]";
  var esm = (object) => {
    const res = object && (!!Object.keys(object).reduce((a, b) => {
      const desc = Object.getOwnPropertyDescriptor(object, b);
      const isModule = desc && desc.get && !desc.set ? 1 : 0;
      return a + isModule;
    }, 0) || Object.prototype.toString.call(object) === moduleStringTag);
    return !!res;
  };

  // libraries/esmonitor/src/utils.ts
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
  var getPath = (type, info) => {
    const pathType = info.path[type];
    if (!pathType)
      throw new Error("Invalid Path Type");
    const filtered = pathType.filter((v) => typeof v === "string");
    return filtered.join(info.keySeparator);
  };

  // libraries/esmonitor/src/Poller.ts
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
            const info = {};
            callback(path.output, info, current);
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

  // libraries/esmonitor/src/listeners.ts
  var listeners_exports = {};
  __export(listeners_exports, {
    functions: () => functions,
    getExecutionInfo: () => getExecutionInfo,
    getters: () => getters
  });

  // libraries/esmonitor/src/info.ts
  var info_exports = {};
  __export(info_exports, {
    performance: () => performance
  });
  var performance = async (callback, args) => {
    const tic = globalThis.performance.now();
    const output = await callback(...args);
    const toc = globalThis.performance.now();
    return {
      output,
      value: toc - tic
    };
  };

  // libraries/esmonitor/src/listeners.ts
  var register = (info, collection) => {
    const absolute = getPath("absolute", info);
    if (!collection[absolute])
      collection[absolute] = {};
    collection[absolute][info.sub] = info;
  };
  var get = (info, collection) => collection[getPath("absolute", info)];
  var getExecutionInfo = async (func, args, info) => {
    let result = {
      value: {
        function: func,
        arguments: args,
        info
      },
      output: void 0
    };
    for (let key in info) {
      if (info[key] && info_exports[key]) {
        const ogFunc = func;
        func = async (...args2) => {
          const o = await info_exports[key](ogFunc, args2);
          result.value[key] = o.value;
          return o.output;
        };
      }
    }
    result.output = await func(...args);
    return result;
  };
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
      delete parent[info.last];
      try {
        console.log("Definigin", info.path.absolute);
        Object.defineProperty(parent, info.last, {
          get: () => val,
          set: async (v) => {
            const listeners = Object.assign({}, collection[getPath("absolute", info)]);
            const executionInfo = {};
            await iterateSymbols(listeners, (_, o) => o.callback(getPath("output", info), executionInfo, v));
            val = v;
          },
          enumerable: true
        });
      } catch (e) {
        throw e;
      }
    });
  };
  var functions = (info, collection) => {
    handler(info, collection, (_, parent) => {
      parent[info.last] = async function(...args) {
        const listeners = Object.assign({}, collection[getPath("absolute", info)]);
        const executionInfo = await getExecutionInfo(async (...args2) => await info.original.call(this, ...args2), args, info.infoToOutput);
        await iterateSymbols(listeners, (_2, o) => {
          o.callback(getPath("output", info), executionInfo.value, executionInfo.output);
        });
      };
    });
  };

  // libraries/common/drill.js
  var drillSimple = (obj, callback, options2) => {
    let accumulator = options2.accumulator;
    if (!accumulator)
      accumulator = options2.accumulator = {};
    const ignore = options2.ignore || [];
    const path = options2.path || [];
    const condition = options2.condition || true;
    const seen = [];
    const fromSeen = [];
    let drill = (obj2, acc = {}, globalInfo) => {
      for (let key in obj2) {
        if (ignore.includes(key))
          continue;
        const val = obj2[key];
        const newPath = [...globalInfo.path, key];
        const info = {
          typeof: typeof val,
          name: val?.constructor?.name,
          simple: true,
          object: val && typeof val === "object",
          path: newPath
        };
        if (info.object) {
          const name = info.name;
          if (name === "Object" || name === "Array") {
            info.simple = true;
            const idx = seen.indexOf(val);
            if (idx !== -1)
              acc[key] = fromSeen[idx];
            else {
              seen.push(val);
              const pass = condition instanceof Function ? condition(key, val, info) : condition;
              info.pass = pass;
              acc[key] = callback(key, val, info);
              if (pass) {
                fromSeen.push(acc[key]);
                acc[key] = drill(val, acc[key], { ...globalInfo, path: newPath });
              }
            }
          } else {
            info.simple = false;
            acc[key] = callback(key, val, info);
          }
        } else
          acc[key] = callback(key, val, info);
      }
      return acc;
    };
    return drill(obj, accumulator, { path });
  };

  // libraries/esmonitor/src/inspectable/handlers.ts
  var handlers_exports = {};
  __export(handlers_exports, {
    functions: () => functions2,
    isProxy: () => isProxy,
    objects: () => objects
  });
  var isProxy = Symbol("isProxy");
  var functions2 = (proxy) => {
    return {
      apply: async function(target, thisArg, argumentsList) {
        try {
          console.log(`Function is running in:`, proxy.proxy.path, proxy.parent, target, argumentsList);
          const output = await target.apply(thisArg, argumentsList);
          console.log("Function output:", output);
          if (proxy.callback instanceof Function)
            proxy.callback(proxy.path.join(proxy.options.keySeparator), {}, output);
          return output;
        } catch (e) {
          console.warn(`Cannot run function:`, e, proxy.proxy.path, proxy.parent, target, argumentsList);
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
        if (proxy.callback instanceof Function)
          proxy.callback([...proxy.path, prop].join("."), {}, newVal);
        if (newVal)
          proxy.create(prop, target, newVal);
        return Reflect.set(target, prop, newVal, receiver);
      }
    };
  };

  // libraries/esmonitor/src/inspectable/index.ts
  var canCreate = (parent, key, val) => {
    try {
      if (val === void 0)
        val = parent[key];
    } catch (e) {
      return e;
    }
    if (parent[key] && parent[key][isProxy])
      return false;
    const type = typeof val;
    const isObject = type === "object";
    const isFunction = type == "function";
    const onlyObjsAndFuncs = !val || !(isObject || isFunction);
    if (onlyObjsAndFuncs)
      return false;
    if (val instanceof Element)
      return false;
    if (val instanceof EventTarget)
      return false;
    const isESM = isObject && esm(val);
    const getDesc = isObject && parent.hasOwnProperty(key);
    if (!getDesc && isFunction)
      return true;
    else {
      const desc = Object.getOwnPropertyDescriptor(parent, key);
      if (desc && (desc.value && desc.writable || desc.set)) {
        if (!isESM)
          return true;
        else
          console.warn("Cannot create proxy for ESM:", key, val);
      }
    }
    return false;
  };
  var Inspectable = class {
    constructor(target, opts = {}) {
      this.path = [];
      this.check = canCreate;
      this.create = (key, parent, val) => {
        const create3 = this.check(parent, key, val);
        if (create3 instanceof Error)
          return;
        else if (create3) {
          if (val === void 0)
            val = parent[key];
          parent[key] = new Inspectable(val, { ...this.options, name: key, parent: this });
        }
        return parent[key];
      };
      this.options = opts;
      this.parent = opts.parent;
      this.callback = opts.callback ?? this.parent?.callback;
      if (this.parent)
        this.path = [...this.parent.path];
      if (opts.name)
        this.path.push(opts.name);
      let type = opts.type;
      if (type != "object")
        type = typeof target === "function" ? "function" : "object";
      const handler2 = handlers_exports[`${type}s`](this);
      this.proxy = new Proxy(target, handler2);
      for (let key in target)
        this.create(key, target);
      return this.proxy;
    }
  };

  // libraries/esmonitor/src/Monitor.ts
  var Monitor = class {
    constructor(opts = {}) {
      this.poller = new Poller();
      this.options = {
        pathFormat: "relative",
        keySeparator: "."
      };
      this.listenerLookup = {};
      this.listeners = {
        polling: this.poller.listeners,
        functions: {},
        getters: {}
      };
      this.references = {};
      this.get = (path) => getFromPath(this.references, path, {
        keySeparator: this.options.keySeparator,
        fallbacks: ["esComponents"]
      });
      this.set = (path, value, ref = this.references, opts = {}) => setFromPath(path, value, ref, opts);
      this.on = (absPath, callback, options2 = {}) => {
        let splitPath = absPath;
        if (typeof absPath === "string")
          splitPath = absPath.split(this.options.keySeparator);
        else if (typeof absPath === "symbol")
          splitPath = [absPath];
        const id2 = splitPath[0];
        return this.listen(id2, callback, splitPath.slice(1), options2);
      };
      this.createInfo = (id2, callback, path, original2) => {
        if (typeof path === "string")
          path = path.split(this.options.keySeparator);
        const relativePath = path.join(this.options.keySeparator);
        const refs = this.references;
        const get2 = this.get;
        const set = this.set;
        let onUpdate = this.options.onUpdate;
        let infoToOutput = {};
        if (onUpdate && typeof onUpdate === "object" && onUpdate.callback instanceof Function) {
          infoToOutput = onUpdate.info ?? {};
          onUpdate = onUpdate.callback;
        }
        const absolute = [id2, ...path];
        let pathInfo = {
          absolute,
          relative: relativePath.split(this.options.keySeparator),
          parent: absolute.slice(0, -1)
        };
        pathInfo.output = pathInfo[this.options.pathFormat];
        const completePathInfo = pathInfo;
        const info = {
          id: id2,
          path: completePathInfo,
          keySeparator: this.options.keySeparator,
          infoToOutput,
          callback: async (...args) => {
            const output = await callback(...args);
            if (onUpdate instanceof Function)
              onUpdate(...args);
            return output;
          },
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
        this.listenerLookup[info.sub] = getPath("absolute", info);
        return info;
      };
      this.listen = (id2, callback, path = [], options2, __internal = {}) => {
        let isDynamic = options2.static ? !options2.static : true;
        if (typeof path === "string")
          path = path.split(this.options.keySeparator);
        else if (typeof path === "symbol")
          path = [path];
        const arrayPath = path;
        let baseRef = this.references[id2];
        if (!baseRef) {
          console.error(`Reference ${id2} does not exist.`);
          return;
        }
        if (isDynamic && !globalThis.Proxy) {
          isDynamic = false;
          console.warn("Falling back to using getters and setters...");
        }
        if (isDynamic && !baseRef[isProxy]) {
          const inspector = new Inspectable(baseRef, {
            callback: (path2, info, update) => {
              console.log("Handling internal calls", path2, info, update);
            },
            keySeparator: this.options.keySeparator
          });
          this.set(id2, inspector);
          baseRef = inspector;
        }
        if (!__internal.poll)
          __internal.poll = esm(baseRef);
        if (!__internal.seen)
          __internal.seen = [];
        const __internalComplete = __internal;
        if (!this.references[id2])
          this.references[id2] = baseRef;
        let ref = this.get([id2, ...arrayPath]);
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
          const drillOptions = {
            condition: (_, val) => toMonitorInternally(val)
          };
          drillSimple(ref, (key, val, drillInfo) => {
            if (drillInfo.pass)
              return;
            else {
              const fullPath = [...arrayPath, ...drillInfo.path];
              if (typeof val === "function") {
                if (__internalComplete.poll) {
                  console.warn(`Skipping subscription to ${fullPath.join(this.options.keySeparator)} since its parent is ESM.`);
                } else {
                  const info = this.createInfo(id2, callback, fullPath, val);
                  this.add("functions", info);
                  const abs = getPath("absolute", info);
                  subs[abs] = info.sub;
                }
              } else {
                const internalSubs = this.listen(id2, callback, fullPath, options2, __internalComplete);
                Object.assign(subs, internalSubs);
              }
            }
          }, drillOptions);
        } else {
          const info = this.createInfo(id2, callback, arrayPath, ref);
          try {
            if (__internalComplete.poll)
              this.poller.add(info);
            else if (typeof ref === "function")
              this.add("functions", info);
            else
              this.add("getters", info);
          } catch (e) {
            console.warn("Falling to polling:", path, e);
            this.poller.add(info);
          }
          subs[getPath("absolute", info)] = info.sub;
          if (this.options.onInit instanceof Function) {
            const executionInfo = {};
            for (let key in info.infoToOutput)
              executionInfo[key] = void 0;
            this.options.onInit(getPath("output", info), executionInfo);
          }
        }
      };
      this.add = (type, info) => {
        if (listeners_exports[type])
          listeners_exports[type](info, this.listeners[type]);
        else
          this.listeners[type][getPath("absolute", info)][info.sub] = info;
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

  // libraries/esmonitor/src/index.ts
  var src_default = Monitor;

  // libraries/escompose/src/create/utils/update.ts
  var update_default2 = (id2, esm2, parent) => {
    if (!esm2.id && id2)
      esm2.id = id2;
    if (!esm2.id)
      esm2.id = `${esm2.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
    if (esm2.element instanceof Element) {
      let p = esm2.parentNode;
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

  // libraries/escompose/src/create/element.ts
  function add(id2, esm2, parent) {
    let elm = create(id2, esm2, parent);
    if (!esm2.element)
      esm2.element = elm;
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
    update_default2(id2, esm2, parent);
    return esm2.element;
  }

  // libraries/escompose/src/create/index.ts
  var create_default = (id2, esm2, parent) => {
    esm2 = add(id2, esm2, parent);
    let el = esm2.element;
    delete esm2.element;
    Object.defineProperty(esm2, "element", {
      get: function() {
        if (el instanceof Element)
          return el;
      },
      set: function(v) {
        if (v instanceof Element) {
          el = v;
          for (let name in esm2.esComponents) {
            const el2 = esm2.esComponents[name].element;
            if (el2 instanceof Element)
              v.appendChild(el2);
          }
        }
      },
      enumerable: true
    });
    esm2.element = el;
    const parentNode = esm2.parentNode;
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
      enumerable: true
    });
    esm2.parentNode = parentNode;
    esm2.esInit = () => {
      for (let name in esm2.esComponents) {
        const init = esm2.esComponents[name].esInit;
        if (init instanceof Function)
          init();
        else
          console.error(`Could not start component ${name} because it does not have an esInit function`);
      }
      if (esm2.hasOwnProperty("esTrigger")) {
        esm2.default(esm2.esTrigger);
        delete esm2.esTrigger;
      }
    };
    esm2.esDelete = function() {
      this.element.remove();
      if (this.onremove && this.element instanceof Element)
        this.onremove.call(this);
    };
    let onresize = esm2.onresize;
    let onresizeEventCallback = null;
    Object.defineProperty(esm2, "onresize", {
      get: function() {
        return onresize;
      },
      set: function(foo) {
        onresize = onresize;
        if (onresizeEventCallback)
          window.removeEventListener("resize", onresizeEventCallback);
        if (onresize) {
          onresizeEventCallback = (ev) => {
            if (onresize && esm2.element instanceof Element)
              foo.call(this, ev);
          };
          window.addEventListener("resize", onresizeEventCallback);
        }
      }
    });
    esm2.onresize = onresize;
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
    Object.defineProperty(esm2, "__isESComponent", {
      value: true,
      enumerable: false
    });
    return esm2;
  };

  // libraries/common/clone.js
  var deep = (obj, opts = {}) => {
    opts.accumulator = {};
    drillSimple(obj, (key, val, info) => {
      if (info.simple && info.object)
        return Array.isArray(val) ? [] : {};
      else
        return val;
    }, opts);
    return opts.accumulator;
  };

  // libraries/escompose/src/index.ts
  var create2 = (config, options2) => {
    console.log(config);
    if (!options2.keySeparator)
      options2.keySeparator = ".";
    let monitor2 = options2.monitor;
    if (!(monitor2 instanceof src_default))
      monitor2 = options2.monitor = new src_default(options2);
    let components = {};
    const drill = (o, id3, parent, path = []) => {
      const clonedEsCompose = deep(o.esCompose) ?? {};
      console.log("ESC", path, clonedEsCompose);
      let merged = Object.assign({}, Object.assign(Object.assign({}, clonedEsCompose), o));
      delete merged.esCompose;
      console.log("merged", path, deep(merged));
      console.log("merged (active)", path, merged);
      merged = deep(merged);
      console.log("merged (active2)", path, merged);
      const instance2 = create_default(id3, merged, parent);
      if (instance2.esComponents) {
        for (let name in instance2.esComponents) {
          const base = instance2.esComponents[name];
          const thisInstance = drill(base, name, instance2, path);
          instance2.esComponents[name] = thisInstance;
        }
      }
      components[path.join(options2.keySeparator)] = instance2;
      return instance2;
    };
    const id2 = Symbol("root");
    const instance = drill(config, id2);
    console.log("instance", instance, deep(instance));
    let fullInstance = deep(instance);
    monitor2.set(id2, fullInstance);
    fullInstance.esInit();
    const onOutput = (name, _, ...args) => {
      console.log("out", name, args, fullInstance.esListeners);
      const defaultPath = ".default";
      const noDefault = name.slice(0, -defaultPath.length);
      const listenerGroups = [fullInstance.esListeners[name], fullInstance.esListeners[noDefault]];
      listenerGroups.forEach((group) => {
        for (let key in group) {
          let target = group[key];
          const type = typeof target;
          const noDefault2 = type !== "function" && !target?.default;
          if (type === "string")
            target = group[key] = fullInstance.esComponents[target];
          else if (noDefault2) {
            const path = key.split(".");
            target = getFromPath(fullInstance.esComponents, path, {
              fallbacks: ["esComponents"],
              keySeparator: options2.keySeparator
            });
          }
          if (target?.default)
            target.default(...args);
          else if (typeof target === "function")
            target(...args);
          else {
            console.warn(`Deleting listener: ${name} \u2014> ${key}`);
            delete group[key];
          }
        }
      });
    };
    for (let path in fullInstance.esListeners) {
      const basePath = [id2, ...path.split(".")];
      const obj = monitor2.get(basePath, void 0);
      if (obj.__isESComponent)
        basePath.push("default");
      monitor2.on(basePath, onOutput);
    }
    return fullInstance;
  };
  var src_default2 = create2;

  // index.ts
  var app = document.getElementById("app");
  var statesDiv = document.getElementById("states");
  var id = "test";
  var moveButtonId = "button";
  var monitor = new Monitor();
  var objectStates = {};
  monitor.set("states", objectStates);
  monitor.on("states", (path, info, update) => {
    console.log("State Object Updated!", path, update);
  }, { static: true });
  var inspectableState = new Inspectable(objectStates, {
    callback: async (path, info, update) => {
      console.log("Inspected Object Updated!", path, update);
    }
  });
  var states = {};
  var add2 = (arr) => arr.reduce((a, b) => a + b, 0);
  var average = (arr) => add2(arr) / arr.length;
  var logUpdate = async (path, info, update) => {
    monitor.set(path, update, inspectableState, { create: true });
    if (statesDiv) {
      let state = states[path];
      if (!state) {
        state = states[path] = {};
        state.div = document.createElement("div");
        state.t = document.createElement("p");
        state.tAdded = document.createElement("p");
        state.value = document.createElement("p");
        state.averages = {
          t: [],
          tAdded: []
        };
        state.div.appendChild(state.value);
        state.div.appendChild(state.t);
        state.div.appendChild(state.tAdded);
        statesDiv.appendChild(state.div);
      }
      state.value.innerHTML = `<h4>${path}</h4> ${JSON.stringify(update)}`;
      const active = info.function && info.arguments && info.info;
      const o = active ? await getExecutionInfo(info.function, info.arguments, info.info) : { output: update, value: {} };
      if (info.hasOwnProperty("performance")) {
        const executionTime = info.performance;
        if (o.value.performance) {
          const tAdded = executionTime - o.value.performance;
          state.averages.tAdded.push(tAdded);
        }
        if (executionTime)
          state.averages.t.push(executionTime);
        state.t.innerHTML = `<span style="font-size: 80%;"><b>Execution Time:</b> ${average(state.averages.t).toFixed(3)}</span>`;
        state.tAdded.innerHTML = `<span style="font-size: 80%;"><b>Execution Time Difference:</b> ${average(state.averages.tAdded).toFixed(3)}</span>`;
      }
      for (let key in state.averages) {
        if (state.averages[key].length > 100)
          state.averages[key].shift();
      }
    }
  };
  var escodeFile = {
    esComponents: {
      [id]: {
        esCompose: basic_exports
      },
      container: {
        componentToMove: moveButtonId,
        esCompose: {
          tagName: "div",
          esComponents: {
            header: {
              tagName: "h1",
              attributes: {
                innerText: "ESCompose Demo"
              }
            },
            [moveButtonId]: {
              esCompose: button_exports,
              esTrigger: { value: true, __internal: true }
            }
          }
        },
        parentNode: app
      }
    },
    esListeners: {
      [`container.${moveButtonId}`]: {
        [`${id}.imports`]: true
      },
      [`${id}.imports`]: logUpdate
    }
  };
  var options = {
    onInit: logUpdate,
    onUpdate: {
      callback: logUpdate,
      info: {
        performance: true
      }
    },
    monitor: {
      pathFormat: "absolute",
      polling: {
        sps: 60
      }
    }
  };
  var component = src_default2(escodeFile, options);
  console.log("Configuration Object", component);
})();
