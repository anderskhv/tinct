// Public-domain books readers add to Tinct from the Add-a-book catalogue ("Add to Tinct").
// Shared by the library (library_2), the reading engine and Add bundles (src/libraryAdd.ts,
// src/libraryTwoReading.ts), the reader (src/utils/publicBooks.ts) and the Worker
// (src/worker/routes/publicBooks.ts), like internal-traffic.js. No browser APIs at import time.
import { isInternal } from './internal-traffic.js'

/** Whether the cookie that marks a signed-in browser is set (src/utils/authCookie.ts). Read only when asked. */
export function signedInCookie(cookie) {
  try {
    const value = cookie ?? (typeof document !== 'undefined' ? document.cookie : '')
    return String(value || '').split(';').some(part => part.trim() === 'tinct_auth=1')
  } catch {
    return false
  }
}

/**
 * Whether this reader sees "Not yet in Tinct", Add and the My shelf additions:
 * every signed-in account (free, trial and Premium) and devices with the internal
 * flag (`?internal=1`). Signed-out visitors see the library as before: no Add, no
 * "Not yet in Tinct" and no prompt to sign in for it (Anders, 2026-10-07).
 * `signedIn` is the page's own account state; without it, the signed-in cookie.
 * The Worker still requires an account for every import step.
 */
export function addToTinctEnabled(storage, signedIn) {
  return (signedIn ?? signedInCookie()) === true || isInternal(storage)
}

/**
 * The switch for paid Modern English editions of added books: on for everyone
 * (Anders, 2026-10-08). Set false to show the offer, the edition and its chapter
 * states only on devices with the internal flag again. The Worker has its own
 * kill switch (PUBLIC_BOOK_MODERN_EDITIONS).
 */
export const MODERN_EDITIONS_FOR_EVERYONE = true

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

const PART = /\b(?:part|vol\.?|volume|book|tome)\s+(\d+|[ivx]+|one|two|three|four|five|six)\b/i
const ROMAN = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8', ix: '9', x: '10' }
/**
 * A title as a copy of a book: `base` without its subtitle or a "The Tragedy of" opening, and
 * the `part` or volume it names before any subtitle. "Moby-Dick; or, The Whale" → moby dick,
 * "The Strange Case of Dr. Jekyll and Mr. Hyde" → dr jekyll and mr hyde, "Hamlet, Prince of
 * Denmark" → hamlet, "The Divine Comedy, Volume 1, Hell" → divine comedy, part 1, "Henry IV,
 * Part Two" → henry iv, part 2. "Faust: a Tragedy [part 1]" is faust with no part: a subtitle's
 * part is not read.
 */
