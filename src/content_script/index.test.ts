import { ConnectionGateway } from "../common/ConnectionGateway";
import { EMBEDDING_SCRIPT_PATH, CONNECTION_CS_TO_EMB, CONNECTION_CS_TO_BG, CHANNEL_CONNECTION_ESTABLISHED, EMBEDDING_SCRIPT_NAME } from "../common/constants";
import embed from "../embbed/Embedder";
import { WindowGateway, PortGateway, TabGateway, redirect, IGateway, IConnection } from "../common/Gateway";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { connectAndWaitEstablished } from "../common/Util";
import { contentScriptMain } from "./ContentScript";

console.log("content script is up")
contentScriptMain(
    new WindowGateway("cs:emb"),
    new WindowGateway("cs:bg"),
    EMBEDDING_SCRIPT_NAME
)