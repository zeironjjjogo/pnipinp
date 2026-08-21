type Size = { width: number, height: number };
const Size = {
    make(w: number, h: number): Size { return { width: w, height: h };}
};

export class Resizer {
    private readonly m_region: HTMLDivElement;

    private readonly m_player: HTMLDivElement;

    constructor(region: HTMLDivElement, player: HTMLDivElement) {
        this.m_region = region;
        this.m_player = player;
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
};
