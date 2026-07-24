import { cn } from '@/core/utils/cn';

interface ProviderStatusProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function ProviderStatus({ enabled, onToggle, disabled = false }: ProviderStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-xs font-medium', enabled ? 'text-emerald-400' : 'text-zinc-500')}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle(!enabled)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
          enabled ? 'bg-primary' : 'bg-zinc-700',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle provider enabled state"
      >
        <span
          className={cn(
            'pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            enabled ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}
