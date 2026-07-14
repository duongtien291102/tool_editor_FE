import type { WorkspaceData } from '../types';

export const mockWorkspace: WorkspaceData = {
  workspace: {
    id: 'ws_1',
    name: 'Personal Workspace',
    ownerId: 'user_1',
  },
  projects: [
    { id: 'proj_1', workspaceId: 'ws_1', name: 'AI Gen Video Promo', lastOpened: Date.now() - 100000, createdAt: Date.now() - 500000 },
    { id: 'proj_2', workspaceId: 'ws_1', name: 'TikTok Dance Trend', lastOpened: Date.now() - 300000, createdAt: Date.now() - 800000 },
    { id: 'proj_3', workspaceId: 'ws_1', name: 'YouTube Vlog Intro', lastOpened: Date.now() - 900000, createdAt: Date.now() - 2000000 },
  ],
  recentProjects: [
    { id: 'proj_1', workspaceId: 'ws_1', name: 'AI Gen Video Promo', lastOpened: Date.now() - 100000, createdAt: Date.now() - 500000 },
    { id: 'proj_2', workspaceId: 'ws_1', name: 'TikTok Dance Trend', lastOpened: Date.now() - 300000, createdAt: Date.now() - 800000 },
  ],
  settings: {
    autoSave: true,
    layoutPreset: 'default'
  }
};
