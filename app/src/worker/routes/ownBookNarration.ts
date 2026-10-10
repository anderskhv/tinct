/**
 * Read-aloud for a reader's own uploaded book (`userbook-{hex}`).
 *
 *   POST /api/narration/own/ensure   signed-in owner   make 1–3 paragraphs playable
 *   GET  /api/narration/own/audio    signed URL        one recording, to its owner only
 *
 * Off unless the Worker var OWN_BOOK_NARRATION is "1": with the switch off both
 * routes answer exactly what /api/narration/ensure answers a user book today
 * (403 "Outside the narration scope").
 *
 * The book's text never lives on the server: the reader sends the chapter's
 * paragraphs (converted on its device) with each request, and the Worker checks
 * that the caller owns the book (a file under their own `u/{userId}/` prefix
 * whose SHA-256 starts with the hex). Generation is on demand only; nothing is
 * prepared ahead or warmed.
 *
 * Storage is strictly private: recordings and their timing metadata are kept in
 * USER_BOOKS under `u/{userId}/narration/{bookHex}/{hash}.mp3|.json`, keyed by
 * the chunk's content identity (provider, model, voice, settings, text). Nothing
 * is written to AUDIO_BUCKET and nothing is shared between accounts: the same
 * file read aloud by two readers is paid for and stored twice.
 *
 * Spending: own-book narration has its own ceilings and never draws on the
 * shared narration budget (NARRATION_DAILY/MONTHLY_BYTES, `budget:{month}` and
 * the KV usage counters stay untouched):
 *   - per account: OWN_BOOK_NARRATION_MONTHLY_USD (default $20) per UTC month,
 *     coordinator object `own-user:{userId}`;
 *   - all own books together: OWN_BOOK_NARRATION_GLOBAL_MONTHLY_USD (default
 *     $100) per UTC month, coordinator object `own-budget:{month}`.
 * Each provider attempt reserves its text bytes in both before it is sent (the
 * account first; a refusal by the pool gives the account's share back). Bytes
 * are converted from dollars with the TTS price (narrationCostUsd), and UTF-8
 * bytes are never fewer than characters, so the ceilings are conservative.
 *
 * Premium only (Anders, 2026-10-07): audiobooks are a Premium feature, and a
 * reader in the 30-day trial counts as Premium. A signed-in owner who is
 * neither subscribed (isSubscribed) nor before trialEndsAt gets 402
 * `{ reason: 'premium_required' }`; the reader opens its account sheet, where
 * the existing Premium offer lives.
 *
 * Ledger: each paid synthesis is one `narration_generate` row with chars and
 * cost, and `book_id` set to the marker "userbook" (never the book's id). It is
 * not AI use: narration is in NEVER_CHARGED_AI_FEATURES (lib/aiAllowance.ts).
 * Logs carry no book text and no book id.
 */
import { ledgerGuestKey, narrationCostUsd, recordAiUsage, AI_PRICING, type LedgerEnv } from '../lib/aiUsage'
import { corsHeaders, jsonResponse } from '../lib/responses'
import { isSubscribed, trialEndsAt, type AllowanceProfile } from '../lib/aiAllowance'
import { supabaseGet } from '../lib/supabase'
import { isValidUUID } from '../lib/security'
import {
  NARRATION_CACHE_VERSION,
  NARRATION_MAX_PARAGRAPHS_PER_REQUEST,
  chunkNarrationTokens,
  narrationCacheIdentity,
  narrationTokens,
  paragraphWordsFromChunks,
  sha256Hex,
  utf8ByteLength,
  validateNarrationAsset,
  type AlignedWord,
  type NarrationChunk,
  type TokenAlignmentStats,
} from '../../narration/narrationCore'
import { parseByteRange } from './audio'
import { ownedBookHex, ownNarrationPrefix } from './userBooks'
import { NarrationProviderError, narrationConfig, ownBookNarrationAvailable, ownNarrationUrlSecret as urlSecret, synthesizeWithGrok, type NarrationDeps, type NarrationEnv } from './narration'

