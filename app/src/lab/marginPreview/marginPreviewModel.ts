/**
 * A registered book as the margin reader's text (public/lab/addbook/js/tinct-book.js).
 *
 * The margin reader reads an EPUB as chapters of block paragraphs; a Tinct
 * edition is chapters of paragraph strings. Each edition paragraph becomes one
 * paragraph there, in order, so a place carries over 1:1: chapter number,
 * paragraph index and word index (the reader's `\S+` words after the
 * `_emphasis_` delimiters are taken out, emphasisText.ts) mean the same in
 * both. That is also the anchor plan for the port: a margin highlight or card
 * anchored at (chapter, paragraph, word) is a book-reader anchor.
 *
 * Pure: no storage, no network.
 */
import { stripUnderscoreEmphasis } from '../emphasisText'
import { editionHold } from '../../data/editionAvailability'
import { defaultCompareEditionKey, defaultPrimaryEditionKey } from '../../data/editionDefaults'
import type { LabBookPlace } from '../labPosition'
import { labDesktopDefaultFontSize, labFontFamilyCss, labLineHeight, labMarginScale, labParagraphGap, labReadingFont, labReadingFontSize, type LabPrefs } from '../labPrefs'
import type { Book, EditionData } from '../../types'

export interface MarginPreviewParagraph {
  /** The paragraph as shown: the edition's text with `_emphasis_` delimiters taken out. */
  text: string
  /** Emphasised character ranges of `text`, [start, end). */
  em?: Array<[number, number]>
}

export interface MarginPreviewChapter {
  number: number
  title: string
  /** The part the chapter belongs to ("Part I — The Window"), when the edition has parts. */
  section?: string
  paragraphs: MarginPreviewParagraph[]
  /**
   * The Bible (marginPreviewBible.ts): its text is not loaded yet (`paragraphs` is empty). A chapter is loaded on
   * demand and then replaced in the book's list by its loaded copy; nothing is read from or written to a pending one.
   */
  pending?: true
  /** The paragraphs the edition's manifest counts for a pending chapter. */
  paragraphCount?: number
}

/** A pending chapter (MarginPreviewChapter.pending): its text is still to be loaded. */
export const isPendingChapter = (chapter: MarginPreviewChapter | null | undefined): boolean => !!chapter?.pending

/**
 * A book whose chapters load on demand (the Bible, marginPreviewBible.ts): the chapter being read and its
 * neighbours, never the whole book. Same-origin: the frame (js/tinct-book.js) calls it directly.
 */
export interface MarginPreviewLazy {
  /** Loads these chapters (by number) into the book's chapter list. -> the numbers loaded now or before */
  load(numbers: number[]): Promise<number[]>
  /** The pages (1-based, inclusive) of the part a page belongs to (a biblical book): Catch me up stays inside it. */
  scope(page: number): { from: number; to: number }
  /** Called with the chapter numbers just loaded. -> stop listening */
  subscribe(listener: (numbers: number[]) => void): () => void
}

/** Where the preview opens when it has no newer place of its own: the book reader's place, read only. */
export interface MarginPreviewStart {
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
  /** When the book reader saved that place (0: no place; the book's start). */
  updatedAt: number
}

export interface MarginPreviewBook {
  bookId: string
  editionKey: string
  editionLabel: string
  title: string
  author: string
  language: string
  chapters: MarginPreviewChapter[]
  start: MarginPreviewStart
  /** The book reader for the same book, with the preview turned off. */
  normalHref: string
  /** Chapters loaded on demand (the Bible); absent for a book loaded whole. */
  lazy?: MarginPreviewLazy
}

/** The book reader for this book, the opt-in turned off (marginPreviewFlag.ts). */
export function normalReaderHref(bookId: string): string {
  return `/reader?book=${encodeURIComponent(bookId)}&margin=0`
}

/**
 * Registered, readable books only, never a reader's own book. The Bible opens on the desktop only (Anders, 22 Oct
 * 2026: its chapters load on demand, marginPreviewBible.ts); a phone keeps the Bible's own reader.
 */
export function isMarginPreviewBook(book: Book | undefined, opts: { phone?: boolean } = {}): book is Book {
  if (!book || book.localOnly || (book.id === 'bible' && opts.phone)) return false
  return book.editions.some(edition => !editionHold(book.id, edition.key))
}

/**
 * The main edition, as the book reader opens it (option B, 2026-10-14: the
 * main edition, never the compare one): the edition the book's saved place was
 * read in, else the reader's chosen main edition when this book has it, else
 * the book's default (Modern English). Held editions are skipped.
 */
