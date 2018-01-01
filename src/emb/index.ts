import { WindowGateway } from "../common/Gateway";
import { CHANNEL_CONNECTION_ESTABLISHED, CONNECTION_CS_TO_EMB, CHANNEL_NOTIFY_GR_EXISTS } from "../common/constants";
import { notifyLibs } from "./EmbeddedScript";

async function main() {
    const gateway = new WindowGateway("page:cs");

    const connection = await gateway.connect(CONNECTION_CS_TO_EMB);

    const establishWaiter = connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();

    // connection.open("hoge2").subscribe(a => {
    //     console.log("##########", a)
    // })
    connection.post(CHANNEL_CONNECTION_ESTABLISHED, "emb is ready!");

    await establishWaiter;
    // connection.post("hoge", "@@aa")
    connection.post(CHANNEL_NOTIFY_GR_EXISTS, !!(window as any).gr);
    notifyLibs(connection);
}

main();