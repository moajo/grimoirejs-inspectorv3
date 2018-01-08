import IWindowMessage from 'grimoirejs/ref/Interface/IWindowMessage';
import { Children } from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from 'rxjs/Subscription';

import {
    CHANNEL_CONNECT_TO_FRAME,
    CHANNEL_FRAME_CONNECT_RESPONSE,
    CHANNEL_NOTIFY_FRAME_STRUCTURE,
    CHANNEL_NOTIFY_TAB_ID,
    CHANNEL_PUT_FRAMES,
    CHANNEL_SELECT_TREE,
    CHANNEL_TAB_CONNECTION_ESTABLISHED,
    CONNECTION_CS_TO_BG,
    CONNECTION_CS_TO_EMB,
    CONNECTION_CS_TO_IFRAME,
    FrameStructure,
    CHANNEL_NOTIFY_ROOT_NODES_RESPONSE,
} from '../common/constants';
import { IConnection, IGateway, redirect, WindowGateway } from '../common/Gateway';
import { isNotNullOrUndefined, postAndWaitReply } from '../common/Util';
import WaitingEstablishedGateway from '../common/WrapperGateway';
import embed from '../embbed/Embedder';
import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';
import { Observer } from 'rxjs/Observer';

declare function require(x: string): any;
const uuid = require("uuid/v4");


export async function contentScriptMain<T extends IConnection, U extends IConnection>(
    emb_gateway: IGateway<T>,
    background_gateway: IGateway<U>,
    embeddingScriptUrl: string,
    tabId: number,
) {

    const isIframe = (window !== window.parent);
    const currentFrameUUID = uuid() as string;

    const frameStructureSubject = new BehaviorSubject<FrameStructure>({
        uuid: currentFrameUUID,
        url: location.href,
        children: {},
        trees: {},
        plugins: []
    });
    const parentConnectionSubject = new BehaviorSubject<undefined | IConnection>(undefined);
    const subscriptionSubject = new BehaviorSubject<undefined | Subscription>(undefined);
    const embConnectionSubject = new BehaviorSubject<IConnection | undefined>(undefined);

    autoUnsubscribe(subscriptionSubject);

    subscribeEmbConnection(embConnectionSubject, frameStructureSubject);

    // on update parent connection, it subscribe frame structure.
    parentConnectionSubject.subscribe(connection => {
        if (connection) {
            const subscription = frameStructureSubject.subscribe(info => {
                if (!isIframe) {
                    connection.post(CHANNEL_PUT_FRAMES, info);
                } else {
                    connection.post(CHANNEL_NOTIFY_FRAME_STRUCTURE, info);
                }
            });
            subscriptionSubject.next(subscription);
        } else {
            subscriptionSubject.next(undefined);
        }
    })

    //wait for child frame connection
    const childFrameConnections = {} as { [key: string]: IConnection };
    const iframeGateway = new WaitingEstablishedGateway(new WindowGateway("cs:iframe"));
    const childFrameConnectionObservable =
        iframeGateway.standbyConnection(CONNECTION_CS_TO_IFRAME).shareReplay().subscribe(cn => {
            // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] iframe connection come in`)
            cn.open(CHANNEL_NOTIFY_FRAME_STRUCTURE).subscribe(structure => {
                // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] iframe str update`)
                const newValue = {
                    ...frameStructureSubject.getValue(),
                }
                newValue.children[structure.uuid] = structure;
                frameStructureSubject.next(newValue);
                childFrameConnections[structure.uuid] = cn;
            });
        });


    // wait gr signal and script embeddeing.
    grLoadingSignalObservable().first().subscribe(async () => {
        const a = await connectToEmbeddedScript(new WaitingEstablishedGateway(emb_gateway), embeddingScriptUrl);
        embConnectionSubject.next(a);
    });

    // frameIDがくる。そのフレームとコネクトする。
    const reconnectFrameRequestStream = new BehaviorSubject<string>(currentFrameUUID);

    let embParentRedirection = new BehaviorSubject<ISubscription | undefined>(undefined);
    embParentRedirection.zip(embParentRedirection.skip(1)).map(tuple => tuple[0]).filter(isNotNullOrUndefined).subscribe(prev => {
        prev.unsubscribe();
    })

    Observable.combineLatest(reconnectFrameRequestStream, embConnectionSubject, parentConnectionSubject.filter(isNotNullOrUndefined)).subscribe(triple => {
        const [frameUUID, embConnection, parentConnection] = triple;
        if (currentFrameUUID === frameUUID) {
            if (!embConnection) {
                parentConnection.post(CHANNEL_FRAME_CONNECT_RESPONSE, false);
            } else {
                embParentRedirection.next(redirect(embConnection, parentConnection, true));
                parentConnection.post(CHANNEL_FRAME_CONNECT_RESPONSE, true);
            }
        } else {
            const connection = childFrameConnections[findFrame(frameStructureSubject.getValue(), frameUUID)];
            embParentRedirection.next(redirect(connection, parentConnection))
            connection.post(CHANNEL_CONNECT_TO_FRAME, frameUUID);
        }
    });

    const init = (cn: IConnection) => {
        cn.open(CHANNEL_SELECT_TREE).map(treeSelection => treeSelection.frameId).subscribe(reconnectFrameRequestStream);
    }

    if (isIframe) {
        const parentConnection = await connectToParent(init);
        parentConnectionSubject.next(parentConnection);

        parentConnection.post(CHANNEL_NOTIFY_FRAME_STRUCTURE, frameStructureSubject.getValue())

        // TODO window.onunload で親に通知
    } else {
        const parentConnection = await (new WaitingEstablishedGateway(background_gateway, init)).connect(CONNECTION_CS_TO_BG);

        await postAndWaitReply(parentConnection, CHANNEL_NOTIFY_TAB_ID, tabId, CHANNEL_TAB_CONNECTION_ESTABLISHED);
        parentConnectionSubject.next(parentConnection);
    }
}

async function connectToParent(init: (cn: IConnection) => void) {
    const iframeGateway = new WindowGateway("iframe:cs", window.parent);
    const wrap = new WaitingEstablishedGateway(iframeGateway, init)
    return await wrap.connect(CONNECTION_CS_TO_IFRAME);
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

// unsubscribe old subscription
function autoUnsubscribe(subscriptionObservable: BehaviorSubject<undefined | Subscription>) {
    subscriptionObservable.zip(subscriptionObservable.skip(1)).map(tuple => tuple[0]).filter(isNotNullOrUndefined).subscribe(prev => {
        prev.unsubscribe();
    });
}

function subscribeEmbConnection(
    embConnectionObservable: Observable<IConnection | undefined>,
    frameStructureSubject: BehaviorSubject<FrameStructure>,
) {
    embConnectionObservable.filter(isNotNullOrUndefined).subscribe(cn => {
        cn.open(CHANNEL_NOTIFY_ROOT_NODES_RESPONSE).subscribe(trees => {
            const newValue = {
                ...frameStructureSubject.getValue(),
                trees,
            }
            frameStructureSubject.next(newValue);
        })
    })

}