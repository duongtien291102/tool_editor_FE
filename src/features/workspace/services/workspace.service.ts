import type { WorkspaceData, Project } from '../types';
import { mockWorkspace } from '../mock/data';

export const workspaceService = {
  getWorkspaceData: async (): Promise<WorkspaceData> => {
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve(mockWorkspace), 500));
  },
  
  createProject: async (name: string): Promise<Project> => {
    return new Promise((resolve) => setTimeout(() => {
      resolve({
        id: `proj_${Date.now()}`,
        workspaceId: 'ws_1',
        name,
        lastOpened: Date.now(),
        createdAt: Date.now()
      })
    }, 500));
  }
};
