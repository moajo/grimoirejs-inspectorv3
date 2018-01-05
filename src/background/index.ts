import { CONTENT_SCRIPT_PATH } from '../common/constants';
import { PortGateway, TabGateway } from '../common/Gateway';
import { connectionConnector, injectContentScript } from './Background';


const dev_gateway = new PortGateway("bg:dev");

connectionConnector(dev_gateway, (connectionName: string, tabId: number) => {
    return new TabGateway(connectionName, tabId);
}, async (tabId, csScriptInjector) => {
    await injectContentScript(tabId, CONTENT_SCRIPT_PATH)
});