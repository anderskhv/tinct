import { useEffect, useRef, useCallback } from 'react'
import { storage } from '../services/storage'
import type { BookReadingLog, ReadingPosition, ReadingProgress } from '../types'
import { canPersistLocation } from '../readerSession/writer'
import { buildReadingPositionForWrite } from '../readerSession/positionSync'
import type { ReaderBookContext, ReaderLocation, ReaderSessionState } from '../readerSession/types'
import { shouldBlockHistoryRegression, shouldBlockRegression, shouldSkipOnBookChange } from './useReadingPosition.guards'

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

/** Tagged window so we can confirm in DevTools that the hook is wired up. */
declare global {
  interface Window {
    __tinctPositionDebug?: {
      lastWriteAt: number
      lastWriteValue: ReadingPosition | null
      writeCount: number
      lastSkipReason: string
      /** Last regression block: cloud said chapter X, in-memory tried Y < X without recent user nav. */
      lastRegressionBlock?: { bookId: string; cloudChapter: number; attemptedChapter: number; at: number }
    }
  }
}

const HEARTBEAT_MS = 30_000

/**
 * Window after a user-initiated navigation in which writes that go BACKWARD
 * relative to cloud's known chapter are allowed. Outside this window, only
 * forward or same-chapter writes are accepted — a heartbeat that fires after
 * a buggy remount can't poison the cloud with default-state chapter 1.
 *
 * 5s is generous: even on a slow Boox, a tap-to-prev-chapter resolves and
 * writes within that window.
 */
const USER_NAV_GRACE_MS = 5_000

/**
 * Internal: track the last cloud-known chapter per book. Updated by external
 * code (App.tsx restore path, visibility sync) via `markCloudPosition`. Read
 * inside `saveNow` to enforce the regression guard.
 *
 * Lives at module scope so the marker function and the guard share state
 * even when the hook itself unmounts/remounts (which happens on reader
 * remount in some test paths). The hook itself is in App.tsx (so it survives
 * `readerKey` increments), but we belt-and-suspenders the state.
 */
const cloudKnownChapter = new Map<string, number>()

/**
 * Track the last user-initiated nav timestamp per book. The page-change effect
 * sets this on every page/chapter change in `useReadingPosition`. Other paths
 * (TOC click, prev/next buttons, audio chapter advance) call `markUserNav`
 * directly so heartbeat regression checks know an explicit move just happened.
 */
const lastUserNavAt = new Map<string, number>()

/**
 * Per-book dedup baseline: what we believe is currently in cloud.
 *
 * Updated on (a) successful position write, (b) cloud restore via
 * `markCloudLoaded`. The next write that matches this value (within
 * scrollFraction tolerance) is skipped — that's the post-layout `onPageChange`
 * echo that would otherwise re-write the just-loaded value with a fresh
 * `updatedAt`, making it "win" last-write-wins against actually-newer writes
 * from other devices. (Cross-device echo bug, 2026-05-02.)
 *
 * Module-scoped (not a hook ref) so cloud-restore in App.tsx can prime it.
 * Stores scrollFraction (cross-device safe) instead of currentPage (which is
 * layout-specific — mobile and desktop have different page numbers for the
 * same content).
 */
type DedupBaseline = { chapterNumber: number; scrollFraction: number; lastParagraphIndex?: number }
const dedupBaseline = new Map<string, DedupBaseline>()

/** Round scrollFraction so we dedup across minor layout jitter (~0.1% = ~1 paragraph in a 1000-paragraph chapter). */
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

/**
 * Called by App.tsx whenever cloud delivers a fresh position for a book.
 * The next write that would regress chapter below this value (without a
 * recent user nav signal) gets blocked.
 */
export function markCloudPosition(bookId: string, position: ReadingPosition | null): void {
  if (!position || typeof position.chapterNumber !== 'number') return
  if (position.chapterNumber < 1) return
  cloudKnownChapter.set(bookId, position.chapterNumber)
}

/**
 * Called when a position has been loaded from cloud (or localStorage cache)
 * for this book. Primes the dedup baseline so the inevitable post-layout
 * `onPageChange` echo is skipped. Pass `null` to clear (e.g. on logout).
 */
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

/**
 * Called by user-driven navigation handlers (page turn, TOC click, chapter
 * advance, etc.) to widen the write window briefly. Without this, the
 * regression guard would block legitimate user-initiated backward nav.
 */
export function markUserNav(bookId: string): void {
  lastUserNavAt.set(bookId, Date.now())
}

