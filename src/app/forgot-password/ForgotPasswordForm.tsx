'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { api } from '@frontend/components/guardian/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setDevLink('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setBusy(true);
    try {
      const result = await api<{ error?: string; message?: string; devLink?: string }>('/api/guardian/auth/forgot-password', {
        body: { email: cleanEmail },
      });
      if (!result.ok) {
        setError(result.data?.error ?? 'Could not send the reset link. Please try again.');
        return;
      }
      setMessage(result.data?.message ?? 'If an account exists, a reset link has been sent.');
      if (result.data?.devLink) setDevLink(result.data.devLink);
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

      {message && (
        <div className="mb-5 border border-forest-900/15 bg-forest-50 px-3 py-3">
          <p role="status" className="flex items-start gap-2 text-xs leading-relaxed text-forest-900">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" aria-hidden="true" />
            {message}
          </p>
          {devLink && (
            <a href={devLink} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-forest-700 underline underline-offset-4">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Open reset link
            </a>
          )}
        </div>
      )}

      <label htmlFor="forgot-email" className="block text-xs font-semibold text-forest-900">
        Email address
      </label>
      <input
        id="forgot-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        maxLength={254}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={!!error && !message}
        aria-describedby={error && !message ? 'forgot-email-error' : undefined}
        className={`mt-2 w-full border bg-white px-3.5 py-3 text-sm text-charcoal outline-none transition-colors focus:border-forest-700 focus:ring-1 focus:ring-forest-700 ${
          error && !message ? 'border-red-400' : 'border-forest-900/15'
        }`}
      />
      {error && !message && (
        <p id="forgot-email-error" role="alert" className="mt-2 text-xs text-red-700">{error}</p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-forest-900/60">
        Enter your member email. If an account exists, we will send a single-use link valid for 30 minutes.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="mt-7 flex w-full items-center justify-center gap-2 bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? 'Sending link...' : 'Send reset link'}
      </button>

      <Link href="/login" className="mt-5 inline-flex text-xs font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-950">
        Back to sign in
      </Link>
    </form>
  );
}
