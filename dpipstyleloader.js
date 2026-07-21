export default function insert(element) {
    console.log("on insert");
    if (!("documentPictureInPicture" in window && "window" in window.documentPictureInPicture && "document" in window.documentPictureInPicture.window)) {
        console.error("Failed to insert styles because of not supported documentPicutureInPicture or does not exist PiP window.");
        return;
    }

    const pipDoc = window.documentPictureInPicture.window.document;
    pipDoc.head.appendChild(element);
}
