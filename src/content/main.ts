import { Control } from "./controler";
import { DOMContents, DOMCtrler } from "./domctrler";
import { FeatureContext } from "./features";
import { URLObserver } from "./observer";
import { Resizer } from "./resizer";
import { AttrsCollection, doesSupportDocumentPiP, formatURL, isValidSize } from "./util";
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

        // const base = pipDoc.createElement("base");
        // base.href = formatURL(document.URL);
        // pipDoc.head.appendChild(base);

        const link = pipDoc.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("./src/css/main.css");
        pipDoc.head.appendChild(link);

        pipDoc.body.classList.add("column-flex", "space-between-flex");

        // const playerFrame = pipDoc.createElement("div");
        // playerFrame.id = "playerframe";
        // playerFrame.classList.add("row-flex");

        // const player = pipDoc.createElement("div");
        // player.id = "player";
        // player.classList.add("column-flex");

        // const ctrler = new Control(pipWin);

        // playerFrame.appendChild(player);
        // pipDoc.body.appendChild(playerFrame);
        // pipDoc.body.appendChild(ctrler.element);

        // const wVideo = new WrappedVideo(player);
        // const wCanvas = new WrappedCanvas(player);
        // const domCtrl = new DOMContents(wVideo, wCanvas);
        // const domCtrl = new DOMContents(player);
        // const wVideo = domCtrl.video;
        // const wCanvas = domCtrl.canvas;
        // const resizer = new Resizer(playerFrame, player, wVideo, wCanvas);

        const ftCtx = new FeatureContext();
        const domCtrl = new DOMCtrler(pipWin, ftCtx);

        // const mh = new MutationHandler(domCtrl, ftCtx);
        const attrsCollection = new AttrsCollection();
        const observer = new MutationObserver((records) => {
            const ft = ftCtx.getValue();
            for (const record of records) {
                switch (record.type) {
                    case "attributes": {
                        // mh.onModifyAttributes(record);
                        if ("onAttributeModified" in ft) {
                            ft.onAttributeModified(record, attrsCollection, domCtrl.reloadCanvas.bind(domCtrl), domCtrl.reloadElement.bind(domCtrl));
                        }
                        break;
                    }
                    case "characterData": {
                        // mh.onModifyCharacterData(record);
                        break;
                    }
                    case "childList": {
                        // mh.onModifyChildList(record);
                        if ("onChildListModified" in ft) {
                            if (ft.type === "nicovideo:shorts") debugger;
                            ft.onChildListModified(record, domCtrl.reloadElement.bind(domCtrl));
                        }
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

        // const reszobs = new ResizeObserver(() => {
        //     if (isValidSize(playerFrame)) {
        //         resizer.resize();
        //         reszobs.disconnect();
        //     }
        // });
        // reszobs.observe(playerFrame);

        pipWin.addEventListener("resize", () => {
            // resizer.resize();
            domCtrl.resize();
        });

        pipWin.addEventListener("pagehide", () => {
            observer.disconnect();
            // reszobs.disconnect();
            urlObs.stop();
            domCtrl.dispose();
            // domCtrl.pushContents(ctrler);
            window.focus();
        });

        const urlObs = new URLObserver((url) => {
            console.log("URL modified: " + url);

            const ft = ftCtx.updateValue();
            if ("onURLModified" in ft) {
                ft.onURLModified(domCtrl.releaseElement.bind(domCtrl));
            }
            console.log("service: ", ft.type);

            // const ft = ftCtx.updateFeature();
            // console.log("service: ", ft.type);
            // // if (!url.includes("/shorts/"))
            // // domCtrl.pushContents(ctrler);
            // if (ft.type === "nicovideo")
            // domCtrl.releaseElement();
            
            
            // domCtrl.pullContents(ctrler);
            // resizer.resize();
        });
        urlObs.start();

        // if (!domCtrl.pullContents(ctrler)) {
        if (!domCtrl.reloadElement()) {
            console.log("Couldn't find a video element.");
            return;
        }

    } catch (e) {
        console.error(e);
    }
})();
