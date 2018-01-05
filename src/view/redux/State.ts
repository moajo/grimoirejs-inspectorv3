import { ICommonState, DefaultCommonState } from "./common/CommonState";
import { ITreeState } from "./tree/TreeState";

export interface IState {
    common: ICommonState;
    tree: ITreeState;
}