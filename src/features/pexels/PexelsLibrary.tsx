import {
  Download,
  Eye,
  Image as ImageIcon,
  Info,
  Plus,
  RotateCcw,
  Search,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Foundation';
import { cn } from '@/core/utils/cn';
import {
  importPexelsAsset,
  searchPexels,
  type Photo,
  type PexelsOrientation,
  type PexelsSize,
  type Video,
} from '@/lib/pexels';
import { useStudioStore } from '@/state/studioStore';

type MediaKind = 'all' | 'photos' | 'videos';
type DurationFilter = 'all' | 'short' | 'medium' | 'long';
type PexelsItem = { kind: 'photo'; data: Photo } | { kind: 'video'; data: Video };

const colors = [
  ['', 'Any color'],
  ['red', 'Red'],
  ['orange', 'Orange'],
  ['yellow', 'Yellow'],
  ['green', 'Green'],
  ['blue', 'Blue'],
  ['violet', 'Violet'],
  ['black', 'Black'],
  ['white', 'White'],
] as const;

function itemKey(item: PexelsItem): string {
  return `${item.kind}-${item.data.id}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function durationMatches(duration: number, filter: DurationFilter): boolean {
  if (filter === 'short') return duration < 15;
  if (filter === 'medium') return duration >= 15 && duration <= 30;
  if (filter === 'long') return duration > 30;
  return true;
}

function bestVideoFile(video: Video) {
  return (
    [...video.files]
      .filter((file) => Boolean(file.link))
      .sort((left, right) => {
        const leftPixels = (left.width ?? 0) * (left.height ?? 0);
        const rightPixels = (right.width ?? 0) * (right.height ?? 0);
        return rightPixels - leftPixels;
      })[0] ?? null
  );
}

export function PexelsLibrary() {
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const projectId = useStudioStore((state) => state.currentProjectId);
  const addImportedStockAsset = useStudioStore((state) => state.addImportedStockAsset);
  const notify = useStudioStore((state) => state.notify);
  const [searchText, setSearchText] = useState('creative studio');
  const [committedSearch, setCommittedSearch] = useState('creative studio');
  const [kind, setKind] = useState<MediaKind>('all');
  const [orientation, setOrientation] = useState<PexelsOrientation | ''>('');
  const [size, setSize] = useState<PexelsSize | ''>('');
  const [color, setColor] = useState('');
  const [duration, setDuration] = useState<DurationFilter>('all');
  const [popular, setPopular] = useState(false);
  const [items, setItems] = useState<PexelsItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState<PexelsItem | null>(null);
  const [importing, setImporting] = useState<Set<string>>(() => new Set());
  const requestController = useRef<AbortController | null>(null);
  const loadMoreTrigger = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCommittedSearch(searchText.trim() || 'creative');
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      setError(false);
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const result = await searchPexels(
          {
            query: committedSearch,
            page: nextPage,
            perPage: 24,
            orientation: orientation || undefined,
            size: size || undefined,
            color: kind === 'videos' ? undefined : color || undefined,
            locale: 'vi-VN',
            popular,
          },
          controller.signal,
        );
        const nextItems: PexelsItem[] = [
          ...(kind === 'videos'
            ? []
            : result.photos.map((data): PexelsItem => ({ kind: 'photo', data }))),
          ...(kind === 'photos'
            ? []
            : result.videos
                .filter((video) => durationMatches(video.duration, duration))
                .map((data): PexelsItem => ({ kind: 'video', data }))),
        ];
        setItems((current) =>
          append
            ? [
                ...current,
                ...nextItems.filter(
                  (candidate) =>
                    !current.some((existing) => itemKey(existing) === itemKey(candidate)),
                ),
              ]
            : nextItems,
        );
        setPage(nextPage);
        setHasMore(
          (kind !== 'videos' && result.hasMorePhotos) ||
            (kind !== 'photos' && result.hasMoreVideos),
        );
      } catch (loadError: unknown) {
        if (!isAbortError(loadError)) setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [color, committedSearch, duration, kind, orientation, popular, size],
  );

  useEffect(() => {
    void load(1, false);
    return () => requestController.current?.abort();
  }, [load]);

  useEffect(() => {
    const trigger = loadMoreTrigger.current;
    if (!trigger) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore && !error) {
          void load(page + 1, true);
        }
      },
      { rootMargin: '500px 0px' },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [error, hasMore, load, loading, loadingMore, page]);

  const addToTimeline = useCallback(
    async (item: PexelsItem) => {
      if (!workspaceId || !projectId) {
        notify('Open a project before importing Pexels media');
        return;
      }
      const key = itemKey(item);
      setImporting((current) => new Set(current).add(key));
      try {
        const imported = await importPexelsAsset({
          workspaceId,
          projectId,
          mediaType: item.kind,
          pexelsId: item.data.id,
        });
        addImportedStockAsset({
          assetId: imported.assetId,
          projectId: imported.projectId,
          mediaType: imported.mediaType,
          name: imported.name,
          contentUrl: imported.contentUrl,
          thumbnailUrl: imported.thumbnailUrl,
          sizeBytes: imported.sizeBytes,
          durationSeconds: imported.durationSeconds,
          photographer: imported.photographer,
          sourceUrl: imported.pexelsUrl,
        });
      } catch {
        notify('Unable to import this Pexels asset. Please try again.');
      } finally {
        setImporting((current) => {
          const next = new Set(current);
          next.delete(key);
          return next;
        });
      }
    },
    [addImportedStockAsset, notify, projectId, workspaceId],
  );

  const skeletons = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className={cn(
            'mb-3 animate-pulse break-inside-avoid rounded-xl border border-border bg-card',
            index % 3 === 0 ? 'h-72' : index % 2 === 0 ? 'h-52' : 'h-64',
          )}
        >
          <div className="h-[78%] rounded-t-xl bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-2.5 w-2/3 rounded bg-muted" />
            <div className="h-2 w-1/3 rounded bg-muted" />
          </div>
        </div>
      )),
    [],
  );

  return (
    <section aria-label="Pexels media library">
      <div className="mb-4 rounded-xl border border-border bg-card p-3">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              aria-label="Search Pexels"
              className="pl-9"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search Pexels photos and videos"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="studio-select min-w-28"
              aria-label="Media type"
              value={kind}
              onChange={(event) => setKind(event.target.value as MediaKind)}
            >
              <option value="all">Photos + videos</option>
              <option value="photos">Photos</option>
              <option value="videos">Videos</option>
            </select>
            <select
              className="studio-select"
              aria-label="Orientation"
              value={orientation}
              onChange={(event) => setOrientation(event.target.value as PexelsOrientation | '')}
            >
              <option value="">Any orientation</option>
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              {kind !== 'videos' && <option value="square">Square</option>}
            </select>
            <select
              className="studio-select"
              aria-label="Minimum size"
              value={size}
              onChange={(event) => setSize(event.target.value as PexelsSize | '')}
            >
              <option value="">Any size</option>
              <option value="large">Large</option>
              <option value="medium">Medium</option>
              <option value="small">Small</option>
            </select>
            {kind !== 'videos' && (
              <select
                className="studio-select"
                aria-label="Color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              >
                {colors.map(([value, label]) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
            {kind !== 'photos' && (
              <select
                className="studio-select"
                aria-label="Video duration"
                value={duration}
                onChange={(event) => setDuration(event.target.value as DurationFilter)}
              >
                <option value="all">Any duration</option>
                <option value="short">Under 15 sec</option>
                <option value="medium">15–30 sec</option>
                <option value="long">Over 30 sec</option>
              </select>
            )}
            <button
              type="button"
              aria-pressed={popular}
              className={cn(
                'rounded-lg border px-3 text-xs font-medium transition-colors',
                popular
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
              onClick={() => setPopular((current) => !current)}
            >
              Popular
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>{loading ? 'Searching Pexels…' : `${items.length} assets loaded`}</span>
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground hover:text-primary"
          >
            Powered by Pexels
          </a>
        </div>
      </div>

      {error ? (
        <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div>
            <div className="mx-auto grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive">
              <Info className="size-5" />
            </div>
            <p className="mt-4 text-sm font-semibold">Unable to load Pexels assets.</p>
            <p className="mt-1 text-xs text-muted-foreground">Please try again.</p>
            <Button className="mt-4" variant="outline" onClick={() => void load(1, false)}>
              <RotateCcw className="mr-2 size-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="columns-1 gap-3 sm:columns-2 xl:columns-3 2xl:columns-4">{skeletons}</div>
      ) : items.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div>
            <Search className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No Pexels assets found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a broader search or clear a filter.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="columns-1 gap-3 sm:columns-2 xl:columns-3 2xl:columns-4">
            {items.map((item) => (
              <PexelsCard
                key={itemKey(item)}
                item={item}
                importing={importing.has(itemKey(item))}
                onPreview={setPreview}
                onAdd={(selectedItem) => {
                  void addToTimeline(selectedItem);
                }}
              />
            ))}
          </div>
          <div ref={loadMoreTrigger} className="h-8" aria-hidden="true" />
          {loadingMore && (
            <div className="grid grid-cols-2 gap-3 py-3 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}
        </>
      )}
      {preview && (
        <PexelsPreview
          item={preview}
          importing={importing.has(itemKey(preview))}
          onClose={() => setPreview(null)}
          onAdd={(selectedItem) => {
            void addToTimeline(selectedItem);
          }}
        />
      )}
    </section>
  );
}

const PexelsCard = memo(function PexelsCard({
  item,
  importing,
  onPreview,
  onAdd,
}: {
  item: PexelsItem;
  importing: boolean;
  onPreview: (item: PexelsItem) => void;
  onAdd: (item: PexelsItem) => void;
}) {
  const data = item.data;
  const thumbnail = item.kind === 'photo' ? item.data.sources.medium : item.data.image;
  return (
    <article className="group mb-3 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card [content-visibility:auto] [contain-intrinsic-size:260px]">
      <div className="relative overflow-hidden bg-muted">
        <button
          type="button"
          className="block w-full text-left"
          onClick={() => onPreview(item)}
          aria-label={`Preview ${item.kind} by ${data.photographer.name}`}
        >
          <img
            src={thumbnail}
            alt={item.kind === 'photo' ? item.data.alt : `Video by ${data.photographer.name}`}
            loading="lazy"
            decoding="async"
            className="h-auto max-h-80 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>
        <div className="absolute inset-0 flex items-start justify-end gap-1 bg-gradient-to-b from-black/60 via-transparent to-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <a
            href={
              item.kind === 'photo' ? item.data.sources.original : bestVideoFile(item.data)?.link
            }
            target="_blank"
            rel="noreferrer"
            className="grid size-8 place-items-center rounded-md bg-black/70 text-white hover:bg-black"
            onClick={(event) => event.stopPropagation()}
            aria-label="Open download source"
          >
            <Download className="size-3.5" />
          </a>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-md bg-black/70 text-white hover:bg-black"
            onClick={() => onAdd(item)}
            aria-label="Add to timeline"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-md bg-black/70 text-white hover:bg-black"
            onClick={() => onPreview(item)}
            aria-label="Show asset information"
          >
            <Info className="size-3.5" />
          </button>
        </div>
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-1 text-[10px] text-white">
          {item.kind === 'photo' ? (
            <ImageIcon className="size-3" />
          ) : (
            <VideoIcon className="size-3" />
          )}
          {data.width} × {data.height}
          {item.kind === 'video' && ` · ${item.data.duration}s`}
        </span>
      </div>
      <div className="p-3">
        <a
          className="block truncate text-xs font-medium hover:text-primary"
          href={data.url}
          target="_blank"
          rel="noreferrer"
        >
          {data.photographer.name}
        </a>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={() => onPreview(item)}>
            <Eye className="mr-1.5 size-3.5" />
            Preview
          </Button>
          <Button size="sm" disabled={importing} onClick={() => onAdd(item)}>
            <Plus className="mr-1.5 size-3.5" />
            {importing ? 'Importing…' : 'Add'}
          </Button>
        </div>
      </div>
    </article>
  );
});

function PexelsPreview({
  item,
  importing,
  onClose,
  onAdd,
}: {
  item: PexelsItem;
  importing: boolean;
  onClose: () => void;
  onAdd: (item: PexelsItem) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const videoFile = item.kind === 'video' ? bestVideoFile(item.data) : null;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pexels asset preview"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111517] text-zinc-100 shadow-2xl">
        <header className="flex h-12 shrink-0 items-center border-b border-white/10 px-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.data.photographer.name}</p>
            <p className="text-[10px] text-zinc-500">Powered by Pexels</p>
          </div>
          <button className="editor-icon ml-auto" onClick={onClose} aria-label="Close preview">
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-black">
          {item.kind === 'photo' ? (
            <button
              type="button"
              className="grid min-h-[54dvh] w-full place-items-center overflow-auto"
              onClick={() => setZoomed((current) => !current)}
              aria-label={zoomed ? 'Zoom out image' : 'Zoom in image'}
            >
              <img
                src={zoomed ? item.data.sources.original : item.data.sources.large2x}
                alt={item.data.alt}
                className={cn(
                  'max-h-[68dvh] object-contain transition-[max-width]',
                  zoomed ? 'max-w-none cursor-zoom-out' : 'max-w-full cursor-zoom-in',
                )}
              />
            </button>
          ) : (
            <video
              className="max-h-[68dvh] min-h-[54dvh] w-full bg-black object-contain"
              controls
              preload="metadata"
              poster={item.data.image}
              src={videoFile?.link}
            />
          )}
        </div>
        <footer className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center">
          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-400 sm:grid-cols-4">
            <span>
              Resolution{' '}
              <b className="ml-1 font-medium text-zinc-200">
                {item.data.width} × {item.data.height}
              </b>
            </span>
            {item.kind === 'video' && (
              <>
                <span>
                  Duration <b className="ml-1 font-medium text-zinc-200">{item.data.duration}s</b>
                </span>
                <span>
                  FPS <b className="ml-1 font-medium text-zinc-200">{videoFile?.fps ?? '—'}</b>
                </span>
              </>
            )}
            <a
              href="https://www.pexels.com/license/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Pexels License
            </a>
          </div>
          <Button disabled={importing} onClick={() => onAdd(item)}>
            <Plus className="mr-2 size-4" />
            {importing ? 'Importing…' : 'Add to Timeline'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
