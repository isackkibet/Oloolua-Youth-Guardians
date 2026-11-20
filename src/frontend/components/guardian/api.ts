'use client';

import type { ActivityType, RecordStatus, Role, SourceLabel } from '@shared/guardian/constants';

/** Client-side mirrors of the server types (kept structural to avoid importing server code). */
export interface DraftView {
  id: string;
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled';
  fields: {
    type?: string; quantity?: number; date?: string; species?: string; seedbed?: number;
    toSeedbed?: number; destination?: string; notes?: string; acknowledged?: boolean;
  };
  awaiting: string | null;
  question: string | null;
  readBack: string | null;
  warnings: string[];
  needsAcknowledgement: boolean;
  correctionOf: string | null;
  correctionReason: string | null;
  expiresAt: string;
}

export interface NurserySummaryView {
  nurseryName: string;
  location: string | null;
  readyStockVerified: number;
  readyStockPendingNet: number;
  capacity: number | null;
  speciesCount: number;
  activeSeedbeds: number;
  baseline: { asOf: string; source: string; status: string } | null;
}

export interface SeedbedView {
  id: string;
  bedNumber: number;
  method: string | null;
  manager: string | null;
  managerId: string | null;
  capacityMax: number | null;
  currentStock: number | null;
  status: string;
}

export interface SpeciesView {
  id: string;
  name: string;
  scientificName: string | null;
}

export interface ActivityRecordView {
  id: string;
  type: ActivityType;
  date: string;
  quantity: number;
  species: string | null;
  seedbed: number | null;
  toSeedbed: number | null;
  destination: string | null;
  notes: string | null;
  recordedBy: string;
  status: RecordStatus;
  version: number;
  correctionReason: string | null;
  reviewedBy: string | null;
  reviewReason: string | null;
  createdAt: string;
  supersedesId?: string | null;
  recordedByYou?: boolean;
}

export interface KnowledgeDocView {
  id: string;
  title: string;
  snippet: string;
  url: string | null;
}

export interface InventoryView {
  readyStockVerified: number;
  confirmedNotYetVerifiedNetChange: number;
  baseline: { asOf: string; source: string; status: string } | null;
  byBed: { bed: number; verifiedStock: number | null; pendingNet: number }[];
}

export interface TeamMemberView {
  id: string;
  name: string;
  email: string | null;
  user_status: string;
  role: Role;
  status: 'active' | 'pending' | 'suspended';
  last_login_at: string | null;
  beds: number[] | null;
}

export interface DiaryEntryView {
  id: number;
  ts: string;
  actor: string | null;
  eventType: string;
  description: string;
  status: string;
}

export interface Panel { readyStock: number; capacity: number | null; species: number; seedbeds: number; asOf: string | null }

export interface Quota { limit: number; used: number; remaining: number; period: 'total' | 'daily'; exempt: boolean }

export interface SessionInfo {
  authConfigured: boolean;
  authConfigMissing?: string[];
  devLogin: boolean;
  aiEnabled: boolean;
  privy?: boolean;
  passwordAuth?: boolean;
  signedIn: boolean;
  user?: { id: string; name: string; email: string | null };
  role?: Role | null;
  membershipStatus?: 'active' | 'pending' | 'suspended' | 'none';
  quota?: Quota | null;
  error?: string;
}

export interface ChatResponse {
  reply: string;
  sources: SourceLabel[];
  panel?: Panel;
  draft?: DraftView | null;
  saved?: { recordId: string; status: string; version: number; description: string };
  counted: boolean;
  mode: string;
  quota?: Quota;
  error?: string;
}

export async function api<T = any>(path: string, init?: { method?: string; body?: unknown }): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(path, {
    method: init?.method ?? (init?.body !== undefined ? 'POST' : 'GET'),
    headers: init?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

/** Read tool via GET (no prompt used). */
export function readTool<T = any>(name: string, args?: Record<string, unknown>) {
  return api<{ ok: boolean; data: T; message?: string; error?: string }>(
    `/api/guardian/tools/${name}${args ? `?args=${encodeURIComponent(JSON.stringify(args))}` : ''}`,
  );
}

/** Write tool via POST (no prompt used). */
export function writeTool<T = any>(name: string, args: Record<string, unknown>) {
  return api<{ ok: boolean; data: T; message?: string; error?: string }>(`/api/guardian/tools/${name}`, { body: args });
}

export const fmt = (n: number) => n.toLocaleString('en-US');

export function formatDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: iso.length === 10 ? 'UTC' : 'Africa/Nairobi' }).format(d);
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
