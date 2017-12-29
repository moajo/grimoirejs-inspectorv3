
// console.log("this aaaa")
// window.addEventListener("message", (e: any) => { // TODO インスペクタ閉じたらremove
//     console.log(e);
// });

var _port;
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
    _port = port;
    port.onMessage.addListener(function(m){
        //do domething
        console.log(m)
    })
})