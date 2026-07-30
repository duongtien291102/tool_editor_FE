import { Check, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, responseData } from '@/api/httpClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Foundation';
import { configService } from '@/core/config/ConfigService';
import { useStudioStore } from '@/state/studioStore';
import { CompactAssetVersions } from '@/features/asset-pipeline';
import { PexelsLibrary } from '@/features/pexels';
import { addMediaAssetToProjectTimeline } from '../utils/editorUtils';

interface PipelineAsset {
  id: string;
  currentVersionId?: string | null;
  versions?: Array<{
    id: string;
    metadata?: { properties?: Record<string, string> };
  }>;
}

interface PipelineSearchResponse {
  data?: PipelineAsset[];
}

function pexelsContentUrl(contentId: string): string {
  return `${configService.getApiBaseUrl()}/api/pexels/assets/${encodeURIComponent(contentId)}/content`;
}

export function EditorAssets({
  assets,
}: {
  assets: ReturnType<typeof useStudioStore.getState>['assets'];
}) {
  const { t } = useTranslation('editor');
  const [activeTab, setActiveTab] = useState<'workspace' | 'pexels'>('workspace');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(assets[0]?.id);
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const visible = assets.filter((asset) => asset.name.toLowerCase().includes(search.toLowerCase()));
  const selected = assets.find((asset) => asset.id === selectedId);
  const missingPexelsUrls = useMemo(
    () =>
      assets
        .filter(
          (asset) =>
            asset.source === 'Pexels' && !asset.thumbnailUrl && !asset.contentUrl,
        )
        .map((asset) => asset.id)
        .sort()
        .join(','),
    [assets],
  );

  useEffect(() => {
    if (!workspaceId || !missingPexelsUrls) return;

    const controller = new AbortController();
    void responseData(
      apiClient.get<PipelineSearchResponse>('/api/v1/asset-pipeline/assets/search', {
        params: { workspaceId },
        signal: controller.signal,
      }),
    )
      .then((response) => {
        const pipelineAssets = response.data ?? [];
        const urlsByAssetId = new Map<string, { contentUrl?: string; thumbnailUrl?: string }>();
        for (const pipelineAsset of pipelineAssets) {
          const currentVersion =
            pipelineAsset.versions?.find(
              (version) => version.id === pipelineAsset.currentVersionId,
            ) ?? pipelineAsset.versions?.at(-1);
          const properties = currentVersion?.metadata?.properties;
          if (!properties) continue;
          urlsByAssetId.set(pipelineAsset.id, {
            contentUrl: properties.contentId
              ? pexelsContentUrl(properties.contentId)
              : undefined,
            thumbnailUrl: properties.thumbnailId
              ? pexelsContentUrl(properties.thumbnailId)
              : undefined,
          });
        }
        if (!urlsByAssetId.size) return;
        useStudioStore.setState((state) => ({
          assets: state.assets.map((asset) => {
            const restored = urlsByAssetId.get(asset.id);
            return restored ? { ...asset, ...restored } : asset;
          }),
        }));
      })
      .catch(() => {
        // The cards retain their media-type fallback when cached content is unavailable.
      });

    return () => controller.abort();
  }, [missingPexelsUrls, workspaceId]);

  const handleUseAsset = (asset: ReturnType<typeof useStudioStore.getState>['assets'][number]) => {
    setSelectedId(asset.id);
    const projectId = asset.projectId || useStudioStore.getState().currentProjectId || '';
    addMediaAssetToProjectTimeline(
      projectId,
      asset.name,
      asset.id,
      asset.thumbnailUrl || asset.contentUrl,
    );
  };

  return (
    <div className="flex flex-col min-h-0 flex-1 border-r border-white/8 bg-[#111517]">
      <div className="flex border-b border-white/8 bg-[#0d1012] px-2 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('workspace')}
          className={`flex-1 border-b-2 py-2 text-xs font-medium transition-colors ${
            activeTab === 'workspace'
              ? 'border-primary text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Project Assets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pexels')}
          className={`flex-1 border-b-2 py-2 text-xs font-medium transition-colors ${
            activeTab === 'pexels'
              ? 'border-primary text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          📸 Pexels Stock
        </button>
      </div>

      {activeTab === 'pexels' ? (
        <div className="min-h-0 flex-1 overflow-auto p-2">
          <PexelsLibrary />
        </div>
      ) : (
        <div className="flex flex-col min-h-0 flex-1 p-3">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('assets.searchPlaceholder')}
              className="pl-8 text-xs bg-[#0d1012] border-white/10"
            />
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-auto pr-1">
            {visible.map((asset) => {
              const isSelected = selectedId === asset.id;
              return (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({
                        id: asset.id,
                        name: asset.name,
                        thumbnailUrl: asset.thumbnailUrl || asset.contentUrl,
                        kind: asset.kind,
                      }),
                    );
                  }}
                  onClick={() => setSelectedId(asset.id)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border p-2 text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="aspect-video w-full rounded bg-black/40 overflow-hidden mb-2 relative">
                    {asset.thumbnailUrl || asset.contentUrl ? (
                      <img
                        src={asset.thumbnailUrl || asset.contentUrl}
                        alt={asset.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-zinc-500">
                        {asset.kind}
                      </div>
                    )}
                  </div>
                  <p className="truncate text-xs font-medium text-zinc-200">{asset.name}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{asset.kind}</p>

                  <Button
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseAsset(asset);
                    }}
                    className="mt-2 w-full text-[10px] h-7 gap-1"
                  >
                    {isSelected ? (
                      <>
                        <Check className="size-3" /> Đã chọn
                      </>
                    ) : (
                      <>
                        <Plus className="size-3" /> Dùng phân cảnh
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="mt-3 border-t border-white/8 pt-2">
              <CompactAssetVersions asset={selected} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
