chrome.runtime.onConnect.addListener(function(devToolsConnection) {
    console.log("connect!a!")
    // assign the listener function to a variable so we can remove it later
    var devToolsListener = function(message, sender, sendResponse) {
        console.log("reccccc")
        // Inject a content script into the identified tab
        // chrome.tabs.executeScript(message.tabId,
        //     { file: message.scriptToInject });
        chrome.tabs.executeScript({
            code: 'document.body.style.backgroundColor="red"'
          });
    }
    // add the listener
    devToolsConnection.onMessage.addListener(devToolsListener);

    devToolsConnection.onDisconnect.addListener(function() {
         devToolsConnection.onMessage.removeListener(devToolsListener);
    });
})