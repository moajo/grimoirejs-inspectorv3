import { Observable } from 'rxjs/Rx';
import { WindowGateway, PortGateway } from "../common/Gateway";
import { EMBEDDING_SCRIPT_PATH } from "../common/Constants";
import { ContentScriptAgent } from './ContentScript';



async function main() {
    const tabId = await new Promise<number>(resolve => {
        chrome.runtime.sendMessage("tabid", resolve);
    });

    const cs = new ContentScriptAgent(
        tabId,
        new WindowGateway("cs:emb"),
        new WindowGateway("cs:bg"),
        chrome.runtime.getURL(EMBEDDING_SCRIPT_PATH),
    )
    cs.start();
}