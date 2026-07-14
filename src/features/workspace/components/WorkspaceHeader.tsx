import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../hooks/useWorkspace';
import { useCurrentProject } from '../hooks/useCurrentProject';

export const WorkspaceHeader: React.FC = () => {
  const { t } = useTranslation('workspace');
  const { fetchWorkspaceData } = useWorkspace();
  const { currentProject } = useCurrentProject();

  useEffect(() => {
    fetchWorkspaceData();
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
            {t('header.local')}
          </span>
        </div>
      </div>
      
      {/* CENTER: Toolbar (Undo/Redo, Search, Command) */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs" title={t('header.undo')}>
          U
        </div>
        <div className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs" title={t('header.redo')}>
          R
        </div>
        <div className="h-4 w-px bg-border mx-2"></div>
        <div className="h-8 w-64 rounded bg-muted flex items-center px-3 text-xs text-muted-foreground cursor-text">
          {t('header.search')}
        </div>
        <div className="h-4 w-px bg-border mx-2"></div>
        <div className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs" title={t('header.commandPalette')}>
          C
        </div>
      </div>

      {/* RIGHT: Export, Settings, User */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground cursor-pointer font-bold text-xs" title={t('header.settings')}>
          S
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer border border-primary/30" title={t('header.user')}>
          AI
        </div>
        <div className="h-4 w-px bg-border mx-2"></div>
        <div className="h-8 px-4 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity font-medium shadow-sm">
          {t('header.export')}
        </div>
      </div>
    </header>
  );
};
