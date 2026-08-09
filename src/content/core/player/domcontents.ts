import { FeatureContext } from "@/context/features";
import { Resizer } from "@/core/player/resizer";
import { WrappedCanvas, WrappedVideo } from "@/core/player/wrapped";

export class DOMContents {
    private readonly m_wVideo: WrappedVideo;
    private readonly m_wCanvas: WrappedCanvas;
    private readonly m_ftCtx: FeatureContext;

    private readonly m_containers: {
        outer: HTMLDivElement,
        inner: HTMLDivElement
    };
    private readonly m_resizer: Resizer;

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

    private m_pullVideo(): boolean {
        const ft = this.m_ftCtx.getValue();
        if (
            !this.m_wVideo.loadElement(ft.selectors.video) || 
            !this.m_wVideo.element
        ) return false;

        this.m_wVideo.pull();
        this.m_resizer.setVideo();

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

    public pullContents(): boolean {
        if (!this.m_pullVideo()) return false;
        this.m_pullCanvas();
        this.m_resizer.resize();
        return true;
    }

    public pullCanvas(): void {
        this.m_pullCanvas();
        this.m_resizer.resize();
    }

    private m_pushVideo(): void {
        this.m_resizer.releaseVideo();
        this.m_wVideo.push();
    }

    private m_pushCanvas(): void {
        this.m_wCanvas.push();
    }

    public pushContents(): void {
        this.m_pushVideo();
        this.m_pushCanvas();
    }
};
