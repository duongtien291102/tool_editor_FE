import { create } from 'zustand';
import { apiClient, responseData } from '@/api/httpClient';

export type ProjectStatus = 'Draft' | 'Active' | 'Archived';
export type JobStatus = 'Queued' | 'Running' | 'Success' | 'Failed';
export type AssetKind = 'Video' | 'Image' | 'Audio';

export interface StudioUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner';
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  frameRate: 24 | 25 | 30;
  status: ProjectStatus;
  updatedAt: string;
}

export interface AssetRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  folder: string;
  name: string;
  kind: AssetKind;
  size: string;
  duration?: string;
  color: string;
  contentUrl?: string;
  thumbnailUrl?: string;
  source?: 'Pexels';
  attribution?: {
    photographer: string;
    sourceUrl: string;
  };
}

export interface ImportedTimelineClip {
  id: string;
  projectId: string;
  assetId: string;
  name: string;
  kind: Extract<AssetKind, 'Image' | 'Video'>;
  durationSeconds: number;
  thumbnailUrl: string;
}

export interface ImportedStockAsset {
  assetId: string;
  projectId: string;
  mediaType: 'photo' | 'video';
  name: string;
  contentUrl: string;
  thumbnailUrl: string;
  sizeBytes: number;
  durationSeconds: number | null;
  photographer: string;
  sourceUrl: string;
}

export interface JobRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  type: string;
  subject: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
}

export interface RenderRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  preset: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
}

export interface ProviderRecord {
  id: 'openai' | 'gemini' | 'veo' | 'kling' | 'runway';
  name: string;
  category: string;
  status: 'Available' | 'Disabled';
  capabilities: string[];
}

interface EditorState {
  activeTool: 'select' | 'trim' | 'split';
  playhead: number;
  zoom: number;
  selectedClipId: string | null;
  leftPanel: 'workflow' | 'assets' | 'jobs';
  isPlaying: boolean;
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavigationOpen: boolean;
  assetView: 'grid' | 'list';
  toast: string | null;
}

interface StudioState {
  user: StudioUser | null;
  workspaces: WorkspaceRecord[];
  currentWorkspaceId: string | null;
  projects: ProjectRecord[];
  currentProjectId: string | null;
  assets: AssetRecord[];
  importedTimelineClips: ImportedTimelineClip[];
  jobs: JobRecord[];
  renders: RenderRecord[];
  providers: ProviderRecord[];
  featureFlags: Record<string, boolean>;
  editor: EditorState;
  ui: UiState;
  replaceServerCatalog: (catalog: {
    workspaces: WorkspaceRecord[];
    projects: ProjectRecord[];
    providers: ProviderRecord[];
  }) => void;
  createWorkspace: (name: string) => Promise<WorkspaceRecord>;
  selectWorkspace: (id: string) => void;
  createProject: (
    input: Pick<ProjectRecord, 'name' | 'description' | 'aspectRatio' | 'frameRate'>,
  ) => Promise<ProjectRecord | null>;
  updateProject: (
    id: string,
    changes: Partial<Pick<ProjectRecord, 'name' | 'description' | 'aspectRatio' | 'frameRate'>>,
  ) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;
  retryJob: (id: string) => void;
  addImportedStockAsset: (asset: ImportedStockAsset) => void;
  setEditor: (changes: Partial<EditorState>) => void;
  setUi: (changes: Partial<UiState>) => void;
  setFeatureFlag: (key: string, enabled: boolean) => void;
  notify: (message: string) => void;
  clearToast: () => void;
}

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const formatDuration = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;

const initialWorkspaces: WorkspaceRecord[] = [];
const initialProjects: ProjectRecord[] = [];
const initialAssets: AssetRecord[] = [];
const initialJobs: JobRecord[] = [];
const initialRenders: RenderRecord[] = [];
const providers: ProviderRecord[] = [];

