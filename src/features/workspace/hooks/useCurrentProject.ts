import { useWorkspaceStore } from '../store/workspaceStore';
import { useShallow } from 'zustand/react/shallow';

export const useCurrentProject = () => {
  return useWorkspaceStore(useShallow(state => {
    const currentProject = state.projects.find(p => p.id === state.currentProjectId) || null;
    return {
      currentProject,
      currentProjectId: state.currentProjectId,
      setCurrentProject: state.setCurrentProject
    };
  }));
};
