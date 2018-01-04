import { defaultIfEmpty } from 'rxjs/operators/defaultIfEmpty';
import { IConnection } from "../common/Gateway";
import { CHANNEL_NOTIFY_GR_EXISTS, CHANNEL_NOTIFY_GR_LIBS, CHANNEL_NOTIFY_ROOT_NODES } from "../common/constants";
import { GrimoireInterface } from "grimoirejs/ref/Tool/Types";
import GomlNode from "grimoirejs/ref/Core/GomlNode";
import Component from "grimoirejs/ref/Core/Component";
import Attribute from "grimoirejs/ref/Core/Attribute";
import { EVENT_ROOT_NODE_DID_ADDED } from "grimoirejs/ref/Core/Constants";

export function notifyGrExists(connection: IConnection): GrimoireInterface | null {
    const gr = (window as any).GrimoireJS;
    if (gr) {
        connection.post(CHANNEL_NOTIFY_GR_EXISTS, true);
        return gr
    }
    connection.post(CHANNEL_NOTIFY_GR_EXISTS, false);
    return null
}

export function notifyLibs(connection: IConnection, gr: GrimoireInterface) {
    const libs = []
    for (const key in gr.lib) {
        libs.push(key);
    }
    connection.post(CHANNEL_NOTIFY_GR_LIBS, libs);
}

export function notifyRootNodes(connection: IConnection, gr: GrimoireInterface) {
    gr.on(EVENT_ROOT_NODE_DID_ADDED, a => {
        const rootNode = a.rootNode;
        const ownerScriptTag = a.ownerScriptTag;
        connection.post(CHANNEL_NOTIFY_ROOT_NODES, a);
    })

}

interface NodeStructureInfo {
    nodeFQN: string;
    children: NodeStructureInfo[];
    id: string;
}

interface GomlNodeInfo {
    fqn: string;
    id: string
    components: ComponentInfo[];
}
interface ComponentInfo {
    id: string,
    fqn: string,
    attributes: { [attributeFQN: string]: AttributeInfo }
}
interface AttributeInfo {
    fqn: string,
    converterFQN: string,
    obtainedValue: any,
    defaultValue: any,
    errorText: string
}
function convertToNodeStructureInfo(node: GomlNode): NodeStructureInfo {
    const children = node.children.map(convertToNodeStructureInfo);
    return {
        nodeFQN: node.name.fqn,
        children: children,
        id: node.id,
    };
}

function convertToNodeInfo(node: GomlNode): GomlNodeInfo {
    return {
        fqn: node.name.fqn,
        id: node.id,
        components: node.getComponents<Component>().map(convertToComponentInfo)
    };
}
function convertToComponentInfo(component: Component): ComponentInfo {
    return {
        fqn: component.name.fqn,
        id: component.id,
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
        errorText: ""
    }
}