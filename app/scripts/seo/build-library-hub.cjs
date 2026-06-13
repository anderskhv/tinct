#!/usr/bin/env node
/**
 * build-library-hub.cjs — generates the static crawlable library hub at
 * app/public/read/index.html (Phase 5.5).
 *
 * Sources of truth:
 *   - app/src/data/bookRegistry.ts     → public book list (via generate-sitemap.cjs)
 *   - app/src/data/libraryTaxonomy.ts  → Houses → Shelves grouping + one-line blurbs
 *   - app/public/read/{bookId}/        → whether a summary page exists to link to
 *
 * Each book links to /read/{bookId}/summary when the static SEO page exists,
 * else to the SPA reader at /read/{bookId}. Books are listed once, under the
 * first shelf they belong to.
 *
 * NOTE on routing: the worker serves the SPA shell at exactly `/read`
 * (worker.ts LIBRARY_META branch), so this file is reachable at `/read/`
 * (trailing slash) via the assets binding's html_handling. Canonical is
 * https://tinct.app/read/ accordingly.
 *
 * Usage: node scripts/seo/build-library-hub.cjs
 */

const fs = require('fs')
const path = require('path')
const { loadPublicBooks } = require('../generate-sitemap.cjs')

const APP_DIR = path.resolve(__dirname, '../..')
const TAXONOMY = path.join(APP_DIR, 'src/data/libraryTaxonomy.ts')
const READ_DIR = path.join(APP_DIR, 'public/read')
const OUT = path.join(READ_DIR, 'index.html')

const ORIGIN = 'https://tinct.app'

// Registry id → taxonomy id, where they differ.
const TAXONOMY_ID_ALIASES = { 'much-ado-about-nothing': 'much-ado' }

// --- Parse the taxonomy file (its data blocks are valid JSON) -------------

function extractJson(src, constName, open) {
  const start = src.indexOf(`export const ${constName}`)
  if (start === -1) throw new Error(`Could not find ${constName} in libraryTaxonomy.ts`)
  const eq = src.indexOf('=', start)
  const from = src.indexOf(open, eq)
  const close = open === '[' ? ']' : '}'
  const rest = src.slice(from)
  const endIdx = rest.search(new RegExp(`\\n\\${close}`))
  if (endIdx === -1) throw new Error(`Could not find end of ${constName}`)
  return JSON.parse(rest.slice(0, endIdx + 2))
}

function loadTaxonomy() {
  const src = fs.readFileSync(TAXONOMY, 'utf8')
  return {
    bookMeta: extractJson(src, 'LIBRARY_BOOK_META', '['),
    shelves: extractJson(src, 'LIBRARY_SHELVES', '{'),
    houses: extractJson(src, 'LIBRARY_HOUSES', '['),
  }
}

// --- Helpers ---------------------------------------------------------------

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hasSummaryPage(bookId) {
  return fs.existsSync(path.join(READ_DIR, bookId, 'summary.html'))
}

function bookHref(bookId) {
  return hasSummaryPage(bookId) ? `/read/${bookId}/summary` : `/read/${bookId}`
}

function oneLiner(book, taxEntry) {
  if (taxEntry && taxEntry.blurb) return taxEntry.blurb
  const d = book.description || ''
  if (d.length <= 140) return d
  const cut = d.slice(0, 141)
  const boundary = cut.lastIndexOf(' ')
  return `${cut.slice(0, boundary > 90 ? boundary : 140).replace(/[,\s;:—-]+$/, '')}…`
}

// --- Build -----------------------------------------------------------------

