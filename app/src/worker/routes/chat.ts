import { COMPANION_MODEL, parseCompanionEffort, type CompanionEffort } from '../../companionModel'
import { evaluateChatAccess, type ChatProfile } from '../lib/chatAccess'
import {
  createBookRetrieval,
  parseBookRef,
  parseReadingTrailChapters,
  type AssetsBinding,
  type BookRef,
  type BookRetrieval,
  type ToolOutcome,
} from '../lib/bookRetrieval'
import { corsHeaders, jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from '../lib/supabase'

export type ChatEnv = SupabaseEnv & {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  /** Static assets; present in production, optional so older tests keep working. */
  ASSETS?: AssetsBinding
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: ChatEnv, request: Request) => Promise<VerifiedUser | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

const CHAT_MODEL = COMPANION_MODEL
const MAX_TOKENS_CAP = 2048
// 100KB was too tight: with 50 messages × full chat history replayed every
// turn (incl. highlighted passages), long-running readers hit 413 mid-session.
// 500KB matches MAX_MESSAGES × MAX_MESSAGE_LENGTH and leaves headroom for
// the system prompt + JSON envelope.
const MAX_REQUEST_BODY_BYTES = 500_000
// Raised from 4000 (2026-05-08) when the client started injecting the
// full current-chapter text into the system prompt — necessary so the
// model grounds chapter-level questions in the actual prose instead of
// its training memory (which mixes chapter numbering across editions).
// Most chapters are 4-15K chars; cap at 32K to bound worst-case (e.g.
// an Iliad book) while staying well under the model's 200K-token
// context window. Total bytes still bounded by MAX_REQUEST_BODY_BYTES.
export const MAX_SYSTEM_PROMPT_LENGTH = 32_000
const MAX_MESSAGES = 50
// Per-message cap so a single bloated turn can't blow the budget. 10K chars
// is ~2K tokens — a generous ceiling for any real reader question.
const MAX_MESSAGE_LENGTH = 10_000
/**
 * In-book retrieval: how many times per request the model may call
 * read_chapter / find_in_book before it must answer. Each round re-sends
 * the prompt, so this is also the cost ceiling (MAX_TOOL_ROUNDS + 1 calls).
 */
export const MAX_TOOL_ROUNDS = 4

type AnthropicSystemBlock = {
  type: 'text'
  text: string
  cache_control?: { type: 'ephemeral' }
}

type AnthropicSystemParam = string | AnthropicSystemBlock[]

type AnthropicUsage = {
  input_tokens?: number
  output_tokens?: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}

type ParsedChatBody = {
  max_tokens?: number
  system?: unknown
  messages?: unknown[]
  stream?: boolean
  /** Sonnet 5 depth control; omitted = the API default. */
  effort?: unknown
  /** Enables read_chapter / find_in_book for this book + edition (lab reader). */
  book?: unknown
  /** Recently visited chapters; only their numbers are used, to order find_in_book. */
  readingTrail?: unknown
}

type SafeMessage = { role: 'user' | 'assistant'; content: string }

type AnthropicToolDefinition = {
  name: string
  description: string
  input_schema: Record<string, unknown>
  strict: true
}

/**
 * Tools the companion may call to look outside the chapter in front of the
 * reader. Strict schemas: every property required, no extras, so
 * `tool_use.input` always validates (parsed with JSON.parse, never matched
 * as text).
 */
export const BOOK_TOOLS: readonly AnthropicToolDefinition[] = [
  {
    name: 'read_chapter',
    description: 'Read one chapter of the book the reader has open, in the same edition. Use it whenever the reader refers to something outside the chapter in front of you (an earlier chapter, something they remember, "wasn\'t he just…"). Pass either the sequential chapter number of this edition as digits (for the Bible that is the running index shown in the prompt, e.g. Jeremiah 37 is "782") or the exact chapter label as shown in the prompt (e.g. "Jeremiah 32"). Long chapters come back trimmed with a note.',
    input_schema: {
      type: 'object',
      properties: {
        chapter: { type: 'string', description: 'Sequential chapter number as digits (e.g. "777") or the exact chapter label (e.g. "Jeremiah 32").' },
      },
      required: ['chapter'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: 'find_in_book',
    description: 'Search this book (same edition) for a short phrase or name and get up to five matching paragraphs with their chapter labels and numbers. Case-insensitive substring search, nearest chapters first, bounded scan. Use it to locate where something happened before reading that chapter with read_chapter.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'A distinctive word or short phrase of 2 to 120 characters, e.g. "Zedekiah" or "court of the prison".' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    strict: true,
  },
]

type TextBlock = { type: 'text'; text: string }
type ToolUseBlock = { type: 'tool_use'; id: string; name: string; input: unknown }
type ContentBlock = TextBlock | ToolUseBlock | { type: string; [key: string]: unknown }

type RoundOutcome =
  | { ok: true; content: ContentBlock[]; stopReason: string | null; message: Record<string, unknown> | null }
  | { ok: false; status: number; body: unknown }

function logAnthropicCacheUsage(route: string, usage: AnthropicUsage | undefined): void {
  if (!usage) return
  console.log(JSON.stringify({
    event: 'anthropic_cache_usage',
    route,
    input_tokens: usage.input_tokens || 0,
    output_tokens: usage.output_tokens || 0,
    cache_creation_input_tokens: usage.cache_creation_input_tokens || 0,
    cache_read_input_tokens: usage.cache_read_input_tokens || 0,
  }))
}

function validateSystemParam(value: unknown): { system: AnthropicSystemParam; error?: string } {
  if (typeof value === 'string') {
    return { system: value.slice(0, MAX_SYSTEM_PROMPT_LENGTH) }
  }
  if (value === undefined || value === null) return { system: '' }
  if (!Array.isArray(value)) return { system: '', error: 'Invalid system prompt' }

  const blocks: AnthropicSystemBlock[] = []
  let total = 0
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) return { system: '', error: 'Invalid system prompt block' }
    const block = raw as Record<string, unknown>
    if (block.type !== undefined && block.type !== 'text') return { system: '', error: 'Invalid system prompt block type' }
    if (typeof block.text !== 'string') return { system: '', error: 'Invalid system prompt block text' }
    const remaining = MAX_SYSTEM_PROMPT_LENGTH - total
    if (remaining <= 0) break
    const text = block.text.slice(0, remaining)
    total += text.length
    const safe: AnthropicSystemBlock = { type: 'text', text }
    if (block.cache_control !== undefined) {
      const cacheControl = block.cache_control as Record<string, unknown> | null
      if (!cacheControl || cacheControl.type !== 'ephemeral') return { system: '', error: 'Invalid system prompt cache control' }
      safe.cache_control = { type: 'ephemeral' }
    }
    blocks.push(safe)
  }
  return { system: blocks }
}

function streamAnthropicResponse(response: Response, request: Request, env: ChatEnv, ctx: ExecutionContext, userId: string | null): Response {
  if (!response.body) return jsonResponse({ error: 'Empty stream' }, 502, request)
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let charged = false
  let buffer = ''
  const transformed = response.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true })
      if (charged) {
        controller.enqueue(encoder.encode(text))
        return
      }
      buffer += text
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (!data || data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data) as {
            type?: string
            message?: { usage?: AnthropicUsage }
            delta?: { type?: string; text?: string }
          }
          if (parsed.type === 'message_start') {
            logAnthropicCacheUsage('chat_stream_start', parsed.message?.usage)
          }
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta' && parsed.delta.text) {
            charged = true
            buffer = ''
            if (userId && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
              ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
            }
            break
          }
        } catch { /* ignore partial/non-json SSE data */ }
      }
      controller.enqueue(encoder.encode(text))
    },
    flush(controller) {
      const tail = decoder.decode()
      if (tail) controller.enqueue(encoder.encode(tail))
    },
  }))
  return new Response(transformed, {
    status: response.status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': response.headers.get('content-type') || 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

// ===== Book-grounded chat: server-side tool loop =====

type SseEvent = { event: string; data: Record<string, unknown> }

/** Parse an Anthropic SSE body into events, tolerant of chunk boundaries. */
async function* readSseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const parseBlock = (block: string): SseEvent | null => {
    let event = ''
    const dataLines: string[] = []
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) event = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
    }
    if (dataLines.length === 0) return null
    const raw = dataLines.join('\n')
    if (!raw || raw === '[DONE]') return null
    try {
      const data = JSON.parse(raw) as Record<string, unknown>
      return { event: event || (typeof data.type === 'string' ? data.type : ''), data }
    } catch {
      return null
    }
  }
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let boundary = buffer.search(/\r?\n\r?\n/)
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, '')
        const parsed = parseBlock(block)
        if (parsed) yield parsed
        boundary = buffer.search(/\r?\n\r?\n/)
      }
    }
    buffer += decoder.decode()
    const tail = parseBlock(buffer)
    if (tail) yield tail
  } finally {
    reader.releaseLock()
  }
}

