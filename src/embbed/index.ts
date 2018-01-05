import { WindowGateway } from "../common/Gateway";
import { CHANNEL_CONNECTION_ESTABLISHED, CONNECTION_CS_TO_EMB, CHANNEL_NOTIFY_GR_EXISTS, CHANNEL_GET_FRAMES } from "../common/constants";
import { notifyLibs, notifyGrExists, notifyRootNodes } from "./EmbeddedScript";
import { GrimoireInterface } from "grimoirejs/ref/Tool/Types";
import { DEFAULT_NAMESPACE } from "grimoirejs/ref/Core/Constants";
import Namespace from "grimoirejs/ref/Core/Namespace";
import { convertToScriptTagInfo, FrameInfo } from "../common/schema";

async function main() {
    const gateway = new WindowGateway("page:cs");

    const connection = await gateway.connect(CONNECTION_CS_TO_EMB);

    const establishWaiter = connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();

    // connection.open("hoge2").subscribe(a => {
    //     console.log("##########", a)
    // })
    connection.post(CHANNEL_CONNECTION_ESTABLISHED, "emb is ready!");

    connection.open(CHANNEL_GET_FRAMES).subscribe(a => {
        const gr = ((window as any).gr as GrimoireInterface);

        const frame = {
            frameId: "main",
            frameURL: location.href,
            rootNodes: {}
        } as FrameInfo;

        for (const key in gr.rootNodes) {
            const rootNode = gr.rootNodes[key];
            const tag = rootNode.companion.get("grimoirejs.scriptElement");
            const tagInfo = convertToScriptTagInfo(tag);
            frame.rootNodes[rootNode.id] = {
                scriptTag: tagInfo,
                rootNodeId: rootNode.id,
            }
        }

        connection.post(CHANNEL_GET_FRAMES, frame)
    })

    await establishWaiter;
    // connection.post("hoge", "@@aa")
    const gr = notifyGrExists(connection);
    if (gr) {
        notifyLibs(connection, gr);
        notifyRootNodes(connection, gr);
    }

}

main();