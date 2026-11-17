'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import GuardianChat from '@/components/guardian/GuardianChat';
import { AuditPanel, DiaryPanel, NurseryPanel, RecordPanel, TeamPanel, VerifyPanel } from '@/components/guardian/HubPanels';
import { api, type Quota, type SessionInfo } from '@/components/guardian/api';
import { GuardianAuthProvider, useGuardianAuth } from '@/components/guardian/PrivyAuth';
import { ROLE_LABELS, can, type Capability, type Role } from '@/lib/guardian/constants';
import {
  Bot, Sprout, BookOpen, PlusCircle, ShieldCheck, ScrollText, Users, Lock, LogOut, Loader2, Clock, AlertCircle, Calendar,
} from 'lucide-react';

const TABS: { id: string; label: string; icon: typeof Bot; need: Capability }[] = [
  { id: 'ai', label: 'AI Guardian', icon: Bot, need: 'read' },
  { id: 'nursery', label: 'Nursery', icon: Sprout, need: 'read' },
  { id: 'diary', label: 'Keeper Diary', icon: BookOpen, need: 'read' },
  { id: 'record', label: 'Record', icon: PlusCircle, need: 'record' },
  { id: 'verify', label: 'Verification', icon: ShieldCheck, need: 'verify' },
  { id: 'audit', label: 'Audit', icon: ScrollText, need: 'viewAudit' },
  { id: 'team', label: 'Team', icon: Users, need: 'manageUsers' },
];

const EVENTS = [
  { date: 'October 15, 2026', title: 'Jaza Miti Planting Day', text: 'We will plant Croton and Markhamia along the Oloolua stream.' },
  { date: 'November 2, 2026', title: 'Art in Nature Mural Festival', text: 'Local youth paint an environmental mural with wildlife experts.' },
  { date: 'December 10, 2026', title: 'Honey Harvest Workshop', text: 'Learn about hives, honey and forest protection.' },
];

