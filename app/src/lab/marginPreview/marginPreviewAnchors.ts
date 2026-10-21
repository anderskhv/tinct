/**
 * Anchors between the margin view and the book reader (Phase 1 of docs/margin-port-plan-2026-10-19.md §2).
 *
 * The margin view (public/lab/addbook/js/tinct-book.js) draws a chapter as its heading (the part's name, then the
 * chapter's title) followed by one `<p>` per edition paragraph, the text with `_emphasis_` delimiters taken out and
 * an empty paragraph as one zero-width space. Its places are (page, paragraph, word): page is the 1-based index of
 * the chapter in the edition. Its highlights and card passages are character offsets in the chapter's text
 * (reader.js textOffset: the heading's text, then every paragraph's, with nothing between them).
 *
 * The book reader counts the same paragraphs and the same words (`\S+` after the emphasis delimiters are taken
 * out, tokenizeWithEmphasis), by chapter number. Everything here converts between the two, checked against the
 * text: a place or range outside it is null, never guessed.
 *
 * Pure: no storage, no DOM.
 */
import type { MarginPreviewChapter } from './marginPreviewModel'

/** A place as the margin view keeps it: chapter by its 1-based index in the edition. */
export interface MarginSpot {
  page: number
  para: number
  word: number
}

/** The same place as the book reader keeps it. */
export interface BookAnchor {
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
}

/** A passage as the book reader keeps it (LabHighlightRange): `toWord` is exclusive. */
export interface BookRange {
  chapterNumber: number
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
}

const ZERO_WIDTH_SPACE = '​'

interface ChapterLayout {
  /** Characters of the heading before the first paragraph. */
  head: number
  /** Where each paragraph starts in the chapter's text. */
  starts: number[]
  /** Each paragraph's words, as [start, end) in its own text. */
  words: Array<Array<[number, number]>>
  /** The chapter's text length. */
  length: number
}

const layouts = new WeakMap<MarginPreviewChapter, ChapterLayout>()

/** A paragraph's text as the margin view draws it (tinct-book.js paragraphEl). */
export function drawnParagraphText(text: string): string {
  return text.trim() ? text : ZERO_WIDTH_SPACE
}

function layoutOf(chapter: MarginPreviewChapter): ChapterLayout {
  const cached = layouts.get(chapter)
  if (cached) return cached
  const head = (chapter.section ?? '').length + chapter.title.length
  const starts: number[] = []
  const words: Array<Array<[number, number]>> = []
  let at = head
  for (const paragraph of chapter.paragraphs) {
    starts.push(at)
    const text = paragraph.text || ''
    // The book reader's words; an empty paragraph has none (its zero-width space is not one).
    words.push(text.trim() ? [...text.matchAll(/\S+/g)].map(m => [m.index!, m.index! + m[0].length] as [number, number]) : [])
    at += drawnParagraphText(text).length
  }
  const layout = { head, starts, words, length: at }
  layouts.set(chapter, layout)
  return layout
}

const whole = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0

/** The chapter a margin page is, or null. */
export function chapterOfPage(chapters: MarginPreviewChapter[], page: number): MarginPreviewChapter | null {
  return Number.isInteger(page) && page >= 1 ? chapters[page - 1] ?? null : null
}

/** The margin page of a chapter number, or 0 when the edition has no such chapter. */
export function pageOfChapter(chapters: MarginPreviewChapter[], chapterNumber: number): number {
  return chapters.findIndex(chapter => chapter.number === chapterNumber) + 1
}

/** The words of one paragraph (the book reader's count). */
export function wordCount(chapter: MarginPreviewChapter, paragraphIndex: number): number {
  return layoutOf(chapter).words[paragraphIndex]?.length ?? 0
}

/**
 * A margin place as the book reader's: the same paragraph and word in that chapter. Null outside the text (no such
 * chapter or paragraph); a word past the paragraph's last is its last word.
 */
export function anchorOfSpot(chapters: MarginPreviewChapter[], spot: MarginSpot | null | undefined): BookAnchor | null {
  if (!spot || !whole(spot.para) || !whole(spot.word)) return null
  const chapter = chapterOfPage(chapters, spot.page)
  if (!chapter || spot.para >= chapter.paragraphs.length) return null
  const count = wordCount(chapter, spot.para)
  return { chapterNumber: chapter.number, paragraphIndex: spot.para, wordIndex: Math.min(spot.word, Math.max(0, count - 1)) }
}

/** The book reader's place as the margin's, or null when it is not in this edition's text. */
export function spotOfAnchor(chapters: MarginPreviewChapter[], anchor: BookAnchor | null | undefined): MarginSpot | null {
  if (!anchor || !whole(anchor.paragraphIndex) || !whole(anchor.wordIndex)) return null
  const page = pageOfChapter(chapters, anchor.chapterNumber)
  const chapter = chapterOfPage(chapters, page)
  if (!chapter || anchor.paragraphIndex >= chapter.paragraphs.length) return null
  const count = wordCount(chapter, anchor.paragraphIndex)
  return { page, para: anchor.paragraphIndex, word: Math.min(anchor.wordIndex, Math.max(0, count - 1)) }
}

