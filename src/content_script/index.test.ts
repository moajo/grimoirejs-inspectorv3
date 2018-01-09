import { EMBEDDING_SCRIPT_NAME } from '../common/Constants';
import { WindowGateway } from '../common/Gateway';
import { ContentScriptAgent } from './ContentScript';

const cs = new ContentScriptAgent(
    123,// dummy
    new WindowGateway("cs:emb"),
    new WindowGateway("cs:bg"),
    EMBEDDING_SCRIPT_NAME,
)
cs.start();
