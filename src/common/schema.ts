import GomlNode from "grimoirejs/ref/Core/GomlNode";
import ComponentDeclaration from "grimoirejs/ref/Core/ComponentDeclaration";
import Component from "grimoirejs/ref/Core/Component";
import Attribute from "grimoirejs/ref/Core/Attribute";

export interface FrameInfo {
    frameId: string;
    frameURL: string;
    trees: { [key: string]: TreeInfo };
    plugins: string[];
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

export function convertToScriptTagInfo(tag: Element): ScriptTagInfo {
    const id = tag.getAttribute("id");
    const className = tag.getAttribute("class");
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

export function convertToComponentInfo(component: Component): ComponentInfo {
    return {
        uniqueId: component.id,
        fqn: component.name.fqn,
        attributes: component.attributes.toArray().reduce((obj, attr) => {
            obj[attr.name.fqn] = convertToAttributeInfo(attr);
            return obj;
        }, {} as { [attributeFQN: string]: AttributeInfo }),
    }
}


export function convertToAttributeInfo(attribute:Attribute):AttributeInfo{
    // return {
    //     fqn: attribute.name.fqn,
    //     converterFQN: attribute.converter.name,
    //     obtainedValue: any,
    //     defaultValue: any,
    //     errorText: string,
    //     isLazy: boolean,
    // } // return {
    //     fqn: attribute.name.fqn,
    //     converterFQN: attribute.converter.name,
    //     obtainedValue: any,
    //     defaultValue: any,
    //     errorText: string,
    //     isLazy: boolean,
    // }
    return {} as any;
}