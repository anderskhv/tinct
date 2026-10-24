/**
 * Where a reader's own EPUB opens (Anders, 19 Oct 2026): on the desktop, in
 * Add a book's margin reader (`/lab/addbook/?userBook=<hex>`, "Margin view":
 * its text flowing, with the margin's cards and the Notebook); on a phone, in
 * the Tinct reader (`/reader?userBook=<hex>`), as before. The reader's own
 * choice on this device wins on the desktop: "Convert to Tinct book" there
 * keeps 'text', "Margin view" in the Tinct reader's editions keeps 'margin'
 * (`tinct-addbook:epub-view:<hex>`, this device only, never synced).
 * The same rule as TinctReaderLayout.epubView (public/lab/addbook/js/reader-layout.js).
 *
 * The place crosses between the two by its words: Add a book keeps its place
 * as `tinct-addbook:pos:epub:<hex>` with the paragraph and word at the top of
 * the view and the words there (`quote`), and the Tinct reader its tuple
 * (`tinct-addbook:place:<hex>`). The two read the file differently, so a
 * paragraph is found by its words (findQuote, as TinctReaderLayout.findQuote);
 * the newer place wins.
 */
import { readUserBookPlace, writeUserBookPlace, type UserBookPlace } from './userBookPlace'
import type { UserBookEdition } from './userEdition'

export type EpubView = 'margin' | 'text'
export const EPUB_VIEW_PREFIX = 'tinct-addbook:epub-view:'
const EPUB_POS_PREFIX = 'tinct-addbook:pos:epub:'
/** The key of "Margin view" in the Tinct reader's editions sheet (userBookSource.ts). */
export const EPUB_MARGIN_EDITION_KEY = 'epub-margin'
/** Add a book's phone layout begins below this width (reader.js applyLayout). */
export const PHONE_MAX_WIDTH = 700

/** The rule: a phone reads in the Tinct reader; the desktop in Margin view unless the reader chose the Tinct reader here. */
export function epubView({ phone = false, own = null }: { phone?: boolean; own?: EpubView | string | null } = {}): EpubView {
  if (phone) return 'text'
  return own === 'text' ? 'text' : 'margin'
}

type Read = (key: string) => string | null
const localRead: Read = key => { try { return localStorage.getItem(key) } catch { return null } }

export function readEpubViewChoice(hex: string, read: Read = localRead): EpubView | null {
  try {
    const value = JSON.parse(read(EPUB_VIEW_PREFIX + hex) || 'null') as unknown
    return value === 'margin' || value === 'text' ? value : null
  } catch { return null }
}

export function writeEpubViewChoice(hex: string, view: EpubView): void {
  try { localStorage.setItem(EPUB_VIEW_PREFIX + hex, JSON.stringify(view)) } catch { /* full or private */ }
}

const phoneNow = () => typeof window !== 'undefined' && window.innerWidth < PHONE_MAX_WIDTH

/** Where this EPUB opens on this device now. */
export function epubViewHere(hex: string, options: { phone?: boolean; read?: Read } = {}): EpubView {
  return epubView({ phone: options.phone ?? phoneNow(), own: readEpubViewChoice(hex, options.read) })
}

