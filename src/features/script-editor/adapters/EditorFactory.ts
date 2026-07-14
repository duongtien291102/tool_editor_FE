import type { IEditorAdapter } from './EditorAdapter';
import { BasicEditorAdapter } from './BasicEditorAdapter';
import { MonacoEditorAdapter } from './MonacoEditorAdapter';

export class EditorFactory {
  static getEditor(type: 'basic' | 'monaco' = 'basic'): IEditorAdapter {
    switch (type) {
      case 'monaco':
        return MonacoEditorAdapter;
      case 'basic':
      default:
        return BasicEditorAdapter;
    }
  }
}
