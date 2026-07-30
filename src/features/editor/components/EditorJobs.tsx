import { Check, Clock3, RefreshCw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Progress } from '@/components/ui/Foundation';
import type { JobStatus, useStudioStore } from '@/state/studioStore';

function StatusIcon({ status }: { status: JobStatus }): ReactNode {
  switch (status) {
    case 'Success':
      return <Check className="size-4 text-emerald-400" />;
    case 'Failed':
      return <X className="size-4 text-rose-400" />;
    case 'Running':
      return <RefreshCw className="size-4 animate-spin text-cyan-400" />;
    default:
      return <Clock3 className="size-4 text-amber-400" />;
  }
}

export function EditorJobs({ jobs }: { jobs: ReturnType<typeof useStudioStore.getState>['jobs'] }) {
  return (
    <div className="divide-y divide-white/8 overflow-auto">
      {jobs.map((job) => (
        <div key={job.id} className="p-3">
          <div className="flex items-center gap-2">
            <StatusIcon status={job.status} />
            <p className="min-w-0 flex-1 truncate text-xs">{job.type}</p>
            <span className="text-[10px] text-zinc-500">{job.status}</span>
          </div>
          {job.status === 'Running' && <Progress value={job.progress} className="mt-2" />}
        </div>
      ))}
    </div>
  );
}
