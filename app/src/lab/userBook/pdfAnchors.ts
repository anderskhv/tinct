/**
 * A place in a PDF's Tinct text and the same place on its pages, both ways.
 * Pure: the same rules as `TinctPdfText.pageOf` / `placeOf` in
 * public/lab/addbook/js/pdf-text.js (Add a book's viewer uses that copy; the
 * tests hold the two to each other).
 *
 * Each paragraph of a converted PDF knows the page it starts on
 * (`chapter.pages[i]`) and where it runs onto the next page
 * (`chapter.pageBreaks`: [paragraph, word, page]). A chapter's notes (from
 * `chapter.notes` on) are collected from the pages' feet, so they never stand
 * for a page's text.
 */
import type { UserBookChapter } from './userEdition'

export interface PdfTextPlace { chapterNumber: number; paragraphIndex: number; wordIndex: number }
export interface PdfPagePlace { page: number; frac: number }

type PdfChapter = Pick<UserBookChapter, 'number' | 'paragraphs' | 'pages' | 'pageBreaks' | 'notes'>
interface Span { paragraph: number; word: number; words: number; page: number }

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length
const isNotes = (chapter: PdfChapter, index: number) => Number.isInteger(chapter.notes) && index >= (chapter.notes as number)

/** The words of each paragraph on each page, in reading order. */
function spans(chapter: PdfChapter): Span[] {
  const out: Span[] = []
  chapter.paragraphs.forEach((text, i) => {
    const total = wordCount(text)
    const cuts = (chapter.pageBreaks ?? []).filter(cut => cut[0] === i).sort((a, b) => a[1] - b[1])
    let word = 0
    let page = chapter.pages?.[i] ?? 1
    for (const [, at, next] of cuts) {
      out.push({ paragraph: i, word, words: Math.max(0, at - word), page })
      word = at
      page = next
    }
    out.push({ paragraph: i, word, words: Math.max(0, total - word), page })
  })
  return out
}

/** The page a place in the text is on, and how far down its words: null outside the text or for a book without pages. */
export function pageOfTextPlace(chapters: readonly PdfChapter[], place: PdfTextPlace): PdfPagePlace | null {
  const chapter = chapters.find(item => item.number === place.chapterNumber)
  if (!chapter || !Array.isArray(chapter.pages)) return null
  const list = spans(chapter)
  const word = Math.max(0, place.wordIndex || 0)
  const here = list.filter(span => span.paragraph === place.paragraphIndex)
  const started = here.filter(item => item.word <= word)
  const span = started[started.length - 1] ?? here[0]
  if (!span) return null
  // A note stands at the top of the page it was printed on (it is none of the page's own words).
  if (isNotes(chapter, span.paragraph)) return { page: span.page, frac: 0 }
  const onPage = list.filter(item => item.page === span.page && !isNotes(chapter, item.paragraph))
  const total = onPage.reduce((n, item) => n + item.words, 0)
  let before = 0
  for (const item of onPage) {
    if (item === span) break
    before += item.words
  }
  before += Math.min(span.words, word - span.word)
  return { page: span.page, frac: total > 0 ? Math.round((before / total) * 10000) / 10000 : 0 }
}

/**
 * The place in the text at a page and how far down it: among the words that
 * start on that page (a paragraph running on from the page before first), the
 * word `frac` of the way through. A page with no text of its own (a figure, a
 * blank) gives the text just before it; a page before any text, the first word.
 */
export function textPlaceOfPage(chapters: readonly PdfChapter[], page: number, frac = 0): PdfTextPlace | null {
  const withPages = chapters.filter(chapter => Array.isArray(chapter.pages))
  let before: PdfTextPlace | null = null
  for (const chapter of withPages) {
    const list = spans(chapter).filter(span => !isNotes(chapter, span.paragraph))
    const onPage = list.filter(span => span.page === page && span.words > 0)
    if (onPage.length) {
      const total = onPage.reduce((n, span) => n + span.words, 0)
      let target = Math.min(total - 1, Math.max(0, Math.round((frac || 0) * total)))
      for (const span of onPage) {
        if (target < span.words) return { chapterNumber: chapter.number, paragraphIndex: span.paragraph, wordIndex: span.word + target }
        target -= span.words
      }
    }
    for (const span of list) if (span.page < page && span.words > 0) before = { chapterNumber: chapter.number, paragraphIndex: span.paragraph, wordIndex: span.word }
  }
  if (before) return before
  const first = withPages[0]
  return first ? { chapterNumber: first.number, paragraphIndex: 0, wordIndex: 0 } : null
}
