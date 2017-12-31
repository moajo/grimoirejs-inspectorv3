
export type ChannelType = "state" | "event";

export interface IChannel<T> {
    // channelType: ChannelType
}

export type IChannelId<T> = IChannel<T> & string

