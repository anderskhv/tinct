#!/usr/bin/env node
/**
 * Chapter pages, shelf hubs and the book pages' new text, against the local build (Anders, 16 Nov 2026,
 * docs/seo-chapter-pages-brief-2026-11-16.md). Run after `npm run build`:
 *
 *   node scripts/check-chapter-pages.mjs            (CHAPTER_OUT=dir for the screenshots)
 *
 * It drives the Worker's own routing (src/worker/routes/seo.ts, bundled here) in-process over dist/, behind a
 * local HTTP server, so the pages, headers and redirects are the ones production answers. tinct.app is only the
 * Request URL; the browser never leaves 127.0.0.1 (every other request is aborted), so nothing reaches production.
 *
 * Checks: Googlebot fetches of a book page, an indexable and a noindex chapter page, a missing chapter, robots.txt,
 * the sitemap and the hubs; since 19 Nov 2026 (docs/seo-brief-2026-11-19.md) Googlebot and Bingbot fetches of the
 * brief's list, and in a signed-out browser on desktop and phone the text switch, the remembered choice, Continue
 * reading and the saved place after leaving and coming back; then in a browser, that utm_source and gclid survive the hand-off into the reader (a
 * Primer link, a selection's Explain, a typed question) and the reader receives them; and screenshots (chapter page
 * desktop and phone in light and dark, a book page, a hub).
 */
import { build } from 'esbuild'
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { markInternal } = require('./lib/internalTraffic.cjs')
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const DIST = path.join(ROOT, 'dist')
const OUT = process.env.CHAPTER_OUT || path.join(ROOT, 'artifacts/chapter-pages')
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const SMARTPHONE_GOOGLEBOT = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const BINGBOT = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
if (!fs.existsSync(path.join(DIST, 'seo/chapter-packs'))) throw new Error('dist has no chapter packs: run npm run build first')
fs.mkdirSync(OUT, { recursive: true })

