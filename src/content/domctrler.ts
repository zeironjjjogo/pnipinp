import { Control } from "@/content/controler";
import type { FeatureContext } from "@/content/features";
import { Resizer } from "@/content/resizer";
import { WrappedCanvas, WrappedVideo } from "@/content/wrapped";

export class DOMContents {
    private readonly m_wVideo: WrappedVideo;
    private readonly m_wCanvas: WrappedCanvas;
    private readonly m_ftCtx: FeatureContext;

    get video(): WrappedVideo { return this.m_wVideo; }
    get canvas(): WrappedCanvas { return this.m_wCanvas; }

    constructor(parent: HTMLDivElement, ftCtx: FeatureContext) {
        this.m_wVideo = new WrappedVideo(parent);
        this.m_wCanvas = new WrappedCanvas(parent);
        this.m_ftCtx = ftCtx;
    }

    public pullVideo(ctrl: Control, onMetaDataLoaded: (() => unknown) | null): boolean {
        const ft = this.m_ftCtx.getValue();
        if (
            !this.m_wVideo.loadElement(ft.selectors.video) || 
            !this.m_wVideo.element
        ) return false;

        this.m_wVideo.pull();
        ctrl.setVideo(this.m_wVideo.element);

        if (onMetaDataLoaded)
            this.m_wVideo.bindDataChanged(onMetaDataLoaded);
        return true;
    }

    public pullCanvas(): void {
        const ft = this.m_ftCtx.getValue();

        if ("canvas" in ft.selectors) {
            this.m_wCanvas.loadElement(ft.selectors.canvas);
        } else {
            this.m_wCanvas.loadElement(null);
        }

        this.m_wCanvas.pull();
    }

    public pullContents(ctrl: Control, onMetaDataLoaded: (() => unknown) | null): boolean {
        if (!this.pullVideo(ctrl, onMetaDataLoaded)) return false;
        this.pullCanvas();
        return true;
    }

    public pushVideo(ctrl: Control, onMetaDataLoaded: (() => unknown) | null): void {
        if (onMetaDataLoaded)
            this.m_wVideo.element?.removeEventListener("loadedmetadata", onMetaDataLoaded);
        ctrl.releaseVideo();
        this.m_wVideo.push();
    }

    public pushCanvas(): void {
        this.m_wCanvas.push();
    }

    public pushContents(ctrl: Control, onMetaDataLoaded: (() => unknown) | null): void {
        this.pushVideo(ctrl, onMetaDataLoaded);
        this.pushCanvas();
    }
};

export class DOMCtrler {
    private static readonly PLAYER_FRAME_ID = "playerframe";
    private static readonly PLAYER_ID = "player";

    private readonly m_contents: DOMContents;
    private readonly m_controller: Control;
    private readonly m_resizer: Resizer;

    private readonly m_reszObs: ResizeObserver;

    private readonly m_ftCtx: FeatureContext;
    private m_callback: (() => unknown) | null = null;

    public readonly playerFrame: HTMLDivElement;

    get contents() { return this.m_contents; }
    get controller() { return this.m_controller; }
    get resizer() { return this.m_resizer; }

    private buildPlayer(doc: Document): HTMLDivElement {
        const player = doc.createElement("div");
        player.id = DOMCtrler.PLAYER_ID;
        player.classList.add("column-flex");
        return player;
    }

    private buildPlayerFrame(doc: Document): HTMLDivElement {
        const playerFrame = doc.createElement("div");
        playerFrame.id = DOMCtrler.PLAYER_FRAME_ID;
        playerFrame.classList.add("row-flex");
        return playerFrame;
    }

    constructor(wnd: Window, ft: FeatureContext) {
        const doc = wnd.document;

        const player = this.buildPlayer(doc);
        const playerFrame = this.buildPlayerFrame(doc);
        const contents = new DOMContents(player, ft);
        const controller = new Control(wnd);
        const resizer = new Resizer(playerFrame, player, contents.video, contents.canvas);
        
        playerFrame.appendChild(player);
        doc.body.appendChild(playerFrame);
        doc.body.appendChild(controller.element);

        const reszObs = new ResizeObserver(() => {
            const rect = playerFrame.getBoundingClientRect();
            if (rect.width !== 0 && rect.height !== 0) {
                reszObs.disconnect();
                this.m_resizer.resize();
            }
        });
        reszObs.observe(playerFrame);

        this.m_reszObs = reszObs;

        this.m_contents = contents;
        this.m_controller = controller;
        this.m_resizer = resizer;
        this.m_ftCtx = ft;
        this.playerFrame = playerFrame;
    }

    public resize(): void {
        this.m_resizer.resize();
    }

    public reloadElement(): boolean {
        const ft = this.m_ftCtx.getValue();
        if ("onMetaDataLoaded" in ft.behaviours) {
            this.m_callback = ft.behaviours.onMetaDataLoaded.bind(ft, this.resize.bind(this));
        }
        const result = this.m_contents.pullContents(this.m_controller, this.m_callback);
        if (result && this.m_contents.video.element) {
            console.log("resize");
            this.m_resizer.resize();
        }
        return result;
    }

    public reloadCanvas(): void {
        this.m_contents.pullCanvas();
        this.m_resizer.resize();
    }

    public releaseElement() {
        this.m_contents.pushContents(this.m_controller, this.m_callback);
        this.m_callback = null;
    }

    public dispose() {
        this.releaseElement();
        this.m_reszObs.disconnect();
    }
};
