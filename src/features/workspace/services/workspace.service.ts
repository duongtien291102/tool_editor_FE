import type { WorkspaceData, Project } from '../types';
import { ProjectApi } from '@/api/ProjectApi';
import type { ApiSchema } from '@/api/types';

function mapProject(project: ApiSchema<'ProjectDto'>): Project {
  if (!project.id || !project.name) throw new Error('Project API returned an incomplete project.');
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    thumbnail: project.thumbnail ?? undefined,
    status: project.status?.toString(),
    createdAt: project.createdAt ? Date.parse(project.createdAt) : Date.now(),
    lastOpened: project.updatedAt ? Date.parse(project.updatedAt) : Date.now(),
  };
}

export const workspaceService = {
  getWorkspaceData: async (): Promise<WorkspaceData> => {
    const response = await ProjectApi.list({
      Page: 1,
      PageSize: 100,
      SortBy: 'UpdatedAt',
      SortDescending: true,
    });
    if (!response.success) throw new Error(response.message ?? 'Unable to load projects.');
    const projects = (response.data?.items ?? []).map(mapProject);
    return {
      workspace: { id: 'personal', name: 'My Workspace', ownerId: '' },
      projects,
      recentProjects: projects.slice(0, 10),
      settings: { autoSave: true, layoutPreset: 'default' },
    };
  },

  createProject: async (name: string): Promise<Project> => {
    const response = await ProjectApi.create({ name });
    if (!response.success || !response.data)
      throw new Error(response.message ?? 'Unable to create project.');
    return mapProject(response.data);
  },
  updateProject: async (project: Project, name: string): Promise<Project> => {
    const response = await ProjectApi.update(project.id, {
      name,
      description: project.description,
      thumbnail: project.thumbnail,
      status: project.status,
    });
    if (!response.success || !response.data)
      throw new Error(response.message ?? 'Unable to update project.');
    return mapProject(response.data);
  },
  deleteProject: async (id: string): Promise<void> => {
    const response = await ProjectApi.remove(id);
    if (!response.success) throw new Error(response.message ?? 'Unable to delete project.');
  },
};
