import { combineEpics } from "redux-observable";
import CommonEpic from "./common/CommonEpic";

export default combineEpics(...CommonEpic);