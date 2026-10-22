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
import type { Book, Chapter, EditionData, ParagraphKind } from '../../types'

/**
 * A picture standing in the text (types ChapterFigure), as the margin view draws it: the image, then its caption
 * (tinct-book.js figureEl). Built-in editions only, so `src` is a same-origin path (labFigures.ts holdFigureUrl).
 */
export interface MarginPreviewFigure {
  id: string
  number: number
  /** Same-origin image path, or '' when there is nothing to draw (the caption stands alone). */
  src: string
  alt?: string
  width?: number
  height?: number
  /** A map or plate: drawn no taller than the window. */
  large?: boolean
}

export interface MarginPreviewParagraph {
  /**
   * The paragraph as shown: the edition's text with `_emphasis_` delimiters taken out. A figure's is its caption
   * ('' without one), the words the margin view draws under the picture.
   */
  text: string
  /** Emphasised character ranges of `text`, [start, end). */
  em?: Array<[number, number]>
  /** What the paragraph is beyond prose (a subheading, a list item, a line set apart), as the book reader paints it. */
  kind?: ParagraphKind
  /**
   * A figure (its edition text is `\uFFFC` + id, labFigures.ts): one item at its own paragraph index, one word as the
   * book reader counts it (marginPreviewAnchors), so places and highlights around it keep their indices.
   */
  figure?: MarginPreviewFigure
}

export interface MarginPreviewChapter {
  number: number
  title: string
  /** The part the chapter belongs to ("Part I — The Window"), when the edition has parts. */
  section?: string
  paragraphs: MarginPreviewParagraph[]
  /**
   * The first chapter first (22 Oct 2026): a chapter whose text is still on its way (the book opened with the chapters
   * at its place, `MarginPreviewBook.partial`); its paragraphs are empty and `chars` estimates its length.
   */
  pending?: true
  chars?: number
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
  /** Only the chapters at the place have their text (marginPreviewWindowChapters); the whole book follows. */
  partial?: true
}

/** The book reader for this book, the opt-in turned off (marginPreviewFlag.ts). */
export function normalReaderHref(bookId: string): string {
  return `/reader?book=${encodeURIComponent(bookId)}&margin=0`
}

/**
 * A play or a book whose verse the book reader sets from its own data (launch, 22 Oct 2026): Shakespeare's plays
 * (the book reader's own test, LabApp `isShakespeare`: speakers as labels, verse lineation) and any book with a
 * verse sidecar (`/data/editions/<book>-lines.json`, Edition.hasVerseLines, read only by labVerseLines.ts). The
 * margin view has neither yet, so these open in the classic book reader.
 */
export function readsInClassicReader(book: Pick<Book, 'author' | 'editions'>): boolean {
  return book.author === 'William Shakespeare' || book.editions.some(edition => edition.hasVerseLines)
}

/**
 * Registered, readable books only: never the Bible (1,189 chapters, its own reader), a reader's own book, or a
 * play or verse-sidecar book (readsInClassicReader).
 */
export function isMarginPreviewBook(book: Book | undefined): book is Book {
  return !!book && book.id !== 'bible' && !book.localOnly && !readsInClassicReader(book) && book.editions.some(edition => !editionHold(book.id, edition.key))
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

const FIGURE_MARK = '\uFFFC'
const PARAGRAPH_KINDS = new Set<ParagraphKind>(['heading', 'label', 'item', 'subtitle', 'byline', 'line'])
const positive = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : undefined

/** A figure paragraph (`\uFFFC` + id, labFigures.ts isFigureToken) as the margin view draws it, or null for any other. */
export function marginPreviewFigureParagraph(raw: unknown, figures: Chapter['figures']): MarginPreviewParagraph | null {
  if (typeof raw !== 'string' || raw.length < 2 || raw[0] !== FIGURE_MARK || /\s/.test(raw)) return null
  const id = raw.slice(1)
  const f = (figures ?? []).find(figure => figure.id === id)
  const src = f && !f.unavailable && /^\/(?!\/)/.test(f.src || '') ? f.src : ''
  const figure: MarginPreviewFigure = {
    id, number: Number(f?.number) || 0, src,
    ...(f?.alt ? { alt: f.alt } : {}),
    ...(positive(f?.width) && positive(f?.height) ? { width: f!.width, height: f!.height } : {}),
    ...(f?.large ? { large: true } : {}),
  }
  return { text: String(f?.caption || '').replace(/\s+/g, ' ').trim(), figure }
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
        paragraphs: chapter.paragraphs.map((raw, p) => {
          const figure = marginPreviewFigureParagraph(raw, chapter.figures)
          if (figure) return figure
          const paragraph = marginPreviewParagraph(raw)
          const kind = chapter.kinds?.[p]
          return kind && PARAGRAPH_KINDS.has(kind) ? { ...paragraph, kind } : paragraph
        }),
      }
    })
}

/**
 * The first chapter first (Anders, 22 Oct 2026): a chapter window of the edition (editionLoader loadEditionWindow:
 * every chapter's number and title, the text of the chapters around the place) as the preview's chapters. A chapter
 * not in the window is `pending`, with its length estimated from the manifest's counts. -> null when the data is not a window
 */
export function marginPreviewWindowChapters(data: EditionData): MarginPreviewChapter[] | null {
  if (data.windowed?.complete !== false) return null
  const loaded = new Set(data.windowed.loadedChapters ?? [])
  const byNumber = new Map(data.chapters.map((c, i) => [Number(c.number) || i + 1, c]))
  return marginPreviewChapters(data).map(chapter => {
    if (loaded.has(chapter.number)) return chapter
    const source = byNumber.get(chapter.number)
    const words = Number(source?.wordCount) || 0, paragraphs = Number(source?.paragraphCount) || 0
    return { ...chapter, paragraphs: [], pending: true, chars: Math.round(words * 5.8) + paragraphs * 60 }
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
export function marginPreviewStart(place: LabBookPlace | null, chapters: MarginPreviewChapter[], opts: { editionKey: string; aligned: (key: string) => boolean }): MarginPreviewStart {
  const first = chapters[0]?.number ?? 1
  if (!place) return { chapterNumber: first, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 }
  const chapter = chapters.find(c => c.number === place.chapterNumber)
  if (!chapter) return { chapterNumber: first, paragraphIndex: 0, wordIndex: 0, updatedAt: place.updatedAt }
  const sameEdition = !place.primaryEditionKey || place.primaryEditionKey === opts.editionKey
  const carries = sameEdition || (opts.aligned(place.primaryEditionKey!) && opts.aligned(opts.editionKey))
  const paragraph = carries ? place.paragraphIndex : 0
  if (paragraph < 0 || paragraph >= chapter.paragraphs.length) return { chapterNumber: chapter.number, paragraphIndex: 0, wordIndex: 0, updatedAt: place.updatedAt }
  // A figure is one word, as the book reader counts it (its caption's words are not).
  const count = chapter.paragraphs[paragraph].figure ? 1 : words(chapter.paragraphs[paragraph].text)
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
