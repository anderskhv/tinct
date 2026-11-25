/**
 * "Save your place" reminder for signed-out readers (Anders, 25 Nov 2026). It replaces the second-book nudge.
 *
 * Two quiet in-page boxes, never for a signed-in reader, never a dialog, no dismiss control:
 * - at a chapter's end: every chapter end for the first ten times it has been seen on this device, then every fifth
 *   chapter end;
 * - welcome back: when the reader opens a book on a later calendar day than the previous reading session on this
 *   device, at most once a day, never on the very first visit.
 *
 * A box is "seen" after it has been about two seconds on screen; once seen and off screen it is gone for good (that
 * chapter end, that day), on scroll back and reload too. Everything lives on this device under one `tinct:` key, so
 * `clearLocalUserData` wipes it; reading memory is only read.
 */

import { readDeviceReadingMemory } from '../readingMemory/deviceStore'
import type { ReadingMemoryState } from '../readingMemory/types'

/** One record for both boxes. In the `tinct:` namespace `clearLocalUserData` wipes. */
export const LAB_SAVE_PLACE_KEY = 'tinct:lab-save-place'
/** The chapter-end box shows at every chapter end until it has been seen this many times. */
export const SAVE_PLACE_EVERY_END_UNTIL = 10
/** After that, at every this-many-th chapter end. */
export const SAVE_PLACE_THEN_EVERY = 5
/** On screen this long, the box counts as seen. */
export const SAVE_PLACE_SEEN_MS = 2000
/** Chapter ends remembered as handled (seen or passed over); the oldest drop off. */
const MAX_ENDS = 400

export interface SavePlaceStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface SavePlaceRecord {
  /** Chapter-end boxes seen on this device. */
  shown: number
  /** Chapter ends passed over since the last box was seen (only counted after the first ten). */
  skipped: number
  /** Chapter ends already handled (`bookId:chapter`): seen, or passed over by the frequency rule. */
  ends: string[]
  /** The local calendar day (YYYY-MM-DD) the welcome-back box was last seen. */
  returnDay: string | null
}

const EMPTY: SavePlaceRecord = { shown: 0, skipped: 0, ends: [], returnDay: null }

function browserStorage(): SavePlaceStorage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}
const defaultStorage = (storage: SavePlaceStorage | null | undefined) => storage === undefined ? browserStorage() : storage

const count = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0

export function readSavePlace(storage?: SavePlaceStorage | null): SavePlaceRecord {
  const store = defaultStorage(storage)
  try {
    const raw = store?.getItem(LAB_SAVE_PLACE_KEY)
    if (!raw) return { ...EMPTY, ends: [] }
    const parsed = JSON.parse(raw) as Partial<SavePlaceRecord> | null
    return {
      shown: count(parsed?.shown),
      skipped: count(parsed?.skipped),
      ends: Array.isArray(parsed?.ends) ? parsed.ends.filter((key): key is string => typeof key === 'string').slice(-MAX_ENDS) : [],
      returnDay: typeof parsed?.returnDay === 'string' ? parsed.returnDay : null,
    }
  } catch {
    return { ...EMPTY, ends: [] }
  }
}

function writeSavePlace(record: SavePlaceRecord, storage?: SavePlaceStorage | null): void {
  try { defaultStorage(storage)?.setItem(LAB_SAVE_PLACE_KEY, JSON.stringify({ ...record, ends: record.ends.slice(-MAX_ENDS) })) } catch { /* private mode / quota */ }
}

export function chapterEndKey(bookId: string, chapterNumber: number): string {
  return `${bookId || 'bible'}:${chapterNumber}`
}

/** Pure frequency rule: every chapter end until ten have been seen, then every fifth. */
export function chapterEndBoxDue(record: Pick<SavePlaceRecord, 'shown' | 'skipped'>): boolean {
  return record.shown < SAVE_PLACE_EVERY_END_UNTIL || record.skipped >= SAVE_PLACE_THEN_EVERY - 1
}

export type ChapterEndDecision = 'show' | 'none'

/**
 * A signed-out reader reached this chapter end: show the box here? A chapter end already handled never shows again.
 * One the frequency rule passes over is counted (and remembered) once, so scrolling back does not count it again.
 */
export function decideChapterEndBox(key: string, storage?: SavePlaceStorage | null): ChapterEndDecision {
  const record = readSavePlace(storage)
  if (record.ends.includes(key)) return 'none'
  if (chapterEndBoxDue(record)) return 'show'
  writeSavePlace({ ...record, skipped: record.skipped + 1, ends: [...record.ends, key] }, storage)
  return 'none'
}

/** The chapter-end box was seen here: count it, and never show it at this chapter end again. */
export function markChapterEndBoxSeen(key: string, storage?: SavePlaceStorage | null): void {
  const record = readSavePlace(storage)
  if (record.ends.includes(key)) return
  writeSavePlace({ ...record, shown: record.shown + 1, skipped: 0, ends: [...record.ends, key] }, storage)
}

/** The local calendar day of a device time, YYYY-MM-DD. */
export function localDay(time: number): string {
  const date = new Date(time)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** When this device last read anything, from durable reading memory; null when it never has (a first visit). */
export function lastReadingAt(memory: Pick<ReadingMemoryState, 'sessions'> | null | undefined): number | null {
  let latest: number | null = null
  for (const session of Object.values(memory?.sessions ?? {})) {
    const at = Math.max(count(session?.lastActiveAt), count(session?.startedAt))
    if (at > 0 && (latest == null || at > latest)) latest = at
  }
  return latest
}

/**
 * Pure: the welcome-back box for a signed-out reader opening a book now, given when this device last read before
 * this page load. Never on a first visit, never the same day as that session, at most once a day.
 */
export function welcomeBackDue(input: { signedIn: boolean; previousReadingAt: number | null; now: number; returnDay: string | null }): boolean {
  if (input.signedIn || input.previousReadingAt == null) return false
  const today = localDay(input.now)
  if (input.returnDay === today) return false
  return localDay(input.previousReadingAt) < today
}

export function markWelcomeBackSeen(now = Date.now(), storage?: SavePlaceStorage | null): void {
  writeSavePlace({ ...readSavePlace(storage), returnDay: localDay(now) }, storage)
}

/**
 * When this device last read before this page load. Read once, on first use, before this load's own reading session
 * is written (LabApp asks at its first render), so today's session never hides the welcome back.
 */
let previousReadingSnapshot: { at: number | null } | null = null
export function previousReadingAtThisLoad(): number | null {
  if (!previousReadingSnapshot) previousReadingSnapshot = { at: lastReadingAt(readDeviceReadingMemory()) }
  return previousReadingSnapshot.at
}
/** Tests only. */
export function resetPreviousReadingSnapshot(): void { previousReadingSnapshot = null }
