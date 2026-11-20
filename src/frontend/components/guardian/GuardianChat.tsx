'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot, Send, Mic, MicOff, Volume2, VolumeX, Square, Loader2, Database, BookOpen, Library, Globe,
  CheckCircle2,
} from 'lucide-react';
import { can, type Role, type SourceLabel } from '@shared/guardian/constants';
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
    return <span className="text-[11px] text-forest-900/45">No Guardian data used</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {sources.map((s) => {
        const Icon = SOURCE_ICONS[s];
        return (
          <span key={s} className="hub-chip px-2 py-0.5 text-[10px]">
            <Icon className="h-3 w-3" aria-hidden="true" /> {s}
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map(([k, v]) => (
          <div key={k} className="rounded-md border border-forest-900/10 bg-white p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-forest-900/50">{k}</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-forest-900">{v}</p>
          </div>
        ))}
      </div>
      {panel.asOf && <p className="mt-1 text-[11px] text-forest-900/50">Baseline as of {formatDate(panel.asOf)}. Capacity is not current stock.</p>}
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

  return (
    <div className="hub-chat">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-900/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-forest-50 text-forest-700">
            <Bot className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-forest-900">AI Guardian</span>
            <span className="block text-[11px] text-forest-900/55">Answers come only from Guardian records.</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {quota && (
            <span className={`hub-chip ${outOfPrompts ? 'border-red-200 bg-red-50 text-red-700' : ''}`} aria-live="polite">
              {quota.exempt ? 'Unlimited prompts' : `Prompts left: ${quota.remaining} of ${quota.limit}${quota.period === 'daily' ? ' today' : ''}`}
            </span>
          )}
          <label className="sr-only" htmlFor="voice-language">Voice language</label>
          <select id="voice-language" value={lang} onChange={(e) => setLang(e.target.value)} className="hub-field w-auto py-1 text-xs">
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button
            type="button"
            onClick={() => { setSpeakReplies((s) => !s); stopSpeaking(); }}
            aria-pressed={speakReplies}
            aria-label={speakReplies ? 'Turn spoken replies off' : 'Turn spoken replies on'}
            className="hub-btn hub-btn-quiet px-2"
          >
            {speakReplies ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-forest-900">Hello {firstName}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-forest-900/60">
              Ask about the nursery{can(role, 'record') ? ' or record an activity' : ''}. Type a question or use voice input where supported.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`hub-chat-message ${
              m.role === 'user' ? 'hub-chat-user' : m.error ? 'hub-chat-error' : 'hub-chat-assistant'
            }`}>
              {m.role === 'user' && m.channel === 'voice' && (
                <p className="mb-1 flex items-center gap-1 text-[10px] text-white/70"><Mic className="h-3 w-3" aria-hidden="true" /> Voice transcript</p>
              )}
              <p className="whitespace-pre-wrap break-words">{m.text}</p>
              {m.saved && <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-forest-700"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Record saved</p>}
              {m.panel && <PanelView panel={m.panel} />}
              {m.draft && m.id === latestDraftMsgId && openDraft && openDraft.id === m.draft.id && (
                <DraftCard draft={openDraft} onSaved={onDraftSaved} onCancelled={onDraftCancelled} />
              )}
              {m.role === 'assistant' && !m.error && <div className="mt-1.5"><SourceTags sources={m.sources} /></div>}
            </div>
          </div>
        ))}
        {busy && (
          <p className="flex items-center gap-2 text-xs text-forest-900/60" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking records...
          </p>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="space-y-2 border-t border-forest-900/10 p-3">
        {outOfPrompts && !openDraft && (
          <p role="status" className="text-xs text-red-700">You have used all your prompts. Hub tools still work. Confirming a draft is free.</p>
        )}
        {openDraft?.question && <p className="hub-notice" role="status">{openDraft.question}</p>}
        <div className="flex items-end gap-2">
          <label htmlFor="guardian-input" className="sr-only">Message AI Guardian</label>
          <textarea
            id="guardian-input"
            rows={1}
            value={input}
            disabled={inputLocked}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            className="hub-field max-h-32 flex-1 resize-none"
          />
          {speaking && (
            <button type="button" onClick={stopSpeaking} aria-label="Stop speaking" className="hub-btn hub-btn-secondary px-2.5">
              <Square className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            disabled={!voiceSupported || inputLocked}
            aria-pressed={listening}
            aria-label={voiceSupported ? (listening ? 'Stop listening' : 'Speak') : 'Voice input is not supported in this browser'}
            className={`hub-btn px-2.5 ${listening ? 'bg-red-600 text-white hover:bg-red-700' : 'hub-btn-secondary'}`}
          >
            {listening ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="submit" disabled={inputLocked || !input.trim()} className="hub-btn hub-btn-primary px-2.5" aria-label="Send message">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        <p className="text-[11px] text-forest-900/50">
          Voice uses your browser. We receive text only and store no audio. Chats are not saved as records.
        </p>
      </form>
    </div>
  );
}
