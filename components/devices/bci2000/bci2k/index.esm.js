var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// node_modules/es5-ext/global.js
var require_global = __commonJS({
  "node_modules/es5-ext/global.js"(exports, module) {
    var naiveFallback = function() {
      if (typeof self === "object" && self)
        return self;
      if (typeof window === "object" && window)
        return window;
      throw new Error("Unable to resolve global `this`");
    };
    module.exports = function() {
      if (this)
        return this;
      if (typeof globalThis === "object" && globalThis)
        return globalThis;
      try {
        Object.defineProperty(Object.prototype, "__global__", {
          get: function() {
            return this;
          },
          configurable: true
        });
      } catch (error) {
        return naiveFallback();
      }
      try {
        if (!__global__)
          return naiveFallback();
        return __global__;
      } finally {
        delete Object.prototype.__global__;
      }
    }();
  }
});

// node_modules/websocket/package.json
var require_package = __commonJS({
  "node_modules/websocket/package.json"(exports, module) {
    module.exports = {
      name: "websocket",
      description: "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
      keywords: [
        "websocket",
        "websockets",
        "socket",
        "networking",
        "comet",
        "push",
        "RFC-6455",
        "realtime",
        "server",
        "client"
      ],
      author: "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)",
      contributors: [
        "I\xF1aki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
      ],
      version: "1.0.34",
      repository: {
        type: "git",
        url: "https://github.com/theturtle32/WebSocket-Node.git"
      },
      homepage: "https://github.com/theturtle32/WebSocket-Node",
      engines: {
        node: ">=4.0.0"
      },
      dependencies: {
        bufferutil: "^4.0.1",
        debug: "^2.2.0",
        "es5-ext": "^0.10.50",
        "typedarray-to-buffer": "^3.1.5",
        "utf-8-validate": "^5.0.2",
        yaeti: "^0.0.6"
      },
      devDependencies: {
        "buffer-equal": "^1.0.0",
        gulp: "^4.0.2",
        "gulp-jshint": "^2.0.4",
        "jshint-stylish": "^2.2.1",
        jshint: "^2.0.0",
        tape: "^4.9.1"
      },
      config: {
        verbose: false
      },
      scripts: {
        test: "tape test/unit/*.js",
        gulp: "gulp"
      },
      main: "index",
      directories: {
        lib: "./lib"
      },
      browser: "lib/browser.js",
      license: "Apache-2.0"
    };
  }
});

// node_modules/websocket/lib/version.js
var require_version = __commonJS({
  "node_modules/websocket/lib/version.js"(exports, module) {
    module.exports = require_package().version;
  }
});

// node_modules/websocket/lib/browser.js
var require_browser = __commonJS({
  "node_modules/websocket/lib/browser.js"(exports, module) {
    var _globalThis;
    if (typeof globalThis === "object") {
      _globalThis = globalThis;
    } else {
      try {
        _globalThis = require_global();
      } catch (error) {
      } finally {
        if (!_globalThis && typeof window !== "undefined") {
          _globalThis = window;
        }
        if (!_globalThis) {
          throw new Error("Could not determine global this");
        }
      }
    }
    var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;
    var websocket_version = require_version();
    function W3CWebSocket(uri, protocols) {
      var native_instance;
      if (protocols) {
        native_instance = new NativeWebSocket(uri, protocols);
      } else {
        native_instance = new NativeWebSocket(uri);
      }
      return native_instance;
    }
    if (NativeWebSocket) {
      ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function(prop) {
        Object.defineProperty(W3CWebSocket, prop, {
          get: function() {
            return NativeWebSocket[prop];
          }
        });
      });
    }
    module.exports = {
      "w3cwebsocket": NativeWebSocket ? W3CWebSocket : null,
      "version": websocket_version
    };
  }
});

