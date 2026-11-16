// The follow request on the reader's t button and at the top of the t menu (Anders, 16 Nov 2026). On a built app
// (dist/), served here with the Worker's social markers; Supabase's auth and every /api route are answered in the
// browser by a mocked backend holding two synthetic accounts (A = "Ada Lovelace" follows B; the reader is B).
// Nothing leaves 127.0.0.1; no real account, no AI call.
// - B opens a book: the teal dot on the t button (desktop and phone), an overlay that moves nothing in the header or
//   the reading column, and the saved place unchanged;
// - opening t: the first row names A with A's picture; Follow back sends POST /api/social/follow { handle } (the call
//   Following you makes), the button reads Friends; the dot and the row are gone, on the next open and after a reload;
// - several requests: "{name} and {n} others want to follow you" opens Find readers' Following you;
// - a blocked or removed follower is never named or counted;
// - no dot (and no request read) signed out or on the reader's own book.
// Light, dark and e-ink; 1440×900 and 390×844.
//   cd app && npm run build && node scripts/check-follow-request-t-dot.mjs   (TINCT_DIST=<dir>, FOLLOW_DOT_OUTPUT=<dir>)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = path.resolve(process.env.FOLLOW_DOT_OUTPUT || 'artifacts/follow-request-t-dot')
await fs.mkdir(output, { recursive: true })
const MARKERS = '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">'
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/' ? '/index.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    let body = await fs.readFile(file)
    const ext = path.extname(file)
    // The Worker marks every page while Friends is on (worker.ts withSocialMarkers).
    if (ext === '.html') body = Buffer.from(body.toString('utf8').replace('</head>', `${MARKERS}</head>`))
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.mjs': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
// The built client's own session key (sb-<project>-auth-token), so the reader is signed in from its first paint.
const bundleKeys = new Set(['sb-qa-auth-token'])
for (const name of await fs.readdir(path.join(dist, 'assets'))) {
  if (!name.endsWith('.js')) continue
  for (const match of (await fs.readFile(path.join(dist, 'assets', name), 'utf8')).matchAll(/https:\/\/([a-z0-9]+)\.supabase\.co/g)) bundleKeys.add(`sb-${match[1]}-auth-token`)
}
const B = '00000000-0000-4000-8000-0000000000bb'
const results = []
const ok = (label, pass, detail) => { results.push({ label, pass, detail }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 400) : ''}`) }

const picture = (src, initial) => ({ src, pos: '50% 38%', cover: Boolean(src), private: false, initial })
const ADA = { handle: 'ada', name: 'Ada Lovelace', picture: picture('/lab/library_2/assets/frankenstein.jpg', 'A'), relation: 'followed' }
// The Worker leaves both out (circleOf drops blocks; Remove deletes the follow); here they come back anyway, with the
// relations they would carry, so the reader's own filter is what keeps them out.
const BLOCKED = { handle: 'mallory', name: 'Blocked Mallory', picture: picture(null, 'M'), relation: 'blocked' }
const REMOVED = { handle: 'rita', name: 'Removed Rita', picture: picture(null, 'R'), relation: 'stranger' }
const MORE = [
  { handle: 'cyril', name: 'Cyril Holm', picture: picture(null, 'C'), relation: 'followed' },
  { handle: 'dora', name: 'Dora Vik', picture: picture(null, 'D'), relation: 'followed' },
]

/** A small own EPUB (the reader's private book). */
function smallEpub() {
  const words = (n, seed) => Array.from({ length: n }, (_, i) => `${seed}${'abcdefghij'[i % 10]}${i % 13}`).join(' ')
  const sections = Array.from({ length: 3 }, (_, i) => [`c${i + 1}`, `Section ${i + 1}`, Array.from({ length: 8 }, (_, p) => `${words(80, `s${i + 1}p${p}w`)}.`)])
  const xhtml = (title, paras) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h1>${title}</h1>${paras.map(p => `<p>${p}</p>`).join('')}</body></html>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">follow-dot-qa</dc:identifier><dc:title>A Private Book</dc:title><dc:creator>Q. Example</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${sections.map(([id]) => `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${sections.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`],
    ['OEBPS/nav.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol>${sections.map(([id, title]) => `<li><a href="${id}.xhtml">${title}</a></li>`).join('')}</ol></nav></body></html>`],
    ...sections.map(([id, title, paras]) => [`OEBPS/${id}.xhtml`, xhtml(title, paras), { deflate: true }]),
  ])
}
const epub = smallEpub()
const epubSha = createHash('sha256').update(epub).digest('hex')
const epubHex = epubSha.slice(0, 24)

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))

