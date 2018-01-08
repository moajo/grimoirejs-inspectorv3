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

export enum AdjustScreenMode {
    Nothing,
    BodyShrink
}

export interface ICommonState {
    frames: { [frameId: string]: FrameStructure | undefined };
    treeSelection?: TreeSelection;
    nodeSelection?: NodeSelection;
    connection?: IConnection
    adjustScreenMode: AdjustScreenMode
}


export const DefaultCommonState: ICommonState = {
    frames: {},
    adjustScreenMode: AdjustScreenMode.Nothing
};