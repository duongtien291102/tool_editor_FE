import { Check, Circle, GitBranch } from 'lucide-react';
import { useState } from 'react';
import type { ProjectRecord } from '@/state/studioStore';
import { cn } from '@/core/utils/cn';
import {
  createMockWorkflowEngine,
  type WorkflowState,
} from './workflowEngine';

export function WorkflowPanel({ project }: { project: ProjectRecord }) {
  const [engine] = useState(() => createMockWorkflowEngine(project.name));
  const [selectedId, setSelectedId] = useState('idea');
  const selected = engine.select(selectedId);

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="border-b border-white/8 px-3 py-3">
        <div className="flex items-center gap-2">
          <GitBranch className="size-3.5 text-primary" />
          <p className="text-xs font-medium text-zinc-200">Video workflow</p>
        </div>
        <p className="mt-1 text-[10px] leading-4 text-zinc-500">
          Timeline is generated from validated workflow data.
        </p>
      </div>
      <div className="p-2">
        {engine.workflow.states.map((state, index) => (
          <WorkflowStep
            key={state.id}
            state={state}
            selected={state.id === selectedId}
            last={index === engine.workflow.states.length - 1}
            onSelect={() => setSelectedId(state.id)}
          />
        ))}
      </div>
      <div className="mx-3 mb-3 border-t border-white/8 pt-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
          Selected output
        </p>
        <p className="mt-1 text-xs font-medium text-zinc-200">{selected.name}</p>
        <dl className="mt-3 space-y-2">
          {Object.entries(selected.data).map(([label, value]) => (
            <div key={label} className="flex gap-3 text-[10px]">
              <dt className="min-w-16 capitalize text-zinc-600">{label}</dt>
              <dd className="min-w-0 break-words text-zinc-400">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function WorkflowStep({
  state,
  selected,
  last,
  onSelect,
}: {
  state: WorkflowState;
  selected: boolean;
  last: boolean;
  onSelect: () => void;
}) {
  const complete = state.status === 'completed' || state.status === 'current';
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left',
        selected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.035]',
      )}
    >
      {!last && (
        <span className="absolute left-[15px] top-7 h-5 w-px bg-white/10" />
      )}
      <span
        className={cn(
          'relative z-10 grid size-3.5 shrink-0 place-items-center rounded-full border',
          complete
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-zinc-700 bg-[#111517] text-zinc-700',
        )}
      >
        {complete ? <Check className="size-2.5" /> : <Circle className="size-2" />}
      </span>
      <span className="min-w-0">
        <span className={cn('block text-xs', selected ? 'text-zinc-100' : 'text-zinc-400')}>
          {state.name}
        </span>
        <span className="mt-0.5 block text-[10px] capitalize text-zinc-600">
          {state.status}
        </span>
      </span>
    </button>
  );
}
