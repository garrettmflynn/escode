const initialisePanel = () => {

    // Create a connection to the background page

    console.log('Trying to connect to background page...')
    var backgroundPageConnection = chrome.runtime.connect({
      name: "devtools-page"
    });

    console.log('Adding listener to background page...')
    backgroundPageConnection.onMessage.addListener(function (message) {
      // Handle responses from the background page, if any
      console.log('[ESCode Extension]: Got a message back from the background!', message)
    });
  
    // Relay the tab ID to the background page
    console.log('Posting message to background page...')
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      script: "devtools/background.js"
    });

}

const unInitialisePanel = () => console.log('Closed!')

const panel = chrome.devtools.panels.create('ESCode', null, 'devtools/panels/panel.html', (newPanel) => {
  newPanel.onShown.addListener(initialisePanel);
  newPanel.onHidden.addListener(unInitialisePanel);
});