/** Words compared loosely: letters and figures only, lower case, accents and punctuation dropped. */
export function quoteKey(text: string): string {
  return String(text || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

/**
 * Where some words stand: `chapters` lists each chapter's paragraph texts. The
 * first paragraph holding the words' first 60 letters, else 30, else 16 (whole
 * words). -> { chapter, para, word } (0-based) | null
 */
export function findQuote(chapters: ReadonlyArray<ReadonlyArray<string>>, quote: string): { chapter: number; para: number; word: number } | null {
  const q = quoteKey(quote)
  if (q.length < 6) return null
  const keys = chapters.map(list => list.map(quoteKey))
  for (const size of [60, 30, 16]) {
    if (q.length < size && size !== 16) continue
    const cut = q.length <= size ? q : q.slice(0, q.lastIndexOf(' ', size) > 5 ? q.lastIndexOf(' ', size) : size)
    for (let c = 0; c < keys.length; c++) for (let p = 0; p < keys[c].length; p++) {
      const k = keys[c][p], at = (' ' + k).indexOf(' ' + cut)
      if (at < 0) continue
      return { chapter: c, para: p, word: at === 0 ? 0 : k.slice(0, at).split(' ').filter(Boolean).length }
    }
  }
  return null
}

/** A legacy margin quote has no source coordinates. Never choose the first of several identical passages on migration. */
export function findUniqueQuote(chapters: ReadonlyArray<ReadonlyArray<string>>, quote: string): { chapter: number; para: number; word: number } | null {
  const q = quoteKey(quote)
  if (q.length < 6) return null
  const keys = chapters.map(list => list.map(quoteKey))
  for (const size of [60, 30, 16]) {
    if (q.length < size && size !== 16) continue
    const cut = q.length <= size ? q : q.slice(0, q.lastIndexOf(' ', size) > 5 ? q.lastIndexOf(' ', size) : size)
    let hit: { chapter: number; para: number; word: number } | null = null
    for (let c = 0; c < keys.length; c++) for (let p = 0; p < keys[c].length; p++) {
      const k = keys[c][p], at = (' ' + k).indexOf(' ' + cut)
      if (at < 0) continue
      if (hit || (' ' + k).indexOf(' ' + cut, at + 1) >= 0) return null
      hit = { chapter: c, para: p, word: at === 0 ? 0 : k.slice(0, at).split(' ').filter(Boolean).length }
    }
    if (hit) return hit
  }
  return null
}

function readPos(hex: string, read: Read = localRead): Record<string, unknown> | null {
  try {
    const raw = JSON.parse(read(EPUB_POS_PREFIX + hex) || 'null') as unknown
    return raw && typeof raw === 'object' ? raw as Record<string, unknown> : null
  } catch { return null }
}

/**
 * Where the Tinct reader opens an EPUB: its own place, or Add a book's when
 * that is newer (read in Margin view since), found by its words. The place
 * chosen is kept as the reader's own.
 */
export function readEpubPlace(hex: string, edition: UserBookEdition, read: Read = localRead, { requireUniqueQuote = false }: { requireUniqueQuote?: boolean } = {}): UserBookPlace | null {
  const own = readUserBookPlace(hex, edition)
  const pos = readPos(hex, read)
  const at = typeof pos?.at === 'number' ? pos.at : 0
  if (!pos || typeof pos.quote !== 'string' || !(at > (own?.updatedAt ?? 0))) return own
  const hit = (requireUniqueQuote ? findUniqueQuote : findQuote)(edition.chapters.map(chapter => chapter.paragraphs), pos.quote)
  if (!hit) return own
  const place: UserBookPlace = { chapterNumber: edition.chapters[hit.chapter].number, paragraphIndex: hit.para, wordIndex: hit.word, updatedAt: at, ...(typeof edition.converter === 'number' ? { converter: edition.converter } : {}) }
  writeUserBookPlace(hex, place)
  return place
}

/**
 * "Margin view", picked in the Tinct reader: this device reads the EPUB in Add
 * a book's margin reader from now on, at the words of `place` (sent as Add a
 * book's place, marked as chosen there so it is taken at once).
 */
export function chooseEpubMargin(hex: string, edition: UserBookEdition, place: Pick<UserBookPlace, 'chapterNumber' | 'paragraphIndex' | 'wordIndex'>): void {
  writeEpubViewChoice(hex, 'margin')
  const chapter = edition.chapters.find(item => item.number === place.chapterNumber)
  const words = (chapter?.paragraphs[place.paragraphIndex] ?? '').split(/\s+/).filter(Boolean)
  const quote = words.slice(place.wordIndex, place.wordIndex + 14).join(' ')
  if (!quote) return
  try { localStorage.setItem(EPUB_POS_PREFIX + hex, JSON.stringify({ ...(readPos(hex) ?? {}), quote, via: 't', at: Date.now() })) } catch { /* full or private */ }
}
