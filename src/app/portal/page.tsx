'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, Bot, BookOpen, ClipboardList, Clock, LayoutDashboard, Loader2, LogOut,
  Library, Menu, PlusCircle, ScrollText, ShieldCheck, Sprout, Users, X,
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
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [tab, setTabState] = useState('overview');
  const [quota, setQuota] = useState<Quota | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadSession = useCallback(async () => {
    const r = await api<SessionInfo>('/api/guardian/auth/session');
    const next = r.data ?? { authConfigured: false, devLogin: false, aiEnabled: false, signedIn: false, error: 'Guardian is unavailable.' };
    setSession(next);
    setQuota(next.quota ?? null);
    if (!next.signedIn) router.replace('/login');
  }, [router]);

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
    <GuardianAuthProvider needsSession={false} onSessionCreated={loadSession}>
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
                    : `You are signed in as ${session.user?.email ?? session.user?.name}. This account is still marked pending from an earlier setup. Sign out and sign in again to activate it.`}
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
