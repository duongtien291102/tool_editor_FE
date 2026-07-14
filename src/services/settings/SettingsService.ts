export interface AppSettings {
  autoSave: boolean;
  language: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSave: true,
  language: 'vi',
};

class SettingsService {
  private readonly STORAGE_KEY = 'app_settings';

  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  }

  saveSettings(settings: Partial<AppSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}

export const settingsService = new SettingsService();
