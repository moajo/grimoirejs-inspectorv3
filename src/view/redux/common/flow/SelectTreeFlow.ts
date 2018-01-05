import { ActionsObservable } from "redux-observable";
import CommonAction, { ConnectionEstablishedAction, SelectTreeAction } from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { MiddlewareAPI } from "redux";
import { IState } from "../../State";
import { Observable } from "rxjs/Observable";
import { FrameInfo, NodeStructureInfo } from "../../../../common/schema";
import { CHANNEL_GET_FRAMES, CHANNEL_SELECT_TREE, CHANNEL_NOTIFY_TREE_STRUCTURE } from "../../../../common/constants";
import { PutFrameActionCreator, NotifyTreeStructureActionCreator } from "../CommonActionCreator";
import { ICommonState } from "../CommonState";



export function SelectTreeEpic(action: ActionsObservable<SelectTreeAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
    return action.ofType(CommonActionType.SELECT_TREE)
        .map(async (action) => {
            const p = new Promise<NodeStructureInfo>(resolve => {
                store.getState().common.connection!.open(CHANNEL_NOTIFY_TREE_STRUCTURE).subscribe(a => {
                    resolve(a)
                })
            });

            store.getState().common.connection!.post(CHANNEL_SELECT_TREE, action.selection);
            return NotifyTreeStructureActionCreator(await p, action.selection);
        }).flatMap(a => Observable.fromPromise(a)) as any;
}

export const storeSection = "common";

export const epics = [SelectTreeEpic];

export function reducer(store: ICommonState, action: CommonAction) {
    switch (action.type) {
        case CommonActionType.NOTIFY_TREE_STRUCTURE:
            store = {
                ...store,
                treeSelection: action.selection,
            };
            break;
    }
    return store;
}
