import type IController from "@/@types/controller";
import type { AppFTs, FeatureContext } from "@/ctx/features";
import { containsKey, executeBoundFunc, nullFunc, type ArgsType, type BoundFunc, type ValueOf } from "@/util/util";

type EventCallback_T = (event: Event) => void;
class VideoListenerManager {
    private readonly m_element: HTMLVideoElement;

    constructor(
        element: HTMLVideoElement,
        types: (keyof HTMLVideoElementEventMap)[] | null = null,
        callback: EventCallback_T | null = null
    ) {
        this.m_element = element;
        if (types && callback) {
            this.bind(types, callback);
        }
    }

    public bind<K extends keyof HTMLVideoElementEventMap>(types: K[], callback: EventCallback_T): void {
        for (const type of types) {
            this.m_element.addEventListener(type, callback);
        }
    }
    public unbind(types: (keyof HTMLVideoElementEventMap)[], callback: EventCallback_T): void {
        for (const type of types) {
            this.m_element.removeEventListener(type, callback);
        }
    }
};

interface VideoControllerDurationChangeEventData {
    duration: number;
};
interface VideoControllerTimeUpdateEventData {
    time: number;
    position: number;
};

interface VideoControllerEvents {
    durationchange: (data: VideoControllerDurationChangeEventData) => void;
    timeupdate: (data: VideoControllerTimeUpdateEventData) => void;
    play: () => void;
    pause: () => void;
};

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
    private m_manager: VideoListenerManager | null = null;
    private readonly m_ftCtx: FeatureContext;
    private m_ft: AppFTs | null = null;
    private m_ft_ctrl: IController | null = null;

    private static readonly ListeningEvents: (keyof HTMLVideoElementEventMap)[] = [
        "durationchange",
        "timeupdate",
        "play",
        "pause"
    ];

    private m_callbacks: VideoControllerEvents = {
        durationchange: nullFunc,
        timeupdate: nullFunc,
        play: nullFunc,
        pause: nullFunc
    };

    constructor(ftCtx: FeatureContext) {
        this.m_ftCtx = ftCtx;
    }

    public setVideo(video: HTMLVideoElement): void {
        this.unsetVideo();
        this.m_video = video;
        this.m_manager = new VideoListenerManager(video, VideoController.ListeningEvents, this.m_videoHandler);
        this.m_ft = this.m_ftCtx.getValue();
        this.m_ft_ctrl = this.m_ft.controllerRequired ? new this.m_ft.controller() : null;
        this.invokeInit();
    }

    public unsetVideo(): void {
        this.m_manager?.unbind(VideoController.ListeningEvents, this.m_videoHandler);
        this.m_video = null;
        this.m_ft = null;
    }

    public setCallback<K extends keyof VideoControllerEvents>(type: K, callback: VideoControllerEvents[K]): void {
        this.m_callbacks[type] = callback;
    }

    public invokeInit(): void {
        if (!this.m_video) return;

        this.m_videoHandler({type: "durationchange"});
        this.m_videoHandler({type: "timeupdate"});
        this.m_videoHandler({type: this.m_video.paused ? "pause": "play"});
    }

    private m_videoHandler = (event: { readonly type: string }) => {
        if (!this.m_video || !containsKey(event.type, this.m_callbacks)) return;

        let bound: BoundFunc<ArgsType<ValueOf<typeof this.m_callbacks, typeof event.type>>, void> = {
            func: this.m_callbacks[event.type],
            args: []
        };

        switch (event.type) {
            case "durationchange": {
                bound.args[0] = { duration: this.m_video.duration };
                break;
            }
            case "timeupdate": {
                bound.args[0] = { time: this.m_video.currentTime, position: this.m_video.currentTime / this.m_video.duration };
                break;
            }
        }
        
        executeBoundFunc(bound);
    };

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
        if (this.m_ft_ctrl && "setCur" in this.m_ft_ctrl) {
            this.m_ft_ctrl.setCur(sec);
            return;
        }
        this.m_video.currentTime = sec;
    }
};
