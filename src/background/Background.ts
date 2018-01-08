import {
    CHANNEL_CONNECTION_ESTABLISHED,
    CONNECTION_BG_TO_DEV,
    CONNECTION_CS_TO_BG,
    CONTENT_SCRIPT_PATH,
    CHANNEL_NOTIFY_TAB_ID,
    CHANNEL_TAB_CONNECTION_ESTABLISHED,
} from '../common/constants';
import { IConnection, IGateway, redirect } from '../common/Gateway';
// import { waitConnection, ConnectionInitialState } from '../common/Util';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import WaitingEstablishedGateway from '../common/WrapperGateway';

// type csGateWayGenerator<T extends IConnection> = (connectionName: string, tabId: number) => IGateway<T>;

type TabConnectionWaiting = {
    tabID: number,
    connection: IConnection,
    type: "dev" | "cs",
}

export async function connectionConnector<
    T extends IConnection,
    U extends IConnection
    >(
    gateway: IGateway<T>,
    csGateway: IGateway<U>,
    // csInjector: (tabId: number, csScriptPath: string) => Promise<void>
) {
    console.log(`@@@[bg] start`)
    const tabConnectionSubject = new ReplaySubject<TabConnectionWaiting>();
    gateway = new WaitingEstablishedGateway(gateway,cn=>{
        cn.open(CHANNEL_NOTIFY_TAB_ID).map(tabID => {
            return {
                tabID: tabID,
                connection: cn,
                type: "dev",
            } as TabConnectionWaiting
        }).subscribe(tabConnectionSubject);
    })
    csGateway = new WaitingEstablishedGateway(csGateway,cn=>{
        cn.listen().subscribe(a => {
            console.log(`[cs=>bg]`, a.channel, a.payload,a.senderGatewayId)
          })
        cn.open(CHANNEL_NOTIFY_TAB_ID).map(tabID => {
            return {
                tabID: tabID,
                connection: cn,
                type: "cs",
            } as TabConnectionWaiting
        }).subscribe(tabConnectionSubject);
    })

    const csConnections = csGateway.standbyConnection(CONNECTION_CS_TO_BG).subscribe();
    const devConnections = gateway.standbyConnection(CONNECTION_BG_TO_DEV).subscribe();

    tabConnectionSubject.groupBy(a => a.tabID).subscribe(a => {
        a.bufferCount(2).subscribe(b => {
            redirect(b[0].connection, b[1].connection);
            b.forEach(cn => {
                cn.connection.post(CHANNEL_TAB_CONNECTION_ESTABLISHED, null);
            });
        });
    });
}