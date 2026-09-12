import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isPositionStale, isRebasedBook, rebaseSavedPosition } from './rebasedEditions'
import { isEditionWithheld, migrateWithheldEdition } from './withheldEditions'
import { BOOKS } from './bookRegistry'
import { localStorageProvider, setStorageProvider, storage, type StorageProvider } from '../services/storage'
import { getSavedPosition } from '../readerSession/positionSync'
import type { ReadingPosition } from '../types'

/**
 * 2026-09-12 re-based Meditations from Casaubon 1634 (412 paragraphs) onto
 * George Long 1862 (487). Chapter numbers survived; paragraph indices did not.
 *
 * The danger this guards is specifically the SILENT one. Old chapter profile
 * 17,14,17,43,30,51,44,58,43,37,31,27, new 17,17,16,51,36,59,75,61,42,38,39,36:
 * every chapter but the third grew, so a stored paragraph index is still in
 * range, still passes `isValidLocation`, and still opens the reader — at a
 * passage the reader has never seen, presented as their own place.
 */

const REBASED_AT = Date.UTC(2026, 8, 12)
const BEFORE = REBASED_AT - 1
const AFTER = REBASED_AT + 1

function position(patch: Partial<ReadingPosition> = {}): ReadingPosition {
  return {
    bookId: 'meditations',
    chapterNumber: 7,
    currentPage: 3,
    totalPages: 9,
    scrollFraction: 0.42,
    lastParagraphIndex: 31,
    updatedAt: BEFORE,
    ...patch,
  }
}

describe('rebasedEditions: which books and which writes', () => {
  it('names exactly the books this migration covers', () => {
    expect(isRebasedBook('meditations')).toBe(true)
    expect(isRebasedBook('odyssey')).toBe(false)
    expect(isRebasedBook('bible')).toBe(false)
  })

  it('treats a write from before the re-basing as stale', () => {
    expect(isPositionStale('meditations', BEFORE)).toBe(true)
  })

  it('treats a write from after it as current', () => {
    expect(isPositionStale('meditations', AFTER)).toBe(false)
  })

  it('treats a write with no timestamp as stale, because unknown is not "after"', () => {
    expect(isPositionStale('meditations', undefined)).toBe(true)
    expect(isPositionStale('meditations', Number.NaN)).toBe(true)
  })

  it('never calls another book stale, whatever its timestamp', () => {
    expect(isPositionStale('odyssey', BEFORE)).toBe(false)
    expect(isPositionStale('odyssey', undefined)).toBe(false)
  })
})

describe('rebaseSavedPosition keeps the chapter and drops the paragraph', () => {
  it('keeps the chapter — the twelve books are still the twelve books', () => {
    expect(rebaseSavedPosition(position())?.chapterNumber).toBe(7)
  })

  it('drops the paragraph, the scroll fraction and the page', () => {
    expect(rebaseSavedPosition(position())).toMatchObject({
      chapterNumber: 7,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: undefined,
    })
  })

  it('leaves a post-re-basing position completely alone', () => {
    const current = position({ updatedAt: AFTER })
    expect(rebaseSavedPosition(current)).toBe(current)
  })

  it('leaves another book completely alone, however old', () => {
    const other = position({ bookId: 'odyssey', updatedAt: BEFORE })
    expect(rebaseSavedPosition(other)).toBe(other)
  })

  it('is idempotent — re-reading stored bytes yields the same place', () => {
    const once = rebaseSavedPosition(position())!
    expect(rebaseSavedPosition(once)).toEqual(once)
  })

  it('does not stamp updatedAt: it is a read-time view, not a write', () => {
    expect(rebaseSavedPosition(position())?.updatedAt).toBe(BEFORE)
  })

  it('passes null through', () => {
    expect(rebaseSavedPosition(null)).toBeNull()
  })

  it('catches the in-range case that bounds checking cannot see', () => {
    // Chapter 2 held 14 paragraphs under Casaubon and holds 17 under Long, so
    // paragraph 13 is in range before AND after. Nothing would have reported it.
    const rebased = rebaseSavedPosition(position({ chapterNumber: 2, lastParagraphIndex: 13 }))
    expect(rebased?.lastParagraphIndex).toBeUndefined()
    expect(rebased?.chapterNumber).toBe(2)
  })
})

describe('the re-basing reaches the reader through getSavedPosition', () => {
  let restore: StorageProvider
  beforeEach(() => {
    restore = localStorageProvider
    const store = new Map<string, unknown>()
    setStorageProvider({
      get: <T,>(key: string) => (store.get(key) as T | undefined) ?? null,
      set: <T,>(key: string, value: T) => { store.set(key, value) },
      delete: (key: string) => { store.delete(key) },
      getAll: <T,>(prefix: string) => Array.from(store.entries()).filter(([k]) => k.startsWith(prefix)).map(([, v]) => v as T),
    })
  })
  afterEach(() => { setStorageProvider(restore) })

  it('re-bases a stale stored Meditations position on the way out of storage', () => {
    storage.set('position:meditations', position())
    expect(getSavedPosition('meditations')).toMatchObject({
      chapterNumber: 7,
      scrollFraction: 0,
      lastParagraphIndex: undefined,
    })
  })

  it('returns another book’s stored position untouched', () => {
    const odyssey = position({ bookId: 'odyssey' })
    storage.set('position:odyssey', odyssey)
    expect(getSavedPosition('odyssey')).toEqual(odyssey)
  })
})

describe('the withdrawn Danish edition', () => {
  it('is withheld, and names modern-en as its successor', () => {
    expect(isEditionWithheld('meditations', 'modern-da')).toBe(true)
    expect(migrateWithheldEdition('meditations', 'modern-da')).toBe('modern-en')
  })

  it('is gone from the registry, leaving the two aligned English editions', () => {
    const meditations = BOOKS.find(b => b.id === 'meditations')!
    expect(meditations.editions.map(e => e.key).sort()).toEqual(['modern-en', 'original-en'])
  })

  /**
   * The successor mapping moves a reader at the SAME chapter and paragraph,
   * which is sound only between aligned editions — and modern-da is aligned to
   * the old text, not the new one. It is safe here only because the two
   * mechanisms compose: every stored modern-da location predates the re-basing,
   * so its paragraph is already gone before the successor is consulted.
   */
  it('cannot carry an old Danish paragraph index into the new English text', () => {
    const danish = position({ lastParagraphIndex: 40, updatedAt: BEFORE })
    expect(rebaseSavedPosition(danish)?.lastParagraphIndex).toBeUndefined()
  })
})

describe('the registry tells the truth about the text now served', () => {
  const meditations = () => BOOKS.find(b => b.id === 'meditations')!

  it('attributes original-en to Long 1862, which it now actually is', () => {
    const original = meditations().editions.find(e => e.key === 'original-en')!
    expect(original.label).toBe('Long Translation (1862)')
    expect(original.translator).toBe('George Long')
    expect(original.year).toBe(1862)
    expect(original.style).toBe('original')
    expect(original.language).toBe('en')
  })

  it('claims alignment only where the two served editions really are aligned', () => {
    for (const edition of meditations().editions) expect(edition.aligned).toBe(true)
  })

  it('claims no audio, because none is cut against the 487-paragraph text', () => {
    for (const edition of meditations().editions) expect(edition.hasAudio).toBeUndefined()
  })
})
