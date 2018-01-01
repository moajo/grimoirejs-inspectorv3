import { contentScriptMain } from "./ContentScript";
import { WindowGateway, PortGateway } from "../common/Gateway";
import { EMBEDDING_SCRIPT_PATH } from "../common/constants";

contentScriptMain(
    new WindowGateway("cs:emb"),
    new PortGateway("cs:bg"),
    chrome.runtime.getURL(EMBEDDING_SCRIPT_PATH)
)