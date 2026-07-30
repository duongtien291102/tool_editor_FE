import { Clock } from 'lucide-react';

interface LatencyBadgeProps {
  latencyMs?: number;
  timeoutSeconds: number;
}

export function LatencyBadge({ latencyMs, timeoutSeconds }: LatencyBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground"
      title={
        latencyMs === undefined
          ? `Not checked. Provider timeout: ${timeoutSeconds}s`
          : `Measured provider latency: ${latencyMs}ms. Timeout: ${timeoutSeconds}s`
      }
    >
      <Clock className="size-3 shrink-0" />
      <span>{latencyMs === undefined ? 'Not checked' : `${latencyMs}ms`}</span>
    </span>
  );
}
