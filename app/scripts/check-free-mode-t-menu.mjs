#!/usr/bin/env node
// Free reading mode's t menu (/reader?book=…&mode=free&ref=…; approved mockup, Anders 27 Nov 2026). On a built app
// (dist/), served here, as a guest, at 1440×900 and 390×844:
// - the menu is Summarize this chapter, Catch me up | Appearance, Book settings | the way back, Create profile, with
//   no counter and no selling line, and every row measures as the normal reader's menu rows do (face, size, row
//   height, icon column, the icons themselves);
// - Summarize this chapter and Catch me up show their answer on screen, each from its own guest route with no
//   account attached, each counted once on the device's free AI actions (the counter Explain uses); a card already
//   made opens again uncounted; with the actions used, the rows open Explain's account sheet and send nothing;
// - the way back is named for the page the reader came from (ref=modern-english, nudansk, shakespeare) and goes
//   there, as the reader's back arrow does; with no such page it is Library, as before;
// - Create profile opens the sign-up sheet with this address to return to, and that address, signed in, is the
//   normal reader at the place this device kept;
// - the reading place never moves, and nothing but the three guest routes and the anonymous events is sent to /api.
// Nothing leaves 127.0.0.1: every /api route and Supabase are answered here with canned replies. No AI call.
//   cd app && npm run build && node scripts/check-free-mode-t-menu.mjs   (TINCT_DIST=<dir>, FREE_MENU_OUTPUT=<dir>)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { markInternal } from './lib/internalTraffic.cjs'

// PLAYWRIGHT_MODULE: another Playwright build (a machine whose installed browsers are not this project's).
const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium } = playwright.chromium ? playwright : playwright.default

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = path.resolve(process.env.FREE_MENU_OUTPUT || 'artifacts/free-mode-t-menu')
await fs.mkdir(output, { recursive: true })
const SCALE = Number(process.env.FREE_MENU_SCALE || 2)

