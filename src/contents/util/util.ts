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
    readonly documentPictureInPicture: DocumentPictureInPicture;
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
    updateCanvas(): unknown;
    updateContents(): boolean;
    releaseContents(): unknown;
    resize(): unknown;
    getVideo(): HTMLVideoElement | null;
    getCanvas(): HTMLCanvasElement | null;
};
// export type HandlerArgsContext = HandlerArgsContextAppendix & HandlerArgsContextBasis;
export type HandlerArgsContext = HandlerArgsContextBasis;

export type ValueOf<C extends object, K extends keyof C = keyof C> = C[K];

export function containsKey<T extends object>(keyObj: string | number | symbol, container: T): keyObj is (keyof T) {
    return keyObj in container;
}

export type ArgsType<T extends (...args: any) => any> = T extends (...args: infer Args) => any ? Args : any;

export interface BoundFunc<ArgsT extends any[], ReturnT> {
    args: ArgsT;
    func(...args: ArgsT): ReturnT;
}
export function executeBoundFunc<ArgsT extends any[], ReturnT>(bf: BoundFunc<ArgsT, ReturnT>): ReturnT {
    return bf.func(...bf.args);
}

export const nullFunc = () => {};

export type EventHandler = (event: Event) => void;

export type ConstEventTypesArray = readonly (keyof HTMLVideoElementEventMap)[];
type SetEventListenerFuncT<Elem extends HTMLElement, Map extends HTMLElementEventMap> = (type: keyof Map, listener: (this: Elem, ev: ValueOf<Map>) => any) => void;
type SetVideoEventListenerFuncT = SetEventListenerFuncT<HTMLVideoElement, HTMLVideoElementEventMap>;

export class VideoListenerManager {
    private readonly m_element: HTMLVideoElement;

    constructor(
        element: HTMLVideoElement,
        types: ConstEventTypesArray | null = null,
        callback: EventHandler | null = null
    ) {
        this.m_element = element;
        if (types && callback) {
            this.bind(types, callback);
        }
    }
    public bind(types: ConstEventTypesArray, handler: EventHandler): void {
        for (const type of types) {
            this.m_element.addEventListener(type, handler);
        }
    }
    public unbind(types: ConstEventTypesArray, handler: EventHandler): void {
        for (const type of types) {
            this.m_element.removeEventListener(type, handler);
        }
    }
};

export type DefaultConstructor<T> = new () => T;

export interface IAdditionalController {
    setCur(sec: number): boolean;
    isValid(): boolean;
    dispose(): void;
};

export const nicovideoSkipButtonSelectors = [
    "[id=nv_watch_VideoAdContainer] button",
    "button[aria-label=\"Skip Ad\"]",
    "#request_skip"
];

export interface ApplicationController {
    getVideo(): HTMLVideoElement | null;
    getCanvas(): HTMLCanvasElement | null;
    updateContents(): boolean;
    updateCanvas(): void;
    releaseContents(): void;
    resizeContents(): void;
}
// Arguments object to pass handlers for a feature of the service
export interface FeatureHandlersArgs {
    collection: Collection<string>;
    controller: ApplicationController;
}
