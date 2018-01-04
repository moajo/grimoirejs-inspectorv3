import { ICommonExampleAction } from "./CommonAction";
import CommonActionType from "./CommonActionType";

export function sampleActionCreator(): ICommonExampleAction {
    return {
        type: CommonActionType.COMMON_EXAMPLE_ACTION,
    };
}