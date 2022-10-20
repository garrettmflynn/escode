(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ 2:
/***/ (function(module, exports) {

const ids = [
  'escode-devtools-injection'
]

let ports = {}

// Forward messages from injected scripts to the extension pages
window.addEventListener('message', function(event) {
  const message = event.data;

  if (event.source !== window) return;  // Only accept messages from the same frame
  if (typeof message !== 'object' || message === null || !ids.includes(message.source)) return; // Only accept messages that we know are ours

  let port = ports[message.source]
  if (!port) {
    port = ports[message.source] = chrome.runtime.connect({name: message.source});
    port.onMessage.addListener((message) => {
      window.postMessage({...message, source: 'escode-content-script-relay'}, '*')
    });
  }

  port.postMessage(message)

});

// Inject a script
var script = document.createElement('script'); 
script.src = chrome.runtime.getURL('injected.bundle.js');
script.type = "module";

const el = document.head||document.documentElement
el.appendChild(script);



/***/ })

},[[2,0]]]);