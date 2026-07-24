import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProjectStatus = 'Draft' | 'Active' | 'Archived';
export type JobStatus = 'Queued' | 'Running' | 'Success' | 'Failed';
export type AssetKind = 'Video' | 'Image' | 'Audio';

export interface StudioUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner';
}

export interface StudioSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
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
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavigationOpen: boolean;
  assetView: 'grid' | 'list';
  toast: string | null;
}

interface StudioState {
  user: StudioUser | null;
  session: StudioSession | null;
  workspaces: WorkspaceRecord[];
  currentWorkspaceId: string | null;
  projects: ProjectRecord[];
  currentProjectId: string | null;
  assets: AssetRecord[];
  jobs: JobRecord[];
  renders: RenderRecord[];
  providers: ProviderRecord[];
  featureFlags: Record<string, boolean>;
  editor: EditorState;
  ui: UiState;
  login: (email: string, password: string) => boolean;
  refreshSession: () => boolean;
  logout: () => void;
  createWorkspace: (name: string) => WorkspaceRecord;
  selectWorkspace: (id: string) => void;
  createProject: (input: Pick<ProjectRecord, 'name' | 'description' | 'aspectRatio' | 'frameRate'>) => ProjectRecord | null;
  updateProject: (id: string, changes: Partial<Pick<ProjectRecord, 'name' | 'description' | 'aspectRatio' | 'frameRate'>>) => void;
  archiveProject: (id: string) => void;
  selectProject: (id: string) => void;
  retryJob: (id: string) => void;
  setEditor: (changes: Partial<EditorState>) => void;
  setUi: (changes: Partial<UiState>) => void;
  setFeatureFlag: (key: string, enabled: boolean) => void;
  notify: (message: string) => void;
  clearToast: () => void;
}

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const initialWorkspaces: WorkspaceRecord[] = [
  { id: 'ws-studio', name: 'Northstar Studio', ownerId: 'user-demo', createdAt: now() },
  { id: 'ws-lab', name: 'Concept Lab', ownerId: 'user-demo', createdAt: now() },
];

const initialProjects: ProjectRecord[] = [
  {
    id: 'project-atlas',
    workspaceId: 'ws-studio',
    name: 'Atlas Brand Film',
    description: 'Launch film exploring movement, material and modern craft.',
    aspectRatio: '16:9',
    frameRate: 24,
    status: 'Active',
    updatedAt: '2026-07-25T01:18:00.000Z',
  },
  {
    id: 'project-kinetic',
    workspaceId: 'ws-studio',
    name: 'Kinetic Product Cut',
    description: 'Short product sequence prepared for social delivery.',
    aspectRatio: '9:16',
    frameRate: 30,
    status: 'Draft',
    updatedAt: '2026-07-24T13:40:00.000Z',
  },
  {
    id: 'project-archive',
    workspaceId: 'ws-lab',
    name: 'Material Study',
    description: 'A compact visual study for an internal concept review.',
    aspectRatio: '1:1',
    frameRate: 25,
    status: 'Draft',
    updatedAt: '2026-07-23T09:12:00.000Z',
  },
];

const initialAssets: AssetRecord[] = [
  { id: 'asset-1', workspaceId: 'ws-studio', projectId: 'project-atlas', folder: 'Footage', name: 'city-dawn-master.mov', kind: 'Video', size: '184 MB', duration: '00:18', color: '#31596f' },
  { id: 'asset-2', workspaceId: 'ws-studio', projectId: 'project-atlas', folder: 'Footage', name: 'product-turntable.mp4', kind: 'Video', size: '92 MB', duration: '00:12', color: '#6b5140' },
  { id: 'asset-3', workspaceId: 'ws-studio', projectId: 'project-atlas', folder: 'References', name: 'material-reference.jpg', kind: 'Image', size: '3.8 MB', color: '#665f52' },
  { id: 'asset-4', workspaceId: 'ws-studio', projectId: 'project-atlas', folder: 'Audio', name: 'pulse-score.wav', kind: 'Audio', size: '36 MB', duration: '01:24', color: '#445f55' },
  { id: 'asset-5', workspaceId: 'ws-studio', folder: 'Shared', name: 'studio-logo.png', kind: 'Image', size: '820 KB', color: '#314d5a' },
  { id: 'asset-6', workspaceId: 'ws-lab', projectId: 'project-archive', folder: 'References', name: 'surface-study-02.jpg', kind: 'Image', size: '2.1 MB', color: '#555c65' },
];

const initialJobs: JobRecord[] = [
  { id: 'job-01', workspaceId: 'ws-studio', projectId: 'project-atlas', type: 'Asset ingest', subject: 'city-dawn-master.mov', status: 'Success', progress: 100, createdAt: '2026-07-25T01:04:00.000Z' },
  { id: 'job-02', workspaceId: 'ws-studio', projectId: 'project-atlas', type: 'Proxy', subject: 'product-turntable.mp4', status: 'Running', progress: 68, createdAt: '2026-07-25T01:12:00.000Z' },
  { id: 'job-03', workspaceId: 'ws-studio', projectId: 'project-kinetic', type: 'Thumbnail', subject: 'social-cut-v2.mov', status: 'Queued', progress: 0, createdAt: '2026-07-25T01:16:00.000Z' },
  { id: 'job-04', workspaceId: 'ws-studio', projectId: 'project-atlas', type: 'Waveform', subject: 'pulse-score.wav', status: 'Failed', progress: 42, createdAt: '2026-07-24T17:28:00.000Z' },
];

