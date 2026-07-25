import { describe, expect, it } from 'vitest';
import { extractPexelsKeywords } from './pexelsSuggestions';

describe('extractPexelsKeywords', () => {
  it('normalizes a prompt into stable unique search terms', () => {
    expect(extractPexelsKeywords('A woman walking on the beach at sunset, walking slowly')).toEqual(
      ['woman', 'walking', 'beach', 'sunset', 'slowly'],
    );
  });

  it('limits the number of terms used for a provider search', () => {
    expect(extractPexelsKeywords('one two three four five six seven', 3)).toEqual([
      'one',
      'two',
      'three',
    ]);
  });
});
