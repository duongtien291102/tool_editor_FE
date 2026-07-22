import type { IJsonModel } from 'flexlayout-react';
import { appLogger } from '@/core/logger';

export interface ILayoutStorage {
  save(model: IJsonModel): void;
  load(): IJsonModel | null;
}

export class LocalStorageLayoutAdapter implements ILayoutStorage {
  private key: string;

  constructor(key: string = 'app_layout_v2') {
    this.key = key;
  }

  save(model: IJsonModel): void {
    localStorage.setItem(this.key, JSON.stringify(model));
  }

  load(): IJsonModel | null {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) return JSON.parse(stored) as IJsonModel;
    } catch (error: unknown) {
      appLogger.error('Failed to load layout from local storage', { error });
    }
    return null;
  }
}

export const defaultLayoutStorage = new LocalStorageLayoutAdapter();
