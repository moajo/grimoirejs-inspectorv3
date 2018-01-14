import { NodeStructureInfo, FrameStructure } from '../../../common/Schema';
import {
    ConnectionEstablishedAction,
    ConnectToServerAction,
    GetFramesAction,
    NotifyAttributeChangeAction,
    NotifyTreeStructureAction,
    PutFrameAction,
    SelectTreeAction,
    ChangeAdjustScreenModeAction,
    EpicChangeAdjustScreenModeAction,
    EpicResizeAdjustScreenAction,
} from './CommonAction';
import CommonActionType from './CommonActionType';
import { TreeSelection, AdjustScreenMode, AdjustScreenRegion } from './CommonState';

export function ConnectToServerActionCreator(): ConnectToServerAction {
    return {
        type: CommonActionType.CONNECT_TO_SERVER,
    }
}

export function ConnectionEstablishedActionCreator(): ConnectionEstablishedAction {
    return {
        type: CommonActionType.CONNECTION_ESTABLISHED,
    }
}


export function GetFramesActionCreator(): GetFramesAction {
    return {
        type: CommonActionType.GET_FRAMES
    }
}

export function PutFrameActionCreator(frameId: string, frameInfo?: FrameStructure): PutFrameAction {
    return {
        type: CommonActionType.PUT_FRAME,
        frameId,
        frameInfo,
    }
}

export function SelectTreeActionCreator(selection: TreeSelection): SelectTreeAction {
    return {
        type: CommonActionType.SELECT_TREE,
        selection,
    }
}

export function NotifyTreeStructureActionCreator(nodeStructureInfo: NodeStructureInfo, selection: TreeSelection): NotifyTreeStructureAction {
    return {
        type: CommonActionType.NOTIFY_TREE_STRUCTURE,
        structure: nodeStructureInfo,
        selection,
    }
}

export function NotifyAttributeChangeActionCreator(nodeID: string, componentID: string, attributeFQN: string, oldValue: any, newValue: any): NotifyAttributeChangeAction {
    return {
        type: CommonActionType.NOTIFY_ATTRIBUTE_CHANGE,
        nodeID,
        componentID,
        attributeFQN,
        oldValue,
        newValue,
    }
}

export function changeAdjustScreenMode(mode: AdjustScreenMode): EpicChangeAdjustScreenModeAction {
    return {
        type: CommonActionType.EPIC_CHANGE_ADJUST_SCREEN_MODE,
        mode
    };
}

export function resizeAdjustScreen(part: keyof AdjustScreenRegion, diff: number): EpicResizeAdjustScreenAction {
    return {
        type: CommonActionType.EPIC_RESIZE_ADJUST_SCEREEN_ACTION,
        part, diff
    };
}