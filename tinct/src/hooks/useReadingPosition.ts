import { useEffect } from 'react'
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
 */
export function useReadingPosition(
  bookId: string,
  chapterNumber: number,
  currentPage: number,
  totalPages: number,
  totalChapters: number,
) {
  // Save position whenever page or chapter changes — skip while content is loading (totalPages <= 1)
  useEffect(() => {
    if (totalPages <= 1) return
    const position: ReadingPosition = {
      bookId,
      chapterNumber,
      currentPage,
      totalPages,
      scrollFraction: totalPages > 1 ? currentPage / (totalPages - 1) : 0,
    }
    storage.set(positionKey(bookId), position)
  }, [bookId, chapterNumber, currentPage, totalPages])

  // Track progress: update when user reaches last page of a chapter
  useEffect(() => {
    if (totalPages <= 1) return
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
}

/** Get saved position for a book (used on initial load) */
export function getSavedPosition(bookId: string): ReadingPosition | null {
  return storage.get<ReadingPosition>(positionKey(bookId))
}

/** Get reading progress for a book */
export function getReadingProgress(bookId: string): ReadingProgress | null {
  return storage.get<ReadingProgress>(progressKey(bookId))
}