// src/BCI2K_OperatorConnection.ts
var import_websocket = __toESM(require_browser(), 1);
var BCI2K_OperatorConnection = class {
  constructor(address) {
    this.ondisconnect = () => {
    };
    this.onStateChange = (event) => {
    };
    this.websocket = null;
    this.state = "";
    this.address = address || void 0;
    this.latestIncomingData = "";
    this.msgID = 0;
    this.newData = () => {
    };
    this.responseBuffer = [];
  }
  connect(address) {
    return new Promise((resolve, reject) => {
      if (this.address === void 0) {
        this.address = address || "ws://127.0.0.1:80";
      }
      this.websocket = new import_websocket.w3cwebsocket(this.address);
      this.websocket.onerror = (error) => reject(`Error connecting to BCI2000 at ${this.address}`);
      this.websocket.onclose = () => {
        console.log("Connection closed");
        this.ondisconnect();
      };
      this.websocket.onopen = () => resolve();
      this.websocket.onmessage = (event) => {
        let { opcode, id, contents } = JSON.parse(event.data);
        switch (opcode) {
          case "O":
            this.responseBuffer.push({ id, response: contents });
            this.newData(contents);
            break;
          default:
            break;
        }
      };
    });
  }
  disconnect() {
    this.websocket.close();
  }
  connected() {
    return this.websocket !== null && this.websocket.readyState === import_websocket.w3cwebsocket.OPEN;
  }
  execute(instruction) {
    if (this.connected()) {
      return new Promise((resolve, reject) => {
        this.msgID = this.msgID + 1;
        this.websocket.send(
          JSON.stringify({
            opcode: "E",
            id: this.msgID,
            contents: instruction
          })
        );
        this.newData = (data) => resolve(data);
      });
    }
    return Promise.reject(
      "Cannot execute instruction: not connected to BCI2000"
    );
  }
  getVersion() {
    return __async(this, null, function* () {
      let resp = yield this.execute("Version");
      return resp.split("\r")[0];
    });
  }
  showWindow() {
    return __async(this, null, function* () {
      yield this.execute("Show Window");
    });
  }
  hideWindow() {
    return __async(this, null, function* () {
      yield this.execute("Hide Window");
    });
  }
  startExecutable(executable) {
    return __async(this, null, function* () {
      yield this.execute(`Start executable ${executable}`);
    });
  }
  startDummyRun() {
    return __async(this, null, function* () {
      yield this.startExecutable("SignalGenerator");
      yield this.startExecutable("DummySignalProcessing");
      yield this.startExecutable("DummyApplication");
    });
  }
  setWatch(state, ip, port) {
    return __async(this, null, function* () {
      yield this.execute("Add watch " + state + " at " + ip + ":" + port);
    });
  }
  resetSystem() {
    return __async(this, null, function* () {
      yield this.execute("Reset System");
    });
  }
  setConfig() {
    return __async(this, null, function* () {
      yield this.execute("Set Config");
    });
  }
  start() {
    return __async(this, null, function* () {
      yield this.execute("Start");
    });
  }
  stop() {
    return __async(this, null, function* () {
      yield this.execute("Stop");
    });
  }
  kill() {
    return __async(this, null, function* () {
      yield this.execute("Exit");
    });
  }
  stateListen() {
    setInterval(() => __async(this, null, function* () {
      let state = yield this.execute("GET SYSTEM STATE");
      if (state.trim() != this.state) {
        this.onStateChange(state.trim());
      }
    }), 1e3);
  }
  getSubjectName() {
    return __async(this, null, function* () {
      return yield this.execute("Get Parameter SubjectName");
    });
  }
  getTaskName() {
    return __async(this, null, function* () {
      return yield this.execute("Get Parameter DataFile");
    });
  }
  setParameter(parameter) {
    return __async(this, null, function* () {
      yield this.execute(`Set paramater ${parameter}`);
    });
  }
  setState(state) {
    return __async(this, null, function* () {
      yield this.execute(`Set state ${state}`);
    });
  }
  getParameters() {
    return __async(this, null, function* () {
      let parameters = yield this.execute("List Parameters");
      let allData = parameters.split("\n");
      let data = {};
      let el;
      allData.forEach((line) => {
        let descriptors = line.split("=")[0];
        let dataType = descriptors.split(" ")[1];
        let name = descriptors.split(" ")[2];
        let names = descriptors.split(" ")[0].split(":");
        names.forEach((x, i) => {
          switch (i) {
            case 0: {
              if (data[names[0]] == void 0) {
                data[names[0]] = {};
              }
              el = data[names[0]];
              break;
            }
            case 1: {
              if (data[names[0]][names[1]] == void 0) {
                data[names[0]][names[1]] = {};
              }
              el = data[names[0]][names[1]];
              break;
            }
            case 2: {
              if (data[names[0]][names[1]][names[2]] == void 0) {
                data[names[0]][names[1]][names[2]] = {};
              }
              el = data[names[0]][names[1]][names[2]];
              break;
            }
            default: {
            }
          }
        });
        if (dataType != "matrix") {
          if (line.split("=")[1].split("//")[0].trim().split(" ").length == 4) {
            el[name] = {
              dataType,
              value: {
                value: line.split("=")[1].split("//")[0].trim().split(" ")[0],
                defaultValue: line.split("=")[1].split("//")[0].trim().split(" ")[1],
                low: line.split("=")[1].split("//")[0].trim().split(" ")[2],
                high: line.split("=")[1].split("//")[0].trim().split(" ")[3]
              },
              comment: line.split("=")[1].split("//")[1]
            };
          } else {
            el[name] = {
              dataType,
              value: line.split("=")[1].split("//")[0].trim(),
              comment: line.split("=")[1].split("//")[1]
            };
          }
        } else {
          el[name] = {
            dataType,
            value: line.split("=")[1].split("//")[0].trim(),
            comment: line.split("=")[1].split("//")[1]
          };
        }
      });
      return data;
    });
  }
};

