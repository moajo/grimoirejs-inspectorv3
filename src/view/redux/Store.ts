import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createEpicMiddleware } from "redux-observable";
import Reducer from "./Reducer";
import Epic from "./Epic";

const store = createStore(Reducer, composeWithDevTools(
    applyMiddleware(createEpicMiddleware(Epic as any))
));

export default store;