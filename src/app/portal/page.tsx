'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertCircle, ArrowLeft, Bot, BookOpen, ClipboardList, Clock, LayoutDashboard, Loader2, Lock, LogOut,
  Library, Mail, Menu, PlusCircle, ScrollText, ShieldCheck, Sprout, Users, X,
} from 'lucide-react';
import { api, type Quota, type SessionInfo } from '@frontend/components/guardian/api';
import { GuardianAuthProvider, useGuardianAuth } from '@frontend/components/guardian/PrivyAuth';
import { ROLE_LABELS, can, type Capability, type Role } from '@shared/guardian/constants';
import './portal.css';

const PanelLoading = () => (
  <div className="hub-empty" aria-live="polite">
    <Loader2 className="h-4 w-4 animate-spin text-forest-700" />
    <span className="hub-empty-note">Loading section...</span>
  </div>
);

const GuardianChat = dynamic(() => import('@frontend/components/guardian/GuardianChat'), { loading: PanelLoading });
const OverviewPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.OverviewPanel), { loading: PanelLoading });
const NurseryPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.NurseryPanel), { loading: PanelLoading });
const RecordsPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.RecordsPanel), { loading: PanelLoading });
const DiaryPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.DiaryPanel), { loading: PanelLoading });
const KnowledgePanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.KnowledgePanel), { loading: PanelLoading });
const RecordPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.RecordPanel), { loading: PanelLoading });
const VerifyPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.VerifyPanel), { loading: PanelLoading });
const AuditPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.AuditPanel), { loading: PanelLoading });
const TeamPanel = dynamic(() => import('@frontend/components/guardian/HubPanels').then((m) => m.TeamPanel), { loading: PanelLoading });

type HubTab = {
  id: string;
  label: string;
  icon: typeof Bot;
  need: Capability;
  group: 'Workspace' | 'Actions' | 'Administration';
};

const TABS: HubTab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, need: 'read', group: 'Workspace' },
  { id: 'nursery', label: 'Nursery', icon: Sprout, need: 'read', group: 'Workspace' },
  { id: 'records', label: 'Activity records', icon: ClipboardList, need: 'read', group: 'Workspace' },
  { id: 'diary', label: 'Keeper Diary', icon: BookOpen, need: 'read', group: 'Workspace' },
  { id: 'knowledge', label: 'Knowledge', icon: Library, need: 'read', group: 'Workspace' },
  { id: 'ai', label: 'AI Guardian', icon: Bot, need: 'read', group: 'Workspace' },
  { id: 'record', label: 'New record', icon: PlusCircle, need: 'record', group: 'Actions' },
  { id: 'verify', label: 'Verification', icon: ShieldCheck, need: 'verify', group: 'Administration' },
  { id: 'audit', label: 'Audit trail', icon: ScrollText, need: 'viewAudit', group: 'Administration' },
  { id: 'team', label: 'Team', icon: Users, need: 'manageUsers', group: 'Administration' },
];

const GROUPS: HubTab['group'][] = ['Workspace', 'Actions', 'Administration'];

