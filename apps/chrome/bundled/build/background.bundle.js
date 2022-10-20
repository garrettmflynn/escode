console.error('TRYING...')

([]).push([[1],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _img_icon_128_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _img_icon_128_png__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_img_icon_128_png__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _img_icon_48_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _img_icon_48_png__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_img_icon_48_png__WEBPACK_IMPORTED_MODULE_1__);



// ---------------------------------------------------------------------
// ------------------------ Main Service Worker ------------------------
// ---------------------------------------------------------------------

console.warn('TRYING...')
const extensions = ["devtools-page"]

// --------------- Allow for running after update (broken...) ---------------
chrome.runtime.onInstalled.addListener(async (details) => {

  // Open Onboarding Page
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: 'onboarding.html'
    });
  }

  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({url: cs.matches})) {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: cs.js,
      });
    }
  }
});

// --------------- Assign Connections ---------------
var connections = {};
var ports = {};


const sendTo = (id, message) => {

  for (let name in ports[id]) {
    const msg = { ...message }
    delete msg.tabId

    const port = ports[id][name]
    port.postMessage(msg)
  }
}



var extensionListener = function (port, message, sender) {

  // ------------------ Initialize Connection ------------------
  if (message.name == "init") {
    connections[message.tabId] = port;
    sendTo(message.tabId, message)
    return;
  } 

  // ------------------ Script Injection ------------------
  else if (message.script) {
        chrome.scripting.executeScript({ target: {tabId: message.tabId}, files: [message.script] })
        sender.postMessage({ message: `${message.script} has been added as a content script!` });
  } 
    
  // Forward to Connected Scripts
  else {
    sendTo(message.tabId, message)
  }
}

chrome.runtime.onConnect.addListener(function (port) {

    if (extensions.includes(port.name)) {

      // Listen to messages sent from the DevTools page
      const liveListener = (...args) => extensionListener(port, ...args)
      port.onMessage.addListener(liveListener);

      port.onDisconnect.addListener(function(port) {
          port.onMessage.removeListener(liveListener);
          var tabs = Object.keys(connections);
          for (var i=0, len=tabs.length; i < len; i++) {
            if (connections[tabs[i]] == port) {
              delete connections[tabs[i]]
              break;
            }
          }
      });

    } else {

        let tabs = []
        port.onDisconnect.addListener(function(port) {
          tabs.forEach(id => delete ports[id][port.name])
        })

        port.onMessage.addListener((message, port) => {

          const sender = port.sender

        // Messages from content scripts should have sender.tab set
        if (sender.tab) {
          var tabId = sender.tab.id;

          tabs.push(tabId)

          // Register sender
          if (!ports[tabId]) ports[tabId] = {}
          if (!ports[tabId][sender.id]) ports[tabId][sender.id] = port

          // Post to connections
          if (tabId in connections) connections[tabId].postMessage(message);
          else console.log("Tab not found in connection list.");
        } else {
          console.log("sender.tab not defined.");
        }
        return true;
      })
    }
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icon-128.png";

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icon-48.png";

/***/ })
],[[3,0]]]);