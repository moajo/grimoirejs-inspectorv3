import { IGateway, IConnection, redirect, WindowGateway } from "../common/Gateway";
// import { waitConnection, ConnectionInitialState, connect } from "../common/Util";
import embed from "../embbed/Embedder";
import { CHANNEL_CONNECTION_ESTABLISHED, CONNECTION_CS_TO_EMB, CONNECTION_CS_TO_BG, CONNECTION_CS_TO_IFRAME, CHANNEL_SELECT_TREE, CHANNEL_NOTIFY_FRAME_STRUCTURE, FrameStructure, CHANNEL_CONNECT_TO_FRAME, CHANNEL_FRAME_CONNECT_RESPONSE, CHANNEL_NOTIFY_TAB_ID, CHANNEL_TAB_CONNECTION_ESTABLISHED } from "../common/constants";
import { Observable } from "rxjs/Observable";
import { subscribeOn } from "rxjs/operator/subscribeOn";
import IWindowMessage from "grimoirejs/ref/Interface/IWindowMessage";
import { EVENT_SOURCE, EVENT_NOTIFY_LIBRARY_LOADING } from "grimoirejs/ref/Core/Constants";
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
declare function require(x: string): any;
const uuid = require("uuid/v4");
import { ISubscription, Subscription } from "rxjs/Subscription";
import { Children } from "react";
import WaitingEstablishedGateway from "../common/WrapperGateway";
import { postAndWaitReply } from "../common/Util";

type cnWQaitPair = {
    connection: any,
    wait: Promise<any>
}

export async function contentScriptMain<T extends IConnection, U extends IConnection>(
    emb_gateway: IGateway<T>,
    background_gateway: IGateway<U>,
    embeddingScriptUrl: string,
    tabId: number,
) {
    const currentFrameUUID = uuid() as string;
    //wait for child frame connection
    const frameStructure: FrameStructure = {
        uuid: currentFrameUUID,
        children: {},
    };
    const frameStructureObservable = new BehaviorSubject(frameStructure);
    const childFrameConnections = {} as { [key: string]: IConnection };
    const childFrameConnectionObservable =
        iframeConnectionGenerator(cn => {
            console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] iframe connection come in`)
            cn.open(CHANNEL_NOTIFY_FRAME_STRUCTURE).subscribe(structure => {
                frameStructure.children[structure.uuid] = structure;
                frameStructureObservable.next(frameStructure);
                childFrameConnections[structure.uuid] = cn;
            })
        }).shareReplay().subscribe();


    // wait gr signal and script embeddeing.
    const embConnectionSubject = new BehaviorSubject<IConnection | undefined>(undefined);
    grLoadingSignalObservable().first().subscribe(async () => {
        // emb and connect it to bg
        // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] detect gr`)
        const a = await connectToEmbeddedScript(new WaitingEstablishedGateway(emb_gateway), embeddingScriptUrl);
        embConnectionSubject.next(a);
        // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] emb complete`)
    });


    let embParentRedirection: ISubscription | undefined;

    const isIframe = (window !== window.parent);
    // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] connect to parent or bg`)
    const init = (cn: IConnection) => {
        let embSubscription: Subscription | undefined;
        const subscriber = async (frameUUID: string) => {
            // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] select frame request: ${frameUUID}`)
            if (embParentRedirection) {
                embParentRedirection.unsubscribe();
                embParentRedirection = undefined;
            }
            if (embSubscription) {
                embSubscription.unsubscribe()
                embSubscription = undefined;
            }
            if (currentFrameUUID === frameUUID) {
                // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] sfr is me`)
                embSubscription = embConnectionSubject.subscribe(embConnection => {
                    if (!embConnection) {
                        // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] sfr is me>emb ng`)
                        cn.post(CHANNEL_FRAME_CONNECT_RESPONSE, false);
                    } else {
                        // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] sfr is me>emb ok`)
                        embParentRedirection = redirect(embConnection, cn);
                        cn.post(CHANNEL_FRAME_CONNECT_RESPONSE, true);
                    }
                })
            } else {
                // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] sfr is child`)
                const childuuid = findFrame(frameStructure, frameUUID);
                const connection = childFrameConnections[childuuid];
                embParentRedirection = redirect(connection, cn);
                connection.post(CHANNEL_CONNECT_TO_FRAME, frameUUID);
            }
        };
        cn.open(CHANNEL_CONNECT_TO_FRAME).subscribe(subscriber);
        subscriber(currentFrameUUID);
    }
    const parentConnection: IConnection = isIframe ? await connectToParent(init) : await (new WaitingEstablishedGateway(background_gateway, init)).connect(CONNECTION_CS_TO_BG);

    await postAndWaitReply(parentConnection, CHANNEL_NOTIFY_TAB_ID, tabId, CHANNEL_TAB_CONNECTION_ESTABLISHED);







    // waiting connection
    // const emb_connection = await connectToEmbeddedScript(emb_gateway, embeddingScriptUrl);
    // const background_connection = await background_gateway.connect(CONNECTION_CS_TO_BG);

    // redirect(emb_connection, background_connection);
    // background_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
    // emb_connection.post(CHANNEL_CONNECTION_ESTABLISHED, "redirect completed!")
}

async function connectToParent(init: (cn: IConnection) => void) {
    const iframeGateway = new WindowGateway("iframe:cs");
    const wrap = new WaitingEstablishedGateway(iframeGateway, init)
    return await wrap.connect(CONNECTION_CS_TO_IFRAME.create(uuid()));
}

// function connectionGenerator<T extends IConnection>(gateway: IGateway<T>, connectionName: RegExp) {
//     return Observable.defer<ConnectionInitialState<T>>(() => waitConnection(gateway, connectionName)).repeat()
// }

function iframeConnectionGenerator(init: (cn: IConnection) => void) {
    const iframeGateway = new WindowGateway("cs:iframe");
    const wrap = new WaitingEstablishedGateway(iframeGateway);
    return wrap.standbyConnection(CONNECTION_CS_TO_IFRAME.regex, init);
}

function connectToEmbeddedScript<T extends IConnection>(emb_gateway: IGateway<T>, embeddingScriptUrl: string) {
    const embConnectionWaiting = emb_gateway.standbyConnection(CONNECTION_CS_TO_EMB);

    //embed script to page
    embed(embeddingScriptUrl)

    // waiting connection
    return embConnectionWaiting.first().toPromise();
}

function grLoadingSignalObservable() {
    return Observable.bindCallback((callback) => {
        const listener = (ev: MessageEvent) => {
            const msg = ev.data as IWindowMessage;
            if (msg.$source === "grimoirejs" && msg.$messageType === "library-loading") {
                window.removeEventListener("message", listener);
                callback();
            }
        }
        window.addEventListener("message", listener)
    })().shareReplay();
}


function findFrame(structure: FrameStructure, uuid: string) {
    for (const parentUUID in structure.children) {
        if (containFrame(structure.children[parentUUID], uuid)) {
            return parentUUID;
        }
    }
    throw new Error("frame not found")

    function containFrame(structure: FrameStructure, uuid: string) {
        for (const parentUUID in structure.children) {
            if (containFrame(structure.children[parentUUID], uuid)) {
                return true;
            }
        }
        return false;
    }
}