export function looseTitle(title) {
  const text = String(title ?? '')
  const subtitle = text.search(/[;:(\[—–]|\s+or,?\s+/i)
  const [head, ...rest] = (subtitle > 0 ? text.slice(0, subtitle) : text).split(',')
  const named = [head, ...rest].map(segment => segment.match(PART)).find(Boolean)
  const number = named?.[1]?.toLowerCase()
  const base = normalizeText(head.replace(PART, ' '))
    .replace(/^(the )?((most|excellent|lamentable|tragical|famous|true|strange|tragic|comical|pleasant) )*(tragedy|tragedie|comedy|history|historie|life|case|chronicle history)( and death)? of (the )?/, '')
  return { base, part: number ? (PART_NUMBERS[number] || ROMAN[number] || number) : null }
}
/**
 * Is `work` a copy of the Tinct `book`: the same loose title, under its title or one of its other
 * titles (`altTitles`: "Thoughts of Marcus Aurelius" is also Meditations), by an author of the same
 * surname, and the same part when the book is one. A title naming the author ("The Confessions of
 * St. Augustine", "The Republic of Plato") is the same title.
 */
function sameCopy(work, book) {
  const surname = authorKey(book.author)
  // The surname, or a word of the name ("of Hippo, Saint Augustine" is Augustine).
  const byAuthor = person => sameSurname(authorKey(person.name), surname) || (!!surname && normalizeText(person.name).split(' ').includes(surname))
  if (!(work.authors?.length ? work.authors : [{ name: '' }]).some(byAuthor)) return false
  const name = nameWords(book.author)
  // The book's own title or one of its other titles ("Groundwork of the Metaphysics of Morals" is
  // also "Fundamental Principles of the Metaphysic of Morals").
  const own = [book.title, ...(book.altTitles || [])].map(title => looseTitle(title)).map(b => ({ ...b, base: bareTitle(b.base, name, surname) })).filter(b => b.base)
  // A work printed whole, the book being one part of it in the same translation ("Goethe's Faust",
  // Bayard Taylor, for Faust, Part One in his translation).
  const translators = new Set((book.editions || []).map(edition => edition?.translator).filter(Boolean).map(authorKey))
  const sameTranslation = translators.size > 0 && (work.translators || []).some(person => translators.has(authorKey(person.name)))
  return [work.title, ...(work.altTitles || [])].some(title => {
    const a = looseTitle(title)
    const base = a.base && bareTitle(a.base, name, surname)
    return !!base && own.some(b => base === b.base && (b.part === null || a.part === b.part || (a.part === null && sameTranslation)))
  })
}
/** "confessions of saint augustine" → "confessions", "divine comedy by dante" → "divine comedy" for the surname "augustine". */
function withoutAuthor(base, surname, name = new Set(surname ? [surname] : [])) {
  const by = base.lastIndexOf(' by ')
  if (by > 0 && base.slice(by + 4).split(' ').every(word => name.has(word))) return base.slice(0, by)
  const at = base.lastIndexOf(' of ')
  if (at <= 0) return base
  const tail = base.slice(at + 4).split(' ')
  return (surname && tail.includes(surname)) || (name.size > 1 && tail.every(word => name.has(word))) ? base.slice(0, at) : base
}
/** The words of a person's name, for bareTitle. */
const nameWords = author => new Set(normalizeText(author).split(' ').filter(Boolean))
/**
 * A title without the author's name around it and a leading "On": "Goethe's Faust" is faust,
 * "L. Annaeus Seneca on Benefits" and "On Benefits" are benefits, "On the Genealogy of Morals" is
 * genealogy of morals, "The Essays of Adam Smith" essays (search audit, 2026-10-08).
 */
function bareTitle(base, name, surname) {
  let words = withoutAuthor(base, surname, name).split(' ')
  // "Goethe's Faust" (normalized "goethe s faust", or "goethes faust").
  if (words.length > 2 && name.has(words[0]) && words[0].length >= 3 && words[1] === 's') words = words.slice(2)
  else if (words.length > 1 && [...name].some(word => word.length >= 3 && words[0] === word + 's')) words = words.slice(1)
  else {
    // Leading name words or their initials, through the surname.
    let i = 0
    while (i < words.length - 1 && (name.has(words[i]) || (words[i].length === 1 && [...name].some(word => word[0] === words[i])))) i++
    if (i && words.slice(0, i).includes(surname)) words = words.slice(i)
  }
  if (words.length > 1 && words[0] === 'on') words = words.slice(1)
  if (words.length > 1 && words[0] === 'the') words = words.slice(1)
  return words.join(' ')
}
/** The same surname, or a respelling of a long one ("Dostoyevsky" for Dostoevsky): at most two edits, same first letter. */
function sameSurname(a, b) {
  if (a === b) return true
  if (a.length < 6 || b.length < 6 || a[0] !== b[0] || Math.abs(a.length - b.length) > 2) return false
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = row
  }
  return prev[b.length] <= 2
}
/** The key two catalogue copies of one book share (loose title, part, first author's surname). */
export function looseTitleAuthorKey(title, author) {
  const { base, part } = looseTitle(title)
  const surname = authorKey(author)
  return `${bareTitle(base, nameWords(author), surname)}|${part ?? ''}|${surname}`
}
/**
 * The key the volumes and parts of one work share: its loose title without the part, each word cut
 * to six letters ("Theologico-Political Treatise — Part 1" and "A Theological-Political Treatise
 * [Part IV]"), and the first author's surname.
 */
function volumesKey(title, author) {
  const surname = authorKey(author)
  const base = bareTitle(looseTitle(title).base, nameWords(author), surname)
  return base ? `vol:${base.split(' ').map(word => word.slice(0, 6)).join(' ')}|${surname}` : null
}
/** A title naming a volume or part ("Volume 1 (of 3)", "Hell, Volume 01", "[Part IV]", "— Part 1"). */
const NAMES_PART = /\b(?:part|vol\.?|volume|book|tome)\s+(?:\d+|[ivxlc]+|one|two|three|four|five|six)\b|\(of \d+\)/i

/** Gutenberg ebook numbers the registry names for its sources (bookRegistry.ts comments). */
export const REGISTRY_GUTENBERG_IDS = { 'pg:44024': 'the-art-of-war', 'pg:15877': 'meditations', 'pg:14591': 'faust-part-1' }

/**
 * Catalogue works that are already in Tinct: the catalogue's own match (`onTinct`),
 * the same title and author as a library book, the same title once subtitles and a
 * "The Tragedy of" opening are set aside (looseTitle) by an author of the same surname
 * (a volume of a book Tinct has whole counts; a part Tinct has only by itself),
 * a Gutenberg number the registry names, or a public book already added (same work id).
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
    if (sameCopy(work, book)) return true
  }
  return false
}

/** Gutenberg's quotation and picture selections from an author's works: not books to add (search audit, 2026-10-08). */
const SELECTION = /^(quotes and images from|widger'?s quotations from)\b/i
/**
 * The two search groups: "Available in Tinct" (the library's own matches, unchanged)
 * and "Not yet in Tinct" (importable catalogue works not already in Tinct, each book once:
 * a second copy with the same loose title and author is left out, and so is another edition
 * of the same Wikidata work, `wikidata` from the catalogue's work priors: the best-ranked edition
 * stands for the work, so searching another edition's own title still finds that edition first).
 */
export function groupSearchResults({ tinct, free, tinctBooks, limit = 8 }) {
  const notYet = groupEditions(free, tinctBooks, work => importableWork(work) && !SELECTION.test(String(work.title || ''))).slice(0, limit)
  return { available: tinct, notYet }
}

/**
 * Catalogue works in their order, one per book (data-level grouping, not yet shown in the UI):
 * a later work with the same id, loose title and first author, Wikidata work, title and translator,
 * or a volume or part of the same work as an earlier one
 * joins it as one of its `alternates` (each returned work is a copy carrying them). Works in Tinct,
 * and works `accept` refuses (e.g. not importable), are skipped without claiming their book, so
 * another translation of a Tinct book stays listed.
 */
export function groupEditions(free, tinctBooks = [], accept = () => true) {
  const seen = new Map(), volumes = new Map(), parted = new Set()
  const out = []
  for (const work of free || []) {
    if (!work || !accept(work) || inTinct(work, tinctBooks)) continue
    const author = work.authors?.[0]?.name || ''
    // The same title in the same translation from another library (Gutenberg's and Wikisource's
    // "On Benefits", Aubrey Stewart) is one book, whatever form the author's name takes.
    const translator = work.translators?.[0]?.name
    const translated = translator ? `tr:${bareTitle(looseTitle(work.title).base, nameWords(author), authorKey(author))}|${looseTitle(work.title).part ?? ''}|${authorKey(translator)}` : null
    const keys = [work.id, looseTitleAuthorKey(work.title, author), work.wikidata ? 'wd:' + work.wikidata : null, translated].filter(Boolean)
    // The volumes and parts of one work are one row too ("The journal of Montaigne's travels…,
    // Volume 1 (of 3)", 2 and 3): a part joins the work's row, and the work joins its parts' row.
    const volume = volumesKey(work.title, author), part = NAMES_PART.test(work.title)
    let first = keys.map(key => seen.get(key)).find(Boolean)
    if (!first && volume && volumes.has(volume) && (part || parted.has(volumes.get(volume)))) first = volumes.get(volume)
    if (first) {
      if (first.id !== work.id && !first.alternates.some(other => other.id === work.id)) first.alternates.push(work)
      for (const key of keys) if (!seen.has(key)) seen.set(key, first)
      if (part) parted.add(first)
      continue
    }
    const group = { ...work, alternates: [] }
    for (const key of keys) seen.set(key, group)
    if (volume && !volumes.has(volume)) volumes.set(volume, group)
    if (part) parted.add(group)
    out.push(group)
  }
  return out
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
