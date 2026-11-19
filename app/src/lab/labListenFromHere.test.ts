import { describe, expect, it } from 'vitest'
import { boxOnScreen, firstSentenceStartOnPage, firstSentenceStartOnScreen, sentenceStartTest, type ScreenWord } from './labListenFromHere'

const paragraphs = [
  'It was dark. The ship lay still in the ice, and we waited.',
  'Nobody spoke. "Come here!" he said. We went.',
  'one long sentence without any stop at all that runs on and on across the whole screen',
]
const starts = sentenceStartTest(paragraphs)

/** Words laid out one per 20 px line from `top`, in reading order. */
function laidOut(top: number): ScreenWord[] {
  const words: ScreenWord[] = []
  let y = top
  paragraphs.forEach((text, paragraphIndex) => text.split(' ').forEach((_, wordIndex) => {
    words.push({ paragraphIndex, wordIndex, top: y, bottom: y + 18 })
    y += 20
  }))
  return words
}

describe('sentenceStartTest', () => {
  it('knows the words that begin a sentence by the voice’s own rule', () => {
    expect(starts(0, 0)).toBe(true)
    expect(starts(0, 3)).toBe(true) // The
    expect(starts(0, 4)).toBe(false)
    expect(starts(1, 2)).toBe(true) // "Come
    // A dialogue tag after a quoted "!" continues the sentence.
    expect(starts(1, 4)).toBe(false) // he
    expect(starts(1, 6)).toBe(true) // We
    expect(starts(9, 0)).toBe(false)
  })
})

describe('firstSentenceStartOnScreen', () => {
  it('takes the first sentence whose first word is below the top bar, never mid-sentence', () => {
    // Paragraph 0's words sit at 0, 20, 40 ...; the view starts at 70 (word 3 "The" sits at 60, word 4 at 80).
    const words = laidOut(0)
    expect(firstSentenceStartOnScreen(words, { top: 70, bottom: 600 }, starts)).toEqual({ paragraphIndex: 1, wordIndex: 0 })
    expect(firstSentenceStartOnScreen(words, { top: 60, bottom: 600 }, starts)).toEqual({ paragraphIndex: 0, wordIndex: 3 })
  })

  it('ignores a word cut by the top bar', () => {
    const words = laidOut(0)
    expect(firstSentenceStartOnScreen(words, { top: 65, bottom: 600 }, starts)).toEqual({ paragraphIndex: 1, wordIndex: 0 })
  })

  it('falls back to the first word on screen when no sentence begins there', () => {
    const words = laidOut(0)
    const firstOfLong = words.findIndex(word => word.paragraphIndex === 2)
    const view = { top: words[firstOfLong + 2].top, bottom: words[firstOfLong + 8].bottom }
    expect(firstSentenceStartOnScreen(words, view, starts)).toEqual({ paragraphIndex: 2, wordIndex: 2 })
  })

  it('names the chapter of the word it picks when the words carry one (book scroll)', () => {
    const own = laidOut(0).map(word => ({ ...word, chapterNumber: 4 }))
    const next = laidOut(own[own.length - 1].bottom + 40).map(word => ({ ...word, chapterNumber: 5 }))
    const seen: Array<number | undefined> = []
    const test = (p: number, w: number, chapter?: number) => { seen.push(chapter); return chapter === 5 && starts(p, w) }
    expect(firstSentenceStartOnScreen([...own, ...next], { top: 0, bottom: 5000 }, test)).toEqual({ paragraphIndex: 0, wordIndex: 0, chapterNumber: 5 })
    expect(seen.includes(4) && seen.includes(5)).toBe(true)
  })

  it('is null with no word on screen', () => {
    expect(firstSentenceStartOnScreen(laidOut(1000), { top: 0, bottom: 500 }, starts)).toBeNull()
  })
})

describe('firstSentenceStartOnPage', () => {
  it('takes the first sentence that begins on the page', () => {
    expect(firstSentenceStartOnPage({ paragraphIndex: 0, from: 1, to: 12 }, starts)).toEqual({ paragraphIndex: 0, wordIndex: 3 })
    expect(firstSentenceStartOnPage({ paragraphIndex: 0, from: 4, to: 12, segments: [{ paragraphIndex: 0, from: 4, to: 12 }, { paragraphIndex: 1, from: 0, to: 8 }] }, starts))
      .toEqual({ paragraphIndex: 1, wordIndex: 0 })
  })

  it('does not count a word whose head the previous page showed', () => {
    expect(firstSentenceStartOnPage({ paragraphIndex: 1, from: 2, to: 8, segments: [{ paragraphIndex: 1, from: 2, to: 8, headBreak: 3 }] }, starts))
      .toEqual({ paragraphIndex: 1, wordIndex: 6 })
  })

  it('falls back to the first word on the page inside one long sentence', () => {
    expect(firstSentenceStartOnPage({ paragraphIndex: 2, from: 5, to: 12 }, starts)).toEqual({ paragraphIndex: 2, wordIndex: 5 })
  })

  it('is null without a page', () => {
    expect(firstSentenceStartOnPage(undefined, starts)).toBeNull()
  })
})

describe('boxOnScreen', () => {
  it('counts any visible part of the box and nothing without size', () => {
    expect(boxOnScreen({ top: 90, bottom: 110, height: 20 }, { top: 100, bottom: 500 })).toBe(true)
    expect(boxOnScreen({ top: 80, bottom: 100, height: 20 }, { top: 100, bottom: 500 })).toBe(false)
    expect(boxOnScreen({ top: 200, bottom: 200, height: 0 }, { top: 100, bottom: 500 })).toBe(false)
  })
})
