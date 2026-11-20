export const OptionKeys = [
    "useDarkThema",
    "clickToPlay"
] as const;

export type OptionKeys_T = typeof OptionKeys[number];
export type OptionConfigs_T = {
    [k in OptionKeys_T]: boolean;
};

function genDefaultOptions() {
    const defaultOption: Partial<OptionConfigs_T> = {};
    for (const key of OptionKeys) {
        defaultOption[key] = false;
    }
    return defaultOption as OptionConfigs_T;
}

export const DefaultOptions = genDefaultOptions();
