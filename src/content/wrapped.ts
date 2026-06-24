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
    protected abstract beforePull(): void;
    protected abstract beforePush(): void;
    protected abstract fillter(e: NodeListOf<E>): E | null;
    public abstract loadElement(): E | null;

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

        this.beforePull();

        parent.insertBefore(this.m_placeholder, this.m_elem);
        this.m_dstParent.appendChild(this.m_elem);

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

        this.m_isMoved = false;
        this.m_elem = null;
    }
};

class WrappedVideo extends ElementWrapper<HTMLVideoElement, AttrWrappedVideo> {
    private m_thumbnail: HTMLImageElement;

    constructor(parent: Node) {
        super(parent);
        this.m_thumbnail = document.createElement("img");
    }

    protected override getPlaceholderData(): string {
        return "video-placeholder";
    }

    protected fillter(e: NodeListOf<HTMLVideoElement>): HTMLVideoElement | null {
        let targetElem = e.item(0);
        e.forEach(v => {
            if (v.parentElement?.dataset.name === "video-content") targetElem = v;
        });
        return targetElem;
    }

    public loadElement(): HTMLVideoElement | null {
        if (this.m_elem && this.m_isMoved) {
            this.push();
        }

        const elems = document.querySelectorAll("video");
        if (elems.length === 0) {
            return null;
        }
        return this.m_elem = this.fillter(elems);
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

    protected beforePull(): void {
        if (!this.m_elem) return;
        
        this.storeAttrs();

        const parent = this.m_elem.parentNode;
        if (!parent) {
            return;
        }

        this.m_thumbnail.src = this.m_elem.poster;
        parent.insertBefore(this.m_thumbnail, this.m_elem);
    }

    protected beforePush(): void {
        if (!this.m_elem) return;

        this.restoreAttrs();

        const parent = this.m_placeholder.parentNode;
        if (!parent) {
            return;
        }

        parent.removeChild(this.m_thumbnail);
    }
};

class WrappedCanvas extends ElementWrapper<HTMLCanvasElement, AttrWrappedCanvas> {
    constructor(parent: Node) {
        super(parent);
    }

    protected getPlaceholderData(): string {
        return "comment-placeholder";
    }

    protected fillter(e: NodeListOf<HTMLCanvasElement>): HTMLCanvasElement | null {
        let targetElem = null;
        e.forEach(c => {
            if (c.parentElement?.dataset.name === "comment") targetElem = c;
        });
        return targetElem;
    }

    public loadElement(): HTMLCanvasElement | null {
        if (this.m_elem && this.m_isMoved) {
            this.push();
        }

        const elems = document.querySelectorAll("canvas");
        if (elems.length === 0) {
            return null;
        }
        return this.m_elem = this.fillter(elems);
    }

    protected storeAttrs(): AttrWrappedCanvas | null {
        if (!this.m_elem) return null;
        return this.m_oldAttrs = {
            width: this.m_elem.style.width,
            height: this.m_elem.style.height,
            innerWidth: this.m_elem.width,
            innerHeight: this.m_elem.height
        };
    }

    protected restoreAttrs(): void {
        if (!this.m_elem || !this.m_oldAttrs) return;
        this.m_elem.style.width = this.m_oldAttrs.width;
        this.m_elem.style.height = this.m_oldAttrs.height;
        this.m_elem.width = this.m_oldAttrs.innerWidth;
        this.m_elem.height = this.m_oldAttrs.innerHeight;
    }

    protected beforePull(): void {
        this.storeAttrs();
    }

    protected beforePush(): void {
        this.restoreAttrs();
    }
};
