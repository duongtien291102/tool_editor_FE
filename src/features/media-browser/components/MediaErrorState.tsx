import React from 'react';

interface MediaErrorStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * Error state component with retry functionality
 */
export const MediaErrorState: React.FC<MediaErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
      <div className="text-4xl text-destructive/30">⚠️</div>
      <div>
        <p className="text-sm font-medium text-destructive">Failed to load media</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs break-words">{error}</p>
        <button
          type="button"
          className="mt-3 inline-flex items-center justify-center h-8 px-3 rounded bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    </div>
  );
};
