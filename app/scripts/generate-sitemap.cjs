#!/usr/bin/env node
/**
 * generate-sitemap.cjs — regenerates app/public/sitemap.xml from the book
 * registry and on-disk SEO pages.
 *
 * Sources of truth:
 *   - app/src/data/bookRegistry.ts → public book list (BOOKS array)
 *   - app/public/read/{bookId}/    → which books have static SEO pages
 *   - app/public/data/editions/{bookId}-modern-en.json → chapter count
 *
 * The sitemap lists only real pages: /, /about, /credits, /story, /privacy, /terms, /copyright,
 * /read/, one /read/{bookId} per public book, the scene pages the build wrote
 * (/read/{bookId}/{scene}, scripts/seo/build-scene-pages.mjs, which runs first), the chapter pages of
 * the indexable books and the shelf hubs that list one (scripts/seo/build-chapter-pages.mjs). Each
 * <lastmod> changes only when that page's content does (see sitemap-lastmod.json).
 *
 * Why static rather than worker-generated: keeping the sitemap in
 * public/sitemap.xml means it ships unchanged through the existing build →
 * verify-bundle → wrangler pipeline; no runtime cost, no extra route to
 * maintain. Generation is a build-time script, not a CI dependency.
 *
 * Run via `npm run sitemap` or automatically via `npm run prebuild`.
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const REGISTRY = path.join(APP_DIR, 'src/data/bookRegistry.ts')
const EDITIONS_DIR = path.join(APP_DIR, 'public/data/editions')
const READ_DIR = path.join(APP_DIR, 'public/read')
const OUT_SITEMAP = path.join(APP_DIR, 'public/sitemap.xml')
const OUT_META = path.join(APP_DIR, 'src/data/bookMetaGenerated.ts')

const ORIGIN = 'https://tinct.app'
const BUILD_DATE = new Date().toISOString().slice(0, 10)
const SEO_EXCERPT_WORDS = 1200
const MAX_META_TITLE_CHARS = 60
const MAX_META_DESCRIPTION_CHARS = 155
const DEFAULT_OG_IMAGE = `${ORIGIN}/og-image-v3.jpg`
// Hand-set meta for a book, used before the generated text. The Odyssey's stale hand-tuned title, which
// promised an AI companion and an audiobook, was removed (16 Nov 2026): it is titled like every other book,
// and its description names only the editions.
const MANUAL_BOOK_META = {
  odyssey: {
    description: 'The Odyssey by Homer in modern English, with the original edition to compare. Read free, no ads.',
  },
}

// --- Parse the registry --------------------------------------------------

function loadPublicBooks() {
  const src = fs.readFileSync(REGISTRY, 'utf8')

  // Per-const block: pull id/title/author/description out of the literal.
  const constToBook = new Map()
  const blockRe = /export const ([A-Z][A-Z0-9_]*):\s*Book\s*=\s*\{([\s\S]*?)\n\}/g
  let m
  while ((m = blockRe.exec(src))) {
    const constName = m[1]
    const body = m[2]
    const id = pickString(body, 'id')
    const title = pickString(body, 'title')
    const author = pickString(body, 'author')
    const description = pickString(body, 'description')
    // Contemporary books with no Modern English edition (Book.noModernEdition).
    const noModernEdition = /\bnoModernEdition:\s*true\b/.test(body)
    if (id) constToBook.set(constName, { id, title, author, description, noModernEdition })
  }

  // The BOOKS array is the public list. Only include those — local-only
  // books and exports that aren't in BOOKS get skipped.
  const booksLine = src.match(/export const BOOKS:\s*Book\[\]\s*=\s*\[([^\]]*)\]/)
  if (!booksLine) throw new Error('Could not find `export const BOOKS` in bookRegistry.ts')
  const constNames = booksLine[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const books = []
  for (const name of constNames) {
    const book = constToBook.get(name)
    if (!book) {
      console.warn(`[sitemap] BOOKS references ${name} but no const definition with that name was found — skipping.`)
      continue
    }
    if (!require('../src/data/editionAvailability.json').wholeBooks.includes(book.id)) books.push(book)
  }
  return books
}

/**
 * Extract a single-line string field from a Book literal body. Handles both
 * single-quoted and double-quoted forms; backtick template literals (used
 * for multi-line copy in some entries) are left to the caller to fall back
 * on, since regex-parsing them across lines is fragile.
 */
function pickString(body, field) {
  const re = new RegExp(`\\b${field}:\\s*(['"])((?:\\\\.|(?!\\1)[^\\\\])*)\\1`)
  const match = body.match(re)
  if (!match) return ''
  return match[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ')
}

// --- Helpers -------------------------------------------------------------

function chapterCount(bookId) {
  const file = path.join(EDITIONS_DIR, `${bookId}-modern-en.json`)
  if (!fs.existsSync(file)) return 0
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return Array.isArray(data.chapters) ? data.chapters.length : 0
  } catch (err) {
    console.warn(`[sitemap] Failed to read chapters for ${bookId}: ${err.message}`)
    return 0
  }
}

// Mirrors MACHINE_MADE_ORIGINALS in src/data/editionDefaults.ts: labelled
// "original" but machine-made, so never the edition a static page shows.
const MACHINE_MADE_ORIGINALS = new Set(['fear-and-trembling/original-en'])

function preferredEditionPath(bookId) {
  const candidates = [
    path.join(EDITIONS_DIR, `${bookId}-original-en.json`),
    path.join(EDITIONS_DIR, `${bookId}-modern-en.json`),
    path.join(EDITIONS_DIR, `${bookId}-original-de.json`),
    // The Bible's reading edition.
    path.join(EDITIONS_DIR, `${bookId}-bsb-en.json`),
  ]
  const holds = require('../src/data/editionAvailability.json').editions
  const key = file => bookId + '/' + path.basename(file).slice(bookId.length + 1, -5)
  return candidates.find(file => !holds[key(file)] && !MACHINE_MADE_ORIGINALS.has(key(file)) && fs.existsSync(file))
}

