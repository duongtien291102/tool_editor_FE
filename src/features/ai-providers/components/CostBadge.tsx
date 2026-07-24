import { DollarSign } from 'lucide-react';
import type { CostProfile } from '../types';

interface CostBadgeProps {
  costProfile: CostProfile;
}

export function CostBadge({ costProfile }: CostBadgeProps) {
  const primaryUnit =
    costProfile.costPerVideoMinute > 0
      ? `$${costProfile.costPerVideoMinute.toFixed(2)}/min`
      : costProfile.costPerImage > 0
        ? `$${costProfile.costPerImage.toFixed(2)}/img`
        : costProfile.costPerAudioMinute > 0
          ? `$${costProfile.costPerAudioMinute.toFixed(2)}/min`
          : `$${costProfile.costPer1kTokens.toFixed(3)}/1k tok`;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary"
      title={`Image: $${costProfile.costPerImage} | Video: $${costProfile.costPerVideoMinute}/min | Audio: $${costProfile.costPerAudioMinute}/min | 1k Tokens: $${costProfile.costPer1kTokens}`}
    >
      <DollarSign className="size-3 shrink-0" />
      <span>{primaryUnit}</span>
    </span>
  );
}
