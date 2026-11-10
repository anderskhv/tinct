// "Add your own" (approved mockup, Anders 9 Nov 2026: "3 options, upload, insert link, paste text… no extra
// links, keep it clean"): the layout of the three choices wherever the add flow starts.
//
// Loads the built site (dist/) in headless Chromium at desktop 1440 and phone 390 and asserts:
// 1. The library's pop-up, signed in, and the hero's add sheet, signed out: the title "Add your own" in Playfair
//    Display, exactly three choices (Upload, Insert link, Paste text, each with its short line) in the system UI
//    face and nothing else. Desktop: a centred dialog about 600px wide with three equal tiles in a row. Phone: a
//    bottom sheet, full width, with three full-width rows and the short line at the right.
// 2. Insert link: the title "Insert link", a back chevron, one field "Link to an article", Add; the chevron goes back.
// 3. Paste text: the paste box with a back chevron and no "Choose a file instead".
// 4. /byob: the same three choices in its approved page, and its Insert link step.
// Every /api call is answered here and nothing leaves the machine. Run after `npm run build`, from app/ or
// app/scripts: node scripts/check-add-three-choices.mjs   (ADD3_ARTIFACTS=<dir> writes screenshots)
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { markInternal } from './lib/internalTraffic.cjs'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(APP, 'dist')
const ARTIFACTS = process.env.ADD3_ARTIFACTS || ''
const USER = '00000000-0000-4000-8000-0000000add03'
const CSP = (await fs.readFile(path.join(APP, 'src/worker/routes/seo.ts'), 'utf8')).match(/'Content-Security-Policy': "([^"]+)"/)[1]
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.wasm': 'application/wasm' }
const PAGES = { '/library': '/lab/library_2/index.html', '/library/': '/lab/library_2/index.html', '/byob': '/byob.html', '/byob/': '/byob.html' }
const DESKTOP = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
const LABELS = ['Upload', 'Insert link', 'Paste text'], LINES = ['PDF, EPUB, text', 'An article online', 'Any text you copied']

