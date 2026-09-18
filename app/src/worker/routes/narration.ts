/**
 * Fish Audio narration pilot — Worker routes.
 *
 *   GET  /api/narration/voices   public   pilot configuration and curated voices
 *   GET  /api/narration/chapter  public   which paragraphs of a chapter are cached for a voice
 *   POST /api/narration/ensure   signed-in  make 1–3 paragraphs playable (cache hit or generate)
 *   GET  /api/narration/usage    admin    generation accounting and ceilings
 *
 * Audio bytes themselves are served by the existing `/api/audio-file` route
 * from `narration/fish/blob/{hash}.mp3`. The Fish API key only ever lives in
 * the Worker secret `FISH_AUDIO_API_KEY`; it is never logged or echoed.
 *
 * Cache layout (R2, bucket `tinct-audio`):
 *   narration/fish/blob/{hash}.mp3              the recording
 *   narration/fish/blob/{hash}.json             NarrationBlobMeta (text, timings, provenance)
 *   narration/fish/map/{book}/{edition}/ch{N}/{voiceKey}/p{i}.json   NarrationMapEntry
 * A map entry is written last, after audio and meta validated, so a reader
 * that finds a map entry always finds a complete recording behind it. The
 * map entry carries the text hash of the words it was recorded from; the
 * reader and this route both recompute that hash from the live text, so a
 * changed paragraph simply stops matching and is regenerated on demand.
 */

import { jsonResponse } from '../lib/responses'
import { supabaseGet, type SupabaseEnv } from '../lib/supabase'
import {
  DEFAULT_NARRATION_SETTINGS,
  NARRATION_CACHE_VERSION,
  NARRATION_MAX_PARAGRAPHS_PER_REQUEST,
  NARRATION_PROVIDER,
  absoluteSegments,
  isPilotScope,
  narrationAudioPath,
  narrationBlobKeys,
  narrationCacheIdentity,
  narrationMapKey,
  narrationMapPrefix,
  narrationTextForParagraph,
  parseFishTimestampSse,
  sha256Hex,
  utf8ByteLength,
  validateNarrationAsset,
  type AlignedWord,
  type NarrationBlobMeta,
  type NarrationMapEntry,
  type NarrationSynthesisSettings,
  type TimingSegment,
  type TokenAlignmentStats,
} from '../../narration/narrationCore'

export type NarrationEnv = SupabaseEnv & {
  FISH_AUDIO_API_KEY?: string
  /** '1' switches the pilot routes on; anything else answers "not configured". */
  NARRATION_PILOT?: string
  NARRATION_MODEL?: string
  NARRATION_VOICE_A_ID?: string
  NARRATION_VOICE_A_LABEL?: string
  NARRATION_VOICE_B_ID?: string
  NARRATION_VOICE_B_LABEL?: string
  /** Spending ceilings in UTF-8 text bytes sent to the provider. */
  NARRATION_DAILY_BYTES?: string
  NARRATION_MONTHLY_BYTES?: string
  /** Override for tests and mocks; production uses the Fish API origin. */
  NARRATION_FISH_BASE_URL?: string
  RATE_LIMIT?: KVNamespace
  AUDIO_BUCKET?: R2Bucket
  ASSETS?: { fetch: (request: Request) => Promise<Response> }
}

