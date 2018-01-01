type GatewayMessage = {
    senderGatewayId: string,
    payload: any
}

export class ConnectionGateway {
    public constructor(
        public id: string,
        public port: chrome.runtime.Port
    ) { }
    public postMessage(message: any): void {
        const gatewayMessage: GatewayMessage = {
            senderGatewayId: this.id,
            payload: message
        }
        this.port.postMessage(gatewayMessage)
    }
    public addListener(callback: (message: any, port: chrome.runtime.Port) => void) {
        const listener = (message: GatewayMessage, port: chrome.runtime.Port) => {
            if (message.senderGatewayId !== this.id) {
                callback(message.payload, port);
            }
        };
        this.port.onMessage.addListener(listener as any)
    }
}