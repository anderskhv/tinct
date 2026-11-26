/**
 * The modern-English page (`/modern-english`, docs/modern-english/BUILD-BRIEF.md): every book whose Modern English
 * edition is live, on the library's shelves, each opening the reader's free reading mode. Free and selling nothing;
 * listed since 23 Nov 2026 (indexable, in the sitemap).
 *
 * Its Danish sibling (`/nudansk`, Anders 26 Nov 2026: "release the danish page too and add it to the sitemap") is the
 * same page in Danish: only the books Tinct offers in modern Danish (OFFERED_DANISH_EDITIONS), under their Danish
 * titles where one is on file (danishTitles.ts, never invented), each opening free mode in Danish (`ref=nudansk`).
 *
 * Both are built from the registry by scripts/seo/build-modern-english.mjs into public/modern-english.html and
 * public/nudansk.html (generated, not committed); the pages' behaviour is public/lab/modern-english/modern-english.js
 * and their look modern-english.css.
 */
import { BOOKS } from '../data/bookRegistry'
import { DANISH_AUTHOR_NAMES, danishTitlesFor } from '../data/danishTitles'
import { OFFERED_DANISH_EDITIONS, editionHold, isBookTemporarilyHeld } from '../data/editionAvailability'
import { isEditionWithheld } from '../data/withheldEditions'
import { LIBRARY_BOOK_META, LIBRARY_HOUSES } from '../data/libraryTaxonomy'
import type { Book } from '../types'

export const MODERN_ENGLISH_PATH = '/modern-english'
export const MODERN_ENGLISH_REF = 'modern-english'
export const NUDANSK_PATH = '/nudansk'
export const NUDANSK_REF = 'nudansk'

export type ModernEnglishLocale = 'en' | 'da'

export interface ModernEnglishBook {
  id: string
  title: string
  author: string
  /** "from George Long, 1862", or "from the original" for a book written in English; '' on the Danish page (none shown). */
  source: string
  /** The shelf it is on (the library house: philosophy, drama, novel, …; on the Danish page also kids), or null. */
  house: string | null
  /** The period pill it answers to. */
  era: ModernEnglishEra
  ySort: number
  href: string
}

export type ModernEnglishEra = 'ancient' | 'medieval' | 'early' | '1700s' | '1800s' | '1900s'

/** The category pills: the library's houses that hold most of these books, under the pill names Anders approved. */
export const CATEGORY_PILLS: ReadonlyArray<{ house: string; label: string }> = [
  { house: 'philosophy', label: 'Philosophy' },
  { house: 'drama', label: 'Drama' },
  { house: 'novel', label: 'Fiction' },
  { house: 'epic', label: 'Poetry' },
  { house: 'politics', label: 'Politics' },
]

export const PERIOD_PILLS: ReadonlyArray<{ era: ModernEnglishEra; label: string }> = [
  { era: 'ancient', label: 'Ancient, before 500' },
  { era: 'medieval', label: 'Medieval, 500\u20131500' },
  { era: 'early', label: '1500s\u20131600s' },
  { era: '1700s', label: '1700s' },
  { era: '1800s', label: '1800s' },
  { era: '1900s', label: '1900s' },
]

/** The Danish page's shelves, in its order: each is a pill and a shelf (the approved mockup, 26 Nov 2026). */
export const DANISH_SHELVES: ReadonlyArray<{ house: string; label: string }> = [
  { house: 'philosophy', label: 'Filosofi' },
  { house: 'drama', label: 'Drama' },
  { house: 'novel', label: 'Romaner' },
  { house: 'kids', label: 'Børn og unge' },
  { house: 'epic', label: 'Epos og historie' },
  { house: 'politics', label: 'Politik og samfund' },
]

export const DANISH_PERIOD_PILLS: ReadonlyArray<{ era: ModernEnglishEra; label: string }> = [
  { era: 'ancient', label: 'Oldtiden' },
  { era: 'medieval', label: 'Middelalderen' },
  { era: 'early', label: '1500\u20131600-tallet' },
  { era: '1700s', label: '1700-tallet' },
  { era: '1800s', label: '1800-tallet' },
  { era: '1900s', label: '1900-tallet' },
]

