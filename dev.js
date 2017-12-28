
function hoge() {
  var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});
backgroundPageConnection.postMessage({path: "aaaaaaaaakllllllllll"});
}
