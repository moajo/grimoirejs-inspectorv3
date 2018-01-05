import { WindowGateway } from "../common/Gateway";
import { CHANNEL_CONNECTION_ESTABLISHED, CONNECTION_CS_TO_EMB, CHANNEL_NOTIFY_GR_EXISTS, CHANNEL_PUT_FRAMES, CHANNEL_SELECT_TREE, CHANNEL_NOTIFY_TREE_STRUCTURE, CHANNEL_SELECT_NODE } from "../common/constants";
import { notifyLibs, notifyGrExists, notifyRootNodes } from "./EmbeddedScript";
import { GrimoireInterface } from "grimoirejs/ref/Tool/Types";
import { DEFAULT_NAMESPACE } from "grimoirejs/ref/Core/Constants";
import Namespace from "grimoirejs/ref/Core/Namespace";
import { convertToScriptTagInfo, FrameInfo, convertToNodeStructureInfo } from "../common/schema";

async function main() {
    const gateway = new WindowGateway("page:cs");

    const connection = await gateway.connect(CONNECTION_CS_TO_EMB);

    const establishWaiter = connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();

    // extract gr infomation.
    const gr = (window as any).GrimoireJS as GrimoireInterface;
    const frame = { // TODO iframe対応
        frameId: "main",
        frameURL: location.href,
        trees: {}
    } as FrameInfo;

    for (const key in gr.rootNodes) {
        const rootNode = gr.rootNodes[key];
        const tag = rootNode.companion.get("grimoirejs.scriptElement");
        const tagInfo = convertToScriptTagInfo(tag);
        frame.trees[rootNode.id] = {
            scriptTag: tagInfo,
            rootNodeId: rootNode.id,
        }
    }
    const frames: { [key: string]: FrameInfo } = { "main": frame }



    connection.open(CHANNEL_PUT_FRAMES).subscribe(a => {
        connection.post(CHANNEL_PUT_FRAMES, frame)
    });
    connection.open(CHANNEL_SELECT_TREE).subscribe(req => {
        const rootNode = gr.rootNodes[req.rootNodeId];
        const nodeStructure = convertToNodeStructureInfo(rootNode);
        connection.post(CHANNEL_NOTIFY_TREE_STRUCTURE, nodeStructure);
    })

    connection.open(CHANNEL_SELECT_NODE).subscribe(nodeSelector=>{
        nodeSelector.frameID
    })

    connection.post(CHANNEL_CONNECTION_ESTABLISHED, "emb is ready!");

    await establishWaiter;
    // connection is established here
}

main();