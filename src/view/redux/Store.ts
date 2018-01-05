import { createStore, applyMiddleware, Reducer, Action, combineReducers, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import { IReduxSection } from "./IReduxSection";
import * as InitFlow from "./common/flow/InitFlow";
import { IState } from "./State";
import * as TreeSelector from "./tree/selector/Selector";

const sections: IReduxSection[] = [InitFlow, TreeSelector];

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
            reducer = (store: any, action: Action) => sectionArray[key][i](reducer(store, action), action);
        }
        reducers[key] = reducer;
    }
    return createStore(combineReducers(reducers), composeWithDevTools(
        applyMiddleware(Epicmiddleware)
    ));
}

export default getStoreFromReduxSections(sections);