import { useWorkspaceStore } from '../store/workspaceStore';
import { useShallow } from 'zustand/react/shallow';

export const useWorkspace = () => {
  return useWorkspaceStore(
    useShallow((state) => ({
      workspace: state.workspace,
      config: state.config,
      loading: state.loading,
      error: state.error,
      projects: state.projects,
      currentProjectId: state.currentProjectId,
      fetchWorkspaceData: state.fetchWorkspaceData,
      createProject: state.createProject,
      renameProject: state.renameProject,
      deleteProject: state.deleteProject,
      setCurrentProject: state.setCurrentProject,
    })),
  );
};
