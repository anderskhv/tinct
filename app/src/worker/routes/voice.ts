import { GROK_CLIENT_SECRET_TTL_SECONDS, GROK_VOICE_MODEL } from '../../voice/grokConfig'
import { allowanceUsedBody, allowsAiFeature, createAllowanceGate, type AllowanceGate } from '../lib/aiAllowance'
import { isProviderBudgetError } from '../lib/chatUpstream'
import { corsHeaders, jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseRpc, type SupabaseEnv } from '../lib/supabase'
import { CHECK_GUEST_KEY, ledgerGuestKey, recordAiUsage, requestGuestKey, talkCostUsd, type LedgerEnv } from '../lib/aiUsage'
import { AI_RESTING_MESSAGE, AI_RESTING_TYPE, releaseGuestSpend, type GuestAiSpendEnv, type GuestSpendHold, type HoldGuestSpend } from '../lib/aiSpend'
import {
  newTicketNonce, returnTalkTrial, signTalkTicket, takeTalkTrial, talkTrialSlot, utcDay, verifyTalkTicket,
  TALK_TICKET_PROTOCOL_PREFIX, TALK_TRIAL_CLOSE_CODE, TALK_TRIAL_CLOSE_REASON, TALK_TRIAL_RESERVE_MICROS,
  TALK_TRIAL_SECONDS, TALK_TRIAL_TICKET_SECONDS, TALK_TRIAL_USED_CODE,
} from '../lib/talkTrial'

export type VoiceEnv = SupabaseEnv & GuestAiSpendEnv & {
  AI_LEDGER_SALT?: string
  /** Grok native speech-to-speech: mints the browser's ephemeral client secret. */
  XAI_API_KEY?: string
  /** Still used by the shared source-research route, not by the voice path. */
  OPENAI_API_KEY?: string
  RATE_LIMIT?: KVNamespace
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: VoiceEnv, request: Request) => Promise<VerifiedUser | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const VOICE_NOT_CONFIGURED_ERROR = 'Voice is not configured. Set the XAI_API_KEY Worker secret.'
export const XAI_CLIENT_SECRETS_URL = 'https://api.x.ai/v1/realtime/client_secrets'

/**
 * One line per refused or failed voice start, so a reader's "voice would not
 * connect" leaves evidence (invocation logs are off): the status and reason,
 * never the account. Setup failures after this point (the provider socket)
 * are retried by the client and do not reach the Worker.
 */
function logVoiceStartFailure(status: number, reason: string, signedIn: boolean): void {
  console.log(JSON.stringify({ event: 'voice_session_failed', status, reason: reason.slice(0, 160), signedIn }))
}

/**
 * A signed-out guest's Talk trial (lib/talkTrial.ts; Anders, 16 Oct 2026):
 * one conversation per IP per UTC day, two minutes at most. The ceiling for
 * signed-out AI is reserved first (two minutes' cost), then today's trial is
 * taken; a refusal of either takes nothing. The answer is a single-use
 * ticket for the Worker's relay (`handleLabVoiceRelay`), never an xAI secret:
 * the relay is what ends the call at two minutes.
 */
