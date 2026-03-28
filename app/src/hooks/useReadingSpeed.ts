import { useState, useCallback, useEffect, useRef } from 'react'
import { storage } from '../services/storage'

interface ReadingSpeedData {
  /** Total words read across all tracked pages */
  totalWordsRead: number
  /** Total seconds spent reading across all tracked pages */
  totalSecondsSpent: number
  /** Number of page-flips tracked */
  pagesTracked: number
}

interface ReadingSpeedReturn {
  /** Words per minute (default 250 until model kicks in) */
  wordsPerMinute: number
  /** Whether we're using the learned model vs default */
  isLearned: boolean
  /** Percentage of the book read (0-100) */
  percentComplete: number
  /** Estimated minutes remaining */
  minutesRemaining: number
  /** Formatted time remaining string */
  timeRemainingLabel: string
  /** Call when page changes — tracks reading speed */
  trackPageView: (pageWordsCount: number) => void
}

const DEFAULT_WPM = 250
const MIN_PAGES_FOR_MODEL = 50
const MIN_SECONDS_PER_PAGE = 5 // Ignore page flips faster than 5 seconds (skimming/flipping)
const MAX_SECONDS_PER_PAGE = 600 // Ignore pages viewed longer than 10 minutes (probably AFK)

function storageKey(bookId: string): string {
  return `reading-speed:${bookId}`
}

export function useReadingSpeed(
  bookId: string,
  currentChapter: number,
  currentPage: number,
  totalPages: number,
  totalChapters: number,
  /** All chapters' paragraph arrays, for word counting */
  allParagraphs: string[][] | null,
): ReadingSpeedReturn {
  const [speedData, setSpeedData] = useState<ReadingSpeedData>(() => {
    return storage.get<ReadingSpeedData>(storageKey(bookId)) || {
      totalWordsRead: 0,
      totalSecondsSpent: 0,
      pagesTracked: 0,
    }
  })

  // Track when the current page was first viewed
  const pageStartTime = useRef<number>(Date.now())
  const lastPage = useRef<{ chapter: number; page: number }>({ chapter: currentChapter, page: currentPage })

  // Reload on book change
  useEffect(() => {
    const stored = storage.get<ReadingSpeedData>(storageKey(bookId))
    setSpeedData(stored || { totalWordsRead: 0, totalSecondsSpent: 0, pagesTracked: 0 })
  }, [bookId])

  // Persist on change
  useEffect(() => {
    storage.set(storageKey(bookId), speedData)
  }, [speedData, bookId])

  // Count total words in the book
  const totalBookWords = allParagraphs
    ? allParagraphs.reduce((sum, paras) => sum + paras.reduce((s, p) => s + p.split(/\s+/).length, 0), 0)
    : 0

  // Count words read so far (all complete chapters + current page proportion of current chapter)
  const wordsReadSoFar = allParagraphs
    ? (() => {
        let words = 0
        for (let i = 0; i < allParagraphs.length; i++) {
          const chapterNum = i + 1
          if (chapterNum < currentChapter) {
            // Fully read chapter
            words += allParagraphs[i].reduce((s, p) => s + p.split(/\s+/).length, 0)
          } else if (chapterNum === currentChapter) {
            // Current chapter: proportion based on page
            const chapterWords = allParagraphs[i].reduce((s, p) => s + p.split(/\s+/).length, 0)
            const proportion = totalPages > 1 ? (currentPage + 1) / totalPages : 1
            words += Math.floor(chapterWords * proportion)
          }
        }
        return words
      })()
    : 0

  const percentComplete = totalBookWords > 0
    ? Math.min(100, Math.round((wordsReadSoFar / totalBookWords) * 100))
    : 0

  // WPM: use learned model if enough data, otherwise default
  const isLearned = speedData.pagesTracked >= MIN_PAGES_FOR_MODEL
  const wordsPerMinute = isLearned && speedData.totalSecondsSpent > 0
    ? Math.round((speedData.totalWordsRead / speedData.totalSecondsSpent) * 60)
    : DEFAULT_WPM

  // Estimated time remaining
  const wordsRemaining = Math.max(0, totalBookWords - wordsReadSoFar)
  const minutesRemaining = wordsPerMinute > 0 ? Math.ceil(wordsRemaining / wordsPerMinute) : 0

  // Format time remaining
  const timeRemainingLabel = (() => {
    if (minutesRemaining <= 0) return 'Done'
    if (minutesRemaining < 60) return `${minutesRemaining}min left`
    const hours = Math.floor(minutesRemaining / 60)
    const mins = minutesRemaining % 60
    if (mins === 0) return `${hours}h left`
    return `${hours}h ${mins}min left`
  })()

  const trackPageView = useCallback((pageWordsCount: number) => {
    const now = Date.now()
    const secondsOnPage = (now - pageStartTime.current) / 1000

    // Only track if it's a genuine page read (not a quick flip or AFK)
    if (
      secondsOnPage >= MIN_SECONDS_PER_PAGE &&
      secondsOnPage <= MAX_SECONDS_PER_PAGE &&
      pageWordsCount > 0 &&
      // Don't track the very first page view (no previous reading time)
      lastPage.current.chapter === lastPage.current.chapter
    ) {
      setSpeedData(prev => ({
        totalWordsRead: prev.totalWordsRead + pageWordsCount,
        totalSecondsSpent: prev.totalSecondsSpent + secondsOnPage,
        pagesTracked: prev.pagesTracked + 1,
      }))
    }

    // Reset timer for new page
    pageStartTime.current = now
    lastPage.current = { chapter: currentChapter, page: currentPage }
  }, [currentChapter, currentPage])

  return {
    wordsPerMinute,
    isLearned,
    percentComplete,
    minutesRemaining,
    timeRemainingLabel,
    trackPageView,
  }
}
