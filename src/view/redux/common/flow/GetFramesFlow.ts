import { ActionsObservable } from "redux-observable";
import CommonAction, { ConnectionEstablishedAction, PutFrameAction } from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { MiddlewareAPI } from "redux";
import { IState } from "../../State";
import { Observable } from "rxjs/Observable";
import { CHANNEL_PUT_FRAMES } from "../../../../common/Constants";
import { PutFrameActionCreator, SelectTreeActionCreator } from "../CommonActionCreator";
import { ICommonState } from "../CommonState";
import { Dependency } from "../CommonDependency";
import { TreeSelection } from "../CommonState"
import _ from "lodash";
import { FrameStructure } from "../../../../common/Schema";

export function GetFramesEpic(
    actions: ActionsObservable<CommonAction>,
    store: MiddlewareAPI<IState>,
    dependency: Dependency,
): Observable<CommonAction> {
    const p = actions.ofType(CommonActionType.GET_FRAMES).first().flatMap(() => {
        return dependency.connection!.open(CHANNEL_PUT_FRAMES).map(a => PutFrameActionCreator(a.UUID, a))
    });
    actions.ofType(CommonActionType.GET_FRAMES).subscribe(a => {
        console.log("@[flow] GET_FRAMES")
        dependency.connection!.post(CHANNEL_PUT_FRAMES, null);
    })
    return p;
}

export function PutFrameEpic(
    actions: ActionsObservable<CommonAction>,
    store: MiddlewareAPI<IState>,
    dependency: Dependency,
): Observable<CommonAction> {
    return actions.ofType(CommonActionType.PUT_FRAME).filter((a) => !store.getState().common.treeSelection && !!(a as PutFrameAction).frameInfo && !!_.pick((a as PutFrameAction).frameInfo!.trees)).map((a) => {
        const put: PutFrameAction = a as PutFrameAction;
        return SelectTreeActionCreator({
            frameUUID: put.frameId,
            rootNodeId: _.sample(put.frameInfo!.trees)!.rootNodeId
        });
    });
}

export const storeSection = "common";

export const epics = [GetFramesEpic, PutFrameEpic];

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

