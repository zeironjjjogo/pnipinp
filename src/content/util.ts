export interface DocumentPictureInPicture extends EventTarget {
    readonly window: Window | null
    requestWindow(options?: {
        disallowReturnToOpener?: boolean,
        height?: number,
        preferInitialWindowPlacement?: boolean,
        width?: number
    }): Promise<Window>;
};

export type WindowSupportingDocumentPictureInPicture = typeof window & {
    readonly documentPictureInPicture: DocumentPictureInPicture
};

export function doesSupportDocumentPiP(window_: Window): window_ is WindowSupportingDocumentPictureInPicture {
    return "documentPictureInPicture" in window_;
}

export function isCommentCanvas(node: Node): node is HTMLCanvasElement {
    return (
        node instanceof HTMLCanvasElement &&
        node.parentElement?.dataset.name === "comment"
    );
}

// export function isStageDiv(node: Node): node is HTMLDivElement {
//     // return (
//     //     node instanceof HTMLDivElement &&
//     //     node.dataset.name === "stage"
//     // );
//     return (
//         node instanceof HTMLDivElement && (
//             getParent_nico() === node ||
//             node.querySelectorAll("div[data-state]").length !== 0
//         )
//     );
// }

export function formatURL(url: string): string {
    if (url.includes("?")) {
        const dstUrl = url.slice(0, url.indexOf("?"));
        // console.log(`formatted: ${url} => ${dstUrl}`);
        return dstUrl;
    }
    return url;
}

export function dumpSize(document_: Document, selector: string): void {
    const element = document_.querySelector(selector);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    console.log(selector, {
        rect: `${rect.width}x${rect.height}`,
        client: `${element.clientWidth}x${element.clientHeight}`,
        scroll: `${element.scrollWidth}x${element.scrollHeight}`,
        style: `${getComputedStyle(element).width}x${getComputedStyle(element).height}`
    });
}

export function dumpSizes(document_: Document): void {
    for (const selector of ["div#playerframe", "div#player", "div#ctrler", "body", "video", "canvas"]) dumpSize(document_, selector);
}

export function sleep(time: number): Promise<void> {
    return new Promise((r) => setTimeout(r, time));
}

export function isValidSize(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

export interface IContext<T> {
    getValue(): T;
    updateValue(): T;
};

export interface Collection<T> {
    append(v: T): unknown;
    clear(): unknown;
    includes(v: T): boolean;
};

export class AttrsCollection implements Collection<string> {
    private m_arr: string[] = [];
    public append(v: string) : void {
        this.m_arr.push(v);
    }
    public clear(): void {
        this.m_arr = [];
    }
    public includes(v: string): boolean {
        return this.m_arr.includes(v);
    }
};
