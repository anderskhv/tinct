import { useEffect, useCallback, useRef } from 'react'
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
 * Also tracks reading progress (how far through the book).
 *
 * IMPORTANT: Does not save position until the page has been loaded
 * (totalPages > 1), to avoid overwriting saved position with default 0.
 */
export function useReadingPosition(
  bookId: string,
  chapterNumber: number,
  currentPage: number,
  totalPages: number,
  totalChapters: number,
) {
  // Track whether we've seen a real page load (totalPages > 1 means layout is done)
  const hasLoaded = useRef(false)

  // Reset loaded flag when book changes
  useEffect(() => {
    hasLoaded.current = false
  }, [bookId])

  // Mark as loaded once we have real pagination
  useEffect(() => {
    if (totalPages > 1) {
      hasLoaded.current = true
    }
  }, [totalPages])

  // Save position whenever page or chapter changes — but only after initial load
  const savePosition = useCallback(() => {
    if (!hasLoaded.current) return
    const position: ReadingPosition = {
      bookId,
      chapterNumber,
      currentPage,
      totalPages,
    }
    storage.set(positionKey(bookId), position)
  }, [bookId, chapterNumber, currentPage, totalPages])

  useEffect(() => {
    savePosition()
  }, [savePosition])

  // Track progress: update when user reaches last page of a chapter
  useEffect(() => {
    if (!hasLoaded.current) return
    if (totalPages <= 1 && currentPage === 0) return // still loading
    if (currentPage >= totalPages - 1) {
      // User reached the last page of this chapter
      const existing = storage.get<ReadingProgress>(progressKey(bookId))
      const prev = existing?.highestCompletedChapter || 0
      if (chapterNumber > prev) {
        storage.set<ReadingProgress>(progressKey(bookId), {
          bookId,
          highestCompletedChapter: chapterNumber,
          totalChapters,
          percent: Math.round((chapterNumber / totalChapters) * 100),
        })
      }
    }
  }, [bookId, chapterNumber, currentPage, totalPages, totalChapters])

  return { savePosition }
}

/** Get saved position for a book (used on initial load) */
export function getSavedPosition(bookId: string): ReadingPosition | null {
  return storage.get<ReadingPosition>(positionKey(bookId))
}

/** Get reading progress for a book */
export function getReadingProgress(bookId: string): ReadingProgress | null {
  return storage.get<ReadingProgress>(progressKey(bookId))
}
