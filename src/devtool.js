console.log("devtool_page is loaded!")
chrome.devtools.panels.create("My Panel",
    "../resource/small-logo.png",
    "../html/devtool_index.html",
    function (panel) {
        // code invoked on panel creation
        // DevTools page -- devtools.js
        // Create a connection to the background page
    }
);
chrome.devtools.inspectedWindow.eval(
    "console.log(234234)",
    function(result, isException) { }
  );

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
    // Handle responses from the background page, if any
    console.log("recieve")
});
backgroundPageConnection.postMessage({path: "aaaaaaaaakllllllllll"});
// Relay the tab ID to the background page
chrome.runtime.sendMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "content_script.js"
});
