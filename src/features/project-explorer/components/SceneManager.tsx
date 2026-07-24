import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface SceneItem {
  id: string;
  title: string;
  summary: string;
  order: number;
  shotCount: number;
}

interface SceneManagerProps {
  projectId: string;
  onSelectScene?: (sceneId: string) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = ({ projectId, onSelectScene }) => {
  const [scenes, setScenes] = useState<SceneItem[]>([
    {
      id: 'sc-1',
      title: 'Scene 1: Introduction to Cyberpunk World',
      summary: 'Establishing shot of neon city with rain',
      order: 1,
      shotCount: 4,
    },
    {
      id: 'sc-2',
      title: 'Scene 2: Protagonist Arrival',
      summary: 'Character steps out of flying vehicle',
      order: 2,
      shotCount: 5,
    },
    {
      id: 'sc-3',
      title: 'Scene 3: Climactic Battle',
      summary: 'High speed chase through neon alleyways',
      order: 3,
      shotCount: 3,
    },
  ]);

  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneTitle.trim()) return;

    const newScene: SceneItem = {
      id: `sc-${Date.now()}`,
      title: newSceneTitle.trim(),
      summary: 'New scene summary',
      order: scenes.length + 1,
      shotCount: 0,
    };

    setScenes([...scenes, newScene]);
    setNewSceneTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-base font-semibold">Scene Manager</h2>
          <p className="text-xs text-muted-foreground">
            Manage story structure & scenes for Project {projectId}
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
          + Add Scene
        </Button>
      </div>

      <div className="space-y-2">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            onClick={() => onSelectScene?.(scene.id)}
            className="flex items-center justify-between p-3 rounded-md border border-border bg-background hover:border-primary cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-mono font-bold">
                {scene.order}
              </span>
              <div>
                <p className="text-sm font-medium">{scene.title}</p>
                <p className="text-xs text-muted-foreground">{scene.summary}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{scene.shotCount} Shots</span>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-semibold">Add New Scene</h3>
            <form onSubmit={handleAddScene} className="space-y-3">
              <input
                type="text"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Scene Title..."
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Scene
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
