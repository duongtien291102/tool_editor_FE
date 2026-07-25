import React, { useCallback, useMemo, useState } from 'react';
import type { ApiSchema } from '@/api/types';
import { MediaThumbnail } from './MediaThumbnail';
import { MediaContextMenu, type ContextMenuAction } from './MediaContextMenu';

type MediaItem = ApiSchema<'MediaDto'>;

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

interface MediaGridItemProps {
  item: MediaItem;
  isSelected: boolean;
  onSelect: (id: string, isMultiSelect: boolean, isShiftSelect: boolean) => void;
  onContextMenu: (item: MediaItem) => void;
  onDragStart?: (item: MediaItem, event: React.DragEvent) => void;
  actions?: ContextMenuAction[];
}

/**
 * Memoized media grid item with selection and context menu support
 */
export const MediaGridItem = React.memo<MediaGridItemProps>(
  ({ item, isSelected, onSelect, onContextMenu, onDragStart, actions }) => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

    const displayName = useMemo(() => mediaDisplayName(item), [item]);

    const handleContextMenu = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuPos({ x: event.clientX, y: event.clientY });
        setShowContextMenu(true);
        onContextMenu(item);
      },
      [item, onContextMenu],
    );

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        const isMultiSelect = event.ctrlKey || event.metaKey;
        const isShiftSelect = event.shiftKey;
        onSelect(item.id ?? '', isMultiSelect, isShiftSelect);
      },
      [item.id, onSelect],
    );

    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        if (onDragStart) {
          event.stopPropagation();
          onDragStart(item, event);
        }
      },
      [item, onDragStart],
    );

    if (!item.id) return null;

    const fileSizeKb = Math.ceil((item.fileSize ?? 0) / 1024);

    return (
      <article
        role="gridcell"
        className={`rounded border overflow-hidden cursor-pointer transition-all ${
          isSelected
            ? 'border-primary bg-accent ring-2 ring-primary ring-offset-1'
            : 'border-border bg-card hover:border-primary/50'
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
      >
        <div className="h-20 relative group">
          <MediaThumbnail id={item.id} available={Boolean(item.thumbnailPath)} name={displayName} />
          {isSelected && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded border-2 border-primary bg-primary" />
            </div>
          )}
        </div>
        <div className="p-2">
          <p className="truncate text-xs font-medium" title={displayName}>
            {displayName}
          </p>
          <p className="text-[10px] text-muted-foreground">{fileSizeKb} KB</p>
        </div>
        {showContextMenu && (
          <div
            style={{
              position: 'absolute',
              left: `${contextMenuPos.x}px`,
              top: `${contextMenuPos.y}px`,
            }}
          >
            <MediaContextMenu
              item={item}
              actions={actions ?? []}
              onClose={() => setShowContextMenu(false)}
            />
          </div>
        )}
      </article>
    );
  },
);

MediaGridItem.displayName = 'MediaGridItem';
