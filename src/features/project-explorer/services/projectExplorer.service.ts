import type { ProjectNode } from '../types';
import { mockProjectTree } from '../mock/data';

export const projectExplorerService = {
  getProjectTree: async (): Promise<ProjectNode> => {
    return new Promise(resolve => setTimeout(() => resolve(mockProjectTree), 300));
  }
};
