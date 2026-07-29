import { ArrowDownToLine, ArrowUpFromLine, Check, RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { AssetRecord } from '@/state/studioStore';
import { cn } from '@/core/utils/cn';
import { getAssetPipelineDetail, type AssetVersionView } from './assetCatalog';

type DetailTab = 'Preview' | 'Versions' | 'Metadata' | 'Dependency';
type TranslationFn = ReturnType<typeof useTranslation>['t'];

export function AssetVersionPanel({
  asset,
  preview,
  onNotify,
}: {
  asset: AssetRecord;
  preview: ReactNode;
  onNotify: (message: string) => void;
}) {
  const { t } = useTranslation('editor');
  const detail = getAssetPipelineDetail(asset);
  const [tab, setTab] = useState<DetailTab>('Preview');
  const [versions, setVersions] = useState<readonly AssetVersionView[]>(detail.versions);
  const current = versions.at(-1);

  const restore = (version: AssetVersionView) => {
    const restored: AssetVersionView = {
      ...version,
      id: `${asset.id}-version-${versions.length + 1}`,
      version: versions.length + 1,
      createdAt: new Date().toISOString(),
      createdBy: 'owner',
      source: `restore:${version.id}`,
    };
    setVersions([...versions, restored]);
    onNotify(
      t('assetPipeline.messages.restored', {
        sourceVersion: version.version,
        restoredVersion: restored.version,
      }),
    );
  };

  return (
    <div>
      {preview}
      <div className="p-4">
        <p className="break-words text-sm font-semibold">{asset.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatAssetPipelineType(detail.type, t)} / {asset.size} / v{current?.version}
        </p>
        <div className="mt-4 grid grid-cols-2 border-b border-border">
          {(['Preview', 'Versions', 'Metadata', 'Dependency'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={cn(
                'border-b-2 px-1 py-2 text-[11px]',
                tab === item
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground',
              )}
            >
              {t(`assetPipeline.tabs.${item}`)}
            </button>
          ))}
        </div>
        {tab === 'Preview' && (
          <dl className="mt-4 space-y-3 text-xs">
            {Object.entries(detail.preview).map(([label, value]) => (
              <DetailRow
                key={label}
                label={t(`assetPipeline.preview.${label}`, { defaultValue: label })}
                value={formatAssetPipelinePreviewValue(label, value, t)}
              />
            ))}
          </dl>
        )}
        {tab === 'Versions' && (
          <div className="mt-4 space-y-2">
            {[...versions].reverse().map((version, index) => (
              <div key={version.id} className="rounded-lg border border-border p-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">v{version.version}</span>
                  {index === 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-primary">
                      <Check className="size-3" /> {t('assetPipeline.current')}
                    </span>
                  )}
                  {index > 0 && (
                    <button
                      onClick={() => restore(version)}
                      className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="size-3" /> {t('assetPipeline.actions.restore')}
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatAssetPipelineSource(version.source, t)} · {version.createdBy}
                </p>
              </div>
            ))}
          </div>
        )}
        {tab === 'Metadata' && current && (
          <dl className="mt-4 space-y-3 text-xs">
            <DetailRow label={t('assetPipeline.fields.provider')} value={current.provider} />
            <DetailRow
              label={t('assetPipeline.fields.workflow')}
              value={formatAssetPipelineWorkflow(current.workflowState, t)}
            />
            {Object.entries(current.metadata).map(([label, value]) => (
              <DetailRow
                key={label}
                label={t(`assetPipeline.metadata.${label}`, { defaultValue: label })}
                value={value}
              />
            ))}
            <DetailRow label={t('assetPipeline.fields.tags')} value={detail.tags.join(', ')} />
          </dl>
        )}
        {tab === 'Dependency' && (
          <div className="mt-4 space-y-2">
            {detail.dependencies.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {t('assetPipeline.emptyDependencies')}
              </p>
            )}
            {detail.dependencies.map((dependency) => (
              <div
                key={`${dependency.direction}-${dependency.assetName}`}
                className="flex gap-2 rounded-lg border border-border p-2.5"
              >
                {dependency.direction === 'upstream' ? (
                  <ArrowDownToLine className="mt-0.5 size-3.5 text-primary" />
                ) : (
                  <ArrowUpFromLine className="mt-0.5 size-3.5 text-emerald-500" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs">{dependency.assetName}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {dependency.relation} · v{dependency.version}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="mt-5 w-full">
          {t('assetPipeline.actions.openPreview')}
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="capitalize text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-right">{value}</dd>
    </div>
  );
}

export function CompactAssetVersions({ asset }: { asset: AssetRecord }) {
  const { t } = useTranslation('editor');
  const detail = getAssetPipelineDetail(asset);
  return (
    <div className="border-t border-white/8 px-3 py-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
          {t('assetPipeline.versionHistory')}
        </p>
        <span className="text-[10px] text-zinc-500">{formatAssetPipelineType(detail.type, t)}</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {[...detail.versions].reverse().map((version, index) => (
          <div
            key={version.id}
            className="flex items-center gap-2 rounded border border-white/8 px-2 py-1.5 text-[10px]"
          >
            <span className="font-mono text-zinc-300">v{version.version}</span>
            <span className="min-w-0 flex-1 truncate text-zinc-600">
              {formatAssetPipelineSource(version.source, t)}
            </span>
            {index === 0 && <span className="text-primary">{t('assetPipeline.current')}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatAssetPipelineType(type: string, t: TranslationFn) {
  return t(`assetPipeline.types.${toTranslationKey(type)}`, { defaultValue: type });
}

function formatAssetPipelineSource(source: string, t: TranslationFn) {
  if (source.startsWith('restore:')) {
    return t('assetPipeline.sources.restore', {
      id: source.replace('restore:', ''),
      defaultValue: source,
    });
  }

  return t(`assetPipeline.sources.${toTranslationKey(source)}`, { defaultValue: source });
}

function formatAssetPipelineWorkflow(workflow: string, t: TranslationFn) {
  return t(`workflow.states.${workflow}`, {
    defaultValue: t(`assetPipeline.workflow.${toTranslationKey(workflow)}`, {
      defaultValue: workflow,
    }),
  });
}

function formatAssetPipelinePreviewValue(label: string, value: string, t: TranslationFn) {
  if (label === 'status') {
    return t(`assetPipeline.previewStatuses.${toTranslationKey(value)}`, {
      defaultValue: value,
    });
  }

  if (label === 'storage') {
    return t(`assetPipeline.storage.${toTranslationKey(value)}`, {
      defaultValue: value,
    });
  }

  return value;
}

function toTranslationKey(value: string) {
  return value.toLowerCase().replaceAll(' ', '-').replaceAll(':', '-');
}
