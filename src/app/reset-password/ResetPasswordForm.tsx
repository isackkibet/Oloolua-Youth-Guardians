'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { api } from '@frontend/components/guardian/api';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const r = await api<{ error?: string; message?: string }>('/api/guardian/auth/reset-password', {
        body: { token, password, confirmPassword },
      });
      if (r.ok) {
        setPassword('');
        setConfirmPassword('');
        setDone(true);
      } else {
        setError(r.data?.error ?? 'Could not update the password. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5 py-12">
      <div className="w-full max-w-md border border-forest-900/10 bg-white p-6">
        <div className="flex h-11 w-11 items-center justify-center bg-forest-50 text-forest-700">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-900/45">Guardian Hub</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-forest-900">Set a new password</h1>

        {done ? (
          <div className="mt-6">
            <p className="flex items-start gap-2 text-sm text-forest-800" role="status">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />
              Password updated. Sign in with your new password.
            </p>
            <Link href="/login" className="mt-5 inline-flex text-xs font-semibold text-forest-700 underline underline-offset-4">
              Go to sign in
            </Link>
          </div>
        ) : !token ? (
          <div className="mt-6">
            <p className="text-sm text-forest-800" role="alert">This reset link is missing its token. Request a new link from the sign-in page.</p>
            <Link href="/login" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-forest-700 underline underline-offset-4">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block text-xs font-semibold text-forest-900" htmlFor="new-password">
              New password
              <input
                id="new-password"
                className="mt-1 w-full border border-forest-900/15 bg-white px-3 py-2.5 text-sm text-charcoal focus:border-forest-700 focus:outline-none"
                required
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-forest-900" htmlFor="confirm-new-password">
              Confirm new password
              <input
                id="confirm-new-password"
                className="mt-1 w-full border border-forest-900/15 bg-white px-3 py-2.5 text-sm text-charcoal focus:border-forest-700 focus:outline-none"
                required
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            <p className="text-xs text-forest-900/60">Use at least 10 characters. Both passwords must match.</p>
            {error && <p className="border border-forest-900/10 bg-forest-50 px-3 py-2 text-xs text-forest-800" role="alert">{error}</p>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 bg-forest-900 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Set new password
            </button>
            <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-forest-700 underline underline-offset-4">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
