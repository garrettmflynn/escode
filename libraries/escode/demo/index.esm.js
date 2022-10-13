var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to2, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
    var _CodeOrName = class {
    };
    exports._CodeOrName = _CodeOrName;
    exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      constructor(s) {
        super();
        if (!exports.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports.Name = Name;
    var _Code = class extends _CodeOrName {
      constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a;
        return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a;
        return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports._Code = _Code;
    exports.nil = new _Code("");
    function _2(strs, ...args) {
      const code = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
      }
      return new _Code(code);
    }
    exports._ = _2;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    exports.str = str;
    function addCodeArg(code, arg) {
      if (arg instanceof _Code)
        code.push(...arg._items);
      else if (arg instanceof Name)
        code.push(arg);
      else
        code.push(interpolate(arg));
    }
    exports.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    function mergeExprItems(a, b2) {
      if (b2 === '""')
        return a;
      if (a === '""')
        return b2;
      if (typeof a == "string") {
        if (b2 instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b2 != "string")
          return `${a.slice(0, -1)}${b2}"`;
        if (b2[0] === '"')
          return a.slice(0, -1) + b2.slice(1);
        return;
      }
      if (typeof b2 == "string" && b2[0] === '"' && !(a instanceof Name))
        return `"${a}${b2.slice(1)}`;
      return;
    }
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    exports.strConcat = strConcat;
    function interpolate(x2) {
      return typeof x2 == "number" || typeof x2 == "boolean" || x2 === null ? x2 : safeStringify(Array.isArray(x2) ? x2.join(",") : x2);
    }
    function stringify(x2) {
      return new _Code(safeStringify(x2));
    }
    exports.stringify = stringify;
    function safeStringify(x2) {
      return JSON.stringify(x2).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    exports.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _2`[${key}]`;
    }
    exports.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    exports.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    exports.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      constructor(name2) {
        super(`CodeGen: "code" for ${name2} not defined`);
        this.value = name2.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState = exports.UsedValueState || (exports.UsedValueState = {}));
    exports.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix) {
        return new code_1.Name(this._newName(prefix));
      }
      _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
      }
      _nameGroup(prefix) {
        var _a, _b;
        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
          throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return this._names[prefix] = { prefix, index: 0 };
      }
    };
    exports.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
      }
      value(nameOrPrefix, value) {
        var _a;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name2 = this.toName(nameOrPrefix);
        const { prefix } = name2;
        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
        let vs = this._values[prefix];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name2);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name2.setValue(value, { property: prefix, itemIndex });
        return name2;
      }
      getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name2) => {
          if (name2.scopePath === void 0)
            throw new Error(`CodeGen: name "${name2}" has no value`);
          return (0, code_1._)`${scopeName}${name2.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name2) => {
          if (name2.value === void 0)
            throw new Error(`CodeGen: name "${name2}" has no value`);
          return name2.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix in values) {
          const vs = values[prefix];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
          vs.forEach((name2) => {
            if (nameSet.has(name2))
              return;
            nameSet.set(name2, UsedValueState.Started);
            let c = valueCode(name2);
            if (c) {
              const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
              code = (0, code_1._)`${code}${def} ${name2} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name2)) {
              code = (0, code_1._)`${code}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name2);
            }
            nameSet.set(name2, UsedValueState.Completed);
          });
        }
        return code;
      }
    };
    exports.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return code_2._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return code_2.str;
    } });
    Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
      return code_2.strConcat;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return code_2.nil;
    } });
    Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
      return code_2.getProperty;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return code_2.stringify;
    } });
    Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
      return code_2.regexpCode;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return code_2.Name;
    } });
    var scope_2 = require_scope();
    Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
      return scope_2.Scope;
    } });
    Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
      return scope_2.ValueScope;
    } });
    Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
      return scope_2.ValueScopeName;
    } });
    Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
      return scope_2.varKinds;
    } });
    exports.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      constructor(varKind, name2, rhs) {
        super();
        this.varKind = varKind;
        this.name = name2;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      constructor(error) {
        super();
        this.error = error;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      constructor(code) {
        super();
        this.code = code;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
    };
    var Else = class extends BlockNode {
    };
    Else.kind = "else";
    var If = class extends BlockNode {
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code += "else " + this.else.render(opts);
        return code;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new If(not(cond), e instanceof If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants) {
        var _a;
        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
    };
    For.kind = "for";
    var ForLoop = class extends For {
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      constructor(varKind, name2, from2, to2) {
        super();
        this.varKind = varKind;
        this.name = name2;
        this.from = from2;
        this.to = to2;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name: name2, from: from2, to: to2 } = this;
        return `for(${varKind} ${name2}=${from2}; ${name2}<${to2}; ${name2}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      constructor(loop, varKind, name2, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name2;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      constructor(name2, args, async) {
        super();
        this.name = name2;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
          code += this.catch.render(opts);
        if (this.finally)
          code += this.finally.render(opts);
        return code;
      }
      optimizeNodes() {
        var _a, _b;
        super.optimizeNodes();
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants) {
        var _a, _b;
        super.optimizeNames(names, constants);
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      constructor(error) {
        super();
        this.error = error;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      name(prefix) {
        return this._scope.name(prefix);
      }
      scopeName(prefix) {
        return this._extScope.name(prefix);
      }
      scopeValue(prefixOrName, value) {
        const name2 = this._extScope.value(prefixOrName, value);
        const vs = this._values[name2.prefix] || (this._values[name2.prefix] = /* @__PURE__ */ new Set());
        vs.add(name2);
        return name2;
      }
      getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
      }
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant) {
        const name2 = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant)
          this._constants[name2.str] = rhs;
        this._leafNode(new Def(varKind, name2, rhs));
        return name2;
      }
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
      }
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
          if (code.length > 1)
            code.push(",");
          code.push(key);
          if (key !== value || this.opts.es5) {
            code.push(":");
            (0, code_1.addCodeArg)(code, value);
          }
        }
        code.push("}");
        return new code_1._Code(code);
      }
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      else() {
        return this._elseNode(new Else());
      }
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      forRange(nameOrPrefix, from2, to2, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name2 = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name2, from2, to2), () => forBody(name2));
      }
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name2 = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name2, (0, code_1._)`${arr}[${i}]`);
            forBody(name2);
          });
        }
        return this._for(new ForIter("of", varKind, name2, iterable), () => forBody(name2));
      }
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name2 = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name2, obj), () => forBody(name2));
      }
      endFor() {
        return this._endBlockNode(For);
      }
      label(label) {
        return this._leafNode(new Label(label));
      }
      break(label) {
        return this._leafNode(new Break(label));
      }
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error = this.name("e");
          this._currNode = node.catch = new Catch(error);
          catchCode(error);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      throw(error) {
        return this._leafNode(new Throw(error));
      }
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      func(name2, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name2, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports.CodeGen = CodeGen;
    function addNames(names, from2) {
      for (const n in from2)
        names[n] = (names[n] || 0) + (from2[n] || 0);
      return names;
    }
    function addExprNames(names, from2) {
      return from2 instanceof code_1._CodeOrName ? addNames(names, from2.names) : names;
    }
    function optimizeExpr(expr, names, constants) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0);
      }
    }
    function subtractNames(names, from2) {
      for (const n in from2)
        names[n] = (names[n] || 0) - (from2[n] || 0);
    }
    function not(x2) {
      return typeof x2 == "boolean" || typeof x2 == "number" || x2 === null ? !x2 : (0, code_1._)`!${par(x2)}`;
    }
    exports.not = not;
    var andCode = mappend(exports.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    exports.and = and;
    var orCode = mappend(exports.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    exports.or = or;
    function mappend(op) {
      return (x2, y2) => x2 === code_1.nil ? y2 : y2 === code_1.nil ? x2 : (0, code_1._)`${par(x2)} ${op} ${par(y2)}`;
    }
    function par(x2) {
      return x2 instanceof code_1.Name ? x2 : (0, code_1._)`(${x2})`;
    }
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash = {};
      for (const item of arr)
        hash[item] = true;
      return hash;
    }
    exports.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    exports.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self: self2 } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self2.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    exports.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    exports.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    exports.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    exports.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    exports.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    exports.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    exports.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    exports.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x2 of xs)
          f(x2);
      } else {
        f(xs);
      }
    }
    exports.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
      return (gen, from2, to2, toName) => {
        const res = to2 === void 0 ? from2 : to2 instanceof codegen_1.Name ? (from2 instanceof codegen_1.Name ? mergeNames(gen, from2, to2) : mergeToName(gen, from2, to2), to2) : from2 instanceof codegen_1.Name ? (mergeToName(gen, to2, from2), from2) : mergeValues(from2, to2);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    exports.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: (gen, from2, to2) => gen.if((0, codegen_1._)`${to2} !== true && ${from2} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from2} === true`, () => gen.assign(to2, true), () => gen.assign(to2, (0, codegen_1._)`${to2} || {}`).code((0, codegen_1._)`Object.assign(${to2}, ${from2})`));
        }),
        mergeToName: (gen, from2, to2) => gen.if((0, codegen_1._)`${to2} !== true`, () => {
          if (from2 === true) {
            gen.assign(to2, true);
          } else {
            gen.assign(to2, (0, codegen_1._)`${to2} || {}`);
            setEvaluated(gen, to2, from2);
          }
        }),
        mergeValues: (from2, to2) => from2 === true ? true : { ...from2, ...to2 },
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: (gen, from2, to2) => gen.if((0, codegen_1._)`${to2} !== true && ${from2} !== undefined`, () => gen.assign(to2, (0, codegen_1._)`${from2} === true ? true : ${to2} > ${from2} ? ${to2} : ${from2}`)),
        mergeToName: (gen, from2, to2) => gen.if((0, codegen_1._)`${to2} !== true`, () => gen.assign(to2, from2 === true ? true : (0, codegen_1._)`${to2} > ${from2} ? ${to2} : ${from2}`)),
        mergeValues: (from2, to2) => from2 === true ? true : Math.max(from2, to2),
        resultToName: (gen, items) => gen.var("items", items)
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    exports.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p2) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p2)}`, true));
    }
    exports.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    exports.useFunc = useFunc;
    var Type;
    (function(Type2) {
      Type2[Type2["Num"] = 0] = "Num";
      Type2[Type2["Str"] = 1] = "Str";
    })(Type = exports.Type || (exports.Type = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    exports.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    exports.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      data: new codegen_1.Name("data"),
      valCxt: new codegen_1.Name("valCxt"),
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      vErrors: new codegen_1.Name("vErrors"),
      errors: new codegen_1.Name("errors"),
      this: new codegen_1.Name("this"),
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports.keywordError = {
      message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
    };
    exports.keyword$DataError = {
      message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
    };
    function reportError(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    exports.reportError = reportError;
    function reportExtraError(cxt, error = exports.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    exports.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    exports.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err}.data`, data);
        }
      });
    }
    exports.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    var E2 = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error, errorPaths);
    }
    function errorObject(cxt, error, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error, keyValues);
      return gen.object(...keyValues);
    }
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E2.schemaPath, schPath];
    }
    function extraErrorProps(cxt, { params, message }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E2.keyword, keyword], [E2.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E2.message, typeof message == "function" ? message(cxt) : message]);
      }
      if (opts.verbose) {
        keyValues.push([E2.schema, schemaValue], [E2.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E2.propertyName, propertyName]);
    }
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid2) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid2, false);
        falseSchemaError(it);
      } else {
        gen.var(valid2, true);
      }
    }
    exports.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRules = exports.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x2) {
      return typeof x2 == "string" && jsonTypes.has(x2);
    }
    exports.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    exports.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self: self2 }, type) {
      const group = self2.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    exports.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    exports.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a;
      return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
    }
    exports.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType;
    (function(DataType2) {
      DataType2[DataType2["Correct"] = 0] = "Correct";
      DataType2[DataType2["Wrong"] = 1] = "Wrong";
    })(DataType = exports.DataType || (exports.DataType = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    exports.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    exports.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    exports.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
    }
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
      const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
    }
    exports.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    exports.checkDataTypes = checkDataTypes;
    var typeError = {
      message: ({ schema }) => `must be ${schema}`,
      params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    exports.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    exports.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    exports.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    exports.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    exports.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    exports.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    exports.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    exports.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    exports.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p2) => p2 !== "__proto__") : [];
    }
    exports.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p2) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p2]));
    }
    exports.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    exports.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    exports.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid2 = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid2, true);
      validateItems(() => gen.break());
      return valid2;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid2);
          gen.if((0, codegen_1.not)(valid2), notValid);
        });
      }
    }
    exports.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid2 = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid2, (0, codegen_1._)`${valid2} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged)
          gen.if((0, codegen_1.not)(valid2));
      }));
      cxt.result(valid2, () => cxt.reset(), () => cxt.error(true));
    }
    exports.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid2 = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid2);
      cxt.pass(valid2, () => cxt.error(true));
    }
    exports.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate2 = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate2);
      const valid2 = gen.let("valid");
      cxt.block$data(valid2, validateKeyword);
      cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid2);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid2, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid2, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      function reportErrs(errors) {
        var _a2;
        gen.if((0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== void 0 ? _a2 : valid2), errors);
      }
    }
    exports.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    exports.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self: self2, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid2 = def.validateSchema(schema[keyword]);
        if (!valid2) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self2.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self2.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    exports.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    exports.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
    }
    exports.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    exports.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = function equal(a, b2) {
      if (a === b2)
        return true;
      if (a && b2 && typeof a == "object" && typeof b2 == "object") {
        if (a.constructor !== b2.constructor)
          return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b2.length)
            return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b2[i]))
              return false;
          return true;
        }
        if (a.constructor === RegExp)
          return a.source === b2.source && a.flags === b2.flags;
        if (a.valueOf !== Object.prototype.valueOf)
          return a.valueOf() === b2.valueOf();
        if (a.toString !== Object.prototype.toString)
          return a.toString() === b2.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b2).length)
          return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b2, keys[i]))
            return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b2[key]))
            return false;
        }
        return true;
      }
      return a !== a && b2 !== b2;
    };
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports, module) {
    "use strict";
    var traverse = module.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    exports.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p2 = resolver.parse(id);
      return _getFullPath(resolver, p2);
    }
    exports.getFullPath = getFullPath;
    function _getFullPath(resolver, p2) {
      const serialized = resolver.serialize(p2);
      return serialized.split("#")[0] + "#";
    }
    exports._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    exports.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    exports.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _2, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let baseId2 = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          baseId2 = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = baseId2;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(baseId2 ? _resolve(baseId2, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
    }
    exports.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    exports.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    function subschemaCode(it, valid2) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid2);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid2);
    }
    function schemaCxtHasRules({ schema, self: self2 }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self2.RULES.all[key])
          return true;
      return false;
    }
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    function subSchemaObjCode(it, valid2) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid2, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self: self2 } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self2.RULES)) {
        self2.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self: self2 } = it;
      const { RULES } = self2;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
    }
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      it.dataTypes = it.dataTypes.filter((t) => includesType(types, t));
    }
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    var KeywordCxt = class {
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid2, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid2, $dataValid);
          codeBlock();
        });
      }
      check$data(valid2 = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid2 !== codegen_1.nil)
          gen.assign(valid2, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid2 !== codegen_1.nil)
            gen.assign(valid2, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
      }
      subschema(appl, valid2) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid2);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid2) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid2, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
    }
    exports.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationError = class extends Error {
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate2 = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate2 });
        validate2.errors = null;
        validate2.schema = sch.schema;
        validate2.schemaEnv = sch;
        if (sch.$async)
          validate2.$async = true;
        if (this.opts.code.source === true) {
          validate2.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate2.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate2.source)
            validate2.source.evaluated = (0, codegen_1.stringify)(validate2.evaluated);
        }
        sch.validate = validate2;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    exports.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    exports.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    exports.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    function resolve(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    function resolveSchema(root, ref) {
      const p2 = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p2);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p2, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p2, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p2, schOrRef);
    }
    exports.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a;
      if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports, module) {
    module.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/uri-js/dist/es5/uri.all.js
var require_uri_all = __commonJS({
  "node_modules/uri-js/dist/es5/uri.all.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global.URI = global.URI || {});
    })(exports, function(exports2) {
      "use strict";
      function merge2() {
        for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
          sets[_key] = arguments[_key];
        }
        if (sets.length > 1) {
          sets[0] = sets[0].slice(0, -1);
          var xl = sets.length - 1;
          for (var x2 = 1; x2 < xl; ++x2) {
            sets[x2] = sets[x2].slice(1, -1);
          }
          sets[xl] = sets[xl].slice(1);
          return sets.join("");
        } else {
          return sets[0];
        }
      }
      function subexp(str) {
        return "(?:" + str + ")";
      }
      function typeOf(o) {
        return o === void 0 ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
      }
      function toUpperCase(str) {
        return str.toUpperCase();
      }
      function toArray(obj) {
        return obj !== void 0 && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
      }
      function assign(target, source) {
        var obj = target;
        if (source) {
          for (var key in source) {
            obj[key] = source[key];
          }
        }
        return obj;
      }
      function buildExps(isIRI2) {
        var ALPHA$$ = "[A-Za-z]", CR$ = "[\\x0D]", DIGIT$$ = "[0-9]", DQUOTE$$ = "[\\x22]", HEXDIG$$2 = merge2(DIGIT$$, "[A-Fa-f]"), LF$$ = "[\\x0A]", SP$$ = "[\\x20]", PCT_ENCODED$2 = subexp(subexp("%[EFef]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%" + HEXDIG$$2 + HEXDIG$$2)), GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]", SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", RESERVED$$ = merge2(GEN_DELIMS$$, SUB_DELIMS$$), UCSCHAR$$ = isIRI2 ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", IPRIVATE$$ = isIRI2 ? "[\\uE000-\\uF8FF]" : "[]", UNRESERVED$$2 = merge2(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$), SCHEME$ = subexp(ALPHA$$ + merge2(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"), USERINFO$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge2(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]")) + "*"), DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$), DEC_OCTET_RELAXED$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$), IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$), H16$ = subexp(HEXDIG$$2 + "{1,4}"), LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$), IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$), IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$), IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$), IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$), IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$), IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$), IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$), IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$), IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"), IPV6ADDRESS$ = subexp([IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$].join("|")), ZONEID$ = subexp(subexp(UNRESERVED$$2 + "|" + PCT_ENCODED$2) + "+"), IPV6ADDRZ$ = subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$), IPV6ADDRZ_RELAXED$ = subexp(IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + ZONEID$), IPVFUTURE$ = subexp("[vV]" + HEXDIG$$2 + "+\\." + merge2(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]") + "+"), IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"), REG_NAME$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge2(UNRESERVED$$2, SUB_DELIMS$$)) + "*"), HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "(?!" + REG_NAME$ + ")|" + REG_NAME$), PORT$ = subexp(DIGIT$$ + "*"), AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"), PCHAR$ = subexp(PCT_ENCODED$2 + "|" + merge2(UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@]")), SEGMENT$ = subexp(PCHAR$ + "*"), SEGMENT_NZ$ = subexp(PCHAR$ + "+"), SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge2(UNRESERVED$$2, SUB_DELIMS$$, "[\\@]")) + "+"), PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"), PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"), PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$), PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$), PATH_EMPTY$ = "(?!" + PCHAR$ + ")", PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), QUERY$ = subexp(subexp(PCHAR$ + "|" + merge2("[\\/\\?]", IPRIVATE$$)) + "*"), FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"), HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"), RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$), RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"), URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$), ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"), GENERIC_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", RELATIVE_REF$ = "^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", ABSOLUTE_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$", SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", AUTHORITY_REF$ = "^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$";
        return {
          NOT_SCHEME: new RegExp(merge2("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
          NOT_USERINFO: new RegExp(merge2("[^\\%\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_HOST: new RegExp(merge2("[^\\%\\[\\]\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_PATH: new RegExp(merge2("[^\\%\\/\\:\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_PATH_NOSCHEME: new RegExp(merge2("[^\\%\\/\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_QUERY: new RegExp(merge2("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
          NOT_FRAGMENT: new RegExp(merge2("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
          ESCAPE: new RegExp(merge2("[^]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          UNRESERVED: new RegExp(UNRESERVED$$2, "g"),
          OTHER_CHARS: new RegExp(merge2("[^\\%]", UNRESERVED$$2, RESERVED$$), "g"),
          PCT_ENCODED: new RegExp(PCT_ENCODED$2, "g"),
          IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
          IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$")
        };
      }
      var URI_PROTOCOL = buildExps(false);
      var IRI_PROTOCOL = buildExps(true);
      var slicedToArray = function() {
        function sliceIterator(arr, i) {
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e2 = void 0;
          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);
              if (i && _arr.length === i)
                break;
            }
          } catch (err) {
            _d = true;
            _e2 = err;
          } finally {
            try {
              if (!_n && _i["return"])
                _i["return"]();
            } finally {
              if (_d)
                throw _e2;
            }
          }
          return _arr;
        }
        return function(arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();
      var toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
          for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++)
            arr2[i] = arr[i];
          return arr2;
        } else {
          return Array.from(arr);
        }
      };
      var maxInt = 2147483647;
      var base = 36;
      var tMin = 1;
      var tMax = 26;
      var skew = 38;
      var damp = 700;
      var initialBias = 72;
      var initialN = 128;
      var delimiter = "-";
      var regexPunycode = /^xn--/;
      var regexNonASCII = /[^\0-\x7E]/;
      var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
      var errors = {
        "overflow": "Overflow: input needs wider integers to process",
        "not-basic": "Illegal input >= 0x80 (not a basic code point)",
        "invalid-input": "Invalid input"
      };
      var baseMinusTMin = base - tMin;
      var floor = Math.floor;
      var stringFromCharCode = String.fromCharCode;
      function error$1(type) {
        throw new RangeError(errors[type]);
      }
      function map(array, fn) {
        var result = [];
        var length = array.length;
        while (length--) {
          result[length] = fn(array[length]);
        }
        return result;
      }
      function mapDomain(string, fn) {
        var parts = string.split("@");
        var result = "";
        if (parts.length > 1) {
          result = parts[0] + "@";
          string = parts[1];
        }
        string = string.replace(regexSeparators, ".");
        var labels = string.split(".");
        var encoded = map(labels, fn).join(".");
        return result + encoded;
      }
      function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;
        while (counter < length) {
          var value = string.charCodeAt(counter++);
          if (value >= 55296 && value <= 56319 && counter < length) {
            var extra = string.charCodeAt(counter++);
            if ((extra & 64512) == 56320) {
              output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
            } else {
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }
        return output;
      }
      var ucs2encode = function ucs2encode2(array) {
        return String.fromCodePoint.apply(String, toConsumableArray(array));
      };
      var basicToDigit = function basicToDigit2(codePoint) {
        if (codePoint - 48 < 10) {
          return codePoint - 22;
        }
        if (codePoint - 65 < 26) {
          return codePoint - 65;
        }
        if (codePoint - 97 < 26) {
          return codePoint - 97;
        }
        return base;
      };
      var digitToBasic = function digitToBasic2(digit, flag) {
        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
      };
      var adapt = function adapt2(delta, numPoints, firstTime) {
        var k2 = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);
        for (; delta > baseMinusTMin * tMax >> 1; k2 += base) {
          delta = floor(delta / baseMinusTMin);
        }
        return floor(k2 + (baseMinusTMin + 1) * delta / (delta + skew));
      };
      var decode = function decode2(input) {
        var output = [];
        var inputLength = input.length;
        var i = 0;
        var n = initialN;
        var bias = initialBias;
        var basic = input.lastIndexOf(delimiter);
        if (basic < 0) {
          basic = 0;
        }
        for (var j2 = 0; j2 < basic; ++j2) {
          if (input.charCodeAt(j2) >= 128) {
            error$1("not-basic");
          }
          output.push(input.charCodeAt(j2));
        }
        for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
          var oldi = i;
          for (var w2 = 1, k2 = base; ; k2 += base) {
            if (index >= inputLength) {
              error$1("invalid-input");
            }
            var digit = basicToDigit(input.charCodeAt(index++));
            if (digit >= base || digit > floor((maxInt - i) / w2)) {
              error$1("overflow");
            }
            i += digit * w2;
            var t = k2 <= bias ? tMin : k2 >= bias + tMax ? tMax : k2 - bias;
            if (digit < t) {
              break;
            }
            var baseMinusT = base - t;
            if (w2 > floor(maxInt / baseMinusT)) {
              error$1("overflow");
            }
            w2 *= baseMinusT;
          }
          var out = output.length + 1;
          bias = adapt(i - oldi, out, oldi == 0);
          if (floor(i / out) > maxInt - n) {
            error$1("overflow");
          }
          n += floor(i / out);
          i %= out;
          output.splice(i++, 0, n);
        }
        return String.fromCodePoint.apply(String, output);
      };
      var encode = function encode2(input) {
        var output = [];
        input = ucs2decode(input);
        var inputLength = input.length;
        var n = initialN;
        var delta = 0;
        var bias = initialBias;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = void 0;
        try {
          for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _currentValue2 = _step.value;
            if (_currentValue2 < 128) {
              output.push(stringFromCharCode(_currentValue2));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
        var basicLength = output.length;
        var handledCPCount = basicLength;
        if (basicLength) {
          output.push(delimiter);
        }
        while (handledCPCount < inputLength) {
          var m2 = maxInt;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = void 0;
          try {
            for (var _iterator2 = input[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var currentValue = _step2.value;
              if (currentValue >= n && currentValue < m2) {
                m2 = currentValue;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
          var handledCPCountPlusOne = handledCPCount + 1;
          if (m2 - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
            error$1("overflow");
          }
          delta += (m2 - n) * handledCPCountPlusOne;
          n = m2;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = void 0;
          try {
            for (var _iterator3 = input[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _currentValue = _step3.value;
              if (_currentValue < n && ++delta > maxInt) {
                error$1("overflow");
              }
              if (_currentValue == n) {
                var q = delta;
                for (var k2 = base; ; k2 += base) {
                  var t = k2 <= bias ? tMin : k2 >= bias + tMax ? tMax : k2 - bias;
                  if (q < t) {
                    break;
                  }
                  var qMinusT = q - t;
                  var baseMinusT = base - t;
                  output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                  q = floor(qMinusT / baseMinusT);
                }
                output.push(stringFromCharCode(digitToBasic(q, 0)));
                bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                delta = 0;
                ++handledCPCount;
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
          ++delta;
          ++n;
        }
        return output.join("");
      };
      var toUnicode = function toUnicode2(input) {
        return mapDomain(input, function(string) {
          return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
        });
      };
      var toASCII = function toASCII2(input) {
        return mapDomain(input, function(string) {
          return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
        });
      };
      var punycode = {
        "version": "2.1.0",
        "ucs2": {
          "decode": ucs2decode,
          "encode": ucs2encode
        },
        "decode": decode,
        "encode": encode,
        "toASCII": toASCII,
        "toUnicode": toUnicode
      };
      var SCHEMES = {};
      function pctEncChar(chr) {
        var c = chr.charCodeAt(0);
        var e = void 0;
        if (c < 16)
          e = "%0" + c.toString(16).toUpperCase();
        else if (c < 128)
          e = "%" + c.toString(16).toUpperCase();
        else if (c < 2048)
          e = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
        else
          e = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
        return e;
      }
      function pctDecChars(str) {
        var newStr = "";
        var i = 0;
        var il = str.length;
        while (i < il) {
          var c = parseInt(str.substr(i + 1, 2), 16);
          if (c < 128) {
            newStr += String.fromCharCode(c);
            i += 3;
          } else if (c >= 194 && c < 224) {
            if (il - i >= 6) {
              var c2 = parseInt(str.substr(i + 4, 2), 16);
              newStr += String.fromCharCode((c & 31) << 6 | c2 & 63);
            } else {
              newStr += str.substr(i, 6);
            }
            i += 6;
          } else if (c >= 224) {
            if (il - i >= 9) {
              var _c = parseInt(str.substr(i + 4, 2), 16);
              var c3 = parseInt(str.substr(i + 7, 2), 16);
              newStr += String.fromCharCode((c & 15) << 12 | (_c & 63) << 6 | c3 & 63);
            } else {
              newStr += str.substr(i, 9);
            }
            i += 9;
          } else {
            newStr += str.substr(i, 3);
            i += 3;
          }
        }
        return newStr;
      }
      function _normalizeComponentEncoding(components, protocol) {
        function decodeUnreserved2(str) {
          var decStr = pctDecChars(str);
          return !decStr.match(protocol.UNRESERVED) ? str : decStr;
        }
        if (components.scheme)
          components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_SCHEME, "");
        if (components.userinfo !== void 0)
          components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.host !== void 0)
          components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.path !== void 0)
          components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.query !== void 0)
          components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.fragment !== void 0)
          components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        return components;
      }
      function _stripLeadingZeros(str) {
        return str.replace(/^0*(.*)/, "$1") || "0";
      }
      function _normalizeIPv4(host, protocol) {
        var matches = host.match(protocol.IPV4ADDRESS) || [];
        var _matches = slicedToArray(matches, 2), address = _matches[1];
        if (address) {
          return address.split(".").map(_stripLeadingZeros).join(".");
        } else {
          return host;
        }
      }
      function _normalizeIPv6(host, protocol) {
        var matches = host.match(protocol.IPV6ADDRESS) || [];
        var _matches2 = slicedToArray(matches, 3), address = _matches2[1], zone = _matches2[2];
        if (address) {
          var _address$toLowerCase$ = address.toLowerCase().split("::").reverse(), _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2), last = _address$toLowerCase$2[0], first = _address$toLowerCase$2[1];
          var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
          var lastFields = last.split(":").map(_stripLeadingZeros);
          var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]);
          var fieldCount = isLastFieldIPv4Address ? 7 : 8;
          var lastFieldsStart = lastFields.length - fieldCount;
          var fields = Array(fieldCount);
          for (var x2 = 0; x2 < fieldCount; ++x2) {
            fields[x2] = firstFields[x2] || lastFields[lastFieldsStart + x2] || "";
          }
          if (isLastFieldIPv4Address) {
            fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol);
          }
          var allZeroFields = fields.reduce(function(acc, field, index) {
            if (!field || field === "0") {
              var lastLongest = acc[acc.length - 1];
              if (lastLongest && lastLongest.index + lastLongest.length === index) {
                lastLongest.length++;
              } else {
                acc.push({ index, length: 1 });
              }
            }
            return acc;
          }, []);
          var longestZeroFields = allZeroFields.sort(function(a, b2) {
            return b2.length - a.length;
          })[0];
          var newHost = void 0;
          if (longestZeroFields && longestZeroFields.length > 1) {
            var newFirst = fields.slice(0, longestZeroFields.index);
            var newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
            newHost = newFirst.join(":") + "::" + newLast.join(":");
          } else {
            newHost = fields.join(":");
          }
          if (zone) {
            newHost += "%" + zone;
          }
          return newHost;
        } else {
          return host;
        }
      }
      var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
      var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === void 0;
      function parse(uriString) {
        var options2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var components = {};
        var protocol = options2.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        if (options2.reference === "suffix")
          uriString = (options2.scheme ? options2.scheme + ":" : "") + "//" + uriString;
        var matches = uriString.match(URI_PARSE);
        if (matches) {
          if (NO_MATCH_IS_UNDEFINED) {
            components.scheme = matches[1];
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = matches[7];
            components.fragment = matches[8];
            if (isNaN(components.port)) {
              components.port = matches[5];
            }
          } else {
            components.scheme = matches[1] || void 0;
            components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : void 0;
            components.host = uriString.indexOf("//") !== -1 ? matches[4] : void 0;
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = uriString.indexOf("?") !== -1 ? matches[7] : void 0;
            components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : void 0;
            if (isNaN(components.port)) {
              components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : void 0;
            }
          }
          if (components.host) {
            components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
          }
          if (components.scheme === void 0 && components.userinfo === void 0 && components.host === void 0 && components.port === void 0 && !components.path && components.query === void 0) {
            components.reference = "same-document";
          } else if (components.scheme === void 0) {
            components.reference = "relative";
          } else if (components.fragment === void 0) {
            components.reference = "absolute";
          } else {
            components.reference = "uri";
          }
          if (options2.reference && options2.reference !== "suffix" && options2.reference !== components.reference) {
            components.error = components.error || "URI is not a " + options2.reference + " reference.";
          }
          var schemeHandler = SCHEMES[(options2.scheme || components.scheme || "").toLowerCase()];
          if (!options2.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            if (components.host && (options2.domainHost || schemeHandler && schemeHandler.domainHost)) {
              try {
                components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
              } catch (e) {
                components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
              }
            }
            _normalizeComponentEncoding(components, URI_PROTOCOL);
          } else {
            _normalizeComponentEncoding(components, protocol);
          }
          if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(components, options2);
          }
        } else {
          components.error = components.error || "URI can not be parsed.";
        }
        return components;
      }
      function _recomposeAuthority(components, options2) {
        var protocol = options2.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        var uriTokens = [];
        if (components.userinfo !== void 0) {
          uriTokens.push(components.userinfo);
          uriTokens.push("@");
        }
        if (components.host !== void 0) {
          uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, function(_2, $1, $2) {
            return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
          }));
        }
        if (typeof components.port === "number" || typeof components.port === "string") {
          uriTokens.push(":");
          uriTokens.push(String(components.port));
        }
        return uriTokens.length ? uriTokens.join("") : void 0;
      }
      var RDS1 = /^\.\.?\//;
      var RDS2 = /^\/\.(\/|$)/;
      var RDS3 = /^\/\.\.(\/|$)/;
      var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
      function removeDotSegments(input) {
        var output = [];
        while (input.length) {
          if (input.match(RDS1)) {
            input = input.replace(RDS1, "");
          } else if (input.match(RDS2)) {
            input = input.replace(RDS2, "/");
          } else if (input.match(RDS3)) {
            input = input.replace(RDS3, "/");
            output.pop();
          } else if (input === "." || input === "..") {
            input = "";
          } else {
            var im = input.match(RDS5);
            if (im) {
              var s = im[0];
              input = input.slice(s.length);
              output.push(s);
            } else {
              throw new Error("Unexpected dot segment condition");
            }
          }
        }
        return output.join("");
      }
      function serialize(components) {
        var options2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var protocol = options2.iri ? IRI_PROTOCOL : URI_PROTOCOL;
        var uriTokens = [];
        var schemeHandler = SCHEMES[(options2.scheme || components.scheme || "").toLowerCase()];
        if (schemeHandler && schemeHandler.serialize)
          schemeHandler.serialize(components, options2);
        if (components.host) {
          if (protocol.IPV6ADDRESS.test(components.host)) {
          } else if (options2.domainHost || schemeHandler && schemeHandler.domainHost) {
            try {
              components.host = !options2.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
            } catch (e) {
              components.error = components.error || "Host's domain name can not be converted to " + (!options2.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
            }
          }
        }
        _normalizeComponentEncoding(components, protocol);
        if (options2.reference !== "suffix" && components.scheme) {
          uriTokens.push(components.scheme);
          uriTokens.push(":");
        }
        var authority = _recomposeAuthority(components, options2);
        if (authority !== void 0) {
          if (options2.reference !== "suffix") {
            uriTokens.push("//");
          }
          uriTokens.push(authority);
          if (components.path && components.path.charAt(0) !== "/") {
            uriTokens.push("/");
          }
        }
        if (components.path !== void 0) {
          var s = components.path;
          if (!options2.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
          }
          if (authority === void 0) {
            s = s.replace(/^\/\//, "/%2F");
          }
          uriTokens.push(s);
        }
        if (components.query !== void 0) {
          uriTokens.push("?");
          uriTokens.push(components.query);
        }
        if (components.fragment !== void 0) {
          uriTokens.push("#");
          uriTokens.push(components.fragment);
        }
        return uriTokens.join("");
      }
      function resolveComponents(base2, relative) {
        var options2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        var skipNormalization = arguments[3];
        var target = {};
        if (!skipNormalization) {
          base2 = parse(serialize(base2, options2), options2);
          relative = parse(serialize(relative, options2), options2);
        }
        options2 = options2 || {};
        if (!options2.tolerant && relative.scheme) {
          target.scheme = relative.scheme;
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
          } else {
            if (!relative.path) {
              target.path = base2.path;
              if (relative.query !== void 0) {
                target.query = relative.query;
              } else {
                target.query = base2.query;
              }
            } else {
              if (relative.path.charAt(0) === "/") {
                target.path = removeDotSegments(relative.path);
              } else {
                if ((base2.userinfo !== void 0 || base2.host !== void 0 || base2.port !== void 0) && !base2.path) {
                  target.path = "/" + relative.path;
                } else if (!base2.path) {
                  target.path = relative.path;
                } else {
                  target.path = base2.path.slice(0, base2.path.lastIndexOf("/") + 1) + relative.path;
                }
                target.path = removeDotSegments(target.path);
              }
              target.query = relative.query;
            }
            target.userinfo = base2.userinfo;
            target.host = base2.host;
            target.port = base2.port;
          }
          target.scheme = base2.scheme;
        }
        target.fragment = relative.fragment;
        return target;
      }
      function resolve(baseURI, relativeURI, options2) {
        var schemelessOptions = assign({ scheme: "null" }, options2);
        return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
      }
      function normalize(uri, options2) {
        if (typeof uri === "string") {
          uri = serialize(parse(uri, options2), options2);
        } else if (typeOf(uri) === "object") {
          uri = parse(serialize(uri, options2), options2);
        }
        return uri;
      }
      function equal(uriA, uriB, options2) {
        if (typeof uriA === "string") {
          uriA = serialize(parse(uriA, options2), options2);
        } else if (typeOf(uriA) === "object") {
          uriA = serialize(uriA, options2);
        }
        if (typeof uriB === "string") {
          uriB = serialize(parse(uriB, options2), options2);
        } else if (typeOf(uriB) === "object") {
          uriB = serialize(uriB, options2);
        }
        return uriA === uriB;
      }
      function escapeComponent(str, options2) {
        return str && str.toString().replace(!options2 || !options2.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
      }
      function unescapeComponent(str, options2) {
        return str && str.toString().replace(!options2 || !options2.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
      }
      var handler = {
        scheme: "http",
        domainHost: true,
        parse: function parse2(components, options2) {
          if (!components.host) {
            components.error = components.error || "HTTP URIs must have a host.";
          }
          return components;
        },
        serialize: function serialize2(components, options2) {
          var secure = String(components.scheme).toLowerCase() === "https";
          if (components.port === (secure ? 443 : 80) || components.port === "") {
            components.port = void 0;
          }
          if (!components.path) {
            components.path = "/";
          }
          return components;
        }
      };
      var handler$1 = {
        scheme: "https",
        domainHost: handler.domainHost,
        parse: handler.parse,
        serialize: handler.serialize
      };
      function isSecure(wsComponents) {
        return typeof wsComponents.secure === "boolean" ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
      }
      var handler$2 = {
        scheme: "ws",
        domainHost: true,
        parse: function parse2(components, options2) {
          var wsComponents = components;
          wsComponents.secure = isSecure(wsComponents);
          wsComponents.resourceName = (wsComponents.path || "/") + (wsComponents.query ? "?" + wsComponents.query : "");
          wsComponents.path = void 0;
          wsComponents.query = void 0;
          return wsComponents;
        },
        serialize: function serialize2(wsComponents, options2) {
          if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
            wsComponents.port = void 0;
          }
          if (typeof wsComponents.secure === "boolean") {
            wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
            wsComponents.secure = void 0;
          }
          if (wsComponents.resourceName) {
            var _wsComponents$resourc = wsComponents.resourceName.split("?"), _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2), path2 = _wsComponents$resourc2[0], query = _wsComponents$resourc2[1];
            wsComponents.path = path2 && path2 !== "/" ? path2 : void 0;
            wsComponents.query = query;
            wsComponents.resourceName = void 0;
          }
          wsComponents.fragment = void 0;
          return wsComponents;
        }
      };
      var handler$3 = {
        scheme: "wss",
        domainHost: handler$2.domainHost,
        parse: handler$2.parse,
        serialize: handler$2.serialize
      };
      var O2 = {};
      var isIRI = true;
      var UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~" + (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : "") + "]";
      var HEXDIG$$ = "[0-9A-Fa-f]";
      var PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$));
      var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
      var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
      var VCHAR$$ = merge2(QTEXT$$, '[\\"\\\\]');
      var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
      var UNRESERVED = new RegExp(UNRESERVED$$, "g");
      var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
      var NOT_LOCAL_PART = new RegExp(merge2("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
      var NOT_HFNAME = new RegExp(merge2("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
      var NOT_HFVALUE = NOT_HFNAME;
      function decodeUnreserved(str) {
        var decStr = pctDecChars(str);
        return !decStr.match(UNRESERVED) ? str : decStr;
      }
      var handler$4 = {
        scheme: "mailto",
        parse: function parse$$1(components, options2) {
          var mailtoComponents = components;
          var to2 = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
          mailtoComponents.path = void 0;
          if (mailtoComponents.query) {
            var unknownHeaders = false;
            var headers = {};
            var hfields = mailtoComponents.query.split("&");
            for (var x2 = 0, xl = hfields.length; x2 < xl; ++x2) {
              var hfield = hfields[x2].split("=");
              switch (hfield[0]) {
                case "to":
                  var toAddrs = hfield[1].split(",");
                  for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                    to2.push(toAddrs[_x]);
                  }
                  break;
                case "subject":
                  mailtoComponents.subject = unescapeComponent(hfield[1], options2);
                  break;
                case "body":
                  mailtoComponents.body = unescapeComponent(hfield[1], options2);
                  break;
                default:
                  unknownHeaders = true;
                  headers[unescapeComponent(hfield[0], options2)] = unescapeComponent(hfield[1], options2);
                  break;
              }
            }
            if (unknownHeaders)
              mailtoComponents.headers = headers;
          }
          mailtoComponents.query = void 0;
          for (var _x2 = 0, _xl2 = to2.length; _x2 < _xl2; ++_x2) {
            var addr = to2[_x2].split("@");
            addr[0] = unescapeComponent(addr[0]);
            if (!options2.unicodeSupport) {
              try {
                addr[1] = punycode.toASCII(unescapeComponent(addr[1], options2).toLowerCase());
              } catch (e) {
                mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
              }
            } else {
              addr[1] = unescapeComponent(addr[1], options2).toLowerCase();
            }
            to2[_x2] = addr.join("@");
          }
          return mailtoComponents;
        },
        serialize: function serialize$$1(mailtoComponents, options2) {
          var components = mailtoComponents;
          var to2 = toArray(mailtoComponents.to);
          if (to2) {
            for (var x2 = 0, xl = to2.length; x2 < xl; ++x2) {
              var toAddr = String(to2[x2]);
              var atIdx = toAddr.lastIndexOf("@");
              var localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar);
              var domain = toAddr.slice(atIdx + 1);
              try {
                domain = !options2.iri ? punycode.toASCII(unescapeComponent(domain, options2).toLowerCase()) : punycode.toUnicode(domain);
              } catch (e) {
                components.error = components.error || "Email address's domain name can not be converted to " + (!options2.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
              }
              to2[x2] = localPart + "@" + domain;
            }
            components.path = to2.join(",");
          }
          var headers = mailtoComponents.headers = mailtoComponents.headers || {};
          if (mailtoComponents.subject)
            headers["subject"] = mailtoComponents.subject;
          if (mailtoComponents.body)
            headers["body"] = mailtoComponents.body;
          var fields = [];
          for (var name2 in headers) {
            if (headers[name2] !== O2[name2]) {
              fields.push(name2.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name2].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
            }
          }
          if (fields.length) {
            components.query = fields.join("&");
          }
          return components;
        }
      };
      var URN_PARSE = /^([^\:]+)\:(.*)/;
      var handler$5 = {
        scheme: "urn",
        parse: function parse$$1(components, options2) {
          var matches = components.path && components.path.match(URN_PARSE);
          var urnComponents = components;
          if (matches) {
            var scheme = options2.scheme || urnComponents.scheme || "urn";
            var nid = matches[1].toLowerCase();
            var nss = matches[2];
            var urnScheme = scheme + ":" + (options2.nid || nid);
            var schemeHandler = SCHEMES[urnScheme];
            urnComponents.nid = nid;
            urnComponents.nss = nss;
            urnComponents.path = void 0;
            if (schemeHandler) {
              urnComponents = schemeHandler.parse(urnComponents, options2);
            }
          } else {
            urnComponents.error = urnComponents.error || "URN can not be parsed.";
          }
          return urnComponents;
        },
        serialize: function serialize$$1(urnComponents, options2) {
          var scheme = options2.scheme || urnComponents.scheme || "urn";
          var nid = urnComponents.nid;
          var urnScheme = scheme + ":" + (options2.nid || nid);
          var schemeHandler = SCHEMES[urnScheme];
          if (schemeHandler) {
            urnComponents = schemeHandler.serialize(urnComponents, options2);
          }
          var uriComponents = urnComponents;
          var nss = urnComponents.nss;
          uriComponents.path = (nid || options2.nid) + ":" + nss;
          return uriComponents;
        }
      };
      var UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
      var handler$6 = {
        scheme: "urn:uuid",
        parse: function parse2(urnComponents, options2) {
          var uuidComponents = urnComponents;
          uuidComponents.uuid = uuidComponents.nss;
          uuidComponents.nss = void 0;
          if (!options2.tolerant && (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID))) {
            uuidComponents.error = uuidComponents.error || "UUID is not valid.";
          }
          return uuidComponents;
        },
        serialize: function serialize2(uuidComponents, options2) {
          var urnComponents = uuidComponents;
          urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
          return urnComponents;
        }
      };
      SCHEMES[handler.scheme] = handler;
      SCHEMES[handler$1.scheme] = handler$1;
      SCHEMES[handler$2.scheme] = handler$2;
      SCHEMES[handler$3.scheme] = handler$3;
      SCHEMES[handler$4.scheme] = handler$4;
      SCHEMES[handler$5.scheme] = handler$5;
      SCHEMES[handler$6.scheme] = handler$6;
      exports2.SCHEMES = SCHEMES;
      exports2.pctEncChar = pctEncChar;
      exports2.pctDecChars = pctDecChars;
      exports2.parse = parse;
      exports2.removeDotSegments = removeDotSegments;
      exports2.serialize = serialize;
      exports2.resolveComponents = resolveComponents;
      exports2.resolve = resolve;
      exports2.normalize = normalize;
      exports2.equal = equal;
      exports2.escapeComponent = escapeComponent;
      exports2.unescapeComponent = unescapeComponent;
      Object.defineProperty(exports2, "__esModule", { value: true });
    });
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uri = require_uri_all();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a, _b, _c, _d, _e2, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e2 = o.strictSchema) !== null && _e2 !== void 0 ? _e2 : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv2 = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = {};
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
      }
      validate(schemaKeyRef, data) {
        let v2;
        if (typeof schemaKeyRef == "string") {
          v2 = this.getSchema(schemaKeyRef);
          if (!v2)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v2 = this.compile(schemaKeyRef);
        }
        const valid2 = v2(data);
        if (!("$async" in v2))
          this.errors = v2.errors;
        return valid2;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta);
        }
        async function _loadSchema(ref) {
          const p2 = this._loading[ref];
          if (p2)
            return p2;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid2 = this.validate($schema, schema);
        if (!valid2 && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid2;
      }
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey = schemaKeyRef;
            this._cache.delete(cacheKey);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k2) => addRule.call(this, k2, definition) : (k2) => definition.type.forEach((t) => addRule.call(this, k2, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      addFormat(name2, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name2] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    exports.default = Ajv2;
    Ajv2.ValidationError = validation_error_1.default;
    Ajv2.MissingRefError = ref_error_1.default;
    function checkOptions(checkOpts, options2, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options2)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name2 in this.opts.formats) {
        const format = this.opts.formats[name2];
        if (format)
          this.addFormat(name2, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.callRef = exports.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self: self2 } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self2, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
          const v2 = getValidate(cxt, sch);
          callRef(cxt, v2, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid2 = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid2);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid2);
        }
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    exports.getValidate = getValidate;
    function callRef(cxt, v2, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid2 = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v2, passCxt)}`);
          addEvaluatedFrom(v2);
          if (!allErrors)
            gen.assign(valid2, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid2, false);
        });
        cxt.ok(valid2);
      }
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v2, passCxt), () => addEvaluatedFrom(v2), () => addErrorsFrom(v2));
      }
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      function addEvaluatedFrom(source) {
        var _a;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
    }
    exports.callRef = callRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
      params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        const regExp = $data ? (0, codegen_1._)`(new RegExp(${schemaCode}, ${u}))` : (0, code_1.usePattern)(cxt, schema);
        cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
      params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid2 = gen.let("valid", true);
            cxt.block$data(valid2, () => loopUntilMissing(missing, valid2));
            cxt.ok(valid2);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        function loopUntilMissing(missing, valid2) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid2, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid2), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: ({ params: { i, j: j2 } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j2} and ${i} are identical)`,
      params: ({ params: { i, j: j2 } }) => (0, codegen_1._)`{i: ${i}, j: ${j2}}`
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid2 = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid2, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid2);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j2 = gen.let("j");
          cxt.setParams({ i, j: j2 });
          gen.assign(valid2, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j2));
        }
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j2) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j2, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid2, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        function loopN2(i, j2) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j2} = ${i}; ${j2}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j2}])`, () => {
            cxt.error();
            gen.assign(valid2, false).break(outer);
          })));
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to constant",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
    };
    var def = {
      keyword: "const",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
        let valid2;
        if (useLoop || $data) {
          valid2 = gen.let("valid");
          cxt.block$data(valid2, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid2 = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid2);
        function loopEnum() {
          gen.assign(valid2, false);
          gen.forOf("v", schemaCode, (v2) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v2})`, () => gen.assign(valid2, true).break()));
        }
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      limitNumber_1.default,
      multipleOf_1.default,
      limitLength_1.default,
      pattern_1.default,
      limitProperties_1.default,
      required_1.default,
      limitItems_1.default,
      uniqueItems_1.default,
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid2 = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid2), () => validateItems(valid2));
        cxt.ok(valid2);
      }
      function validateItems(valid2) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid2);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid2), () => gen.break());
        });
      }
    }
    exports.validateAdditionalItems = validateAdditionalItems;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid2 = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid2));
        cxt.ok(valid2);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
    }
    exports.validateTuple = validateTuple;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
      params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid2 = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid2, () => gen.if(valid2, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid2, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid2, false);
          validateItemsWithCount();
        }
        cxt.result(valid2, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid2, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid2, false).break());
            if (min === 1)
              gen.assign(valid2, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid2, true));
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports.error = {
      message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      },
      params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    exports.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid2 = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties), () => {
          const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid2);
          cxt.mergeValidEvaluated(schCxt, valid2);
        }, () => gen.var(valid2, true));
        cxt.ok(valid2);
      }
    }
    exports.validateSchemaDeps = validateSchemaDeps;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "property name must be valid",
      params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid2 = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid2);
          gen.if((0, codegen_1.not)(valid2), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid2);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error = {
      message: "must NOT have additional properties",
      params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p2) => (0, codegen_1._)`${key} === ${p2}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p2) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p2)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid2 = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid2, false);
              gen.if((0, codegen_1.not)(valid2), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid2);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid2), () => gen.break());
            }
          }
        }
        function applyAdditionalSchema(key, valid2, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid2);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p2) => !(0, util_1.alwaysValidSchema)(it, schema[p2]));
        if (properties.length === 0)
          return;
        const valid2 = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid2, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid2);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid2);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p2) => (0, util_1.alwaysValidSchema)(it, schema[p2]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid2 = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid2, true);
              validateProperties(pat);
              gen.if(valid2);
            }
          }
        }
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid2);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid2), () => gen.break());
              }
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid2 = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid2);
        cxt.failResult(valid2, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "must match exactly one schema in oneOf",
      params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid2 = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid2, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid2}`).assign(valid2, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid2, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid2 = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid2);
          cxt.ok(valid2);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
      params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid2 = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid2, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid2, schValid);
            cxt.mergeValidEvaluated(schCxt, valid2);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    exports.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self: self2 } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self2.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
        }
        function validateFormat() {
          const formatDef = self2.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self2.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
          }
          function getFormat(fmtDef) {
            const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.contentVocabulary = exports.metadataVocabulary = void 0;
    exports.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft7.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft7Vocabularies = [
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary
    ];
    exports.default = draft7Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError = exports.DiscrError || (exports.DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var error = {
      message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
      params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid2 = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid2);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
            gen.assign(valid2, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
          gen.endIf();
        }
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        function getMapping() {
          var _a;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, sch === null || sch === void 0 ? void 0 : sch.$ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
            }
            const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required }) {
            return Array.isArray(required) && required.includes(tagName);
          }
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports, module) {
    module.exports = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "http://json-schema.org/draft-07/schema#",
      title: "Core schema meta-schema",
      definitions: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $ref: "#" }
        },
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      },
      type: ["object", "boolean"],
      properties: {
        $id: {
          type: "string",
          format: "uri-reference"
        },
        $schema: {
          type: "string",
          format: "uri"
        },
        $ref: {
          type: "string",
          format: "uri-reference"
        },
        $comment: {
          type: "string"
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        readOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/definitions/nonNegativeInteger" },
        minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        additionalItems: { $ref: "#" },
        items: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
          default: true
        },
        maxItems: { $ref: "#/definitions/nonNegativeInteger" },
        minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        contains: { $ref: "#" },
        maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
        minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: { $ref: "#" },
        definitions: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependencies: {
          type: "object",
          additionalProperties: {
            anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
          }
        },
        propertyNames: { $ref: "#" },
        const: true,
        enum: {
          type: "array",
          items: true,
          minItems: 1,
          uniqueItems: true
        },
        type: {
          anyOf: [
            { $ref: "#/definitions/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/definitions/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        format: { type: "string" },
        contentMediaType: { type: "string" },
        contentEncoding: { type: "string" },
        if: { $ref: "#" },
        then: { $ref: "#" },
        else: { $ref: "#" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" }
      },
      default: true
    };
  }
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({
  "node_modules/ajv/dist/ajv.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var core_1 = require_core();
    var draft7_1 = require_draft7();
    var discriminator_1 = require_discriminator();
    var draft7MetaSchema = require_json_schema_draft_07();
    var META_SUPPORT_DATA = ["/properties"];
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
    var Ajv2 = class extends core_1.default {
      _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v2) => this.addVocabulary(v2));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
          return;
        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    module.exports = exports = Ajv2;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv2;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
  }
});

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({
  "node_modules/ajv-formats/dist/formats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
    function fmtDef(validate2, compare) {
      return { validate: validate2, compare };
    }
    exports.fullFormats = {
      date: fmtDef(date, compareDate),
      time: fmtDef(time, compareTime),
      "date-time": fmtDef(date_time, compareDateTime),
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex,
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      byte,
      int32: { type: "number", validate: validateInt32 },
      int64: { type: "number", validate: validateInt64 },
      float: { type: "number", validate: validateNumber },
      double: { type: "number", validate: validateNumber },
      password: true,
      binary: true
    };
    exports.fastFormats = {
      ...exports.fullFormats,
      date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
      time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareTime),
      "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    exports.formatNames = Object.keys(exports.fullFormats);
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date(str) {
      const matches = DATE.exec(str);
      if (!matches)
        return false;
      const year = +matches[1];
      const month = +matches[2];
      const day = +matches[3];
      return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
    }
    function compareDate(d1, d2) {
      if (!(d1 && d2))
        return void 0;
      if (d1 > d2)
        return 1;
      if (d1 < d2)
        return -1;
      return 0;
    }
    var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
    function time(str, withTimeZone) {
      const matches = TIME.exec(str);
      if (!matches)
        return false;
      const hour = +matches[1];
      const minute = +matches[2];
      const second = +matches[3];
      const timeZone = matches[5];
      return (hour <= 23 && minute <= 59 && second <= 59 || hour === 23 && minute === 59 && second === 60) && (!withTimeZone || timeZone !== "");
    }
    function compareTime(t1, t2) {
      if (!(t1 && t2))
        return void 0;
      const a1 = TIME.exec(t1);
      const a2 = TIME.exec(t2);
      if (!(a1 && a2))
        return void 0;
      t1 = a1[1] + a1[2] + a1[3] + (a1[4] || "");
      t2 = a2[1] + a2[2] + a2[3] + (a2[4] || "");
      if (t1 > t2)
        return 1;
      if (t1 < t2)
        return -1;
      return 0;
    }
    var DATE_TIME_SEPARATOR = /t|\s/i;
    function date_time(str) {
      const dateTime = str.split(DATE_TIME_SEPARATOR);
      return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1], true);
    }
    function compareDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
      const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
      const res = compareDate(d1, d2);
      if (res === void 0)
        return void 0;
      return res || compareTime(t1, t2);
    }
    var NOT_URI_FRAGMENT = /\/|:/;
    var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function uri(str) {
      return NOT_URI_FRAGMENT.test(str) && URI.test(str);
    }
    var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function byte(str) {
      BYTE.lastIndex = 0;
      return BYTE.test(str);
    }
    var MIN_INT32 = -(2 ** 31);
    var MAX_INT32 = 2 ** 31 - 1;
    function validateInt32(value) {
      return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
    }
    function validateInt64(value) {
      return Number.isInteger(value);
    }
    function validateNumber() {
      return true;
    }
    var Z_ANCHOR = /[^\\]\\Z/;
    function regex(str) {
      if (Z_ANCHOR.test(str))
        return false;
      try {
        new RegExp(str);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
});

// node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS({
  "node_modules/ajv-formats/dist/limit.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatLimitDefinition = void 0;
    var ajv_1 = require_ajv();
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error = {
      message: ({ keyword, schemaCode }) => codegen_1.str`should be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => codegen_1._`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    exports.formatLimitDefinition = {
      keyword: Object.keys(KWDs),
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, keyword, it } = cxt;
        const { opts, self: self2 } = it;
        if (!opts.validateFormats)
          return;
        const fCxt = new ajv_1.KeywordCxt(it, self2.RULES.all.format.definition, "format");
        if (fCxt.$data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self2.formats,
            code: opts.code.formats
          });
          const fmt = gen.const("fmt", codegen_1._`${fmts}[${fCxt.schemaCode}]`);
          cxt.fail$data(codegen_1.or(codegen_1._`typeof ${fmt} != "object"`, codegen_1._`${fmt} instanceof RegExp`, codegen_1._`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
        }
        function validateFormat() {
          const format = fCxt.schema;
          const fmtDef = self2.formats[format];
          if (!fmtDef || fmtDef === true)
            return;
          if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
            throw new Error(`"${keyword}": format "${format}" does not define "compare" function`);
          }
          const fmt = gen.scopeValue("formats", {
            key: format,
            ref: fmtDef,
            code: opts.code.formats ? codegen_1._`${opts.code.formats}${codegen_1.getProperty(format)}` : void 0
          });
          cxt.fail$data(compareCode(fmt));
        }
        function compareCode(fmt) {
          return codegen_1._`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    var formatLimitPlugin = (ajv2) => {
      ajv2.addKeyword(exports.formatLimitDefinition);
      return ajv2;
    };
    exports.default = formatLimitPlugin;
  }
});

// node_modules/ajv-formats/dist/index.js
var require_dist = __commonJS({
  "node_modules/ajv-formats/dist/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var formats_1 = require_formats();
    var limit_1 = require_limit();
    var codegen_1 = require_codegen();
    var fullName = new codegen_1.Name("fullFormats");
    var fastName = new codegen_1.Name("fastFormats");
    var formatsPlugin = (ajv2, opts = { keywords: true }) => {
      if (Array.isArray(opts)) {
        addFormats2(ajv2, opts, formats_1.fullFormats, fullName);
        return ajv2;
      }
      const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
      const list = opts.formats || formats_1.formatNames;
      addFormats2(ajv2, list, formats, exportName);
      if (opts.keywords)
        limit_1.default(ajv2);
      return ajv2;
    };
    formatsPlugin.get = (name2, mode = "full") => {
      const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
      const f = formats[name2];
      if (!f)
        throw new Error(`Unknown format "${name2}"`);
      return f;
    };
    function addFormats2(ajv2, list, fs, exportName) {
      var _a;
      var _b;
      (_a = (_b = ajv2.opts.code).formats) !== null && _a !== void 0 ? _a : _b.formats = codegen_1._`require("ajv-formats/dist/formats").${exportName}`;
      for (const f of list)
        ajv2.addFormat(f, fs[f]);
    }
    module.exports = exports = formatsPlugin;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = formatsPlugin;
  }
});

// src/common/utils/path.ts
var fullSuffix = (fileName = "") => fileName.split(".").slice(1);
var suffix = (fileName = "") => {
  const suffix2 = fullSuffix(fileName);
  return suffix2.join(".");
};

// node_modules/esmpile/dist/index.esm.js
var Ee = Object.defineProperty;
var U = (t, e) => {
  for (var s in e)
    Ee(t, s, { get: e[s], enumerable: true });
};
var b = {};
U(b, { absolute: () => y, base: () => K, extension: () => m, get: () => p, noBase: () => x, pathId: () => R, url: () => j });
var w = "application/javascript";
var H = (t) => !t || t === "application/javascript";
var L = { js: w, mjs: w, cjs: w, ts: "text/typescript", json: "application/json", html: "text/html", css: "text/css", txt: "text/plain", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", mp3: "audio/mpeg", mp4: "video/mp4", webm: "video/webm", ogg: "application/ogg", wav: "audio/wav" };
var S = (t) => L[t];
var M = { nodeModules: { nodeModules: "node_modules", relativeTo: "./" } };
var v = "://";
var p = (t, e = "", s = false, n = false) => {
  if (j(t))
    return t;
  let i = "", o = (l) => (i = l.includes(v) ? l.split(v).splice(0, 1) : void 0, i ? l.replace(`${i}${v}`, "") : l);
  t.includes(v) && (t = o(t)), e.includes(v) && (e = o(e)), s || (e = e.split("/").filter((l) => l != "..").join("/")), e[e.length - 1] === "/" && (e = e.slice(0, -1));
  let r = e.split("/");
  if (r.length === 1 && r[0] === "" && (r = []), !n) {
    let l = r.pop();
    if (l) {
      let f = l.split(".");
      (f.length == 1 || f.length > 1 && f.includes("")) && r.push(l);
    }
  }
  let d = t.split("/").filter((l, f) => !!l).filter((l, f) => l === ".." ? (r.pop(), false) : l !== "."), u = [...r, ...d].join("/");
  return i ? i + "://" + u : u;
};
function y(t, e) {
  let s = t[0] !== ".", n = j(t);
  return s && (e || !n);
}
function j(t) {
  try {
    return new URL(t), true;
  } catch {
    return false;
  }
}
var m = (t) => {
  let e = t.split("/").slice(-1)[0].split(".").slice(-1)[0];
  if (L[e])
    return e;
};
var K = (t) => t.substring(0, t.lastIndexOf("/"));
var x = (t, e, s) => {
  t = globalThis.location ? t.replace(`${K(globalThis.location.href)}/`, "./") : t;
  let n = y(t, true), i = e.relativeTo ?? M.nodeModules.relativeTo, o = e.nodeModules ?? M.nodeModules.nodeModules;
  if (n)
    return t;
  {
    let r = t;
    return s && (r = r.replace(`${o}/`, "")), r = r.replace(`${i.split("/").slice(0, -1).join("/")}/`, ""), r[0] !== "." && (r = `./${r}`), r;
  }
};
var R = (t, e) => p(x(t, e));
var C = {};
U(C, { getMainPath: () => Z, path: () => k, resolve: () => Q, transformation: () => E });
var k = (t) => {
  let e = t.nodeModules ?? M.nodeModules.nodeModules, s = t.relativeTo ?? M.nodeModules.relativeTo;
  return p(e, s);
};
var Q = async (t, e) => {
  let s = k(e), n = t.split("/"), i = p(t, s);
  if (n.length > 1) {
    if (m(i))
      return i;
    i += "/package.json";
  }
  return await Z(t, i, e).catch((o) => {
    console.warn(`${i} does not exist or is not at the root of the project.`);
  });
};
var X = (t, e, s) => p(t, s, false, e.split("/").length === 1);
var Te = (t, e = t) => X("package.json", t, e);
var Z = async (t, e = t, s = {}) => {
  let n = await Ue(t, e, s);
  if (!n)
    return e;
  let i = n.module || n.main || "index.js";
  return X(i, t, e);
};
var Ue = async (t, e = t, s) => {
  let n = Te(t, e);
  return (await (j(n) ? import(n, { assert: { type: "json" } }) : import(new URL(n, window.location.href).href, { assert: { type: "json" } }))).default;
};
var E = { name: "node_modules", handler: Q };
var F = {};
U(F, { get: () => N });
var te = ["ts", "js"];
var ee = [...te, E];
var se = (t) => {
  let e = m(t), s = y(t), n = s ? t.split("/").length === 1 : false, i = !e;
  if (!n && s && i) {
    let o = te.map((r) => ({ extension: r, name: `${E.name} + ${r}`, handler: E.handler }));
    return t.split("/").length === 1 ? [E, ...o] : [...o, E];
  } else
    return s ? [...ee].reverse() : i ? [...ee] : [];
};
var ve = "was not resolved locally. You can provide a direct reference to use in";
var O = (t, e = t) => new Error(`${t} ${ve} options.filesystem._fallbacks['${e}'].`);
var ne = (t, e = "js") => {
  let s = y(t), n = t.split("/"), i = m(t);
  return (!s || s && n.length > 1) && !i ? `${t}.${e}` : t;
};
var oe = async (t, e, s, n) => {
  let i = typeof e;
  if (i === "string" && (!n || n === "string"))
    return ne(t, e);
  if (i === "object" && (!n || n === "object"))
    return e.extension && (t = ne(t, e.extension)), await e.handler(t, s).catch((o) => {
      throw O(t, x(t, s));
    });
};
var $e = (t) => {
  let e;
  try {
    e = new URL(t).href;
  } catch {
    e = p(t, globalThis.location.href);
  }
  return e;
};
var re = async (t, e = {}) => {
  e.fetch || (e.fetch = {}), e.fetch.mode || (e.fetch.mode = "cors");
  let s = $e(t), n = e?.callbacks?.progress?.fetch, i = await Be(s, e, { path: t, progress: n });
  if (!i.buffer)
    throw new Error("No response received.");
  let o = i.type.split(";")[0];
  return { ...i, url: s, type: o };
};
var Be = async (t, e = {}, s) => {
  let n = s.path ?? t, i = p(x(n, e)), o = await globalThis.fetch(t, e.fetch), r = 0, a = [], c = 0, d = typeof s.progress == "function", u = await new Promise(async (f) => {
    if (o) {
      c = parseInt(o.headers.get("Content-Length"), 10);
      let h = o.headers.get("Content-Type");
      if (globalThis.REMOTEESM_NODE) {
        let g = await o.arrayBuffer();
        f({ buffer: g, type: h });
      } else {
        let g = o.body.getReader(), $ = async ({ done: B, value: q }) => {
          if (B) {
            let z = {};
            typeof h == "string" && (z.type = h);
            let xe = await new Blob(a, z).arrayBuffer();
            f({ buffer: new Uint8Array(xe), type: h });
            return;
          }
          r += q.length;
          let ye = q;
          return a.push(ye), d && s.progress(i, r, c, null, null, o.headers.get("Range")), g.read().then($);
        };
        g.read().then($);
      }
    } else
      console.warn("Response not received!", e.headers), f(void 0);
  }), l = { response: o, ...u };
  if (d) {
    let f = [null, null];
    o.ok ? f[0] = l : f[1] = l, s.progress(i, r, c, ...f, o.headers.get("Range"));
  }
  return l;
};
var ae = new TextDecoder("utf-8");
var P = async (t, e, s) => {
  let n = { uri: t, text: { original: "", updated: "" }, buffer: null };
  if (globalThis.REMOTEESM_NODE) {
    let i = t.replace("file://", "");
    n.buffer = globalThis.fs.readFileSync(i), n.text.original = n.text.updated = ae.decode(n.buffer);
  } else {
    let i = await re(t, e), o = i.response;
    if (n.response = o, o.ok) {
      if (s) {
        let r = o.headers.get("Content-Type");
        if (!r.includes(s))
          throw new Error(`Expected Content Type ${s} but received ${r} for  ${t}`);
      }
      n.buffer = i.buffer, n.text.original = n.text.updated = ae.decode(n.buffer);
    } else
      throw new Error(o.statusText);
  }
  return n;
};
var le = async (t, e, s) => {
  let n = se(t), i;
  if (n.length > 0) {
    do {
      let o = n.shift(), r = o?.name ?? o, a = (l) => {
        e.debug && console.error(`Import using ${r ?? o} transformation failed for ${t}`);
      }, c = await oe(t, o, e), d = p(c, e.relativeTo);
      i = await s(d, e, o ? null : "application/javascript").then((l) => (e.debug && console.warn(`Import using ${r ?? o} transformation succeeded for ${t}`), l)).catch(a);
    } while (!i && n.length > 0);
    if (!i)
      throw new Error(`No valid transformation found for ${t}`);
  } else
    i = await s(p(t, e.relativeTo), e);
  return i;
};
var ce = async (t, e) => {
  let n = m(t) === "json", i = {};
  return await le(t, e, async (o) => {
    i.uri = o, i.result = await (n ? import(o, { assert: { type: "json" } }) : import(o));
  }), i;
};
var de = async (t, e) => await le(t, e, P);
var Se = /\/\/# sourceMappingURL=(.*\.map)/;
var N = async (t, e, s, n = true) => {
  if (s || (s = (await P(t, e)).text.original), s) {
    let i = s.match(Se);
    if (i) {
      let o = async () => {
        let r = p(i[1], t), c = (await P(r, e)).text.original;
        c.slice(0, 3) === ")]}" && (console.warn("Removing source map invalidation characters"), c = c.substring(c.indexOf(`
`)));
        let d = { result: JSON.parse(c) };
        return d.text = { original: c, updated: null }, d;
      };
      return n ? o() : o;
    }
  }
};
var J = {};
U(J, { script: () => A });
var A = async (t) => await new Promise((e, s) => {
  let n = document.createElement("script"), i = false;
  n.onload = n.onreadystatechange = function() {
    !i && (!this.readyState || this.readyState == "complete") && (i = true, e(window));
  }, n.onerror = s, n.src = t, document.body.insertAdjacentElement("beforeend", n);
});
var we = {};
U(we, { default: () => T, get: () => I });
var V = {};
U(V, { datauri: () => Pe, objecturl: () => _e });
function Re(t) {
  let e = "", s = new Uint8Array(t), n = s.byteLength;
  for (let i = 0; i < n; i++)
    e += String.fromCharCode(s[i]);
  return window.btoa(e);
}
var ue = (t, e = w, s = false) => {
  let i = (typeof t == "string" ? "text" : "buffer") === "buffer" ? Re(t) : btoa(s ? unescape(encodeURIComponent(t)) : t);
  return `data:${e};base64,` + i;
};
function pe(t, e = w) {
  typeof t == "string" && (t = new TextEncoder().encode(t));
  let s = new Blob([t], { type: e });
  return URL.createObjectURL(s);
}
var Pe = async (...t) => await he(ue, ...t);
var _e = async (...t) => await he(pe, ...t);
var Ie = async (t, e) => await (e ? import(t, { assert: { type: "json" } }) : import(t)).catch((s) => {
  throw s;
});
async function he(t, e, s, n) {
  let i, o;
  if (!n) {
    let a = m(s);
    n = S(a);
  }
  let r = n === "application/json";
  try {
    i = t(e, n), o = await Ie(i, r);
  } catch (a) {
    i = t(e, n, true), H(n) ? o = i = await Le(i, a).catch((c) => {
      throw c;
    }) : o = i;
  }
  return { encoded: i, module: o };
}
async function Le(t, e) {
  if (e.message.includes("The string to be encoded contains characters outside of the Latin1 range.") || e.message.includes("Cannot set properties of undefined"))
    return await A(t);
  throw e;
}
var De = { compilerOptions: { target: "ES2015", module: "ES2020", strict: false, esModuleInterop: true } };
var me = (t, e = "text") => {
  if (window.ts) {
    let s = e !== "buffer" ? t[e].updated : new TextDecoder().decode(t[e]);
    return t.text.updated = window.ts.transpile(s, De.compilerOptions), e === "buffer" ? (t.buffer = new TextEncoder().encode(t.text.updated), t.buffer) : t.text.updated;
  } else
    throw new Error("Must load TypeScript extension to compile TypeScript files using remoteESM.load.script(...);");
};
var Y;
var ge;
var be;
var Ne = new Promise(async (t, e) => {
  try {
    if (typeof process == "object") {
      if (Y || (globalThis.REMOTEESM_NODE = true, Y = globalThis.fetch = (await import("node-fetch")).default, typeof globalThis.fetch != "function" && (globalThis.fetch = Y)), ge || (ge = globalThis.fs = (await import("fs")).default), !be) {
        let s = (await import("node:buffer")).default;
        be = globalThis.Blob = s.Blob;
      }
      t(true);
    } else
      t(true);
  } catch (s) {
    e(s);
  }
});
var G = Ne;
globalThis.REMOTEESM_BUNDLES || (globalThis.REMOTEESM_BUNDLES = { global: {} });
var _ = globalThis.REMOTEESM_BUNDLES.global;
var W = "No buffer or text to bundle for";
var Ae = /[^\n]*(?<![\/\/])(import)\s+([ \t]*(?:(?:\* (?:as .+))|(?:[^ \t\{\}]+[ \t]*,?)|(?:[ \t]*\{(?:[ \t]*[^ \t"'\{\}]+[ \t]*,?)+\}))[ \t]*)from[ \t]*(['"])([^'"\n]+)(?:['"])([ \t]*assert[ \t]*{[ \n\t]*type:[ \n\t]*(['"])([^'"\n]+)(?:['"])[\n\t]*})?;?/gm;
function I(t, e = this.options) {
  let s = t ? R(t, e) : void 0, n = globalThis.REMOTEESM_BUNDLES[e.collection];
  n || (n = globalThis.REMOTEESM_BUNDLES[e.collection] = {});
  let i = n[s];
  return i ? e && (i.options = e) : i = new T(t, e), i;
}
var T = class {
  filename = "bundle.esmpile.js";
  uri;
  #t;
  get url() {
    return this.#t;
  }
  set url(e) {
    let s = this.options._esmpile;
    s.entrypoint || (s.entrypoint = this), this.uri || (this.uri = e), e.includes(this.#e.relativeTo) || (e = p(e, this.#e.relativeTo)), this.#t = e;
    let n = R(this.url, this.options);
    this.name !== n && (this.name = n), this.updateCollection(this.options.collection);
  }
  status = null;
  #e;
  get options() {
    return this.#e;
  }
  set options(e = {}) {
    e._esmpile || (e._esmpile = this.#e?._esmpile ?? { circular: /* @__PURE__ */ new Set() }), e.collection || (e.collection = this.#e?.collection), this.#e = e, e.output || (e.output = {}), this.bundler = e.bundler, this.updateCollection(this.options.collection), typeof e?.callbacks?.progress?.file == "function" && (this.callbacks.file = e.callbacks.progress.file), e.fetch || (e.fetch = {}), e.fetch = Object.assign({}, e.fetch), e.fetch.signal = this.controller.signal;
  }
  controller = new AbortController();
  #s;
  get bundler() {
    return this.#s;
  }
  set bundler(e) {
    this.setBundleInfo(e), this.setBundler(e, false);
  }
  setBundleInfo = (e) => {
    this.#e._esmpile.lastBundler = this.#s, this.#s = this.#e.bundler = e;
    let s = this.#e.output;
    e && (s[e] = true, s.text = true), this.derived.compile = !this.#e.forceNativeImport && (s.text || s.datauri || s.objecturl);
  };
  setBundler = async (e, s = true) => {
    s && this.setBundleInfo(e);
    let n = this.#e._esmpile, i = n.lastBundle, o = n.lastBundle === e;
    if (!o || n.lastBundle && o && !i) {
      let r = n.entrypoint;
      if (e) {
        let c = Array.from(this.dependencies.entries());
        await Promise.all(c.map(async ([d, u]) => {
          u.bundler = e, await u.result;
        }));
      }
      ["success", "failed"].includes(r?.status) && (e ? i ? this.encoded = await this.bundle(i) : this.result = await this.resolve() : this.result = await this.resolve());
    }
  };
  #i;
  get name() {
    return this.#i;
  }
  set name(e) {
    if (e !== this.#i) {
      let s = globalThis.REMOTEESM_BUNDLES[this.collection];
      s && (_[this.name] === s[this.name] && delete _[this.name], delete s[this.name]), this.#i = e;
      let i = e.split("/").pop().split(".");
      this.filename = [...i.slice(0, -1), "esmpile", "js"].join("."), _[this.name] ? this.options.collection != "global" && console.warn(`Duplicating global bundle (${this.name})`, this.name) : _[this.name] = this;
    }
  }
  #n;
  get collection() {
    return this.#n;
  }
  set collection(e) {
    this.#n = e;
    let s = globalThis.REMOTEESM_BUNDLES[e];
    s || (s = globalThis.REMOTEESM_BUNDLES[e] = {}), this.name && (s[this.name] ? s[this.name] !== this && console.warn(`Trying to duplicate bundle in bundle ${e} (${this.name})`, this.name) : s[this.name] = this);
  }
  #o;
  #r;
  get text() {
    return this.#o;
  }
  set text(e) {
    this.#o = e, this.encoded = this.bundle("text").catch((s) => {
      if (!s.message.includes(W))
        throw s;
    });
  }
  set buffer(e) {
    this.#r = e, this.encoded = this.bundle("buffer").catch((s) => {
      if (!s.message.includes(W))
        throw s;
    });
  }
  dependencies = /* @__PURE__ */ new Map();
  dependents = /* @__PURE__ */ new Map();
  get entries() {
    let e = [], s = (n) => {
      n.dependencies.forEach((i) => {
        !e.includes(i) && i !== this && (e.push(i), s(i));
      });
    };
    return s(this), e;
  }
  encodings = {};
  info = {};
  imports = [];
  link = void 0;
  result = void 0;
  callbacks = { file: void 0 };
  derived = { compile: false, dependencies: { n: 0, resolved: 0 } };
  constructor(e, s = {}) {
    this.options = s, this.url = e;
  }
  import = async () => {
    this.status = "importing";
    let e = await ce(this.url, this.options);
    if (e?.result)
      return e.result;
    this.status = "fallback";
  };
  get = I;
  compile = async () => {
    this.status = "compiling", await G;
    try {
      let e = await de(this.url, this.options).catch((s) => {
        throw s;
      });
      try {
        e && (this.info = e, this.url = this.info.uri, this.buffer = this.info.buffer, await this.encoded);
      } catch {
        this.imports = {};
        let n = [];
        Array.from(this.info.text.updated.matchAll(Ae)).forEach(([r, a, c, d, u]) => {
          if (u) {
            let l = !!c.match(/\*\s+as/), f = c.replace(/\*\s+as/, "").trim(), g = y(u) ? u : p(u, this.url), $ = k(this.options);
            g = g.replace(`${$}/`, "");
            let B = { name: g, path: u, prefix: a, variables: f, wildcard: l, current: { line: r, path: u }, original: r, counter: 0, bundle: null };
            this.imports[g] || (this.imports[g] = []), this.imports[g].push(B), n.push(B);
          }
        }), this.derived.dependencies.resolved = 0, this.derived.dependencies.n = this.imports.length;
        let o = n.map(async (r, a) => {
          await this.updateImport(r, a), this.derived.dependencies.resolved++;
        });
        await Promise.all(o), this.text = this.info.text.updated;
      }
    } catch (e) {
      throw e;
    }
    return await this.encoded, this.result;
  };
  updateImportPath = (e, s) => {
    if (s === e.current.path)
      return;
    let { prefix: n, variables: i, wildcard: o, bundle: r } = e, a = "";
    if (typeof s == "string")
      a = `${n} ${o ? "* as " : ""}${i} from "${s}"; // Imported from ${r.name}

`;
    else {
      let d = i.replace("{", "").replace("}", "") === i, u = i.replace("{", "").replace("}", "").split(",").map((f) => f.trim()), l = (f) => {
        let h = "";
        o || (d ? h = ".default" : h = `.${f}`), a += `${n === "import" ? "" : "export "}const ${f} = (await globalThis.REMOTEESM_BUNDLES["${r.collection}"]["${r.name}"].result)${h};

`;
      };
      u.forEach(l);
    }
    this.info.text.updated = this.info.text.updated.replace(e.current.line, a), e.current.line = a, e.current.path = s;
  };
  updateImport = async (e) => {
    let s = e.path, n = e.name, i = this.get(n);
    if (e.bundle = i, this.addDependency(i), i.status)
      await i.result;
    else {
      let r = { output: {}, ...this.options };
      r.output.text = true, await (await this.get(n, r)).resolve(s);
    }
    let o = await i.encoded;
    return this.updateImportPath(e, o), i;
  };
  notify = (e, s) => {
    let n = e !== void 0, i = s !== void 0;
    this.callbacks.file && this.callbacks.file(this.name, this.derived.dependencies.resolved, this.derived.dependencies.n, n ? this : void 0, i ? s : void 0);
  };
  get buffer() {
    return this.#r;
  }
  bundle = (e = "buffer") => (this.options._esmpile.lastBundle = e, new Promise(async (s, n) => {
    try {
      let i = e === "text" ? this.info.text.updated : this.buffer;
      i || (this.info.fallback ? this.encoded = this.info.fallback : n(new Error(`${W} ${this.name}`)));
      let o = m(this.url), r = S(o);
      switch (r) {
        case "text/typescript":
          i = me(this.info, e), r = w;
          break;
      }
      let a = [], c = this.options.output;
      c?.datauri && a.push("datauri"), c?.objecturl && a.push("objecturl");
      for (let l in a) {
        let f = a[l], h = await V[f](i, this.url, r);
        h && (this.result = h.module, this.encodings[f] = await h.encoded);
      }
      let d = this.bundler === "objecturl" ? this.encodings.objecturl : this.encodings.datauri, u = Array.from(this.dependents.values()).map((l) => l.updateDependency(this, d));
      await Promise.all(u), s(d);
    } catch (i) {
      n(i);
    }
  }));
  delete = () => {
    this.objecturl && window.URL.revokeObjectURL(this.objecturl);
  };
  addDependency = (e) => {
    let s = false;
    this.dependents.has(e.url) && (s = true), this.dependencies.set(e.url, e), e.dependencies.has(this.url) && (s = true), e.dependents.set(this.url, this), s && (this.options._esmpile.circular.add(this.url, e.url), this.options._esmpile.circular.add(e.url), this.circular(e), e.circular(this));
  };
  removeDependency = (e) => {
    this.dependencies.delete(e.name), e.dependents.delete(this.name);
  };
  updateDependency = async (e, s) => {
    this.imports[e.url].forEach((i) => this.updateImportPath(i, s));
  };
  updateCollection = (e) => {
    e ? this.collection = e : this.collection = this.options.collection = Object.keys(globalThis.REMOTEESM_BUNDLES).length;
  };
  download = async (e = this.filename) => {
    this.bundler != "datauri" && await this.setBundler("datauri");
    let s = this.encodings.datauri.split(",")[0].split(":")[1].split(";")[0], n = atob(this.encodings.datauri.split(",")[1]), i = [];
    for (var o = 0; o < n.length; o++)
      i.push(n.charCodeAt(o));
    let r = new Uint8Array(i), a = new Blob([r], { type: s }), c = URL.createObjectURL(a);
    if (globalThis.REMOTEESM_NODE)
      await G, globalThis.fs.writeFileSync(e, r), console.log(`Wrote bundle contents to ${e}`);
    else {
      var d = document.createElement("a");
      document.body.appendChild(d), d.style = "display: none", d.href = c, d.download = e, d.click();
    }
  };
  circular = async (e) => {
    let s = await this.resolve().catch((n) => {
      console.warn(`Circular dependency detected: Fallback to direct import for ${this.url} failed...`, n);
      let i = `Circular dependency cannot be resolved: ${this.uri} <-> ${e.uri}.`;
      throw new Error(i);
    });
    console.warn(`Circular dependency detected: Fallback to direct import for ${this.url} was successful!`, s);
  };
  resolve = async (e = this.uri) => (this.status = "resolving", this.result = void 0, this.encoded = void 0, this.result = new Promise(async (s, n) => {
    let i, o = this.options._esmpile.circular.has(this.url), r = o || !this.derived.compile;
    try {
      i = r ? await this.import().catch(async (a) => {
        if (this.#e.fallback === false)
          throw a;
        await this.setBundler("objecturl");
      }) : void 0;
      try {
        if (!i) {
          if (o)
            throw new Error(`Failed to import ${this.url} natively.`);
          i = await this.compile();
        }
      } catch (a) {
        if (this.options.fetch?.signal?.aborted)
          throw a;
        {
          let c = y(e) ? x(e, this.options, true) : x(this.url, this.options, true);
          console.warn(`Failed to fetch ${e}. Checking filesystem references...`);
          let d = this.options.filesystem?._fallbacks?.[c];
          if (d)
            console.warn(`Got fallback reference (module only) for ${e}.`), i = d, Object.defineProperty(info, "fallback", { value: true, enumerable: false });
          else {
            let u = "was not resolved locally. You can provide a direct reference to use in";
            throw a.message.includes(u) ? a : O(e, c);
          }
        }
      }
      await this.encoded, this.status = "success", this.notify(this), s(i);
    } catch (a) {
      this.status = "failed", this.notify(null, a), n(a);
    }
  }), this.result);
  sources = async () => await N(this.#t, this.#e, this.info.text.original);
};
var Ze = p;
var et = b;
var tt = T;

// src/common/get.ts
var cache = {};
var get = async (relPath, relativeTo = "", onImport, options2 = {}) => {
  let type = suffix(relPath);
  const isJSON = !type || type.includes("json");
  const fullPath = relPath[0] === "." ? Ze(relPath, relativeTo) : relPath;
  const isFunc = typeof onImport === "function";
  const bundle = cache[fullPath]?.imported ?? [];
  if (!cache[fullPath]) {
    const opts = {
      debug: true,
      callbacks: {
        progress: {
          fetch: options2.callbacks?.progress?.fetch,
          file: options2.callbacks?.progress?.file
        }
      },
      bundler: "objecturl",
      filesystem: options2.filesystem,
      nodeModules: options2.nodeModules,
      relativeTo: options2.relativeTo
    };
    const bundle2 = new tt(relPath, opts);
    const res = await bundle2.resolve();
    if (isFunc)
      onImport(bundle2);
    cache[fullPath] = bundle2;
    if (isJSON)
      cache[fullPath] = res?.default ?? {};
    else
      cache[fullPath] = res;
  } else if (isFunc)
    onImport(bundle);
  return isJSON ? JSON.parse(JSON.stringify(cache[fullPath])) : cache[fullPath];
};
var get_default = get;

// src/common/utils/check.ts
var valid = (input, options2, location) => {
  const errors = [];
  const isUndefined = options2?.relativeTo === void 0;
  const isString = typeof input === "string";
  const isObject = typeof input === "object";
  let error;
  if (isString) {
    const hasRelTo = !isUndefined && "relativeTo" in options2;
    if (!hasRelTo && !options2._remote) {
      if (import.meta.url) {
        error = { message: "Not a valid relativeTo key (required) in options", file: input };
        console.warn(`[wasl-${location}] Import Mode Error: Please pass a valid string to options.relativeTo (ideally import.meta.url).`);
      } else {
        error = { message: "import.meta.url is not supported", file: input };
        console.warn(`[wasl-${location}] Import Mode Error: import.meta.url is not available. Does your bundler support it?`);
      }
    }
  } else if (!isObject) {
    error = { message: "Not a valid object passed in the first argument", file: null };
    console.warn(`[wasl-${location}] Reference Mode Error: Please pass a valid object in the first argument and pass file object references via the options.filesystem field.`);
  }
  if (error) {
    error.function = location;
    errors.push(error);
  }
  return errors;
};

// src/core/utils.ts
var merge = (main, override) => {
  const copy = Object.assign({}, main);
  if (override) {
    const keys = Object.keys(copy);
    const newKeys = new Set(Object.keys(override));
    keys.forEach((k2) => {
      if (k2 === "channels")
        copy[k2] = Object.assign({}, copy[k2]);
      newKeys.delete(k2);
      if (typeof override[k2] === "object" && !Array.isArray(override[k2])) {
        if (typeof copy[k2] === "object")
          copy[k2] = merge(copy[k2], override[k2]);
        else
          copy[k2] = override[k2];
      } else if (k2 in override)
        copy[k2] = override[k2];
    });
    newKeys.forEach((k2) => {
      copy[k2] = override[k2];
    });
  }
  return copy;
};
var checkFiles = (key, filesystem2) => {
  const isJSON = suffix(key).slice(-4) === "json" ? true : false;
  const output = isJSON && filesystem2[key] ? JSON.parse(JSON.stringify(filesystem2[key])) : filesystem2[key];
  return output;
};
var remove = (original, search, key = original, o, message) => {
  if (message)
    console.error(message);
  else
    console.error(`Source was not ${original ? `resolved for ${original}` : `specified for ${key}`}. ${search ? `If available, refer to this object directly as options.filesystem["${search}"]. ` : ""}${o ? `Automatically removing ${key} from the WASL file.` : ""}`);
  if (o)
    delete o[key];
};

// src/core/html.ts
function updateKey(key) {
  let newK = key;
  const match = newK.match(/[A-Z]/g);
  if (match)
    match.forEach((str) => newK = newK.replace(str, `-${str.toLowerCase()}`));
  return newK;
}
function getAttributes(obj, opts, path2 = []) {
  const acc = {};
  for (let key in obj) {
    if (typeof obj[key] === "object") {
      const res = getAttributes(obj[key], opts, [...path2, key]);
      for (let k2 in res) {
        acc[updateKey(k2)] = res[k2];
      }
    } else {
      const updatedKey = updateKey(key);
      const updatedVal = catchKeys[key] instanceof Function ? catchKeys[key](obj[key], opts) : obj[key];
      acc[path2.length ? `${path2.join(".")}.${updatedKey}` : updatedKey] = updatedVal;
    }
  }
  return acc;
}
var catchKeys = {
  src: (val, opts) => {
    let isRemote = false;
    try {
      new URL(val);
      isRemote = true;
    } catch {
    }
    const url = isRemote ? val : Ze(val, opts.path ?? "");
    return url;
  }
};
function handleComponents(name2, parentObject, parent, opts) {
  const attrs = getAttributes(parentObject[name2], opts);
  const el = document.createElement(attrs["tag-name"] ?? "div");
  el.id = name2;
  parent.appendChild(el);
  for (let key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  to(parentObject[name2], opts, el);
}
function to(wasl, opts, parent) {
  if (!parent)
    parent = opts.parentNode ?? document.body;
  for (let key in wasl) {
    if (key === "components") {
      for (let name2 in wasl[key])
        handleComponents(name2, wasl[key], parent, opts);
    }
  }
  return parent;
}
function from(element, options2) {
  options2.parentNode = element;
  const ref = { components: {} };
  const toIgnore = ["id"];
  const drill = (el, ref2) => {
    if (ref2.components) {
      for (let child of el.children) {
        const childRef = ref2.components[child.id] = { element: child };
        if (child.children.length > 0)
          childRef.components = {};
        for (let attribute of child.attributes) {
          if (!toIgnore.includes(attribute.name)) {
            const split = attribute.name.split(".");
            let target = childRef;
            split.forEach((substr, i) => {
              substr = substr.split("-").map((str, i2) => {
                if (i2 > 0)
                  return str[0].toUpperCase() + str.slice(1);
                else
                  return str;
              }).join("");
              if (i === split.length - 1) {
                const val = attribute.value;
                if (val !== "") {
                  if (!isNaN(val))
                    target[substr] = Number(val);
                  else
                    target[substr] = val;
                } else
                  target[substr] = true;
              } else {
                if (!target[substr])
                  target[substr] = {};
                target = target[substr];
              }
            });
          }
        }
        drill(child, childRef);
      }
    }
  };
  drill(element, ref);
  return ref;
}

// node_modules/es-plugins/dist/index.esm.js
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
  for (let k2 in props) {
    if (k2 === "_state" || k2 === "graph")
      continue;
    else {
      this._state[k2] = props[k2];
      if (k2 in this)
        this[k2] = props[k2];
      else
        Object.defineProperty(this, k2, {
          get: () => {
            this._state[k2];
          },
          set: (v2) => {
            this._state[k2] = v2;
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
        await Promise.all(keys.map(async (k2) => {
          if (typeof n.branch[k2].if === "object")
            n.branch[k2].if = stringifyFast(n.branch[k2].if);
          let pass = false;
          if (typeof n.branch[k2].if === "function") {
            pass = n.branch[k2].if(output);
          } else {
            if (typeof output === "object") {
              if (stringifyFast(output) === n.branch[k2].if)
                pass = true;
            } else if (output === n.branch[k2].if)
              pass = true;
          }
          if (pass) {
            if (n.branch[k2].then.run) {
              if (Array.isArray(output))
                await n.branch[k2].then.run(...output);
              else
                await n.branch[k2].then.run(...output);
            } else if (typeof n.branch[k2].then === "function") {
              if (Array.isArray(output))
                await n.branch[k2].then(...output);
              else
                await n.branch[k2].then(output);
            } else if (typeof n.branch[k2].then === "string") {
              if (n.graph)
                n.branch[k2].then = n.graph.nodes.get(n.branch[k2].then);
              else
                n.branch[k2].then = n.nodes.get(n.branch[k2].then);
              if (n.branch[k2].then.run) {
                if (Array.isArray(output))
                  await n.branch[k2].then.run(...output);
                else
                  await n.branch[k2].then.run(...output);
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
    this.setParent = (parent2) => {
      this.parent = parent2;
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
    this.subscribe = (callback, tag = this.tag) => {
      if (typeof callback === "string") {
        if (this.graph)
          callback = this.graph.get(callback);
        else
          callback = this.nodes.get(callback);
      }
      if (typeof callback === "function") {
        return this.state.subscribeTrigger(tag, callback);
      } else if (callback)
        return this.state.subscribeTrigger(tag, (res) => {
          callback.run(res);
        });
    };
    this.unsubscribe = (sub, tag = this.tag) => {
      return this.state.unsubscribeTrigger(tag, sub);
    };
    this.subscribeState = (callback) => {
      if (!this.reactive) {
        return void 0;
      } else {
        if (typeof callback === "string") {
          if (this.graph)
            callback = this.graph.get(callback);
          else
            callback = this.nodes.get(callback);
        }
        if (typeof callback === "function") {
          return this.state.subscribeTrigger(this._unique, callback);
        } else if (callback)
          return this.state.subscribeTrigger(this._unique, (_state) => {
            callback.run(_state);
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
                let k2 = n.children[key];
                n.children[key] = n.graph.get(k2);
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
          for (let k2 in props) {
            const desc = Object.getOwnPropertyDescriptor(properties, k2);
            if (desc && desc.get && !desc.set)
              properties = Object.assign({}, properties);
            else
              properties[k2] = props[k2];
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
      let props2 = n;
      if (!(n instanceof GraphNode))
        n = new GraphNode(props2?.node ?? props2, this, this);
      else {
        this.nNodes = this.nodes.size;
        if (n.tag) {
          this.tree[n.tag] = props2;
          this.nodes.set(n.tag, n);
        }
      }
      return n;
    };
    this.setTree = (tree2 = this.tree) => {
      if (!tree2)
        return;
      for (const node in tree2) {
        const n = this.nodes.get(node);
        if (!n) {
          if (typeof tree2[node] === "function") {
            this.add({ tag: node, operator: tree2[node] });
          } else if (typeof tree2[node] === "object" && !Array.isArray(tree2[node])) {
            if (!tree2[node].tag)
              tree2[node].tag = node;
            let newNode = this.add(tree2[node]);
            if (tree2[node].aliases) {
              tree2[node].aliases.forEach((a) => {
                this.nodes.set(a, newNode);
              });
            }
          } else {
            this.add({ tag: node, operator: (...args) => {
              return tree2[node];
            } });
          }
        } else {
          if (typeof tree2[node] === "function") {
            n.setOperator(tree2[node]);
          } else if (typeof tree2[node] === "object") {
            if (tree2[node] instanceof GraphNode) {
              this.add(tree2[node]);
            } else if (tree2[node] instanceof Graph) {
              let source = tree2[node];
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
              n.setProps(tree2[node]);
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
    this.get = (tag2) => {
      return this.nodes.get(tag2);
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
    this.unsubscribe = (tag2, sub) => {
      return this.state.unsubscribeTrigger(tag2, sub);
    };
    this.subscribeState = (callback) => {
      if (!this.reactive) {
        return void 0;
      } else {
        if (typeof callback === "string") {
          if (this.graph)
            callback = this.graph.get(callback);
          else
            callback = this.nodes.get(callback);
        }
        if (typeof callback === "function") {
          return this.state.subscribeTrigger(this._unique, callback);
        } else if (callback)
          return this.state.subscribeTrigger(this._unique, (_state) => {
            callback.run(_state);
          });
      }
    };
    this.subscribeNode = (inputNode, outputNode) => {
      let tag2;
      if (inputNode?.tag)
        tag2 = inputNode.tag;
      else if (typeof inputNode === "string")
        tag2 = inputNode;
      if (typeof outputNode === "string")
        outputNode = this.nodes.get(outputNode);
      if (inputNode && outputNode) {
        let sub = this.state.subscribeTrigger(tag2, (res) => {
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
    this.create = (operator, parentNode, props2) => {
      return createNode(operator, parentNode, props2, this);
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
  const path2 = ["this"];
  function clear() {
    refs.clear();
    parents.length = 0;
    path2.length = 1;
  }
  function updateParents(key, value) {
    var idx = parents.length - 1;
    var prev = parents[idx];
    if (typeof prev === "object") {
      if (prev[key] === value || idx === 0) {
        path2.push(key);
        parents.push(value.pushed);
      } else {
        while (idx-- >= 0) {
          prev = parents[idx];
          if (typeof prev === "object") {
            if (prev[key] === value) {
              idx += 2;
              parents.length = idx;
              path2.length = idx;
              --idx;
              parents[idx] = value;
              path2[idx] = key;
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
          refs.set(value, path2.join("."));
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
  const path2 = ["this"];
  function clear() {
    refs.clear();
    parents.length = 0;
    path2.length = 1;
  }
  function updateParents(key, value) {
    var idx = parents.length - 1;
    if (parents[idx]) {
      var prev = parents[idx];
      if (typeof prev === "object") {
        if (prev[key] === value || idx === 0) {
          path2.push(key);
          parents.push(value.pushed);
        } else {
          while (idx-- >= 0) {
            prev = parents[idx];
            if (typeof prev === "object") {
              if (prev[key] === value) {
                idx += 2;
                parents.length = idx;
                path2.length = idx;
                --idx;
                parents[idx] = value;
                path2[idx] = key;
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
          refs.set(value, path2.join("."));
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
              for (const p2 in value[prop]) {
                if (Array.isArray(value[prop][p2])) {
                  if (value[prop][p2].length > 20)
                    obj[prop][p2] = value[prop][p2].slice(value[prop][p2].length - 20);
                  else
                    obj[prop][p2] = value[prop][p2];
                } else {
                  if (value[prop][p2] != null) {
                    let con = value[prop][p2].constructor.name;
                    if (con.includes("Set")) {
                      obj[prop][p2] = Array.from(value[prop][p2]);
                    } else if (con !== "Number" && con !== "String" && con !== "Boolean") {
                      obj[prop][p2] = "instanceof_" + con;
                    } else {
                      obj[prop][p2] = value[prop][p2];
                    }
                  } else {
                    obj[prop][p2] = value[prop][p2];
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
        this.renderonchanged = this.state.subscribeTrigger("props", (p2) => {
          this.render(p2);
          rpc(this, p2);
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
        this.renderonchanged = this.state.subscribeTrigger("props", (p2) => {
          this.render(p2);
          rpc(this, p2);
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
var Service = class extends Graph {
  constructor(options2 = {}) {
    super(void 0, options2.name ? options2.name : `service${Math.floor(Math.random() * 1e14)}`, options2.props);
    this.routes = {};
    this.loadDefaultRoutes = false;
    this.keepState = true;
    this.firstLoad = true;
    this.customRoutes = {};
    this.customChildren = {};
    this.init = (options3) => {
      if (options3)
        options3 = Object.assign({}, options3);
      else
        options3 = {};
      if (options3.customRoutes)
        Object.assign(options3.customRoutes, this.customRoutes);
      else
        options3.customRoutes = this.customRoutes;
      if (options3.customChildren)
        Object.assign(options3.customChildren, this.customChildren);
      else
        options3.customChildren = this.customChildren;
      if (Array.isArray(options3.routes)) {
        options3.routes.forEach((r) => {
          this.load(r, options3.includeClassName, options3.routeFormat, options3.customRoutes, options3.customChildren, options3.sharedState);
        });
      } else if (options3.routes || (Object.keys(this.routes).length > 0 || this.loadDefaultRoutes) && this.firstLoad)
        this.load(options3.routes, options3.includeClassName, options3.routeFormat, options3.customRoutes, options3.customChildren, options3.sharedState);
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
                      for (const k22 in customChildren) {
                        rt = customChildren[k22](rt, key, route, routes, allRoutes);
                        if (!rt)
                          continue nested;
                      }
                    }
                    if (rt.id && !rt.tag) {
                      rt.tag = rt.id;
                    }
                    let k2;
                    if (rt.tag) {
                      if (allRoutes[rt.tag]) {
                        let randkey = `${rt.tag}${incr}`;
                        allRoutes[randkey] = rt;
                        rt.tag = randkey;
                        childrenIter(allRoutes[randkey], key);
                        k2 = randkey;
                      } else {
                        allRoutes[rt.tag] = rt;
                        childrenIter(allRoutes[rt.tag], key);
                        k2 = rt.tag;
                      }
                    } else {
                      if (allRoutes[key]) {
                        let randkey = `${key}${incr}`;
                        allRoutes[randkey] = rt;
                        rt.tag = randkey;
                        childrenIter(allRoutes[randkey], key);
                        k2 = randkey;
                      } else {
                        allRoutes[key] = rt;
                        childrenIter(allRoutes[key], key);
                        k2 = key;
                      }
                    }
                    if (service?.name && includeClassName) {
                      allRoutes[service.name + routeFormat + k2] = rt;
                      delete allRoutes[k2];
                    } else
                      allRoutes[k2] = rt;
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
      let m2 = method.toLowerCase();
      let src = this.nodes.get(route);
      if (!src) {
        src = this.routes[route];
        if (!src)
          src = this.tree[route];
      }
      if (src?.[m2]) {
        if (!(src[m2] instanceof Function)) {
          if (args)
            src[m2] = args;
          return src[m2];
        } else
          return src[m2](args);
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
    if (options2.name)
      this.name = options2.name;
    else
      options2.name = this.tag;
    if ("loadDefaultRoutes" in options2) {
      this.loadDefaultRoutes = options2.loadDefaultRoutes;
      this.routes = Object.assign(this.defaultRoutes, this.routes);
    }
    if (options2 || Object.keys(this.routes).length > 0)
      this.init(options2);
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
  isTypedArray(x2) {
    return ArrayBuffer.isView(x2) && Object.prototype.toString.call(x2) !== "[object DataView]";
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
var DOMService = class extends Service {
  constructor(options2, parentNode, interpreters) {
    super({ props: options2?.props, name: options2?.name ? options2.name : `dom${Math.floor(Math.random() * 1e15)}` });
    this.loadDefaultRoutes = false;
    this.keepState = true;
    this.parentNode = document.body;
    this.interpreters = {
      md: (template, options3) => {
        if (typeof markdownit === "undefined") {
          document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/markdown-it@latest/dist/markdown-it.min.js'><\/script>`);
        }
        let md = globalThis.markdownit();
        let html = md.render(template);
        options3.template = html;
      },
      jsx: (template, options3) => {
        if (!options3.parentNode)
          options3.parentNode = this.parentNode;
        if (typeof options3.parentNode === "string")
          options3.parentNode = document.getElementById(options3.parentNode);
        if (typeof ReactDOM === "undefined") {
          document.head.insertAdjacentHTML("beforeend", `
                    <script src='https://unpkg.com/react@latest/umd/react.production.min.js'><\/script>
                    <script src='https://unpkg.com/react-dom@latest/umd/react-dom.production.min.js'><\/script>`);
        }
        options3.template = "";
        let onrender = options3.onrender;
        options3.onrender = (self2, info2) => {
          const modal = ReactDOM.createPortal(template, options3.id);
          onrender(self2, info2);
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
    this.addElement = (options3, generateChildElementNodes = false) => {
      let elm = this.createElement(options3);
      if (!options3.element)
        options3.element = elm;
      if (!options3.operator)
        options3.operator = function(props) {
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
      let node = this.resolveGraphNode(elm, options3);
      let divs = Array.from(elm.querySelectorAll("*"));
      if (generateChildElementNodes) {
        divs = divs.map((d, i) => this.addElement({ element: d }));
      }
      this.elements[options3.id] = { element: elm, node, parentNode: options3.parentNode, divs };
      if (!node.ondelete)
        node.ondelete = (node2) => {
          elm.remove();
          if (options3.onremove)
            options3.onremove.call(this.elements[options3.id].node, elm, this.elements[options3.id]);
        };
      if (options3.onresize) {
        let onresize = options3.onresize;
        options3.onresize = (ev) => {
          onresize.call(this.elements[options3.id].node, ev, elm, this.elements[options3.id]);
        };
        window.addEventListener("resize", options3.onresize);
      }
      return this.elements[options3.id];
    };
    this.createElement = (options3) => {
      let elm;
      if (options3.element) {
        if (typeof options3.element === "string") {
          elm = document.querySelector(options3.element);
          if (!elm)
            elm = document.getElementById(options3.element);
        } else
          elm = options3.element;
      } else if (options3.tagName)
        elm = document.createElement(options3.tagName);
      else if (options3.id && document.getElementById(options3.id))
        elm = document.getElementById(options3.id);
      if (!elm)
        return void 0;
      this.updateOptions(options3, elm);
      return elm;
    };
    this.updateOptions = (options3, element) => {
      if (!options3.id && options3.tag)
        options3.id = options3.tag;
      if (!options3.tag && options3.id)
        options3.tag = options3.id;
      if (!options3.id)
        options3.id = `${options3.tagName ?? "element"}${Math.floor(Math.random() * 1e15)}`;
      let p2 = options3.parentNode;
      delete options3.parentNode;
      Object.defineProperty(options3, "parentNode", {
        get: function() {
          return element.parentNode;
        },
        set: (v2) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          this.resolveParentNode(element, v2 ? v2 : this.parentNode, options3, options3.onrender);
        },
        enumerable: true,
        configurable: true
      });
      options3.parentNode = p2 ? p2 : this.parentNode;
      element.id = options3.id;
      if (options3.style)
        Object.assign(element.style, options3.style);
      if (options3.attributes) {
        for (let key in options3.attributes) {
          if (typeof options3.attributes[key] === "function")
            element[key] = (...args) => options3.attributes[key](...args);
          else
            element[key] = options3.attributes[key];
        }
      }
      if (!options3.attributes?.innerHTML && options3.innerHTML) {
        element.innerHTML = options3.innerHTML;
      } else if (!options3.attributes?.innerText && options3.innerText) {
        element.innerText = options3.innerText;
      }
      return options3;
    };
    this.resolveParentNode = (elm, parentNode2, options3, oncreate) => {
      if (!elm.parentNode) {
        setTimeout(() => {
          if (typeof parentNode2 === "string")
            parentNode2 = document.getElementById(parentNode2);
          if (parentNode2 && typeof parentNode2 === "object") {
            parentNode2.appendChild(elm);
          }
          if (oncreate)
            oncreate.call(elm.node, elm, this.elements[options3.id]);
          if (elm.node.animation || elm.node.animate) {
            elm.node.runAnimation();
          }
          if (elm.node.looper || typeof elm.node.loop === "number" && elm.node.loop) {
            elm.node.runLoop();
          }
        }, 0.01);
      }
    };
    this.resolveGraphNode = (element, options3) => {
      let node;
      if (this.nodes.get(options3.id)?.element?.parentNode?.id === options3.parentNode || this.nodes.get(options3.id)?.parentNode === options3.parentNode) {
        node = this.nodes.get(options3.id);
      } else {
        let parentId = options3.parentNode instanceof HTMLElement ? options3.parentNode?.id : typeof options3.parentNode === "string" ? options3.parentNode : void 0;
        let parent;
        if (parentId)
          parent = this.nodes.get(parentId);
        node = new GraphNode(options3 instanceof Graph ? options3 : Object.assign({}, options3), parent, this);
      }
      delete node.parentNode;
      Object.defineProperty(node, "parentNode", {
        get: function() {
          return element.parentNode;
        },
        set: (v2) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          this.resolveParentNode(element, v2 ? v2 : this.parentNode, options3, options3.onrender);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(node, "element", {
        get: () => element,
        set: (v2) => {
          element = v2;
          node.nodes.forEach((n) => {
            if (node.source?._unique === n.graph?._unique)
              n.parentNode = element;
          });
        }
      });
      node.element = element;
      element.node = node;
      let initialOptions = options3._initial ?? options3;
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
    this.addComponent = (options3, generateChildElementNodes = true) => {
      if (options3.onrender) {
        let oncreate = options3.onrender;
        options3.onrender = (element) => {
          oncreate.call(element.node, element, options3);
        };
      }
      if (options3.onresize) {
        let onresize = options3.onresize;
        options3.onresize = (element) => {
          onresize.call(element.node, element, options3);
        };
      }
      if (options3.onremove) {
        let ondelete = options3.onremove;
        options3.onremove = (element) => {
          ondelete.call(element.node, self, options3);
        };
      }
      if (typeof options3.renderonchanged === "function") {
        let renderonchanged = options3.renderonchanged;
        options3.renderonchanged = (element) => {
          renderonchanged.call(element.node, element, options3);
        };
      }
      if (options3.interpreter && options3.interpreter !== "wc") {
        this.interpreters[options3.interpreter](options3.template, options3);
      }
      class CustomElement extends DOMElement {
        constructor() {
          super(...arguments);
          this.props = options3.props;
          this.styles = options3.styles;
          this.useShadow = options3.useShadow;
          this.template = options3.template;
          this.oncreate = options3.onrender;
          this.onresize = options3.onresize;
          this.ondelete = options3.onremove;
          this.renderonchanged = options3.renderonchanged;
        }
      }
      if (!options3.tagName)
        options3.tagName = `custom-element${Math.random() * 1e15}`;
      CustomElement.addElement(options3.tagName);
      let elm = document.createElement(options3.tagName);
      let completeOptions = this.updateOptions(options3, elm);
      this.templates[completeOptions.id] = completeOptions;
      let divs = Array.from(elm.querySelectorAll("*"));
      if (generateChildElementNodes) {
        divs = divs.map((d) => this.addElement({ element: d }));
      }
      if (!options3.element)
        options3.element = elm;
      if (!options3.operator)
        options3.operator = function op(props) {
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
      let node = this.resolveGraphNode(elm, options3);
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
    this.addCanvasComponent = (options3) => {
      if (!options3.canvas) {
        options3.template = `<canvas `;
        if (options3.width)
          options3.template += `width="${options3.width}"`;
        if (options3.height)
          options3.template += `height="${options3.height}"`;
        options3.template += ` ></canvas>`;
      } else
        options3.template = options3.canvas;
      if (options3.onrender) {
        let oncreate = options3.onrender;
        options3.onrender = (element) => {
          oncreate.call(element.node, element, options3);
        };
      }
      if (options3.onresize) {
        let onresize = options3.onresize;
        options3.onresize = (element) => {
          onresize.call(element.node, element, options3);
        };
      }
      if (options3.ondelete) {
        let ondelete = options3.onremove;
        options3.onremove = (element) => {
          ondelete.call(element.node, element, options3);
        };
      }
      if (typeof options3.renderonchanged === "function") {
        let renderonchanged = options3.renderonchanged;
        options3.renderonchanged = (element) => {
          renderonchanged.call(element.node, element, options3);
        };
      }
      class CustomElement extends DOMElement {
        constructor() {
          super(...arguments);
          this.props = options3.props;
          this.styles = options3.styles;
          this.template = options3.template;
          this.oncreate = options3.onrender;
          this.onresize = options3.onresize;
          this.ondelete = options3.onremove;
          this.renderonchanged = options3.renderonchanged;
        }
      }
      if (!options3.tagName)
        options3.tagName = `custom-element${Math.random() * 1e15}`;
      CustomElement.addElement(options3.tagName);
      let elm = document.createElement(options3.tagName);
      const completeOptions = this.updateOptions(options3, elm);
      let animation = () => {
        if (this.components[completeOptions.id]?.animating) {
          this.components[completeOptions.id].draw(this.components[completeOptions.id].element, this.components[completeOptions.id]);
          requestAnimationFrame(animation);
        }
      };
      this.templates[completeOptions.id] = completeOptions;
      if (!options3.element)
        options3.element = elm;
      if (!options3.operator)
        options3.operator = function op(props) {
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
      let node = this.resolveGraphNode(elm, options3);
      if (!node.ondelete)
        node.ondelete = (node2) => {
          elm.delete();
        };
      let canvas = elm.querySelector("canvas");
      if (completeOptions.style)
        Object.assign(canvas.style, completeOptions.style);
      let context;
      if (typeof completeOptions.context === "object")
        context = options3.context;
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
    if (options2?.parentNode)
      parentNode = options2.parentNode;
    if (typeof parentNode === "string")
      parentNode = document.getElementById(parentNode);
    if (parentNode instanceof HTMLElement)
      this.parentNode = parentNode;
    if (interpreters) {
      Object.assign(this.interpreters, interpreters);
    }
    this.init(options2);
  }
};
var Router = class extends Service {
  constructor(options2) {
    super(options2);
    this.name = "router";
    this.connections = {};
    this.sources = {};
    this.services = {};
    this.serviceConnections = {};
    this.users = {};
    this.addUser = async (info2, connections, config, receiving) => {
      if (!info2._id) {
        info2._id = `user${Math.floor(Math.random() * 1e15)}`;
      }
      let user = Object.assign({}, info2);
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
        Object.keys(connections).map((k2, i) => {
          if (connections[k2]?._id) {
            connectionIds[`${i}`] = connections[k2]?._id;
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
            let k2 = this.order[i];
            for (const key in this.sources[sourceId]) {
              if (this.sources[sourceId][key].service) {
                if (typeof this.sources[sourceId][key].service === "object") {
                  if (this.sources[sourceId][key].service.tag === k2) {
                    if (this.sources[sourceId][key].connectionType && this.sources[sourceId][key].service?.name) {
                      if (!this.serviceConnections[this.sources[sourceId][key].service.name]) {
                        this.removeConnection(this.sources[sourceId][key]);
                        continue;
                      }
                    }
                    return this.sources[sourceId][key];
                  }
                } else if (this.sources[sourceId][key].service === k2) {
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
          for (const k2 in this.sources[sourceId]) {
            if (this.sources[sourceId][k2].connectionType && this.sources[sourceId][k2].service?.name) {
              if (!this.serviceConnections[this.sources[sourceId][k2].service.name]) {
                this.removeConnection(this.sources[sourceId][k2]);
                continue;
              }
            }
            if (hasMethod && this.sources[sourceId][k2][hasMethod]) {
              return this.sources[sourceId][k2];
            } else {
              return this.sources[sourceId][k2];
            }
          }
        }
      } else if (this.order) {
        for (let i = 0; i < this.order.length; i++) {
          let k2 = this.order[i];
          if (this.sources[k2]?.[sourceId]) {
            if (this.sources[k2][sourceId].connectionType && this.sources[k2][sourceId].service?.name) {
              if (!this.serviceConnections[this.sources[k2][sourceId].service.service.name]) {
                this.removeConnection(this.sources[k2][sourceId].service);
                continue;
              }
            }
            if (hasMethod && this.sources[k2][sourceId]?.[hasMethod]) {
              return this.sources[k2][sourceId];
            } else {
              return this.sources[k2][sourceId];
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
              for (const k2 in this.sources[sourceId][key]) {
                if (typeof this.sources[sourceId][key][k2] === "object") {
                  let pass = true;
                  if (hasMethod && !this.sources[sourceId][key][k2][hasMethod])
                    pass = false;
                  for (const p2 in props) {
                    if (typeof this.sources[sourceId][key][k2][p2] === "object" && typeof props[p2] === "object") {
                      for (const pp in props[p2]) {
                        if (props[p2][pp] !== this.sources[sourceId][key][k2][p2][pp]) {
                          pass = false;
                          break;
                        }
                      }
                    } else if (this.sources[sourceId][key][k2][p2] !== props[p2]) {
                      pass = false;
                    } else {
                      pass = false;
                      break;
                    }
                  }
                  if (pass) {
                    found[this.sources[sourceId][key][k2]._id] = this.sources[sourceId][key][k2];
                  }
                }
              }
            } else {
              let pass = true;
              if (hasMethod && !this.sources[sourceId][key][hasMethod])
                pass = false;
              for (const p2 in props) {
                if (typeof this.sources[sourceId][key][p2] === "object" && typeof props[p2] === "object") {
                  for (const pp in props[p2]) {
                    if (props[p2][pp] !== this.sources[sourceId][key][p2][pp]) {
                      pass = false;
                      break;
                    }
                  }
                } else if (this.sources[sourceId][key][p2] !== props[p2]) {
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
    this.addConnection = (options3, source) => {
      let settings = {};
      if (typeof options3 === "string") {
        if (this.connections[options3]) {
          options3 = this.connections[options3];
        } else {
          for (const j2 in this.serviceConnections) {
            for (const k2 in this.serviceConnections[j2]) {
              if (this.serviceConnections[j2][k2][options3]) {
                options3 = { connection: this.serviceConnections[j2][k2][options3] };
                options3.service = j2;
                settings.connectionType = j2;
                settings.connectionsKey = k2;
                break;
              }
            }
          }
        }
        if (typeof options3 === "string" && this.nodes.get(options3))
          options3 = { connection: this.nodes.get(options3) };
      }
      if (!options3 || typeof options3 === "string")
        return void 0;
      if (source)
        settings.source = source;
      if (options3.connection instanceof GraphNode) {
        settings.connection = options3.connection;
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
        settings.onclose = options3.onclose;
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
      } else if (options3.connection instanceof Graph) {
        if (options3.connection.nodes.get("open"))
          settings.service = options3.connection;
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
      } else if (!(options3._id && this.connections[options3._id])) {
        let c = options3.connection;
        if (typeof c === "string") {
          if (this.connections[c])
            c = this.connections[c];
          else if (options3.service) {
            if (typeof options3.service === "string") {
              options3.service = this.services[options3.service];
            }
            if (typeof options3.service === "object") {
              if (options3.service.connections) {
                for (const key in options3.service.connections) {
                  if (options3.service.connections[key][c]) {
                    c = options3.service.connections[key][c];
                    settings.connectionType = key;
                    settings.connectionsKey = c;
                    break;
                  }
                }
              }
            }
          } else {
            for (const j2 in this.serviceConnections) {
              for (const k2 in this.serviceConnections[j2]) {
                if (this.serviceConnections[j2][k2][c]) {
                  c = this.serviceConnections[j2][k2][c];
                  options3.service = j2;
                  settings.connectionType = j2;
                  settings.connectionsKey = k2;
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
        settings.onclose = options3.onclose;
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
        if (options3.service) {
          if (typeof options3.service === "string")
            options3.service = this.services[options3.service];
          settings.service = options3.service;
        } else if (c.graph)
          settings.service = c.graph;
      }
      if (!settings.source && options3.source) {
        settings.source = options3.source;
      } else if (!settings.source && options3.service) {
        settings.source = typeof options3.service === "object" ? options3.service.name : void 0;
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
              for (const k2 in this.sources[key]) {
                if (this.sources[key][k2]?.[connection]) {
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
    this.openConnection = async (service, options3, source, ...args) => {
      if (typeof service === "string") {
        service = this.services[service];
      }
      if (service instanceof Service) {
        let connection = service.run("open", options3, ...args);
        if (connection instanceof Promise) {
          return connection.then(async (info2) => {
            if (!info2._id) {
              await new Promise((res, rej) => {
                let start = performance.now();
                let checker = () => {
                  if (!info2._id) {
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
            if (info2._id)
              this.addConnection({ connection: info2, service }, source);
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
                Object.keys(this.sources[rxsrc]).forEach((k2) => {
                  if (this.sources[receiver][k2].send) {
                    receiver = this.sources[receiver][k2];
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
    if (options2) {
      if (options2.order)
        this.order = options2.order;
      if (options2.services) {
        for (const key in options2.services) {
          let opt = options2.services[key];
          if (opt instanceof Service) {
            opt.service.name = key;
            opt.service.tag = key;
            this.addService(opt.service, opt.connections, options2.includeClassName, options2.routeFormat, options2.syncServices);
          } else if (typeof opt === "function") {
            let service = new opt();
            service.name = key;
            service.tag = key;
            if (service)
              this.addService(service, service.connections, options2.includeClassName, options2.routeFormat, options2.syncServices);
          } else {
            if (typeof opt.service === "function") {
              let service = new opt.service({ name: key });
              service.name = key;
              service.tag = key;
              if (service)
                this.addService(service, void 0, options2.includeClassName, options2.routeFormat, options2.syncServices);
              opt.service = service;
            } else if (opt.service instanceof Service) {
              opt.service.name = key;
              opt.service.tag = key;
              this.addService(opt.service, void 0, options2.includeClassName, options2.routeFormat, options2.syncServices);
            }
            if (typeof opt.service === "object") {
              if (opt.connections) {
                if (Array.isArray(opt.connections)) {
                  opt.connections.forEach((k2) => {
                    this.addServiceConnections(opt[key].service, k2);
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
var transform_default = (tag, node) => {
  const args = node.arguments;
  let graph;
  Array.from(args.keys()).forEach((arg, i) => node[`${arg}`] = args.get(arg).state);
  const originalOperator = node.operator;
  if (typeof originalOperator === "function") {
    node.operator = function(...argsArr) {
      let updatedArgs = [];
      let i = 0;
      args.forEach((o, k2) => {
        const argO = args.get(k2);
        const proxy = `${k2}`;
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
  const info2 = /* @__PURE__ */ new Map();
  matches.forEach((v2) => {
    let [name2, value] = v2.split("=");
    name2 = name2.trim();
    name2 = name2.replace(/\d+$/, "");
    const spread = name2.includes("...");
    name2 = name2.replace("...", "");
    try {
      if (name2)
        info2.set(name2, {
          state: value ? (0, eval)(`(${value})`) : value,
          spread
        });
    } catch (e) {
      info2.set(name2, {});
      console.warn(`Argument ${name2} could not be parsed for`, fn.toString(), value);
    }
  });
  return info2;
}
var parse_default = getFnParamInfo;
var isNode = "process" in globalThis;
var ESPlugin = class {
  #initial;
  #options;
  #instance;
  #graph;
  #router;
  #cache = {};
  #plugins = {};
  #active = false;
  listeners = {
    pool: {
      in: {},
      out: {}
    },
    active: {},
    includeParent: {}
  };
  plugins = {};
  #toRun = false;
  #runProps = true;
  get initial() {
    return this.#initial;
  }
  get instance() {
    return this.#instance;
  }
  get graph() {
    return this.#graph;
  }
  set graph(v2) {
    this.#graph = v2;
  }
  constructor(node, options2 = {}, parent) {
    this.#initial = node;
    this.#options = options2;
    this.#router = options2._router ? options2._router : options2._router = new Router({
      linkServices: false,
      includeClassName: false
    });
    do {
      this.#initial = this.initial.initial ?? this.initial;
    } while (this.initial instanceof ESPlugin);
    const hasDefault = "default" in this.initial;
    let hasComponents = !!node.components;
    const parentHasComponents = !!parent?.components;
    const isFunctionCollection = !parentHasComponents && !hasDefault && !hasComponents;
    if (isFunctionCollection) {
      let newNode = { components: {} };
      for (let namedExport in node)
        newNode.components[namedExport] = { default: node[namedExport] };
      this.#initial = newNode;
      hasComponents = true;
      this.#runProps = false;
    }
    if (hasComponents) {
      const toNotify = [];
      const components = this.initial.components;
      for (let tag in components) {
        const node2 = components[tag];
        if (!(node2 instanceof ESPlugin)) {
          const clonedOptions = Object.assign({}, Object.assign(options2));
          const plugin = new ESPlugin(node2, Object.assign(clonedOptions, { tag }), node);
          this.#plugins[tag] = plugin;
          toNotify.push(plugin);
        } else
          this.#cache[tag] = this.#plugins[tag] = node2;
      }
      const thisTag = this.#options.tag;
      toNotify.forEach((o) => {
        let tag = o.#options.tag;
        if (thisTag)
          tag = `${thisTag}.${tag}`;
        this.plugins[o.#options.tag] = o;
        if (typeof options2.onPlugin === "function")
          options2.onPlugin(tag, o);
      });
    } else
      this.graph = this.#create(options2.tag ?? "defaultESPluginTag", this.initial);
    Object.defineProperty(this, "tag", {
      get: () => this.graph?.tag,
      enumerable: true
    });
  }
  #createTree = () => {
    let tree = {};
    for (let tag in this.#plugins) {
      let thisNode = this.#plugins[tag].graph;
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
  #activate = () => {
    if (this.initial.components) {
      let tree = this.#createTree();
      const props = this.#instance ?? this.initial;
      this.graph = isNode ? new Graph(tree, this.#options.tag, props) : new DOMService({ routes: tree, name: this.#options.tag, props: this.#runProps ? props : void 0 }, this.#options.parentNode);
      this.#router.load(this.graph);
      for (let tag in this.#plugins) {
        const cache2 = this.#cache[tag];
        if (cache2)
          cache2.graph = tree[tag];
      }
    }
  };
  start = async (defer) => {
    if (this.#active === false) {
      this.#active = true;
      const activateFuncs = [];
      for (let key in this.plugins) {
        const o = this.plugins[key];
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
          for (let path2 in o.reference) {
            if (!o.condition || o.condition(o.reference[path2])) {
              const updated = `${top.graph.name}.${path2}`;
              let split = updated.split(".");
              const lastKey = split.pop();
              const absolute = path2.split(".").slice(0, -1);
              const relative = [...basePath ? basePath.split(".") : [], ...absolute];
              let last = top.graph;
              let resolved = this.#router.nodes.get(updated);
              if (resolved)
                last = this.#router.nodes.get(split.join(".")) ?? top.graph;
              else {
                const get2 = (str, target) => target.nodes.get(str) ?? target[str];
                split = relative;
                try {
                  split.forEach((str) => last = get2(str, last));
                  resolved = lastKey ? get2(lastKey, last) : last;
                } catch {
                  last = top.graph;
                  split = absolute;
                  absolute.forEach((str) => last = get2(str, last));
                  resolved = lastKey ? get2(lastKey, last) : last;
                }
              }
              const used = split.join(".");
              const relJoin = relative.join(".");
              const isSame = basePath === path2;
              const mainPath = basePath && !isSame && o.map !== false ? `${basePath}.${path2}` : path2;
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
            const path2 = this.getPath(node, true);
            if (this.listeners.includeParent[path2])
              this.listeners.includeParent[path2] = true;
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
          const path2 = this.getPath(lastNode, true);
          this.listeners.includeParent[path2] = lastNode;
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
          const toResolve = this.listeners.includeParent[key];
          if (toResolve !== true) {
            this.subscribe(toResolve);
            this.listeners.includeParent[key] = true;
          }
        }
        await Promise.all(toRun.map((f2) => f2()));
      }
    }
  };
  getPath = (graph = this.graph, includeTag = false) => {
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
  subscribe = (node) => {
    const path2 = this.getPath(node) || node.tag;
    const targets = [node.children];
    for (let key in this.listeners.active[path2]) {
      const res = this.listeners.pool.in[key];
      if (res)
        this.listeners.active[path2][key] = res;
      else
        delete this.listeners.active[path2][key];
    }
    targets.push(this.listeners.active[path2]);
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
      if (path2 in this.listeners.includeParent && !aggregatedParent) {
        aggregated = aggregate([aggregated, node.graph.children]);
        aggregatedParent = true;
      }
      for (let tag in aggregated)
        aggregated[tag].forEach((info2) => this.resolve(args, info2, aggregated));
    });
  };
  resolve = (args, info2) => {
    if (info2.resolved instanceof GraphNode)
      info2 = info2.resolved;
    if (info2 instanceof GraphNode) {
      if (Array.isArray(args))
        this.#runGraph(info2, ...args);
      else
        this.#runGraph(info2, args);
    } else {
      let res;
      if (typeof info2.resolved === "function") {
        if (Array.isArray(args))
          res = info2.resolved.call(info2.last, ...args);
        else
          res = info2.resolved.call(info2.last, args);
      } else
        res = info2.resolved = info2.last[info2.lastKey] = args;
      let resolved = this.listeners.active[`${info2.path.used}.${info2.lastKey}`];
      if (!resolved)
        resolved = this.listeners.active[info2.lastKey];
      for (let key in resolved)
        this.resolve(res, this.listeners.pool.in[key]);
    }
  };
  stop = () => {
    if (this.#active === true) {
      for (let k2 in this.nested)
        this.nested[k2].stop();
      if (this.graph)
        this.graph.nodes.forEach((n) => {
          this.graph.removeTree(n);
          n.stopNode();
          this.graph.state.triggers = {};
        });
      this.#active = false;
    }
  };
  #create = (tag, info2) => {
    if (typeof info2 === "function")
      info2 = { default: info2 };
    if (!info2 || info2 instanceof Graph)
      return info2;
    else {
      let activeInfo;
      if (info2 instanceof ESPlugin) {
        activeInfo = info2.instance;
        info2 = info2.initial;
      }
      const args = info2.default instanceof Function ? parse_default(info2.default) ?? /* @__PURE__ */ new Map() : /* @__PURE__ */ new Map();
      if (args.size === 0)
        args.set("default", {});
      let argsArray = Array.from(args.entries());
      const input = argsArray[0][0];
      if (info2.arguments) {
        const isArray = Array.isArray(info2.arguments);
        let i = 0;
        for (let key in info2.arguments) {
          const v2 = info2.arguments[key];
          if (isArray) {
            argsArray[i].state = v2;
            if (i == 0)
              this.#toRun = true;
          } else {
            const got = args.get(key);
            if (got) {
              got.state = v2;
              if (input === key)
                this.#toRun = true;
            }
          }
          i++;
        }
      }
      const gsIn = {
        arguments: args,
        operator: info2.default,
        tag,
        default: info2.default
      };
      var props = Object.getOwnPropertyNames(info2);
      const onActive = ["arguments", "default", "tag", "operator"];
      props.forEach((key) => {
        if (!onActive.includes(key))
          gsIn[key] = info2[key];
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
  #runGraph = async (graph = this.graph, ...args) => {
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
  run = async (...args) => this.#runGraph(this.graph, ...args);
};
var src_default = ESPlugin;

// src/core/index.ts
var basePkgPath = "./package.json";
var moduleStringTag = "[object Module]";
var _filesystem, _input, _options, _url, _cache, _main, _mode, _onImport, _throw;
var WASL = class {
  constructor(urlOrObject, options2 = {}, url) {
    this.errors = [];
    this.warnings = [];
    this.files = {};
    this.original = {};
    this.resolved = {};
    this.debug = void 0;
    __privateAdd(this, _filesystem, void 0);
    __privateAdd(this, _input, {});
    __privateAdd(this, _options, {});
    __privateAdd(this, _url, void 0);
    __privateAdd(this, _cache, {});
    __privateAdd(this, _main, "");
    __privateAdd(this, _mode, "import");
    __privateAdd(this, _onImport, (path2, info2) => this.files[path2] = info2);
    __privateAdd(this, _throw, (e) => {
      const item = {
        message: e.message,
        file: e.file,
        node: e.node
      };
      const arr = e.type === "warning" ? this.warnings : this.errors;
      arr.push(item);
    });
    this.init = async (urlOrObject = __privateGet(this, _input), options2 = __privateGet(this, _options), url = "") => {
      this.debug = void 0;
      const internalLoadCall = options2._internal;
      const isFromValidator = !__privateGet(this, _main) && typeof internalLoadCall === "string";
      if (!__privateGet(this, _input))
        __privateSet(this, _input, urlOrObject);
      if (!__privateGet(this, _options))
        __privateSet(this, _options, options2);
      if (!__privateGet(this, _filesystem))
        __privateSet(this, _filesystem, options2.filesystem);
      if (!internalLoadCall) {
        if (!url)
          url = __privateGet(this, _url);
        try {
          new URL(url ?? urlOrObject);
          options2.relativeTo = "";
        } catch {
        }
      } else if (internalLoadCall === true)
        url = __privateGet(this, _main);
      if (isFromValidator)
        url = __privateSet(this, _main, internalLoadCall);
      const clonedOptions = Object.assign({}, options2);
      const innerTopLevel = clonedOptions._top === true;
      const isString = typeof urlOrObject === "string";
      const isHTML = urlOrObject instanceof HTMLElement;
      let mode, object, mainPath;
      if (isHTML) {
        object = from(urlOrObject, options2);
        if (options2.path)
          mode = "import";
        else {
          if (options2.filesystem)
            mode = "reference";
          else
            mode = "import";
        }
      } else if (typeof urlOrObject === "object") {
        object = Object.assign({}, urlOrObject);
        if (typeof internalLoadCall === "string")
          url = mainPath = Ze(internalLoadCall);
        mode = "reference";
      } else if (url || isString) {
        if (!url)
          url = urlOrObject[0] === "." ? Ze(urlOrObject, options2.relativeTo ?? "") : urlOrObject;
        mode = "import";
      } else
        console.error("Mode is not supported...");
      if (!internalLoadCall)
        __privateSet(this, _mode, mode);
      mode = clonedOptions._modeOverride ?? __privateGet(this, _mode);
      this.errors.push(...valid(urlOrObject, clonedOptions, "load"));
      this.original = object;
      switch (mode) {
        case "reference":
          if (!innerTopLevel) {
            if (__privateGet(this, _filesystem)) {
              const pkgPath = Ze(basePkgPath, url);
              const pkg = checkFiles(pkgPath, __privateGet(this, _filesystem));
              if (pkg)
                object = Object.assign(pkg, isString ? {} : object);
            }
          }
          break;
        default:
          if (!object) {
            mainPath = await Ze(url);
            this.original = await this.get(mainPath, void 0);
            object = JSON.parse(JSON.stringify(this.original));
            if (!innerTopLevel) {
              const pkgUrl = Ze(basePkgPath, mainPath, true);
              const pkg = await this.get(pkgUrl, void 0);
              if (pkg)
                object = Object.assign(pkg, object);
            }
          }
          break;
      }
      if (!internalLoadCall)
        __privateSet(this, _main, mainPath);
      else if (__privateGet(this, _mode) === "reference" && !__privateGet(this, _main))
        __privateSet(this, _main, "");
      if (this.errors.length === 0) {
        const copy = isHTML ? this.original : JSON.parse(JSON.stringify(this.original));
        this.resolved = await this.resolve(copy, { mainPath, mode }, options2);
        const drill = (parent, callback) => {
          const nodes = parent.components;
          for (let tag in nodes) {
            const res = callback(nodes[tag], {
              tag,
              parent,
              options: clonedOptions
            });
            if (res)
              nodes[tag] = res;
          }
        };
        const drillToTest = (target) => {
          drill(target, (node, info2) => {
            const connections = info2.parent.listeners;
            for (let output in connections) {
              const getTarget = (o, str) => o.components?.[str] ?? o[str];
              let outTarget = info2.parent.components;
              output.split(".").forEach((str) => outTarget = getTarget(outTarget, str));
              if (!outTarget) {
                __privateGet(this, _throw).call(this, {
                  message: `Node '${output}' (output) does not exist to create an edge.`,
                  file: url
                });
              }
              for (let input in connections[output]) {
                let inTarget = this.resolved.components;
                input.split(".").forEach((str) => inTarget = getTarget(inTarget, str));
                if (!inTarget) {
                  __privateGet(this, _throw).call(this, {
                    message: `Node '${input}' (input) does not exist to create an edge.`,
                    file: url
                  });
                }
              }
            }
          });
        };
        if (internalLoadCall === void 0) {
          if (clonedOptions.output !== "object") {
            this.plugin = new src_default(this.resolved, {
              activate: clonedOptions.activate,
              parentNode: clonedOptions.parentNode
            });
            return this.plugin;
          } else
            this.original = this.resolved;
          drillToTest(this.resolved);
        }
        return this.resolved;
      }
    };
    this.start = async () => {
      if (this.plugin)
        return await this.plugin.start();
    };
    this.stop = async () => {
      if (this.plugin)
        return await this.plugin.stop();
    };
    this.get = async (...args) => await get_default(args[0], args[1], __privateGet(this, _onImport), __privateGet(this, _options)).catch((e) => e);
    this.resolveSource = async (path2, modeOverride, {
      useCache = true,
      mode = "reference"
    } = {}) => {
      const activeMode = modeOverride ?? mode;
      let res = null;
      if (activeMode === "import") {
        if (__privateGet(this, _cache)[path2] && useCache) {
          console.warn("Found cached component", path2);
          res = __privateGet(this, _cache)[path2];
        } else
          res = await this.get(path2, void 0);
      } else if (__privateGet(this, _filesystem))
        res = checkFiles(path2, __privateGet(this, _filesystem));
      else {
        __privateGet(this, _throw).call(this, {
          message: "No options.filesystem field to get JavaScript objects",
          file: path2
        });
      }
      return res;
    };
    this.search = async (input, searchKey = "src", {
      condition = (value) => typeof value === "string",
      onFound = async (o, acc = []) => acc.push(o),
      mainPath,
      nestedKey,
      mode
    }) => {
      const top = input;
      let found;
      const pathMap = {};
      const drill = async (input2, tree = []) => {
        const parentInfo = tree[tree.length - 1];
        const path2 = tree.map((o) => o.key);
        const graphSlice = path2.slice(-3);
        const get2 = (pathInfo = path2) => {
          let target = top;
          pathInfo.forEach((str, i) => target = target[str]);
          return target;
        };
        const set = (input3, key = searchKey, pathInfo = path2) => {
          let target = top;
          pathInfo.forEach((str, i) => {
            if (!target[str])
              target[str] = {};
            target = target[str];
          });
          target[key] = input3;
        };
        if (condition(input2[searchKey])) {
          const isComponent = graphSlice.slice(-2)[0] === "components";
          let target = pathMap;
          path2.forEach((str, i) => target = target[str] ?? target);
          const pathArray = Array.isArray(target) ? path2.map((str, i) => target[i] ?? str) : path2;
          let o = {
            mainPath,
            mode,
            isComponent,
            paths: {
              original: path2,
              remapped: pathArray
            },
            get: get2,
            set,
            key: searchKey,
            value: input2[searchKey],
            setParent: function(input3, path3 = this.paths.remapped, fallbackKey) {
              let target2 = top;
              path3.forEach((str, i) => {
                if (i === path3.length - 1) {
                  if (fallbackKey && target2[str] && Object.keys(target2[str]).length > 1) {
                    console.warn(`Setting ${fallbackKey} instead of replacing parent for ${path3.join(".")}`);
                    target2[str][fallbackKey] = input3;
                  } else
                    target2[str] = input3;
                } else {
                  if (!target2[str])
                    target2[str] = {};
                  target2 = target2[str];
                }
              });
            },
            parent: parentInfo?.reference,
            name: parentInfo?.key
          };
          input2[searchKey] = null;
          if (onFound) {
            const got = await onFound(o, found);
            if (got && typeof got === "object")
              found = got;
          }
        }
        if (nestedKey) {
          const offset = path2.length - graphSlice.length;
          for (let key in nestedKey) {
            let i = 0;
            const pattern = nestedKey[key].pattern;
            const match = pattern ? pattern.reduce((a, o) => {
              let str = o?.key ?? o;
              let adjacencies = o?.adjacencies;
              if (typeof str === "string")
                a *= graphSlice[i] === str ? 1 : 0;
              if (adjacencies)
                a *= adjacencies.reduce((a2, str2) => {
                  a2 *= str2 in get2(path2.slice(0, offset + i)) ? 1 : 0;
                  return a2;
                }, 1);
              i++;
              return a;
            }, 1) : 1;
            const projection = nestedKey[key].projection ?? pattern;
            if (match) {
              await nestedKey[key].function(input2, {
                get: (key2, additionalPath = []) => get2([...path2, ...additionalPath, key2]),
                set: (key2, name2, value, additionalPath = []) => {
                  const base = [...path2.slice(0, offset), ...projection.map((str, i2) => !str ? graphSlice[i2] : str)];
                  const passed = [...base, ...additionalPath, name2];
                  set(value, key2, passed);
                  let targets = [
                    {
                      target: pathMap,
                      update: passed,
                      array: graphSlice
                    }
                  ];
                  const create = (target, array) => {
                    array.forEach((str) => {
                      if (!target[str])
                        target[str] = {};
                      target = target[str];
                    });
                    return target;
                  };
                  targets.forEach((o) => {
                    const target = create(o.target, o.array);
                    if (o.update)
                      target[name2] = o.update;
                    o.target = target;
                  });
                },
                delete: () => delete get2([...path2])[key]
              });
            }
          }
        }
        for (let key in input2) {
          if (input2[key] && typeof input2[key] === "object" && !(input2[key] instanceof HTMLElement))
            await drill(input2[key], [...tree, { reference: input2, key }]);
        }
      };
      await drill(input);
      return found;
    };
    this.findSources = async (graph, events, opts) => {
      return await this.search(graph, void 0, {
        mode: opts.mode,
        nestedKey: events.nested,
        onFound: async (o, acc = {}) => {
          o.type = "local";
          try {
            new URL(o.value);
            o.type = "remote";
          } catch {
          }
          const isRemote = o.type === "remote";
          const isAbsolute = o.value[0] !== ".";
          const main = o.mainPath || __privateGet(this, _main);
          const rootRelativeTo = __privateGet(this, _options).relativeTo;
          const isMainAbsolute = main?.[0] !== ".";
          let absoluteMain;
          if (!main)
            absoluteMain = rootRelativeTo;
          if (isMainAbsolute)
            absoluteMain = main;
          else
            absoluteMain = main.includes(rootRelativeTo) ? main : Ze(main, rootRelativeTo);
          if (isRemote)
            o.path = o.value;
          else if (isAbsolute)
            o.path = await C.resolve(o.value, {
              rootRelativeTo,
              nodeModules: __privateGet(this, _options).nodeModules
            });
          else {
            if (main) {
              o.path = Ze(o.value, absoluteMain);
              o.id = Ze(o.value, main);
            } else
              o.path = o.id = Ze(o.value);
          }
          if (isRemote || isAbsolute)
            o.id = o.path;
          if (isRemote)
            o.mode = "import";
          const ext = o.value.split("/").pop().split(".").slice(1).join(".");
          if (ext === "esc.json") {
            if (events.components)
              await events.components(o);
            return null;
          } else {
            if (!acc[ext])
              acc[ext] = {};
            if (!acc[ext][o.path])
              acc[ext][o.path] = [];
            acc[ext][o.path].push(o);
            return acc;
          }
        },
        mainPath: opts.mainPath
      });
    };
    this.resolve = async (graph, context, opts = {}) => {
      const remote = [];
      const nested = [];
      const foundInternal = {};
      const events = {
        components: (info2) => this.handleComponent(info2, events, context, opts, remote, foundInternal),
        nested: {
          overrides: {
            pattern: ["components", null, { key: "overrides", adjacencies: ["src"] }],
            projection: ["components", null, "components"],
            function: (value, info2) => this.handleOverride(value, info2, nested),
            update: (o, info2) => {
              o.mainPath = info2.path;
            }
          }
        }
      };
      const found = await this.findSources(graph, events, context) ?? {};
      this.flattenInto(foundInternal, found);
      const tic = performance.now();
      const total = Object.keys(found).reduce((acc, key) => acc + Object.keys(found[key]).length, 0);
      let i = 0;
      await Promise.all(Object.values(found).map(async (typeInfo) => {
        await Promise.all(Object.entries(typeInfo).map(async ([path2, pathInfo]) => {
          const res = await this.resolveSource(path2, pathInfo[0].mode);
          await Promise.all(pathInfo.map(async (info2) => await this.handleResolved(res, info2)));
          i++;
          const pathId = et.pathId(path2, __privateGet(this, _options));
          if (opts.callbacks?.progress?.source instanceof Function)
            opts.callbacks.progress?.source(pathId, i, total);
        }));
      }));
      const toc = performance.now();
      console.log("Resolved", total, "sources in", toc - tic, "ms");
      return graph;
    };
    this.updateContext = (info2, context) => {
      return {
        ...context,
        mainPath: info2.path,
        mode: info2.type === "remote" ? "import" : context.mode
      };
    };
    this.flattenInto = (o1, o2) => {
      for (let type in o1) {
        for (let path2 in o1[type]) {
          if (!o2[type])
            o2[type] = {};
          if (!o2[type][path2])
            o2[type][path2] = [];
          o2[type][path2].push(...o1[type][path2]);
        }
      }
    };
    this.handleResolved = (res, info2) => {
      const ogSrc = info2.value;
      const name2 = info2.name;
      const isError = res instanceof Error;
      const isModule = res && (!!Object.keys(res).reduce((a, b2) => {
        const desc = Object.getOwnPropertyDescriptor(res, b2);
        const isModule2 = desc && desc.get && !desc.set ? 1 : 0;
        return a + isModule2;
      }, 0) || Object.prototype.toString.call(res) === moduleStringTag);
      const isWASL = info2.path.includes("esc.json");
      const deepSource = (!isModule || !info2.isComponent) && !isWASL;
      const handlers = {
        _format: {
          "path": info2.path,
          "datauri": res,
          "object": res
        }
      };
      const parent = info2.parent[info2.name];
      for (let name3 in handlers._format) {
        if (parent._format === name3)
          res = handlers._format[name3];
        delete parent[name3];
      }
      if (!res || isError) {
        remove(ogSrc, info2.id, name2, deepSource ? void 0 : info2.parent, res);
        if (res)
          __privateGet(this, _throw).call(this, { message: res.message, file: info2.path, type: "warning" });
        return;
      }
      if (res !== void 0) {
        if (deepSource)
          info2.setParent(isModule && res.default ? res.default : res, void 0, info2.key);
        else {
          info2.set(res);
          const ref = info2.get();
          info2.setParent(merge(ref[info2.key], ref));
        }
        return res;
      }
    };
    this.handleComponent = async (info2, events, context, opts, acc = [], list = {}) => {
      const newContext = this.updateContext(info2, context);
      info2.mode = newContext.mode;
      const res = await this.resolveSource(info2.path, info2.mode, newContext);
      if (!res) {
        console.error("Not resolved", info2.path, info2);
        return;
      }
      const found = await this.findSources(res, events, newContext);
      if (opts.callbacks?.progress.components instanceof Function)
        opts.callbacks.progress.components(info2.path, acc.length, res);
      if (found)
        this.flattenInto(found, list);
      await this.handleResolved(res, info2);
      acc.push(info2);
      return acc;
    };
    this.handleOverride = async (value, info2, acc = [], pathUpdate = []) => {
      for (let nestedName in value) {
        const nestedNode = info2.get(nestedName, pathUpdate);
        if (nestedNode) {
          for (let key in value[nestedName]) {
            if (key === "components")
              this.handleOverride(value[nestedName][key], info2, [], [...pathUpdate, nestedName, key]);
            else {
              const newInfo = value[nestedName][key];
              if (newInfo)
                info2.set(key, nestedName, newInfo, pathUpdate);
            }
          }
        } else
          __privateGet(this, _throw).call(this, {
            message: `Plugin target '${nestedName}' does not exist`,
            node: name
          });
        acc.push(value);
      }
      return acc;
      info2.delete();
    };
    __privateSet(this, _input, urlOrObject);
    __privateSet(this, _options, options2);
    __privateSet(this, _url, url);
  }
};
_filesystem = new WeakMap();
_input = new WeakMap();
_options = new WeakMap();
_url = new WeakMap();
_cache = new WeakMap();
_main = new WeakMap();
_mode = new WeakMap();
_onImport = new WeakMap();
_throw = new WeakMap();
var core_default = WASL;

// src/common/utils/latest.js
var version = "0.0.0";
var latest_default = version;

// versions/0.0.0/component.schema.json
var component_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://raw.github.com/brainsatplay/wasl/versions/0.0.0/component.schema.json",
  title: "Component",
  description: "A component for the Web Application Specification Language",
  type: "object",
  anyOf: [
    {
      properties: {
        name: {
          type: "string"
        },
        description: {
          type: "string"
        },
        version: {
          type: "string",
          pattern: "^([^.]+)(.[^.]+)*?$"
        },
        author: {
          type: "string"
        },
        main: {
          type: "string",
          format: "uri-reference"
        },
        type: {
          type: "string",
          pattern: "^(module|commonjs)$"
        },
        repository: {
          type: "string",
          format: "uri"
        },
        components: {
          type: "object",
          patternProperties: {
            "^(.+)$": {
              $ref: "module.schema.json"
            }
          }
        },
        listeners: {
          description: "Listeners for internal events",
          type: "object",
          patternProperties: {
            "^([^.]+)(.[^.]+)*?$": {
              type: "object",
              patternProperties: {
                "^([^.]+)(.[^.]+)*?$": {
                  type: "boolean"
                }
              },
              additionalProperties: false
            }
          },
          additionalProperties: false
        }
      }
    }
  ]
};

// versions/0.0.0/module.schema.json
var module_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://raw.github.com/brainsatplay/wasl/versions/0.0.0/module.schema.json",
  title: "Module",
  description: "The composable units of the graph",
  type: "object",
  anyOf: [
    {
      properties: {
        src: {
          anyOf: [
            {
              type: "string",
              format: "uri-reference"
            },
            {
              type: "object",
              $ref: "component.schema.json"
            },
            {
              type: "object",
              $comment: "The raw JSON",
              properties: {
                default: {
                  description: "The stringified stateless function that this node uses to handle upstream information in the graph"
                },
                tagName: {
                  type: "string"
                },
                style: {
                  anyOf: [
                    {
                      type: "string",
                      format: "uri-reference"
                    },
                    {
                      type: "object"
                    }
                  ]
                },
                attributes: {
                  type: "object",
                  description: "A set of HTML Element events for the node to listen to",
                  patternProperties: {
                    "^on(.+)$": {
                      description: "A stringified function to handle an event"
                    }
                  }
                },
                oncreate: {
                  description: "A stringified function that responds to when this node's information is rendered as an HTML element"
                }
              },
              required: [
                "default"
              ]
            },
            {
              type: "object",
              properties: {
                language: {
                  type: "string"
                },
                text: {
                  type: "string"
                }
              },
              additionalProperties: false
            }
          ]
        },
        href: {
          anyOf: [
            {
              type: "string"
            }
          ]
        },
        extensions: {
          type: "object",
          patternProperties: {
            "^.*$": {
              type: "object",
              patternProperties: {
                "^.*$": {}
              },
              additionalProperties: false
            }
          },
          additionalProperties: false
        },
        overrides: {
          type: "object",
          patternProperties: {
            "^.*$": {
              type: "object",
              patternProperties: {
                "^.*$": {}
              },
              additionalProperties: false
            }
          },
          additionalProperties: false
        },
        children: {
          description: "The connections for this node",
          type: "object",
          patternProperties: {
            "^([^.]+)(.[^.]+)*?$": {
              type: "boolean"
            }
          },
          additionalProperties: false
        },
        arguments: {
          type: [
            "object",
            "array"
          ],
          $comment: "Generated by wasl.load"
        }
      }
    },
    {
      type: "object",
      $ref: "component.schema.json"
    }
  ]
};

// src/common/utils/schema.registry.js
var schema_registry_default = {
  ["0.0.0"]: {
    "component.schema.json": component_schema_default,
    "module.schema.json": module_schema_default
  }
};

// src/common/utils/get.js
var schemaCache = {};
var getSchema = async (v2 = latest_default) => {
  if (!schemaCache[v2]) {
    schemaCache[v2] = {};
    const og = schema_registry_default[v2];
    if (!og) {
      console.error("Schema not properly linked in the wasl library", v2, name);
    }
    for (let schema in og) {
      const keysWithDollarSign = Object.keys(og[schema]).filter((k2) => k2.includes("$"));
      keysWithDollarSign.forEach((k2) => delete og[schema][k2]);
    }
    schemaCache[v2] = og;
  }
  return schemaCache[v2];
};
var getSchemas = async (v2 = latest_default, name2 = "component.schema.json") => {
  const o = { main: null, all: [] };
  const schemas = await getSchema(v2);
  const keys = Object.keys(schemas);
  o.main = schemas[name2];
  keys.forEach((k2) => {
    o.all.push({ ref: schemas[k2], name: k2 });
  });
  return o;
};

// src/validate/index.ts
var import_ajv = __toESM(require_ajv(), 1);
var import_ajv_formats = __toESM(require_dist(), 1);
var activeVersion = null;
var ajv = new import_ajv.default({
  allErrors: true,
  allowUnionTypes: true
});
(0, import_ajv_formats.default)(ajv);
var validate = async (urlOrObject, options2 = {}) => {
  const clone = Object.assign({ errors: [], warnings: [] }, options2);
  let { version: version2, relativeTo, errors, warnings } = clone;
  if (!version2)
    version2 = latest_default;
  let schemaValid;
  let data = urlOrObject;
  try {
    new URL(urlOrObject);
    clone._remote = urlOrObject;
    delete clone.relativeTo;
    relativeTo = "";
  } catch {
  }
  const inputErrors = valid(urlOrObject, clone, "validate");
  const inputIsValid = inputErrors.length === 0;
  errors.push(...inputErrors);
  if (typeof urlOrObject === "string") {
    data = await get_default(urlOrObject, relativeTo, void 0, options2).catch((e) => {
      errors.push({
        message: e.message,
        file: urlOrObject
      });
      console.log("Got!", data);
    });
  }
  let wasl;
  if (errors.length === 0) {
    activeVersion = version2;
    let schemas = await getSchemas(version2);
    const schemaCopy = JSON.parse(JSON.stringify(schemas.main));
    schemas.all.forEach((s) => {
      const schema = ajv.getSchema(s.name);
      if (!schema)
        ajv.addSchema(s.ref, s.name);
    });
    const ajvValidate = await ajv.compile(schemaCopy);
    schemaValid = ajvValidate(data);
    if (ajvValidate.errors)
      errors.push(...ajvValidate.errors);
  }
  return schemaValid && inputIsValid;
};
var validate_default = validate;

// tests/0/0.0/0.0.0/basic/index.esc.json
var index_wasl_default = {
  name: "My Application",
  components: {
    plugin: {
      src: "../../../plugins/plugin/index.esc.json",
      overrides: {
        add: {
          arguments: {
            input: 15
          },
          toAdd: {
            src: "./number.js"
          }
        }
      },
      children: {
        log: true,
        math: true
      }
    },
    math: {
      src: "../../../plugins/math/index.esc.json",
      children: {
        external: true,
        log: true
      }
    },
    external: {
      components: {
        secondaddition: {
          src: "../../../plugins/math/add2.js",
          children: {
            secondmultiplication: true
          }
        },
        secondmultiplication: {
          src: "../../../plugins/math/multiply2.js"
        }
      },
      ports: {
        input: "secondaddition",
        output: "secondmultiplication"
      },
      children: {
        log: true
      }
    },
    log: {
      src: "../../../plugins/log.js"
    }
  }
};

// tests/0/0.0/0.0.0/basic/package.json
var package_default = {
  name: "app",
  description: "A basic WASL application",
  author: "Garrett Flynn <garrettmflynn@gmail.com>",
  type: "module",
  main: "index.js"
};

// tests/0/plugins/plugin/package.json
var package_default2 = {
  name: "plugin",
  description: "A basic WASL plugin",
  author: "Garrett Flynn <garrettmflynn@gmail.com>",
  type: "module",
  main: "index.js"
};

// tests/0/plugins/plugin/index.esc.json
var index_wasl_default2 = {
  name: "Test Plugin",
  components: {
    add: {
      src: "../math/add.js",
      children: {
        multiply: true
      }
    },
    multiply: {
      src: "../math/multiply.js"
    }
  },
  ports: {
    input: "add",
    output: "multiply"
  }
};

// tests/0/plugins/math/index.esc.json
var index_wasl_default3 = {
  name: "Math Plugin",
  components: {
    addition: {
      src: "./add2.js",
      children: {
        multiplication: true
      }
    },
    multiplication: {
      src: "./multiply2.js"
    }
  },
  ports: {
    input: "addition",
    output: "multiplication"
  }
};

// tests/0/plugins/log.js
var log_exports = {};
__export(log_exports, {
  default: () => log_default
});
var log_default = (input) => console.log(input);

// tests/0/plugins/math/add.js
var add_exports = {};
__export(add_exports, {
  default: () => add_default,
  toAdd: () => toAdd
});
var toAdd = 1;
function add_default(input) {
  const res = input + this.toAdd;
  console.log(`Adding ${input} + ${this.toAdd} =`, res);
  return res;
}

// tests/0/plugins/math/add2.js
var add2_exports = {};
__export(add2_exports, {
  default: () => add2_default,
  toAdd: () => toAdd2
});
var toAdd2 = 10;
function add2_default(input) {
  const res = input + this.toAdd;
  console.log(`Adding ${input} + ${this.toAdd} =`, res);
  return res;
}

// tests/0/plugins/math/multiply.js
var multiply_exports = {};
__export(multiply_exports, {
  default: () => multiply_default
});
var multiply_default = (input) => {
  const res = 10 * input;
  console.log(`Multiplying 10 * ${input} =`, res);
  return res;
};

// tests/0/plugins/math/multiply2.js
var multiply2_exports = {};
__export(multiply2_exports, {
  default: () => multiply2_default
});
var multiply2_default = (input) => {
  const res = 2 * input;
  console.log(`Multiplying 2 * ${input} =`, res);
  return res;
};

// tests/0/0.0/0.0.0/basic/number.js
var number_default = 3;

// demos/basic/0.0.0.js
var path = "./tests/0/0.0/0.0.0/basic/index.esc.json";
var filesystem = {
  ["package.json"]: package_default,
  ["plugins/plugin/index.esc.json"]: index_wasl_default2,
  ["plugins/log.js"]: log_exports,
  ["plugins/math/index.esc.json"]: index_wasl_default3,
  ["plugins/math/add.js"]: add_exports,
  ["plugins/math/add2.js"]: add2_exports,
  ["plugins/math/multiply.js"]: multiply_exports,
  ["plugins/math/multiply2.js"]: multiply2_exports,
  ["plugins/plugin/package.json"]: package_default2,
  ["number.js"]: number_default
};
var options = {
  version: "0.0.0",
  filesystem
};

// index.js
var useHTML = false;
var printError = (arr, type, severity = "Error") => {
  arr.forEach((e) => {
    const log = severity === "Warning" ? console.warn : console.error;
    log(`${severity} (${type})`, e);
  });
};
var referenceDiv = document.getElementById("reference");
var importDiv = document.getElementById("import");
var generatedDiv = document.getElementById("generated");
var startExecution = async () => {
  options.path = path;
  options.activate = true;
  options.forceImportFromText = true;
  options.debug = true;
  options.relativeTo = window.location.href;
  options.callbacks = {
    progress: {
      source: (label, i, total) => {
        console.log("Source", label, i, total);
      },
      components: (label, i, graph) => {
        console.log("Remote Component", label, i, graph);
      },
      file: (path2, i, total, done, failed) => {
        if (failed)
          console.error(`${path2} failed`, failed);
        else if (done)
          console.log(`${path2} done!`);
        else
          console.log("File", path2, i, total);
      },
      fetch: (path2, i, total, done, failed) => {
        if (failed)
          console.error(`${path2} fetch failed`, failed);
        else if (done)
          console.log(`${path2} fetch done!`);
        else
          console.log("Fetch", path2, i, total);
      }
    }
  };
  let imported = await runMode(path, options, "import");
  let ref = await runMode(index_wasl_default, options, "reference");
  let info2 = [
    { wasl: imported, div: importDiv, name: "Import" },
    { wasl: ref, div: referenceDiv, name: "Reference" }
  ];
  const generationContainer = document.getElementById("generatedcontainer");
  if (useHTML) {
    const copy = Object.assign({}, options);
    copy.parentNode = generationContainer;
    to(index_wasl_default, copy);
    let generated = await runMode(generationContainer, options, "generated");
    info2.push({ wasl: generated, div: generatedDiv, name: "HTML" });
  } else
    generationContainer.parentNode.remove();
  let refArr = [];
  for (let i in info2) {
    let o = info2[i];
    console.log("info", o);
    if (o.wasl) {
      console.log(`------------------ ${o.name.toUpperCase()} MODE ------------------`);
      await o.wasl.init();
      await o.wasl.start();
      console.log("Original", o.wasl.original);
      console.log("Resolved", o.wasl.resolved);
      try {
        const str = JSON.stringify(o.wasl.original, null, 2);
        o.div.value = str;
      } catch {
        o.div.value = o.wasl.original;
      }
      refArr.push(o.wasl.original);
    } else
      o.div.value = void 0;
  }
  if (refArr[0] && refArr[1] && refArr[2])
    console.warn("One of the modes has failed for this example!");
};
startExecution();
async function runMode(input, options2, name2 = "import") {
  let wasl;
  if (input) {
    console.log(`Starting ${name2} mode`);
    const optionsCopy = Object.assign({ errors: [], warnings: [] }, options2);
    optionsCopy.parentNode = document.getElementById(`${name2}container`);
    const schemaValid = await validate_default(input, optionsCopy);
    console.log(`validate (${name2})`, schemaValid);
    if (schemaValid) {
      wasl = new core_default(input, optionsCopy);
      console.log(`load (${name2})`, wasl);
      await wasl.init();
      const loadValid = await validate_default(wasl, options2);
      if (!loadValid)
        console.error("Invalid Loaded WASL Object");
    } else
      console.error("Invalid WASL Schema");
    printError(optionsCopy.errors, "import");
    printError(optionsCopy.warnings, "import", "Warning");
  }
  return wasl;
}
/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
