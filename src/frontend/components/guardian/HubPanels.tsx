'use client';

import { Fragment, useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, ArrowRight, Check, ClipboardList, Download, Loader2, PlusCircle, RefreshCw, Search, ShieldCheck, X } from 'lucide-react';
import {
  ACTIVITY_TYPES, ACTIVITY_TYPE_KEYS, ROLES, ROLE_LABELS, STATUS_LABELS, can,
  type ActivityType, type RecordStatus, type Role,
} from '@shared/guardian/constants';
import DraftCard from './DraftCard';
import {
  api, downloadCsv, fmt, formatDate, readTool, writeTool,
  type ActivityRecordView, type DiaryEntryView, type DraftView, type InventoryView, type KnowledgeDocView,
  type NurserySummaryView, type SeedbedView, type SpeciesView, type TeamMemberView,
} from './api';

type LoadResult<T> = {
  ok: boolean;
  status: number;
  data?: { ok?: boolean; data?: T; message?: string; error?: string } | null;
};

function useLoad<T>(loader: () => Promise<LoadResult<T>>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await loader();
      if (r.ok && r.data?.data !== undefined) setData(r.data.data as T);
      else setError(r.data?.message ?? r.data?.error ?? 'Could not load this section.');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { void load(); }, [load]);
  return { data, error, loading, reload: load };
}

