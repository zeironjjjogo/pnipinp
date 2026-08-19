import type IController from "@/@types/controller";

export class NicovideoSeeker implements IController {
    private static getSeekbar(): HTMLDivElement | null {
        return document.querySelector("div[data-styling-area=floating] div[aria-label=\"video - bufferedTime\"] + div");
    }
    private static readonly ADS_DUR = 10;
    private readonly m_seekbar: HTMLDivElement;
    constructor() {
        const seekbar = NicovideoSeeker.getSeekbar();
        if (!seekbar) {
            throw Error("Failed to get the seekbar.");
        }
        this.m_seekbar = seekbar;
    }

    private getProps() {
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
