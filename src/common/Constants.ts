import { IChannelId } from "./Channel";
import { FrameInfo, NodeStructureInfo } from "./schema";
import { TreeSelection } from "../view/redux/common/CommonState";

export const MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST = "windowgatewayconnectrequest";
export const MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE = "windowgatewayconnectresponse";

export const CONNECTION_CS_TO_EMB = "cs to emb";
export const CONNECTION_CS_TO_BG = "cs to bg";
export const CONNECTION_BG_TO_DEV = "CONNECTION_BG_TO_DEV";
// = {
//     regex: /devtool tab:(\d+)/,
//     create(tabId: number) {
//         return `devtool tab:${tabId}`
//     }
// };
export const CONNECTION_CS_TO_IFRAME = {
    regex: /ifame:(\d+)/,
    create(uuid: string) {
        return `iframe:${uuid}`
    }
};


export const CHANNEL_CONNECTION_ESTABLISHED: IChannelId<string> = "CHANNEL_CONNECTION_ESTABLISHED";
export const CHANNEL_NOTIFY_TAB_ID: IChannelId<number> = "CHANNEL_NOTIFY_TAB_ID";
export const CHANNEL_TAB_CONNECTION_ESTABLISHED: IChannelId<string> = "CHANNEL_TAB_CONNECTION_ESTABLISHED";

export const CHANNEL_NOTIFY_FRAME_STRUCTURE: IChannelId<FrameStructure> = "CHANNEL_NOTIFY_FRAME_STRUCTURE";

// request connect with frameUUID
export const CHANNEL_CONNECT_TO_FRAME: IChannelId<string> = "CHANNEL_CONNECT_TO_FRAME";
// response with existing gr context.
export const CHANNEL_FRAME_CONNECT_RESPONSE: IChannelId<boolean> = "CHANNEL_FRAME_CONNECT_RESPONSE";

export const CHANNEL_NOTIFY_GR_EXISTS: IChannelId<boolean> = "gr_exisxts";
export const CHANNEL_NOTIFY_GR_LIBS: IChannelId<string[]> = "gr_libs";
export const CHANNEL_NOTIFY_ROOT_NODES: IChannelId<string> = "channel_notify_root_node";
export const CHANNEL_NOTIFY_PORT_ID = "notify_port_id" as IChannelId<string>;
export const CHANNEL_PUT_FRAMES = "CHANNEL_PUT_FRAMES" as IChannelId<FrameInfo>;

export const CHANNEL_SELECT_TREE = "CHANNEL_SELECT_TREE" as IChannelId<TreeSelection>;
export const CHANNEL_NOTIFY_TREE_STRUCTURE = "CHANNEL_NOTIFY_TREE_STRUCTURE" as IChannelId<NodeStructureInfo>;

export const CHANNEL_SELECT_NODE = "CHANNEL_SELECT_NODE" as IChannelId<NodeSelector>;

export const EMBEDDING_SCRIPT_NAME = "embbed.js";
export const EMBEDDING_SCRIPT_PATH = "dist/" + EMBEDDING_SCRIPT_NAME;
export const CONTENT_SCRIPT_TEST = "content_script_test.js";
export const CONTENT_SCRIPT_PATH = "dist/content_script.js";

export const REQUEST_NOTIFY_METAINFO = "please tell me my tabid and extension id!";
export type MetaInfo = {
    tabId: number,
    extensionId: string
};

export type NodeSelector = {
    frameID: string,
    nodeID: string,
};

export type FrameStructure = {
    uuid: string,
    frameID?: string,
    frameClass?: string,
    children: {
        [key: string]: FrameStructure,
    },
}