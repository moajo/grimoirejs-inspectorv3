import { combineEpics } from "redux-observable";
import CommonEpic from "./common/CommonEpic";

// Epicは主に非同期なものを処理する
// dispatchされたものを基準にSocketの向こう側に何か送りたい場合など
export default combineEpics(...CommonEpic);