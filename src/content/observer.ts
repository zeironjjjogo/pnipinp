// import { type Control } from "./controler";
// import { DOMCtrler, type DOMContents } from "./domctrler";
// import { FeatureContext, getParent_nico } from "./features";
// import { type Resizer } from "./resizer";
import { formatURL, sleep } from "./util";

// export class MutationHandler {
//     private readonly m_domctrl: DOMCtrler;
//     private m_modified_properties: string[] = [];
//     private readonly m_ft: FeatureContext;

//     constructor(domctrl: DOMCtrler, ft: FeatureContext) {
//         this.m_domctrl = domctrl;
//         this.m_ft = ft;
//     }
    
//     // on modified attributes of the comment canvas on nicovideo. 
//     public onModifyAttributes(r: MutationRecord) {
//         if (!(r.target instanceof HTMLElement)) return;
//         const ft = this.m_ft.getFeature();
//         if (!ft.canvasRequired) return;

//         switch (ft.type) {
//             case "nicovideo:shorts": {
//                 if (
//                     r.target === ft.parent() &&
//                     r.attributeName === "data-state" &&
//                     r.target.dataset.state === "active"
//                 ) {
//                     if (!this.m_domctrl.reloadElement()) {
//                         throw Error("Faild to pull a video on parent set to be active.");
//                     }
//                     return;
//                 }
//             }
//             case "nicovideo":
//             case "nicovideo:live": {
//                 if (this.m_domctrl.canvas.element !== r.target) {
//                     return;
//                 }
//                 if (r.attributeName) this.m_modified_properties.push(r.attributeName);
//                 if (
//                     !this.m_modified_properties.includes("width") ||
//                     !this.m_modified_properties.includes("height")
//                 ) {
//                     return;
//                 }
//                 this.m_modified_properties = [];

//                 this.m_domctrl.reloadCanvas();
//                 return;
//             }
//         }
//     }

//     // nothing use this, so it is deprecated function. use URL observer.
//     public onModifyCharacterData(r: MutationRecord) {
//         if (r.target.parentNode instanceof HTMLTitleElement) {
//             console.log("~~~~~~\n~~~~~title modified;~~~~~\n~~~~~");
//             // this.m_domctrl.pushContents(this.m_ctrl);
//             // this.m_domctrl.pullContents(this.m_ctrl);
//         }
//     }


//     // for detecting stage added on nicovideo.
//     public onModifyChildList(r: MutationRecord) {
//         const ft = this.m_ft.getFeature();
//         if (!ft.parentRequired) return;
//         for (const node of r.addedNodes) {
//             if (!(node instanceof HTMLDivElement) || node !== ft.parent()) continue;
//             console.log("modified child list");
//             if (!this.m_domctrl.reloadElement()) {
//                 throw Error("Failed to pull a video element.");
//             }
//         }
//     }
// };


// observing URL modified. for push back elements on nicovideo.
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