export { ownBookNarrationAvailable }

export type OwnBookNarrationEnv = NarrationEnv

export const OWN_BOOK_NARRATION_DEFAULT_MONTHLY_USD = 20
export const OWN_BOOK_NARRATION_DEFAULT_GLOBAL_MONTHLY_USD = 100
/** The ledger's book_id for every own-book row: a marker, never the book. */
export const OWN_BOOK_LEDGER_BOOK_ID = 'userbook'
/** One paragraph's text as the reader sends it. */
export const OWN_BOOK_MAX_PARAGRAPH_CHARS = 20_000
/** The whole request body. */
export const OWN_BOOK_MAX_BODY_BYTES = 128 * 1024
export const OWN_BOOK_ENSURE_RATE_PER_MINUTE = 60
/** Signed audio URLs live about a day; expiry is rounded so URLs (and the browser cache) stay stable. */
const URL_LIFETIME_MS = 24 * 3600_000
const URL_ROUNDING_MS = 6 * 3600_000
const REQUEST_TIME_BUDGET_MS = 55_000
const PROVIDER_TIMEOUT_MS = 25_000
const AUDIO_PATH = '/api/narration/own/audio'

/** Today's answer for a user book, kept exactly while the switch is off. */
function outsideScope(request: Request): Response {
  return jsonResponse({ error: 'Outside the narration scope' }, 403, request)
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/** Dollars of TTS as UTF-8 text bytes (the coordinator's unit). */
export function usdToNarrationBytes(usd: number): number {
  return Math.floor(usd / AI_PRICING.xai.ttsPerMChars * 1_000_000)
}

export function ownBookNarrationLimits(env: OwnBookNarrationEnv): { accountBytes: number; globalBytes: number; accountUsd: number; globalUsd: number } {
  const accountUsd = positiveNumber(env.OWN_BOOK_NARRATION_MONTHLY_USD, OWN_BOOK_NARRATION_DEFAULT_MONTHLY_USD)
  const globalUsd = positiveNumber(env.OWN_BOOK_NARRATION_GLOBAL_MONTHLY_USD, OWN_BOOK_NARRATION_DEFAULT_GLOBAL_MONTHLY_USD)
  return { accountUsd, globalUsd, accountBytes: usdToNarrationBytes(accountUsd), globalBytes: usdToNarrationBytes(globalUsd) }
}

// ===== Signed audio URLs =====

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)))
  return Array.from(mac, byte => byte.toString(16).padStart(2, '0')).join('')
}

const signedMessage = (userId: string, bookHex: string, hash: string, expires: number) =>
  ['tinct-own-narration-audio-v1', userId, bookHex, hash, String(expires)].join('\n')

/**
 * The owner's link to one recording. An <audio> element cannot send the
 * session token, so the link carries a signature minted only after the
 * ownership check, bound to this account, book, recording and expiry.
 */
export async function ownAudioUrl(secret: string, userId: string, bookHex: string, hash: string, now: number): Promise<string> {
  const expires = Math.ceil((now + URL_LIFETIME_MS) / URL_ROUNDING_MS) * URL_ROUNDING_MS
  const signature = await hmacHex(secret, signedMessage(userId, bookHex, hash, expires))
  const params = new URLSearchParams({ u: userId, b: bookHex, h: hash, e: String(expires), s: signature })
  return `${AUDIO_PATH}?${params.toString()}`
}

function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function audioKeys(userId: string, bookHex: string, hash: string): { audio: string; meta: string } {
  const base = `${ownNarrationPrefix(userId, bookHex)}${hash}`
  return { audio: `${base}.mp3`, meta: `${base}.json` }
}

const privateHeaders = (request: Request, extra: Record<string, string> = {}) => ({
  ...corsHeaders(request), 'X-Content-Type-Options': 'nosniff', ...extra,
})

