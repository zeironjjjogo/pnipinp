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

export function formatURL(url: string): string {
    if (url.includes("?")) {
        return url.slice(0, url.indexOf("?"));
    }
    return url;
}

export function sleep(time: number): Promise<void> {
    return new Promise((r) => setTimeout(r, time));
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

export interface HandlerArgsContextAppendix {
    record: MutationRecord;
};
export interface HandlerArgsContextBasis {
    collection: Collection<string>;
    loadCanvas(): unknown;
    loadElements(): boolean;
    releaseElements(): unknown;
    resize(): unknown;
    getVideo(): HTMLVideoElement | null;
    getCanvas(): HTMLCanvasElement | null;
};
// export type HandlerArgsContext = HandlerArgsContextAppendix & HandlerArgsContextBasis;
export type HandlerArgsContext = HandlerArgsContextBasis;

export function copyStyles(src: Document, dst: Document): void {
    [...src.styleSheets].forEach((styleSheet) => {
        try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
            const style = dst.createElement("style");
            style.textContent = cssRules;
            dst.head.appendChild(style);
        } catch (e) {
            console.warn(e);
            const link = dst.createElement("link");
            link.rel = "stylesheet";
            link.type = styleSheet.type;
            link.media = styleSheet.media.toString();
            link.href = styleSheet.href || "";
            dst.head.appendChild(link);
        }
    });
}
