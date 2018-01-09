import { IChannelId, Channel } from "./Channel";
import { Observable } from "rxjs/Observable";
import { ConnectionPacket } from "./Gateway";
import { DISCONNECT_SIGNAL } from "./Constants";
import { ISubscription, AnonymousSubscription } from "rxjs/Subscription";
import { Subject, ReplaySubject } from "rxjs";
import { PartialObserver, NextObserver } from "rxjs/Observer";
import { AnonymousSubject } from "rxjs/Subject";
import { Subscribable } from "rxjs/Observable";

function pack<T>(senderGatewayId: string, channel: IChannelId<T>, payload: T, replay = false): ConnectionPacket<T> {
    return {
        senderGatewayId,
        channel,
        payload,
    }
}

export interface IConnection extends NextObserver<ConnectionPacket>, Subscribable<ConnectionPacket> {
    gatewayId: string;
    name: string;
    post<T>(channel: IChannelId<T>, message: T): void;
    open<T>(channel: IChannelId<T>): Channel<T>;
    start(): void;
    disconnect(): void;
    toObservable(): Observable<ConnectionPacket>;
}

abstract class ConnectionBase implements IConnection {
    constructor(
        public name: string,
        public gatewayId: string,
    ) { }

    abstract post<T>(channel: IChannelId<T>, message: T): void;

    open<T>(channel: IChannelId<T>): Channel<T> {
        return new Channel(this,channel);
    }
    abstract start(): void;

    abstract disconnect(): void;
    abstract toObservable(): Observable<ConnectionPacket>;
    next(value: ConnectionPacket<any>): void {
        this.post(value.channel, value.payload);
    }
    subscribe(observerOrNext?: PartialObserver<ConnectionPacket<any>> | ((value: ConnectionPacket<any>) => void) | undefined, error?: ((error: any) => void) | undefined, complete?: (() => void) | undefined): AnonymousSubscription {
        if (typeof observerOrNext === "function") {
            return this.toObservable().subscribe(observerOrNext, error, complete);
        } else {
            return this.toObservable().subscribe(observerOrNext);
        }
    }
}

export class PortConnection extends ConnectionBase {
    private _subject: Subject<ConnectionPacket>;
    private _bufferSubject: ReplaySubject<ConnectionPacket>;

    constructor(
        name: string,
        gatewayId: string,
        public port: chrome.runtime.Port,
    ) {
        super(name, gatewayId)
        this._bufferSubject = new ReplaySubject<ConnectionPacket>();
        this._subject = new Subject<ConnectionPacket>();

        const onMessageListener = (packet: ConnectionPacket, port: chrome.runtime.Port) => {
            if (packet.senderGatewayId !== this.gatewayId) {
                this._bufferSubject.next(packet);
            }
        }
        this.port.onMessage.addListener(onMessageListener as any);

        const onDisconnectListener = (port: chrome.runtime.Port) => {
            this.port.onDisconnect.removeListener(onDisconnectListener);
            this.port.onMessage.removeListener(onMessageListener as any);
            this._bufferSubject.complete()
        }
        this.port.onDisconnect.addListener(onDisconnectListener)
    }

    post<T>(channel: IChannelId<T>, message: T) {
        const gatewayMessage = pack(this.gatewayId, channel, message)
        this.port.postMessage(gatewayMessage);
    }
    start() {
        this._bufferSubject.subscribe(this._subject);
    }
    disconnect() {
        this.port.disconnect();
        this._bufferSubject.complete();
    }
    toObservable() {
        return this._subject;
    }
}

export class WindowConnection extends ConnectionBase {
    private _subject: Subject<ConnectionPacket>;

    constructor(
        name: string,
        gatewayId: string,
        public port: MessagePort,
    ) {
        super(name, gatewayId)
        this._subject = new Subject<ConnectionPacket>();
        port.addEventListener("message", e => {
            const packet = e.data as ConnectionPacket;
            if (packet.senderGatewayId !== this.gatewayId) {
                this._subject.next(packet);
            }
        });
        port.addEventListener("message", e => {
            if (e.data.type && e.data.type === DISCONNECT_SIGNAL) {
                port.close();
                this._subject.complete();
            }
        });
    }

    post<T>(channel: IChannelId<T>, message: T) {
        const gatewayMessage = pack(this.gatewayId, channel, message);
        this.port.postMessage(gatewayMessage);
    }
    start() {
        this.port.start();
    }
    disconnect() {
        this.port.postMessage({
            type: DISCONNECT_SIGNAL,
        })
        this.port.close();
        this._subject.complete();
    }
    toObservable(): Observable<ConnectionPacket<any>> {
        return this._subject;
    }
}

export function redirect(connection: IConnection, other: IConnection, debug = false): ISubscription {
    const s1 = connection.toObservable()
        .do(packet => {
            if (debug) {
                console.log("=>", packet.channel, packet.payload)
            }
        })
        .subscribe(other);

    const s2 = other.toObservable()
        .do(packet => {
            if (debug) {
                console.log("=>", packet.channel, packet.payload)
            }
        })
        .subscribe(connection);

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