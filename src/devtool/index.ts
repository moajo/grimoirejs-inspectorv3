
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

