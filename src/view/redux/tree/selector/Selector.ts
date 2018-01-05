import { ITreeState, DefaultTreeState } from "../TreeState";
import { Action } from "redux";

type TreeSelectorActions = SwitchTreeSelectorAction;

export function switchTreeSelector(open: boolean): SwitchTreeSelectorAction {
    return {
        type: TreeSelectorActionType.SWITCH_TREE_SELECTOR,
        open
    };
}

export interface SwitchTreeSelectorAction extends Action {
    type: TreeSelectorActionType.SWITCH_TREE_SELECTOR;
    open: boolean;
}

enum TreeSelectorActionType {
    SWITCH_TREE_SELECTOR = "SWITCH_TREE_SELECTOR"
}

export const reducer = (state: ITreeState = DefaultTreeState, action: TreeSelectorActions): ITreeState => {
    switch (action.type) {
        case TreeSelectorActionType.SWITCH_TREE_SELECTOR:
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