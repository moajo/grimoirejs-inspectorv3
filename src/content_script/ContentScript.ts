import { IGateway, IConnection, redirect } from "../common/Gateway";
import { connectAndWaitEstablished } from "../common/Util";
import embed from "../embbed/Embedder";
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
    const background_connection = await background_gateway.connect(CONNECTION_CS_TO_BG);

    redirect(emb_connection, background_connection);
    background_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
    emb_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
}