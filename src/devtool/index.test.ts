import { createView } from "./View";
import { connectToBackground } from "./Devtool";
import { CONTENT_SCRIPT_PATH, REQUEST_NOTIFY_METAINFO, MetaInfo } from "../common/constants";
import { PortGateway, WindowGateway } from "../common/Gateway";

(async () => {
    createView();
    const gateway = new WindowGateway("dev");
    await connectToBackground(gateway, 12345);//dummy tab id
})();