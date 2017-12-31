import { ConnectionGateway } from "../common/ConnectionGateway";
import { EMBEDDING_SCRIPT_PATH, CONNECTION_CS_TO_EMB, CONNECTION_CS_TO_BG, CHANNEL_CONNECTION_ESTABLISHED } from "../common/constants";
import embed from "../emb/Enbedder";
import { WindowGateway, PortGateway, TabGateway, redirect, IGateway, IConnection } from "../common/Gateway";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { connectAndWaitEstablished } from "../common/Util";

main();

type cnWQaitPair = {
    connection: any,
    wait: Promise<any>
}

async function main() {

    // start waiting page connection
    const emb_gateway = new WindowGateway("cs:emb");
    const background_gateway = new PortGateway("cs:bg");

    const embConnectionWaiting = connectAndWaitEstablished(emb_gateway, CONNECTION_CS_TO_EMB);
    const bgConnectionWaiting = connectAndWaitEstablished(background_gateway, CONNECTION_CS_TO_BG);

    //embed script to page
    embed(EMBEDDING_SCRIPT_PATH)

    // waiting connection
    const [emb_connection, background_connection] = await Promise.all([embConnectionWaiting, bgConnectionWaiting])

    console.log("both connection are established!")
    redirect(emb_connection, background_connection);
    background_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
    emb_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
}