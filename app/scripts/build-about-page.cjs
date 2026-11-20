#!/usr/bin/env node
/**
 * build-about-page.cjs — writes app/public/credits.html (tinct.app/credits).
 *
 * It wrote app/public/about.html too until 19 Nov 2026, when Anders made the
 * Try page the About page (public/about.html is now that page, edited by hand;
 * docs/try-page/BRIEF.md). The notes below describe the old About text.
 *
 * The text is the approved About mockup (docs/about-mockup.html on
 * claude/gracious-mayer-t2imki, 2026-10-05) without its undecided parts:
 * no Terms, CVR, yearly plan, top-ups or credit figures yet. Anders,
 * 2026-10-07: no "Our team" section, and the credits live on their own page,
 * linked from the /about footer. The image credits come from the library's
 * own credits data, so the two never drift.
 *
 * Usage: node scripts/build-about-page.cjs
 */
const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const IMAGES = path.join(APP_DIR, 'public/lab/library_2/author-images.json')
const CREDITS_OUT = path.join(APP_DIR, 'public/credits.html')

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const link = (label, href) => href ? `<a href="${esc(href)}" rel="noopener noreferrer">${esc(label)}</a>` : esc(label)

function creditRows(images) {
  return images.map(image => `<tr><td>${esc(image.authorName)}</td><td>${esc(image.creator)}</td><td>${link(image.licence, image.licenceUrl)}</td><td>${link('Source', image.sourcePage)}${image.attributionRequired && image.changes ? `<br><span class="muted">${esc(image.changes)}</span>` : ''}</td></tr>`).join('\n')
}

const CREDITS_DESCRIPTION = "Where Tinct's original texts and author portraits come from."

/** The page head and styles /about and /credits share, up to the opening <body>. */
const head = ({ title, path, description }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://tinct.app${path}">
<meta property="og:title" content="${title}">
<meta property="og:url" content="https://tinct.app${path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tinct">
<meta property="og:description" content="${description}">
<meta property="og:image" content="https://tinct.app/og-image-v3.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://tinct.app/og-image-v3.jpg">
<link rel="icon" href="/favicon.ico">
<script type="module" src="/lab/internal-traffic.js"></script>
<style>
:root { --bg: #111610; --cream: #eee7d0; --muted: #b8bea9; --line: rgba(238, 231, 208, 0.18); --serif: Georgia, 'Times New Roman', serif; color-scheme: dark; }
* { box-sizing: border-box; }
html { background: var(--bg); }
body { margin: 0; background: var(--bg); color: var(--cream); font-family: var(--serif); font-size: 15px; line-height: 1.6; padding-inline: 20px; }
.page { max-width: 720px; margin: 0 auto; padding-block: 28px 64px; }
a { color: var(--cream); text-underline-offset: 2px; text-decoration-color: var(--line); }
a:hover { text-decoration-color: var(--cream); }
.logo { font-size: 26px; letter-spacing: -1.2px; text-decoration: none; display: inline-block; margin-bottom: 40px; }
h1 { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
h2 { font-size: 15px; font-weight: 700; margin: 36px 0 6px; }
p { margin: 0 0 10px; }
.muted { color: var(--muted); }
.table-scroll { overflow-x: auto; margin: 8px 0 12px; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th, td { text-align: left; vertical-align: top; padding: 6px 12px 6px 0; border-bottom: 1px solid var(--line); }
thead th { font-weight: 700; border-bottom-color: var(--muted); }
td.c, th.c { text-align: center; padding-inline: 6px; }
.credits td { font-size: 13px; }
.credits td:first-child { white-space: nowrap; }
details summary { cursor: pointer; color: var(--muted); font-size: 14px; margin: 6px 0; }
.footer { margin-top: 48px; padding-top: 12px; border-top: 1px solid var(--line); font-size: 13px; color: var(--muted); }
.footer a { color: var(--muted); margin-right: 14px; }
@media (max-width: 520px) { table { font-size: 13px; } .credits td:first-child { white-space: normal; } }
</style>
</head>
<body>
`

function creditsSection() {
  const images = JSON.parse(fs.readFileSync(IMAGES, 'utf8')).images || []
  const byName = (a, b) => a.authorName.localeCompare(b.authorName)
  const attributed = images.filter(image => image.attributionRequired).sort(byName)
  const others = images.filter(image => !image.attributionRequired).sort(byName)
  const table = rows => `<div class="table-scroll"><table class="credits"><thead><tr><th>Portrait</th><th>Creator</th><th>Licence</th><th></th></tr></thead><tbody>
${rows}
</tbody></table></div>`
  return `<p>Original texts come from Project Gutenberg, the Internet Archive and other public-domain archives. We're grateful to the volunteers who transcribed and checked them.</p>
<p>Author portraits:</p>
${table(creditRows(attributed))}
<details><summary>Show all ${images.length} portraits</summary>
${table(creditRows(others))}
</details>
`
}

function buildCredits() {
  return `${head({ title: 'Tinct credits', path: '/credits', description: CREDITS_DESCRIPTION })}<div class="page">
<a class="logo" href="/">tinct</a>
<h1>Tinct credits</h1>

<h2>Credits</h2>
${creditsSection()}
<p class="footer"><a href="/library">Library</a><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:contact@tinct.app">contact@tinct.app</a><a href="/copyright">Copyright</a></p>
</div>
</body>
</html>
`
}

if (require.main === module) {
  fs.writeFileSync(CREDITS_OUT, buildCredits())
  console.log(`[about] Wrote ${path.relative(APP_DIR, CREDITS_OUT)}`)
}

module.exports = { buildCredits }
