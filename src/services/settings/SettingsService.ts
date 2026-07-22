export interface AppSettings {
  autoSave: boolean;
  language: string;
}

function isPartialAppSettings(value: unknown): value is Partial<AppSettings> {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.autoSave === undefined || typeof candidate.autoSave === 'boolean') &&
    (candidate.language === undefined || typeof candidate.language === 'string')
  );
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
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isPartialAppSettings(parsed)) return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      return DEFAULT_SETTINGS;
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
