import { createView } from "./View";
import { connectToBackground } from "./Devtool";
import { CONTENT_SCRIPT_PATH } from "../common/constants";
import { PortGateway } from "../common/Gateway";

(async () => {
    createView();
    const gateway = new PortGateway("dev");
    await connectToBackground(gateway, chrome.devtools.inspectedWindow.tabId)
})()


