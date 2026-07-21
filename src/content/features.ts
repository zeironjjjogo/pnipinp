import type { HandlerArgsContext, HandlerArgsContextBasis, IContext } from "@/content/util";

type NicoVideoFT = {
    readonly type: "nicovideo";
    readonly canvasRequired: true;
    readonly parentRequired: true;
    readonly selectors: {
        readonly parent: "div[data-name=stage]";
        readonly video: "div[data-name=stage] video[data-name=video-content]";
        readonly canvas: "div[data-name=stage] div[data-name=comment] > canvas";
    }
    readonly behaviours: {
        readonly type: "nicovideo";
        onAttributeModified(record: MutationRecord, kwargs: HandlerArgsContext): unknown;
        onChildListModified(record: MutationRecord, kwargs: HandlerArgsContext): unknown;
        onURLModified(kwargs: HandlerArgsContextBasis): unknown;
    }
};
const NicoVideoFT = {
    make(): NicoVideoFT {
        const selectors: {
            readonly parent: "div[data-name=stage]";
            readonly video: "div[data-name=stage] video[data-name=video-content]";
            readonly canvas: "div[data-name=stage] div[data-name=comment] > canvas";
        } = {
            parent: "div[data-name=stage]",
            video: "div[data-name=stage] video[data-name=video-content]",
            canvas: "div[data-name=stage] div[data-name=comment] > canvas"
        };
        return {
            type: "nicovideo",
            canvasRequired: true,
            parentRequired: true,
            selectors : selectors,
            behaviours: {
                type: "nicovideo",
                onAttributeModified(record, { collection, loadCanvas, getCanvas }) {
                    if (record.target !== getCanvas()) return;

                    if (record.attributeName) collection.append(record.attributeName);

                    if (collection.includes("width") && collection.includes("height")) {
                        console.log("finished canvas preparing");
                        collection.clear();
                        loadCanvas();
                    }
                },
                onChildListModified(record, { loadElements, releaseElements }) {
                    for (const node of record.addedNodes) {
                        if (!(node instanceof HTMLDivElement) || !node.matches(selectors.parent)) continue;
                        console.log("parent added");
                        if (!loadElements()) {
                            releaseElements();
                            console.log("Faild to loadElements on ChildListModified at nicovideo.");
                        }
                    }
                },
                onURLModified({ releaseElements }) {
                    releaseElements();
                }
            }
        } as const;
    }
};

type NicoVideoShortsFT = {
    readonly type: "nicovideo:shorts";
    readonly canvasRequired: true;
    readonly parentRequired: true;
    readonly selectors: {
        readonly parent: "div[data-state=active]";
        readonly video: "div[data-state=active] video[data-name=video-content]";
        readonly canvas: "div[data-state=active] div[data-name=comment] > canvas";
    }
    readonly behaviours: {
        readonly type: "nicovideo:shorts";
        onAttributeModified(record: MutationRecord, kwargs: HandlerArgsContext): unknown;
        onChildListModified(record: MutationRecord, kwargs: HandlerArgsContext): unknown;
    }
};
const NicoVideoShortsFT = {
    make(): NicoVideoShortsFT {
        const selectors: {
            readonly parent: "div[data-state=active]";
            readonly video: "div[data-state=active] video[data-name=video-content]";
            readonly canvas: "div[data-state=active] div[data-name=comment] > canvas";
        } = {
            parent: "div[data-state=active]",
            video: "div[data-state=active] video[data-name=video-content]",
            canvas: "div[data-state=active] div[data-name=comment] > canvas",
        };
        return {
            type: "nicovideo:shorts",
            parentRequired: true,
            canvasRequired: true,
            selectors: selectors,
            behaviours: {
                type: "nicovideo:shorts",
                onAttributeModified(record, { collection, loadCanvas, loadElements, releaseElements, getCanvas }) {
                    if (!(record.target instanceof HTMLElement)) return;
                    if (record.target.matches(selectors.parent)) {
                        console.log("set to be active");
                        if (!loadElements()) {
                            releaseElements();
                            console.log("Faild to loadElements on AttributeModified at nicovideo-shorts.");
                        }
                        return;
                    }
                    if (record.target !== getCanvas()) return;

                    if (record.attributeName) collection.append(record.attributeName);

                    if (collection.includes("width") && collection.includes("height")) {
                        console.log("finished canvas preparing");
                        collection.clear();
                        loadCanvas();
                    }
                },
                onChildListModified(record, { loadElements, releaseElements }) {
                    for (const node of record.addedNodes) {
                        if (!(node instanceof HTMLDivElement) || node.querySelectorAll("div[data-state]").length === 0) continue;
                        console.log("parent added");
                        if (!loadElements()) {
                            releaseElements();
                            console.log("Faild to loadElements on ChildListModified at nicovideo-shorts.");
                        }
                    }
                }
            }
        } as const;
    }
};

