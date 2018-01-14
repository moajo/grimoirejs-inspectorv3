import { IState } from "./redux/State";
import { TreeInfo, FrameStructure, NodeStructureInfo } from "../common/Schema";


export default class SelectionFilter {
    /**
     * Obtain current frame from state
     * @param state 
     */
    public static getCurrentFrame(state: IState): FrameStructure | undefined {
        if (!state.common.treeSelection) {
            return undefined;
        } else {
            return SelectionFilter._getCurrentFrame(state.common.frames, state.common.treeSelection.frameUUID);
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

    public static getCurrentNode(state: IState): NodeStructureInfo | undefined {
        const root = SelectionFilter.getCurrentTree(state);
        if (!root || state.common.nodeSelection) {
            return undefined;
        } else {
            return undefined; // TODO: 
        }
    }

    public static getCurrentRootNode(state: IState): NodeStructureInfo | undefined {
        const tree = SelectionFilter.getCurrentTree(state);
        if (!tree) {
            return undefined;
        }
        // TODO:
    }

    private static _getCurrentFrame(frames: { [key: string]: FrameStructure | undefined }, frameId: string): FrameStructure | undefined {
        if (frames[frameId]) {
            return frames[frameId];
        } else {
            for (let key in frames) {
                const frame = frames[key];
                const frameDecendents = SelectionFilter._getCurrentFrame(frame!.children, frameId);
                if (frameDecendents) {
                    return frameDecendents;
                }
            }
        }
    }
}