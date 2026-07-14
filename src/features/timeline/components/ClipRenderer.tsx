import React from 'react';
import type { ClipViewModel } from '../core/viewmodels/ClipViewModel';
import { TIMELINE_CONSTANTS } from '../core/constants';

interface ClipRendererProps {
  clip: ClipViewModel;
  onPointerDown: (e: React.PointerEvent, clipId: string) => void;
}

export const ClipRenderer: React.FC<ClipRendererProps> = React.memo(({ clip, onPointerDown }) => {
  return (
    <div
      onPointerDown={(e) => onPointerDown(e, clip.id)}
      style={{
        position: 'absolute',
        left: clip.left,
        width: clip.width,
        height: TIMELINE_CONSTANTS.CLIP_HEIGHT,
        backgroundColor: clip.isSelected ? TIMELINE_CONSTANTS.COLORS.CLIP_SELECTED : clip.color,
        border: clip.isHighlighted ? '2px solid white' : 'none',
        borderRadius: '4px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: 'white',
        fontSize: '12px',
        userSelect: 'none'
      }}
    >
      {clip.name}
    </div>
  );
});

ClipRenderer.displayName = 'ClipRenderer';
