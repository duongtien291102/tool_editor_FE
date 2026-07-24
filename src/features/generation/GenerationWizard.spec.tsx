import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GenerationScreen } from './components/GenerationScreen';

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

    await waitFor(() => {
      expect(screen.getByText('Pipeline Execution Log')).toBeInTheDocument();
    }, { timeout: 4000 });

    await waitFor(() => {
      expect(screen.getByText('Generation Result Preview')).toBeInTheDocument();
      expect(screen.getByText('📦 Download All Project Artifacts')).toBeInTheDocument();
    }, { timeout: 6000 });
  });
});
