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
 * opens at the same spot, in its own view. The reader also keeps its own
 * `tinct-addbook:place:<hex>` tuple as for an EPUB; the newer of the two wins.
 *
 * Which edition a PDF opens in belongs to the device (Anders, 19 Oct 2026: "a
 * PDF's view is chosen per device; only the place syncs"): the edition kept on
 * this device (`tinct-addbook:edition:<hex>`, 'text' | 'pages': the reader's own
 * choice, "Convert to Tinct book" or "Original pages", else the default the
 * viewer told for this device, reader.js phoneKind / deskKind); else the scan's
 * default. The place's `edition` (where it was last read, here or on another
 * device) never decides.
 * Nothing chosen on the desktop: its pages, every PDF (Anders, 19 Oct 2026;
 * a kept default is no choice). Nothing kept on a phone: the viewer decides
 * (by the document's kind) and forwards to Tinct text
 * when that is this device's edition. The scan's Tinct text is followed without
 * the viewer only once this device's viewer has opened the book under the
 * current open rule (`tinct-addbook:open-rule:<hex>` >= PDF_OPEN_RULE:
 * reader.js openKind).
 */
import { pageOfTextPlace, textPlaceOfPage, type PdfTextPlace } from './pdfAnchors'
import { readUserBookPlace, storedPlaceConverter, writeUserBookPlace, type UserBookPlace } from './userBookPlace'
import type { UserBookChapter, UserBookEdition } from './userEdition'
import { PHONE_MAX_WIDTH } from './epubView'

export const PDF_EDITION_PREFIX = 'tinct-addbook:edition:'
/** The defaults the viewer kept for this device (reader.js phoneKind / deskKind); a choice of the reader's replaces them. */
const DEVICE_DEFAULT_PREFIXES = ['tinct-addbook:phone-edition:', 'tinct-addbook:desk-edition:'] as const
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

export type PdfEditionOptions = { phone?: boolean; desktopPages?: boolean }

/** A default the viewer kept for this device (reader.js phoneKind / deskKind): its edition, or null. */
function keptDefault(prefix: string, hex: string, read: Read): PdfEditionChoice | null {
  try {
    const value = JSON.parse(read(prefix + hex) || 'null') as { edition?: unknown } | null
    return value?.edition === 'text' || value?.edition === 'pages' ? value.edition : null
  } catch { return null }
}

const phoneNow = () => typeof window !== 'undefined' && window.innerWidth < PHONE_MAX_WIDTH

/**
 * The edition a PDF opens in (see above), or null when nothing is known yet.
 * The same rule as `TinctPdfText.choice` in addbooks/web/src/js/pdf-text.js.
 * On the desktop (Anders, 19 Oct 2026: Margin view is the main desktop
 * experience) every PDF opens in its pages unless the reader chose Tinct
 * text on this device: a kept default (phone-edition / desk-edition, such as
 * the desktop's Tinct text for running prose under the rule of 16 Oct) is not
 * a choice (TinctReaderLayout.ownChoice). Phones keep their rule.
 * `desktopPages: false` leaves the desktop's rule out (what is known before
 * the viewer: openUserBook converts a PDF first unless its pages are chosen).
 */
export function pdfEditionChoice(hex: string, layoutDefault?: PdfLayoutDefault | string | null, read: Read = localRead, { phone = phoneNow(), desktopPages = true }: PdfEditionOptions = {}): PdfEditionChoice | null {
  const stored = storedChoice(hex, read)
  const phoneDefault = keptDefault(DEVICE_DEFAULT_PREFIXES[0], hex, read)
  const deskDefault = keptDefault(DEVICE_DEFAULT_PREFIXES[1], hex, read)
  const own = stored && stored !== phoneDefault && stored !== deskDefault ? stored : null
  if (own) return own
  if (!phone && desktopPages) return 'pages'
  if (stored && stored === phoneDefault) return stored
  if (layoutDefault === 'text') return openRuleApplied(hex, read) ? 'text' : null
  if (layoutDefault === 'pages' || layoutDefault === 'pages-only') return 'pages'
  return null
}

/** The open rule's version (reader.js OPEN_RULE): 2, since the desktop's rule of 16 Oct 2026 (its pages since 19 Oct, prose too). */
export const PDF_OPEN_RULE = 2
export const PDF_OPEN_RULE_PREFIX = 'tinct-addbook:open-rule:'
function openRuleApplied(hex: string, read: Read): boolean {
  try { return Number(JSON.parse(read(PDF_OPEN_RULE_PREFIX + hex) || '0')) >= PDF_OPEN_RULE } catch { return false }
}

/**
 * True when nothing is kept on this device and the viewer must tell the
 * edition first (see above): the scan's default is Tinct text, or the book
 * has a place (read here or on another device) but no scan here. The Tinct
 * reader sends it to the viewer, which decides and forwards back when it is
 * Tinct text.
 */
export function pdfEditionUntold(hex: string, layoutDefault?: PdfLayoutDefault | string | null, read: Read = localRead, options: PdfEditionOptions = {}): boolean {
  if (pdfEditionChoice(hex, layoutDefault, read, options) !== null) return false
  const pos = readPos(hex, read)
  return layoutDefault === 'text' || (!layoutDefault && !!pos && Number.isInteger(pos.page))
}

export function writePdfEditionChoice(hex: string, choice: PdfEditionChoice): void {
  try { localStorage.setItem(PDF_EDITION_PREFIX + hex, JSON.stringify(choice)) } catch { /* full or private */ }
}


/**
 * A scan's text has just been recognised (its OCR edition reached this
 * device): from now on it opens in `choice` (ocrEdition.ts ocrDefaultEdition),
 * though its place was read in its pages until now. The place keeps its page
 * and time; a later choice of the reader's own stands. Also done by Add a
 * book's viewer (pdf-ocr.js adoptEdition).
 */
export function adoptOcrEditionChoice(hex: string, choice: PdfEditionChoice): void {
  writePdfEditionChoice(hex, choice)
  const pos = readPos(hex)
  if (!pos) return
  try { localStorage.setItem(PDF_PLACE_PREFIX + hex, JSON.stringify({ ...pos, edition: choice === 'text' ? 't' : 'p' })) } catch { /* full or private */ }
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
export function readPdfTextPlace(hex: string, edition: UserBookEdition, options: { page?: number | null; read?: Read; previous?: UserBookEdition | null } = {}): UserBookPlace | null {
  let own = readUserBookPlace(hex, edition)
  // A place read under other rules (a conversion made before this one) names other paragraphs:
  // it moves to the same spot on its PDF page, found in the conversion it was read in when that
  // is at hand, else the shared place's page decides (below).
  let moved = false
  const rules = storedPlaceConverter(hex)
  if (typeof rules === 'number' && rules !== edition.converter) {
    const previous = options.previous && options.previous.converter === rules ? options.previous : null
    const before = previous ? readUserBookPlace(hex, previous) : null
    const at = before && previous ? pageOfTextPlace(previous.chapters, before) : null
    const spot = at ? textPlaceOfPage(edition.chapters, at.page, at.frac) : null
    own = spot && before ? { ...spot, updatedAt: before.updatedAt, converter: edition.converter } : null
    moved = true
  }
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
  if (place && (place !== own || moved)) writeUserBookPlace(hex, place)
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
 * place, read now in Original pages, and the choice is kept on this device
 * only (it does not travel with the place).
 * Returns the page to open the viewer at.
 */
export function choosePdfPages(hex: string, chapters: readonly UserBookChapter[], place: UserBookPlace, pages?: number): number {
  return choosePdfPageAt(hex, chapters, place, pages).page
}

/** As choosePdfPages, with how far down the page the spot stands (`frac`, for the viewer's `&frac=`). */
export function choosePdfPageAt(hex: string, chapters: readonly UserBookChapter[], place: UserBookPlace, pages?: number): { page: number; frac: number } {
  writePdfEditionChoice(hex, 'pages')
  // The reader's choice on this device, not a default (reader.js ownEdition), as "Convert to Tinct book" does.
  for (const prefix of DEVICE_DEFAULT_PREFIXES) { try { localStorage.removeItem(prefix + hex) } catch { /* private */ } }
  const kept = keepPdfTextPlace(hex, chapters, { ...place, updatedAt: Date.now() }, { edition: 'p', pages })
  return kept ?? { page: 1, frac: 0 }
}

/**
 * "Show page": a look at the PDF's own page at a paragraph, the book still read as Tinct text.
 * The spot is kept as the shared place (still in Tinct text), and no choice changes, so Back, or
 * the viewer's "Tinct text", returns to the same paragraph. -> the page and how far down it.
 */
export function showPdfPageAt(hex: string, chapters: readonly UserBookChapter[], place: UserBookPlace, pages?: number): { page: number; frac: number } {
  const kept = keepPdfTextPlace(hex, chapters, { ...place, updatedAt: Math.max(place.updatedAt, 1) }, { edition: 't', pages })
  return kept ?? { page: 1, frac: 0 }
}