function encodeSse(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

interface ClientSink {
  write(event: string, data: Record<string, unknown>): void
}

/** Consume one streamed Anthropic round, forwarding text to the client and collecting tool calls. */
async function consumeStreamedRound(
  response: Response,
  sink: ClientSink | null,
  options: { firstRound: boolean; onText: () => void },
): Promise<RoundOutcome> {
  if (!response.body) return { ok: false, status: 502, body: { error: 'Empty stream' } }
  const blocks: ContentBlock[] = []
  const jsonBuffers = new Map<number, string>()
  let stopReason: string | null = null
  let message: Record<string, unknown> | null = null
  for await (const { event, data } of readSseEvents(response.body)) {
    const type = typeof data.type === 'string' ? data.type : event
    const index = typeof data.index === 'number' ? data.index : -1
    switch (type) {
      case 'message_start': {
        message = (data.message as Record<string, unknown> | undefined) ?? null
        logAnthropicCacheUsage(options.firstRound ? 'chat_stream_start' : 'chat_tool_round', (message?.usage as AnthropicUsage | undefined))
        if (sink && options.firstRound) sink.write(event, data)
        break
      }
      case 'content_block_start': {
        const block = (data.content_block as ContentBlock | undefined) ?? { type: 'text', text: '' }
        if (block.type === 'tool_use') {
          blocks[index] = { type: 'tool_use', id: String((block as ToolUseBlock).id ?? ''), name: String((block as ToolUseBlock).name ?? ''), input: {} }
          jsonBuffers.set(index, '')
        } else {
          blocks[index] = block.type === 'text' ? { type: 'text', text: String((block as TextBlock).text ?? '') } : block
          if (sink) sink.write(event, data)
        }
        break
      }
      case 'content_block_delta': {
        const delta = (data.delta as { type?: string; text?: string; partial_json?: string } | undefined) ?? {}
        const block = blocks[index]
        if (delta.type === 'text_delta' && typeof delta.text === 'string') {
          if (block && block.type === 'text') (block as TextBlock).text += delta.text
          else blocks[index] = { type: 'text', text: delta.text }
          if (delta.text) options.onText()
          if (sink) sink.write(event, data)
        } else if (delta.type === 'input_json_delta' && typeof delta.partial_json === 'string') {
          jsonBuffers.set(index, (jsonBuffers.get(index) ?? '') + delta.partial_json)
        }
        break
      }
      case 'content_block_stop': {
        const block = blocks[index]
        if (block && block.type === 'tool_use') {
          const raw = jsonBuffers.get(index) ?? ''
          try {
            (block as ToolUseBlock).input = raw.trim() ? JSON.parse(raw) : {}
          } catch {
            (block as ToolUseBlock).input = { malformed: raw.slice(0, 200) }
          }
        } else if (sink) {
          sink.write(event, data)
        }
        break
      }
      case 'message_delta': {
        const delta = (data.delta as { stop_reason?: string | null } | undefined) ?? {}
        if (typeof delta.stop_reason === 'string') stopReason = delta.stop_reason
        if (sink && stopReason !== 'tool_use') sink.write(event, data)
        break
      }
      case 'message_stop': {
        if (sink && stopReason !== 'tool_use') sink.write(event, data)
        break
      }
      case 'error':
        // The caller emits one client-facing error event; do not forward twice.
        return { ok: false, status: 502, body: data }
      default:
        if (sink && type === 'ping') sink.write(event, data)
    }
  }
  return { ok: true, content: blocks.filter(Boolean), stopReason, message }
}

function effortConfig(effort: CompanionEffort | null): Record<string, unknown> {
  return effort ? { output_config: { effort } } : {}
}

function roundPayload(input: {
  system: AnthropicSystemParam
  messages: unknown[]
  maxTokens: number
  stream: boolean
  forceText: boolean
  effort: CompanionEffort | null
}): Record<string, unknown> {
  return {
    model: CHAT_MODEL,
    max_tokens: input.maxTokens,
    system: input.system,
    messages: input.messages,
    tools: BOOK_TOOLS,
    ...(input.forceText ? { tool_choice: { type: 'none' } } : {}),
    ...effortConfig(input.effort),
    ...(input.stream ? { stream: true } : {}),
  }
}

/**
 * The system prompt is identical across the rounds of one request and across
 * a reader's consecutive questions on the same chapter, so mark it cacheable
 * for the tool-loop path. Reads on rounds 2+ then cost a tenth of the
 * uncached prompt, which more than repays the one-off write premium.
 */
function cacheableSystem(system: AnthropicSystemParam): AnthropicSystemParam {
  if (typeof system === 'string') {
    if (!system.trim()) return system
    return [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
  }
  if (system.length === 0 || system.some(block => block.cache_control)) return system
  return system.map((block, index) => (index === system.length - 1 ? { ...block, cache_control: { type: 'ephemeral' } } : block))
}

async function fetchAnthropic(apiKey: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  })
}

