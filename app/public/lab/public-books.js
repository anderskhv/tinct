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
  // Wikisource text comes from the wiki's own API (worker/lib/wikisourceEpub.ts), never from
  // ws-export.wmcloud.org: its robots.txt disallows all automated fetches and it answers the
  // Worker with an Anubis bot challenge (QA 2026-10-08). The catalogue's ws-export link only names the page.
  'Wikisource': { name: 'Wikisource', hosts: ['en.wikisource.org'] },
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

/**
 * The Wikisource page an edition names: its wiki's language and the page title, from the
 * catalogue's ws-export link (`?lang=en&page=…`), its wiki page (`https://en.wikisource.org/wiki/…`),
 * or a `ws:<lang>:` work id. Null for anything else.
 */
export function wikisourcePage(edition, workId = '') {
  if (edition?.source !== 'Wikisource') return null
  let lang = '', page = ''
  try {
    const url = new URL(edition.epubUrl || '')
    lang = url.searchParams.get('lang') || ''
    page = url.searchParams.get('page') || ''
  } catch { /* the wiki page below */ }
  try {
    const url = new URL(edition.sourceUrl || '')
    const host = url.hostname.match(/^([a-z]{2,3})\.wikisource\.org$/)
    if (host && url.pathname.startsWith('/wiki/')) {
      if (!lang) lang = host[1]
      if (!page) page = decodeURIComponent(url.pathname.slice('/wiki/'.length))
    }
  } catch { /* none */ }
  if (!lang) lang = String(workId).match(/^ws:([a-z]{2,3}):/)?.[1] || ''
  page = page.replace(/_/g, ' ').trim()
  return /^[a-z]{2,3}$/.test(lang) && page && page.length <= 255 ? { lang, page } : null
}

/** The Wikisource API a page is read from (worker/lib/wikisourceEpub.ts). */
export const wikisourceApi = lang => `https://${lang}.wikisource.org/w/api.php`

const GUTENBERG_WORK = /^pg:(\d{1,7})$/
const GUTENBERG_EPUB = /^https:\/\/www\.gutenberg\.org\/ebooks\/(\d{1,7})\.epub3?\.(images|noimages)$/

/**
 * What Add downloads for a work, most preferred first: Project Gutenberg's EPUB whenever the
 * work is a Gutenberg ebook (`pg:<n>`), even when the catalogue's chosen edition is another
 * library's (6,556 English works were Wikisource-first, QA 2026-10-08); then the catalogue's
 * edition. A Gutenberg EPUB lists its no-images file after it, for a book whose pictures
 * make the file too large. A Wikisource edition is its wiki page, read only from a wiki in
 * the work's own language (228 "English" works linked a French or German page).
 * Each: { source, sourceUrl, licence, epubUrls } or, for Wikisource, { …, wikisource: { lang, page } }.
 */
export function importEditions(work) {
  if (!work || !WORK_ID.test(work.id || '')) return []
  const out = []
  const gutenberg = (number, epubUrl) => {
    const images = epubUrl || `https://www.gutenberg.org/ebooks/${number}.epub3.images`
    const urls = [images]
    if (/\.epub3?\.images$/.test(images)) urls.push(`https://www.gutenberg.org/ebooks/${number}.epub.noimages`)
    return { source: 'Gutenberg', sourceUrl: `https://www.gutenberg.org/ebooks/${number}`, licence: 'PD', epubUrls: urls }
  }
  const pg = String(work.id).match(GUTENBERG_WORK)?.[1]
  const languages = (work.language || []).filter(language => language && language !== 'und')
  for (const edition of work.editions || []) {
    if (!edition || EXCLUDED_SOURCES.includes(edition.source)) continue
    if (edition.source === 'Gutenberg') {
      if (!edition.epubUrl || !allowedSourceUrl('Gutenberg', edition.epubUrl)) continue
      const number = String(edition.epubUrl).match(GUTENBERG_EPUB)?.[1]
      out.push(number ? gutenberg(number, edition.epubUrl) : { source: 'Gutenberg', sourceUrl: edition.sourceUrl ?? null, licence: edition.licence || 'PD', epubUrls: [edition.epubUrl] })
      continue
    }
    if (edition.source === 'Wikisource') {
      const target = wikisourcePage(edition, work.id)
      if (!target || !languages.includes(target.lang) || !allowedSourceUrl('Wikisource', wikisourceApi(target.lang))) continue
      out.push({ source: 'Wikisource', sourceUrl: edition.sourceUrl || `https://${target.lang}.wikisource.org/wiki/${encodeURIComponent(target.page.replace(/ /g, '_'))}`, licence: edition.licence || 'CC BY-SA 4.0', epubUrls: [], wikisource: target })
      continue
    }
    if (edition.epubUrl && allowedSourceUrl(edition.source, edition.epubUrl)) out.push({ source: edition.source, sourceUrl: edition.sourceUrl ?? null, licence: edition.licence || 'PD', epubUrls: [edition.epubUrl] })
  }
  // The catalogue's own Gutenberg record without an EPUB means Gutenberg has none (a text-only record).
  if (pg && !(work.editions || []).some(edition => edition?.source === 'Gutenberg')) out.unshift(gutenberg(pg, null))
  out.sort((a, b) => (b.source === 'Gutenberg') - (a.source === 'Gutenberg'))
  return out
}

