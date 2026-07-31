import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommercialScreen } from './components/CommercialScreen';

describe('CommercialScreen', () => {
  it('renders commercial screen title and tabs', async () => {
    render(<CommercialScreen defaultTab="profile" />);

    await waitFor(() => {
      expect(screen.getByText(/Commercial Hub|Trung tâm Thương mại/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    expect(screen.getByText('engineer@aistudio.local')).toBeInTheDocument();
  });

  it('switches between commercial tabs correctly', async () => {
    render(<CommercialScreen defaultTab="profile" />);

    await waitFor(() => {
      expect(screen.getByText(/Commercial Hub|Trung tâm Thương mại/i)).toBeInTheDocument();
    });

    const subscriptionTabBtn = screen.getByRole('button', { name: /subscription|gói đăng ký/i });
    fireEvent.click(subscriptionTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Plan Policy & System Limits|Chính sách gói/i)).toBeInTheDocument();
    });

    const pricingTabBtn = screen.getByRole('button', { name: /pricing|bảng giá/i });
    fireEvent.click(pricingTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Choose Your SaaS Plan|Chọn gói/i)).toBeInTheDocument();
    });
  });
});