async function executeToolCalls(
  retrieval: BookRetrieval,
  calls: ToolUseBlock[],
): Promise<Array<{ type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean }>> {
  const outcomes = await Promise.all(calls.map(async (call): Promise<ToolOutcome> => {
    try {
      if (call.name === 'read_chapter') return await retrieval.readChapter(call.input)
      if (call.name === 'find_in_book') return await retrieval.findInBook(call.input)
      return { content: `Unknown tool ${call.name}.`, isError: true }
    } catch {
      return { content: 'The lookup failed. Answer from what you have and say what you could not check.', isError: true }
    }
  }))
  return calls.map((call, index) => ({
    type: 'tool_result' as const,
    tool_use_id: call.id,
    content: outcomes[index].content,
    ...(outcomes[index].isError ? { is_error: true } : {}),
  }))
}

function toolUseBlocks(content: ContentBlock[]): ToolUseBlock[] {
  return content.filter((block): block is ToolUseBlock => block.type === 'tool_use' && typeof (block as ToolUseBlock).id === 'string')
}

function textOf(content: ContentBlock[]): string {
  return content
    .filter((block): block is TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('')
    .trim()
}

interface ToolLoopInput {
  apiKey: string
  system: AnthropicSystemParam
  messages: SafeMessage[]
  maxTokens: number
  stream: boolean
  effort: CompanionEffort | null
  retrieval: BookRetrieval
  onFirstText: () => void
}

/**
 * Runs the Anthropic call with the book tools, executing tool calls
 * server-side for up to MAX_TOOL_ROUNDS rounds, then one forced-text round.
 * `sink` receives the client-facing SSE stream when streaming.
 */
async function runToolLoop(input: ToolLoopInput, sink: ClientSink | null, firstResponse?: Response): Promise<RoundOutcome> {
  const system = cacheableSystem(input.system)
  const messages: unknown[] = [...input.messages]
  let forwardedText = ''
  let firstTextSeen = false
  const noteText = () => {
    if (firstTextSeen) return
    firstTextSeen = true
    input.onFirstText()
  }
  let separatorPending = false
  const roundSink: ClientSink | null = sink ? {
    write(event, data) {
      if (separatorPending && data.type === 'content_block_delta') {
        const delta = data.delta as { type?: string; text?: string } | undefined
        if (delta?.type === 'text_delta' && delta.text) {
          separatorPending = false
          sink.write('content_block_delta', { type: 'content_block_delta', index: data.index ?? 0, delta: { type: 'text_delta', text: '\n\n' } })
        }
      }
      sink.write(event, data)
    },
  } : null

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const forceText = round === MAX_TOOL_ROUNDS
    let outcome: RoundOutcome
    let response: Response
    if (round === 0 && firstResponse) {
      response = firstResponse
    } else {
      response = await fetchAnthropic(input.apiKey, roundPayload({
        system,
        messages,
        maxTokens: input.maxTokens,
        stream: input.stream,
        forceText,
        effort: input.effort,
      }))
      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: 'Chat request failed' }))
        return { ok: false, status: response.status, body }
      }
    }
    if (input.stream) {
      outcome = await consumeStreamedRound(response, roundSink, { firstRound: round === 0, onText: noteText })
    } else {
      const data = await response.json() as { content?: ContentBlock[]; stop_reason?: string | null; usage?: AnthropicUsage }
      logAnthropicCacheUsage(round === 0 ? 'chat' : 'chat_tool_round', data.usage)
      outcome = { ok: true, content: Array.isArray(data.content) ? data.content : [], stopReason: data.stop_reason ?? null, message: data as Record<string, unknown> }
    }
    if (!outcome.ok) return outcome
    const calls = toolUseBlocks(outcome.content)
    if (outcome.stopReason !== 'tool_use' || calls.length === 0 || forceText) {
      if (!input.stream) {
        const finalText = textOf(outcome.content)
        const merged = forwardedText && finalText ? `${forwardedText}\n\n${finalText}` : (finalText || forwardedText)
        if (merged) noteText()
        const message = { ...(outcome.message ?? {}), content: [{ type: 'text', text: merged }], stop_reason: outcome.stopReason }
        return { ok: true, content: message.content, stopReason: outcome.stopReason, message }
      }
      return outcome
    }
    const roundText = textOf(outcome.content)
    if (roundText) {
      forwardedText = forwardedText ? `${forwardedText}\n\n${roundText}` : roundText
      separatorPending = true
    }
    const results = await executeToolCalls(input.retrieval, calls)
    messages.push({ role: 'assistant', content: outcome.content })
    messages.push({ role: 'user', content: results })
  }
  return { ok: false, status: 502, body: { error: 'Chat request failed' } }
}

