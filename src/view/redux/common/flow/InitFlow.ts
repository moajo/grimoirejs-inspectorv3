import { Action } from "redux";
import { IConnection, PortGateway, WindowGateway } from "../../../../common/Gateway";
import { Observable } from "rxjs/Observable";
import { IState } from "../../State";
import { connectToBackground } from "../../../../devtool/Devtool";
import { ICommonState, DefaultCommonState } from "../CommonState";
import CommonAction, { GetFramesAction } from "../CommonAction";
import CommonActionType from "../CommonActionType";
import Store from "../../Store";
import { CHANNEL_GET_FRAMES, CHANNEL_CONNECTION_ESTABLISHED } from "../../../../common/constants";
import { PutFrameActionCreator } from "../CommonActionCreator";

export interface ConnectionEstablishedAction extends Action {
    type: CommonActionType.CONNECTION_ESTABLISHED,
    connection: IConnection
}

export interface GetFramesResponseAction extends Action {
    type: CommonActionType.GET_FRAMES_RESPONSE,
    hoge: any,
}


export function GetFramesActionCreator(): GetFramesAction {
    return {
        type: CommonActionType.GET_FRAMES,
    }
}
export function GetFramesResponseActionCreator(hoge: any): GetFramesResponseAction {
    return {
        type: CommonActionType.GET_FRAMES_RESPONSE,
        hoge,
    }
}

export function ConnectionEstablishedActionCreater(connection: IConnection): ConnectionEstablishedAction {
    return {
        type: CommonActionType.CONNECTION_ESTABLISHED,
        connection
    }
}

export function GetFramesEpic(action: Observable<CommonAction>, state: IState): Observable<CommonAction> {
    return action.filter(action => action.type === CommonActionType.GET_FRAMES).map(async (action: Action) => {
        const gateway = new WindowGateway("dev");
        const connection = await connectToBackground(gateway, 12345);//dummy tab id
        return ConnectionEstablishedActionCreater(connection);
    }).flatMap(a => Observable.fromPromise(a)) as any;
}

export function GetFramesEpic2(action: Observable<ConnectionEstablishedAction>, state: IState): Observable<CommonAction> {
    return action.filter(action => action.type === CommonActionType.CONNECTION_ESTABLISHED)
        .map(async (action: ConnectionEstablishedAction) => {
            const p = new Promise(resolve => {
                action.connection.open(CHANNEL_GET_FRAMES).subscribe(a => {
                    resolve(a)
                })
            });

            action.connection.post(CHANNEL_GET_FRAMES, "aaaaa");
            return p;
        }).flatMap(a => Observable.fromPromise(a)).do((a) => {
            Store.dispatch(PutFrameActionCreator(a as string));
        }) as any;
}

export function InitReducer(store: ICommonState = DefaultCommonState, action: ConnectionEstablishedAction) {
    return {
        ...store,
        connection: action.connection,
    }
}