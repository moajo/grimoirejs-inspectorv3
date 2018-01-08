import { ActionsObservable } from "redux-observable";
import { MiddlewareAPI, Action } from "redux";
import { Observable } from "rxjs/Observable";
import CommonAction from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { IState } from "../../State";
import { ICommonState } from "../CommonState";
import { GetFramesActionCreator, SelectTreeActionCreator } from "../CommonActionCreator";

export function MainEpic(action: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
    return action.ofType(CommonActionType.CONNECTION_ESTABLISHED).mapTo(GetFramesActionCreator()) as any;
}
// export function Debug(action: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
//     return action.ofType(CommonActionType.PUT_FRAME).map(a => {
//         let k: string = "aa";
//         for (const key in store.getState().common.frames["main"]!.trees) {
//             k = key;
//             break
//         }
//         return SelectTreeActionCreator({
//             frameId: "main",
//             rootNodeId: k,
//         })
//     }) as any;
// }

export const epics = [MainEpic];

export const storeSection = "common";