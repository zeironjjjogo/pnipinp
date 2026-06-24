type False_T = 0;
type True_T = 1;
type Bool_T = False_T | True_T;

const False: Bool_T = 0;
const True: Bool_T = 1;

class BoolBox {
    private v: 0 | 1 = 0;
    constructor(b: boolean) {
        this.v = b ? 1 : 0;
    }
    get val() {
        return this.v;
    }
};

class PlayButton {
    private readonly m_elem: HTMLButtonElement;
    private readonly PAUSED_TEXT: { [k in Bool_T]: string } = { 0: "Pause", 1: "Play" };

    constructor(button: HTMLButtonElement) {
        this.m_elem = button;
    }

};
class TimeDisplay {
    private readonly m_elem: HTMLSpanElement;
    private m_currentFlooredTime: number = -1;
    private m_currentFormattedTime: string = "00:00";
    private m_formattedDuration: string = "00:00";

    private genFormatted(): string {
        return `${this.m_currentFormattedTime} / ${this.m_formattedDuration}`;
    }

    constructor(display: HTMLSpanElement) {
        this.m_elem = display;
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
            formatted = s + (i !== 0) ? (":" + formatted) : "";

            if (t < 1) {
                return (i === 0 ? "00:" : "") + formatted;
            }
        }

        return time + ":" + formatted;
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

export class Control {
    private m_parentWnd: Window;
    private m_video: HTMLVideoElement | null;
    
    private readonly N_SPLITS: number = 10000;

    private readonly m_play_btn: HTMLButtonElement;
    private readonly m_time_display: HTMLSpanElement;
    private readonly m_video_slider: HTMLInputElement;
    private readonly m_close_btn: HTMLButtonElement;
    private readonly m_fit_btn: HTMLButtonElement;

    private readonly m_time_display_handler: TimeDisplay;

    constructor(wnd: Window, video: HTMLVideoElement | null = null) {
        this.m_parentWnd = wnd;
        this.m_video = video;

        const doc = wnd.document;

        this.m_play_btn = doc.createElement("button");
        this.m_play_btn.innerText = "▶";
        this.m_play_btn.addEventListener("pointerup", this.onClickPlayPause);

        this.m_time_display = doc.createElement("span");
        this.m_time_display_handler = new TimeDisplay(this.m_time_display);

        this.m_video_slider = doc.createElement("input");
        this.m_video_slider.type = "range";
        this.m_video_slider.min = "0";
        this.m_video_slider.max = String(this.N_SPLITS);
        this.m_video_slider.value = "0";
        this.m_video_slider.addEventListener("input", this.onSeek);

        this.m_close_btn = doc.createElement("button");
        this.m_close_btn.innerText = "Close";
        this.m_close_btn.addEventListener("pointerup", this.onClickClose);

        this.m_fit_btn = doc.createElement("button");
        this.m_fit_btn.innerText = "Fit";
        this.m_fit_btn.addEventListener("pointerup", this.onClickFit);
    }

    public setVideo(video: HTMLVideoElement): void {
        this.m_video = video;
    }

    public releaseVideo(): void {
        this.m_video = null;
    }

    private onClickPlayPause = async () => {
        if (!this.m_video) return;

        if (this.m_video.paused) {
            await this.m_video.play();
            this.m_play_btn.innerText = "Pause";
        } else {
            this.m_video.pause();
            this.m_play_btn.innerText = "Play";
        }
    };

    private onClickClose = () => {
        this.m_parentWnd.close();
        window.focus();
    };

    private onClickFit = () => {
        const doc = this.m_parentWnd.document;
    };

    private onSeek = () => {
        if (!this.m_video) return;
        this.m_video.currentTime = Number(this.m_video_slider.value) * this.m_video.duration / this.N_SPLITS;
    };
};
