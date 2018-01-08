import { FrameStructure } from "../../../common/constants";
import { IConnection } from "../../../common/Connection";

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

export interface AdjustScreenRegion {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface ICommonState {
    frames: { [frameId: string]: FrameStructure | undefined };
    treeSelection?: TreeSelection;
    nodeSelection?: NodeSelection;
    connection?: IConnection
    adjustScreenMode: AdjustScreenMode
    adjustScreenRegion: AdjustScreenRegion
}



export const DefaultCommonState: ICommonState = {
    frames: {},
    adjustScreenMode: AdjustScreenMode.Nothing,
    adjustScreenRegion: {
        left: 300,
        right: 300,
        top: 0,
        bottom: 0
    }
};