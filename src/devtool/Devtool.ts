import { IGateway, IConnection } from "../common/Gateway";
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_GR_EXISTS, CHANNEL_NOTIFY_GR_LIBS } from "../common/constants";
import { waitConnectionEstablished } from "../common/Util";

export async function connectToBackground<T extends IConnection>(gateway: IGateway<T>, tabId: number) {
  const connection = await gateway.connect(CONNECTION_BG_TO_DEV.create(tabId));

  // connection.open("hoge").subscribe((a: any) => {
  //   connection.post("hoge2", a + a)
  // })
  connection.open(CHANNEL_NOTIFY_GR_EXISTS).shareReplay(1).subscribe(exist=>{
    if(exist){
      console.log("@@@yes")
    }else{
      console.log("@@@no")
    }
  });

  connection.open(CHANNEL_NOTIFY_GR_LIBS).subscribe(libs=>{
    console.log("@libs,libs",libs)
  })

  const establishWaiter = waitConnectionEstablished(connection);
  connection.post(CHANNEL_CONNECTION_ESTABLISHED, "dev is ready!");
  // console.log("dev:connect to bg:2")
  const msg = await establishWaiter;
  // console.log("bg is ready:", msg);
  // connection.post("hoge2", "hogehoge")
}