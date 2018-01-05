export interface ITreeSelectorState {
    openSelector: boolean;
}

export interface ITreeState {
    treeSelector: ITreeSelectorState;
}

export const DefaultTreeState: ITreeState = {
    treeSelector: {
        openSelector: false
    }
};