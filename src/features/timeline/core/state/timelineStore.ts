import { create } from 'zustand';
import type { TimelineDocument } from '../models/TimelineDocument';
import type { TimelineRuntimeState } from './TimelineRuntimeState';
import type { Clip } from '../models/Clip';
import { TIMELINE_CONSTANTS } from '../constants';
import { TimelineAutoSaveManager } from './TimelineAutoSaveManager';
import { TimelineApi } from '@/api';

let autoSaveManager: TimelineAutoSaveManager | null = null;

function getAutoSaveManager(projectId?: string): TimelineAutoSaveManager {
  if (!autoSaveManager) {
    autoSaveManager = new TimelineAutoSaveManager(projectId || '');
  } else if (projectId) {
    autoSaveManager.setProjectId(projectId);
  }
  return autoSaveManager;
}

interface TimelineState {
  document: TimelineDocument | null;
  runtime: TimelineRuntimeState;
  
  setDocument: (doc: TimelineDocument, projectId?: string) => void;
  updateClip: (trackId: string, updatedClip: Clip, projectId?: string) => void;
  initAutoSave: (projectId: string) => void;
  flushAutoSave: () => Promise<void>;
  loadFromBackend: (projectId: string) => Promise<void>;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  document: null,
  runtime: {
    viewport: {
      zoom: 1,
      scrollX: 0,
      scrollY: 0,
      visibleRange: [{ frame: 0 }, { frame: 1000 }]
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

  initAutoSave: (projectId: string) => {
    getAutoSaveManager(projectId);
  },

  flushAutoSave: async () => {
    if (autoSaveManager) {
      await autoSaveManager.flush();
    }
  },

  loadFromBackend: async (projectId: string) => {
    try {
      getAutoSaveManager(projectId);
      const res = await TimelineApi.getByProject(projectId);
      if (res?.data?.tracks && res.data.tracks.length > 0) {
        const doc: TimelineDocument = {
          id: res.data.id || 'timeline-001',
          name: res.data.name || 'Main Cut',
          settings: {
            fps: { rate: res.data.frameRate || 30 },
            timecodeMode: 'smpte',
            resolution: {
              width: res.data.resolutionWidth || 1920,
              height: res.data.resolutionHeight || 1080,
            },
          },
          tracks: res.data.tracks.map((t) => ({
            id: t.id,
            name: t.name,
            type: t.trackType === 0 ? 'video' : t.trackType === 1 ? 'audio' : 'subtitle',
            clips: (t.clips || []).map((c) => ({
              id: c.id,
              type: t.trackType === 0 ? 'video' : t.trackType === 1 ? 'audio' : 'subtitle',
              timing: {
                start: { frame: c.startFrame },
                duration: { frame: c.endFrame - c.startFrame },
              },
              metadata: {
                id: c.assetId || c.id,
                name: c.name || 'Clip',
                type: (c.metadata as any) || 'video',
              },
            })),
          })),
        };
        set({ document: doc });
      }
    } catch (error) {
      console.warn('[useTimelineStore] Could not load timeline from backend:', error);
    }
  },

  setDocument: (doc, projectId) => {
    set({ document: doc });
    if (doc) {
      const manager = getAutoSaveManager(projectId);
      manager.scheduleSave(doc);
    }
  },

  updateClip: (trackId: string, updatedClip: Clip, projectId) => {
    const state = get();
    if (!state.document) return;
    const newDoc: TimelineDocument = {
      ...state.document,
      tracks: state.document.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.map((c) => (c.id === updatedClip.id ? updatedClip : c)) }
          : t
      ),
    };
    set({ document: newDoc });
    const manager = getAutoSaveManager(projectId);
    manager.scheduleSave(newDoc);
  },
}));
