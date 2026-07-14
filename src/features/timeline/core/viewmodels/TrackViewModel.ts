import type { Track } from '../models/Track';

export interface TrackViewModel {
  id: string;
  name: string;
  clipIds: string[];
}

export const createTrackViewModel = (track: Track): TrackViewModel => {
  return {
    id: track.id,
    name: track.name,
    clipIds: track.clips.map(c => c.id)
  };
};
