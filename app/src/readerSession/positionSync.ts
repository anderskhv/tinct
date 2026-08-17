import { storage } from '../services/storage'
import type { BookReadingLog, ReadingPosition, ReadingProgress } from '../types'
import { buildReadingProgressUpdate, shouldBlockHistoryRegression, shouldBlockRegression, shouldBlockSameChapterRegression, shouldRecoverEarlyResetFromHistory } from '../hooks/useReadingPosition.guards'
import { canPersistLocation, positionFromLocation } from './writer'
import type { ReaderBookContext, ReaderLocation, ReaderSessionState } from './types'

export const USER_NAV_GRACE_MS = 5_000

function positionKey(bookId: string): string {
  return `position:${bookId}`
}

function progressKey(bookId: string): string {
  return `progress:${bookId}`
}

function readingLogKey(bookId: string): string {
  return `reading-log:${bookId}`
}

function getHistoryHighWaterChapter(bookId: string, totalChapters: number): number {
  let highWater = 0
  const progress = storage.get<ReadingProgress>(progressKey(bookId))
  if (progress?.bookId === bookId && progress.highestCompletedChapter > 0) {
    highWater = Math.max(highWater, progress.highestCompletedChapter)
  }
  const log = storage.get<BookReadingLog>(readingLogKey(bookId))
  if (log?.bookId === bookId) {
    for (const rawChapter of Object.keys(log.chapters)) {
      const chapter = Number(rawChapter)
      if (!Number.isInteger(chapter) || chapter < 1) continue
      if (totalChapters > 0 && chapter > totalChapters) continue
      highWater = Math.max(highWater, chapter)
    }
  }
  return highWater
}

function getHistoryRecoveryChapter(bookId: string, totalChapters = 0): { chapterNumber: number; paragraphIndex?: number; totalParagraphs?: number } | null {
  let best: { chapterNumber: number; paragraphIndex?: number; totalParagraphs?: number; lastReadAt: number } | null = null
  const log = storage.get<BookReadingLog>(readingLogKey(bookId))
  if (log?.bookId === bookId) {
    for (const record of Object.values(log.chapters)) {
      if (!record || !Number.isInteger(record.chapterNumber) || record.chapterNumber < 1) continue
      if (totalChapters > 0 && record.chapterNumber > totalChapters) continue
      const lastReadAt = typeof record.lastReadAt === 'number' ? record.lastReadAt : 0
      if (
        !best ||
        lastReadAt > best.lastReadAt ||
        (lastReadAt === best.lastReadAt && record.chapterNumber > best.chapterNumber)
      ) {
        best = {
          chapterNumber: record.chapterNumber,
          paragraphIndex: record.lastParagraphIndex,
          totalParagraphs: record.totalParagraphs,
          lastReadAt,
        }
      }
    }
  }

  const progress = storage.get<ReadingProgress>(progressKey(bookId))
  if (progress?.bookId === bookId && progress.highestCompletedChapter > 0) {
    const nextChapter = totalChapters > 0
      ? Math.min(progress.highestCompletedChapter + 1, totalChapters)
      : progress.highestCompletedChapter + 1
    if (!best || nextChapter > best.chapterNumber) {
      best = { chapterNumber: nextChapter, lastReadAt: 0 }
    }
  }

  if (!best) return null
  return {
    chapterNumber: best.chapterNumber,
    paragraphIndex: best.paragraphIndex,
    totalParagraphs: best.totalParagraphs,
  }
}

const cloudKnownChapter = new Map<string, number>()
const lastUserNavAt = new Map<string, number>()

type DedupBaseline = { chapterNumber: number; scrollFraction: number; lastParagraphIndex?: number }
const dedupBaseline = new Map<string, DedupBaseline>()

function scrollKey(frac: number): number {
  return Math.round(frac * 1000)
}

