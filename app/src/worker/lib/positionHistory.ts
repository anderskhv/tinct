/**
 * Position write history (diagnostics only, 17 Nov 2026).
 *
 * The account's position record keeps only the latest place, so a place that
 * jumped back (13 Nov: The Master and Margarita, chapter 2 ¶244 → ¶62, one
 * device, several tabs) could not be traced to a tab or an app version. Each
 * write to /api/lab-position now leaves one compact entry per book whose
 * place the write carried differently from the stored one: when, which
 * device, tab and build, the place, why the client wrote, and what the merge
 * did with it.
 *
 * Passive by contract: nothing here feeds back into the merge or the reply,
 * and the coordinator calls it after the merged record is saved, inside a
 * try/catch. The history lives beside the record in the same Durable Object
 * (its own row), keeps the last POSITION_HISTORY_MAX entries and drops
 * entries older than POSITION_HISTORY_MAX_AGE_MS on every append. It is part
 * of the account export and goes with the object's storage on deletion.
 */
import type { LabBookPlace, LabPositionState } from '../../lab/labPosition'

export const POSITION_HISTORY_MAX = 200
export const POSITION_HISTORY_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

/**
 * - `accepted`: the write's place is now the stored place for that book.
 * - `ignored`: the server kept its own newer place; the write changed nothing for that book.
 * - `overrode`: the write's place was stored, but the write also named this
 *   book as its newer resume and the merge kept the account's resume book
 *   instead (the settle-acknowledgement rule).
 */
export type PositionWriteOutcome = 'accepted' | 'ignored' | 'overrode'

/** What the client says about itself; every field optional and validated. */
export interface PositionWriteClient {
  /** Random per-tab id (sessionStorage) plus a per-page-load suffix. */
  tab?: string
  /** The bundle's build stamp (`__BUILD_VERSION__`). */
  build?: string
  /** Why the client wrote (`page-turn`, `hide`, `cloud-merge`, …). */
  reason?: string
}

export interface PositionHistoryEntry {
  /** Server time of the write. */
  at: number
  /** deviceId of the place as written. */
  device: string
  tab?: string
  build?: string
  reason?: string
  book: string
  edition?: string
  chapter: number
  paragraph: number
  word: number
  /** The place's own (client) clock and revision, to compare devices. */
  placeAt: number
  rev: number
  outcome: PositionWriteOutcome
}

const TAB = /^[A-Za-z0-9.-]{1,40}$/
const BUILD = /^[A-Za-z0-9._-]{1,40}$/
const REASON = /^[a-z0-9-]{1,40}$/

export function parsePositionWriteClient(raw: unknown): PositionWriteClient {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const src = raw as Record<string, unknown>
  const pick = (value: unknown, pattern: RegExp) => typeof value === 'string' && pattern.test(value) ? value : undefined
  const tab = pick(src.tab, TAB)
  const build = pick(src.build, BUILD)
  const reason = pick(src.reason, REASON)
  return { ...(tab ? { tab } : {}), ...(build ? { build } : {}), ...(reason ? { reason } : {}) }
}

function samePlace(a: LabBookPlace, b: LabBookPlace | undefined): boolean {
  return Boolean(b)
    && a.updatedAt === b!.updatedAt && a.rev === b!.rev && a.deviceId === b!.deviceId
    && a.chapterNumber === b!.chapterNumber && a.paragraphIndex === b!.paragraphIndex
    && a.wordIndex === b!.wordIndex && a.primaryEditionKey === b!.primaryEditionKey
}

/** One entry per book the write carried differently from the stored record. */
export function positionWriteEntries(
  before: LabPositionState,
  incoming: LabPositionState,
  merged: LabPositionState,
  client: PositionWriteClient,
  now: number,
): PositionHistoryEntry[] {
  const entries: PositionHistoryEntry[] = []
  for (const [bookId, place] of Object.entries(incoming.books)) {
    if (place.bookId !== bookId || samePlace(place, before.books[bookId])) continue
    let outcome: PositionWriteOutcome = samePlace(place, merged.books[bookId]) ? 'accepted' : 'ignored'
    const claimedResume = incoming.lastSettledBookId === bookId && incoming.lastSettledAt > before.lastSettledAt
    if (outcome === 'accepted' && claimedResume
      && (merged.lastSettledBookId !== bookId || merged.lastSettledAt !== incoming.lastSettledAt)) outcome = 'overrode'
    entries.push({
      at: now,
      device: place.deviceId,
      ...client,
      book: bookId,
      ...(place.primaryEditionKey ? { edition: place.primaryEditionKey } : {}),
      chapter: place.chapterNumber,
      paragraph: place.paragraphIndex,
      word: place.wordIndex,
      placeAt: place.updatedAt,
      rev: place.rev,
      outcome,
    })
  }
  return entries
}

function isEntry(value: unknown): value is PositionHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const e = value as Record<string, unknown>
  return typeof e.at === 'number' && typeof e.book === 'string' && typeof e.device === 'string'
}

/** Stored history, minus anything malformed or older than the age limit. */
export function readPositionHistory(raw: unknown, now: number): PositionHistoryEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(isEntry).filter(entry => entry.at >= now - POSITION_HISTORY_MAX_AGE_MS)
}

/**
 * Appends, drops entries past the age limit and keeps the newest
 * POSITION_HISTORY_MAX. A write repeated with the same place (a tab that keeps
 * sending a stale pin the server ignores) is logged once, not on every save.
 */
export function appendPositionHistory(raw: unknown, entries: PositionHistoryEntry[], now: number): PositionHistoryEntry[] {
  const history = readPositionHistory(raw, now)
  for (const entry of entries) {
    const repeat = history.some(old => old.book === entry.book && old.device === entry.device
      && old.placeAt === entry.placeAt && old.rev === entry.rev && old.outcome === entry.outcome)
    if (!repeat) history.push(entry)
  }
  return history.slice(-POSITION_HISTORY_MAX)
}
