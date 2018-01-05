import { GetFramesAction, PutFrameAction, ConnectToServerAction, ConnectionEstablishedAction, NotifyTreeStructureAction, SelectTreeAction, NotifyAttributeChangeAction } from "./CommonAction";
import CommonActionType from "./CommonActionType";
import { IConnection } from "../../../common/Gateway";
import { FrameInfo, NodeStructureInfo } from "../../../common/schema";
import { CHANNEL_NOTIFY_GR_EXISTS } from "../../../common/constants";
import { TreeSelection } from "./CommonState";

export function ConnectToServerActionCreator(): ConnectToServerAction {
    return {
        type: CommonActionType.CONNECT_TO_SERVER,
    }
}

export function ConnectionEstablishedActionCreator(connection: IConnection): ConnectionEstablishedAction {
    return {
        type: CommonActionType.CONNECTION_ESTABLISHED,
        connection,
    }
}


export function GetFramesActionCreator(): GetFramesAction {
    return {
        type: CommonActionType.GET_FRAMES
    }
}

export function PutFrameActionCreator(frameId: string, frameInfo?: FrameInfo): PutFrameAction {
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