import { useEffect, useRef, useCallback } from 'react'
import type { ReadingPosition } from '../types'
import {
  commitReadingPosition,
  commitReadingProgress,
  getReadingProgress,
  getSavedPosition,
  markCloudLoaded,
  markCloudPosition,
  markUserNav,
} from '../readerSession/positionSync'
import type { ReaderBookContext, ReaderLocation, ReaderSessionState } from '../readerSession/types'
import { getPersistableReaderHistoryLocation, shouldSkipOnBookChange } from './useReadingPosition.guards'

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

export { getReadingProgress, getSavedPosition, markCloudLoaded, markCloudPosition, markUserNav }

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
    const result = commitReadingPosition({
      cause: reason,
      readerSession: s.readerSession,
      currentPage: s.currentPage,
      totalPages: s.totalPages,
      totalChapters: s.totalChapters,
    })
    if (typeof window !== 'undefined' && result.gate) {
      const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
      ;(dbg as typeof dbg & { lastReaderSessionGate?: typeof result.gate }).lastReaderSessionGate = result.gate
      window.__tinctPositionDebug = dbg
    }
    if (!result.committed) {
      recordSkip(result.reason)
      if (result.reason.startsWith('regression-blocked:') && result.position && typeof window !== 'undefined') {
        const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
        dbg.lastRegressionBlock = {
          bookId: result.position.bookId,
          cloudChapter: result.cloudChapter as number,
          attemptedChapter: result.attemptedChapter as number,
          at: Date.now(),
        }
        window.__tinctPositionDebug = dbg
      }
      return
    }

    if (typeof window !== 'undefined') {
      const dbg = window.__tinctPositionDebug ?? { lastWriteAt: 0, lastWriteValue: null, writeCount: 0, lastSkipReason: '' }
      dbg.lastWriteAt = result.position.updatedAt!
      dbg.lastWriteValue = result.position
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
    const loaded = getSavedPosition(bookId)
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
    const progressLocation = getPersistableReaderHistoryLocation({
      bookId,
      status: readerSession?.status,
      location: readerSession?.location,
      totalChapters,
    })
    if (!progressLocation) return
    // Cross-book bleed guard for progress writes: if totalChapters isn't known
    // yet (book data still loading) OR chapterNumber is out of range, skip the
    // write. Without this, a stale chapter from a previous book can land in the
    // new book's progress with the OLD book's totalChapters — which is exactly
    // how `progress:nicomachean-ethics` got `totalChapters=1189` (the Bible's
    // chapter count). Diagnosed 2026-05-06.
    if (totalChapters <= 0) return
    // Single write point for `progress:` from reading-time paths — derives the
    // chapter from the readerSession location (via getPersistableReaderHistoryLocation
    // above), keeping readerSession the sole persisted-tuple source.
    commitReadingProgress({
      bookId,
      progressChapter: progressLocation.chapterNumber,
      currentPage,
      totalPages,
      totalChapters,
    })
  }, [bookId, currentPage, totalPages, totalChapters, storageReady, readerSession])
}
