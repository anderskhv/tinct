/**
 * Crawlable chapter pages (`/read/{bookId}/chapter-N`) for every book with an unheld Modern English edition,
 * except the Shakespeare plays, which have scene pages (Anders, 16 Nov 2026,
 * docs/seo-chapter-pages-brief-2026-11-16.md).
 *
 * A chapter page is the scene page's design (scenePages.tsx: the reader's own class names, stylesheets, header,
 * margin and ask field, the same page script and hand-over to the reader) with the whole chapter in Modern English
 * and its original public-domain edition side by side, paragraph by paragraph, as the reader's Compare sets them.
 * It hydrates nothing and never reads or writes a reading position.
 *
 * Only books in seoIndexAllowlist.ts with a known edition source are indexable; every other chapter page is
 * `noindex, follow`. No new prose: titles, labels, the note and the description come from the registry, the
 * edition files and the brief's exact wording.
 *
 * Pure: no file system. scripts/seo/build-chapter-pages.mjs bundles this module and writes the files.
 */
import { BOOKS } from '../data/bookRegistry'
import { SEO_INDEX_ALLOWLIST } from '../data/seoIndexAllowlist'
import { editionNoteHtml, editionSource, type EditionSource } from '../data/editionSources'
import { LIBRARY_BOOK_META, LIBRARY_HOUSES, LIBRARY_SHELVES } from '../data/libraryTaxonomy'
import { FIGURE_MARK } from '../lab/labFigures'
import { stripUnderscoreEmphasis } from '../lab/emphasisText'
import { resetVerseLines } from '../lab/labVerseLines'
import { SCENE_HANDOFF_EDITION, type SceneHandoffAction } from '../lab/labSceneHandoff'
import type { Book } from '../types'
import {
  READER_CSS_PLACEHOLDER, READER_ROOT_STYLE, SCENE_PAGE_ORIGIN, act, askField, escapeHtml, headerHtml, pageStyles,
  positionHtml, renderParagraph, sceneAssetPlaceholder, sceneHandoffHref, viewSwitchHtml, type Edition, type EditionChapter,
} from './scenePages'
import { bookPageDescription, bookPageTitle, chapterPositions, curlyQuotes, structureFacts, type StructureFacts } from './bookStructure'
export { besidePhrase, bookPageDescription, bookPageTitle } from './bookStructure'

export { editionNoteHtml, editionSource, SEO_INDEX_ALLOWLIST, sceneAssetPlaceholder }

/** The edition source of a registry book by id (null for an unknown id or source). */
export function editionSourceFor(bookId: string): EditionSource | null {
  const book = BOOKS.find(entry => entry.id === bookId)
  return book ? editionSource(book) : null
}
export const CHAPTER_PAGE_ORIGIN = SCENE_PAGE_ORIGIN
/** Where a pack of chapter pages starts (the Worker serves one chapter out of its pack; see build-chapter-pages.mjs). */
export const chapterPageMarker = (chapter: number) => `<!--tinct:chapter-page ${chapter}-->`

export interface ChapterPageBook { id: string; title: string; author: string }
export interface ChapterPagePlan {
  book: Book
  source: EditionSource | null
  /** Search engines may index its chapter pages: allowlisted and its source known. */
  indexable: boolean
  /** The original edition beside the Modern English: original-en, else the book's own-language original. */
  originalKey: string | null
}

const isShakespeare = (book: Pick<Book, 'author'>) => book.author === 'William Shakespeare'
const editionLabel = (book: Book, key: string) => book.editions.find(edition => edition.key === key)?.label ?? key
/** The registry's label for one of a book's editions ("Modern English", "Garnett Translation (1914)"). */
export const editionLabelOf = editionLabel

/**
 * The books that get chapter pages: public (the registry's BOOKS, not wholly held), a Modern English edition that
 * is offered and not held, and not a Shakespeare play. `available(bookId, key)` says whether an edition file
 * exists and is not held; `machineMade` lists originals that are not an original (MACHINE_MADE_ORIGINALS).
 */
