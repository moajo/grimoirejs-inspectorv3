import { GetFramesAction, PutFrameAction, ConnectToServerAction, ConnectionEstablishedAction } from "./CommonAction";
import CommonActionType from "./CommonActionType";
import { IConnection } from "../../../common/Gateway";
import { FrameInfo } from "../../../common/schema";


export function PutFrameActionCreator(frameId: string, frameInfo?: FrameInfo): PutFrameAction {
    return {
        type: CommonActionType.PUT_FRAME,
        frameId,
        frameInfo,
    }
}

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


export function GetFramesActionCreator():GetFramesAction{
    return {
        type:CommonActionType.GET_FRAMES
    }
}