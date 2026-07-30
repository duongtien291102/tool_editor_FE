import { describe, expect, it } from 'vitest';
import type { ProductionScene } from '@/features/workflow';
import {
  buildTimelineFromScenes,
  findTargetSceneIndex,
  getMinimumSceneDuration,
  getSceneDuration,
} from './editorUtils';

function scene(id: string, changes: Partial<ProductionScene> = {}): ProductionScene {
  return {
    id,
    title: id,
    narration: `Narration ${id}`,
    visual: `Visual ${id}`,
    ...changes,
  };
}

describe('editor scene timing', () => {
  it('uses five seconds when no custom timing is available', () => {
    expect(getSceneDuration(scene('one'))).toBe(5);
  });

  it('never allows a scene to end before its narration plus tail padding', () => {
    const narratedScene = scene('one', {
      durationSeconds: 2,
      voiceDurationSeconds: 7.28,
    });

    expect(getMinimumSceneDuration(narratedScene)).toBe(7.6);
    expect(getSceneDuration(narratedScene)).toBe(7.6);
  });

  it('keeps a longer duration explicitly selected by the user', () => {
    expect(
      getSceneDuration(
        scene('one', {
          durationSeconds: 12,
          voiceDurationSeconds: 7.28,
        }),
      ),
    ).toBe(12);
  });

  it('builds cumulative scene boundaries for both timeline tracks', () => {
    const timeline = buildTimelineFromScenes([
      scene('one', { durationSeconds: 4 }),
      scene('two', { durationSeconds: 8 }),
    ]);

    expect(timeline.totalSeconds).toBe(12);
    expect(timeline.sceneTimings).toEqual([
      { sceneId: 'one', startSeconds: 0, durationSeconds: 4, endSeconds: 4 },
      { sceneId: 'two', startSeconds: 4, durationSeconds: 8, endSeconds: 12 },
    ]);
    expect(timeline.rows[0].clips.map((clip) => clip.startSeconds)).toEqual([0, 4]);
    expect(timeline.rows[1].clips.map((clip) => clip.durationSeconds)).toEqual([4, 8]);
  });

  it('prefers the selected visual clip over the scene under the playhead', () => {
    const scenes = [scene('one'), scene('two')];

    expect(findTargetSceneIndex(scenes, 'visual-two', 2)).toBe(1);
  });
});
