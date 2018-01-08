import { Action, MiddlewareAPI } from "redux";
import { ICommonState, DefaultCommonState, AdjustScreenMode } from "../CommonState";
import CommonActionType from "../CommonActionType";
import CommonAction, { ChangeAdjustScreenModeAction } from "../CommonAction";
import { ActionsObservable } from "redux-observable";
import { IState } from "../../State";

interface IScreenAdjustor {
    quit(): void;
    init(): void;
}

const screenAdjustors: { [key: number]: IScreenAdjustor } = {
    [AdjustScreenMode.Nothing]: {
        quit() { },
        init() { }
    },
    [AdjustScreenMode.BodyShrink]: {
        quit() {
            document.body.style.width = "100%";
        },
        init() {
            document.body.style.width = "80%";
        }
    }
};
export const changeAdjustScreenEpic = (action$: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>) =>
    action$.ofType(CommonActionType.EPIC_CHANGE_ADJUST_SCREEN_TYPE)
        .do((action) => screenAdjustors[store.getState().common.adjustScreenMode].quit())
        .do((action) => screenAdjustors[(action as ChangeAdjustScreenModeAction).mode].init())
        .map(a => ({
            ...a,
            type: CommonActionType.CHANGE_ADJUST_SCREEN_TYPE
        }));

export function reducer(state: ICommonState = DefaultCommonState, action: CommonAction) {
    switch (action.type) {
        case CommonActionType.CHANGE_ADJUST_SCREEN_TYPE:
            state = {
                ...state,
                adjustScreenMode: action.mode
            };
    }
    return state;
}

export const storeSection = "common";

export const epics = [changeAdjustScreenEpic];