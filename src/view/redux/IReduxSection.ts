import { Epic } from "redux-observable";
import { Action } from "redux";
import { IState } from "./State";

export interface IReduxSection {
    storeSection: string;
    epics?: Epic<any, any, any>[];
    reducer?(state: any, action: Action): any;
}