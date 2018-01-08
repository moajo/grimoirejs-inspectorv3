import { NextObserver, PartialObserver } from "rxjs/Observer";
import { Subscribable } from "rxjs/Observable";
import { IConnection } from "./Connection";
import { AnonymousSubscription } from "rxjs/Subscription";


export interface IChannelType<T> { }

export type IChannelId<T> = IChannelType<T> & string

export interface IChannel<T> extends NextObserver<T>, Subscribable<T> { }

export class Channel<T> implements IChannel<T>{
    constructor(
        public connection: IConnection,
        public channelID: IChannelId<T>,
    ) { }

    next(value: T): void {
        this.connection.post(this.channelID, value);
    }

    subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void) | undefined, error?: (error: any) => void, complete?: () => void): AnonymousSubscription {
        if (typeof observerOrNext === "function") {
            return this.connection.open(this.channelID).subscribe(observerOrNext, error, complete);
        } else {
            return this.connection.open(this.channelID).subscribe(observerOrNext);
        }
    }
}