/** Is `a` before `b` in the book (chapter order, then paragraph, then word)? */
export function spotBefore(a: MarginSpot, b: MarginSpot): boolean {
  if (a.page !== b.page) return a.page < b.page
  if (a.para !== b.para) return a.para < b.para
  return a.word < b.word
}

export function sameSpot(a: MarginSpot | null | undefined, b: MarginSpot | null | undefined): boolean {
  return !!a && !!b && a.page === b.page && a.para === b.para && a.word === b.word
}

/** The paragraph holding character `offset` of the chapter (the heading counts as the first paragraph's). */
function paragraphAt(layout: ChapterLayout, offset: number): number {
  let lo = 0, hi = layout.starts.length - 1
  if (hi < 0) return -1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (layout.starts[mid] <= offset) lo = mid
    else hi = mid - 1
  }
  return lo
}

/**
 * A passage in the margin's character offsets [start, end) as the book reader's words: from the word the passage
 * starts in (or the next one, when it starts between words) to the word it ends in. Null when it holds no word.
 */
export function rangeOfOffsets(chapter: MarginPreviewChapter, start: number, end: number): BookRange | null {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null
  const layout = layoutOf(chapter)
  if (!layout.starts.length) return null
  const from = Math.max(layout.head, Math.min(start, layout.length))
  const to = Math.min(end, layout.length)
  if (to <= from) return null
  // The first word ending after `from`, in its paragraph or a later one.
  let p = paragraphAt(layout, from), fromWord = -1
  for (; p < layout.starts.length; p++) {
    const local = Math.max(0, from - layout.starts[p])
    fromWord = layout.words[p].findIndex(([, e]) => e > local)
    if (fromWord >= 0) break
  }
  // The last word starting before `to`, in its paragraph or an earlier one.
  let q = paragraphAt(layout, to - 1), lastWord = -1
  for (; q >= 0; q--) {
    const local = to - layout.starts[q]
    const words = layout.words[q]
    for (let i = words.length - 1; i >= 0; i--) if (words[i][0] < local) { lastWord = i; break }
    if (lastWord >= 0) break
  }
  if (fromWord < 0 || lastWord < 0 || q < p || (q === p && lastWord < fromWord)) return null
  return { chapterNumber: chapter.number, paragraphIndex: p, fromWord, endParagraphIndex: q, toWord: lastWord + 1 }
}

/** The book reader's words as the margin's character offsets [start, end), whole words; null outside the text. */
export function offsetsOfRange(chapter: MarginPreviewChapter, range: Omit<BookRange, 'chapterNumber'>): { start: number; end: number } | null {
  const layout = layoutOf(chapter)
  const { paragraphIndex: p, fromWord, endParagraphIndex: q, toWord } = range
  if (![p, fromWord, q, toWord].every(whole) || q < p || toWord < 1) return null
  const first = layout.words[p]?.[fromWord], last = layout.words[q]?.[toWord - 1]
  if (!first || !last) return null
  const start = layout.starts[p] + first[0], end = layout.starts[q] + last[1]
  return end > start ? { start, end } : null
}

/** The words of a passage as the book reader quotes them (its text, whitespace collapsed). */
export function rangeText(chapter: MarginPreviewChapter, range: Omit<BookRange, 'chapterNumber'>): string {
  const parts: string[] = []
  for (let p = range.paragraphIndex; p <= range.endParagraphIndex; p++) {
    const text = chapter.paragraphs[p]?.text || ''
    const words = layoutOf(chapter).words[p] || []
    const from = p === range.paragraphIndex ? range.fromWord : 0
    const to = p === range.endParagraphIndex ? range.toWord : words.length
    for (const [a, b] of words.slice(from, to)) parts.push(text.slice(a, b))
  }
  return parts.join(' ')
}

/**
 * A margin note's height (a fraction of its chapter) as the paragraph there, by the chapter's characters: the
 * margin draws a chapter's text top to bottom, so a fraction of its height is close to the same fraction of its
 * text. Used only for notes with no passage, which the margin keeps at a height (TinctMargin.noteBox).
 */
export function paragraphAtFraction(chapter: MarginPreviewChapter, fraction: number): number {
  const layout = layoutOf(chapter)
  if (!layout.starts.length) return 0
  const f = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0))
  return Math.max(0, paragraphAt(layout, Math.floor(f * layout.length)))
}

/** Where a paragraph starts, as a fraction of its chapter: the inverse of paragraphAtFraction (just inside it). */
export function fractionOfParagraph(chapter: MarginPreviewChapter, paragraphIndex: number): number {
  const layout = layoutOf(chapter)
  const start = layout.starts[Math.max(0, Math.min(paragraphIndex, layout.starts.length - 1))] ?? 0
  return layout.length ? Math.min(1, Math.ceil(((start + 0.5) / layout.length) * 1e6) / 1e6) : 0
}
