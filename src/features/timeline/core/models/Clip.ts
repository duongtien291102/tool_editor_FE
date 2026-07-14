import type { TimelineTime } from './TimelineTime';

export interface ClipTiming {
  start: TimelineTime;
  duration: TimelineTime;
  offset: TimelineTime;
  trimStart: TimelineTime;
  trimEnd: TimelineTime;
}

export interface ClipUI {
  selected: boolean;
  color: string;
  locked: boolean;
  highlighted: boolean;
}

export interface ClipMetadata {
  id: string;
  name: string;
  type: string;
  sourceId: string;
}

export interface Clip {
  id: string;
  metadata: ClipMetadata;
  timing: ClipTiming;
  ui: ClipUI;
}
