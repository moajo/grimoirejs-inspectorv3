import { ActionsObservable } from "redux-observable";
import { ICommonExampleAction } from "./CommonAction";
import { IState } from "../State";
import { Store, MiddlewareAPI } from "redux";
import CommonActionType from "./CommonActionType";

export const sampleEpic = (action$: ActionsObservable<ICommonExampleAction>, store: MiddlewareAPI<IState>) =>
    action$.ofType(CommonActionType.COMMON_EXAMPLE_ACTION)
        .mapTo({ type: "TEST" })
// Write more epics...


export default [sampleEpic];