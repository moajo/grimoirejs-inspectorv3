import ConnectionManager from "../background/ConnectionManager";
import { PortGateway, IGateway, IConnection, TabGateway } from "../common/Gateway";
import { Observable } from "rxjs/Observable";
import { STANDBY_ID_BACKGROUND_FOR_DEV, CHANNEL_NOTIFY_PORT_ID, STANDBY_ID_CONTENT_SCRIPT_FOR_BACKGROUND, CHANNEL_CONNECTION_ESTABLISHED } from "../common/constants";

const dev_gateway = new PortGateway("bg:dev");

connectionConnector(dev_gateway);

async function connectionConnector(gateway: PortGateway) {
    for await (const connection of connectionGenerator(gateway, STANDBY_ID_BACKGROUND_FOR_DEV)) {
        const subscription = connection.getChannel(CHANNEL_NOTIFY_PORT_ID).subscribe(tab => {
            subscription.unsubscribe();
            console.log("タブ通知　is comein", tab)
            const cs_gateway = new TabGateway("bg:cs", tab as number);
            const cs_connection = cs_gateway.connect(STANDBY_ID_CONTENT_SCRIPT_FOR_BACKGROUND)
            cs_connection.getChannel("hoge").subscribe(a=>{
                console.log("come",a)
                cs_connection.post("hoge2",a)
            })
            cs_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "hellooooooo")
            

        })
    }
}

async function* connectionGenerator<T extends IConnection>(gateway: IGateway<T>, standbyId: string) {
    while (true) {
        yield await gateway.standbyConnection(standbyId);
    }
}