/** A work Add can import: a download from an allowlisted library (importEditions), in an offered language. */
export function importableWork(work) {
  if (!work || !WORK_ID.test(work.id || '')) return false
  const languages = (work.language || []).filter(language => language && language !== 'und')
  if (!languages.length || !languages.every(language => IMPORT_LANGUAGES.includes(language))) return false
  return importEditions(work).length > 0
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
  const b = looseTitle(book.title)
  const surname = authorKey(book.author)
  // The surname, or a word of the name ("of Hippo, Saint Augustine" is Augustine).
  const byAuthor = person => sameSurname(authorKey(person.name), surname) || (!!surname && normalizeText(person.name).split(' ').includes(surname))
  if (!b.base || !(work.authors?.length ? work.authors : [{ name: '' }]).some(byAuthor)) return false
  return [work.title, ...(work.altTitles || [])].some(title => {
    const a = looseTitle(title)
    return a.base && withoutAuthor(a.base, surname) === b.base && (b.part === null || a.part === b.part)
  })
}
/** "confessions of saint augustine" → "confessions" for the surname "augustine". */
function withoutAuthor(base, surname) {
  const at = base.lastIndexOf(' of ')
  return at > 0 && surname && base.slice(at + 4).split(' ').includes(surname) ? base.slice(0, at) : base
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
  return `${base}|${part ?? ''}|${authorKey(author)}`
}

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

/**
 * The two search groups: "Available in Tinct" (the library's own matches, unchanged)
 * and "Not yet in Tinct" (importable catalogue works not already in Tinct, each book once:
 * a second copy with the same loose title and author is left out, and so is another edition
 * of the same Wikidata work, `wikidata` from the catalogue's work priors: the best-ranked edition
 * stands for the work, so searching another edition's own title still finds that edition first).
 */
export function groupSearchResults({ tinct, free, tinctBooks, limit = 8 }) {
  const notYet = groupEditions(free, tinctBooks, importableWork).slice(0, limit)
  return { available: tinct, notYet }
}

/**
 * Catalogue works in their order, one per book (data-level grouping, not yet shown in the UI):
 * a later work with the same id, loose title and first author, or Wikidata work as an earlier one
 * joins it as one of its `alternates` (each returned work is a copy carrying them). Works in Tinct,
 * and works `accept` refuses (e.g. not importable), are skipped without claiming their book, so
 * another translation of a Tinct book stays listed.
 */
export function groupEditions(free, tinctBooks = [], accept = () => true) {
  const seen = new Map()
  const out = []
  for (const work of free || []) {
    if (!work || !accept(work) || inTinct(work, tinctBooks)) continue
    const keys = [work.id, looseTitleAuthorKey(work.title, work.authors?.[0]?.name || ''), work.wikidata ? 'wd:' + work.wikidata : null].filter(Boolean)
    const first = keys.map(key => seen.get(key)).find(Boolean)
    if (first) { if (first.id !== work.id && !first.alternates.some(other => other.id === work.id)) first.alternates.push(work); for (const key of keys) if (!seen.has(key)) seen.set(key, first); continue }
    const group = { ...work, alternates: [] }
    for (const key of keys) seen.set(key, group)
    out.push(group)
  }
  return out
}

/** The library Add would download a work from (importEditions), else the catalogue edition's. */
export function importSource(work) {
  return importEditions(work)[0]?.source || work?.editions?.[0]?.source || ''
}

