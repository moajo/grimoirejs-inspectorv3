import { createView } from "./View";
import { connectToBackground } from "./Communicator";
import { CONTENT_SCRIPT_PATH } from "../common/constants";
import { PortGateway } from "../common/Gateway";

(async () => {
    createView();
    // await injectContentScript(CONTENT_SCRIPT_PATH);
    const gateway = new PortGateway("dev");
    await connectToBackground(gateway, chrome.devtools.inspectedWindow.tabId)
})()


