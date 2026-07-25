import React from 'react';

interface MediaEmptyStateProps {
  hasSearch: boolean;
  onClearSearch: () => void;
}

/**
 * Empty state component for when no media items are found
 */
export const MediaEmptyState: React.FC<MediaEmptyStateProps> = ({ hasSearch, onClearSearch }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
      <div className="text-4xl text-muted-foreground/30">📭</div>
      <div>
        <p className="text-sm font-medium text-foreground">No media assets found</p>
        {hasSearch ? (
          <>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search filters.</p>
            <button
              type="button"
              className="mt-3 text-xs text-primary hover:underline"
              onClick={onClearSearch}
            >
              Clear search
            </button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Upload your first media file to get started.
          </p>
        )}
      </div>
    </div>
  );
};
