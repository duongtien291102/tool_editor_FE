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
      set({ 
        workspace: data.workspace, 
        projects: data.projects, 
        recentProjects: data.recentProjects,
        config: data.settings,
        currentProjectId: data.projects[0]?.id || null,
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setCurrentProject: (id) => set({ currentProjectId: id }),
}));
