import { evaluateChatAccess, type ChatProfile } from '../lib/chatAccess'
import { corsHeaders, jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from '../lib/supabase'

export type ChatEnv = SupabaseEnv & {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: ChatEnv, request: Request) => Promise<VerifiedUser | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

const CHAT_MODEL = 'claude-sonnet-4-6'
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
const MAX_SYSTEM_PROMPT_LENGTH = 32_000
const MAX_MESSAGES = 50
// Per-message cap so a single bloated turn can't blow the budget. 10K chars
// is ~2K tokens — a generous ceiling for any real reader question.
const MAX_MESSAGE_LENGTH = 10_000
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
}

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

function streamAnthropicResponse(response: Response, request: Request, env: ChatEnv, ctx: ExecutionContext, userId: string): Response {
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
            if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
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

// ===== API: Chat =====

export async function handleChat(request: Request, env: ChatEnv, ctx: ExecutionContext, verifyUser: VerifyUser, checkRateLimit: CheckRateLimit): Promise<Response> {
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

  // Authentication required
  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  const userId = user.id
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

    // Validate message structure and truncate per-message to the cap.
    // Long histories accumulate over a session; rather than reject the whole
    // request, trim each turn so the conversation can keep going.
    const safeMessages: { role: 'user' | 'assistant'; content: string }[] = []
    for (const msg of messages) {
      if (typeof msg !== 'object' || msg === null) return jsonResponse({ error: 'Invalid message format' }, 400, request)
      const m = msg as Record<string, unknown>
      if (m.role !== 'user' && m.role !== 'assistant') return jsonResponse({ error: 'Invalid message role' }, 400, request)
      if (typeof m.content !== 'string') return jsonResponse({ error: 'Invalid message content' }, 400, request)
      const content = m.content.length > MAX_MESSAGE_LENGTH ? m.content.slice(0, MAX_MESSAGE_LENGTH) : m.content
      safeMessages.push({ role: m.role, content })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: maxTokens,
        system,
        messages: safeMessages,
        ...(stream ? { stream: true } : {}),
      }),
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

    // Deduct message on success
    if (response.ok && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
    }

    return jsonResponse(data, response.status, request)
  } catch {
    return jsonResponse({ error: 'Chat request failed' }, 500, request)
  }
}
