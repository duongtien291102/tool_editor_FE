import type { TimelineDocument } from '../models/TimelineDocument';
import { TrackFactory } from './TrackFactory';

export class TimelineFactory {
  static createMockDocument(id: string, numTracks: number, clipsPerTrack: number): TimelineDocument {
    const tracks = Array.from({ length: numTracks }).map((_, i) => 
      TrackFactory.createMockTrack(`track-${i}`, clipsPerTrack)
    );

    return {
      id,
      tracks
    };
  }
}
