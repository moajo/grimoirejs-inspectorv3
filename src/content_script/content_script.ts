import { ConnectionGateway } from "../common/ConnectionGateway";
import { EMBEDDING_SCRIPT_PATH, STANDBY_ID_CONTENT_SCRIPT_FOR_PAGE, STANDBY_ID_CONTENT_SCRIPT_FOR_BACKGROUND, CHANNEL_CONNECTION_ESTABLISHED } from "../common/constants";
import embed from "../emb/Enbedder";
import { WindowGateway, PortGateway, TabGateway } from "../common/Gateway";


// console.log("this aaaa")
// window.addEventListener("message", (e: any) => { // TODO インスペクタ閉じたらremove
//     console.log(e);
// });
main();

async function main() {

    // start waiting page connection
    const page_gateway = new WindowGateway("cs:page");
    const connectionWaiting = page_gateway.standbyConnection(STANDBY_ID_CONTENT_SCRIPT_FOR_PAGE);

    //embed script to page
    embed(EMBEDDING_SCRIPT_PATH)

    // waiting connection
    const cs_page_connection = await connectionWaiting;
    const cs_connection_established = cs_page_connection.getChannel(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();

    // waiting background connection
    const background_gateway = new PortGateway("cs:bg");
    const sc_background_connection = await background_gateway.standbyConnection(STANDBY_ID_CONTENT_SCRIPT_FOR_BACKGROUND);
    const bg_connection_established = sc_background_connection.getChannel(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();

    await Promise.all([
        cs_connection_established,
        bg_connection_established
    ]);

    console.log("both connection are established!")
    //TODO２つのコネクションをつなぐ
    cs_page_connection.redirect(sc_background_connection)
    sc_background_connection.post("hoge","hellopp")



    // chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
    //     console.debug("dev: connection established!")
    //     const gateway = new ConnectionGateway("content_script", port);
    //     gateway.addListener(function (m) {
    //         console.log(m)
    //         gateway.postMessage("replyhello?")

    //         // setTimeout(()=>{
    //         //     console.log("emb !!!")
    //         //     emb()
    //         // },1000)


    //         // const gr = (window as any).GrimoireJS

    //         // if(gr){
    //         //     gateway.postMessage("grimoire is found!")

    //         // }else{
    //         //     gateway.postMessage("grimoire is not found");
    //         // }
    //     })

    //     window.addEventListener("message", function (event) {
    //         // We only accept messages from ourselves
    //         if (event.source != window)
    //             return;

    //         if (event.data.type && (event.data.type == "FROM_PAGE")) {
    //             console.log("Content script received: " + event.data.text);
    //             port.postMessage(event.data.text);
    //         }
    //     }, false);
    // })

}