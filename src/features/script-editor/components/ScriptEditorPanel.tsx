import React, { useEffect } from 'react';
import { useScriptStore } from '../store/scriptStore';
import { SceneList } from './SceneList';
import { SceneEditor } from './SceneEditor';
import { StatusBar } from './StatusBar';

export const ScriptEditorPanel: React.FC = () => {
  const fetchScript = useScriptStore(state => state.fetchScript);
  const loading = useScriptStore(state => state.loading);

  useEffect(() => {
    void fetchScript('proj_1'); // MOCK Project ID
  }, [fetchScript]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <SceneList />
        <SceneEditor />
      </div>
      <StatusBar />
    </div>
  );
};
