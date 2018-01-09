import { TreeSelection } from '../view/redux/common/CommonState';
import { IChannelId } from './Channel';
import { NodeStructureInfo, TreeInfo, FrameStructure } from './Schema';

export const MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST = "MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_REQUEST";
export const MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE = "MESSAGE_TYPE_WINDOW_RESPONSE_CONNECT_RESPONSE";
export const DISCONNECT_SIGNAL = "DISCONNECT_SIGNAL";

export const CONNECTION_CS_TO_EMB = "CONNECTION_CS_TO_EMB";
export const CONNECTION_CS_TO_BG = "CONNECTION_CS_TO_BG";
export const CONNECTION_BG_TO_DEV = "CONNECTION_BG_TO_DEV";
export const CONNECTION_CS_TO_IFRAME = "CONNECTION_CS_TO_IFRAME";

// system
export const CHANNEL_NOTIFY_TAB_ID: IChannelId<number> = "CHANNEL_NOTIFY_TAB_ID";
export const CHANNEL_CONNECTION_ESTABLISHED: IChannelId<null> = "CHANNEL_CONNECTION_ESTABLISHED";

// iframeが親フレームに自分のフレーム構造を通知する
export const CHANNEL_NOTIFY_FRAME_STRUCTURE: IChannelId<FrameStructure> = "CHANNEL_NOTIFY_FRAME_STRUCTURE";
export const CHANNEL_NOTIFY_FRAME_CLOSE: IChannelId<string> = "CHANNEL_NOTIFY_FRAME_CLOSE";

// request connect with frameUUID
export const CHANNEL_CONNECT_TO_FRAME: IChannelId<string> = "CHANNEL_CONNECT_TO_FRAME";
// response with existing gr context.
export const CHANNEL_CONNECT_TO_FRAME_RESPONSE: IChannelId<boolean> = "CHANNEL_CONNECT_TO_FRAME_RESPONSE";


export const CHANNEL_NOTIFY_ROOT_NODES: IChannelId<null> = "CHANNEL_NOTIFY_ROOT_NODES";
export const CHANNEL_NOTIFY_ROOT_NODES_RESPONSE: IChannelId<FrameStructure["trees"]> = "CHANNEL_NOTIFY_ROOT_NODES_RESPONSE";

export const CHANNEL_PUT_FRAMES = "CHANNEL_PUT_FRAMES" as IChannelId<FrameStructure>;

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
    url: string,
    frameID?: string,
    frameClass?: string,
    children: {
        [key: string]: FrameStructure,
    },
    trees: { [key: string]: TreeInfo },
    plugins: string[],
}