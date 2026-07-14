import React, { useMemo } from 'react';
import { useTimelineStore } from '../core/state/timelineStore';
import type { TrackViewModel } from '../core/viewmodels/TrackViewModel';
import { createClipViewModel } from '../core/viewmodels/ClipViewModel';
import { TIMELINE_CONSTANTS } from '../core/constants';
import { ClipRenderer } from './ClipRenderer';
import { useShallow } from 'zustand/react/shallow';
import { InputManager } from '../core/input/InputManager';

interface TrackRendererProps {
  track: TrackViewModel;
}

export const TrackRenderer: React.FC<TrackRendererProps> = React.memo(({ track }) => {
  // Extract only the clips we need for this track to prevent full timeline re-renders
  const clips = useTimelineStore(useShallow(state => {
    const trackData = state.document?.tracks.find(t => t.id === track.id);
    return trackData?.clips || [];
  }));

  const zoom = useTimelineStore(state => state.runtime.viewport.zoom);

  const clipViewModels = useMemo(() => {
    return clips.map(clip => createClipViewModel(clip, zoom));
  }, [clips, zoom]);

  const handlePointerDown = (e: React.PointerEvent, clipId: string) => {
    InputManager.getInstance().pointerController.onPointerDown(e, 'clip', clipId, track.id);
    e.stopPropagation();
  };

  return (
    <div style={{
      position: 'relative',
      height: TIMELINE_CONSTANTS.TRACK_HEIGHT,
      backgroundColor: TIMELINE_CONSTANTS.COLORS.TRACK_BACKGROUND,
      borderBottom: `1px solid ${TIMELINE_CONSTANTS.COLORS.GRID_LINE}`,
      width: '100%',
    }}>
      {/* Track Header / Name */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '150px',
        backgroundColor: '#2d2d2d',
        color: '#ccc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        zIndex: 10,
        borderRight: `1px solid ${TIMELINE_CONSTANTS.COLORS.GRID_LINE}`
      }}>
        {track.name}
      </div>

      {/* Clips Area */}
      <div style={{
        position: 'absolute',
        left: '150px', // Offset for track header
        right: 0,
        top: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {clipViewModels.map(cvm => (
          <ClipRenderer 
            key={cvm.id} 
            clip={cvm} 
            onPointerDown={handlePointerDown} 
          />
        ))}
      </div>
    </div>
  );
});

TrackRenderer.displayName = 'TrackRenderer';
