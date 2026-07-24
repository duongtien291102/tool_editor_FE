import type { AssetRecord } from '@/state/studioStore';

export const assetPipelineTypes = [
  'Image',
  'Video',
  'Audio',
  'Subtitle',
  'Prompt',
  'JSON',
  'SRT',
  'Markdown',
  'Thumbnail',
  'Voice',
  'Reference Image',
  'Generated Asset',
] as const;

export type AssetPipelineType = (typeof assetPipelineTypes)[number];

export interface AssetVersionView {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  source: string;
  workflowState: string;
  provider: string;
  metadata: Readonly<Record<string, string>>;
}

export interface AssetDependencyView {
  direction: 'upstream' | 'downstream';
  assetName: string;
  relation: string;
  version: number;
}

export interface AssetPipelineDetail {
  assetId: string;
  type: AssetPipelineType;
  tags: readonly string[];
  versions: readonly AssetVersionView[];
  dependencies: readonly AssetDependencyView[];
  preview: Readonly<Record<string, string>>;
}

export interface AssetSearchFilters {
  text: string;
  type: 'All' | AssetPipelineType;
  tag: string;
  provider: string;
  workflow: string;
  version: string;
}

const detailOverrides: Readonly<Record<string, Partial<AssetPipelineDetail>>> = {
  'asset-1': {
    type: 'Video',
    tags: ['city', 'approved', 'hero'],
    dependencies: [
      { direction: 'upstream', assetName: 'Scene 01.json', relation: 'scene-to-video', version: 2 },
      { direction: 'downstream', assetName: 'city-dawn-cover.jpg', relation: 'video-to-thumbnail', version: 1 },
      { direction: 'downstream', assetName: 'city-dawn-en.srt', relation: 'video-to-subtitle', version: 1 },
    ],
  },
  'asset-2': {
    type: 'Generated Asset',
    tags: ['product', 'generated'],
    dependencies: [
      { direction: 'upstream', assetName: 'Product hero prompt', relation: 'prompt-to-video', version: 4 },
    ],
  },
  'asset-3': {
    type: 'Reference Image',
    tags: ['material', 'reference'],
  },
  'asset-4': {
    type: 'Audio',
    tags: ['music', 'approved'],
    dependencies: [
      { direction: 'downstream', assetName: 'Atlas review export', relation: 'audio-to-export', version: 2 },
    ],
  },
  'asset-5': {
    type: 'Image',
    tags: ['brand', 'shared'],
  },
  'asset-6': {
    type: 'Thumbnail',
    tags: ['surface', 'review'],
  },
};

export function getAssetPipelineDetail(asset: AssetRecord): AssetPipelineDetail {
  const override = detailOverrides[asset.id];
  const type = override?.type ?? asset.kind;
  const baseVersion: AssetVersionView = {
    id: `${asset.id}-version-1`,
    version: 1,
    createdAt: '2026-07-23T08:20:00.000Z',
    createdBy: 'owner',
    source: 'import',
    workflowState: 'idea',
    provider: 'mock-import',
    metadata: {
      mimeType: type === 'Video' || type === 'Generated Asset' ? 'video/mp4' : 'application/mock',
      size: asset.size,
      resolution: type === 'Audio' ? '—' : '1920 × 1080',
      duration: asset.duration ?? '—',
      checksum: `mock-${asset.id}-v1`,
    },
  };
  const secondVersion: AssetVersionView = {
    ...baseVersion,
    id: `${asset.id}-version-2`,
    version: 2,
    createdAt: '2026-07-24T14:32:00.000Z',
    createdBy: 'workflow-engine',
    source: 'metadata-review',
    workflowState: 'scene',
    provider: type === 'Video' || type === 'Generated Asset' ? 'mock-video' : 'mock-indexer',
    metadata: { ...baseVersion.metadata, checksum: `mock-${asset.id}-v2` },
  };
  const thirdVersion: AssetVersionView = {
    ...secondVersion,
    id: `${asset.id}-version-3`,
    version: 3,
    createdAt: '2026-07-25T01:18:00.000Z',
    createdBy: 'reviewer',
    source: 'quality-review',
    workflowState: 'quality-review',
    metadata: { ...secondVersion.metadata, checksum: `mock-${asset.id}-v3` },
  };
  const versions = asset.id === 'asset-1'
    ? [baseVersion, secondVersion, thirdVersion]
    : [baseVersion, secondVersion];
  return {
    assetId: asset.id,
    type,
    tags: override?.tags ?? [type.toLowerCase().replaceAll(' ', '-')],
    versions,
    dependencies: override?.dependencies ?? [],
    preview: {
      status: 'Ready',
      currentVersion: `v${versions.length}`,
      reference: `${asset.id}@${versions.at(-1)?.id ?? ''}`,
      storage: 'Mock repository',
    },
  };
}

export function matchesAssetFilters(
  asset: AssetRecord,
  filters: AssetSearchFilters,
): boolean {
  const detail = getAssetPipelineDetail(asset);
  const version = Number.parseInt(filters.version, 10);
  return asset.name.toLowerCase().includes(filters.text.toLowerCase())
    && (filters.type === 'All' || detail.type === filters.type)
    && (!filters.tag || detail.tags.some((tag) => tag.includes(filters.tag.toLowerCase())))
    && (!filters.provider || detail.versions.some((item) => item.provider === filters.provider))
    && (!filters.workflow || detail.versions.some((item) => item.workflowState === filters.workflow))
    && (!filters.version || detail.versions.some((item) => item.version === version));
}
