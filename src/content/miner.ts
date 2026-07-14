export type AppSupports = "nicovideo" | "live.nicovideo" | "youtube" | "other";
export function extractApps(): AppSupports {
    const url = document.URL;
    if (url.includes("://www.youtube.com")) {
        return "youtube";
    }
    if (url.includes("://www.nicovideo")) {
        return "nicovideo";
    }
    if (url.includes("://live.nicovideo")) {
        return "live.nicovideo";
    }
    return "other";
}
function mineElement_nico() {
    if (document.URL.includes("watch")) {
        // normal video
        const stage = document.querySelector<HTMLDivElement>("div[data-name=stage]");
        const video = stage?.querySelector<HTMLVideoElement>("video[data-name=video-content]");
        const comment = stage?.querySelector<HTMLCanvasElement>("div[data-name=comment] > canvas");
    } else if (document.URL.includes("shorts")) {
        // shorts video
        const activeOne = document.querySelector<HTMLDivElement>("div[data-state=active]");
    }
    return null;
}

export function getParent_nico() {
    if (document.URL.includes("watch")) {
        // normal video
        return document.querySelector<HTMLDivElement>("div[data-name=stage]");
    } else if (document.URL.includes("shorts")) {
        // shorts video
        return document.querySelector<HTMLDivElement>("div[data-state=active]");
    }
    return null;
}


function getParent_youtube() {
    return document.querySelector<HTMLDivElement>("div#player video");
}

export const mineElement = {
    "nicovideo": {
        video: () => {
            const parent = getParent_nico();
            if (!parent) return null;
            const found = parent.querySelector<HTMLVideoElement>("video[data-name=video-content]");
            return found;
        },
        canvas: () => {
            const parent = getParent_nico();
            console.log(parent);
            if (!parent) return null;
            const found = parent.querySelector<HTMLCanvasElement>("div[data-name=comment] > canvas");
            return found;
            // return parent.querySelector<HTMLCanvasElement>("div[data-name=comment] > canvas");
        }
    },
    "live.nicovideo": {
        video: () => {
            return document.querySelector<HTMLVideoElement>("video.___video___mddiR");
        },
        canvas: () => {
            return document.querySelector<HTMLCanvasElement>("div#comment-layer-container canvas");
        }
    },
    "youtube": {
        video: () => {
            if (document.URL.includes("watch")) {
                return document.querySelector<HTMLVideoElement>("ytd-watch-flexy video");
            }
            if (document.URL.includes("shorts")) {
                return document.querySelector<HTMLVideoElement>("ytd-shorts video");
            }
            return null;
        },
        canvas: () => { return null; }
    },
    "other": {
        video: () => {
            const videos = Array.from(document.querySelectorAll("video"));
            if (videos.length === 0) {
                return null;
            }
            const foundVideo = videos.find(v => !v.paused && !v.ended);
            return (foundVideo ? foundVideo : null) || (videos[0] ? videos[0]: null);
        },
        canvas: () => { return null; }
    }
};