/** GET /api/narration/own/audio: the recording, only behind a valid owner signature. */
export async function handleOwnAudio(request: Request, env: OwnBookNarrationEnv, now: number): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!ownBookNarrationAvailable(env)) return outsideScope(request)
  const url = new URL(request.url)
  const userId = url.searchParams.get('u') || ''
  const bookHex = url.searchParams.get('b') || ''
  const hash = url.searchParams.get('h') || ''
  const expires = Number(url.searchParams.get('e'))
  const signature = url.searchParams.get('s') || ''
  const notFound = () => new Response('Not found', { status: 404, headers: privateHeaders(request, { 'Cache-Control': 'no-store' }) })
  if (!isValidUUID(userId) || !/^[0-9a-f]{24}$/.test(bookHex) || !/^[0-9a-f]{64}$/.test(hash) || !/^[0-9a-f]{64}$/.test(signature)) return notFound()
  if (!Number.isSafeInteger(expires) || expires <= now) return notFound()
  const expected = await hmacHex(urlSecret(env)!, signedMessage(userId, bookHex, hash, expires))
  if (!sameHex(expected, signature)) return notFound()
  const bucket = env.USER_BOOKS!
  const key = audioKeys(userId, bookHex, hash).audio
  const maxAge = Math.max(0, Math.floor((expires - now) / 1000))
  const cache = `private, max-age=${maxAge}`
  const range = request.headers.get('range')
  if (range) {
    const head = await bucket.head(key)
    if (!head) return notFound()
    const parsed = parseByteRange(range, head.size)
    if (!parsed) return new Response('Invalid range', { status: 416, headers: privateHeaders(request, { 'Content-Range': `bytes */${head.size}`, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' }) })
    const object = await bucket.get(key, { range: { offset: parsed.start, length: parsed.end - parsed.start + 1 } })
    if (!object) return notFound()
    return new Response(request.method === 'HEAD' ? null : object.body, {
      status: 206,
      headers: privateHeaders(request, {
        'Content-Type': 'audio/mpeg', 'Content-Length': String(parsed.end - parsed.start + 1),
        'Content-Range': `bytes ${parsed.start}-${parsed.end}/${head.size}`, 'Accept-Ranges': 'bytes', 'Cache-Control': cache,
      }),
    })
  }
  const object = await bucket.get(key)
  if (!object) return notFound()
  return new Response(request.method === 'HEAD' ? null : object.body, {
    status: 200,
    headers: privateHeaders(request, { 'Content-Type': 'audio/mpeg', 'Content-Length': String(object.size), 'Accept-Ranges': 'bytes', 'Cache-Control': cache }),
  })
}

// ===== POST /api/narration/own/ensure =====

/** Timing metadata beside each private recording. No book text beyond the words' own tokens. */
interface OwnChunkMeta {
  version: number
  kind: 'own-book'
  provider: 'grok'
  model: string
  voiceId: string
  hash: string
  wordFrom: number
  wordTo: number
  duration: number
  words: AlignedWord[] | null
  alignment: TokenAlignmentStats
  timingsUsable: boolean
  audioBytes: number
  createdAt: string
}

interface ReadyOwnChunk { index: number; hash: string; meta: OwnChunkMeta; url: string }

interface OwnEnsureBody {
  book?: unknown
  voice?: unknown
  mode?: unknown
  paragraphs?: unknown
}

async function readCappedText(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') || '0')
  if (declared > limit) return null
  if (!request.body) return ''
  const reader = request.body.getReader()
  const parts: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) { await reader.cancel().catch(() => {}); return null }
    parts.push(value)
  }
  const bytes = new Uint8Array(total)
  let at = 0
  for (const part of parts) { bytes.set(part, at); at += part.byteLength }
  return new TextDecoder().decode(bytes)
}

async function readChunk(bucket: R2Bucket, keys: { audio: string; meta: string }, hash: string, chunk: NarrationChunk): Promise<OwnChunkMeta | null> {
  const [object, head] = await Promise.all([bucket.get(keys.meta), bucket.head(keys.audio)])
  if (!object || !head) return null
  let meta: OwnChunkMeta
  try { meta = await object.json() as OwnChunkMeta } catch { return null }
  if (!meta || meta.version !== NARRATION_CACHE_VERSION || meta.kind !== 'own-book' || meta.hash !== hash) return null
  if (meta.wordFrom !== chunk.wordFrom || meta.wordTo !== chunk.wordTo) return null
  if (!(meta.duration > 0) || !meta.timingsUsable || !Array.isArray(meta.words) || head.size !== meta.audioBytes || head.size < 800) return null
  return meta
}

/** Subscribed, or still in the 30-day trial. Null when the profile cannot be read. */
async function premiumAccess(env: OwnBookNarrationEnv, userId: string, now: number): Promise<boolean | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const res = await supabaseGet(env, `profiles?id=eq.${userId}&select=subscription_status,subscription_period_end,created_at`)
    if (!res.ok) return null
    const profile = ((await res.json()) as AllowanceProfile[])?.[0]
    if (!profile) return false
    const at = new Date(now)
    const trialEnd = trialEndsAt(profile)
    return isSubscribed(profile, at) || (trialEnd !== null && at.getTime() < trialEnd.getTime())
  } catch {
    return null
  }
}

