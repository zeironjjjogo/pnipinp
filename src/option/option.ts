import { OptionKeys, type OptionKeys_T, type OptionConfigs_T } from ":=/options";

type ElemsObj = {
    [k in OptionKeys_T]: HTMLInputElement | null;
};

function getElements(): ElemsObj {
    let elems: Partial<ElemsObj> = {};
    for (const key of OptionKeys) {
        elems[key] = document.querySelector<HTMLInputElement>(`input#${key}`);
    }
    return elems as ElemsObj;
}

(async () => {
    const elems = getElements();
    const configs = await chrome.storage.sync.get<OptionConfigs_T>([...OptionKeys]);
    
    for (const key of OptionKeys) {
        const elem = elems[key];
        if (!elem || !(key in configs)) continue;
        elem.checked = configs[key];
    }

    const submitBtn = document.querySelector("button");
    if (!submitBtn) return;

    submitBtn.addEventListener("pointerup", () => {
        let data: Partial<OptionConfigs_T> = {};
        for (const key of OptionKeys) {
            data[key] = elems[key]?.checked || false;
        }
        console.log("options set to: ", data);
        chrome.storage.sync.set(data);
    });
})();
