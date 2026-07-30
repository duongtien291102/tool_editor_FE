import { TimelineApi } from '@/api';
import type { TimelineDocument } from '../models/TimelineDocument';

export class TimelineAutoSaveManager {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private pendingDocument: TimelineDocument | null = null;
  private projectId: string = '';
  private isSaving: boolean = false;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  public setProjectId(projectId: string) {
    this.projectId = projectId;
  }

  public scheduleSave(document: TimelineDocument, delayMs = 1000) {
    if (!this.projectId) return;
    this.pendingDocument = document;
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      void this.executeSave();
    }, delayMs);
  }

  public async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.pendingDocument) {
      await this.executeSave();
    }
  }

  public cancel() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.pendingDocument = null;
  }

  private async executeSave(): Promise<void> {
    if (this.isSaving) {
      this.scheduleSave(this.pendingDocument!, 500);
      return;
    }

    const docToSave = this.pendingDocument;
    if (!docToSave || !this.projectId) return;

    this.pendingDocument = null;
    this.isSaving = true;

    try {
      let timelineId = '';
      try {
        const res = await TimelineApi.getByProject(this.projectId);
        if (res?.data?.id) timelineId = res.data.id;
      } catch {
        // Not found
      }

      if (!timelineId) {
        const createRes = await TimelineApi.create({
          projectId: this.projectId,
          name: 'Main Cut',
          frameRate: 30,
          resolutionWidth: 1920,
          resolutionHeight: 1080,
        });
        if (createRes?.data?.id) timelineId = createRes.data.id;
      }

      if (timelineId) {
        const mappedTracks = docToSave.tracks.map((t, tIdx) => ({
          id: t.id,
          name: t.name,
          order: tIdx,
          trackType: t.type === 'video' ? 0 : t.type === 'audio' ? 1 : 2,
          locked: false,
          muted: false,
          hidden: false,
          clips: t.clips.map((c) => ({
            id: c.id,
            assetId: c.metadata?.sourceId || c.metadata?.id || c.id,
            startFrame: c.timing.start.frame,
            endFrame: c.timing.start.frame + c.timing.duration.frame,
            name: c.metadata?.name || 'Clip',
            layer: 0,
            speed: 1.0,
            trimStart: c.timing.trimStart?.frame || 0,
            trimEnd: c.timing.trimEnd?.frame || 0,
            volume: 1.0,
            metadata: c.metadata?.type || c.type,
          })),
        }));

        await TimelineApi.autosave(timelineId, {
          data: {
            tracks: mappedTracks,
            version: 1,
          },
        });
      }
    } catch (error) {
      console.error('[TimelineAutoSaveManager] AutoSave failed:', error);
    } finally {
      this.isSaving = false;
    }
  }
}