export function marginPreviewEditionKey(book: Book, opts: { placeEdition?: string; prefsEdition?: string } = {}): string | undefined {
  const usable = (key: string | undefined) => key && book.editions.some(edition => edition.key === key) && !editionHold(book.id, key) ? key : undefined
  return usable(opts.placeEdition) ?? usable(opts.prefsEdition) ?? defaultPrimaryEditionKey(book.id, book.editions)
}

export function marginPreviewParagraph(raw: unknown): MarginPreviewParagraph {
  const { text, ranges } = stripUnderscoreEmphasis(typeof raw === 'string' ? raw : '')
  return ranges.length ? { text, em: ranges.map(([a, b]) => [a, b] as [number, number]) } : { text }
}

export function marginPreviewChapters(data: EditionData): MarginPreviewChapter[] {
  const sectionOf = new Map<number, string>()
  for (const section of data.sections ?? []) for (const n of section.chapters ?? []) sectionOf.set(Number(n), section.title)
  return data.chapters
    .filter(chapter => Array.isArray(chapter.paragraphs))
    .map((chapter, i) => {
      const number = Number(chapter.number) || i + 1
      const section = (chapter as { section?: string }).section || sectionOf.get(number)
      return {
        number,
        title: String(chapter.title || `Chapter ${number}`).replace(/\s+/g, ' ').trim(),
        ...(section ? { section } : {}),
        paragraphs: chapter.paragraphs.map(marginPreviewParagraph),
      }
    })
}

/** The newer of two places (by when they were saved), either may be missing. */
export function newerPlace(a: LabBookPlace | null | undefined, b: LabBookPlace | null | undefined): LabBookPlace | null {
  if (!a) return b ?? null
  if (!b) return a
  return b.updatedAt > a.updatedAt || (b.updatedAt === a.updatedAt && b.rev > a.rev) ? b : a
}

const words = (text: string) => text.match(/\S+/g)?.length ?? 0

/**
 * The book reader's place as a place in the preview's text: the same chapter,
 * paragraph and word, checked against the text (a place outside it falls back
 * to its chapter's start, then the book's). A place read in another edition
 * keeps its paragraph only when that edition aligns paragraph by paragraph,
 * and its word is not carried over.
 */
export function marginPreviewStart(place: LabBookPlace | null, chapters: MarginPreviewChapter[], opts: { editionKey: string; aligned: (key: string) => boolean; sequential?: boolean }): MarginPreviewStart {
  const first = chapters[0]?.number ?? 1
  if (!place) return { chapterNumber: first, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 }
  // The Bible's places name a biblical book's chapter (Psalms 23); its chapter list counts them through (Psalms 23 = 501).
  const number = opts.sequential ? place.sequentialChapter : place.chapterNumber
  const chapter = chapters.find(c => c.number === number)
  if (!chapter) return { chapterNumber: first, paragraphIndex: 0, wordIndex: 0, updatedAt: place.updatedAt }
  const sameEdition = !place.primaryEditionKey || place.primaryEditionKey === opts.editionKey
  const carries = sameEdition || (opts.aligned(place.primaryEditionKey!) && opts.aligned(opts.editionKey))
  const paragraph = carries ? place.paragraphIndex : 0
  // A pending chapter is checked against its manifest's count; its word, once its text has loaded (anchorOfSpot).
  if (chapter.pending) {
    const ok = paragraph >= 0 && paragraph < (chapter.paragraphCount ?? 0)
    return { chapterNumber: chapter.number, paragraphIndex: ok ? paragraph : 0, wordIndex: ok && sameEdition ? Math.max(0, place.wordIndex) : 0, updatedAt: place.updatedAt }
  }
  if (paragraph < 0 || paragraph >= chapter.paragraphs.length) return { chapterNumber: chapter.number, paragraphIndex: 0, wordIndex: 0, updatedAt: place.updatedAt }
  const count = words(chapter.paragraphs[paragraph].text)
  const word = sameEdition ? Math.max(0, Math.min(place.wordIndex, Math.max(0, count - 1))) : 0
  return { chapterNumber: chapter.number, paragraphIndex: paragraph, wordIndex: word, updatedAt: place.updatedAt }
}

