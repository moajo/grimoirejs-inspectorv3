import InspectorActionType from "./InspectorActionType";

export const changeAttributeFilterQuery = (query: string) => ({
    type: InspectorActionType.CHANGE_ATTRIBUTE_FILTER_QUERY,
    query
});