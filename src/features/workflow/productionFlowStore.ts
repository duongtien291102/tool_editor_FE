import { create } from 'zustand';
import { apiClient, getApiError, responseData } from '@/api/httpClient';

export interface ProjectProductionFlow {
  idea: string;
  scenes: ProductionScene[];
  ideaReady: boolean;
  sceneCount: number;
  scenesComplete: boolean;
  promptPackReady: boolean;
  timelineReady: boolean;
  renderReady: boolean;
  generationSessionId?: string;
  updatedAt: string;
}

export interface ProductionScene {
  id: string;
  title: string;
  narration: string;
  visual: string;
  source?: 'ai' | 'manual';
  durationSeconds?: number;
  voiceDurationSeconds?: number;
}

interface ScriptWorkspaceEnvelope {
  success: boolean;
  data?: {
    body?: string;
    scenes?: Array<{
      id?: string;
      title?: string;
      narration?: string;
      visual?: string;
      source?: 'ai' | 'manual';
      durationSeconds?: number;
      voiceDurationSeconds?: number;
    }>;
  };
}

interface ProductionFlowState {
  projects: Record<string, ProjectProductionFlow>;
  hydrateProject: (projectId: string) => Promise<void>;
  syncScript: (projectId: string, body: string, scenes: ProductionScene[]) => void;
  updateSceneTiming: (
    projectId: string,
    sceneId: string,
    timing: Pick<ProductionScene, 'durationSeconds' | 'voiceDurationSeconds'>,
  ) => void;
  persistSceneTiming: (projectId: string, sceneId: string) => Promise<void>;
  markGenerationStarted: (projectId: string, sessionId?: string) => void;
  syncGeneration: (
    projectId: string,
    session: {
      id: string;
      state: string;
      steps: Array<{ stepName: string }>;
      finalVideoUrl?: string;
    },
  ) => void;
}

const emptyFlow = (): ProjectProductionFlow => ({
  idea: '',
  scenes: [],
  ideaReady: false,
  sceneCount: 0,
  scenesComplete: false,
  promptPackReady: false,
  timelineReady: false,
  renderReady: false,
  updatedAt: new Date().toISOString(),
});

export const useProductionFlowStore = create<ProductionFlowState>()((set, get) => ({
  projects: {},

  hydrateProject: async (projectId) => {
    try {
      const envelope = await responseData(
        apiClient.get<ScriptWorkspaceEnvelope>(
          `/api/v1/generation/script-workspaces/${encodeURIComponent(projectId)}`,
        ),
      );
      const body = envelope.data?.body ?? '';
      const scenes = envelope.data?.scenes ?? [];
      get().syncScript(
        projectId,
        body,
        scenes.map((scene) => ({
          id: scene.id ?? crypto.randomUUID(),
          title: scene.title ?? '',
          narration: scene.narration ?? '',
          visual: scene.visual ?? '',
          source: scene.source ?? 'ai',
          durationSeconds: scene.durationSeconds,
          voiceDurationSeconds: scene.voiceDurationSeconds,
        })),
      );
    } catch (error) {
      if (getApiError(error).status !== 404) throw error;
    }
  },

  syncScript: (projectId, body, scenes) =>
    set((state) => {
      const previous = state.projects[projectId] ?? emptyFlow();
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...previous,
            idea: body,
            scenes,
            ideaReady: body.trim().length > 0,
            sceneCount: scenes.length,
            scenesComplete:
              scenes.length > 0 &&
              scenes.every(
                (scene) => scene.title.trim() && scene.narration.trim() && scene.visual.trim(),
              ),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),

  updateSceneTiming: (projectId, sceneId, timing) =>
    set((state) => {
      const previous = state.projects[projectId] ?? emptyFlow();
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...previous,
            scenes: previous.scenes.map((scene) =>
              scene.id === sceneId ? { ...scene, ...timing } : scene,
            ),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),

  persistSceneTiming: async (projectId, sceneId) => {
    const scene = get().projects[projectId]?.scenes.find((item) => item.id === sceneId);
    if (!scene) return;

    await responseData(
      apiClient.patch(
        `/api/v1/generation/script-workspaces/${encodeURIComponent(projectId)}/scenes/${encodeURIComponent(sceneId)}/timing`,
        {
          durationSeconds: scene.durationSeconds ?? 5,
          voiceDurationSeconds: scene.voiceDurationSeconds ?? null,
        },
      ),
    );
  },

  markGenerationStarted: (projectId, sessionId) =>
    set((state) => {
      const previous = state.projects[projectId] ?? emptyFlow();
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...previous,
            promptPackReady: previous.scenesComplete,
            generationSessionId: sessionId ?? previous.generationSessionId,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),

  syncGeneration: (projectId, session) =>
    set((state) => {
      const previous = state.projects[projectId] ?? emptyFlow();
      const stepNames = new Set(session.steps.map((step) => step.stepName));
      const promptPackReady = previous.promptPackReady || stepNames.has('Prompt Pack Generation');
      const timelineReady = stepNames.has('Timeline Draft Assembly');
      const renderReady = session.state === 'Completed' && Boolean(session.finalVideoUrl);
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...previous,
            promptPackReady,
            timelineReady,
            renderReady,
            generationSessionId: session.id,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),
}));
