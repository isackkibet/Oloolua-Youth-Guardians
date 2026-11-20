'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@frontend/components/guardian/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const nextErrors: { email?: string; password?: string } = {};
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) nextErrors.email = 'Enter your email address.';
    else if (cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';
    else if (password.length > 128) nextErrors.password = 'Password is too long.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    try {
      const result = await api<{ error?: string; success?: boolean }>('/api/guardian/auth/login', {
        body: { email: cleanEmail, password, remember },
      });
      if (!result.ok || !result.data?.success) {
        setError(result.data?.error ?? 'Could not sign in. Please try again.');
        return;
      }
      router.replace('/portal');
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate aria-busy={busy}>
      {error && (
        <p role="alert" className="mb-5 flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-forest-900">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            className={`mt-2 w-full border bg-white px-3.5 py-3 text-sm text-charcoal outline-none transition-colors focus:border-forest-700 focus:ring-1 focus:ring-forest-700 ${
              fieldErrors.email ? 'border-red-400' : 'border-forest-900/15'
            }`}
          />
          {fieldErrors.email && (
            <p id="login-email-error" role="alert" className="mt-2 text-xs text-red-700">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="block text-xs font-semibold text-forest-900">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-950">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              maxLength={128}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              className={`w-full border bg-white px-3.5 py-3 pr-11 text-sm text-charcoal outline-none transition-colors focus:border-forest-700 focus:ring-1 focus:ring-forest-700 ${
                fieldErrors.password ? 'border-red-400' : 'border-forest-900/15'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-forest-800/60 hover:text-forest-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="login-password-error" role="alert" className="mt-2 text-xs text-red-700">{fieldErrors.password}</p>
          )}
        </div>

        <label className="flex items-center gap-2.5 text-xs text-forest-900/75">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 accent-forest-800"
          />
          Remember me
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-7 flex w-full items-center justify-center gap-2 bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? 'Signing in...' : 'Sign in to Guardian Hub'}
      </button>
    </form>
  );
}