/** The children's books and retellings, on the Danish page's own shelf. */
export const DANISH_KIDS_BOOKS: ReadonlySet<string> = new Set([
  'a-little-princess', 'jungle-book', 'grimms-fairy-tales', 'alice-in-wonderland', 'pinocchio', 'odyssey-for-boys-and-girls',
  'iliad-for-boys-and-girls', 'merry-adventures-of-robin-hood', 'wonder-book-and-tanglewood-tales',
  'beautiful-stories-from-shakespeare', 'wind-in-the-willows', 'around-the-world-80-days',
  'the-secret-garden', 'story-of-king-arthur-and-his-knights',
])

/** Library houses with no shelf of their own on the Danish page go on the nearest one. */
const DANISH_HOUSE_OF: Readonly<Record<string, string>> = { history: 'epic', strategy: 'politics', scripture: 'philosophy' }
/** The two founding charters sit with history on the Danish page, as in the approved mockup. */
const DANISH_SHELF_OF_BOOK: Readonly<Record<string, string>> = { 'magna-carta': 'epic', 'us-founding-documents': 'epic' }

/** An edition of a book is live: registered, published, not held, not withheld and not kept on one machine. */
function isEditionLive(book: Book, editionKey: string): boolean {
  if (book.localOnly) return false
  if (!book.editions.some(edition => edition.key === editionKey)) return false
  if (isBookTemporarilyHeld(book.id)) return false
  return !editionHold(book.id, editionKey) && !isEditionWithheld(book.id, editionKey)
}

/** A book's Modern English is live: registered, published, not held, not withheld and not kept on one machine. */
export function hasLiveModernEnglish(book: Book): boolean {
  return !book.noModernEdition && isEditionLive(book, 'modern-en')
}

/** A book's modern Danish is offered (OFFERED_DANISH_EDITIONS) and live. */
export function hasLiveModernDanish(book: Book): boolean {
  return OFFERED_DANISH_EDITIONS.has(`${book.id}/modern-da`) && isEditionLive(book, 'modern-da')
}

/** What the Modern English was made from, as each card says it: the original-en edition's translator and year. */
export function modernEnglishSource(book: Pick<Book, 'editions'>): string {
  const original = book.editions.find(edition => edition.key === 'original-en')
  if (!original?.translator) return 'from the original'
  return typeof original.year === 'number' && original.year > 0 ? `from ${original.translator}, ${original.year}` : `from ${original.translator}`
}

/** The author as the Danish page names them: the Danish spelling on file, else the registry's, with "and" as "og". */
export function danishAuthor(author: string): string {
  return DANISH_AUTHOR_NAMES[author.trim()]?.[0] ?? author.replace(/ and /g, ' og ')
}

export function modernEnglishEra(ySort: number): ModernEnglishEra {
  return ySort < 500 ? 'ancient' : ySort < 1500 ? 'medieval' : ySort < 1700 ? 'early' : ySort < 1800 ? '1700s' : ySort < 1900 ? '1800s' : '1900s'
}

/** The free reading mode at the book; the reader opens this device's saved place in it when there is one. */
export function freeReaderHref(bookId: string, ref: string = MODERN_ENGLISH_REF): string {
  return `/reader?book=${encodeURIComponent(bookId)}&mode=free&ref=${ref}`
}

function shelving() {
  const meta = new Map(LIBRARY_BOOK_META.map(entry => [entry.id, entry]))
  const houseOfShelf = new Map<string, string>()
  for (const house of LIBRARY_HOUSES) for (const shelf of house.shelves) if (!houseOfShelf.has(shelf)) houseOfShelf.set(shelf, house.id)
  return (book: Book) => {
    const entry = meta.get(book.id)
    const ySort = entry?.ySort ?? book.year ?? 0
    const house = entry?.shelves.map(shelf => houseOfShelf.get(shelf)).find(Boolean) ?? null
    return { ySort, house, era: modernEnglishEra(ySort) }
  }
}

/** Every live Modern English book, from the registry, in registry order. */
export function modernEnglishBooks(books: Book[] = BOOKS): ModernEnglishBook[] {
  const place = shelving()
  return books.filter(hasLiveModernEnglish).map(book => {
    const { ySort, house, era } = place(book)
    return { id: book.id, title: book.title, author: book.author, source: modernEnglishSource(book), house, era, ySort, href: freeReaderHref(book.id) }
  })
}

