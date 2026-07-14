import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScriptStore } from '../store/scriptStore';
import { EditorFactory } from '../adapters/EditorFactory';
import type { Script, SceneElement } from '../types';

export const SceneEditor: React.FC = () => {
  const { t } = useTranslation('scriptEditor');
  const script = useScriptStore(state => state.script);
  const activeSceneId = useScriptStore(state => state.activeSceneId);
  const updateScript = useScriptStore(state => state.updateScript);

  if (!script || !activeSceneId) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">{t('editor.selectScene')}</div>;
  }

  const sceneIndex = script.scenes.findIndex(s => s.id === activeSceneId);
  const scene = script.scenes[sceneIndex];

  if (!scene) return null;

  const Editor = EditorFactory.getEditor('basic'); // Can be changed to 'monaco' easily later

  const handleTitleChange = (newTitle: string) => {
    const newScript = JSON.parse(JSON.stringify(script)) as Script; // Deep copy for immutability
    newScript.scenes[sceneIndex].title = newTitle;
    updateScript(newScript);
  };

  const handleNotesChange = (newNotes: string) => {
    const newScript = JSON.parse(JSON.stringify(script)) as Script;
    newScript.scenes[sceneIndex].notes = newNotes;
    updateScript(newScript);
  };

  const handleElementChange = (elementId: string, newContent: string) => {
    const newScript = JSON.parse(JSON.stringify(script)) as Script;
    const elIndex = newScript.scenes[sceneIndex].elements.findIndex((e: SceneElement) => e.id === elementId);
    if (elIndex !== -1) {
      newScript.scenes[sceneIndex].elements[elIndex].content = newContent;
      updateScript(newScript);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-panel">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">{t('editor.sceneTitle')}</label>
          <input 
            type="text"
            className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors py-1"
            value={scene.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={t('editor.sceneTitlePlaceholder')}
          />
        </div>

        {/* Elements (Prompts) */}
        <div className="flex flex-col gap-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">{t('editor.elements')}</label>
          {scene.elements.map(el => (
            <div key={el.id} className="flex flex-col gap-1 border border-border p-3 rounded-lg bg-card">
              <span className="text-[10px] uppercase font-bold text-primary">{el.type}</span>
              <Editor 
                value={el.content}
                onChange={(val) => handleElementChange(el.id, val)}
                placeholder={t('editor.elementPlaceholder')}
              />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">{t('editor.notes')}</label>
          <Editor 
            value={scene.notes}
            onChange={handleNotesChange}
            placeholder={t('editor.notesPlaceholder')}
            className="text-xs"
          />
        </div>

      </div>
    </div>
  );
};
