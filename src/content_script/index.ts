import { Observable } from 'rxjs/Rx';
import { contentScriptMain } from "./ContentScript";
import { WindowGateway, PortGateway } from "../common/Gateway";
import { EMBEDDING_SCRIPT_PATH } from "../common/Constants";



async function main() {
    const tabId = await new Promise<number>(resolve => {
        chrome.runtime.sendMessage("tabid", resolve);
    });

    contentScriptMain(
        new WindowGateway("cs:emb"),
        new PortGateway("cs:bg"),
        chrome.runtime.getURL(EMBEDDING_SCRIPT_PATH),
        tabId,
    )
}