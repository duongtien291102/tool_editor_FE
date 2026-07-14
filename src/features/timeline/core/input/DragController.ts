import { TimelineEngine } from '../engines/TimelineEngine';
import { useTimelineStore } from '../state/timelineStore';

export interface SimplePointerEvent {
  clientX: number;
  clientY: number;
}

export class DragController {
  private engine: TimelineEngine;
  
  private isDragging = false;
  private targetClipId: string | null = null;
  private targetTrackId: string | null = null;
  private startX = 0;
  private startFrame = 0;

  constructor(engine: TimelineEngine) {
    this.engine = engine;
  }

  public handlePointerDown(e: SimplePointerEvent, type: 'clip', targetId: string, trackId: string) {
    if (type !== 'clip') return;
    
    const state = useTimelineStore.getState();
    const track = state.document?.tracks.find(t => t.id === trackId);
    const clip = track?.clips.find(c => c.id === targetId);

    if (clip) {
      this.isDragging = true;
      this.targetClipId = targetId;
      this.targetTrackId = trackId;
      this.startX = e.clientX;
      this.startFrame = clip.timing.start.frame;
      
      // Optionally update dragState in store here if UI needs it (e.g. for ghosts)
    }
  }

  public handlePointerMove(e: SimplePointerEvent) {
    if (!this.isDragging || !this.targetClipId || !this.targetTrackId) return;

    const state = useTimelineStore.getState();
    const zoom = state.runtime.viewport.zoom;
    const deltaX = e.clientX - this.startX;
    
    // Pixel to Frame conversion based on zoom
    const deltaFrames = Math.round(deltaX / zoom);
    const newFrame = Math.max(0, this.startFrame + deltaFrames);

    const track = state.document?.tracks.find(t => t.id === this.targetTrackId);
    const clip = track?.clips.find(c => c.id === this.targetClipId);

    if (clip) {
      const updatedClip = this.engine.getClipEngine().moveClip(clip, { frame: newFrame });
      // In a real app with EventBus, we'd emit an event. Here we update store directly for Feature 4.
      state.updateClip(this.targetTrackId, updatedClip);
    }
  }

  public handlePointerUp() {
    this.isDragging = false;
    this.targetClipId = null;
    this.targetTrackId = null;
  }
}
