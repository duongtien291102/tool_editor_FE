import type { AIScriptResult, AIScriptScene } from '@/lib/ai/types';
import { aiDirectorAgent, type DirectorPlan, type StylePreset } from '@/lib/ai/director';
import { useScriptStore, ElementType, type Scene as EditorScene } from '@/features/script-editor';
import {
  useTimelineStore,
  type TimelineDocument,
  type Track,
  type Clip,
} from '@/features/timeline';
import { searchPexels, importPexelsAsset } from '@/lib/pexels';
import { useStudioStore } from '@/state/studioStore';
import { TimelineApi } from '@/api/TimelineApi';

const DEFAULT_FPS = 30;

/**
 * Service responsible for AI Video Director Synchronization.
 * Automatically converts AIScriptResult & DirectorPlan into 6 Timeline Layers:
 * 1. Video Layer (Pexels / Image Gen)
 * 2. Narration Layer (TTS Voiceover)
 * 3. Subtitle Layer (Styled Text Subtitles)
 * 4. Music Layer (Background Music with Fade)
 * 5. SFX Layer (Sound Effects Cues)
 * 6. Transition Layer (Contextual Scene Transitions)
 */
export async function syncAiScriptToTimeline(
  scriptResult: AIScriptResult,
  stylePreset: StylePreset = 'YouTube',
): Promise<void> {
  const { scenes, title, description } = scriptResult;

  // 1. Generate or retrieve cached AI Director Production Plan
  const directorPlan: DirectorPlan = aiDirectorAgent.directVideo(scriptResult, stylePreset);

  // 2. Update ScriptStore with Director Plan metadata
  const scriptStore = useScriptStore.getState();
  const currentScript = scriptStore.script;

  const editorScenes: EditorScene[] = scenes.map((scene: AIScriptScene, idx: number) => {
    const scenePlan = directorPlan.scenes[idx];
    const storyboardText = scenePlan
      ? `[${scenePlan.storyboard.cameraShot} - ${scenePlan.storyboard.cameraMovement}] (${scenePlan.storyboard.lighting})`
      : scene.visualPrompt;

    return {
      id: `scene-ai-${scene.id || idx + 1}`,
      title: scene.title || `Cảnh ${idx + 1}`,
      notes: `Director Storyboard: ${storyboardText} | Strategy: ${scenePlan?.mediaStrategy.type || 'pexels'}`,
      duration: `${scene.duration}s`,
      order: idx,
      elements: [
        {
          id: `elem-prompt-${scene.id || idx + 1}`,
          type: ElementType.Prompt,
          content: scene.visualPrompt,
          metadata: JSON.stringify(scenePlan?.storyboard || {}),
          order: 0,
        },
        {
          id: `elem-voice-${scene.id || idx + 1}`,
          type: ElementType.Voice,
          content: scene.narration,
          metadata: JSON.stringify(directorPlan.recommendedVoice),
          order: 1,
        },
        {
          id: `elem-sub-${scene.id || idx + 1}`,
          type: ElementType.Subtitle,
          content: scene.subtitle,
          metadata: JSON.stringify(directorPlan.subtitleStyle),
          order: 2,
        },
        {
          id: `elem-trans-${scene.id || idx + 1}`,
          type: ElementType.Transition,
          content: scenePlan?.transition.type || scene.transition || 'fade',
          order: 3,
        },
      ],
    };
  });

  if (currentScript) {
    scriptStore.updateScript({
      ...currentScript,
      title: title || currentScript.title,
      description: description || currentScript.description,
      scenes: editorScenes,
      updatedAt: Date.now(),
    });
  }

  // 3. Build 6 Timeline Layers (Tracks & Clips)
  const videoClips: Clip[] = [];
  const narrationClips: Clip[] = [];
  const subtitleClips: Clip[] = [];
  const musicClips: Clip[] = [];
  const sfxClips: Clip[] = [];
  const transitionClips: Clip[] = [];

  let totalDurationFrames = 0;

  scenes.forEach((scene: AIScriptScene, idx: number) => {
    const scenePlan = directorPlan.scenes[idx];
    const startFrame = Math.round((scene.start || 0) * DEFAULT_FPS);
    const durationFrames = Math.max(DEFAULT_FPS, Math.round((scene.duration || 5) * DEFAULT_FPS));

    totalDurationFrames = Math.max(totalDurationFrames, startFrame + durationFrames);

    // Layer 1: Video Layer
    videoClips.push({
      id: `clip-video-${scene.id || idx + 1}`,
      metadata: {
        id: `meta-video-${scene.id || idx + 1}`,
        name: `[${scenePlan?.storyboard.cameraShot || 'Visual'}] ${scene.title}`,
        type: 'video',
        sourceId: `media-${scenePlan?.mediaStrategy.type || 'pexels'}-${scene.id}`,
      },
      timing: {
        start: { frame: startFrame },
        duration: { frame: durationFrames },
        offset: { frame: 0 },
        trimStart: { frame: 0 },
        trimEnd: { frame: 0 },
      },
      ui: {
        selected: false,
        color: scenePlan?.mediaStrategy.type === 'image_generation' ? '#8b5cf6' : '#6366f1',
        locked: false,
        highlighted: false,
      },
    });

    // Layer 2: Narration Layer
    narrationClips.push({
      id: `clip-narration-${scene.id || idx + 1}`,
      metadata: {
        id: `meta-narration-${scene.id || idx + 1}`,
        name: `[Voice: ${directorPlan.recommendedVoice.gender}] ${scene.narration.slice(0, 20)}...`,
        type: 'audio',
        sourceId: `tts-voice-${scene.id || idx + 1}`,
      },
      timing: {
        start: { frame: startFrame },
        duration: { frame: durationFrames },
        offset: { frame: 0 },
        trimStart: { frame: 0 },
        trimEnd: { frame: 0 },
      },
      ui: {
        selected: false,
        color: '#10b981',
        locked: false,
        highlighted: false,
      },
    });

    // Layer 3: Subtitle Layer
    subtitleClips.push({
      id: `clip-subtitle-${scene.id || idx + 1}`,
      metadata: {
        id: `meta-sub-${scene.id || idx + 1}`,
        name: `[${directorPlan.subtitleStyle.animation}] ${scene.subtitle.slice(0, 20)}...`,
        type: 'text',
        sourceId: `sub-text-${scene.id || idx + 1}`,
      },
      timing: {
        start: { frame: startFrame },
        duration: { frame: durationFrames },
        offset: { frame: 0 },
        trimStart: { frame: 0 },
        trimEnd: { frame: 0 },
      },
      ui: {
        selected: false,
        color: '#f59e0b',
        locked: false,
        highlighted: false,
      },
    });

    // Layer 5: SFX Layer (Sound Effects Cues)
    if (scenePlan && scenePlan.sfx.length > 0) {
      scenePlan.sfx.forEach((cue, sfxIdx) => {
        const sfxStartFrame = Math.round(cue.timestampSeconds * DEFAULT_FPS);
        sfxClips.push({
          id: `clip-sfx-${scene.id}-${sfxIdx + 1}`,
          metadata: {
            id: `meta-sfx-${scene.id}-${sfxIdx + 1}`,
            name: `SFX: ${cue.type.toUpperCase()}`,
            type: 'audio',
            sourceId: `sfx-${cue.type}`,
          },
          timing: {
            start: { frame: sfxStartFrame },
            duration: { frame: DEFAULT_FPS * 1.5 }, // 1.5s duration
            offset: { frame: 0 },
            trimStart: { frame: 0 },
            trimEnd: { frame: 0 },
          },
          ui: {
            selected: false,
            color: '#ec4899',
            locked: false,
            highlighted: false,
          },
        });
      });
    }

    // Layer 6: Transition Layer
    if (scenePlan) {
      const transDurationFrames = Math.round(scenePlan.transition.durationSeconds * DEFAULT_FPS);
      transitionClips.push({
        id: `clip-trans-${scene.id || idx + 1}`,
        metadata: {
          id: `meta-trans-${scene.id || idx + 1}`,
          name: `Trans: ${scenePlan.transition.type.toUpperCase()}`,
          type: 'text',
          sourceId: `trans-${scenePlan.transition.type}`,
        },
        timing: {
          start: { frame: Math.max(0, startFrame + durationFrames - transDurationFrames) },
          duration: { frame: transDurationFrames },
          offset: { frame: 0 },
          trimStart: { frame: 0 },
          trimEnd: { frame: 0 },
        },
        ui: {
          selected: false,
          color: '#14b8a6',
          locked: false,
          highlighted: false,
        },
      });
    }
  });

  // Layer 4: Music Layer (Full background track)
  musicClips.push({
    id: 'clip-music-bg',
    metadata: {
      id: 'meta-music-bg',
      name: `BGM [${directorPlan.recommendedMusic.mood.toUpperCase()} - ${directorPlan.recommendedMusic.genre}]`,
      type: 'audio',
      sourceId: 'bgm-audio-track',
    },
    timing: {
      start: { frame: 0 },
      duration: { frame: totalDurationFrames || DEFAULT_FPS * 60 },
      offset: { frame: 0 },
      trimStart: { frame: 0 },
      trimEnd: { frame: 0 },
    },
    ui: {
      selected: false,
      color: '#3b82f6',
      locked: false,
      highlighted: false,
    },
  });

  const tracks: Track[] = [
    { id: 'track-video', name: '1. Video Layer', type: 'video', clips: videoClips },
    { id: 'track-narration', name: '2. Narration Layer', type: 'audio', clips: narrationClips },
    { id: 'track-subtitles', name: '3. Subtitle Layer', type: 'text', clips: subtitleClips },
    { id: 'track-music', name: '4. Music Layer', type: 'audio', clips: musicClips },
    { id: 'track-sfx', name: '5. SFX Layer', type: 'audio', clips: sfxClips },
    { id: 'track-transitions', name: '6. Transition Layer', type: 'text', clips: transitionClips },
  ];

  const timelineDocument: TimelineDocument = {
    id: `doc-director-${Date.now()}`,
    tracks,
  };

  useTimelineStore.getState().setDocument(timelineDocument);

  // 4. Parallel Pexels Media Search using Promise.allSettled for scenes with 'pexels' strategy
  const studioState = useStudioStore.getState();
  const currentProjectId = studioState.currentProjectId || 'project-atlas';
  const currentWorkspaceId = studioState.currentWorkspaceId || 'ws-studio';

  // Persist the 6 timeline layers and clips to Backend MongoDB database
  void persistTimelineDocumentToBackend(currentProjectId, timelineDocument);

  const pexelsSearchPromises = scenes.map(async (scene: AIScriptScene, idx: number) => {
    const scenePlan = directorPlan.scenes[idx];
    if (scenePlan && scenePlan.mediaStrategy.type === 'image_generation') {
      // Intentionally skip Pexels for AI Image Generation scenes
      return;
    }

    const queryTerm =
      scenePlan?.mediaStrategy.pexelsSearchQuery ||
      scene.pexelsQuery ||
      scene.visualPrompt ||
      'cinematic';
    try {
      const searchRes = await searchPexels({
        query: queryTerm,
        perPage: 2,
      });

      if (searchRes.photos && searchRes.photos.length > 0) {
        const photo = searchRes.photos[0];
        if (photo) {
          const imported = await importPexelsAsset({
            workspaceId: currentWorkspaceId,
            projectId: currentProjectId,
            mediaType: 'photo',
            pexelsId: photo.id,
          });
          useStudioStore.getState().addImportedStockAsset({
            assetId: imported.assetId,
            projectId: imported.projectId,
            mediaType: imported.mediaType,
            name: imported.name || photo.alt || `Pexels Scene ${scene.id}`,
            contentUrl: imported.contentUrl,
            thumbnailUrl: imported.thumbnailUrl,
            sizeBytes: imported.sizeBytes,
            durationSeconds: scene.duration,
            photographer: imported.photographer,
            sourceUrl: imported.pexelsUrl,
          });
        }
      }
    } catch {
      // Non-blocking error handling
    }
  });

  await Promise.allSettled(pexelsSearchPromises);

  useStudioStore
    .getState()
    .notify(
      `AI Director Plan v${directorPlan.version} (${directorPlan.stylePreset}) synced to 6 Timeline layers!`,
    );
}

