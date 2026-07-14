export interface TimelineCommand {
  execute(): void;
  undo(): void;
}

export interface IHistoryManager {
  execute(command: TimelineCommand): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}
