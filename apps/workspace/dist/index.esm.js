var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key2, value2) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key2] = value2;
var __export = (target, all2) => {
  for (var name4 in all2)
    __defProp(target, name4, { get: all2[name4], enumerable: true });
};
var __publicField = (obj, key2, value2) => {
  __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value2);
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
  if (setGlobal && globalThis.ESMonitorState) {
    const callback2 = globalThis.ESMonitorState.callback;
    globalThis.ESMonitorState.state[path] = { output, value: info2 };
    runCallback(callback2, path, info2, output, false);
  }
};

// ../../packages/esmonitor/src/Poller.ts
var defaultSamplingRate = 60;
var Poller = class {
  constructor(listeners2, sps) {
    this.listeners = {};
    this.setOptions = (opts = {}) => {
      for (let key2 in opts)
        this[key2] = opts[key2];
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

// ../../packages/esmonitor/src/global.ts
globalThis.ESMonitorState = {
  state: {},
  callback: void 0,
  info: {}
};
var global_default = globalThis.ESMonitorState;

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
  const infoToGet = { ...global_default.info, ...info2 };
  for (let key2 in infoToGet) {
    if (infoToGet[key2] && infoFunctions[key2]) {
      const ogFunc = func;
      func = async (...args2) => {
        const o = await infoFunctions[key2](ogFunc, args2);
        result.value[key2] = o.value;
        return o.output;
      };
    }
  }
  result.output = func(...args);
  return result;
};

// ../../packages/esmonitor/src/globals.ts
var isProxy = Symbol("isProxy");
var fromInspectable = Symbol("fromInspectable");
var fromInspectableHandler = Symbol("fromInspectableHandler");

// ../../spec/standards.js
var keySeparator = ".";
var defaultPath = "default";
var esSourceKey = "__esmpileSourceBundle";
var defaultProperties = {
  isGraphScript: "__",
  properties: "__props",
  default: defaultPath,
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
  listeners: {
    value: "__listeners",
    branch: "__branch",
    bind: "__bind",
    trigger: "__trigger",
    format: "__format"
  },
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
var hasKey = (key2, obj) => key2 in obj;
var getShortcut = (path, shortcuts, keySeparator2) => {
  const sc = shortcuts[path[0]];
  if (sc) {
    const value2 = sc[path.slice(1).join(keySeparator2)];
    if (value2)
      return value2;
  }
};
var getFromPath = (baseObject, path, opts = {}) => {
  const fallbackKeys = opts.fallbacks ?? [];
  const keySeparator2 = opts.keySeparator ?? keySeparator;
  if (opts.shortcuts) {
    const shortcut = getShortcut(path, opts.shortcuts, keySeparator2);
    if (shortcut) {
      if (opts.output === "info")
        return { value: shortcut, exists: true, shortcut: true };
      else
        return shortcut;
    }
  }
  if (typeof path === "string")
    path = path.split(keySeparator2).flat();
  else if (typeof path == "symbol")
    path = [path];
  let exists;
  path = [...path];
  path = path.map((o) => typeof o === "string" ? o.split(keySeparator2) : o).flat();
  let ref = baseObject;
  const chain = [ref];
  for (let i = 0; i < path.length; i++) {
    if (ref) {
      const str = path[i];
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
var setFromPath = (path, value2, ref, opts = {}) => {
  const create2 = opts?.create ?? false;
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
    let has2 = hasKey(str, ref);
    if (create2 && !has2) {
      ref[str] = {};
      has2 = true;
    }
    if (has2)
      ref = ref[str];
  }
  ref[last] = value2;
  return true;
};

// ../../packages/esmonitor/src/inspectable/handlers.ts
var handlers_exports = {};
__export(handlers_exports, {
  functions: () => functions,
  objects: () => objects
});

// ../../packages/esmonitor/src/inspectable/define.ts
function define(key2, registerAsNewKey) {
  const inspectable = this;
  const target = this.target;
  if (!this.parent) {
    let value2 = target[key2];
    try {
      Object.defineProperty(target, key2, {
        get: () => value2,
        set: function(val) {
          value2 = val;
          inspectable.proxy[key2] = { [isProxy]: this[isProxy], [fromInspectable]: true, value: val };
        },
        enumerable: true,
        configurable: true
      });
    } catch (e) {
      console.error(`Could not reassign ${key2} to a top-level setter...`);
    }
  }
  if (registerAsNewKey)
    this.newKeys.add(key2);
  this.create(key2, target, void 0, true);
}
var define_default = define;

// ../../packages/esmonitor/src/inspectable/handlers.ts
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
      if (prop === isProxy)
        return true;
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, newVal, receiver) {
      if (prop === isProxy)
        return true;
      const pathStr = [...inspectable.path, prop].join(inspectable.options.keySeparator);
      const isFromProxy = newVal?.[isProxy];
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

// ../../packages/esmonitor/src/inspectable/index.ts
var canCreate = (parent, key2, val) => {
  try {
    if (val === void 0)
      val = parent[key2];
  } catch (e) {
    return e;
  }
  const alreadyIs = parent[key2] && parent[key2][isProxy];
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
    const desc = Object.getOwnPropertyDescriptor(parent, key2);
    if (desc && (desc.value && desc.writable || desc.set)) {
      if (!isESM)
        return true;
    } else if (!parent.hasOwnProperty(key2))
      return true;
  }
  return false;
};
var Inspectable = class {
  constructor(target = {}, opts = {}, name4, parent) {
    this.path = [];
    this.listeners = {};
    this.newKeys = /* @__PURE__ */ new Set();
    this.state = {};
    this.set = (path, info2, update) => {
      this.state[path] = {
        output: update,
        value: info2
      };
      setFromPath(path, update, this.proxy, { create: true });
    };
    this.check = canCreate;
    this.create = (key2, parent, val, set2 = false) => {
      const create2 = this.check(parent, key2, val);
      if (val === void 0)
        val = parent[key2];
      if (create2 && !(create2 instanceof Error)) {
        parent[key2] = new Inspectable(val, this.options, key2, this);
        return parent[key2];
      }
      if (set2) {
        try {
          this.proxy[key2] = val ?? parent[key2];
        } catch (e) {
          const isESM = esm(parent);
          const path = [...this.path, key2];
          console.error(`Could not set value (${path.join(this.options.keySeparator)})${isESM ? " because the parent is an ESM." : ""}`, isESM ? "" : e);
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
      if (name4)
        this.path.push(name4);
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
      for (let key2 in target)
        define_default.call(this, key2);
    }
    return this.proxy;
  }
};

// ../../packages/esmonitor/src/optionsHelpers.ts
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

// ../../packages/esmonitor/src/listeners.ts
var info = (id, callback, path, originalValue, base, listeners2, options, refShortcut = {}) => {
  if (typeof path === "string")
    path = path.split(options.keySeparator);
  const relativePath = path.join(options.keySeparator);
  const refs = base;
  const shortcutRef = refShortcut.ref;
  const shortcutPath = refShortcut.path;
  const get3 = (path2) => {
    const thisBase = shortcutRef ?? base;
    const res = getFromPath(thisBase, path2, {
      keySeparator: options.keySeparator,
      fallbacks: options.fallbacks
    });
    return res;
  };
  const set2 = (path2, value2) => {
    const thisBase = shortcutRef ?? base;
    setFromOptions(path2, value2, options, {
      reference: thisBase,
      listeners: listeners2
    });
  };
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
      return get3(shortcutPath ?? info2.path.absolute);
    },
    set current(val) {
      set2(shortcutPath ?? info2.path.absolute, val);
    },
    get parent() {
      return get3(shortcutPath ? shortcutPath?.slice(0, -1) : info2.path.parent);
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
var registerInLookup = (name4, sub, lookups) => {
  if (lookups) {
    const id = Math.random();
    lookups.symbol[sub] = {
      name: name4,
      id
    };
    if (!lookups.name[name4])
      lookups.name[name4] = {};
    lookups.name[name4][id] = sub;
  }
};
var register = (info2, collection, lookups) => {
  const absolute = getPath("absolute", info2);
  if (!collection[absolute])
    collection[absolute] = {};
  collection[absolute][info2.sub] = info2;
  registerInLookup(absolute, info2.sub, lookups);
  return true;
};
var listeners = {
  functions: functions2,
  setters
};
var set = (type, absPath, value2, callback, base, allListeners, options) => {
  const { id, path } = getPathInfo(absPath, options);
  const fullInfo = info(id, callback, path, value2, base, listeners, options);
  if (listeners[type])
    listeners[type](fullInfo, allListeners, allListeners.lookup);
  else {
    const path2 = getPath("absolute", fullInfo);
    allListeners[type][path2][fullInfo.sub] = fullInfo;
    if (allListeners.lookup)
      registerInLookup(path2, fullInfo.sub, allListeners.lookup);
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
    const path = getPath("output", o);
    runCallback(o.callback, path, {}, value2);
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
    const path = getPath("output", o);
    runCallback(o.callback, path, executionInfo.value, executionInfo.output);
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
var getObjectInfo = (obj, path = []) => {
  return {
    typeof: typeof obj,
    name: obj?.constructor?.name,
    simple: true,
    object: obj && typeof obj === "object",
    path
  };
};
var drillSimple = (obj, callback, options = {}) => {
  let accumulator = options.accumulator;
  if (!accumulator)
    accumulator = options.accumulator = {};
  const ignore = options.ignore || [];
  const path = options.path || [];
  const condition = options.condition || true;
  const seen = [];
  const fromSeen = [];
  let drill = (obj2, acc = {}, globalInfo) => {
    const path2 = globalInfo.path;
    if (path2.length === 0) {
      const toPass = condition instanceof Function ? condition(void 0, obj2, { ...getObjectInfo(obj2, path2) }) : condition;
      if (!toPass)
        return obj2;
    }
    for (let key2 in obj2) {
      if (options.abort)
        return;
      if (ignore.includes(key2))
        continue;
      const val = obj2[key2];
      const newPath = [...path2, key2];
      const info2 = getObjectInfo(val, newPath);
      if (info2.object) {
        const name4 = info2.name;
        const isESM = esm(val);
        if (isESM || name4 === "Object" || name4 === "Array") {
          info2.simple = true;
          const idx = seen.indexOf(val);
          if (idx !== -1)
            acc[key2] = fromSeen[idx];
          else {
            seen.push(val);
            const pass = condition instanceof Function ? condition(key2, val, info2) : condition;
            info2.pass = pass;
            const res = callback(key2, val, info2);
            if (res === abortSymbol)
              return abortSymbol;
            acc[key2] = res;
            if (pass) {
              fromSeen.push(acc[key2]);
              const res2 = drill(val, acc[key2], { ...globalInfo, path: newPath });
              if (res2 === abortSymbol)
                return abortSymbol;
              acc[key2] = res2;
            }
          }
        } else {
          info2.simple = false;
          const res = callback(key2, val, info2);
          if (res === abortSymbol)
            return abortSymbol;
          acc[key2] = res;
        }
      } else {
        const res = callback(key2, val, info2);
        if (res === abortSymbol)
          return abortSymbol;
        acc[key2] = res;
      }
    }
    return acc;
  };
  return drill(obj, accumulator, { path });
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
    this.get = (path, output, reference = this.references) => {
      return getFromPath(reference, path, {
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
      const set2 = setFromOptions(path, value2, this.options, optsCopy);
      return set2;
    };
    this.on = (absPath, callback) => {
      const info2 = getPathInfo(absPath, this.options);
      return this.listen(info2.id, callback, info2.path);
    };
    this.getInfo = (label, callback, path, original) => {
      const info2 = info(label, callback, path, original, this.references, this.listeners, this.options);
      const id = Math.random();
      const lookups = this.listeners.lookup;
      const name4 = getPath("absolute", info2);
      lookups.symbol[info2.sub] = {
        name: name4,
        id
      };
      if (!lookups.name[name4])
        lookups.name[name4] = {};
      lookups.name[name4][id] = info2.sub;
      return info2;
    };
    this.listen = (id, callback, path = [], __internal = {}) => {
      if (typeof path === "string")
        path = path.split(this.options.keySeparator);
      else if (typeof path === "symbol")
        path = [path];
      const arrayPath = path;
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
        console.error("Fallback to polling:", path, e);
        success = this.poller.add(info2);
      }
      if (success) {
        subs[getPath("absolute", info2)] = info2.sub;
        if (this.options.onInit instanceof Function) {
          const executionInfo = {};
          for (let key2 in info2.infoToOutput)
            executionInfo[key2] = void 0;
          this.options.onInit(getPath("output", info2), executionInfo);
        }
        return subs;
      } else {
        console.error("Failed to subscribe to:", path);
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
      for (let key2 in subs) {
        let innerSub = subs[key2];
        const handleUnsubscribe = (sub) => {
          const res = this.unsubscribe(sub);
          if (res === false)
            console.warn(`Subscription for ${key2} does not exist.`, sub);
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
      const name4 = obj.constructor?.name;
      const isGlobalObject = globalObjects.includes(name4);
      if (globalObjects.includes(name4)) {
        if (!rawProperties[name4])
          rawProperties[name4] = [...Object.getOwnPropertyNames(globalThis[name4].prototype)];
      }
      Object.getOwnPropertyNames(obj).forEach(function(prop) {
        if (isGlobalObject && rawProperties[name4].includes(prop))
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
      for (let key2 of keys)
        newObj[key2] = obj[key2];
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
  drillSimple(obj, (key2, val, info2) => {
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

// ../../packages/escode-compose-loader/compile/wasm.ts
var fetchAndInstantiateTask = async (uri, importObject) => {
  const wasmArrayBuffer = await fetch(uri).then((response) => response.arrayBuffer());
  return WebAssembly.instantiate(wasmArrayBuffer, importObject);
};
var load = async (uri, importObject) => {
  if (!importObject)
    importObject = { env: { abort: () => console.log("Abort!") } };
  if (WebAssembly.instantiateStreaming)
    return await WebAssembly.instantiateStreaming(fetch(uri), importObject);
  else
    return await fetchAndInstantiateTask(uri, importObject);
};
var wasm_default = load;

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
    return new Promise(async (resolve3) => {
      const info2 = await wasm_default(absoluteURI, o.importOptions);
      const copy = Object.assign({}, info2.instance.exports);
      for (let key2 in copy) {
        const val = copy[key2];
        if (val instanceof WebAssembly.Memory)
          copy[key2] = new Uint8Array(val.buffer);
        else if (val instanceof WebAssembly.Global) {
          Object.defineProperty(copy, key2, {
            get: () => val.value,
            set: (v) => val.value = v
          });
        }
      }
      resolve3(copy);
    });
  } else if (uri && opts.utilities) {
    const bundleOpts = opts.utilities.bundle;
    const gotBundleOpts = bundleOpts && typeof bundleOpts.function === "function";
    const compileOpts = opts.utilities.compile;
    const gotCompileOpts = compileOpts && typeof compileOpts.function === "function";
    if (!gotBundleOpts && !gotCompileOpts)
      o = catchError(o, new Error(genericErrorMessage));
    else {
      return new Promise(async (resolve3) => {
        try {
          if (gotBundleOpts) {
            const options = bundleOpts.options ?? {};
            if (!options.bundler)
              options.bundler = "datauri";
            if (!options.bundle)
              options.collection = "global";
            if (!options.relativeTo)
              options.relativeTo = opts.relativeTo ?? ".";
            const bundle = bundleOpts.function(uri, options);
            await bundle.compile();
            o = Object.assign({}, bundle.result);
          } else if (gotCompileOpts) {
            const options = compileOpts.options ?? {};
            if (!options.relativeTo)
              options.relativeTo = opts.relativeTo ?? ".";
            const resolved = await compileOpts.function(o, options);
            o = resolved;
          } else {
            throw new Error(genericErrorMessage);
          }
        } catch (e) {
          o = catchError(o, e);
        }
        resolve3(deep(o));
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
var localSpecialKeys = {
  compose: specialKeys.compose,
  apply: specialKeys.apply,
  bundle: esSourceKey
};
var properties = {
  dependents: Object.values(localSpecialKeys)
};
var isPathString = (value2) => typeof value2 === "string" && (value2.includes("/") || value2.includes("."));
function compose(o, toApply, opts, updateOriginal = false) {
  o = merge(o, toApply, updateOriginal);
  o = compileAndMerge(o, o[localSpecialKeys.compose], opts, true, updateOriginal);
  return resolve(o, (o2) => {
    const toApply2 = o2[localSpecialKeys.apply];
    const toApplyFlag = toApply2 && (typeof toApply2 === "object" || isPathString(toApply2));
    o2 = toApplyFlag ? compileAndMerge(o2, toApply2, opts, false, updateOriginal) : o2;
    return resolve(o2);
  });
}
var escode_compose_loader_default = compose;
function compileAndMerge(properties6, composition = {}, opts = {}, flipPrecedence = false, updateOriginal = false) {
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
    return merge(properties6, composed, updateOriginal, flipPrecedence);
  });
}

// ../../packages/core/symbols.ts
var toReturn = Symbol("return");

// ../../packages/core/parse.ts
var isNativeClass2 = (o) => typeof o === "function" && o.hasOwnProperty("prototype") && !o.hasOwnProperty("arguments");
function parse(config, toApply = {}, options = {}) {
  if (!isNode) {
    if (config instanceof NodeList)
      config = Array.from(config);
  }
  if (typeof config === "string")
    config = { [specialKeys.apply]: config };
  else if (typeof config === "function") {
    if (isNativeClass2(config))
      config = new config(toApply, options);
    else {
      delete config.__;
      config = { [specialKeys.default]: config };
    }
  } else if (!isNode && config instanceof Element) {
    const component = config[specialKeys.component];
    if (component) {
      toApply = deep(toApply);
      const shouldHaveComposed = toApply.__compose;
      const shouldHaveApplied = toApply.__apply;
      delete toApply.__compose;
      delete toApply.__apply;
      if (shouldHaveComposed) {
        console.warn("Cannot compose a component onto an element that already has a component. Merging with the base object instead...");
        toApply = Object.assign(shouldHaveComposed, toApply);
      }
      if (shouldHaveApplied) {
        console.warn("Cannot apply a component onto an element that already has a component. Applying to the base object instead...");
        toApply = Object.assign(toApply, shouldHaveApplied);
      }
      escode_compose_loader_default(component, toApply, options, true);
      return { [toReturn]: component };
    } else {
      config = { [specialKeys.element]: config };
    }
  } else if (Array.isArray(config))
    return config;
  else if (typeof config === "object") {
    config = options.clone !== false ? deep(config) : config;
  } else
    throw new Error(`Invalid configuration type: ${typeof config}. Expected object or string.`);
  return config;
}
var parseOptions = (options) => {
  const copy = deep(options);
  let monitor2;
  if (copy.monitor instanceof src_default) {
    monitor2 = copy.monitor;
    copy.keySeparator = monitor2.keySeparator;
  } else {
    if (!copy.monitor)
      copy.monitor = {};
    if (!copy.monitor.keySeparator) {
      if (!copy.keySeparator)
        copy.keySeparator = keySeparator;
      copy.monitor.keySeparator = copy.keySeparator;
    }
    copy.monitor = new src_default(copy.monitor);
  }
  return copy;
};

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
    for (const key2 in averages) {
      if (typeof this[key2] === "object" && !Array.isArray(this[key2])) {
        for (const subKey in this[key2]) {
          averages[key2][subKey] = this[key2][subKey].reduce((a, b) => a + b, 0) / this[key2][subKey].length;
        }
      } else
        averages[key2] = this[key2].reduce((a, b) => a + b, 0) / this[key2].length;
    }
    return averages;
  }
};

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
      if (!this.context.options.keySeparator)
        this.context.options.keySeparator = this.context.monitor.options.keySeparator;
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
      this.rootPath.split(this.context.options.keySeparator).forEach((key2) => {
        if (!target[key2])
          target[key2] = {};
        target = target[key2];
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
    this.#getAbsolutePath = (name4) => {
      const sep = this.context.monitor.options.keySeparator;
      return !name4 || !this.rootPath || this.rootPath === name4.slice(0, this.rootPath.length) && name4[this.rootPath.length] === sep ? name4 : [this.rootPath, name4].join(sep);
    };
    this.#getPathInfo = (path) => {
      const output = {
        absolute: {},
        relative: {}
      };
      path = this.#getAbsolutePath(path);
      let rel = this.rootPath ? path.replace(`${this.rootPath}.`, "") : path;
      const baseArr = path.split(this.context.options.keySeparator);
      output.absolute.array = [this.context.id, ...baseArr];
      output.relative.array = rel.split(this.context.options.keySeparator);
      let obj = this.context.monitor.get(output.absolute.array, void 0);
      if (this.context.graph) {
        if (obj && this.context.bound) {
          output.absolute.array = [this.context.id, this.context.bound, ...output.absolute.array.slice(1)];
          output.relative.array.unshift(this.context.bound);
        } else if (!obj) {
          const rel2 = output.relative.array.join(this.context.options.keySeparator);
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
      output.absolute.value = output.absolute.array.slice(1).join(this.context.options.keySeparator);
      output.relative.value = output.relative.array.join(this.context.options.keySeparator);
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
        subscription = this.context.monitor.on(fromInfo.absolute.array, (path, _, update) => this.activate(path, update), {
          ref: this.context.instance,
          path: fromInfo.relative.array
        });
      }
      if (typeof value2 == "string")
        value2 = toInfo.absolute.array.slice(1).join(this.context.options.keySeparator);
      const info2 = {
        value: value2,
        [listenerObject]: true
      };
      const refs = [this.active, this.globals.active];
      refs.forEach((ref) => {
        if (!ref[absPath])
          ref[absPath] = {};
        const base = ref[absPath];
        if (!base[subscriptionKey]) {
          Object.defineProperty(base, subscriptionKey, {
            value: subscription,
            configurable: true
          });
        }
        base[toInfo.absolute.value] = info2;
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
    this.addToGlobalLog = (path, mode = "from") => {
      const absolutePath = this.#getAbsolutePath(path);
      let target = mode === "to" ? this.globals.to : this.globals.from;
      const globalPath = absolutePath.split(this.context.options.keySeparator);
      globalPath.forEach((key2) => {
        if (!target[key2])
          target[key2] = {};
        target = target[key2];
        if (!target[toResolveWithKey])
          target[toResolveWithKey] = this;
      });
    };
    this.remove = (from2, to) => {
      const fromInfo = this.#getPathInfo(from2);
      const toInfo = this.#getPathInfo(to);
      const path = [fromInfo.absolute.value, toInfo.absolute.value];
      const toRemove = [
        { ref: this.active, path },
        { ref: this.globals.active, path, unlisten: true }
      ];
      toRemove.forEach((o) => {
        const { ref, path: path2, unlisten } = o;
        let base = ref[path2[0]];
        if (typeof base === "object") {
          delete base[path2[1]];
          if (Object.keys(base).length === 0) {
            delete ref[path2[0]];
            const sub = base[subscriptionKey];
            if (unlisten && sub) {
              this.context.monitor.remove(sub);
            }
            delete base[subscriptionKey];
          }
        } else
          delete ref[path2[0]];
      });
    };
    this.clear = (name4) => {
      const value2 = this.#getAbsolutePath(name4);
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
      const listenerGroups = [{
        info: this.get(from2, this.globals.active),
        name
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
            for (let key2 in info2) {
              this.pass(from2, {
                parent: info2,
                key: key2,
                subscription: info2[key2].subscription,
                value: info2[key2].value
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
      const checkIfSetter = (path, willSet) => {
        const info3 = this.context.monitor.get(path, "info");
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
        fullPath.push(...to.split(this.context.options.keySeparator));
        return checkIfSetter(fullPath, willSet);
      };
      const getPathArray = (latest) => {
        const path = [id];
        const topPath = [];
        if (this.rootPath)
          topPath.push(...this.rootPath.split(this.context.options.keySeparator));
        topPath.push(...latest.split(this.context.options.keySeparator));
        path.push(...topPath);
        return path;
      };
      if (typeof target === "boolean") {
        if (!isValue)
          transform(true);
        else
          console.error(`Cannot use a boolean for ${specialKeys2.listeners.value}...`);
      } else if (type === "string") {
        const path = getPathArray(ogValue);
        checkIfSetter(path, true);
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
          const path = getPathArray(config[bindKey].original ?? config[bindKey]);
          if (typeof config[bindKey] === "string") {
            const res = this.context.monitor.get(path);
            if (!res)
              target = `because ${path.slice(1).join(this.context.options.keySeparator)} does not point correctly to an existing component.`;
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
          parentPath.push(...to.split(this.context.options.keySeparator));
          const idx = parentPath.pop();
          const info3 = this.context.monitor.get(parentPath, "info");
          if (info3.value)
            info3.value[idx] = update;
          else
            console.error(`Cannot set value on ${parentPath.filter((str) => typeof str !== "symbol").join(this.context.options.keySeparator)} from ${from2}`);
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

// ../../packages/core/components.ts
var is = (key2) => {
  return key2.includes(specialKeys.isGraphScript) || key2 === "default";
};
var basicObjects = ["Object", "Array"];
var has = (o) => {
  let has2 = false;
  drillSimple(o, (key2, val, info2) => {
    if (info2.path.length > 1) {
      const found = info2.path.find((str) => str === "__");
      if (!found && is(key2)) {
        has2 = info2.path;
        return abortSymbol;
      }
    }
  }, {
    ignore: ["__", "__parent"],
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
  let array = Object.entries(parent).map(([name4, v]) => {
    const mayBeComponent = typeof parent === "object" || typeof parent === "function";
    const hasGraphScriptProperties = !name4.includes(specialKeys.isGraphScript) && (v && mayBeComponent) ? Object.keys(v).find(is) : false;
    if (hasGraphScriptProperties) {
      return {
        ref: v,
        parent,
        name: name4
      };
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
      const name4 = found[0];
      array = [{
        ref: parent[name4],
        parent,
        name: name4
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
  name: () => name2,
  properties: () => properties2,
  required: () => required
});
var name2 = "props";
var required = true;
var properties2 = {
  dependents: ["__props"]
};
var originalPropKeys;
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
  const val = esc.__props;
  let propsAdded = void 0;
  Object.defineProperty(esc, "__props", {
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
          originalPropKeys = props;
        } else {
          const ogProps = propsAdded;
          propsAdded = {};
          proxy(propsAdded, ogProps, originalPropKeys);
        }
        proxy(esc, newProps, props, propsAdded);
      }
    },
    enumerable: false,
    configurable: false
  });
  if (val)
    esc.__props = val;
  return esc;
};
var props_default = propsLoader;

// ../../packages/core/loaders/parent/index.ts
var parent_exports = {};
__export(parent_exports, {
  default: () => parent_default,
  name: () => name3,
  properties: () => properties4,
  required: () => required2
});

// ../../packages/core/loaders/parent/path/index.ts
var properties3 = {
  dependencies: [
    specialKeys.isGraphScript,
    specialKeys.parent
  ],
  dependents: []
};
var pathLoader = (esc, _, opts = {}) => {
  const configuration = esc[specialKeys.isGraphScript];
  let parent = esc[specialKeys.parent];
  const name4 = configuration.name;
  parent = (!isNode && parent instanceof Element ? parent?.[specialKeys.component] : parent) ?? esc[specialKeys.parent];
  const isESC = { value: "", writable: true };
  if (parent) {
    const parentComponentConfiguration = parent[specialKeys.isGraphScript];
    if (parentComponentConfiguration) {
      if (typeof name4 === "string") {
        let target = parent;
        const path = [];
        while (target && target[specialKeys.isGraphScript]) {
          const parentName = target[specialKeys.isGraphScript].name;
          if (typeof parentName === "string")
            path.push(parentName);
          else {
            if (typeof parentName === "symbol")
              configuration.root = parentName;
            else
              console.error("No graph reset occured for", parentName);
            break;
          }
          target = target[specialKeys.parent];
        }
        isESC.value = [...path.reverse(), name4];
        isESC.value = isESC.value.join(opts.keySeparator ?? ".");
      }
    }
  }
  Object.defineProperty(configuration, "path", isESC);
};
var path_default = pathLoader;

// ../../packages/core/loaders/parent/index.ts
var name3 = "parent";
var required2 = true;
var properties4 = {
  dependencies: [
    specialKeys.isGraphScript
  ],
  dependents: []
};
var parentLoader = (esc, toApply, options) => {
  const configuration = esc[specialKeys.isGraphScript];
  configuration.parent = {
    callbacks: [],
    add: function(callback) {
      this.callbacks.push(callback);
    },
    get: () => {
      return parent;
    }
  };
  const existingParent = esc[specialKeys.parent] ?? toApply[specialKeys.parent];
  let parent = existingParent;
  Object.defineProperty(esc, specialKeys.parent, {
    get: () => {
      return configuration.parent.get();
    },
    set: (newParent) => {
      const disconnecting = parent && !newParent;
      if (parent?.[specialKeys.isGraphScript]) {
        const name4 = configuration.name;
        delete parent[name4];
        parent.__.components.delete(name4);
      }
      parent = newParent;
      if (parent?.[specialKeys.isGraphScript]) {
        const name4 = configuration.name;
        if (parent[name4])
          console.error("OVERWRITING EXISTING PROPERTY ON PARENT!");
        parent[name4] = esc;
        parent.__.components.set(name4, esc);
      }
      configuration.parent.callbacks.forEach((callback) => callback.call(esc, newParent));
      path_default(esc, void 0, options);
      if (disconnecting) {
        esc[specialKeys.isGraphScript].stop.run();
      } else if (parent) {
        const isConnected = configuration.connected;
        const toConnect = isConnected instanceof Function;
        esc[specialKeys.isGraphScript].start.run();
        if (toConnect)
          isConnected();
      }
    }
  });
  path_default(esc, void 0, options);
};
var parent_default = parentLoader;

// ../../packages/core/load.ts
var run = (f, context, args, x2) => resolve(x2, () => f.call(context, ...args));
var runSequentially = (callbacks, args = [], context) => {
  if (callbacks.length) {
    if (callbacks.length === 1)
      run(callbacks[0], context, args);
    else
      return callbacks.reduce((x2, f) => run(f, context, args, x2));
  }
};
var compose2 = (callbacks, start, otherArgs = [], toIgnore) => {
  return callbacks.reduce((x2, f) => resolve(x2, (res) => {
    let func = typeof f === "function" ? f : f.default;
    const output = func(res, ...otherArgs);
    return toIgnore && toIgnore(output) ? res : output;
  }), start);
};
var runLoaders = (loaders, inputs, which) => {
  const { main, overrides, options } = inputs;
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
    return compose2(loadersToUse, main, [overrides, options], (output) => !output || typeof output !== "object");
  else
    return main;
};
var sortLoaders = (loaders) => {
  const sorted = {};
  loaders.forEach((o) => {
    const behavior = typeof o === "function" ? "activate" : o.behavior ?? "activate";
    const theseLoaders = sorted[behavior] = sorted[behavior] ?? [];
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
      const name4 = o.name;
      const { dependencies, dependents = [] } = o.properties;
      let include = o.required || !dependencies;
      if (!include && dependencies) {
        const optionalNameMessage = name4 ? ` (${name4})` : "";
        const found = dependents.find((key2) => keys.includes(key2));
        if (found) {
          const deps = {};
          dependencies.forEach((key2) => deps[key2] = created.includes(key2));
          const missingDependency = dependencies.filter((key2) => !created.includes(key2));
          if (missingDependency.length)
            console.warn(`The loader${optionalNameMessage} for ${dependencies.join(", ")} might be loaded too early, since we are missing the following dependencies: ${missingDependency.join(", ")}`);
          include = true;
        }
      }
      if (include && dependents)
        created.push(...dependents);
      return include;
    }
  });
  return usedLoaders;
};
function addCallback(callback, priority = "main") {
  const { callbacks } = this;
  callbacks[priority].push(callback);
  return true;
}
function runRecursive(resolved) {
  const { callbacks, name: name4 } = this;
  if (!this.value) {
    const isStop = name4 === "stop";
    const configuration = resolved[specialKeys.isGraphScript];
    const callback = isStop ? configuration.stop.initial : resolved[specialKeys[name4]];
    this.value = true;
    if (!isStop)
      configuration.stop.value = false;
    const toCall = callback && !isStop ? [...callbacks.before, callback, ...callbacks.main] : [...callbacks.before, ...callbacks.main];
    const result = runSequentially(toCall, [resolved], resolved);
    return resolve(result, () => {
      const hierarchy = Array.from(resolved[specialKeys.isGraphScript].components.entries());
      const ranOnChildren = resolve(hierarchy.map(async ([tag, component]) => {
        const promise = component[specialKeys.promise];
        if (promise && typeof promise.then === "function")
          component = hierarchy[tag] = await promise;
        return await component[specialKeys.isGraphScript][name4].run();
      }));
      return resolve(ranOnChildren, () => {
        const result2 = runSequentially(callbacks.after, [resolved], resolved);
        return resolve(result2, () => {
          if (isStop) {
            if (callback)
              callback.call(resolved, resolved);
            configuration.flow.clear();
            const path = resolved[specialKeys.isGraphScript].path;
            let target = resolved;
            const parent = target[specialKeys.parent];
            while (parent && parent[specialKeys.isGraphScript] !== void 0) {
              const res = target[specialKeys.parent];
              if (res) {
                target = res;
                if (target) {
                  const configuration2 = target[specialKeys.isGraphScript];
                  if (configuration2)
                    configuration2.flow.clear(path);
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
function load2(esc, loaders = [], options) {
  const tic = performance.now();
  const parent = options.parent;
  const {
    parentObject,
    toApply = {},
    callbacks = {},
    opts = {},
    name: name4 = Symbol("root")
  } = options;
  const original = esc;
  esc = parse(esc, toApply, opts);
  if (esc[toReturn])
    return esc[toReturn];
  if (Array.isArray(esc))
    return resolve(esc.map((o) => load2(o, loaders, options)));
  esc[specialKeys.isGraphScript] = createGraphScriptRoot(name4, options, { parent, original, loaders });
  const sortedLoaders = sortLoaders(loaders);
  const loaded = runLoaders(sortedLoaders, { main: esc, overrides: toApply, options: opts }, "load");
  const component = resolve(loaded, (loaded2) => {
    let toApplyParent = !loaded2[specialKeys.parent] && parent ? { [specialKeys.parent]: parent } : {};
    const parented = runLoaders([parent_exports], { main: loaded2, overrides: toApplyParent, options: opts });
    const propped = runLoaders([props_exports], { main: parented });
    const res = runLoaders(sortedLoaders, { main: propped, overrides: toApply, options: opts }, "activate");
    return resolve(res, (esc2) => {
      esc2.__.ref = esc2;
      if (parentObject)
        parentObject[name4] = esc2;
      if (typeof name4 === "symbol" && callbacks.onRootCreated)
        callbacks.onRootCreated(name4, esc2);
      if (callbacks.onInstanceCreated)
        callbacks.onInstanceCreated(esc2.__.path, esc2);
      const configuration = esc2[specialKeys.isGraphScript];
      const nested = from(propped);
      const promises = nested ? nested.map((info2) => {
        const copy = Object.assign({}, options);
        const name5 = copy.name = info2.name;
        delete copy.toApply;
        copy.parentObject = info2.parent;
        copy.parent = esc2;
        const ref = info2.ref;
        if (ref) {
          if (ref.__?.symbol) {
            const parent2 = ref.__.parent;
            if (parent2)
              console.error(`Changing parent of existing component (${ref.__.path}) from ${parent2.__.path} to ${configuration.path}`);
            ref.__parent = esc2;
            esc2[specialKeys.isGraphScript].components.set(name5, res);
          } else {
            const resolution = load2(ref, loaders, copy);
            Object.defineProperty(info2.parent[name5], specialKeys.promise, { value: resolution, writable: false });
            const promise = resolve(resolution, (res2) => {
              configuration.components.set(name5, res2);
              return res2;
            });
            configuration.components.set(name5, promise);
          }
        } else {
          delete info2.parent[name5];
          console.error("No reference found for nested component", info2);
        }
      }) : [];
      let isResolved;
      const resolvePromise = new Promise((resolve3) => isResolved = async () => {
        configuration.resolved = true;
        resolve3(true);
      });
      Object.defineProperty(esc2, `${specialKeys.resolved}`, { value: resolvePromise });
      configuration.resolved = false;
      resolve(promises, () => isReady(esc2, callbacks, isResolved));
      return esc2;
    });
  });
  const creationToc = performance.now();
  const toCreateTime = creationToc - tic;
  resolve(component, (esc2) => {
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
  return component;
}
function createGraphScriptRoot(name4, options, additionalInfo = {}) {
  const { parent, original, loaders } = additionalInfo;
  const isSymbol = typeof name4 === "symbol";
  const parentId = parent?.[specialKeys.isGraphScript].path;
  const path = parentId ? [parentId, name4] : typeof name4 === "string" ? [name4] : [];
  const absolutePath = path.join(options.keySeparator ?? keySeparator);
  const __2 = {
    name: name4,
    symbol: Symbol("isGraphScript"),
    root: isSymbol ? name4 : parent[specialKeys.isGraphScript].root,
    path: absolutePath,
    options,
    original,
    states: {},
    components: /* @__PURE__ */ new Map(),
    connected: false,
    resolved: false,
    flow: new edgelord_default(),
    create: (esc) => {
      if (!options.loaders)
        options.loaders = loaders;
      return core_default(esc, void 0, options);
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
function isReady(esc, callbacks, isResolved) {
  const configuration = esc[specialKeys.isGraphScript];
  for (let key2 in esc) {
    const og = esc[key2];
    if (typeof og === "function" && !isNativeClass(og)) {
      const context = esc[specialKeys.proxy] ?? esc;
      esc[key2] = og.bind(context);
    }
  }
  configuration.stop.initial = esc[specialKeys.stop];
  esc[specialKeys.stop] = configuration.stop.run;
  const keys = all(esc);
  for (let key2 of keys) {
    if (is(key2)) {
      const desc = Object.getOwnPropertyDescriptor(esc, key2);
      if (desc?.enumerable)
        Object.defineProperty(esc, key2, { ...desc, enumerable: false });
    }
  }
  const finalParent = esc[specialKeys.parent];
  esc[specialKeys.parent] = finalParent;
  if (callbacks.onInstanceReady)
    callbacks.onInstanceReady(esc.__.path, esc);
  isResolved();
}

// ../../packages/core/index.ts
var monitor = new src_default();
var create = (config, toApply = {}, options = {}) => {
  const fullOptions = parseOptions(options);
  const callbacks = {
    onRootCreated: (id, esc) => fullOptions.monitor.set(id, esc, fullOptions.listeners),
    onInstanceCreated: (absolutePath, esc) => {
      if (fullOptions.listen !== false) {
        const to = esc[specialKeys.listeners.value] ?? {};
        const flow = esc[specialKeys.isGraphScript].flow;
        flow.setInitialProperties(to, absolutePath, {
          id: esc[specialKeys.isGraphScript].root,
          monitor: fullOptions.monitor,
          options: fullOptions
        });
        esc[specialKeys.listeners.value] = to;
        if (specialKeys.trigger in esc) {
          if (!Array.isArray(esc[specialKeys.trigger]))
            esc[specialKeys.trigger] = [];
          const args = esc[specialKeys.trigger];
          flow.onStart(() => esc.default(...args));
          delete esc[specialKeys.trigger];
        }
      }
    },
    onInstanceReady: (absolutePath, esc) => esc[specialKeys.isGraphScript].flow.start()
  };
  const loaders = fullOptions.loaders;
  const component = load2(config, loaders, {
    toApply,
    opts: fullOptions,
    callbacks,
    waitForChildren: false
  });
  return resolve(component, (esc) => {
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

// ../../demos/graph/nodes/nodeA.js
var __ = true;
var x = 5;
var y = 2;
var jump = () => {
  const message = `jump!`;
  log.add(message);
  return "jumped!";
};

// ../../demos/graph/tree.js
var nodeAInstance = Object.assign({}, nodeA_exports);
var shared = {
  value: 0
};
var value = 0;
function defaultFunction() {
  const originalType = typeof this.__.original;
  const message = `instanced node (${this.__.name} ${originalType === "function" ? "class " : originalType}) called! ${this.shared.value} ${this.mystery.value}`;
  this.shared.value++;
  this.mystery.value++;
  log.add(message);
}
var nodeClass = class {
  shared = shared;
  mystery = {
    value
  };
  default = defaultFunction;
};
__publicField(nodeClass, "__", true);
var objectNotClass = {
  shared,
  mystery: {
    value
  },
  default: defaultFunction
};
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
  nodeF: {
    __props: document.createElement("div"),
    __onconnected: function(node) {
      this.innerHTML = "Test";
      this.style.backgroundColor = "green";
      document.body.appendChild(this.__props);
    },
    __ondisconnected: function(node) {
      document.body.removeChild(this.__props);
    }
  },
  nodeG: nodeClass,
  nodeH: nodeClass,
  nodeI: objectNotClass,
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
var tree_default = tree;

// ../../packages/escode-animate-loader/index.ts
var key = specialKeys.animate;
var properties5 = {
  dependents: [specialKeys.animate]
};

// ../../demos/graph/index.ts
var nodeAInstance2 = tree_default.nodeA;
var model = tree_default;

// ../../packages/common/benchmark.ts
var checkPerformance = async (callback, times = 1, cleanupCallback) => {
  const callbacks = Array.from({ length: times }).map(() => callback);
  const timesArr = [];
  let count = 0;
  for await (callback of callbacks) {
    const start = performance.now();
    const res = await callback(count);
    const end = performance.now();
    if (cleanupCallback)
      cleanupCallback(res);
    const time = end - start;
    timesArr.push(time);
    count++;
  }
  return timesArr.reduce((acc, item) => acc + item, 0) / timesArr.length;
};

// ../../demos/graph/benchmark.ts
var nTimes = 1e3;
var checkInstantiationTime = async () => {
  return checkPerformance(async (i) => {
    const component = create(model);
    await component.__resolved;
  }, nTimes).then((averageTime) => {
    console.log(`Time to Construct Graphs:`, averageTime);
  }).then(() => {
  });
};
var checkListenerTime = async () => {
  const component = create(model);
  return checkPerformance(async () => {
    component.nodeA.jump();
  }, nTimes).then((averageTime) => {
    console.log(`Time to Jump:`, averageTime);
  });
};
checkInstantiationTime().then(checkListenerTime);
//# sourceMappingURL=index.esm.js.map
