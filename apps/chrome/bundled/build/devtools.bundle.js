([]).push([[3],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], "{").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      // eslint-disable-next-line prefer-destructuring
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = modules[_i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = "(".concat(item[2], ") and (").concat(mediaQuery, ")");
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot).concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stylesInDom = {};

var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

function listToStyles(list, options) {
  var styles = [];
  var newStyles = {};

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var css = item[1];
    var media = item[2];
    var sourceMap = item[3];
    var part = {
      css: css,
      media: media,
      sourceMap: sourceMap
    };

    if (!newStyles[id]) {
      styles.push(newStyles[id] = {
        id: id,
        parts: [part]
      });
    } else {
      newStyles[id].parts.push(part);
    }
  }

  return styles;
}

function addStylesToDom(styles, options) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i];
    var domStyle = stylesInDom[item.id];
    var j = 0;

    if (domStyle) {
      domStyle.refs++;

      for (; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j]);
      }

      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j], options));
      }
    } else {
      var parts = [];

      for (; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j], options));
      }

      stylesInDom[item.id] = {
        id: item.id,
        refs: 1,
        parts: parts
      };
    }
  }
}

function insertStyleElement(options) {
  var style = document.createElement('style');

  if (typeof options.attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      options.attributes.nonce = nonce;
    }
  }

  Object.keys(options.attributes).forEach(function (key) {
    style.setAttribute(key, options.attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {};
  options.attributes = typeof options.attributes === 'object' ? options.attributes : {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  var styles = listToStyles(list, options);
  addStylesToDom(styles, options);
  return function update(newList) {
    var mayRemove = [];

    for (var i = 0; i < styles.length; i++) {
      var item = styles[i];
      var domStyle = stylesInDom[item.id];

      if (domStyle) {
        domStyle.refs--;
        mayRemove.push(domStyle);
      }
    }

    if (newList) {
      var newStyles = listToStyles(newList, options);
      addStylesToDom(newStyles, options);
    }

    for (var _i = 0; _i < mayRemove.length; _i++) {
      var _domStyle = mayRemove[_i];

      if (_domStyle.refs === 0) {
        for (var j = 0; j < _domStyle.parts.length; j++) {
          _domStyle.parts[j]();
        }

        delete stylesInDom[_domStyle.id];
      }
    }
  };
};

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_devtools_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _css_devtools_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_devtools_css__WEBPACK_IMPORTED_MODULE_0__);
// import './devtools/index.js'



let states = {
    document: null,
    table: null
  }; 
  
  
  // ------------------------------------------------------------------
  // ----------------------- UI Management Code -----------------------
  // ------------------------------------------------------------------
  
  let sections = {}
  let headers = []
  
  const add = (arr) => arr.reduce((a, b) => a + b, 0)
  const average = (arr) => add(arr) / arr.length
  
  const update = async (path, info, update) => {
  
      states.error.style.display = 'none'
  
      // ------------------ Show States on UI ------------------
      if (states.table){
  
          const split = path.split('.')
          const last = split.pop()
          const obj = split.join('.')
  
          let section = sections[obj]
          if (!section) {
              section = sections[obj] = {
                  states: {
                      averages: {},
                      elements: {},
                      output: {}
                  },
                  columns: {
                      name: document.createElement('th')
                  }
              }
              
              section.header = document.createElement('tr')
              section.header.classList.add('header-row')
              section.columns.name.innerText = obj
              section.header.appendChild(section.columns.name)
              states.table.appendChild(section.header)
          }
  
          let state = section.states[last]
          if(!state) {
  
              let header = section.columns.state
              if (!header) {
                  const header = document.createElement('th')
                  header.innerText = 'state'
                  section.header.appendChild(header)
                  section.columns.state = header
              }
  
              state = section.states[last] = {
                  info: {
                      averages: {},
                      columns: {},
                      output: {}
                  },
              }
  
              state.header = document.createElement('th')
              state.header.innerText = path
              state.div = document.createElement('tr')
              state.value = document.createElement('td')
              state.averages = {}
  
              state.div.appendChild(state.header)
              state.div.appendChild(state.value)
          }
  
          section.header.insertAdjacentElement('afterend', state.div)
  
          if (typeof update === 'object') state.value.innerHTML = 'Object' //JSON.stringify(update)
          else state.value.innerHTML = JSON.stringify(update)
  
          const infoCopy = {...info}
  
          for (let key in infoCopy) {
            if (!headers.includes(key)) headers.push(key)
          }
  
          headers.forEach(key => {
  
              const val = infoCopy[key]
              if (!state.info.averages[key]) state.info.averages[key] = []
  
              let output = val
              if (typeof val === 'number') {
                  const aveArr = state.info.averages[key]
                  aveArr.push(val)
                  output = `${average(aveArr).toFixed(3)}ms`
              } 
  
  
              let header = section.columns[key]
  
              // Add New Headers to Each Column
              if (!header) {
                  for (let name in sections) {
                    const section = sections[name]
                    if (!section.columns[key]){
                      const header = document.createElement('th')
                      header.innerText = key
                      section.header.appendChild(header)
                      section.columns[key] = header
                    }
                  }
              }
  
  
              let col = state.info.columns[key]
              if (!col) {
                  col = state.info.columns[key] = document.createElement('td')
                  state.div.appendChild(col)
              }
  
              col.innerText = output
  
              state.info.output[key] = output
          })
  
  
          // Shift Buffers
          for (let key in state.averages){
              if (state.averages[key].length > 100) state.averages[key].shift()
          }
      }
  }
  
  // ------------------------------------------------------------------
  // ------------------------- Event Listeners ------------------------
  // ------------------------------------------------------------------
  
  const onShow = (panelWindow) => {
  
    const panel = chrome.runtime.connect({ name: "devtools-page" });
  
  
      // ------------------ On First Show ------------------
    if (!states.document) {
  
        // ------------------ Track the Document ------------------
      states.document = panelWindow.document
      states.error = states.document.getElementById('error')
      states.table = states.document.getElementById('states')
      // var a = chrome.runtime.getURL("css/devtools.css");
      // const link = states.document.createElement('link')
      // link.rel = 'stylesheet'
      // link.type = 'text/css'
      // link.href = a
      // states.document.head.appendChild(link)
      states.document.body.insertAdjacentElement('beforeend', states.table);
  
      panel.postMessage({ tabId: chrome.devtools.inspectedWindow.tabId, script: "js/devtools/background.js" }); // Only once...
    }
  
  
      // ----------- Connect to Background Page -----------
      panel.onMessage.addListener(function (message) {
  
          // Set States
          if (message.states) {
            for (let path in message.states) {
              const state = message.states[path]
              update(path, state.value, state.output)
            }
          }
  
          // Set Single State
          else if (message.state) update(message.state.path, message.state.info, message.state.update)
          else if (message.clear) {
            states.error.style.display = ''
            states.table.innerHTML = ''
            sections = {}
          } else if (message.name === 'echo') {
            panel.postMessage({ 
              ...message,
              tabId: chrome.devtools.inspectedWindow.tabId, 
              name: 'echo'
            });
          } else  {
            console.log('Unhandled Message', message)
          }
      });
  
  
      // ----------- Initialize in Background Registry -----------
      panel.postMessage({
        name: 'init',
        tabId: chrome.devtools.inspectedWindow.tabId
      });
  }
  
  const onHide = () => console.log('Closed!')
  
  
  
  // ------------------------------------------------------------------
  // ------------------------- Creation Event -------------------------
  // ------------------------------------------------------------------
  
  chrome.devtools.panels.create('ESCode', null, 'panels/panel.html', (panel) => {
    panel.onShown.addListener(onShow);
    panel.onHidden.addListener(onHide);
  });

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var content = __webpack_require__(14);

if (typeof content === 'string') {
  content = [[module.i, content, '']];
}

var options = {}

options.insert = "head";
options.singleton = false;

var update = __webpack_require__(1)(content, options);

if (content.locals) {
  module.exports = content.locals;
}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(false);
// Module
exports.push([module.i, "\ntable {\n    /* display: none; */\n    background: rgb(50,50,50);\n    color: white;\n    overflow: scroll;\n    width: 100%;\n    text-align: left;\n}\n\ntable td, table th {\n    padding: 5px;\n}\n\ntable .header-row > th {\n    padding: 10px;\n    font-size: 100%;\n}\n\ntable th {\n    font-size: 90%;\n}\n\ntable .header-row {\n    background: black;\n    color: white;\n    padding-top: 20px;\n}", ""]);


/***/ })
],[[12,0]]]);