function loadPreferredEdition(bookId) {
  const file = preferredEditionPath(bookId)
  if (!file || !fs.existsSync(file)) return null
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!Array.isArray(data.chapters)) return null
    return { file, data }
  } catch (err) {
    console.warn(`[sitemap] Failed to read SEO edition for ${bookId}: ${err.message}`)
    return null
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Project Gutenberg's `_emphasis_` markup, as the reader reads it (src/lab/emphasisText.ts, UNDERSCORE_EMPHASIS_RE):
// a matched pair at token edges is emphasis; nothing else about the text changes.
const UNDERSCORE_EMPHASIS_RE = /\b_([^_\n]+)_\b/g

/** Escaped text with Gutenberg `_emphasis_` as <em>. An unmatched marker left at a word's edge (a clipped excerpt) is dropped. */
function emphasisHtml(value) {
  const text = String(value || '')
  const loose = part => escapeHtml(part.replace(/(^|\s)_(?=\S)/g, '$1').replace(/(\S)_(?=\s|$|\.\.\.)/g, '$1'))
  let out = ''
  let last = 0
  for (const match of text.matchAll(UNDERSCORE_EMPHASIS_RE)) {
    out += `${loose(text.slice(last, match.index))}<em>${escapeHtml(match[1])}</em>`
    last = match.index + match[0].length
  }
  return out + loose(text.slice(last))
}

function plainText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function clipAtWord(text, maxChars, suffix = '...') {
  const normalized = plainText(text)
  if (normalized.length <= maxChars) return normalized
  const room = Math.max(1, maxChars - suffix.length)
  const clipped = normalized.slice(0, room).replace(/\s+\S*$/, '').trimEnd()
  return `${clipped || normalized.slice(0, room).trimEnd()}${suffix}`
}

function cappedWithFixedParts(prefix, middle, suffix, maxChars) {
  const cleanPrefix = String(prefix || '').replace(/\s+/g, ' ')
  const cleanMiddle = plainText(middle)
  const cleanSuffix = String(suffix || '').replace(/\s+/g, ' ')
  const full = `${cleanPrefix}${cleanMiddle}${cleanSuffix}`
  if (full.length <= maxChars) return full

  const room = maxChars - cleanPrefix.length - cleanSuffix.length
  if (room <= 4) return clipAtWord(full, maxChars)
  return `${cleanPrefix}${clipAtWord(cleanMiddle, room)}${cleanSuffix}`
}

// --- Scene pages (scripts/seo/build-scene-pages.mjs) ----------------------

const SCENE_MANIFEST = path.join(APP_DIR, 'src/data/scenePages.generated.json')
let sceneManifest = null
/** The scenes the build wrote a page for, in reading order; [] for a book without scene pages. */
function scenePagesOf(bookId) {
  if (!sceneManifest) {
    try { sceneManifest = JSON.parse(fs.readFileSync(SCENE_MANIFEST, 'utf8')).books || {} } catch { sceneManifest = {} }
  }
  return (sceneManifest[bookId] || []).filter(scene => fs.existsSync(path.join(READ_DIR, bookId, `${scene.slug}.html`)))
}

// --- Chapter pages and edition notes (scripts/seo/build-chapter-pages.mjs) ---

const CHAPTER_MANIFEST = path.join(APP_DIR, 'src/data/chapterPages.generated.json')
const EDITION_NOTES = path.join(APP_DIR, 'src/data/editionNotes.generated.json')
const CHAPTER_PACK_DIR = path.join(APP_DIR, 'public/seo/chapter-packs')
let chapterManifest = null
function loadChapterManifest() {
  if (!chapterManifest) {
    try { chapterManifest = JSON.parse(fs.readFileSync(CHAPTER_MANIFEST, 'utf8')) } catch { chapterManifest = {} }
    chapterManifest.books ||= {}
    chapterManifest.hubs ||= {}
  }
  return chapterManifest
}
/** The book's chapter pages ({ chapters, packs, indexable, original, labels }), or null. */
function chapterPagesOf(bookId) {
  return loadChapterManifest().books[bookId] || null
}
let editionNotes = null
/** The book's edition note (HTML, Anders's exact wording), or '' when its source is unknown. */
function editionNoteOf(bookId) {
  if (!editionNotes) {
    try { editionNotes = JSON.parse(fs.readFileSync(EDITION_NOTES, 'utf8')).books || {} } catch { editionNotes = {} }
  }
  return editionNotes[bookId] || ''
}

const PLAY_BOOK_PAGE_DIR = path.join(APP_DIR, 'public/seo/book-pages')
/**
 * The book page the Worker serves at /read/{bookId} since 19 Nov 2026 (docs/seo-brief-2026-11-19.md §1): the first
 * chapter (page 0 of the book's first chapter pack) or the play's first scene, under the book's header. Null when
 * the build wrote none (the book keeps the library page).
 */
function readingBookPage(bookId) {
  const play = path.join(PLAY_BOOK_PAGE_DIR, `${bookId}.html`)
  if (scenePagesOf(bookId).length && fs.existsSync(play)) return fs.readFileSync(play, 'utf8')
  if (!chapterPagesOf(bookId)?.bookPage) return null
  const pack = path.join(CHAPTER_PACK_DIR, bookId, '0.txt')
  if (!fs.existsSync(pack)) return null
  const parts = fs.readFileSync(pack, 'utf8').split(/<!--tinct:chapter-page (\d+)-->\n/)
  return parts[1] === '0' ? parts[2] : null
}
const unescapeHtml = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
/** The reading book page's own title and description (one source of truth: the page renderer). */
function readingBookMeta(bookId) {
  const html = readingBookPage(bookId)
  if (!html) return null
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1]
  return title && description ? { title: unescapeHtml(title), description: unescapeHtml(description) } : null
}

/** Whether readers get a Modern English edition of the book (served and not held). */
function hasModernEdition(book) {
  if (book.noModernEdition || PUBLISHER_PERMISSIONS[book.id]) return false
  const holds = require('../src/data/editionAvailability.json').editions
  return !holds[`${book.id}/modern-en`] && fs.existsSync(path.join(EDITIONS_DIR, `${book.id}-modern-en.json`))
}

/**
 * The book page's title leads with what only Tinct has: the book in modern English (13 Nov 2026; it read
 * "Read Hamlet Free Online | Tinct"). A play with scene pages says so.
 */
function seoBookTitle(book) {
  const manual = MANUAL_BOOK_META[book.id]
  if (manual?.title) return manual.title
  const reading = readingBookMeta(book.id)
  if (reading) return reading.title
  const title = plainText(book.title)
  const candidates = hasModernEdition(book)
    ? [
        ...(scenePagesOf(book.id).length ? [`${title} in modern English, scene by scene | Tinct`] : []),
        `${title} in modern English, free to read | Tinct`,
        `${title} in modern English | Tinct`,
      ]
    : [`Read ${title} Free Online | Tinct`]
  const fits = candidates.find(candidate => candidate.length <= MAX_META_TITLE_CHARS)
  if (fits) return fits
  return cappedWithFixedParts(hasModernEdition(book) ? '' : 'Free Classic Reader: ', book.title, hasModernEdition(book) ? ' in modern English | Tinct' : ' | Tinct', MAX_META_TITLE_CHARS)
}

