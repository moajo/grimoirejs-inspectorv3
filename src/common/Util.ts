import { IConnection, IGateway } from "./Gateway";
import { ReplaySubject } from "rxjs";
import { CHANNEL_CONNECTION_ESTABLISHED } from "./constants";
import { IChannelId } from "./Channel";


// export async function connect<T extends IConnection>(gateway: IGateway<T>, connectionName: string) {
//     return new ConnectionInitialState(await gateway.connect(connectionName));
// }

// export async function waitConnection<T extends IConnection>(gateway: IGateway<T>, connectionName: string | RegExp) {
//     const established = new ReplaySubject<string>(1);
//     const connection = await gateway.standbyConnection(connectionName, cn => {
//         cn.open(CHANNEL_CONNECTION_ESTABLISHED).first().subscribe(established);
//     });
//     await established.first().toPromise();
//     return new ConnectionInitialState(connection);
// }


// export function waitConnectionEstablished(connection: IConnection) {
//     return connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();
// }


// export class ConnectionInitialState<T extends IConnection> {
//     constructor(
//         private _connection: T,
//     ) { }
//     public async init(initializer?: (connection: T) => void) {
//         if(initializer){
//             await initializer(this._connection);
//         }
//         this._connection.post(CHANNEL_CONNECTION_ESTABLISHED, null);
//         return this._connection;
//     }
// }


export async function postAndWaitReply<T, U>(
    cn: IConnection,
    postChannel: IChannelId<T>,
    message: T,
    replyChannel: IChannelId<U>
) {
    const r = cn.open(replyChannel).first().toPromise();
    cn.post(postChannel, message);
    return await r;
}