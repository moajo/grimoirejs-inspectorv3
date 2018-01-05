import { Action } from "redux";
import CommonActionType from "./CommonActionType";

type CommonAction = ICommonExampleAction | ICommonExampleAction2;
export default CommonAction;

export interface ICommonExampleAction extends Action {
    type: CommonActionType.COMMON_EXAMPLE_ACTION;
}

export interface ICommonExampleAction2 extends Action {
    type: CommonActionType.COMMON_EXAMPLE_ACTION2;
}