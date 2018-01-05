import { ActionsObservable, Epic } from "redux-observable";
import CommonAction, { ICommonExampleAction, ICommonExampleAction2 } from "./CommonAction";
import { IState } from "../State";
import { Store, MiddlewareAPI, Action } from "redux";
import CommonActionType from "./CommonActionType";
import "rxjs";
import { ICommonState } from "./CommonState";

type CommonEpic<T extends Action, D = any> = Epic<T, IState, D>;


export const sampleEpic: Epic<CommonAction, IState, any> = (action$: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>) =>
    action$.ofType(CommonActionType.COMMON_EXAMPLE_ACTION)
        .mapTo({ type: "COMMON_EXAMPLE_ACTION2" } as ICommonExampleAction2)
export const sampleEpic2 = (action$: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>) =>
    action$.ofType(CommonActionType.COMMON_EXAMPLE_ACTION2)
        .mapTo({ type: "COMMON_EXAMPLE_ACTION2" } as ICommonExampleAction2)
// Write more epics...


export default [sampleEpic, sampleEpic2];