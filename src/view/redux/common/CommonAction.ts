import { Action } from "redux";
import CommonActionType from "./CommonActionType";
import { FrameInfo } from "../../../common/schema";
import { TreeSelection, NodeSelection } from "./CommonState";

type CommonAction = GetFramesAction | PutFrameAction | SelectTreeAction | SelectNodeAction;
export default CommonAction;

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

export interface SelectNodeAction extends Action {
    type: CommonActionType.SELECT_NODE;
    selection: NodeSelection;
}