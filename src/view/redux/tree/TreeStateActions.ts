import { Action } from "redux";
import TreeStateActionType from "./TreeStateActionType";
type TreeStateActions = ChangeNodeExpandStateAction;
export default TreeStateActions;
export interface ChangeNodeExpandStateAction extends Action {
    type: TreeStateActionType.CHANGE_NODE_EXPAND,
    isOpen: boolean;
    nodeId: string;
}