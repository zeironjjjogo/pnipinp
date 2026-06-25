export interface DocumentPictureInPicture extends EventTarget {
    readonly window: Window | null
    requestWindow(options?: {
        disallowReturnToOpener?: boolean,
        height?: number,
        preferInitialWindowPlacement?: boolean,
        width?: number
    }): Promise<Window>;
};

export function isCommentCanvas(node: Node): node is HTMLCanvasElement {
    return (
        node instanceof HTMLCanvasElement &&
        node.parentElement?.dataset.name === "comment"
    );
}

export function isStageDiv(node: Node): node is HTMLDivElement {
    return (
        node instanceof HTMLDivElement &&
        node.dataset.name === "stage"
    );
}
