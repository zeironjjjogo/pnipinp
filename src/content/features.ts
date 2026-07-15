import type { Collection, IContext } from "./util";

// export type AppSupports = "nicovideo" | "live.nicovideo" | "youtube" | "other";

type NicoVideoFT = {
    readonly type: "nicovideo";
    readonly canvasRequired: true;
    readonly parentRequired: true;
    parent(): HTMLDivElement | null;
    video(): HTMLVideoElement | null;
    canvas(): HTMLCanvasElement | null;
    onAttributeModified(r: MutationRecord, collection: Collection<string>, loadCanvas: () => unknown): unknown;
    onChildListModified(r: MutationRecord, loadElements: () => boolean): unknown;
    onURLModified(releaseElements: () => unknown): unknown;
};
type NicoVideoShortsFT = {
    readonly type: "nicovideo:shorts";
    readonly canvasRequired: true;
    readonly parentRequired: true;
    parent(): HTMLDivElement | null;
    video(): HTMLVideoElement | null;
    canvas(): HTMLCanvasElement | null;
    onAttributeModified(r: MutationRecord, collection: Collection<string>, loadCanvas: () => unknown, loadElements: () => unknown): unknown;
    onChildListModified(r: MutationRecord, loadElements: () => boolean): unknown;
};
type LiveNicoVideoFT = {
    readonly type: "nicovideo:live";
    readonly canvasRequired: true;
    readonly parentRequired: false;
    video(): HTMLVideoElement | null;
    canvas(): HTMLCanvasElement | null;
    onAttributeModified(r: MutationRecord, collection: Collection<string>, loadCanvas: () => unknown): unknown;
};
type YoutubeFT = {
    readonly type: "youtube";
    readonly canvasRequired: false;
    readonly parentRequired: false;
    video(): HTMLVideoElement | null;
    onMetaDataLoaded(resizer: () => unknown): unknown;
};
type YoutubeShortsFT = {
    readonly type: "youtube:shorts";
    readonly canvasRequired: false;
    readonly parentRequired: false;
    video(): HTMLVideoElement | null;
    onMetaDataLoaded(resizer: () => unknown): unknown;
};
type DefaultsFT = {
    readonly type: "other";
    readonly canvasRequired: false;
    readonly parentRequired: false;
    video(): HTMLVideoElement | null;
};
export type AppFTs = NicoVideoFT | NicoVideoShortsFT | LiveNicoVideoFT | YoutubeFT | YoutubeShortsFT | DefaultsFT;

// export function getAppFT(): AppFTs {
//     const url = document.URL;
//     if (url.includes("https://www.nicovideo.jp/watch/")) {
//         return {
//             type: "nicovideo",
//             canvasRequired: true,
//             parentRequired: true,
//             parent() { return document.querySelector<HTMLDivElement>("div[data-name=stage]"); },
//             video() {
//                 return document.querySelector<HTMLVideoElement>("div[data-name=stage] video[data-name=video-content]");
//             },
//             canvas() {
//                 return document.querySelector<HTMLCanvasElement>("div[data-name=stage] div[data-name=comment] > canvas");
//             },
//         } as const;
//     }
//     if (url.includes("https://www.nicovideo.jp/shorts/")) {
//         return {
//             type: "nicovideo:shorts",
//             canvasRequired: true,
//             parentRequired: true,
//             parent() {
//                 return document.querySelector<HTMLDivElement>("div[data-state=active]");
//             },
//             video() {
//                 return document.querySelector("div[data-state=active] video[data-name=video-content]");
//             },
//             canvas() {
//                 return document.querySelector("div[data-state=active] div[data-name=comment] > canvas");
//             },
//         } as const;
//     }
//     if (url.includes("https://live.nicovideo.jp/")) {
//         return {
//             type: "nicovideo:live",
//             canvasRequired: true,
//             parentRequired: false,
//             video() {
//                 return document.querySelector("video.___video___mddiR");
//             },
//             canvas() {
//                 return document.querySelector("div#comment-layer-container canvas");
//             },
//         } as const;
//     }
//     if (url.includes("https://www.youtube.com/watch/")) {
//         return {
//             type: "youtube",
//             canvasRequired: false,
//             parentRequired: false,
//             video() {
//                 return document.querySelector("ytd-watch-flexy video")
//             },
//         } as const;
//     }
//     if (url.includes("https://www.youtube.com/shorts/")) {
//         return {
//             type: "youtube:shorts",
//             canvasRequired: false,
//             parentRequired: false,
//             video() {
//                 return document.querySelector("ytd-shorts video");
//             },
//         } as const;
//     }
//     return {
//         type: "other",
//         canvasRequired: false,
//         parentRequired: false,
//         video() {
//             return document.querySelector("video");
//         },
//     } as const;
// }

