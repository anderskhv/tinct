import { isLabVerseMarker, tokenizeHearingWords, type ChapterHearingPage, type ChapterPageSegment } from '../labHearing'

/** A bounded, contiguous slice of one chapter. Coordinates always address the original paragraphs. */
export interface ContinuousReaderWindow {
  page: ChapterHearingPage
  firstParagraph: number
  lastParagraph: number
  wordCount: number
  /** First unread source word; null once the chapter is exhausted. */
  nextAnchor: ContinuousReaderAnchor | null
}

export interface ContinuousReaderAnchor {
  paragraphIndex: number
  wordIndex: number
}

export interface ContinuousReaderLimits {
  maxParagraphs?: number
  maxWords?: number
}

export const CONTINUOUS_WINDOW_PARAGRAPHS = 24
export const CONTINUOUS_WINDOW_WORDS = 900

/**
 * A chapter-sized source stays in memory; only these source-word slices are painted.
 * Starting each following window at nextAnchor traverses every word once, including
 * a paragraph longer than the word budget. Empty source paragraphs retain their
 * place in the segment sequence without claiming a word.
 */
export function continuousReaderWindow(
  paragraphs: readonly string[],
  anchor: ContinuousReaderAnchor,
  limits: ContinuousReaderLimits = {},
): ContinuousReaderWindow | null {
  if (!paragraphs.length || !Number.isInteger(anchor.paragraphIndex) || !Number.isInteger(anchor.wordIndex)
    || anchor.paragraphIndex < 0 || anchor.paragraphIndex >= paragraphs.length || anchor.wordIndex < 0) return null
  const maxParagraphs = limits.maxParagraphs ?? CONTINUOUS_WINDOW_PARAGRAPHS
  const maxWords = limits.maxWords ?? CONTINUOUS_WINDOW_WORDS
  if (!Number.isInteger(maxParagraphs) || maxParagraphs < 1 || !Number.isInteger(maxWords) || maxWords < 1) return null
  const startCount = tokenizeHearingWords(paragraphs[anchor.paragraphIndex]).length
  if (anchor.wordIndex > startCount || (anchor.wordIndex === startCount && startCount > 0)) return null
  const segments: ChapterPageSegment[] = []
  let words = 0
  let nextAnchor: ContinuousReaderAnchor | null = null
  for (let index = anchor.paragraphIndex; index < paragraphs.length && segments.length < maxParagraphs; index++) {
    const tokens = tokenizeHearingWords(paragraphs[index])
    const length = tokens.length
    const from = index === anchor.paragraphIndex ? anchor.wordIndex : 0
    let to = Math.min(length, from + maxWords - words)
    // Keep an inline verse number with its first word. If it cannot fit in this
    // window, the next window resumes at the original marker coordinate.
    if (to < length && isLabVerseMarker(tokens[to - 1]?.text || '')) to--
    if (to === from && from < length) {
      if (!segments.length) return null // A one-word budget cannot paint a marker and its word.
      nextAnchor = { paragraphIndex: index, wordIndex: from }
      break
    }
    segments.push({ paragraphIndex: index, from, to })
    words += to - from
    if (to < length) { nextAnchor = { paragraphIndex: index, wordIndex: to }; break }
    if (words === maxWords || segments.length === maxParagraphs) {
      nextAnchor = index + 1 < paragraphs.length ? { paragraphIndex: index + 1, wordIndex: 0 } : null
      break
    }
  }
  const first = segments[0]
  return {
    page: { paragraphIndex: first.paragraphIndex, from: first.from, to: first.to, segments },
    firstParagraph: first.paragraphIndex,
    lastParagraph: segments[segments.length - 1].paragraphIndex,
    wordCount: words,
    nextAnchor,
  }
}
