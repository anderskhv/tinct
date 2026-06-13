#!/usr/bin/env node
/**
 * build-seo-stub.cjs — generate a Stub-tier summary.html for any book by
 * pulling content directly from `app/public/data/onboarding/{bookId}.json`
 * and `app/src/data/bookRegistry.ts`.
 *
 * Stub tier = summary.html only. No chapters/themes/cast/chapter-N pages.
 * The page contains: title, byline, hook, about prose, why-it-matters
 * preview, cast preview, reading-angle preview, and a "Read in the reader"
 * CTA. No tour carousel (no chapter prose to fill it). No links to other
 * hub pages (since they don't exist for Stub-tier books).
 *
 * USAGE
 *   node app/scripts/build-seo-stub.cjs <bookId>     # one book
 *   node app/scripts/build-seo-stub.cjs --all        # every book in onboarding/
 *
 * The script SKIPS books that already have summary.html (so it won't
 * overwrite Full-tier or hand-tuned content).
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const ONBOARDING_DIR = path.join(APP_DIR, 'public/data/onboarding')
const READ_DIR = path.join(APP_DIR, 'public/read')
const REGISTRY = path.join(APP_DIR, 'src/data/bookRegistry.ts')

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Pull (year, wordCount) from registry — used to render byline/era
function loadRegistryFacts() {
  const src = fs.readFileSync(REGISTRY, 'utf8')
  const blockRe = /export const ([A-Z][A-Z0-9_]*):\s*Book\s*=\s*\{([\s\S]*?)\n\}/g
  const facts = new Map()
  let m
  while ((m = blockRe.exec(src))) {
    const body = m[2]
    const id = (body.match(/\bid:\s*['"]([^'"]+)['"]/) || [])[1]
    if (!id) continue
    const year = (body.match(/\byear:\s*(-?\d+)/) || [])[1]
    facts.set(id, { year: year ? parseInt(year, 10) : null })
  }
  return facts
}

const STYLES = `:root { --paper: #ece7db; --paper-alt: #dfd8c4; --ink: #0b0b0b; --dim: #6a6555; --accent: #1f4a5c; --rule: rgba(11, 11, 11, 0.12); }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: var(--paper); color: var(--ink); font-family: 'IBM Plex Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; line-height: 1.6; }
    a { color: inherit; }
    .wrap { position: relative; z-index: 2; }

    nav.top { padding: 24px 48px; border-bottom: 1px solid var(--ink); display: flex; justify-content: space-between; align-items: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; text-decoration: none; color: var(--ink); }
    .logo span { color: var(--accent); }
    .top-cta { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink); text-decoration: none; border: 1px solid var(--ink); padding: 8px 14px; transition: background 0.15s, color 0.15s; }
    .top-cta:hover { background: var(--ink); color: var(--paper); }

    main { max-width: 980px; margin: 0 auto; padding: 64px 48px 96px; }

    .breadcrumb { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 24px; }
    .breadcrumb a { color: var(--dim); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }
    .breadcrumb span { color: var(--ink); }

    h1.title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.25rem, 5.5vw, 3.75rem); line-height: 1.0; font-weight: 900; letter-spacing: -0.025em; margin: 0 0 12px 0; }
    h1.title em { color: var(--accent); font-style: italic; font-weight: 400; }
    .byline { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); margin-bottom: 28px; }
    .hook { font-family: 'EB Garamond', Georgia, serif; font-size: 22px; line-height: 1.45; font-style: italic; color: var(--ink); margin: 0 0 32px 0; max-width: 780px; }

    h2.section { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.6rem, 3vw, 2.2rem); line-height: 1.05; font-weight: 700; letter-spacing: -0.015em; margin: 56px 0 14px 0; color: var(--ink); }
    h2.section em { color: var(--accent); font-style: italic; font-weight: 400; }

    .body p { font-family: 'EB Garamond', Georgia, serif; font-size: 19px; line-height: 1.6; margin: 0 0 16px 0; max-width: 720px; }
    .body p strong { font-weight: 600; }
    .body p em { font-style: italic; }

    .why-list { display: grid; gap: 0; margin: 8px 0 0 0; }
    .why-item { padding: 22px 0; border-top: 1px solid var(--rule); }
    .why-item:last-child { border-bottom: 1px solid var(--rule); }
    .why-item h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; line-height: 1.15; font-weight: 700; margin: 0 0 6px 0; color: var(--ink); }
    .why-item p { font-family: 'EB Garamond', Georgia, serif; font-size: 17px; line-height: 1.55; margin: 0; max-width: 760px; }

    .figures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 12px; }
    .figure { padding: 22px 24px; border: 1px solid var(--rule); background: var(--paper-alt); }
    .figure-name { font-family: 'Playfair Display', Georgia, serif; font-size: 21px; line-height: 1.15; font-weight: 700; margin-bottom: 4px; }
    .figure-role { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
    .figure-body { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; line-height: 1.55; color: var(--ink); margin: 0; }

    .angles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 12px; }
    .angle-card { padding: 18px 20px; border: 1px solid var(--rule); background: var(--paper-alt); }
    .angle-title { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; font-style: italic; color: var(--accent); margin-bottom: 6px; }
    .angle-body { font-family: 'EB Garamond', Georgia, serif; font-size: 15px; line-height: 1.5; color: var(--ink); margin: 0; }

    .end-cta { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin: 64px 0 0 0; text-align: center; }
    .end-cta a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
    .end-cta a:hover { color: var(--ink); border-bottom-color: var(--ink); }

    footer.site { padding: 24px 48px; border-top: 1px solid var(--ink); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
    footer.site a { color: inherit; text-decoration: none; transition: color 0.15s; }
    footer.site a:hover { color: var(--accent); }
    .footer-links { display: flex; gap: 18px; flex-wrap: wrap; }

    @media (max-width: 720px) {
      nav.top { padding: 18px 22px; }
      main { padding: 32px 22px 56px; }
      h1.title { font-size: clamp(2rem, 9vw, 3rem); }
      .figures, .angles { grid-template-columns: 1fr; }
      footer.site { padding: 22px; flex-direction: column; align-items: flex-start; }
    }`

function eraLabel(year) {
  if (year == null) return ''
  if (year < 0) return `${Math.abs(year)} BCE`
  return `${year} CE`
}

function renderStub({ id, title, author, hook, about, whyItMatters, cast, angleCards, year }) {
  const bylineParts = []
  if (year != null) bylineParts.push(eraLabel(year))
  bylineParts.push(`by ${author}`)
  const byline = bylineParts.join(' · ')

  const canonical = `https://tinct.app/read/${id}/summary`

  // Onboarding `about` is a string with paragraphs separated by blank lines.
  // Some files use \n\n; some use a single \n. Treat both as separators.
  const aboutParas = Array.isArray(about)
    ? about
    : String(about || '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
  const aboutHtml = aboutParas.map(p => `      <p>${p}</p>`).join('\n')

  const firstAboutPlain = (aboutParas[0] || hook || '').replace(/<[^>]+>/g, '')
  const description = (firstAboutPlain || `${title} by ${author} — full text free online with an AI reading companion on Tinct.`).slice(0, 280)

  const whyHtml = (whyItMatters || []).slice(0, 5).map(w => `      <article class="why-item">
        <h3>${esc(w.title || '')}</h3>
        <p>${w.body || ''}</p>
      </article>`).join('\n')

  const figuresHtml = (cast || []).slice(0, 6).map(c => `      <div class="figure">
        <div class="figure-name">${esc(c.name)}</div>
        <div class="figure-role">${esc(c.role || '')}</div>
        <p class="figure-body">${c.description || c.body || ''}</p>
      </div>`).join('\n')

  const anglesHtml = (angleCards || []).slice(0, 4).map(a => `      <div class="angle-card">
        <div class="angle-title">${esc(a.title || '')}</div>
        <p class="angle-body">${a.text || a.body || ''}</p>
      </div>`).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} by ${esc(author)} — Summary, Story &amp; Why It Matters | Tinct</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">

  <meta property="og:title" content="${esc(title)} by ${esc(author)} — Summary, Story &amp; Why It Matters">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Tinct">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)} by ${esc(author)} — Summary, Story &amp; Why It Matters">
  <meta name="twitter:description" content="${esc(description)}">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${esc(title)} by ${esc(author)} — Summary, Story and Why It Matters",
    "description": "${esc(description)}",
    "about": {
      "@type": "Book",
      "name": "${esc(title)}",
      "author": { "@type": "Person", "name": "${esc(author)}" },
      "inLanguage": "en",
      "isAccessibleForFree": true
    },
    "isPartOf": { "@type": "WebSite", "name": "Tinct", "url": "https://tinct.app" },
    "publisher": { "@type": "Organization", "name": "Tinct", "url": "https://tinct.app" }
  }
  </script>

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preload" href="/fonts/f6667783-zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYbSB4Zh.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/9947e6f6-SlGUmQSNjdsmc35JDF1K5GR1SDk_YAPI.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/fdd6c391-nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">

  <style>
    ${STYLES}
  </style>
</head>
<body>
<div class="wrap">

  <nav class="top">
    <a href="/" class="logo">Tinct<span>.</span></a>
    <a href="/read/${id}" class="top-cta">Read the full book for free →</a>
  </nav>

  <main>

    <div class="breadcrumb">
      <a href="/">Tinct</a> · <a href="/read">Library</a> · <span>${esc(title)}</span>
    </div>

    <h1 class="title">${esc(title)}</h1>
    <p class="byline">${esc(byline)}</p>

${hook ? `    <p class="hook">${hook}</p>\n` : ''}
    <h2 class="section">The book in <em>brief</em></h2>
    <div class="body">
${aboutHtml}
    </div>
${whyHtml ? `
    <h2 class="section">Why it still <em>matters</em></h2>
    <div class="why-list">
${whyHtml}
    </div>
` : ''}${anglesHtml ? `
    <h2 class="section">Reading <em>angles</em></h2>
    <p class="body" style="max-width:680px;color:var(--dim)">Four perspectives to bring with you. Pick one as you start, or skip and let the book lead.</p>
    <div class="angles">
${anglesHtml}
    </div>
` : ''}${figuresHtml ? `
    <h2 class="section">Key <em>figures</em></h2>
    <div class="figures">
${figuresHtml}
    </div>
` : ''}
    <p class="end-cta"><a href="/read/${id}">Open ${esc(title)} in the reader →</a></p>

  </main>

  <footer class="site">
    <span>Tinct — 2026</span>
    <div class="footer-links">
      <a href="/read">Library</a>
      <a href="/about">About</a>
      <a href="/#pricing">Pricing</a>
      <a href="mailto:contact@tinct.app">contact@tinct.app</a>
    </div>
  </footer>

</div>
</body>
</html>`
}

function buildOne(bookId, registryFacts, force = false) {
  const obFile = path.join(ONBOARDING_DIR, `${bookId}.json`)
  if (!fs.existsSync(obFile)) return { ok: false, reason: 'no onboarding json' }

  const ob = JSON.parse(fs.readFileSync(obFile, 'utf8'))
  const outDir = path.join(READ_DIR, bookId)
  const outFile = path.join(outDir, 'summary.html')

  // Full-tier safety: never overwrite a book that already has chapter pages,
  // even with --force. Bespoke chapter prose is expensive; a Full-tier
  // summary.html is hand-tuned to match. The stub generator should only ever
  // affect Stub-tier content.
  const isFull = fs.existsSync(path.join(outDir, 'chapter-1.html'))
  if (isFull) return { ok: false, reason: 'full-tier (has chapter-1.html); refusing to overwrite' }

  if (fs.existsSync(outFile) && !force) return { ok: false, reason: 'summary.html exists (use --force to overwrite)' }

  fs.mkdirSync(outDir, { recursive: true })

  // Synthesize a hook from the first sentence of about. Skip — the about
  // section is rich enough to lead the page on its own; a duplicated first
  // sentence as a hook reads awkwardly. Future: hand-write hooks per book.
  const hook = ''

  const facts = registryFacts.get(bookId) || {}

  const html = renderStub({
    id: bookId,
    title: ob.title || bookId,
    author: ob.author || '',
    hook,
    about: ob.about || [],
    whyItMatters: ob.whyItMatters || [],
    cast: ob.cast || [],
    angleCards: ob.angleCards || [],
    year: facts.year,
  })

  fs.writeFileSync(outFile, html)
  return { ok: true, file: path.relative(APP_DIR, outFile) }
}

function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: node app/scripts/build-seo-stub.cjs <bookId> | --all [--force]')
    process.exit(1)
  }

  const force = args.includes('--force')
  const registryFacts = loadRegistryFacts()

  let bookIds
  if (args.includes('--all')) {
    bookIds = fs.readdirSync(ONBOARDING_DIR)
      .filter(f => f.endsWith('.json') && !f.includes(' 2.'))
      .map(f => f.replace('.json', ''))
      .sort()
  } else {
    bookIds = args.filter(a => !a.startsWith('--'))
  }

  let written = 0
  let skipped = 0
  for (const id of bookIds) {
    const r = buildOne(id, registryFacts, force)
    if (r.ok) {
      console.log(`  + ${id}: wrote ${r.file}`)
      written++
    } else {
      console.log(`  - ${id}: ${r.reason}`)
      skipped++
    }
  }
  console.log(`\n[stub] wrote ${written}, skipped ${skipped}`)
}

if (require.main === module) main()
