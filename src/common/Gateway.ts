import { Observable } from 'rxjs/Observable';
import { Subject } from "rxjs";
import { MergeScanSubscriber } from 'rxjs/operators/mergeScan';

type ConnectionPacket = {
    senderGatewayId: string,
    channel: string,
    payload: any
}

type ChannelMessage<T> = {
    channel: string,
    payload: T
}

function pack(senderGatewayId: string, channel: string, payload: any): ConnectionPacket {
    return { senderGatewayId, channel, payload }
}
function shouldRecieve(packet: ConnectionPacket, gatewayId: string, channel: string): boolean {
    return packet.senderGatewayId !== gatewayId && packet.channel === channel;
}


export interface IGateway<T extends IConnection> {
    id: string;
    standbyConnection(standbyId: string): Promise<T>;
    connect(standbyId: string): T
}

export interface IConnection {
    gatewayId: string;
    post(channel: string, message: any);
    listen(listener: (channel: string, message: any) => void);
    getChannel<T>(channel: string): Observable<T>;
    redirect(other: IConnection);
}

export class PortGateway implements IGateway<PortConnection> {
    constructor(
        public id: string
    ) { }

    standbyConnection(standbyId: string): Promise<PortConnection> {
        return new Promise(resolve => {
            const waiter = (port: chrome.runtime.Port) => {
                console.log("#@")
                if (port.name !== standbyId) {
                    console.log("reject")
                    port.disconnect();
                    return;
                }
                chrome.runtime.onConnect.removeListener(waiter);
                resolve(new PortConnection(this.id, port));
            }
            chrome.runtime.onConnect.addListener(waiter)
        });
    }
    connect(standbyId: string): PortConnection {
        const port = chrome.runtime.connect({
            name: standbyId
        });
        return new PortConnection(this.id, port);
    }

}
export class TabGateway extends PortGateway {
    constructor(
        id: string,
        public targetTabId: number
    ) {
        super(id)
    }
    connect(standbyId: string): PortConnection { // override
        const port = chrome.tabs.connect(this.targetTabId, {
            name: standbyId
        });
        return new PortConnection(this.id, port);
    }
}


export class WindowGateway implements IGateway<WindowConnection>{
    constructor(
        public id: string
    ) { }
    async standbyConnection(standbyId: string): Promise<WindowConnection> {
        return await new WindowConnection(this.id);
    }
    connect(standbyId: string): WindowConnection {
        return new WindowConnection(this.id);
    }

}

class PortConnection implements IConnection {
    constructor(
        public gatewayId: string,
        public port: chrome.runtime.Port
    ) { }

    post(channel: string, message: any) {
        const gatewayMessage = pack(this.gatewayId, channel, message)
        this.port.postMessage(gatewayMessage);
    }

    getChannel<T>(channel: string): Observable<T> {
        var subject = new Subject<T>();
        this.port.onMessage.addListener((packet: ConnectionPacket, port: chrome.runtime.Port) => {
            if (shouldRecieve(packet, this.gatewayId, channel)) {
                subject.next(packet.payload as T);
            }
        });
        return subject;
    }

    redirect(other: IConnection) {
        this.port.onMessage.addListener((packet: ConnectionPacket, port: chrome.runtime.Port) => {
            other.post(packet.channel, packet.payload);
        });
        other.listen((channel: string, message: any) => {
            this.post(channel, message);
        })
    }

    listen(listener: (channel: string, message: any) => void) {
        this.port.onMessage.addListener((packet: ConnectionPacket, port: chrome.runtime.Port) => {
            listener(packet.channel, packet.payload);
        });
    }
}

class WindowConnection implements IConnection {
    constructor(
        public gatewayId: string
    ) { }

    post(channel: string, message: any) {
        const gatewayMessage = pack(this.gatewayId, channel, message);//TODO コネクションを区別できるように。windowはportがないので。
        window.postMessage(gatewayMessage, "*");
    }

    getChannel<T>(channel: string): Observable<T> {
        var subject = new Subject<T>();
        window.addEventListener("message", (e) => {
            if (e.source != window)
                return;

            const packet = e.data;
            if (shouldRecieve(packet, this.gatewayId, channel)) {
                subject.next(packet.payload as T);
            }
        });
        return subject;
    }
    listen(listener: (channel: string, message: any) => void) {
        window.addEventListener("message", (e) => {
            if (e.source != window)
                return;

            const packet = e.data;
            listener(packet.channel, packet.payload);
        });
    }
    redirect(other: IConnection) {
        this.listen((channel: string, message: any) => {
            other.post(channel, message);
        })
        other.listen((channel: string, message: any) => {
            this.post(channel, message);
        })
    }
}