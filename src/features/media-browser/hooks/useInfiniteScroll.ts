import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  isLoading: boolean;
  hasMore: boolean;
  threshold?: number;
  onLoadMore: () => void;
}

/**
 * Hook to handle infinite scroll with intersection observer
 */
export function useInfiniteScroll({
  isLoading,
  hasMore,
  threshold = 0.1,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && !isLoading && hasMore) {
        onLoadMore();
      }
    },
    [isLoading, hasMore, onLoadMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: containerRef.current,
      rootMargin: `${threshold * 100}%`,
      threshold: 0.1,
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [handleIntersect, threshold]);

  return { containerRef, sentinelRef };
}
