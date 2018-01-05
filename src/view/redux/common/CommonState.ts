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
    frames: FrameInfo[];
    treeSelection?: TreeSelection;
    nodeSelection?: NodeSelection;
}

export const DefaultCommonState: ICommonState = {
    frames: [],
};