function seoChapterTitle(book, chapterTitle) {
  return cappedWithFixedParts('Free Chapter: ', `${book.title} - ${chapterTitle}`, ' | Tinct', MAX_META_TITLE_CHARS)
}

// In-copyright books published by permission (src/data/publisherPermissions.json).
const PUBLISHER_PERMISSIONS = require('../src/data/publisherPermissions.json').books

function seoBookDescription(book) {
  const manual = MANUAL_BOOK_META[book.id]
  if (manual?.description) return manual.description
  const reading = readingBookMeta(book.id)
  if (reading) return reading.description
  // No Modern English, narration or cast guide to advertise, and never "classic".
  if (book.noModernEdition || PUBLISHER_PERMISSIONS[book.id]) {
    return clipAtWord(`Read ${book.title} free, no ads, with an AI reading companion. On Tinct with the publisher's permission.`, MAX_META_DESCRIPTION_CHARS)
  }
  if (scenePagesOf(book.id).length && hasModernEdition(book)) {
    const play = `${book.title} scene by scene in modern English, with Shakespeare's original text. Read free, no ads, with an AI companion that explains any line.`
    if (play.length <= MAX_META_DESCRIPTION_CHARS) return play
  }
  if (hasModernEdition(book)) {
    const options = [
      `${book.title} by ${book.author} in modern English, with the original edition to compare. Read free, no ads, with an AI companion that explains any passage.`,
      `${book.title} in modern English, with the original edition to compare. Read free, no ads, with an AI companion that explains any passage.`,
      `${book.title} in modern English, with the original to compare. Read free, no ads, with an AI companion.`,
    ]
    const fits = options.find(option => option.length <= MAX_META_DESCRIPTION_CHARS)
    if (fits) return fits
  }
  const full = `Read free, no ads. Modern English compare, AI companion, cast guide, and audio for ${book.title}.`
  if (full.length <= MAX_META_DESCRIPTION_CHARS) return full
  const compact = `Read free, no ads. Modern compare, AI guide, cast, and audio for ${book.title}.`
  return clipAtWord(compact, MAX_META_DESCRIPTION_CHARS)
}

function capMetaDescription(text) {
  return clipAtWord(text, MAX_META_DESCRIPTION_CHARS)
}

function truncateWords(text, maxWords = SEO_EXCERPT_WORDS) {
  const words = plainText(text).split(' ').filter(Boolean)
  if (words.length <= maxWords) return words.join(' ')
  return `${words.slice(0, maxWords).join(' ')}...`
}

function paragraphExcerpt(paragraphs, maxWords = SEO_EXCERPT_WORDS) {
  const result = []
  let count = 0
  for (const raw of paragraphs || []) {
    const text = plainText(raw)
    // A figure stands in the text as one token (\uFFFC + id): not prose.
    if (!text || text.startsWith('\uFFFC')) continue
    const words = text.split(' ').filter(Boolean)
    if (count >= maxWords) break
    const remaining = maxWords - count
    result.push(words.length > remaining ? `${words.slice(0, remaining).join(' ')}...` : text)
    count += Math.min(words.length, remaining)
  }
  return result
}

function metaDescription(book, chapter, paragraphs) {
  const first = plainText((paragraphs || []).join(' '))
  const base = first
    ? truncateWords(first, 28)
    : `Read ${book.title} by ${book.author} free online on Tinct.`
  return capMetaDescription(base)
}

function seoStyles() {
  return `<style>
    :root { --paper: #ece7db; --ink: #0b0b0b; --dim: #6a6555; --accent: #1f4a5c; --rule: rgba(11, 11, 11, 0.12); color-scheme: light; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { min-height: 100vh; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'IBM Plex Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.6; }
    a { color: inherit; }
    nav.top { padding: 24px 48px; border-bottom: 1px solid var(--ink); display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; text-decoration: none; color: var(--ink); }
    .logo span { color: var(--accent); }
    .top-cta { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink); text-decoration: none; border: 1px solid var(--ink); padding: 8px 14px; transition: background 0.15s, color 0.15s; }
    .top-cta:hover { background: var(--ink); color: var(--paper); }
    main { max-width: 1180px; margin: 0 auto; padding: 64px 48px 96px; }
    .breadcrumb { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 24px; }
    .breadcrumb a { color: var(--dim); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }
    .breadcrumb span { color: var(--ink); }
    .booknum { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 6px; }
    h1.title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.3rem, 6vw, 4.3rem); line-height: 1.02; font-weight: 700; letter-spacing: -0.015em; color: var(--ink); margin: 0 0 12px 0; }
    .byline { font-family: 'EB Garamond', Georgia, serif; color: var(--dim); font-size: 22px; margin: 0 0 24px; }
    .hook { font-family: 'EB Garamond', Georgia, serif; font-size: 24px; font-style: italic; color: var(--ink); margin: 0 0 32px 0; max-width: 850px; }
    .primary-cta { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink); text-decoration: none; border: 1px solid var(--ink); padding: 10px 14px; margin: 0 0 44px; transition: background 0.15s, color 0.15s; }
    .primary-cta:hover { background: var(--ink); color: var(--paper); }
    .glance-section { margin: 10px 0 54px; padding: 18px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
    .glance-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 12px; }
    .glance { list-style: none; counter-reset: gl; padding: 0; margin: 0; display: grid; gap: 4px; }
    .glance li { counter-increment: gl; }
    .glance li a { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; color: var(--ink); text-decoration: none; display: flex; gap: 12px; align-items: baseline; padding: 4px 0; }
    .glance li a:hover { color: var(--accent); }
    .glance-num { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.14em; color: var(--dim); min-width: 80px; }
    .glance-text { flex: 1; }
    h2.section { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.8rem, 4vw, 2.4rem); line-height: 1.05; font-weight: 700; letter-spacing: -0.015em; margin: 0 0 14px 0; color: var(--ink); }
    .body { max-width: 860px; }
    .body p { font-family: 'EB Garamond', Georgia, serif; font-size: 20px; line-height: 1.6; margin: 0 0 16px 0; }
    footer.site { padding: 24px 48px; border-top: 1px solid var(--ink); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
    footer.site a { color: inherit; text-decoration: none; transition: color 0.15s; }
    footer.site a:hover { color: var(--accent); }
    .footer-links { display: flex; gap: 18px; flex-wrap: wrap; }
    @media (max-width: 960px) { main { padding: 48px 32px 80px; } }
    @media (max-width: 720px) {
      nav.top { padding: 18px 22px; }
      .top-cta { font-size: 10px; letter-spacing: 0.14em; padding: 7px 10px; }
      main { padding: 32px 22px 56px; }
      .hook { font-size: 21px; }
      .glance li a { display: block; }
      .glance-num { display: block; min-width: 0; margin-bottom: 2px; }
      footer.site { padding: 22px; flex-direction: column; align-items: flex-start; }
    }
  </style>`
}

