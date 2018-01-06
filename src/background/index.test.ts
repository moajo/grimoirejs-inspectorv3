import { WindowGateway } from "../common/Gateway";
import { connectionConnector } from "./Background";
import { CONTENT_SCRIPT_PATH, CONTENT_SCRIPT_TEST } from "../common/constants";

const dev_gateway = new WindowGateway("bg:dev");
const cs_gateway = new WindowGateway("bg:cs");

connectionConnector(dev_gateway, cs_gateway);


// function injectContentScript(tabId: number, path: string) {
//     return new Promise<void>(resolve => {
//         const scriptTag = document.createElement("script");
//         scriptTag.setAttribute("type", "text/javascript");
//         scriptTag.setAttribute("src", path);
//         document.body.appendChild(scriptTag);
//         resolve()
//     });
// }