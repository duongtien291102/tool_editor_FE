import { create } from 'zustand';
import type { TimelineDocument } from '../models/TimelineDocument';
import type { TimelineRuntimeState } from './TimelineRuntimeState';
import type { Clip } from '../models/Clip';
import { TIMELINE_CONSTANTS } from '../constants';

interface TimelineState {
  document: TimelineDocument | null;
  runtime: TimelineRuntimeState;
  
  // Actions - These will usually dispatch to TimelineEngine which updates the state
  setDocument: (doc: TimelineDocument) => void;
  updateClip: (trackId: string, updatedClip: Clip) => void;
  // Further actions injected via Engine/Controllers
}

export const useTimelineStore = create<TimelineState>((set) => ({
  document: null,
  runtime: {
    viewport: {
      zoom: 1,
      scrollX: 0,
      scrollY: 0,
      visibleRange: [{ frame: 0 }, { frame: 1000 }] // mock range
    },
    hoveredClipId: null,
    dragState: null,
    selection: {
      selectedClipIds: new Set(),
      selectedTrackIds: new Set(),
    },
    playing: false,
    fps: TIMELINE_CONSTANTS.DEFAULT_FPS,
    currentFrame: { frame: 0 }
  },

  setDocument: (doc) => set({ document: doc }),

  updateClip: (trackId: string, updatedClip: Clip) => set((state) => {
    if (!state.document) return state;
    return {
      document: {
        ...state.document,
        tracks: state.document.tracks.map(t => 
          t.id === trackId 
            ? { ...t, clips: t.clips.map(c => c.id === updatedClip.id ? updatedClip : c) }
            : t
        )
      }
    };
  })
}));
