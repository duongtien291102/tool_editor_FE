import React from 'react';
import type { IEditorAdapterProps } from './EditorAdapter';

export const BasicEditorAdapter: React.FC<IEditorAdapterProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <textarea
      className={`w-full bg-background border border-border rounded-md p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none ${className || ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={4}
      aria-label={ariaLabel}
    />
  );
};
