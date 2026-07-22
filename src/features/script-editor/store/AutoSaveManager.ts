import { ScriptVersionConflictError, type IScriptService } from '../services/ScriptService';
import { type Script, SaveStatus } from '../types';

export class AutoSaveManager {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private pendingScript: Script | null = null;
  private saving: Promise<void> | null = null;
  private readonly service: IScriptService;
  private readonly setStatus: (status: SaveStatus) => void;
  private readonly onSaved: (saved: Script, submitted: Script) => void;
  private readonly onConflict: (message: string) => void;

  constructor(
    service: IScriptService,
    setStatus: (status: SaveStatus) => void,
    onSaved: (saved: Script, submitted: Script) => void,
    onConflict: (message: string) => void,
  ) {
    this.service = service;
    this.setStatus = setStatus;
    this.onSaved = onSaved;
    this.onConflict = onConflict;
  }

  scheduleSave(script: Script, delayMs = 1000) {
    this.pendingScript = structuredClone(script);
    this.setStatus(SaveStatus.Dirty);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      void this.executeSave();
    }, delayMs);
  }

  async flush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.saving) await this.saving;
    if (this.pendingScript) await this.executeSave();
  }

  cancel() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.pendingScript = null;
  }

  private async executeSave() {
    if (this.saving) {
      await this.saving;
      if (this.pendingScript) await this.executeSave();
      return;
    }

    const submitted = this.pendingScript;
    if (!submitted) return;
    this.pendingScript = null;
    this.setStatus(SaveStatus.Saving);

    this.saving = this.service
      .saveScript(submitted)
      .then((saved) => {
        this.onSaved(saved, submitted);
        if (!this.pendingScript) this.setStatus(SaveStatus.Saved);
      })
      .catch((error) => {
        if (error instanceof ScriptVersionConflictError) this.onConflict(error.message);
        this.setStatus(SaveStatus.Error);
      })
      .finally(() => {
        this.saving = null;
      });

    await this.saving;
    if (this.pendingScript) this.scheduleSave(this.pendingScript, 500);
  }
}
