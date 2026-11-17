'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Loader2, X, FileEdit } from 'lucide-react';
import { ACTIVITY_TYPES, type ActivityType } from '@/lib/guardian/constants';
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
    ['Location', 'Turako Nursery'],
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
    <div className="mt-2 rounded-xl border border-[#c3a66b]/50 bg-[#f7f6f0] p-3 sm:p-4 text-xs space-y-3" aria-label="Activity draft">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-bold text-[#7a5f22]">
          <FileEdit className="w-4 h-4" />
          {draft.correctionOf ? 'Correction draft' : 'Activity draft'}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pending ? 'bg-[#fbf3e2] text-[#7a5f22] border-[#c3a66b]/60' : 'bg-[#f1f0e9] text-[#3f4a42]/70 border-[#173d2b]/10'}`}>
          {pending ? 'Ready to save' : 'Answer the question'}
        </span>
      </div>

      <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[#3f4a42]/60">{k}</dt>
            <dd className={v ? 'text-[#173d2b] font-semibold' : 'text-[#3f4a42]/40 italic'}>{v ?? 'Not given'}</dd>
          </div>
        ))}
        {draft.correctionReason && (
          <div className="contents">
            <dt className="text-[#3f4a42]/60">Reason</dt>
            <dd className="text-[#173d2b]">{draft.correctionReason}</dd>
          </div>
        )}
      </dl>

      {pending && draft.warnings.length > 0 && (
        <div className="rounded-lg border border-[#c3a66b]/60 bg-[#fbf3e2] p-2.5 space-y-1.5">
          {draft.warnings.map((w) => (
            <p key={w} className="flex items-start gap-1.5 text-[#7a5f22]"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#b08d45]" />{w}</p>
          ))}
          <label className="flex items-center gap-2 text-[#7a5f22] font-semibold cursor-pointer pt-1">
            <input type="checkbox" checked={ack || !!f.acknowledged} onChange={(e) => setAck(e.target.checked)} className="accent-[#285b3c]" />
            I have checked the warnings
          </label>
        </div>
      )}

      {error && <p role="alert" className="text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {pending && (
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="px-3 py-2 rounded-lg bg-[#173d2b] hover:bg-[#285b3c] disabled:opacity-40 text-[#f7f6f0] font-bold flex items-center gap-1.5"
          >
            {busy === 'save' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save
          </button>
        )}
        <button
          type="button"
          onClick={cancel}
          disabled={!!busy}
          className="px-3 py-2 rounded-lg border border-[#173d2b]/20 hover:bg-[#173d2b]/5 text-[#173d2b] font-semibold flex items-center gap-1.5"
        >
          {busy === 'cancel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          Cancel
        </button>
      </div>
      <p className="text-[10px] text-[#3f4a42]/50">Nothing is saved until you confirm. This does not use a prompt.</p>
    </div>
  );
}
