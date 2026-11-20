'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@frontend/components/guardian/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]{1,59}$/u;
const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 128;

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const updateField = (field: keyof FieldErrors, value: string) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setCreated(false);

    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim().toLowerCase();
    const nextErrors: FieldErrors = {};
    if (!NAME_RE.test(cleanName)) nextErrors.name = 'Enter your name (2 to 60 characters).';
    if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      nextErrors.password = `Use between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`;
    }
    if (confirmPassword !== password) nextErrors.confirmPassword = 'The passwords do not match.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    try {
      const result = await api<{ error?: string; success?: boolean }>('/api/guardian/auth/register', {
        body: { name: cleanName, email: cleanEmail, password, confirmPassword },
      });
      if (!result.ok || !result.data?.success) {
        setError(result.data?.error ?? 'Could not create the account. Please try again.');
        return;
      }
      setCreated(true);
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

      {created && (
        <p role="status" className="mb-5 flex items-start gap-2 border border-forest-900/15 bg-forest-50 px-3 py-2.5 text-xs text-forest-900">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" aria-hidden="true" />
          Account created. Opening your Guardian Hub status...
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-xs font-semibold text-forest-900">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            maxLength={60}
            value={name}
            onChange={(event) => updateField('name', event.target.value)}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
            className={`mt-2 w-full border bg-white px-3.5 py-3 text-sm text-charcoal outline-none transition-colors focus:border-forest-700 focus:ring-1 focus:ring-forest-700 ${
              fieldErrors.name ? 'border-red-400' : 'border-forest-900/15'
            }`}
          />
          {fieldErrors.name && (
            <p id="register-name-error" role="alert" className="mt-2 text-xs text-red-700">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-email" className="block text-xs font-semibold text-forest-900">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
            className={`mt-2 w-full border bg-white px-3.5 py-3 text-sm text-charcoal outline-none transition-colors focus:border-forest-700 focus:ring-1 focus:ring-forest-700 ${
              fieldErrors.email ? 'border-red-400' : 'border-forest-900/15'
            }`}
          />
          {fieldErrors.email && (
            <p id="register-email-error" role="alert" className="mt-2 text-xs text-red-700">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-password" className="block text-xs font-semibold text-forest-900">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => updateField('password', event.target.value)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'register-password-error' : 'register-password-help'}
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
          {fieldErrors.password ? (
            <p id="register-password-error" role="alert" className="mt-2 text-xs text-red-700">{fieldErrors.password}</p>
          ) : (
            <p id="register-password-help" className="mt-2 text-xs text-forest-900/60">
              Use at least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-forest-900">
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
            className={`mt-2 w-full border bg-white px-3.5 py-3 text-sm text-charcoal outline-none transition-colors focus:border-forest-700 focus:ring-1 focus:ring-forest-700 ${
              fieldErrors.confirmPassword ? 'border-red-400' : 'border-forest-900/15'
            }`}
          />
          {fieldErrors.confirmPassword && (
            <p id="register-confirm-password-error" role="alert" className="mt-2 text-xs text-red-700">{fieldErrors.confirmPassword}</p>
          )}
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-forest-900/60">
        Your account is active immediately with all Guardian Hub tools except user management.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="mt-7 flex w-full items-center justify-center gap-2 bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? 'Creating account...' : 'Create account'}
      </button>

      <Link href="/login" className="mt-5 inline-flex text-xs font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-950">
        Already have an account? Sign in
      </Link>
    </form>
  );
}
