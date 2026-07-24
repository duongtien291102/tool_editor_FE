import { describe, expect, it } from 'vitest';
import type { AssetRecord } from '@/state/studioStore';
import {
  getAssetPipelineDetail,
  matchesAssetFilters,
} from './assetCatalog';

const asset: AssetRecord = {
  id: 'asset-1',
  workspaceId: 'ws-studio',
  projectId: 'project-atlas',
  folder: 'Footage',
  name: 'city-dawn-master.mov',
  kind: 'Video',
  size: '184 MB',
  duration: '00:18',
  color: '#31596f',
};

describe('asset pipeline catalog', () => {
  it('keeps multiple immutable versions for each mock asset', () => {
    const detail = getAssetPipelineDetail(asset);

    expect(detail.versions.map((version) => version.version)).toEqual([1, 2, 3]);
    expect(new Set(detail.versions.map((version) => version.id)).size).toBe(3);
  });

  it('searches by type, tag, provider, workflow and version together', () => {
    expect(matchesAssetFilters(asset, {
      text: 'city',
      type: 'Video',
      tag: 'approved',
      provider: 'mock-video',
      workflow: 'quality-review',
      version: '3',
    })).toBe(true);
  });

  it('exposes upstream and downstream dependency edges', () => {
    const dependencies = getAssetPipelineDetail(asset).dependencies;

    expect(dependencies.some((edge) => edge.direction === 'upstream')).toBe(true);
    expect(dependencies.some((edge) => edge.direction === 'downstream')).toBe(true);
  });
});
