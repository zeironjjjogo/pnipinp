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

    private static setSize(target: HTMLElement, size: Size): void {
        target.style.width = size.width + "px";
        target.style.height = size.height + "px";
    }

    public resize(v: HTMLVideoElement, c: HTMLCanvasElement | null) {
        const region = this.m_region.getBoundingClientRect();
        const regionSize = Size.make(region.width, region.height);
        if (regionSize.width <= 0 || regionSize.height <= 0) {
            console.log("region size invalid: ", regionSize);
            return;
        }
        
        const videoAspect = v.videoWidth / v.videoHeight;
        if (c) {
            const canvasAspect = c.width / c.height;
            const canvasSize = Resizer.makeInscribed(regionSize, canvasAspect);
            const videoSize = Resizer.makeInscribed(canvasSize, videoAspect);

            const playerSize = Size.make(
                Math.max(canvasSize.width, videoSize.width),
                Math.max(canvasSize.height, videoSize.height)
            );

            Resizer.setSize(v, videoSize);
            Resizer.setSize(c, canvasSize);
            Resizer.setSize(this.m_player, playerSize);
            v.style.inset = `${(playerSize.height - videoSize.height) / 2}px ${(playerSize.width - videoSize.width) / 2}px`;
            c.style.inset = `${(playerSize.height - canvasSize.height) / 2}px ${(playerSize.width - canvasSize.width) / 2}px`;

        } else {
            const videoSize = Resizer.makeInscribed(regionSize, videoAspect);
            Resizer.setSize(v, videoSize);
            Resizer.setSize(this.m_player, videoSize);
        }
    }
};
