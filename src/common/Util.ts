import { IGateway } from "./Gateway";
import { ReplaySubject } from "rxjs";
import { CHANNEL_CONNECTION_ESTABLISHED, FrameStructure } from "./constants";
import { IChannelId } from "./Channel";
import { IConnection } from "./Connection";

export async function postAndWaitReply<T, U>(
    cn: IConnection,
    postChannel: IChannelId<T>,
    message: T,
    replyChannel: IChannelId<U>
) {
    const r = cn.open(replyChannel).first().toPromise();
    cn.post(postChannel, message);
    return await r;
}


export function isNotNullOrUndefined<T>(arg: T | undefined): arg is T {
    return !!arg;
}
