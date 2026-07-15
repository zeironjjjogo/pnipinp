import type { WrappedCanvas, WrappedVideo } from "./wrapped";

type Size = { width: number, height: number };
const Size = {
    make(w: number, h: number): Size { return { width: w, height: h };}
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

            this.m_player.style.width = canvasSize.width + "px";
            this.m_player.style.height = canvasSize.height + "px";
            // if (canvasSize.width - videoSize.width !== 0 || canvasSize.height - videoSize.height !== 0) {
            //     // v.style.left = ((canvasSize.width - videoSize.width) / 2) + "px";
            //     // v.style.top = ((canvasSize.height - videoSize.height) / 2) + "px";
            //     if (playerSize.width !== videoSize.width) {
            //         v.style.left = ((playerSize.width - videoSize.width) / 2) + "px";
            //         console.log(((playerSize.width - videoSize.width) / 2) + "px");
            //     }
            //     if (playerSize.height !== videoSize.height) {
            //         v.style.top = ((playerSize.height - videoSize.height) / 2) + "px";
            //         console.log(((playerSize.height - videoSize.height) / 2) + "px");
            //     }
            // }
            
        } else {
            const videoSize = Resizer.makeInscribed(regionSize, videoAspect);
            console.log(regionSize, videoSize);
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
