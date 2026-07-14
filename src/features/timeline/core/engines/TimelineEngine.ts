import { ClipEngine } from './ClipEngine';

/**
 * Orchestrator engine for Timeline logic.
 * Composes smaller engines.
 */
export class TimelineEngine {
  private clipEngine: ClipEngine;

  constructor() {
    this.clipEngine = new ClipEngine();
  }

  getClipEngine(): ClipEngine {
    return this.clipEngine;
  }
}
