import { Clock } from 'lucide-react';

interface LatencyBadgeProps {
  latencyMs?: number;
  timeoutSeconds: number;
}

export function LatencyBadge({ latencyMs, timeoutSeconds }: LatencyBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground"
      title={`Estimated response latency ~${latencyMs || 45}ms. Max Timeout: ${timeoutSeconds}s`}
    >
      <Clock className="size-3 shrink-0" />
      <span>{latencyMs ? `${latencyMs}ms` : `<${timeoutSeconds}s`}</span>
    </span>
  );
}
