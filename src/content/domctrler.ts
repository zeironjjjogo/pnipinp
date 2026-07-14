import { Control } from "./controler";
import { Resizer } from "./resizer";
import { WrappedCanvas, WrappedVideo } from "./wrapped";

// export class KnitContents {
export class DOMContents {
    private readonly m_wVideo: WrappedVideo;
    private readonly m_wCanvas: WrappedCanvas;

    get video(): WrappedVideo { return this.m_wVideo; }
    get canvas(): WrappedCanvas { return this.m_wCanvas; }

    // constructor(parent: HTMLDivElement) {
    //     this.m_wVideo = new WrappedVideo(parent);
    //     this.m_wCanvas = new WrappedCanvas(parent);
    // }

    constructor(v: WrappedVideo, c: WrappedCanvas) {
        this.m_wVideo = v;
        this.m_wCanvas = c;
    }

    public pullVideo(ctrl: Control): boolean {
        if (!this.m_wVideo.loadElement() || !this.m_wVideo.element) return false;
        this.m_wVideo.pull();
        ctrl.setVideo(this.m_wVideo.element);
        return true;
    }

    public pullCanvas(): void {
        this.m_wCanvas.loadElement();
        this.m_wCanvas.pull();
    }

    public pullContents(ctrl: Control): boolean {
        if (!this.pullVideo(ctrl)) return false;
        this.pullCanvas();
        return true;
    }

    public pushVideo(ctrl: Control): void {
        ctrl.releaseVideo();
        this.m_wVideo.push();
    }

    public pushCanvas(): void {
        this.m_wCanvas.push();
    }

    public pushContents(ctrl: Control): void {
        this.pushVideo(ctrl);
        this.pushCanvas();
    }
    
};

// export class DOMBuilder {
//     private static readonly PLAYER_FRAME_ID = "playerframe";
//     private static PLAYER_ID = "player";

//     private m_contents: DOMContents;
//     private m_controller: Control;
//     private m_resizer: Resizer;

//     private buildPlayer(doc: Document): HTMLDivElement {
//         const player = doc.createElement("div");
//         player.id = DOMBuilder.PLAYER_ID;
//         player.classList.add("column-flex");
//         return player;
//     }

//     private buildPlayerFrame(doc: Document): HTMLDivElement {
//         const playerFrame = doc.createElement("div");
//         playerFrame.id = DOMBuilder.PLAYER_FRAME_ID;
//         playerFrame.classList.add("row-flex");
//         return playerFrame;
//     }

//     constructor(wnd: Window) {
//         const doc = wnd.document;

//         const player = this.buildPlayer(doc);
//         const playerFrame = this.buildPlayerFrame(doc);
//         const contents = new DOMContents(player);
//         const controller = new Control(wnd);
//         const resizer = new Resizer(playerFrame, player, contents.video, contents.canvas);
        
//         playerFrame.appendChild(player);
//         doc.body.appendChild(playerFrame);
//         doc.body.appendChild(controller.element);

//         this.m_contents = contents;
//         this.m_controller = controller;
//         this.m_resizer = resizer;
//     }

// };
