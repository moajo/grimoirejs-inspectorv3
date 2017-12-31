import { IChannelId, ChannelType } from "./Channel";

export const CONNECTION_CS_TO_EMB = "cs to emb";
export const CONNECTION_CS_TO_BG = "cs to bg";
export const CONNECTION_BG_TO_DEV = {
    regex: /devtool tab:(\d+)/,
    create(tabId: number) {
        return `devtool tab:${tabId}`
    }
};


export const CHANNEL_CONNECTION_ESTABLISHED: IChannelId<string> = "connection_established";
// export const CHANNEL_CONNECTION_ESTABLISHED: IChannelId<string> = Object.assign({ channelType: "state" as ChannelType }, "connection_established");
export const CHANNEL_NOTIFY_PORT_ID = "notify_port_id" as IChannelId<String>;

export const EMBEDDING_SCRIPT_PATH = "dist/emb.js"