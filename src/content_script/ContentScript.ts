import IWindowMessage from 'grimoirejs/ref/Interface/IWindowMessage';
import { Children } from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from 'rxjs/Subscription';

import {
    CHANNEL_CONNECT_TO_FRAME,
    CHANNEL_CONNECT_TO_FRAME_RESPONSE,
    CHANNEL_NOTIFY_FRAME_STRUCTURE,
    CHANNEL_NOTIFY_TAB_ID,
    CHANNEL_PUT_FRAMES,
    CHANNEL_SELECT_TREE,
    CHANNEL_CONNECTION_ESTABLISHED,
    CONNECTION_CS_TO_BG,
    CONNECTION_CS_TO_EMB,
    CONNECTION_CS_TO_IFRAME,
    CHANNEL_NOTIFY_ROOT_NODES_RESPONSE,
    CHANNEL_NOTIFY_FRAME_CLOSE,
    CHANNEL_NOTIFY_ROOT_NODES,
    CHANNEL_NOTIFY_TREE_STRUCTURE,
    CHANNEL_SELECT_NODE,
} from '../common/Constants';
import { IGateway, WindowGateway } from '../common/Gateway';
import { isNotNullOrUndefined, postAndWaitReply } from '../common/Util';
import embed from '../embbed/Embedder';
import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';
import { Observer } from 'rxjs/Observer';
import { IConnection, redirect } from '../common/Connection';
import { FrameStructure } from '../common/Schema';
import { last } from 'rxjs/operator/last';

declare function require(x: string): any;
const uuid = require("uuid/v4");

export class ContentScriptAgent<T extends IConnection, U extends IConnection>{
    public isIframe = (window !== window.parent);
    public UUID = uuid() as string;

    // フレーム構造
    public frameStructureSubject = new BehaviorSubject<FrameStructure>({
        UUID: this.UUID,
        url: location.href,
        children: {},
        trees: {},
        plugins: []
    });
    public parentConnectionSubject = new BehaviorSubject<undefined | IConnection>(undefined);
    public embConnectionSubject = new BehaviorSubject<IConnection | undefined>(undefined);

    public embParentRedirection = new BehaviorSubject<ISubscription | undefined>(undefined);
    public childFrameConnections = {} as { [key: string]: IConnection };

    // embかiframeへのコネクション
    public embProxiSubject = new BehaviorSubject<IConnection | undefined>(undefined);

    constructor(
        public tabId: number,
        public emb_gateway: IGateway<T>,
        public background_gateway: IGateway<U>,
        public embeddingScriptUrl: string,
    ) {
        autoUnsubscribe(this.embParentRedirection)
    }
    start<T extends IConnection, U extends IConnection>() {

        this.startWaitingGrMessage();

        this.startFrameStructurePropagation();

        (async () => {
            const init = (cn: IConnection) => {
                cn.open(CHANNEL_SELECT_NODE).subscribe(async a=>{
                    const emb = this.embProxiSubject.getValue();
                    if (!emb) {
                        return;
                    }
                    const parent = this.parentConnectionSubject.getValue();
                    if (!parent) {
                        return;
                    }
                    const response = await postAndWaitReply(emb, CHANNEL_SELECT_NODE, a, CHANNEL_NOTIFY_TREE_STRUCTURE)
                    parent.post(CHANNEL_NOTIFY_TREE_STRUCTURE, response);

                })
                cn.open(CHANNEL_SELECT_TREE).flatMap(async treeSelection => {//rootのみ
                    const grExists = await this.connectToFrame(treeSelection.frameUUID);
                    return {
                        grExists,
                        treeSelection,
                    }
                }).subscribe(async a => {
                    const emb = this.embProxiSubject.getValue();
                    if (!emb) {
                        return;
                    }
                    const parent = this.parentConnectionSubject.getValue();
                    if (!parent) {
                        return;
                    }
                    const response = await postAndWaitReply(emb, CHANNEL_SELECT_TREE, a.treeSelection, CHANNEL_NOTIFY_TREE_STRUCTURE)
                    parent.post(CHANNEL_NOTIFY_TREE_STRUCTURE, response);
                });

                cn.open(CHANNEL_CONNECT_TO_FRAME).flatMap(id => {//子のみ
                    return this.connectToFrame(id)
                }).subscribe(a => {
                    const parentConnection = this.parentConnectionSubject.getValue();
                    if (!parentConnection) {
                        return;
                    }
                    if (this.isIframe) {
                        parentConnection.post(CHANNEL_CONNECT_TO_FRAME_RESPONSE, a);
                    }
                })
            }

            if (this.isIframe) {
                const gateway = new WindowGateway("iframe:cs", window.parent);
                const parentConnection = (await gateway.connect(CONNECTION_CS_TO_IFRAME)).startWith(cn => {
                    init(cn);
                    return cn
                });
                this.parentConnectionSubject.next(parentConnection);
            } else {
                const parentConnection = (await (this.background_gateway).connect(CONNECTION_CS_TO_BG)).startWith(a => {
                    init(a);
                    return a;
                });;

                await postAndWaitReply(parentConnection, CHANNEL_NOTIFY_TAB_ID, this.tabId, CHANNEL_CONNECTION_ESTABLISHED);
                this.parentConnectionSubject.next(parentConnection);
            }
        })();
    }

