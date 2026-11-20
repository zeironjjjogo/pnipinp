import styles from "@/style/main.scss";

import { DOMCtrler } from "@/core/domctrler";
import { FeatureContext } from "@/ctx/features";
import { ConfigHolder } from "@/ctx/config";
import { URLObserver } from "@/obs/observer";
import { AttrsCollection, doesSupportDocumentPiP, type FeatureHandlersArgs } from "@/util/util";

let IsInitialized: boolean = false;

const main = async () => {
    try {
        if (IsInitialized) {
            console.log("Already initialized.");
            return;
        }

        if (!doesSupportDocumentPiP(window)) {
            console.error("Your browser does not support documentPictureInPicture.");
            return;
        }

        const pipWin = window.documentPictureInPicture.window || await window.documentPictureInPicture.requestWindow({ disallowReturnToOpener: true });
        const pipDoc = pipWin.document;
        chrome.runtime.sendMessage({ action: "createdPiP", url: window.location.href });

        if (pipDoc.body.hasChildNodes()) {
            console.log("Already initialized.");
            return;
        }

        styles.use();                       // Adopts stylesheets.
        await ConfigHolder.loadConfigs();   // Loads configures.

        const ftCtx = new FeatureContext();
        const domCtrl = new DOMCtrler(pipWin, ftCtx);

        IsInitialized = true;
        // const argsCtx = {
        //     collection: new AttrsCollection(),                          // for detect initialized the canvas of Nicovideo comment
        //     updateCanvas: domCtrl.updateCanvas.bind(domCtrl),             // for reload the canvas element
        //     updateContents: domCtrl.updateContents.bind(domCtrl),          // for reload the video and the canvas
        //     releaseContents: domCtrl.releaseContents.bind(domCtrl),      // for release the video and the canvas
        //     resize: domCtrl.resizeContents.bind(domCtrl),               // for resize contents
        //     getCanvas: () => domCtrl.contents.canvas.element,
        //     getVideo: () => domCtrl.contents.video.element
        // } satisfies HandlerArgsContext;
        const argsObj: FeatureHandlersArgs = {
            collection: new AttrsCollection(),
            controller: domCtrl
        };

        const observer = new MutationObserver((records) => {
            const ft = ftCtx.getValue();
            for (const record of records) {
                switch (record.type) {
                    case "attributes": {
                        // if ("onAttributeModified" in ft.behaviours) {
                        //     ft.behaviours.onAttributeModified(record, argsCtx);
                        // }
                        if ("onAttributeChange" in ft.behaviours) {
                            ft.behaviours.onAttributeChange(record, argsObj);
                        }
                        break;
                    }
                    case "childList": {
                        // if ("onChildListModified" in ft.behaviours) {
                        //     ft.behaviours.onChildListModified(record, argsCtx);
                        // }
                        if ("onChildListChange" in ft.behaviours) {
                            ft.behaviours.onChildListChange(record, argsObj);
                        }
                        break;
                    }
                }
            }
        });
        observer.observe(document, { attributes: true, childList: true, subtree: true });

        const close = () => {
            observer.disconnect();
            urlObs.stop();
            domCtrl.dispose();
            styles.unuse();
            IsInitialized = false;
            console.log("Closed pip.");
        };

        pipWin.addEventListener("resize", domCtrl.resizeContents.bind(domCtrl));

        pipWin.addEventListener("pagehide", close);

        const message_youtube = chrome.i18n.getMessage("alertYoutube");
        const message_other = chrome.i18n.getMessage("alertOther");

        const onURLModified = (url?: string) => {
            if (url) console.log("URL detected: " + url);
            const ft = ftCtx.updateValue();
            // if (url && "onURLModified" in ft.behaviours && ft.type === ft.behaviours.type) {
            //     ft.behaviours.onURLModified(argsCtx);
            // }
            if (url && "onURLChange" in ft.behaviours) {
                ft.behaviours.onURLChange(argsObj);
            }
            if (ft.type === "youtube" || ft.type === "youtube:shorts") {
                pipWin.alert(message_youtube);
                pipWin.close();
            } else if (ft.type === "other") {
                pipWin.alert(message_other);
            }
            console.log("service: ", ft.type);
        };

        const urlObs = new URLObserver(onURLModified);
        urlObs.start();
        
        onURLModified();

        window.addEventListener("blur", (e) => {
            chrome.runtime.sendMessage({ action: "onBlur", event: e });
        });
        window.addEventListener("focus", (e) => {
            chrome.runtime.sendMessage({ action: "onFocus", event: e });
        });
        pipWin.addEventListener("blur", (e) => {
            chrome.runtime.sendMessage({ action: "onBlurPiP" })
        });

        if (!domCtrl.updateContents()) {
            console.log("Couldn't find a video element.");
            return;
        }
        
    } catch (e) {
        console.error(e);
    }
}
// if (ConfigHolder.getConfig()?.launchAutomatically) {
    navigator.mediaSession.setActionHandler("enterpictureinpicture" as MediaSessionAction, async () => {
        main();
    });
// }
await main();