export function chapterPagePlans(input: {
  available: (bookId: string, key: string) => boolean
  wholeHolds: readonly string[]
  publisherPermissions: Record<string, unknown>
  machineMade: ReadonlySet<string>
}): ChapterPagePlan[] {
  const plans: ChapterPagePlan[] = []
  for (const book of BOOKS) {
    if (input.wholeHolds.includes(book.id) || book.noModernEdition || input.publisherPermissions[book.id] || isShakespeare(book)) continue
    if (!book.editions.some(edition => edition.key === 'modern-en') || !input.available(book.id, 'modern-en')) continue
    const originals = book.editions.filter(edition => edition.style === 'original' && input.available(book.id, edition.key) && !input.machineMade.has(`${book.id}/${edition.key}`))
    const originalKey = (originals.find(edition => edition.key === 'original-en') ?? originals[0])?.key ?? null
    const source = editionSource(book)
    plans.push({ book, source, originalKey, indexable: SEO_INDEX_ALLOWLIST.includes(book.id) && !!source && originalKey === 'original-en' })
  }
  return plans
}

// ===== Titles =====

const NUMBER = '(?:\\d{1,4}|[IVXLC]{1,8}|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen)'
const UNIT = new RegExp(`^(?:(?:Book ${NUMBER}(?: \\(\\d{4}\\))?(?:: [^,—]+)?)|(?:(?:Part|Chapter|Letter|Section|Fitt|Canto|Episode|Tablet|Meditation|Volume|Stave|No\\.) ${NUMBER})|(?:(?:First |Second )?Epilogue|Prologue|Prelude|Finale|Preface|Introduction|Conclusion|Appendix|Inferno|Purgatorio|Paradiso))`)

/**
 * The book's own label for a chapter, when its title starts with one ("Chapter 1 — Loomings" → "Chapter 1",
 * "Book One (1805) — Chapter 1" → "Book One (1805), Chapter 1", "Part 1, Chapter 1"); null when the title is a
 * name ("Sara", "I. Fyodor Pavlovitch Karamazov").
 */
export function chapterOwnLabel(title: string): string | null {
  const parts: string[] = []
  for (const segment of title.split(' — ')) {
    const pieces = segment.split(', ')
    let taken = 0
    while (taken < pieces.length) {
      const match = pieces[taken].match(UNIT)
      if (!match) break
      if (match[0] !== pieces[taken]) { parts.push(match[0]); taken = -1; break }
      parts.push(pieces[taken])
      taken += 1
    }
    if (taken !== pieces.length) break
  }
  return parts.length ? parts.join(', ') : null
}

/**
 * Each chapter's label for its page title: the book's own label where every chapter of the book has a distinct
 * one, else "Chapter N" (N, the chapter's number in the edition and its address) for every chapter.
 */
export function chapterLabels(chapters: readonly Pick<EditionChapter, 'number' | 'title'>[]): Map<number, string> {
  const own = chapters.map(chapter => chapterOwnLabel(chapter.title))
  const distinct = own.every(Boolean) && new Set(own).size === own.length
  return new Map(chapters.map((chapter, index) => [chapter.number, distinct ? own[index]! : `Chapter ${chapter.number}`]))
}

/** A chapter page's title, by search intent (Anders, 19 Nov 2026): "Jane Eyre, Chapter 26 of 38: full text in modern English | Tinct". */
export function chapterPageTitle(book: ChapterPageBook, label: string, of: number | null = null): string {
  return `${book.title}, ${label}${of ? ` of ${of}` : ''}: full text in modern English | Tinct`
}

/** "Read Chapter 26 of Jane Eyre free, in modern English beside the original. No sign-up." */
export function chapterPageDescription(book: ChapterPageBook, label: string): string {
  return `Read ${label} of ${book.title} free, in modern English beside the original. No sign-up.`
}

export const chapterPagePath = (bookId: string, chapter: number) => `/read/${bookId}/chapter-${chapter}`
export const bookPagePath = (bookId: string) => `/read/${bookId}`

const isFigure = (text: string) => text.startsWith(FIGURE_MARK)
const plain = (text: string) => stripUnderscoreEmphasis(text).text.replace(/\s+/g, ' ').trim()

// ===== The page =====

