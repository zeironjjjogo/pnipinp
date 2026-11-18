let g_pipTab = {};
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
    // "devtools", 
    "popup"
];

function constName(id) {
    if (id === chrome.windows.WINDOW_ID_NONE) return `NONE(${id})`;
    if (id === g_pipTab.id) return `CurTab(${id})`;
    if (id === g_pipTab.windowId) return `CurWnd(${id})`;
    if (id === g_pipWnd.id) return `PiPWnd(${id})`;
    return id;
}

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    g_pipTab = tab;
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
    // if (message.action === "switchWindow") {
    //     // chrome.tabs.get(g_tab.id).then((t) => {
    //     //     chrome.windows.get(t.windowId).then((wnd) => {
    //     //         const state = wnd.state;
    //     //         const wndState = state === "minimized" || !t.active ? "normal" : "minimized";
    //     //         const tabState = state === "minimized" || !t.active;
    //     //         console.log(`focus: ${wnd.focused}, wndState: ${state}, tabState: ${t.active}\ngonna: ${wndState}, ${tabState}`);
    //     //         chrome.windows.update(wnd.id, { state: wndState }).then((w) => {
    //     //             chrome.tabs.update(t.id, { active: tabState })
    //     //             sendResponse(w);
    //     //         }).catch((reason) => {
    //     //             console.error(reason);
    //     //         });
    //     //     }).catch((reason) => {
    //     //         console.error(reason);
    //     //     });
    //     // });

    //     /*
    //         If the before focused window is the parent window, update the parent window to hidden.
    //         Otherwise, focus the parent window. (If the parent tab is not active, activate it.)
    //     */

    //     try {
    //         const curTab = await chrome.tabs.get(g_pipTab.id); // Source tab of PiP
    //         const curWnd = await chrome.windows.get(curTab.windowId);   // Source window of PiP
    //         const lastWnd = await chrome.windows.getLastFocused();
            
    //         console.log(curWnd.state);
    //         console.log(`before: ${constName(wnd_hst.before.id)}\ncurrent: ${constName(wnd_hst.current.id)}\nlast: ${constName(lastWnd.id)}`);
    //         console.log("before: ", wnd_hst.before.id === curWnd.id, " sender: ", sender.tab.windowId === curWnd.id);

    //         const requestHide = (wnd_hst.before.id === curWnd.id && sender.tab.windowId === curWnd.id);
    //         console.log("requestHide: ", requestHide);

    //         const updateInfo = { state: requestHide ? "minimized" : "normal" };

    //         if (requestHide) {
    //             await chrome.windows.update(g_pipWnd.id, { focused: true });
    //         }

    //         // if (!requestHide)
    //         //     updateInfo.focused = true;

    //         chrome.windows.update(curWnd.id, updateInfo, (w) => {
    //             console.log("updated state");
    //         });

    //         if (!requestHide) {
    //             updateInfo.focused = true;
    //             setTimeout(() => {
    //                 chrome.windows.update(curWnd.id, updateInfo, (w) => {
    //                     console.log("updated focused");
    //                 });
    //             }, 1000);
    //         }

    //         if (!requestHide && !curTab.active) {
    //             console.log("The tab activate.");
    //             chrome.tabs.update(curTab.id, { active: true });
    //         }
    //         // if (requestHide) {
    //         //     const temp = {
    //         //         before: state.current,
    //         //         current: {
    //         //             id: chrome.windows.WINDOW_ID_NONE,
    //         //             stamp: performance.now()
    //         //         }
    //         //     };
    //         //     state = temp;
    //         // }

    //         // simplifised
    //         // chrome.windows.update(curWnd.id, { state: curWnd.state === "minimized" ? "normal" : "minimized" }, (w) => console.log("updated: ", w));
    //         sendResponse();

    //     } catch (error) {
    //         console.error(error);
    //     }
    // } else 
    if (message.action === "test") {
        try {
            const now = performance.now();
            const lastVisible = PiPHasFocus || now - vsb_hst.current.stamp < 200 ? vsb_hst.before.visible : vsb_hst.current.visible;
            console.log("lastVisible: ", lastVisible, "diff: ", now - vsb_hst.current.stamp);
            console.log("pip have focus: ", PiPHasFocus);
            console.log(g_pipTab.id, g_pipTab.windowId);
            console.log(g_pipTab, g_pipWnd);

            const srcWnd = await chrome.windows.get(g_pipTab.windowId);
            const [tab] = await chrome.tabs.query({ active: true });
            if (!tab || tab.id !== g_pipTab.id) {
                console.log("Current tab is not src tab.");
            }
            const doesActivateTab = !tab || tab.id !== g_pipTab.id;
            const doesShow = message.closing || srcWnd.state === "minimized" ? true : !lastVisible;
            const updateInfo = { state: doesShow ? "maximized" : "minimized" };

            console.log("doesShow: ", doesShow, ",  state: ", srcWnd.state, " => ", updateInfo.state);
            
            await chrome.windows.update(srcWnd.id, updateInfo);

            if (doesShow) {
                console.log("To focus the window");
                await chrome.windows.update(srcWnd.id, { focused: true });
                if (doesActivateTab) {
                    console.log("To activate the tab");
                    await chrome.tabs.update(g_pipTab.id, { active: true });
                }
            }
            sendResponse();
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
        const [tab] = await chrome.tabs.query({ active: false });
        const cur = await chrome.windows.getCurrent();
        console.log(tab, cur);
    } else {
        console.log(message.action);
    }
    if (message.closing) {
        g_pipTab = {};
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
