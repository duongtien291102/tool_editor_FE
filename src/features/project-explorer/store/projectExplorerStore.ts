import { create } from 'zustand';
import type { ProjectNode } from '../types';
import { projectExplorerService } from '../services/projectExplorer.service';

interface ProjectExplorerState {
  tree: ProjectNode | null;
  loading: boolean;
  expandedNodeIds: Set<string>;
  fetchTree: () => Promise<void>;
  toggleNode: (id: string) => void;
}

export const useProjectExplorerStore = create<ProjectExplorerState>((set) => ({
  tree: null,
  loading: false,
  expandedNodeIds: new Set(['root']), // expand root by default
  fetchTree: async () => {
    set({ loading: true });
    const tree = await projectExplorerService.getProjectTree();
    set({ tree, loading: false });
  },
  toggleNode: (id: string) => set((state) => {
    const newSet = new Set(state.expandedNodeIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return { expandedNodeIds: newSet };
  })
}));