export class FeatureContext implements IContext<AppFTs> {
    private static readonly NicoVideo_FT: NicoVideoFT = {
        type: "nicovideo",
        canvasRequired: true,
        parentRequired: true,
        parent() {
            return document.querySelector<HTMLDivElement>("div[data-name=stage]");
        },
        video() {
            return document.querySelector<HTMLVideoElement>("div[data-name=stage] video[data-name=video-content]");
        },
        canvas() {
            return document.querySelector<HTMLCanvasElement>("div[data-name=stage] div[data-name=comment] > canvas");
        },
        onAttributeModified(r, collection, loadCanvas) {
            if (r.target !== this.canvas()) return;

            if (r.attributeName) collection.append(r.attributeName);

            if (collection.includes("width") && collection.includes("height")) {
                console.log("finished canvas preparing");
                collection.clear();
                loadCanvas();
            }
        },
        onChildListModified(r, loadElements) {
            for (const node of r.addedNodes) {
                if (!(node instanceof HTMLDivElement) || node !== this.parent()) continue;
                console.log("parent added");
                if (!loadElements()) {
                    throw Error("Faild to loadElements on ChildListModified at nicovideo.");
                }
            }
        },
        onURLModified(releaseElements) {
            releaseElements();
        }
    } as const;
    private static readonly NicoVideoShorts_FT: NicoVideoShortsFT = {
        type: "nicovideo:shorts",
        canvasRequired: true,
        parentRequired: true,
        parent() {
            return document.querySelector<HTMLDivElement>("div[data-state=active]");
        },
        video() {
            return document.querySelector("div[data-state=active] video[data-name=video-content]");
        },
        canvas() {
            return document.querySelector("div[data-state=active] div[data-name=comment] > canvas");
        },
        onAttributeModified(r, collection, loadCanvas, loadElements) {
            if (!(r.target instanceof HTMLElement)) return;
            if (
                r.target === this.parent() &&
                r.attributeName === "data-state" &&
                r.target.dataset.state === "active"
            ) {
                console.log("set to be active");
                if (!loadElements()) {
                    throw Error("Faild to loadElements on AttributeModified at nicovideo-shorts.");
                }
                return;
            }
            if (r.target !== this.canvas()) return;

            if (r.attributeName) collection.append(r.attributeName);

            if (collection.includes("width") && collection.includes("height")) {
                console.log("finished canvas preparing");
                collection.clear();
                loadCanvas();
            }
        },
        onChildListModified(r, loadElements) {
            for (const node of r.addedNodes) {
                if (!(node instanceof HTMLDivElement) || node.querySelectorAll("div[data-state]").length === 0) continue;
                console.log("parent added");
                if (!loadElements()) {
                    throw Error("Faild to loadElements on ChildListModified at nicovideo-shorts.");
                }
            }
        }
    } as const;
    private static readonly LiveNicoVideo_FT: LiveNicoVideoFT = {
        type: "nicovideo:live",
        canvasRequired: true,
        parentRequired: false,
        video() {
            return document.querySelector("video.___video___mddiR");
        },
        canvas() {
            return document.querySelector("div#comment-layer-container canvas");
        },
        onAttributeModified(r, collection, loadCanvas) {
            if (r.target !== this.canvas()) return;

            if (r.attributeName) collection.append(r.attributeName);

            if (collection.includes("width") && collection.includes("height")) {
                collection.clear();
                loadCanvas();
            }
        }
    } as const;
    private static readonly Youtube_FT: YoutubeFT = {
        type: "youtube",
        canvasRequired: false,
        parentRequired: false,
        video() {
            return document.querySelector("ytd-watch-flexy video")
        },
        onMetaDataLoaded(resizer) {
            resizer();
        }
    } as const;
    private static readonly YoutubeShorts_FT: YoutubeShortsFT = {
        type: "youtube:shorts",
        canvasRequired: false,
        parentRequired: false,
        video() {
            return document.querySelector("ytd-shorts video");
        },
        onMetaDataLoaded(resizer) {
            resizer();
        }
    } as const;
    private static readonly Default_FT: DefaultsFT = {
        type: "other",
        canvasRequired: false,
        parentRequired: false,
        video() {
            return document.querySelector("video");
        }
    } as const;

