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
    CHANNEL_NOTIFY_ROOT_NODES_RESPONSE,
    CHANNEL_NOTIFY_FRAME_CLOSE,
} from '../common/Constants';
import { IGateway, WindowGateway } from '../common/Gateway';
import { isNotNullOrUndefined, postAndWaitReply } from '../common/Util';
import embed from '../embbed/Embedder';
import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';
import { Observer } from 'rxjs/Observer';
import { IConnection, redirect } from '../common/Connection';
import { FrameStructure } from '../common/Schema';

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
    subscribeParentConnection(parentConnectionSubject, frameStructureSubject, isIframe, subscriptionSubject);

    //wait for child frame connection
    const childFrameConnections = {} as { [key: string]: IConnection };
    const iframeGateway = new WindowGateway("cs:iframe");
    iframeGateway.waitingConnection(CONNECTION_CS_TO_IFRAME).subscribe(cnp =>
        cnp.startWith(cn => {
            cn.open(CHANNEL_NOTIFY_FRAME_STRUCTURE).do(structure => {
                // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] iframe str update`)
                childFrameConnections[structure.uuid] = cn;
            }).map(structure => {
                const newValue = {
                    ...frameStructureSubject.getValue(),
                }
                newValue.children[structure.uuid] = structure;
                return newValue;
            }).subscribe(frameStructureSubject);

            cn.open(CHANNEL_NOTIFY_FRAME_CLOSE).do(id => {
                delete childFrameConnections[id];
            }).map(id => {
                const newValue = {
                    ...frameStructureSubject.getValue(),
                }
                delete newValue.children[id];
                return newValue;
            }).subscribe(frameStructureSubject);
        })
        // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] iframe connection come in`)
    );


    // wait gr signal and script embeddeing.
    grLoadingSignalObservable()
        .first()
        .flatMapTo(connectToEmbeddedScript(emb_gateway, embeddingScriptUrl))
        .subscribe(embConnectionSubject);

    // frameIDがくる。そのフレームとコネクトする。
    const selectFrameRequestStream = new BehaviorSubject<string>(currentFrameUUID);

    let embParentRedirection = new BehaviorSubject<ISubscription | undefined>(undefined);
    autoUnsubscribe(embParentRedirection);

    // 変化するのはembConnectionSubjectとselectFrameRequestStream
    Observable.combineLatest(selectFrameRequestStream, embConnectionSubject, parentConnectionSubject.filter(isNotNullOrUndefined)).subscribe(triple => {
        const [frameUUID, embConnection, parentConnection] = triple;
        console.log("@@@@@@@@@@@@;;;;;;;;;;",frameUUID)
        if (currentFrameUUID === frameUUID) {
            if (!embConnection) { // not found gr context yet
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
        cn.open(CHANNEL_SELECT_TREE).map(treeSelection => treeSelection.frameUUID).subscribe(selectFrameRequestStream);
    }

    if (isIframe) {
        const parentConnection = (await connectToParent()).startWith(cn => {
            init(cn);
            return cn
        });
        parentConnectionSubject.next(parentConnection);

        parentConnection.post(CHANNEL_NOTIFY_FRAME_STRUCTURE, frameStructureSubject.getValue())

        window.addEventListener("unload", ev => {
            parentConnection.post(CHANNEL_NOTIFY_FRAME_CLOSE, currentFrameUUID);
        })
    } else {
        const parentConnection = (await (background_gateway).connect(CONNECTION_CS_TO_BG)).startWith(a => {
            init(a);
            return a;
        });;

        await postAndWaitReply(parentConnection, CHANNEL_NOTIFY_TAB_ID, tabId, CHANNEL_TAB_CONNECTION_ESTABLISHED);
        parentConnectionSubject.next(parentConnection);
    }
}

async function connectToParent() {
    return await new WindowGateway("iframe:cs", window.parent).connect(CONNECTION_CS_TO_IFRAME);
}

async function connectToEmbeddedScript<T extends IConnection>(emb_gateway: IGateway<T>, embeddingScriptUrl: string) {
    const embConnectionWaiting = emb_gateway.waitingConnection(CONNECTION_CS_TO_EMB).first().toPromise();
    embed(embeddingScriptUrl)
    return (await embConnectionWaiting).startWith(cn => cn);
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
function autoUnsubscribe(subscriptionObservable: Observable<undefined | ISubscription>) {
    subscriptionObservable.zip(subscriptionObservable.skip(1)).map(tuple => tuple[0]).filter(isNotNullOrUndefined).subscribe(prev => {//TODO bufferで書き換え？
        prev.unsubscribe();
    });
}

function subscribeEmbConnection(
    embConnectionObservable: Observable<IConnection | undefined>,
    frameStructureSubject: BehaviorSubject<FrameStructure>,
) {
    embConnectionObservable.filter(isNotNullOrUndefined).subscribe(cn => {
        cn.open(CHANNEL_NOTIFY_ROOT_NODES_RESPONSE).subscribe(trees => {
            console.log("@@@treee",trees)
            const newValue = {
                ...frameStructureSubject.getValue(),
                trees,
            }
            frameStructureSubject.next(newValue);
        })
    })
}


// on update parent connection, it subscribe frame structure.
function subscribeParentConnection(
    parentConnections: Observable<IConnection | undefined>,
    frameStructureSubject: BehaviorSubject<FrameStructure>,
    isIframe: boolean,
    subscriptionSubject: Observer<Subscription | undefined>,
) {
    parentConnections.subscribe(connection => {
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
}