/** Every book offered in modern Danish, in registry order: its Danish title where one is on file, else the English. */
export function nudanskBooks(books: Book[] = BOOKS): ModernEnglishBook[] {
  const place = shelving()
  return books.filter(hasLiveModernDanish).map(book => {
    const { ySort, house, era } = place(book)
    const shelf = DANISH_KIDS_BOOKS.has(book.id) ? 'kids' : DANISH_SHELF_OF_BOOK[book.id] ?? (house ? DANISH_HOUSE_OF[house] ?? house : null)
    return {
      id: book.id, title: danishTitlesFor(book.id)[0] ?? book.title, author: danishAuthor(book.author), source: '',
      house: shelf, era, ySort, href: freeReaderHref(book.id, NUDANSK_REF),
    }
  })
}

/** The shelves: the library's houses in its own order and names, each book by date. Empty houses are left out. */
export function modernEnglishShelves(list: ModernEnglishBook[], locale: ModernEnglishLocale = 'en'): Array<{ house: string; title: string; books: ModernEnglishBook[] }> {
  const houses = locale === 'da' ? DANISH_SHELVES.map(shelf => ({ id: shelf.house, title: shelf.label })) : LIBRARY_HOUSES
  return houses.map(house => ({
    house: house.id,
    title: house.title,
    books: list.filter(book => book.house === house.id).sort((a, b) => a.ySort - b.ySort),
  })).filter(shelf => shelf.books.length > 0)
}

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cover = (id: string) => `/covers/v2/${id}.webp`

export interface ModernEnglishPageAssets {
  /** Versioned addresses of the page's stylesheet and script. */
  css: string
  js: string
}

/** Each page's words, and where it lives. */
interface PageCopy {
  lang: string
  ogLocale: string
  path: string
  title: string
  ogTitle: string
  description: (count: number) => string
  h1: string
  sub: string
  search: string
  results: string
  empty: string
  library: string
  categoryLabel: string
  periodLabel: string
  categories: ReadonlyArray<{ house: string; label: string }>
  periods: ReadonlyArray<{ era: ModernEnglishEra; label: string }>
  none: string
  note: string
  footer: string
  footerLinks: [string, string, string, string]
}

const COPY: Record<ModernEnglishLocale, PageCopy> = {
  en: {
    lang: 'en', ogLocale: 'en_US', path: MODERN_ENGLISH_PATH,
    title: 'Classics in modern English, free | Tinct', ogTitle: 'Classics in modern English, free',
    description: count => `${count} classics in modern English, free to read, with the original or its classic translation one tap away.`,
    h1: '100+ classics in modern translation. Free.',
    sub: 'The original, or its classic human translation, is always one tap away.',
    search: 'Search by title or author', results: 'Books', empty: 'No book by that name. Try the author.', library: 'Tinct library',
    categoryLabel: 'Category', periodLabel: 'Period', categories: CATEGORY_PILLS, periods: PERIOD_PILLS,
    none: 'No book on these shelves matches both. Clear one of the two.',
    note: 'Made with AI from the original, or from the older translation named under each book. A way in, not a scholarly translation. Free to read, in both versions.',
    footer: 'About', footerLinks: ['Privacy', 'Terms', 'Credits', 'About Tinct'],
  },
  da: {
    lang: 'da', ogLocale: 'da_DK', path: NUDANSK_PATH,
    title: 'De største klassikere på nudansk, gratis | Tinct', ogTitle: 'De største klassikere på nudansk, gratis',
    description: count => `${count} klassikere på nudansk, gratis at læse, med originalen ét tryk væk.`,
    h1: 'De største klassikere på nudansk. Gratis.',
    sub: 'Originalen er altid ét tryk væk.',
    search: 'Søg på titel eller forfatter', results: 'Bøger', empty: 'Ingen bøger fundet', library: 'Tincts bibliotek',
    categoryLabel: 'Kategori', periodLabel: 'Periode', categories: DANISH_SHELVES, periods: DANISH_PERIOD_PILLS,
    none: 'Ingen bog på hylderne passer til begge. Fjern den ene af de to.',
    note: 'Lavet med AI ud fra Tincts moderne engelske udgave. En vej ind, ikke en videnskabelig oversættelse. Gratis at læse, i begge udgaver.',
    footer: 'Om', footerLinks: ['Privatliv', 'Vilkår', 'Kilder', 'Om Tinct'],
  },
}

