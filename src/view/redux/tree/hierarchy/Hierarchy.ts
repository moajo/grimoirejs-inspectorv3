import { ITreeState, DefaultTreeState } from "../TreeState";
import { Action } from "redux";
import TreeStateActions from "../TreeStateActions";
import TreeStateActionType from "../TreeStateActionType";

export const reducer = (state: ITreeState = DefaultTreeState, action: TreeStateActions): ITreeState => {
    switch (action.type) {
        case TreeStateActionType.CHANGE_NODE_EXPAND:
            state = {
                ...state,
                hierarchy: {
                    ...state.hierarchy,
                    isOpen: {
                        ...state.hierarchy.isOpen,
                        [action.nodeId]: action.isOpen
                    }
                }
            };
    }
    return state;
}


export const storeSection = "tree";