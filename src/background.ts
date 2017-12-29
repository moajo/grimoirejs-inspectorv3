import ConnectionManager from "./background/ConnectionManager";

const connectionManager = new ConnectionManager();

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
    connectionManager.connect(port);
    port.onDisconnect.addListener(()=>{
        connectionManager.disconnect(port);
    });
})