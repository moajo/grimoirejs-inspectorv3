import { ActionsObservable } from "redux-observable";
import CommonAction, { ConnectionEstablishedAction } from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { MiddlewareAPI } from "redux";
import { IState } from "../../State";
import { Observable } from "rxjs/Observable";
import { CHANNEL_PUT_FRAMES, FrameStructure } from "../../../../common/Constants";
import { PutFrameActionCreator } from "../CommonActionCreator";
import { ICommonState } from "../CommonState";
import { Dependency } from "../CommonDependency";



export function GetFramesEpic(
    actions: ActionsObservable<CommonAction>,
    store: MiddlewareAPI<IState>,
    dependency: Dependency,
): Observable<CommonAction> {
    const p = actions.ofType(CommonActionType.GET_FRAMES).first().flatMap(() => {
        return dependency.connection!.open(CHANNEL_PUT_FRAMES).map(a => PutFrameActionCreator(a.uuid, a))
    });
    actions.ofType(CommonActionType.GET_FRAMES).subscribe(a => {
        console.log("@[flow] GET_FRAMES")
        dependency.connection!.post(CHANNEL_PUT_FRAMES, null);
    })
    return p;
}

export const storeSection = "common";

export const epics = [GetFramesEpic];

export function reducer(store: ICommonState, action: CommonAction) {
    switch (action.type) {
        case CommonActionType.PUT_FRAME:
            const frames = {} as { [frameId: string]: FrameStructure | undefined };
            frames[action.frameId] = action.frameInfo;
            store = {
                ...store,
                frames,
            };
            break;
    }
    return store;
}