function dedupMatches(a: DedupBaseline, b: DedupBaseline): boolean {
  return (
    a.chapterNumber === b.chapterNumber &&
    a.lastParagraphIndex === b.lastParagraphIndex &&
    scrollKey(a.scrollFraction) === scrollKey(b.scrollFraction)
  )
}

export function markCloudPosition(bookId: string, position: ReadingPosition | null): void {
  if (!position || typeof position.chapterNumber !== 'number') return
  if (position.chapterNumber < 1) return
  cloudKnownChapter.set(bookId, position.chapterNumber)
}

export function markCloudLoaded(bookId: string, position: ReadingPosition | null): void {
  if (!position) {
    dedupBaseline.delete(bookId)
    return
  }
  dedupBaseline.set(bookId, {
    chapterNumber: position.chapterNumber,
    scrollFraction: position.scrollFraction ?? 0,
    lastParagraphIndex: position.lastParagraphIndex,
  })
}

export function markUserNav(bookId: string): void {
  lastUserNavAt.set(bookId, Date.now())
}

export function buildReadingPositionForWrite(args: {
  location: ReaderLocation
  currentPage: number
  totalPages: number
  now: number
}): ReadingPosition {
  const haveLayout = args.totalPages > 1
  return positionFromLocation(args.location, args.now, {
    currentPage: haveLayout ? args.currentPage : 0,
    totalPages: haveLayout ? args.totalPages : 1,
  })
}

export interface PositionCommitInput {
  cause: string
  readerSession: {
    location: ReaderLocation
    context: ReaderBookContext
    status: ReaderSessionState['status']
  }
  currentPage: number
  totalPages: number
  totalChapters: number
  now?: number
}

export type PositionCommitResult =
  | { committed: true; position: ReadingPosition; gate: ReturnType<typeof canPersistLocation> }
  | { committed: false; reason: string; position?: ReadingPosition; gate?: ReturnType<typeof canPersistLocation>; cloudChapter?: number; attemptedChapter?: number }

export function commitReadingPosition(args: PositionCommitInput): PositionCommitResult {
  const now = args.now ?? Date.now()
  const gate = canPersistLocation(args.readerSession.location, args.readerSession.context, args.readerSession.status)
  if (!gate.canWrite) {
    return { committed: false, reason: `reader-session:${gate.reason ?? 'blocked'}:${args.cause}`, gate }
  }

  const position = buildReadingPositionForWrite({
    currentPage: args.currentPage,
    totalPages: args.totalPages,
    now,
    location: args.readerSession.location,
  })

  const candidate: DedupBaseline = {
    chapterNumber: position.chapterNumber,
    scrollFraction: position.scrollFraction,
    lastParagraphIndex: position.lastParagraphIndex,
  }
  const baseline = dedupBaseline.get(position.bookId)
  if (baseline && dedupMatches(baseline, candidate)) {
    return { committed: false, reason: `unchanged:${args.cause}`, position, gate }
  }

  const knownCloudChapter = cloudKnownChapter.get(position.bookId)
  const lastNav = lastUserNavAt.get(position.bookId) ?? 0
  if (shouldBlockSameChapterRegression({
    attemptedChapter: position.chapterNumber,
    attemptedFraction: position.scrollFraction,
    attemptedParagraphIndex: position.lastParagraphIndex,
    knownChapter: baseline?.chapterNumber,
    knownFraction: baseline?.scrollFraction,
    knownParagraphIndex: baseline?.lastParagraphIndex,
    lastUserNavAt: lastNav,
    now,
    graceMs: USER_NAV_GRACE_MS,
  })) {
    return { committed: false, reason: `same-chapter-regression-blocked:${args.cause}`, position, gate }
  }
  if (shouldBlockRegression({
    attemptedChapter: position.chapterNumber,
    cloudKnownChapter: knownCloudChapter,
    lastUserNavAt: lastNav,
    now,
    graceMs: USER_NAV_GRACE_MS,
  })) {
    return {
      committed: false,
      reason: `regression-blocked:${args.cause}:cloud=${knownCloudChapter}>attempt=${position.chapterNumber}`,
      position,
      gate,
      cloudChapter: knownCloudChapter,
      attemptedChapter: position.chapterNumber,
    }
  }

  const historyHighWater = getHistoryHighWaterChapter(position.bookId, args.totalChapters)
  if (shouldBlockHistoryRegression({
    attemptedChapter: position.chapterNumber,
    historyHighWaterChapter: historyHighWater,
    lastUserNavAt: lastNav,
    now,
    graceMs: USER_NAV_GRACE_MS,
  })) {
    return { committed: false, reason: `history-regression-blocked:${args.cause}:history=${historyHighWater}>attempt=${position.chapterNumber}`, position, gate }
  }

  storage.set(positionKey(position.bookId), position)
  storage.set('tinct-current-book', position.bookId)
  dedupBaseline.set(position.bookId, candidate)
  return { committed: true, position, gate }
}

