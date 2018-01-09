import { WindowGateway } from "../common/Gateway";
import { connectionConnector } from "./Background";

const dev_gateway = new WindowGateway("bg:dev");
const cs_gateway = new WindowGateway("bg:cs");

connectionConnector(dev_gateway, cs_gateway);