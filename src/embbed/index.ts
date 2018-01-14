import { GrimoireInterface } from 'grimoirejs/ref/Tool/Types';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {
    CHANNEL_NOTIFY_ROOT_NODES,
    CHANNEL_NOTIFY_ROOT_NODES_RESPONSE,
    CHANNEL_NOTIFY_TREE_STRUCTURE,
    CHANNEL_SELECT_NODE,
    CHANNEL_SELECT_TREE,
    CONNECTION_CS_TO_EMB,
} from '../common/Constants';
import { WindowGateway } from '../common/Gateway';
import { convertToNodeStructureInfo, convertToScriptTagInfo, FrameStructure } from '../common/Schema';

async function main(gr: GrimoireInterface) {
    const treesSubject = new BehaviorSubject<FrameStructure["trees"]>({});

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
            nodeSelector.frameUUID
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

