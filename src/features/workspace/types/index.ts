export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
}

export interface Project {
  id: string;
  workspaceId?: string;
  name: string;
  lastOpened: number;
  thumbnail?: string;
  createdAt: number;
  description?: string;
  status?: string;
}

export interface WorkspaceConfig {
  autoSave: boolean;
  layoutPreset: string;
}

export interface WorkspaceData {
  workspace: Workspace;
  projects: Project[];
  recentProjects: Project[];
  settings: WorkspaceConfig;
}
