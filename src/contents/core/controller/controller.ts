import { ConfigHolder } from "@/ctx/config";
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
    private m_currIntTime: number = -1;
    private m_currStrTime: string = "00:00";
    private m_strDuration: string = "00:00";

    private genFormatted(): string {
        return `${this.m_currStrTime}/${this.m_strDuration}`;
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
        this.m_strDuration = TimeDisplay.formatTime(Math.floor(sec));
        this.m_elem.innerText = this.genFormatted();
    }

    public updateTime(sec: number) {
        const floored = Math.floor(sec);
        if (floored === this.m_currIntTime) {
            return;
        }

        this.m_currIntTime = floored;
        this.m_currStrTime = TimeDisplay.formatTime(floored);
        this.m_elem.innerText = this.genFormatted();
    }
};

class ProgressBar {
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

    public updateRange(range: number) {
        this.m_elem.max = String(range);
    }

    public updateTime(sec: number) {
        this.m_elem.value = String(sec);
    }
    
    public getTime() {
        return Number(this.m_elem.value);
    }
};

export class Controller {
    private readonly m_wnd: Window;
    private readonly m_videoCtrler: VideoController;

    private readonly m_ctrlerFrame: HTMLDivElement;

    private readonly m_playButton: PlayButton;
    private readonly m_timeDisplay: TimeDisplay;
    private readonly m_progressBar: ProgressBar;
    private readonly m_closeButton: CloseButton;

    get element(): HTMLDivElement { return this.m_ctrlerFrame; }

    constructor(wnd: Window, vc: VideoController) {
        const doc = wnd.document;

        this.m_wnd = wnd;
        this.m_videoCtrler = vc;

        this.m_ctrlerFrame = doc.createElement("div");
        this.m_ctrlerFrame.id = "ctrler";
        this.m_ctrlerFrame.classList.add("controller");

        const config = ConfigHolder.getConfig();
        if (config) {
            this.m_ctrlerFrame.classList.add(`controller-thema--${config.useDarkThema ? "dark": "light"}`);
        }

        const leftSideControl = doc.createElement("div");
        leftSideControl.classList.add("controller__left");
        
        this.m_playButton = new PlayButton(doc);

        this.m_timeDisplay = new TimeDisplay(doc);

        leftSideControl.appendChild(this.m_playButton.element);
        leftSideControl.appendChild(this.m_timeDisplay.element);

        this.m_progressBar = new ProgressBar(doc);

        const rightSideControl = doc.createElement("div");
        rightSideControl.classList.add("controller__right");

        this.m_closeButton = new CloseButton(doc);
        rightSideControl.appendChild(this.m_closeButton.element);

        this.m_ctrlerFrame.appendChild(leftSideControl);
        this.m_ctrlerFrame.appendChild(this.m_progressBar.element);
        this.m_ctrlerFrame.appendChild(rightSideControl);

        this.initHandlers();
    }

    private initHandlers(): void {
        this.m_playButton.element.addEventListener("pointerup", this.onClickPlayBtn);
        this.m_progressBar.element.addEventListener("input", this.onSeek);
        this.m_closeButton.element.addEventListener("pointerup", () => {
            // const prms = chrome.runtime.sendMessage({ action: "switchWindow" });
            // prms.then((wnd) => console.log(wnd));
            console.log("clicked");
            // chrome.runtime.sendMessage({ action: "switchWindow" }, (res) => {
            //     console.log(res);
            // });
            const rtn = chrome.runtime.sendMessage({ action: "test", visible: document.visibilityState });
            rtn.then((val) => {
                console.log(val);
            }).catch((reason) => {
                console.error(reason);
            });
            console.log("sent");
        });
    }

    private onClickPlayBtn = () => {
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
    };

    private onSeek = () => {
        this.m_videoCtrler.setCurrentPos(this.m_progressBar.getTime());
    };

    private onClickCloseBtn = () => {
        this.m_wnd.close();
        window.focus();
    };

    public setPaused(paused: boolean) {
        this.m_playButton.setState(paused);
    }

    public setDuration(duration: number) {
        this.m_progressBar.updateRange(duration);
        this.m_timeDisplay.updateDuration(duration);
    }

    public setCurTime(sec: number) {
        this.m_progressBar.updateTime(sec);
        this.m_timeDisplay.updateTime(sec);
    }
};
