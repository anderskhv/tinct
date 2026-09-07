import { describe, expect, it } from 'vitest'
import { RECAP_PROMPT_VERSION, recapCacheKey, recapCoverageThrough } from './recapSummary'

describe('recapCoverageThrough', () => {
  it('keeps the exact paragraph for short chapters', () => {
    expect(recapCoverageThrough({ paragraphIndex: 3, paragraphCount: 6, completed: false })).toBe(3)
    expect(recapCoverageThrough({ paragraphIndex: 0, paragraphCount: 6, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 23, paragraphCount: 24, completed: false })).toBe(23)
  })

  it('rounds long chapters DOWN to a five-paragraph bucket, never up', () => {
    expect(recapCoverageThrough({ paragraphIndex: 0, paragraphCount: 60, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 4, paragraphCount: 60, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 5, paragraphCount: 60, completed: false })).toBe(5)
    expect(recapCoverageThrough({ paragraphIndex: 17, paragraphCount: 60, completed: false })).toBe(15)
    expect(recapCoverageThrough({ paragraphIndex: 59, paragraphCount: 60, completed: false })).toBe(55)
  })

  it('covers the whole chapter once finished and clamps out-of-range indexes', () => {
    expect(recapCoverageThrough({ paragraphIndex: 2, paragraphCount: 6, completed: true })).toBe(5)
    expect(recapCoverageThrough({ paragraphIndex: 99, paragraphCount: 6, completed: false })).toBe(5)
    expect(recapCoverageThrough({ paragraphIndex: -1, paragraphCount: 6, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 3, paragraphCount: 0, completed: false })).toBe(0)
  })
})

describe('recapCacheKey', () => {
  const base = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphCount: 6, completed: false }

  it('is stable for one place and carries the prompt version', () => {
    expect(recapCacheKey({ ...base, paragraphIndex: 3 })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/645/645/3`)
  })

  it('shares an entry across nearby positions of a long chapter only', () => {
    const long = { ...base, bookId: 'moby-dick', editionKey: 'original-en', chapterNumber: 1, paragraphCount: 60 }
    expect(recapCacheKey({ ...long, paragraphIndex: 16 })).toBe(recapCacheKey({ ...long, paragraphIndex: 19 }))
    expect(recapCacheKey({ ...long, paragraphIndex: 16 })).not.toBe(recapCacheKey({ ...long, paragraphIndex: 20 }))
    expect(recapCacheKey({ ...base, paragraphIndex: 2 })).not.toBe(recapCacheKey({ ...base, paragraphIndex: 3 }))
  })

  it('separates finished, previous-chapter scope and unknown chapter lengths', () => {
    expect(recapCacheKey({ ...base, paragraphIndex: 5, completed: true })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/645/645/end`)
    expect(recapCacheKey({ ...base, paragraphIndex: 0, chapterNumber: 646, previousChapterNumber: 645 })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/646/645/0`)
    expect(recapCacheKey({ ...base, paragraphIndex: 17, paragraphCount: null })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/645/645/17`)
  })
})
