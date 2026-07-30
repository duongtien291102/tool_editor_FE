import { useProductionFlowStore, type ProductionScene } from '@/features/workflow';
import { useStudioStore } from '@/state/studioStore';

export interface ProjectTimelineClip {
  id: string;
  sceneId: string;
  type: 'visual' | 'voice';
  left: number;
  width: number;
  startSeconds: number;
  durationSeconds: number;
  name: string;
  content: string;
}

export const EMPTY_PRODUCTION_SCENES: ProductionScene[] = [];
export const DEFAULT_SCENE_DURATION_SECONDS = 5;
export const MIN_SCENE_DURATION_SECONDS = 1;
export const VOICE_TAIL_PADDING_SECONDS = 0.35;

export function roundSceneDuration(seconds: number): number {
  return Math.round(seconds * 10) / 10;
}

export function getMinimumSceneDuration(scene: ProductionScene): number {
  return roundSceneDuration(
    Math.max(
      MIN_SCENE_DURATION_SECONDS,
      (scene.voiceDurationSeconds ?? 0) + VOICE_TAIL_PADDING_SECONDS,
    ),
  );
}

export function getSceneDuration(scene: ProductionScene): number {
  const requestedDuration = scene.durationSeconds ?? DEFAULT_SCENE_DURATION_SECONDS;
  return roundSceneDuration(Math.max(requestedDuration, getMinimumSceneDuration(scene)));
}

export function formatTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const frames = Math.floor((seconds - whole) * 24);
  return `00:00:${String(whole).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

export function relativeTime(
  value: string,
  t?: (key: string, options?: Record<string, unknown>) => string,
): string {
  const difference = Math.max(0, Date.now() - Date.parse(value));
  const hours = Math.floor(difference / 3_600_000);
  if (hours < 1) {
    return t?.('time.lessThanHourAgo') ?? 'Less than an hour ago';
  }
  if (hours < 24) {
    return t?.('time.hoursAgo', { count: hours }) ?? `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return t?.('time.daysAgo', { count: days }) ?? `${days}d ago`;
}

export function isImageUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:image/') ||
    url.startsWith('blob:') ||
    url.startsWith('/api/') ||
    url.startsWith('/media/') ||
    /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(url)
  );
}

export function findTargetSceneIndex(
  scenes: ProductionScene[],
  selectedClipId: string | null,
  playhead: number,
): number {
  const selectedIndex = scenes.findIndex(
    (scene) => scene.id === selectedClipId || `visual-${scene.id}` === selectedClipId,
  );
  if (selectedIndex >= 0) return selectedIndex;

  const timeline = buildTimelineFromScenes(scenes);
  return scenes.findIndex(
    (_, index) =>
      playhead >= timeline.sceneTimings[index].startSeconds &&
      playhead < timeline.sceneTimings[index].endSeconds,
  );
}

export function addMediaAssetToProjectTimeline(
  projectId: string,
  assetName: string,
  assetId?: string,
  thumbnailUrl?: string,
) {
  if (!projectId) return;
  const flowStore = useProductionFlowStore.getState();
  const currentProjectFlow = flowStore.projects[projectId];
  const scenes = currentProjectFlow?.scenes ?? [];
  const selectedClipId = useStudioStore.getState().editor.selectedClipId;
  const playhead = useStudioStore.getState().editor.playhead;
  const targetIndex = findTargetSceneIndex(scenes, selectedClipId, playhead);

  const updatedScenes = [...scenes];
  let targetSceneId = '';
  let isReplace = false;

  if (targetIndex >= 0 && targetIndex < scenes.length) {
    const existing = scenes[targetIndex];
    targetSceneId = existing.id;
    isReplace = true;
    updatedScenes[targetIndex] = {
      ...existing,
      visual: thumbnailUrl || assetName,
    };
  } else {
    const sceneNumber = scenes.length + 1;
    targetSceneId = `scene-media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    updatedScenes.push({
      id: targetSceneId,
      title: `Cảnh ${sceneNumber}: ${assetName}`,
      narration: `Hình ảnh: ${assetName}`,
      visual: thumbnailUrl || assetName,
      source: 'manual',
    });
  }

  flowStore.syncScript(projectId, currentProjectFlow?.idea ?? '', updatedScenes);
  const updatedTimeline = buildTimelineFromScenes(updatedScenes);
  const assignedSceneIndex = Math.max(0, updatedScenes.findIndex((scene) => scene.id === targetSceneId));

  const clipId = `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  useStudioStore.setState((state) => ({
    importedTimelineClips: [
      ...state.importedTimelineClips,
      {
        id: clipId,
        projectId,
        assetId: assetId || targetSceneId,
        name: assetName,
        kind: 'Image' as const,
        durationSeconds: 5,
        thumbnailUrl: thumbnailUrl || '',
      },
    ],
    editor: {
      ...state.editor,
      selectedClipId: `visual-${targetSceneId}`,
      playhead: updatedTimeline.sceneTimings[assignedSceneIndex]?.startSeconds ?? state.editor.playhead,
    },
    ui: {
      ...state.ui,
      toast: isReplace
        ? `Đã gán ảnh "${assetName}" cho Cảnh ${targetIndex + 1}`
        : `Đã chèn "${assetName}" vào timeline (Cảnh ${scenes.length + 1})`,
    },
  }));
}

export function buildTimelineFromScenes(scenes: ProductionScene[]) {
  let cursorSeconds = 0;
  const sceneTimings = scenes.map((scene) => {
    const durationSeconds = getSceneDuration(scene);
    const timing = {
      sceneId: scene.id,
      startSeconds: cursorSeconds,
      durationSeconds,
      endSeconds: cursorSeconds + durationSeconds,
    };
    cursorSeconds = timing.endSeconds;
    return timing;
  });
  const totalSeconds = Math.max(DEFAULT_SCENE_DURATION_SECONDS, cursorSeconds);
  const clipsFor = (type: ProjectTimelineClip['type']): ProjectTimelineClip[] =>
    scenes.map((scene, index) => {
      const timing = sceneTimings[index];
      return {
        id: `${type}-${scene.id}`,
        sceneId: scene.id,
        type,
        left: (timing.startSeconds / totalSeconds) * 100,
        width: (timing.durationSeconds / totalSeconds) * 100,
        startSeconds: timing.startSeconds,
        durationSeconds: timing.durationSeconds,
        name: type === 'visual' ? scene.title : scene.narration,
        content: type === 'visual' ? scene.visual : scene.narration,
      };
    });
  return {
    totalSeconds,
    sceneTimings,
    rows: [
      { id: 'script-visuals', label: 'V1', name: 'sceneVisuals', clips: clipsFor('visual') },
      { id: 'script-voice', label: 'A1', name: 'sceneNarration', clips: clipsFor('voice') },
    ],
  };
}
