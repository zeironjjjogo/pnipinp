import { containsKey, nullFunc, VideoListenerManager } from "@/util/util";

const ListeningEvents = [
    "durationchange",
    "play",
    "pause",
    "timeupdate",

    "loadedmetadata",
    "resize"
] as const;

type ListenTypes = typeof ListeningEvents[number];

interface VideoEventData {
    readonly duration: number;
    readonly curTime: number;
}
type VideoEventHandler = (data: VideoEventData) => unknown;
type VideoEventHandlers = { [K in ListenTypes]: VideoEventHandler; };

export class VideoHandler {
    private m_video: HTMLVideoElement | null = null;
    private m_manager: VideoListenerManager | null = null;

    private static initEmptyHandlers() {
        const dst: Partial<VideoEventHandlers> = {};
        for (const k of ListeningEvents) {
            dst[k] = nullFunc;
        }
        return dst as VideoEventHandlers;
    }

    private m_handlers: VideoEventHandlers = VideoHandler.initEmptyHandlers();

    private m_dispatch = ({ type }: Event) => {
        if (this.m_video && containsKey(type, this.m_handlers))
            this.m_handlers[type]({
                duration: this.m_video.duration,
                curTime: this.m_video.currentTime
            });
    };

    public unsetVideo() {
        this.m_manager?.unbind(ListeningEvents, this.m_dispatch);
        this.m_video = null;
    }

    public setVideo(video: HTMLVideoElement) {
        if (this.m_video || this.m_manager) {
            this.unsetVideo();
        }
        this.m_video = video;
        this.m_manager = new VideoListenerManager(
            video,
            ListeningEvents,
            this.m_dispatch
        );
        this.initInvoke();
    }

    public setHandler(type: ListenTypes, handler: VideoEventHandler) {
        this.m_handlers[type] = handler;
    }

    public unsetHandler(type: ListenTypes) {
        this.m_handlers[type] = nullFunc;
    }

    public invoke(type: ListenTypes, data: VideoEventData) {
        return this.m_handlers[type](data);
    }
    private initInvoke() {
        if (!this.m_video) return;
        const data: VideoEventData = {
            duration: this.m_video.duration,
            curTime: this.m_video.currentTime
        };
        this.invoke("durationchange", data);
        this.invoke("timeupdate", data);
        this.invoke(this.m_video.paused ? "pause" : "play", data);
    }
};
