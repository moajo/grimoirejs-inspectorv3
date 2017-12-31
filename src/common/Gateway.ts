import { Observable } from 'rxjs/Observable';
import { Subject } from "rxjs";
import { MergeScanSubscriber } from 'rxjs/operators/mergeScan';
import { IChannelId } from './Channel';
import { ISubscription } from 'rxjs/Subscription';
import { CHANNEL_CONNECTION_ESTABLISHED } from './constants';

type ConnectionPacket<T=any> = {
    senderGatewayId: string,
    channel: string,
    payload: T
}

function pack<T>(senderGatewayId: string, channel: IChannelId<T>, payload: T, replay = false): ConnectionPacket<T> {
    return {
        senderGatewayId,
        channel,
        payload
    }
}

export interface IGateway<T extends IConnection> {
    id: string;
    standbyConnection(connectionName: RegExp | string, connectionInit?: (connection: T) => void): Promise<T>;
    connect(connectionName: string): T
}

export interface IConnection {
    gatewayId: string;
    name: string;
    post<T>(channel: IChannelId<T>, message: T);
    open<T>(channel: IChannelId<T>): Observable<T>;
    listen(): Observable<ConnectionPacket>;
}

export class PortGateway implements IGateway<PortConnection> {
    constructor(
        public id: string
    ) { }

    standbyConnection(connectionName: RegExp | string, connectionInit?: (connection: PortConnection) => void): Promise<PortConnection> {
        const connectionRegExp = typeof connectionName === "string" ? new RegExp(connectionName) : connectionName;
        return new Promise(resolve => {
            const waiter = (port: chrome.runtime.Port) => {
                if (!connectionRegExp.test(port.name)) {
                    return;
                }
                chrome.runtime.onConnect.removeListener(waiter);
                const cn = new PortConnection(port.name, this.id, port);
                if (connectionInit) {
                    connectionInit(cn);
                }
                resolve(cn);
            }
            chrome.runtime.onConnect.addListener(waiter)
        });
    }
    connect(connectionName: string): PortConnection {
        const port = chrome.runtime.connect({
            name: connectionName
        });
        return new PortConnection(connectionName, this.id, port);
    }

}
export class TabGateway extends PortGateway {
    constructor(
        id: string,
        public targetTabId: number
    ) {
        super(id)
    }
    connect(connectionName: string): PortConnection { // override
        const port = chrome.tabs.connect(this.targetTabId, {
            name: connectionName
        });
        return new PortConnection(connectionName, this.id, port);
    }
}


export class WindowGateway implements IGateway<WindowConnection>{
    constructor(
        public id: string
    ) { }
    standbyConnection(connectionName: RegExp | string, connectionInit?: (connection: WindowConnection) => void): Promise<WindowConnection> {
        const connectionRegExp = typeof connectionName === "string" ? new RegExp(connectionName) : connectionName;
        return new Promise(resolve => {
            const waiter = (e) => {
                if (e.source != window) {
                    return;
                }
                const req = e.data;
                if (req.type === "windowgatewayconnectrequest" && req.connectionName && connectionRegExp.test(req.connectionName)) {
                    window.removeEventListener("message", waiter);
                    const cn = new WindowConnection(req.connectionName, this.id);
                    if (connectionInit) {
                        connectionInit(cn);
                    }
                    resolve(cn);
                }
            }
            window.addEventListener("message", waiter);
        })
    }
    connect(connectionName: string): WindowConnection {
        window.postMessage({
            type: "windowgatewayconnectrequest",
            connectionName: connectionName
        }, "*");
        return new WindowConnection(connectionName, this.id);
    }

}

class PortConnection implements IConnection {
    private _subject: Subject<ConnectionPacket>;

    constructor(
        public name: string,
        public gatewayId: string,
        public port: chrome.runtime.Port
    ) {
        this._subject = new Subject<ConnectionPacket>();

        const onMessageListener = (packet: ConnectionPacket, port: chrome.runtime.Port) => {
            if (packet.senderGatewayId !== this.gatewayId) {
                this._subject.next(packet);
            }
        }
        this.port.onMessage.addListener(onMessageListener);

        const onDisconnectListener = (port: chrome.runtime.Port) => {
            this.port.onDisconnect.removeListener(onDisconnectListener);
            this.port.onMessage.removeListener(onMessageListener);
            this._subject.complete()
        }
        this.port.onDisconnect.addListener(onDisconnectListener)
    }

    post<T>(channel: IChannelId<T>, message: T) {
        const gatewayMessage = pack(this.gatewayId, channel, message)
        this.port.postMessage(gatewayMessage);
    }
    open<T>(channel: IChannelId<T>): Observable<T> {
        return this.listen()
            .filter(packet => packet.channel == channel)
            .map(packet => packet.payload);
    }
    listen(): Observable<ConnectionPacket> {
        return this._subject;
    }
}

class WindowConnection implements IConnection {
    private _subject: Subject<ConnectionPacket>;

    constructor(
        public name: string,
        public gatewayId: string
    ) {
        this._subject = new Subject<ConnectionPacket>();
        window.addEventListener("message", (e) => {
            if (e.source != window)
                return;

            const packet = e.data as ConnectionPacket;
            if (packet.senderGatewayId !== this.gatewayId) {
                this._subject.next(packet);
            }
        });
    }

    post<T>(channel: IChannelId<T>, message: T) {
        const gatewayMessage = pack(this.gatewayId, channel, message);//TODO コネクションを区別できるように。windowはportがないので。
        window.postMessage(gatewayMessage, "*");
    }
    open<T>(channel: IChannelId<T>): Observable<T> {
        return this.listen()
            .filter(packet => packet.channel == channel)
            .map(packet => packet.payload);
    }
    listen(): Observable<ConnectionPacket> {
        return this._subject;
    }
}

export function redirect(connection: IConnection, other: IConnection): ISubscription {
    const s1 = connection.listen().subscribe(packet => {
        console.log("=>",packet.channel, packet.payload)
        other.post(packet.channel, packet.payload);
    });
    const s2 = other.listen().subscribe(packet => {
        console.log("<=",packet.channel, packet.payload)
        connection.post(packet.channel, packet.payload);
    })
    return {
        closed: false,
        unsubscribe: () => {
            s1.unsubscribe();
            s2.unsubscribe();
            this.closed = true;
        }
    }
}