    private m_ft: AppFTs = this.updateValue();

    public updateValue() {
        const url = document.URL;
        if (url.includes("https://www.nicovideo.jp/watch/"))
            this.m_ft = FeatureContext.NicoVideo_FT;
        else if (url.includes("https://www.nicovideo.jp/shorts/"))
            this.m_ft = FeatureContext.NicoVideoShorts_FT;
        else if (url.includes("https://live.nicovideo.jp/"))
            this.m_ft = FeatureContext.LiveNicoVideo_FT;
        else if (url.includes("https://www.youtube.com/watch/"))
            this.m_ft = FeatureContext.Youtube_FT;
        else if (url.includes("https://www.youtube.com/shorts/"))
            this.m_ft = FeatureContext.YoutubeShorts_FT;
        else
            this.m_ft = FeatureContext.Default_FT;
        return this.m_ft;
    }
    public getValue() {
        return this.m_ft;
    }
};

// export function extractApps(): AppSupports {
//     const url = document.URL;
//     if (url.includes("://www.youtube.com")) {
//         return "youtube";
//     }
//     if (url.includes("://www.nicovideo")) {
//         return "nicovideo";
//     }
//     if (url.includes("://live.nicovideo")) {
//         return "live.nicovideo";
//     }
//     return "other";
// }

// export function getParent_nico() {
//     if (document.URL.includes("watch")) {
//         // normal video
//         return document.querySelector<HTMLDivElement>("div[data-name=stage]");
//     } else if (document.URL.includes("shorts")) {
//         // shorts video
//         return document.querySelector<HTMLDivElement>("div[data-state=active]");
//     }
//     return null;
// }

// export const mineElement = {
//     "nicovideo": {
//         video: () => {
//             const parent = getParent_nico();
//             if (!parent) return null;
//             const found = parent.querySelector<HTMLVideoElement>("video[data-name=video-content]");
//             return found;
//         },
//         canvas: () => {
//             const parent = getParent_nico();
//             if (!parent) return null;
//             const found = parent.querySelector<HTMLCanvasElement>("div[data-name=comment] > canvas");
//             return found;
//             // return parent.querySelector<HTMLCanvasElement>("div[data-name=comment] > canvas");
//         }
//     },
//     "live.nicovideo": {
//         video: () => {
//             return document.querySelector<HTMLVideoElement>("video.___video___mddiR");
//         },
//         canvas: () => {
//             return document.querySelector<HTMLCanvasElement>("div#comment-layer-container canvas");
//         }
//     },
//     "youtube": {
//         video: () => {
//             if (document.URL.includes("watch")) {
//                 return document.querySelector<HTMLVideoElement>("ytd-watch-flexy video");
//             }
//             if (document.URL.includes("shorts")) {
//                 return document.querySelector<HTMLVideoElement>("ytd-shorts video");
//             }
//             return null;
//         },
//         canvas: () => { return null; }
//     },
//     "other": {
//         video: () => {
//             const videos = Array.from(document.querySelectorAll("video"));
//             if (videos.length === 0) {
//                 return null;
//             }
//             const foundVideo = videos.find(v => !v.paused && !v.ended);
//             return (foundVideo ? foundVideo : null) || (videos[0] ? videos[0]: null);
//         },
//         canvas: () => { return null; }
//     }
// };
