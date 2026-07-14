import type { Track } from '../models/Track';
import { ClipFactory } from './ClipFactory';

export class TrackFactory {
  static createMockTrack(id: string, numClips: number): Track {
    const clips = Array.from({ length: numClips }).map((_, i) => 
      ClipFactory.createMockClip(`${id}-clip-${i}`, i * 150, 100)
    );
    
    return {
      id,
      name: `Track ${id}`,
      type: 'video',
      clips
    };
  }
}
