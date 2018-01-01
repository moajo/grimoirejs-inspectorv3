
export type ChannelType = "state" | "event";

export interface IChannelType<T> {
    // channelType: ChannelType
}

export type IChannelId<T> = IChannelType<T> & string
