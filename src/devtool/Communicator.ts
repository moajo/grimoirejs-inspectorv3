import { IGateway, IConnection } from "../common/Gateway";
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED } from "../common/constants";
import { waitConnectionEstablished } from "../common/Util";


// export async function injectContentScript(path:string){
//     return new Promise(resolve=>{
//         chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
//             file: path
//           }, () => {
//               resolve()
//           });
//     });
// }

export async function connectToBackground<T extends IConnection>(gateway: IGateway<T>, tabId: number) {
  const connection = await gateway.connect(CONNECTION_BG_TO_DEV.create(tabId));

  //TODO Grimoireチャンネルをタブ通知する。

  connection.open("hoge").subscribe((a: any) => {
    connection.post("hoge2", a + a)
  })

  const establishWaiter = waitConnectionEstablished(connection);
  connection.post(CHANNEL_CONNECTION_ESTABLISHED, "dev is ready!");
  console.log("dev:connect to bg:2")
  const msg = await establishWaiter;
  console.log("bg is ready:", msg);
  connection.post("hoge2", "hogehoge")
}