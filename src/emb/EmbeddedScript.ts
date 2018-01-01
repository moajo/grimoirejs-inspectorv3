import { IConnection } from "../common/Gateway";
import { CHANNEL_NOTIFY_GR_EXISTS, CHANNEL_NOTIFY_GR_LIBS } from "../common/constants";

export function notifyLibs(connection: IConnection) {
    const gr = (window as any).gr;
    const libs = []
    for (const key in gr.lib) {
        libs.push(key);
    }
    connection.post(CHANNEL_NOTIFY_GR_LIBS, libs);
}