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

    public connect(port: chrome.runtime.Port) {// connect from devtool
        const tabId = Number(port.name.split(":")[1]);//TODO safety assertion
        if (Number.isNaN(tabId)) {
            return;
        }
        console.debug("connection established on tab:", tabId)

        let contentScriptPort = chrome.tabs.connect(tabId, {
            name: `content:${tabId}`
        });
        port.onMessage.addListener((message, port) => {
            contentScriptPort.postMessage(message);
        });
        contentScriptPort.onMessage.addListener((message, port) => {
            port.postMessage(message);
        })
        this._establishedPorts[port.name] = {
            devtoolPort: port,
            contentScriptPort: contentScriptPort
        }
    }

    public disconnect(port: chrome.runtime.Port) {//TODO: port.onMessage.removeListener() is needed ?
        if (!this._establishedPorts[port.name]) {
            return
        }
        console.debug("disconnect port:", port.name)
        this._establishedPorts[port.name].contentScriptPort.disconnect()
        delete this._establishedPorts[port.name]
    }
}
