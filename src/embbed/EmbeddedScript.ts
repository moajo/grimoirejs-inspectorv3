import Attribute from 'grimoirejs/ref/Core/Attribute';
import Component from 'grimoirejs/ref/Core/Component';
import { EVENT_TREE_DID_ADDED } from 'grimoirejs/ref/Core/Constants';
import GomlNode from 'grimoirejs/ref/Core/GomlNode';
import { GrimoireInterface } from 'grimoirejs/ref/Tool/Types';
import { AttributeInfo, ComponentInfo, NodeStructureInfo } from '../common/Schema';
import { IConnection } from '../common/Connection';

export function notifyRootNodes(connection: IConnection, gr: GrimoireInterface) {
    gr.on(EVENT_TREE_DID_ADDED, a => {
        const rootNode = a.rootNode;
        const ownerScriptTag = a.ownerScriptTag;
    })
}

function convertToNodeStructureInfo(node: GomlNode): NodeStructureInfo {
    const children = node.children.map(convertToNodeStructureInfo);
    return {
        fqn: node.name.fqn,
        children: children,
        uniqueId: node.id,
        components: node.getComponents<Component>().map(convertToComponentInfo),
    };
}

function convertToNodeInfo(node: GomlNode): NodeStructureInfo {
    return {
        fqn: node.name.fqn,
        uniqueId: node.id,
        components: node.getComponents<Component>().map(convertToComponentInfo),
        children: node.children.map(convertToNodeInfo),
    };
}
function convertToComponentInfo(component: Component): ComponentInfo {
    return {
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
        fqn: attribute.name.fqn,
        converterFQN: attribute.declaration.converter as any,// TODO
        obtainedValue: "",
        defaultValue: attribute.declaration.default,
        errorText: "",
        isLazy: false,
    }
}