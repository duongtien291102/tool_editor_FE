import { Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface HealthBadgeProps {
  status: 'Healthy' | 'Degraded' | 'Unhealthy' | 'Disabled' | string;
  className?: string;
}

export function HealthBadge({ status, className }: HealthBadgeProps) {
  const isHealthy = status === 'Healthy';
  const isDegraded = status === 'Degraded';
  const isDisabled = status === 'Disabled';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
        isHealthy && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        isDegraded && 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        !isHealthy && !isDegraded && !isDisabled && 'border-red-500/30 bg-red-500/10 text-red-400',
        isDisabled && 'border-zinc-700 bg-zinc-800/40 text-zinc-500',
        className,
      )}
    >
      {isHealthy && <CheckCircle2 className="size-3.5" />}
      {isDegraded && <AlertTriangle className="size-3.5" />}
      {!isHealthy && !isDegraded && !isDisabled && <XCircle className="size-3.5" />}
      {isDisabled && <Activity className="size-3.5" />}
      <span>{status}</span>
    </span>
  );
}
