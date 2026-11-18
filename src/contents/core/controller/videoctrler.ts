import type { IAdditionalController } from "@/util/util";
import type { AppFTs, FeatureContext } from "@/ctx/features";

type VideoPlaying = {
    state: "playing";
};
type VideoPausing = {
    state: "pausing";
};
type VideoInvalid = {
    state: "invalid";
};

export type VideoState = VideoPlaying | VideoPausing | VideoInvalid;

export class VideoController {
    private readonly m_ftCtx: FeatureContext;
    private m_video: HTMLVideoElement | null = null;
    private m_ft: AppFTs | null = null;
    private m_addCtrl: IAdditionalController | null = null;

    private m_stopOnDispose: boolean = true;

    constructor(ftCtx: FeatureContext) {
        this.m_ftCtx = ftCtx;
    }

    public requestStopOnNextUnset(stop: boolean): void {
        this.m_stopOnDispose = stop;
        setTimeout(() => {
            this.m_stopOnDispose = true;
        }, 500);
    }

    public setVideo(video: HTMLVideoElement): void {
        this.unsetVideo();
        this.m_video = video;
        this.m_ft = this.m_ftCtx.getValue();
        try {
            this.m_addCtrl = this.m_ft.controllerType !== "none" ? new this.m_ft.controller() : null;
        } catch (e) {
            this.m_addCtrl = null;
        }
    }

    public unsetVideo(): void {
        if (this.m_stopOnDispose) {
            this.m_video?.pause();
        } else {
            this.m_stopOnDispose = true;
        }

        this.m_video = null;
        this.m_ft = null;
        this.m_addCtrl?.dispose();
    }

    public togglePlaying(): VideoState {
        if (!this.m_video) return { state: "invalid" };

        let state: VideoState = { state: "invalid" };

        if (this.m_video.paused) {
            this.m_video.play();
            state = { state: "playing" };
        } else {
            this.m_video.pause();
            state = { state: "pausing" };
        }

        return state;
    }

    public setCurrentPos(sec: number) {
        if (!this.m_video) return;
        if (
            this.m_addCtrl &&
            this.m_addCtrl.isValid() &&
            this.m_addCtrl.setCur(sec)
        ) return;
        this.m_video.currentTime = sec;
    }
};
