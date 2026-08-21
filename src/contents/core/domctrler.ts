import { Controller } from "@/core/controller/controller";
import { VideoController } from "@/core/controller/videoctrler";
import { DOMContents } from "@/core/player/domcontents";
import type { FeatureContext } from "@/ctx/features";
import { ConfigHolder } from "@/ctx/config";
import { VideoHandler } from "@/core/videohandler";

export class DOMCtrler {
    private readonly m_contents: DOMContents;
    private readonly m_controller: Controller;

    private readonly m_videoController: VideoController;
    private readonly m_videoHandler: VideoHandler;

    private readonly m_ftCtx: FeatureContext;

    get contents() { return this.m_contents; }
    get controller() { return this.m_controller; }

    constructor(wnd: Window, ft: FeatureContext) {
        const doc = wnd.document;

        const mainContainer = doc.createElement("div");
        mainContainer.classList.add("main");

        this.m_videoController = new VideoController(ft);
        this.m_videoHandler = new VideoHandler();

        const contents = new DOMContents(wnd, ft);
        const controller = new Controller(wnd, this.m_videoController);
        
        mainContainer.appendChild(contents.container);
        mainContainer.appendChild(controller.element);

        doc.body.appendChild(mainContainer);

        this.m_contents = contents;
        this.m_controller = controller;
        this.m_ftCtx = ft;
    
        this.initBound();

        const config = ConfigHolder.getConfig();
        if (config && config.clickToPlay) {
            this.m_contents.container.addEventListener("pointerup", () => {
                this.m_videoController.togglePlaying();
            });
        }
    }

    public initBound() {
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

    public reloadElement(): boolean {
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

    public reloadCanvas(): void {
        this.m_contents.pullCanvas();
    }

    public releaseElement() {
        this.m_videoHandler.unsetVideo();
        this.m_videoController.unsetVideo();
        this.m_contents.pushContents();
    }

    public dispose() {
        this.releaseElement();
    }
};
