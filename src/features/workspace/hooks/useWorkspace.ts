import { useWorkspaceStore } from '../store/workspaceStore';
import { useShallow } from 'zustand/react/shallow';

export const useWorkspace = () => {
  return useWorkspaceStore(useShallow(state => ({
    workspace: state.workspace,
    config: state.config,
    loading: state.loading,
    error: state.error,
    fetchWorkspaceData: state.fetchWorkspaceData
  })));
};
