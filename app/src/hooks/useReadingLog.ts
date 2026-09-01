import { useEffect, useRef, useState, useCallback } from 'react'
import { storage } from '../services/storage'
import { getReadingProgress, getSavedPosition } from './useReadingPosition'
import type { BookReadingLog, ChapterReadingRecord } from '../types'
import { ensureReadingLogChapter, getReadingLogTransition, recordReadingLogActivity, sanitizeReadingLog } from './useReadingLog.guards'
import { getPersistableReaderHistoryLocation } from './useReadingPosition.guards'
import type { ReaderLocation, ReaderSessionState } from '../readerSession/types'

function logKey(bookId: string): string {
  return `reading-log:${bookId}`
}

/**
 * Tracks per-chapter reading history: which editions, how many times, completion status.
 * Powers the Reading Feed timeline view.
 */
export function useReadingLog(
  bookId: string,
  currentChapter: number,
  editionKey: string,
  currentPage: number,
  totalPages: number,
  storageReady = true,
  lastParagraphIndex?: number,
  totalParagraphs?: number,
  isAudioPlaying = false,
  /**
   * Total chapters in the current book. When > 0, used to bound-check writes:
   * any chapter that's out of range (e.g. Bible's chapter 345 leaking into
   * Awakening which has 39 chapters) is dropped. 0 means unknown (book data
   * not loaded yet) — the bound check is skipped, behavior unchanged.
   *
   * This is the cross-book bleed defense (B1, recurring 2026-05-06):
   * stale `currentChapter` from a previous book leaks into the new book's
   * log keys when bookId changes faster than chapter does in React state.
   */
  totalChapters?: number,
  allowedEditionKeys?: readonly string[],
  readerSession?: {
    location: ReaderLocation
    status: ReaderSessionState['status']
  },
) {
  const persistableLocation = getPersistableReaderHistoryLocation({
    bookId,
    status: readerSession?.status,
    location: readerSession?.location,
    totalChapters,
    allowedEditionKeys,
  })
  const [log, setLog] = useState<BookReadingLog>(() => {
    return sanitizeReadingLog({
      bookId,
      log: storage.get<BookReadingLog>(logKey(bookId)),
      totalChapters,
      allowedEditionKeys,
    })
  })

  // Reload log when book changes
  useEffect(() => {
    let loaded = sanitizeReadingLog({
      bookId,
      log: storage.get<BookReadingLog>(logKey(bookId)),
      totalChapters,
      allowedEditionKeys,
    })
    const hadLoadedLog = loaded.updatedAt !== 0 || Object.keys(loaded.chapters).length > 0
    if (!hadLoadedLog) {
      // Backfill from existing progress + position data
      const progress = getReadingProgress(bookId)
      const position = getSavedPosition(bookId)
      // Use the higher of: highestCompletedChapter, or currentChapter - 1
      const completedFromProgress = progress?.highestCompletedChapter || 0
      const completedFromPosition = position ? position.chapterNumber - 1 : 0
      const highestCompleted = Math.max(completedFromProgress, completedFromPosition)

      if (highestCompleted > 0 || position) {
        const chapters: Record<number, ChapterReadingRecord> = {}
        for (let ch = 1; ch <= highestCompleted; ch++) {
          chapters[ch] = {
            chapterNumber: ch,
            editions: [editionKey],
            readCount: 1,
            firstReadAt: 0,
            lastReadAt: 0,
            completed: true,
          }
        }
        // Also add current chapter as in-progress (visited but not completed)
        if (position && !chapters[position.chapterNumber]) {
          chapters[position.chapterNumber] = {
            chapterNumber: position.chapterNumber,
            editions: [editionKey],
            readCount: 1,
            firstReadAt: 0,
            lastReadAt: 0,
            completed: false,
          }
        }
        loaded = { bookId, chapters, updatedAt: Date.now() }
      } else {
        loaded = { bookId, chapters: {}, updatedAt: 0 }
      }
    }
    setLog(loaded)
  }, [bookId, totalChapters, allowedEditionKeys])

  // Time tracking with idle detection.
  // Pauses after 5 minutes of no page/paragraph movement.
  // Accumulates active reading time only.
  const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  const activeSecondsRef = useRef(0)
  const lastActivityRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevChapterForTimeRef = useRef<number | null>(persistableLocation?.chapterNumber ?? null)

  // Start/restart the timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    lastActivityRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const now = Date.now()
      // If idle for too long, don't accumulate
      if (now - lastActivityRef.current > IDLE_TIMEOUT) return
      activeSecondsRef.current += 1
    }, 1000)
  }, [])

  // Reset activity timestamp on page/paragraph changes
  useEffect(() => {
    lastActivityRef.current = Date.now()
  }, [currentPage, lastParagraphIndex])

  // Start timer on mount, clean up on unmount
  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  // Flush accumulated time to a chapter
  const flushTime = useCallback((fromChapter: number) => {
    const elapsed = activeSecondsRef.current
    activeSecondsRef.current = 0
    if (elapsed < 2) return
    setLog(prev => {
      const existing = prev.chapters[fromChapter]
      if (!existing) return prev
      return {
        ...prev,
        updatedAt: Date.now(),
        chapters: {
          ...prev.chapters,
          [fromChapter]: {
            ...existing,
            timeSpentSeconds: (existing.timeSpentSeconds || 0) + elapsed,
          },
        },
      }
    })
  }, [])

  // Flush time on visibility hidden (tab switch, app background)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (prevChapterForTimeRef.current !== null) flushTime(prevChapterForTimeRef.current)
      } else {
        // Resumed — restart timer
        startTimer()
      }
    }
    window.addEventListener('visibilitychange', handleVisibility)
    return () => window.removeEventListener('visibilitychange', handleVisibility)
  }, [flushTime, startTimer])

  // Track chapter visits — only increment on actual chapter changes
  const prevChapterRef = useRef<number | null>(persistableLocation?.chapterNumber ?? null)
  const prevBookRef = useRef(bookId)
  useEffect(() => {
    if (!storageReady) return
    if (!persistableLocation) return
    const activeChapter = persistableLocation.chapterNumber
    const activeEditionKey = persistableLocation.editionKey
    const transition = getReadingLogTransition({
      previousBookId: prevBookRef.current,
      previousChapter: prevChapterRef.current,
      bookId,
      activeChapter,
    })
    const { isFirstPersistableLocation, isChapterChange, isBookChange } = transition

    // Flush time for the chapter we're leaving, restart timer for new chapter
    if (isChapterChange || isBookChange) {
      if (transition.chapterToFlush !== null) flushTime(transition.chapterToFlush)
      activeSecondsRef.current = 0
      startTimer()
      prevChapterForTimeRef.current = activeChapter
    } else if (isFirstPersistableLocation) {
      prevChapterForTimeRef.current = activeChapter
    }

    prevChapterRef.current = activeChapter
    prevBookRef.current = bookId
    // Record on chapter change or first mount (book change)
    if (!isChapterChange && !isBookChange) return

    const mode = isAudioPlaying ? 'listened' as const : 'read' as const
    const shouldCountVisit = isChapterChange || isBookChange
    setLog(prev => {
      return ensureReadingLogChapter({
        log: prev,
        bookId,
        chapterNumber: activeChapter,
        editionKey: activeEditionKey,
        mode,
        countVisit: shouldCountVisit,
        now: Date.now(),
      })
    })
  }, [bookId, storageReady, isAudioPlaying, persistableLocation, flushTime, startTimer])

  // Track edition changes within the same chapter
  const prevEditionRef = useRef(editionKey)
  useEffect(() => {
    if (!storageReady) return
    if (!persistableLocation) return
    const activeChapter = persistableLocation.chapterNumber
    const activeEditionKey = persistableLocation.editionKey
    if (activeEditionKey === prevEditionRef.current) return
    prevEditionRef.current = activeEditionKey

    setLog(prev => {
      const existing = prev.chapters[activeChapter]
      if (!existing || existing.editions.includes(activeEditionKey)) return prev
      return {
        ...prev,
        updatedAt: Date.now(),
        chapters: {
          ...prev.chapters,
          [activeChapter]: {
            ...existing,
            editions: [...existing.editions, activeEditionKey],
          },
        },
      }
    })
  }, [editionKey, storageReady, persistableLocation])

  // Track chapter completion (reached last page)
  useEffect(() => {
    if (!storageReady) return
    if (!persistableLocation) return
    const activeChapter = persistableLocation.chapterNumber
    if (totalPages <= 1 || currentPage < totalPages - 1) return

    setLog(prev => {
      const existing = prev.chapters[activeChapter]
      if (!existing || existing.completed) return prev
      return {
        ...prev,
        updatedAt: Date.now(),
        chapters: {
          ...prev.chapters,
          [activeChapter]: { ...existing, completed: true },
        },
      }
    })
  }, [currentPage, totalPages, storageReady, persistableLocation])

  // Track paragraph position within chapter (updates on every paragraph change)
  const prevActivityRef = useRef<string | null>(null)
  useEffect(() => {
    if (!storageReady) return
    if (!persistableLocation) return
    const activeChapter = persistableLocation.chapterNumber
    const activeEditionKey = persistableLocation.editionKey
    const activeParagraphIndex = persistableLocation.paragraphIndex
    if (activeParagraphIndex === undefined) return
    const activityKey = `${bookId}:${activeChapter}:${activeEditionKey}:${activeParagraphIndex}:${isAudioPlaying ? 'listened' : 'read'}`
    if (activityKey === prevActivityRef.current) return
    prevActivityRef.current = activityKey

    const mode = isAudioPlaying ? 'listened' as const : 'read' as const
    setLog(prev => {
      return recordReadingLogActivity({
        log: prev,
        bookId,
        chapterNumber: activeChapter,
        editionKey: activeEditionKey,
        mode,
        paragraphIndex: activeParagraphIndex,
        totalParagraphs,
        now: Date.now(),
      })
    })
  }, [bookId, totalParagraphs, storageReady, isAudioPlaying, persistableLocation])

  // Persist on change
  useEffect(() => {
    if (!storageReady) return
    if (log.updatedAt === 0) return // don't persist initial empty state
    // On the first render after a book switch, React may still hold the
    // previous book's log state while this effect receives the new bookId.
    // Never write that stale tuple under the new book's storage key.
    if (log.bookId !== bookId) return
    storage.set(logKey(bookId), log)
  }, [log, bookId, storageReady])

  const getChapterRecord = useCallback((chapter: number): ChapterReadingRecord | undefined => {
    return log.chapters[chapter]
  }, [log])

  return { log, getChapterRecord }
}
