import React, { useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Foundation';
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
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden border-r border-border bg-[#101416] p-12 lg:flex lg:flex-col lg:justify-between">
        <Brand />
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium text-primary">
            Creative work, one durable system.
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-100">
            Build the story. Shape the cut.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
            A stable studio foundation for projects, assets, timelines, jobs and final delivery.
          </p>
        </div>
        <p className="text-xs text-zinc-500">AI Video Studio production environment</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <form
          className="w-full max-w-sm"
          onSubmit={(event) => {
            void submit(event);
          }}
        >
          <div className="mb-9 lg:hidden">
            <Brand />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in to AI Studio</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your account to continue to the production workspace.
          </p>
          <label className="mt-8 block text-sm font-medium">
            Username
            <Input
              autoComplete="username"
              className="mt-2"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <Input
              type="password"
              autoComplete="current-password"
              className="mt-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button className="mt-6 w-full" type="submit" loading={submitting}>
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
};

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Clapperboard className="size-4" />
      </div>
      <span className="font-semibold tracking-tight">AI Studio</span>
    </div>
  );
}
