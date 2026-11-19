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
  readIntentPageDescription, readIntentPageTitle, renderParagraph, sceneAssetPlaceholder, sceneHandoffHref, type Edition, type EditionChapter,
} from './scenePages'

export { editionNoteHtml, editionSource, SEO_INDEX_ALLOWLIST, sceneAssetPlaceholder }

/** The edition source of a registry book by id (null for an unknown id or source). */
export function editionSourceFor(bookId: string): EditionSource | null {
  const book = BOOKS.find(entry => entry.id === bookId)
  return book ? editionSource(book) : null
}
export const CHAPTER_PAGE_ORIGIN = SCENE_PAGE_ORIGIN
const MAX_META_DESCRIPTION_CHARS = 155
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

export function chapterPageTitle(book: ChapterPageBook, label: string): string {
  return readIntentPageTitle(book.title, label)
}

export function chapterPageDescription(book: ChapterPageBook, label: string): string {
  return readIntentPageDescription(book.title, label)
}

export const chapterPagePath = (bookId: string, chapter: number) => `/read/${bookId}/chapter-${chapter}`

const isFigure = (text: string) => text.startsWith(FIGURE_MARK)
const plain = (text: string) => stripUnderscoreEmphasis(text).text.replace(/\s+/g, ' ').trim()

/** The chapter's own opening words, clipped at a word (the pages' description until 19 Nov 2026; see chapterPageDescription). */
export function chapterDescription(paragraphs: readonly string[]): string {
  const text = paragraphs.filter(paragraph => !isFigure(paragraph)).map(plain).filter(Boolean).join(' ')
  if (text.length <= MAX_META_DESCRIPTION_CHARS) return text
  const clipped = text.slice(0, MAX_META_DESCRIPTION_CHARS - 1).replace(/\s+\S*$/, '').replace(/[\s,;:—–-]+$/, '')
  return `${clipped}…`
}

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
.tinct-chapter .lab.is-desktop .continuous-reader-paper { width: min(calc(70rem + 2 * var(--continuous-paper-pad, 3rem)), calc(100% - clamp(16rem, 24vw, 22rem) - clamp(3.5rem, 6vw, 6rem))); margin-left: clamp(3.5rem, 6vw, 6rem); }
.tinct-chapter .chapter-pairs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-auto-flow: row dense; column-gap: 52px; position: relative; }
.tinct-chapter .chapter-pairs::after { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: var(--lab-border, rgba(123, 110, 90, .18)); opacity: .6; }
.tinct-chapter .chapter-col { display: contents; }
.tinct-chapter .chapter-col-modern > * { grid-column: 1; }
.tinct-chapter .chapter-col-original > * { grid-column: 2; }
.tinct-chapter .chapter-col-head { margin: 0 0 12px; font: 400 14px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--lab-ink-muted); }
.tinct-chapter .lab.is-desktop .chapter-pairs .lab-hearing-line { font-size: calc(1.08rem * (var(--lab-font-size, 1.3) / 1.3)); line-height: 1.55; }
.tinct-chapter .chapter-col-original .lab-hearing-line { color: var(--lab-ink-muted); }
.tinct-chapter .chapter-figure { margin: 0; }
.tinct-chapter .chapter-note { margin: 34px 0 0; padding-top: 16px; border-top: 1px solid var(--lab-border, rgba(32,26,19,.12)); font: 400 15px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--lab-ink-muted); }
.tinct-chapter .chapter-note strong { font-weight: 600; color: var(--lab-ink); }
.tinct-chapter .scene-turns .scene-contents { margin: 0 auto; }
.tinct-chapter .lab.is-phone .chapter-pairs { display: block; }
.tinct-chapter .lab.is-phone .chapter-pairs::after { content: none; }
.tinct-chapter .lab.is-phone .chapter-col { display: block; }
.tinct-chapter .lab.is-phone .chapter-col-original { margin-top: 34px; padding-top: 18px; border-top: 1px solid var(--lab-border, rgba(32,26,19,.12)); }
@media (max-width: 1100px) { .tinct-chapter .lab.is-desktop .continuous-reader-paper { width: calc(100% - 320px); margin-left: 56px; } .tinct-chapter .chapter-pairs { column-gap: 32px; } }
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

