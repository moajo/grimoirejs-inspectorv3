import { IChannelId, ChannelType } from "./Channel";

export const MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST = "windowgatewayconnectrequest";
export const MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE = "windowgatewayconnectresponse";

export const CONNECTION_CS_TO_EMB = "cs to emb";
export const CONNECTION_CS_TO_BG = "cs to bg";
export const CONNECTION_BG_TO_DEV = {
    regex: /devtool tab:(\d+)/,
    create(tabId: number) {
        return `devtool tab:${tabId}`
    }
};


export const CHANNEL_CONNECTION_ESTABLISHED: IChannelId<string> = "connection_established";
export const CHANNEL_NOTIFY_GR_EXISTS: IChannelId<boolean> = "gr_exisxts";
export const CHANNEL_NOTIFY_GR_LIBS: IChannelId<string[]> = "gr_libs";
export const CHANNEL_NOTIFY_PORT_ID = "notify_port_id" as IChannelId<string>;

export const EMBEDDING_SCRIPT_NAME = "emb.js";
export const EMBEDDING_SCRIPT_PATH = "dist/" + EMBEDDING_SCRIPT_NAME;
export const CONTENT_SCRIPT_TEST = "content_script_test.js";
export const CONTENT_SCRIPT_PATH = "dist/content_script.js";

export const REQUEST_NOTIFY_METAINFO = "please tell me my tabid and extension id!";
export type MetaInfo = {
    tabId: number,
    extensionId: string
}