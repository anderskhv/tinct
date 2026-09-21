import { describe, expect, it } from 'vitest'
import { RETAINED_BELLA_ORIGINAL_BOOKS, usesRetainedBella } from './bellaRetention'

describe('Bella whole-edition retention', () => {
  it('retains exactly the verified 31 original female editions', () => {
    expect(RETAINED_BELLA_ORIGINAL_BOOKS.size).toBe(31)
    expect(usesRetainedBella('frankenstein', 'original-en', 'female')).toBe(true)
    expect(usesRetainedBella('frankenstein', 'modern-en', 'female')).toBe(false)
    expect(usesRetainedBella('frankenstein', 'original-en', 'male')).toBe(false)
  })

  it('excludes known mismatches and the separate repair queue', () => {
    for (const book of ['meditations', 'faust-part-1', 'jekyll-and-hyde', 'bible', 'the-histories']) {
      expect(usesRetainedBella(book, 'original-en', 'female')).toBe(false)
    }
  })
})
