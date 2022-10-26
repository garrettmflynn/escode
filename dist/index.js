(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

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
  var getPath = (type, info3) => {
    const pathType = info3.path[type];
    if (!pathType)
      throw new Error("Invalid Path Type");
    const filtered = pathType.filter((v) => typeof v === "string");
    return filtered.join(info3.keySeparator);
  };
  var getPathInfo = (path2, options) => {
    let splitPath = path2;
    if (typeof path2 === "string")
      splitPath = path2.split(options.keySeparator);
    else if (typeof path2 === "symbol")
      splitPath = [path2];
    return {
      id: splitPath[0],
      path: splitPath.slice(1)
    };
  };
  var runCallback = (callback, path2, info3, output, setGlobal = true) => {
    if (callback instanceof Function) {
      if (output && typeof output === "object" && typeof output.then === "function")
        output.then((value) => callback(path2, info3, value));
      else
        callback(path2, info3, output);
    }
    if (setGlobal && window.ESMonitorState) {
      const callback2 = window.ESMonitorState.callback;
      window.ESMonitorState.state[path2] = { output, value: info3 };
      runCallback(callback2, path2, info3, output, false);
    }
  };

  // libraries/esmonitor/src/Poller.ts
  var defaultSamplingRate = 60;
  var Poller = class {
    constructor(listeners2, sps) {
      this.listeners = {};
      this.setOptions = (opts = {}) => {
        for (let key in opts)
          this[key] = opts[key];
      };
      this.add = (info3) => {
        const sub = info3.sub;
        this.listeners[sub] = info3;
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

  // libraries/esmonitor/src/listeners.ts
  var listeners_exports = {};
  __export(listeners_exports, {
    functionExecution: () => functionExecution,
    functions: () => functions2,
    info: () => info2,
    register: () => register,
    set: () => set,
    setterExecution: () => setterExecution,
    setters: () => setters
  });

  // libraries/esmonitor/src/global.ts
  window.ESMonitorState = {
    state: {},
    callback: void 0,
    info: {}
  };
  var global_default = window.ESMonitorState;

  // libraries/esmonitor/src/info.ts
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
  var get = (func, args, info3) => {
    let result = {
      value: {},
      output: void 0
    };
    const infoToGet = { ...global_default.info, ...info3 };
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

  // libraries/esmonitor/src/globals.ts
  var isProxy = Symbol("isProxy");
  var fromInspectable = Symbol("fromInspectable");

  // libraries/common/standards.ts
  var keySeparator = ".";
  var defaultPath = "default";

  // libraries/common/pathHelpers.ts
  var hasKey = (key, obj) => key in obj;
  var getFromPath = (baseObject, path2, opts = {}) => {
    const fallbackKeys = opts.fallbacks ?? [];
    const keySeparator2 = opts.keySeparator ?? keySeparator;
    if (typeof path2 === "string")
      path2 = path2.split(keySeparator2);
    else if (typeof path2 == "symbol")
      path2 = [path2];
    let exists;
    path2 = [...path2];
    let ref2 = baseObject;
    for (let i = 0; i < path2.length; i++) {
      if (!ref2) {
        const message = `Could not get path`;
        console.error(message, path2, ref2);
        throw new Error(message);
      }
      const str = path2[i];
      if (!hasKey(str, ref2) && "esDOM" in ref2) {
        for (let i2 in fallbackKeys) {
          const key = fallbackKeys[i2];
          if (hasKey(key, ref2)) {
            ref2 = ref2[key];
            break;
          }
        }
      }
      exists = hasKey(str, ref2);
      if (exists)
        ref2 = ref2[str];
      else {
        ref2 = void 0;
        exists = true;
      }
    }
    if (opts.output === "info")
      return { value: ref2, exists };
    else
      return ref2;
  };
  var setFromPath = (path2, value, ref2, opts = {}) => {
    const create6 = opts?.create ?? false;
    const keySeparator2 = opts?.keySeparator ?? keySeparator;
    if (typeof path2 === "string")
      path2 = path2.split(keySeparator2);
    else if (typeof path2 == "symbol")
      path2 = [path2];
    path2 = [...path2];
    const copy = [...path2];
    const last = copy.pop();
    for (let i = 0; i < copy.length; i++) {
      const str = copy[i];
      let has = hasKey(str, ref2);
      if (create6 && !has) {
        ref2[str] = {};
        has = true;
      }
      if (has)
        ref2 = ref2[str];
      else {
        const message = `Could not set path`;
        console.error(message, path2);
        throw new Error(message);
      }
      if (ref2.esDOM)
        ref2 = ref2.esDOM;
    }
    ref2[last] = value;
  };

  // libraries/esmonitor/src/inspectable/handlers.ts
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
            const id2 = proxy.path[0];
            set("setters", pathStr, newVal, proxy.options.globalCallback, { [id2]: proxy.root }, proxy.listeners, proxy.options);
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
        const info3 = proxy?.state?.[pathStr]?.value ?? {};
        runCallback(callback, pathStr, info3, newVal);
        if (isFromInspectable)
          return true;
        else
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
      this.set = (path2, info3, update3) => {
        this.state[path2] = {
          output: update3,
          value: info3
        };
        setFromPath(path2, update3, this.proxy, { create: true });
      };
      this.check = canCreate;
      this.create = (key, parent, val, set2 = false) => {
        const create6 = this.check(parent, key, val);
        if (val === void 0)
          val = parent[key];
        if (create6 && !(create6 instanceof Error)) {
          parent[key] = new Inspectable(val, this.options, key, this);
          return parent[key];
        }
        if (set2) {
          try {
            this.proxy[key] = val ?? parent[key];
          } catch (e) {
            const isESM = esm(parent);
            const path2 = [...this.path, key];
            console.error(`Could not set value (${path2.join(this.options.keySeparator)})${isESM ? " because the parent is an ESM." : ""}`, isESM ? "" : e);
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
            let value = target[key];
            if (typeof value === "function") {
              target[key] = async (...args) => await this.proxy[key]({ [fromInspectable]: true, value }, ...args);
            } else {
              try {
                Object.defineProperty(target, key, {
                  get: () => value,
                  set: (val) => {
                    value = val;
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

  // libraries/esmonitor/src/optionsHelpers.ts
  var setFromOptions = (path2, value, baseOptions, opts) => {
    const ref2 = opts.reference;
    const id2 = Array.isArray(path2) ? path2[0] : typeof path2 === "string" ? path2.split(baseOptions.keySeparator)[0] : path2;
    let isDynamic = opts.hasOwnProperty("static") ? !opts.static : false;
    if (isDynamic && !globalThis.Proxy) {
      isDynamic = false;
      console.warn("Falling back to using function interception and setters...");
    }
    if (isDynamic) {
      value = new Inspectable(value, {
        pathFormat: baseOptions.pathFormat,
        keySeparator: baseOptions.keySeparator,
        listeners: opts.listeners,
        path: (path3) => path3.filter((str) => !baseOptions.fallbacks || !baseOptions.fallbacks.includes(str))
      }, id2);
    }
    let options = { keySeparator: baseOptions.keySeparator, ...opts };
    setFromPath(path2, value, ref2, options);
    return value;
  };

  // libraries/esmonitor/src/listeners.ts
  var info2 = (id2, callback, path2, originalValue, base2, listeners2, options) => {
    if (typeof path2 === "string")
      path2 = path2.split(options.keySeparator);
    const relativePath = path2.join(options.keySeparator);
    const refs = base2;
    const get12 = (path3) => {
      return getFromPath(base2, path3, {
        keySeparator: options.keySeparator,
        fallbacks: options.fallbacks
      });
    };
    const set2 = (path3, value) => setFromOptions(path3, value, options, {
      reference: base2,
      listeners: listeners2
    });
    let onUpdate = options.onUpdate;
    let infoToOutput = {};
    if (onUpdate && typeof onUpdate === "object" && onUpdate.callback instanceof Function) {
      infoToOutput = onUpdate.info ?? {};
      onUpdate = onUpdate.callback;
    }
    const absolute2 = [id2, ...path2];
    let pathInfo = {
      absolute: absolute2,
      relative: relativePath.split(options.keySeparator),
      parent: absolute2.slice(0, -1)
    };
    pathInfo.output = pathInfo[options.pathFormat];
    const completePathInfo = pathInfo;
    const info3 = {
      id: id2,
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
        return get12(info3.path.absolute);
      },
      set current(val) {
        set2(info3.path.absolute, val);
      },
      get parent() {
        return get12(info3.path.parent);
      },
      get reference() {
        return refs[id2];
      },
      set reference(val) {
        refs[id2] = val;
      },
      original: originalValue,
      history: typeof originalValue === "object" ? Object.assign({}, originalValue) : originalValue,
      sub: Symbol("subscription"),
      last: path2.slice(-1)[0]
    };
    return info3;
  };
  var registerInLookup = (name, sub, lookups) => {
    if (lookups) {
      const id2 = Math.random();
      lookups.symbol[sub] = {
        name,
        id: id2
      };
      if (!lookups.name[name])
        lookups.name[name] = {};
      lookups.name[name][id2] = sub;
    }
  };
  var register = (info3, collection, lookups) => {
    const absolute2 = getPath("absolute", info3);
    if (!collection[absolute2])
      collection[absolute2] = {};
    collection[absolute2][info3.sub] = info3;
    registerInLookup(absolute2, info3.sub, lookups);
  };
  var listeners = {
    functions: functions2,
    setters
  };
  var set = (type, absPath, value, callback, base2, allListeners, options) => {
    const { id: id2, path: path2 } = getPathInfo(absPath, options);
    const fullInfo = info2(id2, callback, path2, value, base2, listeners, options);
    if (listeners[type])
      listeners[type](fullInfo, allListeners[type], allListeners.lookup);
    else {
      const path3 = getPath("absolute", fullInfo);
      allListeners[type][path3][fullInfo.sub] = fullInfo;
      if (allListeners.lookup)
        registerInLookup(path3, fullInfo.sub, allListeners.lookup);
    }
  };
  var get2 = (info3, collection) => collection[getPath("absolute", info3)];
  var handler = (info3, collection, subscribeCallback, lookups) => {
    if (!get2(info3, collection)) {
      let parent = info3.parent;
      let val = parent[info3.last];
      subscribeCallback(val, parent);
    }
    register(info3, collection, lookups);
  };
  var setterExecution = (listeners2, value) => {
    return iterateSymbols(listeners2, (_, o) => {
      const path2 = getPath("output", o);
      runCallback(o.callback, path2, {}, value);
    });
  };
  function setters(info3, collection, lookups) {
    handler(info3, collection, (value, parent) => {
      let val = value;
      if (!parent[isProxy]) {
        let redefine = true;
        try {
          delete parent[info3.last];
        } catch (e) {
          console.error("Unable to redeclare setters. May already be a dynamic object...");
          redefine = false;
        }
        if (redefine) {
          try {
            Object.defineProperty(parent, info3.last, {
              get: () => val,
              set: async (v) => {
                val = v;
                const listeners2 = Object.assign({}, collection[getPath("absolute", info3)]);
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
      const path2 = getPath("output", o);
      runCallback(o.callback, path2, executionInfo.value, executionInfo.output);
    });
    return executionInfo;
  };
  function functions2(info3, collection, lookups) {
    handler(info3, collection, (_, parent) => {
      if (!parent[isProxy]) {
        parent[info3.last] = function(...args) {
          const listeners2 = collection[getPath("absolute", info3)];
          return functionExecution(this, listeners2, info3.original, args);
        };
      }
    }, lookups);
  }

  // libraries/common/drill.js
  var drillSimple = (obj, callback, options) => {
    let accumulator = options.accumulator;
    if (!accumulator)
      accumulator = options.accumulator = {};
    const ignore = options.ignore || [];
    const path2 = options.path || [];
    const condition = options.condition || true;
    const seen = [];
    const fromSeen = [];
    let drill = (obj2, acc = {}, globalInfo) => {
      for (let key in obj2) {
        if (ignore.includes(key))
          continue;
        const val = obj2[key];
        const newPath = [...globalInfo.path, key];
        const info3 = {
          typeof: typeof val,
          name: val?.constructor?.name,
          simple: true,
          object: val && typeof val === "object",
          path: newPath
        };
        if (info3.object) {
          const name = info3.name;
          const isESM = esm(val);
          if (isESM || name === "Object" || name === "Array") {
            info3.simple = true;
            const idx = seen.indexOf(val);
            if (idx !== -1)
              acc[key] = fromSeen[idx];
            else {
              seen.push(val);
              const pass2 = condition instanceof Function ? condition(key, val, info3) : condition;
              info3.pass = pass2;
              acc[key] = callback(key, val, info3);
              if (pass2) {
                fromSeen.push(acc[key]);
                acc[key] = drill(val, acc[key], { ...globalInfo, path: newPath });
              }
            }
          } else {
            info3.simple = false;
            acc[key] = callback(key, val, info3);
          }
        } else
          acc[key] = callback(key, val, info3);
      }
      return acc;
    };
    return drill(obj, accumulator, { path: path2 });
  };

  // libraries/esmonitor/src/Monitor.ts
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
      this.get = (path2, output) => {
        return getFromPath(this.references, path2, {
          keySeparator: this.options.keySeparator,
          fallbacks: this.options.fallbacks,
          output
        });
      };
      this.set = (path2, value, opts = {}) => {
        const optsCopy = { ...opts };
        if (!optsCopy.reference)
          optsCopy.reference = this.references;
        if (!optsCopy.listeners)
          optsCopy.listeners = this.listeners;
        return setFromOptions(path2, value, this.options, optsCopy);
      };
      this.on = (absPath, callback) => {
        const info3 = getPathInfo(absPath, this.options);
        return this.listen(info3.id, callback, info3.path);
      };
      this.getInfo = (label, callback, path2, original) => {
        const info3 = info2(label, callback, path2, original, this.references, this.listeners, this.options);
        const id2 = Math.random();
        const lookups = this.listeners.lookup;
        const name = getPath("absolute", info3);
        lookups.symbol[info3.sub] = {
          name,
          id: id2
        };
        if (!lookups.name[name])
          lookups.name[name] = {};
        lookups.name[name][id2] = info3.sub;
        return info3;
      };
      this.listen = (id2, callback, path2 = [], __internal = {}) => {
        if (typeof path2 === "string")
          path2 = path2.split(this.options.keySeparator);
        else if (typeof path2 === "symbol")
          path2 = [path2];
        const arrayPath = path2;
        let baseRef = this.references[id2];
        if (!baseRef) {
          console.error(`Reference ${id2} does not exist.`);
          return;
        }
        if (!__internal.poll)
          __internal.poll = esm(baseRef);
        if (!__internal.seen)
          __internal.seen = [];
        const __internalComplete = __internal;
        if (!this.references[id2])
          this.references[id2] = baseRef;
        let ref2 = this.get([id2, ...arrayPath]);
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
        if (toMonitorInternally(ref2, true)) {
          if (ref2.__esInspectable)
            ref2.__esInspectable.options.globalCallback = callback;
          drillSimple(ref2, (_, __, drillInfo) => {
            if (drillInfo.pass)
              return;
            else {
              const fullPath = [...arrayPath, ...drillInfo.path];
              const internalSubs = this.listen(id2, callback, fullPath, __internalComplete);
              Object.assign(subs, internalSubs);
            }
          }, {
            condition: (_, val) => toMonitorInternally(val)
          });
        }
        let info3;
        try {
          if (__internalComplete.poll) {
            info3 = this.getInfo(id2, callback, arrayPath, ref2);
            this.poller.add(info3);
          } else {
            let type = "setters";
            if (typeof ref2 === "function")
              type = "functions";
            info3 = this.getInfo(id2, callback, arrayPath, ref2);
            this.add(type, info3);
          }
        } catch (e) {
          console.error("Fallback to polling:", path2, e);
          info3 = this.getInfo(id2, callback, arrayPath, ref2);
          this.poller.add(info3);
        }
        subs[getPath("absolute", info3)] = info3.sub;
        if (this.options.onInit instanceof Function) {
          const executionInfo = {};
          for (let key in info3.infoToOutput)
            executionInfo[key] = void 0;
          this.options.onInit(getPath("output", info3), executionInfo);
        }
        return subs;
      };
      this.add = (type, info3) => {
        if (listeners_exports[type])
          listeners_exports[type](info3, this.listeners[type], this.listeners.lookup);
        else
          this.listeners[type][getPath("absolute", info3)][info3.sub] = info3;
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
        const info3 = this.listeners.lookup.symbol[sub];
        const absPath = info3.name;
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
            const value = parent[last];
            Object.defineProperty(parent, last, { value, writable: true });
            delete this.listeners.setters[absPath];
          }
        } else
          return false;
        delete this.listeners.lookup.symbol[sub];
        const nameLookup = this.listeners.lookup.name[info3.name];
        delete nameLookup[info3.id];
        if (!Object.getOwnPropertyNames(nameLookup).length)
          delete this.listeners.lookup.name[info3.name];
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

  // libraries/esmonitor/src/index.ts
  var src_default = Monitor;

  // libraries/escompose/src/create/element.ts
  function create(id2, esm2, parent) {
    let element = esm2.esElement;
    let info3;
    if (!(element instanceof Element)) {
      const hasChildren = esm2.esDOM && Object.keys(esm2.esDOM).length > 0;
      const defaultTagName = hasChildren ? "div" : "link";
      if (element === void 0)
        element = defaultTagName;
      else if (Array.isArray(element))
        element = document.createElement(...element);
      else if (typeof element === "object") {
        info3 = element;
        if (info3.selectors)
          element = document.querySelector(info3.selectors);
        else if (info3.id)
          element = document.getElementById(info3.id);
        else
          element = defaultTagName;
      }
      if (typeof element === "string")
        element = document.createElement(element);
      if (!esm2.hasOwnProperty("default")) {
        esm2.default = function(input) {
          this.esElement.innerText = input;
          return input;
        };
      }
    }
    if (!(element instanceof Element))
      console.warn("Element not found for", id2);
    let states = {
      element,
      attributes: esm2.esAttributes,
      parentNode: esm2.esParent ?? (parent?.esElement instanceof Element ? parent.esElement : void 0),
      onresize: esm2.esOnResize,
      onresizeEventCallback: void 0
    };
    if (element instanceof Element) {
      if (typeof id2 !== "string")
        id2 = `${element.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
      if (!element.id)
        element.id = id2;
    }
    const setAttributes = (attributes) => {
      if (esm2.esElement instanceof Element) {
        for (let key in attributes) {
          if (key === "style") {
            for (let styleKey in attributes.style)
              esm2.esElement.style[styleKey] = attributes.style[styleKey];
          } else {
            if (typeof attributes[key] === "function") {
              const func = attributes[key];
              esm2.esElement[key] = (...args) => {
                const context = esm2.__esProxy ?? esm2;
                return func.call(context ?? esm2, ...args);
              };
            } else
              esm2.esElement[key] = attributes[key];
          }
        }
      }
    };
    Object.defineProperty(esm2, "esAttributes", {
      get: () => states.attributes,
      set: (value) => {
        states.attributes = value;
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
          for (let name in esm2.esDOM) {
            const component = esm2.esDOM[name];
            component.esParent = v;
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
          if (v)
            v.appendChild(esm2.esElement);
        } else {
          for (let name in esm2.esDOM) {
            const component = esm2.esDOM[name];
            component.esParent = v;
          }
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
    esm2.esOnResize = states.onresize;
    esm2.esParent = states.parentNode;
    if (esm2.esElement instanceof Element) {
      esm2.esElement.esComponent = esm2;
      esm2.esElement.setAttribute("__isescomponent", "");
    }
    return element;
  }

  // libraries/escompose/src/create/component.ts
  var registry = {};
  var ogCreateElement = document.createElement;
  document.createElement = function(name, options) {
    const info3 = registry[name];
    const created = info3 && !info3.autonomous ? ogCreateElement.call(this, info3.tag, { is: name }) : ogCreateElement.call(this, name, options);
    return created;
  };
  var tagToClassMap = {
    li: "LI"
  };
  var isAutonomous = false;
  var define = (config2, esm2) => {
    esm2 = Object.assign({}, esm2);
    if (!registry[config2.name]) {
      const clsName = isAutonomous ? "" : tagToClassMap[config2.extends] ?? config2.extends[0].toUpperCase() + config2.extends.slice(1);
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
          esm2.esElement = this;
          this.__esComponent = src_default2(esm2);
        }
        connectedCallback() {
          console.log("Custom element added to page.");
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
      registry[config2.name] = {
        class: ESComponent,
        autonomous: isAutonomous,
        tag: config2.extends
      };
      const cls = registry[config2.name].class;
      if (isAutonomous)
        customElements.define(config2.name, cls);
      else
        customElements.define(config2.name, cls, { extends: config2.extends });
    } else {
      console.log("Already created component...");
    }
  };

  // libraries/common/clone.js
  var deep = (obj, opts = {}) => {
    obj = Object.assign({}, obj);
    opts.accumulator = Array.isArray(obj) ? [] : {};
    drillSimple(obj, (key, val, info3) => {
      if (info3.simple && info3.object)
        return Array.isArray(val) ? [] : {};
      else
        return val;
    }, opts);
    return opts.accumulator;
  };

  // libraries/escompose/src/create/index.ts
  var animations = {};
  var create_default = (id2, esm2, parent) => {
    const copy = deep(esm2);
    let registry2 = esm2.esComponents ?? {};
    for (let key in registry2) {
      const esm3 = registry2[key];
      const info3 = esm3.esElement;
      if (info3.name && info3.extends)
        define(info3, esm3);
    }
    let el = create(id2, esm2, parent);
    esm2.esElement = el;
    const ogInit = esm2.esInit;
    esm2.esInit = () => {
      for (let name in esm2.esDOM) {
        const init2 = esm2.esDOM[name].esInit;
        if (typeof init2 === "function")
          init2();
        else
          console.error(`Could not start component ${name} because it does not have an esInit function`);
      }
      if (esm2.hasOwnProperty("esTrigger")) {
        if (!Array.isArray(esm2.esTrigger))
          esm2.esTrigger = [];
        esm2.default(...esm2.esTrigger);
        delete esm2.esTrigger;
      }
      if (esm2.esAnimate) {
        let original = esm2.esAnimate;
        const id3 = Math.random();
        const interval2 = typeof original === "number" ? original : "global";
        if (!animations[interval2]) {
          const info3 = animations[interval2] = { objects: { [id3]: esm2 } };
          const objects2 = info3.objects;
          const runFuncs = () => {
            for (let key in objects2)
              objects2[key].default();
          };
          if (interval2 === "global") {
            const callback = () => {
              runFuncs();
              info3.id = window.requestAnimationFrame(callback);
            };
            callback();
            animations[interval2].stop = () => {
              window.cancelAnimationFrame(info3.id);
              info3.cancel = true;
            };
          } else {
            info3.id = setInterval(() => runFuncs(), 1e3 / interval2);
            animations[interval2].stop = () => clearInterval(info3.id);
          }
        } else
          animations[interval2].objects[id3] = esm2;
        esm2.esAnimate = {
          id: id3,
          original,
          stop: () => {
            delete animations[interval2].objects[id3];
            esm2.esAnimate = original;
            if (Object.keys(animations[interval2].objects).length === 0) {
              animations[interval2].stop();
              delete animations[interval2];
            }
          }
        };
      }
      const context = esm2.__esProxy ?? esm2;
      if (ogInit)
        ogInit.call(context);
    };
    const ogDelete = esm2.esDelete;
    esm2.esDelete = function() {
      if (this.esElement instanceof Element) {
        this.esElement.remove();
        if (this.onremove) {
          const context2 = esm2.__esProxy ?? esm2;
          this.onremove.call(context2);
        }
      }
      if (esm2.esAnimate && typeof esm2.esAnimate.stop === "function")
        esm2.esAnimate.stop();
      if (esm2.esListeners)
        esm2.esListeners.__manager.clear();
      if (esm2.esDOM) {
        for (let name in esm2.esDOM)
          esm2.esDOM[name].esDelete();
      }
      const context = esm2.__esProxy ?? esm2;
      if (ogDelete)
        ogDelete.call(context);
      esm2.esInit = ogInit;
      esm2.esDelete = ogDelete;
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
    if (typeof id2 === "string") {
      if (parent?.__isESComponent)
        isESC.value = [parent.__isESComponent, id2];
      else
        isESC.value = [id2];
      isESC.value = isESC.value.join(keySeparator);
    }
    Object.defineProperty(esm2, "__isESComponent", isESC);
    Object.defineProperty(esm2, "esOriginal", { value: copy, enumerable: false });
    return esm2;
  };

  // libraries/escompose/src/utils.ts
  var merge = (main3, override) => {
    const copy = Object.assign({}, main3);
    if (override) {
      const keys = Object.keys(copy);
      const newKeys = new Set(Object.keys(override));
      keys.forEach((k) => {
        newKeys.delete(k);
        if (typeof override[k] === "object" && !Array.isArray(override[k])) {
          if (typeof copy[k] === "object")
            copy[k] = merge(copy[k], override[k]);
          else
            copy[k] = override[k];
        } else if (typeof override[k] === "function") {
          const original = copy[k];
          copy[k] = function(...args) {
            if (typeof original === "function")
              original.call(this, ...args);
            override[k].call(this, ...args);
          };
        } else if (k in override)
          copy[k] = override[k];
      });
      newKeys.forEach((k) => copy[k] = override[k]);
    }
    return copy;
  };

  // libraries/escompose/src/index.ts
  var listenerObject = Symbol("listenerObject");
  var esMerge = (base2, esCompose = {}) => {
    if (!Array.isArray(esCompose))
      esCompose = [esCompose];
    let clonedEsCompose = esCompose.map((o) => deep(o));
    let merged = Object.assign({}, base2);
    clonedEsCompose.reverse().forEach((toCompose) => merged = merge(Object.assign({}, toCompose), merged));
    return merged;
  };
  var esDrill = (o, id2, parent, opts) => {
    const parentId = parent?.__isESComponent;
    const path2 = parentId ? [parentId, id2] : typeof id2 === "string" ? [id2] : [];
    const merged = esMerge(o, o.esCompose);
    delete merged.esCompose;
    const instance = create_default(id2, merged, parent);
    const savePath = path2.join(opts.keySeparator ?? keySeparator);
    if (opts?.components)
      opts.components[savePath] = { instance, depth: parent ? path2.length + 1 : path2.length };
    if (instance.esDOM) {
      for (let name in instance.esDOM) {
        const base2 = instance.esDOM[name];
        const thisInstance = esDrill(base2, name, instance, opts);
        instance.esDOM[name] = thisInstance;
      }
    }
    return instance;
  };
  var handleListenerValue = ({
    context,
    root,
    fromPath,
    toPath,
    config: config2,
    listeners: listeners2
  }) => {
    const fromSubscriptionPath = [context.id];
    const topPath = [];
    if (root)
      topPath.push(...root.split(context.options.keySeparator));
    if (fromPath)
      topPath.push(...fromPath.split(context.options.keySeparator));
    fromSubscriptionPath.push(...topPath);
    const obj = context.monitor.get(fromSubscriptionPath);
    if (obj?.hasOwnProperty("__isESComponent"))
      fromSubscriptionPath.push(defaultPath);
    const value = config2;
    const fromStringPath = topPath.join(context.options.keySeparator);
    const sub = !listeners2.has(fromStringPath) ? context.monitor.on(fromSubscriptionPath, (path2, _, args) => passToListeners(context, listeners2, path2, args)) : void 0;
    listeners2.add(fromStringPath, toPath, { value, root }, sub);
  };
  var ListenerManager = class {
    constructor(monitor2, listeners2 = {}) {
      this.original = {};
      this.active = {};
      this.register = (listeners2) => {
        this.original = listeners2;
        Object.defineProperty(listeners2, "__manager", {
          value: this,
          enumerable: false,
          writable: true
        });
      };
      this.add = (from, to, value = true, subscription = this.active[from].sub) => {
        let root = "";
        if (value?.hasOwnProperty("root"))
          root = value.root;
        if (value?.hasOwnProperty("value"))
          value = value.value;
        else
          console.error("No root provided for new edge...");
        if (!this.active[from])
          this.active[from] = {};
        this.active[from][to] = {
          value,
          root,
          subscription,
          [listenerObject]: true
        };
        let base2 = this.original[to];
        if (!base2)
          base2 = this.original[to] = {};
        if (typeof base2 !== "object") {
          if (typeof base2 === "function")
            base2 = this.original[to] = { [Symbol("function listener")]: base2 };
          else
            base2 = this.original[to] = { [base2]: true };
        }
        base2[from] = value;
      };
      this.remove = (from, to) => {
        const toRemove = [
          { ref: this.active, path: [from, to], unlisten: true },
          { ref: this.original, path: [to, from] }
        ];
        toRemove.forEach((o) => {
          const { ref: ref2, path: path2, unlisten } = o;
          let base2 = ref2[path2[0]];
          if (typeof base2 === "object") {
            const info3 = base2[path2[1]];
            delete base2[path2[1]];
            if (Object.keys(base2).length === 0) {
              delete ref2[path2[0]];
              if (unlisten && info3.subscription)
                this.monitor.remove(info3.subscription);
            }
          } else
            delete ref2[path2[0]];
        });
      };
      this.clear = () => {
        Object.keys(this.active).forEach((from) => {
          Object.keys(this.active[from]).forEach((to) => {
            this.remove(from, to);
          });
        });
      };
      this.has = (from) => !!this.active[from];
      this.get = (from) => this.active[from];
      this.monitor = monitor2;
      this.register(listeners2);
    }
  };
  var setListeners = (context, components) => {
    for (let root in components) {
      const info3 = components[root];
      const to = info3.instance.esListeners;
      const listeners2 = new ListenerManager(context.monitor, to);
      for (let toPath in to) {
        const from = to[toPath];
        const mainInfo = {
          context,
          root,
          toPath,
          listeners: listeners2
        };
        if (from && typeof from === "object") {
          for (let fromPath in from)
            handleListenerValue({ ...mainInfo, fromPath, config: from[fromPath] });
        } else {
          if (typeof toPath === "string")
            handleListenerValue({ ...mainInfo, fromPath: from, config: toPath });
          else
            console.error("Improperly Formatted Listener", to);
        }
      }
    }
  };
  function pass(from, target, args, context) {
    const id2 = context.id;
    let parent, key, root, subscription;
    const isValue = target?.__value;
    parent = target.parent;
    key = target.key;
    root = target.root;
    subscription = target.subscription;
    const rootArr = root.split(context.options.keySeparator);
    const info3 = target.parent[key];
    target = info3.value;
    let config2 = info3?.esConfig;
    let ogValue = target;
    const type = typeof target;
    const checkIfSetter = (path2, willSet) => {
      const info4 = context.monitor.get(path2, "info");
      if (info4.exists) {
        const val = info4.value;
        const noDefault = typeof val !== "function" && !val?.default;
        const value = noDefault ? toSet : val;
        const res = {
          value,
          root,
          subscription
        };
        if (willSet) {
          target = res.value;
          parent[key] = res;
        }
        return res;
      } else
        return { value: void 0, root: void 0 };
    };
    const transform = (willSet) => {
      const fullPath = [id2];
      if (root)
        fullPath.push(...rootArr);
      fullPath.push(...key.split(context.options.keySeparator));
      return checkIfSetter(fullPath, willSet);
    };
    if (typeof target === "boolean") {
      if (!isValue)
        transform(true);
      else
        console.error("Cannot use a boolean for esListener...");
    } else if (type === "string") {
      const path2 = [id2];
      const topPath = [];
      if (root)
        topPath.push(...rootArr);
      topPath.push(...ogValue.split(context.options.keySeparator));
      path2.push(...topPath);
      checkIfSetter(path2, true);
      if (isValue) {
        parent[key] = { [ogValue]: parent[key] };
        key = ogValue;
      }
    } else if (target && type === "object") {
      const isConfig = "esFormat" in ogValue || "esBranch" in ogValue;
      if (isConfig) {
        transform(true);
        if (ogValue) {
          if (ogValue)
            config2 = ogValue;
          Object.defineProperty(parent[key], "esConfig", { value: config2 });
        }
      }
    }
    let isValidInput = true;
    if (config2) {
      if ("esFormat" in config2) {
        try {
          args = config2.esFormat(...args);
          if (args === void 0)
            isValidInput = false;
          if (!Array.isArray(args))
            args = [args];
        } catch (e) {
          console.error("Failed to format arguments", e);
        }
      }
      if ("esBranch" in config2) {
        let isValid = false;
        config2.esBranch.forEach((o) => {
          if (o.equals === args[0]) {
            if (o.hasOwnProperty("value"))
              args[0] = o.value;
            isValid = true;
          }
        });
        if (!isValid)
          isValidInput = false;
      }
    }
    if (isValidInput) {
      if (target === toSet) {
        const parentPath = [id2];
        if (root)
          parentPath.push(...rootArr);
        parentPath.push(...key.split(context.options.keySeparator));
        const idx = parentPath.pop();
        const info4 = context.monitor.get(parentPath, "info");
        info4.value[idx] = args[0];
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
  }
  function passToListeners(context, listeners2, name, ...args) {
    const sep = context.options.keySeparator;
    const check = `${sep}${defaultPath}`;
    const noDefault = name.slice(-check.length) === check ? name.slice(0, -check.length) : name;
    const listenerGroups = [{
      info: listeners2.get(noDefault),
      name: noDefault
    }];
    listenerGroups.forEach((group) => {
      const info3 = group.info;
      if (info3) {
        if (info3[listenerObject]) {
          pass(noDefault, {
            value: info3.value,
            parent: listeners2.active,
            key: group.name,
            root: info3.root,
            subscription: info3.subscription,
            __value: true
          }, args, context);
        } else if (typeof info3 === "object") {
          for (let key in info3) {
            pass(noDefault, {
              parent: info3,
              key,
              root: info3[key].root,
              subscription: info3[key].subscription,
              value: info3[key].value
            }, args, context);
          }
        } else
          console.error("Improperly Formatted Listener", info3);
      }
    });
  }
  var toSet = Symbol("toSet");
  var create2 = (config2, options = {}) => {
    let monitor2;
    if (options.monitor instanceof src_default) {
      monitor2 = options.monitor;
      options.keySeparator = monitor2.options.keySeparator;
    } else {
      if (!options.monitor)
        options.monitor = {};
      if (!options.monitor.keySeparator) {
        if (!options.keySeparator)
          options.keySeparator = keySeparator;
        options.monitor.keySeparator = options.keySeparator;
      }
      monitor2 = new src_default(options.monitor);
    }
    if (options.clone)
      config2 = deep(config2);
    monitor2.options.fallbacks = ["esDOM"];
    const fullOptions = options;
    const components = {};
    const drillOpts = {
      components,
      keySeparator: fullOptions.keySeparator
    };
    let fullInstance;
    if (options.nested?.parent && options.nested?.name) {
      fullInstance = esDrill(config2, options.nested.name, options.nested.parent, drillOpts);
    } else {
      const id2 = Symbol("root");
      const instance = esDrill(config2, id2, void 0, drillOpts);
      fullInstance = instance;
      monitor2.set(id2, fullInstance, fullOptions.listeners);
      const context = {
        id: id2,
        instance: fullInstance,
        monitor: monitor2,
        options: fullOptions
      };
      setListeners(context, components);
    }
    fullInstance.esInit();
    return fullInstance;
  };
  var src_default2 = create2;

  // libraries/esmpile/src/utils/mimeTypes.js
  var js = "application/javascript";
  var isJS = (type) => !type || type === "application/javascript";
  var map = {
    "js": js,
    "mjs": js,
    "cjs": js,
    "ts": "text/typescript",
    "json": "application/json",
    "html": "text/html",
    "css": "text/css",
    "txt": "text/plain",
    "svg": "image/svg+xml",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
    "mp3": "audio/mpeg",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "ogg": "application/ogg",
    "wav": "audio/wav"
  };
  var get3 = (extension2) => map[extension2];

  // libraries/esmpile/src/utils/defaults.js
  var defaults_default = {
    nodeModules: {
      nodeModules: "node_modules",
      relativeTo: "./"
    }
  };

  // libraries/esmpile/src/utils/path.js
  var urlSep = "://";
  var get4 = (path2, rel = "", keepRelativeImports = false, isDirectory = false) => {
    if (url(path2))
      return path2;
    let prefix = "";
    const getPrefix = (str) => {
      prefix = str.includes(urlSep) ? str.split(urlSep).splice(0, 1) : void 0;
      if (prefix)
        return str.replace(`${prefix}${urlSep}`, "");
      else
        return str;
    };
    if (path2.includes(urlSep))
      path2 = getPrefix(path2);
    if (rel.includes(urlSep))
      rel = getPrefix(rel);
    if (!keepRelativeImports)
      rel = rel.split("/").filter((v) => v != "..").join("/");
    if (rel[rel.length - 1] === "/")
      rel = rel.slice(0, -1);
    let dirTokens = rel.split("/");
    if (dirTokens.length === 1 && dirTokens[0] === "")
      dirTokens = [];
    if (!isDirectory) {
      const potentialFile = dirTokens.pop();
      if (potentialFile) {
        const splitPath2 = potentialFile.split(".");
        if (splitPath2.length == 1 || splitPath2.length > 1 && splitPath2.includes(""))
          dirTokens.push(potentialFile);
      }
    }
    const splitPath = path2.split("/");
    const pathTokens = splitPath.filter((str, i) => !!str);
    const extensionTokens = pathTokens.filter((str, i) => {
      if (str === "..") {
        dirTokens.pop();
        return false;
      } else if (str === ".")
        return false;
      else
        return true;
    });
    const newPath = [...dirTokens, ...extensionTokens].join("/");
    if (prefix)
      return prefix + "://" + newPath;
    else
      return newPath;
  };
  function absolute(uri, urlWorks) {
    const absolutePath = uri[0] !== ".";
    const isRemote = url(uri);
    return absolutePath && (urlWorks || !isRemote);
  }
  function url(uri) {
    try {
      new URL(uri);
      return true;
    } catch {
      return false;
    }
  }
  var extension = (path2) => {
    const ext = path2.split("/").slice(-1)[0].split(".").slice(-1)[0];
    if (map[ext])
      return ext;
  };
  var base = (str) => str.substring(0, str.lastIndexOf("/"));
  var noBase = (path2, opts, removeNode) => {
    path2 = globalThis.location ? path2.replace(`${base(globalThis.location.href)}/`, "./") : path2;
    const absolutePath = absolute(path2, true);
    const relativeTo = opts.relativeTo ?? defaults_default.nodeModules.relativeTo;
    const nodeModulePath = opts.nodeModules ?? defaults_default.nodeModules.nodeModules;
    if (absolutePath)
      return path2;
    else {
      let noBase2 = path2;
      if (removeNode)
        noBase2 = noBase2.replace(`${nodeModulePath}/`, "");
      noBase2 = noBase2.replace(`${relativeTo.split("/").slice(0, -1).join("/")}/`, "");
      if (noBase2[0] !== ".")
        noBase2 = `./${noBase2}`;
      return noBase2;
    }
  };
  var pathId = (path2, opts) => get4(noBase(path2, opts));

  // libraries/esmpile/src/utils/nodeModules.js
  var path = (opts) => {
    const nodeModules = opts.nodeModules ?? defaults_default.nodeModules.nodeModules;
    const relativeTo = opts.relativeTo ?? defaults_default.nodeModules.relativeTo;
    return get4(nodeModules, relativeTo);
  };
  var resolve = async (uri, opts) => {
    const absoluteNodeModules = path(opts);
    const split = uri.split("/");
    let base2 = get4(uri, absoluteNodeModules);
    if (split.length > 1) {
      const hasExt = extension(base2);
      if (hasExt)
        return base2;
      else
        base2 += "/package.json";
    }
    return await getMainPath(uri, base2, opts).catch((e) => {
      console.warn(`${base2} does not exist or is not at the root of the project.`);
    });
  };
  var getPath2 = (str, path2, base2) => get4(str, base2, false, path2.split("/").length === 1);
  var getPackagePath = (path2, base2 = path2) => getPath2("package.json", path2, base2);
  var getMainPath = async (path2, base2 = path2, opts = {}) => {
    const pkg = await getPackage(path2, base2, opts);
    if (!pkg)
      return base2;
    const destination = pkg.module || pkg.main || "index.js";
    return getPath2(destination, path2, base2);
  };
  var getPackage = async (path2, base2 = path2, opts) => {
    const pkgPath = getPackagePath(path2, base2);
    const isURL = url(pkgPath);
    const correct = isURL ? pkgPath : new URL(pkgPath, window.location.href).href;
    return (await import(correct, { assert: { type: "json" } })).default;
  };
  var transformation = {
    name: "node_modules",
    handler: resolve
  };

  // libraries/esmpile/src/utils/transformations.js
  var extensionTransformations = ["ts", "js"];
  var allTransformations = [...extensionTransformations, transformation];
  var get5 = (uri) => {
    const pathExt = extension(uri);
    const abs = absolute(uri);
    const baseNodeModule = abs ? uri.split("/").length === 1 : false;
    const noExt = !pathExt;
    if (!baseNodeModule && abs && noExt) {
      const mapped = extensionTransformations.map((ext) => {
        return {
          extension: ext,
          name: `${transformation.name} + ${ext}`,
          handler: transformation.handler
        };
      });
      if (uri.split("/").length === 1)
        return [transformation, ...mapped];
      else
        return [...mapped, transformation];
    } else if (abs)
      return [...allTransformations].reverse();
    else if (noExt)
      return [...allTransformations];
    else
      return [];
  };

  // libraries/esmpile/src/utils/errors.js
  var middle = "was not resolved locally. You can provide a direct reference to use in";
  var create3 = (uri, key = uri) => new Error(`${uri} ${middle} options.filesystem._fallbacks['${key}'].`);

  // libraries/esmpile/src/utils/handlers.js
  var noExtension = (path2, repExt = "js") => {
    const absolutePath = absolute(path2);
    const split = path2.split("/");
    const ext = extension(path2);
    if (!absolutePath || absolutePath && split.length > 1) {
      if (!ext)
        return `${path2}.${repExt}`;
    }
    return path2;
  };
  var transformation2 = async (path2, transformation3, opts, force) => {
    const type = typeof transformation3;
    if (type === "string" && (!force || force === "string")) {
      return noExtension(path2, transformation3);
    } else if (type === "object" && (!force || force === "object")) {
      if (transformation3.extension)
        path2 = noExtension(path2, transformation3.extension);
      return await transformation3.handler(path2, opts).catch((e) => {
        throw create3(path2, noBase(path2, opts));
      });
    }
  };

  // libraries/esmpile/src/utils/request.js
  var getURL = (path2) => {
    let url2;
    try {
      url2 = new URL(path2).href;
    } catch {
      url2 = get4(path2, globalThis.location.href);
    }
    return url2;
  };
  var handleFetch = async (path2, options = {}) => {
    if (!options.fetch)
      options.fetch = {};
    if (!options.fetch.mode)
      options.fetch.mode = "cors";
    const url2 = getURL(path2);
    const progressCallback = options?.callbacks?.progress?.fetch;
    const info3 = await fetchRemote(url2, options, {
      path: path2,
      progress: progressCallback
    });
    if (!info3.buffer)
      throw new Error("No response received.");
    const type = info3.type.split(";")[0];
    return {
      ...info3,
      url: url2,
      type
    };
  };
  var fetchRemote = async (url2, options = {}, additionalArgs) => {
    const path2 = additionalArgs.path ?? url2;
    const pathId2 = get4(noBase(path2, options));
    const response = await globalThis.fetch(url2, options.fetch);
    let bytesReceived = 0;
    let buffer = [];
    let bytes = 0;
    const hasProgressFunction = typeof additionalArgs.progress === "function";
    const info3 = await new Promise(async (resolve2) => {
      if (response) {
        bytes = parseInt(response.headers.get("Content-Length"), 10);
        const type = response.headers.get("Content-Type");
        if (globalThis.REMOTEESM_NODE) {
          const buffer2 = await response.arrayBuffer();
          resolve2({ buffer: buffer2, type });
        } else {
          const reader = response.body.getReader();
          const processBuffer = async ({ done, value }) => {
            if (done) {
              const config2 = {};
              if (typeof type === "string")
                config2.type = type;
              const blob = new Blob(buffer, config2);
              const ab = await blob.arrayBuffer();
              resolve2({ buffer: new Uint8Array(ab), type });
              return;
            }
            bytesReceived += value.length;
            const chunk = value;
            buffer.push(chunk);
            if (hasProgressFunction)
              additionalArgs.progress(pathId2, bytesReceived, bytes, null, null, response.headers.get("Range"));
            return reader.read().then(processBuffer);
          };
          reader.read().then(processBuffer);
        }
      } else {
        console.warn("Response not received!", options.headers);
        resolve2(void 0);
      }
    });
    const output = {
      response,
      ...info3
    };
    if (hasProgressFunction) {
      const status = [null, null];
      if (response.ok)
        status[0] = output;
      else
        status[1] = output;
      additionalArgs.progress(pathId2, bytesReceived, bytes, ...status, response.headers.get("Range"));
    }
    return output;
  };

  // libraries/esmpile/src/utils/response.js
  var enc = new TextDecoder("utf-8");
  var get6 = async (uri, opts, expectedType) => {
    const info3 = { uri, text: { original: "", updated: "" }, buffer: null };
    if (globalThis.REMOTEESM_NODE) {
      const absPath = uri.replace("file://", "");
      info3.buffer = globalThis.fs.readFileSync(absPath);
      info3.text.original = info3.text.updated = enc.decode(info3.buffer);
    } else {
      const fetchInfo = await handleFetch(uri, opts);
      const response = fetchInfo.response;
      info3.response = response;
      if (response.ok) {
        if (expectedType) {
          const mimeType = response.headers.get("Content-Type");
          if (!mimeType.includes(expectedType))
            throw new Error(`Expected Content Type ${expectedType} but received ${mimeType} for  ${uri}`);
        }
        info3.buffer = fetchInfo.buffer;
        info3.text.original = info3.text.updated = enc.decode(info3.buffer);
      } else {
        throw new Error(response.statusText);
      }
    }
    return info3;
  };
  var find = async (uri, opts, callback) => {
    const transArray = get5(uri);
    let response;
    if (transArray.length > 0) {
      do {
        const ext = transArray.shift();
        const name = ext?.name ?? ext;
        const warning = (e) => {
          if (opts.debug)
            console.error(`Import using ${name ?? ext} transformation failed for ${uri}`);
        };
        const transformed = await transformation2(uri, ext, opts);
        const correctURI = get4(transformed, opts.relativeTo);
        const expectedType = ext ? null : "application/javascript";
        response = await callback(correctURI, opts, expectedType).then((res) => {
          if (opts.debug)
            console.warn(`Import using ${name ?? ext} transformation succeeded for ${uri}`);
          return res;
        }).catch(warning);
      } while (!response && transArray.length > 0);
      if (!response)
        throw new Error(`No valid transformation found for ${uri}`);
    } else
      response = await callback(get4(uri, opts.relativeTo), opts);
    return response;
  };
  var findModule = async (uri, opts) => {
    const pathExt = extension(uri);
    const isJSON = pathExt === "json";
    const info3 = {};
    await find(uri, opts, async (transformed) => {
      info3.uri = transformed;
      info3.result = await (isJSON ? import(transformed, { assert: { type: "json" } }) : import(transformed));
    });
    return info3;
  };
  var findText = async (uri, opts) => await find(uri, opts, get6);

  // libraries/esmpile/src/utils/sourceMap.js
  var sourceReg = /\/\/# sourceMappingURL=(.*\.map)/;
  var get7 = async (uri, opts, text, evaluate = true) => {
    if (!text) {
      const info3 = await get6(uri, opts);
      text = info3.text.original;
    }
    if (text) {
      const srcMap = text.match(sourceReg);
      if (srcMap) {
        const getMap = async () => {
          const loc = get4(srcMap[1], uri);
          let info3 = await get6(loc, opts);
          let newText = info3.text.original;
          if (newText.slice(0, 3) === ")]}") {
            console.warn("Removing source map invalidation characters");
            newText = newText.substring(newText.indexOf("\n"));
          }
          const outInfo = { result: JSON.parse(newText) };
          outInfo.text = { original: newText, updated: null };
          return outInfo;
        };
        return evaluate ? getMap() : getMap;
      }
    }
  };

  // libraries/esmpile/src/utils/load.js
  var load_exports = {};
  __export(load_exports, {
    script: () => script
  });
  var script = async (uri) => {
    return await new Promise((resolve2, reject) => {
      const script3 = document.createElement("script");
      let r = false;
      script3.onload = script3.onreadystatechange = function() {
        if (!r && (!this.readyState || this.readyState == "complete")) {
          r = true;
          resolve2(window);
        }
      };
      script3.onerror = reject;
      script3.src = uri;
      document.body.insertAdjacentElement("beforeend", script3);
    });
  };

  // libraries/esmpile/src/utils/encode/index.js
  var encode_exports = {};
  __export(encode_exports, {
    datauri: () => datauri,
    objecturl: () => objecturl
  });

  // libraries/esmpile/src/utils/encode/datauri.js
  function _arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  var get8 = (o, mimeType = js, safe = false) => {
    const method = typeof o === "string" ? "text" : "buffer";
    const base64 = method === "buffer" ? _arrayBufferToBase64(o) : btoa(safe ? unescape(encodeURIComponent(o)) : o);
    return `data:${mimeType};base64,` + base64;
  };

  // libraries/esmpile/src/utils/encode/objecturl.js
  function get9(input, mimeType = js) {
    if (typeof input === "string")
      input = new TextEncoder().encode(input);
    const blob = new Blob([input], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  // libraries/esmpile/src/utils/encode/index.js
  var datauri = async (...args) => await get10(get8, ...args);
  var objecturl = async (...args) => await get10(get9, ...args);
  var importEncoded = async (uri, isJSON) => await (isJSON ? import(uri, { assert: { type: "json" } }) : import(uri)).catch((e) => {
    throw e;
  });
  async function get10(encoder, input, uriForExtension, mimeType) {
    let encoded, module;
    if (!mimeType) {
      const pathExt = extension(uriForExtension);
      mimeType = get3(pathExt);
    }
    let isJSON = mimeType === "application/json";
    try {
      encoded = encoder(input, mimeType);
      module = await importEncoded(encoded, isJSON);
    } catch (e) {
      encoded = encoder(input, mimeType, true);
      if (isJS(mimeType))
        module = encoded = await catchFailedModule(encoded, e).catch((e2) => {
          throw e2;
        });
      else
        module = encoded;
    }
    return {
      encoded,
      module
    };
  }
  async function catchFailedModule(uri, e) {
    if (e.message.includes("The string to be encoded contains characters outside of the Latin1 range.") || e.message.includes("Cannot set properties of undefined"))
      return await script(uri);
    else
      throw e;
  }

  // libraries/esmpile/src/utils/compile.js
  var tsconfig = {
    compilerOptions: {
      "target": "ES2015",
      "module": "ES2020",
      "strict": false,
      "esModuleInterop": true
    }
  };
  var typescript = (response, type = "text") => {
    if (window.ts) {
      const tsCode = type !== "buffer" ? response[type].updated : new TextDecoder().decode(response[type]);
      response.text.updated = window.ts.transpile(tsCode, tsconfig.compilerOptions);
      if (type === "buffer") {
        response.buffer = new TextEncoder().encode(response.text.updated);
        return response.buffer;
      } else
        return response.text.updated;
    } else
      throw new Error("Must load TypeScript extension to compile TypeScript files using remoteESM.load.script(...);");
  };

  // libraries/esmpile/src/utils/polyfills.js
  var fetch;
  var fs;
  var Blob2;
  var isReady = new Promise(async (resolve2, reject) => {
    try {
      if (typeof process === "object") {
        if (!fetch) {
          globalThis.REMOTEESM_NODE = true;
          fetch = globalThis.fetch = (await import("node-fetch")).default;
          if (typeof globalThis.fetch !== "function")
            globalThis.fetch = fetch;
        }
        if (!fs)
          fs = globalThis.fs = (await import("fs")).default;
        if (!Blob2) {
          const buffer = (await import("node:buffer")).default;
          Blob2 = globalThis.Blob = buffer.Blob;
        }
        resolve2(true);
      } else
        resolve2(true);
    } catch (err) {
      reject(err);
    }
  });
  var ready = isReady;

  // libraries/esmpile/src/Bundle.js
  if (!globalThis.REMOTEESM_BUNDLES)
    globalThis.REMOTEESM_BUNDLES = { global: {} };
  var global = globalThis.REMOTEESM_BUNDLES.global;
  var noEncoding = `No buffer or text to bundle for`;
  var re = /[^\n]*(?<![\/\/])(import)\s+([ \t]*(?:(?:\* (?:as .+))|(?:[^ \t\{\}]+[ \t]*,?)|(?:[ \t]*\{(?:[ \t]*[^ \t"'\{\}]+[ \t]*,?)+\}))[ \t]*)from[ \t]*(['"])([^'"\n]+)(?:['"])([ \t]*assert[ \t]*{[ \n\t]*type:[ \n\t]*(['"])([^'"\n]+)(?:['"])[\n\t]*})?;?/gm;
  function get11(url2, opts = this.options) {
    const pathId2 = url2 ? pathId(url2, opts) : void 0;
    let ref2 = globalThis.REMOTEESM_BUNDLES[opts.collection];
    if (!ref2)
      ref2 = globalThis.REMOTEESM_BUNDLES[opts.collection] = {};
    let bundle = ref2[pathId2];
    if (!bundle)
      bundle = new Bundle(url2, opts);
    else if (opts)
      bundle.options = opts;
    return bundle;
  }
  var promiseInfo = {
    resolve: void 0,
    reject: void 0,
    promise: void 0
  };
  var Bundle = class {
    filename = "bundle.esmpile.js";
    promises = {
      encoded: Object.assign({}, promiseInfo),
      result: Object.assign({}, promiseInfo)
    };
    uri;
    #url;
    get url() {
      return this.#url;
    }
    set url(url2) {
      const ESMPileInternalOpts = this.options._esmpile;
      if (!ESMPileInternalOpts.entrypoint)
        ESMPileInternalOpts.entrypoint = this;
      if (!this.uri)
        this.uri = url2;
      const isAbsolute = absolute(url2, true);
      if (!isAbsolute && !url2.includes(this.#options.relativeTo))
        url2 = get4(url2, this.#options.relativeTo);
      this.#url = url2;
      const pathId2 = pathId(this.url, this.options);
      if (this.name !== pathId2)
        this.name = pathId2;
      this.updateCollection(this.options.collection);
    }
    status = null;
    #options;
    get options() {
      return this.#options;
    }
    set options(opts = {}) {
      if (!opts._esmpile)
        opts._esmpile = this.#options?._esmpile ?? { circular: /* @__PURE__ */ new Set() };
      if (!opts.collection)
        opts.collection = this.#options?.collection;
      this.#options = opts;
      if (!opts.output)
        opts.output = {};
      this.bundler = opts.bundler;
      this.updateCollection(this.options.collection);
      if (typeof opts?.callbacks?.progress?.file === "function")
        this.callbacks.file = opts.callbacks.progress.file;
      if (!opts.fetch)
        opts.fetch = {};
      opts.fetch = Object.assign({}, opts.fetch);
      opts.fetch.signal = this.controller.signal;
    }
    controller = new AbortController();
    #bundler;
    get bundler() {
      return this.#bundler;
    }
    set bundler(bundler) {
      this.setBundleInfo(bundler);
      this.setBundler(bundler, false);
    }
    setBundleInfo = (bundler) => {
      this.#options._esmpile.lastBundler = this.#bundler;
      this.#bundler = this.#options.bundler = bundler;
      const output = this.#options.output;
      if (bundler) {
        output[bundler] = true;
        output.text = true;
      }
      this.derived.compile = !this.#options.forceNativeImport && (output.text || output.datauri || output.objecturl);
    };
    setBundler = async (bundler, setInfo = true) => {
      if (setInfo)
        this.setBundleInfo(bundler);
      const innerInfo = this.#options._esmpile;
      const lastBundleType = innerInfo.lastBundle;
      const isSame2 = innerInfo.lastBundle === bundler;
      if (!isSame2 || innerInfo.lastBundle && isSame2 && !lastBundleType) {
        const entrypoint = innerInfo.entrypoint;
        if (bundler) {
          const entries = Array.from(this.dependencies.entries());
          if (entries.length) {
            await Promise.all(entries.map(async ([_, entry]) => {
              entry.bundler = bundler;
              await entry.result;
            }));
          }
          console.warn("Awaited all!", this.uri);
        }
        const isComplete = ["success", "failed"];
        if (isComplete.includes(entrypoint?.status)) {
          console.log("Creating a promise");
          if (!bundler)
            this.result = await this.resolve();
          else if (lastBundleType)
            this.encoded = await this.bundle(lastBundleType);
          else
            this.result = await this.resolve();
        }
      }
    };
    #name;
    get name() {
      return this.#name;
    }
    set name(name) {
      if (name !== this.#name) {
        let collection = globalThis.REMOTEESM_BUNDLES[this.collection];
        if (collection) {
          if (global[this.name] === collection[this.name])
            delete global[this.name];
          delete collection[this.name];
        }
        this.#name = name;
        let filename = name.split("/").pop();
        const components = filename.split(".");
        this.filename = [...components.slice(0, -1), "esmpile", "js"].join(".");
        if (!global[this.name])
          global[this.name] = this;
        else if (this.options.collection != "global")
          console.warn(`Duplicating global bundle (${this.name})`, this.name);
      }
    }
    #collection;
    get collection() {
      return this.#collection;
    }
    set collection(collection) {
      this.#collection = collection;
      let ref2 = globalThis.REMOTEESM_BUNDLES[collection];
      if (!ref2)
        ref2 = globalThis.REMOTEESM_BUNDLES[collection] = {};
      if (this.name) {
        if (!ref2[this.name])
          ref2[this.name] = this;
        else if (ref2[this.name] !== this)
          console.warn(`Trying to duplicate bundle in bundle ${collection} (${this.name})`, this.name);
      }
    }
    #text;
    #buffer;
    get text() {
      return this.#text;
    }
    set text(text) {
      this.#text = text;
      this.encoded = this.bundle("text").catch((e) => {
        if (!e.message.includes(noEncoding))
          throw e;
      });
    }
    set buffer(buffer) {
      this.#buffer = buffer;
      this.encoded = this.bundle("buffer").catch((e) => {
        if (!e.message.includes(noEncoding))
          throw e;
      });
    }
    dependencies = /* @__PURE__ */ new Map();
    dependents = /* @__PURE__ */ new Map();
    get entries() {
      let entries = [];
      const drill = (target) => {
        target.dependencies.forEach((o) => {
          if (!entries.includes(o) && o !== this) {
            entries.push(o);
            drill(o);
          }
        });
      };
      drill(this);
      return entries;
    }
    encodings = {};
    info = {};
    imports = [];
    link = void 0;
    result = void 0;
    callbacks = {
      file: void 0
    };
    derived = {
      compile: false,
      dependencies: { n: 0, resolved: 0 }
    };
    constructor(entrypoint, options = {}) {
      this.options = options;
      this.url = entrypoint;
    }
    import = async () => {
      this.status = "importing";
      const info3 = await findModule(this.url, this.options);
      if (info3?.result)
        return info3.result;
      else
        this.status = "fallback";
    };
    get = get11;
    compile = async () => {
      this.status = "compiling";
      await ready;
      try {
        const info3 = await findText(this.url, this.options).catch((e) => {
          throw e;
        });
        try {
          if (info3) {
            this.info = info3;
            this.url = this.info.uri;
            this.buffer = this.info.buffer;
            await this.encoded;
          }
        } catch (e) {
          console.warn("initial error", e);
          this.imports = {};
          const imports2 = [];
          const matches = Array.from(this.info.text.updated.matchAll(re));
          matches.forEach(([original, prefix, command, delimiters, path2]) => {
            if (path2) {
              const wildcard = !!command.match(/\*\s+as/);
              const variables = command.replace(/\*\s+as/, "").trim();
              const absolutePath = absolute(path2);
              let name = absolutePath ? path2 : get4(path2, this.url);
              const absNode = path(this.options);
              name = name.replace(`${absNode}/`, "");
              const info4 = {
                name,
                path: path2,
                prefix,
                variables,
                wildcard,
                current: {
                  line: original,
                  path: path2
                },
                original,
                counter: 0,
                bundle: null
              };
              if (!this.imports[name])
                this.imports[name] = [];
              this.imports[name].push(info4);
              imports2.push(info4);
            }
          });
          this.derived.dependencies.resolved = 0;
          this.derived.dependencies.n = this.imports.length;
          const promises = imports2.map(async (info4, i) => {
            await this.setImport(info4, i);
            this.derived.dependencies.resolved++;
          });
          await Promise.all(promises);
          this.text = this.info.text.updated;
        }
      } catch (e) {
        console.log("compile error", e);
        throw e;
      }
      await this.encoded;
      return this.result;
    };
    updateImport = (info3, encoded) => {
      if (encoded === info3.current.path)
        return;
      const { prefix, variables, wildcard, bundle } = info3;
      let newImport = "";
      if (typeof encoded === "string")
        newImport = `${prefix} ${wildcard ? "* as " : ""}${variables} from "${encoded}"; // Imported from ${bundle.name}

`;
      else {
        const replaced = variables.replace("{", "").replace("}", "");
        const exportDefault = replaced === variables ? true : false;
        const splitVars = variables.replace("{", "").replace("}", "").split(",").map((str) => str.trim());
        const insertVariable = (variable) => {
          let end = "";
          if (!wildcard) {
            if (exportDefault)
              end = `.default`;
            else
              end = `.${variable}`;
          }
          newImport += `${prefix === "import" ? "" : "export "}const ${variable} = (await globalThis.REMOTEESM_BUNDLES["${bundle.collection}"]["${bundle.name}"].result)${end};

`;
        };
        splitVars.forEach(insertVariable);
      }
      this.info.text.updated = this.info.text.updated.replace(info3.current.line, newImport);
      info3.current.line = newImport;
      info3.current.path = encoded;
    };
    setImport = async (info3) => {
      let path2 = info3.path;
      let correctPath = info3.name;
      const bundle = this.get(correctPath);
      info3.bundle = bundle;
      this.addDependency(bundle);
      console.log(bundle.status);
      if (!bundle.status) {
        const options = { output: {}, ...this.options };
        options.output.text = true;
        const newBundle = await this.get(correctPath, options);
        await newBundle.resolve(path2);
      } else {
        console.log("waiting...", this.uri, bundle.uri);
        let done = false;
        setTimeout(() => {
          if (done)
            return;
          console.log("Took too long...");
          bundle.promises.result.reject();
          bundle.promises.encoded.reject();
        }, 100);
        await bundle.result;
        console.log("done!", this.uri, bundle.uri);
        done = true;
      }
      const encoded = await bundle.encoded;
      this.updateImport(info3, encoded);
      return bundle;
    };
    notify = (done, failed) => {
      const isDone = done !== void 0;
      const isFailed = failed !== void 0;
      if (this.callbacks.file)
        this.callbacks.file(this.name, this.derived.dependencies.resolved, this.derived.dependencies.n, isDone ? this : void 0, isFailed ? failed : void 0);
    };
    get buffer() {
      return this.#buffer;
    }
    bundle = (type = "buffer") => {
      this.options._esmpile.lastBundle = type;
      this.promises.encoded.promise = new Promise(async (resolve2, reject) => {
        this.promises.encoded.resolve = resolve2;
        this.promises.encoded.reject = reject;
        try {
          let bufferOrText = type === "text" ? this.info.text.updated : this.buffer;
          if (!bufferOrText) {
            if (this.info.fallback)
              this.encoded = this.info.fallback;
            else
              reject(new Error(`${noEncoding} ${this.name}`));
          }
          const pathExt = extension(this.url);
          let mimeType = get3(pathExt);
          switch (mimeType) {
            case "text/typescript":
              bufferOrText = typescript(this.info, type);
              mimeType = js;
              break;
          }
          const encodings = [];
          const output = this.options.output;
          if (output?.datauri)
            encodings.push("datauri");
          if (output?.objecturl)
            encodings.push("objecturl");
          for (let i in encodings) {
            const encoding = encodings[i];
            const encodedInfo = await encode_exports[encoding](bufferOrText, this.url, mimeType);
            if (encodedInfo) {
              this.result = encodedInfo.module;
              this.encodings[encoding] = await encodedInfo.encoded;
            }
          }
          const encoded = this.bundler === "objecturl" ? this.encodings.objecturl : this.encodings.datauri;
          resolve2(encoded);
        } catch (e) {
          reject(e);
        }
      });
      return this.promises.encoded.promise;
    };
    delete = () => {
      if (this.objecturl)
        window.URL.revokeObjectURL(this.objecturl);
    };
    addDependency = (o) => {
      let foundCircular = false;
      if (this.dependents.has(o.url))
        foundCircular = true;
      this.dependencies.set(o.url, o);
      if (o.dependencies.has(this.url))
        foundCircular = true;
      o.dependents.set(this.url, this);
      if (foundCircular) {
        this.circular(o);
        o.circular(this);
      }
    };
    removeDependency = (o) => {
      this.dependencies.delete(o.name);
      o.dependents.delete(this.name);
    };
    updateDependency = async (o, encoding) => {
      const infoArr = this.imports[o.url];
      infoArr.forEach((info3) => this.updateImport(info3, encoding));
    };
    updateCollection = (collection) => {
      if (!collection) {
        this.collection = this.options.collection = Object.keys(globalThis.REMOTEESM_BUNDLES).length;
      } else
        this.collection = collection;
    };
    download = async (path2 = this.filename) => {
      if (this.bundler != "datauri")
        await this.setBundler("datauri");
      const mime = this.encodings.datauri.split(",")[0].split(":")[1].split(";")[0];
      const binary = atob(this.encodings.datauri.split(",")[1]);
      const array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const buffer = new Uint8Array(array);
      const blob = new Blob([buffer], { type: mime });
      const objecturl2 = URL.createObjectURL(blob);
      if (globalThis.REMOTEESM_NODE) {
        await ready;
        globalThis.fs.writeFileSync(path2, buffer);
        console.log(`Wrote bundle contents to ${path2}`);
      } else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = objecturl2;
        a.download = path2;
        a.click();
      }
    };
    circular = async (o) => {
      this.options._esmpile.circular.add(this.url);
      const result = await this.resolve().catch((e) => {
        console.warn(`Circular dependency detected: Fallback to direct import for ${this.url} failed...`, e);
        const message = `Circular dependency cannot be resolved: ${this.uri} <-> ${o.uri}.`;
        throw new Error(message);
      });
      console.warn(`Circular dependency detected: Fallback to direct import for ${this.url} was successful!`, result);
    };
    resolve = async (uri = this.uri) => {
      this.status = "resolving";
      this.result = void 0;
      this.encoded = void 0;
      this.result = this.promises.result.promise = new Promise(async (resolve2, reject) => {
        this.promises.result.reject = reject;
        this.promises.result.resolve = resolve2;
        let result;
        const isCircular = this.options._esmpile.circular.has(this.url);
        let isDirect = isCircular || !this.derived.compile;
        try {
          result = isDirect ? await this.import().catch(async (e) => {
            if (this.#options.fallback === false)
              throw e;
            else
              await this.setBundler("objecturl");
          }) : void 0;
          try {
            if (!result) {
              if (isCircular)
                throw new Error(`Failed to import ${this.url} natively.`);
              else
                result = await this.compile();
            }
          } catch (e) {
            console.log("Not compiled", this.url, e);
            if (this.options.fetch?.signal?.aborted)
              throw e;
            else {
              const noBase2 = absolute(uri) ? noBase(uri, this.options, true) : noBase(this.url, this.options, true);
              console.warn(`Failed to fetch ${uri}. Checking filesystem references...`);
              const filesystemFallback = this.options.filesystem?._fallbacks?.[noBase2];
              if (filesystemFallback) {
                console.warn(`Got fallback reference (module only) for ${uri}.`);
                result = filesystemFallback;
                Object.defineProperty(info, "fallback", { value: true, enumerable: false });
              } else {
                const middle2 = "was not resolved locally. You can provide a direct reference to use in";
                if (e.message.includes(middle2))
                  throw e;
                else
                  throw create3(uri, noBase2);
              }
            }
          }
          await this.encoded;
          this.status = "success";
          this.notify(this);
          resolve2(result);
        } catch (e) {
          this.status = "failed";
          this.notify(null, e);
          reject(e);
        }
      });
      return this.result;
    };
    sources = async () => await get7(this.#url, this.#options, this.info.text.original);
  };

  // libraries/esmpile/src/index.js
  var compile = async (uri, opts = {}) => {
    opts = Object.assign({}, opts);
    const thisBundle = get11(uri, opts);
    await thisBundle.resolve();
    return thisBundle.result;
  };

  // apps/showcase/index.esc.ts
  var index_esc_exports = {};
  __export(index_esc_exports, {
    esAttributes: () => esAttributes2,
    esDOM: () => esDOM,
    esListeners: () => esListeners
  });

  // components/tests/basic/index.js
  var basic_exports = {};
  __export(basic_exports, {
    imports: () => imports
  });

  // components/tests/basic/update.js
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
    setTimeout(() => {
      this.later = true;
    }, 1e3);
    this.delayId = setTimeout(() => esmOnly = this.nExecution, 500);
  }

  // components/tests/basic/index.js
  var imports = update_exports;

  // components/ui/button.js
  var button_exports = {};
  __export(button_exports, {
    __useclick: () => __useclick,
    cache: () => cache,
    default: () => button_default,
    esAttributes: () => esAttributes,
    esElement: () => esElement,
    pressed: () => pressed
  });
  var __useclick = true;
  var pressed = false;
  var cache = null;
  var esElement = "button";
  var esAttributes = {
    innerHTML: "Click Me",
    onclick: function() {
      if (this.__useclick) {
        this.default({ value: true, __internal: true });
        this.default({ value: false, __internal: true });
      }
    },
    onmousedown: function() {
      this.__useclick = false;
      this.default({ value: true, __internal: true });
      const onMouseUp = () => {
        this.default({ value: false, __internal: true });
        globalThis.removeEventListener("mouseup", onMouseUp);
        setTimeout(() => this.__useclick = true, 10);
      };
      globalThis.addEventListener("mouseup", onMouseUp);
    }
  };
  function button_default(input) {
    let res;
    const value = input?.value ?? input;
    const isInternal = input?.__internal;
    if (isInternal) {
      this.pressed = value;
      if (this.cache) {
        if (value)
          res = this.cache;
      } else
        res = value;
    } else if (value !== void 0)
      this.cache = value;
    return res;
  }

  // components/basic/log.js
  var log_exports = {};
  __export(log_exports, {
    default: () => log_default
  });
  var log_default = (...args) => console.log("[log]:", args);

  // apps/showcase/index.esc.ts
  var id = "test";
  var buttonComponentId = "button";
  var esAttributes2 = {
    style: {
      padding: "50px"
    }
  };
  var esDOM = {
    [id]: {
      esCompose: basic_exports,
      esListeners: {
        "imports.passedWithListener": `imports.nExecution`,
        ["ARBITRARY"]: {
          "imports.passedWithListener": (...args) => console.log("Passed with Listener!", args),
          "imports.later": (...args) => console.log("Added Later!", args)
        }
      }
    },
    log: {
      esCompose: log_exports
    },
    container: {
      componentToMove: buttonComponentId,
      esCompose: {
        esElement: "div"
      },
      log: {
        esCompose: log_exports
      },
      esDOM: {
        header: {
          esElement: "h1",
          esAttributes: {
            innerText: "ESCode Demo"
          }
        },
        p: {
          esElement: "p",
          esDOM: {
            b: {
              esElement: "b",
              esAttributes: {
                innerText: "Clicks: "
              }
            },
            span: {
              esElement: "span",
              esAttributes: {
                innerText: "0"
              }
            }
          }
        },
        [buttonComponentId]: {
          esElement: "button",
          esCompose: [
            {
              esAttributes: {
                onmousedown: () => {
                  console.log("Calling me too!");
                }
              }
            },
            button_exports
          ],
          esTrigger: { value: true, __internal: true }
        }
      }
    }
  };
  var branchConfig = {
    esBranch: [
      { equals: true, value: true }
    ]
  };
  var esListeners = {
    [`${id}.imports`]: {
      [`container.${buttonComponentId}`]: branchConfig
    },
    [`container.p.span`]: {
      [`${id}.imports.nExecution`]: true
    }
  };

  // apps/showcase/fallbacks.ts
  var fallbacks_exports = {};
  __export(fallbacks_exports, {
    default: () => fallbacks_default
  });
  var fallbacks_default = {};

  // apps/showcase/demos/phaser/index.esc.ts
  var index_esc_exports2 = {};
  __export(index_esc_exports2, {
    esAttributes: () => esAttributes3,
    esDOM: () => esDOM2,
    esListeners: () => esListeners2
  });

  // components/phaser/game/index.js
  var game_exports = {};
  __export(game_exports, {
    config: () => config,
    default: () => game_default,
    esDelete: () => esDelete,
    esInit: () => esInit,
    game: () => game,
    preload: () => preload
  });

  // components/phaser/game/config/merge.js
  var merge2 = (base2, newObj) => {
    const copy = Object.assign({}, base2);
    if (newObj) {
      const copyKeys = Object.keys(copy);
      const newKeys = Object.keys(newObj);
      copyKeys.forEach((k) => {
        if (typeof newObj[k] === "object")
          merge2(base2[k], newObj[k]);
        else if (newObj[k])
          base2[k] = newObj[k];
      });
      newKeys.forEach((k) => copy[k] = newObj[k]);
    }
    return copy;
  };
  var merge_default = merge2;

  // components/phaser/game/config/phaser.config.js
  var defaultConfig = (Phaser) => {
    function preload2() {
      this.load.setBaseURL("http://labs.phaser.io");
      this.load.image("sky", "assets/skies/space3.png");
      this.load.image("logo", "assets/sprites/phaser3-logo.png");
      this.load.image("red", "assets/particles/red.png");
    }
    function create6() {
      this.add.image(400, 300, "sky");
      var particles = this.add.particles("red");
      var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: "ADD"
      });
      var logo = this.physics.add.image(400, 100, "logo");
      logo.setVelocity(100, 200);
      logo.setBounce(1, 1);
      logo.setCollideWorldBounds(true);
      emitter.startFollow(logo);
    }
    const config2 = {
      type: Phaser.AUTO,
      width: "100",
      height: "100",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 200 },
          debug: false
        }
      },
      scene: {
        preload: preload2,
        create: create6
      }
    };
    return config2;
  };
  var phaser_config_default = defaultConfig;

  // components/phaser/game/index.js
  var script2 = document.createElement("script");
  script2.src = "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser-arcade-physics.min.js";
  document.head.appendChild(script2);
  var nodes = {};
  var onResolve = null;
  if (!("Phaser" in window))
    script2.onload = () => {
      if (onResolve instanceof Function)
        onResolve(window.Phaser);
      for (let tag in nodes)
        nodes[tag].default();
    };
  var call = (func, ctx, ...args) => {
    if (typeof func === "function")
      func.call(ctx, args);
  };
  var preload = [];
  var config = phaser_config_default;
  var game;
  function esInit() {
    if (window.Phaser)
      this.default();
    else
      nodes[this._unique] = this;
  }
  function esDelete() {
    if (this.game)
      this.game.destroy(true, false);
  }
  async function game_default() {
    const instance = this;
    const Phaser = window.Phaser ?? await new Promise((resolve2) => onResolve = resolve2);
    let cfg = typeof this.config === "function" ? this.config(window.Phaser) : this.config;
    let defaultCfg = typeof config === "function" ? config(window.Phaser) : config;
    let mergedConfig = merge_default(defaultCfg, cfg);
    mergedConfig.parent = this.esElement;
    return new Promise((resolve2) => {
      const originalUpdate = mergedConfig.scene.update;
      const originalCreate = mergedConfig.scene.create;
      const originalPreload = mergedConfig.scene.preload;
      mergedConfig.scene.preload = function() {
        for (let fName in instance.preload) {
          const o = instance.preload[fName];
          if (typeof o === "object")
            for (let key in o)
              this.load[fName](...Object.values(o[key]));
          else
            this.load[fName](o);
        }
        call(originalPreload, this);
      };
      mergedConfig.scene.create = function() {
        call(originalCreate, this);
        this.context = this;
        if (instance.esDOM) {
          for (let key in instance.esDOM) {
            const component = instance.esDOM[key];
            if (typeof component.ongame === "function")
              component.ongame(this.context);
          }
        }
        resolve2(this.context);
      };
      mergedConfig.scene.update = function() {
        call(originalUpdate, this);
        if (instance.esDOM) {
          for (let key in instance.esDOM) {
            const component = instance.esDOM[key];
            if (typeof component.update === "function")
              component.update(this, instance.esDOM);
          }
        }
      };
      this.game = new Phaser.Game(mergedConfig);
    });
  }

  // components/phaser/player.js
  var player_exports = {};
  __export(player_exports, {
    bounce: () => bounce,
    collideWorldBounds: () => collideWorldBounds,
    create: () => create4,
    default: () => player_default,
    jump: () => jump,
    jumpRefractoryPeriod: () => jumpRefractoryPeriod,
    jumped: () => jumped,
    move: () => move,
    ongame: () => ongame,
    position: () => position,
    ref: () => ref,
    size: () => size,
    update: () => update,
    velocity: () => velocity
  });
  var bounce = 0;
  var collideWorldBounds;
  var size = {};
  var position = {};
  var jumpRefractoryPeriod = 2e3;
  var velocity = 0;
  var create4;
  var update;
  var ref;
  var jumped = false;
  function jump(height) {
    if (height && this.jumped === false) {
      this.jumped = true;
      this.ref.body.setVelocityY(-500 * height);
      setTimeout(() => this.jumped = false, this.jumpRefractoryPeriod);
    }
  }
  function move(x = 0) {
    this.ref.body.setVelocityX(x);
  }
  function ongame(game2) {
    if (game2) {
      this.ref = game2.physics.add.sprite(this.position.x, this.position.y, "player");
      this.ref.setBounce(this.bounce);
      this.ref.setCollideWorldBounds(this.collideWorldBounds);
      this.ref.body.setSize((this.size.width ?? this.ref.width) + this.size.offset?.width, (this.size.height ?? this.ref.height) + this.size.offset?.height);
      if (typeof this.create === "function")
        this.create.call(game2, this.ref);
    }
  }
  function player_default() {
    return this.ref;
  }

  // apps/showcase/demos/phaser/scripts/player/create/base.js
  var getLayer = (name, context) => {
    return context.children.list.find((o) => o.type === "TilemapLayer" && o.layer.name === name);
  };
  function createPlayer(player) {
    const context = this.ref?.scene ?? this;
    const groundLayer = getLayer("World", context);
    context.physics.add.collider(groundLayer, player);
    const coinLayer = getLayer("Coins", context);
    context.physics.add.overlap(player, coinLayer);
  }
  var base_default = createPlayer;

  // apps/showcase/demos/phaser/scripts/player/create/main.js
  function main() {
    const context = this.ref?.scene ?? this;
    context.anims.create({
      key: "walk",
      frames: context.anims.generateFrameNames("player", {
        prefix: "p1_walk",
        start: 1,
        end: 11,
        zeroPad: 2
      }),
      frameRate: 10,
      repeat: -1
    });
    context.anims.create({
      key: "idle",
      frames: [{ key: "player", frame: "p1_stand" }],
      frameRate: 10
    });
  }
  function createMain(player) {
    const context = this.ref?.scene ?? this;
    base_default.call(context, player);
    main.call(context, player);
    context.cameras.main.startFollow(player);
  }
  var main_default = createMain;

  // apps/showcase/demos/phaser/scripts/player/update.js
  function update2(context, peers) {
    if (this.ref.x >= 2060 || this.ref.x <= 0)
      this.ref.x = 0.5;
    if (this.velocity !== 0)
      this.ref.flipX = Math.sign(this.velocity) === -1;
    this.move(this.velocity);
    if (this.velocity === 0)
      this.ref.anims.play("idle", true);
    if (this.ref.body.velocity.x === 0) {
      this.ref.anims.play("walk", false);
      this.ref.anims.play("idle", true);
    } else
      this.ref.anims.play("walk", true);
  }

  // apps/showcase/demos/phaser/scripts/create.js
  var score = 0;
  function create5() {
    const map2 = this.make.tilemap({ key: "map" });
    const groundTiles = map2.addTilesetImage("tiles");
    const groundLayer = map2.createLayer("World", groundTiles, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);
    const coinTiles = map2.addTilesetImage("coin");
    const coinLayer = map2.createLayer("Coins", coinTiles, 0, 0);
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;
    coinLayer.setTileIndexCallback(17, (sprite, tile) => {
      removeTile(coinLayer, tile);
      score = incrementScore(score, text);
    }, this);
    this.cameras.main.setBounds(0, 0, map2.widthInPixels, map2.heightInPixels);
    this.cameras.main.setBackgroundColor("#ccccff");
    const text = this.add.text(20, 570, "0", {
      fontSize: "20px",
      fill: "#ffffff"
    });
    text.setScrollFactor(0);
  }
  function incrementScore(score2, text) {
    score2++;
    if (text)
      text.setText(score2);
    return score2;
  }
  function removeTile(layer, tile) {
    layer.removeTileAt(tile.x, tile.y);
    return false;
  }
  var create_default2 = create5;

  // components/basic/keyboard.js
  var keyboard_exports = {};
  __export(keyboard_exports, {
    altKey: () => altKey,
    default: () => keyboard_default,
    esInit: () => esInit2,
    held: () => held,
    heldSet: () => heldSet,
    holdTime: () => holdTime,
    metaKey: () => metaKey,
    mode: () => mode,
    shiftKey: () => shiftKey,
    updateHeld: () => updateHeld
  });
  var mode = "key";
  var shiftKey;
  var metaKey;
  var altKey;
  var defaults = ["shiftKey", "metaKey", "altKey", "ctrlKey"];
  var heldSet = /* @__PURE__ */ new Set();
  var held = [];
  var holdTime = 300;
  function updateHeld(val, command = "add") {
    if (command === "add")
      this.heldSet.add(val);
    else
      this.heldSet.delete(val);
    if (this.heldId)
      clearTimeout(this.heldId);
    this.heldId = setTimeout(() => this.held = [...this.heldSet], this.holdTime);
  }
  function esInit2() {
    window.addEventListener("keydown", (ev) => {
      const val = ev[this.mode];
      if (!this[val]) {
        defaults.forEach((key) => {
          if (ev[key])
            this[key] = ev[key];
        });
        this.updateHeld(val);
        this.default(val);
      }
    });
    window.addEventListener("keyup", (ev) => {
      const val = ev[this.mode];
      defaults.forEach((key) => {
        if (ev[key] != this[key])
          this[key] = ev[key];
      });
      this.updateHeld(val, "delete");
      this[val] = false;
    });
  }
  function keyboard_default(key) {
    this[key] = true;
    return key;
  }

  // apps/showcase/demos/phaser/index.esc.ts
  var esAttributes3 = {
    style: {
      width: "100%",
      height: "100%"
    }
  };
  var esDOM2 = {
    keys: {
      esCompose: keyboard_exports
    },
    game: {
      esAttributes: {
        style: {
          width: "100%",
          height: "100%"
        }
      },
      esCompose: game_exports,
      preload: {
        setBaseURL: "https://raw.githubusercontent.com/brainsatplay/escode/main/apps/showcase/demos/phaser/assets",
        tilemapTiledJSON: [
          [
            "map",
            "map.json"
          ]
        ],
        spritesheet: [
          [
            "tiles",
            "tiles.png",
            {
              frameWidth: 70,
              frameHeight: 70
            }
          ]
        ],
        image: [
          [
            "coin",
            "coinGold.png"
          ]
        ],
        atlas: [
          [
            "player",
            "player.png",
            "player.json"
          ]
        ]
      },
      config: {
        physics: {
          default: "arcade",
          arcade: {
            gravity: {
              y: 500
            }
          }
        },
        scene: {
          key: "main",
          create: create_default2
        }
      },
      esDOM: {
        player: {
          esCompose: player_exports,
          position: {
            x: 200,
            y: 200
          },
          size: {
            offset: {
              height: -8
            }
          },
          bounce: 0.2,
          collideWorldBounds: false,
          create: main_default,
          update: update2
        }
      }
    }
  };
  var esListeners2 = {
    ["game.player.jump"]: {
      ["keys.ArrowUp"]: true
    },
    ["game.player.velocity"]: {
      ["keys.ArrowLeft"]: {
        esBranch: [
          { equals: true, value: -150 },
          { equals: false, value: 0 }
        ]
      },
      ["keys.ArrowRight"]: {
        esBranch: [
          { equals: true, value: 150 },
          { equals: false, value: 0 }
        ]
      }
    }
  };

  // apps/showcase/demos/phaser/fallbacks.ts
  var fallbacks_default2 = {};

  // apps/showcase/demos/animations/index.esc.ts
  var index_esc_exports3 = {};
  __export(index_esc_exports3, {
    esDOM: () => esDOM3,
    esListeners: () => esListeners3
  });

  // apps/showcase/demos/animations/components/counter.js
  var counter_exports = {};
  __export(counter_exports, {
    counter: () => counter,
    default: () => counter_default
  });
  var counter = 0;
  function counter_default() {
    this.counter++;
    return this.counter;
  }

  // apps/showcase/demos/animations/components/timestamp.js
  var timestamp_exports = {};
  __export(timestamp_exports, {
    default: () => timestamp_default
  });
  var timestamp_default = () => Date.now();

  // apps/showcase/demos/animations/index.esc.ts
  var interval = true;
  var esDOM3 = {
    counter: {
      esCompose: counter_exports,
      esAnimate: interval
    },
    timestamp: {
      esCompose: timestamp_exports,
      esAnimate: interval
    },
    count: {
      esElement: "p",
      esDOM: {
        header: {
          esElement: "b",
          esAttributes: {
            innerText: "Frames: "
          }
        },
        span: {
          esElement: "span"
        }
      }
    },
    time: {
      esElement: "p",
      esDOM: {
        header: {
          esElement: "b",
          esAttributes: {
            innerText: "Time: "
          }
        },
        span: {
          esElement: "span"
        }
      }
    }
  };
  var esListeners3 = {
    "count.span": {
      counter: true
    },
    "time.span": {
      timestamp: true
    }
  };

  // apps/showcase/demos/animations/fallbacks.ts
  var fallbacks_default3 = {};

  // apps/showcase/index.ts
  var escJSON = "./index.esc.json";
  var escJS = "./index.esc.ts";
  var phaserJSON = "./demos/phaser/index.esc.json";
  var phaserJS = "./demos/phaser/index.esc.ts";
  var animationsJSON = "./demos/animations/index.esc.json";
  var animationsJS = "./demos/animations/index.esc.ts";
  var basicPackage = {
    file: index_esc_exports,
    fallbacks: fallbacks_exports,
    json: escJSON,
    js: escJS
  };
  var phaserPackage = {
    file: index_esc_exports2,
    fallbacks: fallbacks_default2,
    json: phaserJSON,
    js: phaserJS
  };
  var animationsPackage = {
    json: animationsJSON,
    fallbacks: fallbacks_default3,
    file: index_esc_exports3,
    js: animationsJS
  };
  var demos = {
    phaser: phaserPackage,
    animations: animationsPackage,
    basic: basicPackage
  };
  var modes = {
    "Direct": "direct",
    "JSON": "json",
    ["File Compilation"]: "compilation"
  };
  var main2 = document.getElementById("app");
  var monitor = new Monitor({
    pathFormat: "absolute",
    polling: { sps: 60 }
  });
  var asyncLoads = false;
  async function init() {
    if (!asyncLoads) {
      await load_exports.script("./libraries/esmpile/extensions/typescriptServices.min.js");
      asyncLoads = true;
    }
    startFunction();
  }
  var active;
  var selects = [{
    element: document.getElementById("demoSelect"),
    key: "demo",
    selected: localStorage.getItem("demo"),
    options: Object.keys(demos)
  }, {
    element: document.getElementById("modeSelect"),
    key: "mode",
    selected: localStorage.getItem("mode"),
    options: modes
  }];
  selects.forEach((o) => {
    const isArray = Array.isArray(o.options);
    for (let key in o.options) {
      const option = document.createElement("option");
      const value = o.options[key];
      option.value = value;
      const text = isArray ? o.options[key] : key;
      option.innerHTML = text[0].toUpperCase() + text.slice(1);
      if (value === o.selected)
        option.selected = true;
      o.element.appendChild(option);
    }
  });
  var restartButton = document.getElementById("restartButton");
  function startFunction() {
    const args = selects.map((o) => {
      const val = o.element.value;
      localStorage.setItem(o.key, val);
      return val;
    });
    if (active?.esDelete)
      active.esDelete();
    if (basicDemoSubs) {
      monitor.remove(basicDemoSubs);
      basicDemoSubs = void 0;
    }
    console.log(`---------------- Starting ${args[0]} demo in ${args[1]} mode ----------------`);
    start(...args);
  }
  selects.forEach((o) => o.element.addEventListener("change", startFunction));
  restartButton.addEventListener("click", startFunction);
  var basicDemoSubs;
  async function start(demo = "basic", mode2 = "direct") {
    let selected = demos[demo];
    let reference = selected.file;
    if (mode2 !== "direct") {
      const toCompile = mode2 === "json" ? selected.json : selected.js;
      const options = {};
      options.relativeTo = window.location.href + "apps/showcase";
      options.collection = null;
      options.debug = true;
      options.callbacks = { progress: {} };
      options.fallback = true;
      options.filesystem = {
        _fallbacks: selected.fallbacks
      };
      reference = await compile(toCompile, options).catch((e) => {
        console.error("Compilation Failed:", e);
      });
      console.log("ESMpile Result", reference);
    }
    if (demo === "basic") {
      const esmId = "ESM";
      const testComponent = reference.esDOM.test.esCompose;
      monitor.set(esmId, testComponent);
      basicDemoSubs = monitor.on(esmId, (path2, _, update3) => console.log("Polling Result:", path2, update3));
    }
    const component = create2(reference, {
      monitor,
      clone: true,
      listeners: { static: true },
      nested: void 0
    });
    component.esParent = main2;
    active = component;
  }
  init();
})();
