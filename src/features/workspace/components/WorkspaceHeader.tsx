import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../hooks/useWorkspace';
import { useCurrentProject } from '../hooks/useCurrentProject';
import { useAuth } from '@/features/auth';
import { settingsService } from '@/services/settings/SettingsService';
import { useTimelineStore } from '@/features/timeline';
import { useStudioStore } from '@/state/studioStore';
import { persistTimelineDocumentToBackend } from '@/services/aiTimelineSyncService';

export const WorkspaceHeader: React.FC = () => {
  const { t, i18n } = useTranslation('workspace');
  const { fetchWorkspaceData } = useWorkspace();
  const { currentProject } = useCurrentProject();
  const { user, logout } = useAuth();

  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    void i18n.changeLanguage(nextLang);
    settingsService.saveSettings({ language: nextLang });
  };

  useEffect(() => {
    void fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  return (
    <header className="h-12 border-b border-border flex items-center px-4 bg-card shrink-0 select-none justify-between">
      {/* LEFT: Branding & Project */}
      <div className="flex items-center gap-4">
        <div className="font-bold text-sm tracking-tight text-primary">{t('header.title')}</div>
        <div className="h-4 w-px bg-border"></div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 hover:text-foreground cursor-pointer px-2 py-1 rounded transition-colors">
          <span className="truncate max-w-[200px] font-medium text-foreground">
            {currentProject?.name || t('header.untitledProject')}
          </span>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-wider">
            API
          </span>
        </div>
      </div>

      {/* CENTER: Toolbar (Undo/Redo, Search, Command) */}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs"
          title={t('header.undo')}
        >
          U
        </div>
        <div
          className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs"
          title={t('header.redo')}
        >
          R
        </div>
        <div className="h-4 w-px bg-border mx-2"></div>
        <div className="h-8 w-64 rounded bg-muted flex items-center px-3 text-xs text-muted-foreground cursor-text">
          {t('header.search')}
        </div>
        <div className="h-4 w-px bg-border mx-2"></div>
        <div
          className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs"
          title={t('header.commandPalette')}
        >
          C
        </div>
      </div>

      {/* RIGHT: Language Switcher, Export, Settings, User */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="h-7 px-2 rounded border border-border text-xs font-bold bg-muted hover:bg-accent text-foreground transition-colors flex items-center gap-1"
          title="Chuyển đổi ngôn ngữ / Switch language"
          onClick={toggleLanguage}
        >
          🌐 {currentLang.toUpperCase()}
        </button>
        <div
          className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs"
          title={t('header.settings')}
        >
          S
        </div>
        <button
          type="button"
          className="h-8 min-w-8 rounded-full bg-primary/20 px-2 text-xs font-bold text-primary border border-primary/30"
          title={`${user?.username ?? t('header.user')} · Sign out`}
          onClick={() => {
            void logout();
          }}
        >
          {(user?.username || 'AI').slice(0, 2).toUpperCase()}
        </button>
        <div className="h-4 w-px bg-border mx-2"></div>
        <button
          type="button"
          onClick={async () => {
            const doc = useTimelineStore.getState().document;
            const studioState = useStudioStore.getState();
            const projectId = studioState.currentProjectId || 'project-atlas';
            if (doc && projectId) {
              await persistTimelineDocumentToBackend(projectId, doc);
            }
          }}
          className="h-8 px-4 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity font-medium shadow-sm"
        >
          {t('header.export')}
        </button>
      </div>
    </header>
  );
};
