import { create } from 'zustand';
import type { Workspace, Project, WorkspaceConfig } from '../types';
import { workspaceService } from '../services/workspace.service';

export interface WorkspaceState {
  workspace: Workspace | null;
  projects: Project[];
  recentProjects: Project[];
  currentProjectId: string | null;
  config: WorkspaceConfig;
  loading: boolean;
  error: string | null;

  fetchWorkspaceData: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  projects: [],
  recentProjects: [],
  currentProjectId: null,
  config: { autoSave: true, layoutPreset: 'default' },
  loading: false,
  error: null,

  fetchWorkspaceData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.getWorkspaceData();
      set((state) => ({
        workspace: data.workspace,
        projects: data.projects,
        recentProjects: data.recentProjects,
        config: data.settings,
        currentProjectId: data.projects.some((project) => project.id === state.currentProjectId)
          ? state.currentProjectId
          : (data.projects[0]?.id ?? null),
        loading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to load workspace data.';
      set({ error: message, loading: false });
    }
  },

  createProject: async (name) => {
    set({ loading: true, error: null });
    try {
      const project = await workspaceService.createProject(name);
      set((state) => ({
        projects: [project, ...state.projects],
        recentProjects: [project, ...state.recentProjects].slice(0, 10),
        currentProjectId: project.id,
        loading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Unable to create project.',
        loading: false,
      });
    }
  },
  renameProject: async (id, name) => {
    const project = useWorkspaceStore.getState().projects.find((item) => item.id === id);
    if (!project) return;
    set({ loading: true, error: null });
    try {
      const updated = await workspaceService.updateProject(project, name);
      set((state) => ({
        projects: state.projects.map((item) => (item.id === id ? updated : item)),
        recentProjects: state.recentProjects.map((item) => (item.id === id ? updated : item)),
        loading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Unable to update project.',
        loading: false,
      });
    }
  },
  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await workspaceService.deleteProject(id);
      set((state) => {
        const projects = state.projects.filter((project) => project.id !== id);
        return {
          projects,
          recentProjects: state.recentProjects.filter((project) => project.id !== id),
          currentProjectId:
            state.currentProjectId === id ? (projects[0]?.id ?? null) : state.currentProjectId,
          loading: false,
        };
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Unable to delete project.',
        loading: false,
      });
    }
  },

  setCurrentProject: (id) => set({ currentProjectId: id }),
}));