export default function GuardianHubPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [tab, setTabState] = useState('overview');
  const [quota, setQuota] = useState<Quota | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const setTab = (id: string) => {
    setTabState(id);
    setMenuOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    url.searchParams.delete('record');
    window.history.replaceState(null, '', url);
  };

  const role = (session?.role ?? null) as Role | null;
  const tabs = TABS.filter((t) => can(role, t.need));
  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'overview';
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const bump = () => setRefreshKey((k) => k + 1);
  const displayName = session?.user?.name?.trim() || 'Member';
  const initials = displayName.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'OY';

  const navButton = (t: HubTab, mobile = false) => {
    const Icon = t.icon;
    const isActive = activeTab === t.id;
    return (
      <button
        key={`${mobile ? 'm' : 'd'}-${t.id}`}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        onClick={() => setTab(t.id)}
        className="hub-nav-item"
      >
        <Icon className="hub-nav-icon" aria-hidden="true" />
        <span className="truncate">{t.label}</span>
        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sage" aria-hidden="true" />}
      </button>
    );
  };

  const sidebar = (mobile = false) => (
    <div className={`flex h-full flex-col ${mobile ? '' : 'hub-sidebar'}`} id={mobile ? 'hub-sidebar-mobile' : undefined}>
      <div className="hub-sidebar-brand">
        <span className="hub-brand-mark" aria-hidden="true">OYG</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-forest-900">Oloolua Guardians</span>
          <span className="block text-[11px] text-forest-900/50">Nursery management</span>
        </span>
        {mobile && (
          <button type="button" onClick={() => setMenuOpen(false)} className="hub-btn hub-btn-quiet ml-auto px-2" aria-label="Close navigation">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="hub-sidebar-scroll">
        {GROUPS.map((group) => {
          const groupTabs = tabs.filter((t) => t.group === group);
          if (!groupTabs.length) return null;
          return (
            <nav key={group} aria-label={group} className="mb-6">
              <p className="hub-nav-label">{group}</p>
              <div className="hub-nav-list">{groupTabs.map((t) => navButton(t, mobile))}</div>
            </nav>
          );
        })}
      </div>
      <div className="hub-sidebar-footer">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100 text-[11px] font-bold text-forest-900" aria-hidden="true">{initials}</span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-forest-900">{displayName}</span>
            <span className="block text-[11px] text-forest-900/55">
              {role ? ROLE_LABELS[role] : 'Member'}
            </span>
          </span>
        </div>
        <SignOutButton
          onDone={() => { setQuota(null); void loadSession(); }}
          className="hub-btn hub-btn-secondary w-full"
        />
      </div>
    </div>
  );

  return (
    <GuardianAuthProvider needsSession={!!session && !session.signedIn} onSessionCreated={loadSession}>
      <div className="hub">
        {sidebar()}

        {menuOpen && (
          <>
            <button type="button" className="hub-overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />
            <aside className="hub-drawer">{sidebar(true)}</aside>
          </>
        )}

        <div className="hub-main">
          {!session && (
            <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
              <Loader2 className="h-5 w-5 animate-spin text-forest-700" aria-label="Loading Guardian Hub" />
            </div>
          )}

          {session && !session.signedIn && (
            <SignInGate session={session} onSignedIn={loadSession} />
          )}

          {session?.signedIn && !role && (
            <div className="hub-content flex min-h-[70vh] items-center justify-center">
              <div className="hub-panel max-w-md p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                  <Clock className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="hub-heading mt-4 text-xl">
                  {session.membershipStatus === 'suspended' ? 'Access suspended' : 'Waiting for approval'}
                </h1>
                <p className="mt-2 text-sm text-forest-900/65">
                  {session.membershipStatus === 'suspended'
                    ? 'Your access to the Guardian Hub has been suspended. Please contact a Guardian Admin.'
                    : `You are signed in as ${session.user?.email ?? session.user?.name}. A Guardian Admin must approve your account and choose a role before Guardian data is available.`}
                </p>
                <SignOutButton
                  onDone={() => { setQuota(null); void loadSession(); }}
                  className="hub-btn hub-btn-secondary mt-5"
                />
              </div>
            </div>
          )}

          {session?.signedIn && role && session.user && (
            <>
              <header className="hub-topbar">
                <button
                  type="button"
                  className="hub-btn hub-btn-quiet px-2 lg:hidden"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open navigation"
                  aria-expanded={menuOpen}
                  aria-controls="hub-sidebar-mobile"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-900/45">Guardian Hub</p>
                  <h1 className="truncate text-sm font-semibold text-forest-900">{active?.label ?? 'Overview'}</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="hub-chip hidden sm:inline-flex">
                    {ROLE_LABELS[role]}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-100 text-[11px] font-bold text-forest-900" aria-hidden="true">{initials}</span>
                  <SignOutButton
                    onDone={() => { setQuota(null); void loadSession(); }}
                    className="hub-btn hub-btn-secondary hidden sm:inline-flex"
                  />
                </div>
              </header>

              <main className="hub-content" id="main-content">
                {activeTab === 'ai' && !session.aiEnabled && (
                  <p className="hub-notice mb-5" role="status">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    AI conversation is not connected. Records, seedbeds and the Keeper Diary remain available.
                  </p>
                )}

                <section aria-label={active?.label ?? 'Overview'}>
                  {activeTab === 'overview' && <OverviewPanel role={role} refreshKey={refreshKey} onNavigate={setTab} />}
                  {activeTab === 'nursery' && <NurseryPanel role={role} refreshKey={refreshKey} />}
                  {activeTab === 'records' && <RecordsPanel role={role} refreshKey={refreshKey} onChanged={bump} />}
                  {activeTab === 'diary' && <DiaryPanel refreshKey={refreshKey} />}
                  {activeTab === 'knowledge' && <KnowledgePanel refreshKey={refreshKey} />}
                  {activeTab === 'ai' && (
                    <GuardianChat
                      role={role}
                      firstName={displayName.split(' ')[0]}
                      quota={quota}
                      onQuota={setQuota}
                      onRecordSaved={bump}
                    />
                  )}
                  {activeTab === 'record' && <RecordPanel onSaved={bump} />}
                  {activeTab === 'verify' && <VerifyPanel refreshKey={refreshKey} onChanged={bump} />}
                  {activeTab === 'audit' && <AuditPanel refreshKey={refreshKey} />}
                  {activeTab === 'team' && <TeamPanel myUserId={session.user.id} refreshKey={refreshKey} />}
                </section>
              </main>
            </>
          )}
        </div>
      </div>
    </GuardianAuthProvider>
  );
}

function SignOutButton({ onDone, className }: { onDone: () => void; className: string }) {
  const auth = useGuardianAuth();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
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
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <LogOut className="h-3.5 w-3.5" aria-hidden="true" />}
      Sign out
    </button>
  );
}

