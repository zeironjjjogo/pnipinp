import { OptionKeys, type OptionConfigs_T } from ":=/options";

export class ConfigHolder_T {
    private m_config: OptionConfigs_T | null = null;

    public async loadConfigs() {
        this.m_config = await chrome.storage.sync.get([...OptionKeys]);
    }

    public getConfig(): OptionConfigs_T | null {
        return this.m_config;
    }
};

export const ConfigHolder = new ConfigHolder_T();
