import { PortGateway } from '../common/Gateway';
import { connectionConnector } from './Background';

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg === "tabid") {
        sendResponse(sender.tab!.id);
    }
});

const dev_gateway = new PortGateway("bg:dev");
const cs_gateway = new PortGateway("bg:cs");

connectionConnector(dev_gateway, cs_gateway);