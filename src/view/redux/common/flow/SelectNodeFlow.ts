import { MiddlewareAPI } from 'redux';
import { ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs/Observable';

import { IState } from '../../State';
import CommonAction, { SelectNodeAction } from '../CommonAction';
import { ICommonState } from '../CommonState';



export function SelectNodeEpic(action: ActionsObservable<SelectNodeAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
    // return action.ofType(CommonActionType.SELECT_NODE)
    //     .map(async (action) => {
    //         const p = new Promise<NodeStructureInfo>(resolve => {
    //             store.getState().common.connection!.open(CHANNEL_NOTIFY_TREE_STRUCTURE).subscribe(a => {
    //                 resolve(a)
    //             })
    //         });

    //         store.getState().common.connection!.post(CHANNEL_SELECT_TREE, action.selection);
    //         return NotifyTreeStructureActionCreator(await p, action.selection);
    //     }).flatMap(a => Observable.fromPromise(a)) as any;
    throw new  Error("todo")
}

export const storeSection = "common";

export const epics = [SelectNodeEpic];

export function reducer(store: ICommonState, action: CommonAction) {
    switch (action.type) {
        // case CommonActionType.NOTIFY_TREE_STRUCTURE:
        //     store = {
        //         ...store,
        //         treeSelection: action.selection,
        //     };
        //     break;
    }
    return store;
}
