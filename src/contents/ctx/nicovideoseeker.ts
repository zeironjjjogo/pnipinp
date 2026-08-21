import type IController from "@/@types/controller";

class SeekbarObs {
    private m_obs: MutationObserver;
    private isSeekbar(node: Node): node is HTMLDivElement {
        return (
            node instanceof HTMLDivElement &&
            node.matches("div[data-styling-area=floating] div[aria-label=\"video - bufferedTime\"] + div")
        );
    }
    constructor(onAdd: (progressbar: HTMLDivElement) => void, onDel: () => void) {
        const obs = new MutationObserver((records) => {
            for (const record of records) {
                if (record.type !== "childList") continue;
                for (const child of record.addedNodes) {
                    if (!this.isSeekbar(child)) continue;
                    onAdd(child);
                    console.log("found progressbar");
                }
                for (const child of record.removedNodes) {
                    if (!this.isSeekbar(child)) continue;
                    onDel();
                    console.log("deleted progressbar");
                }
            }
        });
        obs.observe(
            document.querySelector("div[data-styling-area=floating]") || document.body,
            { childList: true, subtree: true }
        );
        this.m_obs = obs;
    }
    public dispose(): void {
        this.m_obs.disconnect();
    }
};

export class NicovideoSeeker implements IController {
    private static getSeekbar(): HTMLDivElement | null {
        return document.querySelector("div[data-styling-area=floating] div[aria-label=\"video - bufferedTime\"] + div");
    }
    private static readonly ADS_DUR = 10;
    private m_seekbar: HTMLDivElement | null;
    private m_obs: SeekbarObs | null = null;
    public isValid(): boolean { return !!this.m_seekbar && document.body.contains(this.m_seekbar); }
    constructor() {
        const seekbar = NicovideoSeeker.getSeekbar();
        this.m_obs = new SeekbarObs(
            (progressbar) => { this.m_seekbar = progressbar; },
            () => { this.m_seekbar = null; }
        );
        this.m_seekbar = seekbar;
    }

    public dispose() {
        this.m_obs?.dispose();
    }

    private getProps() {
        if (!this.m_seekbar || !this.isValid()) return;
        const currentTimeBar = this.m_seekbar.nextElementSibling;
        if (!currentTimeBar) {
            return null;
        }

        const attrValueMax = currentTimeBar.attributes.getNamedItem("aria-valuemax");
        const attrValueMin = currentTimeBar.attributes.getNamedItem("aria-valuemin");

        if (!attrValueMax || !attrValueMin) {
            return null;
        }

        const range = Number(attrValueMax.value) - Number(attrValueMin.value);
        const contentRange = range - NicovideoSeeker.ADS_DUR;
        const contentPercentage = contentRange / range;
        return {
            range: range,
            content: {
                range: contentRange,
                percentage: contentPercentage
            }
        };
    }

    public setPos(pos: number) {
        if (!this.m_seekbar || !this.isValid()) return;
        const rect = this.m_seekbar.getBoundingClientRect();
        const props = this.getProps();
        const event = new MouseEvent("click", {
            bubbles: true,
            clientX: rect.left + rect.width * pos * (props ? props.content.percentage : 1),
            clientY: rect.top + rect.height * 0.5
        });
        this.m_seekbar.dispatchEvent(event);
    }

    public setCur(sec: number): unknown {
        if (!this.m_seekbar || !this.isValid()) return;
        const rect = this.m_seekbar.getBoundingClientRect();
        const props = this.getProps();
        if (!props) return;
        const event = new MouseEvent("click", {
            bubbles: true,
            clientX: rect.left + rect.width * (sec / props.content.range) * props.content.percentage,
            clientY: rect.top + rect.height * 0.5
        });
        this.m_seekbar.dispatchEvent(event);
    }
};

export class NicovideoShortsSeeker implements IController {
    private static getSeekbar() {
        return document.querySelector("[data-playlist-state=active] [aria-label=\"video - currentTime\"]")?.previousElementSibling as HTMLDivElement | null | undefined;
    }
    private m_seekbar: HTMLDivElement | null = null;

    public isValid(): boolean { return !!this.m_seekbar && document.body.contains(this.m_seekbar); }

    constructor() {
        this.m_seekbar = NicovideoShortsSeeker.getSeekbar() ?? null;
    }

    private getRange() {
        if (!this.m_seekbar || !this.isValid()) return null;

        const curTimeBar = this.m_seekbar.nextElementSibling;
        if (!curTimeBar) return null;

        const valueMax = curTimeBar.attributes.getNamedItem("aria-valuemax");
        const valueMin = curTimeBar.attributes.getNamedItem("aria-valuemin");
        if (!valueMax || !valueMin) return null;

        return Number(valueMax.value) - Number(valueMin.value);
    }

    public dispose(): void {
    }

    public setCur(sec: number) {
        if (!this.m_seekbar || !this.isValid()) return;
        const rect = this.m_seekbar.getBoundingClientRect();

        const range = this.getRange();
        if (!range) return;

        const event = new MouseEvent("click", {
            bubbles: true,
            clientX: rect.left + rect.width * (sec / range),
            clientY: rect.top + rect.height * 0.5
        });
        this.m_seekbar.dispatchEvent(event);
    }
};
