import GomlNode from "grimoirejs/ref/Core/GomlNode";
import ComponentDeclaration from "grimoirejs/ref/Core/ComponentDeclaration";
import Component from "grimoirejs/ref/Core/Component";
import Attribute from "grimoirejs/ref/Core/Attribute";
import * as _ from "lodash";

export type MetaInfo = {
    tabId: number,
    extensionId: string
};

export type NodeSelector = {
    frameUUID: string,
    nodeID: string,
};

export type FrameStructure = {
    UUID: string,
    url: string,
    frameID?: string,
    frameClass?: string,
    children: {
        [key: string]: FrameStructure,
    },
    trees: { [key: string]: TreeInfo },
    plugins: string[],
}

export interface ScriptTagInfo {
    scriptTagId?: string;
    scriptTagClass?: string[];
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

export interface ComponentInfo {
    nodeID: string,
    uniqueId: string,
    fqn: string,
    enabled: boolean;
    attributes: { [attributeFQN: string]: AttributeInfo }
}

export interface AttributeInfo {
    nodeID: string,
    componentID: string,
    fqn: string,
    converterFQN: string,
    obtainedValue: any,
    defaultValue: any,
    errorText: string,
    isLazy: boolean,
}

export function convertToScriptTagInfo(tag: Element): ScriptTagInfo {
    const id = tag.getAttribute("id");
    const className = _.toArray(tag.classList);
    const src = tag.getAttribute("src");
    return {
        scriptTagId: id ? id : undefined,
        scriptTagClass: className ? className : undefined,
        scriptTagSrc: src ? src : undefined
    }
}

export function convertToNodeStructureInfo(node: GomlNode): NodeStructureInfo {
    return {
        uniqueId: node.id,
        fqn: node.name.fqn,
        children: node.children.map(convertToNodeStructureInfo),
        components: node.getComponents<Component>().map(convertToComponentInfo),
    }
}



function convertToComponentInfo(component: Component): ComponentInfo {
    return {
        nodeID: component.node.id,
        fqn: component.name.fqn,
        uniqueId: component.id,
        enabled: component.enabled,
        attributes: component.attributes.toArray().reduce((obj, attribute) => {
            obj[attribute.name.fqn] = convertToAttributeInfo(attribute);
            return obj;
        }, {} as { [attributeFQN: string]: AttributeInfo })
    }
}

function convertToAttributeInfo(attribute: Attribute): AttributeInfo {
    return {
        nodeID: attribute.component.node.id,
        componentID: attribute.component.id,
        fqn: attribute.name.fqn,
        converterFQN: "not implement yet",// TODO
        obtainedValue: "not implement",
        defaultValue: "not implement yet",
        errorText: "not implement",
        isLazy: false,
    }
}