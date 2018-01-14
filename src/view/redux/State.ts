import { ICommonState, DefaultCommonState } from "./common/CommonState";
import { ITreeState } from "./tree/TreeState";
import { IInspectorState } from "./inspector/InspectorState";

export interface IState {
    common: ICommonState;
    tree: ITreeState;
    inspector: IInspectorState;
}