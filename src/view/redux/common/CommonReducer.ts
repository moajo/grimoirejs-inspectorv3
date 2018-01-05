import { ICommonState, DefaultCommonState } from "./CommonState";
import CommonAction from "./CommonAction";
import CommonActionType from "./CommonActionType";

export default function commonReducer(store: ICommonState = DefaultCommonState, action: CommonAction): ICommonState {
    switch (action.type) {
        case CommonActionType.GET_FRAMES:
            store = {
                ...store,
            };
            break;
        case CommonActionType.PUT_FRAME:
            store = {
                ...store,
                frames: {
                    ...store.frames,
                    [action.frameId]: action.frameInfo
                }
            };
            break;
        case CommonActionType.SELECT_NODE:
            store = {
                ...store,
                nodeSelection: action.selection
            };
            break;
        case CommonActionType.SELECT_TREE:
            store = {
                ...store,
                treeSelection: action.selection
            };
            break;
    }
    return store;
}