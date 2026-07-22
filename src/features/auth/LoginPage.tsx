import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from './AuthProvider';

export const LoginPage: React.FC = () => {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch {
      // The provider exposes the normalized server error for the form.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          AiVideoStudio
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect to your production workspace.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            void submit(event);
          }}
        >
          <label className="block text-sm font-medium">
            Username
            <input
              autoComplete="username"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button className="w-full" type="submit" loading={submitting}>
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
};
