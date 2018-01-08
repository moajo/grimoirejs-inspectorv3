import { ActionsObservable } from "redux-observable";
import CommonAction, { ConnectionEstablishedAction } from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { MiddlewareAPI } from "redux";
import { IState } from "../../State";
import { Observable } from "rxjs/Observable";
import { FrameInfo } from "../../../../common/schema";
import { CHANNEL_PUT_FRAMES } from "../../../../common/constants";
import { PutFrameActionCreator } from "../CommonActionCreator";
import { ICommonState } from "../CommonState";
import { Dependency } from "../CommonDependency";



export function GetFramesEpic(
    action: ActionsObservable<CommonAction>, 
    store: MiddlewareAPI<IState>,
    dependency:Dependency,
): Observable<CommonAction> {
    return action.ofType(CommonActionType.GET_FRAMES)
        .map(async (action) => {
            const p = new Promise<FrameInfo>(resolve => {
                dependency.connection!.open(CHANNEL_PUT_FRAMES).subscribe(a => {
                    resolve(a)
                })
            });

            dependency.connection!.post(CHANNEL_PUT_FRAMES, null);
            return p;
        }).flatMap(a => Observable.fromPromise(a))
        .map(a => PutFrameActionCreator(a.frameId, a)) as any;
}

export const storeSection = "common";

export const epics = [GetFramesEpic];

export function reducer(store: ICommonState, action: CommonAction) {
    switch (action.type) {
        case CommonActionType.PUT_FRAME:
            const frames = {} as { [frameId: string]: FrameInfo | undefined };
            frames[action.frameId] = action.frameInfo;
            store = {
                ...store,
                frames,
            };
            break;
    }
    return store;
}

