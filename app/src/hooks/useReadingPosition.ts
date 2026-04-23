import { useEffect, useRef, useCallback } from 'react'
import { storage } from '../services/storage'
import type { ReadingPosition, ReadingProgress } from '../types'

function positionKey(bookId: string): string {
  return `position:${bookId}`
}

function progressKey(bookId: string): string {
  return `progress:${bookId}`
}

/**
 * Saves and restores page position per book.
 * Absolute failsafe: saves on every state change, on tab blur,
 * on visibility change, and on beforeunload. Also persists current
 * book ID so cross-device restore opens the right book.
 *
 * When storageReady is false, writes are suppressed to prevent
 * overwriting cloud data with defaults during auth resolution.
 */
export function useReadingPosition(
  bookId: string,
  chapterNumber: number,
  currentPage: number,
  totalPages: number,
  totalChapters: number,
  storageReady = true,
  lastParagraphIndex?: number,
) {
  // Keep refs for the latest values so event listeners always have current state
  const stateRef = useRef({ bookId, chapterNumber, currentPage, totalPages, totalChapters, storageReady, lastParagraphIndex })
  stateRef.current = { bookId, chapterNumber, currentPage, totalPages, totalChapters, storageReady, lastParagraphIndex }

  // Write lock: skip the very first write when storageReady transitions to true —
  // at that point state is stale defaults, cloud restore hasn't run yet
  const writeUnlockedRef = useRef(false)

  // Core save function — writes position + current book ID
  const saveNow = useCallback(() => {
    const s = stateRef.current
    if (!s.storageReady) return
    if (!writeUnlockedRef.current) return
    if (s.totalPages <= 1) return
    const position: ReadingPosition = {
      bookId: s.bookId,
      chapterNumber: s.chapterNumber,
      currentPage: s.currentPage,
      totalPages: s.totalPages,
      scrollFraction: s.totalPages > 1 ? s.currentPage / (s.totalPages - 1) : 0,
      updatedAt: Date.now(),
      lastParagraphIndex: s.lastParagraphIndex,
    }
    storage.set(positionKey(s.bookId), position)
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
    saveNow()
  }, [bookId, chapterNumber, currentPage, totalPages, storageReady, saveNow])

  // Failsafe: save on visibility change (tab switch, app background on mobile)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') saveNow()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [saveNow])

  // Failsafe: save on beforeunload (browser close, refresh, navigate away)
  useEffect(() => {
    const handleUnload = () => saveNow()
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [saveNow])

  // Failsafe: save on blur (user clicks away from window)
  useEffect(() => {
    const handleBlur = () => saveNow()
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
