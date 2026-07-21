import styles from "@/css/main.css";

import { DOMCtrler } from "@/content/domctrler";
import { FeatureContext } from "@/content/features";
import { URLObserver } from "@/content/observer";
import { AttrsCollection, doesSupportDocumentPiP, type HandlerArgsContext } from "@/content/util";

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

        styles.use();
        if (!pipDoc.head.hasChildNodes()) {
            console.log("style does not exist.");
            const style = document.querySelector("style[pnipinp=pnipinp-stylesheet]");
            if (!style) {
                console.log("Failed to fetch stylesheet.");
                return;
            }
            pipDoc.head.appendChild(style);
        }

        pipDoc.body.classList.add("column-flex", "space-between-flex");

        const ftCtx = new FeatureContext();
        console.log(ftCtx.updateValue().type);
        const domCtrl = new DOMCtrler(pipWin, ftCtx);

        const argsCtx = {
            collection: new AttrsCollection(),
            loadCanvas: domCtrl.reloadCanvas.bind(domCtrl),
            loadElements: domCtrl.reloadElement.bind(domCtrl),
            releaseElements: domCtrl.releaseElement.bind(domCtrl),
            resize: domCtrl.resize.bind(domCtrl),
            getCanvas: () => domCtrl.contents.canvas.element,
            getVideo: () => domCtrl.contents.video.element
        } satisfies HandlerArgsContext;

        const observer = new MutationObserver((records) => {
            const ft = ftCtx.getValue();
            for (const record of records) {
                switch (record.type) {
                    case "attributes": {
                        if ("onAttributeModified" in ft.behaviours) {
                            ft.behaviours.onAttributeModified(record, argsCtx);
                        }
                        break;
                    }
                    case "childList": {
                        if ("onChildListModified" in ft.behaviours) {
                            ft.behaviours.onChildListModified(record, argsCtx);
                        }
                        break;
                    }
                }
            }
        });
        observer.observe(document, { attributes: true, childList: true, subtree: true });

        pipWin.addEventListener("resize", domCtrl.resize.bind(domCtrl));

        pipWin.addEventListener("pagehide", () => {
            observer.disconnect();
            urlObs.stop();
            domCtrl.dispose();
            window.focus();
        });

        const urlObs = new URLObserver((url) => {
            console.log("URL modified: " + url);

            const ft = ftCtx.updateValue();
            if ("onURLModified" in ft.behaviours && ft.type === ft.behaviours.type) {
                ft.behaviours.onURLModified(argsCtx);
            }
            console.log("service: ", ft.type);
        });
        urlObs.start();

        if (!domCtrl.reloadElement()) {
            console.log("Couldn't find a video element.");
            return;
        }
        
    } catch (e) {
        console.error(e);
    }
})();
