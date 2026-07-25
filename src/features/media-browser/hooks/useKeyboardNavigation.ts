import { useEffect } from 'react';

interface KeyboardNavigationOptions {
  isGridFocused: boolean;
  itemCount: number;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onEnter: () => void;
  onEscape: () => void;
  columnCount: number;
}

/**
 * Hook to handle keyboard navigation in grid layout
 * Supports Arrow keys (↑ ↓ ← →), Enter, and Escape
 */
export function useKeyboardNavigation({
  isGridFocused,
  itemCount,
  currentIndex,
  onNavigate,
  onEnter,
  onEscape,
  columnCount,
}: KeyboardNavigationOptions) {
  useEffect(() => {
    if (!isGridFocused || itemCount === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp': {
          event.preventDefault();
          const nextIndex = Math.max(0, currentIndex - columnCount);
          onNavigate(nextIndex);
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex = Math.min(itemCount - 1, currentIndex + columnCount);
          onNavigate(nextIndex);
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          const nextIndex = Math.max(0, currentIndex - 1);
          onNavigate(nextIndex);
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          const nextIndex = Math.min(itemCount - 1, currentIndex + 1);
          onNavigate(nextIndex);
          break;
        }
        case 'Enter': {
          event.preventDefault();
          onEnter();
          break;
        }
        case 'Escape': {
          event.preventDefault();
          onEscape();
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGridFocused, itemCount, currentIndex, onNavigate, onEnter, onEscape, columnCount]);
}