/** The reader's book map, drawn once and small: hairlines for the book, the window over this chapter, the share before it. */
const chapterWeights = new WeakMap<readonly EditionChapter[], number[]>()
export function renderChapterMinimap(chapters: readonly EditionChapter[], chapterNumber: number): string {
  // Words per chapter, counted once per book (a book of 1,500 chapters draws 1,500 maps).
  let weights = chapterWeights.get(chapters)
  if (!weights) {
    weights = chapters.map(chapter => Math.max(1, chapter.paragraphs.reduce((sum, text) => sum + Math.max(1, (text.match(/\S+/g) || []).length), 0)))
    chapterWeights.set(chapters, weights)
  }
  let total = 0
  let offset = 0
  let current = 1
  chapters.forEach((chapter, index) => {
    if (chapter.number === chapterNumber) { offset = total; current = weights![index] }
    total += weights![index]
  })
  const mapHeight = Math.max(140, Math.min(600, Math.ceil(total / 12) * 5))
  const top = Math.min(mapHeight - 8, +(offset / total * mapHeight).toFixed(2))
  const height = Math.max(8, Math.min(mapHeight - top, +(current / total * mapHeight).toFixed(2)))
  return `<svg class="source-minimap" style="height:min(calc(100dvh - 200px), ${mapHeight}px)" viewBox="0 0 34 ${mapHeight}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><pattern id="chapter-map-lines" width="34" height="4" patternUnits="userSpaceOnUse"><line x1="6" x2="25" y1="1.5" y2="1.5" class="source-minimap-line"/></pattern></defs><rect width="34" height="${mapHeight}" fill="url(#chapter-map-lines)"/><rect x=".5" y="${top}" width="33" height="${height}" rx="5" class="source-minimap-window"/><text x="17" y="${mapHeight + 20}" class="source-minimap-progress">${Math.round(offset / total * 100)}%</text></svg>`
}

/** Replaced at build time by the versioned address of public/read/chapter-page.css (chapterPageCss()). */
export const CHAPTER_CSS_PLACEHOLDER = '__TINCT_CHAPTER_CSS__'

/**
 * The chapter pages' own stylesheet: the scene page's rules and the side-by-side layout, one file for every
 * chapter page (inline, they would repeat thousands of times).
 */
export function chapterPageCss(): string {
  return [pageStyles(), chapterStyles()].map(block => block.replace(/^<style>\n?|<\/style>$/g, '')).join('')
}

/** Page-only layout for the side-by-side text, on top of the scene page's rules. Colours are the reader's tokens. */
function chapterStyles(): string {
  return `<style>
.tinct-chapter .chapter-figure { margin: 0; }
.tinct-chapter .chapter-note { margin: 34px 0 0; padding-top: 16px; border-top: 1px solid var(--lab-border, rgba(32,26,19,.12)); font: 400 15px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--lab-ink-muted); }
.tinct-chapter .chapter-note strong { font-weight: 600; color: var(--lab-ink); }
.tinct-chapter .scene-turns .scene-contents { margin: 0 auto; }
</style>`
}

/**
 * The header with the t button's hidden animation frames left out: a static page never animates it, and the
 * frames are most of the header's bytes on thousands of pages. The shown frame (0) is unchanged.
 */
function restingHeader(header: string): string {
  return header.replace(/<g class="lab-super-frame" data-frame="(?!0")\d+" style="opacity:0"[^>]*><g [^>]*>(?:<path [^>]*><\/path>)*<\/g><\/g>/g, '')
}

export interface ChapterPage {
  bookId: string
  chapterNumber: number
  label: string
  title: string
  html: string
}

/** What the book page adds around its first chapter (Anders, 19 Nov 2026, option B). */
export interface BookPageFrame {
  structure: StructureFacts
  source: EditionSource | null
}

/** The chapter's own name when its title says more than its position ("Chapter 1 — Loomings" → "Loomings"). */
export function chapterName(title: string, label: string): string | null {
  const plainTitle = stripUnderscoreEmphasis(title).text.trim()
  const flat = plainTitle.replace(/ — /g, ', ')
  if (flat === label) return null
  if (flat.startsWith(`${label}, `)) return plainTitle.slice(plainTitle.length - (flat.length - label.length - 2))
  if (flat.startsWith(`${label}. `)) return plainTitle.slice(label.length + 2)
  return plainTitle
}

/**
 * One chapter page; with `bookPage`, the book page (`/read/{book}`): the same first chapter under a slim header
 * (title, author, structure, a link to the chapter list), the chapter list below it, its own title and canonical.
 * `chapters` are the modern edition's, in order; `original` is the same chapter of the original.
 */
