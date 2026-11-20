'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import AuthShell from '@frontend/components/auth/AuthShell';
import { api, type SessionInfo } from '@frontend/components/guardian/api';
import { GuardianAuthProvider, useGuardianAuth } from '@frontend/components/guardian/PrivyAuth';
import LoginForm from './LoginForm';

export default function LoginScreen() {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);

  const loadSession = useCallback(async () => {
    const result = await api<SessionInfo>('/api/guardian/auth/session');
    const next = result.data ?? { authConfigured: false, devLogin: false, aiEnabled: false, signedIn: false, error: 'Guardian is unavailable.' };
    setSession(next);
    if (next.signedIn) {
      router.replace('/portal');
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  return (
    <GuardianAuthProvider needsSession={!!session && !session.signedIn} onSessionCreated={loadSession}>
      <LoginContent session={session} />
    </GuardianAuthProvider>
  );
}

function LoginContent({ session }: { session: SessionInfo | null }) {
  const auth = useGuardianAuth();

  return (
    <AuthShell
      title="Welcome back, Guardian"
      description="Sign in to manage native seedling records, restoration activity and nursery work in one secure place."
    >
      {auth.error && (
        <p role="alert" className="mb-5 flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {auth.error}
        </p>
      )}

      {!session ? (
        <p role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-forest-900/70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Preparing secure sign in...
        </p>
      ) : auth.linking ? (
        <p role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-forest-900/70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Completing sign in...
        </p>
      ) : (
        <>
          {session?.authConfigured === true && session.privy === true && auth.available && (
            <div className="space-y-2">
              <button type="button" onClick={auth.signInWithGoogle} disabled={!auth.ready} className="flex w-full items-center justify-center gap-2 border border-forest-900/15 bg-white px-4 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-50 disabled:opacity-50">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
                Continue with Google
              </button>
              <button type="button" onClick={auth.signInWithEmail} disabled={!auth.ready} className="w-full border border-forest-900/15 bg-white px-4 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-50 disabled:opacity-50">
                Continue with email code
              </button>
            </div>
          )}

          {session?.passwordAuth === true && (
            <>
              {session?.authConfigured === true && session.privy === true && auth.available && (
                <div className="my-6 flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-forest-900/10" />
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-forest-900/40">or</span>
                  <span className="h-px flex-1 bg-forest-900/10" />
                </div>
              )}
              <LoginForm />
            </>
          )}

          {session && session.authConfigured !== true && (
            <p role="alert" className="border border-forest-900/10 bg-forest-50 px-3 py-3 text-sm text-forest-900">
              Sign-in is not configured on this deployment.
              {session.authConfigMissing?.length ? (
                <>
                  {' '}Missing: {session.authConfigMissing.join(', ')}.
                  {session.authConfigMissing.some((item) => item.startsWith('GUARDIAN_SESSION_SECRET')) && (
                    <> Add a secret of at least 32 characters in Vercel under Project Settings &gt; Environment Variables for this deployment, then redeploy.</>
                  )}
                  {session.authConfigMissing.includes('GUARDIAN_PASSWORD_AUTH=true or Privy credentials') && (
                    <> Enable email/password sign-in with GUARDIAN_PASSWORD_AUTH=true, or configure Privy for Google sign-in.</>
                  )}
                </>
              ) : ' Please contact a Guardian Admin.'}
            </p>
          )}

          {session?.devLogin === true && (
            <DevLoginForm onSignedIn={() => window.location.assign('/portal')} />
          )}
        </>
      )}
    </AuthShell>
  );
}

function DevLoginForm({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api('/api/guardian/auth/dev', { body: { email: email.trim().toLowerCase(), name: email.split('@')[0] } });
      if (result.ok) onSignedIn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-7 border-t border-forest-900/10 pt-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-forest-900/50">Development sign-in</p>
      <label htmlFor="dev-email" className="mt-3 block text-xs font-semibold text-forest-900">
        Email address
        <input
          id="dev-email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full border border-forest-900/15 bg-white px-3.5 py-3 text-sm text-charcoal outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
        />
      </label>
      <button disabled={busy} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-forest-700 underline underline-offset-4 disabled:opacity-50">
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        Sign in locally
      </button>
    </form>
  );
}