    // grの存在確認してコネクションを作ってembConnectionSubjectにいれる
    startWaitingGrMessage() {
        // wait gr signal and script embeddeing.
        grLoadingSignalObservable()
            .first()
            .flatMapTo(this.connectToEmbeddedScript())
            .subscribe(this.embConnectionSubject);
    }

    async connectToEmbeddedScript<T extends IConnection>() {
        const embConnectionWaiting = this.emb_gateway.waitingConnection(CONNECTION_CS_TO_EMB).first().toPromise();
        embed(this.embeddingScriptUrl)
        return (await embConnectionWaiting).startWith(cn => cn);
    }

    startFrameStructurePropagation() {
        // rootNodeのフレーム構造への反映
        this.subscribeEmbConnection();

        // フレーム構造の親への通知
        this.subscribeParentConnection();

        // 子フレームからのフレーム構造変化のフレーム構造への反映
        const iframeGateway = new WindowGateway("cs:iframe");
        iframeGateway.waitingConnection(CONNECTION_CS_TO_IFRAME).subscribe(cnp =>
            cnp.startWith(cn => {
                cn.open(CHANNEL_NOTIFY_FRAME_STRUCTURE).do(structure => {
                    // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] iframe str update`)
                    this.childFrameConnections[structure.UUID] = cn;
                }).map(structure => {
                    const newValue = {
                        ...this.frameStructureSubject.getValue(),
                    }
                    newValue.children[structure.UUID] = structure;
                    return newValue;
                }).subscribe(this.frameStructureSubject);

                cn.open(CHANNEL_NOTIFY_FRAME_CLOSE).do(id => {
                    delete this.childFrameConnections[id];
                }).map(id => {
                    const newValue = {
                        ...this.frameStructureSubject.getValue(),
                    }
                    delete newValue.children[id];
                    return newValue;
                }).subscribe(this.frameStructureSubject);
            })
            // console.log(`@@@[cs:${currentFrameUUID.substring(0, 8)}${isIframe ? "(iframe)" : ""}] iframe connection come in`)
        );

    }

    async connectToFrame(frameUUID: string) {
        const embConnection = this.embConnectionSubject.getValue();
        const parentConnection = this.parentConnectionSubject.getValue();
        if (!parentConnection) {
            return
        }

        if (this.UUID === frameUUID) {
            if (!embConnection) { // not found gr context yet
                console.log("# connectiong to frame>>> no context")
                return false;
            } else {
                console.log("# connectiong to frame>>> ok");
                this.embProxiSubject.next(embConnection);
                // this.embParentRedirection.next(undefined);
                return true;
            }
        } else {
            const connection = this.childFrameConnections[findFrame(this.frameStructureSubject.getValue(), frameUUID)];
            connection.post(CHANNEL_CONNECT_TO_FRAME, frameUUID);
            const grExists = await postAndWaitReply(connection, CHANNEL_CONNECT_TO_FRAME, frameUUID, CHANNEL_CONNECT_TO_FRAME_RESPONSE);
            // this.embParentRedirection.next(redirect(connection, parentConnection))
            this.embProxiSubject.next(connection);
            return grExists;
        }
    }

    subscribeEmbConnection() {
        this.embConnectionSubject
            .filter(isNotNullOrUndefined)
            .flatMap(cn =>
                cn.open(CHANNEL_NOTIFY_ROOT_NODES_RESPONSE)
            )
            .map(trees => ({
                ...this.frameStructureSubject.getValue(),
                trees,
            }))
            .subscribe(this.frameStructureSubject);
    }

    subscribeParentConnection() {
        this.parentConnectionSubject.filter(isNotNullOrUndefined).subscribe(connection => {
            const subscription = this.frameStructureSubject.subscribe(info => {
                // console.log("@@@cs: update",isIframe,info)
                if (!this.isIframe) {
                    connection.post(CHANNEL_PUT_FRAMES, info);
                } else {
                    connection.post(CHANNEL_NOTIFY_FRAME_STRUCTURE, info);
                }
            });

            if (this.isIframe) {

                connection.post(CHANNEL_NOTIFY_FRAME_STRUCTURE, this.frameStructureSubject.getValue())

                window.addEventListener("unload", ev => {
                    connection.post(CHANNEL_NOTIFY_FRAME_CLOSE, this.UUID);
                })
            } else {

            }

        })
    }
}

async function connectToParent() {
    return await new WindowGateway("iframe:cs", window.parent).connect(CONNECTION_CS_TO_IFRAME);
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

/**
 * 指定フレームを子要素に含む直接の子要素を返す
 * @param structure 
 * @param uuid 
 */
function findFrame(structure: FrameStructure, uuid: string) {
    for (const childUUID in structure.children) {
        if (containFrame(structure.children[childUUID], uuid)) {
            return childUUID;
        }
    }
    throw new Error("frame not found")

    function containFrame(structure: FrameStructure, uuid: string) {
        if (structure.UUID === uuid) {
            return true;
        }
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
