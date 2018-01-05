import { WindowGateway } from "../common/Gateway";
import { connectionConnector } from "./Background";
import { CONTENT_SCRIPT_PATH, CONTENT_SCRIPT_TEST } from "../common/constants";

const dev_gateway = new WindowGateway("bg:dev");

connectionConnector(dev_gateway, (connectionName: string, tabId: number) => {
    return new WindowGateway(connectionName);
}, async (tabId, csScriptInjector) => {
    await injectContentScript(tabId, CONTENT_SCRIPT_TEST)
});


function injectContentScript(tabId: number, path: string) {
    return new Promise<void>(resolve => {
        const scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", path);
        document.body.appendChild(scriptTag);
        resolve()
    });
}