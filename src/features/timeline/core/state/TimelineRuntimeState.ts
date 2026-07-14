import type { TimelineTime } from '../models/TimelineTime';

export interface TimelineViewport {
  zoom: number;
  scrollX: number;
  scrollY: number;
  visibleRange: [TimelineTime, TimelineTime];
}

export interface SelectionState {
  selectedClipIds: Set<string>;
  selectedTrackIds: Set<string>;
}

export interface DragState {
  isDragging: boolean;
  type: 'clip' | 'track' | 'playhead' | null;
  targetId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface TimelineRuntimeState {
  viewport: TimelineViewport;
  hoveredClipId: string | null;
  dragState: DragState | null;
  selection: SelectionState;
  playing: boolean;
  fps: number;
  currentFrame: TimelineTime;
}
