import { describe, expect, it } from 'vitest'
import { RETAINED_BELLA_ORIGINAL_BOOKS, usesRetainedBella } from './bellaRetention'

describe('Bella whole-edition retention', () => {
  it('retains exactly the verified 35 original female editions', () => {
    expect(RETAINED_BELLA_ORIGINAL_BOOKS.size).toBe(35)
    expect(usesRetainedBella('frankenstein', 'original-en', 'female')).toBe(true)
    expect(usesRetainedBella('candide', 'original-en', 'female')).toBe(true)
    expect(usesRetainedBella('federalist-papers', 'original-en', 'female')).toBe(true)
    expect(usesRetainedBella('pride-and-prejudice', 'original-en', 'female')).toBe(true)
    expect(usesRetainedBella('jekyll-and-hyde', 'original-en', 'female')).toBe(true)
    expect(usesRetainedBella('frankenstein', 'modern-en', 'female')).toBe(false)
    expect(usesRetainedBella('frankenstein', 'original-en', 'male')).toBe(false)
  })

  it('excludes known mismatches, holds and unresolved focused repairs', () => {
    for (const book of [
      'meditations', 'faust-part-1', 'bible', 'the-histories',
      'don-quixote', 'the-awakening', 'beyond-good-and-evil',
      'nicomachean-ethics', 'communist-manifesto',
    ]) {
      expect(usesRetainedBella(book, 'original-en', 'female')).toBe(false)
    }
  })
})
