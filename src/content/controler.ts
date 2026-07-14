type False_T = 0;
type True_T = 1;
type Bool_T = False_T | True_T;

const False: Bool_T = 0;
const True: Bool_T = 1;

function b2bt(b: boolean): Bool_T { return b ? True : False; }

class PlayButton {
    private readonly m_elem: HTMLAnchorElement;
    private readonly PAUSED_TEXT: { [k in Bool_T]: string } = { 0: "Ⅱ", 1: "▶" };

    get button() { return this.m_elem; }

    constructor(document: Document) {
        this.m_elem = document.createElement("a");
        this.m_elem.classList.add("a-button", "playing");
        this.m_elem.innerHTML = `<img width="24" height="24" src="https://img.icons8.com/?size=24&id=5722&format=png&color=ffffff" alt="play--v1" id="play-btn"><img width="24" height="24" src="https://img.icons8.com/?size=24&id=85882&format=png&color=ffffff" alt="pause--v1" id="pause-btn">`;
        this.setState(true);
    }
    
    public setState(paused: boolean): void {
        // this.m_elem.innerText = this.PAUSED_TEXT[b2bt(paused)];
        if (paused) {
            this.m_elem.classList.remove("playing");
            this.m_elem.classList.add("pausing");
        }
        else {
            this.m_elem.classList.remove("pausing");
            this.m_elem.classList.add("playing");
        }
    }
};

// class PlayButton {
//     private readonly m_elem: HTMLButtonElement;
//     private readonly PAUSED_TEXT: { [k in Bool_T]: string } = { 0: "Ⅱ", 1: "▶" };

//     constructor(button: HTMLButtonElement) {
//         this.m_elem = button;
//         this.m_elem.classList.add("ctrlleft");
//         this.setState(true);
//     }

//     public setState(paused: boolean): void {
//         this.m_elem.innerText = this.PAUSED_TEXT[b2bt(paused)];
//     }
// };

class TimeDisplay {
    private readonly m_elem: HTMLSpanElement;
    private m_currentFlooredTime: number = -1;
    private m_currentFormattedTime: string = "00:00";
    private m_formattedDuration: string = "00:00";

    private genFormatted(): string {
        return `${this.m_currentFormattedTime}/${this.m_formattedDuration}`;
    }

    constructor(display: HTMLSpanElement) {
        this.m_elem = display;
        this.m_elem.id = "time-display";
        this.m_elem.classList.add("ctrlleft");
        this.m_elem.innerText = this.genFormatted();
    }

    private static formatTime(sec: number): string {
        const f02d = (s: number): string => {
            if (s < 10) {
                return "0" + Math.floor(s);
            } else {
                return String(Math.floor(s));
            }
        };

        const divby60 = (n: number): {t: number, s: string} => {
            const m = n % 60;
            return { t: (n - m) / 60, s: f02d(m) };
        };

        let formatted = "";
        let time = sec;
        for (let i = 0; i < 2; i++) {
            const { t, s } = divby60(time);

            time = t;
            formatted = s + ((i !== 0) ? (":" + formatted) : "");

            if (t < 1) {
                return (i === 0 ? "00:" : "") + formatted;
            }
        }

        return time + ":" + formatted;
    }

    public updateDuration(sec: number) {
        this.m_formattedDuration = TimeDisplay.formatTime(Math.floor(sec));
        this.m_elem.innerText = this.genFormatted();
    }

    public updateTime(sec: number) {
        const floored = Math.floor(sec);
        if (floored === this.m_currentFlooredTime) {
            return;
        }

        this.m_currentFlooredTime = floored;
        this.m_currentFormattedTime = TimeDisplay.formatTime(floored);
        this.m_elem.innerText = this.genFormatted();
    }
};

class VideoSlider {
    private readonly m_elem: HTMLInputElement;
    private readonly N_SPLITS = 10000;

    constructor(slider: HTMLInputElement) {
        this.m_elem = slider;
        this.m_elem.type = "range";
        this.m_elem.min = "0";
        this.m_elem.max = String(this.N_SPLITS);
    }

    public getPosition(): number {
        return Number(this.m_elem.value) / this.N_SPLITS;
    }

    public setPostion(pos: number): void {
        this.m_elem.value = String(pos * this.N_SPLITS);
    }
};

type EventHandler_T = ((e: Event) => unknown);
class VideoHandler {
    private readonly m_video: HTMLVideoElement;
    private readonly m_handler: EventHandler_T;

    constructor(video: HTMLVideoElement, handler: EventHandler_T) {
        this.m_video = video;
        this.m_handler = handler;

        this.m_video.addEventListener("durationchange", this.m_handler);
        this.m_video.addEventListener("timeupdate", this.m_handler);
        this.m_video.addEventListener("play", this.m_handler);
        this.m_video.addEventListener("pause", this.m_handler);
    }

    destructor(): void {
        this.m_video.removeEventListener("durationchange", this.m_handler);
        this.m_video.removeEventListener("timeupdate", this.m_handler);
        this.m_video.removeEventListener("play", this.m_handler);
        this.m_video.removeEventListener("pause", this.m_handler);
    }

