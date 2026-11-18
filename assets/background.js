let g_pipTab = {};
let wnd_hst = {
    before: {
        id: chrome.windows.WINDOW_ID_NONE,
        stamp: -1
    },
    current: {
        id: chrome.windows.WINDOW_ID_NONE,
        stamp: -1
    }
};
let fcs_hst = {
    before: chrome.windows.WINDOW_ID_NONE,
    current: chrome.windows.WINDOW_ID_NONE
};
let g_pipWnd = {};
let g_old_state = undefined;
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
let isPip = false;

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

chrome.windows.onFocusChanged.addListener(async (wndId) => {
    // if (wndId === chrome.windows.WINDOW_ID_NONE) {
    //     const win = await chrome.windows.getLastFocused();
    //     console.log("LastFocused:", {
    //         id: constName(win.id),
    //         state: win.state,
    //         focused: win.focused,
    //         type: win.type
    //     });
    // }

    // if (wndId === wnd_hst.current.id) return;

    const actWnds = (await chrome.windows.getAll()).filter(w => w.focused && w.id !== g_pipWnd.id);
    console.log("actWnds: ", actWnds);
    const temp_thst = { before: fcs_hst.current, current: actWnds.length !== 0 ? actWnds[0] : chrome.windows.WINDOW_ID_NONE };
    fcs_hst = temp_thst;

    const temp = {
        before: wnd_hst.current,
        current: {
            id: wndId,
            stamp: performance.now()
        }
    };
    wnd_hst = temp;

    console.log(`${constName(wnd_hst.before.id)} => ${constName(wndId)}(focused: `, constName(fcs_hst.current), ");");
    // console.log("tab:\t", tab ? tab.windowId !== g_pipWnd.id ? { id: constName(tab.windowId), active: tab.active } : "pip": tab);


        // setTimeout(async () => {
        //     // const last = await chrome.windows.getLastFocused({ windowTypes: AllType });
        //     // const cur = await chrome.windows.getCurrent({ windowTypes: AllType });
        //     console.log("after 100ms");
            
        //     // console.log("last: ", { id: constName(last.id), focused: last.focused, state: last.state });
        //     // console.log("cur: ", { id: constName(cur.id), focused: cur.focused, state: cur.state });
        //     console.log("nowWnd:\t", constName(wndId));
        // }, 100);
}, { windowTypes: AllType });

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("\n{\non listener");
    if (message.action === "switchWindow") {
        // chrome.tabs.get(g_tab.id).then((t) => {
        //     chrome.windows.get(t.windowId).then((wnd) => {
        //         const state = wnd.state;
        //         const wndState = state === "minimized" || !t.active ? "normal" : "minimized";
        //         const tabState = state === "minimized" || !t.active;
        //         console.log(`focus: ${wnd.focused}, wndState: ${state}, tabState: ${t.active}\ngonna: ${wndState}, ${tabState}`);
        //         chrome.windows.update(wnd.id, { state: wndState }).then((w) => {
        //             chrome.tabs.update(t.id, { active: tabState })
        //             sendResponse(w);
        //         }).catch((reason) => {
        //             console.error(reason);
        //         });
        //     }).catch((reason) => {
        //         console.error(reason);
        //     });
        // });

        /*
            If the before focused window is the parent window, update the parent window to hidden.
            Otherwise, focus the parent window. (If the parent tab is not active, activate it.)
        */

        try {
            const curTab = await chrome.tabs.get(g_pipTab.id); // Source tab of PiP
            const curWnd = await chrome.windows.get(curTab.windowId);   // Source window of PiP
            const lastWnd = await chrome.windows.getLastFocused();
            
            console.log(curWnd.state);
            console.log(`before: ${constName(wnd_hst.before.id)}\ncurrent: ${constName(wnd_hst.current.id)}\nlast: ${constName(lastWnd.id)}`);
            console.log("before: ", wnd_hst.before.id === curWnd.id, " sender: ", sender.tab.windowId === curWnd.id);

            const requestHide = (wnd_hst.before.id === curWnd.id && sender.tab.windowId === curWnd.id);
            console.log("requestHide: ", requestHide);

            const updateInfo = { state: requestHide ? "minimized" : "normal" };

            if (requestHide) {
                await chrome.windows.update(g_pipWnd.id, { focused: true });
            }

            // if (!requestHide)
            //     updateInfo.focused = true;

            chrome.windows.update(curWnd.id, updateInfo, (w) => {
                console.log("updated state");
            });

            if (!requestHide) {
                updateInfo.focused = true;
                setTimeout(() => {
                    chrome.windows.update(curWnd.id, updateInfo, (w) => {
                        console.log("updated focused");
                    });
                }, 1000);
            }

            if (!requestHide && !curTab.active) {
                console.log("The tab activate.");
                chrome.tabs.update(curTab.id, { active: true });
            }
            // if (requestHide) {
            //     const temp = {
            //         before: state.current,
            //         current: {
            //             id: chrome.windows.WINDOW_ID_NONE,
            //             stamp: performance.now()
            //         }
            //     };
            //     state = temp;
            // }

            // simplifised
            // chrome.windows.update(curWnd.id, { state: curWnd.state === "minimized" ? "normal" : "minimized" }, (w) => console.log("updated: ", w));
            sendResponse();

        } catch (error) {
            console.error(error);
        }
    } else if (message.action === "test") {
        try {
            const now = performance.now();
            console.log("vsb_hst: ", vsb_hst);
            console.log("onClick: ", now);
            console.log("visibility: ", message.visible);
            const lastVisible = isPip || now - vsb_hst.current.stamp < 200 ? vsb_hst.before.visible : vsb_hst.current.visible;
            console.log("lastVisible: ", lastVisible, "diff: ", now - vsb_hst.current.stamp);
            console.log("pip have focus: ", isPip);

            const srcWnd = await chrome.windows.get(g_pipTab.windowId);
            // const preactWnd = (await chrome.windows.getAll()).find(w => w.focused && w.id !== g_pipWnd.id);
            // // const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            // // console.log("acttab: ", tab ? tab.windowId !== g_pip.id ? { id: constName(tab.windowId), active: tab.active } : "pip": tab);
            // console.log("pre-actWnd: ", preactWnd);
            // console.log("tab history: ", { before: constName(fcs_hst.before), current: constName(fcs_hst.current) });
            // console.log("wnd history: ", { before: constName(wnd_hst.before.id), current: constName(wnd_hst.current.id) });
            // const doesShow = srcWnd.state === "minimized";
            // const doesShow = !lastVisible;
            const doesShow = srcWnd.state === "minimized" ? true : !lastVisible;
            // if (srcWnd.state && srcWnd.state !== "minimized") {
            //     g_old_state = srcWnd.state;
            // }
            // const updateInfo = { state: doesShow ? ((g_old_state && g_old_state !== "minimized") ? g_old_state : "nomal") : "minimized" };
            const updateInfo = { state: doesShow ? "maximized" : "minimized" };
            console.log("doesShow: ", doesShow, ",  state: ", srcWnd.state, " => ", updateInfo.state);
            await chrome.windows.update(srcWnd.id, updateInfo);

            if (doesShow) {
                console.log("To focus the window");
                await chrome.windows.update(srcWnd.id, { focused: true });
            }
            // for (const delay of [500, 1000, 1500]) {
            //     setTimeout(async () => {
            //     // const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            //         const wnds = await chrome.windows.getAll();
            //         const actWnds = wnds.filter(v => v.focused);
            //         console.log(`after ${delay}ms\nactWnd: `, actWnds);
            //     // console.log("after 500ms\ntabs: ", tabs, "\nwnds: ", wnds);
            //         const t_tmp = { before: fcs_hst.current, current: doesShow ? srcWnd.id : chrome.windows.WINDOW_ID_NONE };
            //         const w_tmp = {
            //             before: wnd_hst.current,
            //             current: {
            //                 id: doesShow ? srcWnd.id : chrome.windows.WINDOW_ID_NONE,
            //                 stamp: performance.now()
            //             }
            //         };
            //         fcs_hst = t_tmp;
            //         wnd_hst = w_tmp;
            //     }, delay);
            // }
            
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
            isPip = last.id === g_pipWnd.id;
        }
    } else if (message.action === "onBlurPiP") {
        isPip = false;
    } else {
        console.log(message.action);
    }
    console.log("return\n}\n.")
    return true;
});
