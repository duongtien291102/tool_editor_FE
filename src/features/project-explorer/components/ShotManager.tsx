import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface ShotItem {
  id: string;
  shotNumber: number;
  prompt: string;
  provider: string;
  durationSeconds: number;
  status: 'Pending' | 'Rendering' | 'Generated';
}

interface ShotManagerProps {
  sceneId: string;
}

export const ShotManager: React.FC<ShotManagerProps> = ({ sceneId }) => {
  const [shots, setShots] = useState<ShotItem[]>([
    {
      id: 'sh-1',
      shotNumber: 1,
      prompt:
        'Wide angle shot of futuristic neon city in heavy rain, cinematic lighting, 8k resolution',
      provider: 'Google Veo',
      durationSeconds: 5,
      status: 'Generated',
    },
    {
      id: 'sh-2',
      shotNumber: 2,
      prompt: 'Medium shot of cyberpunk character putting on glowing helmet',
      provider: 'Runway Gen-3',
      durationSeconds: 4,
      status: 'Rendering',
    },
    {
      id: 'sh-3',
      shotNumber: 3,
      prompt: 'Close up of neon lights reflecting in character visor',
      provider: 'Kling AI',
      durationSeconds: 3,
      status: 'Pending',
    },
  ]);

  const [newPrompt, setNewPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('Google Veo');

  const handleAddShot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    const newShot: ShotItem = {
      id: `sh-${Date.now()}`,
      shotNumber: shots.length + 1,
      prompt: newPrompt.trim(),
      provider: selectedProvider,
      durationSeconds: 4,
      status: 'Pending',
    };

    setShots([...shots, newShot]);
    setNewPrompt('');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-base font-semibold">Shot Manager</h2>
          <p className="text-xs text-muted-foreground">
            Manage shots & AI prompt assignments for Scene {sceneId}
          </p>
        </div>
      </div>

      {/* Add Shot Quick Form */}
      <form onSubmit={handleAddShot} className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Enter AI video generation prompt..."
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
        >
          <option value="Google Veo">Google Veo</option>
          <option value="Runway Gen-3">Runway Gen-3</option>
          <option value="Kling AI">Kling AI</option>
          <option value="Sora">OpenAI Sora</option>
          <option value="Pika">Pika Labs</option>
        </select>
        <Button size="sm" type="submit">
          + Add Shot
        </Button>
      </form>

      {/* Shot Cards Grid */}
      <div className="space-y-3">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="p-3 rounded-md border border-border bg-background space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-primary">
                SHOT #{shot.shotNumber}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  {shot.provider} ({shot.durationSeconds}s)
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    shot.status === 'Generated'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : shot.status === 'Rendering'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {shot.status}
                </span>
              </div>
            </div>
            <p className="text-xs text-foreground font-medium">{shot.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
