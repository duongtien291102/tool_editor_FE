import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminConsoleScreen } from './components/AdminConsoleScreen';

describe('AdminConsoleScreen', () => {
  it('renders production admin console dashboard', async () => {
    render(<AdminConsoleScreen defaultTab="metrics" />);

    expect(screen.getByText(/Bảng điều khiển Quản trị|Production Admin Console/i)).toBeInTheDocument();
  });

  it('switches tabs and toggles feature flags', async () => {
    render(<AdminConsoleScreen defaultTab="flags" />);

    await waitFor(() => {
      expect(screen.getByText('Dynamic Feature Flags System')).toBeInTheDocument();
      expect(screen.getByText('Enable OpenAI Provider')).toBeInTheDocument();
    });

    const toggleBtn = screen.getAllByRole('button', { name: /ENABLED/i })[0];
    fireEvent.click(toggleBtn);
  });
});
