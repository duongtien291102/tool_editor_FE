import { Check, Circle, GitBranch } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectRecord } from '@/state/studioStore';
import { cn } from '@/core/utils/cn';
import { useProductionFlowStore } from './productionFlowStore';

type StepStatus = 'pending' | 'current' | 'completed';

const steps = [
  'idea',
  'storyboard',
  'scene',
  'prompt-pack',
  'timeline-draft',
  'ready-for-render',
] as const;

type StepId = (typeof steps)[number];

export function WorkflowPanel({ project }: { project: ProjectRecord }) {
  const { t } = useTranslation('editor');
  const [selectedId, setSelectedId] = useState<StepId>('idea');
  const flow = useProductionFlowStore((state) => state.projects[project.id]);
  const hydrateProject = useProductionFlowStore((state) => state.hydrateProject);

  useEffect(() => {
    void hydrateProject(project.id);
  }, [hydrateProject, project.id]);

  const statuses = useMemo<Record<StepId, StepStatus>>(() => {
    const completed = {
      idea: flow?.ideaReady ?? false,
      storyboard: (flow?.sceneCount ?? 0) > 0,
      scene: flow?.scenesComplete ?? false,
      'prompt-pack': flow?.promptPackReady ?? false,
      'timeline-draft': flow?.timelineReady ?? false,
      'ready-for-render': flow?.renderReady ?? false,
    };
    const firstIncomplete = steps.find((step) => !completed[step]);
    return Object.fromEntries(
      steps.map((step) => [
        step,
        completed[step] ? 'completed' : step === firstIncomplete ? 'current' : 'pending',
      ]),
    ) as Record<StepId, StepStatus>;
  }, [flow]);

  const selectedData: Record<string, string> = {
    status: t(`workflow.statuses.${statuses[selectedId]}`),
    ...(selectedId === 'idea' && {
      title: project.name,
      summary: t('workflow.values.summary'),
    }),
    ...(selectedId === 'storyboard' && {
      scenes: String(flow?.sceneCount ?? 0),
    }),
    ...(selectedId === 'scene' && {
      checks: flow?.scenesComplete ? t('workflow.checks.complete') : t('workflow.checks.incomplete'),
    }),
    ...(selectedId === 'prompt-pack' && {
      source: flow?.promptPackReady ? t('workflow.sources.script') : t('workflow.sources.notPrepared'),
    }),
    ...(selectedId === 'timeline-draft' && {
      generationSession: flow?.generationSessionId ?? t('workflow.sources.notCreated'),
    }),
    ...(selectedId === 'ready-for-render' && {
      checks: flow?.renderReady ? t('workflow.checks.ready') : t('workflow.checks.notReady'),
    }),
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="border-b border-white/8 px-3 py-3">
        <div className="flex items-center gap-2">
          <GitBranch className="size-3.5 text-primary" />
          <p className="text-xs font-medium text-zinc-200">{t('workflow.title')}</p>
        </div>
        <p className="mt-1 text-[10px] leading-4 text-zinc-500">
          {t('workflow.liveDescription')}
        </p>
      </div>
      <div className="p-2">
        {steps.map((step, index) => (
          <WorkflowStep
            key={step}
            name={t(`workflow.states.${step}`)}
            status={statuses[step]}
            statusName={t(`workflow.statuses.${statuses[step]}`)}
            selected={step === selectedId}
            last={index === steps.length - 1}
            onSelect={() => setSelectedId(step)}
          />
        ))}
      </div>
      <div className="mx-3 mb-3 border-t border-white/8 pt-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
          {t('workflow.selectedOutput')}
        </p>
        <p className="mt-1 text-xs font-medium text-zinc-200">
          {t(`workflow.states.${selectedId}`)}
        </p>
        <dl className="mt-3 space-y-2">
          {Object.entries(selectedData).map(([label, value]) => (
            <div key={label} className="flex gap-3 text-[10px]">
              <dt className="min-w-16 text-zinc-600">
                {t(`workflow.fields.${label}`, { defaultValue: label })}
              </dt>
              <dd className="min-w-0 break-words text-zinc-400">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function WorkflowStep({
  name,
  status,
  statusName,
  selected,
  last,
  onSelect,
}: {
  name: string;
  status: StepStatus;
  statusName: string;
  selected: boolean;
  last: boolean;
  onSelect: () => void;
}) {
  const complete = status === 'completed';
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left',
        selected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.035]',
      )}
    >
      {!last && <span className="absolute left-[15px] top-7 h-5 w-px bg-white/10" />}
      <span
        className={cn(
          'relative z-10 grid size-3.5 shrink-0 place-items-center rounded-full border',
          complete
            ? 'border-primary bg-primary text-primary-foreground'
            : status === 'current'
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-zinc-700 bg-[#111517] text-zinc-700',
        )}
      >
        {complete ? <Check className="size-2.5" /> : <Circle className="size-2" />}
      </span>
      <span className="min-w-0">
        <span className={cn('block text-xs', selected ? 'text-zinc-100' : 'text-zinc-400')}>
          {name}
        </span>
        <span className="mt-0.5 block text-[10px] text-zinc-600">{statusName}</span>
      </span>
    </button>
  );
}