export function renderChapterPage(input: {
  book: ChapterPageBook
  chapters: readonly EditionChapter[]
  labels: Map<number, string>
  chapterNumber: number
  original: EditionChapter | null
  originalLabel: string | null
  originalLang: string
  modernLabel: string
  note: string | null
  indexable: boolean
  positions?: Map<number, { label: string; of: number | null }>
  bookPage?: BookPageFrame | null
}): ChapterPage {
  const { book, chapters, labels, chapterNumber, original, note, indexable, bookPage } = input
  const positions = input.positions ?? chapterPositions(labels)
  const index = chapters[chapterNumber - 1]?.number === chapterNumber ? chapterNumber - 1 : chapters.findIndex(chapter => chapter.number === chapterNumber)
  const chapter = chapters[index]
  if (!chapter) throw new Error(`${book.id}: no chapter ${chapterNumber}`)
  resetVerseLines()
  const label = labels.get(chapter.number)!
  const position = positions.get(chapter.number) ?? { label, of: null }
  const first = chapters[0]
  // The first chapter's own page points search engines at the book page, which is the same chapter.
  const pathOf = (number: number) => number === first.number ? bookPagePath(book.id) : chapterPagePath(book.id, number)
  const path = bookPage ? bookPagePath(book.id) : chapterPagePath(book.id, chapter.number)
  const canonical = `${CHAPTER_PAGE_ORIGIN}${pathOf(chapter.number)}`
  const title = bookPage ? bookPageTitle(book) : chapterPageTitle(book, position.label, position.of)
  const description = bookPage ? bookPageDescription(book, bookPage.structure.units, bookPage.source) : chapterPageDescription(book, position.label)
  const previous = chapters[index - 1]
  const next = chapters[index + 1]
  const lastParagraph = Math.max(0, chapter.paragraphs.length - 1)
  const reader = (action: SceneHandoffAction, at?: number) => sceneHandoffHref(book.id, chapter.number, action, at)
  const positionLabel = (target: EditionChapter) => {
    const at = positions.get(target.number)
    return at ? `${at.label}${at.of ? ` of ${at.of}` : ''}` : labels.get(target.number)!
  }
  const turn = (target: EditionChapter | undefined, rel: 'prev' | 'next') => target
    ? `<a href="${pathOf(target.number)}" rel="${rel}" data-scene-keep>${rel === 'prev' ? '← ' : ''}${escapeHtml(labels.get(target.number)!)}${rel === 'next' ? ' →' : ''}</a>`
    : '<span></span>'
  const paragraph = (text: string, at: number, prefix: string, figureClass: string) => isFigure(text)
    ? `<p class="lab-hearing-line chapter-figure ${figureClass}" aria-hidden="true"></p>`
    : prefix === 'lab-p-' ? renderParagraph(curlyQuotes(text), at) : renderParagraph(text, at, prefix).replace(` data-p="${at}"`, '')
  const name = chapterName(chapter.title, position.label)
  const headingTag = bookPage ? 'h2' : 'h1'
  const view = 'modern'
  const switchDesk = original ? viewSwitchHtml('desk', view) : ''
  const switchPhone = original ? viewSwitchHtml('phone', view) : ''
  const pageJsonLd = bookPage
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Book', '@id': `${CHAPTER_PAGE_ORIGIN}/read/${book.id}#book`, name: book.title, author: { '@type': 'Person', name: book.author },
            url: canonical, inLanguage: 'en', isAccessibleForFree: true, description,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Library', item: `${CHAPTER_PAGE_ORIGIN}/read/` },
              { '@type': 'ListItem', position: 2, name: book.title, item: canonical },
            ],
          },
        ],
      }
    : {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage', '@id': `${canonical}#page`, url: canonical, name: title.replace(/ \| Tinct$/, ''), description, inLanguage: 'en',
            isPartOf: { '@type': 'Book', '@id': `${CHAPTER_PAGE_ORIGIN}/read/${book.id}#book`, name: book.title, author: { '@type': 'Person', name: book.author }, url: `${CHAPTER_PAGE_ORIGIN}/read/${book.id}` },
            isAccessibleForFree: true,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Library', item: `${CHAPTER_PAGE_ORIGIN}/read/` },
              { '@type': 'ListItem', position: 2, name: book.title, item: `${CHAPTER_PAGE_ORIGIN}/read/${book.id}` },
              { '@type': 'ListItem', position: 3, name: position.label, item: `${CHAPTER_PAGE_ORIGIN}${chapterPagePath(book.id, chapter.number)}` },
            ],
          },
        ],
      }
  const bookHead = bookPage ? `<header class="book-head">
<h1 class="book-head-title">${escapeHtml(book.title)}</h1>
<p class="book-head-author">${escapeHtml(book.author)}</p>
<p class="book-head-facts"><span class="book-structure" id="book-structure">${escapeHtml(bookPage.structure.pill)}</span><a href="#chapters" data-scene-keep>All ${chapters.length === 1 ? 'chapters' : `${chapters.length} chapters`}</a></p>
<a class="book-resume" href="${path}" data-place-resume hidden></a>
</header>` : ''
  const chapterList = bookPage ? `<section class="book-chapters" id="chapters" aria-labelledby="chapters-title">
<h2 id="chapters-title">Chapters</h2>
<ol>
${chapters.map(item => `<li><a href="${pathOf(item.number)}" data-scene-keep>${escapeHtml(stripUnderscoreEmphasis(item.title).text)}</a></li>`).join('\n')}
</ol>
</section>` : ''
  const html = `<!doctype html>
<html lang="en" class="tinct-scene tinct-chapter" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <!--tinct:seo-->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${indexable ? '' : '<meta name="robots" content="noindex, follow">\n  '}<link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(title.replace(/ \| Tinct$/, ''))}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="${bookPage ? 'book' : 'article'}">
  <meta property="og:site_name" content="Tinct">
  <script type="application/ld+json">${JSON.stringify(pageJsonLd).replace(/</g, '\\u003c')}</script>
  <!--/tinct:seo-->
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">
  ${READER_CSS_PLACEHOLDER}
  <link rel="stylesheet" href="${CHAPTER_CSS_PLACEHOLDER}">
  <script type="module" src="${sceneAssetPlaceholder('scene-page.js')}"></script>
</head>
<body>
<div id="root">
<div class="lab is-desktop" lang="en" data-scene-page="true" data-chapter-page="true"${bookPage ? ' data-book-page="true"' : ''} data-shared-reader="true" data-continuous-reader="true" data-theme="light" data-lab-layout="desktop" data-reader-controls="desktop" data-chrome-version="v2" data-book-id="${book.id}" data-chapter="${chapter.number}" data-chapter-label="${escapeHtml(positionLabel(chapter))}" data-view="${view}" data-default-view="${view}" data-reader-edition="${SCENE_HANDOFF_EDITION}" data-scene-title="${escapeHtml(chapter.title)}" data-scene-paragraphs="${chapter.paragraphs.length}" style="${READER_ROOT_STYLE}">
<script src="${sceneAssetPlaceholder('scene-layout.js')}"></script>
${restingHeader(headerHtml(book, chapter, { labelHtml: positionHtml(position.label, position.of), switchHtml: switchDesk }))}
<div class="lab-body"><div class="lab-page-wrap">
${renderChapterMinimap(chapters, chapter.number)}
<div class="continuous-reader">
<div class="continuous-reader-paper"><div class="continuous-reader-window">
<article class="lab-passage lab-book is-reading is-compare is-aligned-compare" data-scene-text="true">
${bookHead}
<header class="lab-passage-header"><${headingTag} class="lab-passage-headline">${positionHtml(position.label, position.of)}</${headingTag}>${name ? `<p class="chapter-name">${escapeHtml(name)}</p>` : ''}${switchPhone}</header>
<div class="lab-hearing-stage chapter-pairs" data-scene-modern="true">
<div class="chapter-col chapter-col-modern">
<p class="chapter-col-head">${escapeHtml(input.modernLabel)}</p>
${chapter.paragraphs.map((text, at) => paragraph(text, at, 'lab-p-', 'is-modern')).join('\n')}
</div>
${original ? `<div class="chapter-col chapter-col-original" lang="${input.originalLang}">
<p class="chapter-col-head" lang="en">${escapeHtml(input.originalLabel || 'Original')}</p>
${original.paragraphs.map((text, at) => paragraph(text, at, 'orig-p-', 'is-original')).join('\n')}
</div>` : ''}
</div>
${next ? `<div class="chapter-continue"><a class="chapter-continue-link" href="${pathOf(next.number)}" rel="next" data-scene-keep>Continue reading: ${escapeHtml(positionLabel(next))} <span aria-hidden="true">→</span></a><p class="chapter-saved" data-place-note hidden>Your place is saved on this device. No account needed.</p></div>` : ''}
<section class="lab-chapter-end" aria-label="End of the chapter"><div class="lab-chapter-end-actions">${act('Recap', reader('recap', lastParagraph), 'recap', 'lab-chapter-recap')}${act('Quiz me', reader('quiz'), 'quiz', 'lab-chapter-recap')}</div></section>
<nav class="scene-turns" aria-label="Chapters">${turn(previous, 'prev')}<a class="scene-contents" href="/read/${book.id}#chapters" data-scene-keep>Contents</a>${turn(next, 'next')}</nav>
${note ? `<p class="chapter-note">${note}</p>` : ''}
${chapterList}
</article>
</div></div>
<aside class="scene-margin" aria-label="Margin"><section class="source-margin-item is-open is-actions is-hint"><div class="source-margin-content">
<div class="lab-first-hint" data-testid="margin-first-hint">
<p class="lab-first-hint-text">Highlight any passage to have it explained, simplified, or to ask about it.</p>
<div class="lab-start-acts">${act(`Primer for ${escapeHtml(label)}`, reader('primer'), 'primer')}</div>
</div>
${askField('Or ask about this chapter', '', 'Ask about this chapter')}
</div></section></aside>
</div>
</div></div>
${askField('Ask about this chapter', 'scene-dock', 'Ask about this chapter')}
</div>
</div>
</body>
</html>
`
  return { bookId: book.id, chapterNumber: chapter.number, label, title, html }
}

