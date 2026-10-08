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
  /**
   * The conversion rules of the edition the place is in (userEdition.ts). A
   * book converted again on this device is converted under them, so the place
   * still points at the same words. A place saved before places recorded them
   * is in a conversion made before USER_EDITION_CONVERTER.
   */
  converter?: number
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
      ...(typeof raw.converter === 'number' ? { converter: raw.converter } : {}),
    }
  } catch {
    return null
  }
}

/**
 * The rules the saved place was read under: undefined without a saved place,
 * null for a place saved before places recorded them.
 */
export function storedPlaceConverter(hex: string): number | null | undefined {
  try {
    const raw = JSON.parse(localStorage.getItem(PLACE_PREFIX + hex) || 'null') as Partial<UserBookPlace> | null
    if (!raw || typeof raw !== 'object') return undefined
    return typeof raw.converter === 'number' ? raw.converter : null
  } catch {
    return undefined
  }
}

export function writeUserBookPlace(hex: string, place: UserBookPlace): void {
  try { localStorage.setItem(PLACE_PREFIX + hex, JSON.stringify(place)) } catch { /* full or private */ }
}
