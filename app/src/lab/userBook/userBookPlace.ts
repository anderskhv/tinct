/**
 * The reader's place in their own book: localStorage `tinct-addbook:place:<hex>`,
 * on this device only (sign-out removes every `tinct-addbook:` key). A place is
 * a whole tuple (chapter, paragraph, word) and is checked against the book
 * when read back.
 */
import type { UserBookEdition } from './userEdition'

const PLACE_PREFIX = 'tinct-addbook:place:'

export interface UserBookPlace {
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
  updatedAt: number
}

export function readUserBookPlace(hex: string, edition: UserBookEdition): UserBookPlace | null {
  try {
    const raw = JSON.parse(localStorage.getItem(PLACE_PREFIX + hex) || 'null') as Partial<UserBookPlace> | null
    if (!raw || typeof raw !== 'object') return null
    // Checked against the book as it is now: a place outside it opens the first chapter.
    const chapter = edition.chapters.find(item => item.number === raw.chapterNumber)
    if (!chapter || !Number.isInteger(raw.paragraphIndex) || !Number.isInteger(raw.wordIndex)) return null
    const paragraphIndex = raw.paragraphIndex!
    if (paragraphIndex < 0 || paragraphIndex >= chapter.paragraphs.length || raw.wordIndex! < 0) return null
    const words = chapter.paragraphs[paragraphIndex].split(/\s+/).filter(Boolean).length
    return {
      chapterNumber: chapter.number,
      paragraphIndex,
      wordIndex: Math.min(raw.wordIndex!, Math.max(0, words - 1)),
      updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : 0,
    }
  } catch {
    return null
  }
}

/**
 * Keep a new place. The account revision this device last saw for the book
 * (`rev`, ownSync.ts) stays with it, so saving it to the account names that revision.
 */
export function writeUserBookPlace(hex: string, place: UserBookPlace): void {
  try {
    let rev: unknown
    try { rev = (JSON.parse(localStorage.getItem(PLACE_PREFIX + hex) || 'null') as { rev?: unknown } | null)?.rev } catch { rev = undefined }
    const { chapterNumber, paragraphIndex, wordIndex, updatedAt } = place
    localStorage.setItem(PLACE_PREFIX + hex, JSON.stringify({ chapterNumber, paragraphIndex, wordIndex, updatedAt, ...(Number.isInteger(rev) ? { rev } : {}) }))
  } catch { /* full or private */ }
}
