import { searchPexels, type Photo, type SearchResponse, type Video } from './pexels';

const ignoredWords = new Set([
  'a',
  'an',
  'and',
  'at',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'the',
  'to',
  'with',
]);

export interface PexelsSuggestions {
  keywords: string[];
  photos: Photo[];
  videos: Video[];
  autoSelection: Photo | Video | null;
}

export function extractPexelsKeywords(prompt: string, maximum = 6): string[] {
  const words =
    prompt
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .match(/[\p{L}\p{N}]+/gu) ?? [];
  return Array.from(
    new Set(words.filter((word) => word.length > 2 && !ignoredWords.has(word))),
  ).slice(0, maximum);
}

export async function suggestPexelsMedia(
  prompt: string,
  autoMode: boolean,
  signal?: AbortSignal,
): Promise<PexelsSuggestions> {
  const keywords = extractPexelsKeywords(prompt);
  const response: SearchResponse = await searchPexels(
    {
      query: keywords.join(' ') || prompt.trim(),
      page: 1,
      perPage: 8,
      orientation: 'landscape',
    },
    signal,
  );
  return {
    keywords,
    photos: response.photos,
    videos: response.videos,
    autoSelection: autoMode ? (response.videos[0] ?? response.photos[0] ?? null) : null,
  };
}
