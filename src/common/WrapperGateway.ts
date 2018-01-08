import { IGateway, IConnection } from "./Gateway";
import { ReplaySubject } from "rxjs";
import { CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_TAB_ID } from "./constants";
import { Observable } from "rxjs/Observable";

export default class WaitingEstablishedGateway<T extends IConnection> implements IGateway<T>{
    constructor(
        public gateway: IGateway<T>,
        public connectionInitializer?: (cn: T) => void,
    ) { 
        if(gateway instanceof WaitingEstablishedGateway){
            throw new Error("hoge")
        }
    }

    public get id(): string {
        return this.gateway.id;
    }
    standbyConnection(connectionName: string | RegExp, connectionInit?: ((connection: T) => void) | undefined): Observable<T> {
        const established = new ReplaySubject<T>(1);
        const connections = this.gateway.standbyConnection(connectionName).subscribe(cn=>{
            cn.open(CHANNEL_CONNECTION_ESTABLISHED).first().subscribe(async a => {
                if(this.connectionInitializer){
                    await this.connectionInitializer(cn);
                }
                cn.post(CHANNEL_CONNECTION_ESTABLISHED, null);
                established.next(cn)
            });
        });
        return established;
    }
    async connect(connectionName: string): Promise<T> {
        const connection = await this.gateway.connect(connectionName);
        if(this.connectionInitializer){
            await this.connectionInitializer(connection);
        }
        const waiter = connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();
        connection.post(CHANNEL_CONNECTION_ESTABLISHED, null);
        await waiter;
        return connection;
    }
}