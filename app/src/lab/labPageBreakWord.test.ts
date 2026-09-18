import { describe, expect, it } from 'vitest'
import { PAGE_BREAK_HYPHEN, chapterPagesCover, segmentWordTexts, type ChapterPageSegment } from './labHearing'

const WORDS = ['Great', 'multitudes', 'followed', 'him'].map(text => ({ text, emphasis: false }))
const texts = (segment: ChapterPageSegment) => segmentWordTexts(WORDS, segment).map(word => word.text)

describe('segmentWordTexts', () => {
  it('leaves an ordinary segment exactly as it was', () => {
    expect(texts({ paragraphIndex: 0, from: 0, to: 3 })).toEqual(['Great', 'multitudes', 'followed'])
  })

  it('ends a page with the head of the broken word and a hyphen', () => {
    expect(texts({ paragraphIndex: 0, from: 0, to: 2, tailBreak: 5 }))
      .toEqual(['Great', `multi${PAGE_BREAK_HYPHEN}`])
  })

  it('starts the next page with the remainder, and no hyphen', () => {
    expect(texts({ paragraphIndex: 0, from: 1, to: 4, headBreak: 5 }))
      .toEqual(['tudes', 'followed', 'him'])
  })

  it('uses a real hyphen, not the ASCII minus', () => {
    const [, broken] = texts({ paragraphIndex: 0, from: 0, to: 2, tailBreak: 3 })
    expect(broken.endsWith('‐')).toBe(true)
    expect(broken.includes('-')).toBe(false)
  })

  it('rejoins to the original word across the two pages', () => {
    const tail = texts({ paragraphIndex: 0, from: 0, to: 2, tailBreak: 5 }).at(-1)!
    const head = texts({ paragraphIndex: 0, from: 1, to: 4, headBreak: 5 })[0]
    expect(tail.replace(PAGE_BREAK_HYPHEN, '') + head).toBe('multitudes')
  })

  it('handles a word broken on both sides — a word long enough to span three pages', () => {
    // Both offsets index the ORIGINAL word, so the middle page shows
    // characters 3..7 of "multitudes" and carries the hyphen onward.
    expect(texts({ paragraphIndex: 0, from: 1, to: 2, headBreak: 3, tailBreak: 7 }))
      .toEqual([`titu${PAGE_BREAK_HYPHEN}`])
  })

  it('does not touch an empty slice', () => {
    expect(texts({ paragraphIndex: 0, from: 2, to: 2, tailBreak: 3 })).toEqual([])
  })
})

describe('chapterPagesCover with a broken word', () => {
  const paragraphs = ['Great multitudes followed him']
  const page = (segments: ChapterPageSegment[]) => ({ ...segments[0], segments })

  it('accepts the shared word when both halves declare the break', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 2, tailBreak: 5 }]),
      page([{ paragraphIndex: 0, from: 1, to: 4, headBreak: 5 }]),
    ])).toBe(true)
  })

  it('still accepts an ordinary break between words', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 2 }]),
      page([{ paragraphIndex: 0, from: 2, to: 4 }]),
    ])).toBe(true)
  })

  it('rejects an overlap that does not declare itself, which is a real bug', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 2 }]),
      page([{ paragraphIndex: 0, from: 1, to: 4 }]),
    ])).toBe(false)
  })

  it('rejects a half-declared break, so a paginator bug cannot ship silently', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 2, tailBreak: 5 }]),
      page([{ paragraphIndex: 0, from: 1, to: 4 }]),
    ])).toBe(false)
  })

  it('still rejects a gap, broken word or not', () => {
    expect(chapterPagesCover(paragraphs, [
      page([{ paragraphIndex: 0, from: 0, to: 1, tailBreak: 2 }]),
      page([{ paragraphIndex: 0, from: 2, to: 4, headBreak: 2 }]),
    ])).toBe(false)
  })
})
