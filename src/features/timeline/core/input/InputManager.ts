import { PointerController } from './PointerController';
import { DragController } from './DragController';
import { TimelineEngine } from '../engines/TimelineEngine';

export class InputManager {
  private static instance: InputManager;
  
  public pointerController: PointerController;
  public dragController: DragController;
  public engine: TimelineEngine;

  private constructor() {
    this.engine = new TimelineEngine();
    this.dragController = new DragController(this.engine);
    this.pointerController = new PointerController(this.dragController);
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }
}