// ===== The Worker's routing over dist/ =====
const bundle = path.join(ROOT, `node_modules/.cache/check-chapter-pages-${process.pid}.mjs`)
fs.mkdirSync(path.dirname(bundle), { recursive: true })
await build({ entryPoints: [path.join(ROOT, 'src/worker/routes/seo.ts')], bundle: true, format: 'esm', platform: 'node', target: 'node20', outfile: bundle, logLevel: 'silent' })
const { handleSeoAndStaticRequest } = await import(pathToFileURL(bundle).href)
fs.rmSync(bundle, { force: true })

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4' }
/** Cloudflare's assets binding, roughly: the file, its .html, or its folder's index.html (auto-trailing-slash). */
const ASSETS = {
  fetch: async (request) => {
    const pathname = decodeURIComponent(new URL(request.url).pathname)
    const candidates = [pathname, `${pathname}.html`, path.posix.join(pathname, 'index.html')]
    for (const candidate of candidates) {
      const file = path.join(DIST, candidate)
      if (!file.startsWith(DIST) || !fs.existsSync(file) || !fs.statSync(file).isFile()) continue
      return new Response(request.method === 'HEAD' ? null : fs.readFileSync(file), { headers: { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' } })
    }
    return new Response('Not found', { status: 404 })
  },
}
const server = createServer(async (req, res) => {
  try {
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value)
    const response = await handleSeoAndStaticRequest(new Request(`https://tinct.app${req.url}`, { method: req.method, headers }), { ASSETS }, { waitUntil() {} })
    const out = {}
    response.headers.forEach((value, key) => { if (key !== 'content-security-policy' && key !== 'strict-transport-security') out[key] = value })
    res.writeHead(response.status, out)
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end(String(error?.stack || error))
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const ORIGIN = `http://127.0.0.1:${server.address().port}`
const results = []
const ok = (name, detail = '') => { results.push(name); console.log(`  ok  ${name}${detail ? ` (${detail})` : ''}`) }
const crawl = (pathname, ua = GOOGLEBOT) => fetch(`${ORIGIN}${pathname}`, { headers: { 'User-Agent': ua }, redirect: 'manual' })
const text = html => html.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')

try {
  // ===== Googlebot and Bingbot (docs/seo-brief-2026-11-19.md, "Verify and report") =====
  for (const [bot, ua] of [['Googlebot', GOOGLEBOT], ['Googlebot smartphone', SMARTPHONE_GOOGLEBOT], ['Bingbot', BINGBOT]]) {
    {
      const resp = await crawl('/read/jane-eyre', ua)
      assert.equal(resp.status, 200)
      assert.equal(resp.headers.get('x-robots-tag'), null)
      const html = await resp.text()
      assert.ok(!/name="robots"/.test(html))
      assert.ok(html.includes('<title>Read Jane Eyre online free, in modern English | Tinct</title>'), 'book title')
      assert.ok(html.includes('<span class="book-structure" id="book-structure">38 chapters</span>'), 'structure pill')
      assert.ok(html.includes('<link rel="canonical" href="https://tinct.app/read/jane-eyre">'))
      assert.ok(html.includes('class="chapter-col chapter-col-modern"') && html.includes('class="chapter-col chapter-col-original"'), 'both texts')
      assert.ok(text(html).includes('There was no possibility of taking a walk that day.'), 'original chapter 1')
      assert.ok(html.includes('<a href="/read/jane-eyre/chapter-38" data-scene-keep>'), 'chapter list')
      assert.ok(!html.includes('<!--tinct:reader-css-->') && /<link[^>]+href="\/assets\/[^"]+\.css"/.test(html), 'reader CSS stamped')
      ok(`${bot} /read/jane-eyre: chapter 1 text in both versions, the pill, the new title, the chapter list`, `${html.length} bytes`)
    }
    {
      const html = await (await crawl('/read/jane-eyre/chapter-1', ua)).text()
      assert.ok(html.includes('<link rel="canonical" href="https://tinct.app/read/jane-eyre">'))
      const c26 = await (await crawl('/read/jane-eyre/chapter-26', ua)).text()
      assert.ok(c26.includes('<title>Jane Eyre, Chapter 26 of 38: full text in modern English | Tinct</title>'))
      assert.ok(c26.includes('Chapter 26<span class="chapter-of"> of 38</span>'))
      assert.ok(c26.includes('<link rel="canonical" href="https://tinct.app/read/jane-eyre/chapter-26">'))
      const odyssey = await crawl('/read/odyssey/chapter-1', ua)
      assert.equal(odyssey.status, 200)
      assert.equal(odyssey.headers.get('x-robots-tag'), null)
      assert.ok(!/name="robots"/.test(await odyssey.text()))
      const llms = await crawl('/llms.txt', ua)
      assert.equal(llms.status, 200)
      assert.ok((await llms.text()).includes('https://tinct.app/read/{book}/chapter-N'))
      const hamlet = await (await crawl('/read/hamlet', ua)).text()
      assert.ok(hamlet.includes('<title>Read Hamlet online free, scene by scene in modern English | Tinct</title>') && hamlet.includes('id="book-structure">5 acts · 20 scenes<'))
      ok(`${bot}: chapter-1 canonical → /read/jane-eyre; chapter-26 "of 38" and its title; /read/odyssey/chapter-1 indexable; /llms.txt; /read/hamlet`)
    }
  }
  {
    const resp = await crawl('/read/the-art-of-war/chapter-2')
    assert.equal(resp.status, 200)
    assert.equal(resp.headers.get('x-robots-tag'), 'noindex, follow')
    assert.ok((await resp.text()).includes('<meta name="robots" content="noindex, follow">'))
    ok('Googlebot /read/the-art-of-war/chapter-2 (not allowlisted): 200, X-Robots-Tag and meta noindex, follow')
  }
  for (const [pathname, status] of [['/read/moby-dick/chapter-137', 404], ['/read/odyssey/chapter-0', 404], ['/seo/chapter-packs/moby-dick/0.txt', 404], ['/seo/book-pages/hamlet.html', 404], ['/read/moby-dick/chapter-0', 404], ['/read/moby-dick/chapter-1/', 301], ['/read/hamlet/chapter-8', 301]]) {
    assert.equal((await crawl(pathname)).status, status, pathname)
  }
  ok('missing chapter 404, packs not served, trailing slash 301, plays keep their scene redirect')
  {
    const robots = await (await crawl('/robots.txt')).text()
    assert.ok(/^Disallow: \/lab$/m.test(robots) && /^Allow: \/lab\/\*\.js$/m.test(robots) && /^Allow: \/lab\/\*\.css$/m.test(robots))
    const design = await crawl('/lab/design-system.html')
    assert.equal(design.headers.get('x-robots-tag'), 'noindex, noarchive')
    const script = await crawl('/lab/display-profile.js')
    assert.equal(script.status, 200)
    assert.equal(script.headers.get('x-robots-tag'), null)
    ok('robots.txt allows /lab scripts and styles; /lab HTML answers noindex')
  }
  {
    const sitemap = await (await crawl('/sitemap.xml')).text()
    const chapterBooks = new Set([...sitemap.matchAll(/<loc>https:\/\/tinct\.app\/read\/([a-z0-9-]+)\/chapter-\d+<\/loc>/g)].map(match => match[1]))
    const allowlist = fs.readFileSync(path.join(ROOT, 'src/data/seoIndexAllowlist.ts'), 'utf8').match(/'([a-z0-9-]+)',/g).map(id => id.slice(1, -2))
    assert.ok([...chapterBooks].every(id => allowlist.includes(id)), 'only allowlisted books')
    assert.equal(chapterBooks.size, 18)
    assert.ok(!sitemap.includes('<loc>https://tinct.app/read/jane-eyre/chapter-1</loc>') && sitemap.includes('<loc>https://tinct.app/read/jane-eyre</loc>'), 'chapter 1 is the book page')
    assert.ok(!sitemap.includes('<loc>https://tinct.app/read/hamlet/act-1-scene-1</loc>'), 'the first scene is the book page')
    assert.ok(sitemap.includes('<loc>https://tinct.app/modern-english</loc>'), '/modern-english is listed')
    assert.ok(sitemap.includes('<loc>https://tinct.app/nudansk</loc>'), '/nudansk is listed')
    assert.ok(sitemap.includes('<loc>https://tinct.app/shakespeare</loc>'), '/shakespeare is listed')
    ok('sitemap lists chapter pages only for allowlisted books', `${chapterBooks.size} books, ${(sitemap.match(/\/chapter-\d+<\/loc>/g) || []).length} pages; not listed: ${allowlist.filter(id => !chapterBooks.has(id)).join(', ')}`)
  }
  {
    const hub = await crawl('/read/shelf/russian-novels')
    assert.equal(hub.status, 200)
    assert.equal(hub.headers.get('x-robots-tag'), null)
    const other = await crawl('/read/shelf/stoics')
    assert.equal(other.headers.get('x-robots-tag'), 'noindex, follow')
    ok('hubs: /read/shelf/russian-novels indexable, /read/shelf/stoics noindex, follow')
  }

  // ===== Browser: attribution through the hand-off, and screenshots =====
  const executablePath = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined)
  const browser = await markInternal(await chromium.launch(executablePath ? { executablePath } : {}))
  const local = async context => {
    await context.route('**/*', route => new URL(route.request().url()).host === new URL(ORIGIN).host ? route.continue() : route.abort())
    return context
  }
  {
    const context = await local(await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' }))
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${ORIGIN}/read/moby-dick/chapter-1?utm_source=test&gclid=x`, { waitUntil: 'networkidle' })
    const primer = await page.locator('[data-testid="margin-first-hint"] a[data-scene-action="primer"]').getAttribute('href')
    assert.match(primer, /utm_source=test/)
    assert.match(primer, /gclid=x/)
    const firstTouch = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:first-touch') || '{}'))
    assert.equal(firstTouch.utm_source, 'test')
    assert.equal(firstTouch.gclid, 'x')
    // A selection in the Modern English: the reader's bar, then Explain hands over with the words and the attribution.
    await page.evaluate(() => {
      const p = document.querySelector('[data-scene-modern] p[data-p="0"]')
      const range = document.createRange()
      range.setStart(p.firstChild, 0)
      range.setEnd(p.firstChild, 15)
      getSelection().removeAllRanges()
      getSelection().addRange(range)
    })
    await page.locator('.scene-selection-bar:not([hidden])').waitFor()
    const explain = page.waitForRequest(request => new URL(request.url()).pathname === '/reader')
    await page.locator('.scene-selection-bar [data-act="explain"]').click()
    const explainUrl = new URL((await explain).url())
    assert.equal(explainUrl.searchParams.get('book'), 'moby-dick')
    assert.equal(explainUrl.searchParams.get('chapter'), '1')
    assert.equal(explainUrl.searchParams.get('utm_source'), 'test')
    assert.equal(explainUrl.searchParams.get('gclid'), 'x')
    await page.waitForURL(/\/reader\?/)
    // The reader itself: it loads, reads the hand-over (and removes it from the address) and keeps the attribution.
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]'), null, { timeout: 30000 })
    const inReader = await page.evaluate(() => ({ search: location.search, first: JSON.parse(localStorage.getItem('tinct:first-touch') || '{}'), last: JSON.parse(localStorage.getItem('tinct:last-touch') || '{}'), root: !!document.querySelector('[data-testid="lab-root"]') }))
    assert.ok(inReader.root, 'the reader mounted')
    assert.equal(new URLSearchParams(inReader.search).get('gclid'), 'x')
    assert.equal(new URLSearchParams(inReader.search).get('utm_source'), 'test')
    assert.equal(inReader.first.gclid, 'x')
    assert.equal(inReader.first.utm_source, 'test')
    ok('utm_source and gclid survive the hand-off into the reader (Explain on a selection)', `reader mounted: ${inReader.root}; reader URL ${new URL(page.url()).search}; first touch ${JSON.stringify({ utm_source: inReader.first.utm_source, gclid: inReader.first.gclid, landing_path: inReader.first.landing_path })}`)
    // A typed question and the Primer link carry them too.
    await page.goto(`${ORIGIN}/read/moby-dick/chapter-2?utm_source=test&gclid=x`, { waitUntil: 'networkidle' })
    const ask = page.waitForRequest(request => new URL(request.url()).pathname === '/reader')
    await page.locator('.scene-margin textarea').fill('Who is Ishmael?')
    await page.locator('.scene-margin textarea').press('Enter')
    const askUrl = new URL((await ask).url())
    assert.equal(askUrl.searchParams.get('gclid'), 'x')
    assert.equal(askUrl.searchParams.get('utm_source'), 'test')
    await page.goto(`${ORIGIN}/read/moby-dick/chapter-2?utm_source=test&gclid=x`, { waitUntil: 'networkidle' })
    const next = await page.locator('.scene-turns a[rel="next"]').getAttribute('href')
    assert.equal(await page.locator('.chapter-continue-link').getAttribute('href'), '/read/moby-dick/chapter-3?utm_source=test&gclid=x')
    assert.equal(next, '/read/moby-dick/chapter-3?utm_source=test&gclid=x')
    ok('a typed question and the next-chapter link keep utm_source and gclid')
    assert.deepEqual(errors.filter(message => !/supabase|fetch|network|Failed to load/i.test(message)), [], 'no page errors')
    await context.close()
  }
  // ===== Signed out, private window: the switch, a remembered choice, Continue reading, a saved place =====
  for (const [device, options] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, userAgent: IPHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
    const context = await local(await browser.newContext({ serviceWorkers: 'block', ...options }))
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${ORIGIN}/read/jane-eyre`, { waitUntil: 'networkidle' })
    const shown = () => page.evaluate(() => ({
      view: document.querySelector('.lab').dataset.view,
      modern: getComputedStyle(document.querySelector('.chapter-col-modern')).display,
      original: getComputedStyle(document.querySelector('.chapter-col-original')).display,
    }))
    assert.deepEqual(await shown(), { view: 'modern', modern: 'block', original: 'none' }, `${device}: Modern English alone first`)
    // Nothing before the text: the first thing in the article after the book's header is the chapter.
    const beforeText = await page.evaluate(() => [...document.querySelectorAll('dialog[open], [role="dialog"]')].filter(el => el.getBoundingClientRect().height).length)
    assert.equal(beforeText, 0, `${device}: no prompt before the text`)
    const switchSel = device === 'desktop' ? '.chapter-view-switch.is-desk' : '.chapter-view-switch.is-phone'
    assert.ok(await page.locator(switchSel).isVisible(), `${device}: switch visible`)
    assert.ok(!(await page.locator(device === 'desktop' ? '.chapter-view-switch.is-phone' : '.chapter-view-switch.is-desk').isVisible()), `${device}: only one switch`)
    await page.locator(`${switchSel} button[data-view="original"]`).click()
    assert.deepEqual(await shown(), { view: 'original', modern: 'none', original: 'block' }, `${device}: Original`)
    await page.screenshot({ path: path.join(OUT, `switch-original-${device}.png`) })
    if (device === 'desktop') {
      await page.locator(`${switchSel} button[data-view="both"]`).click()
      assert.equal((await shown()).view, 'both')
      assert.equal((await shown()).modern, 'contents')
      await page.screenshot({ path: path.join(OUT, `switch-both-${device}.png`) })
      await page.locator(`${switchSel} button[data-view="original"]`).click()
    }
    // The choice is remembered on the next chapter, before the text paints (the layout script sets it).
    await page.goto(`${ORIGIN}/read/jane-eyre/chapter-2`, { waitUntil: 'networkidle' })
    assert.equal((await shown()).view, 'original', `${device}: choice remembered`)
    await page.locator(`${switchSel} button[data-view="modern"]`).click()
    // Continue reading at the end, with the saved-place line shown (storage works here).
    const cont = page.locator('.chapter-continue-link')
    assert.equal((await cont.textContent()).trim(), 'Continue reading: Chapter 3 of 38 →')
    assert.ok(await page.locator('.chapter-saved').isVisible(), `${device}: "Your place is saved" shown`)
    await cont.scrollIntoViewIfNeeded()
    await page.screenshot({ path: path.join(OUT, `continue-${device}.png`) })
    await cont.click()
    await page.waitForURL(/\/read\/jane-eyre\/chapter-3$/)
    // Read into chapter 3, leave, come back to the book page: the way back is offered and lands at the place.
    await page.evaluate(() => document.getElementById('lab-p-12').scrollIntoView({ block: 'start' }))
    await page.waitForTimeout(700)
    const anchor = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-read-place:jane-eyre') || 'null'))
    assert.equal(anchor?.chapter, 3, `${device}: place saved in chapter 3`)
    assert.match(anchor.anchor, /^lab-p-1[12]$/)
    await page.goto(`${ORIGIN}/about`, { waitUntil: 'domcontentloaded' }).catch(() => {})
    await page.goto(`${ORIGIN}/read/jane-eyre`, { waitUntil: 'networkidle' })
    const resume = page.locator('[data-place-resume]')
    assert.ok(await resume.isVisible(), `${device}: resume link on the book page`)
    assert.equal((await resume.textContent()).trim(), 'Continue at Chapter 3 of 38 →')
    await page.screenshot({ path: path.join(OUT, `resume-${device}.png`) })
    await resume.click()
    await page.waitForURL(/chapter-3#lab-p-/)
    await page.waitForTimeout(400)
    const top = await page.evaluate(id => { const box = document.getElementById(id).getBoundingClientRect(); return { top: box.top, header: document.querySelector('.lab-header').getBoundingClientRect().bottom } }, anchor.anchor)
    assert.ok(top.top >= top.header - 4 && top.top < 260, `${device}: lands at the saved paragraph (${JSON.stringify(top)})`)
    // Opening chapter 3 by its own address also returns to the place.
    await page.goto(`${ORIGIN}/read/jane-eyre/chapter-3`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const back = await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('tinct-read-place:jane-eyre') || 'null')
      return { saved, top: document.getElementById(saved.anchor).getBoundingClientRect().top, scrollY }
    })
    assert.ok(back.top < 260 && back.top > -40, `${device}: chapter 3 reopened at the place (${JSON.stringify(back)})`)
    await page.screenshot({ path: path.join(OUT, `place-restored-${device}.png`) })
    assert.deepEqual(errors, [], `${device}: no page errors`)
    ok(`${device} signed out: switch, remembered choice, Continue reading, saved place after leaving and coming back`)
    await context.close()
  }
  // A browser that keeps nothing (storage blocked) does not claim the place is saved.
  {
    const context = await local(await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } }))
    await context.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } }) })
    const page = await context.newPage()
    await page.goto(`${ORIGIN}/read/jane-eyre/chapter-2`, { waitUntil: 'networkidle' })
    assert.ok(!(await page.locator('.chapter-saved').isVisible()), 'no "Your place is saved" without storage')
    await page.locator('.chapter-view-switch.is-desk button[data-view="both"]').click()
    assert.equal(await page.evaluate(() => document.querySelector('.lab').dataset.view), 'both', 'the switch works without storage')
    ok('storage blocked: no "place is saved" claim, the switch still works')
    await context.close()
  }
  const shots = [
    ['book-desktop-jane-eyre', '/read/jane-eyre', { viewport: { width: 1440, height: 900 } }],
    ['book-phone-jane-eyre', '/read/jane-eyre', { viewport: { width: 390, height: 844 }, userAgent: IPHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
    ['chapter26-desktop', '/read/jane-eyre/chapter-26', { viewport: { width: 1440, height: 900 } }],
    ['chapter26-phone', '/read/jane-eyre/chapter-26', { viewport: { width: 390, height: 844 }, userAgent: IPHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
    ['book-desktop-hamlet', '/read/hamlet', { viewport: { width: 1440, height: 900 } }],
    ['scene-phone-hamlet', '/read/hamlet/act-3-scene-1', { viewport: { width: 390, height: 844 }, userAgent: IPHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
    ['book-desktop-crime', '/read/crime-and-punishment', { viewport: { width: 1440, height: 900 } }],
    ['book-chapter-list-desktop', '/read/jane-eyre', { viewport: { width: 1440, height: 900 } }, '#chapters'],
    ['chapter-desktop-light', '/read/moby-dick/chapter-1', { viewport: { width: 1440, height: 900 }, colorScheme: 'light' }],
    ['chapter-desktop-dark', '/read/moby-dick/chapter-1', { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' }],
    ['chapter-phone-light', '/read/moby-dick/chapter-1', { viewport: { width: 390, height: 844 }, colorScheme: 'light', userAgent: IPHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
    ['chapter-phone-dark', '/read/moby-dick/chapter-1', { viewport: { width: 390, height: 844 }, colorScheme: 'dark', userAgent: IPHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
    ['chapter-desktop-odyssey', '/read/odyssey/chapter-2', { viewport: { width: 1440, height: 900 }, colorScheme: 'light' }],
    ['hub-desktop', '/read/shelf/russian-novels', { viewport: { width: 1440, height: 900 } }],
    ['hub-phone', '/read/shelf/russian-novels', { viewport: { width: 390, height: 844 }, userAgent: IPHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ]
  for (const [name, pathname, options, scrollTo] of shots) {
    const context = await local(await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce', ...options }))
    const page = await context.newPage()
    await page.goto(`${ORIGIN}${pathname}`, { waitUntil: 'networkidle' }).catch(() => {})
    await page.waitForTimeout(600)
    if (scrollTo) await page.evaluate(selector => document.querySelector(selector)?.scrollIntoView({ block: 'start' }), scrollTo)
    if (name.startsWith('chapter')) {
      const layout = await page.evaluate(() => { const lab = document.querySelector('.lab'); return { phone: lab.classList.contains('is-phone'), theme: lab.dataset.theme } })
      assert.equal(layout.phone, name.includes('phone'), `${name}: layout`)
      if (name.includes('dark')) assert.equal(layout.theme, 'dark', `${name}: theme`)
    }
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
    if (scrollTo) await page.screenshot({ path: path.join(OUT, `${name}-text.png`), fullPage: false })
    await context.close()
  }
  ok('screenshots', OUT)
  await browser.close()
  console.log(`\n${results.length} checks passed`)
} finally {
  server.close()
}
