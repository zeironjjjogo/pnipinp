import { Controller } from "@/core/controller/controller";
import { VideoController } from "@/core/controller/videoctrler";
import { DOMContents } from "@/core/player/domcontents";
import type { FeatureContext } from "@/ctx/features";
import { ConfigHolder } from "@/ctx/config";
import { VideoHandler } from "@/core/videohandler";
import { nicovideoSkipButtonSelectors } from "@/util/util";

import sampleImg from "@/core/sample.png";

export class DOMCtrler {
    private readonly m_contents: DOMContents;
    private readonly m_controller: Controller;

    private readonly m_videoController: VideoController;
    private readonly m_videoHandler: VideoHandler;

    private readonly m_ftCtx: FeatureContext;

    get contents() { return this.m_contents; }
    get controller() { return this.m_controller; }

    constructor(wnd: Window, ftCtx: FeatureContext) {
        const doc = wnd.document;

        const mainContainer = doc.createElement("div");
        mainContainer.classList.add("main");

        this.m_videoController = new VideoController(ftCtx);
        this.m_videoHandler = new VideoHandler();

        const contents = new DOMContents(wnd, ftCtx);
        const controller = new Controller(wnd, this.m_videoController);
        
        mainContainer.appendChild(contents.container);
        mainContainer.appendChild(controller.element);

        doc.body.appendChild(mainContainer);
        this.m_contents = contents;
        this.m_controller = controller;
        this.m_ftCtx = ftCtx;
    
        wnd.addEventListener("keydown", (event) => {
            if (event.key === " " || event.key === "Spacebar")
            this.m_videoController.togglePlaying();
        });
        wnd.addEventListener("wheel", (event) => {
            if (event.deltaY === 0) return;
            const ft = this.m_ftCtx.getValue();
            if (!("onWheel" in ft.behaviours)) return;
            ft.behaviours.onWheel(event);
        });
        wnd.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && this.m_ftCtx.getValue().type === "nicovideo") {
                const skipButton = (() => {
                    for (const selector of nicovideoSkipButtonSelectors) {
                        const result = document.querySelector(selector);
                        if (result) {
                            console.log("skipButton found: ", result);
                            return result;
                        }
                    }
                    return null;
                })();
                console.log("backspce: ", skipButton);
                if (!skipButton) return;
                const rect = skipButton.getBoundingClientRect();
                const result = skipButton.dispatchEvent(new MouseEvent("click", {
                    bubbles: true,
                    clientX: rect.left + rect.width * 0.5,
                    clientY: rect.top + rect.height * 0.5
                }));
                console.log("skipping result: ", result);
            } else if (event.key === "F8" && this.m_ftCtx.getValue().type === "nicovideo") {
                console.log("pressed F8");
                const stage = document.querySelector("div[data-name=stage]");
                if (stage) {
                    const rect = stage.getBoundingClientRect();
                    console.log(stage.clientLeft, stage.clientTop, stage.clientWidth, stage.clientHeight);
                    const sw = stage.clientWidth / 7, sh = stage.clientHeight / 11;
                    console.log(sw, sh);
                    const w = sw * 6 + (sw >>> 1), h = sh * 7 + (sh >>> 1);
                    const img = document.createElement("img");
                    img.src = sampleImg;
                    img.style.left = rect.left + w + "px";
                    img.style.top = rect.top + h + "px";
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.position = "absolute";
                    const res = document.dispatchEvent(new MouseEvent("click", {
                        bubbles: true,
                        clientX: rect.left + w,
                        clientY: rect.top + h
                    }));
                    console.log("pos: ", rect.left + w, " x ", rect.top + h, "\tskip stage, ", res);
                    document.body.appendChild(img);
                    console.log(img);
                    
                } else console.log("stage not found");
            }
        });

        this.initBound();

        const config = ConfigHolder.getConfig();
        if (config && config.clickToPlay) {
            this.m_contents.container.addEventListener("pointerup", () => {
                this.m_videoController.togglePlaying();
            });
        }
    }

    public getVideo(): HTMLVideoElement | null {
        return this.contents.video.element;
    }

    public getCanvas(): HTMLCanvasElement | null {
        return this.contents.canvas.element;
    }

    private initBound(): void {
        this.m_videoHandler.setHandler("durationchange", (data) => {
            this.m_controller.setDuration(data.duration);
        });
        this.m_videoHandler.setHandler("pause", () => {
            this.m_controller.setPaused(true);
        });
        this.m_videoHandler.setHandler("play", () => {
            this.m_controller.setPaused(false);
        });
        this.m_videoHandler.setHandler("timeupdate", (data) => {
            this.m_controller.setCurTime(data.curTime);
        });
    }

    public resizeContents(): void {
        this.m_contents.resize();
    }

    public updateContents(): boolean {
        const result = this.m_contents.pullContents();

        const video = this.m_contents.video.element;
        if (video) {
            this.m_videoHandler.setVideo(video);
            this.m_videoController.setVideo(video);
        }

        const ft = this.m_ftCtx.getValue();
        if (ft.type === "youtube") {
            this.m_videoHandler.setHandler("resize", this.m_contents.fixSize);
        } else {
            this.m_videoHandler.unsetHandler("resize");
        }
        
        return result;
    }

    public updateCanvas(): void {
        this.m_contents.pullCanvas();
    }

    public releaseContents(): void {
        this.m_videoHandler.unsetVideo();
        this.m_videoController.unsetVideo(true);
        this.m_contents.pushContents();
    }

    public dispose(): void {
        this.releaseContents();
    }
};
