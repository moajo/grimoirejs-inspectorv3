import { ConnectionGateway } from "../common/ConnectionGateway";


// console.log("this aaaa")
// window.addEventListener("message", (e: any) => { // TODO インスペクタ閉じたらremove
//     console.log(e);
// });


chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
    console.debug("dev: connection established!")
    const gateway = new ConnectionGateway("content_script", port);
    gateway.addListener(function (m) {
        console.log(m)
        gateway.postMessage("replyhello?")

        const gr = (window as any).GrimoireJS

        if(gr){
            gateway.postMessage("grimoire is found!")

        }else{
            gateway.postMessage("grimoire is not found");
        }
    })
})