function SignInGate({ session, onSignedIn }: { session: SessionInfo; onSignedIn: () => void }) {
  const auth = useGuardianAuth();
  const [devEmail, setDevEmail] = useState('');
  const [accountMode, setAccountMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountConfirmPassword, setAccountConfirmPassword] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountNotice, setAccountNotice] = useState('');
  const [devResetLink, setDevResetLink] = useState('');

  const devLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await api('/api/guardian/auth/dev', { body: { email: devEmail, name: devEmail.split('@')[0] } });
    if (r.ok) onSignedIn();
  };

  const switchMode = (mode: 'login' | 'register' | 'forgot') => {
    setAccountMode(mode);
    setAccountError('');
    setAccountNotice('');
    setDevResetLink('');
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountMode === 'register' && accountPassword !== accountConfirmPassword) {
      setAccountError('The passwords do not match.');
      return;
    }
    setAccountBusy(true);
    setAccountError('');
    setAccountNotice('');
    try {
      const endpoint = accountMode === 'register' ? '/api/guardian/auth/register' : '/api/guardian/auth/login';
      const r = await api<{ error?: string }>(endpoint, {
        body: {
          ...(accountMode === 'register' ? { name: accountName, confirmPassword: accountConfirmPassword } : {}),
          email: accountEmail,
          password: accountPassword,
        },
      });
      if (r.ok) {
        setAccountPassword('');
        setAccountConfirmPassword('');
        onSignedIn();
      } else {
        setAccountError(r.data?.error ?? 'Could not sign in. Please try again.');
      }
    } catch {
      setAccountError('Could not reach the server. Please try again.');
    } finally {
      setAccountBusy(false);
    }
  };

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountBusy(true);
    setAccountError('');
    setAccountNotice('');
    setDevResetLink('');
    try {
      const r = await api<{ error?: string; message?: string; devLink?: string }>('/api/guardian/auth/forgot-password', {
        body: { email: accountEmail },
      });
      if (r.ok) {
        setAccountNotice(r.data?.message ?? 'If an account exists, a reset link has been sent.');
        if (r.data?.devLink) setDevResetLink(r.data.devLink);
      } else {
        setAccountError(r.data?.error ?? 'Could not send the reset link. Please try again.');
      }
    } catch {
      setAccountError('Could not reach the server. Please try again.');
    } finally {
      setAccountBusy(false);
    }
  };

  const signInReady = session.privy === true && auth.available;

  return (
    <div className="hub-content flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="hub-panel p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-forest-50 text-forest-700">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-900/45">Guardian Hub</p>
          <h1 className="hub-heading mt-1 text-2xl">
            {accountMode === 'register' ? 'Create account' : accountMode === 'forgot' ? 'Reset password' : 'Sign in'}
          </h1>
          <p className="mt-2 text-sm text-forest-900/65">
            {session.passwordAuth
              ? 'Use your member account to access nursery records.'
              : 'Sign in to view nursery records and the Keeper Diary.'}
          </p>

          {auth.error && <p role="alert" className="hub-message mt-4">{auth.error}</p>}

          {auth.linking ? (
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-forest-900/65" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in...
            </p>
          ) : signInReady ? (
            <div className="mt-5 space-y-2">
              <button type="button" onClick={auth.signInWithGoogle} disabled={!auth.ready} className="hub-btn hub-btn-primary w-full">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
                Continue with Google
              </button>
              <button type="button" onClick={auth.signInWithEmail} disabled={!auth.ready} className="hub-btn hub-btn-secondary w-full">
                Continue with email code
              </button>
            </div>
          ) : session.passwordAuth ? null : (
            <p className="hub-notice mt-5" role="status">Sign-in is not available yet. Please check back soon.</p>
          )}

          {session.passwordAuth && (
            <form
              onSubmit={accountMode === 'forgot' ? requestReset : submitAccount}
              className="mt-6 space-y-3 border-t border-forest-900/10 pt-5"
            >
              <p className="text-center text-[11px] font-semibold text-forest-900/55">
                {accountMode === 'register' ? 'Create a member account' : accountMode === 'forgot' ? 'Reset your password' : 'Member sign in'}
              </p>
              {accountMode === 'register' && (
                <label className="hub-label" htmlFor="account-name">
                  Full name
                  <input
                    id="account-name"
                    className="hub-field mt-1"
                    required
                    minLength={2}
                    maxLength={60}
                    autoComplete="name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </label>
              )}
              <label className="hub-label" htmlFor="account-email">
                Email address
                <input
                  id="account-email"
                  className="hub-field mt-1"
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                />
              </label>

              {accountMode === 'forgot' ? (
                <>
                  <p className="hub-hint">We will send a single-use link that is valid for 30 minutes.</p>
                  {accountNotice && <p className="hub-notice" role="status">{accountNotice}</p>}
                  {devResetLink && (
                    <a href={devResetLink} className="block break-all text-xs font-semibold text-forest-700 underline underline-offset-4">
                      Open reset link
                    </a>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <label className="hub-label" htmlFor="account-password">Password</label>
                    {accountMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs font-semibold text-forest-700 underline underline-offset-4"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    id="account-password"
                    className="hub-field"
                    required
                    type="password"
                    minLength={accountMode === 'register' ? 10 : 1}
                    maxLength={128}
                    autoComplete={accountMode === 'register' ? 'new-password' : 'current-password'}
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    aria-describedby="password-hint"
                  />
                  {accountMode === 'register' && (
                    <label className="hub-label" htmlFor="account-confirm-password">
                      Confirm password
                      <input
                        id="account-confirm-password"
                        className="hub-field mt-1"
                        required
                        type="password"
                        minLength={10}
                        maxLength={128}
                        autoComplete="new-password"
                        value={accountConfirmPassword}
                        onChange={(e) => setAccountConfirmPassword(e.target.value)}
                      />
                    </label>
                  )}
                  <p id="password-hint" className="hub-hint">
                    {accountMode === 'register' ? 'Use at least 10 characters. Both passwords must match.' : 'Enter the password for your member account.'}
                  </p>
                </>
              )}

              {accountError && <p role="alert" className="hub-message">{accountError}</p>}
              <button disabled={accountBusy} className="hub-btn hub-btn-primary w-full">
                {accountBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                {accountMode === 'forgot' ? (
                  <><Mail className="h-3.5 w-3.5" aria-hidden="true" /> Send reset link</>
                ) : accountMode === 'register' ? 'Create account' : 'Sign in'}
              </button>
              {accountMode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-forest-700 underline underline-offset-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode(accountMode === 'register' ? 'login' : 'register')}
                  className="w-full text-xs font-semibold text-forest-700 underline underline-offset-4"
                >
                  {accountMode === 'register' ? 'Already have an account? Sign in' : 'Create a member account'}
                </button>
              )}
              {accountMode !== 'forgot' && <p className="hub-hint text-center">New member accounts may need approval from a Guardian Admin.</p>}
            </form>
          )}

          {!session.passwordAuth && signInReady && (
            <p className="hub-hint mt-4">New accounts need approval from a Guardian Admin.</p>
          )}

          {session.devLogin && (
            <form onSubmit={devLogin} className="mt-6 space-y-3 border-t border-forest-900/10 pt-5">
              <p className="text-[11px] font-semibold text-forest-900/55">Development sign-in</p>
              <label className="hub-label" htmlFor="dev-email">
                Email address
                <input
                  id="dev-email"
                  className="hub-field mt-1"
                  type="email"
                  required
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                />
              </label>
              <button className="hub-btn hub-btn-secondary w-full">Sign in</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
