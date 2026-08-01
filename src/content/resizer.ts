import type { WrappedCanvas, WrappedVideo } from "@/content/wrapped";

type Size = { width: number, height: number };
const Size = {
    make(w: number, h: number): Size { return { width: w, height: h };}
};

export class ResizeHandler {
    private readonly m_video: HTMLVideoElement;
    private readonly m_renewAttrs: () => unknown;
    private readonly m_resizer: { resize() : void; };

    constructor(v: HTMLVideoElement, renewAttrs: () => unknown, resizer: { resize(): void; }) {
        // v.addEventListener("canplay", this.onCanplay);
        // v.addEventListener("canplaythrough", this.onCanPlayThrough);
        // v.addEventListener("emptied", this.onEmptied);
        // v.addEventListener("ended", this.onEnded);
        // v.addEventListener("loadeddata", this.onLoadedData);
        // v.addEventListener("loadedmetadata", this.onLoadedMetadata);
        // v.addEventListener("loadstart", this.onLoadStart);
        v.addEventListener("resize", this.onResize);
        this.m_video = v;
        this.m_resizer = resizer;
        this.m_renewAttrs = renewAttrs;
    }

    public releaseVideo(): void {
        // this.m_video.removeEventListener("canplay", this.onCanplay);
        // this.m_video.removeEventListener("canplaythrough", this.onCanPlayThrough);
        // this.m_video.removeEventListener("emptied", this.onEmptied);
        // this.m_video.removeEventListener("ended", this.onEnded);
        // this.m_video.removeEventListener("loadeddata", this.onLoadedData);
        // this.m_video.removeEventListener("loadedmetadata", this.onLoadedMetadata);
        // this.m_video.removeEventListener("loadstart", this.onLoadStart);
        this.m_video.removeEventListener("resize",  this.onResize);
    }

    public onCanplay = () => {
        console.log("onCanplay");
    };

    public onCanPlayThrough = () => {
        console.log("oncanplaythrough");
    };

    public onEmptied = () => {
        console.log("onemptied");
    };

    public onEnded = () => {
        console.log("onEnded");
    };

    public onLoadedData = () => {
        console.log("onLoadedData");
    };

    public onLoadedMetadata = () => {
        console.log("onLoadedMetadata");
    };

    public onLoadStart = () => {
        console.log("onloadstart");
    }

    public onResize = () => {
        console.log("onResize");
        this.m_renewAttrs();
        this.m_resizer.resize();
    };
};

export class Resizer {
    private readonly m_region: HTMLDivElement;

    private readonly m_player: HTMLDivElement;
    private readonly m_wv: WrappedVideo;
    private readonly m_wc: WrappedCanvas;

    constructor(region: HTMLDivElement, player: HTMLDivElement, wVideo: WrappedVideo, wCanvas: WrappedCanvas) {
        this.m_region = region;
        this.m_player = player;
        this.m_wv = wVideo;
        this.m_wc = wCanvas;
    }

    private static makeInscribed(region: Size, aspect: number): Size {
        if (region.width / region.height >= aspect) {
            return Size.make(aspect * region.height, region.height);
        } else {
            return Size.make(region.width, region.width / aspect);
        }
    }

    public resizelogic(v: HTMLVideoElement, c: HTMLCanvasElement | null) {
        const region = this.m_region.getBoundingClientRect();
        const regionSize = Size.make(region.width, region.height);
        
        const videoAspect = v.videoWidth / v.videoHeight;
        if (c) {
            const canvasAspect = c.width / c.height;
            const canvasSize = Resizer.makeInscribed(regionSize, canvasAspect);
            const videoSize = Resizer.makeInscribed(canvasSize, videoAspect);

            const playerSize = Size.make(
                Math.max(canvasSize.width, videoSize.width),
                Math.max(canvasSize.height, videoSize.height)
            );

            v.style.width = videoSize.width + "px";
            v.style.height = videoSize.height + "px";
            c.style.width = canvasSize.width + "px";
            c.style.height = canvasSize.height + "px";

            v.style.inset = `${(playerSize.height - videoSize.height) / 2}px ${(playerSize.width - videoSize.width) / 2}px`;
            c.style.inset = `${(playerSize.height - canvasSize.height) / 2}px ${(playerSize.width - canvasSize.width) / 2}px`;

            this.m_player.style.width = playerSize.width + "px";
            this.m_player.style.height = playerSize.height + "px";
        } else {
            const videoSize = Resizer.makeInscribed(regionSize, videoAspect);
            v.style.width = videoSize.width + "px";
            v.style.height = videoSize.height + "px";
            this.m_player.style.width = videoSize.width + "px";
            this.m_player.style.height = videoSize.height + "px";
        }
    }

    public resize() {
        if (!this.m_wv.element) {
            return;
        }
        this.resizelogic(this.m_wv.element, this.m_wc.element);
    }
};
