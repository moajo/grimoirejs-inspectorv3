import { PortGateway, IGateway, IConnection, TabGateway, redirect } from "../common/Gateway";
import { Observable } from "rxjs/Observable";
import { CONNECTION_BG_TO_DEV, CHANNEL_NOTIFY_PORT_ID, CONNECTION_CS_TO_BG, CHANNEL_CONNECTION_ESTABLISHED, REQUEST_NOTIFY_METAINFO, MetaInfo, CONTENT_SCRIPT_PATH } from "../common/constants";
import { connectAndWaitEstablished, waitConnectionEstablished } from "../common/Util";
import { connectionConnector, injectContentScript } from "./Background";


const dev_gateway = new PortGateway("bg:dev");

connectionConnector(dev_gateway, (connectionName: string, tabId: number) => {
    return new TabGateway(connectionName, tabId);
}, async (tabId, csScriptInjector) => {
    await injectContentScript(tabId, CONTENT_SCRIPT_PATH)
});