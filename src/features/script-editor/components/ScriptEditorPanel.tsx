import React, { useEffect } from 'react';
import { useCurrentProject } from '@/features/workspace';
import { useScriptStore } from '../store/scriptStore';
import { SceneList } from './SceneList';
import { SceneEditor } from './SceneEditor';
import { StatusBar } from './StatusBar';

export const ScriptEditorPanel: React.FC = () => {
  const { currentProjectId } = useCurrentProject();
  const fetchProjectScripts = useScriptStore((state) => state.fetchProjectScripts);
  const loading = useScriptStore((state) => state.loading);
  const scripts = useScriptStore((state) => state.scripts);
  const script = useScriptStore((state) => state.script);
  const error = useScriptStore((state) => state.error);
  const openScript = useScriptStore((state) => state.openScript);
  const createScript = useScriptStore((state) => state.createScript);
  const renameScript = useScriptStore((state) => state.renameScript);
  const deleteScript = useScriptStore((state) => state.deleteScript);
  const updateScript = useScriptStore((state) => state.updateScript);

  useEffect(() => {
    if (currentProjectId) void fetchProjectScripts(currentProjectId);
  }, [currentProjectId, fetchProjectScripts]);

  if (!currentProjectId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a project to edit scripts.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <header className="h-10 border-b border-border flex items-center gap-2 px-2 shrink-0">
        <select
          aria-label="Open script"
          className="min-w-0 flex-1 h-7 rounded border border-input bg-background px-2 text-xs"
          value={script?.id ?? ''}
          onChange={(event) => {
            if (event.target.value) void openScript(event.target.value);
          }}
        >
          <option value="">No script selected</option>
          {scripts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="h-7 px-2 rounded bg-primary text-primary-foreground text-xs"
          onClick={() => {
            const name = window.prompt('Script name');
            if (name?.trim()) void createScript(name.trim());
          }}
        >
          Create script
        </button>
        <button
          type="button"
          className="h-7 px-2 rounded border border-border text-xs"
          disabled={!script}
          onClick={() => {
            const name = window.prompt('Script name', script?.title);
            if (name?.trim()) void renameScript(name.trim());
          }}
        >
          Rename script
        </button>
        <button
          type="button"
          className="h-7 px-2 text-destructive text-xs"
          disabled={!script}
          onClick={() => {
            if (window.confirm(`Delete “${script?.title ?? 'script'}”?`)) void deleteScript();
          }}
        >
          Delete script
        </button>
      </header>
      {script && (
        <div className="px-2 py-1 border-b border-border">
          <input
            aria-label="Script description"
            className="w-full h-7 rounded border border-input bg-background px-2 text-xs"
            value={script.description}
            placeholder="Script description"
            onChange={(event) =>
              updateScript({ ...structuredClone(script), description: event.target.value })
            }
          />
        </div>
      )}
      {error && (
        <div role="alert" className="px-3 py-1 text-xs text-destructive border-b border-border">
          {error}
        </div>
      )}
      {!script ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Create or select a script.
        </div>
      ) : (
        <>
          <div className="flex flex-1 overflow-hidden">
            <SceneList />
            <SceneEditor />
          </div>
          <StatusBar />
        </>
      )}
    </div>
  );
};
