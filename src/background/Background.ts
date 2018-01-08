import { ReplaySubject } from 'rxjs/ReplaySubject';

import {
    CHANNEL_NOTIFY_TAB_ID,
    CHANNEL_TAB_CONNECTION_ESTABLISHED,
    CONNECTION_BG_TO_DEV,
    CONNECTION_CS_TO_BG,
} from '../common/constants';
import { IGateway } from '../common/Gateway';
import { IConnection, redirect } from '../common/Connection';

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
) {
    const tabConnectionSubject = new ReplaySubject<TabConnectionWaiting>();

    const csConnections = csGateway.waitingConnection(CONNECTION_CS_TO_BG)
        .do(cn => {
            cn.connection.toObservable().subscribe(a => {
                console.log(`[cs=>bg]`, a.channel, a.payload, a.senderGatewayId)
            });
        })
        .flatMap(cnp =>
            cnp.startWith(cn =>
                cn.open(CHANNEL_NOTIFY_TAB_ID).first().map(tabID =>
                    ({
                        tabID: tabID,
                        connection: cn,
                        type: "cs",
                    } as TabConnectionWaiting)
                )
            )
        )
        .subscribe(tabConnectionSubject);

    const devConnections = gateway.waitingConnection(CONNECTION_BG_TO_DEV).flatMap(cnp =>
        cnp.startWith(cn =>
            cn.open(CHANNEL_NOTIFY_TAB_ID).first().map(tabID =>
                ({
                    tabID: tabID,
                    connection: cn,
                    type: "cs",
                } as TabConnectionWaiting)
            )
        )
    ).subscribe(tabConnectionSubject);

    tabConnectionSubject.groupBy(a => a.tabID).subscribe(a => {
        a.bufferCount(2).first().subscribe(b => {
            redirect(b[0].connection, b[1].connection);
            b.forEach(cn => {
                cn.connection.post(CHANNEL_TAB_CONNECTION_ESTABLISHED, null);
            });
        });
    });
}