function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local')
    let pathname = PAGES[url.pathname] || decodeURIComponent(url.pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.join(DIST, path.normalize(pathname))
    try {
      if (!file.startsWith(DIST + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', ...(file.endsWith('.html') ? { 'content-security-policy': CSP } : {}) })
      res.end(await fs.readFile(file))
    } catch { res.writeHead(404); res.end() }
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}
async function supabaseHost() {
  for (const name of await fs.readdir(path.join(DIST, 'assets'))) {
    if (!name.endsWith('.js')) continue
    const match = (await fs.readFile(path.join(DIST, 'assets', name), 'utf8')).match(/https:\/\/([a-z0-9]+)\.supabase\.co/)
    if (match) return { host: `${match[1]}.supabase.co`, ref: match[1] }
  }
  throw new Error('The build names no Supabase project')
}
const userRecord = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
function session() {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  return { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: userRecord }
}
async function context(browser, origin, supabase, { signedIn, viewport }) {
  const c = await browser.newContext({ viewport, baseURL: origin, serviceWorkers: 'block', reducedMotion: 'reduce' })
  await c.route(url => /^https?:$/.test(url.protocol) && url.origin !== origin && url.hostname !== supabase.host, route => route.abort())
  await c.route('**/*.mp4', route => route.abort())
  await c.route(`${origin}/api/**`, route => {
    const p = new URL(route.request().url()).pathname
    if (p === '/api/lab-position') return route.fulfill({ json: { books: {}, finished: {}, owner: USER, hidden: {}, updatedAt: 0 } })
    if (p === '/api/public-books/import/access') return route.fulfill({ json: { canAdd: true } })
    if (p === '/api/user-books') return route.fulfill({ json: { books: [] } })
    if (p === '/api/import-article') return route.fulfill({ status: 500, json: { error: 'not in this check' } })
    return route.fulfill({ status: 204, body: '' })
  })
  await c.route(`https://${supabase.host}/**`, route => (new URL(route.request().url()).pathname.startsWith('/auth/v1/user') ? route.fulfill({ json: userRecord }) : route.fulfill({ json: [] })))
  if (signedIn) {
    await c.addCookies([{ name: 'tinct_auth', value: '1', url: origin }])
    await c.addInitScript(({ key, value }) => { try { if (!localStorage.getItem(key)) localStorage.setItem(key, value) } catch { /* private */ } }, { key: `sb-${supabase.ref}-auth-token`, value: JSON.stringify(session()) })
  }
  return c
}
const shot = async (page, name) => { if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${name}.png`) }) }
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
const libraryReady = page => page.waitForFunction(() => document.documentElement.classList.contains('library-ready'), null, { timeout: 60000 })
const rect = loc => loc.evaluate(el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) } })
const rects = loc => loc.evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }))
const family = loc => loc.evaluate(el => getComputedStyle(el).fontFamily)

/** The three choices in `dialog` (a .tui-dialog), laid out as the mockup has them for this viewport. */
async function assertChoices(page, dialog, viewport, label) {
  assert.equal(await dialog.locator('h2').innerText(), 'Add your own', `${label}: the title`)
  assert.match(await family(dialog.locator('h2')), /Playfair Display/, `${label}: the title in Playfair Display`)
  assert.deepEqual(await dialog.locator('.add-choice__label').allInnerTexts(), LABELS, `${label}: the three choices`)
  assert.deepEqual(await dialog.locator('.add-choice__line').allInnerTexts(), LINES, `${label}: their short lines`)
  for (const part of ['.add-choice__label', '.add-choice__line']) assert.match(await family(dialog.locator(part).first()), /system-ui|-apple-system/, `${label}: ${part} in the system UI face`)
  assert.equal((await dialog.innerText()).replace(/\s+/g, ' ').trim(), ['Add your own', ...LABELS.flatMap((l, i) => [l, LINES[i]])].join(' '), `${label}: nothing else (no links, no helper lines)`)
  assert.equal(await dialog.locator('a, .paste-quiet-link').count(), 0, `${label}: no links`)
  assert.equal(await dialog.locator('.add-choice svg').count(), 3, `${label}: an icon on each choice`)
  const box = await rect(dialog), tiles = await rects(dialog.locator('.add-choice'))
  // The screen the dialog sits on: its scrim (the library keeps a classic scrollbar's gutter in headless Chromium;
  // a phone's overlay scrollbar takes none).
  const view = await dialog.evaluate(el => { const r = el.closest('.tui-scrim').getBoundingClientRect(); return { width: r.width, height: r.height } })
  if (viewport.width >= 700) {
    assert(box.w >= 580 && box.w <= 620, `${label}: a ~600px dialog (${box.w})`)
    assert(Math.abs(box.x + box.w / 2 - view.width / 2) <= 2 && Math.abs(box.y + box.h / 2 - view.height / 2) <= 2, `${label}: centred (${JSON.stringify(box)})`)
    assert(tiles.every(t => Math.abs(t.y - tiles[0].y) <= 1 && Math.abs(t.w - tiles[0].w) <= 1 && Math.abs(t.h - tiles[0].h) <= 1), `${label}: three equal tiles in a row (${JSON.stringify(tiles)})`)
  } else {
    assert(box.x <= 0 && box.w >= view.width - 1 && box.b >= view.height - 1, `${label}: a full-width bottom sheet (${JSON.stringify(box)})`)
    assert(tiles.every((t, i) => t.x === tiles[0].x && t.w === tiles[0].w && (i === 0 || t.y >= tiles[i - 1].y + tiles[i - 1].h - 1)), `${label}: three full-width rows (${JSON.stringify(tiles)})`)
    assert(tiles[0].w >= view.width - 48, `${label}: rows span the sheet (${tiles[0].w})`)
    const line = await rect(dialog.locator('.add-choice__line').first()), row = tiles[0]
    assert(Math.abs(line.x + line.w - (row.x + row.w)) <= 4, `${label}: the short line sits at the right (${JSON.stringify(line)})`)
  }
  assert(await noSideScroll(page), `${label}: no sideways scroll`)
}
async function assertLinkStep(page, dialog, label) {
  assert.equal(await dialog.getAttribute('data-step'), 'link')
  assert.equal(await dialog.locator('h2').innerText(), 'Insert link', `${label}: the title`)
  assert(await dialog.locator('.tui-dialog__head .add-own-back').isVisible(), `${label}: a back chevron`)
  assert.equal(await dialog.locator('.add-link__label').innerText(), 'Link to an article')
  assert.equal(await dialog.locator('input:not([type=file])').count(), 1, `${label}: one field`)
  assert.deepEqual(await dialog.locator('button:visible').allInnerTexts().then(t => t.filter(Boolean)), ['Add'], `${label}: one button, Add`)
  assert(await dialog.locator('.add-link__add').isDisabled(), `${label}: Add waits for a link`)
}

async function main() {
  if (ARTIFACTS) await fs.mkdir(ARTIFACTS, { recursive: true })
  const server = await serve(), origin = `http://127.0.0.1:${server.address().port}`
  const supabase = await supabaseHost()
  const browser = await markInternal(await chromium.launch({ args: ['--mute-audio'] }))
  const failures = []
  const run = async (label, fn) => { try { await fn(); console.log(`ok   ${label}`) } catch (error) { failures.push(label); console.log(`FAIL ${label}\n     ${String(error.message).split('\n').slice(0, 8).join('\n     ')}`) } }
  try {
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`library pop-up, signed in, ${name}: three choices, Insert link, Paste text`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: true, viewport }), page = await c.newPage()
        const errors = []; page.on('pageerror', e => errors.push(e.message))
        await page.goto('/library?sharedReader=1')
        await libraryReady(page)
        await page.locator('#library-add:visible').click()
        const dialog = page.locator('.own-file-dialog')
        await page.locator('.own-file-dialog[data-step="choose"]').waitFor()
        await page.waitForTimeout(400)
        await page.mouse.move(0, 0)
        await assertChoices(page, dialog, viewport, 'library pop-up')
        await shot(page, `library-choose-${name}`)
        await page.getByRole('button', { name: 'Insert link', exact: true }).click()
        await assertLinkStep(page, dialog, 'library pop-up')
        await page.locator('.add-link__input').fill('news.example.org/otters')
        assert(await dialog.locator('.add-link__add').isEnabled())
        await page.locator('.add-link__input').evaluate(el => el.blur())
        await shot(page, `library-link-${name}`)
        await dialog.locator('.add-own-back').click()
        await page.locator('.own-file-dialog[data-step="choose"]').waitFor()
        await page.getByRole('button', { name: 'Paste text', exact: true }).click()
        await page.locator('.own-file-dialog.paste-dialog[data-step="paste"]').waitFor()
        assert(await dialog.locator('.tui-dialog__head .add-own-back').isVisible(), 'Paste text: a back chevron')
        assert.equal(await dialog.getByText('Choose a file', { exact: false }).count(), 0, 'Paste text: no "Choose a file instead"')
        assert.equal(await dialog.locator('.paste-title__text').getAttribute('data-placeholder'), 'Paste text')
        await shot(page, `library-paste-${name}`)
        assert.deepEqual(errors, [])
        await c.close()
      })
      await run(`library hero, signed out, ${name}: the same three choices`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        await page.goto('/library')
        await libraryReady(page)
        await page.locator('#hero-own').click()
        const sheet = page.locator('[data-testid="own-start"] .own-start')
        await sheet.waitFor()
        await page.waitForTimeout(400)
        await page.mouse.move(0, 0)
        await assertChoices(page, sheet, viewport, 'signed-out sheet')
        await shot(page, `hero-choose-${name}`)
        await page.getByRole('button', { name: 'Insert link', exact: true }).click()
        await assertLinkStep(page, sheet, 'signed-out sheet')
        await shot(page, `hero-link-${name}`)
        await c.close()
      })
      await run(`/byob, signed out, ${name}: the three choices in the page; Insert link in place`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        await page.goto('/byob')
        await page.locator('.add-choices').waitFor()
        assert.deepEqual(await page.locator('.add-choice__label').allInnerTexts(), LABELS)
        assert.deepEqual(await page.locator('.add-choice__line').allInnerTexts(), LINES)
        const tiles = await rects(page.locator('.add-choice'))
        if (name === 'desktop') assert(tiles.every(t => Math.abs(t.y - tiles[0].y) <= 1 && Math.abs(t.w - tiles[0].w) <= 1), `three tiles in a row (${JSON.stringify(tiles)})`)
        else assert(tiles.every((t, i) => t.x === tiles[0].x && t.w === tiles[0].w && (i === 0 || t.y > tiles[i - 1].y)), `three full-width rows (${JSON.stringify(tiles)})`)
        const labels = await rects(page.locator('.add-choice__label'))
        if (name === 'desktop') assert(labels.every(l => Math.abs(l.y - labels[0].y) <= 1), `the labels line up (${JSON.stringify(labels)})`)
        else assert(labels.every(l => l.x === labels[0].x), `the labels line up (${JSON.stringify(labels)})`)
        assert(await noSideScroll(page))
        await page.mouse.move(0, 0)
        await shot(page, `byob-choose-${name}`)
        await page.locator('#link').click()
        await page.locator('#link-area').waitFor()
        assert.equal(await page.locator('#link-title').innerText(), 'Insert link')
        assert.equal(await page.locator('#link-area .add-link__label').innerText(), 'Link to an article')
        assert(await page.locator('#link-back').isVisible())
        assert.equal(await page.locator('.foot:visible').count(), 0, 'no link at the foot')
        assert(await noSideScroll(page))
        await shot(page, `byob-link-${name}`)
        await page.locator('#link-back').click()
        await page.locator('#link-area').waitFor({ state: 'hidden' })
        assert(await page.locator('.add-choices').isVisible(), 'back on the three choices')
        await c.close()
      })
    }
  } finally {
    await browser.close()
    server.close()
  }
  if (failures.length) { console.log(`\n${failures.length} failed`); process.exit(1) }
  console.log('\nAll add-your-own checks passed')
}

await main()
