import styles from "@/style/main.scss";

import { DOMCtrler } from "@/core/domctrler";
import { FeatureContext } from "@/context/features";
import { URLObserver } from "@/observer/observer";
import { AttrsCollection, doesSupportDocumentPiP, type HandlerArgsContext } from "@/util/util";
import { ConfigHolder } from "@/context/config";

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

        await ConfigHolder.loadConfigs();
        console.log("configs: ", ConfigHolder.getConfig());
        
        const ftCtx = new FeatureContext();
        // const ftTmp = ftCtx.getValue();
        // if (ftTmp.type === "youtube") {
        //     pipWin.alert("This extension can display the video on PiP but can be interrupted video playing.");
        // }
        // console.log(ftTmp.type);
        const domCtrl = new DOMCtrler(pipWin, ftCtx);

        const argsCtx = {
            collection: new AttrsCollection(),                          // for detect initialized the canvas of Nicovideo comment
            loadCanvas: domCtrl.reloadCanvas.bind(domCtrl),             // for reload the canvas element
            loadElements: domCtrl.reloadElement.bind(domCtrl),          // for reload the video and the canvas
            releaseElements: domCtrl.releaseElement.bind(domCtrl),      // for release the video and the canvas
            resize: domCtrl.resizeContents.bind(domCtrl),               // for resize contents
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

        pipWin.addEventListener("resize", domCtrl.resizeContents.bind(domCtrl));

        pipWin.addEventListener("pagehide", () => {
            observer.disconnect();
            urlObs.stop();
            domCtrl.dispose();
            window.focus();
        });

        const message_youtube = chrome.i18n.getMessage("alertYoutube");

        const onURLModified = (url?: string) => {
            if (url) console.log("URL detected: " + url);
            const ft = ftCtx.updateValue();
            if (url && "onURLModified" in ft.behaviours && ft.type === ft.behaviours.type) {
                ft.behaviours.onURLModified(argsCtx);
            }
            if (ft.type === "youtube") {
                pipWin.alert(message_youtube);
            }
            console.log("service: ", ft.type);
        };

        // const urlObs = new URLObserver((url) => {
        //     console.log("URL modified: " + url);

        //     const ft = ftCtx.updateValue();
        //     if ("onURLModified" in ft.behaviours && ft.type === ft.behaviours.type) {
        //         ft.behaviours.onURLModified(argsCtx);
        //     }
        //     if (ft.type === "youtube") {
        //         pipWin.alert("This extension can display the video on PiP but can be interrupted video playing.");
        //     }
        //     console.log("service: ", ft.type);
        // });
        const urlObs = new URLObserver(onURLModified);
        urlObs.start();
        
        onURLModified();

        if (!domCtrl.reloadElement()) {
            console.log("Couldn't find a video element.");
            return;
        }
        
    } catch (e) {
        console.error(e);
    }
})();