/** The pages free mode goes back to. One not built here (/shakespeare is another change) is answered with a stand-in. */
const HUBS = { 'modern-english': '/modern-english', nudansk: '/nudansk', shakespeare: '/shakespeare' }
const PAGES = { '/reader': '/app.html', '/': '/index.html', '/library': '/lab/library_2/index.html', '/sign-in': '/lab/sign-in/index.html' }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.mjs': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const hub = Object.values(HUBS).includes(url.pathname)
  const file = path.resolve(dist, '.' + (PAGES[url.pathname] || (hub ? `${url.pathname}.html` : url.pathname)))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }); res.end(body)
  } catch {
    if (hub || PAGES[url.pathname]) { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(`<!doctype html><title>${url.pathname}</title><p data-stand-in>${url.pathname}</p>`); return }
    res.writeHead(404); res.end()
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

// The built client's own session key (sb-<project>-auth-token), for the signed-in return after Create profile.
const sessionKeys = new Set(['sb-qa-auth-token'])
for (const name of await fs.readdir(path.join(dist, 'assets'))) {
  if (!name.endsWith('.js')) continue
  for (const match of (await fs.readFile(path.join(dist, 'assets', name), 'utf8')).matchAll(/https:\/\/([a-z0-9]+)\.supabase\.co/g)) sessionKeys.add(`sb-${match[1]}-auth-token`)
}

const results = []
const ok = (label, pass, detail) => { results.push({ label, pass, detail }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 900) : ''}`) }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const COUNT_KEY = 'tinct:lab-ai-actions'
const FREE_ACTIONS = 10
const SUMMARY = [
  { title: 'What happens', text: 'CANNED SUMMARY ONE. Marcus sets out what he owes to each of the people who formed him.' },
  { title: 'Why it matters', text: 'CANNED SUMMARY TWO. The debts are a portrait of the character he is trying to keep.' },
]
const GUEST_ROUTES = ['/api/lab-chat', '/api/lab-chapter-notes', '/api/lab-catch-up']
const DEVICE = 'free-menu-qa-device'

const browser = await markInternal(await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))

/**
 * One guest in a fresh browser. `place` seeds the place this device kept in the book (the reader's own local store),
 * `used` the free AI actions already used on the device, `session` a Tinct session (the signed-in return).
 */
async function open({ phone = false, scheme = 'light', book = 'meditations', address, place = null, used = 0, session = false } = {}) {
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, isMobile: phone, deviceScaleFactor: SCALE, colorScheme: scheme, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage()
  const api = [], writes = [], errors = []
  page.on('pageerror', error => errors.push(error.message))
  await context.route('**/*', async route => {
    const request = route.request(), u = new URL(request.url())
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (u.hostname.endsWith('.supabase.co')) {
      if (request.method() !== 'GET') writes.push(`${request.method()} ${u.pathname}`)
      if (u.pathname === '/auth/v1/user') return session ? json(200, { id: '00000000-0000-4000-8000-0000000000aa', aud: 'authenticated', email: 'guest-turned-reader@example.test', user_metadata: {} }) : json(401, {})
      if (u.pathname.startsWith('/rest/v1/') && !u.pathname.startsWith('/rest/v1/rpc/')) return json(200, [])
      return json(200, {})
    }
    if (u.origin !== origin) return route.abort()
    if (!u.pathname.startsWith('/api/')) return route.continue()
    let body = null
    try { body = request.postDataJSON() } catch { body = null }
    api.push({ path: u.pathname, method: request.method(), auth: request.headers().authorization ?? null, body })
    if (request.method() === 'POST' && u.pathname === '/api/lab-chapter-notes') {
      return json(200, { beats: SUMMARY.map(beat => ({ ...beat, text: `${beat.text} (${body?.editionKey}, chapter ${body?.chapterNumber})` })), kind: body?.kind, chapterNumber: body?.chapterNumber, through: null, source: 'cache' })
    }
    if (request.method() === 'POST' && u.pathname === '/api/lab-catch-up') {
      return json(200, { summary: `CANNED RECAP of ${body?.unitId} in ${body?.editionKey}: what the reader has already read there.`, unitId: body?.unitId, title: '', complete: true, version: 'qa', source: 'cache' })
    }
    if (request.method() === 'POST' && u.pathname === '/api/lab-chat') {
      return route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'CANNED FOLLOW-UP ANSWER about the card.' } })}\n\ndata: {"type":"message_stop"}\n\n` })
    }
    if (u.pathname === '/api/events') return route.fulfill({ status: 204, body: '' })
    return json(404, { error: 'not offered by this check' })
  })
  await page.addInitScript(({ place, used, session, keys, book, device, countKey }) => {
    if (sessionStorage.getItem('free-menu-seeded')) return
    sessionStorage.setItem('free-menu-seeded', '1')
    localStorage.setItem('tinct:wipe-v1-done', '1')
    localStorage.setItem('tinct-lab-device-id', device)
    if (used) localStorage.setItem(countKey, String(used))
    if (place) {
      const now = Date.now()
      localStorage.setItem('tinct-lab-position', JSON.stringify({
        version: 1, deviceId: device, updatedAt: now,
        books: { [book]: { bookId: book, headerBook: place.headerBook, chapterNumber: place.chapter, sequentialChapter: place.chapter, paragraphIndex: place.paragraph, wordIndex: 0, pageIndex: 0, primaryEditionKey: place.edition, updatedAt: now, deviceId: device, rev: 1 } },
        lastSettledBookId: book, lastSettledAt: now,
      }))
    }
    if (session) {
      const value = JSON.stringify({ access_token: 'qa-token', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: '00000000-0000-4000-8000-0000000000aa', email: 'guest-turned-reader@example.test', aud: 'authenticated', user_metadata: {} } })
      for (const key of keys) localStorage.setItem(key, value)
      document.cookie = 'tinct_auth=1; path=/'
    }
  }, { place, used, session, keys: [...sessionKeys], book, device: DEVICE, countKey: COUNT_KEY })
  await page.goto(`${origin}${address}${phone ? '&layout=phone' : ''}`, { waitUntil: 'domcontentloaded' })
  await ready(page)
  return { page, context, api, writes, errors, phone }
}

async function ready(page) {
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(700)
}

