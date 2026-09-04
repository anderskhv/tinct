import type { ReadingTextRange } from './types'

export interface WordSpan {
  start: number
  end: number
  text: string
}

/** Same tokenisation as the lab paginator: whitespace-separated words. */
export function wordSpans(text: string): WordSpan[] {
  const spans: WordSpan[] = []
  const re = /\S+/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    spans.push({ start: match.index, end: match.index + match[0].length, text: match[0] })
  }
  return spans
}

export function wordCount(text: string): number {
  return wordSpans(text).length
}

export interface WordPlace {
  paragraphIndex: number
  wordIndex: number
}

export function compareWordPlace(a: WordPlace, b: WordPlace): number {
  if (a.paragraphIndex !== b.paragraphIndex) return a.paragraphIndex - b.paragraphIndex
  return a.wordIndex - b.wordIndex
}

const VERIFY_WORDS = 4

/**
 * Build a coherent text range from word places against the actual chapter
 * paragraphs. Returns null when the places do not resolve to real words, so a
 * caller can never persist a half-formed range.
 */
export function buildTextRange(paragraphs: string[], start: WordPlace, end: WordPlace): ReadingTextRange | null {
  if (paragraphs.length === 0) return null
  if (start.paragraphIndex < 0 || start.paragraphIndex >= paragraphs.length) return null
  if (end.paragraphIndex < 0 || end.paragraphIndex >= paragraphs.length) return null
  if (compareWordPlace(start, end) >= 0) return null
  const startWords = wordSpans(paragraphs[start.paragraphIndex])
  const endWords = wordSpans(paragraphs[end.paragraphIndex])
  const startWordIndex = Math.max(0, Math.min(start.wordIndex, startWords.length - 1))
  const endWordIndex = Math.max(1, Math.min(end.wordIndex, endWords.length))
  const startSpan = startWords[startWordIndex]
  const endSpan = endWords[endWordIndex - 1]
  if (!startSpan || !endSpan) return null
  const firstWords = startWords.slice(startWordIndex, startWordIndex + VERIFY_WORDS).map(w => w.text).join(' ')
  const lastWords = endWords.slice(Math.max(0, endWordIndex - VERIFY_WORDS), endWordIndex).map(w => w.text).join(' ')
  return {
    startParagraphIndex: start.paragraphIndex,
    startWordIndex,
    startCharOffset: startSpan.start,
    endParagraphIndex: end.paragraphIndex,
    endWordIndex,
    endCharOffset: endSpan.end,
    firstWords,
    lastWords,
  }
}

/** Union of two ranges: earliest start, furthest end (re-resolved against text). */
export function unionTextRange(paragraphs: string[], a: ReadingTextRange, b: ReadingTextRange): ReadingTextRange | null {
  const aStart = { paragraphIndex: a.startParagraphIndex, wordIndex: a.startWordIndex }
  const bStart = { paragraphIndex: b.startParagraphIndex, wordIndex: b.startWordIndex }
  const aEnd = { paragraphIndex: a.endParagraphIndex, wordIndex: a.endWordIndex }
  const bEnd = { paragraphIndex: b.endParagraphIndex, wordIndex: b.endWordIndex }
  const start = compareWordPlace(aStart, bStart) <= 0 ? aStart : bStart
  const end = compareWordPlace(aEnd, bEnd) >= 0 ? aEnd : bEnd
  return buildTextRange(paragraphs, start, end)
}

/**
 * Verify that a stored range still points at the text it was recorded
 * against. Editions can be re-split; a mismatch means the excerpt must not be
 * shown as "what you read".
 */
export function textRangeMatches(paragraphs: string[], range: ReadingTextRange): boolean {
  const startText = paragraphs[range.startParagraphIndex]
  const endText = paragraphs[range.endParagraphIndex]
  if (typeof startText !== 'string' || typeof endText !== 'string') return false
  // Word index and character offset must describe the same place.
  const startSpan = wordSpans(startText)[range.startWordIndex]
  const endSpan = wordSpans(endText)[range.endWordIndex - 1]
  if (!startSpan || startSpan.start !== range.startCharOffset) return false
  if (!endSpan || endSpan.end !== range.endCharOffset) return false
  if (!startText.startsWith(range.firstWords, range.startCharOffset)) return false
  const tail = endText.slice(0, range.endCharOffset)
  return tail.endsWith(range.lastWords)
}

/** Exact text of the range, paragraphs joined by a single space. */
export function textOfRange(paragraphs: string[], range: ReadingTextRange): string | null {
  if (!textRangeMatches(paragraphs, range)) return null
  if (range.startParagraphIndex === range.endParagraphIndex) {
    return paragraphs[range.startParagraphIndex].slice(range.startCharOffset, range.endCharOffset)
  }
  const parts: string[] = [paragraphs[range.startParagraphIndex].slice(range.startCharOffset)]
  for (let i = range.startParagraphIndex + 1; i < range.endParagraphIndex; i++) parts.push(paragraphs[i])
  parts.push(paragraphs[range.endParagraphIndex].slice(0, range.endCharOffset))
  return parts.map(part => part.trim()).filter(Boolean).join(' ')
}

/** Strip KJV verse superscripts and collapse whitespace for display. */
export function cleanExcerpt(text: string): string {
  return text.replace(/[¹²³⁰-⁹]+\s?/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * A short exact excerpt from the read range: the opening of the range, cut at
 * a word boundary with an ellipsis when longer than `maxChars`. Never
 * paraphrases; when the range no longer matches the text, returns null.
 */
export function excerptOfRange(paragraphs: string[], range: ReadingTextRange, maxChars = 240): string | null {
  const full = textOfRange(paragraphs, range)
  if (full === null) return null
  const clean = cleanExcerpt(full)
  if (!clean) return null
  if (clean.length <= maxChars) return clean
  const cut = clean.slice(0, maxChars)
  const boundary = cut.lastIndexOf(' ')
  return `${(boundary > maxChars * 0.6 ? cut.slice(0, boundary) : cut).replace(/[,;:\s]+$/, '')}…`
}
