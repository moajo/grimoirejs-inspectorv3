import ConnectionManager from "../background/ConnectionManager";
import { PortGateway, IGateway, IConnection, TabGateway, redirect } from "../common/Gateway";
import { Observable } from "rxjs/Observable";
import { CONNECTION_BG_TO_DEV, CHANNEL_NOTIFY_PORT_ID, CONNECTION_CS_TO_BG, CHANNEL_CONNECTION_ESTABLISHED, REQUEST_NOTIFY_METAINFO, MetaInfo, CONTENT_SCRIPT_PATH } from "../common/constants";
import { connectAndWaitEstablished, waitConnectionEstablished } from "../common/Util";

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
        const tabId = Number(connection.name.match(CONNECTION_BG_TO_DEV.regex)[1]);
        const cs_gateway = csGatewayGenerator("bg:cs", tabId);
        const waiting_cs_connection = connectAndWaitEstablished(cs_gateway,CONNECTION_CS_TO_BG)
        // const waiting_cs_connection = cs_gateway.standbyConnection(CONNECTION_CS_TO_BG)
        await csInjector(tabId, CONTENT_SCRIPT_PATH)
        const cs_connection = await waiting_cs_connection;
        // const cs_connection = await cs_gateway.connect(CONNECTION_CS_TO_BG)
        // const establishWaiter = waitConnectionEstablished(cs_connection)
        

        // console.log("@**injectOK5")
        // await establishWaiter;
        console.log("@**cs-bg is connected")
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
