import { GrimoireInterface } from 'grimoirejs/ref/Tool/Types';

import {
    CHANNEL_CONNECTION_ESTABLISHED,
    CHANNEL_NOTIFY_TREE_STRUCTURE,
    CHANNEL_PUT_FRAMES,
    CHANNEL_SELECT_NODE,
    CHANNEL_SELECT_TREE,
    CONNECTION_CS_TO_EMB,
    FrameStructure,
} from '../common/constants';
import { WindowGateway } from '../common/Gateway';
import { convertToNodeStructureInfo, convertToScriptTagInfo } from '../common/schema';
import WaitingEstablishedGateway from '../common/WrapperGateway';

async function main() {
    const gateway = new WindowGateway("page:cs");

    const wrapper = new WaitingEstablishedGateway(gateway, connection => {
        // extract gr infomation.
        const gr = (window as any).GrimoireJS as GrimoireInterface;
        const frame = { // TODO iframe対応
            uuid: "main",
            url: location.href,
            trees: {},
        } as FrameStructure;

        for (const key in gr.rootNodes) {
            const rootNode = gr.rootNodes[key];
            const tag = rootNode.companion.get("grimoirejs.scriptElement");
            const tagInfo = convertToScriptTagInfo(tag);
            frame.trees[rootNode.id] = {
                scriptTag: tagInfo,
                rootNodeId: rootNode.id,
            }
        }
        const frames: { [key: string]: FrameStructure } = { "main": frame }



        connection.open(CHANNEL_PUT_FRAMES).subscribe(a => {
            console.log(`[emb] CHANNEL_PUT_FRAMES: frame is `,frame)
            connection.post(CHANNEL_PUT_FRAMES, frame)
        });
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

    // const establishWaiter = connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();



    // await establishWaiter;
    // connection is established here
}

main();