/** One reader B in a fresh browser, with A (and others) following. The backend's state outlives a reload. */
async function open(name, { phone = false, theme = 'light', eink = false, signedIn = true, followers = [ADA, BLOCKED, REMOVED], url = '/reader?book=frankenstein&sharedReader=1', ownBook = false } = {}) {
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, isMobile: phone, deviceScaleFactor: phone ? 2 : 1, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage()
  const backend = { followers: followers.map(row => ({ ...row })), follows: [], findCalls: 0, fullFindCalls: 0, positionWrites: 0 }
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const request = route.request(), u = new URL(request.url())
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (u.hostname.endsWith('.supabase.co')) {
      if (u.pathname === '/auth/v1/user') return signedIn ? json(200, { id: B, aud: 'authenticated', email: 'reader-b@example.test', user_metadata: { full_name: 'Bea' } }) : json(401, {})
      if (u.pathname.startsWith('/rest/v1/') && !u.pathname.startsWith('/rest/v1/rpc/')) return json(200, [])
      return json(200, {})
    }
    if (u.origin !== origin) return route.fulfill({ status: 401, json: {} })
    const following = () => backend.followers.map(({ handle, name, picture, relation }) => ({ handle, name, link: `tinct.app/@${handle}`, picture, relation, book: null }))
    if (u.pathname === '/api/social/find' && request.method() === 'GET') {
      if (u.searchParams.get('only') === 'following-you') { backend.findCalls++; return json(200, { followingYou: following() }) }
      backend.fullFindCalls++
      return json(200, { followingYou: following(), alsoReading: [], link: 'tinct.app/@bea', everyoneOpen: false })
    }
    if (['/api/social/follow', '/api/social/unfollow', '/api/social/remove-follower'].includes(u.pathname) && request.method() === 'POST') {
      const { handle } = request.postDataJSON() ?? {}
      const row = backend.followers.find(item => item.handle === handle)
      backend.follows.push({ path: u.pathname, handle, auth: request.headers().authorization ?? null })
      if (u.pathname === '/api/social/follow' && row && row.relation === 'followed') row.relation = 'friend'
      return json(200, { ok: true, relation: row?.relation ?? 'follower', followsYou: Boolean(row) })
    }
    if (u.pathname === '/api/social/blocked') return json(200, { blocked: [{ id: '00000000-0000-4000-8000-00000000000d', name: 'Blocked Mallory', handle: 'mallory' }] })
    if (u.pathname === '/api/social/board') return json(200, { tab: 'friends', window: { start: '2026-11-10', end: '2026-11-16' }, refreshedAt: null, total: 1, me: null, meShown: false, friends: 0, everyoneOpen: false, entries: [] })
    if (u.pathname === '/api/social/rank') return json(200, { rank: null, total: 0, seconds: 0 })
    if (u.pathname === '/api/profile' && request.method() === 'GET') {
      return json(200, { enabled: true, available: true, profile: { handle: 'bea', link: 'tinct.app/@bea', name: 'Bea', picture: { kind: 'initial', value: null, url: null, review: 'none' }, background: { kind: 'set', value: 'stoic', url: null, review: 'none' }, visibility: 'friends', effectiveVisibility: 'friends', showReading: true, showTime: true, onLeaderboard: true, newBooksOpenIn: 'modern', setUp: true, needsSetup: false, shouldPrompt: false, emailConfirmed: true, emailOptIn: false, googlePhoto: false, uploads: false } })
    }
    if (u.pathname === '/api/reading-time/status') return json(200, { enabled: true })
    if (u.pathname === '/api/reading-time') return json(200, { enabled: true, rows: [] })
    if (u.pathname === '/api/lab-position') { if (request.method() !== 'GET') backend.positionWrites++; return json(request.method() === 'GET' ? 404 : 200, {}) }
    if (u.pathname === '/api/user-books' && request.method() === 'GET') return json(200, ownBook ? { books: [{ id: epubSha.slice(32, 64), type: 'epub', sha256: epubSha, name: 'A Private Book.epub', title: 'A Private Book', author: '', size: 1, createdAt: '2026-11-13T00:00:00.000Z' }] } : { books: [] })
    if (/^\/api\/user-books\/(marks|cards)\//.test(u.pathname)) return json(200, { marks: [], cards: [], rev: 0, fileId: epubSha.slice(32, 64) })
    if (u.pathname === '/api/user-books/places') return json(200, { places: {} })
    if (u.pathname.startsWith('/api/')) return json(404, {})
    return route.continue()
  })
  await page.addInitScript(({ signedIn, theme, user, keys }) => {
    if (sessionStorage.getItem('follow-dot-seeded')) return
    sessionStorage.setItem('follow-dot-seeded', '1')
    localStorage.setItem('tinct:wipe-v1-done', '1')
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ fontFamily: 'garamond', fontSize: 1.0, fontSizeExplicit: true, theme, compareOpen: false }))
    if (signedIn) {
      const session = JSON.stringify({ access_token: 'qa-token-b', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user, email: 'reader-b@example.test', aud: 'authenticated', user_metadata: {} } })
      for (const key of keys) localStorage.setItem(key, session)
      document.cookie = 'tinct_auth=1; path=/'
    }
  }, { signedIn, theme, user: B, keys: [...bundleKeys] })
  if (ownBook) {
    await page.goto(`${origin}/index.html`)
    await page.evaluate(async ({ key, bytes, user, fileId }) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('tinct-addbook', 1)
        request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      await new Promise((resolve, reject) => {
        const tx = db.transaction('books', 'readwrite')
        tx.objectStore('books').put({ key, kind: 'epub', name: 'A Private Book.epub', title: 'A Private Book', owner: user, cloudId: fileId, bytes: new Uint8Array(bytes).buffer })
        tx.oncomplete = resolve
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    }, { key: `epub:${epubHex}`, bytes: [...epub], user: B, fileId: epubSha.slice(32, 64) })
  }
  await page.goto(`${origin}${ownBook ? `/reader?userBook=${epubHex}&sharedReader=1` : url}${phone && !ownBook ? '&layout=phone' : ''}${eink ? '&eink=1' : ''}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  if (eink) assert.equal(await page.evaluate(() => document.documentElement.dataset.eink), 'true', 'the e-ink display profile is on')
  if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(600)
  return { name, page, context, backend, errors, phone }
}

/** The t button, the header, the first words on screen and the saved place: what must not move. */
async function snapshot(page) {
  return page.evaluate(() => {
    const box = node => { if (!node) return null; const r = node.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(n => Math.round(n * 100) / 100) }
    const words = [...document.querySelectorAll('[data-testid="lab-word"]')].filter(node => { const r = node.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight }).slice(0, 60)
    const store = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')
    const saved = store?.books?.frankenstein
    const lab = document.querySelector('.lab')
    return {
      header: box(document.querySelector('.lab-header')),
      controls: box(document.querySelector('.lab-header-controls')),
      tButton: box(document.querySelector('[data-testid="lab-super"]')),
      words: words.map(node => `${node.textContent}@${box(node).join(',')}`),
      saved: saved ? { chapter: saved.chapterNumber, paragraph: saved.paragraphIndex, word: saved.wordIndex } : null,
      place: lab?.dataset.place ?? null,
      chapter: lab?.dataset.chapter ?? null,
      scroll: [scrollX, scrollY],
    }
  })
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/** The t button, made visible (the phone hides its controls while reading quietly). */
async function tButton(page) {
  const button = page.getByTestId('lab-super')
  if (!(await button.isVisible().catch(() => false))) {
    const header = page.locator('.lab-header')
    await header.click({ position: { x: 20, y: 20 } }).catch(() => {})
    await button.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
  return button
}

async function dotStyle(page) {
  return page.getByTestId('lab-super-dot').evaluate(node => {
    const s = getComputedStyle(node), r = node.getBoundingClientRect(), b = node.parentElement.getBoundingClientRect()
    return { position: s.position, width: r.width, height: r.height, background: s.backgroundColor, shadow: s.boxShadow, inside: r.left >= b.left && r.right <= b.right && r.top >= b.top && r.bottom <= b.bottom }
  })
}

const shot = (page, file) => page.screenshot({ path: path.join(output, file) })

try {
  // 1. One request, desktop and phone (light): dot, row, Follow back, gone after a reload.
  for (const phone of [false, true]) {
    const label = phone ? 'phone' : 'desktop'
    const run = await open(`single-${label}`, { phone })
    const { page, backend } = run
    try {
      const button = await tButton(page)
      await button.waitFor({ state: 'visible' })
      const before = await snapshot(page)
      ok(`${label}: no dot before the requests are read`, (await page.getByTestId('lab-super-dot').count()) === 0)
      await page.getByTestId('lab-super-dot').waitFor({ timeout: 12000 })
      const after = await snapshot(page)
      ok(`${label}: the requests are read once`, backend.findCalls === 1, backend.findCalls)
      ok(`${label}: the dot moves nothing in the header`, same(before.header, after.header) && same(before.controls, after.controls) && same(before.tButton, after.tButton), { before: [before.header, before.tButton], after: [after.header, after.tButton] })
      ok(`${label}: the dot moves no word in the reading column`, before.words.length > 10 && same(before.words, after.words), { words: before.words.length })
      ok(`${label}: the dot keeps the reading place`, same(before.saved, after.saved) && before.place === after.place && before.chapter === after.chapter && same(before.scroll, after.scroll), { before: [before.saved, before.place], after: [after.saved, after.place] })
      const style = await dotStyle(page)
      ok(`${label}: the dot is the library's 9px teal dot, laid over the t button`, style.position === 'absolute' && style.width === 9 && style.height === 9 && style.inside && style.background === 'rgb(31, 74, 92)', style)
      await shot(page, `${label}-light-t-dot.png`)
      await page.getByTestId('lab-super-dot').evaluate(node => node.parentElement.scrollIntoView({ block: 'nearest' }))
      await page.locator('.lab-header').screenshot({ path: path.join(output, `${label}-light-t-dot-header.png`) })

      await button.click()
      const row = page.getByTestId('lab-super-request')
      await row.waitFor()
      const line = (await page.getByTestId('lab-super-request-line').textContent())?.trim()
      ok(`${label}: the first row names A`, line === 'Ada Lovelace wants to follow you', line)
      ok(`${label}: the row leads the menu`, await page.getByTestId('lab-super-menu').evaluate(nav => nav.firstElementChild?.dataset.testid === 'lab-super-request'))
      const pic = await page.getByTestId('lab-super-request-picture').evaluate(node => getComputedStyle(node).backgroundImage)
      ok(`${label}: the row carries A's picture`, /frankenstein/.test(pic), pic.slice(0, 120))
      const menuText = await page.getByTestId('lab-super-menu').innerText()
      ok(`${label}: a blocked or removed follower never appears`, !/Mallory|Rita|other/.test(menuText), menuText.split('\n').slice(0, 3))
      ok(`${label}: opening the menu clears the dot (seen)`, (await page.getByTestId('lab-super-dot').count()) === 0 && await page.evaluate(user => JSON.parse(localStorage.getItem(`tinct:follow-requests-seen:${user}`) || '[]').includes('ada'), B))
      const font = await page.getByTestId('lab-super-request-line').evaluate(node => getComputedStyle(node).fontFamily)
      ok(`${label}: the row is in the system UI face`, /system-ui/.test(font) && !/mono/i.test(font), font)
      await page.waitForTimeout(250)
      await shot(page, `${label}-light-menu-row.png`)

      await page.getByRole('button', { name: 'Follow back', exact: true }).click()
      await page.locator('[data-testid="lab-super-request"][data-follow-back="done"]').waitFor()
      ok(`${label}: Follow back calls the Following you API for A`, backend.follows.length === 1 && backend.follows[0].path === '/api/social/follow' && backend.follows[0].handle === 'ada' && backend.follows[0].auth === 'Bearer qa-token-b', backend.follows)
      ok(`${label}: A and B are friends in the backend`, backend.followers.find(row => row.handle === 'ada').relation === 'friend')
      ok(`${label}: the row stays for this open, showing Friends`, await row.isVisible() && (await page.getByTestId('lab-super-request-follow').isDisabled()))
      await page.waitForTimeout(250)
      await shot(page, `${label}-light-after-follow-back.png`)
      await page.keyboard.press('Escape')
      await page.getByTestId('lab-super-menu').waitFor({ state: 'detached' })
      const closed = await snapshot(page)
      ok(`${label}: menu and follow back keep the reading place`, same(before.saved, closed.saved) && before.place === closed.place && same(before.words, closed.words), { before: before.saved, after: closed.saved })
      await (await tButton(page)).click()
      await page.getByTestId('lab-super-menu').waitFor()
      ok(`${label}: the next open shows no row`, (await page.getByTestId('lab-super-request').count()) === 0)
      await page.keyboard.press('Escape')
      ok(`${label}: no dot after the follow back`, (await page.getByTestId('lab-super-dot').count()) === 0)

      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
      await page.waitForTimeout(6500)
      ok(`${label}: after a reload the requests were read again`, backend.findCalls === 2, backend.findCalls)
      ok(`${label}: and no dot comes back`, (await page.getByTestId('lab-super-dot').count()) === 0)
      await (await tButton(page)).click()
      await page.getByTestId('lab-super-menu').waitFor()
      ok(`${label}: and no row comes back`, (await page.getByTestId('lab-super-request').count()) === 0)
      ok(`${label}: no page errors`, run.errors.length === 0, run.errors)
    } finally { await run.context.close() }
  }

  // 2. Several requests: one row, "{name} and {n} others", opening Following you.
  {
    const run = await open('several', { followers: [ADA, BLOCKED, ...MORE, REMOVED] })
    const { page } = run
    try {
      await page.getByTestId('lab-super-dot').waitFor({ timeout: 12000 })
      await page.getByTestId('lab-super').click()
      await page.getByTestId('lab-super-request').waitFor()
      const line = (await page.getByTestId('lab-super-request-line').textContent())?.trim()
      ok('several: the row names the first and counts the others (blocked and removed left out)', line === 'Ada Lovelace and 2 others want to follow you', line)
      ok('several: no Follow back on the row', (await page.getByTestId('lab-super-request-follow').count()) === 0)
      await page.waitForTimeout(250)
      await shot(page, 'desktop-light-menu-row-several.png')
      await page.getByTestId('lab-super-request').click()
      const rows = page.locator('[data-testid="following-you-row"]')
      await rows.first().waitFor({ timeout: 15000 })
      const names = await rows.allInnerTexts()
      ok('several: the row opens Following you', names.length >= 3 && names.some(text => text.includes('Ada Lovelace')), names.map(text => text.split('\n')[0]))
      ok('several: Following you lists no blocked or removed follower', !names.some(text => /Mallory/.test(text)), names.map(text => text.split('\n')[0]))
      await page.waitForTimeout(300)
      await shot(page, 'desktop-light-following-you.png')
      ok('several: no page errors', run.errors.length === 0, run.errors)
    } finally { await run.context.close() }
  }

  // 3. Dark (desktop) and e-ink (phone): the dot and the row in each look.
  for (const look of [{ name: 'desktop-dark', theme: 'dark', phone: false, dot: 'rgb(120, 170, 189)' }, { name: 'phone-eink', theme: 'light', eink: true, phone: true, dot: 'rgb(17, 17, 17)' }, { name: 'desktop-eink', theme: 'light', eink: true, phone: false, dot: 'rgb(17, 17, 17)' }, { name: 'phone-dark', theme: 'dark', phone: true, dot: 'rgb(120, 170, 189)' }]) {
    const run = await open(look.name, look)
    const { page } = run
    try {
      const button = await tButton(page)
      const before = await snapshot(page)
      await page.getByTestId('lab-super-dot').waitFor({ timeout: 12000 })
      const after = await snapshot(page)
      const style = await dotStyle(page)
      ok(`${look.name}: the dot's colour`, style.background === look.dot && style.inside, style)
      if (look.eink) ok(`${look.name}: no shadow on e-ink`, style.shadow === 'none', style.shadow)
      ok(`${look.name}: nothing moves and the place is kept`, same(before.header, after.header) && same(before.tButton, after.tButton) && same(before.words, after.words) && same(before.saved, after.saved), { before: before.saved, after: after.saved })
      await shot(page, `${look.name}-t-dot.png`)
      await button.click()
      await page.getByTestId('lab-super-request').waitFor()
      const colors = await page.getByTestId('lab-super-request-follow').evaluate(node => { const s = getComputedStyle(node); return [s.backgroundColor, s.color, s.textTransform, s.fontFamily] })
      ok(`${look.name}: Follow back is a sentence-case system pill`, colors[2] === 'none' && /system-ui/.test(colors[3]) && colors[0] !== colors[1], colors)
      await page.waitForTimeout(250)
      await shot(page, `${look.name}-menu-row.png`)
      ok(`${look.name}: no page errors`, run.errors.length === 0, run.errors)
    } finally { await run.context.close() }
  }

  // 4. Signed out, and the reader's own (private) book: no request read, no dot, no row.
  for (const [name, options] of [['signed-out', { signedIn: false }], ['own-book', { ownBook: true }]]) {
    const run = await open(name, options)
    const { page, backend } = run
    try {
      await page.waitForTimeout(6500)
      ok(`${name}: the requests are never asked for`, backend.findCalls === 0, backend.findCalls)
      ok(`${name}: no dot`, (await page.getByTestId('lab-super-dot').count()) === 0)
      const button = await tButton(page)
      if (await button.isVisible().catch(() => false)) {
        await button.click()
        await page.getByTestId('lab-super-menu').waitFor()
        ok(`${name}: no request row`, (await page.getByTestId('lab-super-request').count()) === 0)
        await shot(page, `${name}-menu.png`)
      } else ok(`${name}: the t button is reachable`, false)
    } finally { await run.context.close() }
  }
} finally {
  await browser.close()
  server.close()
}
const failed = results.filter(item => !item.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots: ${output}`)
assert.equal(failed.length, 0, `${failed.length} follow request check(s) failed: ${failed.map(item => item.label).join('; ')}`)
