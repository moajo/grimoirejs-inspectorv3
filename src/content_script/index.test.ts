import { EMBEDDING_SCRIPT_NAME } from '../common/Constants';
import { WindowGateway } from '../common/Gateway';
import { contentScriptMain } from './ContentScript';

contentScriptMain(
    new WindowGateway("cs:emb"),
    new WindowGateway("cs:bg"),
    EMBEDDING_SCRIPT_NAME,
    123,// dummy
)