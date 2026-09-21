/**
 * Fish Audio narration pilot — Worker routes.
 *
 *   GET  /api/narration/voices   public   pilot configuration and curated voices
 *   GET  /api/narration/chapter  public   which paragraphs of a chapter are cached for a voice
 *   POST /api/narration/ensure   signed-in  make 1–3 paragraphs playable (cache hit or generate)
 *   POST /api/narration/warm     admin token  same as ensure, for pre-generating chapters
 *   GET  /api/narration/usage    admin    generation accounting and ceilings
 *
 * Paragraphs are synthesised as sentence groups ("chunks") of at most 300
 * characters so the first audio of an uncached paragraph is seconds away, not
 * the whole paragraph's generation. `mode: 'next'` generates exactly one
 * missing chunk and returns; the reader loops it ahead of playback.
 *
 * Audio bytes themselves are served by the existing `/api/audio-file` route
 * from `narration/fish/blob/{hash}.mp3`. The Fish API key only ever lives in
 * the Worker secret `FISH_AUDIO_API_KEY`; it is never logged or echoed.
 *
 * Cache layout (R2, bucket `tinct-audio`):
 *   narration/fish/blob/{hash}.mp3              one chunk's recording
 *   narration/fish/blob/{hash}.json             NarrationBlobMeta (chunk text, timings, provenance)
 *   narration/fish/map/{book}/{edition}/ch{N}/{voiceKey}/p{i}.json   NarrationMapEntry (ready chunks, in order)
 * A map entry is rewritten after each chunk's audio and meta validated, so a
 * reader that finds a chunk listed always finds a complete recording behind
 * it. The map entry carries the text hash of the paragraph it was recorded
 * from; the reader and this route both recompute that hash from the live
 * text, so a changed paragraph simply stops matching and is regenerated.
 */

