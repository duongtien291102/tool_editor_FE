import { useTranslation } from 'react-i18next';
import { settingsService } from '@/services/settings/SettingsService';
import { cn } from '@/core/utils/cn';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'compact', className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    settingsService.saveSettings({ language: lang });
  };

  if (variant === 'full') {
    return (
      <div className={cn('flex flex-wrap gap-3', className)}>
        <button
          type="button"
          onClick={() => setLanguage('vi')}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
            currentLang === 'vi'
              ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
              : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <span className="text-base">🇻🇳</span> {t('settings.vietnamese', 'Tiếng Việt')}
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
            currentLang === 'en'
              ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
              : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <span className="text-base">🇬🇧</span> {t('settings.english', 'English')}
        </button>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center rounded-lg border border-border bg-card p-0.5 text-xs font-medium', className)}>
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all',
          currentLang === 'vi'
            ? 'bg-primary/20 text-primary shadow-xs font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Tiếng Việt (Mặc định)"
      >
        <span>🇻🇳</span>
        <span>VI</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all',
          currentLang === 'en'
            ? 'bg-primary/20 text-primary shadow-xs font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
