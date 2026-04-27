import { useEffect, useRef, useCallback } from 'react'
import { storage } from '../services/storage'
import type { ReadingPosition, ReadingProgress } from '../types'

function positionKey(bookId: string): string {
  return `position:${bookId}`
}

function progressKey(bookId: string): string {
  return `progress:${bookId}`
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
) {
  // Keep refs for the latest values so event listeners always have current state
  const stateRef = useRef({ bookId, chapterNumber, currentPage, totalPages, totalChapters, storageReady, lastParagraphIndex, writeSuspended })
  stateRef.current = { bookId, chapterNumber, currentPage, totalPages, totalChapters, storageReady, lastParagraphIndex, writeSuspended }

  // Write lock: skip the very first write when storageReady transitions to true —
  // at that point state is stale defaults, cloud restore hasn't run yet
  const writeUnlockedRef = useRef(false)

  // Last value pushed to storage. Lets us:
  //   1. skip duplicate writes (same chapter/page/paragraph) — keeps the
  //      heartbeat cheap.
  //   2. confirm in DevTools (window.__tinctPositionDebug) when something
  //      DID change but the write was skipped, so we can diagnose the silent-
  //      failure pattern Anders saw on Boox/mobile.
  const lastSavedRef = useRef<{ bookId: string; chapterNumber: number; currentPage: number; lastParagraphIndex?: number } | null>(null)

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
    // We used to skip when totalPages<=1 even on failsafes. That dropped the
    // last-page save on mobile when the app backgrounded mid-relayout. Now we
    // still skip page-only writes during layout (no useful page number yet)
    // but always write chapter+paragraph so cross-device restore has something
    // to land on.
    const haveLayout = s.totalPages > 1
    const position: ReadingPosition = {
      bookId: s.bookId,
      chapterNumber: s.chapterNumber,
      currentPage: haveLayout ? s.currentPage : 0,
      totalPages: haveLayout ? s.totalPages : 1,
      scrollFraction: haveLayout ? s.currentPage / (s.totalPages - 1) : 0,
      updatedAt: Date.now(),
      lastParagraphIndex: s.lastParagraphIndex,
    }

    // Skip if nothing meaningful changed since last write. Two sources of dup
    // writes: (a) heartbeat firing on a stationary reader, (b) effect re-fires
    // after a render that didn't actually change position. The cloud upsert
    // would still bump updated_at but it's wasted bandwidth.
    const last = lastSavedRef.current
    if (
      last &&
      last.bookId === position.bookId &&
      last.chapterNumber === position.chapterNumber &&
      last.currentPage === position.currentPage &&
      last.lastParagraphIndex === position.lastParagraphIndex
    ) {
      recordSkip(`unchanged:${reason}`)
      return
    }

    // Backward-regression guard: if cloud has us at chapter X and we're trying
    // to write chapter Y<X without a recent user-nav signal, this is almost
    // certainly a destructive write from a default-state remount (e.g. a
    // modal/auth/tier flow that briefly reset in-memory chapter to 1 between
    // cloud read and current state). Block it.
    //
    // The page-change effect calls markUserNav on every state-driven write,
    // so any deliberate backward navigation (prev chapter, TOC click) widens
    // the write window long enough for the actual save to land. Heartbeat /
    // visibility writes that find the in-memory chapter regressed without a
    // recent user nav get blocked here.
    const knownCloudChapter = cloudKnownChapter.get(position.bookId)
    if (typeof knownCloudChapter === 'number' && position.chapterNumber < knownCloudChapter) {
      const lastNav = lastUserNavAt.get(position.bookId) ?? 0
      const sinceNav = Date.now() - lastNav
      if (sinceNav > USER_NAV_GRACE_MS) {
        recordSkip(`regression-blocked:${reason}:cloud=${knownCloudChapter}>attempt=${position.chapterNumber}`)
        if (typeof window !== 'undefined') {
          const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
          dbg.lastRegressionBlock = {
            bookId: position.bookId,
            cloudChapter: knownCloudChapter,
            attemptedChapter: position.chapterNumber,
            at: Date.now(),
          }
          window.__tinctPositionDebug = dbg
        }
        return
      }
    }

    storage.set(positionKey(s.bookId), position)
    // Also push the current-book pointer so other devices know which book to
    // open by default. This used to live here, was removed in the Apr 23
    // commit, and the consequence was that signed-in users on a fresh device
    // didn't always restore to the right book. Cheap to keep in sync.
    storage.set('tinct-current-book', s.bookId)
    lastSavedRef.current = {
      bookId: position.bookId,
      chapterNumber: position.chapterNumber,
      currentPage: position.currentPage,
      lastParagraphIndex: position.lastParagraphIndex,
    }

    if (typeof window !== 'undefined') {
      const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
      dbg.lastWriteAt = position.updatedAt!
      dbg.lastWriteValue = position
      dbg.writeCount += 1
      window.__tinctPositionDebug = dbg
    }
  }, [])

  const prevChapterRef = useRef(chapterNumber)
  useEffect(() => {
    if (!storageReady) return
    if (!writeUnlockedRef.current) {
      writeUnlockedRef.current = true
      return
    }
    const isChapterChange = chapterNumber !== prevChapterRef.current
    prevChapterRef.current = chapterNumber
    // Skip page-level saves during layout (totalPages <= 1), but always save chapter changes
    if (totalPages <= 1 && !isChapterChange) return
    // Mark this as a user-driven nav so the regression guard doesn't block a
    // legitimate user-initiated backward move (e.g. prev-chapter, TOC click).
    // Heartbeats and visibility writes do NOT mark, so they still get caught
    // by the regression guard when state has been corrupted by a remount.
    markUserNav(bookId)
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
