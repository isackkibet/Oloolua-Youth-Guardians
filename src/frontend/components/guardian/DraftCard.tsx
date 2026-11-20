'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Loader2, X, FileEdit } from 'lucide-react';
import { ACTIVITY_TYPES, type ActivityType } from '@shared/guardian/constants';
import { api, formatDate, fmt, type DraftView } from './api';

interface Props {
  draft: DraftView;
  onSaved: (saved: { recordId: string; status: string; version: number; description: string }) => void;
  onCancelled: () => void;
}

/** B5 review step: the exact values are shown before anything is saved. */
export default function DraftCard({ draft, onSaved, onCancelled }: Props) {
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState<'save' | 'cancel' | null>(null);
  const [error, setError] = useState('');
  const f = draft.fields;
  const type = f.type && f.type in ACTIVITY_TYPES ? ACTIVITY_TYPES[f.type as ActivityType].label : null;

  const rows: [string, string | null][] = [
    ['Activity', type],
    ['Quantity', f.quantity !== undefined ? `${fmt(f.quantity)} seedlings` : null],
    ['Date', f.date ? formatDate(f.date) : null],
    ['Species', f.species ?? null],
    [f.type === 'transfer' ? 'From bed' : 'Seedbed', f.seedbed ? `Bed ${f.seedbed}` : null],
    ...(f.type === 'transfer' ? [['To bed', f.toSeedbed ? `Bed ${f.toSeedbed}` : null] as [string, string | null]] : []),
    ...(f.type === 'dispatch' || f.type === 'out_planting' ? [['Destination', f.destination ?? null] as [string, string | null]] : []),
    ...(f.notes ? [['Notes', f.notes] as [string, string | null]] : []),
  ];

  const save = async () => {
    setBusy('save'); setError('');
    const r = await api(`/api/guardian/drafts/${draft.id}/confirm`, { body: { acknowledged: ack } });
    setBusy(null);
    if (r.ok) onSaved(r.data.saved);
    else setError(r.data?.error ?? 'Could not save. Please try again.');
  };
  const cancel = async () => {
    setBusy('cancel'); setError('');
    await api(`/api/guardian/drafts/${draft.id}/cancel`, { body: {} });
    setBusy(null);
    onCancelled();
  };

  const pending = draft.status === 'pending';
  const canSave = pending && (!draft.needsAcknowledgement || ack) && !busy;

  return (
    <div className="hub-draft" aria-label="Activity draft">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold text-forest-900">
          <FileEdit className="h-4 w-4" aria-hidden="true" />
          {draft.correctionOf ? 'Correction draft' : 'Activity draft'}
        </span>
        <span className={`hub-status ${pending ? 'hub-status-confirmed' : 'hub-status-corrected'}`}>
          {pending ? 'Ready to save' : 'Answer required'}
        </span>
      </div>

      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt>{k}</dt>
            <dd className={v ? '' : 'font-normal italic text-forest-900/45'}>{v ?? 'Not provided'}</dd>
          </div>
        ))}
        {draft.correctionReason && (
          <div className="contents">
            <dt>Reason</dt>
            <dd>{draft.correctionReason}</dd>
          </div>
        )}
      </dl>

      {pending && draft.warnings.length > 0 && (
        <div className="rounded-md border border-forest-200 bg-white p-3">
          {draft.warnings.map((w) => (
            <p key={w} className="flex items-start gap-2 text-xs text-forest-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" aria-hidden="true" />
              {w}
            </p>
          ))}
          <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-forest-900">
            <input type="checkbox" checked={ack || !!f.acknowledged} onChange={(e) => setAck(e.target.checked)} className="accent-forest-700" />
            I have checked the warnings
          </label>
        </div>
      )}

      {error && <p role="alert" className="hub-message">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {pending && (
          <button type="button" onClick={save} disabled={!canSave} className="hub-btn hub-btn-primary">
            {busy === 'save' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            Save
          </button>
        )}
        <button type="button" onClick={cancel} disabled={!!busy} className="hub-btn hub-btn-secondary">
          {busy === 'cancel' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
          Cancel
        </button>
      </div>
      <p className="text-[11px] text-forest-900/50">Nothing is saved until you confirm. This does not use a prompt.</p>
    </div>
  );
}
