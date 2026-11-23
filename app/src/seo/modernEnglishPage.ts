/**
 * The modern-English page (`/modern-english`, docs/modern-english/BUILD-BRIEF.md): every book whose Modern English
 * edition is live, on the library's shelves, each opening the reader's free reading mode. Free and selling nothing;
 * unlisted until Anders launches it (noindex, not in the sitemap, linked from nowhere).
 *
 * Built from the registry by scripts/seo/build-modern-english.mjs into public/modern-english.html (generated, not
 * committed); the page's behaviour is public/lab/modern-english/modern-english.js and its look modern-english.css.
 */
import { BOOKS } from '../data/bookRegistry'
import { danishAuthorNamesFor, danishTitlesFor } from '../data/danishTitles'
import { editionHold, isBookTemporarilyHeld } from '../data/editionAvailability'
import { editionSource } from '../data/editionSources'
import { DANISH_FREE_PAGE_HEADLINE, DANISH_FREE_PAGE_SLUG, MODERN_ENGLISH_PAGE_SLUG } from '../data/freePages'
import { isEditionWithheld } from '../data/withheldEditions'
import { LIBRARY_BOOK_META, LIBRARY_HOUSES } from '../data/libraryTaxonomy'
import { danishGenitive } from '../lab/freeMode/freeModeLocale'
import type { Book } from '../types'

export const MODERN_ENGLISH_PATH = `/${MODERN_ENGLISH_PAGE_SLUG}`
export const MODERN_ENGLISH_REF = MODERN_ENGLISH_PAGE_SLUG

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
  /** Other names the search finds the book by (a page in another language: the English title, other spellings). */
  also?: string
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

/**
 * A free page: one language's list of books and every word it shows. The modern-English page is the first; the
 * Danish page (`/nutidsdansk`, Anders 23 Nov 2026) is the same page from the same code, for the books whose Danish
 * edition is published. A new language is one more of these, plus its entry in lab/freeMode/freeModeLocale.ts.
 */
export interface FreePage {
  /** The page's slug: its path is `/{slug}` and its book links carry `ref={slug}` (data/freePages.ts). */
  slug: string
  /** The `lang` of the page. */
  lang: string
  /** The edition a book must have live to be listed. */
  edition: string
  /**
   * Whether search engines may index the page. False keeps it unlisted: noindex in the page and in the Worker's
   * header, and out of the sitemap.
   */
  indexable: boolean
  /** The generated file under public/ (`{slug}.html`) is named after the slug by the build script. */
  title: string
  description: (count: number) => string
  headline: (count: number) => string
  subline: string
  wordmarkLabel: string
  search: string
  results: string
  /** Shown by the page's script when a search finds nothing; null leaves the script's own (English) words. */
  noResult: string | null
  categoryGroup: string
  periodGroup: string
  categories: Record<string, string>
  periods: Record<ModernEnglishEra, string>
  /** The shelves' titles by library house; null takes the library's own. */
  shelfTitles: Record<string, string> | null
  noMatch: string
  note: string
  footerGroup: string
  footer: { privacy: string; terms: string; credits: string; about: string }
  /** A book's title and the line under it, and other names the search should find it by. */
  bookTitle: (book: Book) => string
  bookSource: (book: Book) => string
  bookAlso: (book: Book) => string | undefined
  /** The comment naming the page in its source. */
  comment: string
}

/** A book's edition is live: registered, published, not held, not withheld and not kept on one machine. */
export function hasLiveEdition(book: Book, editionKey: string): boolean {
  if (book.localOnly) return false
  if (editionKey === 'modern-en' && book.noModernEdition) return false
  if (!book.editions.some(edition => edition.key === editionKey)) return false
  if (isBookTemporarilyHeld(book.id)) return false
  if (editionHold(book.id, editionKey) || isEditionWithheld(book.id, editionKey)) return false
  return true
}