function pageShell({ title, description, canonical, body, jsonLd, image = DEFAULT_OG_IMAGE, styles = seoStyles(), preload = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!--tinct:seo-->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="book">
  <meta property="og:site_name" content="Tinct">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
  <!--/tinct:seo-->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">
  ${preload}
  ${styles}
</head>
<body>
${body}
</body>
</html>
`
}

const LIBRARY_ASSETS = '/lab/library_2/assets'
// Books the library paints in their own room; everyone else sits on the
// evening reading table, so a shared link looks the same at any hour.
const BOOK_SCENES = {
  frankenstein: ['room-wide-v2.jpg', 'room-sharp.jpg'],
  meditations: ['scene-meditations-wide.jpg', 'scene-meditations-phone.jpg'],
  'the-prince': ['scene-the-prince-wide.jpg', 'scene-the-prince-phone.jpg'],
  'crime-and-punishment': ['scene-crime-and-punishment-wide.jpg', 'scene-crime-and-punishment-phone.jpg'],
  odyssey: ['scene-odyssey-wide.jpg', 'scene-odyssey-phone.jpg'],
  'pride-and-prejudice': ['scene-pride-and-prejudice-wide.jpg', 'scene-pride-and-prejudice-phone.jpg'],
}
const EVENING_TABLE = ['table-evening-wide.jpg', 'table-evening-phone.jpg']

let reviewedHooks = null
/** The library's reviewed hero question per book (public/lab/library_2/reviewed-introductions.js). */
function reviewedHook(bookId) {
  if (!reviewedHooks) {
    reviewedHooks = {}
    try {
      const src = fs.readFileSync(path.join(APP_DIR, 'public/lab/library_2/reviewed-introductions.js'), 'utf8')
      const marker = 'export const reviewedHooks = '
      const start = src.indexOf(marker) + marker.length
      const end = src.indexOf('\n};', start) + 2
      // A plain object literal with line comments; evaluate it in isolation.
      reviewedHooks = require('vm').runInNewContext(`(${src.slice(start, end)})`)
    } catch (err) {
      console.warn('[sitemap] reviewed hooks unavailable:', err.message)
    }
  }
  return reviewedHooks[bookId] || ''
}

/**
 * What the library hero shows for a linked book, the same fields app.js
 * paints: the Worker prefills the hero from this so the book is on the table
 * from the first paint (src/worker/lib/bookLibraryPage.ts).
 */
function libraryHero(book) {
  const data = {
    id: book.id,
    title: book.title,
    author: book.author,
    question: reviewedHook(book.id) || libraryBlurb(book.id) || '',
    cover: bookCoverSrc(book.id),
    portrait: authorPortrait(book),
  }
  return `<script type="application/json" id="tinct-book-hero">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

let authorImages = null
// The library's own fallback portraits by author name (public/lab/library_2/authors.js), for a book the author
// image manifest does not list.
const AUTHOR_PORTRAITS = [
  [/Jane Austen/i, 'jane-austen', 'Jane Austen, drawn by her sister Cassandra Austen'],
  [/Dostoevsky|Dostoyevsky/i, 'dostoevsky', 'Fyodor Dostoevsky, painted by Vasily Perov'],
  [/Machiavelli/i, 'machiavelli', 'Niccolò Machiavelli, painted by Santi di Tito'],
  [/^Homer$/i, 'homer', 'An ancient imagined likeness of Homer, British Museum'],
  [/Marcus Aurelius/i, 'marcus-aurelius', 'Sculpted portrait of Marcus Aurelius'],
]
/**
 * The author portrait the library's flap shows for a book (public/lab/library_2/author-images.json, then
 * authors.js), as an absolute address; null when the library has none, so the page shows no portrait rather than
 * another author's.
 */
function authorPortrait(book) {
  if (!authorImages) {
    try { authorImages = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'public/lab/library_2/author-images.json'), 'utf8')) } catch { authorImages = { images: [], books: [] } }
  }
  const entry = (authorImages.books || []).find(item => item.bookId === book.id)
  const image = entry && (authorImages.images || []).find(item => item.id === (entry.imageIds || [])[0])
  if (image?.publicPath && fs.existsSync(path.join(APP_DIR, 'public', image.publicPath))) return { src: image.publicPath, alt: image.alt || '' }
  const fallback = AUTHOR_PORTRAITS.find(([pattern]) => pattern.test(book.author || ''))
  const src = fallback && `/lab/library_2/assets/authors/${fallback[1]}.jpg`
  return src && fs.existsSync(path.join(APP_DIR, 'public', src)) ? { src, alt: fallback[2] } : null
}

let taxonomy = null
/**
 * The library taxonomy (src/data/libraryTaxonomy.ts): its books in order, shelves and houses. The three
 * exports are JSON literals, read as JSON.
 */
function libraryTaxonomy() {
  if (!taxonomy) {
    taxonomy = { books: [], shelves: {}, houses: [] }
    try {
      const src = fs.readFileSync(path.join(APP_DIR, 'src/data/libraryTaxonomy.ts'), 'utf8')
      const literal = (marker, close) => {
        const start = src.indexOf(marker) + marker.length
        if (start < marker.length) throw new Error(`${marker} not found`)
        return JSON.parse(src.slice(start, src.indexOf(close, start) + 2))
      }
      taxonomy.books = literal('LIBRARY_BOOK_META: LibraryBookMeta[] = ', '\n]\n')
      taxonomy.shelves = literal('LIBRARY_SHELVES: Record<string, LibraryShelf> = ', '\n}\n')
      taxonomy.houses = literal('LIBRARY_HOUSES: LibraryHouse[] = ', '\n]\n')
    } catch (err) {
      console.warn('[sitemap] library taxonomy unavailable:', err.message)
    }
  }
  return taxonomy
}

/** The library's one-line blurb per book (src/data/libraryTaxonomy.ts). */
function libraryBlurb(bookId) {
  return libraryTaxonomy().books.find(meta => meta.id === bookId)?.blurb || ''
}

