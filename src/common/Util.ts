import { IConnection, IGateway } from "./Gateway";
import { ReplaySubject } from "rxjs";
import { CHANNEL_CONNECTION_ESTABLISHED } from "./constants";

export async function connectAndWaitEstablished<T extends IConnection>(gateway: IGateway<T>, connectionName: string | RegExp) {
    const established = new ReplaySubject<string>(1);
    const connection = await gateway.standbyConnection(connectionName, cn => {
        cn.open(CHANNEL_CONNECTION_ESTABLISHED).subscribe(established);
    });
    await established;
    return connection;
}


export function waitConnectionEstablished(connection:IConnection){
    return connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();
}