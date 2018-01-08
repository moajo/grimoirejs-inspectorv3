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

    // console.log(`@@@[bg] up`)
    // for await (const connectionInit of connectionGenerator(gateway, CONNECTION_BG_TO_DEV.regex)) {
    //     console.log(`@@@[bg] connection come in `)
    //     connectionInit.init(async connection => {
    //         const tabId = Number(connection.name.match(CONNECTION_BG_TO_DEV.regex)![1]);
    //         const cs_gateway = csGatewayGenerator("bg:cs", tabId);
    //         const waiting_cs_connection = waitConnection(cs_gateway, CONNECTION_CS_TO_BG)
    //         // await csInjector(tabId, CONTENT_SCRIPT_PATH)
    //         const csConnectionInit = await waiting_cs_connection;
    //         await csConnectionInit.init(csConnection => {
    //             redirect(connection, csConnection, true);
    //         })
    //     });
    // }
}


// function connectionGenerator<T extends IConnection>(gateway: IGateway<T>, connectionName: string) {
//     return Observable.defer<T>(() => gateway.standbyConnection(connectionName)).repeat()
// }

// function csConnectionGenerator<T extends IConnection>(csGateway: IGateway<T>) {
//     return connectionGenerator(csGateway, CONNECTION_CS_TO_BG);
// }

// function devConnectionGenerator<T extends IConnection>(devGateway: IGateway<T>) {
//     return connectionGenerator(devGateway, CONNECTION_BG_TO_DEV);
// }


// export async function* connectionGenerator<T extends IConnection>(gateway: IGateway<T>, connectionName: RegExp) {
//     while (true) {
//         yield await waitConnection(gateway, connectionName);
//     }
// }

// export async function injectContentScript(tabId: number, path: string) {
//     return new Promise(resolve => {
//         chrome.tabs.executeScript(tabId, {
//             file: path
//         }, () => {
//             resolve()
//         });
//     });
// }
