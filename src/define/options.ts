export const OptionKeys = [
    "useDarkThema",
    "clickToPlay"
] as const;

export type OptionKeys_T = typeof OptionKeys[number];
export type OptionConfigs_T = {
    [k in OptionKeys_T]: boolean;
};
