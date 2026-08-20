import { describe, expect, it } from 'vitest'
import { shouldPitchFirstSessionAccount } from './firstSession'

describe('shouldPitchFirstSessionAccount', () => {
  it('stays quiet on the library and over the first lines of the book', () => {
    expect(shouldPitchFirstSessionAccount({
      showStore: true,
      showOnboarding: false,
      chapterNumber: 1,
      currentPage: 4,
    })).toBe(false)
    expect(shouldPitchFirstSessionAccount({
      showStore: false,
      showOnboarding: true,
      chapterNumber: 1,
      currentPage: 0,
    })).toBe(false)
    expect(shouldPitchFirstSessionAccount({
      showStore: false,
      showOnboarding: false,
      chapterNumber: 1,
      currentPage: 0,
    })).toBe(false)
  })

  it('allows the existing chapter-progress prompt after they have started', () => {
    expect(shouldPitchFirstSessionAccount({
      showStore: false,
      showOnboarding: false,
      chapterNumber: 1,
      currentPage: 1,
    })).toBe(true)
    expect(shouldPitchFirstSessionAccount({
      showStore: false,
      showOnboarding: false,
      chapterNumber: 2,
      currentPage: 0,
    })).toBe(true)
  })
})
