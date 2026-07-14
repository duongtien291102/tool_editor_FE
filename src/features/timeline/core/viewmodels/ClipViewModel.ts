import type { Clip } from '../models/Clip';

export interface ClipViewModel {
  id: string;
  name: string;
  left: number; // Derived from start time and zoom
  width: number; // Derived from duration and zoom
  color: string;
  isSelected: boolean;
  isHighlighted: boolean;
}

export const createClipViewModel = (clip: Clip, zoom: number): ClipViewModel => {
  return {
    id: clip.id,
    name: clip.metadata.name,
    left: clip.timing.start.frame * zoom,
    width: clip.timing.duration.frame * zoom,
    color: clip.ui.color,
    isSelected: clip.ui.selected,
    isHighlighted: clip.ui.highlighted
  };
};