export const useStudioStore = create<StudioState>()((set, get) => ({
  user: null,
  workspaces: initialWorkspaces,
  currentWorkspaceId: '',
  projects: initialProjects,
  currentProjectId: '',
  assets: initialAssets,
  importedTimelineClips: [],
  jobs: initialJobs,
  renders: initialRenders,
  providers,
  featureFlags: {
    compactTimeline: true,
    assetListView: true,
    providerRegistry: true,
  },
  editor: {
    activeTool: 'select',
    playhead: 12.4,
    zoom: 1,
    selectedClipId: '',
    leftPanel: 'workflow',
    isPlaying: false,
  },
  ui: {
    sidebarCollapsed: false,
    mobileNavigationOpen: false,
    assetView: 'grid',
    toast: null,
  },
  replaceServerCatalog: ({ workspaces, projects, providers }) =>
    set((state) => {
      const currentWorkspaceId = workspaces.some(
        (workspace) => workspace.id === state.currentWorkspaceId,
      )
        ? state.currentWorkspaceId
        : (workspaces[0]?.id ?? null);
      const visibleProjects = projects.filter(
        (project) => project.workspaceId === currentWorkspaceId,
      );
      const currentProjectId = visibleProjects.some(
        (project) => project.id === state.currentProjectId,
      )
        ? state.currentProjectId
        : (visibleProjects[0]?.id ?? null);
      return { workspaces, projects, providers, currentWorkspaceId, currentProjectId };
    }),
  createWorkspace: async (name) => {
    const envelope = await responseData(
      apiClient.post<{ data: WorkspaceRecord }>('/api/v1/workspaces', {
        name: name.trim(),
      }),
    );
    const workspace = envelope.data;
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
      currentWorkspaceId: workspace.id,
      currentProjectId: null,
      ui: { ...state.ui, toast: 'Workspace created' },
    }));
    return workspace;
  },
  selectWorkspace: (workspaceId) => {
    const firstProject = get().projects.find(
      (project) => project.workspaceId === workspaceId && project.status !== 'Archived',
    );
    set((state) => ({
      currentWorkspaceId: workspaceId,
      currentProjectId: firstProject?.id ?? null,
      ui: { ...state.ui, mobileNavigationOpen: false },
    }));
  },
  createProject: async (input) => {
    const workspaceId =
      get().currentWorkspaceId || (await get().createWorkspace('My Workspace')).id;
    const envelope = await responseData(
      apiClient.post<{
        data: {
          id: string;
          name: string;
          description?: string;
          status: ProjectStatus;
          createdAt: string;
          updatedAt?: string;
        };
      }>('/api/v1/projects', {
        name: input.name,
        description: input.description,
      }),
    );
    const serverProject = envelope.data;
    const project: ProjectRecord = {
      id: serverProject.id,
      workspaceId,
      ...input,
      status: serverProject.status,
      updatedAt: serverProject.updatedAt ?? serverProject.createdAt,
    };
    set((state) => ({
      projects: [project, ...state.projects],
      currentProjectId: project.id,
      ui: { ...state.ui, toast: 'Project created' },
    }));
    return project;
  },
  updateProject: async (projectId, changes) => {
    await responseData(
      apiClient.put(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
        name: changes.name,
        description: changes.description,
        thumbnail: null,
      }),
    );
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId ? { ...project, ...changes, updatedAt: now() } : project,
      ),
      ui: { ...state.ui, toast: 'Project saved' },
    }));
  },
  archiveProject: async (projectId) => {
    await responseData(apiClient.delete(`/api/v1/projects/${encodeURIComponent(projectId)}`));
    set((state) => {
      const projects = state.projects.map((project) =>
        project.id === projectId
          ? { ...project, status: 'Archived' as const, updatedAt: now() }
          : project,
      );
      const next = projects.find(
        (project) =>
          project.workspaceId === state.currentWorkspaceId && project.status !== 'Archived',
      );
      return {
        projects,
        currentProjectId:
          state.currentProjectId === projectId ? (next?.id ?? null) : state.currentProjectId,
        ui: { ...state.ui, toast: 'Project archived' },
      };
    });
  },
  selectProject: (projectId) => set({ currentProjectId: projectId }),
  retryJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, status: 'Queued', progress: 0, createdAt: now() } : job,
      ),
      ui: { ...state.ui, toast: 'Job queued for retry' },
    })),
  addImportedStockAsset: (imported) =>
    set((state) => {
      const kind = imported.mediaType === 'photo' ? ('Image' as const) : ('Video' as const);
      const asset: AssetRecord = {
        id: imported.assetId,
        workspaceId: state.currentWorkspaceId ?? 'ws-studio',
        projectId: imported.projectId,
        folder: 'Pexels',
        name: imported.name,
        kind,
        size: formatBytes(imported.sizeBytes),
        duration: imported.durationSeconds ? formatDuration(imported.durationSeconds) : undefined,
        color: '#24353b',
        contentUrl: imported.contentUrl,
        thumbnailUrl: imported.thumbnailUrl,
        source: 'Pexels',
        attribution: {
          photographer: imported.photographer,
          sourceUrl: imported.sourceUrl,
        },
      };
      const clip: ImportedTimelineClip = {
        id: id('clip-pexels'),
        projectId: imported.projectId,
        assetId: imported.assetId,
        name: imported.name,
        kind,
        durationSeconds: imported.durationSeconds ?? 5,
        thumbnailUrl: imported.thumbnailUrl,
      };
      return {
        assets: [asset, ...state.assets.filter((item) => item.id !== asset.id)],
        importedTimelineClips: [...state.importedTimelineClips, clip],
        editor: { ...state.editor, selectedClipId: clip.id },
        ui: { ...state.ui, toast: 'Pexels asset imported and added to timeline' },
      };
    }),
  setEditor: (changes) => set((state) => ({ editor: { ...state.editor, ...changes } })),
  setUi: (changes) => set((state) => ({ ui: { ...state.ui, ...changes } })),
  setFeatureFlag: (key, enabled) =>
    set((state) => ({ featureFlags: { ...state.featureFlags, [key]: enabled } })),
  notify: (message) => set((state) => ({ ui: { ...state.ui, toast: message } })),
  clearToast: () => set((state) => ({ ui: { ...state.ui, toast: null } })),
}));
