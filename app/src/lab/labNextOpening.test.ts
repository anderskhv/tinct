import { describe, expect, it } from 'vitest'
import { nextOpeningCacheKey } from './labNextOpening'

// Pinocchio on two kids' iPads, 16 Nov 2026: two-page view, switched from Modern English to Moderne Dansk on chapter 1.
// The preference changed at once, the Danish chapter list a moment later. The next-chapter opening was fetched in
// that gap under the Danish key with the English title, cached for good, and shown at the end of chapter 1:
// "Master Cherry gives the piece of wood to his friend Geppetto…" over Danish text.
const base = {
  desktopSpread: true, bookId: 'pinocchio', readerEditionKey: 'modern-da',
  nextChapterNumber: 2, nextOpensBibleBook: false,
}

describe('nextOpeningCacheKey', () => {
  it('waits while the chapter list on screen is still the outgoing edition', () => {
    expect(nextOpeningCacheKey({
      ...base, shownEditionKey: 'modern-en',
      nextChapterTitle: 'Master Cherry gives the piece of wood to his friend Geppetto',
    })).toBeNull()
  })

  it('keys the opening once the chapter list is the edition being read', () => {
    expect(nextOpeningCacheKey({
      ...base, shownEditionKey: 'modern-da',
      nextChapterTitle: 'Mester Kirsebær giver træstykket til sin ven Geppetto',
    })).toBe('pinocchio:modern-da:2')
  })

  it('keys the opening when the text on screen names no edition (Bible, a reader’s own book)', () => {
    expect(nextOpeningCacheKey({ ...base, nextChapterTitle: 'Chapter 2' })).toBe('pinocchio:modern-da:2')
  })

  it('has no opening off the spread, at the last chapter, before a Bible book or on a provisional list', () => {
    const title = 'Mester Kirsebær giver træstykket til sin ven Geppetto'
    expect(nextOpeningCacheKey({ ...base, nextChapterTitle: title, desktopSpread: false })).toBeNull()
    expect(nextOpeningCacheKey({ ...base, nextChapterTitle: title, nextChapterNumber: null })).toBeNull()
    expect(nextOpeningCacheKey({ ...base, nextChapterTitle: title, nextOpensBibleBook: true })).toBeNull()
    expect(nextOpeningCacheKey({ ...base, nextChapterTitle: title, chaptersProvisional: true })).toBeNull()
  })
})
