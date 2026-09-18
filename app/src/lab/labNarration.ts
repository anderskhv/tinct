/**
 * Fish Audio narration pilot — reader side.
 *
 * Opt-in only. `?narration=fish` on a reader route turns the pilot on for this
 * device (persisted in the lab prefs so it survives reloads and edition
 * switches); `?narration=off` turns it off. With the pilot on, Odyssey Book 1
 * in either English edition is narrated on demand by the Worker
 * (`/api/narration/*`) instead of the Kokoro recordings. Everything else in
 * the reader is untouched. See docs/fish-audio-pilot-2026-09-18.md.
 */

import { apiUrl } from '../utils/apiUrl'
import { isPilotScope, narrationTextForParagraph, sha256Hex, type AlignedWord, type TokenAlignmentStats } from '../narration/narrationCore'
import type { LabPrefs } from './labPrefs'

export type NarrationPilotFlag = 'fish' | 'off' | null

/** The query flag, read once per page load. */
export function narrationPilotFlag(search: string | undefined): NarrationPilotFlag {
  if (!search) return null
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const value = params.get('narration')?.trim().toLowerCase()
  if (value === 'fish') return 'fish'
  if (value === 'off' || value === '0') return 'off'
  return null
}

/** Prefs after applying a query flag: the flag wins, otherwise prefs stand. */
export function applyNarrationPilotFlag(prefs: LabPrefs, flag: NarrationPilotFlag): LabPrefs {
  if (flag === 'fish' && prefs.narrationProvider !== 'fish') return { ...prefs, narrationProvider: 'fish' }
  if (flag === 'off' && prefs.narrationProvider) return { ...prefs, narrationProvider: null }
  return prefs
}

export interface NarrationVoiceOption {
  key: string
  label: string
}

export interface NarrationPilotInfo {
  enabled: boolean
  reason?: string
  provider?: string
  model?: string
  voices: NarrationVoiceOption[]
}

/** True when the reader opted in and the current text is inside the pilot scope. */
export function narrationPilotApplies(prefs: LabPrefs, bookId: string, editionKey: string, chapter: number): boolean {
  return prefs.narrationProvider === 'fish' && isPilotScope(bookId, editionKey, chapter)
}

/** The voice to narrate with: the stored choice when the server still offers it, else the first voice. */
export function resolveNarrationVoice(prefs: LabPrefs, voices: NarrationVoiceOption[]): string | null {
  if (voices.length === 0) return null
  if (prefs.narrationVoice && voices.some(voice => voice.key === prefs.narrationVoice)) return prefs.narrationVoice
  return voices[0].key
}

export async function fetchNarrationPilotInfo(fetchImpl: typeof fetch = fetch): Promise<NarrationPilotInfo> {
  try {
    const response = await fetchImpl(apiUrl('/api/narration/voices'), { cache: 'no-store' })
    if (!response.ok) return { enabled: false, reason: `http_${response.status}`, voices: [] }
    const json = await response.json() as Partial<NarrationPilotInfo>
    return {
      enabled: json.enabled === true,
      reason: typeof json.reason === 'string' ? json.reason : undefined,
      provider: typeof json.provider === 'string' ? json.provider : undefined,
      model: typeof json.model === 'string' ? json.model : undefined,
      voices: Array.isArray(json.voices)
        ? json.voices.filter(voice => voice && typeof voice.key === 'string' && typeof voice.label === 'string')
        : [],
    }
  } catch {
    return { enabled: false, reason: 'network', voices: [] }
  }
}

export interface NarrationParagraphReady {
  paragraph: number
  status: 'ready'
  source: 'cache' | 'generated'
  url: string
  duration: number
  words: AlignedWord[] | null
  alignment?: TokenAlignmentStats
  timingsUsable: boolean
  hash: string
  textHash: string
  generationMs?: number
}

export interface NarrationParagraphNotReady {
  paragraph: number
  status: 'pending' | 'failed' | 'text_mismatch'
  textHash?: string
  reason?: string
  retryAfterMs?: number
}

export type NarrationParagraphResult = NarrationParagraphReady | NarrationParagraphNotReady

export interface NarrationEnsureRequest {
  bookId: string
  editionKey: string
  chapter: number
  voice: string
  paragraphs: Array<{ index: number; text: string }>
}

export const NARRATION_ENSURE_TIMEOUT_MS = 70_000

export class NarrationEnsureError extends Error {
  constructor(message: string, readonly code: 'unauthenticated' | 'not_configured' | 'rate_limited' | 'network' | 'http', readonly status?: number) {
    super(message)
  }
}

/**
 * Ask the Worker to make paragraphs playable. The reader sends the hash of the
 * words it displays; the Worker refuses anything that does not match the text
 * it derives itself, so a stale recording can never be handed back.
 */
export async function ensureNarration(
  request: NarrationEnsureRequest,
  options: { signal?: AbortSignal; authToken?: string | null; fetchImpl?: typeof fetch } = {},
): Promise<NarrationParagraphResult[]> {
  const fetchImpl = options.fetchImpl || fetch
  const paragraphs = await Promise.all(request.paragraphs.map(async item => ({
    index: item.index,
    textHash: await sha256Hex(narrationTextForParagraph(item.text)),
  })))
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.authToken) headers.Authorization = `Bearer ${options.authToken}`
  // The Worker may wait up to ~55 s on a busy provider; past that the
  // request is abandoned client-side rather than left hanging.
  const deadline = new AbortController()
  const timer = setTimeout(() => deadline.abort(), NARRATION_ENSURE_TIMEOUT_MS)
  const onCancel = () => deadline.abort()
  options.signal?.addEventListener('abort', onCancel, { once: true })
  let response: Response
  try {
    response = await fetchImpl(apiUrl('/api/narration/ensure'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookId: request.bookId, editionKey: request.editionKey, chapter: request.chapter, voice: request.voice, paragraphs }),
      signal: deadline.signal,
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    if ((error as Error)?.name === 'AbortError') throw new NarrationEnsureError('timeout', 'network')
    throw new NarrationEnsureError('network', 'network')
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', onCancel)
  }
  if (response.status === 401) throw new NarrationEnsureError('Sign in to prepare narration', 'unauthenticated', 401)
  if (response.status === 503) throw new NarrationEnsureError('Narration pilot is not configured', 'not_configured', 503)
  if (response.status === 429) throw new NarrationEnsureError('Too many requests', 'rate_limited', 429)
  if (!response.ok) throw new NarrationEnsureError(`HTTP ${response.status}`, 'http', response.status)
  const json = await response.json() as { paragraphs?: NarrationParagraphResult[] }
  return Array.isArray(json.paragraphs) ? json.paragraphs : []
}

/** Reader-facing copy for a failed preparation. */
export function narrationFailureMessage(reason: string | undefined): string {
  switch (reason) {
    case 'budget_exhausted': return 'The narration budget for today is used up. You can keep reading.'
    case 'provider_unavailable': return 'The narrator is busy right now. Try again in a moment.'
    case 'provider_auth':
    case 'provider_payment':
    case 'not_configured': return 'Narration is not set up on this server yet.'
    case 'unauthenticated': return 'Sign in to hear this chapter narrated.'
    case 'text_mismatch': return 'This passage changed since the page was opened. Reload to hear it narrated.'
    case 'unavailable': return 'This passage has no narration yet. Try again.'
    case 'validation_failed': return 'The narration came back damaged and was not saved. Try again.'
    case 'rate_limited': return 'Too many narration requests. Wait a moment and try again.'
    default: return 'Narration could not be prepared. Try again.'
  }
}