function build() {
  const books = loadPublicBooks()
  const { bookMeta, shelves, houses } = loadTaxonomy()

  const taxById = new Map(bookMeta.map(m => [m.id, m]))
  const taxFor = book => taxById.get(TAXONOMY_ID_ALIASES[book.id] || book.id)

  // Group public books once each: house → shelf → [books]
  const shelfBooks = new Map() // shelfId → [{book, tax}]
  const ungrouped = []
  for (const book of books) {
    const tax = taxFor(book)
    const shelfId = tax && Array.isArray(tax.shelves) ? tax.shelves.find(s => shelves[s]) : undefined
    if (!shelfId) { ungrouped.push({ book, tax }); continue }
    if (!shelfBooks.has(shelfId)) shelfBooks.set(shelfId, [])
    shelfBooks.get(shelfId).push({ book, tax })
  }
  for (const list of shelfBooks.values()) {
    list.sort((a, b) => ((a.tax && a.tax.ySort) || 0) - ((b.tax && b.tax.ySort) || 0))
  }

  const title = 'The Tinct Library — Read Classic Books Free Online | Tinct'
  const description = `All ${books.length} classics in the Tinct library: philosophy, drama, novels, epics, scripture, and history. Each free to read online with summaries, themes, character guides, and a modern comparison translation.`
  const canonical = `${ORIGIN}/read/`

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tinct', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Library', item: canonical },
    ],
  }

  const houseSections = houses.map(house => {
    const shelfBlocks = house.shelves
      .filter(shelfId => shelfBooks.has(shelfId))
      .map(shelfId => {
        const shelf = shelves[shelfId]
        const lis = shelfBooks.get(shelfId).map(({ book, tax }) => {
          const meta = [book.author, tax && tax.year].filter(Boolean).join(' · ')
          return `        <li class="book">
          <a href="${bookHref(book.id)}"><span class="book-title">${esc(book.title)}</span></a>
          <span class="book-meta">${esc(meta)}</span>
          <span class="book-blurb">${esc(oneLiner(book, tax))}</span>
        </li>`
        }).join('\n')
        return `      <section class="shelf">
        <h3 class="sub">${esc(shelf.title)}</h3>
        <p class="shelf-sub">${esc(shelf.sub)}</p>
        <ul class="books">
${lis}
        </ul>
      </section>`
      })
    if (shelfBlocks.length === 0) return ''
    return `    <section class="house">
      <h2 class="section">${esc(house.title)}</h2>
      <p class="section-sub">${esc(house.sub)}</p>
${shelfBlocks.join('\n')}
    </section>`
  }).filter(Boolean)

  if (ungrouped.length > 0) {
    const lis = ungrouped.map(({ book, tax }) => `        <li class="book">
          <a href="${bookHref(book.id)}"><span class="book-title">${esc(book.title)}</span></a>
          <span class="book-meta">${esc(book.author)}</span>
          <span class="book-blurb">${esc(oneLiner(book, tax))}</span>
        </li>`).join('\n')
    houseSections.push(`    <section class="house">
      <h2 class="section">Also in the library</h2>
      <ul class="books">
${lis}
      </ul>
    </section>`)
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">

  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Tinct">
  <meta property="og:image" content="${ORIGIN}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">

  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbLd, null, 2).split('\n').join('\n  ')}
  </script>

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preload" href="/fonts/f6667783-zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYbSB4Zh.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/9947e6f6-SlGUmQSNjdsmc35JDF1K5GR1SDk_YAPI.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/fdd6c391-nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">

  <style>
    :root {
      --paper: #ece7db;
      --paper-alt: #dfd8c4;
      --ink: #0b0b0b;
      --dim: #6a6555;
      --accent: #1f4a5c;
      --rule: rgba(11, 11, 11, 0.12);
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: var(--paper);
      color: var(--ink);
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      line-height: 1.6;
    }
    a { color: inherit; }
    .wrap { position: relative; z-index: 2; }

    nav.top {
      padding: 24px 48px;
      border-bottom: 1px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      text-decoration: none;
      color: var(--ink);
    }
    .logo span { color: var(--accent); }
    .top-cta {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink);
      text-decoration: none;
      border: 1px solid var(--ink);
      padding: 8px 14px;
      transition: background 0.15s, color 0.15s;
    }
    .top-cta:hover { background: var(--ink); color: var(--paper); }

    main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 64px 48px 96px;
    }
    .breadcrumb {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 24px;
    }
    .breadcrumb a { color: var(--dim); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }
    .breadcrumb span { color: var(--ink); }

    h1.title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      line-height: 0.98;
      font-weight: 900;
      letter-spacing: -0.025em;
      margin: 0 0 12px 0;
    }
    h1.title em { color: var(--accent); font-style: italic; font-weight: 400; }
    .hook {
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 23px;
      line-height: 1.45;
      font-style: italic;
      color: var(--ink);
      margin: 0 0 24px 0;
      max-width: 720px;
    }

    h2.section {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1.75rem, 3.5vw, 2.6rem);
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: -0.015em;
      margin: 72px 0 8px 0;
    }
    .section-sub {
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 18px;
      line-height: 1.5;
      color: var(--dim);
      margin: 0 0 8px 0;
    }
    h3.sub {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      margin: 36px 0 2px 0;
    }
    .shelf-sub {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--dim);
      margin: 0 0 16px 0;
    }

    ul.books {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 14px 28px;
    }
    li.book {
      border-top: 1px solid var(--rule);
      padding: 12px 0 4px;
    }
    li.book a { text-decoration: none; }
    .book-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 19px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    li.book a:hover .book-title { color: var(--accent); }
    .book-meta {
      display: block;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--dim);
      margin: 2px 0 4px;
    }
    .book-blurb {
      display: block;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 16px;
      line-height: 1.4;
      color: var(--ink);
    }

    footer.site {
      border-top: 1px solid var(--ink);
      padding: 24px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { color: var(--dim); text-decoration: none; }
    .footer-links a:hover { color: var(--accent); }

    @media (max-width: 640px) {
      nav.top, footer.site { padding: 18px 20px; }
      main { padding: 40px 20px 72px; }
      ul.books { grid-template-columns: 1fr; }
      footer.site { flex-direction: column; gap: 10px; }
    }
  </style>
</head>
<body>
<div class="wrap">

  <nav class="top">
    <a href="/" class="logo">Tinct<span>.</span></a>
    <a href="/read" class="top-cta">Open the reader →</a>
  </nav>

  <main>
    <div class="breadcrumb"><a href="/">Tinct</a> / <span>Library</span></div>
    <h1 class="title">The <em>Library</em></h1>
    <p class="hook">${books.length} classics, free to read online — each with a summary, themes, character guide, and a modern comparison translation alongside the original.</p>

${houseSections.join('\n\n')}
  </main>

  <footer class="site">
    <span>Tinct — 2026</span>
    <div class="footer-links">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/#pricing">Pricing</a>
      <a href="mailto:contact@tinct.app">contact@tinct.app</a>
    </div>
  </footer>

</div>
</body>
</html>
`
}

function main() {
  const html = build()
  fs.writeFileSync(OUT, html)
  const linkCount = (html.match(/<li class="book">/g) || []).length
  console.log(`[library-hub] Wrote ${path.relative(APP_DIR, OUT)} (${linkCount} books)`)
}

if (require.main === module) {
  try {
    main()
  } catch (err) {
    console.error(`[library-hub] FAILED: ${err.message}`)
    process.exit(1)
  }
}

module.exports = { build }