/** Where the reader is, on screen and as this device keeps it. */
const whereIs = (page, book) => page.evaluate(book => {
  const lab = document.querySelector('.lab')
  const saved = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.[book]
  const word = [...document.querySelectorAll('[data-testid="lab-word"]')].find(node => { const r = node.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.top < innerHeight })
  const host = [...document.querySelectorAll('.lab *')].find(node => node.scrollTop > 0)
  return {
    chapter: lab?.dataset.chapter ?? null, place: lab?.dataset.place ?? null,
    saved: saved ? `${saved.sequentialChapter}:${saved.paragraphIndex}:${saved.wordIndex}:${saved.primaryEditionKey}` : null,
    first: word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}@${Math.round(word.getBoundingClientRect().top)}` : null,
    scroll: host ? Math.round(host.scrollTop) : 0,
  }
}, book)
const count = page => page.evaluate(key => Number(localStorage.getItem(key) || 0), COUNT_KEY)

/** The t menu, opened (the phone hides its controls while reading quietly). */
async function openMenu(page) {
  const button = page.getByTestId('lab-super')
  if (!(await button.isVisible().catch(() => false))) {
    const header = await page.locator('.lab-header').boundingBox()
    // The middle of the header: its left end is the way back.
    if (header) await page.mouse.click(header.x + header.width / 2, header.y + Math.min(20, header.height / 2))
    await button.waitFor({ state: 'visible', timeout: 5000 })
  }
  await button.click()
  await page.getByTestId('lab-super-menu').waitFor()
  await page.waitForTimeout(250)
}
const row = (page, id) => page.getByTestId(`lab-super-row-${id}`)

/** The menu as drawn: each row's name, box, face, icon and label columns, its icon's drawing, and the panel. */
const measureMenu = page => page.evaluate(() => {
  const panel = document.querySelector('[data-testid="lab-super-menu"]')
  const box = node => { const r = node.getBoundingClientRect(); return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } }
  const p = box(panel), ps = getComputedStyle(panel)
  const rows = [...panel.querySelectorAll('button.lab-super-row')].map(node => {
    const s = getComputedStyle(node), b = box(node)
    const icon = node.querySelector('.lab-super-row-icon'), label = node.querySelector('.lab-super-row-label'), chevron = node.querySelector('.lab-super-row-chevron')
    const ls = getComputedStyle(label), is = getComputedStyle(icon), ib = box(icon), lb = box(label), svg = icon.querySelector('svg')
    return {
      id: node.dataset.row, label: label.textContent.trim(), text: node.innerText.replace(/\s+/g, ' ').trim(), rule: node.classList.contains('has-rule'),
      chevron: chevron ? chevron.textContent : null, chevronRight: chevron ? Math.round((p.x + p.w - box(chevron).x - box(chevron).w) * 10) / 10 : null,
      style: {
        height: b.h, left: Math.round((b.x - p.x) * 10) / 10, width: b.w, padding: s.padding, borderTop: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
        iconLeft: Math.round((ib.x - b.x) * 10) / 10, iconBox: `${ib.w}x${ib.h}`, iconColor: is.color, svg: svg ? `${svg.getAttribute('width')}x${svg.getAttribute('height')}` : null,
        labelLeft: Math.round((lb.x - b.x) * 10) / 10, font: ls.fontFamily, size: ls.fontSize, weight: ls.fontWeight, lineHeight: ls.lineHeight, color: ls.color,
        transform: ls.textTransform, letterSpacing: ls.letterSpacing, fontStyle: ls.fontStyle,
      },
      icon: svg ? svg.innerHTML : '',
    }
  })
  return { rows, text: panel.innerText, panel: { right: Math.round((innerWidth - p.x - p.w) * 10) / 10, top: p.y, width: p.w, radius: ps.borderRadius, background: ps.backgroundColor, border: ps.border, shadow: ps.boxShadow, blur: ps.backdropFilter || ps.webkitBackdropFilter } }
})
const shot = (page, file) => page.screenshot({ path: path.join(output, file) })
/** The open menu with the top bar above it: the whole phone screen, the desktop's top right corner. */
const menuShot = async (page, file) => {
  await page.waitForTimeout(200)
  const { width, height } = page.viewportSize()
  await page.screenshot({ path: path.join(output, file), ...(width > 600 ? { clip: { x: width - 520, y: 0, width: 520, height: Math.min(height, 560) } } : {}) })
}

/** Two screenshots side by side on one sheet, each under its name. */
async function sideBySide(file, left, right) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const data = async name => `data:image/png;base64,${(await fs.readFile(path.join(output, name))).toString('base64')}`
  await page.setContent(`<!doctype html><style>body{margin:0;padding:24px;background:#ece7db;color:#141210;font:15px system-ui,sans-serif;display:flex;gap:24px;align-items:flex-start}figure{margin:0;flex:1;min-width:0}figcaption{margin:0 0 8px}img{display:block;width:100%;border-radius:8px}</style>
    <figure><figcaption>${left.name}</figcaption><img src="${await data(left.file)}"></figure><figure><figcaption>${right.name}</figcaption><img src="${await data(right.file)}"></figure>`)
  await page.waitForFunction(() => [...document.images].every(image => image.complete))
  await page.screenshot({ path: path.join(output, file), fullPage: true })
  await context.close()
}

const FREE = '/reader?book=meditations&mode=free&ref=modern-english'
const PLACE = { chapter: 3, paragraph: 2, edition: 'modern-en', headerBook: 'Meditations' }

try {
  for (const phone of [false, true]) {
    const at = phone ? 'phone' : 'desktop'

    // ---- 1. The menu, beside the normal reader's -------------------------------------------------------------
    for (const scheme of ['light', 'dark']) {
      const free = await open({ phone, scheme, address: FREE, place: PLACE })
      // The normal reader a signed-out visitor gets in production (the shared reader), in the same book and place.
      const normal = await open({ phone, scheme, address: '/reader?book=meditations&sharedReader=1', place: PLACE })
      try {
        await openMenu(free.page); await openMenu(normal.page)
        const mine = await measureMenu(free.page), theirs = await measureMenu(normal.page)
        await menuShot(free.page, `${at}-${scheme}-free-menu.png`)
        await menuShot(normal.page, `${at}-${scheme}-normal-menu.png`)
        await sideBySide(`${at}-${scheme}-menus-side-by-side.png`, { name: `Free reading mode (${at}, ${scheme})`, file: `${at}-${scheme}-free-menu.png` }, { name: `The normal reader, signed out (${at}, ${scheme})`, file: `${at}-${scheme}-normal-menu.png` })
        if (scheme === 'light') {
          ok(`${at}: the menu is the two AI rows, the settings, the way back and Create profile`, same(mine.rows.map(item => item.label), ['Summarize this chapter', 'Catch me up', 'Appearance', 'Book settings', 'Modern English classics', 'Create profile']), mine.rows.map(item => item.label))
          ok(`${at}: a rule before the settings and before the way back, nowhere else`, same(mine.rows.filter(item => item.rule).map(item => item.id), ['text', 'library']), mine.rows.filter(item => item.rule).map(item => item.id))
          ok(`${at}: chevrons on Appearance, Book settings and Create profile only`, same(mine.rows.filter(item => item.chevron).map(item => item.id), ['text', 'editions', 'account']), mine.rows.map(item => [item.id, item.chevron]))
          ok(`${at}: no counter and no selling line: the menu's whole text is its six row names`, mine.text.replace(/[›\s]+/g, ' ').trim() === 'Summarize this chapter Catch me up Appearance Book settings Modern English classics Create profile' && !/\d/.test(mine.text), mine.text)
          ok(`${at}: every row is the same row: one height, one icon column, one label column, one face`, mine.rows.every(item => same({ ...item.style, borderTop: 0 }, { ...mine.rows[1].style, borderTop: 0 })), mine.rows.map(item => [item.id, item.style.height, item.style.iconLeft, item.style.labelLeft, item.style.size]))
          // The face is the normal menu's own (held to it row for row below).
          ok(`${at}: the rows are in sentence case, never all caps, never mono`, mine.rows.every(item => !/mono|courier/i.test(item.style.font) && item.style.transform === 'none' && /^[A-Z][a-z]/.test(item.label) && !/\b[A-Z]{2,}\b/.test(item.label)), mine.rows.map(item => [item.label, item.style.font, item.style.transform]))
        }
        // Row for row against the normal reader's menu: the same measures, colours and drawings.
        const shared = mine.rows.filter(item => theirs.rows.some(other => other.id === item.id))
        ok(`${at} ${scheme}: the normal menu has the rows free mode reuses`, shared.length >= (phone ? 5 : 4), [mine.rows.map(item => item.id), theirs.rows.map(item => item.id)])
        for (const item of shared) {
          const other = theirs.rows.find(candidate => candidate.id === item.id)
          ok(`${at} ${scheme}: "${item.label}" measures as the normal menu's "${other.label}" row`, same({ ...item.style, borderTop: 0 }, { ...other.style, borderTop: 0 }), { free: item.style, normal: other.style })
          ok(`${at} ${scheme}: "${item.label}" carries the normal menu's own icon`, item.icon.length > 20 && item.icon === other.icon)
          ok(`${at} ${scheme}: "${item.label}" has the normal row's chevron, in the same place`, item.chevron === other.chevron && item.chevronRight === other.chevronRight, [item.chevron, other.chevron, item.chevronRight, other.chevronRight])
        }
        // Summarize this chapter is not in the book reader's normal menu: it is held to its neighbour, Catch me up.
        const summarize = mine.rows.find(item => item.id === 'summarize'), catchUp = theirs.rows.find(item => item.id === 'catchup')
        ok(`${at} ${scheme}: "Summarize this chapter" measures as the normal menu's Catch me up row`, same({ ...summarize.style, borderTop: 0 }, { ...catchUp.style, borderTop: 0 }), { free: summarize.style, normal: catchUp.style })
        ok(`${at} ${scheme}: the two rules are the normal menu's rule`, same([...new Set(mine.rows.filter(item => item.rule).map(item => item.style.borderTop))], [...new Set(theirs.rows.filter(item => item.rule).map(item => item.style.borderTop))]), [mine.rows.map(item => item.style.borderTop), theirs.rows.map(item => item.style.borderTop)])
        ok(`${at} ${scheme}: the panel is the normal menu's panel (place, width, surface)`, same(mine.panel, theirs.panel), { free: mine.panel, normal: theirs.panel })
        ok(`${at} ${scheme}: no page errors`, free.errors.length === 0 && normal.errors.length === 0, [free.errors, normal.errors])
      } finally { await free.context.close(); await normal.context.close() }
    }

    // ---- 2. The two AI rows, the allowance and the account sheet ---------------------------------------------
    {
      const run = await open({ phone, address: FREE, place: PLACE })
      const { page, api } = run
      const sent = route => api.filter(call => call.path === route)
      try {
        const start = await whereIs(page, 'meditations')
        ok(`${at}: the reader opens at the place this device kept (chapter 3)`, start.chapter === '3', start)
        ok(`${at}: a fresh device has used none of its free AI actions`, await count(page) === 0)

        // Summarize this chapter.
        await openMenu(page)
        await row(page, 'summarize').click()
        const beats = page.getByTestId('lab-chapter-notes-beat')
        await beats.first().waitFor({ timeout: 15000 })
        const summaryText = (await beats.allInnerTexts()).join(' ')
        ok(`${at}: Summarize this chapter shows the chapter's summary on screen`, /CANNED SUMMARY ONE/.test(summaryText) && /CANNED SUMMARY TWO/.test(summaryText) && await beats.first().isVisible(), summaryText)
        ok(`${at}: it asked the chapter notes route once, for the whole of chapter 3 in the edition read`, sent('/api/lab-chapter-notes').length === 1 && sent('/api/lab-chapter-notes')[0].method === 'POST' && sent('/api/lab-chapter-notes')[0].body?.kind === 'end' && sent('/api/lab-chapter-notes')[0].body?.chapterNumber === 3 && sent('/api/lab-chapter-notes')[0].body?.editionKey === 'modern-en' && sent('/api/lab-chapter-notes')[0].body?.bookId === 'meditations', sent('/api/lab-chapter-notes'))
        ok(`${at}: it is one of the free AI actions (1 of ${FREE_ACTIONS} used)`, await count(page) === 1, await count(page))
        ok(`${at}: the card offers no Talk and no dictation`, await page.locator('[data-testid="lab-chapter-notes-talk"], [data-testid="lab-phone-card-talk"], [data-testid="lab-phone-card-mic"]').count() === 0)
        await page.waitForTimeout(400)
        await shot(page, `${at}-summarize-this-chapter.png`)
        const afterSummary = await whereIs(page, 'meditations')
        ok(`${at}: the summary did not move the reader`, afterSummary.chapter === start.chapter && afterSummary.saved === start.saved && afterSummary.first === start.first, { start, afterSummary })

        // Catch me up.
        await closeCards(page, phone)
        await openMenu(page)
        await row(page, 'catchup').click()
        const entries = page.getByTestId('lab-catch-up-entry')
        await page.waitForFunction(() => { const list = [...document.querySelectorAll('[data-testid="lab-catch-up-entry"]')]; return list.length > 0 && list.every(node => node.dataset.state === 'ok') }, null, { timeout: 15000 })
        const recapText = (await entries.allInnerTexts()).join(' ')
        ok(`${at}: Catch me up shows the recap of what came before on screen`, /CANNED RECAP of ch-1/.test(recapText) && /CANNED RECAP of ch-2/.test(recapText) && await entries.first().isVisible() && await page.getByTestId('lab-catch-up-here').isVisible(), recapText)
        ok(`${at}: it asked the catch-up route only for chapters before the reader's (never chapter 3 or later)`, sent('/api/lab-catch-up').length === 2 && sent('/api/lab-catch-up').every(call => call.method === 'POST' && call.body?.placeChapter === 3 && call.body?.editionKey === 'modern-en' && ['ch-1', 'ch-2'].includes(call.body?.unitId)), sent('/api/lab-catch-up').map(call => call.body))
        ok(`${at}: it is one more free AI action (2 of ${FREE_ACTIONS} used), however many parts it recaps`, await count(page) === 2, await count(page))
        await page.waitForTimeout(400)
        await shot(page, `${at}-catch-me-up.png`)
        const afterRecap = await whereIs(page, 'meditations')
        ok(`${at}: the recap did not move the reader`, afterRecap.chapter === start.chapter && afterRecap.saved === start.saved && afterRecap.first === start.first, { start, afterRecap })

        // A card already made opens again, uncounted and unasked.
        await closeCards(page, phone)
        await openMenu(page)
        await row(page, 'summarize').click()
        await page.waitForTimeout(900)
        ok(`${at}: Summarize this chapter again is not counted or asked for again`, await count(page) === 2 && sent('/api/lab-chapter-notes').length === 1, [await count(page), sent('/api/lab-chapter-notes').length])
        await closeCards(page, phone)
        await openMenu(page)
        await row(page, 'catchup').click()
        await page.waitForTimeout(900)
        ok(`${at}: Catch me up again is not counted or asked for again`, await count(page) === 2 && sent('/api/lab-catch-up').length === 2, [await count(page), sent('/api/lab-catch-up').length])
        await closeCards(page, phone)

        // With nine used (as after seven more Explains: the same counter), the tenth is free and the next is not.
        await page.evaluate(([key, value]) => localStorage.setItem(key, value), [COUNT_KEY, String(FREE_ACTIONS - 1)])
        await chooseEdition(page, 'original-en')
        await page.waitForTimeout(1500)
        ok(`${at}: changing edition asks for nothing and counts nothing by itself`, await count(page) === FREE_ACTIONS - 1 && sent('/api/lab-catch-up').length === 2 && sent('/api/lab-chapter-notes').length === 1, [await count(page), sent('/api/lab-catch-up').length, sent('/api/lab-chapter-notes').length])
        await openMenu(page)
        await row(page, 'summarize').click()
        await page.waitForFunction(() => [...document.querySelectorAll('[data-testid="lab-chapter-notes-beat"]')].some(node => /original-en/.test(node.textContent)), null, { timeout: 15000 })
        ok(`${at}: the tenth action still works (the Original's summary, asked for in the Original)`, await count(page) === FREE_ACTIONS && sent('/api/lab-chapter-notes').length === 2 && sent('/api/lab-chapter-notes')[1].body?.editionKey === 'original-en', [await count(page), sent('/api/lab-chapter-notes').map(call => call.body?.editionKey)])
        await closeCards(page, phone)
        await openMenu(page)
        await row(page, 'catchup').click()
        const sheet = page.getByTestId('lab-account-sheet')
        await sheet.waitFor({ timeout: 8000 })
        ok(`${at}: with the ${FREE_ACTIONS} used, Catch me up opens Explain's account sheet`, await sheet.getAttribute('data-action') === 'chat' && /Create a free account to keep using AI/.test(await sheet.innerText()), await sheet.innerText())
        ok(`${at}: and nothing is asked for or counted`, await count(page) === FREE_ACTIONS && sent('/api/lab-catch-up').length === 2 && await page.getByTestId('lab-catch-up-entry').count() === 0, [await count(page), sent('/api/lab-catch-up').length])
        const create = await page.getByTestId('lab-account-create').getAttribute('href')
        ok(`${at}: the sheet's Create free account returns to this address`, new URL(create, origin).pathname === '/sign-in' && new URL(create, origin).searchParams.get('returnTo') === `${FREE}${phone ? '&layout=phone' : ''}`, create)
        await page.waitForTimeout(300)
        await shot(page, `${at}-allowance-used-account-sheet.png`)
        await page.getByTestId('lab-account-keep-reading').click()
        await sheet.waitFor({ state: 'detached' })
        // Summarize this chapter in a chapter with no card yet (the device's place moved on to chapter 4, the page
        // loaded again): the same sheet.
        await page.evaluate(() => {
          const store = JSON.parse(localStorage.getItem('tinct-lab-position'))
          Object.assign(store.books.meditations, { chapterNumber: 4, sequentialChapter: 4, paragraphIndex: 0, wordIndex: 0, pageIndex: 0, updatedAt: Date.now(), rev: (store.books.meditations.rev || 1) + 1 })
          localStorage.setItem('tinct-lab-position', JSON.stringify(store))
        })
        await page.reload({ waitUntil: 'domcontentloaded' })
        await ready(page)
        ok(`${at}: (chapter 4, after a reload: the used actions are still used)`, await page.evaluate(() => document.querySelector('.lab')?.dataset.chapter) === '4' && await count(page) === FREE_ACTIONS, await count(page))
        await openMenu(page)
        await row(page, 'summarize').click()
        await sheet.waitFor({ timeout: 8000 })
        ok(`${at}: with the ${FREE_ACTIONS} used, Summarize this chapter opens the same sheet and asks for nothing`, await sheet.getAttribute('data-action') === 'chat' && await count(page) === FREE_ACTIONS && sent('/api/lab-chapter-notes').length === 2, [await count(page), sent('/api/lab-chapter-notes').length])
        await page.getByTestId('lab-account-dismiss').click()
        await sheet.waitFor({ state: 'detached' })

        // What left the device.
        const other = api.filter(call => !GUEST_ROUTES.includes(call.path) && call.path !== '/api/events')
        const aiElsewhere = other.filter(call => /^\/api\/(chat|lab-|recap|narration|audio|voice|dictation|own-|ai-)/.test(call.path))
        ok(`${at}: no other AI, narration or account route was reached`, aiElsewhere.length === 0, aiElsewhere.map(call => `${call.method} ${call.path}`))
        ok(`${at}: no request carried an account`, api.every(call => !call.auth), api.filter(call => call.auth).map(call => call.path))
        ok(`${at}: nothing was written to the account or the database`, other.every(call => call.method === 'GET') && run.writes.every(write => write.includes('/auth/')), [other.filter(call => call.method !== 'GET').map(call => `${call.method} ${call.path}`), run.writes])
        ok(`${at}: no page errors`, run.errors.length === 0, run.errors)
      } finally { await run.context.close() }
    }

    // ---- 3. The way back, named for the page the reader came from --------------------------------------------
    for (const [ref, book, name, home] of [['modern-english', 'meditations', 'Modern English classics', '/modern-english'], ['nudansk', 'hamlet', 'Klassikere på nudansk', '/nudansk'], ['shakespeare', 'hamlet', 'Shakespeare', '/shakespeare'], [null, 'meditations', 'Library', '/library']]) {
      const address = `/reader?book=${book}&mode=free${ref ? `&ref=${ref}` : ''}`
      const run = await open({ phone, book, address })
      const { page } = run
      try {
        await openMenu(page)
        const label = (await row(page, 'library').locator('.lab-super-row-label').innerText()).trim()
        ok(`${at} ref=${ref}: the way back is named "${name}"`, label === name, label)
        const fits = await row(page, 'library').locator('.lab-super-row-label').evaluate(node => node.scrollWidth <= node.clientWidth + 1 && node.getBoundingClientRect().height < 30)
        ok(`${at} ref=${ref}: the name fits on its row`, fits)
        await menuShot(page, `${at}-back-row-${ref ?? 'no-ref'}.png`)
        await Promise.all([page.waitForURL(url => url.pathname === home, { timeout: 15000 }), row(page, 'library').click()])
        ok(`${at} ref=${ref}: the row goes to ${home}`, new URL(page.url()).pathname === home, page.url())
        // The reader's own back arrow, from the same address.
        await page.goto(`${origin}${address}${phone ? '&layout=phone' : ''}`, { waitUntil: 'domcontentloaded' })
        await ready(page)
        const arrow = page.getByTestId(phone ? 'lab-free-back' : 'lab-library-back')
        if (!(await arrow.isVisible().catch(() => false))) { const header = await page.locator('.lab-header').boundingBox(); await page.mouse.click(header.x + header.width / 2, header.y + Math.min(20, header.height / 2)); await arrow.waitFor({ state: 'visible', timeout: 5000 }) }
        const arrowHome = ref ? home : '/modern-english'
        ok(`${at} ref=${ref}: the back arrow is named for the same page`, await arrow.getAttribute('aria-label') === `Back to ${ref ? name : 'Modern English classics'}`, await arrow.getAttribute('aria-label'))
        await Promise.all([page.waitForURL(url => url.pathname === arrowHome, { timeout: 15000 }), arrow.click()])
        ok(`${at} ref=${ref}: the back arrow goes to ${arrowHome}${ref ? ', as the row does' : ' (as before; the row is the full library)'}`, new URL(page.url()).pathname === arrowHome, page.url())
        ok(`${at} ref=${ref}: no page errors`, run.errors.length === 0, run.errors)
      } finally { await run.context.close() }
    }

    // ---- 4. Create profile: the sign-up sheet, and back to the same place -------------------------------------
    {
      const run = await open({ phone, address: FREE, place: PLACE })
      const { page } = run
      try {
        const start = await whereIs(page, 'meditations')
        await openMenu(page)
        // The address asked for, as the row sends it (the sheet then tidies its own address: one sheet signs in and joins).
        const [asked] = await Promise.all([
          page.waitForRequest(request => request.isNavigationRequest() && new URL(request.url()).pathname === '/sign-in', { timeout: 15000 }),
          row(page, 'account').click(),
        ])
        await page.waitForURL(url => url.pathname === '/sign-in', { timeout: 15000 })
        const signIn = new URL(asked.url())
        const returnTo = signIn.searchParams.get('returnTo')
        ok(`${at}: Create profile opens the sign-up sheet (create an account), to return to this address`, signIn.searchParams.get('mode') === 'create' && returnTo === `${FREE}${phone ? '&layout=phone' : ''}` && signIn.searchParams.get('from') === 'save_place', asked.url())
        ok(`${at}: the sheet keeps the address to return to`, new URL(page.url()).searchParams.get('returnTo') === returnTo, page.url())
        await page.waitForTimeout(1500)
        await shot(page, `${at}-create-profile-sign-up.png`)
        const body = await page.locator('body').innerText().catch(() => '')
        ok(`${at}: the sheet offers Google and an email code`, /Google/i.test(body) && /email/i.test(body), body.slice(0, 300))
        const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.meditations)
        ok(`${at}: the place is still on the device when the reader leaves for the sheet`, kept?.sequentialChapter === 3 && `${kept.sequentialChapter}:${kept.paragraphIndex}:${kept.wordIndex}:${kept.primaryEditionKey}` === start.saved, { kept, start })
        await run.context.close()

        // Signed in on this device, the address the sheet returns to: the normal reader, at the place the device kept.
        const back = await open({ phone, address: FREE, place: { ...PLACE, paragraph: kept.paragraphIndex }, session: true })
        try {
          const url = new URL(back.page.url())
          const now = await whereIs(back.page, 'meditations')
          ok(`${at}: back from sign-up, the address is the normal reader's (no mode=free), same book`, !url.searchParams.has('mode') && url.searchParams.get('book') === 'meditations' && await back.page.evaluate(() => document.querySelector('.lab')?.dataset.freeMode !== 'true'), back.page.url())
          ok(`${at}: and the reader is at the same place in the same book`, now.chapter === start.chapter && now.place?.split(':')[0] === start.place?.split(':')[0], { start, now })
          await shot(back.page, `${at}-after-sign-up-same-place.png`)
        } finally { await back.context.close() }
      } finally { await run.context.close().catch(() => {}) }
    }
  }

  // ---- 5. Desktop, Both: the cards over the two columns ---------------------------------------------------------
  {
    const run = await open({ address: FREE, place: PLACE })
    const { page, api } = run
    try {
      await chooseEdition(page, 'both')
      await openMenu(page)
      await row(page, 'summarize').click()
      await page.getByTestId('lab-chapter-notes-beat').first().waitFor({ timeout: 15000 })
      ok('desktop Both: Summarize this chapter shows its card, counted once', /CANNED SUMMARY ONE/.test(await page.getByTestId('lab-chapter-notes').innerText()) && await count(page) === 1 && api.filter(call => call.path === '/api/lab-chapter-notes').length === 1, await count(page))
      ok('desktop Both: the card offers no Talk', await page.getByTestId('lab-chapter-notes-talk').count() === 0)
      await page.waitForTimeout(300)
      await shot(page, 'desktop-both-summarize-this-chapter.png')
      await page.getByTestId('lab-chapter-notes-close').click()
      await openMenu(page)
      await row(page, 'catchup').click()
      await page.waitForFunction(() => { const list = [...document.querySelectorAll('[data-testid="lab-catch-up-entry"]')]; return list.length > 0 && list.every(node => node.dataset.state === 'ok') }, null, { timeout: 15000 })
      ok('desktop Both: Catch me up shows its card, counted once, with no Talk', await count(page) === 2 && await page.getByTestId('lab-catch-up-talk').count() === 0, await count(page))
      await page.waitForTimeout(300)
      await shot(page, 'desktop-both-catch-me-up.png')
      // A question about the card is a guest's Ask: typed, counted, through the guest companion.
      await page.getByTestId('lab-catch-up-chat').click()
      const question = page.locator('textarea:visible').first()
      await question.waitFor({ timeout: 8000 })
      await question.fill('What should I notice?')
      await page.keyboard.press('Enter')
      await page.waitForFunction(() => /CANNED FOLLOW-UP ANSWER/.test(document.body.innerText), null, { timeout: 15000 })
      const chats = api.filter(call => call.path === '/api/lab-chat')
      ok('desktop Both: a question about the card is one more free AI action, sent as a guest', await count(page) === 3 && chats.length === 1 && chats[0].method === 'POST' && !chats[0].auth, [await count(page), chats.length])
      ok('desktop Both: the conversation offers no dictation and no Talk', await page.locator('.tc-mic, .tc-talk').count() === 0 && await page.locator('.tc-send').count() > 0)
      ok('desktop Both: no request carried an account, and no other AI route was reached', api.every(call => !call.auth) && api.filter(call => !GUEST_ROUTES.includes(call.path) && /^\/api\/(chat|lab-|recap|narration|audio|voice|dictation|own-|ai-)/.test(call.path)).length === 0, api.map(call => call.path))
      ok('desktop Both: no page errors', run.errors.length === 0, run.errors)
    } finally { await run.context.close() }
  }
} finally {
  await browser.close()
  server.close()
}

