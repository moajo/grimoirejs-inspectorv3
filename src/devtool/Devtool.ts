import { CHANNEL_NOTIFY_TAB_ID, CHANNEL_TAB_CONNECTION_ESTABLISHED, CONNECTION_BG_TO_DEV } from '../common/constants';
import { IGateway } from '../common/Gateway';
import { postAndWaitReply } from '../common/Util';
import { IConnection } from '../common/Connection';

export async function connectToBackground<T extends IConnection>(gateway: IGateway<T>, tabId: number) {

  console.log("[dev] start")

  const connection = (await gateway.connect(CONNECTION_BG_TO_DEV)).startWith(cn => {
    cn.toObservable().subscribe(a => {
      console.log(`[dev]recieve: `, a.channel, a.payload, a.senderGatewayId)
    })
    return cn
  });


  await postAndWaitReply(connection, CHANNEL_NOTIFY_TAB_ID, tabId, CHANNEL_TAB_CONNECTION_ESTABLISHED);

  return connection;
}