export interface NarrationDeps {
  verifyUser: (env: NarrationEnv, request: Request) => Promise<{ id: string; email: string } | null>
  verifySiteAdmin: (env: NarrationEnv, request: Request) => Promise<boolean>
  checkRateLimit: (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>
  fetchImpl?: typeof fetch
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

export const FISH_API_BASE_URL = 'https://api.fish.audio'
export const NARRATION_DEFAULT_MODEL = 's2.1-pro'
export const NARRATION_DEFAULT_DAILY_BYTES = 200_000   // ≈ $3 / day at $15 per M bytes
export const NARRATION_DEFAULT_MONTHLY_BYTES = 1_000_000 // ≈ $15 / month
export const NARRATION_ENSURE_RATE_PER_MINUTE = 40
const LOCK_TTL_SECONDS = 120
const LOCK_WAIT_MS = 20_000
const LOCK_POLL_MS = 750
const PROVIDER_TIMEOUT_MS = 45_000
const PROVIDER_RETRY_DELAYS_MS = [400, 1200]
const BREAKER_OPEN_MS = 60_000
const BREAKER_FAILURES = 3
const REQUEST_TIME_BUDGET_MS = 55_000

export interface NarrationVoice {
  key: string
  id: string
  label: string
}

export interface NarrationConfig {
  enabled: boolean
  reason?: 'pilot_off' | 'missing_api_key' | 'missing_voices' | 'missing_bucket'
  provider: typeof NARRATION_PROVIDER
  model: string
  voices: NarrationVoice[]
  settings: NarrationSynthesisSettings
  dailyBytes: number
  monthlyBytes: number
  baseUrl: string
}

export function narrationConfig(env: NarrationEnv): NarrationConfig {
  const voices: NarrationVoice[] = []
  if (env.NARRATION_VOICE_A_ID) voices.push({ key: 'a', id: env.NARRATION_VOICE_A_ID, label: env.NARRATION_VOICE_A_LABEL || 'Voice A' })
  if (env.NARRATION_VOICE_B_ID) voices.push({ key: 'b', id: env.NARRATION_VOICE_B_ID, label: env.NARRATION_VOICE_B_LABEL || 'Voice B' })
  const base = {
    provider: NARRATION_PROVIDER,
    model: env.NARRATION_MODEL || NARRATION_DEFAULT_MODEL,
    voices,
    settings: DEFAULT_NARRATION_SETTINGS,
    dailyBytes: positiveInt(env.NARRATION_DAILY_BYTES, NARRATION_DEFAULT_DAILY_BYTES),
    monthlyBytes: positiveInt(env.NARRATION_MONTHLY_BYTES, NARRATION_DEFAULT_MONTHLY_BYTES),
    baseUrl: env.NARRATION_FISH_BASE_URL || FISH_API_BASE_URL,
  }
  if (env.NARRATION_PILOT !== '1') return { ...base, enabled: false, reason: 'pilot_off' }
  if (!env.FISH_AUDIO_API_KEY) return { ...base, enabled: false, reason: 'missing_api_key' }
  if (voices.length === 0) return { ...base, enabled: false, reason: 'missing_voices' }
  if (!env.AUDIO_BUCKET) return { ...base, enabled: false, reason: 'missing_bucket' }
  return { ...base, enabled: true }
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

// ===== Router =====

export async function handleNarration(request: Request, env: NarrationEnv, ctx: ExecutionContext, deps: NarrationDeps): Promise<Response> {
  const url = new URL(request.url)
  const sub = url.pathname.replace(/^\/api\/narration\/?/, '')
  switch (sub) {
    case 'voices': return handleVoices(request, env)
    case 'chapter': return handleChapter(request, env)
    case 'ensure': return handleEnsure(request, env, ctx, deps)
    case 'usage': return handleUsage(request, env, deps)
    default: return jsonResponse({ error: 'Not found' }, 404, request)
  }
}

function publicConfig(config: NarrationConfig) {
  return {
    enabled: config.enabled,
    reason: config.reason,
    provider: config.provider,
    model: config.model,
    voices: config.voices.map(voice => ({ key: voice.key, label: voice.label })),
    settings: config.settings,
    scope: { bookId: 'odyssey', chapters: [1], editionKeys: ['original-en', 'modern-en'] },
    cacheVersion: NARRATION_CACHE_VERSION,
  }
}

async function handleVoices(request: Request, env: NarrationEnv): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const response = jsonResponse(publicConfig(narrationConfig(env)), 200, request)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

// ===== Edition text =====

interface ChapterText {
  paragraphs: string[]
}

async function loadChapterParagraphs(request: Request, env: NarrationEnv, bookId: string, editionKey: string, chapter: number): Promise<ChapterText | null> {
  if (!env.ASSETS) return null
  const asset = await env.ASSETS.fetch(new Request(new URL(`/data/editions/${bookId}-${editionKey}.json`, request.url)))
  if (!asset.ok) return null
  let data: { chapters?: Array<{ number?: number; paragraphs?: string[] }> }
  try { data = await asset.json() as typeof data } catch { return null }
  const chapters = data.chapters || []
  const entry = chapters.find(item => item.number === chapter) ?? chapters[chapter - 1]
  if (!entry || !Array.isArray(entry.paragraphs)) return null
  const paragraphs = entry.paragraphs.map(item => (typeof item === 'string' ? item : ''))
  // Reader-visible text corrections are applied the same way editionLoader does
  // (a patch shorter than half the paragraph is ignored as truncated).
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await supabaseGet(env, `edition_patches?book_id=eq.${encodeURIComponent(bookId)}&edition_key=eq.${encodeURIComponent(editionKey)}&chapter_number=eq.${chapter}&select=paragraph_index,patched_text`)
      if (res.ok) {
        const patches = await res.json() as Array<{ paragraph_index: number; patched_text: string }>
        for (const patch of patches) {
          const index = patch.paragraph_index
          if (index >= 0 && index < paragraphs.length && typeof patch.patched_text === 'string'
            && patch.patched_text.length >= paragraphs[index].length * 0.5) {
            paragraphs[index] = patch.patched_text
          }
        }
      }
    } catch { /* patches are optional; unpatched text still hashes consistently with an unpatched reader */ }
  }
  return { paragraphs }
}

function parseScope(url: URL): { bookId: string; editionKey: string; chapter: number; voiceKey: string } | null {
  const bookId = url.searchParams.get('bookId') || ''
  const editionKey = url.searchParams.get('editionKey') || ''
  const chapter = Number(url.searchParams.get('chapter'))
  const voiceKey = url.searchParams.get('voice') || ''
  if (!/^[a-z0-9-]{1,64}$/.test(bookId) || !/^[a-z0-9-]{1,32}$/.test(editionKey)) return null
  if (!Number.isInteger(chapter) || chapter < 1) return null
  if (!/^[a-z]$/.test(voiceKey)) return null
  return { bookId, editionKey, chapter, voiceKey }
}

// ===== Storage helpers =====

async function readJsonObject<T>(bucket: R2Bucket, key: string): Promise<T | null> {
  const object = await bucket.get(key)
  if (!object) return null
  try { return await object.json() as T } catch { return null }
}

async function readMapEntry(bucket: R2Bucket, key: string): Promise<NarrationMapEntry | null> {
  const entry = await readJsonObject<NarrationMapEntry>(bucket, key)
  if (!entry || entry.version !== NARRATION_CACHE_VERSION || typeof entry.hash !== 'string' || typeof entry.textHash !== 'string') return null
  return entry
}

interface ReadyEntry {
  hash: string
  textHash: string
  duration: number
  words: AlignedWord[] | null
  alignment: TokenAlignmentStats
  timingsUsable: boolean
  audioBytes: number
}

/** A cached recording counts only when its map entry, meta and audio all agree with the live text. */
async function readReadyEntry(bucket: R2Bucket, mapKey: string, expected: { textHash: string; hash: string }): Promise<ReadyEntry | null> {
  const entry = await readMapEntry(bucket, mapKey)
  if (!entry || entry.textHash !== expected.textHash || entry.hash !== expected.hash) return null
  const keys = narrationBlobKeys(entry.hash)
  const [meta, head] = await Promise.all([readJsonObject<NarrationBlobMeta>(bucket, keys.meta), bucket.head(keys.audio)])
  if (!meta || !head || meta.version !== NARRATION_CACHE_VERSION || meta.textHash !== expected.textHash || meta.hash !== expected.hash) return null
  if (!(meta.duration > 0) || head.size !== meta.audioBytes || head.size < 800) return null
  return {
    hash: meta.hash,
    textHash: meta.textHash,
    duration: meta.duration,
    words: meta.timingsUsable && Array.isArray(meta.words) ? meta.words : null,
    alignment: meta.alignment,
    timingsUsable: meta.timingsUsable,
    audioBytes: meta.audioBytes,
  }
}

function readyPayload(paragraph: number, entry: ReadyEntry, source: 'cache' | 'generated', extra: Record<string, unknown> = {}) {
  return {
    paragraph,
    status: 'ready' as const,
    source,
    hash: entry.hash,
    textHash: entry.textHash,
    audioPath: narrationAudioPath(entry.hash),
    url: `/api/audio-file?path=${encodeURIComponent(narrationAudioPath(entry.hash))}`,
    duration: entry.duration,
    words: entry.words,
    alignment: entry.alignment,
    timingsUsable: entry.timingsUsable,
    ...extra,
  }
}

// ===== GET /api/narration/chapter =====

async function handleChapter(request: Request, env: NarrationEnv): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const config = narrationConfig(env)
  const scope = parseScope(new URL(request.url))
  if (!scope) return jsonResponse({ error: 'Invalid scope' }, 400, request)
  if (!config.enabled || !env.AUDIO_BUCKET) return jsonResponse({ ...publicConfig(config), paragraphs: [] }, 200, request)
  if (!isPilotScope(scope.bookId, scope.editionKey, scope.chapter)) return jsonResponse({ error: 'Outside the pilot scope' }, 403, request)
  const voice = config.voices.find(item => item.key === scope.voiceKey)
  if (!voice) return jsonResponse({ error: 'Unknown voice' }, 400, request)
  const text = await loadChapterParagraphs(request, env, scope.bookId, scope.editionKey, scope.chapter)
  if (!text) return jsonResponse({ error: 'Chapter text unavailable' }, 404, request)

