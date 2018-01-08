import { IState } from "./redux/State";
import { GomlNodeInfo, TreeInfo } from "../common/schema";
import { FrameStructure } from "../common/constants";

export default class SelectionFilter {
    /**
     * Obtain current frame from state
     * @param state 
     */
    public static getCurrentFrame(state: IState): FrameStructure | undefined {
        if (!state.common.treeSelection) {
            return undefined;
        } else {
            return state.common.frames[state.common.treeSelection.frameId];
        }
    }

    public static getCurrentTree(state: IState): TreeInfo | undefined {
        const frame = SelectionFilter.getCurrentFrame(state);
        if (!frame) {
            return undefined;
        } else {
            return frame.trees[state.common.treeSelection!.rootNodeId];
        }
    }

    public static getCurrentNode(state: IState): GomlNodeInfo | undefined {
        const root = SelectionFilter.getCurrentTree(state);
        if (!root || state.common.nodeSelection) {
            return undefined;
        } else {
            return undefined; // TODO: 
        }
    }

    public static getCurrentRootNode(state: IState): GomlNodeInfo | undefined {
        const tree = SelectionFilter.getCurrentTree(state);
        if (!tree) {
            return undefined;
        }
        // TODO:
    }
}