// src/BCI2K_DataConnection.ts
var import_websocket2 = __toESM(require_browser(), 1);
var BCI2K_DataConnection = class {
  constructor(address) {
    this._socket = null;
    this.onconnect = () => {
    };
    this.onGenericSignal = (data) => {
    };
    this.onStateVector = (data) => {
    };
    this.onSignalProperties = (data) => {
    };
    this.onStateFormat = (data) => {
    };
    this.ondisconnect = () => {
    };
    this.onReceiveBlock = () => {
    };
    this.callingFrom = "";
    this.states = {};
    this.signal = null;
    this.signalProperties = null;
    this.stateFormat = null;
    this.stateVecOrder = null;
    this.SignalType = {
      INT16: 0,
      FLOAT24: 1,
      FLOAT32: 2,
      INT32: 3
    };
    this.address = address;
  }
  getNullTermString(dv) {
    var val = "";
    let count = 0;
    while (count < dv.byteLength) {
      var v = dv.getUint8(count);
      count++;
      if (v == 0)
        break;
      val += String.fromCharCode(v);
    }
    return val;
  }
  connect(address, callingFrom) {
    let connection = this;
    if (connection.address === void 0)
      connection.address = address;
    this.callingFrom = callingFrom;
    return new Promise((resolve, reject) => {
      connection._socket = new import_websocket2.w3cwebsocket(connection.address);
      connection._socket.binaryType = "arraybuffer";
      connection._socket.onerror = () => {
        reject("Error connecting to data source at " + connection.address);
      };
      connection._socket.onopen = () => {
        connection.onconnect();
        resolve();
      };
      connection._socket.onclose = () => {
        connection.ondisconnect();
        setTimeout(() => {
          console.log("Disconnected");
          this.connect("");
        }, 1e3);
      };
      connection._socket.onmessage = (event) => {
        connection._decodeMessage(event.data);
      };
    });
  }
  connected() {
    return this._socket != null && this._socket.readyState === import_websocket2.w3cwebsocket.OPEN;
  }
  _decodeMessage(data) {
    let descriptor = new DataView(data, 0, 1).getUint8(0);
    switch (descriptor) {
      case 3:
        let stateFormatView = new DataView(data, 1, data.byteLength - 1);
        this._decodeStateFormat(stateFormatView);
        break;
      case 4:
        let supplement = new DataView(data, 1, 2).getUint8(0);
        switch (supplement) {
          case 1:
            let genericSignalView = new DataView(data, 2, data.byteLength - 2);
            this._decodeGenericSignal(genericSignalView);
            break;
          case 3:
            let signalPropertyView = new DataView(data, 2, data.byteLength - 2);
            this._decodeSignalProperties(signalPropertyView);
            break;
          default:
            console.error("Unsupported Supplement: " + supplement.toString());
            break;
        }
        this.onReceiveBlock();
        break;
      case 5:
        let stateVectorView = new DataView(data, 1, data.byteLength - 1);
        this._decodeStateVector(stateVectorView);
        break;
      default:
        console.error("Unsupported Descriptor: " + descriptor.toString());
        break;
    }
  }
  _decodePhysicalUnits(unitstr) {
    let units;
    units = {};
    let unit = unitstr.split(" ");
    let idx = 0;
    units.offset = Number(unit[idx++]);
    units.gain = Number(unit[idx++]);
    units.symbol = unit[idx++];
    units.vmin = Number(unit[idx++]);
    units.vmax = Number(unit[idx++]);
    return units;
  }
  _decodeSignalProperties(data) {
    let propstr = this.getNullTermString(data);
    propstr = propstr.replace(/{/g, " { ");
    propstr = propstr.replace(/}/g, " } ");
    this.signalProperties = {};
    let prop_tokens = propstr.split(" ");
    let props = [];
    for (let i = 0; i < prop_tokens.length; i++) {
      if (prop_tokens[i].trim() === "")
        continue;
      props.push(prop_tokens[i]);
    }
    let pidx = 0;
    this.signalProperties.name = props[pidx++];
    this.signalProperties.channels = [];
    if (props[pidx] === "{") {
      while (props[++pidx] !== "}")
        this.signalProperties.channels.push(props[pidx]);
      pidx++;
    } else {
      let numChannels = parseInt(props[pidx++]);
      for (let i = 0; i < numChannels; i++)
        this.signalProperties.channels.push((i + 1).toString());
    }
    this.signalProperties.elements = [];
    if (props[pidx] === "{") {
      while (props[++pidx] !== "}")
        this.signalProperties.elements.push(props[pidx]);
      pidx++;
    } else {
      let numElements = parseInt(props[pidx++]);
      for (let i = 0; i < numElements; i++)
        this.signalProperties.elements.push((i + 1).toString());
    }
    this.signalProperties.numelements = this.signalProperties.elements.length;
    this.signalProperties.signaltype = props[pidx++];
    this.signalProperties.channelunit = this._decodePhysicalUnits(
      props.slice(pidx, pidx += 5).join(" ")
    );
    this.signalProperties.elementunit = this._decodePhysicalUnits(
      props.slice(pidx, pidx += 5).join(" ")
    );
    pidx++;
    this.signalProperties.valueunits = [];
    for (let i = 0; i < this.signalProperties.channels.length; i++)
      this.signalProperties.valueunits.push(
        this._decodePhysicalUnits(props.slice(pidx, pidx += 5).join(" "))
      );
    pidx++;
    this.onSignalProperties(this.signalProperties);
  }
  _decodeStateFormat(data) {
    this.stateFormat = {};
    let formatStr = this.getNullTermString(data);
    let lines = formatStr.split("\n");
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      if (lines[lineIdx].trim().length === 0)
        continue;
      let stateline = lines[lineIdx].split(" ");
      let name = stateline[0];
      this.stateFormat[name] = {};
      this.stateFormat[name].bitWidth = parseInt(stateline[1]);
      this.stateFormat[name].defaultValue = parseInt(stateline[2]);
      this.stateFormat[name].byteLocation = parseInt(stateline[3]);
      this.stateFormat[name].bitLocation = parseInt(stateline[4]);
    }
    let vecOrder = [];
    for (let state in this.stateFormat) {
      let loc = this.stateFormat[state].byteLocation * 8;
      loc += this.stateFormat[state].bitLocation;
      vecOrder.push([state, loc]);
    }
    vecOrder.sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
    this.stateVecOrder = [];
    for (let i = 0; i < vecOrder.length; i++) {
      let state = vecOrder[i][0];
      this.stateVecOrder.push([state, this.stateFormat[state].bitWidth]);
    }
    this.onStateFormat(this.stateFormat);
  }
  _decodeGenericSignal(data) {
    let index = 0;
    let signalType = data.getUint8(index);
    index = index + 1;
    let nChannels = data.getUint16(index, true);
    index = index + 2;
    let nElements = data.getUint16(index, true);
    index = index + 2;
    index = index + data.byteOffset;
    let signalData = new DataView(data.buffer, index);
    let signal = [];
    for (let ch = 0; ch < nChannels; ++ch) {
      signal.push([]);
      for (let el = 0; el < nElements; ++el) {
        switch (signalType) {
          case this.SignalType.INT16:
            signal[ch].push(
              signalData.getInt16((nElements * ch + el) * 2, true)
            );
            break;
          case this.SignalType.FLOAT32:
            signal[ch].push(
              signalData.getFloat32((nElements * ch + el) * 4, true)
            );
            break;
          case this.SignalType.INT32:
            signal[ch].push(
              signalData.getInt32((nElements * ch + el) * 4, true)
            );
            break;
          case this.SignalType.FLOAT24:
            signal[ch].push(0);
            break;
          default:
            break;
        }
      }
    }
    this.signal = signal;
    this.onGenericSignal(signal);
  }
  _decodeStateVector(dv) {
    if (this.stateVecOrder == null)
      return;
    let i8Array = new Int8Array(dv.buffer);
    let firstZero = i8Array.indexOf(0);
    let secondZero = i8Array.indexOf(0, firstZero + 1);
    let decoder = new TextDecoder();
    let stateVectorLength = parseInt(
      decoder.decode(i8Array.slice(1, firstZero))
    );
    let numVectors = parseInt(
      decoder.decode(i8Array.slice(firstZero + 1, secondZero))
    );
    let index = secondZero + 1;
    let data = new DataView(dv.buffer, index);
    let states = {};
    for (let state in this.stateFormat) {
      states[state] = Array(numVectors).fill(
        this.stateFormat[state].defaultValue
      );
    }
    for (let vecIdx = 0; vecIdx < numVectors; vecIdx++) {
      let vec = new Uint8Array(
        data.buffer,
        data.byteOffset + vecIdx * stateVectorLength,
        stateVectorLength
      );
      let bits = [];
      for (let byteIdx = 0; byteIdx < vec.length; byteIdx++) {
        bits.push((vec[byteIdx] & 1) !== 0 ? 1 : 0);
        bits.push((vec[byteIdx] & 2) !== 0 ? 1 : 0);
        bits.push((vec[byteIdx] & 4) !== 0 ? 1 : 0);
        bits.push((vec[byteIdx] & 8) !== 0 ? 1 : 0);
        bits.push((vec[byteIdx] & 16) !== 0 ? 1 : 0);
        bits.push((vec[byteIdx] & 32) !== 0 ? 1 : 0);
        bits.push((vec[byteIdx] & 64) !== 0 ? 1 : 0);
        bits.push((vec[byteIdx] & 128) !== 0 ? 1 : 0);
      }
      for (let stateIdx = 0; stateIdx < this.stateVecOrder.length; stateIdx++) {
        let fmt = this.stateFormat[this.stateVecOrder[stateIdx][0]];
        let offset = fmt.byteLocation * 8 + fmt.bitLocation;
        let val = 0;
        let mask = 1;
        for (let bIdx = 0; bIdx < fmt.bitWidth; bIdx++) {
          if (bits[offset + bIdx])
            val = (val | mask) >>> 0;
          mask = mask << 1 >>> 0;
        }
        states[this.stateVecOrder[stateIdx][0]][vecIdx] = val;
      }
    }
    this.onStateVector(states);
    this.states = states;
  }
};
export {
  BCI2K_DataConnection,
  BCI2K_OperatorConnection
};
//# sourceMappingURL=index.esm.js.map
