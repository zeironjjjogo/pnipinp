interface AttrWrappedElement {
    width: string;
    height: string;
    inset: string;
};

interface AttrWrappedVideo extends AttrWrappedElement {
};

interface AttrWrappedCanvas extends AttrWrappedElement {
    innerWidth: number;
    innerHeight: number;
    position: string;
};

interface IElementWrapper<E extends Element> {
    element: E | null;
    loadElement(selector: string | null): E | null;
    pull(): void;
    push(): void;
};

abstract class ElementWrapper<E extends Element, A extends AttrWrappedElement> implements IElementWrapper<E> {
    protected m_elem: E | null;
    protected m_dstParent: Node;
    protected m_placeholder: Comment;
    protected m_oldAttrs: A | null;
    protected m_isMoved: boolean;

    protected abstract getUniqueName(): string;
    protected abstract storeAttrs(): A | null;
    protected abstract restoreAttrs(): void;
    protected abstract beforePull(): boolean;
    protected abstract beforePush(): void;

    get element(): E | null {
        return this.m_elem;
    }

    protected getSrcNode(): Node | null {
        return this.m_isMoved ? this.m_placeholder.parentNode : (this.m_elem ? this.m_elem.parentNode : null);
    }

    constructor(parent: Node) {
        this.m_elem = null;
        this.m_dstParent = parent;
        this.m_placeholder = document.createComment(this.getUniqueName());
        this.m_oldAttrs = this.storeAttrs();
        this.m_isMoved = false;
    }

    public loadElement(selector: string | null): E | null {
        if (this.m_elem || this.m_isMoved) {
            this.push();
        }
        return this.m_elem = selector ? document.querySelector(selector) : null;
    }

    public pull() {
        if (!this.m_elem || this.m_isMoved) return;

        const parent = this.getSrcNode();
        if (!parent || !this.beforePull()) {
            return;
        }

        parent.insertBefore(this.m_placeholder, this.m_elem);

        this.m_elem.classList.add(this.getUniqueName());
        this.m_dstParent.appendChild(this.m_elem);

        this.m_isMoved = true;
    }

    public push() {
        if (!this.m_elem || !this.m_isMoved) return;

        const parent = this.getSrcNode();
        if (parent) {
            this.beforePush();

            this.m_elem.classList.remove(this.getUniqueName());
            parent.insertBefore(this.m_elem, this.m_placeholder);
            parent.removeChild(this.m_placeholder);
        }

        this.m_isMoved = false;
        this.m_elem = null;
    }
};

abstract class UnmovedVideoWrapper extends ElementWrapper<Element, AttrWrappedVideo> {
    protected m_video_frame: Element;
    constructor(parent: Node) {
        super(parent);
        this.m_video_frame = document.createElement("ytd-app");
    }

    override get element(): HTMLVideoElement | null {
        return this.m_elem ? this.m_elem.querySelector("video") : null;
    }

    public override loadElement(selector: string | null): Element | null {
        const ytd = document.querySelector("ytd-app");
        if (!ytd) {
            console.log("failed to get ytd-app");
            return null;
        }        
        this.m_elem = ytd;
        return ytd;
    }

    public override pull() {
        if (!this.m_elem || this.m_isMoved) return;

        const parent = this.m_elem.parentNode;
        if (!this.beforePull()) return;

        const copyAttrs = (src: Element, dst: Element) => {
            [...src.attributes].forEach((attr) => {
                try {
                    dst.setAttribute(attr.nodeName, attr.nodeValue || "");
                } catch (e) {
                    console.warn(e);
                }
            });
        };

        this.m_video_frame = document.createElement("ytd-app");
        copyAttrs(this.m_elem, this.m_video_frame);
        parent?.insertBefore(this.m_placeholder, this.m_elem);
        this.m_dstParent.appendChild(this.m_video_frame); 
        this.m_isMoved = true;
    }

    public override push(): void {
        if (!this.m_elem || !this.m_isMoved) return;

        this.beforePush();
        const parent = this.m_placeholder.parentNode;
        if (parent) {
            parent.insertBefore(this.m_elem, this.m_placeholder);
            parent.removeChild(this.m_placeholder);
        }
        this.m_isMoved = false;
        this.m_elem = null;
    }
};

export class WrappedVideo extends ElementWrapper<HTMLVideoElement, AttrWrappedVideo> {
// export class WrappedVideo extends UnmovedVideoWrapper {
    private m_thumbnail: HTMLImageElement;

    constructor(parent: Node) {
        super(parent);
        this.m_thumbnail = document.createElement("img");
    }

    protected override getUniqueName(): string {
        return "video-content--pnipinp";
    }

    protected storeAttrs(): AttrWrappedVideo | null {
        if (!this.m_elem) return null;
        return this.m_oldAttrs = {
            width: this.m_elem.style.width,
            height: this.m_elem.style.height,
            inset: this.m_elem.style.inset
        };
    }

    protected restoreAttrs(): void {
        if (!this.m_elem || !this.m_oldAttrs) return;
        this.m_elem.style.width = this.m_oldAttrs.width;
        this.m_elem.style.height = this.m_oldAttrs.height;
        this.m_elem.style.inset = this.m_oldAttrs.inset;
    }

    protected beforePull(): boolean {
        if (!this.m_elem) return false;
        
        this.storeAttrs();

        const parent = this.getSrcNode();
        if (!parent) {
            return false;
        }
        this.setThumbnail(parent);

        return true;
    }

    protected beforePush(): void {
        if (!this.m_elem) return;

        this.restoreAttrs();

        const parent = this.getSrcNode();
        if (!parent) {
            return;
        }
        this.removeThumbnail(parent);
    }

    private setThumbnail(dst: Node): void {
        if (!this.m_elem || this.m_elem.poster.length === 0) {
            return;
        }

        this.m_thumbnail.src = this.m_elem.poster;
        this.m_thumbnail.style.width = "100%";
        this.m_thumbnail.style.height = "100%";

        dst.insertBefore(this.m_thumbnail, this.m_elem);
    }

    private removeThumbnail(src: Node): void {
        if (!src.contains(this.m_thumbnail)) {
            return;
        }

        src.removeChild(this.m_thumbnail);
    }

    public reloadAttrs(): void {
        this.storeAttrs();
    }
};

export class WrappedCanvas extends ElementWrapper<HTMLCanvasElement, AttrWrappedCanvas> {
    constructor(parent: Node) {
        super(parent);
    }

    protected getUniqueName(): string {
        return "canvas-content--pnipinp";
    }

    protected storeAttrs(): AttrWrappedCanvas | null {
        if (!this.m_elem) return null;
        return this.m_oldAttrs = {
            width: this.m_elem.style.width,
            height: this.m_elem.style.height,
            inset: this.m_elem.style.inset,
            innerWidth: this.m_elem.width,
            innerHeight: this.m_elem.height,
            position: this.m_elem.style.position
        };
    }

    protected restoreAttrs(): void {
        if (!this.m_elem || !this.m_oldAttrs) return;
        this.m_elem.style.width = this.m_oldAttrs.width;
        this.m_elem.style.height = this.m_oldAttrs.height;
        this.m_elem.style.inset = this.m_oldAttrs.inset;
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
