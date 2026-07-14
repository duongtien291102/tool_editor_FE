import React, { useEffect, useMemo } from 'react';
import { useTimelineStore } from '../core/state/timelineStore';
import { TimelineFactory } from '../core/factory/TimelineFactory';
import { createTrackViewModel } from '../core/viewmodels/TrackViewModel';
import { TrackRenderer } from './TrackRenderer';
import { TIMELINE_CONSTANTS } from '../core/constants';
import { useShallow } from 'zustand/react/shallow';
import { InputManager } from '../core/input/InputManager';

export const TimelinePanel: React.FC = () => {
  const setDocument = useTimelineStore(state => state.setDocument);
  
  // Shallow select tracks array to prevent re-rendering when a single clip changes
  const tracks = useTimelineStore(useShallow(state => state.document?.tracks || []));

  useEffect(() => {
    // Initialize mock data
    const mockDoc = TimelineFactory.createMockDocument('doc-1', 3, 5);
    setDocument(mockDoc);
  }, [setDocument]);

  const trackViewModels = useMemo(() => {
    return tracks.map(t => createTrackViewModel(t));
  }, [tracks]);

  // Handle generic pointer events on the timeline body
  const handlePointerMove = (e: React.PointerEvent) => {
    InputManager.getInstance().pointerController.onPointerMove(e);
  };

  const handlePointerUp = () => {
    InputManager.getInstance().pointerController.onPointerUp();
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: TIMELINE_CONSTANTS.COLORS.BACKGROUND,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {trackViewModels.map(tvm => (
        <TrackRenderer key={tvm.id} track={tvm} />
      ))}
    </div>
  );
};