export interface ProgressCommitInput {
  bookId: string
  /** The chapter whose completion is being recorded. Supplied EXPLICITLY by the
   *  caller, never derived inside this helper: the chapter-advance caller passes
   *  the pre-advance chapter (the one just finished), so deriving from a
   *  reader-session location that may have already advanced would over-report by
   *  one. The steady-state caller passes the readerSession-derived chapter. */
  progressChapter: number
  /** Caller-supplied layout. Steady-state passes the real page/totalPages;
   *  chapter-advance passes a synthetic last-page (currentPage:1,totalPages:2) so
   *  buildReadingProgressUpdate marks the chapter completed. Never synthesized here. */
  currentPage: number
  totalPages: number
  totalChapters: number
}

export type ProgressCommitResult =
  | { committed: true; progress: ReadingProgress }
  | { committed: false; reason: string }

// Progress is MONOTONIC by construction (buildReadingProgressUpdate only raises
// highestCompletedChapter). Deliberately NOT subject to the dedup / backward-
// regression guards that gate position writes — those would be a behavior change
// and are unnecessary here. This is the single write point for `progress:` from
// reading-time paths; the terminal book-completion write in App.tsx is the one
// intentional exception (it records 100% regardless of current location).
export function commitReadingProgress(args: ProgressCommitInput): ProgressCommitResult {
  const { bookId, progressChapter, currentPage, totalPages, totalChapters } = args
  if (totalChapters <= 0) return { committed: false, reason: 'no-chapters' }
  const existing = storage.get<ReadingProgress>(progressKey(bookId))
  const next = buildReadingProgressUpdate({
    bookId,
    progressChapter,
    currentPage,
    totalPages,
    totalChapters,
    existing,
  })
  if (!next) return { committed: false, reason: 'no-update' }
  storage.set<ReadingProgress>(progressKey(bookId), next)
  return { committed: true, progress: next }
}

export function getSavedPosition(bookId: string): ReadingPosition | null {
  return storage.get<ReadingPosition>(positionKey(bookId))
}

export function getRecoverableSavedPosition(bookId: string, totalChapters = 0): ReadingPosition | null {
  const position = getSavedPosition(bookId)
  const recovery = getHistoryRecoveryChapter(bookId, totalChapters)
  if (!position || !recovery) return position
  if (!shouldRecoverEarlyResetFromHistory({ position, historyChapter: recovery.chapterNumber })) return position

  const totalParagraphs = recovery.totalParagraphs ?? 0
  const paragraphIndex = recovery.paragraphIndex
  const scrollFraction = totalParagraphs > 1 && typeof paragraphIndex === 'number'
    ? Math.min(1, Math.max(0, paragraphIndex / (totalParagraphs - 1)))
    : 0
  return {
    ...position,
    chapterNumber: recovery.chapterNumber,
    currentPage: 0,
    totalPages: 1,
    scrollFraction,
    lastParagraphIndex: paragraphIndex,
  }
}

export function getReadingProgress(bookId: string): ReadingProgress | null {
  return storage.get<ReadingProgress>(progressKey(bookId))
}
