export interface ITreeSelectorState {
    openSelector: boolean;
}

export interface IHierarchyState {
    isOpen: { [key: string]: boolean };
}

export interface ITreeState {
    treeSelector: ITreeSelectorState;
    hierarchy: IHierarchyState;
}

export const DefaultTreeState: ITreeState = {
    treeSelector: {
        openSelector: false
    },
    hierarchy: {
        isOpen: {}
    }
};