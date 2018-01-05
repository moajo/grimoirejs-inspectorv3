export interface FrameInfo {
    frameId: string;
    frameURL: string;
    rootNodes: { [key: string]: RootNodeInfo }
}

export interface ScriptTagInfo {
    scriptTagId?: string;
    scriptTagClass?: string;
    scriptTagSrc?: string;
}

export interface RootNodeInfo {
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
