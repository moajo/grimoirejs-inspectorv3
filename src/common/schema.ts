export interface FrameInfo {
    frameId: string;
    frameURL: string;
    trees: { [key: string]: TreeInfo }
}

export interface ScriptTagInfo {
    scriptTagId?: string;
    scriptTagClass?: string;
    scriptTagSrc?: string;
}

export interface TreeInfo {
    scriptTag?: ScriptTagInfo;
    rootNodeId: string;
}

export interface NodeStructureInfo {
    uniqueId: string;
    fqn: string;
    children: NodeStructureInfo[];
    components: ComponentInfo[];
}

export interface GomlNodeInfo {
    fqn: string;
    uniqueId: string
    components: ComponentInfo[];
}

export interface ComponentInfo {
    uniqueId: string,
    fqn: string,
    attributes: { [attributeFQN: string]: AttributeInfo }
}

export interface AttributeInfo {
    fqn: string,
    converterFQN: string,
    obtainedValue: any,
    defaultValue: any,
    errorText: string,
    isLazy: boolean,
}
