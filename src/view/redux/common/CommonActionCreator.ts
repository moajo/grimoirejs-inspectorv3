import { GetFramesAction, PutFrameAction } from "./CommonAction";
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