import { ICommonState, DefaultCommonState } from "./CommonState";
import CommonAction from "./CommonAction";
import CommonActionType from "./CommonActionType";

export default function commonReducer(store: ICommonState = DefaultCommonState, action: CommonAction): ICommonState {
    switch (action.type) {
        case CommonActionType.COMMON_EXAMPLE_ACTION:
            store = {
                ...store,
                test: true
            };
            break;
    }
    return store;
}