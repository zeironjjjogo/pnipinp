import { type Control } from "./controler";
import { type DOMContents } from "./domctrler";
import { type Resizer } from "./resizer";
import { formatURL, isCommentCanvas, isStageDiv, sleep } from "./util";

export class MutationHandler {
    private readonly m_ctrl: Control;
    private readonly m_rszr: Resizer;
    private readonly m_domctrl: DOMContents;
    private m_modified_properties: string[] = [];

    constructor(ctrl: Control, rszr: Resizer, domctrl: DOMContents) {
        this.m_ctrl = ctrl;
        this.m_rszr = rszr;
        this.m_domctrl = domctrl;
    }
    
    public onModifyAttributes(r: MutationRecord) {
        // if (!isCommentCanvas(r.target)) return;
        if (this.m_domctrl.canvas.element !== r.target) return;
        console.log("modified canvas attributes");
        this.m_modified_properties.push(r.attributeName || "");

        if (
            !this.m_modified_properties.includes("width") ||
            !this.m_modified_properties.includes("height")
        ) return;

        console.log('finished comment prepairing');

        this.m_modified_properties = [];

        this.m_domctrl.pullCanvas();

        this.m_rszr.resize();
    }

    public onModifyCharacterData(r: MutationRecord) {
        if (r.target.parentNode instanceof HTMLTitleElement) {
            console.log("~~~~~~\n~~~~~title modified;~~~~~\n~~~~~");
            // this.m_domctrl.pushContents(this.m_ctrl);
            this.m_domctrl.pullContents(this.m_ctrl);
        }
    }

    public onModifyChildList(r: MutationRecord) {
        for (const node of r.addedNodes) {
            const res = isStageDiv(node);
            if (!res) continue;
            console.log("modified child list");
            if (!this.m_domctrl.pullContents(this.m_ctrl)) {
                throw Error("Failed to pull a video element.");
            }

            this.m_rszr.resize();
        }
    }
};

export class URLObserver {
    private m_kept_url: string;

    private m_is_observing: boolean = false;

    private m_handler: (url: string) => unknown;

    private static getURL(): string {
        return formatURL(document.URL);
    }

    constructor(handler: (url: string) => unknown) {
        this.m_kept_url = URLObserver.getURL();
        this.m_handler = handler;
        this.observe();
    }

    private async observe() {
        while (this.m_is_observing) {
            const currentURL = URLObserver.getURL();
            if (currentURL !== this.m_kept_url) {
                this.m_kept_url = currentURL
                this.m_handler(currentURL);
            }
            await sleep(200);
        }
    }

    public start(): void {
        if (this.m_is_observing) {
            console.error("URLObserver has already started observing.");
            return;
        }
        
        this.m_is_observing = true;
        this.observe();
    }

    public stop(): void {
        this.m_is_observing = false;
    }
};
