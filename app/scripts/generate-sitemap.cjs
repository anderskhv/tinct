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
const MAX_META_TITLE_CHARS = 60
const MAX_META_DESCRIPTION_CHARS = 155
const DEFAULT_OG_IMAGE = `${ORIGIN}/og-image.png`
const MANUAL_BOOK_META = {
  odyssey: {
    title: 'Read The Odyssey Online — Modern Translation, AI Companion, Audiobook | Tinct',
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

function seoBookTitle(book) {
  const manual = MANUAL_BOOK_META[book.id]
  if (manual?.title) return manual.title
  const full = `Read ${plainText(book.title)} Free Online | Tinct`
  if (full.length <= MAX_META_TITLE_CHARS) return full
  return cappedWithFixedParts('Free Classic Reader: ', book.title, ' | Tinct', MAX_META_TITLE_CHARS)
}

function seoChapterTitle(book, chapterTitle) {
  return cappedWithFixedParts('Free Chapter: ', `${book.title} - ${chapterTitle}`, ' | Tinct', MAX_META_TITLE_CHARS)
}

function seoBookDescription(book) {
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

function pageShell({ title, description, canonical, body, jsonLd, image = DEFAULT_OG_IMAGE }) {
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
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">
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
  const readerHref = `/read/${book.id}?chapter=1&edition=original-en&compare=modern-en&split=1`
  const hook = (book.description && book.description.length >= 60)
    ? book.description
    : `Read ${book.title} by ${book.author} free online on Tinct.`
  const description = seoBookDescription(book)
  const chapterLinks = chapters
    .map((chapter, index) => `<li><a href="/read/${book.id}/chapter-${index + 1}"><span class="glance-num">Chapter ${index + 1}</span><span class="glance-text">${escapeHtml(chapter.title || `Chapter ${index + 1}`)}</span></a></li>`)
    .join('\n')
  const body = `<nav class="top">
  <a href="/" class="logo">Tinct<span>.</span></a>
  <a href="${readerHref}" class="top-cta">Read this book free →</a>
</nav>
<main>
  <div class="breadcrumb">
    <a href="/">Tinct</a> · <a href="/read/">Library</a> · <span>${escapeHtml(book.title)}</span>
  </div>

  <div class="booknum">Free online book</div>
  <h1 class="title">${escapeHtml(book.title)}</h1>
  <p class="byline">by ${escapeHtml(book.author)}</p>
  <p class="hook">${escapeHtml(hook)}</p>
  <a class="primary-cta" href="${readerHref}">Start reading in Tinct →</a>

  <section class="glance-section" aria-label="Chapters">
    <div class="glance-label">Chapters</div>
    <ol class="glance">
${chapterLinks}
    </ol>
  </section>

  <h2 class="section">${escapeHtml(firstChapter.title || 'Opening')}</h2>
  <div class="body">
    ${firstParagraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n    ')}
  </div>
</main>
<footer class="site">
  <span>Read ${escapeHtml(book.title)} free online on Tinct.</span>
  <span class="footer-links"><a href="/read/">Library</a><a href="${readerHref}">Open reader</a></span>
</footer>`
  return pageShell({
    title: seoBookTitle(book),
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
    title: seoChapterTitle(book, chapterTitle),
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

module.exports = {
  loadPublicBooks,
  buildSitemap,
  buildBookMeta,
  chapterCount,
  hasSeoPages,
  generateReaderSeoPages,
  seoBookTitle,
  seoBookDescription,
  metaDescription,
  MAX_META_TITLE_CHARS,
  MAX_META_DESCRIPTION_CHARS,
}
