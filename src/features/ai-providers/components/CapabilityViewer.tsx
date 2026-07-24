import { cn } from '@/core/utils/cn';

interface CapabilityViewerProps {
  capabilities: string[];
  maxDisplay?: number;
  className?: string;
}

const CAPABILITY_COLORS: Record<string, string> = {
  GenerateImage: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  GenerateVideo: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  GenerateVoice: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  GenerateSubtitle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Inpainting: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Outpainting: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  ImageEditing: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  Upscale: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export function CapabilityViewer({ capabilities, maxDisplay = 4, className }: CapabilityViewerProps) {
  const visible = capabilities.slice(0, maxDisplay);
  const remaining = capabilities.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visible.map((cap) => (
        <span
          key={cap}
          className={cn(
            'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
            CAPABILITY_COLORS[cap] || 'bg-zinc-800 text-zinc-300 border-zinc-700',
          )}
        >
          {cap.replace(/^Generate/, '')}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400">
          +{remaining}
        </span>
      )}
    </div>
  );
}
