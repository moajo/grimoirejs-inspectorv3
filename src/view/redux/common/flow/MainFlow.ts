import { ActionsObservable } from "redux-observable";
import { MiddlewareAPI, Action } from "redux";
import { Observable } from "rxjs/Observable";
import CommonAction from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { IState } from "../../State";
import { ICommonState } from "../CommonState";
import { GetFramesActionCreator } from "../CommonActionCreator";

export function MainEpic(action: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
    return action.ofType(CommonActionType.CONNECTION_ESTABLISHED).mapTo(GetFramesActionCreator()) as any;
}

export const epics = [MainEpic];

export const storeSection = "common";