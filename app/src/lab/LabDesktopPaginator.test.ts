import { describe, expect, it } from 'vitest'
import { comparisonSegment, measuredDesktopPages } from './LabDesktopPaginator'
import { chapterPageSegments } from './labHearing'

describe('measured desktop leaves', () => {
  it('fills leaves without gaps or repeated words, including long paragraph splits', () => {
    const pages = measuredDesktopPages([13, 70, 4, 16], (segments, first) => segments.reduce((n, s) => n + s.to - s.from, 0) <= (first ? 20 : 30))
    const actual = pages.flatMap(p => chapterPageSegments(p).flatMap(s => Array.from({ length: s.to - s.from }, (_, i) => `${s.paragraphIndex}:${s.from + i}`)))
    expect(actual).toEqual([13, 70, 4, 16].flatMap((n, p) => Array.from({ length: n }, (_, w) => `${p}:${w}`)))
    expect(pages.map(p => chapterPageSegments(p).reduce((n, s) => n + s.to - s.from, 0))).toEqual([20, 30, 30, 23])
  })
  it('preserves every comparison word when the translation is much longer', () => {
    const primary = ['a b c d e'], target = ['one two three four five six seven eight nine ten eleven twelve']
    const segments = [{ paragraphIndex: 0, from: 0, to: 2 }, { paragraphIndex: 0, from: 2, to: 4 }, { paragraphIndex: 0, from: 4, to: 5 }]
    expect(segments.map(s => comparisonSegment(s, primary, target))).toEqual([
      { paragraphIndex: 0, from: 0, to: 4 }, { paragraphIndex: 0, from: 4, to: 9 }, { paragraphIndex: 0, from: 9, to: 12 },
    ])
  })
})

describe('stray last lines', () => {
  it('never opens a page with only the last word or two of a paragraph', () => {
    const text = Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ')
    const fits = (segments: { from: number; to: number }[]) => segments.reduce((n, s) => n + s.to - s.from, 0) <= 28
    const pages = measuredDesktopPages([30], fits, undefined, Infinity, [text])
    expect(pages.map(p => chapterPageSegments(p).map(s => [s.from, s.to]))).toEqual([[[0, 26]], [[26, 30]]])
  })
})

describe('stray last lines carry their sentence', () => {
  it('moves the break back to the start of the closing sentence when it is near', () => {
    // "... him. And Tobiah sent letters to intimidate me." — 30 words, the last sentence 7.
    const words = Array.from({ length: 23 }, (_, i) => `w${i}`)
    words[22] = 'him.'
    const text = [...words, 'And', 'Tobiah', 'sent', 'letters', 'to', 'intimidate', 'me.'].join(' ')
    const fits = (segments: { from: number; to: number }[]) => segments.reduce((n, s) => n + s.to - s.from, 0) <= 27
    const pages = measuredDesktopPages([30], fits, undefined, Infinity, [text])
    expect(pages.map(p => chapterPageSegments(p).map(s => [s.from, s.to]))).toEqual([[[0, 23]], [[23, 30]]])
  })
})
