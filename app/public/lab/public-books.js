// Public-domain books readers add to Tinct from the Add-a-book catalogue ("Add to Tinct").
// Shared by the library (library_2), the reading engine and Add bundles (src/libraryAdd.ts,
// src/libraryTwoReading.ts), the reader (src/utils/publicBooks.ts) and the Worker
// (src/worker/routes/publicBooks.ts), like internal-traffic.js. No browser APIs at import time.
import { isInternal } from './internal-traffic.js'

/**
 * The one-line switch. While false, the new search groups, Add and the My shelf
 * additions show only on devices with the internal flag (`?internal=1`); everyone
 * else sees the library as before. Set to true to open the feature to every reader.
 */
export const ADD_TO_TINCT_FOR_EVERYONE = false

/** Whether this device sees "Not yet in Tinct", Add and the My shelf additions. */
export function addToTinctEnabled(storage) {
  return ADD_TO_TINCT_FOR_EVERYONE || isInternal(storage)
}

/**
 * The switch for paid Modern English editions of added books: while false, the
 * offer, the edition and its chapter states show only on devices with the
 * internal flag. The Worker has its own kill switch (PUBLIC_BOOK_MODERN_EDITIONS).
 */
export const MODERN_EDITIONS_FOR_EVERYONE = false

/** Whether this device sees Modern English editions of added books. */
export function modernEditionsEnabled(storage) {
  return MODERN_EDITIONS_FOR_EVERYONE || isInternal(storage)
}

/** Every public book id starts with this; registry ids never do. */
export const PUBLIC_BOOK_PREFIX = 'pd-'
export const PUBLIC_BOOK_ID = /^pd-[a-z]{2,4}-[a-z0-9-]{1,60}$/
export function isPublicBookId(id) {
  return typeof id === 'string' && PUBLIC_BOOK_ID.test(id)
}

/** Catalogue work ids: `<library prefix>:<the library's own id>` (addbooks/scripts/catalog_sources). */
export const WORK_ID = /^[a-z]{2,4}:[A-Za-z0-9_.:/'()-]{1,200}$/

/**
 * The libraries Add may download from, with the exact hosts their EPUB links use in the
 * catalogue. Anything else is refused, on the Worker and before a request is made.
 */
export const IMPORT_SOURCES = {
  'Gutenberg': { name: 'Project Gutenberg', hosts: ['www.gutenberg.org'] },
  'Standard Ebooks': { name: 'Standard Ebooks', hosts: ['standardebooks.org'] },
  'Wikisource': { name: 'Wikisource', hosts: ['ws-export.wmcloud.org'] },
  'TextGrid': { name: 'TextGrid', hosts: ['textgridlab.org'] },
  'Wolne Lektury': { name: 'Wolne Lektury', hosts: ['wolnelektury.pl'] },
  'Bibebook': { name: 'Bibebook', hosts: ['www.bibebook.com'] },
  'Litteraturbanken': { name: 'Litteraturbanken', hosts: ['litteraturbanken.se'] },
}

/**
 * Libraries whose imports failed the catalogue-wide import check (below ~90%,
 * app/scripts/check-public-book-imports.mjs). Their works are left out of
 * "Not yet in Tinct" and refused by the Worker until the cause is fixed.
 * Run 2026-10-06, 30 works per library: Standard Ebooks 10/10, Wolne Lektury 30/30,
 * Bibebook 29/30, Gutenberg 30/30 (rerun; 25/30 in the all-libraries run, five
 * transient download failures that succeed on retry), Wikisource 28/30,
 * Litteraturbanken 27/30, TextGrid 0/30: its EPUB link is the whole collected
 * volume ("Dramen", "1926"), not the work, so the book would be the wrong text.
 */
export const EXCLUDED_SOURCES = ['TextGrid']

/**
 * Languages offered for import. English is the current delivery strategy
 * (STRATEGY.md#language-scope); widening this list is a product decision.
 */
export const IMPORT_LANGUAGES = ['en']

export function sourceName(source) {
  return IMPORT_SOURCES[source]?.name || source || ''
}

/** True when `url` is an https link on one of the source's allowlisted hosts. */
export function allowedSourceUrl(source, url) {
  const entry = IMPORT_SOURCES[source]
  if (!entry || EXCLUDED_SOURCES.includes(source)) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password && entry.hosts.includes(parsed.hostname)
  } catch {
    return false
  }
}

/** A work Add can import: an allowlisted library's EPUB, in an offered language. */
export function importableWork(work) {
  const edition = work?.editions?.[0]
  if (!edition || !edition.epubUrl || !WORK_ID.test(work.id || '')) return false
  if (!allowedSourceUrl(edition.source, edition.epubUrl)) return false
  const languages = (work.language || []).filter(language => language && language !== 'und')
  return languages.length > 0 && languages.every(language => IMPORT_LANGUAGES.includes(language))
}

// FNV-1a: a short, stable suffix that keeps lossy slugs unique.
function fnv1a(text) {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(36)
}

