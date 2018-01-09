import { ITreeState, DefaultTreeState } from "../TreeState";
import { Action } from "redux";
import TreeStateActionType from "../TreeStateActionType";
type TreeSelectorActions = SwitchTreeSelectorAction;

export function switchTreeSelector(open: boolean): SwitchTreeSelectorAction {
    return {
        type: TreeStateActionType.SWITCH_TREE_SELECTOR,
        open
    };
}

export interface SwitchTreeSelectorAction extends Action {
    type: TreeStateActionType.SWITCH_TREE_SELECTOR;
    open: boolean;
}

export const reducer = (state: ITreeState = DefaultTreeState, action: TreeSelectorActions): ITreeState => {
    switch (action.type) {
        case TreeStateActionType.SWITCH_TREE_SELECTOR:
            state = {
                ...state,
                treeSelector: {
                    ...state.treeSelector,
                    openSelector: action.open
                }
            };
    }
    return state;
}


export const storeSection = "tree";