import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScriptStore } from '../store/scriptStore';

export const SceneList: React.FC = () => {
  const { t } = useTranslation('scriptEditor');
  const script = useScriptStore((state) => state.script);
  const activeSceneId = useScriptStore((state) => state.activeSceneId);
  const setActiveScene = useScriptStore((state) => state.setActiveScene);
  const addScene = useScriptStore((state) => state.addScene);
  const deleteScene = useScriptStore((state) => state.deleteScene);
  const reorderScene = useScriptStore((state) => state.reorderScene);

  if (!script) return null;

  return (
    <div className="w-64 border-r border-border bg-card h-full flex flex-col shrink-0">
      <div className="h-10 border-b border-border flex items-center justify-between px-3 font-medium text-sm">
        <span>{t('sceneList.title')}</span>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => {
            const name = window.prompt(t('editor.sceneTitlePlaceholder'));
            if (name?.trim()) void addScene(name.trim());
          }}
        >
          {t('panel.addScene')}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {script.scenes.map((scene, index) => (
          <div
            key={scene.id}
            onClick={() => setActiveScene(scene.id)}
            className={`px-4 py-2 text-sm cursor-pointer hover:bg-accent flex flex-col gap-1 transition-colors ${activeSceneId === scene.id ? 'bg-accent border-r-2 border-primary' : ''}`}
          >
            <div className="font-semibold text-foreground truncate">
              {index + 1}. {scene.title || t('sceneList.untitledScene')}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {scene.notes || t('sceneList.noNotes')}
            </div>
            <div className="flex gap-2 text-[10px]" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                aria-label={`Move ${scene.title} up`}
                disabled={index === 0}
                onClick={() => {
                  void reorderScene(scene.id, index - 1);
                }}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${scene.title} down`}
                disabled={index === script.scenes.length - 1}
                onClick={() => {
                  void reorderScene(scene.id, index + 1);
                }}
              >
                ↓
              </button>
              <button
                type="button"
                className="text-destructive"
                aria-label={`Delete scene ${scene.title}`}
                onClick={() => {
                  if (window.confirm(t('panel.confirmDelete'))) void deleteScene(scene.id);
                }}
              >
                {t('panel.deleteScene')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
