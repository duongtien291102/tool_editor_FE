import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      // Simulate/call reset API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
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
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email to receive password reset instructions.
        </p>

        {submitted ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="rounded-md bg-primary/10 p-4 text-primary text-sm font-medium">
              If an account exists with {email}, reset instructions have been sent.
            </div>
            <Button className="w-full" onClick={onNavigateToLogin}>
              Return to Sign in
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
              Email Address
              <input
                type="email"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
              />
            </label>

            <Button className="w-full" type="submit" loading={submitting}>
              Send Reset Link
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Remembered your password?{' '}
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
