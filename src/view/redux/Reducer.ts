import { combineReducers } from "redux";
import commonReducer from "./common/CommonReducer";

export default combineReducers({
    common: commonReducer
});