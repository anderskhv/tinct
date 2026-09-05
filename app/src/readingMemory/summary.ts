import { textOfRange, cleanExcerpt } from './textRange'
import type { RecapSummary } from './recap'
import type { ReadingSession, StoredRecapSummary } from './types'

export const RECAP_SUMMARY_PROMPT_VERSION = 'recap-summary-v1'
export const RECAP_SUMMARY_ROUTE = '/api/chat'
/** A failed attempt is not retried automatically sooner than this. */
export const SUMMARY_RETRY_AFTER_MS = 60 * 60 * 1000
/** Total attempts per session, automatic and manual together. */
export const SUMMARY_MAX_ATTEMPTS = 3
const SUMMARY_MODEL = 'claude-sonnet-4-6'
const MAX_PASSAGE_CHARS = 12_000

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

export type RecapSummaryResult =
  | { ok: true; summary: RecapSummary }
  | { ok: false; error: string }

/**
 * A stored summary counts only while it still describes this session: same
 * anchor tuple and read range as the session carries now.
 */
export function summaryMatchesSession(session: ReadingSession): StoredRecapSummary | null {
  const summary = session.summary
  if (!summary) return null
  const a = summary.anchor
  const b = session.anchor
  const same = a.bookId === b.bookId && a.editionKey === b.editionKey && a.chapterNumber === b.chapterNumber
    && a.range.startParagraphIndex === b.range.startParagraphIndex && a.range.startCharOffset === b.range.startCharOffset
    && a.range.endParagraphIndex === b.range.endParagraphIndex && a.range.endCharOffset === b.range.endCharOffset
  return same ? summary : null
}

export type SummaryAttemptDecision =
  | { attempt: true }
  | { attempt: false; reason: 'open' | 'has-summary' | 'exhausted' | 'backoff' }

/**
 * Whether an automatic summary attempt is due: the session must be closed
 * (the 30-minute rule or an explicit end), have no summary yet, have
 * attempts left, and be past the back-off from its last failure.
 */
export function summaryAttemptDue(session: ReadingSession, now: number, options: { manual?: boolean } = {}): SummaryAttemptDecision {
  if (session.endedAt === null) return { attempt: false, reason: 'open' }
  if (summaryMatchesSession(session)) return { attempt: false, reason: 'has-summary' }
  const error = session.summaryError ?? null
  if (error && error.attempts >= SUMMARY_MAX_ATTEMPTS) return { attempt: false, reason: 'exhausted' }
  if (error && !options.manual && now - error.at < SUMMARY_RETRY_AFTER_MS) return { attempt: false, reason: 'backoff' }
  return { attempt: true }
}

/** The session with its summary stored, as a new seq so it syncs everywhere. */
export function withStoredSummary(session: ReadingSession, summary: RecapSummary, now: number): ReadingSession {
  const { summaryError: _dropped, ...rest } = session
  void _dropped
  return {
    ...rest,
    seq: session.seq + 1,
    summary: {
      text: summary.text,
      model: summary.model,
      route: RECAP_SUMMARY_ROUTE,
      version: summary.version,
      generatedAt: now,
      sessionSeq: session.seq,
      anchor: session.anchor,
    },
  }
}

/** The session with a recorded failed attempt, as a new seq so the back-off syncs too. */
export function withSummaryError(session: ReadingSession, message: string, now: number): ReadingSession {
  return {
    ...session,
    seq: session.seq + 1,
    summaryError: { at: now, attempts: (session.summaryError?.attempts ?? 0) + 1, message: message.slice(0, 500) },
  }
}

/**
 * Summary of the EXACT passage the reader saw, through the existing worker
 * chat route (bearer token, non-streaming). Signed-in only. Any failure is
 * reported, never fabricated, so the card falls back to the exact excerpt.
 */
export async function requestRecapSummary(input: {
  token: string | null | undefined
  session: ReadingSession
  paragraphs: string[]
  bookTitle?: string
  fetchImpl?: FetchLike
  apiBase?: string
}): Promise<RecapSummaryResult> {
  if (!input.token) return { ok: false, error: 'not signed in' }
  const passage = textOfRange(input.paragraphs, input.session.anchor.range)
  if (!passage) return { ok: false, error: 'passage no longer matches the edition text' }
  const fetchImpl = input.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' }
  const clean = cleanExcerpt(passage).slice(0, MAX_PASSAGE_CHARS)
  const where = `${input.bookTitle ? `${input.bookTitle}, ` : ''}${input.session.anchor.chapterLabel}`
  const status = input.session.state === 'completed'
    ? 'The reader finished this chapter.'
    : `The reader stopped part-way through this chapter; do not describe anything beyond the passage.`
  const system = [
    'You write a two-sentence recap of a passage a reader just read.',
    'Use only the passage below. Never add events, names, or outcomes that are not in it.',
    'Do not mention dates, percentages, or how much of the book remains.',
    'Plain, warm, literary English. No preamble, no quotation marks around the whole answer.',
    `Location: ${where}. ${status}`,
  ].join('\n')
  try {
    const response = await fetchImpl(`${input.apiBase ?? ''}${RECAP_SUMMARY_ROUTE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify({
        model: SUMMARY_MODEL,
        max_tokens: 220,
        stream: false,
        system,
        messages: [{ role: 'user', content: `Passage:\n\n${clean}\n\nWrite the recap.` }],
      }),
    })
    if (!response.ok) return { ok: false, error: `chat route returned ${response.status}` }
    const data = await response.json() as { content?: Array<{ type?: string; text?: string }>; model?: string }
    const text = Array.isArray(data?.content)
      ? data.content.filter(block => block?.type === 'text' && typeof block.text === 'string').map(block => block.text).join('\n').trim()
      : ''
    if (!text) return { ok: false, error: 'chat route returned no text' }
    return { ok: true, summary: { text, model: typeof data.model === 'string' && data.model ? data.model : SUMMARY_MODEL, version: RECAP_SUMMARY_PROMPT_VERSION } }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'request failed' }
  }
}
