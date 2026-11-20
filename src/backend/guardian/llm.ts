export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

export interface ToolSchema {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

export interface ChatSession {
  ask(tools: ToolSchema[]): Promise<ChatMessage>;
  addToolResult(callId: string, output: string): void;
}

type Json = Record<string, any>;

const XAI_BASE = 'https://api.x.ai/v1';
const XAI_MODEL = 'grok-4.7';
const XAI_EFFORTS = new Set(['low', 'medium', 'high', 'xhigh']);

function env(name: string): string {
  return (process.env[name] ?? '').trim();
}

function apiBase(value: string, fallback: string): string {
  let base = (value || fallback).replace(/\/+$/, '');
  if (!/\/v\d+/.test(base)) base += '/v1';
  return base;
}

function timeoutMs(): number {
  const value = Number(env('AI_TIMEOUT_MS'));
  return Number.isFinite(value) && value >= 1000 ? Math.min(value, 300_000) : 50_000;
}

export function isGrokProvider(): boolean {
  const provider = env('AI_PROVIDER').toLowerCase();
  if (provider === 'grok' || provider === 'xai') return true;
  if (provider === 'openai' || provider === 'openai-compatible' || provider === 'compatible') return false;
  return !!env('XAI_API_KEY') || /api\.x\.ai/i.test(env('AI_BASE_URL'));
}

export function aiConfigured(): boolean {
  const key = isGrokProvider() ? env('XAI_API_KEY') || env('AI_API_KEY') : env('AI_API_KEY');
  return !!key;
}

function grokConfig() {
  const model = env('XAI_MODEL') || (env('AI_MODEL').startsWith('grok') ? env('AI_MODEL') : '') || XAI_MODEL;
  const effort = env('XAI_REASONING_EFFORT').toLowerCase();
  return {
    key: env('XAI_API_KEY') || env('AI_API_KEY'),
    base: apiBase(env('XAI_BASE_URL'), XAI_BASE),
    model,
    effort: XAI_EFFORTS.has(effort) ? effort : 'high',
  };
}

function genericConfig() {
  return {
    key: env('AI_API_KEY'),
    base: apiBase(env('AI_BASE_URL'), 'https://api.openai.com/v1'),
    model: env('AI_MODEL') || 'gpt-4o-mini',
  };
}

async function postJson(url: string, key: string, body: Json): Promise<Json> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs()),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI provider returned ${res.status}: ${detail.slice(0, 300)}`);
  }
  return await res.json() as Json;
}

function normaliseInput(messages: ChatMessage[]): Json[] {
  return messages.map((message) => {
    if (message.role === 'tool' && message.tool_call_id) {
      return { type: 'function_call_output', call_id: message.tool_call_id, output: message.content ?? '' };
    }
    return { role: message.role, content: message.content ?? '' };
  });
}

function grokTools(tools: ToolSchema[]) {
  return tools.map((tool) => ({
    type: 'function',
    name: tool.function.name,
    description: tool.function.description,
    parameters: tool.function.parameters,
  }));
}

function outputText(output: Json[], fallback: unknown): string {
  const parts: string[] = [];
  for (const item of output) {
    if (item?.type !== 'message' || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if ((part?.type === 'output_text' || part?.type === 'text') && typeof part.text === 'string') {
        parts.push(part.text);
      }
    }
  }
  return parts.join('') || (typeof fallback === 'string' ? fallback : '');
}

function outputToolCalls(output: Json[]): ChatMessage['tool_calls'] {
  const calls: NonNullable<ChatMessage['tool_calls']> = [];
  for (const item of output) {
    if (item?.type !== 'function_call') continue;
    const callId = typeof item.call_id === 'string' ? item.call_id : typeof item.id === 'string' ? item.id : '';
    const name = typeof item.name === 'string' ? item.name : typeof item.function?.name === 'string' ? item.function.name : '';
    if (!callId || !name) continue;
    const args = typeof item.arguments === 'string'
      ? item.arguments
      : typeof item.function?.arguments === 'string'
        ? item.function.arguments
        : JSON.stringify(item.arguments ?? item.function?.arguments ?? {});
    calls.push({ id: callId, type: 'function', function: { name, arguments: args } });
  }
  return calls.length ? calls : undefined;
}

function createGrokSession(messages: ChatMessage[]): ChatSession {
  const config = grokConfig();
  const input = normaliseInput(messages);
  return {
    async ask(tools) {
      if (!config.key) throw new Error('Grok is not configured');
      const json = await postJson(`${config.base}/responses`, config.key, {
        model: config.model,
        input,
        reasoning: { effort: config.effort },
        store: false,
        include: ['reasoning.encrypted_content'],
        ...(tools.length ? { tools: grokTools(tools), tool_choice: 'auto' } : {}),
      });
      const output = Array.isArray(json.output) ? json.output as Json[] : [];
      if (!output.length) throw new Error('Grok returned no output');
      input.push(...output);
      const text = outputText(output, json.output_text);
      const toolCalls = outputToolCalls(output);
      return { role: 'assistant', content: text || null, ...(toolCalls ? { tool_calls: toolCalls } : {}) };
    },
    addToolResult(callId, output) {
      input.push({ type: 'function_call_output', call_id: callId, output });
    },
  };
}

function createGenericSession(messages: ChatMessage[]): ChatSession {
  const config = genericConfig();
  return {
    async ask(tools) {
      if (!config.key) throw new Error('AI provider is not configured');
      const json = await postJson(`${config.base}/chat/completions`, config.key, {
        model: config.model,
        messages,
        ...(tools.length ? { tools, tool_choice: 'auto' } : {}),
        temperature: 0.2,
        max_tokens: 900,
      });
      const msg = json?.choices?.[0]?.message as Json | undefined;
      if (!msg) throw new Error('AI provider returned no message');
      const reply: ChatMessage = {
        role: 'assistant',
        content: typeof msg.content === 'string' ? msg.content : null,
        ...(Array.isArray(msg.tool_calls) ? { tool_calls: msg.tool_calls } : {}),
      };
      messages.push(reply);
      return reply;
    },
    addToolResult(callId, output) {
      messages.push({ role: 'tool', tool_call_id: callId, content: output });
    },
  };
}

export function createChatSession(messages: ChatMessage[]): ChatSession {
  return isGrokProvider() ? createGrokSession(messages) : createGenericSession(messages);
}

export async function chat(messages: ChatMessage[], tools: ToolSchema[]): Promise<ChatMessage> {
  return createChatSession(messages).ask(tools);
}
