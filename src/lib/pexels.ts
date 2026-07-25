import { apiClient, getApiError, responseData } from '@/api/httpClient';
import { configService } from '@/core/config/ConfigService';

export type PexelsOrientation = 'landscape' | 'portrait' | 'square';
export type PexelsSize = 'large' | 'medium' | 'small';

export interface Photographer {
  id: number;
  name: string;
  url: string;
}

export interface PhotoSources {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: Photographer;
  averageColor: string;
  alt: string;
  sources: PhotoSources;
}

export interface VideoFile {
  id: number;
  quality: string;
  fileType: string;
  width: number | null;
  height: number | null;
  fps: number | null;
  link: string;
}

export interface VideoPicture {
  id: number;
  number: number;
  picture: string;
}

export interface Video {
  id: number;
  width: number;
  height: number;
  url: string;
  duration: number;
  image: string;
  photographer: Photographer;
  files: VideoFile[];
  pictures: VideoPicture[];
}

export interface SearchResponse {
  photos: Photo[];
  videos: Video[];
  page: number;
  perPage: number;
  hasMorePhotos: boolean;
  hasMoreVideos: boolean;
  fromCache: boolean;
}

export interface PexelsPage<T> {
  items: T[];
  page: number;
  perPage: number;
  totalResults: number;
  hasMore: boolean;
  fromCache: boolean;
}

export interface PexelsSearchOptions {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: PexelsOrientation;
  size?: PexelsSize;
  color?: string;
  locale?: string;
  popular?: boolean;
}

export interface PexelsImportedAsset {
  assetId: string;
  assetVersionId: string;
  projectId: string;
  mediaType: 'photo' | 'video';
  name: string;
  contentUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationSeconds: number | null;
  photographer: string;
  pexelsUrl: string;
}

export interface PexelsImportInput {
  workspaceId: string;
  projectId: string;
  mediaType: 'photo' | 'video';
  pexelsId: number;
}

interface CacheEntry {
  expiresAt: number;
  response: SearchResponse;
}

const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;
const searchCache = new Map<string, CacheEntry>();

function cacheKey(options: PexelsSearchOptions): string {
  return JSON.stringify({
    query: options.query.trim().toLowerCase(),
    page: options.page ?? 1,
    perPage: options.perPage ?? 24,
    orientation: options.orientation ?? '',
    size: options.size ?? '',
    color: options.color ?? '',
    locale: options.locale ?? '',
    popular: options.popular ?? false,
  });
}

function queryParams(options: PexelsSearchOptions): URLSearchParams {
  const params = new URLSearchParams({
    query: options.query.trim(),
    page: String(options.page ?? 1),
    per_page: String(options.perPage ?? 24),
  });
  if (options.orientation) params.set('orientation', options.orientation);
  if (options.size) params.set('size', options.size);
  if (options.color) params.set('color', options.color);
  if (options.locale) params.set('locale', options.locale);
  if (options.popular) params.set('popular', 'true');
  return params;
}

function resolveInternalUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${configService.getApiBaseUrl()}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function searchPexels(
  options: PexelsSearchOptions,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const key = cacheKey(options);
  const cached = searchCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.response, fromCache: true };
  }

  try {
    const response = await responseData(
      apiClient.get<SearchResponse>(`/api/pexels/search?${queryParams(options)}`, { signal }),
    );
    searchCache.set(key, { expiresAt: Date.now() + SEARCH_CACHE_TTL_MS, response });
    return response;
  } catch (error: unknown) {
    if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError');
    throw getApiError(error);
  }
}

export async function searchPexelsPhotos(
  options: PexelsSearchOptions,
  signal?: AbortSignal,
): Promise<PexelsPage<Photo>> {
  return responseData(
    apiClient.get<PexelsPage<Photo>>(`/api/pexels/photos?${queryParams(options)}`, { signal }),
  );
}

export async function searchPexelsVideos(
  options: PexelsSearchOptions,
  signal?: AbortSignal,
): Promise<PexelsPage<Video>> {
  return responseData(
    apiClient.get<PexelsPage<Video>>(`/api/pexels/videos?${queryParams(options)}`, { signal }),
  );
}

export async function importPexelsAsset(
  input: PexelsImportInput,
  signal?: AbortSignal,
): Promise<PexelsImportedAsset> {
  const imported = await responseData(
    apiClient.post<PexelsImportedAsset>('/api/pexels/import', input, { signal }),
  );
  return {
    ...imported,
    contentUrl: resolveInternalUrl(imported.contentUrl),
    thumbnailUrl: resolveInternalUrl(imported.thumbnailUrl),
  };
}

export function clearPexelsSearchCache(): void {
  searchCache.clear();
}
