import { Action, MiddlewareAPI } from "redux";
import { IConnection, PortGateway, WindowGateway } from "../../../../common/Gateway";
import { Observable } from "rxjs/Observable";
import { IState } from "../../State";
import { connectToBackground } from "../../../../devtool/Devtool";
import { ICommonState, DefaultCommonState } from "../CommonState";
import CommonAction, { GetFramesAction } from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { CHANNEL_GET_FRAMES, CHANNEL_CONNECTION_ESTABLISHED } from "../../../../common/constants";
import { PutFrameActionCreator } from "../CommonActionCreator";
import { ActionsObservable } from "redux-observable";
import { FrameInfo } from "../../../../common/schema";

export enum FlowActionTypes {
    CONNECTION_ESTABLISHED = "CONNECTION_ESTABLISHED",
    GET_FRAMES_RESPONSE = "GET_FRAMES_RESPONSE"
}

type FlowActions = ConnectionEstablishedAction | GetFramesResponseAction;

export interface ConnectionEstablishedAction extends Action {
    type: FlowActionTypes.CONNECTION_ESTABLISHED,
    connection: IConnection
}

export interface GetFramesResponseAction extends Action {
    type: FlowActionTypes.GET_FRAMES_RESPONSE,
    hoge: any,
}


export function GetFramesActionCreator(): GetFramesAction {
    return {
        type: CommonActionType.GET_FRAMES,
    }
}
export function GetFramesResponseActionCreator(hoge: any): GetFramesResponseAction {
    return {
        type: FlowActionTypes.GET_FRAMES_RESPONSE,
        hoge,
    }
}

export function ConnectionEstablishedActionCreater(connection: IConnection): ConnectionEstablishedAction {
    return {
        type: FlowActionTypes.CONNECTION_ESTABLISHED,
        connection
    }
}

export function GetFramesEpic(action: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
    return action.ofType(CommonActionType.GET_FRAMES).map(async (action: Action) => {
        const gateway = new WindowGateway("dev");
        const connection = await connectToBackground(gateway, 12345);//dummy tab id
        return ConnectionEstablishedActionCreater(connection);
    }).flatMap(a => Observable.fromPromise(a)) as any;
}

export function GetFramesEpic2(action: ActionsObservable<ConnectionEstablishedAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
    return action.ofType(FlowActionTypes.CONNECTION_ESTABLISHED)
        .map(async (action: ConnectionEstablishedAction) => {
            const p = new Promise<FrameInfo>(resolve => {
                action.connection.open(CHANNEL_GET_FRAMES).subscribe(a => {
                    resolve(a)
                })
            });

            action.connection.post(CHANNEL_GET_FRAMES, null);
            return p;
        }).flatMap(a => Observable.fromPromise(a)).map(a=>PutFrameActionCreator(a.frameId, a))as any;
}

export function reducer(store: ICommonState = DefaultCommonState, action: FlowActions) {
    switch (action.type) {
        case FlowActionTypes.CONNECTION_ESTABLISHED:
            store = {
                ...store,
                connection: action.connection,
            };
            break;
    }
    return store;
}

export const epics = [GetFramesEpic, GetFramesEpic2];

export const storeSection = "common";