// ===== API: Chat =====

function labGuestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'lab-guest'
}

export async function handleLabChat(
  request: Request,
  env: ChatEnv,
  ctx: ExecutionContext,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  return handleChat(request, env, ctx, async () => null, checkRateLimit, { allowLabGuest: true })
}

export async function handleChat(
  request: Request,
  env: ChatEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
  options?: { allowLabGuest?: boolean },
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  // Request size check
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > MAX_REQUEST_BODY_BYTES) {
    return jsonResponse({ error: 'Request too large' }, 413, request)
  }

  const bodyPromise = request.json()
    .then((body) => ({ body: body as ParsedChatBody }))
    .catch(() => ({ error: 'Invalid JSON' as const }))

  const allowLabGuest = options?.allowLabGuest === true
  const user = allowLabGuest ? null : await verifyUser(env, request)
  if (!allowLabGuest) {
    if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
    if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  }

  const userId = user?.id ?? null
  if (allowLabGuest) {
    const rateAllowed = await checkRateLimit(`lab-chat:${labGuestIp(request)}`, env.RATE_LIMIT)
    if (!rateAllowed) {
      return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
    }
  } else {
    const profilePromise: Promise<ChatProfile | null> = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
      ? supabaseGet(env, `profiles?id=eq.${userId}&select=messages_used_this_period,message_balance,subscription_status,subscription_period_end,created_at`)
          .then(async (profileRes) => {
            if (!profileRes.ok) return null
            const profiles = await profileRes.json() as ChatProfile[]
            return profiles?.[0] ?? null
          })
          .catch(() => null)
      : Promise.resolve(null)

    const [rateAllowed, profile] = await Promise.all([
      checkRateLimit(`chat:${userId}`, env.RATE_LIMIT),
      profilePromise,
    ])
    if (!rateAllowed) {
      return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
    }

    const access = evaluateChatAccess(profile)
    if (!access.allowed) return jsonResponse({ error: access.error }, 402, request)
  }

  try {
    const parsedBody = await bodyPromise
    if ('error' in parsedBody) return jsonResponse({ error: parsedBody.error }, 400, request)
    const body = parsedBody.body
    if (typeof body !== 'object' || body === null) return jsonResponse({ error: 'Invalid request body' }, 400, request)

    // Validate input
    const systemResult = validateSystemParam(body.system)
    if (systemResult.error) return jsonResponse({ error: systemResult.error }, 400, request)
    const system = systemResult.system
    const messages = Array.isArray(body.messages) ? body.messages.slice(0, MAX_MESSAGES) : []
    const maxTokens = Math.min(Math.max(1, body.max_tokens || 1024), MAX_TOKENS_CAP)
    const stream = body.stream === true
    const effort = parseCompanionEffort(body.effort)

    // Validate message structure and truncate per-message to the cap.
    // Long histories accumulate over a session; rather than reject the whole
    // request, trim each turn so the conversation can keep going.
    const safeMessages: SafeMessage[] = []
    for (const msg of messages) {
      if (typeof msg !== 'object' || msg === null) return jsonResponse({ error: 'Invalid message format' }, 400, request)
      const m = msg as Record<string, unknown>
      if (m.role !== 'user' && m.role !== 'assistant') return jsonResponse({ error: 'Invalid message role' }, 400, request)
      if (typeof m.content !== 'string') return jsonResponse({ error: 'Invalid message content' }, 400, request)
      const content = m.content.length > MAX_MESSAGE_LENGTH ? m.content.slice(0, MAX_MESSAGE_LENGTH) : m.content
      safeMessages.push({ role: m.role, content })
    }

    const charge = () => {
      if (userId && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
      }
    }

    // Book-grounded path: the client named the open book, so the model may
    // read other chapters. Only the lab reader sends `book`; the production
    // reader's requests take the plain path below unchanged.
    const book: BookRef | null = parseBookRef(body.book)
    if (book && env.ASSETS) {
      return handleBookGroundedChat({
        request, env, ctx, apiKey, book, system, safeMessages, maxTokens, stream, effort, charge,
        trailChapters: parseReadingTrailChapters(body.readingTrail),
      })
    }

    const response = await fetchAnthropic(apiKey, {
      model: CHAT_MODEL,
      max_tokens: maxTokens,
      system,
      messages: safeMessages,
      ...effortConfig(effort),
      ...(stream ? { stream: true } : {}),
    })

    if (stream) {
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Chat request failed' }))
        return jsonResponse(data, response.status, request)
      }
      return streamAnthropicResponse(response, request, env, ctx, userId)
    }

    const data = await response.json() as { usage?: AnthropicUsage }
    logAnthropicCacheUsage('chat', data.usage)

    // Deduct message on success. Lab guest testers are not billed.
    if (response.ok) charge()

    return jsonResponse(data, response.status, request)
  } catch {
    return jsonResponse({ error: 'Chat request failed' }, 500, request)
  }
}