const initialRenders: RenderRecord[] = [
  { id: 'render-01', workspaceId: 'ws-studio', projectId: 'project-atlas', projectName: 'Atlas Brand Film', preset: '4K Master', status: 'Running', progress: 31, createdAt: '2026-07-25T01:20:00.000Z' },
  { id: 'render-02', workspaceId: 'ws-studio', projectId: 'project-atlas', projectName: 'Atlas Brand Film', preset: 'Review 1080p', status: 'Success', progress: 100, createdAt: '2026-07-24T16:20:00.000Z' },
  { id: 'render-03', workspaceId: 'ws-studio', projectId: 'project-kinetic', projectName: 'Kinetic Product Cut', preset: 'Vertical Preview', status: 'Failed', progress: 76, createdAt: '2026-07-23T10:03:00.000Z' },
];

const providers: ProviderRecord[] = [
  { id: 'openai', name: 'OpenAI', category: 'Multimodal', status: 'Available', capabilities: ['Registry only'] },
  { id: 'gemini', name: 'Gemini', category: 'Multimodal', status: 'Available', capabilities: ['Registry only'] },
  { id: 'veo', name: 'Veo', category: 'Video', status: 'Available', capabilities: ['Registry only'] },
  { id: 'kling', name: 'Kling', category: 'Video', status: 'Disabled', capabilities: ['Registry only'] },
  { id: 'runway', name: 'Runway', category: 'Video', status: 'Available', capabilities: ['Registry only'] },
];

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      workspaces: initialWorkspaces,
      currentWorkspaceId: 'ws-studio',
      projects: initialProjects,
      currentProjectId: 'project-atlas',
      assets: initialAssets,
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
        selectedClipId: 'clip-product',
        leftPanel: 'workflow',
      },
      ui: {
        sidebarCollapsed: false,
        mobileNavigationOpen: false,
        assetView: 'grid',
        toast: null,
      },
      login: (email, password) => {
        if (!email.trim() || !password.trim()) return false;
        const user: StudioUser = {
          id: 'user-demo',
          name: email.split('@')[0] || 'Studio Owner',
          email,
          role: 'Owner',
        };
        const session: StudioSession = {
          accessToken: id('access'),
          refreshToken: id('refresh'),
          expiresAt: Date.now() + 30 * 60 * 1000,
        };
        set({ user, session });
        return true;
      },
      refreshSession: () => {
        const session = get().session;
        if (!session?.refreshToken) return false;
        set({
          session: {
            ...session,
            accessToken: id('access'),
            expiresAt: Date.now() + 30 * 60 * 1000,
          },
        });
        return true;
      },
      logout: () => set({ user: null, session: null }),
      createWorkspace: (name) => {
        const workspace: WorkspaceRecord = {
          id: id('ws'),
          name: name.trim(),
          ownerId: get().user?.id ?? 'user-demo',
          createdAt: now(),
        };
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
      createProject: (input) => {
        const workspaceId = get().currentWorkspaceId;
        if (!workspaceId) return null;
        const project: ProjectRecord = {
          id: id('project'),
          workspaceId,
          ...input,
          status: 'Draft',
          updatedAt: now(),
        };
        set((state) => ({
          projects: [project, ...state.projects],
          currentProjectId: project.id,
          ui: { ...state.ui, toast: 'Project created' },
        }));
        return project;
      },
      updateProject: (projectId, changes) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId ? { ...project, ...changes, updatedAt: now() } : project,
          ),
          ui: { ...state.ui, toast: 'Project saved' },
        })),
      archiveProject: (projectId) =>
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
            currentProjectId: state.currentProjectId === projectId ? (next?.id ?? null) : state.currentProjectId,
            ui: { ...state.ui, toast: 'Project archived' },
          };
        }),
      selectProject: (projectId) => set({ currentProjectId: projectId }),
      retryJob: (jobId) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, status: 'Queued', progress: 0, createdAt: now() } : job,
          ),
          ui: { ...state.ui, toast: 'Job queued for retry' },
        })),
      setEditor: (changes) => set((state) => ({ editor: { ...state.editor, ...changes } })),
      setUi: (changes) => set((state) => ({ ui: { ...state.ui, ...changes } })),
      setFeatureFlag: (key, enabled) =>
        set((state) => ({ featureFlags: { ...state.featureFlags, [key]: enabled } })),
      notify: (message) => set((state) => ({ ui: { ...state.ui, toast: message } })),
      clearToast: () => set((state) => ({ ui: { ...state.ui, toast: null } })),
    }),
    {
      name: 'ai-studio-foundation',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        assets: state.assets,
        jobs: state.jobs,
        renders: state.renders,
        featureFlags: state.featureFlags,
        editor: state.editor,
        ui: { ...state.ui, toast: null, mobileNavigationOpen: false },
      }),
    },
  ),
);
