
// ------------------ Listen to Extension Components ------------------
console.log('%cESCode Extension: %cListening to extension components...', `font-weight: bold`, `font-weight: normal`)
  chrome.runtime.onConnect.addListener(function(devToolsConnection) {

      var devToolsListener = function(message, sender) {
      
        console.log('Got a message!', message, sender)
        console.log(`%cESCode Extension: %cGot a message: ${message}, ${sender}`, `font-weight: bold`, `font-weight: normal`)

          // ------------------ Script Injection ------------------
          if (message.script) {
              chrome.scripting.executeScript({ target: {tabId: message.tabId}, files: [message.script] })
              sender.postMessage({ message: 'Got the scripts!' });
          }
      }

      devToolsConnection.onMessage.addListener(devToolsListener);
      devToolsConnection.onDisconnect.addListener(() => devToolsConnection.onMessage.removeListener(devToolsListener));
  });



// // Storage
// // background.js
// chrome.runtime.onMessage.addListener(({ type, name }) => {
//   if (type === "set-name") {
//     chrome.storage.local.set({ name });
//   }
// });

// chrome.action.onClicked.addListener((tab) => {
//   chrome.storage.local.get(["name"], ({ name }) => {
//     chrome.tabs.sendMessage(tab.id, { name });
//   });
// });