export const ElementType = {
  Prompt: 'PROMPT',
  Image: 'IMAGE',
  Video: 'VIDEO',
  Voice: 'VOICE',
  Subtitle: 'SUBTITLE',
  Transition: 'TRANSITION',
  Effect: 'EFFECT',
} as const;

export type ElementType = (typeof ElementType)[keyof typeof ElementType];

export const SaveStatus = {
  Saved: 'SAVED',
  Dirty: 'DIRTY',
  Saving: 'SAVING',
  Error: 'ERROR',
} as const;

export type SaveStatus = (typeof SaveStatus)[keyof typeof SaveStatus];

export interface SceneElement {
  id: string;
  type: ElementType;
  content: string;
  metadata?: string;
  order: number;
}

export interface Scene {
  id: string;
  title: string;
  notes: string;
  duration: string;
  order: number;
  elements: SceneElement[];
}

export interface Script {
  id: string;
  projectId: string;
  title: string;
  description: string;
  version: number;
  scenes: Scene[];
  updatedAt: number;
}

export interface ScriptSummary {
  id: string;
  title: string;
  version: number;
}

// Command Pattern for Undo/Redo
export interface ICommand {
  id: string;
  execute(): void;
  undo(): void;
}
