'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot, Send, Mic, MicOff, Volume2, VolumeX, Square, Loader2, Database, BookOpen, Library, Globe,
  CheckCircle2, Sparkles,
} from 'lucide-react';
import { can, type Role, type SourceLabel } from '@/lib/guardian/constants';
import DraftCard from './DraftCard';
import { api, fmt, formatDate, type ChatResponse, type DraftView, type Panel, type Quota } from './api';

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  channel?: 'text' | 'voice';
  sources?: SourceLabel[];
  panel?: Panel;
  draft?: DraftView | null;
  saved?: ChatResponse['saved'];
  error?: boolean;
}

// Minimal Web Speech API types (not in TypeScript's DOM lib).
interface SpeechRecognitionResultLike { isFinal: boolean; 0: { transcript: string } }
interface SpeechRecognitionLike {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  onresult: ((e: { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}

const SOURCE_ICONS: Record<SourceLabel, typeof Database> = {
  'Guardian Database': Database,
  'Keeper Diary': BookOpen,
  'Guardian Knowledge Base': Library,
  'External Source': Globe,
};

const LANGS = [
  { code: 'en-KE', label: 'English' },
  { code: 'sw-KE', label: 'Kiswahili' },
];

function SourceTags({ sources }: { sources?: SourceLabel[] }) {
  if (!sources) return null;
  if (sources.length === 0) {
    return <span className="text-[10px] text-[#3f4a42]/50">No Guardian data used</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {sources.map((s) => {
        const Icon = SOURCE_ICONS[s];
        return (
          <span key={s} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
            s === 'External Source' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-[#eaf1ea] text-[#285b3c] border-[#285b3c]/20'
          }`}>
            <Icon className="w-3 h-3" /> {s}
          </span>
        );
      })}
    </span>
  );
}

function PanelView({ panel }: { panel: Panel }) {
  const tiles = [
    ['Nursery capacity', panel.capacity !== null ? fmt(panel.capacity) : '-'],
    ['Currently ready', fmt(panel.readyStock)],
    ['Cataloged species', String(panel.species)],
    ['Active seedbeds', String(panel.seedbeds)],
  ];
  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tiles.map(([k, v]) => (
          <div key={k} className="rounded-lg bg-white border border-[#173d2b]/10 p-2.5">
            <div className="text-[10px] text-[#3f4a42]/60 uppercase tracking-wide">{k}</div>
            <div className="text-lg font-black text-[#173d2b] tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      {panel.asOf && <p className="text-[10px] text-[#3f4a42]/50 mt-1">Baseline as of {formatDate(panel.asOf)}. Capacity is not current stock.</p>}
    </div>
  );
}

interface Props {
  role: Role;
  firstName: string;
  quota: Quota | null;
  onQuota: (q: Quota) => void;
  onRecordSaved: () => void;
}

export default function GuardianChat({ role, firstName, quota, onQuota, onRecordSaved }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [openDraft, setOpenDraft] = useState<DraftView | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [lang, setLang] = useState('en-KE');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef('');
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const lastChannel = useRef<'text' | 'voice'>('text');
  // The recognizer's callbacks outlive renders; call the latest send() through a ref.
  const sendRef = useRef<(text: string, channel?: 'text' | 'voice') => Promise<void>>(async () => {});

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    api<{ draft: DraftView | null }>('/api/guardian/drafts').then((r) => r.ok && setOpenDraft(r.data.draft));
    return () => {
      recognition.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy]);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const speak = useCallback((text: string, then?: () => void) => {
    if (!('speechSynthesis' in window)) return then?.();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\n/g, '. '));
    u.lang = lang;
    u.rate = 0.95;
    u.onend = () => { setSpeaking(false); then?.(); };
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [lang]);

  const startListening = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    stopSpeaking(); // the user can interrupt speech at any time
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    transcriptRef.current = '';
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      transcriptRef.current = text;
      setInput(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const said = transcriptRef.current.trim();
      if (said) void sendRef.current(said, 'voice');
    };
    recognition.current = rec;
    setListening(true);
    rec.start();
  }, [lang]);

  const stopListening = () => recognition.current?.stop();

  const send = async (raw: string, channel: 'text' | 'voice' = 'text') => {
    const text = raw.trim();
    if (!text || busy) return;
    lastChannel.current = channel;
    const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.text }));
    setMessages((m) => [...m, { id: nextId.current++, role: 'user', text, channel }]);
    setInput('');
    setBusy(true);
    const r = await api<ChatResponse>('/api/guardian/chat', { body: { message: text, history, channel } });
    setBusy(false);
    const data = r.data ?? ({} as ChatResponse);
    if (data.quota) onQuota(data.quota);
    if (!r.ok && !data.reply) {
      setMessages((m) => [...m, { id: nextId.current++, role: 'assistant', text: data.error ?? 'Something went wrong. Please try again.', error: true }]);
      return;
    }
    if (data.draft !== undefined) setOpenDraft(data.draft && (data.draft.status === 'draft' || data.draft.status === 'pending') ? data.draft : null);
    if (data.saved) { setOpenDraft(null); onRecordSaved(); }
    setMessages((m) => [...m, {
      id: nextId.current++, role: 'assistant', text: data.reply, sources: data.sources, panel: data.panel,
      draft: data.draft ?? undefined, saved: data.saved,
    }]);
    if (channel === 'voice' && speakReplies) {
      // B9: read the draft back aloud, then listen for yes or no.
      const awaitingVoiceAnswer = !!data.draft && (data.draft.status === 'pending' || data.draft.status === 'draft');
      const spoken = data.draft?.status === 'pending' ? `${data.reply} Say yes to save, or no to cancel.` : data.reply;
      speak(spoken, awaitingVoiceAnswer ? startListening : undefined);
    }
  };

  sendRef.current = send;

  const onDraftSaved = (saved: NonNullable<ChatResponse['saved']>) => {
    setOpenDraft(null);
    setMessages((m) => [...m, { id: nextId.current++, role: 'assistant', text: `Saved: ${saved.description}. Status: Confirmed. It is now in the Keeper Diary and waits for verification by another authorised person.`, sources: ['Guardian Database', 'Keeper Diary'], saved }]);
    onRecordSaved();
  };
  const onDraftCancelled = () => {
    setOpenDraft(null);
    setMessages((m) => [...m, { id: nextId.current++, role: 'assistant', text: 'Okay, I cancelled that draft. Nothing was saved.', sources: [] }]);
  };

  const outOfPrompts = !!quota && !quota.exempt && quota.remaining <= 0;
  const inputLocked = busy || (outOfPrompts && !openDraft);
  const latestDraftMsgId = [...messages].reverse().find((m) => m.draft)?.id;

  const suggestions = [
    'How many seedlings are ready?',
    'Show the seedbeds',
    'What was recorded yesterday?',
    ...(can(role, 'record') ? ['Record that 40 seedlings were potted today'] : []),
  ];

  return (
    <div className="flex flex-col h-[70vh] min-h-[480px] rounded-2xl bg-white border border-[#173d2b]/10 overflow-hidden shadow-[0_1px_0_rgba(23,61,43,0.04)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#173d2b]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#eaf1ea] border border-[#285b3c]/15 flex items-center justify-center text-[#285b3c]"><Bot className="w-5 h-5" /></div>
          <div>
            <div className="font-bold text-[#173d2b] text-sm">AI Guardian</div>
            <div className="text-[10px] text-[#285b3c]">Answers come only from Guardian records.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {quota && (
            <span className={`px-2 py-1 rounded-lg font-semibold border ${outOfPrompts ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#f7f6f0] text-[#3f4a42] border-[#173d2b]/10'}`} aria-live="polite">
              {quota.exempt ? 'Unlimited prompts' : `Prompts left: ${quota.remaining} of ${quota.limit}${quota.period === 'daily' ? ' today' : ''}`}
            </span>
          )}
          <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Voice language" className="bg-[#f7f6f0] border border-[#173d2b]/15 rounded-lg px-1.5 py-1 text-[#252b27] focus:outline-none focus:border-[#285b3c]">
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button
            type="button"
            onClick={() => { setSpeakReplies((s) => !s); stopSpeaking(); }}
            aria-pressed={speakReplies}
            title={speakReplies ? 'Spoken replies on (for voice questions)' : 'Spoken replies off'}
            className="p-1.5 rounded-lg hover:bg-[#173d2b]/5 text-[#3f4a42]/70"
          >
            {speakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-[#c3a66b]" />
            <p className="text-sm text-[#3f4a42]">Hello {firstName}. Ask about the nursery{can(role, 'record') ? ' or record an activity' : ''}. Type or speak your question.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s} type="button" disabled={inputLocked} onClick={() => send(s)} className="px-3 py-1.5 rounded-full bg-[#f7f6f0] border border-[#173d2b]/12 hover:border-[#285b3c]/40 hover:bg-white text-xs text-[#252b27] disabled:opacity-40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
              m.role === 'user' ? 'bg-[#173d2b] text-[#f7f6f0] rounded-br-sm' : m.error ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-sm' : 'bg-[#f7f6f0] border border-[#173d2b]/10 text-[#252b27] rounded-bl-sm'
            }`}>
              {m.role === 'user' && m.channel === 'voice' && <div className="text-[10px] text-[#dce8dc] mb-0.5 flex items-center gap-1"><Mic className="w-3 h-3" /> Voice transcript</div>}
              <p className="whitespace-pre-wrap break-words">{m.text}</p>
              {m.saved && <p className="mt-1.5 flex items-center gap-1 text-[#285b3c] text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Record saved</p>}
              {m.panel && <PanelView panel={m.panel} />}
              {m.draft && m.id === latestDraftMsgId && openDraft && openDraft.id === m.draft.id && (
                <DraftCard draft={openDraft} onSaved={onDraftSaved} onCancelled={onDraftCancelled} />
              )}
              {m.role === 'assistant' && !m.error && <div className="mt-1.5"><SourceTags sources={m.sources} /></div>}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-[#3f4a42]/60"><Loader2 className="w-4 h-4 animate-spin" /> Checking records...</div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="border-t border-[#173d2b]/10 p-3 space-y-2">
        {outOfPrompts && !openDraft && (
          <p role="status" className="text-xs text-red-700">You have used all your prompts. Hub tools still work. Confirming a draft is free.</p>
        )}
        {openDraft && openDraft.status === 'draft' && (
          <p className="text-xs text-[#7a5f22]">This answer does not use a prompt.</p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="guardian-input" className="sr-only">Message AI Guardian</label>
          <textarea
            id="guardian-input"
            rows={1}
            value={input}
            disabled={inputLocked}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            placeholder={listening ? 'Listening...' : openDraft?.question ?? 'Ask AI Guardian...'}
            className="flex-1 resize-none bg-[#f7f6f0] border border-[#173d2b]/15 rounded-xl px-3 py-2.5 text-sm text-[#252b27] placeholder:text-[#252b27]/35 focus:outline-none focus:border-[#285b3c] focus:bg-white disabled:opacity-50"
          />
          {speaking && (
            <button type="button" onClick={stopSpeaking} title="Stop speaking" className="p-2.5 rounded-xl bg-[#173d2b]/10 hover:bg-[#173d2b]/15 text-[#173d2b]">
              <Square className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            disabled={!voiceSupported || inputLocked}
            title={voiceSupported ? (listening ? 'Stop listening' : 'Speak') : 'Voice input is not supported in this browser. Please type.'}
            aria-pressed={listening}
            className={`p-2.5 rounded-xl disabled:opacity-40 ${listening ? 'bg-red-600 text-white animate-pulse' : 'bg-[#f1f0e9] hover:bg-[#e7e5db] text-[#173d2b]'}`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button type="submit" disabled={inputLocked || !input.trim()} className="p-2.5 rounded-xl bg-[#173d2b] hover:bg-[#285b3c] text-[#f7f6f0] disabled:opacity-40" aria-label="Send">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-[#3f4a42]/50">
          Voice uses your browser. We receive text only and store no audio. Chats are not saved as records.
        </p>
      </form>
    </div>
  );
}