export default function GuardianHubPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [tab, setTabState] = useState('ai');
  const [quota, setQuota] = useState<Quota | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSession = useCallback(async () => {
    const r = await api<SessionInfo>('/api/guardian/auth/session');
    setSession(r.data ?? { authConfigured: false, devLogin: false, aiEnabled: false, signedIn: false, error: 'Guardian is unavailable.' });
    setQuota(r.data?.quota ?? null);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('record') ? 'record' : params.get('tab');
    if (requested && TABS.some((t) => t.id === requested)) setTabState(requested);
    void loadSession();
  }, [loadSession]);

  const setTab = (id: string) => {
    setTabState(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    url.searchParams.delete('record');
    window.history.replaceState(null, '', url);
  };

  const role = (session?.role ?? null) as Role | null;
  const tabs = TABS.filter((t) => can(role, t.need));
  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'ai';
  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <GuardianAuthProvider needsSession={!!session && !session.signedIn} onSessionCreated={loadSession}>
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col">
      <Navigation />

      {!session && (
        <div className="flex-1 flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-[#285b3c]" aria-label="Loading" /></div>
      )}

      {session && !session.signedIn && <SignInGate session={session} onSignedIn={loadSession} onGuest={() => { setTab('record'); void loadSession(); }} />}

      {session?.signedIn && !role && (
        <div className="flex-1 flex items-center justify-center p-4 py-20">
          <div className="max-w-md w-full p-8 bg-white border border-[#173d2b]/12 text-center space-y-3">
            <Clock className="w-10 h-10 mx-auto text-[#c3a66b]" strokeWidth={1.4} />
            <h1 className="font-display text-xl text-[#173d2b]">
              {session.membershipStatus === 'suspended' ? 'Access suspended' : 'Waiting for approval'}
            </h1>
            <p className="text-sm text-[#3f4a42]/80">
              {session.membershipStatus === 'suspended'
                ? 'Your access to the Guardian Hub has been suspended. Please contact a Guardian Admin.'
                : `You are signed in as ${session.user?.email ?? session.user?.name}. Being signed in does not give access to Guardian data yet: a Guardian Admin must approve your account and choose your role.`}
            </p>
            <SignOutButton onDone={() => { setQuota(null); void loadSession(); }} className="px-4 py-2 rounded-full border border-[#173d2b]/20 hover:bg-[#173d2b]/5 text-sm font-semibold inline-flex items-center gap-2 text-[#173d2b]" />
          </div>
        </div>
      )}

      {session?.signedIn && role && session.user && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="eyebrow">Guardian Hub</span>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl text-[#173d2b]">Guardian Hub</h1>
              <p className="mt-2 text-sm text-[#3f4a42]/75">
                Oloolua Youth Guardians · Turako Nursery · Signed in as <span className="text-[#173d2b] font-semibold">{session.user.name}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#eaf1ea] text-[#285b3c] border border-[#285b3c]/20 text-[0.62rem] font-bold uppercase tracking-[0.1em]">{session.user.guest ? 'Visitor' : ROLE_LABELS[role]}</span>
              </p>
              {session.user.guest && (
                <p className="text-[11px] text-[#3f4a42]/60 mt-1">Your records wait for review before they count.</p>
              )}
            </div>
            <SignOutButton onDone={() => { setQuota(null); void loadSession(); }} className="self-start sm:self-auto px-3.5 py-2 rounded-full border border-[#173d2b]/20 hover:bg-[#173d2b]/5 text-xs font-semibold inline-flex items-center gap-1.5 text-[#173d2b]" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 dark-scroll" role="tablist" aria-label="Guardian Hub sections">
            {tabs.map((t) => {
              const Icon = t.icon;
              const on = activeTab === t.id;
              return (
                <button key={t.id} role="tab" aria-selected={on} onClick={() => setTab(t.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${on ? 'bg-[#173d2b] text-[#f7f6f0] border border-[#173d2b]' : 'bg-transparent text-[#285b3c] hover:bg-[#173d2b]/5 border border-[#173d2b]/15'}`}>
                  <Icon className={`w-4 h-4 ${on ? 'text-[#c3a66b]' : ''}`} /> {t.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'ai' && (
            <>
              {!session.aiEnabled && (
                <p className="text-xs text-[#7a5f22] bg-[#fbf3e2] border border-[#c3a66b]/45 rounded-lg px-3 py-2 flex items-start gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" />
                  AI conversation is not connected. You can still view records, search the Keeper Diary and record activities.
                </p>
              )}
              <GuardianChat role={role} firstName={session.user.name.split(' ')[0]} quota={quota} onQuota={setQuota} onRecordSaved={bump} />
            </>
          )}
          {activeTab === 'nursery' && <NurseryPanel refreshKey={refreshKey} />}
          {activeTab === 'diary' && <DiaryPanel refreshKey={refreshKey} />}
          {activeTab === 'record' && <RecordPanel onSaved={bump} />}
          {activeTab === 'verify' && <VerifyPanel refreshKey={refreshKey} onChanged={bump} />}
          {activeTab === 'audit' && <AuditPanel refreshKey={refreshKey} />}
          {activeTab === 'team' && <TeamPanel myUserId={session.user.id} />}
        </div>
      )}
    </div>
    </GuardianAuthProvider>
  );
}

/** Ends both the Guardian session and the Privy session. */
function SignOutButton({ onDone, className }: { onDone: () => void; className: string }) {
  const auth = useGuardianAuth();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await auth.signOutOfPrivy();
        await api('/api/guardian/auth/session', { method: 'DELETE' });
        setBusy(false);
        onDone();
      }}
      className={className}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />} Sign out
    </button>
  );
}

function SignInGate({ session, onSignedIn, onGuest }: { session: SessionInfo; onSignedIn: () => void; onGuest: () => void }) {
  const auth = useGuardianAuth();
  const [devEmail, setDevEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestError, setGuestError] = useState('');
  const startGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestBusy(true);
    setGuestError('');
    const r = await api<{ error?: string }>('/api/guardian/auth/guest', { body: { name: guestName } });
    setGuestBusy(false);
    if (r.ok) onGuest();
    else setGuestError(r.data?.error ?? 'Could not start. Please try again.');
  };
  const devLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await api('/api/guardian/auth/dev', { body: { email: devEmail, name: devEmail.split('@')[0] } });
    if (r.ok) onSignedIn();
  };
  const signInReady = session.authConfigured && auth.available;

  return (
    <div className="flex-1 px-4 py-12 sm:py-16">
      <div className="max-w-md mx-auto p-8 bg-white border border-[#173d2b]/12 space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-[#eaf1ea] border border-[#285b3c]/20 flex items-center justify-center text-[#285b3c] mx-auto"><Lock className="w-7 h-7" strokeWidth={1.4} /></div>
        <div className="space-y-1.5">
          <span className="eyebrow justify-center">Sign In</span>
          <h1 className="font-display text-2xl text-[#173d2b]">AI Guardian</h1>
          <p className="text-sm text-[#3f4a42]/80">{session.openRecording ? 'Type your name to record an activity.' : 'Sign in to ask about the nursery, search the Keeper Diary and record activities.'}</p>
        </div>

        {session.openRecording && (
          <form onSubmit={startGuest} className="space-y-2.5 text-left">
            <label htmlFor="guest-name" className="block text-sm font-semibold text-[#173d2b]">Record an activity</label>
            <input id="guest-name" required minLength={2} maxLength={60} autoComplete="name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name"
              className="w-full bg-[#f7f6f0] border border-[#173d2b]/15 rounded-lg px-3 py-3 text-sm text-[#252b27] placeholder:text-[#252b27]/35 focus:outline-none focus:border-[#285b3c]" />
            {guestError && <p role="alert" className="text-xs text-red-700">{guestError}</p>}
            <button disabled={guestBusy} className="w-full py-3 rounded-full bg-[#173d2b] hover:bg-[#285b3c] disabled:opacity-60 text-[#f7f6f0] font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
              {guestBusy && <Loader2 className="w-4 h-4 animate-spin" />} Start recording
            </button>
            <p className="text-[11px] text-[#3f4a42]/60">No account needed. The Guardian team checks your records before they count.</p>
          </form>
        )}

        {auth.error && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{auth.error}</p>}

        {auth.linking ? (
          <p className="flex items-center justify-center gap-2 text-sm text-[#3f4a42]"><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</p>
        ) : signInReady ? (
          <div className="space-y-2.5">
            <button type="button" onClick={auth.signInWithGoogle} disabled={!auth.ready}
              className="w-full py-3 rounded-full bg-[#173d2b] hover:bg-[#285b3c] disabled:opacity-60 text-[#f7f6f0] font-semibold text-sm flex items-center justify-center gap-3 transition-colors">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
              Continue with Google
            </button>
            <button type="button" onClick={auth.signInWithEmail} disabled={!auth.ready}
              className="w-full py-3 rounded-full border border-[#173d2b]/25 hover:bg-[#173d2b]/5 disabled:opacity-60 text-[#173d2b] font-semibold text-sm transition-colors">
              Continue with email code
            </button>
          </div>
        ) : session.openRecording ? null : (
          <p className="text-xs text-[#7a5f22] bg-[#fbf3e2] border border-[#c3a66b]/45 rounded-lg px-3 py-2">Sign-in is not available yet. Please check back soon.</p>
        )}
        {(signInReady || !session.openRecording) && <p className="text-[11px] text-[#3f4a42]/60">Sign in to continue. New accounts need approval from a Guardian Admin.</p>}

        {session.devLogin && (
          <form onSubmit={devLogin} className="pt-3 border-t border-[#173d2b]/10 space-y-2 text-left">
            <p className="text-[11px] text-[#7a5f22] font-semibold">Development sign-in</p>
            <div className="flex gap-2">
              <input type="email" required value={devEmail} onChange={(e) => setDevEmail(e.target.value)} placeholder="test email" className="flex-1 bg-[#f7f6f0] border border-[#173d2b]/15 rounded-lg px-3 py-2 text-xs text-[#252b27] focus:outline-none focus:border-[#285b3c]" />
              <button className="px-3 rounded-full bg-[#173d2b] hover:bg-[#285b3c] text-[#f7f6f0] text-xs font-semibold">Sign in</button>
            </div>
          </form>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-14 space-y-4">
        <h2 className="font-display text-xl text-[#173d2b] flex items-center gap-2"><Calendar className="w-5 h-5 text-[#c3a66b]" strokeWidth={1.5} /> Upcoming events</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {EVENTS.map((e) => (
            <div key={e.title} className="p-5 bg-white border border-[#173d2b]/10 border-t-2 border-t-[#c3a66b] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#285b3c]">{e.date}</span>
              <h3 className="font-display text-[1.05rem] text-[#173d2b] leading-snug">{e.title}</h3>
              <p className="text-xs text-[#3f4a42]/70 leading-relaxed">{e.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#3f4a42]/65">Want to take part or support the nursery? <Link href="/#contact" className="text-[#285b3c] underline underline-offset-4 decoration-[#c3a66b]/50 hover:text-[#173d2b]">Contact us</Link> or <Link href="/#donate" className="text-[#285b3c] underline underline-offset-4 decoration-[#c3a66b]/50 hover:text-[#173d2b]">donate via M-Pesa</Link>.</p>
      </div>
    </div>
  );
}
