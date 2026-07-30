import React, { useState } from 'react';
import { Clapperboard, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Foundation';
import { useAuth } from './AuthProvider';

export const LoginPage: React.FC = () => {
  const { login, register, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await login(username.trim(), password);
    } catch {
      // AuthProvider exposes the error state
    } finally {
      setSubmitting(false);
    }
  };

  const submitRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (register) {
        // Registration automatically assigns the default 'User' role
        await register(email.trim(), password, fullName.trim() || username.trim());
      }
      setRegisterSuccess(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Tạo tài khoản thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left Hero Side */}
      <section className="hidden border-r border-border bg-[#101416] p-12 lg:flex lg:flex-col lg:justify-between">
        <Brand />
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium text-primary">
            Sáng tạo đỉnh cao, hệ thống bền vững.
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-100">
            Xây dựng kịch bản. Định hình từng bản dựng.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
            Nền tảng studio ổn định cho dự án, kho tài nguyên, timeline, tác vụ và sản phẩm hoàn chỉnh.
          </p>
        </div>
        <p className="text-xs text-zinc-500">Môi trường sản xuất AI Video Studio</p>
      </section>

      {/* Right Form Side */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-6 grid grid-cols-2 rounded-lg border border-border bg-card p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setRegisterSuccess(false);
                setFormError(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-2 transition-all ${
                mode === 'login'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn className="size-3.5" /> Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegisterSuccess(false);
                setFormError(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-2 transition-all ${
                mode === 'register'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="size-3.5" /> Đăng ký tài khoản
            </button>
          </div>

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={submitLogin}>
              <h2 className="text-2xl font-semibold tracking-tight">Đăng nhập vào AI Studio</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Nhập thông tin tài khoản để truy cập không gian làm việc.
              </p>

              <label className="mt-6 block text-sm font-medium">
                Tên đăng nhập / Username
                <Input
                  autoComplete="username"
                  className="mt-1.5"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </label>

              <label className="mt-4 block text-sm font-medium">
                Mật khẩu
                <Input
                  type="password"
                  autoComplete="current-password"
                  className="mt-1.5"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>

              {(error || formError) && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error || formError}
                </p>
              )}

              <Button className="mt-6 w-full" type="submit" loading={submitting}>
                Đăng nhập
              </Button>
            </form>
          ) : (
            /* Register Form */
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Đăng ký tài khoản mới</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Mọi tài khoản tạo mới sẽ mặc định có quyền người dùng (User).
              </p>

              {registerSuccess ? (
                <div className="mt-6 space-y-4 text-center">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
                    🎉 Đã tạo tài khoản người dùng thành công! Bạn có thể đăng nhập ngay.
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMode('login');
                      setRegisterSuccess(false);
                    }}
                  >
                    Chuyển sang Đăng nhập
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitRegister} className="mt-5 space-y-4">
                  <label className="block text-sm font-medium">
                    Họ và tên
                    <Input
                      type="text"
                      className="mt-1.5"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Email
                    <Input
                      type="email"
                      autoComplete="email"
                      className="mt-1.5"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Mật khẩu
                    <Input
                      type="password"
                      autoComplete="new-password"
                      className="mt-1.5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      required
                    />
                  </label>

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                      {formError}
                    </p>
                  )}

                  <Button className="mt-6 w-full" type="submit" loading={submitting}>
                    Tạo tài khoản User
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
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
