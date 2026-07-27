import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./services/generationService', () => {
  const draft = {
    id: 'session-contract-test',
    projectId: 'project-test',
    userId: 'user-test',
    prompt: 'Provider contract test',
    workflowType: 'Commercial Promo',
    state: 'Draft',
    steps: [],
    artifacts: [],
    totalCreditsConsumed: 0,
    totalDurationMs: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const completed = {
    ...draft,
    state: 'Completed',
    renderJobId: 'provider-operation-test',
    finalVideoUrl: '/api/v1/generation/video-test',
    steps: [{
      stepName: 'Video Rendering Execution',
      inputPayload: 'Timeline.json',
      outputPayload: '{"status":"Completed"}',
      status: 'Completed',
      durationMs: 100,
      creditsConsumed: 30,
      providerId: 'video-provider-contract-test',
      modelId: 'video-model',
      timestamp: new Date().toISOString(),
    }],
  };
  return {
    generationService: {
      listSessions: vi.fn().mockResolvedValue([]),
      createSession: vi.fn().mockResolvedValue(draft),
      startGeneration: vi.fn().mockImplementation(async (_id, onProgress) => {
        onProgress?.(completed);
        return completed;
      }),
      getSession: vi.fn().mockResolvedValue(completed),
    },
  };
});

import { GenerationScreen } from './components/GenerationScreen';
import { generationService } from './services/generationService';

describe('GenerationScreen', () => {
  it('renders generation wizard screen', async () => {
    render(<GenerationScreen defaultTab="wizard" />);

    expect(screen.getByText('Video Generation Experience')).toBeInTheDocument();
    expect(screen.getByText('AI Video Generation Wizard')).toBeInTheDocument();
    expect(screen.getByText('✨ Generate Video Now')).toBeInTheDocument();
  });

  it('runs generation pipeline wizard and completes video creation', async () => {
    render(<GenerationScreen defaultTab="wizard" />);

    const generateBtn = screen.getByRole('button', { name: /generate video now/i });
    fireEvent.click(generateBtn);
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Pipeline Execution Log')).toBeInTheDocument();
    }, { timeout: 4000 });

    await waitFor(() => {
      expect(screen.getByText('Generation Result Preview')).toBeInTheDocument();
      expect(screen.getByText('📦 Download All Project Artifacts')).toBeInTheDocument();
    }, { timeout: 6000 });

    expect(vi.mocked(generationService.createSession)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(generationService.startGeneration)).toHaveBeenCalledTimes(1);
  });
});
