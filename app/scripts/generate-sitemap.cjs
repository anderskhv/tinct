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
const SEO_EXCERPT_WORDS = 1200

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

function preferredEditionPath(bookId) {
  const candidates = [
    path.join(EDITIONS_DIR, `${bookId}-original-en.json`),
    path.join(EDITIONS_DIR, `${bookId}-modern-en.json`),
  ]
  return candidates.find(file => fs.existsSync(file)) || candidates[1]
}

function loadPreferredEdition(bookId) {
  const file = preferredEditionPath(bookId)
  if (!fs.existsSync(file)) return null
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

function plainText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
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
    if (!text) continue
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
  return base.length > 180 ? `${base.slice(0, 177).replace(/\s+\S*$/, '')}...` : base
}

function seoStyles() {
  return `<style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #261f18; background: #f7f1e7; line-height: 1.62; }
    a { color: #713722; }
    .topbar { height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 22px; border-bottom: 1px solid #ded4c5; background: #f3ecdf; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .brand { color: #241e18; font-family: Georgia, 'Times New Roman', serif; font-size: 1.18rem; font-weight: 700; text-decoration: none; }
    .brand span { color: #8a735d; font-weight: 400; }
    .top-actions { display: flex; align-items: center; gap: 16px; font-size: 0.86rem; }
    .top-actions a { color: #5f554b; text-decoration: none; }
    .top-actions .open-link { color: #713722; font-weight: 650; }
    main { max-width: 1060px; margin: 0 auto; padding: 34px 24px 66px; }
    .hero { border-bottom: 1px solid #dfd4c5; padding: 0 0 26px; }
    .kicker, .cta, footer, .chapters, .meta-line { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .kicker { color: #7f6e5c; font-size: 0.78rem; font-weight: 650; letter-spacing: 0.08em; margin: 0 0 8px; text-transform: uppercase; }
    h1 { font-size: clamp(2.35rem, 5vw, 4rem); line-height: 1.02; margin: 0 0 10px; letter-spacing: 0; }
    h2 { font-size: clamp(1.55rem, 2.8vw, 2.1rem); line-height: 1.18; margin: 0 0 18px; }
    p { font-size: 1.08rem; margin: 0 0 1rem; }
    .dek { color: #67594c; font-size: 1.08rem; margin-bottom: 22px; }
    .description { color: #312920; font-size: 1.08rem; max-width: 760px; }
    .cta { display: inline-flex; align-items: center; justify-content: center; margin-top: 18px; min-height: 42px; padding: 0 16px; border: 1px solid #713722; border-radius: 7px; color: #fff; text-decoration: none; background: #713722; font-weight: 650; }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: 54px; align-items: start; padding-top: 34px; }
    article { max-width: 720px; }
    article p { font-size: 1.06rem; }
    .chapters { position: sticky; top: 18px; border-left: 1px solid #e0d5c6; padding-left: 22px; }
    .chapters h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 1.2rem; margin: 0 0 12px; }
    ol { list-style: decimal; margin: 0; max-height: 70vh; overflow: auto; padding-left: 1.25rem; }
    li { color: #8a7a68; font-size: 0.9rem; margin: 0.35rem 0; padding-left: 0.15rem; }
    li a { text-decoration: none; }
    li a:hover { text-decoration: underline; }
    footer { border-top: 1px solid #dfd4c5; margin-top: 44px; padding-top: 18px; color: #746657; font-size: 0.9rem; }
    @media (max-width: 820px) {
      .topbar { padding: 0 14px; }
      .top-actions { gap: 10px; }
      .top-actions a:not(.open-link) { display: none; }
      main { padding: 26px 18px 52px; }
      .layout { display: block; padding-top: 28px; }
      .chapters { position: static; border-left: 0; border-top: 1px solid #dfd4c5; margin-top: 34px; padding: 22px 0 0; }
      ol { max-height: none; }
    }
  </style>`
}

