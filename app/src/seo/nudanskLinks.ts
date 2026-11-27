/**
 * A link that opens one book in Danish: `/nudansk/<its Danish title>` (Anders, 27 Nov 2026: "there should be a direct
 * link … if I want to give a person a link to a Danish book, probably just its Danish title"). `/nudansk/kriton`
 * opens Crito in modern Danish, as its card on /nudansk does. The Worker answers these with a redirect to the reader.
 *
 * The address is the title as /nudansk shows it (danishTitles.ts, else the English title), lower-cased, with æ, ø
 * and å written ae, oe and aa as Danish web addresses do. A book's other Danish titles and its id open it too, so a
 * link keeps working when a title on the page changes.
 */
import { BOOKS } from '../data/bookRegistry'
import { danishTitlesFor } from '../data/danishTitles'
import { OFFERED_DANISH_EDITIONS } from '../data/editionAvailability'

export const NUDANSK_LINK_PREFIX = '/nudansk/'

/** "Sokrates’ forsvarstale" → "sokrates-forsvarstale"; "Ødipus i Kolonos" → "oedipus-i-kolonos". */
export function danishSlug(title: string): string {
  return title.toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['’‘]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const offeredInDanish = () => BOOKS.filter(book => OFFERED_DANISH_EDITIONS.has(`${book.id}/modern-da`))

/** The address of a book's Danish link: `/nudansk/` and the title /nudansk shows for it. */
export function nudanskBookPath(bookId: string): string | null {
  const book = offeredInDanish().find(item => item.id === bookId)
  return book ? NUDANSK_LINK_PREFIX + danishSlug(danishTitlesFor(book.id)[0] ?? book.title) : null
}

let bySlug: Map<string, string> | null = null
function slugs(): Map<string, string> {
  if (bySlug) return bySlug
  const books = offeredInDanish()
  const map = new Map<string, string>()
  // The title on the page first, for every book; then other titles and ids, never over a title already taken.
  for (const book of books) map.set(danishSlug(danishTitlesFor(book.id)[0] ?? book.title), book.id)
  for (const book of books) {
    for (const name of [...danishTitlesFor(book.id).slice(1), book.title, book.id]) {
      const slug = danishSlug(name)
      if (slug && !map.has(slug)) map.set(slug, book.id)
    }
  }
  bySlug = map
  return map
}

/** The book a `/nudansk/<name>` address opens, or null. Case and a trailing slash do not matter. */
export function nudanskBookForSlug(name: string): string | null {
  let decoded = name
  try { decoded = decodeURIComponent(name) } catch { /* a stray % is read as written */ }
  return slugs().get(danishSlug(decoded)) ?? null
}
