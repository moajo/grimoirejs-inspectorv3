import { combineReducers } from "redux";
import commonReducer from "./common/CommonReducer";

// Reducerは同期的に処理しなければならない。
// 主にStateをいじるだけのPureな関数であるべきで、それ以外のことをしてはならない
export default combineReducers({
    common: commonReducer
});