const RELATED_BOOKS_MAX = 6
const RELATED_BOOKS_MIN = 4
/**
 * Related books for a book page: the same author first, then the same shelf, then (only to reach four) the same
 * house and then the same era, each in the library's order. Only books with a page of their own; at most six.
 */
function relatedBooks(book, books) {
  const { books: metas, houses } = libraryTaxonomy()
  const pages = new Map(books.filter(other => other.id !== book.id).map(other => [other.id, other]))
  const order = [...metas.map(meta => meta.id).filter(id => pages.has(id)), ...[...pages.keys()].filter(id => !metas.some(meta => meta.id === id))]
  const shelvesOf = id => metas.find(meta => meta.id === id)?.shelves || []
  const picked = []
  const add = id => { if (!picked.includes(id) && picked.length < RELATED_BOOKS_MAX) picked.push(id) }
  for (const id of order) if (pages.get(id).author === book.author) add(id)
  const shelves = shelvesOf(book.id)
  for (const shelf of shelves) for (const id of order) if (shelvesOf(id).includes(shelf)) add(id)
  if (picked.length < RELATED_BOOKS_MIN) {
    const houseShelves = houses.filter(house => house.shelves.some(shelf => shelves.includes(shelf))).flatMap(house => house.shelves)
    for (const id of order) if (picked.length < RELATED_BOOKS_MIN && shelvesOf(id).some(shelf => houseShelves.includes(shelf))) add(id)
    // A house of one shelf or two (ancient history) still reaches four with the library's own era.
    const era = metas.find(meta => meta.id === book.id)?.era
    for (const id of order) if (era && picked.length < RELATED_BOOKS_MIN && metas.find(meta => meta.id === id)?.era === era) add(id)
  }
  return picked.map(id => pages.get(id))
}

function relatedBooksHtml(book, books) {
  const related = relatedBooks(book, books)
  if (!related.length) return ''
  return `<section class="glance-section related-books" aria-label="Related books">
    <div class="glance-label">Related books</div>
    <ul class="glance">
${related.map(other => `      <li><a href="/read/${other.id}"><span class="glance-text">${escapeHtml(other.title)}</span></a></li>`).join('\n')}
    </ul>
  </section>`
}

function bookCoverSrc(bookId) {
  return fs.existsSync(path.join(APP_DIR, 'public/covers/v2', `${bookId}.webp`)) ? `/covers/v2/${bookId}.webp` : null
}

function bookSceneSrc(bookId) {
  const [wide, phone] = BOOK_SCENES[bookId] || EVENING_TABLE
  return { wide: `${LIBRARY_ASSETS}/${wide}`, phone: `${LIBRARY_ASSETS}/${phone}` }
}

/** The book page: the library's reading-room scene, then the crawlable book. */
function bookPageStyles() {
  return `<style>
    :root { --bg: #111610; --cream: #eee7d0; --muted: #b8bea9; --line: rgba(238, 231, 208, 0.2); color-scheme: dark; }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--cream); font-family: 'EB Garamond', Georgia, serif; -webkit-font-smoothing: antialiased; line-height: 1.6; }
    a { color: inherit; }
    nav.top { position: absolute; z-index: 3; top: 0; left: 0; right: 0; height: 76px; padding: 0 max(28px, 2.5vw); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(#090e0b66, transparent); }
    .logo { font-family: Georgia, 'Times New Roman', serif; font-size: 34px; letter-spacing: -1.8px; color: var(--cream); text-decoration: none; }
    .top-link { font: 15px system-ui, sans-serif; color: var(--cream); text-decoration: none; opacity: 0.85; }
    .hero { position: relative; height: 92svh; min-height: 560px; overflow: hidden; isolation: isolate; }
    .scene, .scene img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .shade { position: absolute; inset: 0; background: linear-gradient(0deg, var(--bg), transparent 26%), linear-gradient(90deg, #080d0b83, transparent 65%); }
    .hero-book { position: absolute; right: 18%; bottom: 20%; height: 43%; aspect-ratio: 2 / 3; filter: drop-shadow(3px 3px 3px #0006); }
    .hero-book img { display: block; width: 100%; height: 100%; border-radius: 2px; }
    .hero-copy { position: absolute; left: max(28px, 2.5vw); bottom: 19%; width: 47%; z-index: 2; }
    .eyebrow { font: 12px system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin: 0 0 14px; }
    h1.title { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(44px, 4.6vw, 80px); font-weight: 400; line-height: 1.04; letter-spacing: -0.035em; margin: 0 0 12px; }
    .byline { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(21px, 2vw, 30px); margin: 0; color: var(--muted); }
    .blurb { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(19px, 1.5vw, 25px); line-height: 1.4; max-width: 440px; margin: 25px 0 22px; }
    .primary-cta { display: inline-flex; align-items: center; gap: 10px; background: var(--cream); color: #222b20; min-height: 48px; padding: 0 25px; border-radius: 5px; font: 600 17px/1 system-ui, sans-serif; text-decoration: none; }
    main { max-width: 880px; margin: 0 auto; padding: 16px max(28px, 2.5vw) 80px; }
    .breadcrumb { font: 12px system-ui, sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 22px; }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb span { color: var(--cream); }
    .hook { font-size: 22px; font-style: italic; line-height: 1.6; margin: 0 0 40px; }
    .glance-section { margin: 0 0 48px; padding: 24px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .glance-label { font: 12px system-ui, sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
    .glance { list-style: none; padding: 0; margin: 0; columns: 2; column-gap: 40px; }
    .glance li { break-inside: avoid; }
    .glance li a { font-size: 17px; text-decoration: none; display: flex; gap: 14px; align-items: baseline; padding: 4px 0; }
    .glance li a:hover { color: #fff; }
    .glance-num { font: 12px system-ui, sans-serif; color: var(--muted); min-width: 76px; }
    .glance-text { flex: 1; }
    h2.section { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 400; line-height: 1.1; margin: 0 0 16px; }
    .body p { font-size: 20px; line-height: 1.6; margin: 0 0 16px; }
    footer.site { padding: 24px max(28px, 2.5vw); border-top: 1px solid var(--line); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font: 13px system-ui, sans-serif; color: var(--muted); }
    footer.site a { text-decoration: none; }
    .footer-links { display: flex; gap: 18px; flex-wrap: wrap; }
    @media (max-width: 699px) {
      nav.top { height: 64px; padding: 0 20px; }
      .logo { font-size: 32px; }
      .hero { height: 84svh; min-height: 530px; max-height: 850px; }
      .hero-book { height: 35%; right: 50%; bottom: 46%; transform: translateX(50%); }
      .hero-copy { left: 20px; bottom: 7%; width: calc(100% - 40px); }
      h1.title { font-size: clamp(32px, 8.6vw, 40px); }
      .byline { font-size: 17px; }
      .blurb { font-size: 16px; line-height: 1.35; margin: 13px 0 15px; max-width: 310px; }
      .primary-cta { font-size: 14px; min-height: 42px; padding: 0 19px; }
      .shade { background: linear-gradient(0deg, var(--bg) 0%, #111610d9 13%, #1116109c 33%, transparent 67%); }
      .hook { font-size: 19px; }
      .glance { columns: 1; }
      .glance li a { display: block; }
      .glance-num { display: block; min-width: 0; margin-bottom: 2px; }
      footer.site { flex-direction: column; }
    }
  </style>`
}