/** Close whatever card is open: the phone's bottom card by its own button, the desktop margin's by minimising it. */
async function closeCards(page, phone) {
  if (phone) {
    const close = page.locator('[data-testid="lab-phone-card"] [data-testid="lab-phone-card-close"], [data-testid="lab-phone-card-close"]').first()
    if (await close.isVisible().catch(() => false)) await close.click()
    else await page.keyboard.press('Escape')
    await page.getByTestId('lab-phone-card').first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
  } else {
    for (const button of await page.getByTestId('source-margin-minimise').all()) await button.click().catch(() => {})
  }
  await page.waitForTimeout(350)
}

/** Free mode's own switch: Original, Modern or (desktop) Both. */
async function chooseEdition(page, view) {
  const button = page.locator(`[data-testid="lab-free-editions"] button[data-view="${view}"]`).first()
  if (!(await button.isVisible().catch(() => false))) {
    const header = await page.locator('.lab-header').boundingBox()
    if (header) await page.mouse.click(header.x + header.width / 2, header.y + Math.min(20, header.height / 2))
  }
  await button.click()
  await page.waitForFunction(view => document.querySelector(`[data-testid="lab-free-editions"] button[data-view="${view}"]`)?.getAttribute('aria-pressed') === 'true', view, { timeout: 15000 })
  await ready(page)
}

const failed = results.filter(item => !item.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots: ${output}`)
assert.equal(failed.length, 0, `${failed.length} free-mode t menu check(s) failed: ${failed.map(item => item.label).join('; ')}`)
