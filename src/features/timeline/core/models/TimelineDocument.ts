import type { Track } from './Track';

export interface TimelineDocument {
  id: string;
  tracks: Track[];
}
