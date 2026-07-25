import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCurrentProject } from '@/features/workspace';
import { useMediaStore } from '../store/mediaStore';
import { MediaGridItem } from './MediaGridItem';
import { MediaSkeleton } from './MediaSkeleton';
import { MediaEmptyState } from './MediaEmptyState';
import { MediaErrorState } from './MediaErrorState';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import type { ContextMenuAction } from './MediaContextMenu';
import type { ApiSchema } from '@/api/types';

type MediaItem = ApiSchema<'MediaDto'>;

export const MediaBrowser: React.FC = () => {
  const { currentProjectId } = useCurrentProject();
  const input = useRef<HTMLInputElement>(null);
  const state = useMediaStore();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { containerRef, sentinelRef } = useInfiniteScroll({
    isLoading: state.loadingMore,
    hasMore: state.page < state.totalPages,
    onLoadMore: () => {
      if (currentProjectId) void state.loadMore(currentProjectId);
    },
  });

  useEffect(() => {
    if (currentProjectId) void state.load(currentProjectId, 1, '');
  }, [currentProjectId, state.load]);

  const focusedItem = useMemo(() => state.items[focusedIndex], [state.items, focusedIndex]);

  const handleSelectItem = useCallback(
    (id: string, isMultiSelect: boolean, isShiftSelect: boolean) => {
      if (isMultiSelect) {
        state.toggleSelection(id);
      } else if (isShiftSelect && focusedItem?.id) {
        // For shift+click, would need to implement range selection
        state.toggleSelection(id);
      } else {
        state.clearSelection();
        state.toggleSelection(id);
      }
    },
    [state, focusedItem?.id],
  );

  const handleContextMenu = useCallback(
    (item: MediaItem) => {
      // Context menu actions will be rendered inline
      setFocusedIndex(state.items.findIndex((i) => i.id === item.id));
    },
    [state.items],
  );

  const handleDragStart = useCallback(
    (item: MediaItem, event: React.DragEvent) => {
      const selectedItems = state.selectedIds.has(item.id ?? '')
        ? Array.from(state.selectedIds)
        : [item.id ?? ''];

      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          type: 'media-items',
          ids: selectedItems,
          items: state.items.filter((i) => selectedItems.includes(i.id ?? '')),
        }),
      );
    },
    [state.items, state.selectedIds],
  );

  const contextMenuActions = useMemo<ContextMenuAction[]>(
    () => [
      {
        id: 'preview',
        label: 'Preview',
        icon: '👁️',
        onClick: () => {
          // Implementation would open preview modal
        },
      },
      {
        id: 'add-to-timeline',
        label: 'Add to Timeline',
        icon: '➕',
        onClick: () => {
          // Implementation would add to timeline
        },
      },
      {
        id: 'download',
        label: 'Download',
        icon: '⬇️',
        onClick: () => {
          // Implementation would trigger download
        },
      },
      {
        id: 'properties',
        label: 'Properties',
        icon: 'ℹ️',
        onClick: () => {
          // Implementation would show properties
        },
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        destructive: true,
        onClick: (item) => {
          if (item.id && currentProjectId && window.confirm('Delete this media?')) {
            void state.remove(item.id, currentProjectId);
          }
        },
      },
    ],
    [state, currentProjectId],
  );

  if (!currentProjectId)
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
        Select a project to browse media.
      </div>
    );

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void state.upload(currentProjectId, file);
    event.target.value = '';
  };

  const handleSearch = () => {
    void state.load(currentProjectId, 1, state.search);
  };

  const handleClearSearch = () => {
    state.setSearch('');
    void state.load(currentProjectId, 1, '');
  };

  const hasSearch = state.search.trim().length > 0;

  return (
    <section className="h-full flex flex-col bg-panel text-foreground">
      <header className="p-2 border-b border-border space-y-2">
        <div className="flex gap-2">
          <input
            aria-label="Search media"
            className="min-w-0 flex-1 h-8 rounded border border-input bg-background px-2 text-xs"
            value={state.search}
            onChange={(event) => state.setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch();
            }}
            placeholder="Search assets"
          />
          <button
            type="button"
            className="h-8 px-2 rounded bg-accent text-xs hover:bg-accent/90 transition-colors"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            type="button"
            className="h-8 px-2 rounded bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={state.uploading}
            onClick={() => input.current?.click()}
          >
            Upload
          </button>
          <input ref={input} className="hidden" type="file" onChange={selectFile} />
        </div>
        {state.uploading && (
          <div className="flex items-center gap-2">
            <progress className="flex-1 h-1 rounded" max={100} value={state.uploadProgress} />
            <span className="text-xs whitespace-nowrap">{state.uploadProgress}%</span>
            <button
              type="button"
              className="text-xs text-destructive hover:underline"
              onClick={() => {
                void state.cancelUpload();
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {state.error && !state.loading && (
          <p role="alert" className="text-xs text-destructive">
            {state.error}
          </p>
        )}
        {state.selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs text-muted-foreground">{state.selectedIds.size} selected</span>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => state.selectAll()}
              >
                Select All
              </button>
              <button
                type="button"
                className="text-xs text-destructive hover:underline"
                onClick={() => {
                  if (window.confirm(`Delete ${state.selectedIds.size} items?`)) {
                    void state.removeMultiple(Array.from(state.selectedIds), currentProjectId);
                  }
                }}
              >
                Delete Selected
              </button>
              <button
                type="button"
                className="text-xs hover:underline"
                onClick={() => state.clearSelection()}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </header>

      <div ref={containerRef} className="flex-1 overflow-auto p-2">
        {state.loading && state.items.length === 0 ? (
          <MediaSkeleton count={12} />
        ) : state.error && state.items.length === 0 ? (
          <MediaErrorState
            error={state.error}
            onRetry={() => void state.load(currentProjectId, 1)}
          />
        ) : state.items.length === 0 ? (
          <MediaEmptyState hasSearch={hasSearch} onClearSearch={handleClearSearch} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-max">
              {state.items.map((item) => (
                <MediaGridItem
                  key={item.id}
                  item={item}
                  isSelected={state.selectedIds.has(item.id ?? '')}
                  onSelect={handleSelectItem}
                  onContextMenu={handleContextMenu}
                  onDragStart={handleDragStart}
                  actions={contextMenuActions}
                />
              ))}
            </div>
            {state.loadingMore && (
              <div className="mt-4 flex justify-center">
                <div className="text-xs text-muted-foreground">Loading more...</div>
              </div>
            )}
            <div ref={sentinelRef} className="h-1" />
          </>
        )}
      </div>

      <footer className="h-8 px-2 border-t border-border flex items-center justify-between text-[10px]">
        <span className="text-xs text-muted-foreground">{state.totalCount} total assets</span>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="text-xs hover:underline disabled:opacity-50"
            disabled={state.page <= 1}
            onClick={() => {
              void state.load(currentProjectId, state.page - 1);
            }}
          >
            Previous
          </button>
          <span className="text-xs">
            {state.page}/{Math.max(1, state.totalPages)}
          </span>
          <button
            type="button"
            className="text-xs hover:underline disabled:opacity-50"
            disabled={state.page >= state.totalPages}
            onClick={() => {
              void state.load(currentProjectId, state.page + 1);
            }}
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
};
