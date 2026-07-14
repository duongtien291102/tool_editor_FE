import type { Clip } from '../models/Clip';
import type { TimelineTime } from '../models/TimelineTime';

export class ClipEngine {
  /**
   * Moves a clip to a new start time
   * @pure
   */
  public moveClip(clip: Clip, newStart: TimelineTime): Clip {
    return {
      ...clip,
      timing: {
        ...clip.timing,
        start: { ...newStart }
      }
    };
  }

  // Future logic for resizing, splitting, etc. goes here.
}
