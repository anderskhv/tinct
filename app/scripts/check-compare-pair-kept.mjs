// Compare keeps its two editions when the reader leaves a book and comes back (Anders, 26 Nov 2026: Danish beside
// English, out to the library, back in: English beside English). On a built app (dist/), a reader with no account,
// desktop Chromium 1440×900, The Wind in the Willows (Original English, Tinct Modern English, Moderne Dansk):
// 1. In the reader, the main version is set to Original English and the compare version to Moderne Dansk; both
//    columns show.
// 2. Back to the library and Continue on the reading table: the reader opens with the same two editions.
// 3. The book's own page and Begin reading with its dropdowns untouched: the same two again.
// In both, the place and the stored choice still name Moderne Dansk afterwards: nothing wrote a default over them.
// Nothing reaches production: the built files are served here and every /api route answers 404.
//   cd app && npm run build && node scripts/check-compare-pair-kept.mjs   (TINCT_DIST=<dir> for another build)
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { markInternal } from './lib/internalTraffic.cjs'

// PLAYWRIGHT_MODULE: another Playwright build (a machine whose installed browsers are not this project's).
const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium } = playwright.chromium ? playwright : playwright.default

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = path.resolve(process.env.TINCT_COMPARE_PAIR_OUTPUT || 'artifacts/compare-pair-kept')
await fs.mkdir(output, { recursive: true })
const BOOK = 'wind-in-the-willows', MAIN = 'original-en', COMPARE = 'modern-da'

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }
const server = createServer(async (req, res) => {
  let pathname = decodeURIComponent(new URL(req.url || '/', 'http://local').pathname)
  if (pathname.startsWith('/api/')) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{}'); return }
  if (['/', '/library', '/library/'].includes(pathname)) pathname = '/lab/library_2/index.html'
  if (pathname === '/reader') pathname = '/app.html'
  if (pathname.endsWith('/')) pathname += 'index.html'
  const file = path.join(dist, path.normalize(pathname))
  try {
    if (!file.startsWith(dist + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
    res.end(await fs.readFile(file))
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 700) : ''}`) }

/** The editions the reader is showing: its stored choice, the place it saved, and what the page draws. */
const editions = page => page.evaluate(book => {
  const prefs = JSON.parse(localStorage.getItem('tinct-lab-prefs') || '{}')
  const place = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.[book]
  const lab = document.querySelector('[data-testid="lab-root"]')
  const shared = prefs.shared ?? prefs
  return {
    main: shared.primaryEdition, compare: shared.compareEdition, compareOpen: shared.compareOpen,
    savedMain: place?.primaryEditionKey ?? null, savedCompare: place?.compareEditionKey ?? null,
    compareActive: lab?.dataset.compareActive === 'true',
    footers: [...document.querySelectorAll('[data-testid="lab-desktop-page-footers"] b')].map(node => node.textContent.trim()),
  }
}, BOOK)
const readerReady = page => page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
const kept = state => state.main === MAIN && state.compare === COMPARE && state.compareOpen === true && state.compareActive
  && state.savedMain === MAIN && state.savedCompare === COMPARE
  && state.footers.length === 2 && /dansk/i.test(state.footers.join(' '))

const external = []
const browser = await markInternal(await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined, args: ['--mute-audio'] }))
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
  await context.route('**/*', route => {
    const u = new URL(route.request().url())
    if (u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue()
    external.push(`${u.hostname}${u.pathname}`)
    return route.abort()
  })
  // A returning reader: no first-visit hint over the text.
  await context.addInitScript(() => { try { localStorage.setItem('tinct:selection-actions-used', '1'); localStorage.setItem('tinct:wipe-v1-done', '1') } catch { /* private mode */ } })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))

  // 1. Set the pair in the reader.
  await page.goto(`${origin}/reader?book=${BOOK}`, { waitUntil: 'domcontentloaded' })
  await readerReady(page)
  await page.evaluate(() => document.fonts.ready)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-editions').click()
  await page.getByTestId('lab-v2-main-edition').click()
  await page.locator(`[data-edition="${MAIN}"]`).click()
  await page.getByTestId('lab-v2-compare-edition').click()
  await page.locator(`[data-edition="${COMPARE}"]`).click()
  if (!(await editions(page)).compareActive) await page.getByTestId('lab-v2-show-compare').click()
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.compareActive === 'true')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1500)
  const chosen = await editions(page)
  ok('reader: Original English with Moderne Dansk beside it, as chosen', kept(chosen), chosen)
  await page.screenshot({ path: path.join(output, '1-chosen.png') })

  // 2. Out to the library, Continue on the reading table.
  const toLibrary = async () => {
    await page.getByTestId('lab-library-back').click()
    await page.waitForURL(url => url.pathname === '/library' || url.pathname === '/', { timeout: 30000 })
  }
  await toLibrary()
  await page.locator('.reading-table:not([hidden]):not(.is-placeholder) #rt-continue').click({ timeout: 30000 })
  await page.waitForURL(url => url.pathname === '/reader', { timeout: 30000 })
  await readerReady(page)
  await page.waitForTimeout(1500)
  const continued = await editions(page)
  ok('Continue from the library: the same two editions', kept(continued), continued)
  await page.screenshot({ path: path.join(output, '2-continued.png') })

  // 3. The book's own page, its dropdowns untouched.
  await page.goto(`${origin}/library?book=${BOOK}&view=book-detail`, { waitUntil: 'domcontentloaded' })
  await page.locator('#begin-reading').waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(2500)
  await page.locator('#begin-reading').click()
  await page.waitForURL(url => url.pathname === '/reader', { timeout: 30000 })
  await readerReady(page)
  await page.waitForTimeout(1500)
  const begun = await editions(page)
  ok('Begin reading on the book page, dropdowns untouched: the same two editions', kept(begun), begun)
  await page.screenshot({ path: path.join(output, '3-book-page.png') })

  ok('no page errors', errors.length === 0, errors)
  await context.close()
} finally { await browser.close() }

server.close()
ok('nothing reached any other host', external.length === 0, [...new Set(external)].slice(0, 10))
console.log(failures ? `${failures} check(s) failed` : 'all checks passed', `· screenshots in ${output}`)
process.exit(failures ? 1 : 0)
