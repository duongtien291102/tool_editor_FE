import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '@/features/workspace';

export const ProjectExplorer: React.FC = () => {
  const { t } = useTranslation('projectExplorer');
  const {
    projects,
    currentProjectId,
    loading,
    error,
    fetchWorkspaceData,
    createProject,
    renameProject,
    deleteProject,
    setCurrentProject,
  } = useWorkspace();

  useEffect(() => {
    void fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const create = () => {
    const name = window.prompt('Project name');
    if (name?.trim()) void createProject(name.trim());
  };
  const rename = () => {
    const project = projects.find((item) => item.id === currentProjectId);
    if (!project) return;
    const name = window.prompt('Project name', project.name);
    if (name?.trim() && name.trim() !== project.name) void renameProject(project.id, name.trim());
  };
  const remove = () => {
    const project = projects.find((item) => item.id === currentProjectId);
    if (project && window.confirm(`Delete “${project.name}”?`)) void deleteProject(project.id);
  };

  return (
    <div className="h-full w-full bg-panel overflow-y-auto overflow-x-hidden border-r border-border">
      <div className="px-3 py-2 flex items-center justify-between sticky top-0 bg-panel/90 backdrop-blur z-10 border-b border-border/50">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('title')}
        </span>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            className="px-1.5 hover:bg-accent rounded"
            title="New project"
            onClick={create}
          >
            +
          </button>
          <button
            type="button"
            className="px-1.5 hover:bg-accent rounded disabled:opacity-40"
            title="Rename project"
            disabled={!currentProjectId}
            onClick={rename}
          >
            R
          </button>
          <button
            type="button"
            className="px-1.5 hover:bg-accent rounded disabled:opacity-40"
            title="Delete project"
            disabled={!currentProjectId}
            onClick={remove}
          >
            ×
          </button>
        </div>
      </div>
      <div className="py-2">
        {loading ? (
          <div className="px-4 text-xs text-muted-foreground">{t('loading')}</div>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <button
              type="button"
              key={project.id}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent ${project.id === currentProjectId ? 'bg-accent text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setCurrentProject(project.id)}
            >
              <span aria-hidden="true">▣</span>
              <span className="truncate">{project.name}</span>
            </button>
          ))
        ) : (
          <div className="px-4 text-xs text-muted-foreground">No projects</div>
        )}
        {error && (
          <div role="alert" className="px-4 pt-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
