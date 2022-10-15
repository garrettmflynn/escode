(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
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
        iterateSymbols(listeners, (sym, o) => {
          let { callback, current, history } = o;
          if (!o.path.resolved)
            o.path.resolved = getPath("output", o);
          if (!isSame(current, history)) {
            const info = {};
            callback(o.path.resolved, info, current);
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
          console.warn("Starting Polling!");
          this.#pollingId = setInterval(() => this.poll(listeners), 1e3 / this.sps);
        }
      };
      this.stop = () => {
        if (this.#pollingId) {
          console.warn("Stopped Polling!");
          clearInterval(this.#pollingId);
        }
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
    functionExecution: () => functionExecution,
    functions: () => functions,
    getExecutionInfo: () => getExecutionInfo,
    setterExecution: () => setterExecution,
    setters: () => setters
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
  var handler = (info, collection, subscribeCallback, monitor2 = true) => {
    if (monitor2) {
      if (!get(info, collection)) {
        let parent = info.parent;
        let val = parent[info.last];
        subscribeCallback(val, parent);
      }
    }
    register(info, collection);
  };
  var setterExecution = async (listeners, value) => {
    const executionInfo = {};
    await iterateSymbols(listeners, (_, o) => o.callback(getPath("output", o), executionInfo, value));
  };
  var setters = (info, collection, monitor2 = true) => {
    handler(info, collection, (value, parent) => {
      let val = value;
      delete parent[info.last];
      try {
        Object.defineProperty(parent, info.last, {
          get: () => val,
          set: async (v) => {
            const listeners = Object.assign({}, collection[getPath("absolute", info)]);
            setterExecution(listeners, v);
            val = v;
          },
          enumerable: true
        });
      } catch (e) {
        throw e;
      }
    }, monitor2);
  };
  var functionExecution = async (context, listeners, func, args) => {
    listeners = Object.assign({}, listeners);
    const keys = Object.getOwnPropertySymbols(listeners);
    const info = listeners[keys[0]];
    const executionInfo = await getExecutionInfo(async (...args2) => await func.call(context, ...args2), args, info.infoToOutput);
    await iterateSymbols(listeners, (_, o) => {
      o.callback(getPath("output", o), executionInfo.value, executionInfo.output);
    });
    return executionInfo;
  };
  var functions = (info, collection, monitor2 = true) => {
    handler(info, collection, (_, parent) => {
      parent[info.last] = async function(...args) {
        const listeners = collection[getPath("absolute", info)];
        functionExecution(this, listeners, info.original, args);
      };
    }, monitor2);
  };

  // libraries/common/drill.js
  var drillSimple = (obj, callback, options) => {
    let accumulator = options.accumulator;
    if (!accumulator)
      accumulator = options.accumulator = {};
    const ignore = options.ignore || [];
    const path = options.path || [];
    const condition = options.condition || true;
    const seen = [];
    const fromSeen = [];
    let drill2 = (obj2, acc = {}, globalInfo) => {
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
              const pass2 = condition instanceof Function ? condition(key, val, info) : condition;
              info.pass = pass2;
              acc[key] = callback(key, val, info);
              if (pass2) {
                fromSeen.push(acc[key]);
                acc[key] = drill2(val, acc[key], { ...globalInfo, path: newPath });
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
    return drill2(obj, accumulator, { path });
  };

  // libraries/common/standards.ts
  var keySeparator = ".";
  var defaultPath = "default";

  // libraries/common/pathHelpers.ts
  var hasKey = (key, obj) => {
    return obj.hasOwnProperty(key) || key in obj;
  };
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
      if (!hasKey(str, ref) && ref.hasOwnProperty("esComponents")) {
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
      else if (i === path.length - 1) {
        console.error(`Final path key not found: ${str}`, path, ref, baseObject);
        return;
      }
    }
    if (opts.output === "info")
      return { value: ref, exists };
    else
      return ref;
  };
  var setFromPath = (path, value, ref, opts = {}) => {
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
      if (ref.esComponents)
        ref = ref.esComponents;
    }
    ref[last] = value;
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
          const pathStr = proxy.path.join(proxy.options.keySeparator);
          const listeners = proxy.listeners ? proxy.listeners.functions[pathStr] : void 0;
          let output, executionInfo = {};
          if (listeners) {
            executionInfo = await functionExecution(thisArg, listeners, target, argumentsList);
            output = executionInfo.output;
          } else
            output = await target.apply(thisArg, argumentsList);
          if (proxy.callback instanceof Function)
            proxy.callback(pathStr, executionInfo, output);
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
        const pathStr = [...proxy.path, prop].join(proxy.options.keySeparator);
        if (newVal) {
          const newProxy = proxy.create(prop, target, newVal);
          if (newProxy)
            newVal = newProxy;
        }
        if (proxy.listeners) {
          const listeners = proxy.listeners.setters[pathStr];
          if (listeners)
            setterExecution(listeners, newVal);
        }
        if (proxy.callback instanceof Function)
          proxy.callback(pathStr, {}, newVal);
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
        else
          console.warn("Cannot create proxy for ESM:", key, val);
      } else if (!parent.hasOwnProperty(key))
        return true;
    }
    return false;
  };
  var Inspectable = class {
    constructor(target, opts = {}) {
      this.path = [];
      this.check = canCreate;
      this.create = (key, parent, val) => {
        const create3 = this.check(parent, key, val);
        if (create3 && !(create3 instanceof Error)) {
          if (val === void 0)
            val = parent[key];
          parent[key] = new Inspectable(val, { ...this.options, name: key, parent: this });
          return parent[key];
        }
        return;
      };
      this.options = opts;
      this.parent = opts.parent;
      this.callback = opts.callback ?? this.parent?.callback;
      if (this.parent)
        this.path = [...this.parent.path];
      if (opts.name)
        this.path.push(opts.name);
      if (opts.listeners)
        this.listeners = opts.listeners;
      if (opts.path) {
        if (opts.path instanceof Function)
          this.path = opts.path(this.path);
        else if (Array.isArray(opts.path))
          this.path = opts.path;
        else
          console.log("Invalid path", opts.path);
      }
      if (!this.options.keySeparator)
        this.options.keySeparator = keySeparator;
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
  var fallback = "esComponents";
  var Monitor = class {
    constructor(opts = {}) {
      this.poller = new Poller();
      this.options = {
        pathFormat: "relative",
        keySeparator
      };
      this.listenerLookup = {};
      this.listeners = {
        polling: this.poller.listeners,
        functions: {},
        setters: {}
      };
      this.references = {};
      this.get = (path, output) => getFromPath(this.references, path, {
        keySeparator: this.options.keySeparator,
        fallbacks: [fallback],
        output
      });
      this.set = (path, value, ref = this.references, opts = {}) => setFromPath(path, value, ref, opts);
      this.on = (absPath, callback, options = {}) => {
        let splitPath = absPath;
        if (typeof absPath === "string")
          splitPath = absPath.split(this.options.keySeparator);
        else if (typeof absPath === "symbol")
          splitPath = [absPath];
        const id2 = splitPath[0];
        return this.listen(id2, callback, splitPath.slice(1), options);
      };
      this.getInfo = (id2, type, callback, path, original) => {
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
          original,
          history: typeof original === "object" ? Object.assign({}, original) : original,
          sub: Symbol("subscription"),
          last: path.slice(-1)[0]
        };
        this.listenerLookup[info.sub] = getPath("absolute", info);
        return info;
      };
      this.listen = (id2, callback, path = [], options, __internal = {}) => {
        let isDynamic = options.static ? !options.static : true;
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
          console.warn("Falling back to using function interception and setters...");
        }
        let isInspectable = baseRef[isProxy];
        if (isDynamic && !isInspectable) {
          const inspector = new Inspectable(baseRef, {
            keySeparator: this.options.keySeparator,
            listeners: this.listeners,
            path: (path2) => path2.filter((str) => str !== fallback)
          });
          this.set(id2, inspector);
          baseRef = inspector;
          isInspectable = true;
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
          drillSimple(ref, (key, val, drillInfo) => {
            if (drillInfo.pass)
              return;
            else {
              const fullPath = [...arrayPath, ...drillInfo.path];
              const internalSubs = this.listen(id2, callback, fullPath, options, __internalComplete);
              Object.assign(subs, internalSubs);
            }
          }, {
            condition: (_, val) => toMonitorInternally(val)
          });
        } else {
          let info;
          try {
            if (__internalComplete.poll) {
              info = this.getInfo(id2, "polling", callback, arrayPath, ref);
              this.poller.add(info);
            } else {
              let type = "setters";
              if (typeof ref === "function")
                type = "functions";
              info = this.getInfo(id2, type, callback, arrayPath, ref);
              this.add(type, info, !isInspectable);
            }
          } catch (e) {
            console.warn("Falling to polling:", path, e);
            info = this.getInfo(id2, "polling", callback, arrayPath, ref);
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
      this.add = (type, info, monitor2 = true) => {
        if (listeners_exports[type])
          listeners_exports[type](info, this.listeners[type], monitor2);
        else
          this.listeners[type][getPath("absolute", info)][info.sub] = info;
      };
      this.remove = (subs) => {
        if (!subs) {
          subs = subs = {
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
        const absPath = this.listenerLookup[sub];
        const polling = this.poller.get(sub);
        const funcs = this.listeners.functions[absPath];
        const func = funcs?.[sub];
        const setters2 = this.listeners.setters[absPath];
        const setter = setters2?.[sub];
        if (polling)
          this.poller.remove(sub);
        else if (func) {
          delete funcs[sub];
          if (!Object.getOwnPropertySymbols(funcs).length)
            func.current = func.original;
        } else if (setter) {
          delete setters2[sub];
          if (!Object.getOwnPropertySymbols(setters2).length) {
            const parent = setter.parent;
            const last = setter.last;
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

  // libraries/escompose/src/create/element.ts
  function create(id2, esm2, parent) {
    if (!esm2.id && id2)
      esm2.id = id2;
    if (typeof esm2.id !== "string")
      esm2.id = `${esm2.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
    let element = esm2.esElement;
    if (element) {
      if (typeof element === "string") {
        const elm = document.querySelector(element);
        if (!elm) {
          const elm2 = document.getElementById(element);
          if (elm2)
            element = elm2;
        } else
          element = elm;
      }
    } else if (esm2.tagName)
      element = document.createElement(esm2.tagName);
    else if (esm2.id) {
      const elm = document.getElementById(esm2.id);
      if (elm)
        element = elm;
    }
    if (!(element instanceof Element))
      console.warn("Element not found for", id2);
    if (element instanceof Element) {
      let p = esm2.parentNode;
      const parentEl = parent?.esElement instanceof Element ? parent.esElement : void 0;
      esm2.parentNode = p ? p : parentEl;
      element.id = esm2.id;
      if (esm2.attributes) {
        for (let key in esm2.attributes) {
          if (typeof esm2.attributes[key] === "function")
            element[key] = (...args) => esm2.attributes[key](...args);
          else
            element[key] = esm2.attributes[key];
        }
      }
      if (element instanceof HTMLElement) {
        if (esm2.style)
          Object.assign(element.style, esm2.style);
      }
    }
    return element;
  }

  // libraries/escompose/src/create/index.ts
  var create_default = (id2, esm2, parent) => {
    let el = create(id2, esm2, parent);
    Object.defineProperty(esm2, "esElement", {
      get: function() {
        if (el instanceof Element)
          return el;
      },
      set: function(v) {
        console.log("Setting element", v);
        if (v instanceof Element) {
          el = v;
          for (let name in esm2.esComponents) {
            const component2 = esm2.esComponents[name];
            component2.parentNode = v;
          }
        }
      },
      enumerable: true,
      configurable: false
    });
    esm2.esElement = el;
    const parentNode = esm2.parentNode;
    delete esm2.parentNode;
    Object.defineProperty(esm2, "parentNode", {
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
          console.log("Setting parent node", esm2, v);
          if (esm2.esElement.parentNode)
            esm2.esElement.remove();
          if (v) {
            v.appendChild(esm2.esElement);
          }
        } else {
          for (let name in esm2.esComponents) {
            const component2 = esm2.esComponents[name];
            console.log("Setting Parent Node", name, component2);
            component2.parentNode = v;
          }
        }
      },
      enumerable: true
    });
    esm2.parentNode = parentNode;
    const onInit = esm2.esInit;
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
      if (onInit)
        onInit.call(esm2);
    };
    esm2.esDelete = function() {
      if (this.esElement instanceof Element) {
        this.esElement.remove();
        if (this.onremove)
          this.onremove.call(this);
      }
    };
    let onresize = esm2.esOnResize;
    let onresizeEventCallback = null;
    Object.defineProperty(esm2, "esOnResize", {
      get: function() {
        return onresize;
      },
      set: function(foo) {
        onresize = onresize;
        if (onresizeEventCallback)
          window.removeEventListener("resize", onresizeEventCallback);
        if (onresize) {
          onresizeEventCallback = (ev) => {
            if (onresize && esm2.esElement instanceof Element)
              foo.call(this, ev);
          };
          window.addEventListener("resize", onresizeEventCallback);
        }
      },
      enumerable: true
    });
    esm2.esOnResize = onresize;
    if (esm2.esElement)
      esm2.esElement.component = esm2;
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
    if (esm2.esOnCreate)
      esm2.esOnCreate.call(esm2);
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
  var drill = (o, id2, parent, path = [], opts) => {
    const clonedEsCompose = deep(o.esCompose) ?? {};
    let merged = Object.assign({}, Object.assign(Object.assign({}, clonedEsCompose), o));
    delete merged.esCompose;
    const instance = create_default(id2, merged, parent);
    const savePath = path.join(opts.keySeparator ?? keySeparator);
    if (opts?.components)
      opts.components[savePath] = { instance, depth: parent ? path.length + 1 : path.length };
    if (instance.esComponents) {
      for (let name in instance.esComponents) {
        const base = instance.esComponents[name];
        let thisPath = [...path, name];
        const thisInstance = drill(base, name, instance, thisPath, opts);
        instance.esComponents[name] = thisInstance;
      }
    }
    return instance;
  };
  var setListeners = (context, components) => {
    context.listeners = {};
    for (let absPath in components) {
      const info = components[absPath];
      const listeners = info.instance.esListeners;
      for (let path in listeners) {
        const basePath = [context.id];
        const topPath = [];
        if (absPath)
          topPath.push(...absPath.split(context.options.keySeparator));
        if (path)
          topPath.push(...path.split(context.options.keySeparator));
        basePath.push(...topPath);
        const obj = context.monitor.get(basePath);
        if (obj?.__isESComponent)
          basePath.push(defaultPath);
        const joined = topPath.join(context.options.keySeparator);
        if (!context.listeners[joined])
          context.listeners[joined] = {};
        const value = listeners[path];
        if (typeof value === "object")
          context.listeners[joined] = { ...listeners[path] };
        else
          context.listeners[joined] = value;
        context.monitor.on(basePath, (path2, info2, args) => passToListeners(context, absPath, path2, info2, args), context.options.listeners);
      }
    }
  };
  function pass(from, target, args, context) {
    const id2 = context.id;
    let parent, key, root;
    const isValue = target?.__value;
    parent = target.parent;
    key = target.key;
    root = target.root;
    target = target.parent[key];
    let ogValue = target;
    const type = typeof target;
    const checkIfSetter = (path) => {
      const info = context.monitor.get(path, "info");
      if (info.exists) {
        const val = info.value;
        const noDefault = typeof val !== "function" && !val?.default;
        if (noDefault)
          target = toSet;
        else
          target = val;
        parent[key] = target;
      }
    };
    if (typeof target === "boolean") {
      if (!isValue) {
        const fullPath = [id2];
        if (root)
          fullPath.push(root);
        fullPath.push(...key.split(context.options.keySeparator));
        checkIfSetter(fullPath);
      } else
        console.error("Cannot use a boolean for esListener...");
    } else if (type === "string") {
      const path = [id2];
      const topPath = [];
      if (root)
        topPath.push(root);
      topPath.push(...target.split(context.options.keySeparator));
      path.push(...topPath);
      checkIfSetter(path);
      if (isValue)
        parent[key] = { [ogValue]: parent[key] };
    }
    if (target === toSet) {
      const parentPath = [id2];
      if (root)
        parentPath.push(root);
      parentPath.push(...key.split(context.options.keySeparator));
      const idx = parentPath.pop();
      const info = context.monitor.get(parentPath, "info");
      info.value[idx] = args[0];
    } else if (target?.default)
      target.default(...args);
    else if (typeof target === "function")
      target(...args);
    else {
      let baseMessage = `listener: ${from} \u2014> ${key}`;
      if (parent) {
        console.error(`Deleting ${baseMessage}`, parent[key]);
        delete parent[key];
      } else
        console.error(`Failed to add ${baseMessage}`, target);
    }
  }
  function passToListeners(context, root, name, _, ...args) {
    const sep = context.options.keySeparator;
    const noDefault = name.slice(0, -`${sep}${defaultPath}`.length);
    const listenerGroups = [{
      info: context.listeners[name],
      name
    }, {
      info: context.listeners[noDefault],
      name: noDefault
    }];
    listenerGroups.forEach((group) => {
      const info = group.info;
      if (info) {
        if (typeof info === "object") {
          for (let key in info) {
            pass(name, {
              parent: info,
              key,
              root,
              value: info[key]
            }, args, context);
          }
        } else {
          pass(name, {
            value: info,
            parent: context.listeners,
            key: group.name,
            root,
            __value: true
          }, args, context);
        }
      }
    });
  }
  var toSet = Symbol("toSet");
  var create2 = (config, options) => {
    let monitor2;
    if (options.monitor instanceof src_default) {
      monitor2 = options.monitor;
      options.keySeparator = monitor2.options.keySeparator;
    } else {
      if (!options.monitor)
        options.monitor = {};
      if (!options.monitor.keySeparator)
        options.monitor.keySeparator = options.keySeparator;
      monitor2 = new src_default(options.monitor);
    }
    if (!options.keySeparator)
      options.keySeparator = keySeparator;
    const fullOptions = options;
    const id2 = Symbol("root");
    const components = {};
    const instance = drill(config, id2, void 0, void 0, {
      components,
      keySeparator: fullOptions.keySeparator
    });
    let fullInstance = instance;
    monitor2.set(id2, fullInstance);
    const context = {
      id: id2,
      instance: fullInstance,
      monitor: monitor2,
      options: fullOptions
    };
    setListeners(context, components);
    fullInstance.esInit();
    console.log("fullInstance", fullInstance);
    return fullInstance;
  };
  var src_default2 = create2;

  // demo/ui.ts
  var main = document.getElementById("app");
  var stateTable = document.getElementById("states");
  var containers = {};
  var add = (arr) => arr.reduce((a, b) => a + b, 0);
  var average = (arr) => add(arr) / arr.length;
  var update = async (path, info, update2, toUpdate = []) => {
    toUpdate.forEach((state) => setFromPath(path, update2, state, { create: true }));
    if (stateTable) {
      const split = path.split(".");
      const last = split.pop();
      const obj = split.join(".");
      let container = containers[obj];
      if (!container) {
        container = containers[obj] = {
          states: {
            averages: {},
            elements: {},
            output: {}
          },
          headers: {
            name: document.createElement("th")
          }
        };
        container.header = document.createElement("tr");
        container.header.classList.add("header-row");
        container.headers.name.innerText = obj;
        container.header.appendChild(container.headers.name);
        stateTable.appendChild(container.header);
      }
      let state = container.states[last];
      if (!state) {
        let header = container.headers.state;
        if (!header) {
          const header2 = document.createElement("th");
          header2.innerText = "state";
          container.header.appendChild(header2);
          container.headers.state = header2;
        }
        state = container.states[last] = {
          info: {
            averages: {},
            columns: {},
            output: {}
          }
        };
        state.header = document.createElement("th");
        state.header.innerText = last;
        state.div = document.createElement("tr");
        state.value = document.createElement("td");
        state.averages = {};
        state.div.appendChild(state.header);
        state.div.appendChild(state.value);
        stateTable.appendChild(state.div);
      }
      state.value.innerHTML = JSON.stringify(update2);
      const infoCopy = { ...info };
      delete infoCopy.function;
      delete infoCopy.arguments;
      delete infoCopy.info;
      for (let key in infoCopy) {
        const val = infoCopy[key];
        if (!state.info.averages[key])
          state.info.averages[key] = [];
        let output = val;
        if (typeof val === "number") {
          const aveArr = state.info.averages[key];
          aveArr.push(val);
          output = `${average(aveArr).toFixed(3)}ms`;
        }
        if (output === void 0)
          output = "No Data";
        let header = container.headers[key];
        if (!header) {
          const header2 = document.createElement("th");
          header2.innerText = key;
          container.header.appendChild(header2);
          container.headers[key] = header2;
        }
        let col = state.info.columns[key];
        if (!col) {
          col = state.info.columns[key] = document.createElement("td");
          state.div.appendChild(col);
        }
        col.innerText = output;
        state.info.output[key] = output;
      }
      for (let key in state.averages) {
        if (state.averages[key].length > 100)
          state.averages[key].shift();
      }
    }
  };

  // demo/index.esc.ts
  var index_esc_exports = {};
  __export(index_esc_exports, {
    esComponents: () => esComponents,
    esListeners: () => esListeners
  });

  // libraries/esmpile/tests/basic/index.js
  var basic_exports = {};
  __export(basic_exports, {
    imports: () => imports
  });

  // libraries/esmpile/tests/basic/update.js
  var update_exports = {};
  __export(update_exports, {
    default: () => update_default,
    esmOnly: () => esmOnly,
    nExecution: () => nExecution,
    passedWithListener: () => passedWithListener
  });
  var nExecution = 0;
  var esmOnly = 0;
  var passedWithListener = void 0;
  function update_default() {
    if (this.delayId)
      clearTimeout(this.delayId);
    this.nExecution++;
    this.delayId = setTimeout(() => esmOnly = this.nExecution, 500);
  }

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

  // libraries/escode/tests/0/components/log.js
  var log_exports = {};
  __export(log_exports, {
    default: () => log_default
  });
  var log_default = (...input) => console.log(`[log]:`, input);

  // demo/index.esc.ts
  var id = "test";
  var moveButtonId = "button";
  var esComponents = {
    [id]: {
      esCompose: basic_exports,
      esListeners: {
        [`imports.nExecution`]: "imports.passedWithListener",
        [`imports.passedWithListener`]: (...args) => console.log("Passed with Listener!", args)
      }
    },
    log: {
      esCompose: log_exports
    },
    container: {
      componentToMove: moveButtonId,
      esCompose: {
        tagName: "div"
      },
      log: {
        esCompose: log_exports
      },
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
    }
  };
  var esListeners = {
    [`container.${moveButtonId}`]: {
      [`${id}.imports`]: true,
      [`log`]: true
    }
  };

  // demo/index.ts
  var states = [];
  var logUpdate = (path, info, newVal) => update(path, info, newVal, states);
  var monitor = new Monitor({
    onInit: logUpdate,
    onUpdate: {
      callback: logUpdate,
      info: {
        performance: true
      }
    },
    pathFormat: "absolute",
    polling: { sps: 60 }
  });
  var objectStates = {};
  var inspectableState = new Inspectable(objectStates, {
    callback: async (path, info, update2) => console.log("States Updated!", path, update2)
  });
  states.push(inspectableState);
  var esmId = "ESM";
  monitor.set(esmId, basic_exports);
  monitor.on(esmId, (path, _, update2) => console.log("Polling Result:", path, update2));
  var selected = index_esc_exports;
  selected.parentNode = main;
  var component = src_default2(selected, {
    monitor,
    listeners: { static: false }
  });
  console.log("Configuration Object", component);
})();
