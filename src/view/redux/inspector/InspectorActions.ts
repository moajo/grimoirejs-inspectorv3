import { Action } from "redux";
import InspectorActionType from "./InspectorActionType";

type InspectorActions = ChangeAttributeFilterQueryAction;
export default InspectorActions;
export interface ChangeAttributeFilterQueryAction extends Action {
    type: InspectorActionType.CHANGE_ATTRIBUTE_FILTER_QUERY,
    query: string
}