import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, Dialog, Input } from '@/components/ui/Foundation';
import { aiProviderService } from '../services/aiProviderService';
import type { CostEstimateResponse, DurationEstimateResponse } from '../types';

interface CostEstimateModalProps {
  provider: string | null;
  open: boolean;
  onClose: () => void;
}

export function CostEstimateModal({ provider, open, onClose }: CostEstimateModalProps) {
  if (!provider) return null;

  const [capability, setCapability] = useState('GenerateVideo');
  const [imageCount, setImageCount] = useState(1);
  const [videoSeconds, setVideoSeconds] = useState(30);
  const [audioSeconds, setAudioSeconds] = useState(60);
  const [tokenCount, setTokenCount] = useState(5000);

  const [costResult, setCostResult] = useState<CostEstimateResponse | null>(null);
  const [durationResult, setDurationResult] = useState<DurationEstimateResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const cost = await aiProviderService.estimateCost(provider, {
        capability,
        imageCount,
        videoSeconds,
        audioSeconds,
        tokenCount,
      });
      const duration = await aiProviderService.estimateDuration(provider, {
        capability,
        itemsCount: imageCount,
        videoLengthSeconds: videoSeconds,
      });
      setCostResult(cost);
      setDurationResult(duration);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Estimate Workload Cost & Duration for ${provider}`}
      description="Simulate generation costs and execution latencies based on declared profiles."
    >
      <div className="space-y-4 text-sm">
        <label className="block font-medium">
          Target Capability
          <select
            className="studio-select mt-1.5"
            value={capability}
            onChange={(e) => setCapability(e.target.value)}
          >
            <option value="GenerateVideo">GenerateVideo</option>
            <option value="GenerateImage">GenerateImage</option>
            <option value="GenerateVoice">GenerateVoice</option>
            <option value="GenerateSubtitle">GenerateSubtitle</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block font-medium">
            Images Count
            <Input
              type="number"
              min="0"
              className="mt-1.5"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
            />
          </label>
          <label className="block font-medium">
            Video Seconds
            <Input
              type="number"
              min="0"
              className="mt-1.5"
              value={videoSeconds}
              onChange={(e) => setVideoSeconds(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block font-medium">
            Audio Seconds
            <Input
              type="number"
              min="0"
              className="mt-1.5"
              value={audioSeconds}
              onChange={(e) => setAudioSeconds(Number(e.target.value))}
            />
          </label>
          <label className="block font-medium">
            Estimated Tokens
            <Input
              type="number"
              min="0"
              step="500"
              className="mt-1.5"
              value={tokenCount}
              onChange={(e) => setTokenCount(Number(e.target.value))}
            />
          </label>
        </div>

        <Button className="w-full" onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculating...' : 'Run Simulation Estimate'}
        </Button>

        {costResult && durationResult && (
          <Card className="p-4 space-y-3 bg-muted/30 border-primary/30">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-xs text-muted-foreground">Estimated Cost:</span>
              <span className="font-mono text-lg font-bold text-primary">
                ${costResult.estimatedCostUsd.toFixed(4)} {costResult.currency}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-xs text-muted-foreground">Estimated Duration:</span>
              <span className="font-mono text-base font-semibold text-emerald-400">
                {durationResult.formattedDuration} ({durationResult.estimatedDurationMs}ms)
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Formula Breakdown:</p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{costResult.breakdown}</p>
            </div>
          </Card>
        )}

        <div className="flex justify-end pt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
