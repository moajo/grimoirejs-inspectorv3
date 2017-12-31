import ConnectionManager from "../background/ConnectionManager";
import { PortGateway, IGateway, IConnection, TabGateway, redirect } from "../common/Gateway";
import { Observable } from "rxjs/Observable";
import { CONNECTION_BG_TO_DEV, CHANNEL_NOTIFY_PORT_ID, CONNECTION_CS_TO_BG, CHANNEL_CONNECTION_ESTABLISHED } from "../common/constants";
import { connectAndWaitEstablished, waitConnectionEstablished } from "../common/Util";

const dev_gateway = new PortGateway("bg:dev");

connectionConnector(dev_gateway);

async function connectionConnector(gateway: PortGateway) {
    for await (const connection of connectionGenerator(gateway, CONNECTION_BG_TO_DEV.regex)) {
        const tabId = Number(connection.name.match(CONNECTION_BG_TO_DEV.regex)[1]);
        const cs_gateway = new TabGateway("bg:cs", tabId);
        const cs_connection = cs_gateway.connect(CONNECTION_CS_TO_BG)
        const establishWaiter = waitConnectionEstablished(cs_connection)

        cs_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "bg: ok?");
        await establishWaiter;
        redirect(connection, cs_connection)
        connection.post(CHANNEL_CONNECTION_ESTABLISHED, "bg: ok");
    }
}

async function* connectionGenerator<T extends IConnection>(gateway: IGateway<T>, connectionName: RegExp) {
    while (true) {
        yield await connectAndWaitEstablished(gateway, connectionName);
    }
}
