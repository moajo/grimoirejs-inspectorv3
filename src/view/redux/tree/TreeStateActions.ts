import { Action } from "redux";
import TreeStateActionType from "./TreeStateActionType";
type TreeStateActions = ChangeNodeExpandStateAction | ChangeNodeFilterQueryAction;
export default TreeStateActions;
export interface ChangeNodeExpandStateAction extends Action {
    type: TreeStateActionType.CHANGE_NODE_EXPAND,
    isOpen: boolean;
    nodeId: string;
}

export interface ChangeNodeFilterQueryAction extends Action {
    type: TreeStateActionType.CHANGE_NODE_FILTER_QUERY;
    query: string;
}