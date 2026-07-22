import { ScriptApi } from '@/api/ScriptApi';
import { ApiRequestError } from '@/api/httpClient';
import type { ApiSchema } from '@/api/types';
import {
  ElementType,
  type Scene,
  type SceneElement,
  type Script,
  type ScriptSummary,
} from '../types';

const elementTypes = [
  ElementType.Prompt,
  ElementType.Image,
  ElementType.Video,
  ElementType.Voice,
  ElementType.Subtitle,
  ElementType.Transition,
  ElementType.Effect,
] as const;

function required(value: string | null | undefined, field: string) {
  if (!value) throw new Error(`Script API response is missing ${field}.`);
  return value;
}

function mapElement(dto: ApiSchema<'SceneElementDto'>): SceneElement {
  return {
    id: required(dto.id, 'element id'),
    type: elementTypes[dto.elementType ?? 0] ?? ElementType.Prompt,
    content: dto.content ?? '',
    metadata: dto.metadata ?? undefined,
    order: dto.order ?? 0,
  };
}

function mapScene(dto: ApiSchema<'SceneDto'>): Scene {
  return {
    id: required(dto.id, 'scene id'),
    title: dto.name ?? '',
    notes: dto.notes ?? '',
    duration: dto.duration ?? '00:00:05',
    order: dto.order ?? 0,
    elements: [...(dto.elements ?? [])]
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
      .map(mapElement),
  };
}

function mapScript(dto: ApiSchema<'ScriptDto'>): Script {
  return {
    id: required(dto.id, 'script id'),
    projectId: required(dto.projectId, 'project id'),
    title: dto.name ?? '',
    description: dto.description ?? '',
    version: dto.version ?? 0,
    updatedAt: Date.parse(dto.updatedAt ?? dto.createdAt ?? new Date().toISOString()),
    scenes: [...(dto.scenes ?? [])]
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
      .map(mapScene),
  };
}

function dataOrThrow<T>(
  response: { success?: boolean; data?: T; message?: string | null },
  message: string,
): T {
  if (!response.success || !response.data) throw new Error(response.message ?? message);
  return response.data;
}

export class ScriptVersionConflictError extends Error {
  constructor() {
    super('This script was changed elsewhere. The latest server version has been loaded.');
    this.name = 'ScriptVersionConflictError';
  }
}

export interface IScriptService {
  listScripts(projectId: string): Promise<ScriptSummary[]>;
  getScript(id: string): Promise<Script>;
  createScript(projectId: string, name: string): Promise<Script>;
  renameScript(name: string): Promise<Script>;
  deleteScript(): Promise<void>;
  saveScript(script: Script): Promise<Script>;
  addScene(name: string): Promise<Script>;
  deleteScene(sceneId: string): Promise<Script>;
  reorderScene(sceneId: string, newOrder: number): Promise<Script>;
  addElement(sceneId: string): Promise<Script>;
  deleteElement(sceneId: string, elementId: string): Promise<Script>;
  reload(): Promise<Script>;
}

export class ApiScriptService implements IScriptService {
  private persisted: Script | null = null;

  async listScripts(projectId: string): Promise<ScriptSummary[]> {
    const response = await ScriptApi.list(projectId, {
      PageNumber: 1,
      PageSize: 100,
      SortBy: 'UpdatedAt',
      Descending: true,
    });
    const page = dataOrThrow(response, 'Unable to load scripts.');
    return (page.items ?? []).flatMap((item) =>
      item.id ? [{ id: item.id, title: item.name ?? '', version: item.version ?? 0 }] : [],
    );
  }

  async getScript(id: string): Promise<Script> {
    const response = await ScriptApi.get(id);
    this.persisted = mapScript(dataOrThrow(response, 'Unable to load script.'));
    return structuredClone(this.persisted);
  }

  async createScript(projectId: string, name: string): Promise<Script> {
    const response = await ScriptApi.create({ projectId, name, description: null });
    this.persisted = mapScript(dataOrThrow(response, 'Unable to create script.'));
    return structuredClone(this.persisted);
  }

  async renameScript(name: string): Promise<Script> {
    const current = this.requirePersisted();
    try {
      const response = await ScriptApi.update(current.id, {
        name,
        description: current.description,
        expectedVersion: current.version,
      });
      this.persisted = mapScript(dataOrThrow(response, 'Unable to rename script.'));
      return structuredClone(this.persisted);
    } catch (error) {
      return this.handleMutationError(error);
    }
  }

