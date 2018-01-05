import { Action, MiddlewareAPI } from "redux";
import { IConnection, PortGateway, WindowGateway } from "../../../../common/Gateway";
import { Observable } from "rxjs/Observable";
import { IState } from "../../State";
import { connectToBackground } from "../../../../devtool/Devtool";
import { ICommonState, DefaultCommonState } from "../CommonState";
import CommonAction, { GetFramesAction, ConnectionEstablishedAction } from "../CommonAction";
import CommonActionType from "../CommonActionType";
import { CHANNEL_PUT_FRAMES, CHANNEL_CONNECTION_ESTABLISHED } from "../../../../common/constants";
import { PutFrameActionCreator, ConnectionEstablishedActionCreator } from "../CommonActionCreator";
import { ActionsObservable } from "redux-observable";
import { FrameInfo } from "../../../../common/schema";


type FlowActions = ConnectionEstablishedAction;

export function ConnectToServerEpic(action: ActionsObservable<CommonAction>, store: MiddlewareAPI<IState>): Observable<CommonAction> {
    return action.ofType(CommonActionType.CONNECT_TO_SERVER).map(async (action: Action) => {
        const gateway = new WindowGateway("dev");
        const connection = await connectToBackground(gateway, 12345);//dummy tab id
        return ConnectionEstablishedActionCreator(connection);
    }).flatMap(a => Observable.fromPromise(a)) as any;
}



export function reducer(store: ICommonState = DefaultCommonState, action: FlowActions) {
    switch (action.type) {
        case CommonActionType.CONNECTION_ESTABLISHED:
            store = {
                ...store,
                connection: action.connection,
            };
            break;
    }
    return store;
}

export const epics = [ConnectToServerEpic];

export const storeSection = "common";