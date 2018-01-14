import { GrimoireInterface } from 'grimoirejs/ref/Tool/Types';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {
    CHANNEL_NOTIFY_ROOT_NODES,
    CHANNEL_NOTIFY_ROOT_NODES_RESPONSE,
    CHANNEL_NOTIFY_TREE_STRUCTURE,
    CHANNEL_SELECT_NODE,
    CHANNEL_SELECT_TREE,
    CONNECTION_CS_TO_EMB,
    CHANNEL_NOTIFY_ATTRIBUTE_CHANGE,
} from '../common/Constants';
import { WindowGateway } from '../common/Gateway';
import { convertToNodeStructureInfo, convertToScriptTagInfo, FrameStructure, convertToAttributeInfo } from '../common/Schema';
import Component from 'grimoirejs/ref/Core/Component';
import Attribute from 'grimoirejs/ref/Core/Attribute';
import GomlNode from 'grimoirejs/ref/Core/GomlNode';
import { isNotNullOrUndefined } from '../common/Util';

async function main(gr: GrimoireInterface) {
    const treesSubject = new BehaviorSubject<FrameStructure["trees"]>({});

    const attributeWatchSubject = new BehaviorSubject<{
        node: GomlNode,
        watcher: (newValue: any, oldValue: any, attr: Attribute) => void
    } | undefined>(undefined);

    attributeWatchSubject.bufferCount(2).map(it => it[0]).filter(isNotNullOrUndefined).subscribe(old => {
        old.node.getComponents<Component>().forEach(c => {
            c.attributes.toArray().forEach(a => {
                a.unwatch(old.watcher);
            });
        });
    });

    const trees = {} as FrameStructure["trees"];
    for (const key in gr.rootNodes) {
        const rootNode = gr.rootNodes[key];
        const tag = rootNode.companion.get("grimoirejs.scriptElement");
        const tagInfo = convertToScriptTagInfo(tag);
        treesSubject
        trees[rootNode.id] = {
            scriptTag: tagInfo,
            rootNodeId: rootNode.id,
        }
    }
    treesSubject.next(trees);

    const gateway = new WindowGateway("page:cs");

    const connection = (await gateway.connect(CONNECTION_CS_TO_EMB)).startWith(connection => {
        connection.subscribe(a => {
            //debug 
            console.log("@[emb]recieved:", a.channel, a.payload)
        })
        connection.open(CHANNEL_NOTIFY_ROOT_NODES)
            .map(() => treesSubject.getValue())
            .subscribe(connection.open(CHANNEL_NOTIFY_ROOT_NODES_RESPONSE));

        connection.open(CHANNEL_SELECT_TREE).subscribe(req => {
            const rootNode = gr.rootNodes[req.rootNodeId];
            const nodeStructure = convertToNodeStructureInfo(rootNode);
            connection.post(CHANNEL_NOTIFY_TREE_STRUCTURE, nodeStructure);
        })

        connection.open(CHANNEL_SELECT_NODE).subscribe(nodeSelector => {
            console.log(nodeSelector)
            const node = gr.nodeDictionary[nodeSelector.nodeID]
            if (!node) {
                throw new Error(`node not found. id: ${nodeSelector.nodeID}`);
            }
            const watcher = (newValue: any, oldValue: any, attr: Attribute) => {
                connection.post(CHANNEL_NOTIFY_ATTRIBUTE_CHANGE, convertToAttributeInfo(attr))
            }
            node.getComponents<Component>().forEach(c => {
                c.attributes.toArray().forEach(a => {
                    a.watch(watcher);
                })
            })
            attributeWatchSubject.next({
                node,
                watcher
            });
        });
        return connection;
    });

    treesSubject.subscribe(a => {
        connection.post(CHANNEL_NOTIFY_ROOT_NODES_RESPONSE, a);
    })
}


const gr = (window as any).GrimoireJS as GrimoireInterface;
gr(() => {
    main(gr);
});

