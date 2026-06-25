import { Control } from "./controler";
import { WrappedCanvas, WrappedVideo } from "./wrapped";

export class DOMController {
    private readonly m_wVideo: WrappedVideo;
    private readonly m_wCanvas: WrappedCanvas;

    constructor(v: WrappedVideo, c: WrappedCanvas) {
        this.m_wVideo = v;
        this.m_wCanvas = c;
    }

    public pullVideo(ctrl: Control): boolean {
        if (!this.m_wVideo.loadElement() || !this.m_wVideo.element) return false;
        this.m_wVideo.pull();
        ctrl.setVideo(this.m_wVideo.element);
        return true;
    }

    public pullCanvas(): void {
        this.m_wCanvas.loadElement();
        this.m_wCanvas.pull();
    }

    public pullContents(ctrl: Control): boolean {
        if (!this.pullVideo(ctrl)) return false;
        this.pullCanvas();
        return true;
    }

    public pushVideo(ctrl: Control): void {
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