/** One chapter page. `chapters` are the modern edition's, in order; `original` is the same chapter of the original. */
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
}): ChapterPage {
  const { book, chapters, labels, chapterNumber, original, note, indexable } = input
  const index = chapters[chapterNumber - 1]?.number === chapterNumber ? chapterNumber - 1 : chapters.findIndex(chapter => chapter.number === chapterNumber)
  const chapter = chapters[index]
  if (!chapter) throw new Error(`${book.id}: no chapter ${chapterNumber}`)
  resetVerseLines()
  const label = labels.get(chapter.number)!
  const path = chapterPagePath(book.id, chapter.number)
  const canonical = `${CHAPTER_PAGE_ORIGIN}${path}`
  const title = chapterPageTitle(book, label)
  const description = chapterPageDescription(book, label)
  const previous = chapters[index - 1]
  const next = chapters[index + 1]
  const lastParagraph = Math.max(0, chapter.paragraphs.length - 1)
  const reader = (action: SceneHandoffAction, at?: number) => sceneHandoffHref(book.id, chapter.number, action, at)
  const turn = (target: EditionChapter | undefined, rel: 'prev' | 'next') => target
    ? `<a href="${chapterPagePath(book.id, target.number)}" rel="${rel}" data-scene-keep>${rel === 'prev' ? '← ' : ''}${escapeHtml(labels.get(target.number)!)}${rel === 'next' ? ' →' : ''}</a>`
    : '<span></span>'
  const paragraph = (text: string, at: number, prefix: string, figureClass: string) => isFigure(text)
    ? `<p class="lab-hearing-line chapter-figure ${figureClass}" aria-hidden="true"></p>`
    : prefix === 'lab-p-' ? renderParagraph(text, at) : renderParagraph(text, at, prefix).replace(` data-p="${at}"`, '')
  const jsonLd = {
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
          { '@type': 'ListItem', position: 3, name: label, item: canonical },
        ],
      },
    ],
  }
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
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Tinct">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  <!--/tinct:seo-->
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">
  ${READER_CSS_PLACEHOLDER}
  <link rel="stylesheet" href="${CHAPTER_CSS_PLACEHOLDER}">
  <script type="module" src="${sceneAssetPlaceholder('scene-page.js')}"></script>
</head>
<body>
<div id="root">
<div class="lab is-desktop" lang="en" data-scene-page="true" data-chapter-page="true" data-shared-reader="true" data-continuous-reader="true" data-theme="light" data-lab-layout="desktop" data-reader-controls="desktop" data-chrome-version="v2" data-book-id="${book.id}" data-chapter="${chapter.number}" data-reader-edition="${SCENE_HANDOFF_EDITION}" data-scene-title="${escapeHtml(chapter.title)}" data-scene-paragraphs="${chapter.paragraphs.length}" style="${READER_ROOT_STYLE}">
<script src="${sceneAssetPlaceholder('scene-layout.js')}"></script>
${restingHeader(headerHtml(book, chapter))}
<div class="lab-body"><div class="lab-page-wrap">
${renderChapterMinimap(chapters, chapter.number)}
<div class="continuous-reader">
<div class="continuous-reader-paper"><div class="continuous-reader-window">
<article class="lab-passage lab-book is-reading is-compare is-aligned-compare" data-scene-text="true">
<header class="lab-passage-header"><h1 class="lab-passage-headline">${escapeHtml(stripUnderscoreEmphasis(chapter.title).text)}</h1></header>
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
<section class="lab-chapter-end" aria-label="End of the chapter"><div class="lab-chapter-end-actions">${act('Recap', reader('recap', lastParagraph), 'recap', 'lab-chapter-recap')}${act('Quiz me', reader('quiz'), 'quiz', 'lab-chapter-recap')}</div></section>
<nav class="scene-turns" aria-label="Chapters">${turn(previous, 'prev')}<a class="scene-contents" href="/read/${book.id}#chapters" data-scene-keep>Contents</a>${turn(next, 'next')}</nav>
${note ? `<p class="chapter-note">${note}</p>` : ''}
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

/** Every chapter page of a book, in edition order. */
export function renderChapterPages(input: {
  book: Book
  modern: Edition
  original: Edition | null
  originalKey: string | null
  note: string | null
  indexable: boolean
}): ChapterPage[] {
  const { book, modern } = input
  const originals = new Map((input.original?.chapters ?? []).map(chapter => [chapter.number, chapter]))
  const labels = chapterLabels(modern.chapters)
  const originalLang = input.originalKey?.split('-').pop() || 'en'
  return modern.chapters.map(chapter => renderChapterPage({
    book: { id: book.id, title: book.title, author: book.author },
    chapters: modern.chapters, labels, chapterNumber: chapter.number,
    original: originals.get(chapter.number) ?? null,
    originalLabel: input.originalKey ? editionLabel(book, input.originalKey) : null,
    originalLang,
    modernLabel: editionLabel(book, 'modern-en'),
    note: input.note, indexable: input.indexable,
  }))
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
<nav class="hub-top"><a class="hub-logo" href="/">tinct</a><a href="/read/">Library</a></nav>
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