/**
 * Every chapter page of a book, in edition order; with `bookPage`, the book page too (chapterNumber 0: the build
 * writes it ahead of chapter 1 in the book's first pack).
 */
export function renderChapterPages(input: {
  book: Book
  modern: Edition
  original: Edition | null
  originalKey: string | null
  note: string | null
  indexable: boolean
  bookPage?: boolean
}): ChapterPage[] {
  const { book, modern } = input
  const originals = new Map((input.original?.chapters ?? []).map(chapter => [chapter.number, chapter]))
  const labels = chapterLabels(modern.chapters)
  const positions = chapterPositions(labels)
  const originalLang = input.originalKey?.split('-').pop() || 'en'
  const render = (chapter: EditionChapter, bookPage: BookPageFrame | null) => renderChapterPage({
    book: { id: book.id, title: book.title, author: book.author },
    chapters: modern.chapters, labels, positions, chapterNumber: chapter.number,
    original: originals.get(chapter.number) ?? null,
    originalLabel: input.originalKey ? editionLabel(book, input.originalKey) : null,
    originalLang,
    modernLabel: editionLabel(book, 'modern-en'),
    // The book page stays indexable for every book, as /read/{bookId} always was; the allowlist decides the chapters.
    note: input.note, indexable: input.indexable || !!bookPage, bookPage,
  })
  const pages = modern.chapters.map(chapter => render(chapter, null))
  if (!input.bookPage || !modern.chapters.length) return pages
  const front = render(modern.chapters[0], { structure: structureFacts(labels.values()), source: editionSource(book) })
  return [{ ...front, chapterNumber: 0 }, ...pages]
}