function pageShell({ title, description, canonical, body, jsonLd }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="book">
  <meta property="og:site_name" content="Tinct">
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
  ${seoStyles()}
</head>
<body>
${body}
</body>
</html>
`
}

function buildBookIndexPage(book, edition) {
  const chapters = edition.data.chapters || []
  const firstChapter = chapters[0] || {}
  const firstParagraphs = paragraphExcerpt(firstChapter.paragraphs || [], 650)
  const description = (book.description && book.description.length >= 60)
    ? book.description
    : `Read ${book.title} by ${book.author} free online on Tinct.`
  const chapterLinks = chapters
    .map((chapter, index) => `<li><a href="/read/${book.id}/chapter-${index + 1}">${escapeHtml(chapter.title || `Chapter ${index + 1}`)}</a></li>`)
    .join('\n')
  const body = `<header class="topbar">
  <a class="brand" href="/">Tinct<span>.</span></a>
  <nav class="top-actions" aria-label="Book navigation">
    <a href="/read/">Library</a>
    <a class="open-link" href="/read/${book.id}?chapter=1">Open reader</a>
  </nav>
</header>
<main>
  <section class="hero">
    <p class="kicker">Free online book</p>
    <h1>${escapeHtml(book.title)}</h1>
    <p class="dek">by ${escapeHtml(book.author)}</p>
    <p class="description">${escapeHtml(description)}</p>
    <a class="cta" href="/read/${book.id}?chapter=1">Start reading in Tinct</a>
  </section>
  <div class="layout">
    <article>
      <h2>${escapeHtml(firstChapter.title || 'Opening')}</h2>
      ${firstParagraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n      ')}
    </article>
    <aside class="chapters" aria-label="Chapters">
      <h2>Chapters</h2>
      <ol>
${chapterLinks}
      </ol>
    </aside>
  </div>
  <footer>Read ${escapeHtml(book.title)} free online on Tinct, with aligned editions, notes, cast, and an AI reading companion.</footer>
</main>`
  return pageShell({
    title: `Read ${book.title} by ${book.author} Free Online | Tinct`,
    description,
    canonical: `${ORIGIN}/read/${book.id}`,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Book',
      '@id': `${ORIGIN}/read/${book.id}#book`,
      name: book.title,
      author: { '@type': 'Person', name: book.author },
      description,
      url: `${ORIGIN}/read/${book.id}`,
      isAccessibleForFree: true,
      publisher: { '@type': 'Organization', name: 'Tinct', url: ORIGIN },
    },
  })
}

function buildGeneratedChapterPage(book, edition, chapter, index) {
  const number = index + 1
  const paragraphs = paragraphExcerpt(chapter.paragraphs || [], SEO_EXCERPT_WORDS)
  const chapterTitle = chapter.title || `Chapter ${number}`
  const description = metaDescription(book, chapter, paragraphs)
  const body = `<main>
  <nav><a href="/read/${book.id}">${escapeHtml(book.title)}</a> / <a href="/read/">Tinct library</a></nav>
  <p class="kicker">Chapter ${number}</p>
  <h1>${escapeHtml(chapterTitle)}</h1>
  <p class="dek">${escapeHtml(book.title)} by ${escapeHtml(book.author)}</p>
  <a class="cta" href="/read/${book.id}?chapter=${number}">Open this chapter in Tinct</a>
  <article>
  ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n  ')}
  </article>
  <footer>This crawler-readable excerpt links into Tinct's full reader for synced editions, cast, notes, and chat.</footer>
</main>`
  return pageShell({
    title: `${book.title}: ${chapterTitle} — Read Free Online | Tinct`,
    description,
    canonical: `${ORIGIN}/read/${book.id}/chapter-${number}`,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Chapter',
      name: chapterTitle,
      position: number,
      isPartOf: { '@type': 'Book', name: book.title, author: { '@type': 'Person', name: book.author } },
      url: `${ORIGIN}/read/${book.id}/chapter-${number}`,
    },
  })
}

function generateReaderSeoPages(books) {
  let indexes = 0
  for (const book of books) {
    const edition = loadPreferredEdition(book.id)
    if (!edition) continue
    const dir = path.join(READ_DIR, book.id)
    fs.mkdirSync(dir, { recursive: true })

    fs.writeFileSync(path.join(dir, 'book.html'), buildBookIndexPage(book, edition))
    indexes += 1
  }
  return { indexes, chapters: 0 }
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
    lines.push(urlEntry(`${ORIGIN}/read/${b.id}`, { changefreq: 'monthly', priority: 0.9, lastmod: lastmodFor(pagePath(b.id, 'book.html'), editionPath(b.id)) }))
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
      lines.push(urlEntry(`${ORIGIN}/read/${b.id}`, { changefreq: 'monthly', priority: 0.7, lastmod: lastmodFor(pagePath(b.id, 'book.html'), editionPath(b.id)) }))
      lines.push(urlEntry(`${ORIGIN}/read/${b.id}/summary`, { changefreq: 'monthly', priority: 0.7, lastmod: lastmodFor(pagePath(b.id, 'summary.html')) }))
    }
    lines.push('')
  }

  if (noSeoBooks.length > 0) {
    lines.push('  <!-- Book landing pages only; chapter pages are added when curated/generated pages exist. -->')
    for (const b of noSeoBooks) {
      lines.push(urlEntry(`${ORIGIN}/read/${b.id}`, { changefreq: 'monthly', priority: 0.6, lastmod: lastmodFor(pagePath(b.id, 'book.html'), editionPath(b.id)) }))
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
  const generated = generateReaderSeoPages(books)
  console.log(`[sitemap] Wrote ${generated.indexes} book landing pages and ${generated.chapters} generated chapter pages under public/read/`)

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

module.exports = { loadPublicBooks, buildSitemap, buildBookMeta, chapterCount, hasSeoPages, generateReaderSeoPages }
