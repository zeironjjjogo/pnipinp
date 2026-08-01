import { Control } from "@/content/controller";
import type { FeatureContext } from "@/content/features";
import { Resizer, ResizeHandler } from "@/content/resizer";
import { WrappedCanvas, WrappedVideo } from "@/content/wrapped";

export class DOMContents {
    private readonly m_wVideo: WrappedVideo;
    private readonly m_wCanvas: WrappedCanvas;
    private readonly m_ftCtx: FeatureContext;

    private readonly m_containers: {
        outer: HTMLDivElement,
        inner: HTMLDivElement
    };
    private readonly m_resizer: Resizer;
    private m_rh: ResizeHandler | null = null;

    get video(): WrappedVideo { return this.m_wVideo; }
    get canvas(): WrappedCanvas { return this.m_wCanvas; }
    get container(): HTMLDivElement { return this.m_containers.outer; }
    
    public getContainer(t: "outer" | "inner"): HTMLDivElement { return this.m_containers[t]; }

    constructor(wnd: Window, ftCtx: FeatureContext) {
        const doc = wnd.document;

        const playerOuter = doc.createElement("div");
        const playerInner = doc.createElement("div");

        playerOuter.classList.add("player");
        playerInner.classList.add("player__inner");

        playerOuter.appendChild(playerInner);

        this.m_wVideo = new WrappedVideo(playerInner);
        this.m_wCanvas = new WrappedCanvas(playerInner);
        this.m_ftCtx = ftCtx;

        this.m_containers = { outer: playerOuter, inner: playerInner };
        this.m_resizer = new Resizer(playerOuter, playerInner, this.m_wVideo, this.m_wCanvas);
    }

    public requestResize(): void {
        this.m_resizer.resize();
    }

    private m_pullVideo(ctrl: Control): boolean {
        const ft = this.m_ftCtx.getValue();
        if (
            !this.m_wVideo.loadElement(ft.selectors.video) || 
            !this.m_wVideo.element
        ) return false;

        this.m_wVideo.pull();
        ctrl.setVideo(this.m_wVideo.element);
        this.m_rh = new ResizeHandler(this.m_wVideo.element, this.m_wVideo.reloadAttrs.bind(this.m_wVideo), this.m_resizer);

        return true;
    }

    private m_pullCanvas(): void {
        const ft = this.m_ftCtx.getValue();

        if ("canvas" in ft.selectors) {
            this.m_wCanvas.loadElement(ft.selectors.canvas);
        } else {
            this.m_wCanvas.loadElement(null);
        }

        this.m_wCanvas.pull();
    }

    public pullContents(ctrl: Control): boolean {
        if (!this.m_pullVideo(ctrl)) return false;
        this.m_pullCanvas();
        this.m_resizer.resize();
        return true;
    }

    public pullCanvas(): void {
        this.m_pullCanvas();
        this.m_resizer.resize();
    }

    private m_pushVideo(ctrl: Control): void {
        this.m_rh?.releaseVideo();
        ctrl.releaseVideo();
        this.m_wVideo.push();
    }

    private m_pushCanvas(): void {
        this.m_wCanvas.push();
    }

    public pushContents(ctrl: Control): void {
        this.m_pushVideo(ctrl);
        this.m_pushCanvas();
    }
};

export class DOMCtrler {
    private readonly m_contents: DOMContents;
    private readonly m_controller: Control;

    get contents() { return this.m_contents; }
    get controller() { return this.m_controller; }

    constructor(wnd: Window, ft: FeatureContext) {
        const doc = wnd.document;

        const mainContainer = doc.createElement("div");
        mainContainer.classList.add("main");

        const contents = new DOMContents(wnd, ft);
        const controller = new Control(wnd);
        
        mainContainer.appendChild(contents.container);
        mainContainer.appendChild(controller.element);

        doc.body.appendChild(mainContainer);

        this.m_contents = contents;
        this.m_controller = controller;
    }

    public resizeContents(): void {
        this.m_contents.requestResize();
    }

    public reloadElement(): boolean {
        return this.m_contents.pullContents(this.m_controller);
    }

    public reloadCanvas(): void {
        this.m_contents.pullCanvas();
    }

    public releaseElement() {
        this.m_contents.pushContents(this.m_controller);
    }

    public dispose() {
        this.releaseElement();
    }
};
