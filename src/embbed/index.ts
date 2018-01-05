import { WindowGateway } from "../common/Gateway";
import { CHANNEL_CONNECTION_ESTABLISHED, CONNECTION_CS_TO_EMB, CHANNEL_NOTIFY_GR_EXISTS, CHANNEL_GET_FRAMES } from "../common/constants";
import { notifyLibs, notifyGrExists, notifyRootNodes } from "./EmbeddedScript";

async function main() {
    const gateway = new WindowGateway("page:cs");

    const connection = await gateway.connect(CONNECTION_CS_TO_EMB);

    const establishWaiter = connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();

    // connection.open("hoge2").subscribe(a => {
    //     console.log("##########", a)
    // })
    connection.post(CHANNEL_CONNECTION_ESTABLISHED, "emb is ready!");

    connection.open(CHANNEL_GET_FRAMES).subscribe(a=>{
        connection.post(CHANNEL_GET_FRAMES,"hogehogeho")
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