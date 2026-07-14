// Public API for Workspace Feature
// Other features should ONLY import from here.

export { WorkspaceHeader } from './components/WorkspaceHeader';

export { useWorkspace } from './hooks/useWorkspace';
export { useCurrentProject } from './hooks/useCurrentProject';
export { useRecentProjects } from './hooks/useRecentProjects';

export { workspaceService } from './services/workspace.service';
export { useWorkspaceStore } from './store/workspaceStore';
export type { WorkspaceState } from './store/workspaceStore';
export type { Workspace, Project, WorkspaceConfig, WorkspaceData } from './types';
