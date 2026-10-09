/**
 * A text PDF's two editions: "Tinct text" (its text reflowed in the Tinct
 * reader, /reader?userBook=<hex>) and "Original pages" (Add a book's viewer,
 * /lab/addbook/?userBook=<hex>), and the one place they share.
 *
 * The place is the viewer's record, `tinct-addbook:pos:pdf:<hex>`: the page
 * and how far down it, and, whichever edition wrote it, the same spot in the
 * Tinct text (chapter, paragraph, word, and the rules it was converted under)
 * with the edition it was read in (`edition`: 't' Tinct text, 'p' Original
 * pages). It is the place saved to the account (ownSync.ts), so another device
 * opens the same edition at the same spot. The reader also keeps its own
 * `tinct-addbook:place:<hex>` tuple as for an EPUB; the newer of the two wins.
 *
 * Which edition a PDF opens in: the edition of its place; else the reader's
 * choice on this device (`tinct-addbook:edition:<hex>`, 'text' | 'pages');
 * else, a PDF with a place saved before Tinct text existed stays in Original
 * pages until the reader switches; else the scan's default
 * (pdf-scan.js layout: prose reads as Tinct text, a paper as its pages).
 * Nothing known (a PDF not yet scanned on this device): the viewer, which
 * forwards to Tinct text once it has classified the document.
 */
import { pageOfTextPlace, textPlaceOfPage, type PdfTextPlace } from './pdfAnchors'
import { readUserBookPlace, writeUserBookPlace, type UserBookPlace } from './userBookPlace'
import type { UserBookChapter, UserBookEdition } from './userEdition'

export const PDF_EDITION_PREFIX = 'tinct-addbook:edition:'
/** Add a book's viewer keeps a PDF's place here (ownShelf.ts PDF_PLACE_PREFIX). */
const PDF_PLACE_PREFIX = 'tinct-addbook:pos:pdf:'
/** The edition key of Original pages in the reader's editions sheet (userBookSource.ts). */
export const PDF_PAGES_EDITION_KEY = 'pdf-pages'
export type PdfEditionChoice = 'text' | 'pages'
/** The scan's default (pdf-scan.js `layout.default`). */
export type PdfLayoutDefault = 'text' | 'pages' | 'pages-only'

type Read = (key: string) => string | null
const localRead: Read = key => { try { return localStorage.getItem(key) } catch { return null } }

function readPos(hex: string, read: Read = localRead): Record<string, unknown> | null {
  try {
    const raw = JSON.parse(read(PDF_PLACE_PREFIX + hex) || 'null') as unknown
    return raw && typeof raw === 'object' ? raw as Record<string, unknown> : null
  } catch { return null }
}

/** The choice kept on this device: Add a book writes it as JSON ('"text"'), older code plain. */
function storedChoice(hex: string, read: Read): PdfEditionChoice | null {
  const raw = read(PDF_EDITION_PREFIX + hex)
  if (!raw) return null
  let value: unknown = raw
  try { value = JSON.parse(raw) } catch { /* plain */ }
  return value === 'text' || value === 'pages' ? value : null
}

/**
 * The edition a PDF opens in (see above), or null when nothing is known yet.
 * The same rule as `TinctPdfText.choice` in addbooks/web/src/js/pdf-text.js.
 */
export function pdfEditionChoice(hex: string, layoutDefault?: PdfLayoutDefault | string | null, read: Read = localRead): PdfEditionChoice | null {
  const pos = readPos(hex, read)
  if (pos?.edition === 't') return 'text'
  if (pos?.edition === 'p') return 'pages'
  const stored = storedChoice(hex, read)
  if (stored) return stored
  if (pos && Number.isInteger(pos.page)) return 'pages'
  if (layoutDefault === 'text') return 'text'
  if (layoutDefault === 'pages' || layoutDefault === 'pages-only') return 'pages'
  return null
}

export function writePdfEditionChoice(hex: string, choice: PdfEditionChoice): void {
  try { localStorage.setItem(PDF_EDITION_PREFIX + hex, JSON.stringify(choice)) } catch { /* full or private */ }
}

const whole = (value: unknown, min = 0): value is number => Number.isInteger(value) && (value as number) >= min