/** The stable Tinct id of a catalogue work: `pd-<library>-<id>` (gb 1342 → `pd-pg-1342`). */
export function publicBookId(workId) {
  if (!WORK_ID.test(workId || '')) return null
  const at = workId.indexOf(':')
  const prefix = workId.slice(0, at)
  const rest = workId.slice(at + 1)
  let slug = rest.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const lossless = slug === rest && slug.length <= 48
  slug = slug.slice(0, 48).replace(/-+$/g, '')
  return `${PUBLIC_BOOK_PREFIX}${prefix}-${lossless ? slug : `${slug ? slug + '-' : ''}${fnv1a(workId)}`}`
}

/** Letters and digits only, for matching titles and authors across spellings. */
export function normalizeText(value) {
  return String(value ?? '').toLowerCase().replace(/&/g, ' and ').normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/[øæœß]/g, c => ({ 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss' })[c])
    .replace(/^(the|a|an) /, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/^(the|a|an) /, '')
}
/** Surname-ish key of an author: the last word ("Jane Austen" → "austen"). */
function authorKey(value) {
  const words = normalizeText(String(value ?? '').split(/[,;&]| and /)[0]).split(' ').filter(Boolean)
  return words[words.length - 1] || ''
}
const PART_NUMBERS = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6' }
/** "pride and prejudice|austen": the key a catalogue work and a Tinct book share ("Part One" = "Part 1"). */
export function titleAuthorKey(title, author) {
  const key = normalizeText(title).replace(/\bpart (one|two|three|four|five|six)\b/g, (_, n) => `part ${PART_NUMBERS[n]}`)
  return `${key}|${authorKey(author)}`
}

/** Gutenberg ebook numbers the registry names for its sources (bookRegistry.ts comments). */
export const REGISTRY_GUTENBERG_IDS = { 'pg:44024': 'the-art-of-war', 'pg:15877': 'meditations', 'pg:14591': 'faust-part-1' }

/**
 * Catalogue works that are already in Tinct: the catalogue's own match (`onTinct`),
 * the same title and author as a library book, a Gutenberg number the registry
 * names, or a public book already added (same work id).
 */
export function inTinct(work, tinctBooks) {
  if (work.onTinct || work.tinctIds?.length) return true
  if (REGISTRY_GUTENBERG_IDS[work.id]) return true
  const id = publicBookId(work.id)
  const author = work.authors?.[0]?.name || ''
  const key = titleAuthorKey(work.title, author)
  for (const book of tinctBooks) {
    if (book.id === id || book.public?.workId === work.id) return true
    if (titleAuthorKey(book.title, book.author) === key) return true
  }
  return false
}

/**
 * The two search groups: "Available in Tinct" (the library's own matches, unchanged)
 * and "Not yet in Tinct" (importable catalogue works not already in Tinct).
 */
export function groupSearchResults({ tinct, free, tinctBooks, limit = 8 }) {
  const seen = new Set()
  const notYet = []
  for (const work of free || []) {
    if (notYet.length >= limit) break
    if (seen.has(work.id) || !importableWork(work) || inTinct(work, tinctBooks)) continue
    seen.add(work.id)
    notYet.push(work)
  }
  return { available: tinct, notYet }
}

/** One result row's text: title · author, and the source library. */
export function freeRow(work) {
  const authors = (work.authors || []).map(person => person.name).filter(Boolean)
  return { title: work.title, author: authors.join(', '), source: sourceName(work.editions?.[0]?.source) }
}

/**
 * Merge the added public books into the library catalogue (`/lab/catalogue.json`):
 * books, and their shelves inside the existing Houses. Never replaces a registry book.
 * Returns a new object; the input is not changed.
 */
export function mergePublicBooks(catalogue, entries) {
  if (!catalogue || !Array.isArray(catalogue.books) || !entries?.length) return catalogue
  const known = new Set(catalogue.books.map(book => book.id))
  const added = entries.filter(entry => isPublicBookId(entry?.id) && !known.has(entry.id))
  if (!added.length) return catalogue
  const houses = (catalogue.houses || []).map(house => ({ ...house, shelves: house.shelves.map(shelf => ({ ...shelf, bookIds: [...shelf.bookIds] })) }))
  // A shelf (or house) the registry leaves empty is not in the built catalogue: the entry's placement brings it.
  for (const entry of added) {
    for (const place of entry.placement || []) {
      let house = houses.find(item => item.id === place.houseId)
      if (!house) { house = { id: place.houseId, title: place.houseTitle, subtitle: place.houseSubtitle, hue: place.houseHue, shelves: [] }; houses.push(house) }
      let shelf = house.shelves.find(item => item.id === place.shelfId)
      if (!shelf) { shelf = { id: place.shelfId, title: place.shelfTitle, subtitle: place.shelfSubtitle, hue: place.shelfHue, bookIds: [] }; house.shelves.push(shelf) }
      if (!shelf.bookIds.includes(entry.id)) shelf.bookIds.push(entry.id)
    }
  }
  return { ...catalogue, books: [...catalogue.books, ...added], houses }
}

/** The public books index: every book added so far, as catalogue entries. */
export const PUBLIC_BOOKS_INDEX_URL = '/api/public-books'