// ===== Catalogue metadata as Tinct shows it (QA 2026-10-08) =====

const SMALL_WORDS = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'of', 'in', 'on', 'at', 'to', 'by', 'with', 'from', 'as', 'into', 'upon', 'over', 'vs', 'via', 'per', 'off', 'out', 'up', 'de', 'la', 'le', 'du', 'des', 'von', 'van', 'der', 'den'])
const capital = word => word.replace(/^(\P{L}*)(\p{Ll})/u, (_, lead, letter) => lead + letter.toUpperCase())
/**
 * An English title in title case when the catalogue gives it in sentence case, as Gutenberg's
 * records often do ("The three musketeers" → "The Three Musketeers"). Only a title whose every
 * word after the first is lower case is changed; a title that already capitalises a word
 * ("A journey to Paris", "Clarissa Harlowe; or the history…") is the library's own and kept.
 */
export function displayTitle(title, language = ['en']) {
  const text = String(title ?? '').trim()
  if (!(Array.isArray(language) ? language : [language]).includes('en')) return text
  const words = text.split(/\s+/)
  const rest = words.slice(1).filter(word => /\p{L}/u.test(word) && !SMALL_WORDS.has(word.toLowerCase().replace(/\P{L}/gu, '')))
  if (words.length < 2 || !rest.length || rest.some(word => /\p{Lu}/u.test(word))) return text
  let after = true // the first word, and the word after a colon, semicolon or dash, is always capitalised
  return words.map(word => {
    const bare = word.toLowerCase().replace(/\P{L}/gu, '')
    const out = after || !SMALL_WORDS.has(bare) ? word.split('-').map(capital).join('-') : word
    after = /[:;—–.!?]$/.test(word) || word === '—' || word === '–'
    return out
  }).join(' ')
}

/**
 * A person's name without Gutenberg's spelled-out initials: "R. Farquharson (Robert Farquharson)
 * Sharp" → "Robert Farquharson Sharp", "C. J. (Charles James) Hogarth" → "Charles James Hogarth".
 * The parenthesis is used only when it spells out the names before it, initial for initial;
 * any other parenthesis ("Alphonse (de) Lamartine") is kept as the library wrote it.
 */
export function personName(name) {
  const text = String(name ?? '').replace(/\s+/g, ' ').trim()
  const match = text.match(/^(.*?)\s*\(([^()]+)\)\s*(.*)$/)
  if (!match) return text
  const before = match[1].split(' ').filter(Boolean)
  const full = match[2].split(' ').filter(Boolean)
  // "R. H. M." may be written "R.H.M.": split initials.
  const parts = before.flatMap(part => /^(\p{L}\.){2,}$/u.test(part) ? part.match(/\p{L}\./gu) : [part])
  if (!parts.length || parts.length !== full.length) return text
  const spelled = parts.every((part, i) => {
    const initial = part.match(/^(\p{L})\.$/u)?.[1]
    return initial ? full[i].toLowerCase().startsWith(initial.toLowerCase()) : part.toLowerCase() === full[i].toLowerCase()
  })
  return spelled ? [...full, match[3]].filter(Boolean).join(' ') : text
}

/**
 * The year a work was first published, when the catalogue's year can be that: never after its
 * author died (Gutenberg sometimes gives a translation's or a reprint's year: A Doll's House "1923",
 * Ibsen died 1906). Null otherwise; an estimate from the author's dates is never shown as a year.
 */
export function publishedYear(work) {
  const year = work?.firstPublishedYear
  if (!Number.isFinite(year)) return null
  const died = work?.authors?.[0]?.deathYear
  return Number.isFinite(died) && year > died ? null : year
}

/** One result row's text: title · author, and the source library (the one Add downloads from). */
export function freeRow(work) {
  const authors = (work.authors || []).map(person => personName(person.name)).filter(Boolean)
  return { title: displayTitle(work.title, work.language), author: authors.join(', '), source: sourceName(importSource(work)) }
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
/**
 * How pages read the index: revalidated, never from the browser's copy. The Worker allows
 * caching it for a minute, and a book added in that minute was missing from the copy: the
 * reader then opened another book, and My shelf and the reading table left the new one out
 * (QA 2026-10-08, 6 of 10 adds).
 */
export const PUBLIC_BOOKS_INDEX_FETCH = Object.freeze({ cache: 'no-cache' })
