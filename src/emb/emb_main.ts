import { WindowGateway } from "../common/Gateway";
import { CHANNEL_CONNECTION_ESTABLISHED, CONNECTION_CS_TO_EMB } from "../common/constants";

async function main() {
    console.log("emb complite")

    // window.postMessage({
    //     a: `${(window as any).gr}`,
    //     name: "@@@"
    // }, "*");

    const gateway = new WindowGateway("page:cs");

    const connection = gateway.connect(CONNECTION_CS_TO_EMB);

    const establishWaiter = connection.open(CHANNEL_CONNECTION_ESTABLISHED).first().toPromise();

    connection.open("hoge2").subscribe(a => {
        console.log("##########", a)
    })
    connection.post(CHANNEL_CONNECTION_ESTABLISHED, "emb is ready!");

    await establishWaiter;
    connection.post("hoge", "@@aa")
}

main();