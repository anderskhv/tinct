import { useEffect, useRef, useState, useCallback } from 'react'
import { storage } from '../services/storage'
import { getReadingProgress, getSavedPosition } from './useReadingPosition'
import type { BookReadingLog, ChapterReadingRecord, EditionUsage } from '../types'

function logKey(bookId: string): string {
  return `reading-log:${bookId}`
}

/** Upsert an edition usage entry, preserving existing entries */
function upsertUsage(existing: EditionUsage[] | undefined, key: string, mode: 'read' | 'listened', percent?: number): EditionUsage[] {
  const arr = existing ? [...existing] : []
  const idx = arr.findIndex(u => u.key === key && u.mode === mode)
  if (idx >= 0) {
    if (percent !== undefined && (arr[idx].percent === undefined || percent > arr[idx].percent)) {
      arr[idx] = { ...arr[idx], percent }
    }
    return arr
  }
  arr.push({ key, mode, percent })
  return arr
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
) {
  const [log, setLog] = useState<BookReadingLog>(() => {
    return storage.get<BookReadingLog>(logKey(bookId)) || { bookId, chapters: {}, updatedAt: 0 }
  })

  // Reload log when book changes
  useEffect(() => {
    let loaded = storage.get<BookReadingLog>(logKey(bookId))
    if (!loaded) {
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
  }, [bookId])

  // Time tracking with idle detection.
  // Pauses after 5 minutes of no page/paragraph movement.
  // Accumulates active reading time only.
  const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  const activeSecondsRef = useRef(0)
  const lastActivityRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevChapterForTimeRef = useRef(currentChapter)

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
        flushTime(prevChapterForTimeRef.current)
      } else {
        // Resumed — restart timer
        startTimer()
      }
    }
    window.addEventListener('visibilitychange', handleVisibility)
    return () => window.removeEventListener('visibilitychange', handleVisibility)
  }, [flushTime, startTimer])

  // Track chapter visits — only increment on actual chapter changes
  const prevChapterRef = useRef(currentChapter)
  const prevBookRef = useRef(bookId)
  useEffect(() => {
    if (!storageReady) return
    const isChapterChange = currentChapter !== prevChapterRef.current
    const isBookChange = bookId !== prevBookRef.current

    // Flush time for the chapter we're leaving, restart timer for new chapter
    if (isChapterChange || isBookChange) {
      flushTime(prevChapterRef.current)
      activeSecondsRef.current = 0
      startTimer()
      prevChapterForTimeRef.current = currentChapter
    }

    prevChapterRef.current = currentChapter
    prevBookRef.current = bookId
    // Record on chapter change or first mount (book change)
    if (!isChapterChange && !isBookChange) return

    const mode = isAudioPlaying ? 'listened' as const : 'read' as const
    setLog(prev => {
      const existing = prev.chapters[currentChapter]
      const now = Date.now()
      const updated: BookReadingLog = {
        ...prev,
        updatedAt: now,
        chapters: {
          ...prev.chapters,
          [currentChapter]: existing
            ? {
                ...existing,
                readCount: existing.readCount + 1,
                lastReadAt: now,
                editions: existing.editions.includes(editionKey)
                  ? existing.editions
                  : [...existing.editions, editionKey],
                editionUsage: upsertUsage(existing.editionUsage, editionKey, mode),
              }
            : {
                chapterNumber: currentChapter,
                editions: [editionKey],
                editionUsage: [{ key: editionKey, mode }],
                readCount: 1,
                firstReadAt: now,
                lastReadAt: now,
                completed: false,
              },
        },
      }
      return updated
    })
  }, [currentChapter, bookId, editionKey, storageReady])

  // Track edition changes within the same chapter
  const prevEditionRef = useRef(editionKey)
  useEffect(() => {
    if (!storageReady) return
    if (editionKey === prevEditionRef.current) return
    prevEditionRef.current = editionKey

    setLog(prev => {
      const existing = prev.chapters[currentChapter]
      if (!existing || existing.editions.includes(editionKey)) return prev
      return {
        ...prev,
        updatedAt: Date.now(),
        chapters: {
          ...prev.chapters,
          [currentChapter]: {
            ...existing,
            editions: [...existing.editions, editionKey],
          },
        },
      }
    })
  }, [editionKey, currentChapter, storageReady])

  // Track chapter completion (reached last page)
  useEffect(() => {
    if (!storageReady) return
    if (totalPages <= 1 || currentPage < totalPages - 1) return

    setLog(prev => {
      const existing = prev.chapters[currentChapter]
      if (!existing || existing.completed) return prev
      return {
        ...prev,
        updatedAt: Date.now(),
        chapters: {
          ...prev.chapters,
          [currentChapter]: { ...existing, completed: true },
        },
      }
    })
  }, [currentPage, totalPages, currentChapter, storageReady])

  // Track paragraph position within chapter (updates on every paragraph change)
  const prevParagraphRef = useRef(lastParagraphIndex)
  useEffect(() => {
    if (!storageReady) return
    if (lastParagraphIndex === undefined) return
    if (lastParagraphIndex === prevParagraphRef.current) return
    prevParagraphRef.current = lastParagraphIndex

    const mode = isAudioPlaying ? 'listened' as const : 'read' as const
    const pct = totalParagraphs && totalParagraphs > 0
      ? Math.round(((lastParagraphIndex + 1) / totalParagraphs) * 100)
      : undefined
    setLog(prev => {
      const existing = prev.chapters[currentChapter]
      if (!existing) return prev
      // Only update if further than before (don't go backwards on re-reads)
      if (existing.lastParagraphIndex !== undefined && lastParagraphIndex <= existing.lastParagraphIndex) return prev
      return {
        ...prev,
        updatedAt: Date.now(),
        chapters: {
          ...prev.chapters,
          [currentChapter]: {
            ...existing,
            lastParagraphIndex,
            totalParagraphs: totalParagraphs ?? existing.totalParagraphs,
            editionUsage: upsertUsage(existing.editionUsage, editionKey, mode, pct),
          },
        },
      }
    })
  }, [lastParagraphIndex, totalParagraphs, currentChapter, storageReady])

  // Persist on change
  useEffect(() => {
    if (!storageReady) return
    if (log.updatedAt === 0) return // don't persist initial empty state
    storage.set(logKey(bookId), log)
  }, [log, bookId, storageReady])

  const getChapterRecord = useCallback((chapter: number): ChapterReadingRecord | undefined => {
    return log.chapters[chapter]
  }, [log])

  return { log, getChapterRecord }
}
