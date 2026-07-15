import { Control } from "./controler";
import type { AppFTs, FeatureContext } from "./features";
import { Resizer } from "./resizer";
import { WrappedCanvas, WrappedVideo } from "./wrapped";

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

    // constructor(v: WrappedVideo, c: WrappedCanvas) {
    //     this.m_wVideo = v;
    //     this.m_wCanvas = c;
    // }

    private onMetaDataLoaded: (() => unknown) | null = null;

    public pullVideo(ctrl: Control, resize: () => unknown): boolean {
        const ft = this.m_ftCtx.getValue();
        if (!this.m_wVideo.loadElement(ft) || !this.m_wVideo.element) return false;
        this.m_wVideo.pull();
        ctrl.setVideo(this.m_wVideo.element);

        if ("onMetaDataLoaded" in ft) {
            this.onMetaDataLoaded = () => { ft.onMetaDataLoaded(resize); };
            this.m_wVideo.element.addEventListener("loadedmetadata", this.onMetaDataLoaded);
        }

        return true;
    }

    public pullCanvas(): void {
        this.m_wCanvas.loadElement(this.m_ftCtx.getValue());
        this.m_wCanvas.pull();
    }

    public pullContents(ctrl: Control, resize: () => unknown): boolean {
        if (!this.pullVideo(ctrl, resize)) return false;
        this.pullCanvas();
        return true;
    }

    public pushVideo(ctrl: Control): void {
        if ("onMetaDataLoaded" in this.m_ftCtx.getValue() && this.onMetaDataLoaded) {
            this.m_wVideo.element?.removeEventListener("loadedmetadata", this.onMetaDataLoaded);
            this.onMetaDataLoaded = null;
        }
        ctrl.releaseVideo();
        this.m_wVideo.push();
    }

    public pushCanvas(): void {
        this.m_wCanvas.push();
    }

    public pushContents(ctrl: Control): void {
        this.pushVideo(ctrl);
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
        console.log("contents: ", contents, "\nm_contents: ", this.m_contents);
    }

    public resize(): void {
        this.m_resizer.resize();
    }

    public reloadElement(self: DOMCtrler = this): boolean {
        console.log("m_contents: ", self.m_contents);
        const result = self.m_contents.pullContents(self.m_controller,  self.m_resizer.resize);
        if (result && self.m_contents.video.element) {
            self.m_resizer.resize();
        }
        return result;
    }

    public reloadCanvas(self: DOMCtrler = this): void {
        self.m_contents.pullCanvas();
        self.m_resizer.resize();
    }

    public releaseElement(self: DOMCtrler = this) {
        console.log("m_contents: ", self.m_contents);
        this.m_contents.pushContents(self.m_controller);
    }

    public dispose() {
        this.releaseElement();
        this.m_reszObs.disconnect();
    }
};
