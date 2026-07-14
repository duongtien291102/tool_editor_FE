import type { Clip } from '../models/Clip';
import { TIMELINE_CONSTANTS } from '../constants';

export class ClipFactory {
  static createMockClip(id: string, startFrame: number, durationFrames: number): Clip {
    return {
      id,
      metadata: { id: `m-${id}`, name: `Clip ${id}`, type: 'video', sourceId: `src-${id}` },
      timing: {
        start: { frame: startFrame },
        duration: { frame: durationFrames },
        offset: { frame: 0 },
        trimStart: { frame: 0 },
        trimEnd: { frame: durationFrames }
      },
      ui: {
        selected: false,
        color: TIMELINE_CONSTANTS.COLORS.CLIP_DEFAULT,
        locked: false,
        highlighted: false
      }
    };
  }
}
