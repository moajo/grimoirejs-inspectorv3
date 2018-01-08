import { NextObserver, PartialObserver } from "rxjs/Observer";
import { Subscribable } from "rxjs/Observable";
import { IConnection } from "./Connection";
import { AnonymousSubscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";


export interface IChannelType<T> { }

export type IChannelId<T> = IChannelType<T> & string

export interface IChannel<T> extends Observable<T>, NextObserver<T> { }

export class Channel<T> extends Observable<T> implements IChannel<T> {
    constructor(
        public connection: IConnection,
        public channelID: IChannelId<T>,
    ) {
        super(subscriber => {
            return this.connection.toObservable()
                .filter(packet => packet.channel == channelID)
                .map(packet => packet.payload).subscribe(subscriber);
        })
    }

    next(value: T): void {
        this.connection.post(this.channelID, value);
    }
}