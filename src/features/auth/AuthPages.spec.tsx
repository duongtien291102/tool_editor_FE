import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { RoleGuard } from './guards/PermissionGuard';
import { AuthProvider } from './AuthProvider';

describe('Auth Feature Components', () => {
  it('renders RegisterPage correctly and triggers navigation', () => {
    const handleLogin = vi.fn();
    render(
      <AuthProvider>
        <RegisterPage onNavigateToLogin={handleLogin} />
      </AuthProvider>,
    );

    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(loginButton);
    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('renders ForgotPasswordPage correctly', () => {
    const handleLogin = vi.fn();
    render(<ForgotPasswordPage onNavigateToLogin={handleLogin} />);

    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
  });

  it('renders children when RoleGuard passes or fallback when not allowed', () => {
    render(
      <AuthProvider>
        <RoleGuard allowedRoles={['Admin']} fallback={<div>Access Denied</div>}>
          <div>Admin Panel</div>
        </RoleGuard>
      </AuthProvider>,
    );

    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });
});