/**
 * Live-reader deep link for a chapter and edition. The reader validates the
 * book and edition and opens exactly this chapter (see readerHandoffFromUrlParams).
 */
function readerChapterHref(bookId, chapter) {
  // No edition: the reader opens its new-reader default pair.
  return `/reader?book=${bookId}&amp;chapter=${chapter}`
}

/** A chapter link on the book page: straight into the reader at that chapter. */
function bookChapterHref(bookId, chapter) {
  const german = bookId === 'faust-part-1'
  return `${readerChapterHref(bookId, chapter)}${german ? '&amp;edition=original-de' : ''}`
}

/**
 * A book with chapter pages opens with its first paragraph in both versions, as plain text a crawler reads without
 * scripts: the Modern English, then the same paragraph of the original beside it on the chapter page.
 */
function openingPair(modern, original, chapterPages) {
  const first = modern.chapters[0] || { paragraphs: [] }
  const index = first.paragraphs.findIndex(text => plainText(text) && !plainText(text).startsWith('\uFFFC'))
  const modernText = index >= 0 ? first.paragraphs[index] : ''
  const originalText = index >= 0 ? (original?.chapters?.find(chapter => chapter.number === first.number)?.paragraphs || [])[index] || '' : ''
  const [modernLabel, originalLabel] = chapterPages.labels || ['Modern English', 'Original']
  const lang = (chapterPages.original || 'original-en').split('-').pop()
  return `<h2 class="section">${emphasisHtml(first.title || 'Opening')}</h2>
  <div class="body opening-pair">
    <p class="opening-label">${escapeHtml(modernLabel)}</p>
    <p>${emphasisHtml(modernText)}</p>${originalText ? `
    <p class="opening-label">${escapeHtml(originalLabel)}</p>
    <p${lang === 'en' ? '' : ` lang="${lang}"`}>${emphasisHtml(originalText)}</p>` : ''}
  </div>
  <style>.opening-label{margin:24px 0 6px!important;font:13px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif!important;color:var(--muted)}.book-edition-note{margin:28px 0 40px;font:15px/1.55 system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--muted);max-width:720px}.book-edition-note strong{color:var(--cream);font-weight:600}</style>`
}

function buildBookIndexPage(book, edition, books = []) {
  const chapters = edition.data.chapters || []
  const firstChapter = chapters[0] || {}
  const firstParagraphs = paragraphExcerpt(firstChapter.paragraphs || [], 650)
  const editionKey = path.basename(edition.file).slice(book.id.length + 1, -5)
  // Start reading opens the book the way the library does: the flap, the
  // introduction and the edition choice, then the reader.
  const readerHref = `/library?book=${book.id}`
  const description = seoBookDescription(book)
  const languageLabel = editionKey.endsWith("-de") ? "Original German" : "Original English translation"
  // A play with scene pages lists its scenes, each linking to its page; other books link chapters into the reader.
  const scenes = scenePagesOf(book.id)
  const chapterPages = scenes.length ? null : chapterPagesOf(book.id)
  const modern = chapterPages ? JSON.parse(fs.readFileSync(path.join(EDITIONS_DIR, `${book.id}-modern-en.json`), 'utf8')) : null
  const original = chapterPages?.original ? JSON.parse(fs.readFileSync(path.join(EDITIONS_DIR, `${book.id}-${chapterPages.original}.json`), 'utf8')) : null
  const chapterLinks = chapterPages
    // A book with chapter pages links every chapter to its page.
    ? modern.chapters.map(chapter => `<li><a href="/read/${book.id}/chapter-${chapter.number}"><span class="glance-num">Chapter ${chapter.number}</span><span class="glance-text">${emphasisHtml(chapter.title || `Chapter ${chapter.number}`)}</span></a></li>`).join('\n')
    : scenes.length
    ? scenes.map(scene => {
        const [where, ...place] = scene.title.split(' — ')
        return `<li><a href="/read/${book.id}/${scene.slug}"><span class="glance-num">${escapeHtml(where)}</span><span class="glance-text">${escapeHtml(place.join(' — ') || where)}</span></a></li>`
      }).join('\n')
    : chapters
      .map((chapter, index) => `<li><a href="${bookChapterHref(book.id, index + 1)}"><span class="glance-num">Chapter ${index + 1}</span><span class="glance-text">${emphasisHtml(chapter.title || `Chapter ${index + 1}`)}</span></a></li>`)
      .join('\n')
  const scene = bookSceneSrc(book.id)
  const cover = bookCoverSrc(book.id)
  const blurb = libraryBlurb(book.id)
  const permission = PUBLISHER_PERMISSIONS[book.id]
  const body = `<nav class="top">
  <a href="/" class="logo">tinct</a>
  <a href="/read/" class="top-link">Library</a>
</nav>
<header class="hero">
  <picture class="scene"><source media="(max-width: 699px)" srcset="${scene.phone}"><img src="${scene.wide}" alt="" fetchpriority="high"></picture>
  <div class="shade"></div>
  ${cover ? `<div class="hero-book"><img src="${cover}" alt="${escapeHtml(book.title)} cover"></div>` : ''}
  <div class="hero-copy">
    <p class="eyebrow">Free online book</p>
    <h1 class="title">${escapeHtml(book.title)}</h1>
    <p class="byline">${escapeHtml(book.author)}</p>${book.id === "faust-part-1" || book.id === "jerusalem" ? `\n    <p class="eyebrow">${languageLabel} · other editions temporarily unavailable</p>` : ""}
    ${blurb ? `<p class="blurb">${escapeHtml(blurb)}</p>` : '<p class="blurb"></p>'}
    <a class="primary-cta" href="${readerHref}">Start reading →</a>
  </div>
</header>
<!--tinct:about-->
<main>
  <div class="breadcrumb">
    <a href="/">Tinct</a> · <a href="/read/">Library</a> · <span>${escapeHtml(book.title)}</span>
  </div>

  ${book.id === 'bible' ? '' : `<section class="glance-section" id="chapters" aria-label="${scenes.length ? 'Scenes in modern English' : 'Chapters'}">
    <div class="glance-label">${scenes.length ? 'Scenes in modern English' : 'Chapters'}</div>
    <ol class="glance">
${chapterLinks}
    </ol>
  </section>`}

  ${chapterPages ? openingPair(modern, original, chapterPages) : `<h2 class="section">${emphasisHtml(firstChapter.title || 'Opening')}</h2>
  <div class="body"${editionKey.endsWith("-de") ? ' lang="de"' : ''}>
    ${firstParagraphs.map(p => `<p>${emphasisHtml(p)}</p>`).join('\n    ')}
  </div>`}${editionNoteOf(book.id) ? `\n  <p class="book-edition-note">${editionNoteOf(book.id)}</p>` : ''}${permission ? `\n  <p class="breadcrumb">${escapeHtml(permission.rights)} Published by ${escapeHtml(permission.publisher)}; on Tinct with permission.</p>` : ''}
  ${relatedBooksHtml(book, books)}
</main>
<!--/tinct:about-->
${libraryHero(book)}
<footer class="site">
  <span>Read ${escapeHtml(book.title)} free online on Tinct.</span>
  <span class="footer-links"><a href="/read/">Library</a><a href="${readerHref}">Open reader</a></span>
</footer>`
  return pageShell({
    title: seoBookTitle(book),
    description,
    canonical: `${ORIGIN}/read/${book.id}`,
    body,
    styles: bookPageStyles(),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Book',
      '@id': `${ORIGIN}/read/${book.id}#book`,
      name: book.title,
      author: { '@type': 'Person', name: book.author },
      description,
      url: `${ORIGIN}/read/${book.id}`,
      isAccessibleForFree: true,
      publisher: permission ? { '@type': 'Organization', name: permission.publisher } : { '@type': 'Organization', name: 'Tinct', url: ORIGIN },
    },
  })
}


