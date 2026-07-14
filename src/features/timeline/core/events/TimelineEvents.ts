import type { TimelineTime } from '../models/TimelineTime';

export type TimelineEvent =
  | { type: 'ClipMoved'; payload: { clipId: string; trackId: string; newStart: TimelineTime } }
  | { type: 'TrackAdded'; payload: { trackId: string } }
  | { type: 'ClipSelected'; payload: { clipId: string } }
  | { type: 'TimelineZoomChanged'; payload: { zoom: number } };

export interface ITimelineEventBus {
  emit(event: TimelineEvent): void;
  subscribe(callback: (event: TimelineEvent) => void): () => void;
}
