type EventCallback_T = (event: Event) => void;
interface IListenerManager<Elem extends HTMLElement, EventMap extends HTMLElementEventMap> {
    bind<K extends keyof EventMap>(keys: K[], callback: EventCallback_T): void;
};

class VideoListenerManager implements IListenerManager<HTMLVideoElement, HTMLVideoElementEventMap> {
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

interface VideoControllerEventsEmptyData {};

interface VideoControllerEvents {
    durationchange: (data: VideoControllerEventsEmptyData | { duration: number }) => void;
    timeupdate: (data: VideoControllerEventsEmptyData | { time: number; position: number; }) => void;
    play: (_: VideoControllerEventsEmptyData) => void;
    pause: (_: VideoControllerEventsEmptyData) => void;
};

function itsIncludes<T extends {}>(obj: string | number | symbol, container: T): obj is (keyof T) {
    return obj in container;
}

const nullFunc = () => {};

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

    public setVideo(video: HTMLVideoElement): void {
        this.unsetVideo();
        this.m_video = video;
        this.m_manager = new VideoListenerManager(video, VideoController.ListeningEvents, this.m_videoHandler);
        this.invokeInit();
    }

    public unsetVideo(): void {
        this.m_manager?.unbind(VideoController.ListeningEvents, this.m_videoHandler);
        this.m_video = null;
    }

    public setCallback<K extends keyof VideoControllerEvents>(type: K, callback: VideoControllerEvents[K]): void {
        this.m_callbacks[type] = callback;
    }

    public invokeInit(): void {
        if (!this.m_video) return;

        this.m_videoHandler({type: "durationchange"});
        this.m_videoHandler({type: "timeupdate"});
    }

    private m_videoHandler = (event: { readonly type: string }) => {
        if (!this.m_video || !itsIncludes(event.type, this.m_callbacks)) return;

        let args = {};
        switch (event.type) {
            case "durationchange": {
                args = { duration: this.m_video.duration };
                break;
            }
            case "timeupdate": {
                args = { time: this.m_video.currentTime, position: this.m_video.currentTime / this.m_video.duration };
                break;
            }
        }
        
        this.m_callbacks[event.type](args);
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

    public setVideoPosition(pos: number): void {
        if (!this.m_video) return;
        this.m_video.currentTime = pos * this.m_video.duration;   
    }
};
