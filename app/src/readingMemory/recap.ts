import { excerptOfRange } from './textRange'
import type { RecapCard, RecapSource, RecapSyncState, ReadingSession } from './types'

export interface RecapSummary {
  text: string
  model: string
  version: string
  /** Present when the summary is a stored one with provenance. */
  route?: string
  generatedAt?: number
}

export interface RecapFormatOptions {
  locale?: string
  timeZone?: string
}

/**
 * Format a stored clock value. Returns null for anything that is not a real
 * timestamp so callers omit the line instead of guessing.
 */
export function formatStoredTimestamp(value: number | null | undefined, options: RecapFormatOptions = {}): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null
  try {
    return new Intl.DateTimeFormat(options.locale ?? undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...(options.timeZone ? { timeZone: options.timeZone } : {}),
    }).format(new Date(value))
  } catch {
    return null
  }
}

export function recapLocation(session: ReadingSession): string {
  const { chapterLabel, page, totalPages } = session.anchor
  if (session.state === 'completed') return chapterLabel
  return totalPages ? `${chapterLabel} · page ${page} of ${totalPages}` : `${chapterLabel} · page ${page}`
}

export function recapHeadline(session: ReadingSession): string {
  return session.state === 'completed'
    ? `You finished ${session.anchor.chapterLabel}`
    : `You stopped in ${session.anchor.chapterLabel}`
}

export function recapTimeline(session: ReadingSession, options: RecapFormatOptions = {}): string[] {
  const lines: string[] = []
  const started = formatStoredTimestamp(session.startedAt, options)
  if (started) lines.push(`Started ${started}`)
  if (session.state === 'completed') {
    const finished = formatStoredTimestamp(session.completedAt, options)
    if (finished) lines.push(`Finished ${finished}`)
  } else {
    const last = formatStoredTimestamp(session.lastActiveAt, options)
    if (last && session.lastActiveAt !== session.startedAt) lines.push(`Last read ${last}`)
  }
  return lines
}

/**
 * Build the "What you read last" card from a stored session and the resolved
 * edition text. Truthful by construction:
 *  - "finished" only when the session state is `completed`;
 *  - the body is an exact excerpt of the read range, or a summary that was
 *    actually generated, or nothing (location only);
 *  - dates come from stored values only.
 */
export function buildRecapCard(input: {
  session: ReadingSession
  source: RecapSource
  paragraphs: string[] | null
  summary?: RecapSummary | null
  /** Defaults to synced for a cloud-sourced card and device-only otherwise. */
  syncState?: RecapSyncState
  format?: RecapFormatOptions
  excerptChars?: number
}): RecapCard {
  const { session, source } = input
  const syncState: RecapSyncState = input.syncState ?? (source === 'cloud' ? 'synced' : 'device-only')
  const excerpt = input.paragraphs ? excerptOfRange(input.paragraphs, session.anchor.range, input.excerptChars) : null
  const summaryText = input.summary?.text.trim() || ''
  const useSummary = Boolean(summaryText && excerpt !== null)
  const body = useSummary ? summaryText : (excerpt ?? '')
  const bodyKind = useSummary ? 'summary' : excerpt !== null ? 'excerpt' : 'location-only'
  return {
    bookId: session.anchor.bookId,
    editionKey: session.anchor.editionKey,
    chapterNumber: session.anchor.chapterNumber,
    headline: recapHeadline(session),
    location: recapLocation(session),
    body,
    bodyKind,
    timeline: recapTimeline(session, input.format),
    completed: session.state === 'completed',
    syncState,
    provenance: {
      source,
      generatedBy: useSummary ? 'summary' : 'excerpt',
      ...(useSummary && input.summary ? { model: input.summary.model, version: input.summary.version } : {}),
      ...(useSummary && input.summary?.route ? { route: input.summary.route } : {}),
      ...(useSummary && typeof input.summary?.generatedAt === 'number' ? { generatedAt: input.summary.generatedAt } : {}),
      sessionId: session.id,
      sessionSeq: session.seq,
      sessionState: session.state,
      anchor: session.anchor,
    },
  }
}
