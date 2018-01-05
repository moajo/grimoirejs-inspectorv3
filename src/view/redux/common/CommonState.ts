import { FrameInfo } from "../../../common/schema";

export interface TreeSelection {
    frameId: string;
    rootNodeId: string;
}

export interface NodeSelection {
    treeSelection: TreeSelection;
    nodeId: string;
}

export interface ICommonState {
    frames: { [frameId: string]: FrameInfo | undefined };
    treeSelection?: TreeSelection;
    nodeSelection?: NodeSelection;
}

export const DefaultCommonState: ICommonState = {
    frames: {},
};