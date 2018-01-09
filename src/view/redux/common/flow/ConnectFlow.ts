import { Action, MiddlewareAPI } from 'redux';
import { ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs/Observable';

import { WindowGateway } from '../../../../common/Gateway';
import { connectToBackground } from '../../../../devtool/Devtool';
import { IState } from '../../State';
import CommonAction, { ConnectionEstablishedAction } from '../CommonAction';
import { ConnectionEstablishedActionCreator } from '../CommonActionCreator';
import CommonActionType from '../CommonActionType';
import { Dependency } from '../CommonDependency';
import { DefaultCommonState, ICommonState } from '../CommonState';


type FlowActions = ConnectionEstablishedAction;

export function ConnectToServerEpic(
    action: ActionsObservable<CommonAction>, 
    store: MiddlewareAPI<IState>,
    dependency:Dependency
): Observable<CommonAction> {
    return action.ofType(CommonActionType.CONNECT_TO_SERVER).map(async (action: Action) => {
        const gateway = new WindowGateway("dev");
        const connection = await connectToBackground(gateway, 123);//dummy tab id TODO fix
        dependency.connection = connection;
        return ConnectionEstablishedActionCreator();
    }).flatMap(a => Observable.fromPromise(a)) as any;
}



export function reducer(store: ICommonState = DefaultCommonState, action: FlowActions) {
    switch (action.type) {
        case CommonActionType.CONNECTION_ESTABLISHED:
            // store = {
            //     ...store,
            //     connection: action.connection,
            // };
            break;
    }
    return store;
}

export const epics = [ConnectToServerEpic];

export const storeSection = "common";