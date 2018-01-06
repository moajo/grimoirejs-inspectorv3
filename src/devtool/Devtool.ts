import { CHANNEL_NOTIFY_TAB_ID, CHANNEL_TAB_CONNECTION_ESTABLISHED, CONNECTION_BG_TO_DEV } from '../common/constants';
import { IConnection, IGateway } from '../common/Gateway';
import { postAndWaitReply } from '../common/Util';
import WaitingEstablishedGateway from '../common/WrapperGateway';

export async function connectToBackground<T extends IConnection>(gateway: IGateway<T>, tabId: number) {

  console.log("[dev] start")

  const connection = await (new WaitingEstablishedGateway(gateway)).connect(CONNECTION_BG_TO_DEV);

  connection.listen().subscribe(a => {
    console.log(`[dev]recieve: `, a.channel, a.payload,a.senderGatewayId)
  })
  await postAndWaitReply(connection, CHANNEL_NOTIFY_TAB_ID, tabId, CHANNEL_TAB_CONNECTION_ESTABLISHED);

  return connection;
}