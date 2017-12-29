import { ConnectionGateway } from "./common/ConnectionGateway";


chrome.devtools.panels.create("My Panel",
    "../resource/small-logo.png",
    "../html/devtool_index.html",
    function (panel) {
        // code invoked on panel creation
        // DevTools page -- devtools.js
        // Create a connection to the background page
    }
);
// chrome.devtools.inspectedWindow.eval(
//     "console.log(234234)",
//     function (result, isException) {
//         console.log("evalresult:", result)
//     }
// );

// chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
//     file: "./dist/content_script.js"
// }, () => {
//     const gateway = new ConnectionGateWay("devtool", chrome.runtime.connect({
//         name: `devtool:${chrome.devtools.inspectedWindow.tabId}`
//     }))

//     gateway.addListener(function (message) {
//         console.log("recieve", message)
//     });

//     console.log("@@@@@@@@@")
//     gateway.postMessage({
//         tabId: chrome.devtools.inspectedWindow.tabId
//     });
// });


