import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScriptStore } from '../store/scriptStore';

export const SceneList: React.FC = () => {
  const { t } = useTranslation('scriptEditor');
  const script = useScriptStore(state => state.script);
  const activeSceneId = useScriptStore(state => state.activeSceneId);
  const setActiveScene = useScriptStore(state => state.setActiveScene);

  if (!script) return null;

  return (
    <div className="w-64 border-r border-border bg-card h-full flex flex-col shrink-0">
      <div className="h-10 border-b border-border flex items-center px-4 font-medium text-sm">
        {t('sceneList.title')}
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
          </div>
        ))}
      </div>
    </div>
  );
};
