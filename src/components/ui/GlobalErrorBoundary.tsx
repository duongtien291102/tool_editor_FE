import React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background text-destructive p-4 border border-destructive/20 rounded">
      <h2 className="text-lg font-bold mb-2">UI Component Error</h2>
      <pre className="text-xs bg-muted/50 p-4 rounded overflow-auto max-w-full text-left font-mono text-muted-foreground">
        {errorMessage}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 transition-opacity"
      >
        Reload Component
      </button>
    </div>
  );
}

export const GlobalErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
};
