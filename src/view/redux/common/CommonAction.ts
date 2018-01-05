import { Action } from "redux";
import CommonActionType from "./CommonActionType";
import { FrameInfo, NodeStructureInfo } from "../../../common/schema";
import { TreeSelection, NodeSelection } from "./CommonState";
import { IConnection } from "../../../common/Gateway";

type CommonAction = ConnectToServerAction | ConnectionEstablishedAction | GetFramesAction | PutFrameAction | SelectTreeAction | SelectNodeAction;
export default CommonAction;

export interface ConnectToServerAction extends Action {
    type: CommonActionType.CONNECT_TO_SERVER
}

export interface ConnectionEstablishedAction extends Action {
    type: CommonActionType.CONNECTION_ESTABLISHED,
    connection: IConnection
}

export interface GetFramesAction extends Action {
    type: CommonActionType.GET_FRAMES;
}

export interface PutFrameAction extends Action {
    type: CommonActionType.PUT_FRAME;
    frameId: string;
    frameInfo?: FrameInfo;
}

export interface SelectTreeAction extends Action {
    type: CommonActionType.SELECT_TREE;
    selection: TreeSelection;
}

export interface NotifyTreeStructureAction extends Action {
    type: CommonActionType.NOTIFY_TREE_STRUCTURE;
    structure: NodeStructureInfo,
}

export interface SelectNodeAction extends Action {
    type: CommonActionType.SELECT_NODE;
    selection: NodeSelection;
}