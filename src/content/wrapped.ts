import type { AppFTs } from "./features"

interface AttrWrappedElement {
    width: string
    height: string
};

interface AttrWrappedVideo extends AttrWrappedElement {
    left: string
    top: string
};

interface AttrWrappedCanvas extends AttrWrappedElement {
    innerWidth: number
    innerHeight: number
    position: string
};

abstract class ElementWrapper<E extends Element, A extends AttrWrappedElement> {
    protected m_elem: E | null;
    protected m_dstParent: Node;
    protected m_placeholder: Comment;
    protected m_oldAttrs: A | null;
    protected m_isMoved: boolean;

    protected abstract getPlaceholderData(): string;
    protected abstract storeAttrs(): A | null;
    protected abstract restoreAttrs(): void;
    protected abstract beforePull(): boolean;
    protected abstract beforePush(): void;
    public abstract loadElement(ft: AppFTs): E | null;

    get element(): E | null {
        return this.m_elem;
    }

    public isMoved(): boolean {
        return this.m_isMoved;
    }

    constructor(parent: Node) {
        this.m_elem = null;
        this.m_dstParent = parent;
        this.m_placeholder = document.createComment(this.getPlaceholderData());
        this.m_oldAttrs = this.storeAttrs();
        this.m_isMoved = false;
    }

    public pull() {
        if (!this.m_elem || this.m_isMoved) return;

        const parent = this.m_elem.parentNode;
        if (!parent) {
            return;
        }

        if (!this.beforePull()) return;

        parent.insertBefore(this.m_placeholder, this.m_elem);
        this.m_dstParent.appendChild(this.m_elem);

        console.log("pull();");
        this.m_isMoved = true;
    }

    public push() {
        if (!this.m_elem || !this.m_isMoved) return;

        const parent = this.m_placeholder.parentNode;

        this.beforePush();

        if (parent) {
            parent.insertBefore(this.m_elem, this.m_placeholder);
            parent.removeChild(this.m_placeholder);
        }

        console.log("push();");
        this.m_isMoved = false;
        this.m_elem = null;
    }
};

export class WrappedVideo extends ElementWrapper<HTMLVideoElement, AttrWrappedVideo> {
    private m_thumbnail: HTMLImageElement;

    constructor(parent: Node) {
        super(parent);
        this.m_thumbnail = document.createElement("img");
    }

    protected override getPlaceholderData(): string {
        return "video-placeholder";
    }

    public loadElement(ft: AppFTs): HTMLVideoElement | null {
        if (this.m_elem && this.m_isMoved) {
            this.push();
        }

        return this.m_elem = ft.video();
        // const currentUrl = extractApps();
        // console.log("service: ", currentUrl);
        // this.m_elem = mineElement[currentUrl].video();
        // return this.m_elem;
        // return this.m_elem = mineElement[currentUrl].video();

        // const elems = document.querySelectorAll("video");
        // if (elems.length === 0) {
        //     return null;
        // }
        // return this.m_elem = this.fillter(elems);
    }

    protected storeAttrs(): AttrWrappedVideo | null {
        if (!this.m_elem) return null;
        return this.m_oldAttrs = {
            width: this.m_elem.style.width,
            height: this.m_elem.style.height,
            left: this.m_elem.style.left,
            top: this.m_elem.style.top
        };
    }

    protected restoreAttrs(): void {
        if (!this.m_elem || !this.m_oldAttrs) return;
        this.m_elem.style.width = this.m_oldAttrs.width;
        this.m_elem.style.height = this.m_oldAttrs.height;
        this.m_elem.style.left = this.m_oldAttrs.left;
        this.m_elem.style.top = this.m_oldAttrs.top;
    }

    protected beforePull(): boolean {
        if (!this.m_elem) return false;
        
        this.storeAttrs();

        const parent = this.m_elem.parentNode;
        if (!parent) {
            return false;
        }

        if (this.m_elem.poster) {
            this.m_thumbnail.src = this.m_elem.poster;
            this.m_thumbnail.style.width = "100%";
            this.m_thumbnail.style.height = "100%";
            parent.insertBefore(this.m_thumbnail, this.m_elem);
        }
        return true;
    }

    protected beforePush(): void {
        if (!this.m_elem) return;

        this.restoreAttrs();

        const parent = this.m_placeholder.parentNode;
        if (!parent) {
            return;
        }
        if (parent.contains(this.m_thumbnail))
            parent.removeChild(this.m_thumbnail);
    }
};

export class WrappedCanvas extends ElementWrapper<HTMLCanvasElement, AttrWrappedCanvas> {
    constructor(parent: Node) {
        super(parent);
    }

    protected getPlaceholderData(): string {
        return "comment-placeholder";
    }

    public loadElement(ft: AppFTs): HTMLCanvasElement | null {
        if (this.m_elem && this.m_isMoved) {
            this.push();
        }

        if (!ft.canvasRequired) return this.m_elem = null;
        return this.m_elem = ft.canvas();


        // const currentUrl = extractApps();
        // console.log("service: ", currentUrl);
        // return this.m_elem = mineElement[currentUrl].canvas();
        // const elems = document.querySelectorAll("canvas");
        // if (elems.length === 0) {
        //     return null;
        // }
        // return this.m_elem = this.fillter(elems);
    }

    protected storeAttrs(): AttrWrappedCanvas | null {
        if (!this.m_elem) return null;
        return this.m_oldAttrs = {
            width: this.m_elem.style.width,
            height: this.m_elem.style.height,
            innerWidth: this.m_elem.width,
            innerHeight: this.m_elem.height,
            position: this.m_elem.style.position
        };
    }

    protected restoreAttrs(): void {
        if (!this.m_elem || !this.m_oldAttrs) return;
        this.m_elem.style.width = this.m_oldAttrs.width;
        this.m_elem.style.height = this.m_oldAttrs.height;
        this.m_elem.width = this.m_oldAttrs.innerWidth;
        this.m_elem.height = this.m_oldAttrs.innerHeight;
        this.m_elem.style.position = this.m_oldAttrs.position;
    }

    protected beforePull(): boolean {
        if (!this.m_elem || (this.m_elem.width === 0 || this.m_elem.height === 0)) return false;
        this.storeAttrs();
        return true;
    }

    protected beforePush(): void {
        this.restoreAttrs();
    }
};
