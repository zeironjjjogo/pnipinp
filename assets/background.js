let g_srcTab = {};
let g_pipWnd = {};
let vsb_hst = {
    before: {
        visible: false,
        stamp: performance.now()
    },
    current: {
        visible: false,
        stamp: performance.now()
    }
};
let PiPHasFocus = false;

const AllType = [
    "normal", 
    "devtools", 
    "popup"
];

function constName(id) {
    if (id === chrome.windows.WINDOW_ID_NONE) return `NONE(${id})`;
    if (id === g_srcTab.id) return `SrcTab(${id})`;
    if (id === g_srcTab.windowId) return `SrcWnd(${id})`;
    if (id === g_pipWnd.id) return `PiPWnd(${id})`;
    return id;
}

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    g_srcTab = tab;
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["main.js"]
    });
    const [pipTab] = await chrome.tabs.query({ lastFocusedWindow: true });
    const pipWin = await chrome.windows.get(pipTab.windowId);
    if (pipWin.alwaysOnTop) {
        g_pipWnd = pipWin;
    } else {
        console.log("failed to get pipwin");
    }
});

chrome.windows.onBoundsChanged.addListener(async (wnd) => {
    console.log("[onBoundsChanged] ", constName(wnd.id));
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("\n{\non listener");
    if (message.action === "switchWindow") {
    // if (message.action === "light") {
        try {
            const now = performance.now();
            const latestVisibility = PiPHasFocus || (now - vsb_hst.current.stamp < 200 ? vsb_hst.before.visible : vsb_hst.current.visible);
            const srcWnd = await chrome.windows.get(g_srcTab.windowId);
            const activeTab = await chrome.tabs.get(g_srcTab.id);
            const doesFocusTab = !activeTab.active;
            const doesFocusWnd = message.closing || srcWnd.state === "minimized" || !latestVisibility;
            const updateInfo = doesFocusWnd ? { focused: true } : { state: "minimized" };

            await chrome.windows.update(srcWnd.id, updateInfo);
            if (doesFocusTab) {
                await chrome.tabs.update(g_srcTab.id, { active: true });
            }
            sendResponse(updateInfo);
        } catch (err) {
            console.error(err);
        }
    } else if (message.action === "onBlur" || message.action === "onFocus") {
        const now = performance.now();
        console.log(`${message.action}: ${now}`);
        const tmp = {
            before: vsb_hst.current,
            current: {
                visible: message.action === "onFocus",
                stamp: now
            }
        };
        vsb_hst = tmp;
        if (message.action === "onBlur") {
            const last = await chrome.windows.getLastFocused();
            console.log(last.id === g_pipWnd.id);
            PiPHasFocus = last.id === g_pipWnd.id;
        }
    } else if (message.action === "onBlurPiP") {
        PiPHasFocus = false;
    } else if (message.action === "createdPiP") {
        const tabs = await chrome.tabs.query({});
        const tab = sender.tab || tabs.find(t => t.url === message.url);

        if (!tab) {
            console.log("Failed to get source tab.");
        } else if (sender.tab) {
            console.log("Got the tab from sender.");
        } else {
            console.log("Got the tab from result of query.");
        }

        if (tab) {
            g_srcTab = tab;
            const pipTab = tabs.filter(t => t.openerTabId === tab.id && t.windowId !== tab.windowId)[0];
            console.log("tabs: ", pipTab, tabs);
            g_pipWnd = await chrome.windows.get(pipTab.windowId);
        }
        PiPHasFocus = true;

        console.log(g_srcTab, g_pipWnd);

    } else {
        console.log(`Unexpected message received: ${message.action}`);
    }
    if (message.closing) {
        g_srcTab = {};
        g_pipWnd = {};
        vsb_hst = {
            before: {
                visible: false,
                stamp: performance.now()
            },
            current: {
                visible: false,
                stamp: performance.now()
            }
        };
        PiPHasFocus = false;
    }
    console.log("return\n}\n.")
    return true;
});
