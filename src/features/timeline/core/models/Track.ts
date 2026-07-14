import type { Clip } from './Clip';

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  clips: Clip[];
}