  const bucket = env.AUDIO_BUCKET
  const listed = await bucket.list({ prefix: narrationMapPrefix(scope.bookId, scope.editionKey, scope.chapter, voice.key) })
  const present = new Set(listed.objects.map((object: { key: string }) => object.key))
  const paragraphs = await Promise.all(text.paragraphs.map(async (raw, index) => {
    const narration = narrationTextForParagraph(raw)
    const identity = await narrationCacheIdentity({ provider: NARRATION_PROVIDER, model: config.model, voiceId: voice.id, text: narration, settings: config.settings })
    const mapKey = narrationMapKey(scope.bookId, scope.editionKey, scope.chapter, voice.key, index)
    if (!present.has(mapKey)) return { paragraph: index, status: 'missing' as const, textHash: identity.textHash }
    const ready = await readReadyEntry(bucket, mapKey, { textHash: identity.textHash, hash: identity.hash })
    if (!ready) return { paragraph: index, status: 'stale' as const, textHash: identity.textHash }
    return readyPayload(index, ready, 'cache')
  }))
  const response = jsonResponse({
    bookId: scope.bookId,
    editionKey: scope.editionKey,
    chapter: scope.chapter,
    voice: voice.key,
    model: config.model,
    paragraphs,
  }, 200, request)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

// ===== Usage accounting, ceilings, breaker =====

interface UsageCounters {
  bytes: number
  requests: number
  generated: number
  failed: number
  cacheHits: number
  providerMs: number
}

const EMPTY_USAGE: UsageCounters = { bytes: 0, requests: 0, generated: 0, failed: 0, cacheHits: 0, providerMs: 0 }

function usageKeys(now: number): { day: string; month: string } {
  const date = new Date(now)
  const day = date.toISOString().slice(0, 10)
  return { day: `narration:usage:day:${day}`, month: `narration:usage:month:${day.slice(0, 7)}` }
}

async function readUsage(kv: KVNamespace | undefined, key: string): Promise<UsageCounters> {
  if (!kv) return { ...EMPTY_USAGE }
  try {
    const stored = await kv.get<Partial<UsageCounters>>(key, 'json')
    return { ...EMPTY_USAGE, ...(stored || {}) }
  } catch {
    return { ...EMPTY_USAGE }
  }
}

async function addUsage(kv: KVNamespace | undefined, now: number, delta: Partial<UsageCounters>): Promise<void> {
  if (!kv) return
  const keys = usageKeys(now)
  for (const [key, ttl] of [[keys.day, 3 * 86400], [keys.month, 40 * 86400]] as const) {
    try {
      const current = await readUsage(kv, key)
      const next: UsageCounters = { ...current }
      for (const field of Object.keys(EMPTY_USAGE) as Array<keyof UsageCounters>) {
        next[field] = current[field] + (delta[field] ?? 0)
      }
      await kv.put(key, JSON.stringify(next), { expirationTtl: ttl })
    } catch { /* accounting is best effort; ceilings stay conservative */ }
  }
}

interface Breaker { failures: number; openUntil: number }

async function readBreaker(kv: KVNamespace | undefined): Promise<Breaker> {
  if (!kv) return { failures: 0, openUntil: 0 }
  try { return { failures: 0, openUntil: 0, ...((await kv.get<Partial<Breaker>>('narration:breaker', 'json')) || {}) } } catch { return { failures: 0, openUntil: 0 } }
}

async function recordProviderOutcome(kv: KVNamespace | undefined, now: number, ok: boolean): Promise<void> {
  if (!kv) return
  try {
    if (ok) { await kv.delete('narration:breaker'); return }
    const current = await readBreaker(kv)
    const failures = current.failures + 1
    const openUntil = failures >= BREAKER_FAILURES ? now + BREAKER_OPEN_MS : 0
    await kv.put('narration:breaker', JSON.stringify({ failures, openUntil }), { expirationTtl: 600 })
  } catch { /* best effort */ }
}

async function handleUsage(request: Request, env: NarrationEnv, deps: NarrationDeps): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!await deps.verifySiteAdmin(env, request)) return jsonResponse({ error: 'Forbidden' }, 403, request)
  const config = narrationConfig(env)
  const now = (deps.now || Date.now)()
  const keys = usageKeys(now)
  const [day, month, breaker] = await Promise.all([readUsage(env.RATE_LIMIT, keys.day), readUsage(env.RATE_LIMIT, keys.month), readBreaker(env.RATE_LIMIT)])
  return jsonResponse({
    ...publicConfig(config),
    ceilings: { dailyBytes: config.dailyBytes, monthlyBytes: config.monthlyBytes },
    day, month,
    breaker: { failures: breaker.failures, open: breaker.openUntil > now, openUntil: breaker.openUntil || null },
    pricing: { usdPerMillionBytes: 15, note: 'Fish s2.1-pro list price; verify against the account statement.' },
  }, 200, request)
}

