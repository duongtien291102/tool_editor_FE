import { ChevronDown, PanelRight } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductionFlowStore } from '@/features/workflow';
import { type ProjectRecord, useStudioStore } from '@/state/studioStore';
import { EMPTY_PRODUCTION_SCENES, buildTimelineFromScenes, formatTime } from '../utils/editorUtils';

export function Inspector({ project }: { project: ProjectRecord }) {
  const { t } = useTranslation('editor');
  const selectedClipId = useStudioStore((state) => state.editor.selectedClipId);
  const scenes = useProductionFlowStore(
    (state) => state.projects[project.id]?.scenes ?? EMPTY_PRODUCTION_SCENES,
  );
  const timeline = useMemo(() => buildTimelineFromScenes(scenes), [scenes]);
  const selectedClip = timeline.rows
    .flatMap((row) => row.clips)
    .find((clip) => clip.id === selectedClipId);

  return (
    <aside className="hidden min-h-0 overflow-auto border-l border-white/8 bg-[#111517] p-4 2xl:block">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold">{t('inspector.title')}</h2>
        <PanelRight className="size-4 text-zinc-600" />
      </div>
      <div className="mt-5 aspect-video rounded-lg border border-white/8 bg-[#1d2529]" />
      <dl className="mt-5 space-y-4 text-xs">
        <InspectorField
          label={t('inspector.selection')}
          value={selectedClip?.name || t('inspector.noSelection')}
        />
        {selectedClip && (
          <>
            <InspectorField
              label={t('inspector.clipType')}
              value={t(`inspector.clipTypes.${selectedClip.type}`)}
            />
            <InspectorField
              label={t('inspector.position')}
              value={formatTime(selectedClip.startSeconds)}
            />
            <InspectorField
              label={t('inspector.duration')}
              value={formatTime(selectedClip.durationSeconds)}
            />
            <InspectorField
              label={t('inspector.content')}
              value={selectedClip.content || t('inspector.noContent')}
            />
          </>
        )}
        <InspectorField
          label={t('inspector.projectFormat')}
          value={`${project.aspectRatio} / ${project.frameRate} fps`}
        />
      </dl>
      <div className="mt-6 border-t border-white/8 pt-4">
        <button type="button" className="flex w-full items-center justify-between text-xs">
          <span>{t('inspector.transform')}</span>
          <ChevronDown className="size-3.5 text-zinc-500" />
        </button>
        <button type="button" className="mt-4 flex w-full items-center justify-between text-xs">
          <span>{t('inspector.audio')}</span>
          <ChevronDown className="size-3.5 text-zinc-500" />
        </button>
      </div>
    </aside>
  );
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium text-zinc-200">{value}</dd>
    </div>
  );
}
