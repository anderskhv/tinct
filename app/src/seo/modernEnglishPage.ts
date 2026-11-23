/**
 * The modern-English page (`/modern-english`, docs/modern-english/BUILD-BRIEF.md): every book whose Modern English
 * edition is live, on the library's shelves, each opening the reader's free reading mode. Free and selling nothing;
 * unlisted until Anders launches it (noindex, not in the sitemap, linked from nowhere).
 *
 * Built from the registry by scripts/seo/build-modern-english.mjs into public/modern-english.html (generated, not
 * committed); the page's behaviour is public/lab/modern-english/modern-english.js and its look modern-english.css.
 */
import { BOOKS } from '../data/bookRegistry'
import { editionHold, isBookTemporarilyHeld } from '../data/editionAvailability'
import { isEditionWithheld } from '../data/withheldEditions'
import { LIBRARY_BOOK_META, LIBRARY_HOUSES } from '../data/libraryTaxonomy'
import type { Book } from '../types'

export const MODERN_ENGLISH_PATH = '/modern-english'
export const MODERN_ENGLISH_REF = 'modern-english'

export interface ModernEnglishBook {
  id: string
  title: string
  author: string
  /** "from George Long, 1862", or "from the original" for a book written in English. */
  source: string
  /** The library house it is shelved in (philosophy, drama, novel, …), or null when the taxonomy has none. */
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

/** A book's Modern English is live: registered, published, not held, not withheld and not kept on one machine. */
export function hasLiveModernEnglish(book: Book): boolean {
  if (book.localOnly || book.noModernEdition) return false
  if (!book.editions.some(edition => edition.key === 'modern-en')) return false
  if (isBookTemporarilyHeld(book.id)) return false
  if (editionHold(book.id, 'modern-en') || isEditionWithheld(book.id, 'modern-en')) return false
  return true
}

/** What the Modern English was made from, as each card says it: the original-en edition's translator and year. */
export function modernEnglishSource(book: Pick<Book, 'editions'>): string {
  const original = book.editions.find(edition => edition.key === 'original-en')
  if (!original?.translator) return 'from the original'
  return typeof original.year === 'number' && original.year > 0 ? `from ${original.translator}, ${original.year}` : `from ${original.translator}`
}

export function modernEnglishEra(ySort: number): ModernEnglishEra {
  return ySort < 500 ? 'ancient' : ySort < 1500 ? 'medieval' : ySort < 1700 ? 'early' : ySort < 1800 ? '1700s' : ySort < 1900 ? '1800s' : '1900s'
}

/** The free reading mode at the book; the reader opens this device's saved place in it when there is one. */
export function freeReaderHref(bookId: string): string {
  return `/reader?book=${encodeURIComponent(bookId)}&mode=free&ref=${MODERN_ENGLISH_REF}`
}

/** Every live Modern English book, from the registry, in registry order. */
export function modernEnglishBooks(books: Book[] = BOOKS): ModernEnglishBook[] {
  const meta = new Map(LIBRARY_BOOK_META.map(entry => [entry.id, entry]))
  const houseOfShelf = new Map<string, string>()
  for (const house of LIBRARY_HOUSES) for (const shelf of house.shelves) if (!houseOfShelf.has(shelf)) houseOfShelf.set(shelf, house.id)
  return books.filter(hasLiveModernEnglish).map(book => {
    const entry = meta.get(book.id)
    const ySort = entry?.ySort ?? book.year ?? 0
    const house = entry?.shelves.map(shelf => houseOfShelf.get(shelf)).find(Boolean) ?? null
    return { id: book.id, title: book.title, author: book.author, source: modernEnglishSource(book), house, era: modernEnglishEra(ySort), ySort, href: freeReaderHref(book.id) }
  })
}

/** The shelves: the library's houses in its own order and names, each book by date. Empty houses are left out. */
export function modernEnglishShelves(list: ModernEnglishBook[]): Array<{ house: string; title: string; books: ModernEnglishBook[] }> {
  return LIBRARY_HOUSES.map(house => ({
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

/** The whole page. Book data for the search rides in the page as JSON; the shelves are plain HTML. */
export function renderModernEnglishPage(assets: ModernEnglishPageAssets, list: ModernEnglishBook[] = modernEnglishBooks()): string {
  const shelves = modernEnglishShelves(list)
  const card = (book: ModernEnglishBook) => `<li class="me-card" data-era="${book.era}"><a href="${esc(book.href)}">`
    + `<img src="${cover(book.id)}" alt="" width="300" height="450" loading="lazy" decoding="async">`
    + `<span class="me-card-title">${esc(book.title)}</span><span class="me-card-source">${esc(book.source)}</span></a></li>`
  const search = list.map(book => ({ id: book.id, t: book.title, a: book.author, s: book.source, h: book.href }))
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Classics in modern English, free | Tinct</title>
<meta name="description" content="${list.length} classics in modern English, free to read, with the original or its classic translation one tap away.">
<link rel="stylesheet" href="/fonts/tinct-fonts.css">
<link rel="stylesheet" href="${esc(assets.css)}">
<script type="module" src="/lab/internal-traffic.js"></script>
<script src="${esc(assets.js)}" defer></script>
</head>
<body class="me">
<!-- The modern-English page (docs/modern-english/BUILD-BRIEF.md): unlisted at ${MODERN_ENGLISH_PATH}, noindex, linked from nowhere. Generated by scripts/seo/build-modern-english.mjs. -->
<div class="me-opening">
  <div class="me-scene" aria-hidden="true"></div>
  <div class="me-top">
    <div class="me-claim">
      <a class="me-wordmark" href="/library" aria-label="Tinct library">Tinct.</a>
      <h1>100+ classics in modern translation. Free.</h1>
      <p class="me-sub">The original, or its classic human translation, is always one tap away.</p>
      <div class="me-search" role="search">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <label for="me-q" class="me-sr">Search by title or author</label>
        <input id="me-q" type="search" placeholder="Search by title or author" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-controls="me-results" aria-expanded="false">
        <ul id="me-results" class="me-results" role="listbox" aria-label="Books" hidden></ul>
      </div>
      <div class="me-pills" role="group" aria-label="Category">${CATEGORY_PILLS.map(pill => `<button type="button" aria-pressed="false" data-kind="house" data-value="${pill.house}">${esc(pill.label)}</button>`).join('')}</div>
      <div class="me-pills" role="group" aria-label="Period">${PERIOD_PILLS.map(pill => `<button type="button" aria-pressed="false" data-kind="era" data-value="${pill.era}">${esc(pill.label)}</button>`).join('')}</div>
    </div>
  </div>
</div>
<main class="me-main">
  <div class="me-shelves" id="me-shelves">
${shelves.map(shelf => `    <section class="me-shelf" data-house="${shelf.house}" aria-labelledby="me-shelf-${shelf.house}"><h2 id="me-shelf-${shelf.house}">${esc(shelf.title)} <span>${shelf.books.length}</span></h2><ul class="me-reel">${shelf.books.map(card).join('')}</ul></section>`).join('\n')}
    <p class="me-none" id="me-none" hidden>No book on these shelves matches both. Clear one of the two.</p>
  </div>
  <p class="me-note">Made with AI from the original, or from the older translation named under each book. A way in, not a scholarly translation. Free to read, in both versions.</p>
</main>
<footer class="me-footer"><nav aria-label="About"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/credits">Credits</a><a href="/about">About Tinct</a></nav></footer>
<script type="application/json" id="me-books">${JSON.stringify(search).replace(/</g, '\\u003c')}</script>
</body>
</html>
`
}
