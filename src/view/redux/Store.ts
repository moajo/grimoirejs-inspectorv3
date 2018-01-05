import { createStore, applyMiddleware, Reducer, Action, combineReducers, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import { IReduxSection } from "./IReduxSection";
import * as ConnectFlow from "./common/flow/ConnectFlow";
import * as GetFramesFlow from "./common/flow/GetFramesFlow";
import * as MainFlow from "./common/flow/MainFlow";
import * as SelectTreeFlow from "./common/flow/SelectTreeFlow";
import { IState } from "./State";
import { reduce } from "rxjs/operators/reduce";

const sections: IReduxSection[] = [MainFlow, ConnectFlow, GetFramesFlow, SelectTreeFlow];

function getStoreFromReduxSections(sections: IReduxSection[]): Store<IReduxSection> {
    const sectionArray: { [key: string]: Reducer<IState>[] } = {};
    const epics = [];
    for (let section of sections) {
        if (section.reducer) {
            if (!sectionArray[section.storeSection]) {
                sectionArray[section.storeSection] = [];
            }
            sectionArray[section.storeSection] = [...sectionArray[section.storeSection], section.reducer];
        }
        if (section.epics) {
            epics.push(...section.epics);
        }
    }
    const Epicmiddleware = createEpicMiddleware(combineEpics(...epics));
    const reducers: { [key: string]: Reducer<IState> } = {};
    for (let key in sectionArray) {
        let reducer = sectionArray[key][0];
        for (let i = 1; i < sectionArray[key].length; i++) {
            let a = reducer
            reducer = (store: any, action: Action) => sectionArray[key][i](a(store, action), action);
        }
        reducers[key] = reducer;
    }
    return createStore(combineReducers(reducers), composeWithDevTools(
        applyMiddleware(Epicmiddleware)
    ));
}

export default getStoreFromReduxSections(sections);