export async function handleLabVoiceSession(
  request: Request,
  env: VoiceEnv,
  checkRateLimit: CheckRateLimit,
  holdGuestSpend: HoldGuestSpend,
  now: () => number = Date.now,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.XAI_API_KEY) return jsonResponse({ error: VOICE_NOT_CONFIGURED_ERROR }, 503, request)
  const ip = requestGuestKey(request)
  const check = request.headers.get('x-tinct-check') === '1'
  if (!await checkRateLimit(`lab-voice:${ip}`, env.RATE_LIMIT, 6)) {
    logVoiceStartFailure(429, 'rate_limited', false)
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }
  const day = utcDay(now())
  const hold = await holdGuestSpend(TALK_TRIAL_RESERVE_MICROS).catch((): GuestSpendHold | null => null)
  if (!hold) {
    logVoiceStartFailure(503, 'guest_ceiling', false)
    return jsonResponse({ error: AI_RESTING_MESSAGE, code: AI_RESTING_TYPE }, 503, request)
  }
  const slot = await talkTrialSlot(env, { ip, check, day })
  if (!await takeTalkTrial(env, slot)) {
    await hold.release()
    logVoiceStartFailure(429, 'trial_used', false)
    return jsonResponse({ error: 'Create a free account to keep talking.', code: TALK_TRIAL_USED_CODE }, 429, request)
  }
  const exp = now() + TALK_TRIAL_TICKET_SECONDS * 1000
  const ticket = await signTalkTicket(env, { exp, n: newTicketNonce(), d: day, u: TALK_TRIAL_RESERVE_MICROS, t: slot.name, c: check })
  if (!ticket) {
    await Promise.all([hold.release(), returnTalkTrial(env, slot.name)])
    return jsonResponse({ error: VOICE_NOT_CONFIGURED_ERROR }, 503, request)
  }
  return jsonResponse({
    value: ticket,
    expires_at: Math.floor(exp / 1000),
    model: GROK_VOICE_MODEL,
    relay: LAB_VOICE_RELAY_PATH,
    max_seconds: TALK_TRIAL_SECONDS,
  }, 200, request)
}

export const LAB_VOICE_RELAY_PATH = '/api/lab-voice-relay'
export const XAI_REALTIME_HTTP_URL = 'https://api.x.ai/v1/realtime'

/** The part of a Workers WebSocket the relay uses (a test seam). */
export interface RelaySocket {
  accept(): void
  send(data: string | ArrayBuffer): void
  close(code?: number, reason?: string): void
  addEventListener(type: 'message' | 'close' | 'error', listener: (event: any) => void): void
}

export interface VoiceRelayDeps {
  /** The provider's socket, authenticated with the Worker's key; null when it would not open. */
  connectUpstream?: (env: VoiceEnv) => Promise<RelaySocket | null>
  /** [browser end, Worker end]. */
  createPair?: () => [RelaySocket, RelaySocket]
  /** The 101 that hands the browser its end. */
  respond?: (client: RelaySocket, protocol: string) => Response
  now?: () => number
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (timer: unknown) => void
}

async function connectXaiUpstream(env: VoiceEnv): Promise<RelaySocket | null> {
  const response = await fetch(`${XAI_REALTIME_HTTP_URL}?model=${encodeURIComponent(GROK_VOICE_MODEL)}`, {
    headers: { Upgrade: 'websocket', Authorization: `Bearer ${env.XAI_API_KEY}` },
  })
  return (response as Response & { webSocket?: RelaySocket | null }).webSocket ?? null
}

function closeQuietly(socket: RelaySocket, code: number, reason: string): void {
  // Only 1000 and the application range may be sent; anything else ends normally.
  const sendable = code === 1000 || (code >= 3000 && code <= 4999) ? code : 1000
  try { socket.close(sendable, reason.slice(0, 120)) } catch { /* already closed */ }
}

/**
 * GET /api/lab-voice-relay (WebSocket): a guest's Talk trial, relayed between
 * the browser and xAI with the Worker's own key, frames passed through
 * unchanged and never stored. The ticket from `handleLabVoiceSession` rides
 * in the subprotocol and opens one relay once. At TALK_TRIAL_SECONDS both ends
 * are closed with TALK_TRIAL_CLOSE_CODE; the connected time is metered in the
 * AI ledger under the guest's key and the unused part of the reservation is
 * given back. A provider that never connects returns the trial and the spend.
 */
