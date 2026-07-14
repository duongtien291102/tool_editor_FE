import type { ProjectNode } from '../types';

export const mockProjectTree: ProjectNode = {
  id: 'root',
  name: 'Project',
  type: 'folder',
  children: [
    { id: 'f1', name: 'Scripts', type: 'folder', children: [] },
    { id: 'f2', name: 'Scenes', type: 'folder', children: [] },
    { id: 'f3', name: 'Assets', type: 'folder', children: [] },
    { id: 'f4', name: 'Audio', type: 'folder', children: [] },
    { id: 'f5', name: 'Subtitle', type: 'folder', children: [] },
    { id: 'f6', name: 'Export', type: 'folder', children: [] },
    { id: 'f7', name: 'Settings', type: 'folder', children: [] },
  ]
};