// ===== Shelf hubs =====

export interface ShelfHub { shelfId: string; heading: string; indexable: boolean; bookIds: string[]; html: string }

export const shelfHubPath = (shelfId: string) => `/read/shelf/${shelfId}`

/**
 * One page per library shelf (`/read/shelf/{shelf}`), built only from what the library already has: the shelf's
 * title as a one-line heading, and each book's title, cover and link to its book page. "in modern English" is
 * added to the heading only when every book listed has a Modern English edition. Indexable only when it lists an
 * indexable book.
 */
export function renderShelfHubs(input: {
  /** Books with a book page, in the registry's order. */
  books: ReadonlyArray<Pick<Book, 'id' | 'title'> & { modern: boolean; cover: string | null }>
  indexableBooks: ReadonlySet<string>
}): ShelfHub[] {
  const byId = new Map(input.books.map(book => [book.id, book]))
  const metas = LIBRARY_BOOK_META.filter(meta => byId.has(meta.id))
  const order = LIBRARY_HOUSES.flatMap(house => house.shelves)
  const shelfIds = [...order, ...Object.keys(LIBRARY_SHELVES).filter(id => !order.includes(id))]
  const hubs: ShelfHub[] = []
  for (const shelfId of shelfIds) {
    const shelf = LIBRARY_SHELVES[shelfId]
    const books = metas.filter(meta => meta.shelves.includes(shelfId)).map(meta => byId.get(meta.id)!)
    if (!shelf || !books.length) continue
    const heading = books.every(book => book.modern) ? `${shelf.title} in modern English` : shelf.title
    const indexable = books.some(book => input.indexableBooks.has(book.id))
    const canonical = `${CHAPTER_PAGE_ORIGIN}${shelfHubPath(shelfId)}`
    const items = books.map(book => `<li><a href="/read/${book.id}">${book.cover ? `<img src="${escapeHtml(book.cover)}" alt="" width="180" height="270" loading="lazy" decoding="async">` : '<span class="hub-cover-blank" aria-hidden="true"></span>'}<span class="tui-book-title">${escapeHtml(book.title)}</span></a></li>`).join('\n')
    const jsonLd = {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${canonical}#page`, url: canonical, name: heading,
      hasPart: books.map(book => ({ '@type': 'Book', name: book.title, url: `${CHAPTER_PAGE_ORIGIN}/read/${book.id}` })),
    }
    const html = `<!doctype html>
<html lang="en" data-tui-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!--tinct:seo-->
  <title>${escapeHtml(heading)} | Tinct</title>
  ${indexable ? '' : '<meta name="robots" content="noindex, follow">\n  '}<link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(heading)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Tinct">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  <!--/tinct:seo-->
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">
  <link rel="stylesheet" href="/lab/tinct-ui.css?v=20261009rel10">
  <style>
    html, body { margin: 0; background: var(--tui-paper); color: var(--tui-ink); }
    body { font-family: var(--tui-font-ui); -webkit-font-smoothing: antialiased; }
    .hub-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px max(20px, 2.5vw); }
    .hub-top a { color: var(--tui-ink); text-decoration: none; font-size: var(--tui-text-ui); }
    .hub-top .hub-logo { font-family: var(--tui-font-serif); font-size: 30px; letter-spacing: -1.5px; }
    .hub-links { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px 20px; }
    main { max-width: 1180px; margin: 0 auto; padding: 24px max(20px, 2.5vw) 80px; }
    /* Two families on the screen: the books' serif (title and book titles) and the system face for the links. */
    h1 { margin: 0 0 32px; font: 500 var(--tui-text-3xl)/1.1 var(--tui-font-serif); letter-spacing: -.01em; }
    .hub-books { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 32px 24px; }
    .hub-books a { display: grid; gap: 10px; color: var(--tui-ink); text-decoration: none; }
    .hub-books img, .hub-cover-blank { display: block; width: 100%; height: auto; aspect-ratio: 2 / 3; border-radius: 2px; box-shadow: var(--tui-shadow-sm); background: var(--tui-surface-2); }
    .hub-books .tui-book-title { font-size: var(--tui-text-body); line-height: 1.25; }
    .hub-books a:hover .tui-book-title, .hub-books a:focus-visible .tui-book-title { text-decoration: underline; text-underline-offset: 3px; }
    @media (max-width: 520px) { .hub-books { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 16px; } }
  </style>
</head>
<body>
<nav class="hub-top"><a class="hub-logo" href="/">tinct</a><span class="hub-links"><a href="/modern-english">Every classic in modern English</a><a href="/read/">Library</a></span></nav>
<main>
<h1>${escapeHtml(heading)}</h1>
<ul class="hub-books">
${items}
</ul>
</main>
</body>
</html>
`
    hubs.push({ shelfId, heading, indexable, bookIds: books.map(book => book.id), html })
  }
  return hubs
}