/** A text place checked against the edition: null outside it. */
function inEdition(edition: UserBookEdition, place: PdfTextPlace): PdfTextPlace | null {
  const chapter = edition.chapters.find(item => item.number === place.chapterNumber)
  if (!chapter || !whole(place.paragraphIndex) || place.paragraphIndex >= chapter.paragraphs.length || !whole(place.wordIndex)) return null
  const words = chapter.paragraphs[place.paragraphIndex].split(/\s+/).filter(Boolean).length
  return { chapterNumber: chapter.number, paragraphIndex: place.paragraphIndex, wordIndex: Math.min(place.wordIndex, Math.max(0, words - 1)) }
}

/**
 * Where the Tinct text of a PDF opens: the reader's own place, or the shared
 * place when it is newer (read in Original pages, here or on another device):
 * its spot in the text when it carries one under these rules, else the text
 * at its page. `page` (a link's `&page=`) wins when the place is on another
 * page. The place chosen is kept as the reader's own.
 */
export function readPdfTextPlace(hex: string, edition: UserBookEdition, options: { page?: number | null; read?: Read } = {}): UserBookPlace | null {
  const own = readUserBookPlace(hex, edition)
  const pos = readPos(hex, options.read)
  let place: UserBookPlace | null = own
  const posAt = typeof pos?.at === 'number' ? pos.at : 0
  if (pos && whole(pos.page, 1) && posAt > 0 && posAt > (own?.updatedAt ?? 0)) {
    const carried = pos.converter === edition.converter && whole(pos.chapterNumber, 1)
      ? inEdition(edition, { chapterNumber: pos.chapterNumber as number, paragraphIndex: pos.paragraphIndex as number, wordIndex: pos.wordIndex as number })
      : null
    const frac = typeof pos.frac === 'number' && Number.isFinite(pos.frac) ? Math.max(0, Math.min(1, pos.frac)) : 0
    const spot = carried ?? textPlaceOfPage(edition.chapters, pos.page as number, frac)
    if (spot) place = { ...spot, updatedAt: posAt, converter: edition.converter }
  }
  const page = options.page
  if (whole(page, 1) && (!place || pageOfTextPlace(edition.chapters, place)?.page !== page)) {
    const spot = textPlaceOfPage(edition.chapters, page)
    if (spot) place = { ...spot, updatedAt: place?.updatedAt ?? 0, converter: edition.converter }
  }
  if (place && place !== own) writeUserBookPlace(hex, place)
  return place
}

/**
 * Keep a place read in the Tinct text as the PDF's shared place too: its page
 * and how far down it, the spot in the text, and the edition it was read in.
 * The viewer's own fields (zoom, page count, the account revision) stay.
 * A place without reading time (a book opened, not read) is not kept.
 */
export function keepPdfTextPlace(hex: string, chapters: readonly UserBookChapter[], place: Omit<UserBookPlace, 'updatedAt'> & { updatedAt: number }, options: { edition?: 't' | 'p'; pages?: number } = {}): { page: number; frac: number } | null {
  if (!(place.updatedAt > 0)) return null
  const at = pageOfTextPlace(chapters, place)
  if (!at) return null
  const prev = readPos(hex) ?? {}
  const next = {
    ...prev,
    page: at.page,
    frac: at.frac,
    at: place.updatedAt,
    chapterNumber: place.chapterNumber,
    paragraphIndex: place.paragraphIndex,
    wordIndex: place.wordIndex,
    ...(typeof place.converter === 'number' ? { converter: place.converter } : {}),
    edition: options.edition ?? 't',
    ...(!whole(prev.pages, 1) && whole(options.pages, 1) ? { pages: options.pages } : {}),
  }
  try { localStorage.setItem(PDF_PLACE_PREFIX + hex, JSON.stringify(next)) } catch { /* full or private */ }
  return at
}

/**
 * The reader picked Original pages: the same spot is kept as the shared
 * place, read now in Original pages, and the choice is kept on this device.
 * Returns the page to open the viewer at.
 */
export function choosePdfPages(hex: string, chapters: readonly UserBookChapter[], place: UserBookPlace, pages?: number): number {
  writePdfEditionChoice(hex, 'pages')
  const kept = keepPdfTextPlace(hex, chapters, { ...place, updatedAt: Date.now() }, { edition: 'p', pages })
  return kept?.page ?? 1
}