/**
 * Saves and restores page position per book.
 *
 * Saves trigger on:
 * - any state change (chapter / page / paragraph) once unlocked
 * - 30-second heartbeat while the tab is visible (so even if the user reads
 *   slowly without turning a page, position is fresh on the cloud)
 * - visibilitychange to hidden, blur, beforeunload, pagehide (failsafes)
 *
 * `storageReady=false` blocks all writes (auth still resolving, cloud not loaded).
 * The first effect run after `storageReady` flips to true is also skipped — at
 * that moment the in-memory state is whatever localStorage had, and the cloud
 * restore in App.tsx hasn't applied yet. We must not push that intermediate
 * value back to the cloud or we'd clobber the real position.
 */
export function useReadingPosition(
  bookId: string,
  chapterNumber: number,
  currentPage: number,
  totalPages: number,
  totalChapters: number,
  storageReady = true,
  lastParagraphIndex?: number,
  /**
   * When true, blocks all writes — used while a modal/auth/onboarding
   * overlay is open. The reader is "non-reading" in those states and any
   * heartbeat or visibility-driven write would risk capturing stale or
   * default in-memory state. This is defense-in-depth alongside the
   * regression guard.
   */
  writeSuspended = false,
  readerSession?: {
    location: ReaderLocation
    context: ReaderBookContext
    status: ReaderSessionState['status']
  },
) {
  // Keep refs for the latest values so event listeners always have current state
  const stateRef = useRef({ bookId, chapterNumber, currentPage, totalPages, totalChapters, storageReady, lastParagraphIndex, writeSuspended, readerSession })
  stateRef.current = { bookId, chapterNumber, currentPage, totalPages, totalChapters, storageReady, lastParagraphIndex, writeSuspended, readerSession }

  // Write lock: skip the very first write when storageReady transitions to true —
  // at that point state is stale defaults, cloud restore hasn't run yet
  const writeUnlockedRef = useRef(false)

  const recordSkip = (reason: string) => {
    if (typeof window !== 'undefined') {
      const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
      dbg.lastSkipReason = reason
      window.__tinctPositionDebug = dbg
    }
  }

  // Core save function — writes position to active storage provider.
  // `reason` is purely for diagnosis; it lands in window.__tinctPositionDebug.
  const saveNow = useCallback((reason: string) => {
    const s = stateRef.current
    if (!s.storageReady) { recordSkip(`not-ready:${reason}`); return }
    if (!writeUnlockedRef.current) { recordSkip(`locked:${reason}`); return }
    if (s.writeSuspended) { recordSkip(`suspended:${reason}`); return }
    if (!s.readerSession) { recordSkip(`reader-session:missing:${reason}`); return }
    // We used to skip when totalPages<=1 even on failsafes. That dropped the
    // last-page save on mobile when the app backgrounded mid-relayout. Now we
    // still skip page-only writes during layout (no useful page number yet)
    // but always write chapter+paragraph so cross-device restore has something
    // to land on.
    const now = Date.now()
    const snapshot = canPersistLocation(s.readerSession.location, s.readerSession.context, s.readerSession.status)
    if (typeof window !== 'undefined') {
      const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
      ;(dbg as typeof dbg & { lastReaderSessionGate?: typeof snapshot }).lastReaderSessionGate = snapshot
      window.__tinctPositionDebug = dbg
    }
    if (!snapshot.canWrite) {
      recordSkip(`reader-session:${snapshot.reason ?? 'blocked'}:${reason}`)
      return
    }
    const position = buildReadingPositionForWrite({
      currentPage: s.currentPage,
      totalPages: s.totalPages,
      now,
      location: s.readerSession.location,
    })

    // Skip if the write would land on the same content position as what we
    // believe is currently in cloud. Three sources of redundant writes:
    //   (a) heartbeat firing on a stationary reader,
    //   (b) effect re-fires after a render that didn't actually change pos,
    //   (c) post-layout `onPageChange` echo immediately after cloud-restore —
    //       where the Reader emits the page derived from the just-loaded
    //       scrollFraction, the position effect treats it as a state change,
    //       and we re-write the cloud value with a fresh `updatedAt`. That
    //       echo makes a stale loaded value "win" last-write-wins against
    //       fresher writes from other devices. (2026-05-02 cross-device bug.)
    //
    // Compare on scrollFraction (cross-device safe) instead of currentPage
    // (which is layout-specific — mobile/desktop have different page counts).
    const baseline = dedupBaseline.get(position.bookId)
    const candidate: DedupBaseline = {
      chapterNumber: position.chapterNumber,
      scrollFraction: position.scrollFraction,
      lastParagraphIndex: position.lastParagraphIndex,
    }
    if (baseline && dedupMatches(baseline, candidate)) {
      recordSkip(`unchanged:${reason}`)
      return
    }

    // Backward-regression guard. **INVARIANT 4** in CLAUDE.md.
    //
    // Decision lives in `shouldBlockRegression` (pure function, unit-tested
    // in useReadingPosition.guards.test.ts). Run `npm test` before changing
    // anything here.
    //
    // Rule: if cloud has us at chapter X and we're trying to write chapter
    // Y<X without a user-nav signal in the last `USER_NAV_GRACE_MS`, the
    // write is almost certainly a destructive write from a default-state
    // remount (B19) and gets blocked here.
    const knownCloudChapter = cloudKnownChapter.get(position.bookId)
    const lastNav = lastUserNavAt.get(position.bookId) ?? 0
    if (shouldBlockRegression({
      attemptedChapter: position.chapterNumber,
      cloudKnownChapter: knownCloudChapter,
      lastUserNavAt: lastNav,
      now: Date.now(),
      graceMs: USER_NAV_GRACE_MS,
    })) {
      recordSkip(`regression-blocked:${reason}:cloud=${knownCloudChapter}>attempt=${position.chapterNumber}`)
      if (typeof window !== 'undefined') {
        const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
        dbg.lastRegressionBlock = {
          bookId: position.bookId,
          cloudChapter: knownCloudChapter as number,
          attemptedChapter: position.chapterNumber,
          at: Date.now(),
        }
        window.__tinctPositionDebug = dbg
      }
      return
    }

    // Same-book high-water guard. If cloud/local position baseline is absent
    // or already stale, progress/log history still tells us the book was read
    // much deeper. A passive page/layout echo back to an earlier chapter must
    // not overwrite that deeper history; explicit chapter navigation is
    // allowed only inside the same short user-nav grace window as the cloud
    // regression guard.
    const historyHighWater = getHistoryHighWaterChapter(position.bookId, s.totalChapters)
    if (shouldBlockHistoryRegression({
      attemptedChapter: position.chapterNumber,
      historyHighWaterChapter: historyHighWater,
      lastUserNavAt: lastNav,
      now: Date.now(),
      graceMs: USER_NAV_GRACE_MS,
    })) {
      recordSkip(`history-regression-blocked:${reason}:history=${historyHighWater}>attempt=${position.chapterNumber}`)
      return
    }

    storage.set(positionKey(position.bookId), position)
    // Also push the current-book pointer so other devices know which book to
    // open by default. This used to live here, was removed in the Apr 23
    // commit, and the consequence was that signed-in users on a fresh device
    // didn't always restore to the right book. Cheap to keep in sync.
    storage.set('tinct-current-book', position.bookId)
    dedupBaseline.set(position.bookId, candidate)

    if (typeof window !== 'undefined') {
      const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
      dbg.lastWriteAt = position.updatedAt!
      dbg.lastWriteValue = position
      ;(dbg as typeof dbg & { lastWriteSource?: 'reader-session' }).lastWriteSource = 'reader-session'
      dbg.writeCount += 1
      window.__tinctPositionDebug = dbg
    }
  }, [])

  // Prime dedup baseline from storage on book change, so the post-layout
  // `onPageChange` echo (Reader emits the page derived from the just-loaded
  // scrollFraction) doesn't write back the value we just read. Re-runs when
  // storageReady flips (cloud just landed).
  useEffect(() => {
    if (!storageReady) return
    const loaded = storage.get<ReadingPosition>(positionKey(bookId))
    markCloudLoaded(bookId, loaded)
  }, [bookId, storageReady])

  const prevChapterRef = useRef(chapterNumber)
  const prevBookIdRef = useRef(bookId)
  useEffect(() => {
    if (!storageReady) return
    if (!writeUnlockedRef.current) {
      writeUnlockedRef.current = true
      prevBookIdRef.current = bookId
      return
    }
    // **INVARIANT 7** — see `shouldSkipOnBookChange` in guards.ts.
    // This effect fires when `bookId` changes (it's a dep). At that moment,
    // App.tsx's bookId-change effect has only queued setCurrentChapter /
    // setLastParagraphIndex updates — they apply on the next render. So
    // stateRef captures (new bookId, OLD chapter, OLD paragraph) and a
    // write here lands a corrupted tuple in cloud. Skip; the next render
    // (with re-derived chapter/paragraph for the new book) will save.
    if (shouldSkipOnBookChange(prevBookIdRef.current, bookId)) {
      prevBookIdRef.current = bookId
      prevChapterRef.current = chapterNumber
      recordSkip('book-change')
      return
    }
    const isChapterChange = chapterNumber !== prevChapterRef.current
    prevChapterRef.current = chapterNumber
    // Skip page-level saves during layout (totalPages <= 1), but always save chapter changes
    if (totalPages <= 1 && !isChapterChange) return
    saveNow(isChapterChange ? 'chapter-change' : 'page-change')
  }, [bookId, chapterNumber, currentPage, totalPages, storageReady, saveNow, lastParagraphIndex])

  // 30-second heartbeat — writes position even if the user is reading a long
  // page without turning. Pauses when tab is hidden so we don't keep writing
  // for a backgrounded reader. visibilitychange handler still flushes once on
  // hide, so the last position before backgrounding is captured.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (interval !== null) return
      interval = setInterval(() => saveNow('heartbeat'), HEARTBEAT_MS)
    }
    const stop = () => {
      if (interval !== null) {
        clearInterval(interval)
        interval = null
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') start()
      else stop()
    }
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [saveNow])

  // Failsafe: save on visibility change to hidden (tab switch, app background
  // on mobile, screen-off on Android). Most reliable cross-platform "I'm
  // leaving" signal — works where blur/beforeunload don't.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') saveNow('visibility-hidden')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [saveNow])

  // Failsafe: pagehide fires reliably on iOS Safari where beforeunload doesn't.
  useEffect(() => {
    const handlePageHide = () => saveNow('pagehide')
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [saveNow])

  // Failsafe: save on beforeunload (browser close, refresh, navigate away)
  useEffect(() => {
    const handleUnload = () => saveNow('beforeunload')
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [saveNow])

  // Failsafe: save on blur (user clicks away from window)
  useEffect(() => {
    const handleBlur = () => saveNow('blur')
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [saveNow])

  // Track progress: update on last page of chapter OR when reading a later chapter
  // (if you're in chapter 9, you've read chapters 1-8 even if you didn't hit every last page)
  useEffect(() => {
    if (!storageReady || !writeUnlockedRef.current) return
    if (totalPages <= 1) return
    // Cross-book bleed guard for progress writes: if totalChapters isn't known
    // yet (book data still loading) OR chapterNumber is out of range, skip the
    // write. Without this, a stale chapter from a previous book can land in the
    // new book's progress with the OLD book's totalChapters — which is exactly
    // how `progress:nicomachean-ethics` got `totalChapters=1189` (the Bible's
    // chapter count). Diagnosed 2026-05-06.
    if (totalChapters <= 0 || chapterNumber < 1 || chapterNumber > totalChapters) return
    const existing = storage.get<ReadingProgress>(progressKey(bookId))
    const prev = existing?.highestCompletedChapter || 0

    // Track both "highest completed" and "current position"
    const pageFraction = totalPages > 1 ? (currentPage + 1) / totalPages : 1
    const positionPercent = Math.round(((chapterNumber - 1 + pageFraction) / totalChapters) * 100)

    // Mark completed if reached last page of current chapter
    if (currentPage >= totalPages - 1 && chapterNumber > prev) {
      storage.set<ReadingProgress>(progressKey(bookId), {
        bookId,
        highestCompletedChapter: chapterNumber,
        totalChapters,
        percent: Math.round((chapterNumber / totalChapters) * 100),
        positionPercent,
      })
    }
    // Also: if reading chapter N, at minimum chapters 1 through N-1 are done
    else if (chapterNumber > 1 && chapterNumber - 1 > prev) {
      storage.set<ReadingProgress>(progressKey(bookId), {
        bookId,
        highestCompletedChapter: chapterNumber - 1,
        totalChapters,
        percent: Math.round(((chapterNumber - 1) / totalChapters) * 100),
        positionPercent,
      })
    }
    // Always update position percent even if no new chapter completed
    else {
      const existing = storage.get<ReadingProgress>(progressKey(bookId))
      if (existing) {
        storage.set<ReadingProgress>(progressKey(bookId), { ...existing, positionPercent })
      }
    }
  }, [bookId, chapterNumber, currentPage, totalPages, totalChapters, storageReady])
}

/** Get saved position for a book (used on initial load) */
export function getSavedPosition(bookId: string): ReadingPosition | null {
  return storage.get<ReadingPosition>(positionKey(bookId))
}

/** Get reading progress for a book */
export function getReadingProgress(bookId: string): ReadingProgress | null {
  return storage.get<ReadingProgress>(progressKey(bookId))
}
