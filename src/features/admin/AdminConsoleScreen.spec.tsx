import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminConsoleScreen } from './components/AdminConsoleScreen';

describe('AdminConsoleScreen', () => {
  it('renders production admin console dashboard', async () => {
    render(<AdminConsoleScreen defaultTab="metrics" />);

    expect(screen.getByText('Production Admin Console')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Active Users')).toBeInTheDocument();
    });
  });

  it('switches tabs and toggles feature flags', async () => {
    render(<AdminConsoleScreen defaultTab="flags" />);

    await waitFor(() => {
      expect(screen.getByText('Dynamic Feature Flags System')).toBeInTheDocument();
      expect(screen.getByText('Enable OpenAI Provider')).toBeInTheDocument();
    });

    const toggleBtn = screen.getAllByRole('button', { name: /enabled/i })[0];
    fireEvent.click(toggleBtn);
  });
});
