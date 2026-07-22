import React, { useEffect, useRef } from 'react';
import { useCurrentProject } from '@/features/workspace';
import { useMediaStore } from '../store/mediaStore';
import { MediaThumbnail } from './MediaThumbnail';

function mediaDisplayName(item: {
  fileName?: string | null;
  originalFileName?: string | null;
  storagePath?: string | null;
}) {
  const storageFileName = item.storagePath?.split(/[\\/]/).pop();
  const currentName = item.fileName?.trim();

  return currentName && currentName !== storageFileName
    ? currentName
    : item.originalFileName?.trim() || currentName || 'Media';
}

export const MediaBrowser: React.FC = () => {
  const { currentProjectId } = useCurrentProject();
  const input = useRef<HTMLInputElement>(null);
  const state = useMediaStore();

  useEffect(() => {
    if (currentProjectId) void state.load(currentProjectId, 1, '');
  }, [currentProjectId, state.load]);

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
              if (event.key === 'Enter') void state.load(currentProjectId, 1);
            }}
            placeholder="Search assets"
          />
          <button
            type="button"
            className="h-8 px-2 rounded bg-accent text-xs"
            onClick={() => {
              void state.load(currentProjectId, 1);
            }}
          >
            Search
          </button>
          <button
            type="button"
            className="h-8 px-2 rounded bg-primary text-primary-foreground text-xs"
            disabled={state.uploading}
            onClick={() => input.current?.click()}
          >
            Upload
          </button>
          <input ref={input} className="hidden" type="file" onChange={selectFile} />
        </div>
        {state.uploading && (
          <div className="flex items-center gap-2">
            <progress className="flex-1" max={100} value={state.uploadProgress} />
            <span className="text-xs">{state.uploadProgress}%</span>
            <button
              type="button"
              className="text-xs text-destructive"
              onClick={() => {
                void state.cancelUpload();
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {state.error && (
          <p role="alert" className="text-xs text-destructive">
            {state.error}
          </p>
        )}
      </header>
      <div className="flex-1 overflow-auto p-2">
        {state.loading ? (
          <p className="text-xs text-muted-foreground">Loading media…</p>
        ) : state.items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No media assets.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {state.items.map((item) => {
              if (!item.id) return null;
              const displayName = mediaDisplayName(item);
              return (
                <article
                  key={item.id}
                  className="rounded border border-border overflow-hidden bg-card"
                >
                  <div className="h-20">
                    <MediaThumbnail
                      id={item.id}
                      available={Boolean(item.thumbnailPath)}
                      name={displayName}
                    />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium" title={displayName}>
                      {displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.ceil((item.fileSize ?? 0) / 1024)} KB
                    </p>
                    <div className="mt-1 flex gap-2 text-[10px]">
                      <button
                        type="button"
                        className="hover:underline"
                        onClick={() => {
                          const name = window.prompt('File name', displayName);
                          if (name?.trim()) void state.rename(item, name.trim(), currentProjectId);
                        }}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="text-destructive hover:underline"
                        onClick={() => {
                          if (window.confirm(`Delete “${displayName}”?`))
                            void state.remove(item.id!, currentProjectId);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <footer className="h-8 px-2 border-t border-border flex items-center justify-between text-[10px]">
        <span>{state.totalCount} assets</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={state.page <= 1}
            onClick={() => {
              void state.load(currentProjectId, state.page - 1);
            }}
          >
            Previous
          </button>
          <span>
            {state.page}/{Math.max(1, state.totalPages)}
          </span>
          <button
            type="button"
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
