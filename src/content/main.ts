import { Control } from "./controler";
import { DOMContents } from "./domctrler";
import { extractApps } from "./miner";
import { MutationHandler, URLObserver } from "./observer";
import { Resizer } from "./resizer";
import { doesSupportDocumentPiP, isValidSize } from "./util";
import { WrappedCanvas, WrappedVideo } from "./wrapped";

(async () => {
    try {
        if (!doesSupportDocumentPiP(window)) {
            console.error("Your browser does not support documentPictureInPicture.");
            return;
        }

        const pipWin = window.documentPictureInPicture.window || await window.documentPictureInPicture.requestWindow();
        const pipDoc = pipWin.document;

        if (pipDoc.body.hasChildNodes()) {
            console.log("Already initialized.");
            return;
        }

        const link = pipDoc.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("./src/css/main.css");
        pipDoc.head.appendChild(link);

        pipDoc.body.classList.add("column-flex", "space-between-flex");

        const playerFrame = pipDoc.createElement("div");
        playerFrame.id = "playerframe";
        playerFrame.classList.add("row-flex");

        const player = pipDoc.createElement("div");
        player.id = "player";
        player.classList.add("column-flex");

        const ctrler = new Control(pipWin);

        playerFrame.appendChild(player);
        pipDoc.body.appendChild(playerFrame);
        pipDoc.body.appendChild(ctrler.element);

        const wVideo = new WrappedVideo(player);
        const wCanvas = new WrappedCanvas(player);
        const domCtrl = new DOMContents(wVideo, wCanvas);
        const resizer = new Resizer(playerFrame, player, wVideo, wCanvas);
        
        const mh = new MutationHandler(ctrler, resizer, domCtrl);
        const observer = new MutationObserver((records) => {
            for (const record of records) {
                switch (record.type) {
                    case "attributes": {
                        mh.onModifyAttributes(record);
                        break;
                    }
                    case "characterData": {
                        // mh.onModifyCharacterData(record);
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

        const reszobs = new ResizeObserver(() => {
            if (isValidSize(playerFrame)) {
                resizer.resize();
                reszobs.disconnect();
            }
        });
        reszobs.observe(playerFrame);

        pipWin.addEventListener("resize", () => {
            resizer.resize();
        });

        pipWin.addEventListener("pagehide", () => {
            observer.disconnect();
            reszobs.disconnect();
            urlObs.stop();
            domCtrl.pushContents(ctrler);
            window.focus();
        });

        const urlObs = new URLObserver((url) => {
            console.log("URL modified: " + url);
            domCtrl.pushContents(ctrler);
            
            // domCtrl.pullContents(ctrler);
            // resizer.resize();
        });
        urlObs.start();

        if (!domCtrl.pullContents(ctrler)) {
            console.log("Couldn't find a video element.");
            return;
        }

    } catch (e) {
        console.error(e);
    }
})();
