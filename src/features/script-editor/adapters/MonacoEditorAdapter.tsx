import React from 'react';
import type { IEditorAdapterProps } from './EditorAdapter';

export const MonacoEditorAdapter: React.FC<IEditorAdapterProps> = ({ className }) => {
  return (
    <div className={`w-full bg-muted border border-border rounded-md p-2 flex items-center justify-center text-muted-foreground text-xs ${className || ''}`}>
      [Monaco Editor Placeholder]
    </div>
  );
};
