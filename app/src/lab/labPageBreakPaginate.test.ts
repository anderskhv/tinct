import { describe, expect, it } from 'vitest'
import { measuredDesktopPages, type WordBreakLookup } from './LabDesktopPaginator'
import { chapterPageSegments, segmentWordTexts, type ChapterPageSegment } from './labHearing'

const WORDS = 'Jesus perceiving that withdrew from there Great multitudes followed him'.split(' ')
  .map(text => ({ text, emphasis: false }))

/**
 * A page holds CAPACITY characters of rendered text. Crude, but it is the one
 * property that matters here: a page that still has room takes more, and a
 * hyphenated head is shorter than the whole word.
 */
const CAPACITY = 24

function fitsWithin(capacity: number) {
  return (segments: ChapterPageSegment[]) => {
    const chars = segments.reduce((sum, segment) => (
      sum + segmentWordTexts(WORDS, segment).reduce((n, word) => n + word.text.length, 0)
    ), 0)
    return chars <= capacity
  }
}

/**
 * Any word long enough may break after 3 or 5 characters. General on purpose:
 * which word lands on a page edge is the paginator's business, not the test's.
 */
const breaks: WordBreakLookup = (_paragraph, wordIndex) => (
  (WORDS[wordIndex]?.text.length ?? 0) >= 8 ? [3, 5] : []
)

describe('measuredDesktopPages with word breaks', () => {
  it('breaks only between words when no lookup is supplied', () => {
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(CAPACITY))
    for (const page of pages) {
      for (const segment of chapterPageSegments(page)) {
        expect(segment.tailFragment).toBeUndefined()
        expect(segment.headBreak).toBeUndefined()
      }
    }
  })

  it('fills the last line with as much of the next word as fits', () => {
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(CAPACITY), breaks)
    const first = chapterPageSegments(pages[0])[0]
    const second = chapterPageSegments(pages[1])[0]
    expect(first.tailFragment).toBeDefined()
    expect(second.headBreak).toBe(first.tailFragment)
    // Ranges stay strictly adjacent: the broken word belongs to the next page
    // alone, so every word still resolves to exactly one page.
    expect(first.to).toBe(second.from)
  })

  it('prefers the longest break that still fits, so the line is filled', () => {
    // Two words and a page with room for "aaaa multi-" but not the whole of
    // "multitudes": it must take "multi-", never settle for "mul-".
    const pair = [{ text: 'aaaa', emphasis: false }, { text: 'multitudes', emphasis: false }]
    const fitsPair = (segments: ChapterPageSegment[]) => segments.reduce((sum, segment) => (
      sum + segmentWordTexts(pair, segment).reduce((n, word) => n + word.text.length, 0)
    ), 0) <= 10
    const pages = measuredDesktopPages([pair.length], fitsPair, () => [3, 5])
    const first = chapterPageSegments(pages[0])[0]
    expect(first.tailFragment).toBe(5)
  })

  it('loses no text: owned words still spell the paragraph', () => {
    // Ranges are adjacent and cover, so the OWNED words alone are the source —
    // the display fragments are extra ink, not extra text.
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(CAPACITY), breaks)
    const owned = pages
      .flatMap(page => chapterPageSegments(page))
      .flatMap(segment => WORDS.slice(segment.from, segment.to).map(word => word.text))
    expect(owned).toEqual(WORDS.map(word => word.text))
  })

  it('every page-edge break reconstructs its word exactly once on screen', () => {
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(CAPACITY), breaks)
    const segments = pages.flatMap(page => chapterPageSegments(page))
    let checked = 0
    for (let i = 0; i < segments.length - 1; i += 1) {
      if (segments[i].tailFragment == null) continue
      checked += 1
      const drawn = segmentWordTexts(WORDS, segments[i])
      const shownBefore = drawn[drawn.length - 1].text
      const shownAfter = segmentWordTexts(WORDS, segments[i + 1])[0].text
      expect(shownBefore + shownAfter).toBe(WORDS[segments[i].to].text)
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('makes progress on every paragraph, however tight the page', () => {
    // A capacity too small for even one word must not spin forever.
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(1), breaks)
    expect(pages.length).toBeGreaterThan(0)
    expect(pages.length).toBeLessThanOrEqual(WORDS.length + 1)
  })
})
