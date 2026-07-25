import { useCallback, useRef, useState } from 'react';

/**
 * Hook to manage multi-select state for media items
 * Supports Ctrl/Cmd + Click and Shift + Click selection patterns
 */
export function useMediaSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedRef = useRef<string | null>(null);

  const toggleSelection = useCallback((id: string, multiSelect: boolean, shiftSelect: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (shiftSelect && lastSelectedRef.current) {
        // Shift + click: select range
        // For now, just toggle (full implementation would need item indices)
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else if (multiSelect) {
        // Ctrl/Cmd + click: toggle individual
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        // Regular click: single select
        next.clear();
        next.add(id);
      }

      lastSelectedRef.current = id;
      return next;
    });
  }, []);

  const selectRange = useCallback((fromId: string, toId: string, items: Array<{ id: string }>) => {
    const fromIndex = items.findIndex((item) => item.id === fromId);
    const toIndex = items.findIndex((item) => item.id === toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);

    const newSelected = new Set<string>();
    for (let i = start; i <= end; i += 1) {
      newSelected.add(items[i]?.id || '');
    }

    setSelectedIds(newSelected);
    lastSelectedRef.current = toId;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedRef.current = null;
  }, []);

  const selectAll = useCallback((items: Array<{ id: string }>) => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  return {
    selectedIds,
    toggleSelection,
    selectRange,
    clearSelection,
    selectAll,
    isSelected,
    hasSelection: selectedIds.size > 0,
    selectionCount: selectedIds.size,
  };
}
