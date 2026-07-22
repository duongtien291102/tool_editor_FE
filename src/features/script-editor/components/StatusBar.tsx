import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScriptStore } from '../store/scriptStore';
import { SaveStatus } from '../types';

export const StatusBar: React.FC = () => {
  const { t } = useTranslation('scriptEditor');
  const status = useScriptStore((state) => state.status);
  const pastCommands = useScriptStore((state) => state.pastCommands);
  const futureCommands = useScriptStore((state) => state.futureCommands);
  const undo = useScriptStore((state) => state.undo);
  const redo = useScriptStore((state) => state.redo);

  const getStatusText = () => {
    switch (status) {
      case SaveStatus.Saving:
        return t('status.saving');
      case SaveStatus.Saved:
        return t('status.saved');
      case SaveStatus.Dirty:
        return t('status.dirty');
      case SaveStatus.Error:
        return t('status.error');
      default:
        return '';
    }
  };

  return (
    <div
      data-save-status={status}
      className="h-8 border-t border-border bg-card flex items-center justify-between px-4 text-xs text-muted-foreground shrink-0 select-none"
    >
      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={pastCommands.length === 0}
          className="hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
          title={t('toolbar.undo')}
        >
          ↩ Undo
        </button>
        <button
          onClick={redo}
          disabled={futureCommands.length === 0}
          className="hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
          title={t('toolbar.redo')}
        >
          ↪ Redo
        </button>
      </div>
      <div>{getStatusText()}</div>
    </div>
  );
};
