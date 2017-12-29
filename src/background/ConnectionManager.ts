// import IDevtoolMessage from "../common/messages/IDevtoolMessage";

type PortTuple = {
    devtoolPort: chrome.runtime.Port,
    contentScriptPort: chrome.runtime.Port
}

/**
 * Store connections between background script and devtool
 */
export default class ConnectionManager {
    private _establishedPorts: { [portName: string]: PortTuple } = {};

    public startWaitingConnection(){
        chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
            this._connect(port);
            port.onDisconnect.addListener(()=>{
                this._disconnect(port);
            });
        })
    }

    private _connect(port: chrome.runtime.Port) {// connect from devtool
        const tabId = Number(port.name.split(":")[1]);//TODO safety assertion
        if (Number.isNaN(tabId)) {
            return;
        }
        console.debug("connection established on tab:", tabId)

        let contentScriptPort = chrome.tabs.connect(tabId, {
            name: `content:${tabId}`
        });
        port.onMessage.addListener((message) => {
            contentScriptPort.postMessage(message);
        });
        contentScriptPort.onMessage.addListener((message) => {
            port.postMessage(message);
        })
        this._establishedPorts[port.name] = {
            devtoolPort: port,
            contentScriptPort: contentScriptPort
        }
    }

    private _disconnect(port: chrome.runtime.Port) {//TODO: port.onMessage.removeListener() is needed ?
        if (!this._establishedPorts[port.name]) {
            return
        }
        console.debug("disconnect port:", port.name)
        this._establishedPorts[port.name].contentScriptPort.disconnect()
        delete this._establishedPorts[port.name]
    }
}