async function handleBookGroundedChat(input: {
  request: Request
  env: ChatEnv
  ctx: ExecutionContext
  apiKey: string
  book: BookRef
  trailChapters: number[]
  system: AnthropicSystemParam
  safeMessages: SafeMessage[]
  maxTokens: number
  stream: boolean
  effort: CompanionEffort | null
  charge: () => void
}): Promise<Response> {
  const { request, env, ctx } = input
  const retrieval = createBookRetrieval({
    assets: env.ASSETS as AssetsBinding,
    origin: new URL(request.url).origin,
    book: input.book,
    trailChapters: input.trailChapters,
  })
  let charged = false
  const chargeOnce = () => {
    if (charged) return
    charged = true
    input.charge()
  }
  const loopInput: ToolLoopInput = {
    apiKey: input.apiKey,
    system: input.system,
    messages: input.safeMessages,
    maxTokens: input.maxTokens,
    stream: input.stream,
    effort: input.effort,
    retrieval,
    onFirstText: chargeOnce,
  }

  if (!input.stream) {
    const outcome = await runToolLoop(loopInput, null)
    if (!outcome.ok) return jsonResponse(outcome.body, outcome.status, request)
    return jsonResponse(outcome.message ?? { content: outcome.content }, 200, request)
  }

  // Streaming: open the first round before answering so upstream errors still
  // arrive as JSON with their status, exactly as on the plain path.
  const first = await fetchAnthropic(input.apiKey, roundPayload({
    system: cacheableSystem(input.system),
    messages: input.safeMessages,
    maxTokens: input.maxTokens,
    stream: true,
    forceText: false,
    effort: input.effort,
  }))
  if (!first.ok) {
    const data = await first.json().catch(() => ({ error: 'Chat request failed' }))
    return jsonResponse(data, first.status, request)
  }
  const encoder = new TextEncoder()
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  let closed = false
  const sink: ClientSink = {
    write(event, data) {
      if (closed) return
      void writer.write(encoder.encode(encodeSse(event, data))).catch(() => { closed = true })
    },
  }
  const pump = (async () => {
    try {
      const outcome = await runToolLoop(loopInput, sink, first)
      if (!outcome.ok) {
        sink.write('error', { type: 'error', error: { type: 'upstream_error', message: 'Chat request failed' } })
      }
    } catch {
      sink.write('error', { type: 'error', error: { type: 'upstream_error', message: 'Chat request failed' } })
    } finally {
      closed = true
      await writer.close().catch(() => { /* client went away */ })
    }
  })()
  ctx.waitUntil(pump)
  return new Response(readable, {
    status: 200,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
