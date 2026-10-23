import { describe, expect, it } from 'vitest'
import { tokenizeHearingWords } from '../labHearing'
import { continuousReaderWindow, type ContinuousReaderWindow } from './continuousReaderWindow'

describe('continuousReaderWindow', () => {
  it('keeps original paragraph and word anchors when the window shifts', () => {
    const paragraphs = Array.from({ length: 40 }, (_, p) => Array.from({ length: 7 }, (_, w) => `p${p}w${w}`).join(' '))
    const before = continuousReaderWindow(paragraphs, { paragraphIndex: 17, wordIndex: 3 }, { maxParagraphs: 5, maxWords: 30 })!
    const after = continuousReaderWindow(paragraphs, { paragraphIndex: 19, wordIndex: 3 }, { maxParagraphs: 5, maxWords: 30 })!
    expect(before.firstParagraph).toBe(17)
    expect(after.firstParagraph).toBe(19)
    for (const [window, anchorParagraph] of [[before, 17], [after, 19]] as const) {
      const segments = window.page.segments!
      expect(segments.map(s => s.paragraphIndex)).toEqual(Array.from({ length: segments.length }, (_, i) => window.firstParagraph + i))
      expect(segments.length).toBeLessThanOrEqual(5)
      expect(window.wordCount).toBeLessThanOrEqual(30)
      expect(segments.find(s => s.paragraphIndex === anchorParagraph)).toEqual({ paragraphIndex: anchorParagraph, from: 3, to: 7 })
      expect(window.page.paragraphIndex).toBe(segments[0].paragraphIndex)
    }
  })

  it('keeps a Bible-sized chapter bounded around its requested source place', () => {
    const paragraphs = Array.from({ length: 1189 }, (_, p) => `⁽${p}⁾ ` + 'In the beginning these words keep their place. '.repeat(5))
    const window = continuousReaderWindow(paragraphs, { paragraphIndex: 817, wordIndex: 9 }, { maxParagraphs: 18, maxWords: 84 })!
    expect(window.page.segments!.length).toBeLessThanOrEqual(18)
    expect(window.wordCount).toBeLessThanOrEqual(84)
    expect(window.firstParagraph).toBe(817)
    expect(window.lastParagraph).toBeLessThan(paragraphs.length - 1)
    const anchor = window.page.segments!.find(s => s.paragraphIndex === 817)!
    expect(anchor.from).toBeLessThanOrEqual(9)
    expect(anchor.to).toBeGreaterThan(9)
  })

  it('covers every word of an exceptionally long paragraph across shifted windows, once per window', () => {
    const paragraphs = [Array.from({ length: 1001 }, (_, i) => `word${i}`).join(' ')]
    const tokens = tokenizeHearingWords(paragraphs[0])
    const visited: number[] = []
    let anchor: { paragraphIndex: number; wordIndex: number } | null = { paragraphIndex: 0, wordIndex: 0 }
    while (anchor) {
      const window: ContinuousReaderWindow = continuousReaderWindow(paragraphs, anchor, { maxWords: 80 })!
      expect(window.wordCount).toBeLessThanOrEqual(80)
      const [segment] = window.page.segments!
      expect(segment.from).toBe(anchor.wordIndex)
      for (let word = segment.from; word < segment.to; word++) {
        expect(tokens[word].text).toBe(`word${word}`)
        visited.push(word)
      }
      anchor = window.nextAnchor
    }
    expect(visited).toEqual(Array.from({ length: 1001 }, (_, i) => i))
  })

  it('continues exactly once across paragraph boundaries and an empty structural paragraph', () => {
    const paragraphs = ['one two three four', '', 'five six seven', 'eight nine ten eleven']
    const visited: string[] = []
    let anchor: { paragraphIndex: number; wordIndex: number } | null = { paragraphIndex: 0, wordIndex: 0 }
    while (anchor) {
      const window: ContinuousReaderWindow = continuousReaderWindow(paragraphs, anchor, { maxParagraphs: 2, maxWords: 3 })!
      expect(window.page.segments!.length).toBeLessThanOrEqual(2)
      expect(window.wordCount).toBeLessThanOrEqual(3)
      for (const segment of window.page.segments!) {
        visited.push(...tokenizeHearingWords(paragraphs[segment.paragraphIndex]).slice(segment.from, segment.to).map(w => w.text))
      }
      anchor = window.nextAnchor
    }
    expect(visited).toEqual('one two three four five six seven eight nine ten eleven'.split(' '))
  })

  it('keeps inline Bible verse markers with their following word while traversing exactly once', () => {
    const paragraphs = ['one ² next three ³ four five', 'six ⁴ seven eight']
    const visited: string[] = []
    let anchor: { paragraphIndex: number; wordIndex: number } | null = { paragraphIndex: 0, wordIndex: 0 }
    while (anchor) {
      const window: ContinuousReaderWindow = continuousReaderWindow(paragraphs, anchor, { maxParagraphs: 2, maxWords: 2 })!
      expect(window.wordCount).toBeLessThanOrEqual(2)
      for (const segment of window.page.segments!) {
        const words = tokenizeHearingWords(paragraphs[segment.paragraphIndex]).slice(segment.from, segment.to).map(w => w.text)
        expect(words[words.length - 1]).not.toMatch(/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/u)
        visited.push(...words)
      }
      anchor = window.nextAnchor
    }
    expect(visited).toEqual(paragraphs.flatMap(text => tokenizeHearingWords(text).map(word => word.text)))
    expect(continuousReaderWindow(['² next'], { paragraphIndex: 0, wordIndex: 0 }, { maxWords: 1 })).toBeNull()
  })

  it('never hands an undefined reading page to the renderer', () => {
    expect(continuousReaderWindow([], { paragraphIndex: 0, wordIndex: 0 })).toBeNull()
    expect(continuousReaderWindow(['one'], { paragraphIndex: NaN, wordIndex: 0 })).toBeNull()
    expect(continuousReaderWindow(['one'], { paragraphIndex: -1, wordIndex: 0 })).toBeNull()
    expect(continuousReaderWindow(['one'], { paragraphIndex: 0, wordIndex: Infinity })).toBeNull()
    expect(continuousReaderWindow(['one'], { paragraphIndex: 0, wordIndex: 2 })).toBeNull()
    expect(continuousReaderWindow(['one'], { paragraphIndex: 0, wordIndex: 0 }, { maxWords: NaN })).toBeNull()
    expect(continuousReaderWindow(['one'], { paragraphIndex: 0, wordIndex: 0 }, { maxParagraphs: -1 })).toBeNull()
    expect(continuousReaderWindow([''], { paragraphIndex: 0, wordIndex: 0 })?.page).toEqual({
      paragraphIndex: 0, from: 0, to: 0, segments: [{ paragraphIndex: 0, from: 0, to: 0 }],
    })
  })
})
