import { Action } from "redux";
import CommonActionType from "./CommonActionType";
import { NodeStructureInfo } from "../../../common/schema";
import { TreeSelection, NodeSelection, AdjustScreenMode, AdjustScreenRegion } from "./CommonState";
import { FrameStructure } from "../../../common/constants";

type CommonAction = ConnectToServerAction |
    ConnectionEstablishedAction |
    GetFramesAction |
    PutFrameAction |
    SelectTreeAction |
    SelectNodeAction |
    NotifyTreeStructureAction |
    ChangeAdjustScreenModeAction |
    EpicChangeAdjustScreenModeAction |
    EpicResizeAdjustScreenAction |
    ResizeAdjustScreenAction;
export default CommonAction;

export interface ConnectToServerAction extends Action {
    type: CommonActionType.CONNECT_TO_SERVER;
}

export interface ConnectionEstablishedAction extends Action {
    type: CommonActionType.CONNECTION_ESTABLISHED;
}

export interface GetFramesAction extends Action {
    type: CommonActionType.GET_FRAMES;
}

export interface PutFrameAction extends Action {
    type: CommonActionType.PUT_FRAME;
    frameId: string;
    frameInfo?: FrameStructure;
}

export interface SelectTreeAction extends Action {
    type: CommonActionType.SELECT_TREE;
    selection: TreeSelection;
}

export interface NotifyTreeStructureAction extends Action {
    type: CommonActionType.NOTIFY_TREE_STRUCTURE;
    selection: TreeSelection;
    structure: NodeStructureInfo;
}

export interface SelectNodeAction extends Action {
    type: CommonActionType.SELECT_NODE;
    selection: NodeSelection;
}

export interface NotifyAttributeChangeAction extends Action {
    type: CommonActionType.NOTIFY_ATTRIBUTE_CHANGE;
    nodeID: string;
    componentID: string;
    attributeFQN: string;
    oldValue: any;
    newValue: any;
}

export interface ChangeAdjustScreenModeAction extends Action {
    type: CommonActionType.CHANGE_ADJUST_SCREEN_TYPE,
    mode: AdjustScreenMode
}

export interface EpicChangeAdjustScreenModeAction extends Action {
    type: CommonActionType.EPIC_CHANGE_ADJUST_SCREEN_MODE,
    mode: AdjustScreenMode
}

export interface ResizeAdjustScreenAction extends Action {
    type: CommonActionType.RESIZE_ADJUST_SCEREEN_ACTION,
    part: keyof AdjustScreenRegion;
    diff: number;
}

export interface EpicResizeAdjustScreenAction extends Action {
    type: CommonActionType.EPIC_RESIZE_ADJUST_SCEREEN_ACTION,
    part: keyof AdjustScreenRegion;
    diff: number;
}
