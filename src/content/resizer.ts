type Size = { width: number, height: number };
const Size = {
    make(w: number, h: number): Size { return { width: w, height: h };}
};

export class Resizer {
    private readonly m_region: HTMLDivElement;

    constructor(region: HTMLDivElement) {
        this.m_region = region;
    }

    private static makeInscribed(region: Size, aspect: number): Size {
        if (region.width / region.height >= aspect) {
            return Size.make(aspect * region.height, region.height);
        } else {
            return Size.make(region.width, region.width / aspect);
        }
    }

    public resize(v: HTMLVideoElement, c: HTMLCanvasElement | null) {
        const region = this.m_region.getBoundingClientRect();
        const regionSize = Size.make(region.width, region.height);
        const videoAspect = v.videoWidth / v.videoHeight;
        if (c) {
            const canvasAspect = c.width / c.height;
            const canvasSize = Resizer.makeInscribed(regionSize, canvasAspect);
            const videoSize = Resizer.makeInscribed(canvasSize, videoAspect);

            v.style.width = videoSize.width + "px";
            v.style.height = videoSize.height + "px";
            v.style.left = (canvasSize.width - videoSize.width) / 2 + "px";
            v.style.top = (canvasSize.height - videoSize.height) / 2 + "px";
            c.style.width = canvasSize.width + "px";
            c.style.height = canvasSize.height + "px";

        } else {
            const videoSize = Resizer.makeInscribed(regionSize, videoAspect);
            v.style.width = videoSize.width + "px";
            v.style.height = videoSize.height + "px";
            v.style.left = "0px";
            v.style.top = "0px";
        }
    }
};
