import { Control } from "./controler";
import { DOMController } from "./domctrler";
import { MutationHandler } from "./observer";
import { Resizer } from "./resizer";
import { DocumentPictureInPicture } from "./util";
import { WrappedCanvas, WrappedVideo } from "./wrapped";

type Wnd_T = typeof window;

(async () => {
    try {
        if (!("documentPictureInPicture" in window)) {
            return;
        }

        const wnd = window as Wnd_T & { readonly "documentPictureInPicture": DocumentPictureInPicture };
        const dpip = wnd.documentPictureInPicture;
        const pipWin = dpip.window || await dpip.requestWindow();
        const pipDoc = pipWin.document;

        if (pipDoc.body.hasChildNodes()) {
            return;
        }

        pipDoc.head.innerHTML = `<style>
        html, body {
            margin: 0;
            width: 100%;
        },
        html {
            height: 100%;
        },
        body {
            height: fit-content;
            display: flex;
            flex-direction: column;
        }
        video {
            z-index: 1;
            position: absolute;
        }
        canvas {
            z-index: 2;
            position: absolute;
        }
        input {
            width: 100%;
        }
        #playerframe {
            background: black;
            display: flex;
            justify-content: center;
            width: 100%;
            height: 100%;
        }
        #player {
            display: flex;
            flex-direction: column;
            position: relative;
        }
        #ctrler {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: spece-between;
        }
        #timedisplay {
            white-space: pre;
            font-family: monospace;
        }
        .ctrlleft {
        }
        .ctrlright {
            justify-content: end;
        }
        </style>`;

        const playerFrame = pipDoc.createElement("div");
        playerFrame.id = "playerframe";
        const player = pipDoc.createElement("div");
        player.id = "player";
        const ctrler = new Control(pipWin);

        playerFrame.appendChild(player);
        pipDoc.appendChild(playerFrame);
        pipDoc.appendChild(ctrler.element);

        const wVideo = new WrappedVideo(player);
        const wCanvas = new WrappedCanvas(player);
        const domCtrl = new DOMController(wVideo, wCanvas);
        const resizer = new Resizer(playerFrame);
        
        const mh = new MutationHandler(wVideo, wCanvas, ctrler, resizer, domCtrl);
        const observer = new MutationObserver((records) => {
            for (const record of records) {
                switch (record.type) {
                    case "attributes": {
                        mh.onModifyAttributes(record);
                        break;
                    }
                    case "characterData": {
                        mh.onModifyCharacterData(record);
                        break;
                    }
                    case "childList": {
                        mh.onModifyChildList(record);
                        break;
                    }
                }
            }
        });
        observer.observe(document, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true
        });

        pipWin.addEventListener("resize", () => {
            if (wVideo.element)
                resizer.resize(wVideo.element, wCanvas.element);
        });

        pipWin.addEventListener("pagehide", () => {
            observer.disconnect();
            domCtrl.pushContents(ctrler);
            window.focus();
        });

        if (!domCtrl.pullContents(ctrler)) {
            return;
        }

        if (wVideo.element)
            resizer.resize(wVideo.element, wCanvas.element);

    } catch (e) {
        console.error(e);
    }
})();
