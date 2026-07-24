import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  aspectRatio: string;
  status: 'Draft' | 'Rendering' | 'Completed';
  shotCount: number;
  updatedAt: string;
}

interface ProjectListPageProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectListPage: React.FC<ProjectListPageProps> = ({ onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAspect, setNewProjectAspect] = useState('16:9');

  const [projects, setProjects] = useState<ProjectSummary[]>([
    {
      id: 'p-1',
      name: 'Cyberpunk Commercial 2026',
      description: 'Futuristic AI video commercial generated with Google Veo and Runway Gen-3.',
      aspectRatio: '16:9',
      status: 'Completed',
      shotCount: 12,
      updatedAt: '2026-07-24',
    },
    {
      id: 'p-2',
      name: 'TikTok Fashion Reel #4',
      description: 'Vertical fashion video for social media marketing.',
      aspectRatio: '9:16',
      status: 'Rendering',
      shotCount: 6,
      updatedAt: '2026-07-23',
    },
    {
      id: 'p-3',
      name: 'Cinematic Movie Trailer',
      description: 'Ultra-HD 4K sci-fi trailer sequence with multi-track audio.',
      aspectRatio: '21:9',
      status: 'Draft',
      shotCount: 18,
      updatedAt: '2026-07-22',
    },
  ]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const created: ProjectSummary = {
      id: `p-${Date.now()}`,
      name: newProjectName.trim(),
      description: 'New AI Video Project',
      aspectRatio: newProjectAspect,
      status: 'Draft',
      shotCount: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setProjects([created, ...projects]);
    setNewProjectName('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-full bg-background p-6 space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects Studio</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI video production projects, timelines, and scenes.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Create New Project</Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Search projects..."
          className="h-10 w-full md:w-80 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 w-full md:w-auto">
          {['ALL', 'DRAFT', 'RENDERING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-accent text-muted-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className="group rounded-lg border border-border bg-card p-5 hover:border-primary cursor-pointer transition-all shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                {project.aspectRatio}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
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

            <div>
              <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {project.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
              <span>Shots: {project.shotCount}</span>
              <span>Updated {project.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <label className="block text-sm font-medium">
                Project Name
                <input
                  type="text"
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="My AI Video Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                Aspect Ratio
                <select
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={newProjectAspect}
                  onChange={(e) => setNewProjectAspect(e.target.value)}
                >
                  <option value="16:9">16:9 Landscape (YouTube, TV)</option>
                  <option value="9:16">9:16 Portrait (TikTok, Shorts, Reels)</option>
                  <option value="1:1">1:1 Square (Instagram)</option>
                  <option value="21:9">21:9 Ultrawide Cinematic</option>
                </select>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
