import React, { useRef } from 'react';
import type { ApiSchema } from '@/api/types';

type MediaItem = ApiSchema<'MediaDto'>;

export interface ContextMenuAction {
  id: string;
  label: string;
  icon?: string;
  destructive?: boolean;
  onClick: (item: MediaItem) => void;
}

interface MediaContextMenuProps {
  item: MediaItem;
  actions: ContextMenuAction[];
  onClose: () => void;
}

/**
 * Context menu component for media item actions
 */
export const MediaContextMenu: React.FC<MediaContextMenuProps> = ({ item, actions, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-48 rounded bg-popover border border-border shadow-md py-1"
      onMouseLeave={onClose}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`w-full px-3 py-2 text-left text-xs hover:bg-accent transition-colors flex items-center gap-2 ${
            action.destructive ? 'text-destructive' : 'text-foreground'
          }`}
          onClick={() => {
            action.onClick(item);
            onClose();
          }}
        >
          {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};
