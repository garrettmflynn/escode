var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key3, value2) => key3 in obj ? __defProp(obj, key3, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key3] = value2;
var __export = (target, all2) => {
  for (var name9 in all2)
    __defProp(target, name9, { get: all2[name9], enumerable: true });
};
var __publicField = (obj, key3, value2) => {
  __defNormalProp(obj, typeof key3 !== "symbol" ? key3 + "" : key3, value2);
  return value2;
};

// ../../packages/common/check.js
var moduleStringTag = "[object Module]";
var esm = (object) => {
  const res = object && (!!Object.keys(object).reduce((a, b) => {
    const desc = Object.getOwnPropertyDescriptor(object, b);
    const isModule = desc && desc.get && !desc.set ? 1 : 0;
    return a + isModule;
  }, 0) || Object.prototype.toString.call(object) === moduleStringTag);
  return !!res;
};

// ../../packages/esmonitor/src/utils.ts
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
var getPathInfo = (path2, options2) => {
  let splitPath = path2;
  if (typeof path2 === "string")
    splitPath = path2.split(options2.keySeparator);
  else if (typeof path2 === "symbol")
    splitPath = [path2];
  return {
    id: splitPath[0],
    path: splitPath.slice(1)
  };
};
var runCallback = (callback, path2, info2, output, setGlobal = true) => {
  if (callback instanceof Function) {
    if (output && typeof output === "object" && typeof output.then === "function")
      output.then((value2) => callback(path2, info2, value2));
    else
      callback(path2, info2, output);
  }
  if (setGlobal && globalThis.ESMonitorState) {
    const callback2 = globalThis.ESMonitorState.callback;
    globalThis.ESMonitorState.state[path2] = { output, value: info2 };
    runCallback(callback2, path2, info2, output, false);
  }
};

