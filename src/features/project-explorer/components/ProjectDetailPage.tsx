import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SceneManager } from './SceneManager';
import { ShotManager } from './ShotManager';
import { AssetLibrary } from './AssetLibrary';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onNavigateToTimeline?: (projectId: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
  onNavigateToTimeline,
}) => {
  const [activeTab, setActiveTab] = useState<'SCENES' | 'SHOTS' | 'ASSETS'>('SCENES');
  const [selectedSceneId, setSelectedSceneId] = useState<string>('sc-1');

  return (
    <div className="min-h-full bg-background p-6 space-y-6 text-foreground">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Back to Projects
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Project #{projectId}</h1>
            <p className="text-xs text-muted-foreground">
              Cyberpunk Commercial 2026 • 16:9 • 4K UHD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToTimeline && (
            <Button onClick={() => onNavigateToTimeline(projectId)}>🎞 Open Timeline Editor</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('SCENES')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-md transition-colors ${
            activeTab === 'SCENES'
              ? 'bg-card border-t border-x border-border text-primary border-b-2 border-b-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🎬 Scene Structure
        </button>
        <button
          onClick={() => setActiveTab('SHOTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-md transition-colors ${
            activeTab === 'SHOTS'
              ? 'bg-card border-t border-x border-border text-primary border-b-2 border-b-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📷 Shot Manager
        </button>
        <button
          onClick={() => setActiveTab('ASSETS')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-md transition-colors ${
            activeTab === 'ASSETS'
              ? 'bg-card border-t border-x border-border text-primary border-b-2 border-b-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📦 Media Asset Library
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'SCENES' && (
        <SceneManager
          projectId={projectId}
          onSelectScene={(sceneId) => {
            setSelectedSceneId(sceneId);
            setActiveTab('SHOTS');
          }}
        />
      )}

      {activeTab === 'SHOTS' && <ShotManager sceneId={selectedSceneId} />}

      {activeTab === 'ASSETS' && <AssetLibrary />}
    </div>
  );
};
