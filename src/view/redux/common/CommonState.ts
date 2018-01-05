import { FrameInfo } from "../../../common/schema";
import { IConnection } from "../../../common/Gateway";

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
    connection?: IConnection
}

export const DefaultCommonState: ICommonState = {
    frames: {},
};