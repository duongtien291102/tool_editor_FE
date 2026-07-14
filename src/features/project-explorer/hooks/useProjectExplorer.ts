import { useProjectExplorerStore } from '../store/projectExplorerStore';
import { useShallow } from 'zustand/react/shallow';

export const useProjectExplorer = () => {
  return useProjectExplorerStore(useShallow(state => ({
    tree: state.tree,
    loading: state.loading,
    expandedNodeIds: state.expandedNodeIds,
    fetchTree: state.fetchTree,
    toggleNode: state.toggleNode
  })));
};