/** The whole page. Book data for the search rides in the page as JSON; the shelves are plain HTML. */
export function renderModernEnglishPage(assets: ModernEnglishPageAssets, list?: ModernEnglishBook[], locale: ModernEnglishLocale = 'en'): string {
  const copy = COPY[locale]
  const books = list ?? (locale === 'da' ? nudanskBooks() : modernEnglishBooks())
  const shelves = modernEnglishShelves(books, locale)
  const card = (book: ModernEnglishBook) => `<li class="me-card" data-era="${book.era}"><a href="${esc(book.href)}">`
    + `<img src="${cover(book.id)}" alt="" width="300" height="450" loading="lazy" decoding="async">`
    + `<span class="me-card-title">${esc(book.title)}</span><span class="me-card-author">${esc(book.author)}</span>`
    + (book.source ? `<span class="me-card-source">${esc(book.source)}</span>` : '') + '</a></li>'
  const search = books.map(book => ({ id: book.id, t: book.title, a: book.author, s: book.source, h: book.href }))
  const description = copy.description(books.length)
  const canonical = `https://tinct.app${copy.path}`
  const [privacy, terms, credits, about] = copy.footerLinks
  return `<!doctype html>
<html lang="${copy.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="https://tinct.app${MODERN_ENGLISH_PATH}">
<link rel="alternate" hreflang="da" href="https://tinct.app${NUDANSK_PATH}">
<link rel="alternate" hreflang="x-default" href="https://tinct.app${MODERN_ENGLISH_PATH}">
<title>${esc(copy.title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(copy.ogTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tinct">
<meta property="og:locale" content="${copy.ogLocale}">
<link rel="stylesheet" href="/fonts/tinct-fonts.css">
<link rel="stylesheet" href="${esc(assets.css)}">
<script type="module" src="/lab/internal-traffic.js"></script>
<script src="${esc(assets.js)}" defer></script>
</head>
<body class="me">
<!-- ${locale === 'da' ? `The Danish sibling of /modern-english: listed at ${NUDANSK_PATH} since 26 Nov 2026` : `The modern-English page (docs/modern-english/BUILD-BRIEF.md): listed at ${MODERN_ENGLISH_PATH} since 23 Nov 2026`} (indexable, in the sitemap). Generated by scripts/seo/build-modern-english.mjs. -->
<div class="me-opening">
  <div class="me-scene" aria-hidden="true"></div>
  <div class="me-top">
    <div class="me-claim">
      <a class="me-wordmark" href="/library" aria-label="${esc(copy.library)}">Tinct.</a>
      <h1>${esc(copy.h1)}</h1>
      <p class="me-sub">${esc(copy.sub)}</p>
      <div class="me-search" role="search">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <label for="me-q" class="me-sr">${esc(copy.search)}</label>
        <input id="me-q" type="search" placeholder="${esc(copy.search)}" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-controls="me-results" aria-expanded="false">
        <ul id="me-results" class="me-results" role="listbox" aria-label="${esc(copy.results)}" data-empty="${esc(copy.empty)}" hidden></ul>
      </div>
      <div class="me-pills" role="group" aria-label="${esc(copy.categoryLabel)}">${copy.categories.map(pill => `<button type="button" aria-pressed="false" data-kind="house" data-value="${pill.house}">${esc(pill.label)}</button>`).join('')}</div>
      <div class="me-pills" role="group" aria-label="${esc(copy.periodLabel)}">${copy.periods.map(pill => `<button type="button" aria-pressed="false" data-kind="era" data-value="${pill.era}">${esc(pill.label)}</button>`).join('')}</div>
    </div>
  </div>
</div>
<main class="me-main">
  <div class="me-shelves" id="me-shelves">
${shelves.map(shelf => `    <section class="me-shelf" data-house="${shelf.house}" aria-labelledby="me-shelf-${shelf.house}"><h2 id="me-shelf-${shelf.house}">${esc(shelf.title)} <span>${shelf.books.length}</span></h2><ul class="me-reel">${shelf.books.map(card).join('')}</ul></section>`).join('\n')}
    <p class="me-none" id="me-none" hidden>${esc(copy.none)}</p>
  </div>
  <p class="me-note">${esc(copy.note)}</p>
</main>
<footer class="me-footer"><nav aria-label="${esc(copy.footer)}"><a href="/privacy">${esc(privacy)}</a><a href="/terms">${esc(terms)}</a><a href="/credits">${esc(credits)}</a><a href="/about">${esc(about)}</a></nav></footer>
<script type="application/json" id="me-books">${JSON.stringify(search).replace(/</g, '\\u003c')}</script>
</body>
</html>
`
}