    public setPosition(pos: number): void {
        this.m_video.currentTime = pos * this.m_video.duration;
    }

    public getDuration(): number {
        return this.m_video.duration;
    }

    public getTime(): number {
        return this.m_video.currentTime;
    }

    public getPosition(): number {
        return this.m_video.currentTime / this.m_video.duration;
    }
};

export class Control {
    private readonly m_parentWnd: Window;

    private m_video: HTMLVideoElement | null;
    private m_video_handler: VideoHandler | null;

    private readonly m_control_frame: HTMLDivElement;
    
    // private readonly m_play_btn: HTMLButtonElement;
    private readonly m_play_btn: HTMLAnchorElement;
    private readonly m_time_display: HTMLSpanElement;
    private readonly m_video_slider: HTMLInputElement;
    // private readonly m_close_btn: HTMLButtonElement;
    private readonly m_close_btn: HTMLAnchorElement;

    private readonly m_play_btn_handler: PlayButton;
    private readonly m_time_display_handler: TimeDisplay;
    private readonly m_video_slider_handler: VideoSlider;

    constructor(wnd: Window, video: HTMLVideoElement | null = null) {
        this.m_parentWnd = wnd;
        this.m_video = video;
        this.m_video_handler = video ? new VideoHandler(video, this.onModifyVideo) : null;

        const doc = wnd.document;

        this.m_control_frame = doc.createElement("div");
        this.m_control_frame.id = "ctrler";
        this.m_control_frame.classList.add("row-flex", "space-between-flex");

        // this.m_play_btn = doc.createElement("button");
        // this.m_play_btn_handler = new PlayButton(this.m_play_btn);
        this.m_play_btn_handler = new PlayButton(doc);
        this.m_play_btn = this.m_play_btn_handler.button;
        this.m_play_btn.addEventListener("pointerup", this.onClickPlayPause);

        this.m_time_display = doc.createElement("span");
        this.m_time_display_handler = new TimeDisplay(this.m_time_display);

        this.m_video_slider = doc.createElement("input");
        this.m_video_slider_handler = new VideoSlider(this.m_video_slider);
        this.m_video_slider.addEventListener("input", this.onSeek);

        this.m_close_btn = doc.createElement("a");
        // this.m_close_btn = doc.createElement("button");
        this.m_close_btn.classList.add("rightside-ctrl", "a-button");
        // this.m_close_btn.innerText = "Close";
        this.m_close_btn.innerHTML = `<img width="24" height="24" src="https://img.icons8.com/?size=24&id=83376&format=png&color=ffffff" />`;
        this.m_close_btn.addEventListener("pointerup", this.onClickClose);

        this.m_control_frame.appendChild(this.m_play_btn);
        this.m_control_frame.appendChild(this.m_time_display);
        this.m_control_frame.appendChild(this.m_video_slider);
        this.m_control_frame.appendChild(this.m_close_btn);
    }

    get element(): HTMLDivElement {
        return this.m_control_frame;
    }

    public setVideo(video: HTMLVideoElement): void {
        this.m_video = video;
        this.m_video_handler = new VideoHandler(this.m_video, this.onModifyVideo);
        this.updateElements();
    }

    public releaseVideo(): void {
        this.m_video_handler?.destructor();
        this.m_video = null;
    }

    public updateElements(): void {
        if (!this.m_video || !this.m_video_handler) return;

        this.m_play_btn_handler.setState(this.m_video.paused);
        this.onDurationChange();
        this.onTimeUpdate();
    }

    private onModifyVideo = (event: Event) => {
        if (!this.m_video || !this.m_video_handler) return;

        switch (event.type) {
            case "durationchange":
                this.onDurationChange();
                break;
            case "timeupdate":
                this.onTimeUpdate();
                break;
            case "play":
                this.onPlay();
                break;
            case "pause":
                this.onPause();
                break;
        }
    };

    private onDurationChange = () => {
        if (!this.m_video || !this.m_video_handler) return;
        this.m_time_display_handler.updateDuration(this.m_video_handler.getDuration());
    };

    private onTimeUpdate = () => {
        if (!this.m_video || !this.m_video_handler) return;
        this.m_time_display_handler.updateTime(this.m_video_handler.getTime());
        this.m_video_slider_handler.setPostion(this.m_video_handler.getPosition());
    };

    private onPlay = () => {
        this.m_play_btn_handler.setState(false);
    };

    private onPause = () => {
        this.m_play_btn_handler.setState(true);
    };

    private onClickPlayPause = async () => {
        if (!this.m_video) return;

        if (this.m_video.paused) {
            await this.m_video.play();
        } else {
            this.m_video.pause();
        }

        this.m_play_btn_handler.setState(this.m_video.paused);
    };

    private onClickClose = () => {
        this.m_parentWnd.close();
        window.focus();
    };

    private onSeek = () => {
        if (!this.m_video || !this.m_video_handler) return;
        this.m_video_handler.setPosition(this.m_video_slider_handler.getPosition());
    };
};
