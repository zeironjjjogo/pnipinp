import { OptionKeys, type OptionKeys_T, type OptionConfigs_T } from ":=/options";
import { Factor } from "~/optioni18n";

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
    const opti18n = new Factor();
    const elems = getElements();
    const configs = await chrome.storage.sync.get<OptionConfigs_T>([...OptionKeys]);

    if (configs.useDarkThema) {
        document.body.classList.add("thema--dark");
    } else {
        document.body.classList.add("thema--light");
    }
    
    for (const key of OptionKeys) {
        const elem = elems[key];
        if (!elem || !(key in configs)) continue;
        elem.checked = configs[key];
    }

    opti18n.submitButton.addEventListener("pointerup", () => {
        const data: Partial<OptionConfigs_T> = {};
        for (const key of OptionKeys) {
            data[key] = elems[key]?.checked || false;
        }
        console.log("options set to: ", data);
        chrome.storage.sync.set(data);
    });
})();
