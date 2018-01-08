import { SubscribeOnObservable } from 'rxjs/observable/SubscribeOnObservable';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { ISubscription, AnonymousSubscription } from 'rxjs/Subscription';

import { IChannelId } from './Channel';
import { MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST, MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE, DISCONNECT_SIGNAL } from './constants';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { NextObserver, ErrorObserver, CompletionObserver, PartialObserver } from 'rxjs/Observer';
import { Subscribable } from 'rxjs/Observable';
import { IConnection, PortConnection, WindowConnection } from './Connection';

export type ConnectionPacket<T=any> = {
    senderGatewayId: string,
    channel: string,
    payload: T
}



export class ConnectionPreparation<T extends IConnection>{
    constructor(
        public connection: T,
    ) { }

    startWith<O>(fn: (cn: T) => O): O {
        const a = fn(this.connection);
        this.connection.start();
        return a;
    }
}

export interface IGateway<T extends IConnection> {
    id: string;
    waitingConnection(connectionName: RegExp | string): Observable<ConnectionPreparation<T>>;
    connect(connectionName: string): Promise<ConnectionPreparation<T>>;
}



export class PortGateway implements IGateway<PortConnection> {
    constructor(
        public id: string
    ) { }

    waitingConnection(connectionName: RegExp | string): Observable<ConnectionPreparation<PortConnection>> {
        const connectionFilter = typeof connectionName === "string" ? (name: string) => name === connectionName : connectionName.test;
        return Observable.defer(() => {
            return new Promise<ConnectionPreparation<PortConnection>>(resolve => {
                const waiter = (port: chrome.runtime.Port) => {
                    if (!connectionFilter(port.name)) {
                        return;
                    }
                    chrome.runtime.onConnect.removeListener(waiter);
                    const cn = new PortConnection(port.name, this.id, port);
                    resolve(new ConnectionPreparation(cn));
                }
                chrome.runtime.onConnect.addListener(waiter)
            });
        }).repeat();
    }
    async connect(connectionName: string): Promise<ConnectionPreparation<PortConnection>> {
        const port = chrome.runtime.connect({
            name: connectionName
        });
        const cn = new PortConnection(connectionName, this.id, port);
        return new ConnectionPreparation(cn);
    }
}

export class WindowGateway implements IGateway<WindowConnection>{
    constructor(
        public id: string,
        public targetWindow = window,
        public debug = false,
    ) { }
    waitingConnection(connectionName: RegExp | string): Observable<ConnectionPreparation<WindowConnection>> {
        const connectionFilter = typeof connectionName === "string" ? (name: string) => name === connectionName : connectionName.test;
        return Observable.defer(() => {
            return new Promise<ConnectionPreparation<WindowConnection>>(resolve => {
                const listener = (e: MessageEvent) => {
                    if (e.ports.length !== 1) {
                        return;
                    }
                    const port = e.ports[0] as MessagePort;
                    const req = e.data;
                    if (!req.type || !req.connectionName || !req.gatewayId) {
                        return;
                    }
                    if (req.type === MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST && connectionFilter(req.connectionName)) {
                        window.removeEventListener("message", listener);
                        const cn = new WindowConnection(req.connectionName, this.id, port);
                        resolve(new ConnectionPreparation(cn));
                    }
                }
                window.addEventListener("message", listener);
            })
        }).repeat();

    }
    async connect(connectionName: string): Promise<ConnectionPreparation<WindowConnection>> {
        var channel = new MessageChannel();
        this.targetWindow.postMessage({
            type: MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST,
            connectionName: connectionName,
            gatewayId: this.id
        }, "*", [channel.port2]);
        const cn = new WindowConnection(connectionName, this.id, channel.port1);

        return await new ConnectionPreparation(cn);
    }

}

