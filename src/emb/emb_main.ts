import { WindowGateway } from "../common/Gateway";
import {CHANNEL_CONNECTION_ESTABLISHED, STANDBY_ID_CONTENT_SCRIPT_FOR_PAGE } from "../common/constants";


console.log("emb complite")

// window.postMessage({
//     a: `${(window as any).gr}`,
//     name: "@@@"
// }, "*");

const gateway = new WindowGateway("page:cs");

const connection = gateway.connect(STANDBY_ID_CONTENT_SCRIPT_FOR_PAGE);

connection.getChannel("hoge2").subscribe(a=>{
    console.log("##########",a)
})
connection.post(CHANNEL_CONNECTION_ESTABLISHED, "ping from emb");
