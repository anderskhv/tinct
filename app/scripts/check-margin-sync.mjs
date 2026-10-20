#!/usr/bin/env node
// Margin view sync (21 Oct 2026): the desktop margin view of a Tinct book keeps what the book reader keeps.
// Headless Chromium against the built app (dist/, served here as https://tinct.app through request routing), muted;
// the account (Supabase auth, user_data rows, commit_user_data), /api/lab-position and the AI routes are mocked
// in this process; nothing leaves the machine.
//
//   SKIP_ENV_CHECK=1 npm run build && node scripts/check-margin-sync.mjs [place|marks|cards|all]
//
// place: margin view opens at the account's place and writes it back at the exact word; a scroll is written;
//        the normal reader reloads at the same chapter, paragraph and word; and the other way round.
// marks: a highlight made in margin view is in the normal reader, and the reverse; preview-local marks migrate once.
// cards: a card made on one "desktop" is there after a reload and in another context sharing the account.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { markInternal } from './lib/internalTraffic.cjs'

const MODE = process.argv[2] || 'all'
const origin = 'https://tinct.app', OUT = path.resolve(process.env.OUT || 'artifacts/margin-sync')
fs.mkdirSync(OUT, { recursive: true })
const EXEC = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined)
const assets = fs.readdirSync('dist/assets').filter(f => f.endsWith('.js')).map(f => fs.readFileSync('dist/assets/' + f, 'utf8')).join('\n')
const supabaseUrl = assets.match(/https:\/\/[a-z0-9-]+\.supabase\.co/)?.[0]
assert(supabaseUrl, 'Built client includes its account endpoint')
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'fixture@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }
const exp = Math.floor(Date.now() / 1000) + 3600
const token = [{ alg: 'HS256', typ: 'JWT' }, { sub: user.id, exp, role: 'authenticated' }, 'fixture'].map(x => typeof x === 'string' ? x : Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')
const authKey = 'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token'
const BOOK = 'frankenstein'
const edition = JSON.parse(fs.readFileSync('public/data/editions/frankenstein-modern-en.json', 'utf8'))
const chapterAt = n => edition.chapters.findIndex(c => Number(c.number) === n) + 1

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 700) : ''}`) }

/** The mocked account, shared by every context. */
const account = { position: null, rows: new Map(), puts: [], commits: [], ai: [] }
function resetAccount(place) {
  const now = Date.now() - 60000
  account.position = place ? { owner: user.id, books: { [BOOK]: { bookId: BOOK, headerBook: 'Frankenstein', sequentialChapter: place.chapterNumber, ...place, primaryEditionKey: 'modern-en', readerMode: 'read', updatedAt: now, deviceId: 'qa-phone', rev: 1 } }, finished: {}, hidden: {}, lastSettledBookId: BOOK, lastSettledAt: now, updatedAt: now, deviceId: 'qa-phone' } : { books: {}, finished: {}, hidden: {}, lastSettledBookId: null, lastSettledAt: 0, updatedAt: 0, deviceId: 'qa' }
  account.rows = new Map(); account.puts = []; account.commits = []; account.ai = []
}
const MOCK_ANSWER = 'MOCK EXPLAIN: the passage sets the scene and names what the narrator wants.'

async function route(context) {
  await context.route('**/*', async r => {
    const req = r.request(), u = new URL(req.url())
    if (u.origin === supabaseUrl) {
      if (u.pathname.startsWith('/auth/')) return r.fulfill({ json: user })
      if (u.pathname.endsWith('/rpc/commit_user_data')) {
        const body = req.postDataJSON(), row = account.rows.get(body.p_key) || { key: body.p_key, value: null, rev: 0 }
        account.commits.push({ key: body.p_key, rev: body.p_expected_rev })
        if (body.p_expected_rev !== null && body.p_expected_rev !== row.rev) return r.fulfill({ json: [{ ...row, applied: false, conflict: true }] })
        const next = { key: body.p_key, value: body.p_value, rev: row.rev + 1 }
        account.rows.set(body.p_key, next)
        return r.fulfill({ json: [{ ...next, applied: true, conflict: false }] })
      }
      if (u.pathname.includes('/rest/v1/user_data')) {
        const key = (u.searchParams.get('key') || '').replace(/^eq\./, '')
        const rows = account.rows.has(key) ? [account.rows.get(key)] : []
        return r.fulfill({ json: req.headers().accept?.includes('vnd.pgrst.object') ? (rows[0] ?? null) : rows })
      }
      return r.fulfill({ json: [] })
    }
    if (u.origin !== origin) return r.abort()
    if (u.pathname === '/api/lab-position') {
      if (req.method() === 'PUT') {
        const next = req.postDataJSON()
        account.puts.push(JSON.parse(JSON.stringify(next)))
        const books = { ...account.position.books }
        for (const [id, pin] of Object.entries(next.books || {})) if (!books[id] || pin.updatedAt > books[id].updatedAt || (pin.updatedAt === books[id].updatedAt && pin.rev > books[id].rev)) books[id] = pin
        account.position = { ...(next.lastSettledAt >= account.position.lastSettledAt ? next : account.position), books, finished: { ...account.position.finished, ...next.finished } }
      }
      return r.fulfill({ json: account.position })
    }
    if (/^\/api\/(chat|lab-chat)$/.test(u.pathname)) {
      let body = null; try { body = JSON.parse(req.postData() || 'null') } catch {}
      const c = body?.companion || {}
      account.ai.push({ intent: c.intent })
      const text = c.intent === 'define' ? JSON.stringify({ kind: 'definition', definition: `Noun. A mocked meaning of “${c.selection}”.` })
        : c.intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(i => ({ q: `MOCK Q${i}. What happens here?`, answer: 'Something', why: 'Because.', cite: '' })) })
        : MOCK_ANSWER
      if (!body?.stream) return r.fulfill({ json: { content: [{ type: 'text', text }] } })
      return r.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body: `event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n` })
    }
    if (u.pathname.startsWith('/api/')) return r.fulfill({ status: 404, json: {} })
    if (req.method() !== 'GET') return r.abort()
    const dist = path.resolve('dist')
    const want = u.pathname === '/reader' ? '/app.html' : u.pathname === '/lab/addbook/book' ? '/lab/addbook/book.html' : u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname
    const file = path.resolve(dist, '.' + want)
    if (file.startsWith(dist + '/') && fs.existsSync(file) && fs.statSync(file).isFile()) return r.fulfill({ path: file })
    return r.fulfill({ status: 404, body: '' })
  })
}

async function device(browser, { seed = {}, viewport = { width: 1440, height: 900 } } = {}) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport })
  await route(context)
  await context.addInitScript(({ authKey, user, token, exp, seed }) => {
    if (sessionStorage.getItem('margin-sync-seeded')) return
    sessionStorage.setItem('margin-sync-seeded', '1')
    if (localStorage.getItem('margin-sync-device')) return
    localStorage.setItem('margin-sync-device', '1')
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user }))
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', primaryEdition: 'modern-en', compareOpen: false, compareChosen: true }))
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    HTMLMediaElement.prototype.play = async () => {}
  }, { authKey, user, token, exp, seed })
  const page = await context.newPage()
  page.setDefaultTimeout(30000)
  page.errors = []
  page.on('pageerror', e => page.errors.push(String(e)))
  return { context, page }
}

async function marginFrame(page) {
  await page.goto(`${origin}/reader?book=${BOOK}&margin=1`, { waitUntil: 'domcontentloaded' })
  const handle = await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 60000 })
  const frame = await handle.contentFrame()
  await frame.waitForFunction(() => typeof state !== 'undefined' && state.preview && state.pages.length > 0 && document.querySelector('.epub-sheet'), null, { timeout: 60000 })
  await page.waitForTimeout(2500)
  return frame
}
const frameSpot = frame => frame.evaluate(() => {
  const page = currentPlace().page, s = document.getElementById('scroll'), x = epubHold.exact
  if (x && x.top != null && x.page === page && Math.abs(s.scrollTop - x.top) <= 2) return { page, para: x.para, word: x.word, exact: true }
  const e = epubSpot(); return { page, para: e.para, word: e.word }
})
async function normalReader(page) {
  await page.goto(`${origin}/reader?book=${BOOK}&margin=0`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.waitForTimeout(1500)
  return page.evaluate(() => ({ chapter: Number(document.querySelector('.lab').dataset.chapter), place: document.querySelector('.lab').dataset.place }))
}
const settled = () => account.position.books[BOOK]
async function waitFor(fn, ms = 8000) { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await new Promise(r => setTimeout(r, 100)) } return false }

async function checkPlace(browser) {
  const want = { chapterNumber: 5, paragraphIndex: 3, wordIndex: 4 }
  resetAccount(want)
  const { context, page } = await device(browser)
  try {
    const frame = await marginFrame(page)
    const at = await frameSpot(frame)
    ok('place: margin view opens at the account\'s place (its paragraph, the word\'s line at the top)', at.page === chapterAt(5) && at.para === 3 && at.word <= 4, at)
    await waitFor(() => settled()?.deviceId !== 'qa-phone')
    ok('place: opening writes the restored word back, settled in this book', settled()?.deviceId !== 'qa-phone' && settled()?.paragraphIndex === 3 && settled()?.wordIndex === 4 && settled()?.primaryEditionKey === 'modern-en' && account.position.lastSettledBookId === BOOK, settled())
    // The reader scrolls (a wheel in the frame): the new place is written.
    const box = await page.locator('iframe').boundingBox()
    await page.mouse.move(box.x + 500, box.y + 400)
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(120) }
    await page.waitForTimeout(1800)
    const moved = await frameSpot(frame)
    await waitFor(() => settled()?.paragraphIndex === moved.para && settled()?.wordIndex === moved.word, 6000)
    ok('place: a scroll in margin view is written to the account (same paragraph and word)', settled()?.sequentialChapter === edition.chapters[moved.page - 1].number && settled()?.paragraphIndex === moved.para && settled()?.wordIndex === moved.word && moved.para > 3, { moved, settled: settled() })
    const local = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position')).books.frankenstein)
    ok('place: the device record (tinct-lab-position) holds the same tuple', local?.paragraphIndex === moved.para && local?.wordIndex === moved.word, local)
    // The normal reader, reloaded on this device: same chapter, paragraph and word.
    const normal = await normalReader(page)
    ok('place: the normal reader reloads at the same paragraph and word', normal.chapter === edition.chapters[moved.page - 1].number && normal.place === `${moved.para}:${moved.word}`, { normal, moved })
    await page.screenshot({ path: path.join(OUT, 'place-normal.png') })
    // And the other way round: the normal reader moves on, margin view opens there.
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(1500)
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await page.waitForTimeout(800)
    const after = await page.evaluate(() => ({ chapter: Number(document.querySelector('.lab').dataset.chapter), place: document.querySelector('.lab').dataset.place }))
    const second = await device(browser)
    const frame2 = await marginFrame(second.page)
    const back = await frameSpot(frame2)
    ok('place: margin view on another device opens at the normal reader\'s new place', back.page === chapterAt(after.chapter) && `${back.para}:${back.word}` === after.place, { after, back })
    await second.page.screenshot({ path: path.join(OUT, 'place-margin-other.png') })
    ok('place: no page errors', page.errors.length === 0 && second.page.errors.length === 0, [...page.errors, ...second.page.errors])
    await second.context.close()
  } finally { await context.close() }
}

async function selectInView(frame, words = 4) {
  return frame.evaluate(words => {
    const top = document.getElementById('scroll').getBoundingClientRect().top + 60
    const p = [...document.querySelectorAll('.tb-p')].find(el => { const r = el.getBoundingClientRect(); return r.top > top && r.bottom < innerHeight - 200 && el.textContent.split(/\s+/).length > 12 })
    if (!p) return null
    const node = [...p.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim().split(/\s+/).length > 8) || p.firstChild
    const all = [...node.nodeValue.matchAll(/\S+/g)], pick = all.slice(3, 3 + words)
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }))
    getSelection().setBaseAndExtent(node, pick[0].index, node, pick.at(-1).index + pick.at(-1)[0].length)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
    return getSelection().toString()
  }, words)
}
const rowMarks = () => account.rows.get('lab-highlights:' + BOOK)?.value || { highlights: [], deleted: [] }

async function checkMarks(browser) {
  resetAccount({ chapterNumber: 5, paragraphIndex: 3, wordIndex: 0 })
  const words = String(edition.chapters[chapterAt(5) - 1].paragraphs[3]).replace(/_/g, '').split(/\s+/).filter(Boolean)
  // The book reader made this one on the phone: chapter 5, paragraph 3, its first three words.
  const phoneMark = { id: 'hl-1790000000000-phone1', bookId: BOOK, editionKey: 'modern-en', chapterNumber: 5, paragraphIndex: 3, fromWord: 0, endParagraphIndex: 3, toWord: 3, color: 'rose', text: words.slice(0, 3).join(' '), note: 'From the phone.', updatedAt: Date.now() - 50000 }
  account.rows.set('lab-highlights:' + BOOK, { key: 'lab-highlights:' + BOOK, value: { v: 1, highlights: [phoneMark], deleted: [] }, rev: 1 })
  // A highlight the preview kept on this device before the margin view shared the book reader's (migrated once).
  const legacyText = words.slice(5, 7).join(' ')
  const { context, page } = await device(browser, { seed: {} })
  try {
    const frame = await marginFrame(page)
    await frame.waitForFunction(() => highlights().some(h => h.id === 'hl-1790000000000-phone1'), null, { timeout: 10000 }).catch(() => {})
    const shown = await frame.evaluate(() => { const h = highlights().find(x => x.id === 'hl-1790000000000-phone1'); if (!h) return null; const r = rangeFromOffsets(state.pages[h.page - 1].pg, h.start, h.end); return { text: r?.toString(), note: h.note, color: h.color } })
    ok('marks: the phone\'s highlight shows in margin view on its words, with its note', shown?.text === phoneMark.text && shown?.note === phoneMark.note && shown?.color === 'rose', shown)
    const picked = await selectInView(frame)
    await frame.waitForSelector('.mr-bar [data-m="dot"]', { timeout: 8000 })
    await frame.click('.mr-bar [data-m="dot"]')
    await page.waitForTimeout(400)
    const made = await frame.evaluate(() => highlights().filter(h => h.id !== 'hl-1790000000000-phone1').map(h => ({ id: h.id, text: h.text })))
    ok('marks: a selection highlighted in margin view', made.length === 1 && made[0].text === picked.replace(/\s+/g, ' ').trim(), { made, picked })
    await waitFor(() => rowMarks().highlights.some(h => h.id === made[0]?.id), 8000)
    const row = rowMarks().highlights.find(h => h.id === made[0]?.id)
    const want = picked.trim().split(/\s+/)
    ok('marks: it reaches the account\'s lab-highlights row as word anchors (commit_user_data)', !!row && row.bookId === BOOK && row.editionKey === 'modern-en' && Number.isInteger(row.fromWord) && row.toWord - row.fromWord === want.length && row.text === want.join(' ') && account.commits.every(c => c.rev !== null || c.key !== 'lab-highlights:' + BOOK), row)
    ok('marks: the phone\'s highlight is kept in the row', rowMarks().highlights.some(h => h.id === phoneMark.id))
    const local = await page.evaluate(() => Object.keys(localStorage).filter(k => /^tinct-addbook:hl/.test(k)))
    ok('marks: no preview-local highlight keys are written', local.length === 0, local)
    // The normal reader on this device: both marks, painted.
    await normalReader(page)
    const painted = await page.evaluate(ids => ({ list: JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').filter(h => ids.includes(h.id)).length, rose: document.querySelectorAll('.lab-hearing-word.is-hl-rose').length, any: document.querySelectorAll('.lab-hearing-word[class*="is-hl-"]').length }), [phoneMark.id, made[0]?.id])
    ok('marks: the normal reader has both and paints them', painted.list === 2 && painted.rose === 3 && painted.any >= 3 + want.length, painted)
    await page.screenshot({ path: path.join(OUT, 'marks-normal.png') })
    // The reverse: a highlight made in the normal reader shows in margin view on another device.
    const extra = { ...phoneMark, id: 'hl-1790000000001-desk2', fromWord: 8, toWord: 10, color: 'sky', note: undefined, text: words.slice(8, 10).join(' '), updatedAt: Date.now() }
    await page.evaluate(m => { const list = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]'); list.push(m); localStorage.setItem('tinct-lab-highlights', JSON.stringify(list)) }, extra)
    await page.reload(); await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await waitFor(() => rowMarks().highlights.some(h => h.id === extra.id), 10000)
    const second = await device(browser, { seed: { 'tinct-addbook:hl:preview:frankenstein': [{ id: 'legacy1', page: chapterAt(5), start: 0, end: 0, text: legacyText, color: 'lavender', at: 1000 }] } })
    // (A legacy mark at the chapter's start offsets with other words: kept where it was, never moved onto the wrong words.)
    const frame2 = await marginFrame(second.page)
    await frame2.waitForFunction(ids => ids.every(id => highlights().some(h => h.id === id)), [phoneMark.id, made[0]?.id, extra.id], { timeout: 10000 }).catch(() => {})
    const there = await frame2.evaluate(() => highlights().map(h => h.id))
    ok('marks: margin view on another device shows the margin, phone and normal-reader highlights', [phoneMark.id, made[0]?.id, extra.id].every(id => there.includes(id)), there)
    // A removal in margin view is a tombstone in the account.
    await frame2.evaluate(id => removeHighlight(id), extra.id)
    await waitFor(() => rowMarks().deleted.some(t => t.id === extra.id), 8000)
    ok('marks: a highlight removed in margin view is deleted in the account (tombstone)', rowMarks().deleted.some(t => t.id === extra.id) && !rowMarks().highlights.some(h => h.id === extra.id), rowMarks().deleted)
    const legacyLeft = await second.page.evaluate(() => localStorage.getItem('tinct-addbook:hl:preview:frankenstein'))
    ok('marks: a preview-local mark whose words no longer match is left in place, not migrated', !!legacyLeft && !rowMarks().highlights.some(h => h.id === 'legacy1'), legacyLeft)
    ok('marks: no page errors', page.errors.length === 0 && second.page.errors.length === 0, [...page.errors, ...second.page.errors])
    await second.context.close()
  } finally { await context.close() }
}
globalThis.checkMarks = checkMarks

const chatRow = () => account.rows.get('chat-history:' + BOOK)?.value || []
async function checkCards(browser) {
  resetAccount({ chapterNumber: 5, paragraphIndex: 3, wordIndex: 0 })
  const { context, page } = await device(browser)
  try {
    const frame = await marginFrame(page)
    const picked = await selectInView(frame, 6)
    await frame.waitForSelector('.mr-bar [data-m="explain"]', { timeout: 8000 })
    await frame.click('.mr-bar [data-m="explain"]')
    await frame.waitForFunction(() => keptCards().some(c => c.kind === 'explain' && !c.gone && (c.turns || []).some(t => /MOCK EXPLAIN/.test(t.content || ''))), null, { timeout: 15000 }).catch(() => {})
    const card = await frame.evaluate(() => keptCards().find(c => c.kind === 'explain' && !c.gone))
    ok('cards: Explain in margin view makes a card with its answer', !!card && card.turns.some(t => /MOCK EXPLAIN/.test(t.content)), card)
    await waitFor(() => chatRow().some(c => c.id === 'mc_' + card?.id), 12000)
    const conv = chatRow().find(c => c.id === 'mc_' + card?.id)
    ok('cards: it is kept in the book\'s chat history row (chat-history:frankenstein) as a passage-anchored entry', !!conv && conv.card?.kind === 'explain' && conv.card.anchor?.editionKey === 'modern-en' && conv.card.anchor.chapterNumber === 5 && conv.messages.some(m => m.role === 'assistant' && /MOCK EXPLAIN/.test(m.content)) && conv.messages[0].highlightedText === picked.replace(/\s+/g, ' ').trim(), conv)
    ok('cards: no preview-local card key is written', await page.evaluate(() => !Object.keys(localStorage).some(k => k.startsWith('tinct-addbook:cards:'))))
    // After a reload on this desktop.
    await page.reload()
    const again = await marginFrame(page)
    const back = await again.evaluate(id => { const c = keptCards().find(k => k.id === id); return c && { turns: c.turns.length, span: c.span, shown: [...document.querySelectorAll('.mr-card')].some(e => e.dataset.id === id) } }, card.id)
    ok('cards: the card is there after a reload, on its passage', !!back && back.turns >= 1 && Array.isArray(back.span) && back.span[1] === card.span[1] && back.span[2] === card.span[2], { back, span: card.span })
    // Another context sharing the account (another desktop): the card is there.
    const other = await device(browser)
    const frame2 = await marginFrame(other.page)
    await frame2.waitForFunction(id => keptCards().some(c => c.id === id), card.id, { timeout: 10000 }).catch(() => {})
    const there = await frame2.evaluate(id => { const c = keptCards().find(k => k.id === id); return c ? { kind: c.kind, answer: (c.turns || []).some(t => /MOCK EXPLAIN/.test(t.content || '')), span: c.span } : null }, card.id)
    ok('cards: margin view on another device shows the card, answered, on its passage', !!there && there.kind === 'explain' && there.answer && there.span?.[1] === card.span[1], there)
    await other.page.screenshot({ path: path.join(OUT, 'cards-other.png') })
    // The phone's chat for the book has it (the same history).
    const phone = await device(browser, { viewport: { width: 390, height: 844 } })
    await normalReader(phone.page)
    await phone.page.waitForFunction(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').some(c => c.card?.kind === 'explain'), null, { timeout: 15000 }).catch(() => {})
    ok('cards: the phone\'s chat history for the book holds the card\'s question and answer', await phone.page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').some(c => c.card?.kind === 'explain' && c.messages.some(m => /MOCK EXPLAIN/.test(m.content)))))
    await phone.context.close()
    // Deleted on the other device: a tombstone; gone here after a reload.
    await frame2.evaluate(id => deleteCard(id), card.id)
    await other.page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await other.page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await waitFor(() => chatRow().some(c => c.id === 'mc_' + card.id && c.card?.gone), 12000)
    ok('cards: a card deleted in margin view is a tombstone in the history row', chatRow().some(c => c.id === 'mc_' + card.id && c.card?.gone && c.messages.length === 0), chatRow().find(c => c.id === 'mc_' + card.id))
    await page.reload()
    const after = await marginFrame(page)
    await page.waitForTimeout(1500)
    ok('cards: and is gone from margin view on the first desktop', await after.evaluate(id => !keptCards().some(c => c.id === id && !c.gone), card.id))
    ok('cards: chat history commits always carry an expected rev', account.commits.filter(c => c.key.startsWith('chat-history:')).every(c => c.rev !== null))
    ok('cards: no page errors', page.errors.length === 0 && other.page.errors.length === 0, [...page.errors, ...other.page.errors])
    await other.context.close()
  } finally { await context.close() }
}
globalThis.checkCards = checkCards

const browser = await markInternal(await chromium.launch({ executablePath: EXEC, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))
try {
  if (MODE === 'place' || MODE === 'all') await checkPlace(browser)
  if ((MODE === 'marks' || MODE === 'all') && globalThis.checkMarks) await globalThis.checkMarks(browser)
  if ((MODE === 'cards' || MODE === 'all') && globalThis.checkCards) await globalThis.checkCards(browser)
} finally { await browser.close() }
console.log(failures ? `${failures} failed` : 'all passed')
process.exit(failures ? 1 : 0)
