import { IGateway, IConnection } from "../common/Gateway";
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_GR_EXISTS, CHANNEL_NOTIFY_GR_LIBS, CHANNEL_NOTIFY_ROOT_NODES, CHANNEL_NOTIFY_TAB_ID, CHANNEL_TAB_CONNECTION_ESTABLISHED, CHANNEL_FRAME_CONNECT_RESPONSE } from "../common/constants";
import WaitingEstablishedGateway from "../common/WrapperGateway";
import { postAndWaitReply } from "../common/Util";

export async function connectToBackground<T extends IConnection>(gateway: IGateway<T>, tabId: number) {

  console.log("[dev] start")

  const connection = await (new WaitingEstablishedGateway(gateway)).connect(CONNECTION_BG_TO_DEV);

  connection.listen().subscribe(a => {
    console.log(`[dev]recieve: `, a.channel, a.payload)
  })
  await postAndWaitReply(connection, CHANNEL_NOTIFY_TAB_ID, tabId, CHANNEL_TAB_CONNECTION_ESTABLISHED);

  return connection;
}