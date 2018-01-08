import { IConnection } from "../../../common/Gateway";
import { FrameStructure } from "../../../common/constants";

export interface TreeSelection {
    frameId: string;
    rootNodeId: string;
}

export interface NodeSelection {
    treeSelection: TreeSelection;
    nodeId: string;
}

export interface ICommonState {
    frames: { [frameId: string]: FrameStructure | undefined };
    treeSelection?: TreeSelection;
    nodeSelection?: NodeSelection;
    connection?: IConnection
}

export const DefaultCommonState: ICommonState = {
    frames: {},
};