function generateReaderSeoPages(books) {
  let indexes = 0
  // Related books link only to books that get a page here.
  const withPages = books.filter(book => preferredEditionPath(book.id))
  for (const book of books) {
    const edition = loadPreferredEdition(book.id)
    if (!edition) continue
    const dir = path.join(READ_DIR, book.id)
    fs.mkdirSync(dir, { recursive: true })

    fs.writeFileSync(path.join(dir, 'book.html'), buildBookIndexPage(book, edition, withPages))
    indexes += 1
  }
  return { indexes }
}

// --- Build entries -------------------------------------------------------

/**
 * <lastmod> that changes only when a page's content does. The content hash and
 * date of every sitemap URL are kept in sitemap-lastmod.json; a rebuild with
 * unchanged content keeps the recorded date, a changed page gets today's.
 */
const LASTMOD_STATE = path.join(__dirname, 'seo/sitemap-lastmod.json')

function loadLastmodState() {
  try { return JSON.parse(fs.readFileSync(LASTMOD_STATE, 'utf8')) } catch { return {} }
}

function contentLastmod(state, next, loc, ...files) {
  const hash = require('crypto').createHash('sha256')
  for (const file of files) {
    try { hash.update(fs.readFileSync(file)) } catch { hash.update(`missing:${path.basename(file)}`) }
  }
  const digest = hash.digest('hex').slice(0, 16)
  const lastmod = state[loc]?.hash === digest ? state[loc].lastmod : BUILD_DATE
  next[loc] = { hash: digest, lastmod }
  return lastmod
}

/** As contentLastmod, for a scene page: its text, not the versioned script addresses a code change rewrites. */
function sceneLastmod(state, next, loc, file) {
  let html = ''
  try { html = fs.readFileSync(file, 'utf8') } catch { html = `missing:${path.basename(file)}` }
  const digest = require('crypto').createHash('sha256').update(html.replace(/\/read\/scene-[a-z]+\.js\?v=[0-9a-f]+/g, '')).digest('hex').slice(0, 16)
  const lastmod = state[loc]?.hash === digest ? state[loc].lastmod : BUILD_DATE
  next[loc] = { hash: digest, lastmod }
  return lastmod
}

