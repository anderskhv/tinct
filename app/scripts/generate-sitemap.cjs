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
 * Output rules per book:
 *   - Always emit /read/{bookId} (the SPA reader; the worker injects per-book
 *     meta tags via BOOK_META, so it's indexable on its own).
 *   - If app/public/read/{bookId}/summary.html exists, also emit:
 *       /summary, /themes, /chapters, /cast, and /chapter-N for every
 *       chapter present in the modern-en edition.
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
    if (id) constToBook.set(constName, { id, title, author, description })
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
    books.push(book)
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

function hasSeoPages(bookId) {
  return fs.existsSync(path.join(READ_DIR, bookId, 'summary.html'))
}

/**
 * Tier detection. Full tier has the full hub set + chapter-N pages; Stub
 * tier has only summary.html. (No Hub-only tier in production yet.)
 */
function tierFor(bookId) {
  const dir = path.join(READ_DIR, bookId)
  if (!fs.existsSync(path.join(dir, 'summary.html'))) return 'none'
  if (fs.existsSync(path.join(dir, 'chapter-1.html'))) return 'full'
  return 'stub'
}

// --- Build entries -------------------------------------------------------

/**
 * <lastmod> for a URL: mtime of the source content file when one exists on
 * disk (static SEO pages, edition JSON for SPA routes), else the build date.
 * Format YYYY-MM-DD per the sitemap protocol.
 */
function lastmodFor(...candidatePaths) {
  for (const p of candidatePaths) {
    if (!p) continue
    try {
      return fs.statSync(p).mtime.toISOString().slice(0, 10)
    } catch (err) { /* try next candidate */ }
  }
  return BUILD_DATE
}

function urlEntry(loc, opts = {}) {
  const { changefreq = 'monthly', priority = 0.5, lastmod = BUILD_DATE } = opts
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`
}

function buildSitemap(books) {
  const lines = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
  lines.push('')
  lines.push('  <!-- Marketing -->')
  lines.push(urlEntry(`${ORIGIN}/`, { changefreq: 'weekly', priority: 1.0, lastmod: lastmodFor(path.join(APP_DIR, 'public/landing.html')) }))
  lines.push(urlEntry(`${ORIGIN}/about`, { changefreq: 'monthly', priority: 0.8, lastmod: lastmodFor(path.join(APP_DIR, 'public/about.html')) }))
  lines.push('')
  lines.push('  <!-- Library -->')
  lines.push(urlEntry(`${ORIGIN}/read/`, { changefreq: 'weekly', priority: 0.8, lastmod: lastmodFor(path.join(READ_DIR, 'index.html')) }))
  lines.push('')

  // Three buckets: Full-tier books (everything), Stub-tier books
  // (just summary.html), and books with no SEO pages at all.
  const fullBooks = []
  const stubBooks = []
  const noSeoBooks = []
  for (const b of books) {
    const t = tierFor(b.id)
    if (t === 'full') fullBooks.push(b)
    else if (t === 'stub') stubBooks.push(b)
    else noSeoBooks.push(b)
  }

  const editionPath = bookId => path.join(EDITIONS_DIR, `${bookId}-modern-en.json`)
  const pagePath = (bookId, file) => path.join(READ_DIR, bookId, file)

  for (const b of fullBooks) {
    const chapters = chapterCount(b.id)
    lines.push(`  <!-- ${b.id} — full SEO page set -->`)
    lines.push(urlEntry(`${ORIGIN}/read/${b.id}`, { changefreq: 'monthly', priority: 0.9, lastmod: lastmodFor(editionPath(b.id)) }))
    lines.push(urlEntry(`${ORIGIN}/read/${b.id}/summary`, { changefreq: 'monthly', priority: 0.9, lastmod: lastmodFor(pagePath(b.id, 'summary.html')) }))
    lines.push(urlEntry(`${ORIGIN}/read/${b.id}/themes`, { changefreq: 'monthly', priority: 0.8, lastmod: lastmodFor(pagePath(b.id, 'themes.html')) }))
    lines.push(urlEntry(`${ORIGIN}/read/${b.id}/chapters`, { changefreq: 'monthly', priority: 0.7, lastmod: lastmodFor(pagePath(b.id, 'chapters.html')) }))
    lines.push(urlEntry(`${ORIGIN}/read/${b.id}/cast`, { changefreq: 'monthly', priority: 0.7, lastmod: lastmodFor(pagePath(b.id, 'cast.html')) }))
    for (let n = 1; n <= chapters; n++) {
      lines.push(urlEntry(`${ORIGIN}/read/${b.id}/chapter-${n}`, { changefreq: 'monthly', priority: 0.6, lastmod: lastmodFor(pagePath(b.id, `chapter-${n}.html`)) }))
    }
    lines.push('')
  }

  if (stubBooks.length > 0) {
    lines.push('  <!-- Stub-tier books — summary.html only -->')
    for (const b of stubBooks) {
      lines.push(urlEntry(`${ORIGIN}/read/${b.id}`, { changefreq: 'monthly', priority: 0.7, lastmod: lastmodFor(editionPath(b.id)) }))
      lines.push(urlEntry(`${ORIGIN}/read/${b.id}/summary`, { changefreq: 'monthly', priority: 0.7, lastmod: lastmodFor(pagePath(b.id, 'summary.html')) }))
    }
    lines.push('')
  }

  if (noSeoBooks.length > 0) {
    lines.push('  <!-- SPA reader entries (no static SEO pages yet) -->')
    for (const b of noSeoBooks) {
      lines.push(urlEntry(`${ORIGIN}/read/${b.id}`, { changefreq: 'monthly', priority: 0.6, lastmod: lastmodFor(editionPath(b.id)) }))
    }
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
    const title = `Read ${b.title} by ${b.author} — Free Online with AI Companion | Tinct`
    const fallback = `Read ${b.title} by ${b.author} free online on Tinct. Authoritative translation paragraph-aligned with a modern English version, plus a context-aware AI reading companion, character tracker, and synced audiobook. No account needed to start.`
    const description = (b.description && b.description.length >= 60) ? b.description : fallback
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

  const xml = buildSitemap(books)
  fs.writeFileSync(OUT_SITEMAP, xml)
  const total = (xml.match(/<url>/g) || []).length
  const fullCount = books.filter(b => tierFor(b.id) === 'full').length
  const stubCount = books.filter(b => tierFor(b.id) === 'stub').length
  console.log(`[sitemap] Wrote ${total} URLs to ${path.relative(APP_DIR, OUT_SITEMAP)} (${books.length} books, ${fullCount} full + ${stubCount} stub)`)

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

module.exports = { loadPublicBooks, buildSitemap, buildBookMeta, chapterCount, hasSeoPages }