// ../../packages/esmonitor/src/Poller.ts
var defaultSamplingRate = 60;
var Poller = class {
  constructor(listeners2, sps) {
    this.listeners = {};
    this.setOptions = (opts = {}) => {
      for (let key3 in opts)
        this[key3] = opts[key3];
    };
    this.add = (info2) => {
      const sub = info2.sub;
      this.listeners[sub] = info2;
      this.start();
      return true;
    };
    this.get = (sub) => this.listeners[sub];
    this.remove = (sub) => {
      delete this.listeners[sub];
      if (!Object.keys(this.listeners).length)
        this.stop();
    };
    this.poll = (listeners2) => {
      iterateSymbols(listeners2, (sym, o) => {
        let { callback, current, history: history3 } = o;
        if (!o.path.resolved)
          o.path.resolved = getPath("output", o);
        if (!isSame(current, history3)) {
          runCallback(callback, o.path.resolved, {}, current);
          if (typeof current === "object") {
            if (Array.isArray(current))
              history3 = [...current];
            else
              history3 = { ...current };
          } else
            listeners2[sym].history = current;
        }
      });
    };
    this.start = (listeners2 = this.listeners) => {
      if (!this.sps)
        this.sps = defaultSamplingRate;
      else if (!this.#pollingId) {
        console.warn("[esmonitor]: Starting Polling!");
        this.#pollingId = setInterval(() => this.poll(listeners2), 1e3 / this.sps);
      }
    };
    this.stop = () => {
      if (this.#pollingId) {
        console.warn("[esmonitor]: Stopped Polling!");
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

// ../../packages/esmonitor/src/listeners.ts
var listeners_exports = {};
__export(listeners_exports, {
  functionExecution: () => functionExecution,
  functions: () => functions2,
  getProxyFunction: () => getProxyFunction,
  info: () => info,
  register: () => register,
  set: () => set,
  setterExecution: () => setterExecution,
  setters: () => setters
});

// ../../packages/esmonitor/src/globals.ts
var isProxy = Symbol("isProxy");
globalThis.ESMonitorState = {
  state: {},
  callback: void 0,
  info: {}
};
var globals_default = globalThis.ESMonitorState;

// ../../packages/esmonitor/src/info.ts
var performance2 = async (callback, args) => {
  const tic = globalThis.performance.now();
  const output = await callback(...args);
  const toc = globalThis.performance.now();
  return {
    output,
    value: toc - tic
  };
};
var infoFunctions = {
  performance: performance2
};
var get = (func, args, info2) => {
  let result = {
    value: {},
    output: void 0
  };
  const infoToGet = { ...globals_default.info, ...info2 };
  for (let key3 in infoToGet) {
    if (infoToGet[key3] && infoFunctions[key3]) {
      const ogFunc = func;
      func = async (...args2) => {
        const o = await infoFunctions[key3](ogFunc, args2);
        result.value[key3] = o.value;
        return o.output;
      };
    }
  }
  result.output = func(...args);
  return result;
};

// ../../spec/standards.js
var keySeparator = ".";
var defaultPath = "default";
var esSourceKey = "__esmpileSourceBundle";
var defaultProperties = {
  isGraphScript: "__",
  properties: "__props",
  default: defaultPath,
  children: "__children",
  listeners: {
    value: "__listeners",
    branch: "branch",
    bind: "bind",
    trigger: "trigger",
    format: "format"
  },
  parent: "__parent",
  promise: "__childresolved",
  component: "__component",
  proxy: "__proxy"
};
var specialKeys = {
  ...defaultProperties,
  start: "__onconnected",
  stop: "__ondisconnected",
  connected: "__connected",
  resolved: "__resolved",
  started: "__started",
  element: "__element",
  webcomponents: "__define",
  attributes: "__attributes",
  trigger: "__trigger",
  compose: "__compose",
  apply: "__apply",
  uri: "src",
  reference: "ref",
  childPosition: "__childposition",
  attribute: "escomponent",
  options: "__options",
  source: "__source",
  path: "__path",
  animate: "__animate",
  states: "__states",
  editor: "__editor",
  original: "__original",
  resize: "__onresize"
};

// ../../packages/common/pathHelpers.ts
var hasKey = (key3, obj) => key3 in obj;
var getShortcut = (path2, shortcuts, keySeparator2) => {
  const sc = shortcuts[path2[0]];
  if (sc) {
    const value2 = sc[path2.slice(1).join(keySeparator2)];
    if (value2)
      return value2;
  }
};
var getFromPath = (baseObject, path2, opts = {}) => {
  const fallbackKeys = opts.fallbacks ?? [];
  const keySeparator2 = opts.keySeparator ?? keySeparator;
  if (opts.shortcuts) {
    const shortcut = getShortcut(path2, opts.shortcuts, keySeparator2);
    if (shortcut) {
      if (opts.output === "info")
        return { value: shortcut, exists: true, shortcut: true };
      else
        return shortcut;
    }
  }
  if (typeof path2 === "string")
    path2 = path2.split(keySeparator2).flat();
  else if (typeof path2 == "symbol")
    path2 = [path2];
  let exists;
  path2 = [...path2];
  path2 = path2.map((o) => typeof o === "string" ? o.split(keySeparator2) : o).flat();
  let ref = baseObject;
  const chain = [ref];
  for (let i = 0; i < path2.length; i++) {
    if (ref) {
      const str = path2[i];
      exists = hasKey(str, ref);
      if (exists)
        ref = ref[str];
      else {
        ref = void 0;
        exists = true;
      }
      chain.push(ref);
    }
  }
  if (opts.output === "info")
    return { value: ref, exists, parent: chain[chain.length - 2] };
  else
    return ref;
};
var setFromPath = (path2, value2, ref, opts = {}) => {
  const create7 = opts?.create ?? false;
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
    let has2 = hasKey(str, ref);
    if (create7 && !has2) {
      ref[str] = {};
      has2 = true;
    }
    if (has2)
      ref = ref[str];
  }
  ref[last] = value2;
  return true;
};

// ../../packages/esmonitor-proxy/src/handlers.ts
var handlers_exports = {};
__export(handlers_exports, {
  functions: () => functions,
  objects: () => objects
});

// ../../packages/esmonitor-proxy/src/globals.ts
var isProxy2 = isProxy;
var fromInspectable = Symbol("fromInspectable");
var fromInspectableHandler = Symbol("fromInspectableHandler");

// ../../packages/esmonitor-proxy/src/define.ts
function define(key3, registerAsNewKey) {
  const inspectable = this;
  const target = this.target;
  if (!this.parent) {
    let value2 = target[key3];
    try {
      Object.defineProperty(target, key3, {
        get: () => value2,
        set: function(val) {
          value2 = val;
          inspectable.proxy[key3] = { [isProxy2]: this[isProxy2], [fromInspectable]: true, value: val };
        },
        enumerable: true,
        configurable: true
      });
    } catch (e) {
      console.error(`Could not reassign ${key3} to a top-level setter...`);
    }
  }
  if (registerAsNewKey)
    this.newKeys.add(key3);
  this.create(key3, target, void 0, true);
}
var define_default = define;

// ../../packages/esmonitor-proxy/src/handlers.ts
var functions = function() {
  const inspectable = this;
  return {
    apply: async function(target, thisArg, argumentsList) {
      try {
        let foo = target;
        const isFromInspectable = argumentsList[0]?.[fromInspectable];
        if (isFromInspectable) {
          foo = argumentsList[0].value;
          argumentsList = argumentsList.slice(1);
        }
        let listeners2 = inspectable.listeners.functions;
        const pathStr = inspectable.path.join(inspectable.options.keySeparator);
        const toActivate = listeners2 ? listeners2[pathStr] : void 0;
        let output, executionInfo = {};
        if (toActivate) {
          executionInfo = functionExecution(thisArg, toActivate, foo, argumentsList);
          output = executionInfo.output;
        } else {
          output = foo.apply(thisArg, argumentsList);
          executionInfo = inspectable?.state?.[pathStr]?.value ?? {};
        }
        const callback = inspectable.options.callback;
        runCallback(callback, pathStr, executionInfo, output);
        return output;
      } catch (e) {
        console.warn(`Function failed:`, e, inspectable.path);
      }
    }
  };
};
var objects = function() {
  const inspectable = this;
  return {
    get(target, prop, receiver) {
      if (prop === isProxy2)
        return true;
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, newVal, receiver) {
      if (prop === isProxy2)
        return true;
      const pathStr = [...inspectable.path, prop].join(inspectable.options.keySeparator);
      const isFromProxy = newVal?.[isProxy2];
      const isFromInspectable = newVal?.[fromInspectable];
      if (isFromInspectable)
        newVal = newVal.value;
      const listeners2 = inspectable.listeners.setters;
      const desc = Object.getOwnPropertyDescriptor(target, prop);
      const createListener = desc && !desc.get && !desc.set;
      if (createListener) {
        if (typeof inspectable.options.globalCallback === "function") {
          const id = inspectable.path[0];
          define_default.call(inspectable, prop, true);
          set("setters", pathStr, newVal, inspectable.options.globalCallback, { [id]: inspectable.root }, inspectable.listeners, inspectable.options);
        }
      }
      if (newVal || typeof newVal === "function") {
        const newProxy = inspectable.create(prop, target, newVal);
        if (newProxy)
          newVal = newProxy;
      }
      const toActivate = !isFromProxy;
      if (listeners2 && toActivate && !inspectable.newKeys.has(prop)) {
        const toActivate2 = listeners2[pathStr];
        if (toActivate2)
          setterExecution(toActivate2, newVal);
      }
      const callback = inspectable.options.callback;
      const info2 = inspectable?.state?.[pathStr]?.value ?? {};
      runCallback(callback, pathStr, info2, newVal);
      if (isFromInspectable || !toActivate)
        return true;
      else
        return Reflect.set(target, prop, newVal, receiver);
    }
  };
};

// ../../packages/common/globals.ts
var isNode = typeof process === "object";

// ../../packages/esmonitor-proxy/src/index.ts
var canCreate = (parent, key3, val) => {
  try {
    if (val === void 0)
      val = parent[key3];
  } catch (e) {
    return e;
  }
  const alreadyIs = parent[key3] && parent[key3][isProxy2];
  if (alreadyIs)
    return false;
  const type = typeof val;
  const isObject = type === "object";
  const isFunction2 = type == "function";
  const notObjOrFunc = !val || !(isObject || isFunction2);
  if (notObjOrFunc)
    return false;
  if (!isNode && val instanceof Element)
    return false;
  if (val instanceof EventTarget)
    return false;
  const isESM = isObject && esm(val);
  if (isFunction2)
    return true;
  else {
    const desc = Object.getOwnPropertyDescriptor(parent, key3);
    if (desc && (desc.value && desc.writable || desc.set)) {
      if (!isESM)
        return true;
    } else if (!parent.hasOwnProperty(key3))
      return true;
  }
  return false;
};
var Inspectable = class {
  constructor(target = {}, opts = {}, name9, parent) {
    this.path = [];
    this.listeners = {};
    this.newKeys = /* @__PURE__ */ new Set();
    this.state = {};
    this.set = (path2, info2, update) => {
      this.state[path2] = {
        output: update,
        value: info2
      };
      setFromPath(path2, update, this.proxy, { create: true });
    };
    this.check = canCreate;
    this.create = (key3, parent, val, set3 = false) => {
      const create7 = this.check(parent, key3, val);
      if (val === void 0)
        val = parent[key3];
      if (create7 && !(create7 instanceof Error)) {
        parent[key3] = new Inspectable(val, this.options, key3, this);
        return parent[key3];
      }
      if (set3) {
        try {
          this.proxy[key3] = val ?? parent[key3];
        } catch (e) {
          const isESM = esm(parent);
          const path2 = [...this.path, key3];
          console.error(`Could not set value (${path2.join(this.options.keySeparator)})${isESM ? " because the parent is an ESM." : ""}`, isESM ? "" : e);
        }
      }
      return;
    };
    if (!opts.pathFormat)
      opts.pathFormat = "relative";
    if (!opts.keySeparator)
      opts.keySeparator = keySeparator;
    if (target.__proxy)
      this.proxy = target.__proxy;
    else if (target[isProxy2])
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
      if (name9)
        this.path.push(name9);
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
      let handler2 = handlers_exports[`${type}s`].call(this);
      if (type === "function")
        handler2 = { ...handler2, ...objects.call(this) };
      this.proxy = new Proxy(target, handler2);
      Object.defineProperty(target, "__proxy", { value: this.proxy, enumerable: false });
      Object.defineProperty(target, "__esInspectable", { value: this, enumerable: false });
      for (let key3 in target)
        define_default.call(this, key3);
    }
    return this.proxy;
  }
};

// ../../packages/esmonitor/src/optionsHelpers.ts
var ranError = false;
var setFromOptions = (path2, value2, baseOptions, opts) => {
  const ref = opts.reference;
  const id = Array.isArray(path2) ? path2[0] : typeof path2 === "string" ? path2.split(baseOptions.keySeparator)[0] : path2;
  let isDynamic = opts.hasOwnProperty("static") ? !opts.static : false;
  if (isDynamic && !globalThis.Proxy) {
    isDynamic = false;
    console.warn("Falling back to using function interception and setters...");
  } else if (!ranError) {
    console.error("TODO: Finish integration of esmonitor-proxy with the core...");
    ranError = true;
  }
  if (isDynamic) {
    value2 = new Inspectable(value2, {
      pathFormat: baseOptions.pathFormat,
      keySeparator: baseOptions.keySeparator,
      listeners: opts.listeners,
      path: (path3) => path3.filter((str) => !baseOptions.fallbacks || !baseOptions.fallbacks.includes(str))
    }, id);
  }
  let options2 = { keySeparator: baseOptions.keySeparator, ...opts };
  setFromPath(path2, value2, ref, options2);
  return value2;
};

// ../../packages/esmonitor/src/listeners.ts
var info = (id, callback, path2, originalValue, base2, listeners2, options2, refShortcut = {}) => {
  if (typeof path2 === "string")
    path2 = path2.split(options2.keySeparator);
  const relativePath = path2.join(options2.keySeparator);
  const refs = base2;
  const shortcutRef = refShortcut.ref;
  const shortcutPath = refShortcut.path;
  const get12 = (path3) => {
    const thisBase = shortcutRef ?? base2;
    const res = getFromPath(thisBase, path3, {
      keySeparator: options2.keySeparator,
      fallbacks: options2.fallbacks
    });
    return res;
  };
  const set3 = (path3, value2) => {
    const thisBase = shortcutRef ?? base2;
    setFromOptions(path3, value2, options2, {
      reference: thisBase,
      listeners: listeners2
    });
  };
  let onUpdate = options2.onUpdate;
  let infoToOutput = {};
  if (onUpdate && typeof onUpdate === "object" && onUpdate.callback instanceof Function) {
    infoToOutput = onUpdate.info ?? {};
    onUpdate = onUpdate.callback;
  }
  const absolute2 = [id, ...path2];
  let pathInfo = {
    absolute: absolute2,
    relative: relativePath.split(options2.keySeparator),
    parent: absolute2.slice(0, -1)
  };
  pathInfo.output = pathInfo[options2.pathFormat];
  const completePathInfo = pathInfo;
  const info2 = {
    id,
    path: completePathInfo,
    keySeparator: options2.keySeparator,
    infoToOutput,
    callback: (...args) => {
      const output = callback(...args);
      if (onUpdate instanceof Function)
        onUpdate(...args);
      return output;
    },
    get current() {
      return get12(shortcutPath ?? info2.path.absolute);
    },
    set current(val) {
      set3(shortcutPath ?? info2.path.absolute, val);
    },
    get parent() {
      return get12(shortcutPath ? shortcutPath?.slice(0, -1) : info2.path.parent);
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
    last: path2.slice(-1)[0]
  };
  return info2;
};
var registerInLookup = (name9, sub, lookups) => {
  if (lookups) {
    const id = Math.random();
    lookups.symbol[sub] = {
      name: name9,
      id
    };
    if (!lookups.name[name9])
      lookups.name[name9] = {};
    lookups.name[name9][id] = sub;
  }
};
var register = (info2, collection, lookups) => {
  const absolute2 = getPath("absolute", info2);
  if (!collection[absolute2])
    collection[absolute2] = {};
  collection[absolute2][info2.sub] = info2;
  registerInLookup(absolute2, info2.sub, lookups);
  return true;
};
var listeners = {
  functions: functions2,
  setters
};
var set = (type, absPath, value2, callback, base2, allListeners, options2) => {
  const { id, path: path2 } = getPathInfo(absPath, options2);
  const fullInfo = info(id, callback, path2, value2, base2, listeners, options2);
  if (listeners[type])
    listeners[type](fullInfo, allListeners, allListeners.lookup);
  else {
    const path3 = getPath("absolute", fullInfo);
    allListeners[type][path3][fullInfo.sub] = fullInfo;
    if (allListeners.lookup)
      registerInLookup(path3, fullInfo.sub, allListeners.lookup);
  }
};
var get2 = (info2, collection) => collection[getPath("absolute", info2)];
var handler = (info2, collection, subscribeCallback, lookups) => {
  let success = !!get2(info2, collection);
  if (!success) {
    let parent = info2.parent;
    let val = parent?.[info2.last];
    success = subscribeCallback(val, parent);
  }
  return register(info2, collection, lookups);
};
var setterExecution = (listeners2, value2) => {
  return iterateSymbols(listeners2, (_, o) => {
    const path2 = getPath("output", o);
    runCallback(o.callback, path2, {}, value2);
  });
};
function setters(info2, collection, lookups) {
  const thisValue = this;
  return handler(info2, collection["setters"], (value2, parent) => {
    let val = value2;
    if (!parent)
      return;
    if (!parent[isProxy]) {
      let redefine = true;
      try {
        delete parent[info2.last];
      } catch (e) {
        console.error("Unable to redeclare setters. May already be a dynamic object...");
        redefine = false;
      }
      if (redefine) {
        const isGraphScriptProperty = info2.last.slice(0, 2) === "__" || info2.last === "default";
        try {
          Object.defineProperty(parent, info2.last, {
            get: () => val,
            set: async (v) => {
              const isFunction2 = typeof val === "function";
              val = v;
              if (!isFunction2) {
                const listeners2 = Object.assign({}, collection["setters"][getPath("absolute", info2)]);
                setterExecution(listeners2, v);
              } else
                val = getProxyFunction.call(thisValue, info2, collection, val);
            },
            enumerable: !isGraphScriptProperty,
            configurable: true
          });
        } catch (e) {
          throw e;
        }
      }
    }
  }, lookups);
}
function getProxyFunction(info2, collection, fn) {
  return function(...args) {
    const listeners2 = collection["functions"][getPath("absolute", info2)];
    const res = functionExecution(this, listeners2, fn ?? info2.original, args);
    return res.output;
  };
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
function functions2(info2, collection, lookups) {
  return handler(info2, collection["functions"], (_, parent) => {
    if (!parent[isProxy]) {
      parent[info2.last] = getProxyFunction.call(this, info2, collection);
      return setters(info2, collection, lookups);
    }
  }, lookups);
}

// ../../packages/common/drill.js
var abortSymbol = Symbol("abort");
var getObjectInfo = (obj, path2 = []) => {
  return {
    typeof: typeof obj,
    name: obj?.constructor?.name,
    simple: true,
    object: obj && typeof obj === "object",
    path: path2
  };
};
var drillSimple = (obj, callback, options2 = {}) => {
  let accumulator = options2.accumulator;
  if (!accumulator)
    accumulator = options2.accumulator = {};
  const ignore = options2.ignore || [];
  const path2 = options2.path || [];
  const condition = options2.condition || true;
  const seen = [];
  const fromSeen = [];
  let drill = (obj2, acc = {}, globalInfo) => {
    const path3 = globalInfo.path;
    if (path3.length === 0) {
      const toPass = condition instanceof Function ? condition(void 0, obj2, { ...getObjectInfo(obj2, path3) }) : condition;
      if (!toPass)
        return obj2;
    }
    for (let key3 in obj2) {
      if (options2.abort)
        return;
      if (ignore.includes(key3))
        continue;
      const val = obj2[key3];
      const newPath = [...path3, key3];
      const info2 = getObjectInfo(val, newPath);
      if (info2.object) {
        const name9 = info2.name;
        const isESM = esm(val);
        if (isESM || name9 === "Object" || name9 === "Array") {
          info2.simple = true;
          const idx = seen.indexOf(val);
          if (idx !== -1)
            acc[key3] = fromSeen[idx];
          else {
            seen.push(val);
            const pass = condition instanceof Function ? condition(key3, val, info2) : condition;
            info2.pass = pass;
            const res = callback(key3, val, info2);
            if (res === abortSymbol)
              return abortSymbol;
            acc[key3] = res;
            if (pass) {
              fromSeen.push(acc[key3]);
              const res2 = drill(val, acc[key3], { ...globalInfo, path: newPath });
              if (res2 === abortSymbol)
                return abortSymbol;
              acc[key3] = res2;
            }
          }
        } else {
          info2.simple = false;
          const res = callback(key3, val, info2);
          if (res === abortSymbol)
            return abortSymbol;
          acc[key3] = res;
        }
      } else {
        const res = callback(key3, val, info2);
        if (res === abortSymbol)
          return abortSymbol;
        acc[key3] = res;
      }
    }
    return acc;
  };
  return drill(obj, accumulator, { path: path2 });
};

// ../../packages/esmonitor/src/Monitor.ts
var createLookup = () => {
  return { symbol: {}, name: {} };
};
var isNode2 = typeof process === "object";
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
    this.get = (path2, output, reference = this.references) => {
      return getFromPath(reference, path2, {
        keySeparator: this.options.keySeparator,
        fallbacks: this.options.fallbacks,
        output
      });
    };
    this.set = (path2, value2, opts = {}) => {
      const optsCopy = { ...opts };
      if (!optsCopy.reference)
        optsCopy.reference = this.references;
      if (!optsCopy.listeners)
        optsCopy.listeners = this.listeners;
      const set3 = setFromOptions(path2, value2, this.options, optsCopy);
      return set3;
    };
    this.on = (absPath, callback) => {
      const info2 = getPathInfo(absPath, this.options);
      return this.listen(info2.id, callback, info2.path);
    };
    this.getInfo = (label, callback, path2, original) => {
      const info2 = info(label, callback, path2, original, this.references, this.listeners, this.options);
      const id = Math.random();
      const lookups = this.listeners.lookup;
      const name9 = getPath("absolute", info2);
      lookups.symbol[info2.sub] = {
        name: name9,
        id
      };
      if (!lookups.name[name9])
        lookups.name[name9] = {};
      lookups.name[name9][id] = info2.sub;
      return info2;
    };
    this.listen = (id, callback, path2 = [], __internal = {}) => {
      if (typeof path2 === "string")
        path2 = path2.split(this.options.keySeparator);
      else if (typeof path2 === "symbol")
        path2 = [path2];
      const arrayPath = path2;
      let baseRef = this.get(id);
      if (!baseRef) {
        console.error(`Reference does not exist.`, id);
        return;
      }
      if (!__internal.poll)
        __internal.poll = esm(baseRef);
      if (!__internal.seen)
        __internal.seen = [];
      const __internalComplete = __internal;
      const thisPath = [id, ...arrayPath];
      const ref = this.get(thisPath);
      const toMonitorInternally = (val, allowArrays = false) => {
        const first = val && typeof val === "object";
        if (!first)
          return false;
        if (!isNode2) {
          const isEl = val instanceof Element;
          if (isEl)
            return false;
        }
        if (allowArrays)
          return true;
        else
          return !Array.isArray(val);
      };
      let subs = {};
      let success = false;
      const subscribeAll = toMonitorInternally(ref, true);
      if (subscribeAll) {
        if (ref.__esInspectable)
          ref.__esInspectable.options.globalCallback = callback;
        drillSimple(ref, (_, __2, drillInfo) => {
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
        success = true;
      }
      let info2;
      try {
        info2 = this.getInfo(id, callback, arrayPath, ref);
        if (info2 && !success) {
          if (__internalComplete.poll)
            success = this.poller.add(info2);
          else {
            let type = "setters";
            if (typeof ref === "function")
              type = "functions";
            success = this.add(type, info2);
          }
        }
      } catch (e) {
        console.error("Fallback to polling:", path2, e);
        success = this.poller.add(info2);
      }
      if (success) {
        subs[getPath("absolute", info2)] = info2.sub;
        if (this.options.onInit instanceof Function) {
          const executionInfo = {};
          for (let key3 in info2.infoToOutput)
            executionInfo[key3] = void 0;
          this.options.onInit(getPath("output", info2), executionInfo);
        }
        return subs;
      } else {
        console.error("Failed to subscribe to:", path2);
        return;
      }
    };
    this.add = (type, info2) => {
      if (listeners_exports[type])
        return listeners_exports[type](info2, this.listeners, this.listeners.lookup);
      else {
        this.listeners[type][getPath("absolute", info2)][info2.sub] = info2;
        return true;
      }
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
      for (let key3 in subs) {
        let innerSub = subs[key3];
        const handleUnsubscribe = (sub) => {
          const res = this.unsubscribe(sub);
          if (res === false)
            console.warn(`Subscription for ${key3} does not exist.`, sub);
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
          Object.defineProperty(func.parent, func.last, {
            value: func.original,
            writable: true
          });
          delete this.listeners.functions[absPath];
        }
      } else if (setter) {
        delete setters2[sub];
        if (!Object.getOwnPropertySymbols(setters2).length) {
          const parent = setter.parent;
          if (parent) {
            const last = setter.last;
            const value2 = parent[last];
            Object.defineProperty(parent, last, { value: value2, writable: true });
          }
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

// ../../packages/esmonitor/src/index.ts
var src_default = Monitor;

// ../../packages/common/properties.ts
var rawProperties = {};
var globalObjects = ["Object", "Array", "Map", "Set"];
function all(obj) {
  var props = [];
  if (obj) {
    do {
      const name9 = obj.constructor?.name;
      const isGlobalObject = globalObjects.includes(name9);
      if (globalObjects.includes(name9)) {
        if (!rawProperties[name9])
          rawProperties[name9] = [...Object.getOwnPropertyNames(globalThis[name9].prototype)];
      }
      Object.getOwnPropertyNames(obj).forEach(function(prop) {
        if (isGlobalObject && rawProperties[name9].includes(prop))
          return;
        if (props.indexOf(prop) === -1)
          props.push(prop);
      });
    } while (obj = Object.getPrototypeOf(obj));
  }
  return props;
}

// ../../packages/common/clone.js
var shallow = (obj, opts = {}) => {
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj = [...obj];
      opts.accumulator = [];
    } else {
      const keys = all(obj);
      const newObj = {};
      for (let key3 of keys)
        newObj[key3] = obj[key3];
      obj = newObj;
      opts.accumulator = {};
    }
  }
  return obj;
};
var deep = (obj, opts = {}) => {
  if (typeof obj !== "object")
    return obj;
  obj = shallow(obj, opts);
  drillSimple(obj, (key3, val, info2) => {
    if (info2.simple && info2.object)
      return Array.isArray(val) ? [] : {};
    else
      return val;
  }, opts);
  return opts.accumulator;
};

// ../../packages/common/utils/index.ts
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
var functionRegistry = [];
var merge = (main, override, updateOriginal = false, flipPrecedence = false, composeFunctions = false, seen = []) => {
  let copy = updateOriginal ? main : shallow(main);
  if (flipPrecedence)
    [copy, override] = [override, copy];
  if (override) {
    const keys = all(copy);
    const newKeys = new Set(all(override));
    keys.forEach((k) => {
      newKeys.delete(k);
      const exists = k in override;
      const newValue = override[k];
      if (exists && newValue === void 0)
        delete copy[k];
      else if (typeof newValue === "object" && !Array.isArray(newValue)) {
        if (typeof copy[k] === "object") {
          const val = copy[k];
          const idx = seen.indexOf(val);
          if (idx !== -1)
            copy[k] = seen[idx];
          else {
            seen.push(val);
            copy[k] = merge(val, newValue, updateOriginal, false, composeFunctions, seen);
          }
        } else
          copy[k] = newValue;
      } else if (typeof newValue === "function") {
        const original = copy[k];
        const isFunc = typeof original === "function";
        const newFunc = newValue;
        const composeFunction = newFunc.__compose === true;
        if (!isFunc || !composeFunctions && !composeFunction)
          copy[k] = newFunc;
        else {
          let funcList = functionRegistry.find((o) => o.f === original);
          let ogFunc = original;
          if (!funcList) {
            if (ogFunc.__esInspectable)
              ogFunc = ogFunc.__esInspectable.target;
            funcList = { f: ogFunc, list: [ogFunc] };
            functionRegistry.push(funcList);
          }
          if (!funcList.list.includes(newFunc)) {
            const func = copy[k] = function(...args) {
              const res = ogFunc.call(this, ...args);
              return newFunc.call(this, ...Array.isArray(res) ? res : [res]);
            };
            funcList.f = func;
            funcList.list.push(newFunc);
          } else
            console.warn(`This function was already composed. Ignoring duplicate.`);
        }
      } else if (k in override)
        copy[k] = newValue;
    });
    newKeys.forEach((k) => {
      const newValue = override[k];
      if (newValue === void 0)
        return;
      else
        copy[k] = newValue;
    });
  }
  return copy;
};
function isNativeClass(thing) {
  return isFunction(thing) === "class";
}
function isFunction(x2) {
  const res = typeof x2 === "function" ? x2.prototype ? Object.getOwnPropertyDescriptor(x2, "prototype").writable ? "function" : "class" : x2.constructor.name === "AsyncFunction" ? "async" : "arrow" : "";
  return res;
}

// ../../packages/core/symbols.ts
var toReturn = Symbol("return");

// ../../packages/core/parse.ts
var isNativeClass2 = (o) => typeof o === "function" && o.hasOwnProperty("prototype") && !o.hasOwnProperty("arguments");
function parse(config, overrides = {}, options2 = {}) {
  if (!isNode) {
    if (config instanceof NodeList)
      config = Array.from(config);
  }
  if (typeof config === "string")
    config = { [specialKeys.apply]: config };
  else if (typeof config === "function") {
    if (isNativeClass2(config))
      config = new config(overrides, options2);
    else {
      delete config.__;
      config = { [specialKeys.default]: config };
    }
  } else if (!isNode && config instanceof Element) {
    const component2 = config[specialKeys.component];
    if (component2) {
      overrides = deep(overrides);
      const shouldHaveComposed = overrides.__compose;
      const shouldHaveApplied = overrides.__apply;
      delete overrides.__compose;
      delete overrides.__apply;
      if (shouldHaveComposed) {
        console.warn("Cannot compose a component onto an element that already has a component. Merging with the base object instead...");
        overrides = Object.assign(shouldHaveComposed, overrides);
      }
      if (shouldHaveApplied) {
        console.warn("Cannot apply a component onto an element that already has a component. Applying to the base object instead...");
        overrides = Object.assign(overrides, shouldHaveApplied);
      }
      const merged = merge(component2, overrides, true);
      return { [toReturn]: merged };
    } else {
      config = { [specialKeys.element]: config };
    }
  } else if (Array.isArray(config))
    return config;
  else if (typeof config === "object") {
    config = options2.clone !== false ? deep(config) : config;
  } else
    throw new Error(`Invalid configuration type: ${typeof config}. Expected object or string.`);
  return config;
}

// ../../packages/core/utils/loaders.ts
var compose = (callbacks, start4, otherArgs = [], toIgnore) => {
  return callbacks.reduce((x2, f) => resolve(x2, (res) => {
    let func = typeof f === "function" ? f : f.default;
    const output = func(res, ...otherArgs);
    return toIgnore && toIgnore(output) ? res : output;
  }), start4);
};
var runLoaders = (loaders, inputs, which) => {
  const { main, options: options2 } = inputs;
  let preloaded;
  if (!Array.isArray(loaders)) {
    if (!loaders[which])
      return main;
    const sorted = loaders;
    loaders = sorted[which] ?? [];
    switch (which) {
      case "activate":
        preloaded = [...sorted.load ?? []];
        break;
      case "start":
        preloaded = [...sorted.load ?? [], ...sorted.activate ?? []];
      case "stop":
        preloaded = [...sorted.load ?? [], ...sorted.activate ?? [], ...sorted.start ?? []];
        break;
    }
  }
  const resolvedLoaders = loaders;
  const loadersToUse = filterLoaders(main, resolvedLoaders, preloaded);
  if (loadersToUse)
    return compose(loadersToUse, main, [options2], (output) => !output || typeof output !== "object");
  else
    return main;
};
var sortLoaders = (loaders) => {
  const sorted = {};
  loaders.forEach((o) => {
    const behavior2 = typeof o === "function" ? "activate" : o.behavior ?? "activate";
    const theseLoaders = sorted[behavior2] = sorted[behavior2] ?? [];
    theseLoaders.push(o);
  });
  return sorted;
};
var filterLoaders = (esc, loaders, beenLoaded = []) => {
  const keys = all(esc).filter((str) => str.slice(0, 2) === "__");
  const defaultPropertiesCopy = Object.values(defaultProperties);
  const created = [...defaultPropertiesCopy, ...beenLoaded.map((o) => {
    if (typeof o === "function")
      return [];
    else
      return o.properties.dependents;
  }).flat()];
  const usedLoaders = loaders.filter((o) => {
    if (o && typeof o === "object") {
      const name9 = o.name;
      const { dependencies: dependencies2, dependents: dependents2 = [] } = o.properties;
      let include = o.required || !dependencies2;
      if (!include && dependencies2) {
        const optionalNameMessage = name9 ? ` (${name9})` : "";
        const found = dependents2.find((key3) => keys.includes(key3));
        if (found) {
          const deps = {};
          dependencies2.forEach((key3) => deps[key3] = created.includes(key3));
          const missingDependency = dependencies2.filter((key3) => !created.includes(key3));
          if (missingDependency.length)
            console.warn(`The loader${optionalNameMessage} for ${dependencies2.join(", ")} might be loaded too early, since we are missing the following dependencies: ${missingDependency.join(", ")}`);
          include = true;
        }
      }
      if (include && dependents2)
        created.push(...dependents2);
      return include;
    }
  });
  return usedLoaders;
};
var combineLoaders = (original = [], additional) => {
  if (!original || original.length === 0)
    return additional;
  if (!additional || additional.length === 0)
    return original;
  const seen = [];
  const all2 = [...original, ...additional];
  return all2.filter((o) => {
    if (typeof o === "function")
      return true;
    else {
      const name9 = o.name;
      if (!name9)
        return true;
      else {
        const include = !seen.includes(name9);
        if (!include)
          return false;
        seen.push(name9);
        return true;
      }
    }
  }, void 0);
};

// ../../packages/core/components.ts
var is = (key3) => {
  return key3.includes(specialKeys.isGraphScript) || key3 === "default";
};
var basicObjects = ["Object", "Array"];
var has = (o) => {
  let has2 = false;
  drillSimple(o, (key3, val, info2) => {
    if (info2.path.length > 1) {
      const found = info2.path.find((str) => str === "__");
      if (!found && is(key3)) {
        has2 = info2.path;
        return abortSymbol;
      }
    }
  }, {
    ignore: ["__", "__parent", "__compose", "__apply"],
    condition: (_, o2) => {
      const thisName = o2?.constructor?.name;
      const propName = o2?.__props?.constructor?.name;
      return !basicObjects.includes(thisName) && !!globalThis[thisName] || !!globalThis[propName] ? false : true;
    }
  });
  return has2;
};
function from(parent) {
  if (!parent || typeof parent !== "object")
    return null;
  let array = Object.entries(parent).map(([name9, ref]) => {
    const mayBeComponent = ref && typeof ref === "object" || typeof ref === "function";
    if (!mayBeComponent)
      return;
    const hasGraphScriptProperties = !name9.includes(specialKeys.isGraphScript) ? Object.keys(ref).find(is) : false;
    if (hasGraphScriptProperties) {
      if (name9 === "constructor" && isNativeClass(ref))
        return;
      return { ref, parent, name: name9 };
    }
  }).filter((v) => v && v.ref);
  let hasProperties = array.length > 0;
  if (!hasProperties) {
    const found = has(parent);
    if (found) {
      const sliced = found.slice(0, -2);
      let target = parent;
      sliced.forEach((str) => {
        target = target[str];
        target.__ = true;
      });
      const name9 = found[0];
      array = [{
        ref: parent[name9],
        parent,
        name: name9
      }];
      hasProperties = true;
    }
  }
  if (hasProperties)
    return array;
  else
    return null;
}

// ../../packages/core/loaders/props/index.ts
var props_exports = {};
__export(props_exports, {
  default: () => props_default,
  name: () => name,
  properties: () => properties
});
var name = "props";
var properties = {
  dependents: [specialKeys.properties]
};
var proxy = (target, source, props, globalProxy = source) => {
  if (!props)
    props = all(source);
  props.forEach((str) => {
    if (!(str in target)) {
      const desc = {
        get: () => {
          return globalProxy[str];
        },
        set: (newVal) => {
          globalProxy[str] = newVal;
        },
        enumerable: true,
        configurable: false
      };
      if (globalProxy !== source)
        Object.defineProperty(globalProxy, str, desc);
      Object.defineProperty(target, str, desc);
    }
  });
};
var propsLoader = (esc) => {
  const root = esc[specialKeys.isGraphScript];
  const val = esc[specialKeys.properties];
  root.props = {
    original: []
  };
  let propsAdded = void 0;
  Object.defineProperty(esc, specialKeys.properties, {
    get: () => {
      return propsAdded;
    },
    set: (newProps) => {
      if (typeof newProps !== "object" && !isNativeClass(newProps))
        console.warn("Props must be an object");
      else {
        const props = all(newProps);
        if (!propsAdded) {
          propsAdded = newProps;
          root.props.original = props;
        } else {
          const ogProps = propsAdded;
          propsAdded = {};
          proxy(propsAdded, ogProps, root.props.original);
        }
        proxy(esc, newProps, props, propsAdded);
      }
    },
    enumerable: false,
    configurable: false
  });
  if (val)
    esc[specialKeys.properties] = val;
  return esc;
};
var props_default = propsLoader;

// ../../packages/core/loaders/parent/index.ts
var parent_exports = {};
__export(parent_exports, {
  default: () => parent_default,
  name: () => name2,
  properties: () => properties3,
  required: () => required
});

// ../../packages/core/loaders/parent/path/index.ts
var properties2 = {
  dependencies: [
    specialKeys.isGraphScript,
    specialKeys.parent
  ],
  dependents: []
};
var pathLoader = (esc, opts = {}) => {
  const configuration = esc[specialKeys.isGraphScript];
  let parent = esc[specialKeys.parent];
  const name9 = configuration.name;
  parent = (!isNode && parent instanceof Element ? parent?.[specialKeys.component] : parent) ?? esc[specialKeys.parent];
  const isESC = { value: "", writable: true };
  if (parent) {
    const parentComponentConfiguration = parent[specialKeys.isGraphScript];
    if (parentComponentConfiguration) {
      if (typeof name9 === "string") {
        let target = parent;
        const path2 = [];
        while (target && target[specialKeys.isGraphScript]) {
          const parentName = target[specialKeys.isGraphScript].name;
          if (typeof parentName === "string")
            path2.push(parentName);
          else {
            if (typeof parentName === "symbol")
              configuration.root = parentName;
            else
              console.error("No graph reset occured for", parentName);
            break;
          }
          target = target[specialKeys.parent];
        }
        isESC.value = [...path2.reverse(), name9];
        isESC.value = isESC.value.join(opts.keySeparator ?? ".");
      }
    }
  }
  Object.defineProperty(configuration, "path", isESC);
};
var path_default = pathLoader;

// ../../packages/core/loaders/parent/index.ts
var name2 = "parent";
var required = true;
var properties3 = {
  dependencies: [
    specialKeys.isGraphScript
  ],
  dependents: []
};
var parentLoader = (esc, options2) => {
  const configuration = esc[specialKeys.isGraphScript];
  configuration.parent = {
    callbacks: [],
    add: function(callback) {
      this.callbacks.push(callback);
    },
    get: () => {
      return parent;
    },
    start: (force = false) => {
      if (force || parent[specialKeys.isGraphScript]?.start?.value === true) {
        const isConnected = configuration.connected;
        const toConnect = isConnected instanceof Function;
        esc[specialKeys.isGraphScript].start.run();
        if (toConnect)
          isConnected();
      }
    }
  };
  const existingParent = esc[specialKeys.parent];
  let parent = existingParent;
  Object.defineProperty(esc, specialKeys.parent, {
    get: () => {
      return configuration.parent.get();
    },
    set: (newParent) => {
      const disconnecting = parent && !newParent;
      if (parent?.[specialKeys.isGraphScript]) {
        const name9 = configuration.name;
        delete parent[name9];
        parent.__.components.delete(name9);
      }
      parent = newParent;
      const parentConfiguration = parent?.[specialKeys.isGraphScript];
      if (parentConfiguration) {
        const name9 = configuration.name;
        if (parent[name9])
          console.error("OVERWRITING EXISTING PROPERTY ON PARENT!");
        parent[name9] = esc;
        parent.__.components.set(name9, esc);
      }
      configuration.parent.callbacks.forEach((callback) => callback.call(esc, newParent));
      path_default(esc, options2);
      if (disconnecting)
        esc[specialKeys.isGraphScript].stop.run();
      else if (parent)
        configuration.parent.start();
    }
  });
  path_default(esc, options2);
};
var parent_default = parentLoader;

// ../../packages/core/loaders/drafts/root/index.ts
var properties4 = {
  dependents: [specialKeys.isGraphScript]
};
function rootLoader(esc, options2, additionalInfo) {
  const val = createGraphScriptRoot(additionalInfo.name, options2, additionalInfo);
  Object.defineProperty(esc, specialKeys.isGraphScript, {
    value: val,
    enumerable: false,
    configurable: false,
    writable: false
  });
  return esc;
}
var root_default = rootLoader;
function createGraphScriptRoot(name9, options2, additionalInfo) {
  const { parent, original, loaders } = additionalInfo;
  const isSymbol = typeof name9 === "symbol";
  const parentId = parent?.[specialKeys.isGraphScript].path;
  const path2 = parentId ? [parentId, name9] : typeof name9 === "string" ? [name9] : [];
  const absolutePath = path2.join(keySeparator);
  const __2 = {
    name: name9,
    symbol: Symbol("isGraphScript"),
    root: isSymbol ? name9 : parent[specialKeys.isGraphScript].root,
    path: absolutePath,
    options: options2,
    original,
    states: {},
    components: /* @__PURE__ */ new Map(),
    connected: false,
    resolved: false,
    create: (esc) => {
      if (!options2.loaders)
        options2.loaders = loaders;
      return core_default(esc, void 0, options2);
    },
    stop: {
      name: "stop",
      value: false,
      add: addCallback,
      callbacks: {
        before: [],
        main: [],
        after: []
      }
    },
    start: {
      name: "start",
      value: false,
      add: addCallback,
      callbacks: {
        before: [],
        main: [],
        after: []
      }
    }
  };
  const toRunProxy = function() {
    return runRecursive.call(this, __2.ref);
  };
  __2.start.run = toRunProxy.bind(__2.start);
  __2.stop.run = toRunProxy.bind(__2.stop);
  return __2;
}
var run = (f, context, args, x2) => resolve2(x2, () => f.call(context, ...args));
var runSequentially = (callbacks, args = [], context) => {
  if (callbacks.length) {
    return callbacks.reduce((x2, f) => run(f, context, args), void 0);
  }
};
function addCallback(callback, priority = "main") {
  const { callbacks } = this;
  callbacks[priority].push(callback);
  return true;
}
function runRecursive(resolved) {
  const { callbacks, name: name9 } = this;
  if (!this.value) {
    const isStop = name9 === "stop";
    const configuration = resolved[specialKeys.isGraphScript];
    const callback = isStop ? configuration.stop.initial : resolved[specialKeys[name9]];
    this.value = true;
    if (!isStop)
      configuration.stop.value = false;
    const toCall = callback && !isStop ? [...callbacks.before, callback, ...callbacks.main] : [...callbacks.before, ...callbacks.main];
    const result = runSequentially(toCall, [resolved], resolved);
    return resolve2(result, () => {
      const hierarchy = Array.from(resolved[specialKeys.isGraphScript].components.entries());
      const ranOnChildren = resolve2(hierarchy.map(async ([tag, component2]) => {
        const promise = component2[specialKeys.promise];
        if (promise && typeof promise.then === "function")
          component2 = hierarchy[tag] = await promise;
        return await component2[specialKeys.isGraphScript][name9].run();
      }));
      return resolve2(ranOnChildren, () => {
        const result2 = runSequentially(callbacks.after, [resolved], resolved);
        return resolve2(result2, () => {
          if (isStop) {
            if (callback)
              callback.call(resolved, resolved);
            resolved[specialKeys.listeners.value].clear();
            const path2 = resolved[specialKeys.isGraphScript].path;
            let target = resolved;
            const parent = target[specialKeys.parent];
            while (parent && parent[specialKeys.isGraphScript] !== void 0) {
              const res = target[specialKeys.parent];
              if (res) {
                target = res;
                if (target) {
                  const configuration2 = target[specialKeys.isGraphScript];
                  if (configuration2)
                    target[specialKeys.listeners.value].clear(path2);
                }
              } else
                break;
            }
            configuration.start.value = false;
          }
          return true;
        });
      });
    });
  }
}

// ../../packages/core/load.ts
function load(esc, loaders = [], options2) {
  const tic = performance.now();
  const parent = options2.parent;
  const {
    parentObject,
    overrides = {},
    callbacks = {},
    opts = {},
    name: name9 = Symbol("root")
  } = options2;
  const original = esc;
  esc = parse(esc, overrides, opts);
  if (esc[toReturn])
    return esc[toReturn];
  if (Array.isArray(esc))
    return resolve(esc.map((o) => load(o, loaders, options2)));
  esc = root_default(esc, options2, { name: name9, parent, original, loaders });
  esc = merge(esc, overrides);
  const sortedLoaders = sortLoaders(loaders);
  const loaded = runLoaders(sortedLoaders, { main: esc, overrides, options: opts }, "load");
  const component2 = resolve(loaded, (loaded2) => {
    if (!loaded2[specialKeys.parent] && parent)
      loaded2[specialKeys.parent] = parent;
    const parented = runLoaders([parent_exports], { main: loaded2, options: opts });
    const propped = runLoaders([props_exports], { main: parented });
    const res = runLoaders(sortedLoaders, { main: propped, options: opts }, "activate");
    return resolve(res, (esc2) => {
      esc2.__.ref = esc2;
      if (parentObject)
        parentObject[name9] = esc2;
      if (typeof name9 === "symbol" && callbacks.onRootCreated)
        callbacks.onRootCreated(name9, esc2);
      if (callbacks.onInstanceCreated)
        callbacks.onInstanceCreated(esc2.__.path, esc2);
      const configuration = esc2[specialKeys.isGraphScript];
      const nested = from(propped);
      const promises = nested ? nested.map((info2) => {
        const copy = Object.assign({}, options2);
        const name10 = copy.name = info2.name;
        delete copy.overrides;
        copy.parentObject = info2.parent;
        copy.parent = esc2;
        const ref = info2.ref;
        if (ref) {
          if (ref.__?.symbol) {
            const parent2 = ref.__.parent;
            if (parent2)
              console.error(`Changing parent of existing component (${ref.__.path}) from ${parent2.__.path} to ${configuration.path}`);
            ref.__.name = name10;
            ref.__parent = esc2;
          } else {
            const resolution = load(ref, loaders, copy);
            Object.defineProperty(info2.parent[name10], specialKeys.promise, { value: resolution, writable: false });
            const promise = resolve(resolution, (res2) => {
              configuration.components.set(name10, res2);
              return res2;
            });
            configuration.components.set(name10, promise);
          }
        } else {
          delete info2.parent[name10];
          console.error("No reference found for nested component", info2);
        }
      }) : [];
      let isResolved;
      const resolvePromise = new Promise((resolve4) => isResolved = async () => {
        configuration.resolved = true;
        resolve4(true);
      });
      Object.defineProperty(esc2, `${specialKeys.resolved}`, { value: resolvePromise });
      configuration.resolved = false;
      resolve(promises, () => isReady(esc2, callbacks, isResolved));
      return esc2;
    });
  });
  const creationToc = performance.now();
  const toCreateTime = creationToc - tic;
  resolve(component2, (esc2) => {
    if (!Array.isArray(esc2)) {
      const resolveToc = performance.now();
      const resolveTime = resolveToc - tic;
      resolve(esc2.__resolved, () => {
        const toc = performance.now();
        const resolveAllTime = toc - tic;
        globalThis.escomposePerformance.resolve.push(resolveTime);
        globalThis.escomposePerformance.resolveAll.push(resolveAllTime);
        globalThis.escomposePerformance.create.push(toCreateTime);
      });
    }
  });
  return component2;
}
function isReady(esc, callbacks, isResolved) {
  const configuration = esc[specialKeys.isGraphScript];
  for (let key3 in esc) {
    const og = esc[key3];
    if (typeof og === "function" && !isNativeClass(og)) {
      const context = esc[specialKeys.proxy] ?? esc;
      esc[key3] = og.bind(context);
    }
  }
  configuration.stop.initial = esc[specialKeys.stop];
  esc[specialKeys.stop] = configuration.stop.run;
  const keys = all(esc);
  for (let key3 of keys) {
    if (is(key3)) {
      const desc = Object.getOwnPropertyDescriptor(esc, key3);
      if (desc?.enumerable)
        Object.defineProperty(esc, key3, { ...desc, enumerable: false });
    }
  }
  const finalParent = esc[specialKeys.parent];
  esc[specialKeys.parent] = finalParent;
  if (callbacks.onInstanceReady)
    callbacks.onInstanceReady(esc.__.path, esc);
  isResolved();
}

// ../../packages/core/globals.ts
globalThis.escomposePerformance = {
  create: [],
  resolve: [],
  resolveAll: [],
  listeners: {
    create: [],
    resolve: []
  },
  averages: function() {
    const averages = {
      create: 0,
      resolve: 0,
      resolveAll: 0,
      listeners: {
        create: 0,
        resolve: 0
      }
    };
    for (const key3 in averages) {
      if (typeof this[key3] === "object" && !Array.isArray(this[key3])) {
        for (const subKey in this[key3]) {
          averages[key3][subKey] = this[key3][subKey].reduce((a, b) => a + b, 0) / this[key3][subKey].length;
        }
      } else
        averages[key3] = this[key3].reduce((a, b) => a + b, 0) / this[key3].length;
    }
    return averages;
  }
};

// ../../packages/core/loaders/listeners/index.ts
var listeners_exports2 = {};
__export(listeners_exports2, {
  default: () => listeners_default,
  name: () => name3,
  properties: () => properties5,
  required: () => required2
});

// ../../packages/core/edgelord/index.ts
var defaultPath2 = "default";
var operatorPath = "__operator";
var specialKeys2 = {
  path: "__path",
  isGraphScript: "__",
  listeners: {
    value: "__listeners",
    branch: "__branch",
    bind: "__bind",
    trigger: "__trigger",
    format: "__format"
  }
};
var listenerObject = Symbol("listenerObject");
var toSet = Symbol("toSet");
var subscriptionKey = Symbol("subscriptionKey");
var configKey = Symbol("configKey");
var toResolveWithKey = Symbol("toResolveWithKey");
var isConfigObject = (o) => specialKeys2.listeners.format in o || specialKeys2.listeners.branch in o || specialKeys2.listeners.trigger in o || specialKeys2.listeners.bind in o;
var initializedStatus = "INITIALIZED";
var registeredStatus = "REGISTERED";
var globalFrom = {};
var globalTo = {};
var globalActive = {};
var Edgelord = class {
  constructor(listeners2, root, context) {
    this.original = {};
    this.active = {};
    this.globals = {};
    this.context = {
      options: {}
    };
    this.rootPath = "";
    this.status = "";
    this.#triggers = [];
    this.#queue = [];
    this.setInitialProperties = (listeners2 = {}, root, context = {}) => {
      Object.assign(this.context, context);
      if (root)
        this.rootPath = root;
      this.original = listeners2;
      const globals = [{ name: "active", ref: globalActive }, { name: "from", ref: globalFrom }, { name: "to", ref: globalTo }];
      globals.forEach((o) => {
        if (!o.ref[this.context.id])
          o.ref[this.context.id] = {};
        this.globals[o.name] = o.ref[this.context.id];
      });
      this.#toResolveWith = this.getManager();
      this.runEachListener(listeners2, this.addToGlobalLog);
    };
    this.getManager = (mode = "from") => {
      let target = mode === "to" ? this.globals.to : this.globals.from;
      this.rootPath.split(keySeparator).forEach((key3) => {
        if (!target[key3])
          target[key3] = {};
        target = target[key3];
      });
      return target[toResolveWithKey] ?? this;
    };
    this.onStart = (f) => {
      const res = this.#toResolveWith;
      const isSame2 = res === this;
      if (isSame2) {
        if (this.status === initializedStatus)
          f();
        else
          this.#queue.push(f);
      } else
        res.onStart(f);
    };
    this.runEachListener = (listeners2, callback) => {
      if (!callback)
        return;
      for (const first in listeners2) {
        const second = listeners2[first];
        if (!second) {
          console.warn("Skipping empty listener:", first);
          continue;
        }
        if (second && typeof second === "object") {
          const from2 = second;
          const to = first;
          for (let fromPath in from2) {
            callback(fromPath, to, from2[fromPath]);
          }
        } else {
          const from2 = first;
          const to = second;
          const typeOf = typeof to;
          if (typeOf === "function")
            callback(from2, "", to);
          else if (typeOf === "string")
            callback(from2, to, to);
          else
            console.error("Improperly Formatted Listener", to);
        }
      }
    };
    this.register = (listeners2 = this.original) => {
      this.runEachListener(listeners2, this.add);
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
        this.#triggers.push(o);
      else if (this.status === registeredStatus) {
        this.status = initializedStatus;
        this.#triggers.forEach(this.#initialize);
        this.#queue.forEach((f) => f());
        this.#queue = [];
        this.#triggers = [];
      } else
        this.#initialize(o);
    };
    this.start = () => {
      this.register();
      this.initialize();
    };
    this.#getAbsolutePath = (name9) => {
      return !name9 || !this.rootPath || this.rootPath === name9.slice(0, this.rootPath.length) && name9[this.rootPath.length] === keySeparator ? name9 : [this.rootPath, name9].join(keySeparator);
    };
    this.#getPathInfo = (path2) => {
      const output = {
        absolute: {},
        relative: {}
      };
      path2 = this.#getAbsolutePath(path2);
      let rel = this.rootPath ? path2.replace(`${this.rootPath}.`, "") : path2;
      const baseArr = path2.split(keySeparator);
      output.absolute.array = [this.context.id, ...baseArr];
      output.relative.array = rel.split(keySeparator);
      let obj = this.context.monitor.get(output.absolute.array, void 0);
      if (this.context.graph) {
        if (obj && this.context.bound) {
          output.absolute.array = [this.context.id, this.context.bound, ...output.absolute.array.slice(1)];
          output.relative.array.unshift(this.context.bound);
        } else if (!obj) {
          const rel2 = output.relative.array.join(keySeparator);
          obj = this.context.graph.get(rel2);
        }
      }
      const isGraphScript = obj && typeof obj === "object" && specialKeys2.isGraphScript in obj;
      const useOperator = obj && isGraphScript && obj[operatorPath];
      const useDefault = obj && obj[defaultPath2];
      const extraPath = useOperator ? operatorPath : useDefault ? defaultPath2 : void 0;
      if (extraPath) {
        output.absolute.array.push(extraPath);
        output.relative.array.push(extraPath);
      }
      output.absolute.value = output.absolute.array.slice(1).join(keySeparator);
      output.relative.value = output.relative.array.join(keySeparator);
      return output;
    };
    this.add = (from2, to, value2 = true, subscription) => {
      const tic = performance.now();
      if (!value2)
        return;
      const fromInfo = this.#getPathInfo(from2);
      const toInfo = this.#getPathInfo(to);
      const absPath = fromInfo.absolute.value;
      if (!subscription)
        subscription = this.globals.active[absPath]?.[subscriptionKey];
      if (!subscription) {
        subscription = this.context.monitor.on(fromInfo.absolute.array, (path2, _, update) => this.activate(path2, update), {
          ref: this.context.instance,
          path: fromInfo.relative.array
        });
      }
      if (typeof value2 == "string")
        value2 = toInfo.absolute.array.slice(1).join(keySeparator);
      const info2 = {
        value: value2,
        [listenerObject]: true
      };
      const refs = [this.active, this.globals.active];
      refs.forEach((ref) => {
        if (!ref[absPath])
          ref[absPath] = {};
        const base2 = ref[absPath];
        if (!base2[subscriptionKey]) {
          Object.defineProperty(base2, subscriptionKey, {
            value: subscription,
            configurable: true
          });
        }
        base2[toInfo.absolute.value] = info2;
      });
      const args = value2[specialKeys2.listeners.trigger];
      if (args)
        this.#toResolveWith.initialize({
          path: fromInfo.absolute.array,
          args
        });
      this.addToGlobalLog(absPath);
      const toc = performance.now();
      globalThis.escomposePerformance.listeners.create.push(toc - tic);
      return info2;
    };
    this.addToGlobalLog = (path2, mode = "from") => {
      const absolutePath = this.#getAbsolutePath(path2);
      let target = mode === "to" ? this.globals.to : this.globals.from;
      const globalPath = absolutePath.split(keySeparator);
      globalPath.forEach((key3) => {
        if (!target[key3])
          target[key3] = {};
        target = target[key3];
        if (!target[toResolveWithKey])
          target[toResolveWithKey] = this;
      });
    };
    this.remove = (from2, to) => {
      const fromInfo = this.#getPathInfo(from2);
      const toInfo = this.#getPathInfo(to);
      const path2 = [fromInfo.absolute.value, toInfo.absolute.value];
      const toRemove = [
        { ref: this.active, path: path2 },
        { ref: this.globals.active, path: path2, unlisten: true }
      ];
      toRemove.forEach((o) => {
        const { ref, path: path3, unlisten } = o;
        let base2 = ref[path3[0]];
        if (typeof base2 === "object") {
          delete base2[path3[1]];
          if (Object.keys(base2).length === 0) {
            delete ref[path3[0]];
            const sub = base2[subscriptionKey];
            if (unlisten && sub) {
              this.context.monitor.remove(sub);
            }
            delete base2[subscriptionKey];
          }
        } else
          delete ref[path3[0]];
      });
    };
    this.clear = (name9) => {
      const value2 = this.#getAbsolutePath(name9);
      Object.keys(this.active).forEach((from2) => {
        Object.keys(this.active[from2]).forEach((to) => {
          if (!value2 || from2.slice(0, value2.length) === value2 || to.slice(0, value2.length) === value2)
            this.remove(from2, to);
        });
      });
    };
    this.has = (from2, ref = this.active) => !!ref[from2];
    this.get = (from2, ref = this.active) => ref[from2];
    this.activate = (from2, update) => {
      this.context.options.listen?.(from2, update);
      const listenerGroups = [{
        info: this.get(from2, this.globals.active),
        name: from2
      }];
      listenerGroups.forEach((group) => {
        const info2 = group.info;
        if (info2) {
          if (info2[listenerObject]) {
            const tic = performance.now();
            this.pass(from2, {
              value: info2.value,
              parent: this.active,
              key: group.name,
              subscription: info2.subscription,
              __value: true
            }, update);
            const toc = performance.now();
            globalThis.escomposePerformance.listeners.resolve.push(toc - tic);
          } else if (typeof info2 === "object") {
            const tic = performance.now();
            for (let key3 in info2) {
              this.pass(from2, {
                parent: info2,
                key: key3,
                subscription: info2[key3].subscription,
                value: info2[key3].value
              }, update);
              const toc = performance.now();
              globalThis.escomposePerformance.listeners.resolve.push(toc - tic);
            }
          } else
            console.error("Improperly Formatted Listener", info2);
        }
      });
    };
    this.pass = (from2, target, update) => {
      const id = this.context.id;
      const isValue = target?.__value;
      let parent = target.parent;
      let to = target.key;
      const info2 = target.parent[to];
      target = info2.value;
      let config = info2?.[configKey];
      let ogValue = target;
      const type = typeof target;
      const checkIfSetter = (path2, willSet) => {
        const info3 = this.context.monitor.get(path2, "info");
        if (info3.exists) {
          const val = info3.value;
          const noDefault = typeof val !== "function" && !val?.default;
          const value2 = noDefault ? toSet : val;
          const res = { value: value2, bound: info3.parent };
          if (willSet) {
            target = res.value;
            parent[to] = res;
          }
          return res;
        } else
          return { value: void 0 };
      };
      const transform = (willSet) => {
        const fullPath = [id];
        fullPath.push(...to.split(keySeparator));
        return checkIfSetter(fullPath, willSet);
      };
      const getPathArray = (latest) => {
        const path2 = [id];
        const topPath = [];
        if (this.rootPath)
          topPath.push(...this.rootPath.split(keySeparator));
        topPath.push(...latest.split(keySeparator));
        path2.push(...topPath);
        return path2;
      };
      if (typeof target === "boolean") {
        if (!isValue)
          transform(true);
        else
          console.error(`Cannot use a boolean for ${specialKeys2.listeners.value}...`);
      } else if (type === "string") {
        const path2 = getPathArray(ogValue);
        checkIfSetter(path2, true);
        if (isValue) {
          parent[to] = { [ogValue]: parent[to] };
          to = ogValue;
        }
      } else if (target && type === "object") {
        const isConfig = isConfigObject(ogValue);
        if (isConfig) {
          if ("value" in ogValue) {
            if (isValue) {
              target = parent[to] = ogValue.value;
            } else {
              target = parent[to].value = ogValue.value;
            }
          } else
            transform(true);
          if (ogValue) {
            if (ogValue)
              config = ogValue;
          }
          Object.defineProperty(parent[to], configKey, { value: config });
        }
      }
      let isValidInput = true;
      if (config) {
        const bindKey = specialKeys2.listeners.value;
        if (bindKey in config) {
          const path2 = getPathArray(config[bindKey].original ?? config[bindKey]);
          if (typeof config[bindKey] === "string") {
            const res = this.context.monitor.get(path2);
            if (!res)
              target = `because ${path2.slice(1).join(keySeparator)} does not point correctly to an existing component.`;
            else {
              config[bindKey] = {
                value: res,
                original: config[bindKey]
              };
            }
          } else if (!config[bindKey].value.__parent) {
            target = `because ${config[bindKey].original ?? id.toString()} has become unparented.`;
          }
        } else {
          const branchKey = specialKeys2.listeners.branch;
          const formatKey = specialKeys2.listeners.format;
          if (branchKey in config) {
            const isValid = config[branchKey].find((o) => {
              let localValid = [];
              if ("if" in o)
                localValid.push(o.if(update));
              if ("is" in o)
                localValid.push(o.is === update);
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
          if (formatKey in config) {
            try {
              update = config[formatKey](update);
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
          parentPath.push(...to.split(keySeparator));
          const idx = parentPath.pop();
          const info3 = this.context.monitor.get(parentPath, "info");
          if (info3.value)
            info3.value[idx] = update;
          else
            console.error(`Cannot set value on ${parentPath.filter((str) => typeof str !== "symbol").join(keySeparator)} from ${from2}`);
        } else if (target?.default) {
          target.default.call(target, ...arrayUpdate);
        } else if (typeof target === "function") {
          const boundTo = config?.[specialKeys2.listeners.bind]?.value ?? info2.bound ?? this.context.instance;
          if (boundTo)
            target.call(boundTo, ...arrayUpdate);
          else
            target(...arrayUpdate);
        } else {
          let baseMessage = to ? `listener: ${from2} \u2014> ${to}` : `listener from ${from2}`;
          if (parent) {
            console.warn(`Deleting ${baseMessage}`, target);
            delete parent[to];
          } else
            console.error(`Failed to add ${baseMessage}`, target);
        }
      }
    };
    if (listeners2 || root || context)
      this.setInitialProperties(listeners2, root, context);
  }
  #triggers;
  #queue;
  #toResolveWith;
  #initialize;
  #getAbsolutePath;
  #getPathInfo;
};
var edgelord_default = Edgelord;

// ../../packages/core/loaders/listeners/index.ts
var name3 = "listeners";
var required2 = false;
var properties5 = {
  dependents: [specialKeys.listeners.value]
};
var listenerLoader = (esc, options2) => {
  if (!options2.monitor)
    options2.monitor = new src_default(options2);
  const configuration = esc[specialKeys.isGraphScript];
  const manager = new edgelord_default();
  const listeners2 = esc[specialKeys.listeners.value];
  manager.setInitialProperties(listeners2, configuration.path, {
    id: configuration.root,
    monitor: options2.monitor,
    options: options2
  });
  Object.defineProperty(esc, specialKeys.listeners.value, {
    value: manager,
    enumerable: false,
    configurable: false,
    writable: false
  });
  return esc;
};
var listeners_default = listenerLoader;

// ../../packages/core/loaders/children/index.ts
var children_exports = {};
__export(children_exports, {
  default: () => children_default,
  name: () => name4,
  properties: () => properties6,
  required: () => required3
});
var name4 = "children";
var required3 = false;
var key = specialKeys.children;
var properties6 = {
  dependents: [key]
};
var childrenLoader = (esc) => {
  const val = esc[key];
  console.error("Add children loader!", val);
  Object.defineProperty(esc, key, {
    value: val,
    enumerable: false,
    configurable: false,
    writable: false
  });
  return esc;
};
var children_default = childrenLoader;

// ../../packages/core/index.ts
var monitor = new src_default();
var create = (config, overrides = {}, options2 = {}) => {
  const copy = deep(options2);
  copy.loaders = combineLoaders(copy.loaders, [listeners_exports2, children_exports]);
  const fullOptions = copy;
  const callbacks = {
    onRootCreated: (id, esc) => fullOptions.monitor.set(id, esc, fullOptions.listeners),
    onInstanceCreated: (absolutePath, esc) => {
      if (specialKeys.trigger in esc) {
        if (!Array.isArray(esc[specialKeys.trigger]))
          esc[specialKeys.trigger] = [];
        const args = esc[specialKeys.trigger];
        console.error("MUST TRIGGER");
        esc[specialKeys.listeners.value].onStart(() => esc.default(...args));
        delete esc[specialKeys.trigger];
      }
    },
    onInstanceReady: (absolutePath, esc) => esc[specialKeys.listeners.value].start()
  };
  const component2 = load(config, fullOptions.loaders, {
    overrides,
    opts: fullOptions,
    callbacks,
    waitForChildren: false
  });
  return resolve(component2, (esc) => {
    const isArray = Array.isArray(esc);
    let arr = !isArray ? [esc] : esc;
    arr.map((esc2) => {
      if (esc2[specialKeys.parent] || esc2.__.path === "") {
        const configuration = esc2[specialKeys.isGraphScript];
        const hasStarted = configuration.start.value;
        if (hasStarted === false) {
          const onRun = configuration.start.run();
          return resolve(onRun, resolve2);
        }
      } else
        return esc2;
    });
    if (!isArray)
      return arr[0];
    else
      return arr;
  });
};
var core_default = create;
var resolve2 = resolve;
var merge2 = (objects2, updateOriginal) => {
  let base2 = objects2.shift();
  objects2.forEach((o) => base2 = merge(base2, o, updateOriginal));
  return base2;
};

// ../../packages/escode-compose-loader/index.ts
var escode_compose_loader_exports = {};
__export(escode_compose_loader_exports, {
  behavior: () => behavior,
  default: () => escode_compose_loader_default,
  name: () => name5,
  properties: () => properties7
});

// ../../packages/escode-compose-loader/compile/wasm.ts
var fetchAndInstantiateTask = async (uri, importObject) => {
  const wasmArrayBuffer = await fetch(uri).then((response) => response.arrayBuffer());
  return WebAssembly.instantiate(wasmArrayBuffer, importObject);
};
var load2 = async (uri, importObject) => {
  if (!importObject)
    importObject = { env: { abort: () => console.log("Abort!") } };
  if (WebAssembly.instantiateStreaming)
    return await WebAssembly.instantiateStreaming(fetch(uri), importObject);
  else
    return await fetchAndInstantiateTask(uri, importObject);
};
var wasm_default = load2;

// ../../packages/escode-compose-loader/compile/index.ts
var catchError = (o, e) => {
  if (o[specialKeys.reference]) {
    console.warn("[escode]: Falling back to ES Component reference...", e);
    return o[specialKeys.reference];
  } else
    return createErrorComponent(e.message);
};
var genericErrorMessage = `Cannot transform ${specialKeys.compose} string without a compose utility function`;
function compile(o, opts) {
  let uri = typeof o === "string" ? o : o[specialKeys.uri];
  if (uri && uri.slice(-5) === ".wasm") {
    let relTo = o.relativeTo ?? opts?.relativeTo ?? window.location.href;
    if (relTo.slice(-1)[0] !== "/")
      relTo += "/";
    const absoluteURI = new URL(uri, relTo).href;
    return new Promise(async (resolve4) => {
      const info2 = await wasm_default(absoluteURI, o.importOptions);
      const copy = Object.assign({}, info2.instance.exports);
      for (let key3 in copy) {
        const val = copy[key3];
        if (val instanceof WebAssembly.Memory)
          copy[key3] = new Uint8Array(val.buffer);
        else if (val instanceof WebAssembly.Global) {
          Object.defineProperty(copy, key3, {
            get: () => val.value,
            set: (v) => val.value = v
          });
        }
      }
      resolve4(copy);
    });
  } else if (uri && opts.utilities) {
    const bundleOpts = opts.utilities.bundle;
    const gotBundleOpts = bundleOpts && typeof bundleOpts.function === "function";
    const compileOpts = opts.utilities.compile;
    const gotCompileOpts = compileOpts && typeof compileOpts.function === "function";
    if (!gotBundleOpts && !gotCompileOpts)
      o = catchError(o, new Error(genericErrorMessage));
    else {
      return new Promise(async (resolve4) => {
        try {
          if (gotBundleOpts) {
            const options2 = bundleOpts.options ?? {};
            if (!options2.bundler)
              options2.bundler = "datauri";
            if (!options2.bundle)
              options2.collection = "global";
            if (!options2.relativeTo)
              options2.relativeTo = opts.relativeTo ?? ".";
            const bundle = bundleOpts.function(uri, options2);
            await bundle.compile();
            o = Object.assign({}, bundle.result);
          } else if (gotCompileOpts) {
            const options2 = compileOpts.options ?? {};
            if (!options2.relativeTo)
              options2.relativeTo = opts.relativeTo ?? ".";
            const resolved = await compileOpts.function(o, options2);
            o = resolved;
          } else {
            throw new Error(genericErrorMessage);
          }
        } catch (e) {
          o = catchError(o, e);
        }
        resolve4(deep(o));
      });
    }
  }
  return deep(o[specialKeys.reference] ?? o);
}
function createErrorComponent(message) {
  return {
    [specialKeys.element]: "p",
    b: {
      [specialKeys.element]: "b",
      [specialKeys.attributes]: {
        innerText: "Error: "
      }
    },
    span: {
      [specialKeys.element]: "span",
      [specialKeys.attributes]: {
        innerText: message
      }
    }
  };
}

// ../../packages/escode-compose-loader/index.ts
var name5 = "compose";
var localSpecialKeys = {
  compose: specialKeys.compose,
  apply: specialKeys.apply,
  bundle: esSourceKey
};
var behavior = "load";
var properties7 = {
  dependents: Object.values(localSpecialKeys)
};
var isPathString = (value2) => typeof value2 === "string" && (value2.includes("/") || value2.includes("."));
function compose2(o, opts, updateOriginal = false) {
  o = compileAndMerge(o, o[localSpecialKeys.compose], opts, true, updateOriginal);
  return resolve(o, (o2) => {
    const toApply = o2[localSpecialKeys.apply];
    const toApplyFlag = toApply && (typeof toApply === "object" || isPathString(toApply));
    o2 = toApplyFlag ? compileAndMerge(o2, toApply, opts, false, updateOriginal) : o2;
    return resolve(o2);
  });
}
var escode_compose_loader_default = compose2;
function compileAndMerge(properties13, composition = {}, opts = {}, flipPrecedence = false, updateOriginal = false) {
  if (!Array.isArray(composition))
    composition = [composition];
  let promise = resolve(composition.map((o) => {
    const compiled = compile(o, opts);
    const checkAndPushTo = (target, acc = [], forcePush = true) => {
      if (Array.isArray(target))
        target.forEach((o2) => checkAndPushTo(o2, acc), true);
      else if (target[localSpecialKeys.compose]) {
        acc.push(target);
        const val = target[localSpecialKeys.compose];
        delete target[localSpecialKeys.compose];
        const newTarget = resolve(compile(val, opts));
        checkAndPushTo(newTarget, acc);
      } else if (forcePush)
        acc.push(target);
      return acc;
    };
    return resolve(compiled, (compiled2) => checkAndPushTo(compiled2));
  }));
  return resolve(promise, (composition2) => {
    const flat = composition2.flat();
    let composed = {};
    flat.forEach((toCompose) => composed = merge(composed, toCompose, false, false));
    return merge(properties13, composed, updateOriginal, flipPrecedence);
  });
}

// ../../packages/escode-dom-loader/index.ts
var escode_dom_loader_exports = {};
__export(escode_dom_loader_exports, {
  default: () => create3,
  name: () => name6,
  properties: () => properties10,
  required: () => required4
});

// ../../packages/escode-dom-loader/escode-define-loader/index.ts
var properties8 = {
  dependents: [specialKeys.webcomponents],
  dependencies: [specialKeys.element, specialKeys.component, specialKeys.parent]
};
var escode_define_loader_default = (esc) => {
  let registry2 = esc[specialKeys.webcomponents] ?? {};
  for (let key3 in registry2) {
    const model2 = registry2[key3];
    const config = model2[specialKeys.element];
    if (config.name && config.extends)
      define2(config, esc, model2);
  }
  return esc;
};
var registry = {};
if (!isNode) {
  const ogCreateElement = document.createElement;
  document.createElement = function(name9, options2) {
    const info2 = registry[name9];
    const created = info2 && !info2.autonomous ? ogCreateElement.call(this, info2.tag, { is: name9 }) : ogCreateElement.call(this, name9, options2);
    return created;
  };
}
var tagToClassMap = {
  li: "LI",
  ol: "OL",
  ul: "UL",
  br: "BR",
  p: "Paragraph",
  textarea: "TextArea",
  a: "Anchor"
};
var isAutonomous = false;
var define2 = (config, esc, model2 = esc) => {
  if (!registry[config.name]) {
    const copy = deep(model2);
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
      constructor(properties13) {
        super(properties13);
        copy[specialKeys.element] = this;
        esc[specialKeys.isGraphScript].create(copy);
      }
      connectedCallback() {
        const component2 = this[specialKeys.component];
        const parent = component2[specialKeys.parent];
        component2[specialKeys.parent] = parent;
      }
      disconnectedCallback() {
        console.log("Custom element removed from page.");
      }
      adoptedCallback() {
        console.log("Custom element moved to new page.");
      }
      attributeChangedCallback(name9, oldValue, newValue) {
        console.log("Custom element attributes changed.", name9, oldValue, newValue);
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

// ../../packages/escode-dom-loader/escode-element-loader/index.ts
var createSVG = (name9 = "svg", options2) => document.createElementNS("http://www.w3.org/2000/svg", name9, options2);
function checkESCompose(__compose) {
  if (!__compose)
    return false;
  const isArr = Array.isArray(__compose);
  return isArr ? !__compose.reduce((a, b) => a * (checkForInternalElements(b) ? 0 : 1), true) : checkForInternalElements(__compose);
}
function checkForInternalElements(esc) {
  if (esc.__element || checkESCompose(esc.__compose))
    return true;
  else if (esc.__)
    return check(esc.__.components);
}
function check(components) {
  return Array.from(components.values()).find((esc) => {
    if (checkForInternalElements(esc))
      return true;
  });
}
var createElement = (args, parent) => {
  if (args[0] === "svg" || parent && parent.__element instanceof SVGElement)
    return createSVG(...args);
  else
    return document.createElement(...args);
};
var properties9 = {
  dependents: [
    specialKeys.element,
    specialKeys.attributes,
    specialKeys.resize,
    specialKeys.childPosition,
    specialKeys.editor,
    specialKeys.component,
    specialKeys.attribute,
    specialKeys.connected
  ],
  dependencies: [
    specialKeys.parent,
    specialKeys.isGraphScript,
    specialKeys.proxy
  ]
};
function create2(esm2, options2 = {}) {
  const configuration = esm2[specialKeys.isGraphScript];
  let states = configuration.states;
  let id = configuration.name;
  const parent = esm2[specialKeys.parent];
  let element = esm2[specialKeys.element];
  const attributes = esm2[specialKeys.attributes] ?? {};
  let info2;
  if (!(element instanceof Element)) {
    const mustShow = attributes && Object.keys(attributes).length || checkForInternalElements(esm2);
    const defaultTagName = mustShow ? "div" : "span";
    const isWebComponent = element && typeof element === "object" && element.name && element.extends;
    if (isWebComponent) {
      const esDefineInfo = element;
      const config = esm2[specialKeys.element];
      define2(config, esm2);
      esm2[specialKeys.element] = element = esDefineInfo.name;
    }
    if (element === void 0)
      element = defaultTagName;
    else if (Array.isArray(element))
      element = createElement(element, parent);
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
      element = createElement([element], parent);
    const noInput = Symbol("no input to the default function");
    if (!esm2.hasOwnProperty("default")) {
      esm2.default = function(input = noInput) {
        if (input !== noInput)
          this[specialKeys.element].innerText = input;
        return this[specialKeys.element];
      };
    }
  }
  if (!(element instanceof Element))
    throw new Error("Element not created for " + id);
  let intermediateStates = states || {};
  intermediateStates.element = element;
  intermediateStates.attributes = attributes;
  if (parent instanceof Element)
    intermediateStates.parentNode = parent;
  else
    intermediateStates.parentNode = parent?.[specialKeys.element] instanceof Element ? parent[specialKeys.element] : element.parentNode;
  intermediateStates.onresize = esm2[specialKeys.resize];
  intermediateStates.onresizeEventCallback = void 0;
  const finalStates = intermediateStates;
  if (typeof id !== "string")
    id = `${element.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
  if (!element.id)
    element.id = id;
  let isConnected;
  Object.defineProperty(esm2, `${specialKeys.connected}`, {
    value: new Promise((resolve4) => isConnected = async () => {
      configuration.connected = true;
      resolve4(true);
    })
  });
  configuration.connected = isConnected;
  const isEventListener = (key3, value2) => key3.slice(0, 2) === "on" && typeof value2 === "function";
  const handleAttribute = (key3, value2, context) => {
    if (!isEventListener(key3, value2) && typeof value2 === "function")
      return value2.call(context);
    else
      return value2;
  };
  const setAttributes = (attributes2) => {
    if (esm2[specialKeys.element] instanceof Element) {
      for (let key3 in attributes2) {
        if (key3 === "style") {
          for (let styleKey in attributes2.style)
            esm2[specialKeys.element].style[styleKey] = handleAttribute(key3, attributes2.style[styleKey], esm2);
        } else {
          const value2 = attributes2[key3];
          if (isEventListener(key3, value2)) {
            const func = value2;
            esm2[specialKeys.element][key3] = (...args) => {
              const context = esm2[specialKeys.proxy] ?? esm2;
              return func.call(context ?? esm2, ...args);
            };
          } else {
            const valueToSet = handleAttribute(key3, value2, esm2);
            esm2[specialKeys.element].setAttribute(key3, valueToSet);
            try {
              esm2[specialKeys.element][key3] = valueToSet;
            } catch (e) {
            }
            ;
          }
        }
      }
    }
  };
  Object.defineProperty(esm2, specialKeys.attributes, {
    get: () => finalStates.attributes,
    set: (value2) => {
      finalStates.attributes = value2;
      if (finalStates.attributes)
        setAttributes(finalStates.attributes);
    }
  });
  Object.defineProperty(esm2, specialKeys.element, {
    get: function() {
      if (finalStates.element instanceof Element)
        return finalStates.element;
    },
    set: function(v) {
      if (v instanceof HTMLElement) {
        if (finalStates.element !== v) {
          finalStates.element.insertAdjacentElement("afterend", v);
          finalStates.element.remove();
        }
        finalStates.element = v;
        const configuration2 = esm2[specialKeys.isGraphScript];
        if (configuration2) {
          const components = configuration2.components;
          for (let name9 in components) {
            const component2 = components[name9];
            if (component2 && component2[specialKeys.isGraphScript]) {
              resolve(component2, (res) => res[specialKeys.parent] = v);
            }
          }
        }
        setAttributes(finalStates.attributes);
      }
    }
  });
  const ogGet = configuration.parent.get;
  configuration.parent.get = () => {
    const fallback = ogGet();
    const parentNode = esm2[specialKeys.element].parentNode;
    if (parentNode) {
      const isComponent = parentNode.hasAttribute(specialKeys.attribute);
      if (isComponent)
        return parentNode[specialKeys.component];
      else
        return { [specialKeys.element]: parentNode };
    } else
      return fallback;
  };
  configuration.parent.add(function(v) {
    if (typeof v === "string") {
      const newValue = document.querySelector(v);
      if (newValue)
        v = newValue;
      else
        v = document.getElementById(v);
    }
    if (v?.[specialKeys.element] instanceof Element)
      v = v[specialKeys.element];
    const current = this[specialKeys.element].parentNode;
    if (current !== v) {
      if (this[specialKeys.element] instanceof Element) {
        if (current)
          this[specialKeys.element].remove();
        if (v instanceof Element) {
          const desiredPosition = this[specialKeys.childPosition];
          let ref = this[specialKeys.element];
          const __editor = configuration.editor;
          if (__editor)
            ref = __editor;
          const length = v.children.length;
          if (!length || typeof desiredPosition !== "number")
            v.appendChild(ref);
          else {
            const before = [...v.children].slice(0, desiredPosition);
            let toCheck, inserted;
            while (before.length) {
              toCheck = before.pop();
              const beforeComponent = toCheck[specialKeys.component];
              const beforedDesiredPosition = beforeComponent[specialKeys.childPosition];
              if (typeof beforedDesiredPosition === "number") {
                const location = beforedDesiredPosition > desiredPosition ? "beforebegin" : "afterend";
                toCheck.insertAdjacentElement(location, ref);
                inserted = true;
                break;
              }
            }
            if (!inserted)
              v.insertAdjacentElement("afterbegin", ref);
          }
          if (__editor)
            __editor.setComponent(this);
        }
      } else {
        console.error("No element was created for this Component...", this);
      }
    }
  });
  let onresize = esm2[specialKeys.resize];
  Object.defineProperty(esm2, specialKeys.resize, {
    get: function() {
      return onresize;
    },
    set: function(foo) {
      finalStates.onresize = foo;
      if (finalStates.onresizeEventCallback)
        window.removeEventListener("resize", finalStates.onresizeEventCallback);
      if (finalStates.onresize) {
        finalStates.onresizeEventCallback = (ev) => {
          if (finalStates.onresize && esm2[specialKeys.element] instanceof Element) {
            const context = esm2[specialKeys.proxy] ?? esm2;
            return foo.call(context, ev);
          }
        };
        window.addEventListener("resize", finalStates.onresizeEventCallback);
      }
    }
  });
  const utilities = options2?.utilities;
  if (utilities && esm2[specialKeys.editor]) {
    let config = esm2[specialKeys.editor];
    let cls = utilities.code?.class;
    if (!cls) {
      if (typeof config === "function")
        cls = config;
      else
        console.error("Editor class not provided in options.utilities.code");
    }
    if (cls) {
      let options3 = utilities.code?.options ?? {};
      options3 = typeof config === "boolean" ? options3 : { ...options3, ...config };
      const bound = options3.bind;
      const __editor = new cls(options3);
      __editor.start();
      configuration.editor = __editor;
      if (bound !== void 0) {
        let boundESM = esm2;
        const configuration2 = esm2[specialKeys.isGraphScript];
        bound.split("/").forEach((str) => {
          if (str === "..")
            boundESM = boundESM[specialKeys.isGraphScript].states.parentNode[specialKeys.component];
          else if (str === ".")
            return;
          else
            boundESM = boundESM[str];
        });
        if (!configuration2.boundEditors)
          configuration2.boundEditors = [__editor];
        else
          configuration2.boundEditors.push(__editor);
      }
    }
  }
  esm2[specialKeys.element][specialKeys.component] = esm2;
  esm2[specialKeys.element].setAttribute(specialKeys.attribute, "");
  esm2[specialKeys.element] = esm2[specialKeys.element];
  configuration.start.add(() => {
    esm2[specialKeys.resize] = finalStates.onresize;
  }, "before");
  configuration.stop.add(() => {
    esm2[specialKeys.element].remove();
    const privateEditorKey = `${specialKeys.editor}Attached`;
    if (esm2[privateEditorKey])
      esm2[privateEditorKey].remove();
  });
  return esm2;
}

// ../../packages/escode-dom-loader/index.ts
var name6 = "dom";
var required4 = true;
var dependents = /* @__PURE__ */ new Set([
  ...properties9.dependents,
  ...properties8.dependents
]);
var dependencies = /* @__PURE__ */ new Set([
  ...properties9.dependencies,
  ...properties8.dependencies
]);
dependencies.delete(specialKeys.element);
var properties10 = {
  dependents: Array.from(dependents),
  dependencies: Array.from(dependencies)
};
function create3(esm2, options2 = {}) {
  const el = create2(esm2, options2);
  const defined = escode_define_loader_default(el);
  return defined;
}

// ../../packages/escode-start-loader/index.ts
var escode_start_loader_exports = {};
__export(escode_start_loader_exports, {
  default: () => escode_start_loader_default,
  name: () => name7,
  properties: () => properties11,
  required: () => required5
});
var name7 = "start";
var required5 = true;
var properties11 = {
  dependents: [
    specialKeys.source
  ],
  dependencies: [
    esSourceKey,
    specialKeys.isGraphScript,
    specialKeys.editor,
    specialKeys.parent,
    specialKeys.proxy,
    specialKeys.connected,
    specialKeys.promise,
    specialKeys.resolved
  ]
};
var escode_start_loader_default = (esc) => {
  esc[specialKeys.isGraphScript].start.add(() => start(esc));
};
var set2 = (esm2, value2) => esm2[specialKeys.isGraphScript].start.value = value2;
function start(esc, callbacks = [], asyncCallback) {
  asyncConnect.call(esc, asyncCallback);
  let output = connect.call(esc, callbacks);
  set2(esc, true);
  return output;
}
async function asyncConnect(onReadyCallback) {
  const configuration = this[specialKeys.isGraphScript];
  await this[specialKeys.connected];
  configuration.connected = true;
  const boundEditors = configuration.boundEditors;
  if (boundEditors)
    boundEditors.forEach((editor) => editor.setComponent(this));
  if (onReadyCallback)
    await onReadyCallback();
  return this;
}
function connect(callbacks = []) {
  const configuration = this[specialKeys.isGraphScript];
  const parentConfiguration = this[specialKeys.parent]?.[specialKeys.isGraphScript];
  const __editor = parentConfiguration?.editor;
  if (__editor)
    configuration.editor = __editor;
  let source = this[esSourceKey];
  if (source) {
    if (typeof source === "function")
      source = this[specialKeys.source] = source();
    delete this[esSourceKey];
    const path2 = this[specialKeys.isGraphScript].path;
    if (configuration.editor)
      configuration.editor.addFile(path2, source);
  }
  callbacks.forEach((f) => f.call(this));
  return this;
}

// ../../packages/escode-animation-loader/index.ts
var escode_animation_loader_exports = {};
__export(escode_animation_loader_exports, {
  default: () => animate,
  name: () => name8,
  properties: () => properties12
});
var animations = {};
var name8 = "animation";
var key2 = specialKeys.animate;
var properties12 = {
  dependents: [specialKeys.animate]
};
function animate(esc) {
  if (esc[key2]) {
    let original = esc[key2];
    const id = Math.random();
    const interval = typeof original === "number" ? original : "global";
    let startFunction;
    if (!animations[interval]) {
      const info2 = animations[interval] = { objects: { [id]: esc } };
      const objects2 = info2.objects;
      const runFuncs = () => {
        for (let key3 in objects2)
          objects2[key3].default();
      };
      if (interval === "global") {
        const callback = () => {
          runFuncs();
          info2.id = window.requestAnimationFrame(callback);
        };
        startFunction = callback;
        animations[interval].stop = () => {
          window.cancelAnimationFrame(info2.id);
          info2.cancel = true;
        };
      } else {
        startFunction = () => {
          runFuncs();
          info2.id = setInterval(() => runFuncs(), 1e3 / interval);
        };
        animations[interval].stop = () => clearInterval(info2.id);
      }
    } else {
      startFunction = () => {
        esc.default();
        animations[interval].objects[id] = esc;
      };
    }
    esc[specialKeys.isGraphScript].start.add(startFunction);
    esc[specialKeys.isGraphScript].stop.add(() => {
      delete animations[interval].objects[id];
      esc[key2] = original;
      if (Object.keys(animations[interval].objects).length === 0) {
        animations[interval].stop();
        delete animations[interval];
      }
    });
  }
}

// ../../packages/escode/index.ts
var standardLoaders = [];
standardLoaders.push(escode_compose_loader_exports);
if (!isNode)
  standardLoaders.push(escode_dom_loader_exports);
standardLoaders.push(escode_start_loader_exports);
standardLoaders.push(escode_animation_loader_exports);
var create4 = (config, overrides, options2 = {}) => {
  if (options2.loaders)
    options2.loaders = Array.from(/* @__PURE__ */ new Set([...options2.loaders, ...standardLoaders]));
  else
    options2.loaders = standardLoaders;
  return create(config, overrides, options2);
};
var escode_default = create4;

// ../../packages/esmpile/src/utils/mimeTypes.js
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

// ../../packages/esmpile/src/utils/defaults.js
var defaults_default = {
  nodeModules: {
    nodeModules: "node_modules",
    relativeTo: "./"
  }
};

// ../../packages/esmpile/src/utils/path.js
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

// ../../packages/esmpile/src/utils/nodeModules.js
var path = (opts) => {
  const nodeModules = opts.nodeModules ?? defaults_default.nodeModules.nodeModules;
  const relativeTo = opts.relativeTo ?? defaults_default.nodeModules.relativeTo;
  return get4(nodeModules, relativeTo);
};
var resolve3 = async (uri, opts) => {
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
  handler: resolve3
};

// ../../packages/esmpile/src/utils/transformations.js
var extensionTransformations = ["ts", "js"];
var allTransformations = [null, ...extensionTransformations, transformation];
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
      return [transformation, uri, ...mapped];
    else
      return [uri, ...mapped, transformation];
  } else if (abs)
    return [...allTransformations].reverse();
  else if (noExt)
    return [...allTransformations];
  else
    return [];
};

// ../../packages/esmpile/src/utils/errors.js
var middle = "was not resolved locally. You can provide a direct reference to use in";
var create5 = (uri, key3 = uri) => new Error(`${uri} ${middle} options.filesystem._fallbacks['${key3}'].`);

// ../../packages/esmpile/src/utils/handlers.js
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
  if (!transformation3)
    return path2;
  const type = typeof transformation3;
  if (type === "string" && (!force || force === "string")) {
    return noExtension(path2, transformation3);
  } else if (type === "object" && (!force || force === "object")) {
    if (transformation3.extension)
      path2 = noExtension(path2, transformation3.extension);
    return await transformation3.handler(path2, opts).catch((e) => {
      throw create5(path2, noBase(path2, opts));
    });
  }
};

// ../../packages/esmpile/src/utils/request.js
var getURL = (path2) => {
  let url2;
  try {
    url2 = new URL(path2).href;
  } catch {
    url2 = get4(path2, globalThis.location.href);
  }
  return url2;
};
var handleFetch = async (path2, options2 = {}) => {
  if (!options2.fetch)
    options2.fetch = {};
  if (!options2.fetch.mode)
    options2.fetch.mode = "cors";
  const url2 = getURL(path2);
  const progressCallback = options2?.callbacks?.progress?.fetch;
  const info2 = await fetchRemote(url2, options2, {
    path: path2,
    progress: progressCallback
  });
  if (!info2.buffer)
    throw new Error("No response received.");
  const type = info2.type.split(";")[0];
  return {
    ...info2,
    url: url2,
    type
  };
};
var fetchRemote = async (url2, options2 = {}, additionalArgs) => {
  const path2 = additionalArgs.path ?? url2;
  const pathId2 = get4(noBase(path2, options2));
  const response = await globalThis.fetch(url2, options2.fetch);
  let bytesReceived = 0;
  let buffer = [];
  let bytes = 0;
  const hasProgressFunction = typeof additionalArgs.progress === "function";
  const info2 = await new Promise(async (resolve4) => {
    if (response) {
      bytes = parseInt(response.headers.get("Content-Length"), 10);
      const type = response.headers.get("Content-Type");
      if (globalThis.REMOTEESM_NODE) {
        const buffer2 = await response.arrayBuffer();
        resolve4({ buffer: buffer2, type });
      } else {
        const reader = response.body.getReader();
        const processBuffer = async ({ done, value: value2 }) => {
          if (done) {
            const config = {};
            if (typeof type === "string")
              config.type = type;
            const blob = new Blob(buffer, config);
            const ab = await blob.arrayBuffer();
            resolve4({ buffer: new Uint8Array(ab), type });
            return;
          }
          bytesReceived += value2.length;
          const chunk = value2;
          buffer.push(chunk);
          if (hasProgressFunction)
            additionalArgs.progress(pathId2, bytesReceived, bytes, null, null, response.headers.get("Range"));
          return reader.read().then(processBuffer);
        };
        reader.read().then(processBuffer);
      }
    } else {
      console.warn("Response not received!", options2.headers);
      resolve4(void 0);
    }
  });
  const output = {
    response,
    ...info2
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

// ../../packages/esmpile/src/utils/response.js
var enc = new TextDecoder("utf-8");
var get6 = async (uri, opts, expectedType) => {
  const info2 = { uri, text: { original: "", updated: "" }, buffer: null };
  if (globalThis.REMOTEESM_NODE) {
    const absPath = uri.replace("file://", "");
    info2.buffer = globalThis.fs.readFileSync(absPath);
    info2.text.original = info2.text.updated = enc.decode(info2.buffer);
  } else {
    const fetchInfo = await handleFetch(uri, opts);
    const response = fetchInfo.response;
    info2.response = response;
    if (response.ok) {
      if (expectedType) {
        const mimeType = response.headers.get("Content-Type");
        if (!mimeType.includes(expectedType))
          throw new Error(`Expected Content Type ${expectedType} but received ${mimeType} for  ${uri}`);
      }
      info2.buffer = fetchInfo.buffer;
      info2.text.original = info2.text.updated = enc.decode(info2.buffer);
    } else {
      throw new Error(response.statusText);
    }
  }
  return info2;
};
var find2 = async (uri, opts, callback) => {
  const transArray = get5(uri);
  let response;
  if (transArray.length > 0) {
    do {
      const ext = transArray.shift();
      const name9 = ext?.name ?? ext;
      const warning = (e) => {
        if (opts.debug)
          console.error(`Import using ${name9 ?? ext} transformation failed for ${uri}`);
      };
      const transformed = await transformation2(uri, ext, opts);
      const correctURI = get4(transformed, opts.relativeTo);
      const expectedType = ext ? null : "application/javascript";
      response = await callback(correctURI, opts, expectedType).then((res) => {
        if (opts.debug)
          console.warn(`Import using ${name9 ?? ext} transformation succeeded for ${uri}`);
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
  const info2 = {};
  await find2(uri, opts, async (transformed) => {
    info2.uri = transformed;
    info2.result = await (isJSON ? import(transformed, { assert: { type: "json" } }) : import(transformed));
  });
  return info2;
};
var findText = async (uri, opts) => await find2(uri, opts, get6);

// ../../packages/esmpile/src/utils/sourceMap.js
var sourceReg = /\/\/# sourceMappingURL=(.*\.map)/;
var get7 = async (uri, opts, text, evaluate = true) => {
  if (!text) {
    const info2 = await get6(uri, opts);
    text = info2.text.original;
  }
  if (text) {
    const srcMap = text.match(sourceReg);
    if (srcMap) {
      const getMap = async () => {
        const loc = get4(srcMap[1], uri);
        let info2 = await get6(loc, opts);
        let newText = info2.text.original;
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

// ../../packages/esmpile/src/utils/load.js
var script = async (uri, names = []) => {
  return await new Promise((resolve4, reject) => {
    const script2 = document.createElement("script");
    let r = false;
    script2.onload = script2.onreadystatechange = function() {
      if (!r && (!this.readyState || this.readyState == "complete")) {
        r = true;
        let name9 = names.find((name10) => window[name10]);
        resolve4(name9 ? window[name9] : window);
      }
    };
    script2.onerror = reject;
    script2.src = uri;
    document.body.insertAdjacentElement("beforeend", script2);
  });
};

// ../../packages/esmpile/src/Bundle.js
var Bundle_exports = {};
__export(Bundle_exports, {
  default: () => Bundle,
  get: () => get11
});

// ../../packages/esmpile/src/utils/encode/index.js
var encode_exports = {};
__export(encode_exports, {
  datauri: () => datauri,
  objecturl: () => objecturl
});

// ../../packages/esmpile/src/utils/encode/datauri.js
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

// ../../packages/esmpile/src/utils/encode/objecturl.js
function get9(input, mimeType = js) {
  if (typeof input === "string")
    input = new TextEncoder().encode(input);
  const blob = new Blob([input], { type: mimeType });
  return URL.createObjectURL(blob);
}

// ../../packages/esmpile/src/utils/encode/index.js
var datauri = async (...args) => await get10(get8, ...args);
var objecturl = async (...args) => await get10(get9, ...args);
var importEncoded = async (uri, isJSON) => await (isJSON ? import(uri, { assert: { type: "json" } }) : import(uri)).catch((e) => {
  throw e;
});
var getNamesFromURI = (uri) => {
  const names = /* @__PURE__ */ new Set();
  const nodeName = uri.split("/node_modules/")[1].split("/")[0];
  if (nodeName)
    names.add(nodeName);
  const firstFilenameString = uri.split("/").slice(-1)[0].split(".")[0];
  if (firstFilenameString)
    names.add(firstFilenameString);
  return Array.from(names);
};
async function get10(encoder, input, uriForExtension, mimeType, names) {
  let encoded, module;
  if (!mimeType) {
    const pathExt = extension(uriForExtension);
    mimeType = get3(pathExt);
  }
  let isJSON = mimeType === "application/json";
  try {
    encoded = encoder(input, mimeType);
    module = await importEncoded(encoded, isJSON);
    const keys = Object.keys(module);
    if (keys.length === 0 || keys.length === 1 && keys.includes("__esmpileSourceBundle")) {
      if (!names)
        names = getNamesFromURI(uriForExtension);
      const name9 = names.find((name10) => globalThis[name10]);
      if (name9) {
        module = { default: globalThis[name9] };
        encoded = get10(encoder, `export default globalThis['${name9}']`, uriForExtension, mimeType, names);
      } else {
        console.warn(`Could not get global reference for ${uriForExtension} after failing to import using ESM import syntax.`);
      }
    }
  } catch (e) {
    encoded = encoder(input, mimeType, true);
    if (isJS(mimeType)) {
      if (!names)
        names = getNamesFromURI(uriForExtension);
      module = encoded = await catchFailedModule(encoded, e, names).catch((e2) => {
        throw e2;
      });
    } else
      module = encoded;
  }
  return {
    encoded,
    module
  };
}
async function catchFailedModule(uri, e, names) {
  if (e === true || e.message.includes("The string to be encoded contains characters outside of the Latin1 range.") || e.message.includes("Cannot set properties of undefined"))
    return await script(uri, names);
  else
    throw e;
}

// ../../packages/esmpile/src/utils/compile.js
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

// ../../packages/esmpile/src/utils/polyfills.js
var fetch2;
var fs;
var Blob2;
var isReady2 = new Promise(async (resolve4, reject) => {
  try {
    if (typeof process === "object") {
      if (!fetch2) {
        globalThis.REMOTEESM_NODE = true;
        fetch2 = globalThis.fetch = (await import("node-fetch")).default;
        if (typeof globalThis.fetch !== "function")
          globalThis.fetch = fetch2;
      }
      if (!fs)
        fs = globalThis.fs = (await import("fs")).default;
      if (!Blob2) {
        const buffer = (await import("node:buffer")).default;
        Blob2 = globalThis.Blob = buffer.Blob;
      }
      resolve4(true);
    } else
      resolve4(true);
  } catch (err) {
    reject(err);
  }
});
var ready = isReady2;

// ../../packages/esmpile/src/Bundle.js
if (!globalThis.REMOTEESM_BUNDLES)
  globalThis.REMOTEESM_BUNDLES = { global: {} };
var global = globalThis.REMOTEESM_BUNDLES.global;
var noEncoding = `No buffer or text to bundle for`;
var toWait = 1e4;
var waitedFor = (toWait / 1e3).toFixed(1);
var esSourceString = (bundle) => `
export const ${esSourceKey} = () => globalThis.REMOTEESM_BUNDLES["${bundle.collection}"]["${bundle.name}"];
`;
var re = /[^\n]*(?<![\/\/])(import)\s+([ \t]*(?:(?:\* (?:as .+))|(?:[^ \t\{\}]+[ \t]*,?)|(?:[ \t]*\{(?:[ \t]*[^ \t"'\{\}]+[ \t]*,?)+\}))[ \t]*)from[ \t]*(['"])([^'"\n]+)(?:['"])([ \t]*assert[ \t]*{[ \n\t]*type:[ \n\t]*(['"])([^'"\n]+)(?:['"])[\n\t]*})?;?/gm;
function get11(url2, opts = this.options) {
  const pathId2 = url2 ? pathId(url2, opts) : void 0;
  let ref = globalThis.REMOTEESM_BUNDLES[opts.collection];
  if (!ref)
    ref = globalThis.REMOTEESM_BUNDLES[opts.collection] = {};
  let bundle = ref[pathId2];
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
      }
      const isComplete = ["success", "failed"];
      if (isComplete.includes(entrypoint?.status)) {
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
  set name(name9) {
    if (name9 !== this.#name) {
      let collection = globalThis.REMOTEESM_BUNDLES[this.collection];
      if (collection) {
        if (global[this.name] === collection[this.name])
          delete global[this.name];
        delete collection[this.name];
      }
      this.#name = name9;
      let filename = name9.split("/").pop();
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
    let ref = globalThis.REMOTEESM_BUNDLES[collection];
    if (!ref)
      ref = globalThis.REMOTEESM_BUNDLES[collection] = {};
    if (this.name) {
      if (!ref[this.name])
        ref[this.name] = this;
      else if (ref[this.name] !== this)
        console.warn(`Trying to duplicate bundle in bundle ${collection} (${this.name})`, this.name);
    }
  }
  #text;
  #buffer;
  get text() {
    return this.#text ?? this.info.text.original;
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
  constructor(entrypoint, options2 = {}) {
    this.options = options2;
    this.url = entrypoint;
  }
  import = async () => {
    this.status = "importing";
    const info2 = await findModule(this.url, this.options);
    if (info2?.result)
      return info2.result;
    else
      this.status = "fallback";
  };
  get = get11;
  compile = async () => {
    this.status = "compiling";
    await ready;
    try {
      const info2 = await findText(this.url, this.options).catch((e) => {
        throw e;
      });
      try {
        if (info2) {
          this.info = info2;
          this.url = this.info.uri;
          this.buffer = this.info.buffer;
          await this.encoded;
        }
      } catch (e) {
        this.imports = {};
        const imports = [];
        const matches = Array.from(this.info.text.updated.matchAll(re));
        matches.forEach(([original, prefix, command, delimiters, path2]) => {
          if (path2) {
            const wildcard = !!command.match(/\*\s+as/);
            const variables = command.replace(/\*\s+as/, "").trim();
            const absolutePath = absolute(path2);
            let name9 = absolutePath ? path2 : get4(path2, this.url);
            const absNode = path(this.options);
            name9 = name9.replace(`${absNode}/`, "");
            const info3 = {
              name: name9,
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
            if (!this.imports[name9])
              this.imports[name9] = [];
            this.imports[name9].push(info3);
            imports.push(info3);
          }
        });
        this.derived.dependencies.resolved = 0;
        this.derived.dependencies.n = this.imports.length;
        const promises = imports.map(async (info3, i) => {
          await this.setImport(info3, i);
          this.derived.dependencies.resolved++;
        });
        await Promise.all(promises);
        this.text = this.info.text.updated;
      }
    } catch (e) {
      throw e;
    }
    await this.encoded;
    return this.result;
  };
  updateImport = (info2, encoded) => {
    if (encoded === info2.current.path)
      return;
    const { prefix, variables, wildcard, bundle } = info2;
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
    this.info.text.updated = this.info.text.updated.replace(info2.current.line, newImport);
    info2.current.line = newImport;
    info2.current.path = encoded;
  };
  setImport = async (info2) => {
    let path2 = info2.path;
    let correctPath = info2.name;
    const bundle = this.get(correctPath);
    info2.bundle = bundle;
    this.addDependency(bundle);
    if (!bundle.status) {
      const options2 = { output: {}, ...this.options };
      options2.output.text = true;
      const newBundle = await this.get(correctPath, options2);
      await newBundle.resolve(path2);
    } else {
      let done = false;
      setTimeout(() => {
        if (done)
          return;
        console.error(`Took too long (${waitedFor}s)...`, bundle.uri);
        bundle.promises.result.reject();
        bundle.promises.encoded.reject();
      }, toWait);
      await bundle.result;
      done = true;
    }
    const encoded = await bundle.encoded;
    this.updateImport(info2, encoded);
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
    const isText = type === "text";
    this.options._esmpile.lastBundle = type;
    this.promises.encoded.promise = new Promise(async (resolve4, reject) => {
      this.promises.encoded.resolve = resolve4;
      this.promises.encoded.reject = reject;
      try {
        let bufferOrText = isText ? this.info.text.updated : this.buffer;
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
        if (mimeType === js) {
          const srcStr = esSourceString(this);
          let text = bufferOrText;
          if (!isText)
            text = new TextDecoder().decode(bufferOrText);
          const update = !text.includes(srcStr);
          if (update) {
            text += srcStr;
            this.info.text.updated = text;
          }
          if (!isText)
            this.#buffer = bufferOrText = new TextEncoder().encode(text);
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
        resolve4(encoded);
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
    infoArr.forEach((info2) => this.updateImport(info2, encoding));
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
    this.result = this.promises.result.promise = new Promise(async (resolve4, reject) => {
      this.promises.result.reject = reject;
      this.promises.result.resolve = resolve4;
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
          if (e) {
            if (this.options.fetch?.signal?.aborted)
              throw e;
            else {
              const noBase2 = absolute(uri) ? noBase(uri, this.options, true) : noBase(this.url, this.options, true);
              console.warn(`Failed to fetch ${uri}. Checking filesystem references...`);
              const filesystemFallback = this.options.filesystem?._fallbacks?.[noBase2];
              if (filesystemFallback) {
                console.warn(`Got fallback reference (module only) for ${uri}.`);
                result = filesystemFallback;
                throw new Error("Fallbacks are broken...");
              } else {
                const middle2 = "was not resolved locally. You can provide a direct reference to use in";
                if (e.message.includes(middle2))
                  throw e;
                else
                  throw create5(uri, noBase2);
              }
            }
          }
        }
        await this.encoded;
        this.status = "success";
        this.notify(this);
        resolve4(result);
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

// index.esc.js
var index_esc_exports = {};
__export(index_esc_exports, {
  __attributes: () => __attributes,
  __element: () => __element,
  header: () => header,
  span: () => span
});
var __element = "button";
var __attributes = {
  onclick: () => {
    console.log("Current");
  }
};
var header = {
  __element: "b",
  __attributes: {
    innerText: "Workspace Result: "
  }
};
var span = {
  __element: "span"
};

// ../../packages/drafts/rules/Rule.ts
var Rule = class {
  constructor(component2 = {}, elements) {
    this.component = {};
    this.appliedTo = /* @__PURE__ */ new Set();
    this.elements = `[${specialKeys.attribute}]`;
    this.apply = (elements = this.elements) => {
      let arrayOfElements = [];
      if (typeof elements === "string")
        arrayOfElements = Array.from(document.body.querySelectorAll(this.elements));
      else if (typeof elements === "function")
        arrayOfElements = this.elements();
      else if (elements instanceof HTMLElement)
        arrayOfElements = [elements];
      else if (elements instanceof NodeList)
        arrayOfElements = Array.from(elements);
      escode_default(arrayOfElements, this.component);
      arrayOfElements.forEach((el) => this.appliedTo.add(el));
    };
    this.remove = () => {
      console.error("Cannot remove a Rule yet...");
    };
    if (component2)
      this.component = component2;
    if (elements)
      this.elements = elements === true ? `[${specialKeys.component}]` : elements;
    if (this.elements)
      this.apply(this.elements);
  }
};

// ../../demos/objects/index.ts
var objects_exports = {};
__export(objects_exports, {
  functions: () => functions3,
  messages: () => messages,
  one: () => one,
  operations: () => operations,
  start: () => start2,
  three: () => three,
  two: () => two
});
var messages = {
  one: "Hi",
  two: "Failed!",
  three: "Succeeded!"
};
var functions3 = {
  one: () => messages.one,
  two: () => messages.two,
  three: () => messages.three
};
functions3.three.__compose = true;
var one = {
  test: 1,
  active: false,
  testFunction: functions3.one
};
var two = {
  test: 2,
  active: true,
  success: false,
  testFunction: functions3.two
};
var three = {
  test: 3,
  active: true,
  success: true,
  testFunction: functions3.three
};
var proxy2;
var state = {};
var history = [];
var start2 = (isStatic = true) => {
  proxy2 = monitor.set("object", one, { static: isStatic });
  monitor.on("object", (path2, _, update) => {
    state[path2] = update;
    history.push({ path: path2, update });
  });
  return { proxy: proxy2, history, state };
};
var operations = [
  () => merge2([one, two], true),
  () => merge2([proxy2, three], true)
];

// ../../demos/graph/index.ts
var graph_exports = {};
__export(graph_exports, {
  history: () => history2,
  model: () => model,
  operations: () => operations2,
  start: () => start3,
  state: () => state2
});

// ../../demos/graph/nodes/nodeA.js
var nodeA_exports = {};
__export(nodeA_exports, {
  __: () => __,
  jump: () => jump,
  x: () => x,
  y: () => y
});

// ../../demos/utils.ts
var isNode3 = typeof process === "object";
var elId = `escomposeOperationsManagerLog`;
if (!isNode3) {
  const ol = document.createElement("ol");
  ol.id = elId;
  document.body.appendChild(ol);
  const style = document.createElement("style");
  style.innerText = `
        ol {
            position: absolute;
            top: 0;
            right: 0;
            font-size: small;
            margin: 0;
            padding: 0;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 10px;
            overflow: scroll;
            height: 100vh;
        }

        li {
            margin-left: 25px;
        }
    `;
  document.body.appendChild(style);
}
var log = {
  element: isNode3 ? void 0 : document.getElementById(elId),
  add: function(message) {
    if (this.element) {
      var li = document.createElement("li");
      li.innerText = message;
      this.element.appendChild(li);
    } else
      console.log(message);
  },
  addCommand: function(message) {
    console.log(`--------- ${message} ---------`);
    if (this.element) {
      var li = document.createElement("div");
      li.innerText = message;
      li.style.fontWeight = "bold";
      this.element.appendChild(li);
    }
  },
  addHeader: function(message) {
    console.log(`********* ${message} *********`);
    if (this.element) {
      var li = document.createElement("h3");
      li.innerText = message;
      this.element.appendChild(li);
    }
  }
};
var OperationsManager = class {
  constructor(config = {}) {
    this.operations = [];
    this.log = log;
    this.step = 0;
    this.#iterations = 0;
    this.started = false;
    this.returned = {};
    this.start = (...args) => {
      if (this.started) {
        console.warn("Already started...");
        return this.returned;
      } else {
        this.started = true;
        if (this.startFunction) {
          this.returned = this.startFunction.call(this, ...args);
          return this.returned;
        }
      }
    };
    this.runAll = () => {
      if (this.step === 0)
        this.next();
      let count = 0;
      while (this.step > 0) {
        count++;
        this.next();
      }
    };
    this.run = (command) => {
      if (!this.started)
        this.start();
      if (typeof command === "function")
        command = {
          function: command,
          name: command.name
        };
      if (command) {
        if (command.ignore)
          return;
        else {
          if (command.header)
            log.addHeader(command.header);
          if (command.name)
            log.addCommand(command.name);
          return command.function.call(this);
        }
      }
    };
    this.next = () => {
      const res = this.run(this.operations[this.step]);
      this.iterations++;
      return res;
    };
    this.set(config);
  }
  #iterations;
  get iterations() {
    return this.#iterations;
  }
  set iterations(val) {
    this.#iterations = val;
    this.step = this.#iterations % this.operations.length;
  }
  set(config = {}) {
    if ("start" in config)
      this.setStart(config.start);
    if ("operations" in config)
      this.setOperations(config.operations);
  }
  setStart(start4) {
    this.started = false;
    this.startFunction = start4;
  }
  setOperations(operations3 = []) {
    this.operations = operations3;
  }
};

// ../../demos/graph/nodes/nodeA.js
var __ = true;
var x = 5;
var y = 2;
var jump = () => {
  const message = `jump!`;
  log.add(message);
  return "jumped!";
};

// ../../demos/graph/nodes/nodeF.js
var nodeF_exports = {};
__export(nodeF_exports, {
  __onconnected: () => __onconnected,
  __ondisconnected: () => __ondisconnected,
  __props: () => __props
});
var __props = void 0;
var __onconnected = function(node) {
  this.innerHTML = "Test";
  this.style.backgroundColor = "green";
  document.body.appendChild(this.__props);
};
var __ondisconnected = function(node) {
  document.body.removeChild(this.__props);
};
if (!isNode3)
  __props = document.createElement("div");

// ../../demos/graph/tree.js
var nodeAInstance = Object.assign({}, nodeA_exports);
var shared = {
  value: 0
};
var value = 0;
function defaultFunction() {
  const originalType = typeof this.__.original;
  let name9 = this.__.name;
  if (typeof name9 === "symbol")
    name9 = "root";
  const message = `instanced node (${name9} ${originalType === "function" ? "class" : originalType}) called! ${this.shared.value} ${this.unshared.value}`;
  this.shared.value++;
  this.unshared.value++;
  this.value++;
  log.add(message);
}
var nodeClass = class {
  shared = shared;
  unshared = { value };
  value = 0;
  default = defaultFunction;
};
__publicField(nodeClass, "__", true);
var nodeClassInstance = new nodeClass();
var nodeD = (...args) => {
  return args.reduce((a, b) => a + b, 0);
};
var tree = {
  nodeA: nodeAInstance,
  nodeB: {
    __: true,
    x: 3,
    y: 4,
    nodeC: {
      z: 4,
      default: function(a) {
        this.z += a;
        const message = "nodeC operator: nodeC z prop added to";
        log.add(message);
        return this.z;
      }
    }
  },
  nodeD,
  nodeE: {
    __animate: 1,
    default: function() {
      const message = "looped";
      log.add(message);
      return true;
    }
  },
  nodeG: nodeClass,
  nodeH: nodeClass,
  nodeI: nodeClassInstance,
  __listeners: {
    "nodeD": function(res) {
      const message = "nodeD operator returned: " + res;
      log.add(message);
    },
    "nodeB.nodeC": function(op_result) {
      const message = "nodeA listener: nodeC operator returned:";
      log.add(message);
    },
    "nodeB.nodeC.z": function(newZ) {
      const message = "nodeA listener: nodeC z prop changed:";
      log.add(message);
    },
    "nodeA.jump": {
      "nodeE": true,
      "nodeB.x": true
    },
    "": {
      "nodeA.jump": function() {
        const message = "nodeC listener: nodeA ";
        log.add(message);
      }
    }
  }
};
if (!isNode3)
  tree.nodeF = nodeF_exports;
var tree_default = tree;

// ../../demos/graph/index.ts
var nodeAInstance2 = tree_default.nodeA;
var history2 = [];
var state2 = {};
var component;
var secondComponent;
var popped;
var options = {
  loaders: [escode_animation_loader_exports],
  listen: (path2, update) => {
    history2.push({ path: path2, update });
    state2[path2] = update;
  }
};
var model = tree_default;
function start3() {
  component = create(tree_default, {}, options);
  this.log.addHeader("Created component");
  console.log("Component:", component);
  setTimeout(() => {
    component.nodeE.__parent = null;
    this.log.addCommand("nodeE removed!");
  }, 5500);
}
var operations2 = [
  {
    name: 'component.run("nodeD")',
    function: () => {
      component.nodeD();
    }
  },
  {
    name: 'component.run("nodeG")',
    function: () => {
      component.nodeG.default();
      component.nodeH.default();
      component.nodeI.default();
      component.nodeG.default();
    }
  },
  {
    name: "nodeAInstance.x = 1",
    function: () => {
      nodeAInstance2.x = 1;
    }
  },
  {
    name: `component.get('nodeA').x = 2`,
    function: () => {
      component.nodeA.x = 2;
    }
  },
  {
    name: `component.get('nodeB').x += 1`,
    function: () => {
      component.nodeB.x += 1;
    }
  },
  {
    header: `Clear All Listeners`,
    ignore: true,
    function: () => {
      component.__listeners.clear();
    }
  },
  {
    name: `component.run('nodeB.nodeC', 4)`,
    function: () => {
      component.nodeB.nodeC.default(4);
    }
  },
  {
    name: `component.get('nodeB.nodeC').z += 1`,
    function: () => {
      component.nodeB.nodeC.z += 1;
    }
  },
  {
    name: `component.get('nodeA').jump()`,
    function: () => {
      component.nodeA.jump();
    }
  },
  {
    header: `Unsubscribe nodeB.nodeC from nodeA.jump`,
    ignore: true,
    function: () => {
      component.__listeners.unsubscribe("nodeB.nodeC", "nodeA.jump");
      component.__listeners.clear("nodeA.jump");
    }
  },
  {
    name: `component.run('nodeA.jump')`,
    ignore: true,
    function: () => {
      component.nodeA.jump();
    }
  },
  {
    header: `Resubscribe nodeB.nodeC from nodeA.jump`,
    ignore: true,
    function: () => {
      component.__listeners.subscribe("nodeB.nodeC", "nodeA.jump");
    }
  },
  {
    name: `component.run('nodeA.jump')`,
    ignore: true,
    function: () => {
      component.nodeA.jump();
    }
  },
  {
    header: "Create Second Component from First",
    function: function() {
      secondComponent = create({ tree: { component } }, void 0, options);
      console.log("Got component 2", secondComponent);
    }
  },
  {
    header: "Remove Node B",
    function: function() {
      popped = component.nodeB;
      component.nodeB.__parent = null;
      console.log(popped.__.path, "popped");
    }
  },
  {
    name: `component.get('nodeA').jump()`,
    function: () => {
      component.nodeA.jump();
    }
  },
  {
    header: "Reparent Node B to Second Component",
    ignore: false,
    function: () => {
      popped.__parent = secondComponent;
      console.log("Has Been Reparented", popped.__.root === secondComponent.__.root);
    }
  },
  {
    name: `popped.x += 1`,
    function: () => {
      popped.x += 1;
    }
  },
  {
    name: `popped.__children.nodeC.__operator(1)`,
    function: () => {
      popped.nodeC.default(1);
    }
  },
  {
    name: `component.get('nodeA').jump()`,
    function: () => {
      component.nodeA.jump();
    }
  }
];

// index.ts
var useRule = true;
var string = "./index.esc.js";
var create6 = async (config, overrides = {}) => {
  overrides = Object.assign({ __parent: document.body }, overrides);
  const returned = create4(config, overrides, {
    utilities: {
      bundle: {
        function: Bundle_exports.get,
        options: {}
      }
    }
  });
  const component2 = await returned;
  await component2.__resolved;
  console.log("Resolved:", component2);
  return component2;
};
var stuff = {
  innerHTML: "Updated Text",
  onclick: function() {
    console.log("Worrked1");
  }
};
var moreStuff = {
  innerHTML: "Updated Text Again",
  onclick: function() {
    this.__element.style.backgroundColor = "red";
  }
};
var run2 = async () => {
  const first = await create6(string);
  const second = await create6(index_esc_exports);
  const elementArray = document.body.querySelectorAll("button");
  await create6(elementArray, { __attributes: stuff });
  if (useRule) {
    const rule = new Rule({ __attributes: Object.assign({}, moreStuff) });
    rule.apply();
  } else
    await create6(elementArray, { __attributes: moreStuff });
  const combined = await create6({
    first,
    second
  });
  console.log("Combined:", combined);
  const recombined = await create6({ first });
  console.log("Recombined:", recombined);
  const isStatic = false;
  const manager = new OperationsManager();
  manager.set(objects_exports);
  manager.start(isStatic);
  manager.runAll();
  const secondManager = new OperationsManager();
  secondManager.set(graph_exports);
  secondManager.start();
  secondManager.runAll();
};
window.onkeypress = () => {
  console.log(`---------------- results ----------------`);
  const results = globalThis.escomposePerformance.averages();
  for (let key3 in results) {
    const val = results[key3];
    if (typeof val !== "object")
      console.log("Result", key3, val);
    else {
      for (let k in val)
        console.log("Result", key3, k, val[k]);
    }
  }
};
run2();
//# sourceMappingURL=index.esm.js.map