type LiveNicoVideoFT = {
    readonly type: "nicovideo:live";
    readonly canvasRequired: true;
    readonly parentRequired: false;
    readonly selectors: {
        readonly video: "video.___video___mddiR";
        readonly canvas: "div#comment-layer-container canvas";
    }
    readonly behaviours: {
        readonly type: "nicovideo:live";
        onAttributeModified(record: MutationRecord, kwargs: HandlerArgsContext): unknown;
    }
};
type YoutubeFT = {
    readonly type: "youtube";
    readonly canvasRequired: false;
    readonly parentRequired: false;
    readonly selectors: {
        readonly video: "ytd-watch-flexy video";
    }
    readonly behaviours: {
        readonly type: "youtube";
        onMetaDataLoaded(resize: () => unknown): unknown;
    }
};
type YoutubeShortsFT = {
    readonly type: "youtube:shorts";
    readonly canvasRequired: false;
    readonly parentRequired: false;
    readonly selectors: {
        readonly video: "ytd-shorts video";
    }
    readonly behaviours: {
        readonly type: "youtube:shorts";
        onMetaDataLoaded(resize: () => unknown): unknown;
    }
};
type DefaultsFT = {
    readonly type: "other";
    readonly canvasRequired: false;
    readonly parentRequired: false;
    readonly selectors: {
        readonly video: "video";
    }
    readonly behaviours: {
        readonly type: "other";
    }
};
export type AppFTs = NicoVideoFT | NicoVideoShortsFT | LiveNicoVideoFT | YoutubeFT | YoutubeShortsFT | DefaultsFT;

export class FeatureContext implements IContext<AppFTs> {
    private static readonly NicoVideo_FT: NicoVideoFT = NicoVideoFT.make();
    private static readonly NicoVideoShorts_FT: NicoVideoShortsFT = NicoVideoShortsFT.make();
    private static readonly LiveNicoVideo_FT: LiveNicoVideoFT = {
        type: "nicovideo:live",
        canvasRequired: true,
        parentRequired: false,
        selectors: {
            video: "video.___video___mddiR",
            canvas: "div#comment-layer-container canvas"
        },
        behaviours: {
            type: "nicovideo:live",
            onAttributeModified(record, { collection, loadCanvas, getCanvas }) {
                if (record.target !== getCanvas()) return;

                if (record.attributeName) collection.append(record.attributeName);

                if (collection.includes("width") && collection.includes("height")) {
                    collection.clear();
                    loadCanvas();
                }
            }
        }
    } as const;
    private static readonly Youtube_FT: YoutubeFT = {
        type: "youtube",
        canvasRequired: false,
        parentRequired: false,
        selectors: {
            video: "ytd-watch-flexy video"
        },
        behaviours: {
            type: "youtube",
            onMetaDataLoaded(resize) {
                console.log("loadstart");
                resize();
            }
        }
    } as const;
    private static readonly YoutubeShorts_FT: YoutubeShortsFT = {
        type: "youtube:shorts",
        canvasRequired: false,
        parentRequired: false,
        selectors: {
            video: "ytd-shorts video"
        },
        behaviours: {
            type: "youtube:shorts",
            onMetaDataLoaded(resize) {
                console.log("loadstart");
                resize();
            }
        }
    } as const;
    private static readonly Default_FT: DefaultsFT = {
        type: "other",
        canvasRequired: false,
        parentRequired: false,
        selectors: {
            video: "video"
        },
        behaviours: {
            type: "other"
        }
    } as const;

    private m_ft: AppFTs = this.updateValue();

    public _updateValue() {
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

    public updateValue() {
        const { hostname, pathname } = location;
        console.log(hostname, pathname);
        if (hostname === "www.nicovideo.jp") {
            if (pathname.startsWith("/watch/")) {
                return this.m_ft = FeatureContext.NicoVideo_FT;
            } else if (pathname.startsWith("/shorts/")) {
                return this.m_ft = FeatureContext.NicoVideoShorts_FT;
            }
        } else if (hostname === "live.nicovideo.jp") {
            if (pathname.startsWith("/watch/")) {
                return this.m_ft = FeatureContext.LiveNicoVideo_FT;
            }
        } else if (hostname === "www.youtube.com") {
            if (pathname.startsWith("/watch")) {
                return this.m_ft = FeatureContext.Youtube_FT;
            } else if (pathname.startsWith("/shorts")) {
                return this.m_ft = FeatureContext.YoutubeShorts_FT;
            }
        }
        return this.m_ft = FeatureContext.Default_FT;
    }

    public getValue() {
        return this.m_ft;
    }
};