  async deleteScript(): Promise<void> {
    const current = this.requirePersisted();
    await ScriptApi.remove(current.id);
    this.persisted = null;
  }

  async saveScript(target: Script): Promise<Script> {
    let current = this.requirePersisted(target.id);
    try {
      if (target.title !== current.title || target.description !== current.description) {
        const response = await ScriptApi.autosave(current.id, {
          name: target.title,
          description: target.description,
          expectedVersion: current.version,
        });
        current = mapScript(dataOrThrow(response, 'Unable to autosave script.'));
      }

      for (const targetScene of target.scenes) {
        let persistedScene = current.scenes.find((scene) => scene.id === targetScene.id);
        if (!persistedScene) continue;

        if (
          targetScene.title !== persistedScene.title ||
          targetScene.notes !== persistedScene.notes ||
          targetScene.duration !== persistedScene.duration
        ) {
          await ScriptApi.updateScene(current.id, targetScene.id, {
            name: targetScene.title,
            notes: targetScene.notes,
            duration: targetScene.duration,
            expectedVersion: current.version,
          });
          current = await this.fetchCurrent(current.id);
          persistedScene = current.scenes.find((scene) => scene.id === targetScene.id);
        }

        for (const targetElement of targetScene.elements) {
          const persistedElement = persistedScene?.elements.find(
            (element) => element.id === targetElement.id,
          );
          if (
            !persistedElement ||
            (targetElement.content === persistedElement.content &&
              targetElement.metadata === persistedElement.metadata)
          )
            continue;

          await ScriptApi.updateElement(current.id, targetScene.id, targetElement.id, {
            content: targetElement.content,
            metadata: targetElement.metadata,
            expectedVersion: current.version,
          });
          current = await this.fetchCurrent(current.id);
          persistedScene = current.scenes.find((scene) => scene.id === targetScene.id);
        }
      }

      this.persisted = current;
      return structuredClone(current);
    } catch (error) {
      return this.handleMutationError(error);
    }
  }

  async addScene(name: string): Promise<Script> {
    const current = this.requirePersisted();
    return this.mutateAndReload(() =>
      ScriptApi.addScene(current.id, {
        name,
        notes: null,
        duration: '00:00:05',
        expectedVersion: current.version,
      }),
    );
  }

  async deleteScene(sceneId: string): Promise<Script> {
    const current = this.requirePersisted();
    return this.mutateAndReload(() => ScriptApi.removeScene(current.id, sceneId, current.version));
  }

  async reorderScene(sceneId: string, newOrder: number): Promise<Script> {
    const current = this.requirePersisted();
    return this.mutateAndReload(() =>
      ScriptApi.reorderScenes(current.id, { sceneId, newOrder, expectedVersion: current.version }),
    );
  }

  async addElement(sceneId: string): Promise<Script> {
    const current = this.requirePersisted();
    return this.mutateAndReload(() =>
      ScriptApi.addElement(current.id, sceneId, {
        scriptId: current.id,
        sceneId,
        elementType: 0,
        content: '',
        metadata: null,
        expectedVersion: current.version,
      }),
    );
  }

  async deleteElement(sceneId: string, elementId: string): Promise<Script> {
    const current = this.requirePersisted();
    return this.mutateAndReload(() =>
      ScriptApi.removeElement(current.id, sceneId, elementId, current.version),
    );
  }

  async reload(): Promise<Script> {
    return this.fetchCurrent(this.requirePersisted().id);
  }

  private requirePersisted(id?: string): Script {
    if (!this.persisted || (id && this.persisted.id !== id)) throw new Error('No script is open.');
    return this.persisted;
  }

  private async fetchCurrent(id: string): Promise<Script> {
    const response = await ScriptApi.get(id);
    this.persisted = mapScript(dataOrThrow(response, 'Unable to reload script.'));
    return structuredClone(this.persisted);
  }

  private async mutateAndReload(request: () => Promise<unknown>): Promise<Script> {
    const id = this.requirePersisted().id;
    try {
      await request();
      return await this.fetchCurrent(id);
    } catch (error) {
      return this.handleMutationError(error);
    }
  }

  private async handleMutationError(error: unknown): Promise<never> {
    if (error instanceof ApiRequestError && error.status === 409) {
      if (this.persisted) await this.fetchCurrent(this.persisted.id);
      throw new ScriptVersionConflictError();
    }
    throw error;
  }
}

export const scriptService = new ApiScriptService();
