import type { IScriptService } from '../services/ScriptService';
import { type Script, SaveStatus } from '../types';

export class AutoSaveManager {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private pendingScript: Script | null = null;
  private service: IScriptService;
  private setStatus: (status: SaveStatus) => void;

  constructor(service: IScriptService, setStatus: (status: SaveStatus) => void) {
    this.service = service;
    this.setStatus = setStatus;
  }

  scheduleSave(script: Script, delayMs: number = 1000) {
    this.pendingScript = script;
    this.setStatus(SaveStatus.Dirty);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      void this.executeSave();
    }, delayMs);
  }

  private async executeSave() {
    if (!this.pendingScript) return;
    
    this.setStatus(SaveStatus.Saving);

    try {
      await this.service.saveScript(this.pendingScript);
      this.setStatus(SaveStatus.Saved);
      this.pendingScript = null;
    } catch {
      this.setStatus(SaveStatus.Error);
    } finally {
      // If a new change came in while saving, schedule it again
      if (this.pendingScript) {
        this.scheduleSave(this.pendingScript, 500);
      }
    }
  }
}
