import { Action, MiddlewareAPI, Middleware } from "redux";
import { ICommonState, DefaultCommonState, AdjustScreenMode, AdjustScreenRegion } from "../CommonState";
import CommonActionType from "../CommonActionType";
import CommonAction, { ChangeAdjustScreenModeAction } from "../CommonAction";
import { ActionsObservable } from "redux-observable";
import { IState } from "../../State";
import { resizeAdjustScreen } from "../CommonActionCreator";

interface IScreenAdjustor {
    quit(): void;
    init(): void;
    resize(region: AdjustScreenRegion): void;
}

const screenAdjustors: { [key: number]: IScreenAdjustor } = {
    [AdjustScreenMode.Nothing]: {
        quit() { },
        init() { },
        resize() { }
    },
    [AdjustScreenMode.BodyShrink]: {
        quit() {
            document.body.style.margin = "0 0 0 0"
        },
        init() {
        },
        resize(region: AdjustScreenRegion) {
            document.body.style.margin = `${region.top}px ${region.right}px ${region.bottom}px ${region.left}px`
        }
    }
};
export const changeAdjustScreenEpic = (action$: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>) =>
    action$.ofType(CommonActionType.EPIC_CHANGE_ADJUST_SCREEN_MODE)
        .do((action) => screenAdjustors[store.getState().common.adjustScreenMode].quit())
        .do((action) => screenAdjustors[(action as ChangeAdjustScreenModeAction).mode].init())
        .do((action) => screenAdjustors[(action as ChangeAdjustScreenModeAction).mode].resize(store.getState().common.adjustScreenRegion))
        .map(a => ({
            ...a,
            type: CommonActionType.CHANGE_ADJUST_SCREEN_TYPE
        }));

export const resizeScreenEpic = (action$: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>) =>
    action$.ofType(CommonActionType.EPIC_RESIZE_ADJUST_SCEREEN_ACTION)
        .do((action) => screenAdjustors[store.getState().common.adjustScreenMode].resize(store.getState().common.adjustScreenRegion))
        .map(a => ({
            ...a,
            type: CommonActionType.RESIZE_ADJUST_SCEREEN_ACTION
        }));


export function reducer(state: ICommonState = DefaultCommonState, action: CommonAction) {
    switch (action.type) {
        case CommonActionType.CHANGE_ADJUST_SCREEN_TYPE:
            state = {
                ...state,
                adjustScreenMode: action.mode
            };
            break;
        case CommonActionType.RESIZE_ADJUST_SCEREEN_ACTION:
            state = {
                ...state,
                adjustScreenRegion: {
                    ...state.adjustScreenRegion,
                    [action.part]: state.adjustScreenRegion[action.part] + action.diff
                }
            };
    }
    return state;
}

export const storeSection = "common";

export const epics = [changeAdjustScreenEpic, resizeScreenEpic];