export async function handleLabVoiceRelay(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  checkRateLimit: CheckRateLimit,
  deps: VoiceRelayDeps = {},
): Promise<Response> {
  const now = deps.now ?? Date.now
  if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') return jsonResponse({ error: 'Expected a WebSocket' }, 426, request)
  if (!env.XAI_API_KEY) return jsonResponse({ error: VOICE_NOT_CONFIGURED_ERROR }, 503, request)
  const protocol = (request.headers.get('sec-websocket-protocol') ?? '').split(',').map(part => part.trim())
    .find(part => part.startsWith(TALK_TICKET_PROTOCOL_PREFIX))
  const ticket = protocol ? await verifyTalkTicket(env, protocol.slice(TALK_TICKET_PROTOCOL_PREFIX.length), now()) : null
  if (!protocol || !ticket) return jsonResponse({ error: 'Authentication required' }, 401, request)
  // Single use: the ticket's nonce opens one relay (its window outlasts the ticket).
  if (!await checkRateLimit(`voice-ticket:${ticket.n}`, env.RATE_LIMIT, 1)) return jsonResponse({ error: 'Authentication required' }, 401, request)

  const upstream = await (deps.connectUpstream ?? connectXaiUpstream)(env).catch(() => null)
  if (!upstream) {
    logVoiceStartFailure(502, 'relay_upstream', false)
    await Promise.all([releaseGuestSpend(env, ticket.d, ticket.u), returnTalkTrial(env, ticket.t)])
    return jsonResponse({ error: 'Could not start a voice session.' }, 502, request)
  }
  const [client, server] = (deps.createPair ?? (() => {
    const pair = new WebSocketPair()
    return [pair[0], pair[1]] as unknown as [RelaySocket, RelaySocket]
  }))()
  server.accept()
  upstream.accept()
  const openedAt = now()
  const deadline = openedAt + TALK_TRIAL_SECONDS * 1000
  const setTimer = deps.setTimer ?? ((fn: () => void, ms: number) => setTimeout(fn, ms))
  const clearTimer = deps.clearTimer ?? ((timer: unknown) => clearTimeout(timer as ReturnType<typeof setTimeout>))
  let finished = false
  let settle: () => void = () => {}
  const closed = new Promise<void>(resolve => { settle = resolve })
  const finish = (code: number, reason: string) => {
    if (finished) return
    finished = true
    clearTimer(timer)
    closeQuietly(server, code, reason)
    closeQuietly(upstream, code, reason)
    const seconds = Math.min(TALK_TRIAL_SECONDS, Math.max(0, (now() - openedAt) / 1000))
    const cost = talkCostUsd(seconds)
    recordAiUsage(env as LedgerEnv, ctx, { guest: ticket.c ? CHECK_GUEST_KEY : requestGuestKey(request) }, {
      feature: 'talk', provider: 'xai', model: GROK_VOICE_MODEL, seconds, cost_usd: cost,
    })
    void releaseGuestSpend(env, ticket.d, ticket.u - Math.ceil(cost * 1_000_000)).finally(settle)
  }
  const endTrial = () => finish(TALK_TRIAL_CLOSE_CODE, TALK_TRIAL_CLOSE_REASON)
  const timer = setTimer(endTrial, TALK_TRIAL_SECONDS * 1000)
  const pass = (to: RelaySocket) => (event: { data: string | ArrayBuffer }) => {
    if (finished) return
    if (now() >= deadline) { endTrial(); return }
    try { to.send(event.data) } catch { finish(1011, 'relay_send_failed') }
  }
  server.addEventListener('message', pass(upstream))
  upstream.addEventListener('message', pass(server))
  for (const socket of [server, upstream]) {
    socket.addEventListener('close', (event: { code?: number; reason?: string }) => finish(event.code ?? 1000, event.reason || ''))
    socket.addEventListener('error', () => finish(1011, 'relay_error'))
  }
  ctx.waitUntil(closed)
  return (deps.respond ?? ((socket, chosen) => new Response(null, { status: 101, webSocket: socket, headers: { 'Sec-WebSocket-Protocol': chosen } } as ResponseInit)))(client, protocol)
}

/**
 * Mints a short-lived xAI client secret for one browser voice session. The API
 * key never leaves the Worker; the browser opens the WebSocket itself. Model,
 * prompt and tools are set by the client in `session.update`, so this route
 * accepts no provider parameters at all.
 */