import { jsonResponse } from '../lib/responses'
import { supabaseGet, type SupabaseEnv } from '../lib/supabase'
import {
  DEFAULT_NARRATION_SETTINGS,
  NARRATION_CACHE_VERSION,
  NARRATION_CHUNKER_VERSION,
  NARRATION_MAX_PARAGRAPHS_PER_REQUEST,
  NARRATION_PILOT_SCOPE,
  NARRATION_PROVIDER,
  absoluteSegments,
  chunkNarrationTokens,
  isPilotScope,
  narrationAudioPath,
  narrationBlobKeys,
  narrationCacheIdentity,
  narrationMapKey,
  narrationMapPrefix,
  narrationTextForParagraph,
  narrationTokens,
  paragraphWordsFromChunks,
  parseFishTimestampSse,
  sha256Hex,
  utf8ByteLength,
  validateNarrationAsset,
  type AlignedWord,
  type NarrationBlobMeta,
  type NarrationChunk,
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
  /** Secret for the warm route (pre-generation from a script), never a var. */
  NARRATION_ADMIN_TOKEN?: string
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
export const NARRATION_DEFAULT_DAILY_BYTES = 2_000_000   // ≈ $30 / day at $15 per M bytes
export const NARRATION_DEFAULT_MONTHLY_BYTES = 10_000_000 // ≈ $150 / month
export const NARRATION_ENSURE_RATE_PER_MINUTE = 60
const LOCK_TTL_SECONDS = 120
const LOCK_WAIT_MS = 20_000
const LOCK_POLL_MS = 750
/** A sentence group answers in seconds; a stalled one is retried, not waited on. */
const PROVIDER_TIMEOUT_MS = 25_000
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

/** Constant-time string comparison for the warm token. */
function tokensMatch(given: string, expected: string): boolean {
  if (given.length !== expected.length || expected.length < 16) return false
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

function isWarmCaller(request: Request, env: NarrationEnv): boolean {
  const token = request.headers.get('x-narration-admin') || ''
  return Boolean(env.NARRATION_ADMIN_TOKEN) && tokensMatch(token, env.NARRATION_ADMIN_TOKEN as string)
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
    case 'chapter': return handleChapter(request, env, deps)
    case 'ensure': return handleEnsure(request, env, ctx, deps, 'reader')
    case 'warm': return handleEnsure(request, env, ctx, deps, 'warm')
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
    scope: NARRATION_PILOT_SCOPE,
    cacheVersion: NARRATION_CACHE_VERSION,
    chunker: NARRATION_CHUNKER_VERSION,
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

/** One retry on a thrown R2 read: a transient error must not read as "missing". */
async function withOneRetry<T>(read: () => Promise<T>): Promise<T> {
  try { return await read() } catch { return read() }
}

async function readJsonObject<T>(bucket: R2Bucket, key: string): Promise<T | null> {
  const object = await withOneRetry(() => bucket.get(key))
  if (!object) return null
  try { return await object.json() as T } catch { return null }
}

async function readMapEntry(bucket: R2Bucket, key: string): Promise<NarrationMapEntry | null> {
  const entry = await readJsonObject<NarrationMapEntry>(bucket, key)
  if (!entry || entry.version !== NARRATION_CACHE_VERSION || entry.chunker !== NARRATION_CHUNKER_VERSION) return null
  if (typeof entry.textHash !== 'string' || !Array.isArray(entry.chunks) || typeof entry.chunkCount !== 'number') return null
  return entry
}

interface ReadyChunk {
  index: number
  hash: string
  wordFrom: number
  wordTo: number
  duration: number
  words: AlignedWord[] | null
  alignment: TokenAlignmentStats
  timingsUsable: boolean
  audioBytes: number
}

interface ParagraphState {
  textHash: string
  chunks: NarrationChunk[]
  /** Ready chunks, a prefix of `chunks` in order. */
  ready: ReadyChunk[]
}

/**
 * The ready prefix of a paragraph's chunks: each listed chunk's meta and
 * audio must agree with the live text hash, the chunk layout and each other.
 * The first chunk that fails ends the prefix; nothing past it is trusted.
 */
/** Identity hashes for every chunk of a paragraph, computed once per request. */
async function chunkIdentities(chunks: NarrationChunk[], model: string, voiceId: string, settings: NarrationSynthesisSettings): Promise<string[]> {
  return Promise.all(chunks.map(chunk => narrationCacheIdentity({ provider: NARRATION_PROVIDER, model, voiceId, text: chunk.text, settings }).then(identity => identity.hash)))
}

/**
 * One listed recording, only if its meta and audio agree with the live text
 * hash, the chunk layout and each other. Null means missing or torn.
 */
async function readReadyChunk(bucket: R2Bucket, position: number, expected: NarrationChunk, listedHash: string, textHash: string): Promise<ReadyChunk | null> {
  const keys = narrationBlobKeys(listedHash)
  const [meta, head] = await Promise.all([readJsonObject<NarrationBlobMeta>(bucket, keys.meta), withOneRetry(() => bucket.head(keys.audio))])
  if (!meta || !head || meta.version !== NARRATION_CACHE_VERSION || meta.textHash !== textHash || meta.hash !== listedHash) return null
  if (meta.chunkIndex !== position || meta.text !== expected.text || !(meta.duration > 0) || head.size !== meta.audioBytes || head.size < 800) return null
  return {
    index: position,
    hash: meta.hash,
    wordFrom: expected.wordFrom,
    wordTo: expected.wordTo,
    duration: meta.duration,
    words: meta.timingsUsable && Array.isArray(meta.words) ? meta.words : null,
    alignment: meta.alignment,
    timingsUsable: meta.timingsUsable,
    audioBytes: meta.audioBytes,
  }
}

function mapEntryMatches(entry: NarrationMapEntry | null, textHash: string, chunkCount: number, voiceId: string, model: string): entry is NarrationMapEntry {
  return !!entry && entry.textHash === textHash && entry.chunkCount === chunkCount && entry.voiceId === voiceId && entry.model === model
}

async function readParagraphState(bucket: R2Bucket, mapKey: string, textHash: string, chunks: NarrationChunk[], voiceId: string, model: string, settings: NarrationSynthesisSettings, identities?: string[]): Promise<ParagraphState> {
  const state: ParagraphState = { textHash, chunks, ready: [] }
  const entry = await readMapEntry(bucket, mapKey)
  if (!mapEntryMatches(entry, textHash, chunks.length, voiceId, model)) return state
  const hashes = identities ?? await chunkIdentities(chunks, model, voiceId, settings)
  for (let position = 0; position < entry.chunks.length; position += 1) {
    const listed = entry.chunks[position]
    const expected = chunks[position]
    if (!listed || !expected || listed.index !== position || listed.wordFrom !== expected.wordFrom || listed.wordTo !== expected.wordTo || typeof listed.hash !== 'string') break
    // The listed recording must be the one this text, model, voice and
    // settings would produce today; any changed setting is a different hash.
    if (listed.hash !== hashes[position]) break
    const ready = await readReadyChunk(bucket, position, expected, listed.hash, textHash)
    if (!ready) break
    state.ready.push(ready)
  }
  return state
}

/**
 * The chunk list to write into the map: our validated prefix, extended by
 * whatever the existing entry already lists beyond it as long as each listed
 * recording is the one today's text, voice and settings would produce. A
 * transient miss while validating one chunk must never drop the chunks after
 * it: readers validate on read and regenerate only the chunk that fails.
 */
function listedChunksForMap(existing: NarrationMapEntry | null, ready: ReadyChunk[], chunks: NarrationChunk[], identities: string[], textHash: string, voiceId: string, model: string): NarrationMapEntry['chunks'] {
  const listed = ready.map(item => ({ index: item.index, hash: item.hash, wordFrom: item.wordFrom, wordTo: item.wordTo }))
  if (!mapEntryMatches(existing, textHash, chunks.length, voiceId, model)) return listed
  for (let position = listed.length; position < chunks.length; position += 1) {
    const entry = existing.chunks[position]
    const expected = chunks[position]
    if (!entry || entry.index !== position || entry.hash !== identities[position] || entry.wordFrom !== expected.wordFrom || entry.wordTo !== expected.wordTo) break
    listed.push({ index: position, hash: entry.hash, wordFrom: entry.wordFrom, wordTo: entry.wordTo })
  }
  return listed
}

function chunkPayload(chunk: NarrationChunk, ready: ReadyChunk | undefined) {
  if (!ready) return { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: false as const }
  return {
    index: chunk.index,
    wordFrom: chunk.wordFrom,
    wordTo: chunk.wordTo,
    ready: true as const,
    hash: ready.hash,
    audioPath: narrationAudioPath(ready.hash),
    url: `/api/audio-file?path=${encodeURIComponent(narrationAudioPath(ready.hash))}`,
    duration: ready.duration,
    words: ready.words,
    alignment: ready.alignment,
    timingsUsable: ready.timingsUsable,
  }
}

/** Listing payload from the map alone: what is recorded, not re-validated. */
function listedParagraphPayload(paragraph: number, textHash: string, chunks: NarrationChunk[], listed: NarrationMapEntry['chunks']) {
  const complete = chunks.length > 0 && listed.length === chunks.length
  return {
    paragraph,
    status: complete ? 'ready' as const : listed.length > 0 ? 'partial' as const : 'pending' as const,
    textHash,
    chunkCount: chunks.length,
    readyChunks: listed.length,
    listedOnly: true,
    chunks: chunks.map((chunk, position) => {
      const entry = listed[position]
      if (!entry) return { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: false as const }
      return {
        index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: true as const, hash: entry.hash,
        audioPath: narrationAudioPath(entry.hash), url: `/api/audio-file?path=${encodeURIComponent(narrationAudioPath(entry.hash))}`,
      }
    }),
  }
}

/** Reader-facing description of a paragraph: its chunk layout and which chunks are playable. */
function paragraphPayload(paragraph: number, state: ParagraphState, extra: Record<string, unknown> = {}) {
  const complete = state.chunks.length > 0 && state.ready.length === state.chunks.length
  const status = complete ? 'ready' as const : state.ready.length > 0 ? 'partial' as const : 'pending' as const
  const merged = complete
    ? paragraphWordsFromChunks(state.ready.map(chunk => ({ words: chunk.words ?? [], duration: chunk.duration })))
    : null
  const allTimed = complete && state.ready.every(chunk => chunk.timingsUsable && chunk.words)
  return {
    paragraph,
    status,
    textHash: state.textHash,
    chunkCount: state.chunks.length,
    readyChunks: state.ready.length,
    chunks: state.chunks.map(chunk => chunkPayload(chunk, state.ready[chunk.index])),
    duration: merged?.duration,
    words: allTimed && merged ? merged.words : null,
    timingsUsable: allTimed,
    ...extra,
  }
}

// ===== GET /api/narration/chapter =====

async function handleChapter(request: Request, env: NarrationEnv, deps: NarrationDeps): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const config = narrationConfig(env)
  const scope = parseScope(new URL(request.url))
  if (!scope) return jsonResponse({ error: 'Invalid scope' }, 400, request)
  // Listing costs an edition parse, a prefix list and one R2 read per
  // paragraph, so it is throttled per address like the patch endpoint.
  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!isWarmCaller(request, env) && !await deps.checkRateLimit(`narration-chapter:${clientIP}`, env.RATE_LIMIT, 20)) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  }
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
    const tokens = narrationTokens(raw)
    const chunks = chunkNarrationTokens(tokens)
    const textHash = await sha256Hex(tokens.join(' '))
    const mapKey = narrationMapKey(scope.bookId, scope.editionKey, scope.chapter, voice.key, index)
    if (!present.has(mapKey)) return { paragraph: index, status: 'missing' as const, textHash, chunkCount: chunks.length, readyChunks: 0 }
    // The listing reports what the map records for today's text, voice and
    // settings; it does not open every blob (a 430-paragraph chapter would
    // exceed the Worker's subrequest budget). The ensure path validates the
    // audio and metadata of each chunk before anything plays.
    const identities = await chunkIdentities(chunks, config.model, voice.id, config.settings)
    const entry = await readMapEntry(bucket, mapKey)
    const listedChunks = listedChunksForMap(entry, [], chunks, identities, textHash, voice.id, config.model)
    if (listedChunks.length === 0) return { paragraph: index, status: 'stale' as const, textHash, chunkCount: chunks.length, readyChunks: 0 }
    return listedParagraphPayload(index, textHash, chunks, listedChunks)
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
  constructor(message: string, readonly code: 'provider_auth' | 'provider_payment' | 'provider_unavailable' | 'provider_rejected' | 'provider_empty' | 'storage_failed', readonly status?: number) {
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

/**
 * A fetch whose deadline covers the whole exchange, body included: a
 * provider that answers headers promptly and then stalls mid-stream must not
 * hold a Worker request (and its lock) open indefinitely. `release()` must
 * be called once the body has been consumed.
 */
function fetchWithDeadline(fetchImpl: typeof fetch, input: string, init: RequestInit, timeoutMs: number): { response: Promise<Response>; release: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const response = fetchImpl(input, { ...init, signal: controller.signal })
  return { response, release: () => clearTimeout(timer) }
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
  /** No attempt starts if it could not finish before this time. */
  deadlineAt?: number
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
    if (input.deadlineAt != null && input.now() + PROVIDER_TIMEOUT_MS > input.deadlineAt && attempts > 0) break
    attempts += 1
    const exchange = fetchWithDeadline(
      input.fetchImpl,
      endpoint === 'with-timestamp' ? `${input.baseUrl}/v1/tts/stream/with-timestamp` : `${input.baseUrl}/v1/tts`,
      { method: 'POST', headers: { ...headers, Accept: endpoint === 'with-timestamp' ? 'text/event-stream' : 'audio/mpeg' }, body },
      PROVIDER_TIMEOUT_MS,
    )
    try {
      let response: Response
      try {
        response = await exchange.response
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

      let bodyText: string | null = null
      let bodyBytes: Uint8Array | null = null
      try {
        if (endpoint === 'with-timestamp') bodyText = await response.text()
        else bodyBytes = new Uint8Array(await response.arrayBuffer())
      } catch (error) {
        // The deadline fired mid-stream or the connection dropped: retryable.
        lastError = new NarrationProviderError(`stream: ${(error as Error)?.name || 'error'}`, 'provider_unavailable')
        continue
      }
      if (bodyText != null) {
        const stream = parseFishTimestampSse(bodyText)
        if (stream.audio.length === 0) throw new NarrationProviderError('Fish returned no audio', 'provider_empty', response.status)
        const absolute = absoluteSegments(stream.snapshots)
        return { audio: stream.audio, segments: absolute.segments, reportedDuration: absolute.duration, timingsSource: 'with-timestamp', attempts, providerMs: input.now() - startedAt }
      }
      const audio = bodyBytes as Uint8Array
      if (audio.length === 0) throw new NarrationProviderError('Fish returned no audio', 'provider_empty', response.status)
      return { audio, segments: [], reportedDuration: 0, timingsSource: 'none', attempts, providerMs: input.now() - startedAt }
    } finally {
      exchange.release()
    }
  }
  throw lastError || new NarrationProviderError('Fish unavailable', 'provider_unavailable')
}

// ===== POST /api/narration/ensure (and /warm) =====

interface EnsureRequestBody {
  bookId?: string
  editionKey?: string
  chapter?: number
  voice?: string
  paragraphs?: Array<{ index?: number; textHash?: string }>
  /** 'next': generate at most one missing chunk, then answer. 'all': everything missing, within the time budget. */
  mode?: 'next' | 'all'
}

type EnsureParagraphResult =
  | ReturnType<typeof paragraphPayload>
  | { paragraph: number; status: 'text_mismatch'; textHash: string }
  | { paragraph: number; status: 'failed'; textHash: string; reason: string; retryAfterMs?: number; detail?: string }

async function handleEnsure(request: Request, env: NarrationEnv, ctx: ExecutionContext, deps: NarrationDeps, caller: 'reader' | 'warm'): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (caller === 'warm' && !isWarmCaller(request, env)) return jsonResponse({ error: 'Forbidden' }, 403, request)
  const config = narrationConfig(env)
  if (!config.enabled || !env.AUDIO_BUCKET || !env.FISH_AUDIO_API_KEY) {
    return jsonResponse({ error: 'Narration pilot is not configured', reason: config.reason }, 503, request)
  }
  let userId: string
  if (caller === 'warm') {
    userId = 'warm'
  } else {
    const user = await deps.verifyUser(env, request)
    if (!user) return jsonResponse({ error: 'Sign in to prepare narration' }, 401, request)
    userId = user.id
  }

  let body: EnsureRequestBody
  try { body = await request.json() as EnsureRequestBody } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  const bookId = typeof body.bookId === 'string' ? body.bookId : ''
  const editionKey = typeof body.editionKey === 'string' ? body.editionKey : ''
  const chapter = typeof body.chapter === 'number' ? body.chapter : NaN
  const voiceKey = typeof body.voice === 'string' ? body.voice : ''
  const mode: 'next' | 'all' = body.mode === 'all' ? 'all' : 'next'
  if (!/^[a-z0-9-]{1,64}$/.test(bookId) || !/^[a-z0-9-]{1,32}$/.test(editionKey) || !Number.isInteger(chapter) || chapter < 1) {
    return jsonResponse({ error: 'Invalid scope' }, 400, request)
  }
  if (!isPilotScope(bookId, editionKey, chapter)) return jsonResponse({ error: 'Outside the narration scope' }, 403, request)
  const voice = config.voices.find(item => item.key === voiceKey)
  if (!voice) return jsonResponse({ error: 'Unknown voice' }, 400, request)
  const requested = Array.isArray(body.paragraphs) ? body.paragraphs : []
  if (requested.length === 0 || requested.length > NARRATION_MAX_PARAGRAPHS_PER_REQUEST) {
    return jsonResponse({ error: `Request 1–${NARRATION_MAX_PARAGRAPHS_PER_REQUEST} paragraphs` }, 400, request)
  }
  if (caller === 'reader' && !await deps.checkRateLimit(`narration:${userId}`, env.RATE_LIMIT, NARRATION_ENSURE_RATE_PER_MINUTE)) {
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
  let generationDone = false
  // One accounting write per request: concurrent read-modify-writes of the
  // same KV counters would lose increments.
  const usageDelta: UsageCounters = { ...EMPTY_USAGE }
  const bump = (delta: Partial<UsageCounters>) => {
    for (const field of Object.keys(EMPTY_USAGE) as Array<keyof UsageCounters>) usageDelta[field] += delta[field] ?? 0
  }

  for (const item of requested) {
    const index = typeof item.index === 'number' ? item.index : -1
    if (!Number.isInteger(index) || index < 0 || index >= text.paragraphs.length) {
      results.push({ paragraph: index, status: 'failed', textHash: '', reason: 'unknown_paragraph' })
      continue
    }
    const tokens = narrationTokens(text.paragraphs[index])
    const chunks = chunkNarrationTokens(tokens)
    const textHash = await sha256Hex(tokens.join(' '))
    if (typeof item.textHash === 'string' && item.textHash !== textHash) {
      results.push({ paragraph: index, status: 'text_mismatch', textHash })
      continue
    }
    if (chunks.length === 0) {
      results.push({ paragraph: index, status: 'failed', textHash, reason: 'empty_paragraph' })
      continue
    }
    const mapKey = narrationMapKey(bookId, editionKey, chapter, voice.key, index)
    const identities = await chunkIdentities(chunks, config.model, voice.id, config.settings)
    const state = await readParagraphState(bucket, mapKey, textHash, chunks, voice.id, config.model, config.settings, identities)
    if (state.ready.length > 0) bump({ requests: 1, cacheHits: 1 })
    let failure: EnsureParagraphResult | null = null
    const extra: Record<string, unknown> = {}
    let adoptedByProbe = 0
    let wroteMap = false
    const writeMap = async () => {
      // Never shorten the map: keep every chunk the existing entry lists
      // beyond our prefix whose identity still matches today's text.
      const existing = await readMapEntry(bucket, mapKey)
      const listed = listedChunksForMap(existing, state.ready, chunks, identities, textHash, voice.id, config.model)
      const mapEntry: NarrationMapEntry = {
        version: NARRATION_CACHE_VERSION,
        textHash,
        chunker: NARRATION_CHUNKER_VERSION,
        chunkCount: chunks.length,
        voiceKey: voice.key,
        voiceId: voice.id,
        model: config.model,
        bookId, editionKey, chapter, paragraphIndex: index,
        chunks: listed,
        complete: listed.length === chunks.length,
        publishedAt: new Date(now()).toISOString(),
      }
      await bucket.put(mapKey, JSON.stringify(mapEntry), { httpMetadata: { contentType: 'application/json' } })
      wroteMap = true
      return listed
    }

    while (state.ready.length < chunks.length && !generationDone && !failure) {
      if (now() - requestStartedAt > REQUEST_TIME_BUDGET_MS) { generationDone = true; break }
      const chunk = chunks[state.ready.length]
      const identity = { hash: identities[state.ready.length] }

      // The map is an index, not the truth: keys are content-addressed, so
      // probe the recording itself before paying for a synthesis. A map that
      // lags its last write, or a miss while validating the prefix, would
      // otherwise cost a synthesis of a chunk that already exists.
      const present = await readReadyChunk(bucket, chunk.index, chunk, identity.hash, textHash)
      if (present) {
        state.ready.push(present)
        adoptedByProbe += 1
        continue
      }

      // Someone else may be generating this exact chunk right now.
      const lockKey = `narration:lock:${identity.hash}`
      let locked = false
      try { locked = !!(kv && await kv.get(lockKey)) } catch { locked = false }
      if (locked) {
        const arrived = await waitForChunk(bucket, mapKey, state, voice.id, config.model, config.settings, now, sleep)
        if (arrived) { extra.waited = true; if (mode === 'next') generationDone = true; continue }
        extra.retryAfterMs = 1500
        break
      }

      const breaker = await readBreaker(kv)
      if (breaker.openUntil > now()) {
        failure = { paragraph: index, status: 'failed', textHash, reason: 'provider_unavailable', retryAfterMs: breaker.openUntil - now() }
        break
      }
      const textBytes = utf8ByteLength(chunk.text)
      const keys = usageKeys(now())
      const [day, month] = await Promise.all([readUsage(kv, keys.day), readUsage(kv, keys.month)])
      if (day.bytes + usageDelta.bytes + textBytes > config.dailyBytes || month.bytes + usageDelta.bytes + textBytes > config.monthlyBytes) {
        failure = { paragraph: index, status: 'failed', textHash, reason: 'budget_exhausted', retryAfterMs: msUntilNextUtcDay(now()) }
        bump({ requests: 1, failed: 1 })
        break
      }

      const lockToken = `${now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      try { await kv?.put(lockKey, JSON.stringify({ token: lockToken, at: now(), by: userId.slice(0, 8) }), { expirationTtl: LOCK_TTL_SECONDS }) } catch { /* proceed without a lock */ }
      const generationStartedAt = now()
      try {
        const synthesis = await synthesizeWithFish({
          apiKey: env.FISH_AUDIO_API_KEY, baseUrl: config.baseUrl, model: config.model, voiceId: voice.id,
          text: chunk.text, settings: config.settings, fetchImpl, sleep, now,
          deadlineAt: requestStartedAt + REQUEST_TIME_BUDGET_MS + PROVIDER_TIMEOUT_MS,
        })
        const validation = validateNarrationAsset({ text: chunk.text, audio: synthesis.audio, reportedDuration: synthesis.reportedDuration, segments: synthesis.segments })
        await recordProviderOutcome(kv, now(), true)
        if (!validation.ok) {
          failure = { paragraph: index, status: 'failed', textHash, reason: 'validation_failed', detail: `chunk ${chunk.index}: ${validation.reasons.join(',')} (${validation.duration}s of audio for ${chunk.text.length} chars)` }
          bump({ requests: 1, failed: 1, bytes: textBytes, providerMs: synthesis.providerMs })
          break
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
          textHash,
          text: chunk.text,
          bookId, editionKey, chapter, paragraphIndex: index,
          chunkIndex: chunk.index,
          chunkCount: chunks.length,
          wordFrom: chunk.wordFrom,
          wordTo: chunk.wordTo,
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
        // Keys are content-addressed, so a second rendering of the same chunk
        // would overwrite the first and could tear its audio/meta pair. If
        // another generator finished this chunk while we synthesised it, keep
        // theirs and write nothing.
        const finished = await readReadyChunk(bucket, chunk.index, chunk, identity.hash, textHash)
        if (finished) {
          state.ready.push(finished)
          extra.raced = true
        } else {
          await bucket.put(blobKeys.audio, synthesis.audio, { httpMetadata: { contentType: 'audio/mpeg' } })
          await bucket.put(blobKeys.meta, JSON.stringify(meta), { httpMetadata: { contentType: 'application/json' } })
          state.ready.push({
            index: chunk.index, hash: identity.hash, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo,
            duration: validation.duration, words: validation.words, alignment: validation.alignment,
            timingsUsable: validation.timingsUsable, audioBytes: synthesis.audio.length,
          })
        }
        const listed = await writeMap()
        // Adopt the listed recordings beyond our prefix that validate, so the
        // next chunk we generate is the first one truly missing.
        for (let position = state.ready.length; position < listed.length; position += 1) {
          const adopted = await readReadyChunk(bucket, position, chunks[position], listed[position].hash, textHash)
          if (!adopted) break
          state.ready.push(adopted)
        }
        generatedThisRequest += 1
        bump({ requests: 1, generated: 1, bytes: textBytes, providerMs: synthesis.providerMs })
        extra.source = 'generated'
        extra.generationMs = (typeof extra.generationMs === 'number' ? extra.generationMs : 0) + generationMs
        extra.attempts = synthesis.attempts
        extra.timingsSource = synthesis.timingsSource
        if (mode === 'next') generationDone = true
      } catch (error) {
        const fail = error instanceof NarrationProviderError ? error : new NarrationProviderError(String((error as Error)?.message || error), 'storage_failed')
        // Only the provider being down (network failure, 5xx) counts toward
        // the breaker; our own storage errors, rejections and 429s do not.
        const providerDown = fail.code === 'provider_unavailable' && (fail.status === undefined || fail.status >= 500)
        if (providerDown) await recordProviderOutcome(kv, now(), false)
        bump({ requests: 1, failed: 1 })
        failure = {
          paragraph: index, status: 'failed', textHash, reason: fail.code,
          retryAfterMs: fail.code === 'provider_unavailable' ? 3000 : undefined,
          detail: `chunk ${chunk.index}`,
        }
        if (fail.code === 'provider_auth' || fail.code === 'provider_payment') generationDone = true
      } finally {
        // Release only a lock this request took; a lock another generator has
        // since written (after ours expired) stays in place.
        try {
          const held = kv ? await kv.get<{ token?: string }>(lockKey, 'json') : null
          if (held?.token === lockToken) await kv?.delete(lockKey)
        } catch { /* lock expires on its own */ }
      }
    }

    // Recordings adopted by probe alone are not yet in the map; list them so
    // the listing and the next request stop treating them as missing.
    if (adoptedByProbe > 0) {
      extra.probed = adoptedByProbe
      if (!wroteMap) { try { await writeMap() } catch { /* the next generation rewrites the map */ } }
    }

    // A failure on a later chunk still leaves the ready prefix playable.
    if (failure && state.ready.length === 0) results.push(failure)
    else results.push(paragraphPayload(index, state, failure ? { ...extra, failure: { reason: (failure as { reason: string }).reason, detail: (failure as { detail?: string }).detail, retryAfterMs: (failure as { retryAfterMs?: number }).retryAfterMs } } : extra))
    if (failure && (failure as { reason: string }).reason === 'provider_auth') break
    if (failure && (failure as { reason: string }).reason === 'provider_payment') break
  }

  if (usageDelta.requests > 0) ctx.waitUntil(addUsage(kv, now(), usageDelta))
  return jsonResponse({
    bookId, editionKey, chapter, voice: voice.key, model: config.model, mode,
    paragraphs: results,
    generated: generatedThisRequest,
  }, 200, request)
}

async function waitForChunk(
  bucket: R2Bucket,
  mapKey: string,
  state: ParagraphState,
  voiceId: string,
  model: string,
  settings: NarrationSynthesisSettings,
  now: () => number,
  sleep: (ms: number) => Promise<void>,
): Promise<boolean> {
  const deadline = now() + LOCK_WAIT_MS
  const wanted = state.ready.length
  while (now() < deadline) {
    await sleep(LOCK_POLL_MS)
    // One read per poll; only a map that lists more than we have is worth
    // validating chunk by chunk (each poll of a long paragraph would
    // otherwise cost dozens of subrequests).
    const entry = await readMapEntry(bucket, mapKey)
    if (!entry || entry.chunks.length <= wanted) continue
    const fresh = await readParagraphState(bucket, mapKey, state.textHash, state.chunks, voiceId, model, settings)
    if (fresh.ready.length > wanted) {
      state.ready.splice(0, state.ready.length, ...fresh.ready)
      return true
    }
  }
  return false
}

function msUntilNextUtcDay(now: number): number {
  const next = new Date(now)
  next.setUTCHours(24, 0, 0, 0)
  return Math.max(1000, next.getTime() - now)
}

export const narrationInternalsForTest = { usageKeys, readUsage, sha256Hex }
