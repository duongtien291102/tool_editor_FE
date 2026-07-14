import type { Script } from '../types';
import { mockScript } from '../mock/data';

export interface IScriptService {
  getScript(projectId: string): Promise<Script>;
  saveScript(script: Script): Promise<boolean>;
}

export class MockScriptService implements IScriptService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getScript(_projectId: string): Promise<Script> {
    return new Promise(resolve => setTimeout(() => resolve(mockScript), 500));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async saveScript(_script: Script): Promise<boolean> {
    return new Promise(resolve => setTimeout(() => resolve(true), 800)); // Simulate slow network
  }
}

export const scriptService = new MockScriptService();