/** A book's Modern English is live: registered, published, not held, not withheld and not kept on one machine. */
export function hasLiveModernEnglish(book: Book): boolean {
  return hasLiveEdition(book, 'modern-en')
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

/**
 * What a Danish edition was made from, as each card says it. The Danish is made from Tinct's Modern English, which
 * was made from the English original or the older English translation named here; a book with no English original
 * (The Master and Margarita) was made from its own.
 */
export function danishSource(book: Pick<Book, 'id' | 'author' | 'editions'>): string {
  const source = editionSource(book)
  if (source?.kind === 'translation') return `via ${danishGenitive(source.translator)} engelske oversættelse, ${source.year}`
  if (source?.kind === 'english-original') return 'fra den engelske original'
  const original = book.editions.find(edition => edition.key === 'original-en')
  if (original?.translator) return `via ${danishGenitive(original.translator)} engelske oversættelse`
  if (!original && book.editions.some(edition => edition.key === 'original-ru')) return 'fra den russiske original'
  return 'fra den engelske udgave'
}

/** The modern-English page. */
export const MODERN_ENGLISH_PAGE: FreePage = {
  slug: MODERN_ENGLISH_PAGE_SLUG,
  lang: 'en',
  edition: 'modern-en',
  indexable: false,
  title: 'Classics in modern English, free | Tinct',
  description: count => `${count} classics in modern English, free to read, with the original or its classic translation one tap away.`,
  headline: () => '100+ classics in modern translation. Free.',
  subline: 'The original, or its classic human translation, is always one tap away.',
  wordmarkLabel: 'Tinct library',
  search: 'Search by title or author',
  results: 'Books',
  noResult: null,
  categoryGroup: 'Category',
  periodGroup: 'Period',
  categories: Object.fromEntries(CATEGORY_PILLS.map(pill => [pill.house, pill.label])),
  periods: Object.fromEntries(PERIOD_PILLS.map(pill => [pill.era, pill.label])) as Record<ModernEnglishEra, string>,
  shelfTitles: null,
  noMatch: 'No book on these shelves matches both. Clear one of the two.',
  note: 'Made with AI from the original, or from the older translation named under each book. A way in, not a scholarly translation. Free to read, in both versions.',
  footerGroup: 'About',
  footer: { privacy: 'Privacy', terms: 'Terms', credits: 'Credits', about: 'About Tinct' },
  bookTitle: book => book.title,
  bookSource: modernEnglishSource,
  bookAlso: () => undefined,
  comment: 'The modern-English page (docs/modern-english/BUILD-BRIEF.md): unlisted at /modern-english, noindex, linked from nowhere. Generated by scripts/seo/build-modern-english.mjs.',
}

/** The shelves' Danish titles, by library house. The two reading lists keep their own names. */
const DANISH_SHELF_TITLES: Record<string, string> = {
  philosophy: 'Filosofi', politics: 'Politik og staten', drama: 'Drama', novel: 'Skønlitteratur', epic: 'Poesi og epos',
  scripture: 'Religiøse skrifter', history: 'Historie', strategy: 'Krig og strategi',
}

/**
 * The Danish page, "Klassikere på nutidsdansk" (Anders, 23 Nov 2026): the books whose Danish edition is published
 * (editionAvailability.ts OFFERED_DANISH_EDITIONS), every word in Danish. A book is shown under its Danish title
 * where data/danishTitles.ts has one (never an invented one); the English title still finds it in the search.
 * Unlisted like the English page was at its launch.
 */
export const DANISH_FREE_PAGE: FreePage = {
  slug: DANISH_FREE_PAGE_SLUG,
  lang: 'da',
  edition: 'modern-da',
  indexable: false,
  title: 'Klassikere på nutidsdansk, gratis | Tinct',
  description: count => `${count} klassikere på nutidsdansk, gratis at læse, med den engelske udgave ét tryk væk.`,
  headline: count => DANISH_FREE_PAGE_HEADLINE(Math.floor(count / 10) * 10),
  subline: 'Den engelske udgave er altid ét tryk væk.',
  wordmarkLabel: 'Tincts bibliotek',
  search: 'Søg på titel eller forfatter',
  results: 'Bøger',
  noResult: 'Ingen bog med det navn. Prøv forfatteren.',
  categoryGroup: 'Kategori',
  periodGroup: 'Periode',
  categories: { philosophy: 'Filosofi', drama: 'Drama', novel: 'Skønlitteratur', epic: 'Poesi', politics: 'Politik' },
  periods: { ancient: 'Antikken, før 500', medieval: 'Middelalder, 500\u20131500', early: '1500\u20131600-tallet', '1700s': '1700-tallet', '1800s': '1800-tallet', '1900s': '1900-tallet' },
  shelfTitles: DANISH_SHELF_TITLES,
  noMatch: 'Ingen bog på hylderne passer til begge valg. Fjern et af dem.',
  note: 'Lavet med AI ud fra Tincts moderne engelske udgave, som bygger på originalen eller den ældre oversættelse, der er nævnt under hver bog. En vej ind, ikke en videnskabelig oversættelse. Gratis at læse i begge udgaver.',
  footerGroup: 'Om',
  footer: { privacy: 'Privatliv', terms: 'Vilkår', credits: 'Kreditering', about: 'Om Tinct' },
  bookTitle: book => danishTitlesFor(book.id)[0] ?? book.title,
  bookSource: danishSource,
  bookAlso: book => {
    const shown = danishTitlesFor(book.id)[0] ?? book.title
    const names = [book.title, ...danishTitlesFor(book.id), ...danishAuthorNamesFor(book.author)].filter(name => name !== shown)
    return names.length ? [...new Set(names)].join(' ') : undefined
  },
  comment: `Klassikere på nutidsdansk, the Danish free page (src/seo/modernEnglishPage.ts DANISH_FREE_PAGE): unlisted at /${DANISH_FREE_PAGE_SLUG}, noindex, linked from nowhere. Generated by scripts/seo/build-modern-english.mjs.`,
}

/** Every free page the build writes and the Worker serves. */
export const FREE_PAGES: readonly FreePage[] = [MODERN_ENGLISH_PAGE, DANISH_FREE_PAGE]

/** The free reading mode at the book; the reader opens this device's saved place in it when there is one. */
export function freeReaderHref(bookId: string, page: FreePage = MODERN_ENGLISH_PAGE): string {
  return `/reader?book=${encodeURIComponent(bookId)}&mode=free&ref=${page.slug}`
}

/** Every book whose edition for the page is live (Modern English by default), from the registry, in registry order. */
export function modernEnglishBooks(books: Book[] = BOOKS, page: FreePage = MODERN_ENGLISH_PAGE): ModernEnglishBook[] {
  const meta = new Map(LIBRARY_BOOK_META.map(entry => [entry.id, entry]))
  const houseOfShelf = new Map<string, string>()
  for (const house of LIBRARY_HOUSES) for (const shelf of house.shelves) if (!houseOfShelf.has(shelf)) houseOfShelf.set(shelf, house.id)
  return books.filter(book => hasLiveEdition(book, page.edition)).map(book => {
    const entry = meta.get(book.id)
    const ySort = entry?.ySort ?? book.year ?? 0
    const house = entry?.shelves.map(shelf => houseOfShelf.get(shelf)).find(Boolean) ?? null
    const also = page.bookAlso(book)
    return { id: book.id, title: page.bookTitle(book), author: book.author, source: page.bookSource(book), house, era: modernEnglishEra(ySort), ySort, href: freeReaderHref(book.id, page), ...(also ? { also } : {}) }
  })
}

/** The shelves: the library's houses in its own order and names, each book by date. Empty houses are left out. */
export function modernEnglishShelves(list: ModernEnglishBook[], page: FreePage = MODERN_ENGLISH_PAGE): Array<{ house: string; title: string; books: ModernEnglishBook[] }> {
  return LIBRARY_HOUSES.map(house => ({
    house: house.id,
    title: page.shelfTitles?.[house.id] ?? house.title,
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
export function renderModernEnglishPage(assets: ModernEnglishPageAssets, list?: ModernEnglishBook[], page: FreePage = MODERN_ENGLISH_PAGE): string {
  list = list ?? modernEnglishBooks(BOOKS, page)
  const shelves = modernEnglishShelves(list, page)
  const card = (book: ModernEnglishBook) => `<li class="me-card" data-era="${book.era}"><a href="${esc(book.href)}">`
    + `<img src="${cover(book.id)}" alt="" width="300" height="450" loading="lazy" decoding="async">`
    + `<span class="me-card-title">${esc(book.title)}</span><span class="me-card-source">${esc(book.source)}</span></a></li>`
  const search = list.map(book => ({ id: book.id, t: book.title, a: book.author, s: book.source, h: book.href, ...(book.also ? { x: book.also } : {}) }))
  return `<!doctype html>
<html lang="${page.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${page.indexable ? '' : '<meta name="robots" content="noindex, nofollow">\n'}<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description(list.length))}">
<link rel="stylesheet" href="/fonts/tinct-fonts.css">
<link rel="stylesheet" href="${esc(assets.css)}">
<script type="module" src="/lab/internal-traffic.js"></script>
<script src="${esc(assets.js)}" defer></script>
</head>
<body class="me">
<!-- ${page.comment} -->
<div class="me-opening">
  <div class="me-scene" aria-hidden="true"></div>
  <div class="me-top">
    <div class="me-claim">
      <a class="me-wordmark" href="/library" aria-label="${esc(page.wordmarkLabel)}">Tinct.</a>
      <h1>${esc(page.headline(list.length))}</h1>
      <p class="me-sub">${esc(page.subline)}</p>
      <div class="me-search" role="search">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <label for="me-q" class="me-sr">${esc(page.search)}</label>
        <input id="me-q" type="search" placeholder="${esc(page.search)}" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-controls="me-results" aria-expanded="false">
        <ul id="me-results" class="me-results" role="listbox" aria-label="${esc(page.results)}"${page.noResult ? ` data-empty="${esc(page.noResult)}"` : ''} hidden></ul>
      </div>
      <div class="me-pills" role="group" aria-label="${esc(page.categoryGroup)}">${CATEGORY_PILLS.map(pill => `<button type="button" aria-pressed="false" data-kind="house" data-value="${pill.house}">${esc(page.categories[pill.house])}</button>`).join('')}</div>
      <div class="me-pills" role="group" aria-label="${esc(page.periodGroup)}">${PERIOD_PILLS.map(pill => `<button type="button" aria-pressed="false" data-kind="era" data-value="${pill.era}">${esc(page.periods[pill.era])}</button>`).join('')}</div>
    </div>
  </div>
</div>
<main class="me-main">
  <div class="me-shelves" id="me-shelves">
${shelves.map(shelf => `    <section class="me-shelf" data-house="${shelf.house}" aria-labelledby="me-shelf-${shelf.house}"><h2 id="me-shelf-${shelf.house}">${esc(shelf.title)} <span>${shelf.books.length}</span></h2><ul class="me-reel">${shelf.books.map(card).join('')}</ul></section>`).join('\n')}
    <p class="me-none" id="me-none" hidden>${esc(page.noMatch)}</p>
  </div>
  <p class="me-note">${esc(page.note)}</p>
</main>
<footer class="me-footer"><nav aria-label="${esc(page.footerGroup)}"><a href="/privacy">${esc(page.footer.privacy)}</a><a href="/terms">${esc(page.footer.terms)}</a><a href="/credits">${esc(page.footer.credits)}</a><a href="/about">${esc(page.footer.about)}</a></nav></footer>
<script type="application/json" id="me-books">${JSON.stringify(search).replace(/</g, '\\u003c')}</script>
</body>
</html>
`
}
