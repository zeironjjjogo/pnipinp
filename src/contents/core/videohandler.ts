import { containsKey, nullFunc, VideoListenerManager, type ConstEventTypesArray } from "@/util/util";

const ListeningTypesList = [
    "durationchange",
    "play",
    "pause",
    "timeupdate",

    "loadedmetadata",
    "resize"
] as const;

type ListeningTypes = typeof ListeningTypesList[number];

interface VideoEventData {
    readonly duration: number;
    readonly curTime: number;
};
type VideoEventHandler = (data: VideoEventData) => void;
type VideoEventHandlersDict = { [T in ListeningTypes]: VideoEventHandler; };

export class VideoHandler {
    private m_video: HTMLVideoElement | null = null;
    private m_manager: VideoListenerManager | null = null;

    private static initEmptyHandlers() {
        const dst: Partial<VideoEventHandlersDict> = {};
        for (const k of ListeningTypesList) {
            dst[k] = nullFunc;
        }
        return dst as VideoEventHandlersDict;
    }

    private m_handlers: VideoEventHandlersDict = VideoHandler.initEmptyHandlers();

    private m_dispatchEvents = ({ type }: Event) => {
        if (!this.m_video || !containsKey(type, this.m_handlers)) return;
        this.invoke(type, {
            duration: this.m_video.duration,
            curTime: this.m_video.currentTime
        });
    };

    private registerHandlers() {
        for (const type of ListeningTypesList)
            this.m_video?.addEventListener(type, this.m_dispatchEvents);
    }
    private unregisterHandlers() {
        for (const type of ListeningTypesList)
            this.m_video?.removeEventListener(type, this.m_dispatchEvents);
    }

    public unsetVideo() {
        // this.m_manager?.unbind(ListeningTypesList, this.m_dispatchEvents);
        this.unregisterHandlers();
        this.m_video = null;
    }

    public setVideo(video: HTMLVideoElement) {
        if (this.m_video || this.m_manager) {
            this.unsetVideo();
        }
        this.m_video = video;
        this.registerHandlers();
        // this.m_manager = new VideoListenerManager(
        //     video,
        //     ListeningTypesList,
        //     this.m_dispatchEvents
        // );
        this.initInvoke();
    }

    public setHandler(type: ListeningTypes, handler: VideoEventHandler) {
        this.m_handlers[type] = handler;
    }

    public unsetHandler(type: ListeningTypes) {
        this.m_handlers[type] = nullFunc;
    }

    public invoke(type: ListeningTypes, data: VideoEventData) {
        this.m_handlers[type](data);
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
