import type { components } from './schema';

export type ApiSchemas = components['schemas'];
export type ApiSchema<Name extends keyof ApiSchemas> = ApiSchemas[Name];

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface UploadProgress {
  loaded: number;
  total?: number;
  percentage?: number;
}
