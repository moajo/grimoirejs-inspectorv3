import {
    CHANNEL_CONNECTION_ESTABLISHED,
    CONNECTION_BG_TO_DEV,
    CONNECTION_CS_TO_BG,
    CONTENT_SCRIPT_PATH,
} from '../common/constants';
import { IConnection, IGateway, redirect } from '../common/Gateway';
import { connectAndWaitEstablished } from '../common/Util';

type csGateWayGenerator<T extends IConnection> = (connectionName: string, tabId: number) => IGateway<T>;

export async function connectionConnector<
    T extends IConnection,
    U extends IConnection
    >(
    gateway: IGateway<T>,
    csGatewayGenerator: csGateWayGenerator<U>,
    csInjector: (tabId: number, csScriptPath: string) => Promise<void>
    ) {
    for await (const connection of connectionGenerator(gateway, CONNECTION_BG_TO_DEV.regex)) {
        const tabId = Number(connection.name.match(CONNECTION_BG_TO_DEV.regex)![1]);
        const cs_gateway = csGatewayGenerator("bg:cs", tabId);
        const waiting_cs_connection = connectAndWaitEstablished(cs_gateway, CONNECTION_CS_TO_BG)
        await csInjector(tabId, CONTENT_SCRIPT_PATH)
        const cs_connection = await waiting_cs_connection;
        redirect(connection, cs_connection)
        cs_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "bg: ok?");
        connection.post(CHANNEL_CONNECTION_ESTABLISHED, "bg: ok");
    }
}

export async function* connectionGenerator<T extends IConnection>(gateway: IGateway<T>, connectionName: RegExp) {
    while (true) {
        yield await connectAndWaitEstablished(gateway, connectionName);
    }
}

export async function injectContentScript(tabId: number, path: string) {
    return new Promise(resolve => {
        chrome.tabs.executeScript(tabId, {
            file: path
        }, () => {
            resolve()
        });
    });
}
