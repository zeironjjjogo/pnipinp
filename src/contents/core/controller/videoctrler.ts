import type { IController } from "@/util/util";
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
    private m_video: HTMLVideoElement | null = null;
    private readonly m_ftCtx: FeatureContext;
    private m_ft: AppFTs | null = null;
    private m_ft_ctrl: IController | null = null;

    constructor(ftCtx: FeatureContext) {
        this.m_ftCtx = ftCtx;
    }

    public setVideo(video: HTMLVideoElement): void {
        this.unsetVideo();
        this.m_video = video;
        this.m_ft = this.m_ftCtx.getValue();
        try {
            this.m_ft_ctrl = this.m_ft.controllerType !== "none" ? new this.m_ft.controller() : null;
        } catch (e) {
            this.m_ft_ctrl = null;
        }
    }

    public unsetVideo(): void {
        this.m_video = null;
        this.m_ft = null;
        this.m_ft_ctrl?.dispose();
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

    public setVideoCurrent(sec: number) {
        if (!this.m_video) return;
        if (this.m_ft_ctrl && this.m_ft_ctrl.isValid()) {
            this.m_ft_ctrl.setCur(sec);
            console.log("ft_ctrl");
            return;
        }
        this.m_video.currentTime = sec;
    }
};
