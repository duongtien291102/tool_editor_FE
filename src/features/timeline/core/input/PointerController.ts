import { DragController, type SimplePointerEvent } from './DragController';

export class PointerController {
  private dragController: DragController;

  constructor(dragController: DragController) {
    this.dragController = dragController;
  }

  public onPointerDown(e: SimplePointerEvent, type: 'clip', targetId: string, contextId: string) {
    this.dragController.handlePointerDown(e, type, targetId, contextId);
  }

  public onPointerMove(e: SimplePointerEvent) {
    this.dragController.handlePointerMove(e);
  }

  public onPointerUp() {
    this.dragController.handlePointerUp();
  }
}
