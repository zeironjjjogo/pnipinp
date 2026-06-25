import { Control } from "./controler";
import { DOMController } from "./domctrler";
import { Resizer } from "./resizer";
import { isCommentCanvas, isStageDiv } from "./util";
import { WrappedCanvas, WrappedVideo } from "./wrapped";

export class MutationHandler {
    private readonly m_v: WrappedVideo;
    private readonly m_c: WrappedCanvas;
    private readonly m_ctrl: Control;
    private readonly m_rszr: Resizer;
    private readonly m_domctrl: DOMController;
    private m_modified_properties: string[] = [];

    constructor(v: WrappedVideo, c: WrappedCanvas, ctrl: Control, rszr: Resizer, domctrl: DOMController) {
        this.m_v = v;
        this.m_c = c;
        this.m_ctrl = ctrl;
        this.m_rszr = rszr;
        this.m_domctrl = domctrl;
    }
    
    public onModifyAttributes(r: MutationRecord) {
        if (!isCommentCanvas(r.target)) return;

        this.m_modified_properties.push(r.attributeName || "");

        if (
            !this.m_modified_properties.includes("width") ||
            !this.m_modified_properties.includes("height")
        ) return;

        this.m_modified_properties = [];

        this.m_domctrl.pullCanvas();

        if (this.m_v.element)
            this.m_rszr.resize(this.m_v.element, this.m_c.element);
    }

    public onModifyCharacterData(r: MutationRecord) {
        if (r.target instanceof HTMLTitleElement) {
            this.m_domctrl.pushContents(this.m_ctrl);
        }
    }

    public onModifyChildList(r: MutationRecord) {
        for (const node of r.addedNodes) {
            if (!isStageDiv(node)) continue;

            if (!this.m_domctrl.pullVideo(this.m_ctrl)) {
                throw Error("Failed to pull a video element.");
            }

            if (this.m_v.element)
                this.m_rszr.resize(this.m_v.element, this.m_c.element);
        }
    }
};
