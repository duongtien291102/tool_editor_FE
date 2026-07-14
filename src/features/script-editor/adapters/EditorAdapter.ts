import React from 'react';

export interface IEditorAdapterProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export type IEditorAdapter = React.FC<IEditorAdapterProps>;
