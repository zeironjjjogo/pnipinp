import { DefaultOptions, type OptionConfigs_T } from ":=/def";

export class ConfigHolder_T {
    private m_config: OptionConfigs_T | null = null;

    public async loadConfigs() {
        this.m_config = await chrome.storage.sync.get(DefaultOptions);
    }

    public getConfig(): OptionConfigs_T | null {
        return this.m_config;
    }
};

export const ConfigHolder = new ConfigHolder_T();
