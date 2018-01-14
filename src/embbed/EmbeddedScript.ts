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
    });
}