function Problem({ text }: { text: string }) {
  return (
    <p role="alert" className="hub-message">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
}

function Notice({ text }: { text: string }) {
  return <p role="status" className="hub-notice"><Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{text}</p>;
}

function EmptyState({ title, note }: { title: string; note?: string }) {
  return (
    <div className="hub-empty">
      <p className="hub-empty-title">{title}</p>
      {note && <p className="hub-empty-note">{note}</p>}
    </div>
  );
}

function PanelHead({ title, note, children }: { title: string; note?: string; children?: ReactNode }) {
  return (
    <div className="hub-panel-head">
      <div>
        <h3 className="hub-section-title">{title}</h3>
        {note && <p className="hub-section-note">{note}</p>}
      </div>
      {children}
    </div>
  );
}

function RefreshButton({ onClick, busy, label = 'Refresh' }: { onClick: () => void; busy?: boolean; label?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className="hub-btn hub-btn-secondary" aria-label={label}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  );
}

function Stat({ label, value, note, loading }: { label: string; value: string; note?: string; loading?: boolean }) {
  return (
    <div className="hub-stat">
      <p className="hub-stat-label">{label}</p>
      {loading ? (
        <Loader2 className="mt-2 h-5 w-5 animate-spin text-forest-700" aria-label={`Loading ${label}`} />
      ) : (
        <p className="hub-stat-value">{value}</p>
      )}
      {note && <p className="hub-stat-note">{note}</p>}
    </div>
  );
}

function Status({ status }: { status: RecordStatus }) {
  return <span className={`hub-status hub-status-${status}`}>{STATUS_LABELS[status]}</span>;
}

function formatQuantity(n: number) {
  return `${fmt(n)} seedlings`;
}

function utilisation(current: number | null, capacity: number | null) {
  if (current === null || capacity === null || capacity <= 0) return null;
  return Math.round((current / capacity) * 100);
}

// ── Overview ─────────────────────────────────────────────────────────────────

export function OverviewPanel({ role, refreshKey, onNavigate }: { role: Role; refreshKey: number; onNavigate: (id: string) => void }) {
  const summary = useLoad<NurserySummaryView>(() => readTool('get_nursery_summary'), [refreshKey]);
  const beds = useLoad<SeedbedView[]>(() => readTool('get_seedbeds'), [refreshKey]);
  const records = useLoad<{ count: number; records: ActivityRecordView[] }>(
    () => readTool('get_activity_records', { status: 'confirmed', limit: 100 }), [refreshKey],
  );
  const diary = useLoad<{ entries: DiaryEntryView[] }>(() => readTool('search_keeper_diary', { limit: 5 }), [refreshKey]);

  const s = summary.data;
  const pendingCount = records.data?.records.length ?? null;
  const quickActions = [
    { id: 'nursery', label: 'Open nursery inventory', icon: ClipboardList },
    ...(can(role, 'record') ? [{ id: 'record', label: 'Record an activity', icon: PlusCircle }] : []),
    ...(can(role, 'verify') ? [{ id: 'verify', label: 'Review records', icon: ShieldCheck }] : []),
    { id: 'records', label: 'View activity records', icon: ClipboardList },
    { id: 'diary', label: 'Search Keeper Diary', icon: Search },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-900/45">Nursery overview</p>
          <h2 className="hub-heading mt-1 text-2xl sm:text-3xl">{s?.nurseryName ?? 'Nursery'}</h2>
          <p className="mt-1 text-sm text-forest-900/60">
            {s?.location ? s.location : 'Location not recorded'}
          </p>
        </div>
        {s?.baseline && (
          <p className="text-xs text-forest-900/55">
            Baseline {formatDate(s.baseline.asOf)}. {s.baseline.source}
          </p>
        )}
      </div>

      {summary.error && <Problem text={summary.error} />}
      {records.error && <Problem text={records.error} />}
      {beds.error && <Problem text={beds.error} />}
      {diary.error && <Problem text={diary.error} />}

      <div className="hub-stat-grid">
        <Stat label="Ready stock" value={s ? formatQuantity(s.readyStockVerified) : 'Unavailable'} note="Verified stock" loading={summary.loading && !s} />
        <Stat label="Awaiting review" value={pendingCount === null ? 'Unavailable' : String(pendingCount)} note="In latest 100 confirmed records" loading={records.loading && pendingCount === null} />
        <Stat label="Active seedbeds" value={s ? String(s.activeSeedbeds) : 'Unavailable'} note="Currently in use" loading={summary.loading && !s} />
        <Stat label="Catalogued species" value={s ? String(s.speciesCount) : 'Unavailable'} note="Active in catalogue" loading={summary.loading && !s} />
      </div>

      {s && s.readyStockPendingNet !== 0 && (
        <p className="hub-notice" role="status">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Confirmed records would change ready stock by {s.readyStockPendingNet > 0 ? '+' : ''}{fmt(s.readyStockPendingNet)} once verified.
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="space-y-5">
          <section className="hub-panel">
            <PanelHead title="Recent activity records" note="Newest confirmed records from the database">
              <button type="button" onClick={() => onNavigate('records')} className="hub-btn hub-btn-quiet">
                All records <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </PanelHead>
            <div className="hub-table-scroll">
              <table className="hub-table">
                <thead>
                  <tr><th scope="col">Date</th><th scope="col">Activity</th><th scope="col">Quantity</th><th scope="col">Recorded by</th><th scope="col">Status</th></tr>
                </thead>
                <tbody>
                  {records.loading && !records.data ? (
                    <tr><td colSpan={5}><EmptyState title="Loading records" /></td></tr>
                  ) : records.data?.records.length ? records.data.records.slice(0, 6).map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap text-forest-900/70">{formatDate(r.date)}</td>
                      <td className="font-medium text-forest-900">{ACTIVITY_TYPES[r.type]?.label ?? r.type}</td>
                      <td className="tabular-nums">{formatQuantity(r.quantity)}</td>
                      <td className="text-forest-900/70">{r.recordedBy}</td>
                      <td><Status status={r.status} /></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5}><EmptyState title="No confirmed records" note="Records will appear here once an activity is saved." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="hub-panel">
            <PanelHead title="Seedbeds" note="Verified stock recorded against each bed">
              <button type="button" onClick={() => onNavigate('nursery')} className="hub-btn hub-btn-quiet">
                View nursery <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </PanelHead>
            <div className="hub-table-scroll">
              <table className="hub-table">
                <thead>
                  <tr><th scope="col">Bed</th><th scope="col">Method</th><th scope="col">Manager</th><th scope="col">Stock</th><th scope="col">Capacity</th></tr>
                </thead>
                <tbody>
                  {beds.loading && !beds.data ? (
                    <tr><td colSpan={5}><EmptyState title="Loading seedbeds" /></td></tr>
                  ) : beds.data?.length ? beds.data.slice(0, 5).map((b) => (
                    <tr key={b.id}>
                      <td className="font-semibold text-forest-900">Bed {b.bedNumber}</td>
                      <td className="text-forest-900/70">{b.method ?? 'Not recorded'}</td>
                      <td className="text-forest-900/70">{b.manager ?? 'Unassigned'}</td>
                      <td className="tabular-nums">{b.currentStock === null ? 'Not recorded' : formatQuantity(b.currentStock)}</td>
                      <td className="tabular-nums">{b.capacityMax === null ? 'Not recorded' : fmt(b.capacityMax)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5}><EmptyState title="No seedbeds found" note="Seedbeds appear here when they are added to the nursery." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="hub-panel">
            <PanelHead title="Quick actions" note="Go straight to the work you need" />
            <div className="hub-panel-body">
              <div className="space-y-1">
                {quickActions.map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => onNavigate(id)} className="hub-btn hub-btn-quiet w-full justify-between px-2 py-2.5 text-left text-sm">
                    <span className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-forest-700" aria-hidden="true" />{label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-forest-900/35" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="hub-panel">
            <PanelHead title="Keeper Diary" note="Latest confirmed events" />
            {diary.loading && !diary.data ? (
              <EmptyState title="Loading diary" />
            ) : diary.data?.entries.length ? (
              <ul className="hub-list">
                {diary.data.entries.slice(0, 4).map((entry) => (
                  <li key={entry.id} className="px-4 py-3">
                    <p className="text-xs font-semibold text-forest-900">{entry.eventType}</p>
                    <p className="mt-1 text-xs text-forest-900/65">{entry.description}</p>
                    <p className="mt-1 text-[11px] text-forest-900/45">{formatDate(entry.ts)}{entry.actor ? ` · ${entry.actor}` : ''}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No diary entries" note="Confirmed events are added to the Keeper Diary automatically." />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Nursery ──────────────────────────────────────────────────────────────────

export function NurseryPanel({ role, refreshKey }: { role: Role; refreshKey: number }) {
  const summary = useLoad<NurserySummaryView>(() => readTool('get_nursery_summary'), [refreshKey]);
  const beds = useLoad<SeedbedView[]>(() => readTool('get_seedbeds'), [refreshKey]);
  const species = useLoad<{ count: number; species: SpeciesView[] }>(() => readTool('get_species'), [refreshKey]);
  const inventory = useLoad<InventoryView>(() => readTool('get_inventory'), [refreshKey]);
  const [query, setQuery] = useState('');
  const [problem, setProblem] = useState('');
  const [notice, setNotice] = useState('');
  const [bedForm, setBedForm] = useState({ seedbed_id: '', bed_number: '', method: '', capacity_max: '', status: 'active' });
  const [speciesForm, setSpeciesForm] = useState({ species_id: '', name: '', scientific_name: '', status: 'active' });
  const [nurseryForm, setNurseryForm] = useState({ name: '', location: '', capacity: '' });
  const canManage = can(role, 'manageNursery');
  const s = summary.data;
  const speciesList = species.data?.species ?? [];
  const filteredSpecies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return speciesList;
    return speciesList.filter((sp) => sp.name.toLowerCase().includes(q) || (sp.scientificName ?? '').toLowerCase().includes(q));
  }, [query, speciesList]);

  useEffect(() => {
    if (!s) return;
    setNurseryForm({ name: s.nurseryName, location: s.location ?? '', capacity: s.capacity === null ? '' : String(s.capacity) });
  }, [s?.nurseryName, s?.location, s?.capacity]);

  const reloadAll = () => {
    void summary.reload(); void beds.reload(); void species.reload(); void inventory.reload();
  };

  const runUpdate = async (label: string, tool: string, args: Record<string, unknown>) => {
    setProblem(''); setNotice('');
    try {
      const r = await writeTool(tool, args);
      if (!r.ok) setProblem(r.data?.message ?? `Could not ${label}.`);
      else { setNotice(`Nursery ${label} saved.`); reloadAll(); }
    } catch {
      setProblem('Could not reach the server. Please try again.');
    }
  };

  const editBed = (b: SeedbedView) => setBedForm({
    seedbed_id: b.id, bed_number: String(b.bedNumber), method: b.method ?? '',
    capacity_max: b.capacityMax === null ? '' : String(b.capacityMax), status: b.status,
  });

  const editSpecies = (sp: SpeciesView) => setSpeciesForm({
    species_id: sp.id, name: sp.name, scientific_name: sp.scientificName ?? '', status: 'active',
  });

  return (
    <div className="space-y-5">
      <section className="hub-panel">
        <PanelHead title={`${s?.nurseryName ?? 'Nursery'} summary`} note="Figures are derived from verified records">
          <RefreshButton onClick={() => { void summary.reload(); void beds.reload(); void species.reload(); }} busy={summary.loading} />
        </PanelHead>
        <div className="hub-panel-body">
          {summary.error && <div className="mb-4"><Problem text={summary.error} /></div>}
          <div className="hub-stat-grid">
            <Stat label="Ready now" value={s ? formatQuantity(s.readyStockVerified) : 'Unavailable'} note="Verified stock" loading={summary.loading && !s} />
            <Stat label="Capacity" value={s ? (s.capacity === null ? 'Not recorded' : fmt(s.capacity)) : 'Not recorded'} note="Total space, not stock" loading={summary.loading && !s} />
            <Stat label="Tree species" value={s ? String(s.speciesCount) : 'Unavailable'} note="Active catalogue entries" loading={summary.loading && !s} />
            <Stat label="Active seedbeds" value={s ? String(s.activeSeedbeds) : 'Unavailable'} note="Currently in use" loading={summary.loading && !s} />
          </div>
          {s && s.readyStockPendingNet !== 0 && (
            <p className="hub-notice mt-4" role="status">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Confirmed records would change ready stock by {s.readyStockPendingNet > 0 ? '+' : ''}{fmt(s.readyStockPendingNet)} once verified.
            </p>
          )}
          {s?.baseline && <p className="mt-4 text-xs text-forest-900/50">Baseline {formatDate(s.baseline.asOf)}. Source: {s.baseline.source}.</p>}
        </div>
      </section>

      <section className="hub-panel">
        <PanelHead title="Inventory ledger" note="Verified stock and pending changes from confirmed records">
          <RefreshButton onClick={() => void inventory.reload()} busy={inventory.loading} label="Refresh inventory" />
        </PanelHead>
        {inventory.error && <div className="px-4 pt-4"><Problem text={inventory.error} /></div>}
        <div className="hub-panel-body space-y-4">
          {inventory.data && (
            <div className="hub-stat-grid">
              <Stat label="Verified ready stock" value={formatQuantity(inventory.data.readyStockVerified)} />
              <Stat label="Pending net change" value={`${inventory.data.confirmedNotYetVerifiedNetChange > 0 ? '+' : ''}${fmt(inventory.data.confirmedNotYetVerifiedNetChange)} seedlings`} />
            </div>
          )}
          <div className="hub-table-scroll">
            <table className="hub-table">
              <thead><tr><th scope="col">Bed</th><th scope="col">Verified stock</th><th scope="col">Pending net</th></tr></thead>
              <tbody>
                {inventory.loading && !inventory.data ? (
                  <tr><td colSpan={3}><EmptyState title="Loading inventory" /></td></tr>
                ) : inventory.data?.byBed.length ? inventory.data.byBed.map((row) => (
                  <tr key={row.bed}>
                    <td className="font-semibold text-forest-900">Bed {row.bed}</td>
                    <td className="tabular-nums">{row.verifiedStock === null ? 'Not recorded' : formatQuantity(row.verifiedStock)}</td>
                    <td className={`tabular-nums ${row.pendingNet > 0 ? 'text-forest-700' : row.pendingNet < 0 ? 'text-red-700' : ''}`}>
                      {row.pendingNet > 0 ? '+' : ''}{fmt(row.pendingNet)}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3}><EmptyState title="No inventory rows" note="Verified and confirmed records build this ledger." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {canManage && (
        <section className="hub-panel">
          <PanelHead title="Manage nursery" note="Changes are written to the Guardian database and audit trail" />
          <div className="hub-panel-body space-y-5">
            {problem && <Problem text={problem} />}
            {notice && <Notice text={notice} />}
            <form onSubmit={(e: FormEvent) => { e.preventDefault(); void runUpdate('details', 'set_nursery_details', { name: nurseryForm.name, location: nurseryForm.location, capacity: nurseryForm.capacity ? Number(nurseryForm.capacity) : null }); }} className="grid gap-3 sm:grid-cols-3">
              <label className="hub-label">Nursery name<input required minLength={2} className="hub-field mt-1" value={nurseryForm.name} onChange={(e) => setNurseryForm({ ...nurseryForm, name: e.target.value })} /></label>
              <label className="hub-label">Location<input className="hub-field mt-1" value={nurseryForm.location} onChange={(e) => setNurseryForm({ ...nurseryForm, location: e.target.value })} /></label>
              <label className="hub-label">Total capacity<input type="number" min={1} className="hub-field mt-1" value={nurseryForm.capacity} onChange={(e) => setNurseryForm({ ...nurseryForm, capacity: e.target.value })} /></label>
              <div className="sm:col-span-3"><button className="hub-btn hub-btn-primary">Save nursery details</button></div>
            </form>
            <form onSubmit={(e: FormEvent) => { e.preventDefault(); void runUpdate('seedbed', 'upsert_seedbed', { ...bedForm, seedbed_id: bedForm.seedbed_id || null, bed_number: Number(bedForm.bed_number), capacity_max: bedForm.capacity_max ? Number(bedForm.capacity_max) : null }); }} className="grid gap-3 sm:grid-cols-4">
              <label className="hub-label">Bed number<input required type="number" min={1} className="hub-field mt-1" value={bedForm.bed_number} onChange={(e) => setBedForm({ ...bedForm, bed_number: e.target.value })} /></label>
              <label className="hub-label">Method<input className="hub-field mt-1" value={bedForm.method} onChange={(e) => setBedForm({ ...bedForm, method: e.target.value })} /></label>
              <label className="hub-label">Capacity<input type="number" min={1} className="hub-field mt-1" value={bedForm.capacity_max} onChange={(e) => setBedForm({ ...bedForm, capacity_max: e.target.value })} /></label>
              <label className="hub-label">Status<select className="hub-field mt-1" value={bedForm.status} onChange={(e) => setBedForm({ ...bedForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              <div className="flex gap-2 sm:col-span-4">
                <button className="hub-btn hub-btn-primary">{bedForm.seedbed_id ? 'Update seedbed' : 'Add seedbed'}</button>
                <button type="button" className="hub-btn hub-btn-secondary" onClick={() => setBedForm({ seedbed_id: '', bed_number: '', method: '', capacity_max: '', status: 'active' })}>Clear</button>
              </div>
            </form>
            <form onSubmit={(e: FormEvent) => { e.preventDefault(); void runUpdate('species', 'upsert_species', { species_id: speciesForm.species_id || null, name: speciesForm.name, scientific_name: speciesForm.scientific_name, status: speciesForm.status }); }} className="grid gap-3 sm:grid-cols-3">
              <label className="hub-label">Species name<input required minLength={2} className="hub-field mt-1" value={speciesForm.name} onChange={(e) => setSpeciesForm({ ...speciesForm, name: e.target.value })} /></label>
              <label className="hub-label">Scientific name<input className="hub-field mt-1" value={speciesForm.scientific_name} onChange={(e) => setSpeciesForm({ ...speciesForm, scientific_name: e.target.value })} /></label>
              <label className="hub-label">Status<select className="hub-field mt-1" value={speciesForm.status} onChange={(e) => setSpeciesForm({ ...speciesForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              <div className="flex gap-2 sm:col-span-3">
                <button className="hub-btn hub-btn-primary">{speciesForm.species_id ? 'Update species' : 'Add species'}</button>
                <button type="button" className="hub-btn hub-btn-secondary" onClick={() => setSpeciesForm({ species_id: '', name: '', scientific_name: '', status: 'active' })}>Clear</button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="hub-panel">
        <PanelHead title="Seedbeds" note="Capacity and verified stock by bed" />
        {beds.error && <div className="px-4 pt-4"><Problem text={beds.error} /></div>}
        <div className="hub-table-scroll">
          <table className="hub-table">
            <thead>
              <tr>
                <th scope="col">Bed</th><th scope="col">Method</th><th scope="col">Manager</th>
                <th scope="col">Verified stock</th><th scope="col">Capacity</th><th scope="col">Use</th><th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {beds.loading && !beds.data ? (
                <tr><td colSpan={7}><EmptyState title="Loading seedbeds" /></td></tr>
              ) : beds.data?.length ? beds.data.map((b) => {
                const pct = utilisation(b.currentStock, b.capacityMax);
                return (
                  <tr key={b.id}>
                    <td className="font-semibold text-forest-900">Bed {b.bedNumber}</td>
                    <td className="text-forest-900/70">{b.method ?? 'Not recorded'}</td>
                    <td className="text-forest-900/70">{b.manager ?? 'Unassigned'}</td>
                    <td className="tabular-nums">{b.currentStock === null ? 'Not recorded' : formatQuantity(b.currentStock)}</td>
                    <td className="tabular-nums">{b.capacityMax === null ? 'Not recorded' : fmt(b.capacityMax)}</td>
                    <td>
                      {pct === null ? <span className="text-forest-900/45">Not recorded</span> : (
                        <div className="w-24">
                          <div className="hub-progress" role="progressbar" aria-valuenow={Math.min(100, pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Bed ${b.bedNumber} capacity used`}>
                            <div className="hub-progress-bar" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                          <span className="mt-1 block text-[11px] tabular-nums text-forest-900/60">{pct}%</span>
                        </div>
                      )}
                    </td>
                    <td className="capitalize text-forest-900/70">
                      <span className="block">{b.status}</span>
                      {canManage && <button type="button" className="hub-btn hub-btn-quiet mt-1 px-2" onClick={() => editBed(b)}>Edit</button>}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7}><EmptyState title="No seedbeds found" note="Add a seedbed in Manage nursery." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hub-panel">
        <PanelHead
          title="Tree species catalogue"
          note={species.data ? `${species.data.count} active species` : 'Catalogued species'}
        >
          <div className="w-full sm:w-64">
            <label className="sr-only" htmlFor="species-search">Search species</label>
            <input id="species-search" className="hub-field" value={query} onChange={(e) => setQuery(e.target.value)} aria-describedby="species-search-hint" />
            <p id="species-search-hint" className="hub-hint">Filter by common or scientific name.</p>
          </div>
        </PanelHead>
        {species.error && <div className="px-4 pt-4"><Problem text={species.error} /></div>}
        <div className="hub-panel-body">
          {species.loading && !species.data ? (
            <EmptyState title="Loading species" />
          ) : filteredSpecies.length ? (
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSpecies.map((sp) => (
                <li key={sp.id} className="rounded-md border border-forest-900/10 px-3 py-2.5">
                  <p className="text-sm font-semibold text-forest-900">{sp.name}</p>
                  <p className="mt-0.5 text-xs italic text-forest-900/55">{sp.scientificName ?? 'Scientific name not recorded'}</p>
                  {canManage && <button type="button" className="hub-btn hub-btn-quiet mt-2 px-2" onClick={() => editSpecies(sp)}>Edit</button>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title={query ? 'No species match this search' : 'No species catalogued'}
              note={query ? 'Try a different name or clear the search.' : 'Species appear here when they are added to the nursery catalogue.'}
            />
          )}
        </div>
      </section>
    </div>
  );
}

// ── Activity records ─────────────────────────────────────────────────────────

export function RecordsPanel({ role, refreshKey, onChanged }: { role: Role; refreshKey: number; onChanged: () => void }) {
  const [status, setStatus] = useState<'any' | RecordStatus>('any');
  const [type, setType] = useState<'' | ActivityType>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [correctionFor, setCorrectionFor] = useState<string | null>(null);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [changes, setChanges] = useState<Record<string, { type: ActivityType; quantity: string; date: string; species: string; seedbed: string; destination: string; notes: string }>>({});
  const [draft, setDraft] = useState<DraftView | null>(null);
  const [problem, setProblem] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const records = useLoad<{ count: number; totals: { verifiedQuantity: number; confirmedNotYetVerifiedQuantity: number }; records: ActivityRecordView[] }>(
    () => readTool('get_activity_records', { status, type: type || undefined, from: from || undefined, to: to || undefined, limit: 100 }),
    [status, type, from, to, refreshKey],
  );

  const openCorrection = (r: ActivityRecordView) => {
    setProblem('');
    setDraft(null);
    setCorrectionFor(r.id);
    setChanges((c) => ({ ...c, [r.id]: {
      type: r.type, quantity: String(r.quantity), date: r.date, species: r.species ?? '',
      seedbed: r.seedbed === null ? '' : String(r.seedbed), destination: r.destination ?? '', notes: r.notes ?? '',
    } }));
  };

  const submitCorrection = async (r: ActivityRecordView) => {
    const reasonText = (reason[r.id] ?? '').trim();
    const values = changes[r.id];
    if (reasonText.length < 3) { setProblem('Enter a reason of at least 3 characters.'); return; }
    if (!values || !values.date || Number(values.quantity) < 1) { setProblem('Enter a valid quantity and date.'); return; }
    setBusyId(r.id);
    setProblem('');
    try {
      const r2 = await writeTool<{ draft: DraftView; problem?: string }>('update_activity_record', {
        record_id: r.id,
        reason: reasonText,
        type: values.type,
        quantity: Number(values.quantity),
        date: values.date,
        ...(values.species.trim() ? { species: values.species.trim() } : {}),
        ...(values.seedbed ? { seedbed: Number(values.seedbed) } : {}),
        ...(values.destination.trim() ? { destination: values.destination.trim() } : {}),
        ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
      });
      if (!r2.ok) { setProblem(r2.data?.message ?? 'Could not start the correction.'); return; }
      if (r2.data?.data?.problem) setProblem(r2.data.data.problem);
      if (r2.data?.data?.draft) setDraft(r2.data.data.draft);
    } catch {
      setProblem('Could not reach the server. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="hub-panel">
        <PanelHead title="Activity records" note="Official records from the Guardian database">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="hub-btn hub-btn-secondary"
              disabled={!records.data?.records.length}
              onClick={() => downloadCsv('guardian-activity-records.csv',
                ['Date', 'Activity', 'Quantity', 'Species', 'Bed', 'To bed', 'Destination', 'Recorded by', 'Status', 'Version', 'Notes'],
                (records.data?.records ?? []).map((r) => [r.date, ACTIVITY_TYPES[r.type]?.label ?? r.type, r.quantity, r.species, r.seedbed, r.toSeedbed, r.destination, r.recordedBy, r.status, r.version, r.notes]),
              )}
            ><Download className="h-3.5 w-3.5" aria-hidden="true" />Export CSV</button>
            <RefreshButton onClick={() => void records.reload()} busy={records.loading} />
          </div>
        </PanelHead>
        <div className="hub-panel-body space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="hub-label">
              Status
              <select className="hub-field mt-1" value={status} onChange={(e) => setStatus(e.target.value as 'any' | RecordStatus)}>
                <option value="any">All statuses</option>
                <option value="verified">Verified</option>
                <option value="confirmed">Confirmed</option>
                <option value="corrected">Corrected</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="hub-label">
              Activity type
              <select className="hub-field mt-1" value={type} onChange={(e) => setType(e.target.value as '' | ActivityType)}>
                <option value="">All activity types</option>
                {ACTIVITY_TYPE_KEYS.map((k) => <option key={k} value={k}>{ACTIVITY_TYPES[k].label}</option>)}
              </select>
            </label>
            <label className="hub-label">
              From
              <input type="date" className="hub-field mt-1" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="hub-label">
              To
              <input type="date" className="hub-field mt-1" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <div className="hub-stat-grid grid-cols-1 lg:grid-cols-1">
              <Stat label="Records shown" value={records.data ? String(records.data.count) : 'Unavailable'} loading={records.loading && !records.data} />
            </div>
          </div>

          {records.data && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="hub-stat">
                <p className="hub-stat-label">Verified quantity (shown)</p>
                <p className="hub-stat-value">{formatQuantity(records.data.totals.verifiedQuantity)}</p>
              </div>
              <div className="hub-stat">
                <p className="hub-stat-label">Pending verification (shown)</p>
                <p className="hub-stat-value">{formatQuantity(records.data.totals.confirmedNotYetVerifiedQuantity)}</p>
              </div>
            </div>
          )}

          {problem && <Problem text={problem} />}
          {records.error && <Problem text={records.error} />}

          <div className="hub-table-scroll">
            <table className="hub-table">
              <thead>
                <tr>
                  <th scope="col">Date</th><th scope="col">Activity</th><th scope="col">Quantity</th><th scope="col">Species / bed</th>
                  <th scope="col">Recorded by</th><th scope="col">Status</th><th scope="col">Version</th><th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.loading && !records.data ? (
                  <tr><td colSpan={8}><EmptyState title="Loading activity records" /></td></tr>
                ) : records.data?.records.length ? records.data.records.map((r) => {
                  const mayCorrect = can(role, 'correctOwn') && (can(role, 'correctAny') || r.recordedByYou);
                  const form = changes[r.id];
                  return (
                    <Fragment key={r.id}>
                      <tr>
                        <td className="whitespace-nowrap text-forest-900/70">{formatDate(r.date)}</td>
                        <td className="font-medium text-forest-900">
                          {ACTIVITY_TYPES[r.type]?.label ?? r.type}
                          {r.destination && <span className="mt-0.5 block text-xs font-normal text-forest-900/55">{r.destination}</span>}
                        </td>
                        <td className="tabular-nums">{formatQuantity(r.quantity)}</td>
                        <td className="text-forest-900/70">
                          {r.species ?? 'Species not recorded'}
                          {r.seedbed !== null && <span className="mt-0.5 block text-xs">Bed {r.seedbed}{r.toSeedbed !== null ? ` to ${r.toSeedbed}` : ''}</span>}
                        </td>
                        <td className="text-forest-900/70">{r.recordedBy}</td>
                        <td><Status status={r.status} /></td>
                        <td className="tabular-nums text-forest-900/70">{r.version}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            <button type="button" className="hub-btn hub-btn-quiet px-2" onClick={() => setDetailsId(detailsId === r.id ? null : r.id)}>
                              {detailsId === r.id ? 'Hide' : 'Details'}
                            </button>
                            {mayCorrect ? (
                              <button type="button" className="hub-btn hub-btn-quiet px-2" onClick={() => openCorrection(r)}>Correct</button>
                            ) : <span className="text-xs text-forest-900/40">Not available</span>}
                          </div>
                        </td>
                      </tr>
                      {detailsId === r.id && (
                        <tr>
                          <td colSpan={8} className="bg-forest-50">
                            <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                              <div><dt className="font-semibold text-forest-900/60">Record ID</dt><dd className="mt-0.5 break-all text-forest-900/80">{r.id}</dd></div>
                              <div><dt className="font-semibold text-forest-900/60">Created</dt><dd className="mt-0.5 text-forest-900/80">{formatDate(r.createdAt)}</dd></div>
                              <div><dt className="font-semibold text-forest-900/60">Reviewer</dt><dd className="mt-0.5 text-forest-900/80">{r.reviewedBy ?? 'Not reviewed'}</dd></div>
                              <div><dt className="font-semibold text-forest-900/60">Review reason</dt><dd className="mt-0.5 text-forest-900/80">{r.reviewReason ?? r.correctionReason ?? 'Not recorded'}</dd></div>
                              <div><dt className="font-semibold text-forest-900/60">Supersedes</dt><dd className="mt-0.5 break-all text-forest-900/80">{r.supersedesId ?? 'None'}</dd></div>
                              <div className="sm:col-span-2 lg:col-span-4"><dt className="font-semibold text-forest-900/60">Notes</dt><dd className="mt-0.5 text-forest-900/80">{r.notes ?? 'Not recorded'}</dd></div>
                            </dl>
                          </td>
                        </tr>
                      )}
                      {mayCorrect && correctionFor === r.id && (
                        <tr>
                          <td colSpan={8} className="bg-forest-50">
                            <form className="grid gap-3 md:grid-cols-4" onSubmit={(e: FormEvent) => { e.preventDefault(); void submitCorrection(r); }}>
                              <label className="hub-label">
                                Activity type
                                <select className="hub-field mt-1" value={form?.type ?? r.type} onChange={(e) => setChanges((c) => ({ ...c, [r.id]: { ...(c[r.id] ?? { type: r.type, quantity: '', date: '', species: '', seedbed: '', destination: '', notes: '' }), type: e.target.value as ActivityType } }))}>
                                  {ACTIVITY_TYPE_KEYS.map((k) => <option key={k} value={k}>{ACTIVITY_TYPES[k].label}</option>)}
                                </select>
                              </label>
                              <label className="hub-label">
                                Quantity
                                <input type="number" min={1} className="hub-field mt-1" value={form?.quantity ?? ''} onChange={(e) => setChanges((c) => ({ ...c, [r.id]: { ...(c[r.id] ?? { type: r.type, quantity: '', date: '', species: '', seedbed: '', destination: '', notes: '' }), quantity: e.target.value } }))} />
                              </label>
                              <label className="hub-label">
                                Date
                                <input type="date" className="hub-field mt-1" value={form?.date ?? ''} onChange={(e) => setChanges((c) => ({ ...c, [r.id]: { ...(c[r.id] ?? { type: r.type, quantity: '', date: '', species: '', seedbed: '', destination: '', notes: '' }), date: e.target.value } }))} />
                              </label>
                              <label className="hub-label">
                                Species
                                <input className="hub-field mt-1" value={form?.species ?? ''} onChange={(e) => setChanges((c) => ({ ...c, [r.id]: { ...(c[r.id] ?? { type: r.type, quantity: '', date: '', species: '', seedbed: '', destination: '', notes: '' }), species: e.target.value } }))} />
                              </label>
                              <label className="hub-label">
                                Bed
                                <input type="number" min={1} className="hub-field mt-1" value={form?.seedbed ?? ''} onChange={(e) => setChanges((c) => ({ ...c, [r.id]: { ...(c[r.id] ?? { type: r.type, quantity: '', date: '', species: '', seedbed: '', destination: '', notes: '' }), seedbed: e.target.value } }))} />
                              </label>
                              <label className="hub-label">
                                Destination
                                <input className="hub-field mt-1" value={form?.destination ?? ''} onChange={(e) => setChanges((c) => ({ ...c, [r.id]: { ...(c[r.id] ?? { type: r.type, quantity: '', date: '', species: '', seedbed: '', destination: '', notes: '' }), destination: e.target.value } }))} />
                              </label>
                              <label className="hub-label md:col-span-2">
                                Reason for correction
                                <input required minLength={3} maxLength={500} className="hub-field mt-1" value={reason[r.id] ?? ''} onChange={(e) => setReason((x) => ({ ...x, [r.id]: e.target.value }))} />
                              </label>
                              <label className="hub-label md:col-span-4">
                                Notes
                                <input className="hub-field mt-1" value={form?.notes ?? ''} onChange={(e) => setChanges((c) => ({ ...c, [r.id]: { ...(c[r.id] ?? { type: r.type, quantity: '', date: '', species: '', seedbed: '', destination: '', notes: '' }), notes: e.target.value } }))} />
                              </label>
                              <div className="flex gap-2 md:col-span-4">
                                <button type="submit" disabled={busyId === r.id} className="hub-btn hub-btn-primary">
                                  {busyId === r.id && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                                  Review correction draft
                                </button>
                                <button type="button" className="hub-btn hub-btn-secondary" onClick={() => { setCorrectionFor(null); setProblem(''); }}>Close</button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                }) : (
                  <tr><td colSpan={8}><EmptyState title="No activity records" note="Saved records will appear here." /></td></tr>
                )}
              </tbody>
            </table>
          </div>

          {draft && (
            <DraftCard
              draft={draft}
              onSaved={() => { setDraft(null); setCorrectionFor(null); onChanged(); void records.reload(); }}
              onCancelled={() => { setDraft(null); setCorrectionFor(null); }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

// ── Keeper Diary ─────────────────────────────────────────────────────────────

export function DiaryPanel({ refreshKey }: { refreshKey: number }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const diary = useLoad<{ entries: DiaryEntryView[] }>(
    () => readTool('search_keeper_diary', { query: submitted || undefined, from: from || undefined, to: to || undefined, limit: 50 }),
    [submitted, from, to, refreshKey],
  );

  return (
    <section className="hub-panel">
      <PanelHead title="Keeper Diary" note="A permanent log of confirmed events">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="hub-btn hub-btn-secondary"
            disabled={!diary.data?.entries.length}
            onClick={() => downloadCsv('guardian-keeper-diary.csv', ['Date', 'Event', 'Description', 'By'],
              (diary.data?.entries ?? []).map((e) => [e.ts, e.eventType, e.description, e.actor]))}
          ><Download className="h-3.5 w-3.5" aria-hidden="true" />Export CSV</button>
          <RefreshButton onClick={() => void diary.reload()} busy={diary.loading} />
        </div>
      </PanelHead>
      <div className="hub-panel-body space-y-4">
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); setSubmitted(query.trim()); }} className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <label className="sr-only" htmlFor="diary-search">Search the Keeper Diary</label>
          <div className="relative">
            <Search className="h-4 w-4 text-forest-900/40 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input id="diary-search" className="hub-field pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <label className="hub-label">
            <span className="sr-only">From date</span>
            <input type="date" aria-label="From date" className="hub-field" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="hub-label">
            <span className="sr-only">To date</span>
            <input type="date" aria-label="To date" className="hub-field" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button className="hub-btn hub-btn-primary">Search</button>
        </form>
        {diary.error && <Problem text={diary.error} />}
        <div className="hub-table-scroll">
          <table className="hub-table">
            <thead><tr><th scope="col">When</th><th scope="col">Event</th><th scope="col">Description</th><th scope="col">By</th></tr></thead>
            <tbody>
              {diary.loading && !diary.data ? (
                <tr><td colSpan={4}><EmptyState title="Loading diary" /></td></tr>
              ) : diary.data?.entries.length ? diary.data.entries.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap text-forest-900/70">{formatDate(e.ts)}</td>
                  <td className="font-medium capitalize text-forest-900">{e.eventType}</td>
                  <td className="text-forest-900/70">{e.description}</td>
                  <td className="text-forest-900/70">{e.actor ?? 'Not recorded'}</td>
                </tr>
              )) : (
                <tr><td colSpan={4}><EmptyState title={submitted ? 'No diary entries match this search' : 'No diary entries'} note={submitted ? 'Try another search term.' : 'Confirmed events appear here.'} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── Knowledge ────────────────────────────────────────────────────────────────

export function KnowledgePanel({ refreshKey }: { refreshKey: number }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const docs = useLoad<{ count: number; documents: KnowledgeDocView[] }>(
    () => submitted
      ? readTool('search_guardian_knowledge', { query: submitted })
      : readTool('browse_knowledge'),
    [submitted, refreshKey],
  );

  return (
    <section className="hub-panel">
      <PanelHead title="Guardian knowledge" note="Approved species profiles and organisation guidance">
        <RefreshButton onClick={() => void docs.reload()} busy={docs.loading} />
      </PanelHead>
      <div className="hub-panel-body space-y-4">
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); setSubmitted(query.trim()); }} className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="knowledge-search">Search Guardian knowledge</label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-900/40" aria-hidden="true" />
            <input id="knowledge-search" className="hub-field pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="hub-btn hub-btn-primary">Search</button>
          {submitted && <button type="button" className="hub-btn hub-btn-secondary" onClick={() => { setQuery(''); setSubmitted(''); }}>Show all</button>}
        </form>
        {docs.error && <Problem text={docs.error} />}
        {docs.loading && !docs.data ? (
          <EmptyState title="Loading knowledge base" />
        ) : docs.data?.documents.length ? (
          <ul className="grid gap-3 lg:grid-cols-2">
            {docs.data.documents.map((doc) => (
              <li key={doc.id} className="rounded-md border border-forest-900/10 p-4">
                <p className="text-sm font-semibold text-forest-900">{doc.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-forest-900/70">{doc.snippet}</p>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-forest-700 underline underline-offset-4">
                    Open source
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={submitted ? 'No documents match this search' : 'No knowledge documents'} note={submitted ? 'Try a species name or a different word.' : 'Approved documents appear here.'} />
        )}
      </div>
    </section>
  );
}

// ── Record activity ──────────────────────────────────────────────────────────

export function RecordPanel({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({ type: '', quantity: '', date: '', species: '', seedbed: '', toSeedbed: '', destination: '', notes: '' });
  const [draft, setDraft] = useState<DraftView | null>(null);
  const [problem, setProblem] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const species = useLoad<{ species: SpeciesView[] }>(() => readTool('get_species'));
  const beds = useLoad<SeedbedView[]>(() => readTool('get_seedbeds'));

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const type = form.type as ActivityType | '';
  const needs = (field: string) => !!type && (ACTIVITY_TYPES[type].required as readonly string[]).includes(field);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setProblem('');
    setSaved('');
    const r = await api<{ draft: DraftView; problem?: string; error?: string }>('/api/guardian/drafts', { body: form });
    setBusy(false);
    if (!r.ok) { setProblem(r.data?.error ?? 'Could not create the draft.'); return; }
    setDraft(r.data.draft);
    if (r.data.problem) setProblem(r.data.problem);
    else if (r.data.draft.status === 'draft' && r.data.draft.question) setProblem(r.data.draft.question);
  };

  return (
    <section className="hub-panel">
      <PanelHead title="Record an activity" note="Create a draft, review the values, then confirm to save" />
      <div className="hub-panel-body space-y-4">
        {problem && <Problem text={problem} />}
        {saved && <Notice text={saved} />}
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className="hub-label">
            Activity type
            <select required value={form.type} onChange={set('type')} className="hub-field mt-1">
              <option value="">Choose an activity</option>
              {ACTIVITY_TYPE_KEYS.map((k) => <option key={k} value={k}>{ACTIVITY_TYPES[k].label}</option>)}
            </select>
          </label>
          <label className="hub-label">
            Quantity (seedlings)
            <input type="number" min={1} required value={form.quantity} onChange={set('quantity')} className="hub-field mt-1" />
          </label>
          <label className="hub-label">
            Date
            <input type="date" required value={form.date} onChange={set('date')} className="hub-field mt-1" />
          </label>
          <label className="hub-label">
            Species
            <select value={form.species} onChange={set('species')} className="hub-field mt-1">
              <option value="">Not specified</option>
              {species.data?.species.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </label>
          <label className="hub-label">
            {type === 'transfer' ? 'From bed' : 'Seedbed'}
            <select required={needs('seedbed')} value={form.seedbed} onChange={set('seedbed')} className="hub-field mt-1">
              <option value="">Not specified</option>
              {beds.data?.map((b) => <option key={b.id} value={b.bedNumber}>Bed {b.bedNumber}</option>)}
            </select>
          </label>
          {type === 'transfer' && (
            <label className="hub-label">
              To bed
              <select required value={form.toSeedbed} onChange={set('toSeedbed')} className="hub-field mt-1">
                <option value="">Choose a bed</option>
                {beds.data?.map((b) => <option key={b.id} value={b.bedNumber}>Bed {b.bedNumber}</option>)}
              </select>
            </label>
          )}
          {(type === 'dispatch' || type === 'out_planting') && (
            <label className="hub-label">
              Destination
              <input required value={form.destination} onChange={set('destination')} maxLength={120} className="hub-field mt-1" />
            </label>
          )}
          <label className="hub-label sm:col-span-2 xl:col-span-3">
            Notes
            <input value={form.notes} onChange={set('notes')} maxLength={500} className="hub-field mt-1" />
          </label>
          <div className="sm:col-span-2 xl:col-span-3">
            <button disabled={busy} className="hub-btn hub-btn-primary">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Review draft
            </button>
          </div>
        </form>
        {draft && (draft.status === 'pending' || draft.status === 'draft') && (
          <DraftCard
            draft={draft}
            onSaved={(r) => { setDraft(null); setProblem(''); setSaved(`Saved ${r.description}. Status: Confirmed.`); onSaved(); }}
            onCancelled={() => { setDraft(null); setProblem(''); }}
          />
        )}
      </div>
    </section>
  );
}

// ── Verification ─────────────────────────────────────────────────────────────

export function VerifyPanel({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const records = useLoad<{ records: ActivityRecordView[] }>(
    () => readTool('get_activity_records', { status: 'confirmed', from: from || undefined, to: to || undefined, limit: 100 }),
    [from, to, refreshKey],
  );
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [problem, setProblem] = useState('');

  const review = async (r: ActivityRecordView, decision: 'verify' | 'reject') => {
    const reason = (reasons[r.id] ?? '').trim();
    if (decision === 'reject' && reason.length < 3) { setProblem('Enter a reason of at least 3 characters to reject a record.'); return; }
    setBusyId(r.id);
    setProblem('');
    const result = await writeTool('review_activity_record', { record_id: r.id, decision, reason });
    setBusyId(null);
    if (!result.ok) { setProblem(result.data?.message ?? 'Could not review the record.'); return; }
    onChanged();
    void records.reload();
  };

  return (
    <section className="hub-panel">
      <PanelHead title="Records to review" note="Latest 100 confirmed records waiting for verification">
        <RefreshButton onClick={() => void records.reload()} busy={records.loading} />
      </PanelHead>
      <div className="hub-panel-body space-y-4">
        {problem && <Problem text={problem} />}
        {records.error && <Problem text={records.error} />}
        {records.loading && !records.data ? (
          <EmptyState title="Loading verification queue" />
        ) : records.data?.records.length ? (
          <ul className="space-y-3">
            {records.data.records.map((r) => {
              const own = r.recordedByYou === true;
              return (
                <li key={r.id} className="rounded-md border border-forest-900/10 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Status status={r.status} />
                    <span className="font-semibold text-forest-900">{ACTIVITY_TYPES[r.type]?.label ?? r.type}</span>
                    <span className="text-forest-900/60">{formatQuantity(r.quantity)}</span>
                    <span className="text-forest-900/60">{formatDate(r.date)}</span>
                  </div>
                  <p className="mt-2 text-xs text-forest-900/65">
                    {r.species ? `${r.species}. ` : ''}
                    {r.seedbed !== null ? `Bed ${r.seedbed}${r.toSeedbed !== null ? ` to ${r.toSeedbed}` : ''}. ` : ''}
                    {r.destination ? `Destination: ${r.destination}. ` : ''}
                    Recorded by {r.recordedBy}
                    {r.version > 1 ? ` · version ${r.version}` : ''}
                  </p>
                  {own ? (
                    <p className="mt-3 text-xs text-forest-900/60">Another authorised person must review this record.</p>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="sr-only" htmlFor={`reason-${r.id}`}>Reason to reject</label>
                      <input
                        id={`reason-${r.id}`}
                        className="hub-field flex-1"
                        value={reasons[r.id] ?? ''}
                        onChange={(e) => setReasons((x) => ({ ...x, [r.id]: e.target.value }))}
                      />
                      <button type="button" onClick={() => void review(r, 'verify')} disabled={busyId === r.id} className="hub-btn hub-btn-primary">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Verify
                      </button>
                      <button type="button" onClick={() => void review(r, 'reject')} disabled={busyId === r.id} className="hub-btn hub-btn-danger">
                        <X className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No records are waiting for review" note="Confirmed records appear here until another authorised person reviews them." />
        )}
      </div>
    </section>
  );
}

// ── Audit trail ──────────────────────────────────────────────────────────────

export function AuditPanel({ refreshKey }: { refreshKey: number }) {
  const audit = useLoad<{ entries: any[] }>(() => readTool('get_audit_trail'), [refreshKey]);
  return (
    <section className="hub-panel">
      <PanelHead title="Audit trail" note="A permanent log of writes, reviews and denials">
        <RefreshButton onClick={() => void audit.reload()} busy={audit.loading} />
      </PanelHead>
      {audit.error && <div className="px-4 pt-4"><Problem text={audit.error} /></div>}
      <div className="hub-table-scroll">
        <table className="hub-table">
          <thead>
            <tr><th scope="col">When</th><th scope="col">User</th><th scope="col">Action</th><th scope="col">Result</th><th scope="col">Request</th><th scope="col">Channel</th></tr>
          </thead>
          <tbody>
            {audit.loading && !audit.data ? (
              <tr><td colSpan={6}><EmptyState title="Loading audit trail" /></td></tr>
            ) : audit.data?.entries.length ? audit.data.entries.map((a) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap text-forest-900/70">{new Date(a.ts).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })}</td>
                <td className="text-forest-900/70">{a.user_name ?? 'Not recorded'}</td>
                <td className="font-medium text-forest-900">{a.tool}</td>
                <td className="text-forest-900/70">{a.result}{a.confirmation ? ` (${a.confirmation})` : ''}</td>
                <td className="max-w-[260px] truncate text-forest-900/70" title={a.request_text ?? ''}>{a.request_text ?? 'Not recorded'}</td>
                <td className="text-forest-900/70">{a.channel ?? 'Not recorded'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6}><EmptyState title="No audit entries" note="Actions appear here as they happen." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────

export function TeamPanel({ myUserId, refreshKey }: { myUserId: string; refreshKey: number }) {
  const team = useLoad<{ members: any[]; seedbeds: any[] }>(() => readTool('list_team'), [refreshKey]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState('');
  const [notice, setNotice] = useState('');

  const runUpdate = async (label: string, args: Record<string, unknown>) => {
    setProblem('');
    setNotice('');
    const r = await writeTool('update_member', args);
    if (!r.ok) setProblem(r.data?.message ?? `Could not ${label}.`);
    else setNotice('Team updated.');
    void team.reload();
  };

  const assign = async (seedbedId: string, managerId: string) => {
    setProblem('');
    setNotice('');
    const r = await writeTool('assign_seedbed_manager', { seedbed_id: seedbedId, manager_id: managerId || null });
    if (!r.ok) setProblem(r.data?.message ?? 'Could not assign the seedbed manager.');
    else setNotice('Seedbed manager updated.');
    void team.reload();
  };

  const active = team.data?.members.filter((m) => m.status === 'active') ?? [];

  return (
    <div className="space-y-5">
      {problem && <Problem text={problem} />}
      {notice && <Notice text={notice} />}

      <section className="hub-panel">
        <PanelHead title="Team and roles" note="New sign-ups are active Keepers. Only the owner can grant Admin.">
          <RefreshButton onClick={() => void team.reload()} busy={team.loading} />
        </PanelHead>
        {team.error && <div className="px-4 pt-4"><Problem text={team.error} /></div>}
        <div className="hub-table-scroll">
          <table className="hub-table">
            <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Access</th></tr></thead>
            <tbody>
              {team.loading && !team.data ? (
                <tr><td colSpan={4}><EmptyState title="Loading team" /></td></tr>
              ) : team.data?.members.length ? team.data.members.map((m) => {
                const me = m.id === myUserId;
                return (
                  <tr key={m.id}>
                    <td>
                      <span className="font-semibold text-forest-900">{m.name}{me ? ' (you)' : ''}</span>
                      {m.user_status === 'unclaimed' && <span className="mt-0.5 block text-[11px] text-forest-900/50">Not signed in yet</span>}
                    </td>
                    <td>
                      {m.user_status === 'unclaimed' && !m.email ? (
                        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void runUpdate('set the email', { user_id: m.id, email: emails[m.id] }); }} className="flex gap-2">
                          <label className="sr-only" htmlFor={`email-${m.id}`}>Email for {m.name}</label>
                          <input id={`email-${m.id}`} type="email" required className="hub-field w-full min-w-[12rem]" value={emails[m.id] ?? ''} onChange={(e) => setEmails((x) => ({ ...x, [m.id]: e.target.value }))} />
                          <button className="hub-btn hub-btn-secondary">Set</button>
                        </form>
                      ) : <span className="text-forest-900/70">{m.email ?? 'Not recorded'}</span>}
                    </td>
                    <td>
                      <label className="sr-only" htmlFor={`role-${m.id}`}>Role for {m.name}</label>
                      <select id={`role-${m.id}`} disabled={me} value={m.role} onChange={(e) => void runUpdate('update the role', { user_id: m.id, role: e.target.value, status: 'active' })} className="hub-field">
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r as Role]}</option>)}
                      </select>
                    </td>
                    <td>
                      {me ? <span className="text-forest-900/70">Active</span> : (
                        <>
                          <label className="sr-only" htmlFor={`access-${m.id}`}>Access for {m.name}</label>
                          <select id={`access-${m.id}`} value={m.status} onChange={(e) => void runUpdate('update access', { user_id: m.id, status: e.target.value })} className="hub-field">
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4}><EmptyState title="No team members found" note="Members appear here when they are added to the Guardian Hub." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hub-panel">
        <PanelHead title="Seedbed managers" note="Assign an active member to each bed" />
        <div className="hub-panel-body">
          {team.data?.seedbeds.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {team.data.seedbeds.map((b) => (
                <label key={b.id} className="block rounded-md border border-forest-900/10 px-3 py-3">
                  <span className="hub-label">Bed {b.bedNumber}</span>
                  <select className="hub-field mt-1" value={active.find((m) => m.name === b.manager)?.id ?? ''} onChange={(e) => void assign(b.id, e.target.value)}>
                    <option value="">Unassigned</option>
                    {active.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </label>
              ))}
            </div>
          ) : (
            <EmptyState title="No seedbeds found" note="Seedbeds appear here when they are added to the nursery." />
          )}
        </div>
      </section>
    </div>
  );
}