export async function handleVoiceSession(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
  allowanceGate: AllowanceGate = createAllowanceGate(env),
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.XAI_API_KEY
  if (!apiKey) return jsonResponse({ error: VOICE_NOT_CONFIGURED_ERROR }, 503, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  const userId = user.id
  const [rateAllowed, allowance] = await Promise.all([
    checkRateLimit(`voice:${userId}`, env.RATE_LIMIT, 6),
    allowanceGate.enforced ? allowanceGate.load(userId) : Promise.resolve(null),
  ])
  if (!rateAllowed) {
    logVoiceStartFailure(429, 'rate_limited', true)
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  // Talk is a paid feature: refused only when the allowance is switched on and used up.
  if (!allowsAiFeature(allowanceGate.enforced, 'talk', allowance)) {
    logVoiceStartFailure(402, 'allowance_used', true)
    return jsonResponse(allowanceUsedBody(), 402, request)
  }

  try {
    const response = await fetch(XAI_CLIENT_SECRETS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_after: { seconds: GROK_CLIENT_SECRET_TTL_SECONDS } }),
    })
    const data = await response.json().catch(() => ({})) as { value?: string; expires_at?: number; error?: string | { message?: string } }
    if (!response.ok || typeof data.value !== 'string' || !data.value) {
      const message = typeof data.error === 'string' ? data.error : data.error?.message
      logVoiceStartFailure(response.status, `provider: ${message || 'no client secret'}`, Boolean(user))
      // Provider credit, spend or rate limits: a calm resting state, not a raw provider message.
      if (response.status === 402 || response.status === 429 || isProviderBudgetError(response.status, data)) {
        return jsonResponse({ error: AI_RESTING_MESSAGE, code: AI_RESTING_TYPE }, 503, request)
      }
      return jsonResponse({ error: message || 'Could not start a voice session.' }, response.status >= 400 ? response.status : 502, request)
    }

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
    }
    // Cost ledger: the session row. Connected seconds arrive later from /api/voice-usage.
    recordAiUsage(env as LedgerEnv, ctx, { userId, guest: ledgerGuestKey(request) }, { feature: 'talk', provider: 'xai', model: GROK_VOICE_MODEL, seconds: 0, cost_usd: 0 })

    return jsonResponse({
      value: data.value,
      expires_at: data.expires_at ?? null,
      model: GROK_VOICE_MODEL,
    }, 200, request)
  } catch (error) {
    logVoiceStartFailure(500, `exception: ${error instanceof Error ? error.message : 'unknown'}`, Boolean(user))
    return jsonResponse({ error: 'Could not start a voice session.' }, 500, request)
  }
}

/**
 * The longest a single Talk session can legitimately be billed for. The browser
 * talks to xAI directly, so connected time is self-reported; a report is capped
 * here so a bad client cannot inflate the ledger. Provider session limit
 * UNVERIFIED (the 10-minute client-secret TTL only bounds opening the socket).
 */
export const TALK_SESSION_MAX_SECONDS = 1800

/**
 * POST /api/voice-usage {seconds, bookId?}: the client reports connected Talk
 * time when a session ends or the page is hidden. Signed-in only. Always 204
 * for a well-formed report; the ledger write is best effort and never blocks.
 */
export async function handleVoiceUsage(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const user = await verifyUser(env, request)
  if (!user || !isValidUUID(user.id)) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!await checkRateLimit(`voice-usage:${user.id}`, env.RATE_LIMIT, 30)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > 1024) return jsonResponse({ error: 'Request too large' }, 413, request)
  let body: { seconds?: unknown; bookId?: unknown }
  try { body = await request.json() as typeof body } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  const raw = typeof body?.seconds === 'number' ? body.seconds : NaN
  if (!Number.isFinite(raw) || raw <= 0) return jsonResponse({ error: 'Invalid seconds' }, 400, request)
  const seconds = Math.min(raw, TALK_SESSION_MAX_SECONDS)
  // A reader's own book is never named in the ledger: the marker "userbook" stands for any of them.
  const bookId = typeof body.bookId === 'string' && /^[a-z0-9-]{1,64}$/.test(body.bookId)
    ? (body.bookId.startsWith('userbook') ? 'userbook' : body.bookId)
    : null
  recordAiUsage(env as LedgerEnv, ctx, { userId: user.id, guest: ledgerGuestKey(request) }, {
    feature: 'talk', provider: 'xai', model: GROK_VOICE_MODEL, seconds, book_id: bookId, cost_usd: talkCostUsd(seconds),
  })
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}
