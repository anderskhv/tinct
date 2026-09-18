import { describe, expect, it } from 'vitest'
import {
  chapterPagesCover,
  pageBreakPairIsSound,
  segmentWordTexts,
  tokenizeHearingWords,
  type ChapterPageSegment,
} from './labHearing'

const SOURCE = 'Great multitudes followed him'
const WORDS = tokenizeHearingWords(SOURCE)
const texts = (segment: ChapterPageSegment) => segmentWordTexts(WORDS, segment).map(word => word.text)
const flags = (segment: ChapterPageSegment) => segmentWordTexts(WORDS, segment).map(word => !!word.fragment)

describe('segmentWordTexts', () => {
  it('leaves an ordinary segment exactly as it was', () => {
    expect(texts({ paragraphIndex: 0, from: 0, to: 3 })).toEqual(['Great', 'multitudes', 'followed'])
    expect(flags({ paragraphIndex: 0, from: 0, to: 3 })).toEqual([false, false, false])
  })

  it('appends the next page’s word opening as a marked fragment', () => {
    const segment: ChapterPageSegment = { paragraphIndex: 0, from: 0, to: 1, tailFragment: 5 }
    expect(texts(segment)).toEqual(['Great', 'multi'])
    // The fragment is the only marked word, and it is last.
    expect(flags(segment)).toEqual([false, true])
  })

  it('does not extend the segment’s range: the broken word belongs to the next page', () => {
    const segment: ChapterPageSegment = { paragraphIndex: 0, from: 0, to: 1, tailFragment: 5 }
    // `to` is still 1 — one owned word — even though two are drawn.
    expect(segment.to).toBe(1)
    expect(segmentWordTexts(WORDS, segment).filter(word => !word.fragment)).toHaveLength(1)
  })

  it('carries no hyphen in its text: the hyphen is CSS, so it cannot be copied', () => {
    const drawn = texts({ paragraphIndex: 0, from: 0, to: 1, tailFragment: 5 }).join('')
    expect(drawn).not.toMatch(/[-‐‑]/)
  })

  it('resumes the broken word on the next page, with no letter repeated or lost', () => {
    const tail: ChapterPageSegment = { paragraphIndex: 0, from: 0, to: 1, tailFragment: 5 }
    const head: ChapterPageSegment = { paragraphIndex: 0, from: 1, to: 4, headBreak: 5 }
    const tailTexts = texts(tail)
    const shown = tailTexts[tailTexts.length - 1] + texts(head)[0]
    expect(shown).toBe('multitudes')
  })

  it('ignores a fragment with no word after it', () => {
    expect(texts({ paragraphIndex: 0, from: 0, to: 4, tailFragment: 3 })).toEqual(WORDS.map(w => w.text))
  })

  it('does not touch an empty slice', () => {
    expect(texts({ paragraphIndex: 0, from: 2, to: 2 })).toEqual([])
  })
})

describe('pageBreakPairIsSound', () => {
  const before = (tailFragment?: number): ChapterPageSegment => ({ paragraphIndex: 0, from: 0, to: 1, ...(tailFragment != null ? { tailFragment } : {}) })
  const after = (headBreak?: number): ChapterPageSegment => ({ paragraphIndex: 0, from: 1, to: 4, ...(headBreak != null ? { headBreak } : {}) })

  it('accepts a plain break between words', () => {
    expect(pageBreakPairIsSound(before(), after(), WORDS)).toBe(true)
  })

  it('accepts halves that reconstruct the word exactly once', () => {
    expect(pageBreakPairIsSound(before(5), after(5), WORDS)).toBe(true)
  })

  it('rejects mismatched offsets that would DUPLICATE letters', () => {
    // "multi" + "titudes" — the reader sees "ti" twice.
    expect(pageBreakPairIsSound(before(5), after(3), WORDS)).toBe(false)
  })

  it('rejects mismatched offsets that would DROP letters', () => {
    // "mul" + "tudes" — "ti" is gone from the book.
    expect(pageBreakPairIsSound(before(3), after(5), WORDS)).toBe(false)
  })

  it('rejects a fragment with no resuming half', () => {
    expect(pageBreakPairIsSound(before(5), after(), WORDS)).toBe(false)
  })

  it('rejects a resuming half with no fragment', () => {
    expect(pageBreakPairIsSound(before(), after(5), WORDS)).toBe(false)
  })

  it.each([
    ['at the very start of the word', 0],
    ['past the end of the word', 99],
    ['at the exact end, leaving nothing to resume', 10],
    ['negative', -2],
    ['fractional', 2.5],
  ])('rejects an offset %s', (_label, offset) => {
    expect(pageBreakPairIsSound(before(offset), after(offset), WORDS)).toBe(false)
  })

  it('rejects a break pointing past the end of the paragraph', () => {
    const last: ChapterPageSegment = { paragraphIndex: 0, from: 3, to: 4, tailFragment: 2 }
    expect(pageBreakPairIsSound(last, { paragraphIndex: 0, from: 4, to: 4, headBreak: 2 }, WORDS)).toBe(false)
  })
})

describe('chapterPagesCover', () => {
  const paragraphs = [SOURCE]
  const page = (segments: ChapterPageSegment[]) => ({ ...segments[0], segments })

  it('accepts a sound page-edge break', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 1, tailFragment: 5 }]),
      page([{ paragraphIndex: 0, from: 1, to: 4, headBreak: 5 }]),
    ])).toBe(true)
  })

  it('still accepts ordinary pagination', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 2 }]),
      page([{ paragraphIndex: 0, from: 2, to: 4 }]),
    ])).toBe(true)
  })

  it('rejects a layout whose halves disagree, rather than shipping mangled text', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 1, tailFragment: 5 }]),
      page([{ paragraphIndex: 0, from: 1, to: 4, headBreak: 3 }]),
    ])).toBe(false)
  })

  it('rejects a fragment on the last segment of a paragraph', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 2 }]),
      page([{ paragraphIndex: 0, from: 2, to: 4, tailFragment: 2 }]),
    ])).toBe(false)
  })

  it('rejects a paragraph whose first segment claims to resume something', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 4, headBreak: 2 }]),
    ])).toBe(false)
  })

  it('still rejects an overlap, which a page-edge break never creates', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 2 }]),
      page([{ paragraphIndex: 0, from: 1, to: 4 }]),
    ])).toBe(false)
  })

  it('still rejects a gap', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 1 }]),
      page([{ paragraphIndex: 0, from: 2, to: 4 }]),
    ])).toBe(false)
  })
})
