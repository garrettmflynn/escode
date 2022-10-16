const scriptToAttach = "document.body.innerHTML = 'Hi from the devtools';";

console.log('???')
window.addEventListener("click", () => {
  browser.runtime.sendMessage({
    tabId: browser.devtools.inspectedWindow.tabId,
    script: scriptToAttach
  });
});