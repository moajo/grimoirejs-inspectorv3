import { ICommonState, DefaultCommonState } from "./common/CommonState";

export interface IState {
    common: ICommonState;
}

export const DefaultState: IState = {
    common: DefaultCommonState
};