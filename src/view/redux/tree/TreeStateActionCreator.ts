import TreeStateActionType from "./TreeStateActionType";

export function changeNodeExpandState(nodeId: string, isOpen: boolean) {
    return {
        type: TreeStateActionType.CHANGE_NODE_EXPAND,
        isOpen,
        nodeId
    };
}