function monthOf(now: number): string { return new Date(now).toISOString().slice(0, 7) }
function dayOf(now: number): string { return new Date(now).toISOString().slice(0, 10) }

export async function handleOwnEnsure(request: Request, env: OwnBookNarrationEnv, ctx: ExecutionContext, deps: NarrationDeps): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!ownBookNarrationAvailable(env)) return outsideScope(request)
  const user = await deps.verifyUser(env, request)
  if (!user || !isValidUUID(user.id)) return jsonResponse({ error: 'Sign in to prepare narration' }, 401, request)
  const premium = await premiumAccess(env, user.id, (deps.now || Date.now)())
  // Fail closed: an unreadable profile is not a reason to pay for audio.
  if (premium === null) return jsonResponse({ error: 'Narration unavailable' }, 503, request)
  if (!premium) return jsonResponse({ error: 'Premium required', reason: 'premium_required' }, 402, request)

  const raw = await readCappedText(request, OWN_BOOK_MAX_BODY_BYTES)
  if (raw === null) return jsonResponse({ error: 'Request too large' }, 413, request)
  let body: OwnEnsureBody
  try { body = JSON.parse(raw) as OwnEnsureBody } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  const hex = typeof body.book === 'string' ? body.book : ''
  const voiceKey = typeof body.voice === 'string' ? body.voice : ''
  const mode: 'next' | 'all' = body.mode === 'all' ? 'all' : 'next'
  if (!/^[0-9a-f]{24,64}$/.test(hex)) return jsonResponse({ error: 'Invalid book' }, 400, request)
  const requested = Array.isArray(body.paragraphs) ? body.paragraphs as Array<{ index?: unknown; text?: unknown; fromChunk?: unknown }> : []
  if (requested.length === 0 || requested.length > NARRATION_MAX_PARAGRAPHS_PER_REQUEST) {
    return jsonResponse({ error: `Request 1–${NARRATION_MAX_PARAGRAPHS_PER_REQUEST} paragraphs` }, 400, request)
  }
  for (const item of requested) {
    if (!item || typeof item.text !== 'string' || !Number.isInteger(item.index) || Number(item.index) < 0) return jsonResponse({ error: 'Invalid paragraph' }, 400, request)
    if (item.text.length > OWN_BOOK_MAX_PARAGRAPH_CHARS) return jsonResponse({ error: 'Paragraph too long' }, 413, request)
  }
  const config = narrationConfig(env)
  const voice = config.voices.find(item => item.key === voiceKey)
  if (!voice) return jsonResponse({ error: 'Unknown voice' }, 400, request)
  if (!await deps.checkRateLimit(`narration:own:${user.id}`, env.RATE_LIMIT, OWN_BOOK_ENSURE_RATE_PER_MINUTE)) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  }

  const bucket = env.USER_BOOKS!
  // Owner only: the book must be a file stored under the caller's own prefix.
  const bookHex = await ownedBookHex(bucket, user.id, hex)
  if (!bookHex) return jsonResponse({ error: 'Not found' }, 404, request)

  const coordinator = env.NARRATION_COORDINATOR!
  const now = deps.now || Date.now
  const sleep = deps.sleep || ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)))
  const fetchImpl = deps.fetchImpl || fetch
  const secret = urlSecret(env)!
  const limits = ownBookNarrationLimits(env)
  const startedAt = now()
  let generationDone = false
  let blocked: 'own_book_cap' | 'own_book_pool' | null = null
  const results: unknown[] = []

  for (const item of requested) {
    const index = Number(item.index)
    const tokens = narrationTokens(item.text as string)
    const chunks = chunkNarrationTokens(tokens)
    const textHash = await sha256Hex(tokens.join(' '))
    if (chunks.length === 0) { results.push({ paragraph: index, status: 'failed', textHash, reason: 'empty_paragraph' }); continue }
    const fromChunk = Number.isInteger(item.fromChunk) && Number(item.fromChunk) >= 0 && Number(item.fromChunk) < chunks.length ? Number(item.fromChunk) : 0
    const identities = await Promise.all(chunks.map(chunk => narrationCacheIdentity({ provider: 'grok', model: config.model, voiceId: voice.id, text: chunk.text, settings: config.settings }).then(identity => identity.hash)))
    const ready = new Map<number, ReadyOwnChunk>()
    const adopt = async (chunk: NarrationChunk, meta: OwnChunkMeta) => {
      ready.set(chunk.index, { index: chunk.index, hash: identities[chunk.index], meta, url: await ownAudioUrl(secret, user.id, bookHex, identities[chunk.index], now()) })
    }
    for (const chunk of chunks) {
      const meta = await readChunk(bucket, audioKeys(user.id, bookHex, identities[chunk.index]), identities[chunk.index], chunk)
      if (meta) await adopt(chunk, meta)
    }

    let failure: { reason: string; retryAfterMs?: number; detail?: string } | null = null
    const extra: Record<string, unknown> = {}
    while (!generationDone && !failure && ready.size < chunks.length) {
      if (now() - startedAt > REQUEST_TIME_BUDGET_MS) { generationDone = true; break }
      const chunk = chunks.find(candidate => candidate.index >= fromChunk && !ready.has(candidate.index))
      if (!chunk) break
      const hash = identities[chunk.index]
      const keys = audioKeys(user.id, bookHex, hash)
      // Lease per (account, book, recording); the name carries no ids in the clear.
      const lease = coordinator.getByName('own-chunk:' + await sha256Hex(`${user.id}\n${bookHex}\n${hash}`))
      const token = `${now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      if (!await lease.claim(token)) { extra.retryAfterMs = 1000; break }
      try {
        const arrived = await readChunk(bucket, keys, hash, chunk)
        if (arrived) { await adopt(chunk, arrived); continue }
        const textBytes = utf8ByteLength(chunk.text)
        const synthesis = await synthesizeWithGrok({
          apiKey: env.XAI_API_KEY as string, baseUrl: config.baseUrl, voiceId: voice.id,
          text: chunk.text, settings: config.settings, fetchImpl, sleep, now,
          deadlineAt: startedAt + REQUEST_TIME_BUDGET_MS + PROVIDER_TIMEOUT_MS,
          reserve: async () => {
            const at = now()
            const day = dayOf(at)
            const account = coordinator.getByName('own-user:' + user.id)
            if (!await account.reserveMonth(day, textBytes, limits.accountBytes)) { blocked = 'own_book_cap'; return false }
            if (!await coordinator.getByName('own-budget:' + monthOf(at)).reserve(day, textBytes, limits.globalBytes, limits.globalBytes)) {
              await account.refund(day, textBytes)
              blocked = 'own_book_pool'
              return false
            }
            return true
          },
        })
        // The provider has billed these characters whether or not validation passes.
        recordAiUsage(env as LedgerEnv, ctx, { userId: user.id, guest: ledgerGuestKey(request) }, {
          feature: 'narration_generate', provider: 'xai', model: config.model, chars: chunk.text.length,
          cache_hit: false, book_id: OWN_BOOK_LEDGER_BOOK_ID, cost_usd: narrationCostUsd(chunk.text.length),
        })
        const validation = validateNarrationAsset({ text: chunk.text, audio: synthesis.audio, reportedDuration: synthesis.reportedDuration, segments: synthesis.segments })
        if (!validation.ok || !validation.timingsUsable) { failure = { reason: 'validation_failed', detail: `chunk ${chunk.index}` }; break }
        const meta: OwnChunkMeta = {
          version: NARRATION_CACHE_VERSION, kind: 'own-book', provider: 'grok', model: config.model, voiceId: voice.id, hash,
          wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, duration: validation.duration, words: validation.words,
          alignment: validation.alignment, timingsUsable: validation.timingsUsable, audioBytes: synthesis.audio.length,
          createdAt: new Date(now()).toISOString(),
        }
        await bucket.put(keys.audio, synthesis.audio, { httpMetadata: { contentType: 'audio/mpeg' } })
        await bucket.put(keys.meta, JSON.stringify(meta), { httpMetadata: { contentType: 'application/json' } })
        await adopt(chunk, meta)
        extra.source = 'generated'
        if (mode === 'next') generationDone = true
      } catch (error) {
        const fail = error instanceof NarrationProviderError ? error : new NarrationProviderError('storage', 'storage_failed')
        if (fail.code === 'budget_exhausted') {
          failure = { reason: blocked ?? 'own_book_cap' }
          generationDone = true
        } else {
          failure = { reason: fail.code, retryAfterMs: fail.code === 'provider_unavailable' ? 3000 : undefined, detail: `chunk ${chunk.index}` }
          if (fail.code === 'provider_auth' || fail.code === 'provider_payment') generationDone = true
        }
      } finally {
        try { await lease.release(token) } catch { /* the lease expires on its own */ }
      }
    }

    const sorted = [...ready.values()].sort((a, b) => a.index - b.index)
    const complete = sorted.length === chunks.length
    const merged = complete ? paragraphWordsFromChunks(sorted.map(item => ({ words: item.meta.words ?? [], duration: item.meta.duration }))) : null
    if (failure && sorted.length === 0) {
      results.push({ paragraph: index, status: 'failed', textHash, ...failure })
      continue
    }
    results.push({
      paragraph: index,
      status: complete ? 'ready' : sorted.length > 0 ? 'partial' : 'pending',
      textHash,
      chunkCount: chunks.length,
      readyChunks: sorted.length,
      chunks: chunks.map(chunk => {
        const item = ready.get(chunk.index)
        if (!item) return { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: false }
        return {
          index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: true, hash: item.hash, url: item.url,
          duration: item.meta.duration, words: item.meta.words, alignment: item.meta.alignment, timingsUsable: item.meta.timingsUsable,
        }
      }),
      duration: merged?.duration,
      words: merged ? merged.words : null,
      timingsUsable: complete,
      ...extra,
      ...(failure ? { failure } : {}),
    })
  }

  // Over a ceiling with nothing to play at the reader's place: a 429 the reader shows.
  const first = results[0] as { status?: string; chunks?: Array<{ index: number; ready: boolean }> } | undefined
  const firstFrom = Number.isInteger(requested[0]?.fromChunk) ? Number(requested[0].fromChunk) : 0
  const firstPlayable = Boolean(first?.chunks?.some(chunk => chunk.index === firstFrom && chunk.ready))
  if (blocked && !firstPlayable) {
    const response = jsonResponse({ error: 'Narration limit reached', reason: blocked }, 429, request)
    response.headers.set('Cache-Control', 'no-store')
    return response
  }
  const response = jsonResponse({ voice: voice.key, model: config.model, mode, paragraphs: results }, 200, request)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export const ownBookNarrationInternalsForTest = { audioKeys, URL_ROUNDING_MS }
