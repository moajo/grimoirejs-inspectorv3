import { Observable } from 'rxjs/Observable';
import { Subject } from "rxjs";
import { MergeScanSubscriber } from 'rxjs/operators/mergeScan';
import { IChannelId } from './Channel';
import { ISubscription } from 'rxjs/Subscription';
import { CHANNEL_CONNECTION_ESTABLISHED, MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST, MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE } from './constants';

type ConnectionPacket<T=any> = {
    senderGatewayId: string,
    channel: string,
    payload: T
}

type BroadcastPacket<T=any> = {
    connectionName: string,
    connectionPacket: ConnectionPacket<T>
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
    connect(connectionName: string): Promise<T>;
}

export interface IConnection {
    gatewayId: string;
    name: string;
    post<T>(channel: IChannelId<T>, message: T): void;
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
    async connect(connectionName: string): Promise<PortConnection> {
        const port = chrome.runtime.connect({
            name: connectionName
        });
        return await new PortConnection(connectionName, this.id, port);
    }

}
export class TabGateway extends PortGateway {
    constructor(
        id: string,
        public targetTabId: number
    ) {
        super(id)
    }
    async connect(connectionName: string): Promise<PortConnection> { // override
        const port = chrome.tabs.connect(this.targetTabId, {
            name: connectionName
        });
        return await new PortConnection(connectionName, this.id, port);
    }
}


export class WindowGateway implements IGateway<WindowConnection>{
    constructor(
        public id: string
    ) { }
    standbyConnection(connectionName: RegExp | string, connectionInit?: (connection: WindowConnection) => void): Promise<WindowConnection> {
        const connectionRegExp = typeof connectionName === "string" ? new RegExp(connectionName) : connectionName;
        return new Promise(resolve => {
            const listener = (e: MessageEvent) => {
                if (e.source != window) {
                    return;
                }
                const req = e.data;
                if (!req.type || !req.connectionName || !req.gatewayId) {
                    return;
                }
                if (req.type === MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST && connectionRegExp.test(req.connectionName)) {
                    window.removeEventListener("message", listener);
                    const cn = new WindowConnection(req.connectionName, this.id, req.gatewayId);
                    if (connectionInit) {
                        connectionInit(cn);
                    }
                    window.postMessage({
                        type: MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE,
                        connectionName: req.connectionName,
                        gatewayId: this.id,
                        replyTo: req.gatewayId
                    }, "*");
                    resolve(cn);
                }
            }
            window.addEventListener("message", listener);
        })
    }
    async connect(connectionName: string): Promise<WindowConnection> {
        const connectionWaiter = new Promise<WindowConnection>(resolve => {
            const listener = (e: MessageEvent) => {
                if (e.source != window) {
                    return;
                }
                const req = e.data;
                if (!req.type || !req.connectionName || !req.gatewayId || !req.replyTo) {
                    return;
                }
                if (
                    req.type === MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE &&
                    req.connectionName === connectionName &&
                    req.replyTo === this.id
                ) {
                    window.removeEventListener("message", listener);
                    const cn = new WindowConnection(connectionName, this.id, req.gatewayId);
                    resolve(cn);
                }
            }
            window.addEventListener("message", listener);
        });
        window.postMessage({
            type: MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST,
            connectionName: connectionName,
            gatewayId: this.id
        }, "*");

        return await connectionWaiter;
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
        this.port.onMessage.addListener(onMessageListener as any);

        const onDisconnectListener = (port: chrome.runtime.Port) => {
            this.port.onDisconnect.removeListener(onDisconnectListener);
            this.port.onMessage.removeListener(onMessageListener as any);
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
        public gatewayId: string,
        public connectedGatewayId: string
    ) {
        this._subject = new Subject<ConnectionPacket>();
        window.addEventListener("message", (e) => {
            if (e.source != window) {
                return;
            }

            const packet = e.data as BroadcastPacket;
            if (
                !packet.connectionName ||
                !packet.connectionPacket
            ) {
                return;
            }
            if (packet.connectionName !== this.name) {
                return;
            }
            const c_packet = packet.connectionPacket
            if (c_packet.senderGatewayId !== this.gatewayId) {
                // console.log("WCN:", this.gatewayId, this.name, packet)
                this._subject.next(c_packet);
            }
        });
    }

    post<T>(channel: IChannelId<T>, message: T) {
        const gatewayMessage = pack(this.gatewayId, channel, message);
        const broadcastPacket: BroadcastPacket<T> = {
            connectionName: this.name,
            connectionPacket: gatewayMessage
        }
        window.postMessage(broadcastPacket, "*");
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
        console.log("=>", packet.channel, packet.payload)
        other.post(packet.channel, packet.payload);
    });
    const s2 = other.listen().subscribe(packet => {
        console.log("<=", packet.channel, packet.payload)
        connection.post(packet.channel, packet.payload);
    })
    const handler = {
        closed: false,
        unsubscribe: () => {
            s1.unsubscribe();
            s2.unsubscribe();
            handler.closed = true;
        }
    }
    return handler;
}