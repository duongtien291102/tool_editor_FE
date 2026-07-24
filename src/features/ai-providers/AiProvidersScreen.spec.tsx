import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AiProvidersScreen } from './components/AiProvidersScreen';
import { HealthBadge } from './components/HealthBadge';
import { CostBadge } from './components/CostBadge';

describe('AI Providers Feature Module', () => {
  it('renders HealthBadge with correct styles for Healthy', () => {
    render(<HealthBadge status="Healthy" />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('renders HealthBadge with correct text for Disabled', () => {
    render(<HealthBadge status="Disabled" />);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('renders CostBadge with formatted price', () => {
    render(
      <CostBadge
        costProfile={{
          costPerImage: 0.04,
          costPerVideoMinute: 0.85,
          costPerAudioMinute: 0.0,
          costPer1kTokens: 0.002,
        }}
      />,
    );
    expect(screen.getByText('$0.85/min')).toBeInTheDocument();
  });

  it('renders AiProvidersScreen header title', async () => {
    render(<AiProvidersScreen />);
    expect(await screen.findByText('AI Providers')).toBeInTheDocument();
  });
});