/**
 * The desktop margin view's paper (Anders, 20 Oct 2026: "Tinct paper"): the text exactly as the book reader's
 * desktop leaf sets it for this reader and window. Font, size, line, paragraph gap, alignment and the leaf's
 * measure, from the same preferences and formulas (lab.css `[data-desktop-paging]`: the leaf's text is
 * 1.42rem × size / 1.3, the heading 1.58rem; two leaves share the page area, 31px in from each side and
 * padded by clamp(28px, 3vw, 64px) × Margins, with a 56px gutter between them). Colours follow the shared theme.
 */
export interface MarginPreviewPaper {
  fontFamily: string
  /** px */
  fontSize: number
  /** px: the chapter heading. */
  headingSize: number
  lineHeight: number
  /** em */
  paragraphGap: number
  align: 'left' | 'justify'
  /** px: one leaf's text width. */
  measure: number
}

const ROOT_PX = 16
/** The page area's inset from each side of the window, its border included (lab.css .lab-page-wrap, .lab-passage). */
const LEAF_AREA_INSET = 31
const LEAF_GUTTER = 56

export function marginPreviewPaper(prefs: LabPrefs, viewportWidth: number, opts: { shakespeare?: boolean } = {}): MarginPreviewPaper {
  const size = labReadingFontSize(prefs, 'desktop', labDesktopDefaultFontSize(viewportWidth))
  const scale = labMarginScale(prefs.margins)
  const padX = Math.min(64, Math.max(28, viewportWidth * 0.03)) * scale
  const align = prefs.alignmentExplicit === false ? (opts.shakespeare ? 'left' : 'justify') : prefs.alignment
  return {
    fontFamily: labFontFamilyCss(labReadingFont(prefs.fontFamily)),
    fontSize: ROOT_PX * 1.42 * size / 1.3,
    headingSize: ROOT_PX * 1.58 * size / 1.3,
    lineHeight: labLineHeight(prefs.lineSpacing),
    paragraphGap: labParagraphGap(prefs.paragraphSpacing),
    align,
    measure: Math.max(280, (viewportWidth - 2 * LEAF_AREA_INSET - 2 * padX - LEAF_GUTTER) / 2),
  }
}

/** The two layouts of the book reader the preview hands over to (Anders, 20 Oct 2026). */
export type MarginPreviewView = 'two-page' | 'compare'
export const MARGIN_PREVIEW_VIEWS: readonly MarginPreviewView[] = ['two-page', 'compare']

/** A place in a book's edition: chapter number, paragraph index and word index, as both readers count them. */
export interface MarginPreviewPlace {
  editionKey: string
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
}

const whole = (n: number) => Math.max(0, Math.floor(Number(n) || 0))
const placeParams = (place: MarginPreviewPlace) =>
  `&edition=${encodeURIComponent(place.editionKey)}&chapter=${Math.max(1, whole(place.chapterNumber))}&paragraph=${whole(place.paragraphIndex)}&word=${whole(place.wordIndex)}`

/**
 * Two-page or Compare from the preview: the book reader's deep link to the same place (labReaderHandoff
 * readerHandoffFromUrlParams), with `view` naming the layout and `compare` the reader's compare edition. The
 * link's `chapter` keeps the book reader for this one visit, and the opt-in is left alone (marginPreviewFlag).
 */
export function marginPreviewLayoutHref(bookId: string, view: MarginPreviewView, place: MarginPreviewPlace, compareEditionKey?: string | null): string {
  const compare = compareEditionKey && compareEditionKey !== place.editionKey ? `&compare=${encodeURIComponent(compareEditionKey)}` : ''
  return `/reader?book=${encodeURIComponent(bookId)}${placeParams(place)}${compare}&view=${view}`
}

/** Margin from the book reader: the preview at the same place (marginPreviewFlag reads it once, then drops it from the address). */
export function marginPreviewReturnHref(bookId: string, place: MarginPreviewPlace): string {
  return `/reader?book=${encodeURIComponent(bookId)}&margin=1${placeParams(place)}`
}

/** The compare edition the book reader would show beside `editionKey`, from its preferences, or its default pair. */
export function marginPreviewCompareEdition(book: Book, prefs: Pick<LabPrefs, 'compareOpen' | 'compareEdition'>, editionKey: string): string | undefined {
  const usable = (key: string | undefined) => key && key !== editionKey && book.editions.some(edition => edition.key === key) && !editionHold(book.id, key) ? key : undefined
  return (prefs.compareOpen ? usable(prefs.compareEdition) : undefined) ?? usable(defaultCompareEditionKey(book.id, book.editions, editionKey, book.year))
}
