import { ActionsObservable, Epic } from "redux-observable";
import { IState } from "../State";
import { Store, MiddlewareAPI, Action } from "redux";
import CommonActionType from "./CommonActionType";
import "rxjs";
import { ICommonState } from "./CommonState";
import { Observable } from "rxjs/Observable";
import CommonAction, { PutFrameAction } from "./CommonAction";
import { PortGateway, WindowGateway } from "../../../common/Gateway";
import { connectToBackground } from "../../../devtool/Devtool";
import { connectableObservableDescriptor } from "rxjs/observable/ConnectableObservable";
import { GetFramesEpic, GetFramesEpic2 } from "./flow/InitFlow";

export default [GetFramesEpic,GetFramesEpic2];