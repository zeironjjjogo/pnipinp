import { ConfigHolder } from "@/context/config";
import type { VideoController } from "@/core/controller/videoctrler";

class AButton {
    protected readonly m_elem: HTMLAnchorElement;
    get element(): HTMLAnchorElement { return this.m_elem; }
    constructor(doc: Document) {
        this.m_elem = doc.createElement("a");
    }
};

class PlayButton extends AButton {
    private static readonly m_CLASS_PLAYING = "play-button--playing";
    private static readonly m_CLASS_PAUSING = "play-button--pausing";

    constructor(doc: Document) {
        super(doc);
        this.m_elem.classList.add("play-button", PlayButton.m_CLASS_PLAYING);
        this.m_elem.innerHTML = `<img width="24" height="24" src="https://img.icons8.com/?size=24&id=5722&format=png&color=ffffff" alt="play--v1" id="play-btn" class="img-button--play thema--dark" /><img width="24" height="24" src="https://img.icons8.com/?size=24&id=85882&format=png&color=ffffff" alt="pause--v1" id="pause-btn" class="img-button--pause thema--dark" />
        <img width="24" height="24" src="https://img.icons8.com/?size=24&id=5722&format=png&color=000000" alt="play--v1" id="play-btn" class="img-button--play thema--light" /><img width="24" height="24" src="https://img.icons8.com/?size=24&id=85882&format=png&color=000000" alt="pause--v1" id="pause-btn" class="img-button--pause thema--light" />`;
        this.setState(true);
    }
    
    public setState(paused: boolean): void {
        if (paused) {
            this.m_elem.classList.remove(PlayButton.m_CLASS_PLAYING);
            this.m_elem.classList.add(PlayButton.m_CLASS_PAUSING);
        }
        else {
            this.m_elem.classList.remove(PlayButton.m_CLASS_PAUSING);
            this.m_elem.classList.add(PlayButton.m_CLASS_PLAYING);
        }
    }
};

class CloseButton extends AButton {
    constructor(doc: Document) {
        super(doc);
        this.m_elem.classList.add("close-button");
        this.m_elem.innerHTML = `<img width="24" height="24" src="https://img.icons8.com/?size=24&id=83376&format=png&color=ffffff" class="img-button--close thema--dark" />
        <img width="24" height="24" src="https://img.icons8.com/?size=24&id=83376&format=png&color=000000" class="img-button--close thema--light" />`;
    }
};

class TimeDisplay {
    private readonly m_elem: HTMLSpanElement;
    private m_currentFlooredTime: number = -1;
    private m_currentFormattedTime: string = "00:00";
    private m_formattedDuration: string = "00:00";

    private genFormatted(): string {
        return `${this.m_currentFormattedTime}/${this.m_formattedDuration}`;
    }

    get element(): HTMLSpanElement { return this.m_elem; }

    constructor(doc: Document) {
        this.m_elem = doc.createElement("span");
        this.m_elem.id = "time-display";
        this.m_elem.classList.add("time-display");
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
    private m_length: number = 100;

    get element(): HTMLInputElement { return this.m_elem; }

    constructor(doc: Document) {
        this.m_elem = doc.createElement("input");
        this.m_elem.type = "range";
        this.m_elem.min = "0";
        this.m_elem.max = String(this.m_length);
        this.m_elem.classList.add("progress-bar");
    }

    public setRange(range: number) {
        this.m_elem.max = String(range);
    }

    public setTime(sec: number) {
        this.m_elem.value = String(sec);
    }
    public getTime() {
        return Number(this.m_elem.value);
    }
};

export class Controller {
    private readonly m_videoCtrler: VideoController;

    private readonly m_controllerFrame: HTMLDivElement;

    private readonly m_playButton: PlayButton;
    private readonly m_timeDisplay: TimeDisplay;
    private readonly m_progressBar: VideoSlider;
    private readonly m_closeButton: CloseButton;

    private onClickClose: () => void;

    get element(): HTMLDivElement { return this.m_controllerFrame; }

    constructor(wnd: Window, vc: VideoController) {
        const doc = wnd.document;

        this.onClickClose = () => {
            wnd.close();
            window.focus();
        };

        this.m_videoCtrler = vc;

        this.m_controllerFrame = doc.createElement("div");
        this.m_controllerFrame.id = "ctrler";
        this.m_controllerFrame.classList.add("controller");

        const config = ConfigHolder.getConfig();
        if (config) {
            this.m_controllerFrame.classList.add(`controller-thema--${config.useDarkThema ? "dark": "light"}`);
        }

        const leftSideControl = doc.createElement("div");
        leftSideControl.classList.add("controller__left");
        
        this.m_playButton = new PlayButton(doc);

        this.m_timeDisplay = new TimeDisplay(doc);

        leftSideControl.appendChild(this.m_playButton.element);
        leftSideControl.appendChild(this.m_timeDisplay.element);

        this.m_progressBar = new VideoSlider(doc);

        const rightSideControl = doc.createElement("div");
        rightSideControl.classList.add("controller__right");

        this.m_closeButton = new CloseButton(doc);
        rightSideControl.appendChild(this.m_closeButton.element);

        this.m_controllerFrame.appendChild(leftSideControl);
        this.m_controllerFrame.appendChild(this.m_progressBar.element);
        this.m_controllerFrame.appendChild(rightSideControl);

        this.initHandlers();
    }

    private initHandlers(): void {
        this.m_playButton.element.addEventListener("pointerup", this.onClickPlayPause);
        this.m_progressBar.element.addEventListener("input", this.onSeek);
        this.m_closeButton.element.addEventListener("pointerup", this.onClickClose);

        this.m_videoCtrler.setCallback("durationchange", (data) => {
            this.m_timeDisplay.updateDuration(data.duration);
            this.m_progressBar.setRange(data.duration);
        });
        this.m_videoCtrler.setCallback("pause", () => {
            this.m_playButton.setState(true);
        });
        this.m_videoCtrler.setCallback("play", () => {
            this.m_playButton.setState(false);
        });
        this.m_videoCtrler.setCallback("timeupdate", (data) => {
            this.m_timeDisplay.updateTime(data.time);
            this.m_progressBar.setTime(data.time);
        });
    }

    private onClickPlayPause = () => {
        const { state } = this.m_videoCtrler.togglePlaying();
        switch (state) {
            case "invalid":
            case "pausing":
                this.m_playButton.setState(true);
                break;
            case "playing":
                this.m_playButton.setState(false);
                break;
        }
    }

    private onSeek = () => {
        this.m_videoCtrler.setVideoCurrent(this.m_progressBar.getTime());
    };
};