export async function persistTimelineDocumentToBackend(
  projectId: string,
  timelineDoc: TimelineDocument,
): Promise<void> {
  try {
    let timelineId = '';
    try {
      const res = await TimelineApi.getByProject(projectId);
      if (res?.data?.id) {
        timelineId = res.data.id;
      }
    } catch {
      // Ignored if not found
    }

    if (!timelineId) {
      try {
        const createRes = await TimelineApi.create({
          projectId,
          name: 'Main Cut',
          frameRate: 30,
          resolutionWidth: 1920,
          resolutionHeight: 1080,
        });
        if (createRes?.data?.id) {
          timelineId = createRes.data.id;
        }
      } catch {
        // Ignored
      }
    }

    if (!timelineId) return;

    const mappedTracks = timelineDoc.tracks.map((t, tIdx) => ({
      id: t.id,
      name: t.name,
      order: tIdx,
      trackType: t.type === 'video' ? 0 : t.type === 'audio' ? 1 : 2,
      locked: false,
      muted: false,
      hidden: false,
      clips: t.clips.map((c) => ({
        id: c.id,
        assetId: c.metadata.sourceId || c.metadata.id || c.id,
        startFrame: c.timing.start.frame,
        endFrame: c.timing.start.frame + c.timing.duration.frame,
        name: c.metadata.name || 'Clip',
        layer: 0,
        speed: 1.0,
        trimStart: c.timing.trimStart?.frame || 0,
        trimEnd: c.timing.trimEnd?.frame || 0,
        volume: 1.0,
        metadata: c.metadata.type,
      })),
    }));

    await TimelineApi.autosave(timelineId, {
      data: {
        id: timelineId,
        projectId,
        name: 'Main Cut',
        version: 1,
        frameRate: 30,
        resolutionWidth: 1920,
        resolutionHeight: 1080,
        tracks: mappedTracks as any,
      },
    });
  } catch {
    // Fail silently when persistence is temporarily unavailable
  }
}
