import { AI_RESTING_MESSAGE, AI_RESTING_TYPE } from '../lib/aiSpend'
import { isProviderBudgetError } from '../lib/chatUpstream'
import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { dictationCostUsd, recordAiUsage, type LedgerEnv } from '../lib/aiUsage'
import type { SupabaseEnv } from '../lib/supabase'

/**
 * POST /api/dictation: the chat microphone's speech-to-text.
 *
 * The browser records one short clip while the microphone is on and posts it
 * here as multipart form data (`audio`, optional `language`, `keyterms` as a
 * JSON string array, `bookId`). The Worker forwards it to xAI's REST STT with
 * the reader's book vocabulary as keyterms and returns `{ text }`.
 *
 * Signed-in only (signed-out readers keep the browser's own recognition).
 * Dictation only fills the draft, so it never charges a message or the AI
 * allowance; it is recorded in the cost ledger as feature 'dictation'.
 * Tinct never stores the audio.
 */
export type DictationEnv = SupabaseEnv & {
  XAI_API_KEY?: string
  RATE_LIMIT?: KVNamespace
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: DictationEnv, request: Request) => Promise<VerifiedUser | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const XAI_STT_URL = 'https://api.x.ai/v1/stt'
export const XAI_STT_MODEL = 'grok-voice-transcribe-2.0'
/** A dictated question is short: the client stops recording at 60 seconds, well under this. */
export const DICTATION_MAX_BYTES = 5 * 1024 * 1024
/** Clips per reader per minute. */
export const DICTATION_RATE_PER_MINUTE = 12
/** xAI limits: at most 100 keyterms of at most 50 characters. */
export const DICTATION_MAX_KEYTERMS = 100
export const DICTATION_MAX_KEYTERM_CHARS = 50
export const DICTATION_NOT_CONFIGURED_ERROR = 'Dictation is not configured.'

/** Containers xAI auto-detects (WebM is Matroska, which xAI reads as MKV; verified by a probe on 2026-10-07). */
const AUDIO_TYPES: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'mp4',
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
}

/** The base media type of a Blob/File type such as `audio/webm;codecs=opus`. */
export function dictationAudioExtension(type: string): string | null {
  const base = type.split(';')[0].trim().toLowerCase()
  return AUDIO_TYPES[base] ?? null
}

/** Keeps at most 100 distinct, printable terms of 1–50 characters. Never throws. */
export function sanitizeKeyterms(raw: unknown): string[] {
  let list: unknown = raw
  if (typeof raw === 'string') {
    try { list = JSON.parse(raw) } catch { return [] }
  }
  if (!Array.isArray(list)) return []
  const seen = new Set<string>()
  const terms: string[] = []
  for (const item of list) {
    if (typeof item !== 'string') continue
    // eslint-disable-next-line no-control-regex
    const term = item.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!term || term.length > DICTATION_MAX_KEYTERM_CHARS) continue
    const key = term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    terms.push(term)
    if (terms.length >= DICTATION_MAX_KEYTERMS) break
  }
  return terms
}

/** A BCP-47 language tag such as `en`, `da` or `en-GB`; anything else is English. */
export function dictationLanguage(raw: unknown): string {
  return typeof raw === 'string' && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(raw) ? raw : 'en'
}

function logDictationFailure(status: number, reason: string): void {
  console.log(JSON.stringify({ event: 'dictation_failed', status, reason: reason.slice(0, 160) }))
}

export async function handleDictation(
  request: Request,
  env: DictationEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.XAI_API_KEY
  if (!apiKey) return jsonResponse({ error: DICTATION_NOT_CONFIGURED_ERROR }, 503, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  if (!await checkRateLimit(`dictation:${user.id}`, env.RATE_LIMIT, DICTATION_RATE_PER_MINUTE)) {
    logDictationFailure(429, 'rate_limited')
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  // Refuse an oversized upload before reading it; multipart framing adds a little.
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > DICTATION_MAX_BYTES + 64 * 1024) return jsonResponse({ error: 'Recording too long' }, 413, request)

  let form: FormData
  try { form = await request.formData() } catch { return jsonResponse({ error: 'Invalid form data' }, 400, request) }
  const audio = form.get('audio')
  if (!audio || typeof audio === 'string') return jsonResponse({ error: 'Missing audio' }, 400, request)
  if (audio.size === 0) return jsonResponse({ error: 'Empty recording' }, 400, request)
  if (audio.size > DICTATION_MAX_BYTES) return jsonResponse({ error: 'Recording too long' }, 413, request)
  const extension = dictationAudioExtension(audio.type || '')
  if (!extension) return jsonResponse({ error: 'Unsupported audio format' }, 415, request)

  const language = dictationLanguage(form.get('language'))
  const keyterms = sanitizeKeyterms(form.get('keyterms'))
  const rawBookId = form.get('bookId')
  const bookId = typeof rawBookId === 'string' && /^[a-z0-9-]{1,64}$/.test(rawBookId) ? rawBookId : null

  const upstream = new FormData()
  upstream.append('model', XAI_STT_MODEL)
  upstream.append('language', language)
  for (const term of keyterms) upstream.append('keyterm', term)
  // xAI requires the file to be the last field.
  upstream.append('file', audio, `dictation.${extension}`)

  try {
    const response = await fetch(XAI_STT_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    })
    const data = await response.json().catch(() => ({})) as { text?: unknown; duration?: unknown; error?: string | { message?: string } }
    if (!response.ok || typeof data.text !== 'string') {
      const message = typeof data.error === 'string' ? data.error : data.error?.message
      logDictationFailure(response.status, `provider: ${message || 'no text'}`)
      if (response.status === 402 || response.status === 429 || isProviderBudgetError(response.status, data)) {
        return jsonResponse({ error: AI_RESTING_MESSAGE, code: AI_RESTING_TYPE }, 503, request)
      }
      return jsonResponse({ error: 'Could not transcribe the recording.' }, 502, request)
    }
    const seconds = typeof data.duration === 'number' && Number.isFinite(data.duration) && data.duration > 0 ? data.duration : 0
    // Cost ledger only: no message is charged and nothing counts toward an allowance.
    recordAiUsage(env as LedgerEnv, ctx, { userId: user.id }, {
      feature: 'dictation', provider: 'xai', model: XAI_STT_MODEL, seconds, book_id: bookId, cost_usd: dictationCostUsd(seconds),
    })
    return jsonResponse({ text: data.text.trim() }, 200, request)
  } catch (error) {
    logDictationFailure(500, `exception: ${error instanceof Error ? error.message : 'unknown'}`)
    return jsonResponse({ error: 'Could not transcribe the recording.' }, 500, request)
  }
}
