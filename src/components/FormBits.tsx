'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';
import type { FormStatus } from '@/lib/useMessageForm';

/** Hidden field that only bots fill in; the API silently drops those submissions. */
export function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormFeedback({ status, message }: { status: FormStatus; message: string }) {
  if (status !== 'success' && status !== 'error') return null;
  const ok = status === 'success';
  return (
    <div
      role={ok ? 'status' : 'alert'}
      className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs border ${
        ok
          ? 'bg-[#eef3ea] border-[#285b3c]/30 text-[#173d2b]'
          : 'bg-[#fbeceb] border-[#a33a2f]/30 text-[#7a2118]'
      }`}
    >
      {ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}
