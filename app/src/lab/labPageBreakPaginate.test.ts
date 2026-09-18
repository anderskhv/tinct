import { describe, expect, it } from 'vitest'
import { measuredDesktopPages, type WordBreakLookup } from './LabDesktopPaginator'
import { segmentWordTexts, type ChapterPageSegment } from './labHearing'

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
      for (const segment of page.segments ?? [page]) {
        expect(segment.tailBreak).toBeUndefined()
        expect(segment.headBreak).toBeUndefined()
      }
    }
  })

  it('fills the last line with as much of the next word as fits', () => {
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(CAPACITY), breaks)
    const first = (pages[0].segments ?? [pages[0]])[0]
    const second = (pages[1].segments ?? [pages[1]])[0]
    expect(first.tailBreak).toBeDefined()
    expect(second.headBreak).toBe(first.tailBreak)
    // The broken word is the last of one page and the first of the next.
    expect(first.to).toBe(second.from + 1)
  })

  it('prefers the longest break that still fits, so the line is filled', () => {
    // Two words and a page with room for "aaaa multi-" but not the whole of
    // "multitudes": it must take "multi-", never settle for "mul-".
    const pair = [{ text: 'aaaa', emphasis: false }, { text: 'multitudes', emphasis: false }]
    const fitsPair = (segments: ChapterPageSegment[]) => segments.reduce((sum, segment) => (
      sum + segmentWordTexts(pair, segment).reduce((n, word) => n + word.text.length, 0)
    ), 0) <= 10
    const pages = measuredDesktopPages([pair.length], fitsPair, () => [3, 5])
    const first = (pages[0].segments ?? [pages[0]])[0]
    expect(first.tailBreak).toBe(5)
  })

  it('loses no text: the pages still spell the paragraph', () => {
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(CAPACITY), breaks)
    const rendered = pages
      .flatMap(page => page.segments ?? [page])
      .flatMap(segment => segmentWordTexts(WORDS, segment).map(word => word.text))
      .join(' ')
      .replace(/‐ /g, '')
    expect(rendered).toBe(WORDS.map(word => word.text).join(' '))
  })

  it('makes progress on every paragraph, however tight the page', () => {
    // A capacity too small for even one word must not spin forever.
    const pages = measuredDesktopPages([WORDS.length], fitsWithin(1), breaks)
    expect(pages.length).toBeGreaterThan(0)
    expect(pages.length).toBeLessThanOrEqual(WORDS.length + 1)
  })
})
