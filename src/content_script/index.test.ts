import { EMBEDDING_SCRIPT_NAME } from '../common/constants';
import { WindowGateway } from '../common/Gateway';
import { contentScriptMain } from './ContentScript';

console.log("content script is up")
contentScriptMain(
    new WindowGateway("cs:emb"),
    new WindowGateway("cs:bg"),
    EMBEDDING_SCRIPT_NAME,
    123,// dummy
)