import { useWorkspaceStore } from '../store/workspaceStore';
import { useShallow } from 'zustand/react/shallow';

export const useRecentProjects = () => {
  return useWorkspaceStore(useShallow(state => ({
    recentProjects: state.recentProjects,
    projects: state.projects
  })));
};
