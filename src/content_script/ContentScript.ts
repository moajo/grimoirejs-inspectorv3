import { IGateway, IConnection, redirect } from "../common/Gateway";
import { connectAndWaitEstablished } from "../common/Util";
import embed from "../emb/Enbedder";
import { CHANNEL_CONNECTION_ESTABLISHED, CONNECTION_CS_TO_EMB, CONNECTION_CS_TO_BG } from "../common/constants";

type cnWQaitPair = {
    connection: any,
    wait: Promise<any>
}

export async function contentScriptMain<T extends IConnection, U extends IConnection>(
    emb_gateway: IGateway<T>,
    background_gateway: IGateway<U>,
    embeddingScriptUrl: string
) {

    const embConnectionWaiting = connectAndWaitEstablished(emb_gateway, CONNECTION_CS_TO_EMB);

    //embed script to page
    embed(embeddingScriptUrl)

    // waiting connection
    const emb_connection = await embConnectionWaiting;
    console.log("@@@emb is est")
    const background_connection = await background_gateway.connect(CONNECTION_CS_TO_BG);

    // const [emb_connection, background_connection] = await Promise.all([embConnectionWaiting, bgConnectionWaiting])

    console.log("both connection are established!")
    redirect(emb_connection, background_connection);
    background_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
    emb_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
}