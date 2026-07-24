import React from 'react';
import { Button } from '@/components/ui/Button';

interface DashboardPageProps {
  onNavigateToProjects: () => void;
  onNavigateToAiStudio?: () => void;
  onNavigateToExport?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToProjects,
  onNavigateToAiStudio,
  onNavigateToExport,
}) => {
  return (
    <div className="min-h-full bg-background p-6 space-y-6 text-foreground">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Video Studio Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI generation workflows, video projects, assets, and rendering pipelines.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onNavigateToProjects}>Explore Projects</Button>
          {onNavigateToAiStudio && (
            <Button variant="outline" onClick={onNavigateToAiStudio}>
              AI Generation Engine
            </Button>
          )}
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Active Projects
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
              +12%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">24</p>
          <p className="mt-1 text-xs text-muted-foreground">6 updated today</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              AI Render Jobs
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-mono">
              Active
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">142</p>
          <p className="mt-1 text-xs text-muted-foreground">98.4% success rate</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Video Exports
            </span>
            <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded font-mono">
              4K NVENC
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">87</p>
          <p className="mt-1 text-xs text-muted-foreground">Total 14.2 GB encoded</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              AI Providers
            </span>
            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-mono">
              Connected
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">6</p>
          <p className="mt-1 text-xs text-muted-foreground">Veo, Sora, Runway, Kling</p>
        </div>
      </div>

      {/* Quick Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Projects</h2>
            <button
              onClick={onNavigateToProjects}
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {[
              {
                id: '1',
                name: 'Cyberpunk City Intro',
                aspect: '16:9',
                status: 'Completed',
                updated: '2 hours ago',
              },
              {
                id: '2',
                name: 'Product Launch Trailer',
                aspect: '9:16',
                status: 'Rendering',
                updated: '4 hours ago',
              },
              {
                id: '3',
                name: 'Nature Documentary Shot 3',
                aspect: '16:9',
                status: 'Draft',
                updated: '1 day ago',
              },
            ].map((project) => (
              <div key={project.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Aspect Ratio: {project.aspect} • Updated {project.updated}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    project.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : project.status === 'Rendering'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Button className="w-full justify-start" onClick={onNavigateToProjects}>
              + Create New Project
            </Button>
            {onNavigateToAiStudio && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onNavigateToAiStudio}
              >
                🎬 Launch AI Generation Studio
              </Button>
            )}
            {onNavigateToExport && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onNavigateToExport}
              >
                📦 Video Export Manager
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
