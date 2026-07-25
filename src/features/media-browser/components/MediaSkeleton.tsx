import React from 'react';

/**
 * Skeleton loader for media items
 * Used during loading state for better perceived performance
 */
export const MediaSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded border border-border overflow-hidden bg-card animate-pulse"
        >
          <div className="h-20 bg-muted" />
          <div className="p-2 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="mt-1 flex gap-2">
              <div className="h-3 bg-muted rounded flex-1" />
              <div className="h-3 bg-muted rounded flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
