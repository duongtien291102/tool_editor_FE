import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from './AuthProvider';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (register) {
        await register(email.trim(), password, fullName.trim());
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-7 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          AiVideoStudio
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started with AI Video Studio platform.
        </p>

        {success ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="rounded-md bg-emerald-500/10 p-4 text-emerald-500 text-sm font-medium">
              Account created successfully!
            </div>
            <Button className="w-full" onClick={onNavigateToLogin}>
              Proceed to Sign in
            </Button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              void submit(event);
            }}
          >
            <label className="block text-sm font-medium">
              Full Name
              <input
                type="text"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Email Address
              <input
                type="email"
                autoComplete="email"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                autoComplete="new-password"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-destructive font-medium">
                {error}
              </p>
            )}

            <Button className="w-full" type="submit" loading={submitting}>
              Create Account
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                className="text-primary font-medium hover:underline focus:outline-none"
                onClick={onNavigateToLogin}
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
};
