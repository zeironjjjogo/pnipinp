import { Controller } from "@/core/controller/controller";
import { VideoController } from "@/core/controller/videoctrler";
import { DOMContents } from "@/core/player/domcontents";
import type { FeatureContext } from "@/context/features";
import { ConfigHolder } from "@/context/config";

export class DOMCtrler {
    private readonly m_contents: DOMContents;
    private readonly m_controller: Controller;

    private readonly m_videoController: VideoController;

    get contents() { return this.m_contents; }
    get controller() { return this.m_controller; }

    constructor(wnd: Window, ft: FeatureContext) {
        const doc = wnd.document;

        const mainContainer = doc.createElement("div");
        mainContainer.classList.add("main");

        this.m_videoController = new VideoController();

        const contents = new DOMContents(wnd, ft);
        const controller = new Controller(wnd, this.m_videoController);
        
        mainContainer.appendChild(contents.container);
        mainContainer.appendChild(controller.element);

        doc.body.appendChild(mainContainer);

        this.m_contents = contents;
        this.m_controller = controller;

        const config = ConfigHolder.getConfig();
        if (config && config.clickToPlay) {
            this.m_contents.container.addEventListener("pointerup", () => {
                this.m_videoController.togglePlaying();
            });
        }
    }

    public resizeContents(): void {
        this.m_contents.requestResize();
    }

    public reloadElement(): boolean {
        const result = this.m_contents.pullContents();
        const video = this.m_contents.video.element;
        if (video)
            this.m_videoController.setVideo(video);
        return result;
    }

    public reloadCanvas(): void {
        this.m_contents.pullCanvas();
    }

    public releaseElement() {
        this.m_videoController.unsetVideo();
        this.m_contents.pushContents();
    }

    public dispose() {
        this.releaseElement();
    }
};
