/**
 * "Listen from here" (Anders approved the mockups, 16 Nov 2026): where the voice goes when the reader has moved away
 * from it. It starts at the first sentence that BEGINS on screen, never mid-sentence; only when no sentence begins
 * on screen (one long sentence fills it) at the first word on screen.
 */
import { chapterPageSegments, listeningSentenceStart, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'

/** The pills wait for the view to rest this long off the voice (LabApp's text reader and the PDF's original pages). */
export const LISTEN_PILLS_SETTLE_MS = 500

export interface ListenPlace { paragraphIndex: number; wordIndex: number; /** Book scroll paints several chapters. */ chapterNumber?: number }

/** A painted word and its box's top and bottom (viewport pixels), in reading order. */
export interface ScreenWord extends ListenPlace { top: number; bottom: number }

/** Whether a word starts a sentence, by the sentence rule the voice resumes with (listeningSentenceStart). */
export type SentenceStartTest = (paragraphIndex: number, wordIndex: number, chapterNumber?: number) => boolean

export function sentenceStartTest(paragraphs: readonly string[]): SentenceStartTest {
  const tokens = new Map<number, Array<{ text: string }>>()
  return (paragraphIndex, wordIndex) => {
    let words = tokens.get(paragraphIndex)
    if (!words) { words = tokenizeHearingWords(paragraphs[paragraphIndex] ?? ''); tokens.set(paragraphIndex, words) }
    if (wordIndex < 0 || wordIndex >= words.length) return false
    return listeningSentenceStart(words, wordIndex) === wordIndex
  }
}

/**
 * The scrolling reader: the first sentence whose first word sits wholly inside the view (below the top bar, above
 * the foot), else the first word on screen. Null when no word is on screen.
 */
export function firstSentenceStartOnScreen(words: readonly ScreenWord[], view: { top: number; bottom: number }, isSentenceStart: SentenceStartTest): ListenPlace | null {
  let first: ListenPlace | null = null
  for (const word of words) {
    if (word.top < view.top - 0.5 || word.top >= view.bottom || word.bottom > view.bottom + 0.5) continue
    const place: ListenPlace = word.chapterNumber == null
      ? { paragraphIndex: word.paragraphIndex, wordIndex: word.wordIndex }
      : { paragraphIndex: word.paragraphIndex, wordIndex: word.wordIndex, chapterNumber: word.chapterNumber }
    first ??= place
    if (isSentenceStart(word.paragraphIndex, word.wordIndex, word.chapterNumber)) return place
  }
  return first
}

/**
 * The paged reader: the first sentence that begins on this page. A word the previous page began (its hyphenated
 * head was shown there, `headBreak`) did not begin here. Null for an empty page.
 */
export function firstSentenceStartOnPage(page: ChapterHearingPage | undefined, isSentenceStart: SentenceStartTest): ListenPlace | null {
  if (!page) return null
  let first: ListenPlace | null = null
  for (const segment of chapterPageSegments(page)) {
    for (let wordIndex = segment.from; wordIndex < segment.to; wordIndex++) {
      if (segment.headBreak != null && wordIndex === segment.from) continue
      const place = { paragraphIndex: segment.paragraphIndex, wordIndex }
      first ??= place
      if (isSentenceStart(segment.paragraphIndex, wordIndex)) return place
    }
  }
  if (first) return first
  const segment = chapterPageSegments(page)[0]
  return segment && segment.to > segment.from ? { paragraphIndex: segment.paragraphIndex, wordIndex: segment.from } : null
}

/** Whether a box is on screen inside the view (any part of it). */
export function boxOnScreen(box: { top: number; bottom: number; height: number }, view: { top: number; bottom: number }): boolean {
  return box.height > 0 && box.bottom > view.top && box.top < view.bottom
}