// ===== Provider =====

export interface FishSynthesisResult {
  audio: Uint8Array
  segments: TimingSegment[]
  reportedDuration: number
  timingsSource: 'with-timestamp' | 'none'
  attempts: number
  providerMs: number
}

export class NarrationProviderError extends Error {
  constructor(message: string, readonly code: 'provider_auth' | 'provider_payment' | 'provider_unavailable' | 'provider_rejected' | 'provider_empty', readonly status?: number) {
    super(message)
  }
}

function fishRequestBody(text: string, voiceId: string, settings: NarrationSynthesisSettings): string {
  return JSON.stringify({
    text,
    reference_id: voiceId,
    format: settings.format,
    mp3_bitrate: settings.mp3Bitrate,
    latency: settings.latency,
    normalize: settings.normalize,
    temperature: settings.temperature,
    top_p: settings.topP,
    prosody: { speed: settings.speed },
    chunk_length: settings.chunkLength,
  })
}

async function fetchWithTimeout(fetchImpl: typeof fetch, input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * One paragraph through Fish, timestamps first. Retries are bounded (two
 * backoffs) and only for overload / network failures; authentication, payment
 * and validation errors surface immediately so a misconfiguration cannot turn
 * into a retry storm. If the timestamp endpoint is unavailable on the account
 * the plain endpoint is used once and the result carries no timings.
 */
export async function synthesizeWithFish(input: {
  apiKey: string
  baseUrl: string
  model: string
  voiceId: string
  text: string
  settings: NarrationSynthesisSettings
  fetchImpl: typeof fetch
  sleep: (ms: number) => Promise<void>
  now: () => number
}): Promise<FishSynthesisResult> {
  const startedAt = input.now()
  const headers = {
    Authorization: `Bearer ${input.apiKey}`,
    model: input.model,
    'Content-Type': 'application/json',
  }
  const body = fishRequestBody(input.text, input.voiceId, input.settings)
  let attempts = 0
  let lastError: NarrationProviderError | null = null
  let endpoint: 'with-timestamp' | 'none' = 'with-timestamp'
  for (let attempt = 0; attempt <= PROVIDER_RETRY_DELAYS_MS.length; attempt += 1) {
    if (attempt > 0) await input.sleep(PROVIDER_RETRY_DELAYS_MS[attempt - 1])
    attempts += 1
    let response: Response
    try {
      response = await fetchWithTimeout(
        input.fetchImpl,
        endpoint === 'with-timestamp' ? `${input.baseUrl}/v1/tts/stream/with-timestamp` : `${input.baseUrl}/v1/tts`,
        { method: 'POST', headers: { ...headers, Accept: endpoint === 'with-timestamp' ? 'text/event-stream' : 'audio/mpeg' }, body },
        PROVIDER_TIMEOUT_MS,
      )
    } catch (error) {
      lastError = new NarrationProviderError(`network: ${(error as Error)?.name || 'error'}`, 'provider_unavailable')
      continue
    }
    if (response.status === 401 || response.status === 403) throw new NarrationProviderError('Fish rejected the API key', 'provider_auth', response.status)
    if (response.status === 402) throw new NarrationProviderError('Fish account has no credit', 'provider_payment', response.status)
    if ((response.status === 404 || response.status === 405 || response.status === 501) && endpoint === 'with-timestamp') {
      endpoint = 'none'
      attempt -= 1 // the fallback endpoint gets a fresh attempt budget
      continue
    }
    if (response.status === 429 || response.status >= 500) {
      lastError = new NarrationProviderError(`Fish answered ${response.status}`, 'provider_unavailable', response.status)
      continue
    }
    if (!response.ok) throw new NarrationProviderError(`Fish answered ${response.status}`, 'provider_rejected', response.status)

    if (endpoint === 'with-timestamp') {
      const stream = parseFishTimestampSse(await response.text())
      if (stream.audio.length === 0) throw new NarrationProviderError('Fish returned no audio', 'provider_empty', response.status)
      const absolute = absoluteSegments(stream.snapshots)
      return { audio: stream.audio, segments: absolute.segments, reportedDuration: absolute.duration, timingsSource: 'with-timestamp', attempts, providerMs: input.now() - startedAt }
    }
    const audio = new Uint8Array(await response.arrayBuffer())
    if (audio.length === 0) throw new NarrationProviderError('Fish returned no audio', 'provider_empty', response.status)
    return { audio, segments: [], reportedDuration: 0, timingsSource: 'none', attempts, providerMs: input.now() - startedAt }
  }
  throw lastError || new NarrationProviderError('Fish unavailable', 'provider_unavailable')
}

// ===== POST /api/narration/ensure =====

interface EnsureRequestBody {
  bookId?: string
  editionKey?: string
  chapter?: number
  voice?: string
  paragraphs?: Array<{ index?: number; textHash?: string }>
}

type EnsureParagraphResult =
  | ReturnType<typeof readyPayload>
  | { paragraph: number; status: 'pending'; textHash: string; retryAfterMs: number }
  | { paragraph: number; status: 'text_mismatch'; textHash: string }
  | { paragraph: number; status: 'failed'; textHash: string; reason: string; retryAfterMs?: number; detail?: string }

async function handleEnsure(request: Request, env: NarrationEnv, ctx: ExecutionContext, deps: NarrationDeps): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const config = narrationConfig(env)
  if (!config.enabled || !env.AUDIO_BUCKET || !env.FISH_AUDIO_API_KEY) {
    return jsonResponse({ error: 'Narration pilot is not configured', reason: config.reason }, 503, request)
  }
  const user = await deps.verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Sign in to prepare narration' }, 401, request)

  let body: EnsureRequestBody
  try { body = await request.json() as EnsureRequestBody } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  const bookId = typeof body.bookId === 'string' ? body.bookId : ''
  const editionKey = typeof body.editionKey === 'string' ? body.editionKey : ''
  const chapter = typeof body.chapter === 'number' ? body.chapter : NaN
  const voiceKey = typeof body.voice === 'string' ? body.voice : ''
  if (!/^[a-z0-9-]{1,64}$/.test(bookId) || !/^[a-z0-9-]{1,32}$/.test(editionKey) || !Number.isInteger(chapter) || chapter < 1) {
    return jsonResponse({ error: 'Invalid scope' }, 400, request)
  }
  if (!isPilotScope(bookId, editionKey, chapter)) return jsonResponse({ error: 'Outside the pilot scope' }, 403, request)
  const voice = config.voices.find(item => item.key === voiceKey)
  if (!voice) return jsonResponse({ error: 'Unknown voice' }, 400, request)
  const requested = Array.isArray(body.paragraphs) ? body.paragraphs : []
  if (requested.length === 0 || requested.length > NARRATION_MAX_PARAGRAPHS_PER_REQUEST) {
    return jsonResponse({ error: `Request 1–${NARRATION_MAX_PARAGRAPHS_PER_REQUEST} paragraphs` }, 400, request)
  }
  if (!await deps.checkRateLimit(`narration:${user.id}`, env.RATE_LIMIT, NARRATION_ENSURE_RATE_PER_MINUTE)) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  }

  const text = await loadChapterParagraphs(request, env, bookId, editionKey, chapter)
  if (!text) return jsonResponse({ error: 'Chapter text unavailable' }, 404, request)

  const now = deps.now || Date.now
  const sleep = deps.sleep || ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)))
  const fetchImpl = deps.fetchImpl || fetch
  const bucket = env.AUDIO_BUCKET
  const kv = env.RATE_LIMIT
  const requestStartedAt = now()
  const results: EnsureParagraphResult[] = []
  let generatedThisRequest = 0

  for (const item of requested) {
    const index = typeof item.index === 'number' ? item.index : -1
    if (!Number.isInteger(index) || index < 0 || index >= text.paragraphs.length) {
      results.push({ paragraph: index, status: 'failed', textHash: '', reason: 'unknown_paragraph' })
      continue
    }
    const narration = narrationTextForParagraph(text.paragraphs[index])
    const identity = await narrationCacheIdentity({ provider: NARRATION_PROVIDER, model: config.model, voiceId: voice.id, text: narration, settings: config.settings })
    if (typeof item.textHash === 'string' && item.textHash !== identity.textHash) {
      results.push({ paragraph: index, status: 'text_mismatch', textHash: identity.textHash })
      continue
    }
    const mapKey = narrationMapKey(bookId, editionKey, chapter, voice.key, index)
    const cached = await readReadyEntry(bucket, mapKey, { textHash: identity.textHash, hash: identity.hash })
    if (cached) {
      results.push(readyPayload(index, cached, 'cache'))
      ctx.waitUntil(addUsage(kv, now(), { requests: 1, cacheHits: 1 }))
      continue
    }
    if (narration.length === 0) {
      results.push({ paragraph: index, status: 'failed', textHash: identity.textHash, reason: 'empty_paragraph' })
      continue
    }
    if (now() - requestStartedAt > REQUEST_TIME_BUDGET_MS) {
      results.push({ paragraph: index, status: 'pending', textHash: identity.textHash, retryAfterMs: 1500 })
      continue
    }

    // Someone else may be generating this exact recording right now.
    const lockKey = `narration:lock:${identity.hash}`
    let locked = false
    try { locked = !!(kv && await kv.get(lockKey)) } catch { locked = false }
    if (locked) {
      const waitedFor = await waitForRecording(bucket, mapKey, identity, now, sleep)
      if (waitedFor) {
        results.push(readyPayload(index, waitedFor, 'cache', { waited: true }))
        ctx.waitUntil(addUsage(kv, now(), { requests: 1, cacheHits: 1 }))
      } else {
        results.push({ paragraph: index, status: 'pending', textHash: identity.textHash, retryAfterMs: 1500 })
      }
      continue
    }

    const breaker = await readBreaker(kv)
    if (breaker.openUntil > now()) {
      results.push({ paragraph: index, status: 'failed', textHash: identity.textHash, reason: 'provider_unavailable', retryAfterMs: breaker.openUntil - now() })
      continue
    }
    const textBytes = utf8ByteLength(narration)
    const keys = usageKeys(now())
    const [day, month] = await Promise.all([readUsage(kv, keys.day), readUsage(kv, keys.month)])
    if (day.bytes + textBytes > config.dailyBytes || month.bytes + textBytes > config.monthlyBytes) {
      results.push({ paragraph: index, status: 'failed', textHash: identity.textHash, reason: 'budget_exhausted', retryAfterMs: msUntilNextUtcDay(now()) })
      ctx.waitUntil(addUsage(kv, now(), { requests: 1, failed: 1 }))
      continue
    }

    try { await kv?.put(lockKey, JSON.stringify({ at: now(), by: user.id.slice(0, 8) }), { expirationTtl: LOCK_TTL_SECONDS }) } catch { /* proceed without a lock */ }
    const generationStartedAt = now()
    try {
      const synthesis = await synthesizeWithFish({
        apiKey: env.FISH_AUDIO_API_KEY, baseUrl: config.baseUrl, model: config.model, voiceId: voice.id,
        text: narration, settings: config.settings, fetchImpl, sleep, now,
      })
      const validation = validateNarrationAsset({ text: narration, audio: synthesis.audio, reportedDuration: synthesis.reportedDuration, segments: synthesis.segments })
      await recordProviderOutcome(kv, now(), true)
      if (!validation.ok) {
        results.push({ paragraph: index, status: 'failed', textHash: identity.textHash, reason: 'validation_failed', detail: validation.reasons.join(',') })
        ctx.waitUntil(addUsage(kv, now(), { requests: 1, failed: 1, bytes: textBytes, providerMs: synthesis.providerMs }))
        continue
      }
      const generationMs = now() - generationStartedAt
      const meta: NarrationBlobMeta = {
        version: NARRATION_CACHE_VERSION,
        provider: NARRATION_PROVIDER,
        model: config.model,
        voiceId: voice.id,
        voiceKey: voice.key,
        settings: config.settings,
        hash: identity.hash,
        textHash: identity.textHash,
        text: narration,
        bookId, editionKey, chapter, paragraphIndex: index,
        createdAt: new Date(now()).toISOString(),
        audioBytes: synthesis.audio.length,
        textBytes,
        duration: validation.duration,
        measuredDuration: validation.measuredDuration,
        words: validation.words,
        alignment: validation.alignment,
        timingsUsable: validation.timingsUsable,
        providerSegments: synthesis.segments,
        generationMs,
      }
      const blobKeys = narrationBlobKeys(identity.hash)
      await bucket.put(blobKeys.audio, synthesis.audio, { httpMetadata: { contentType: 'audio/mpeg' } })
      await bucket.put(blobKeys.meta, JSON.stringify(meta), { httpMetadata: { contentType: 'application/json' } })
      const mapEntry: NarrationMapEntry = {
        version: NARRATION_CACHE_VERSION,
        hash: identity.hash,
        textHash: identity.textHash,
        voiceKey: voice.key,
        voiceId: voice.id,
        model: config.model,
        bookId, editionKey, chapter, paragraphIndex: index,
        publishedAt: new Date(now()).toISOString(),
      }
      await bucket.put(mapKey, JSON.stringify(mapEntry), { httpMetadata: { contentType: 'application/json' } })
      generatedThisRequest += 1
      ctx.waitUntil(addUsage(kv, now(), { requests: 1, generated: 1, bytes: textBytes, providerMs: synthesis.providerMs }))
      results.push(readyPayload(index, {
        hash: identity.hash, textHash: identity.textHash, duration: validation.duration, words: validation.words,
        alignment: validation.alignment, timingsUsable: validation.timingsUsable, audioBytes: synthesis.audio.length,
      }, 'generated', { generationMs, providerMs: synthesis.providerMs, attempts: synthesis.attempts, timingsSource: synthesis.timingsSource, textBytes }))
    } catch (error) {
      const failure = error instanceof NarrationProviderError ? error : new NarrationProviderError(String((error as Error)?.message || error), 'provider_unavailable')
      await recordProviderOutcome(kv, now(), failure.code === 'provider_rejected' || failure.code === 'provider_empty' ? true : false)
      ctx.waitUntil(addUsage(kv, now(), { requests: 1, failed: 1 }))
      results.push({
        paragraph: index, status: 'failed', textHash: identity.textHash, reason: failure.code,
        retryAfterMs: failure.code === 'provider_unavailable' ? 3000 : undefined,
      })
      if (failure.code === 'provider_auth' || failure.code === 'provider_payment') break
    } finally {
      try { await kv?.delete(lockKey) } catch { /* lock expires on its own */ }
    }
  }

  return jsonResponse({
    bookId, editionKey, chapter, voice: voice.key, model: config.model,
    paragraphs: results,
    generated: generatedThisRequest,
  }, 200, request)
}

async function waitForRecording(
  bucket: R2Bucket,
  mapKey: string,
  identity: { textHash: string; hash: string },
  now: () => number,
  sleep: (ms: number) => Promise<void>,
): Promise<ReadyEntry | null> {
  const deadline = now() + LOCK_WAIT_MS
  while (now() < deadline) {
    await sleep(LOCK_POLL_MS)
    const ready = await readReadyEntry(bucket, mapKey, identity)
    if (ready) return ready
  }
  return null
}

function msUntilNextUtcDay(now: number): number {
  const next = new Date(now)
  next.setUTCHours(24, 0, 0, 0)
  return Math.max(1000, next.getTime() - now)
}

export const narrationInternalsForTest = { usageKeys, readUsage, sha256Hex }
