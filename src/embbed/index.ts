import { GrimoireInterface } from 'grimoirejs/ref/Tool/Types';

import {
    CHANNEL_CONNECTION_ESTABLISHED,
    CHANNEL_NOTIFY_TREE_STRUCTURE,
    CHANNEL_PUT_FRAMES,
    CHANNEL_SELECT_NODE,
    CHANNEL_SELECT_TREE,
    CONNECTION_CS_TO_EMB,
    FrameStructure,
    CHANNEL_NOTIFY_ROOT_NODES,
    CHANNEL_NOTIFY_ROOT_NODES_RESPONSE,
} from '../common/constants';
import { WindowGateway } from '../common/Gateway';
import { convertToNodeStructureInfo, convertToScriptTagInfo } from '../common/schema';
import WaitingEstablishedGateway from '../common/WrapperGateway';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

async function main() {
    const treesSubject = new BehaviorSubject<FrameStructure["trees"]>({});


    // extract gr infomation.
    const gr = (window as any).GrimoireJS as GrimoireInterface;

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

    const wrapper = new WaitingEstablishedGateway(gateway, connection => {
        connection.open(CHANNEL_NOTIFY_ROOT_NODES).subscribe(async () => {
            const currentTrees = await treesSubject.first().toPromise();
            connection.post(CHANNEL_NOTIFY_ROOT_NODES_RESPONSE, currentTrees);
        });
        // connection.open(CHANNEL_PUT_FRAMES).subscribe(a => {
        //     console.log(`[emb] CHANNEL_PUT_FRAMES: frame is `,frame)
        //     connection.post(CHANNEL_PUT_FRAMES, frame)
        // });
        connection.open(CHANNEL_SELECT_TREE).subscribe(req => {
            const rootNode = gr.rootNodes[req.rootNodeId];
            const nodeStructure = convertToNodeStructureInfo(rootNode);
            connection.post(CHANNEL_NOTIFY_TREE_STRUCTURE, nodeStructure);
        })

        connection.open(CHANNEL_SELECT_NODE).subscribe(nodeSelector => {
            nodeSelector.frameID
        })
    })

    const connection = await wrapper.connect(CONNECTION_CS_TO_EMB);

    treesSubject.subscribe(a => {
        connection.post(CHANNEL_NOTIFY_ROOT_NODES_RESPONSE, a);
    })
}

main();