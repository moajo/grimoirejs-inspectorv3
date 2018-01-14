import { IInspectorState } from "../InspectorState";
import InspectorActions from "../InspectorActions";
import defaultInspectorState from "../InspectorState";
import InspectorActionType from "../InspectorActionType";

export const storeSection = "inspector";

export const reducer = (state: IInspectorState = defaultInspectorState, action: InspectorActions) => {
    switch (action.type) {
        case InspectorActionType.CHANGE_ATTRIBUTE_FILTER_QUERY:
            state = {
                ...state,
                attributeQuery: action.query
            };
    }
    return state;
}