/** As sceneLastmod, for a chapter page's HTML. */
function textLastmod(state, next, loc, html) {
  const digest = require('crypto').createHash('sha256').update(html.replace(/\/read\/(?:scene-[a-z]+\.js|chapter-page\.css)\?v=[0-9a-f]+/g, '').replace(/<link\b[^>]*href="\/assets\/[^"]+\.css"[^>]*>/g, '')).digest('hex').slice(0, 16)
  const lastmod = state[loc]?.hash === digest ? state[loc].lastmod : BUILD_DATE
  next[loc] = { hash: digest, lastmod }
  return lastmod
}

/** The chapter pages the build wrote for a book, [number, html] in order, read out of its packs. */
function chapterPagesInPacks(bookId) {
  const dir = path.join(CHAPTER_PACK_DIR, bookId)
  if (!fs.existsSync(dir)) return []
  const pages = []
  const files = fs.readdirSync(dir).filter(file => /^\d+\.txt$/.test(file)).sort((a, b) => parseInt(a) - parseInt(b))
  for (const file of files) {
    const parts = fs.readFileSync(path.join(dir, file), 'utf8').split(/<!--tinct:chapter-page (\d+)-->\n/)
    for (let index = 1; index < parts.length; index += 2) pages.push([Number(parts[index]), parts[index + 1]])
  }
  return pages
}

function urlEntry(loc, opts = {}) {
  const { changefreq = 'monthly', priority = 0.5, lastmod = BUILD_DATE } = opts
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`
}

function buildSitemap(books, state = loadLastmodState(), next = {}) {
  const lines = []
  const entry = (loc, opts, ...files) => lines.push(urlEntry(loc, { ...opts, lastmod: contentLastmod(state, next, loc, ...files) }))
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
  entry(`${ORIGIN}/`, { changefreq: 'weekly', priority: 1.0 }, path.join(APP_DIR, 'public/landing.html'))
  entry(`${ORIGIN}/about`, { changefreq: 'monthly', priority: 0.8 }, path.join(APP_DIR, 'public/about.html'))
  entry(`${ORIGIN}/credits`, { changefreq: 'monthly', priority: 0.3 }, path.join(APP_DIR, 'public/credits.html'))
  entry(`${ORIGIN}/story`, { changefreq: 'monthly', priority: 0.6 }, path.join(APP_DIR, 'public/story.html'))
  entry(`${ORIGIN}/privacy`, { changefreq: 'yearly', priority: 0.3 }, path.join(APP_DIR, 'public/privacy.html'))
  entry(`${ORIGIN}/terms`, { changefreq: 'yearly', priority: 0.3 }, path.join(APP_DIR, 'public/terms.html'))
  entry(`${ORIGIN}/copyright`, { changefreq: 'yearly', priority: 0.3 }, path.join(APP_DIR, 'public/copyright.html'))
  entry(`${ORIGIN}/read/`, { changefreq: 'weekly', priority: 0.8 }, path.join(READ_DIR, 'index.html'))
  // /modern-english: every book in Modern English (listed 23 Nov 2026). The page is generated after the sitemap in
  // prebuild, so its lastmod follows what it is built from: the registry and the page's own source.
  entry(`${ORIGIN}/modern-english`, { changefreq: 'weekly', priority: 0.8 }, path.join(APP_DIR, 'src/data/bookRegistry.ts'), path.join(APP_DIR, 'src/seo/modernEnglishPage.ts'), path.join(APP_DIR, 'public/lab/modern-english/modern-english.css'))
  for (const b of books) {
    const page = path.join(READ_DIR, b.id, 'book.html')
    if (!fs.existsSync(page)) continue
    // The book page: the reading page (first chapter or scene) when the build wrote one, else the library page.
    const reading = readingBookPage(b.id)
    const bookLoc = `${ORIGIN}/read/${b.id}`
    if (reading) lines.push(urlEntry(bookLoc, { changefreq: 'monthly', priority: 0.9, lastmod: textLastmod(state, next, bookLoc, reading) }))
    else entry(bookLoc, { changefreq: 'monthly', priority: 0.9 }, page)
    // The book's scene pages, each only once the build has written it (and the Worker serves it, 200). The first
    // scene is the book page (its canonical), so it is not listed.
    for (const scene of scenePagesOf(b.id).slice(reading ? 1 : 0)) {
      const loc = `${ORIGIN}/read/${b.id}/${scene.slug}`
      lines.push(urlEntry(loc, { changefreq: 'monthly', priority: 0.7, lastmod: sceneLastmod(state, next, loc, path.join(READ_DIR, b.id, `${scene.slug}.html`)) }))
    }
    // Chapter pages: only an indexable (allowlisted) book's, and only those the build wrote.
    const chapters = chapterPagesOf(b.id)
    if (chapters?.indexable) {
      const pages = chapterPagesInPacks(b.id).filter(([number]) => number > 0)
      // The first chapter is the book page (its canonical), so it is not listed.
      for (const [number, html] of pages.slice(chapters.bookPage ? 1 : 0)) {
        const loc = `${ORIGIN}/read/${b.id}/chapter-${number}`
        lines.push(urlEntry(loc, { changefreq: 'monthly', priority: 0.6, lastmod: textLastmod(state, next, loc, html) }))
      }
    }
  }
  // Shelf hubs that list an indexable book.
  for (const [shelf, indexable] of Object.entries(loadChapterManifest().hubs)) {
    const file = path.join(READ_DIR, 'shelf', `${shelf}.html`)
    if (indexable && fs.existsSync(file)) entry(`${ORIGIN}/read/shelf/${shelf}`, { changefreq: 'monthly', priority: 0.5 }, file)
  }
  lines.push('</urlset>')
  lines.push('')
  return lines.join('\n')
}

/**
 * Produce a per-book meta map consumed by the worker for SPA routes
 * /read/{bookId}. Each book gets a unique title and description so the 63
 * URLs we now submit don't all share the generic "Tinct — A New Way to
 * Read" title (which would trigger Google's duplicate-content signals and
 * hurt the whole domain). Books without an extracted description fall back
 * to a generic but book-specific line built from title + author.
 */
function buildBookMeta(books) {
  const escape = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const lines = []
  lines.push('// AUTO-GENERATED by app/scripts/generate-sitemap.cjs.')
  lines.push('// Run `npm run sitemap` to regenerate. Do not hand-edit.')
  lines.push('// Provides per-book <title>/<meta description> for /read/{bookId}.')
  lines.push('')
  lines.push('export interface BookMetaEntry {')
  lines.push('  title: string')
  lines.push('  description: string')
  lines.push('  bookName: string')
  lines.push('  author: string')
  lines.push('}')
  lines.push('')
  lines.push('export const GENERATED_BOOK_META: Record<string, BookMetaEntry> = {')
  for (const b of books) {
    if (!b.title || !b.author) continue
    const title = seoBookTitle(b)
    const description = seoBookDescription(b)
    lines.push(`  '${escape(b.id)}': {`)
    lines.push(`    title: '${escape(title)}',`)
    lines.push(`    description: '${escape(description)}',`)
    lines.push(`    bookName: '${escape(b.title)}',`)
    lines.push(`    author: '${escape(b.author)}',`)
    lines.push('  },')
  }
  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

// --- Main ----------------------------------------------------------------

function main() {
  const books = loadPublicBooks()
  const generated = generateReaderSeoPages(books)
  console.log(`[sitemap] Wrote ${generated.indexes} book pages under public/read/`)

  const lastmods = {}
  const xml = buildSitemap(books, loadLastmodState(), lastmods)
  fs.writeFileSync(OUT_SITEMAP, xml)
  fs.writeFileSync(LASTMOD_STATE, JSON.stringify(lastmods, null, 1) + '\n')
  const total = (xml.match(/<url>/g) || []).length
  console.log(`[sitemap] Wrote ${total} URLs to ${path.relative(APP_DIR, OUT_SITEMAP)} (${books.length} books)`)

  const meta = buildBookMeta(books)
  fs.writeFileSync(OUT_META, meta)
  const metaCount = (meta.match(/^  '/gm) || []).length
  console.log(`[sitemap] Wrote per-book meta for ${metaCount} books to ${path.relative(APP_DIR, OUT_META)}`)
}

if (require.main === module) {
  try {
    main()
  } catch (err) {
    console.error(`[sitemap] FAILED: ${err.message}`)
    process.exit(1)
  }
}

module.exports = {
  loadPublicBooks,
  preferredEditionPath,
  hasModernEdition,
  MACHINE_MADE_ORIGINALS,
  scenePagesOf,
  buildSitemap,
  buildBookMeta,
  chapterCount,
  generateReaderSeoPages,
  seoBookTitle,
  seoBookDescription,
  readingBookPage,
  metaDescription,
  MAX_META_TITLE_CHARS,
  MAX_META_DESCRIPTION_CHARS,
}
