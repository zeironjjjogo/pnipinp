import { formatURL, sleep } from "@/content/util";

// observing URL modified. for push back elements on nicovideo.
export class URLObserver {
    private m_kept_url: string;

    private m_is_observing: boolean = false;

    private m_handler: (url: string) => unknown;

    private static getURL(): string {
        return formatURL(document.URL);
    }

    constructor(handler: (url: string) => unknown) {
        this.m_kept_url = URLObserver.getURL();
        this.m_handler = handler;
        this.observe();
    }

    private async observe() {
        while (this.m_is_observing) {
            const currentURL = URLObserver.getURL();
            if (currentURL !== this.m_kept_url) {
                this.m_kept_url = currentURL
                this.m_handler(currentURL);
            }
            await sleep(200);
        }
    }

    public start(): void {
        if (this.m_is_observing) {
            console.error("URLObserver has already started observing.");
            return;
        }
        
        this.m_is_observing = true;
        this.observe();
    }

    public stop(): void {
        this.m_is_observing = false;
    }
};
