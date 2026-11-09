#!/usr/bin/env node
// An own EPUB's margin Ask carries its document, with the selected sentence in the current chapter's unit
// (9 Nov 2026: Hamming's "You and Your Research" as one long chapter; the Ask was sent only the chapter's first 9,000
// characters and answered that a highlighted line came "later in the talk than this chapter reaches").
// Headless Chromium against a built dist/ (npm run build), every API call mocked: no network and no AI.
//
//   cd app && DIST=dist node scripts/check-own-epub-ask-context.mjs
//
// Checks: the Ask's /api/chat body has `document` (kind epub) whose chapter unit holds the selected sentence; the
// fallback context (pdfPages) centres the reader's chapter on the selection and marks its cuts "[…]"; the card's
// instructions no longer ask to "say when something is not in it".
import { chromium } from 'playwright'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
const dist = path.resolve(process.cwd(), process.env.DIST || 'dist')
let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 400) : ''}`) }
const origin = 'https://tinct.app'
const TARGET = 'The misapplication of effort is a very serious matter. Just hard work is not enough - it must be applied sensibly.'
// A talk as one long chapter (~60k chars): courage around paragraph 8, drive/effort around paragraph 22.
const filler = i => `Paragraph ${i} of the talk. ` + 'I am going to talk about the conditions under which great work gets done, and what an individual can do about it, rather than about luck alone. '.repeat(5)
const paras = Array.from({ length: 50 }, (_, i) => i === 8 ? 'One of the characteristics of successful scientists is having courage. ' + filler(i)
  : i === 22 ? 'Now for the matter of drive. ' + TARGET + ' ' + filler(i) : filler(i))
const body = `<section epub:type="chapter"><h1>You and Your Research</h1>${paras.map(p => `<p>${p}</p>`).join('')}</section>`
const x = b => `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title></head><body>${b}</body></html>`
const docs = [['title', 'Text/title.xhtml', '<p>YOU AND YOUR RESEARCH</p><p>Richard Hamming</p>', null], ['nav', 'Text/nav.xhtml', null, null], ['talk', 'Text/talk.xhtml', body, 'You and Your Research'], ['qa', 'Text/qa.xhtml', `<section><h1>Discussion</h1><p>Questions and answers after the talk.</p></section>`, 'Discussion']]
const nav = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc" id="toc"><ol>${docs.filter(d => d[3]).map(([, p, , l]) => `<li><a href="${p.slice(5)}">${l}</a></li>`).join('')}</ol></nav></body></html>`
const opf = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">hamming-yyr</dc:identifier><dc:title>You and Your Research</dc:title><dc:creator>Richard Hamming</dc:creator><dc:language>en</dc:language></metadata><manifest>${docs.map(([id, p]) => `<item id="${id}" href="${p}" media-type="application/xhtml+xml"${id === 'nav' ? ' properties="nav"' : ''}/>`).join('')}</manifest><spine>${docs.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`
const bytes = zip([['mimetype', 'application/epub+zip'], ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'], ['OEBPS/content.opf', opf], ...docs.map(([id, p, b]) => [`OEBPS/${p}`, id === 'nav' ? nav : x(b), { deflate: true }])])
const sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
const chats = []
const browser = await markInternal(await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }))
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
const json = (route, status, b) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(b) })
await context.route('**/*', async route => {
  const req = route.request(), url = new URL(req.url())
  if (url.hostname === 'qa.supabase.co') return url.pathname === '/auth/v1/user' ? json(route, 200, { id: 'u-qa', aud: 'authenticated', email: 'r@example.com' }) : json(route, 200, [])
  if (url.origin !== origin) return route.abort()
  const p = url.pathname
  if (p === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
  if (p === '/api/chat' || p === '/api/lab-chat') {
    chats.push({ url: p, body: JSON.parse(req.postData() || '{}') })
    return route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"MOCK."}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n' })
  }
  if (p === '/api/user-books') return json(route, 200, { books: [{ id: sha256.slice(0, 32), name: 'yyr.epub', title: 'You and Your Research', author: 'Richard Hamming', type: 'epub', size: bytes.length, sha256, createdAt: new Date(0).toISOString(), cover: null }] })
  if (p === '/api/user-books/places') return json(route, 200, { places: {} })
  if (/^\/api\/user-books\/(places|covers)\//.test(p)) return json(route, 200, { place: null, cover: null })
  if (/^\/api\/user-books\/(marks|cards)\//.test(p)) return json(route, 200, { marks: [], cards: [], rev: 0 })
  if (p.startsWith('/api/user-books/primers/')) return json(route, 200, { primer: null })
  if (p === `/api/user-books/${sha256.slice(0, 32)}`) return route.fulfill({ status: 200, contentType: 'application/epub+zip', body: bytes })
  if (p.startsWith('/api/')) return json(route, 404, { error: 'Not found' })
  const pathname = p === '/lab/addbook/book' ? '/lab/addbook/book.html' : p
  const file = path.resolve(dist, `.${pathname}`)
  try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
  return route.fulfill({ status: 404, body: '' })
})
const page = await context.newPage()
page.on('pageerror', e => console.log('pageerror', e.message))
await page.goto(`${origin}/qa-seed`)
await page.evaluate(async ({ hex, bytes }) => {
  localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa', refresh_token: 'r', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, user: { id: 'u-qa', email: 'r@example.com' } }))
  const db = await new Promise((res, rej) => { const r = indexedDB.open('tinct-addbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('books', { keyPath: 'key' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
  await new Promise((res, rej) => { const tx = db.transaction('books', 'readwrite'); tx.objectStore('books').put({ key: `epub:${hex}`, kind: 'epub', name: 'yyr.epub', title: 'You and Your Research', owner: 'u-qa', bytes: new Uint8Array(bytes).buffer }); tx.oncomplete = res; tx.onerror = () => rej(tx.error) })
  db.close()
}, { hex, bytes: [...bytes] })
await page.goto(`${origin}/lab/addbook/book.html?userBook=${hex}`, { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => window.TinctOwnListen?.ready(), null, { timeout: 60000 })
await page.waitForTimeout(1500)
// Put the target paragraph in view and select the sentence, as the reader did.
const where = await page.evaluate(async (TARGET) => {
  const p = [...document.querySelectorAll('.epub-sheet p')].find(e => e.textContent.includes(TARGET))
  p.scrollIntoView({ block: 'center' })
  await new Promise(r => setTimeout(r, 600))
  const n = Number(p.closest('.epub-sheet').dataset.page)
  const card = TinctMargin.newCard({ kind: 'ask', page: n, anchor: [{ n, x: 0, y: 0, w: 0, h: 0 }], text: TARGET, turns: [{ role: 'user', content: 'does he get into what is the right application of effort?', at: Date.now() }] })
  saveCard(card)
  await runCard(card.id)
  return { n, marginOn: marginOn(), place: currentPlace(), pages: state.pages.length, chapterChars: (await pageText(n)).text.length, targetAt: (await pageText(n)).text.indexOf(TARGET) }
}, TARGET)
const fallback = await page.evaluate(async ({ n, TARGET }) => (await pdfPages(n, { near: TARGET })).pages.map(p => p.text), { n: where.n, TARGET })
await page.waitForTimeout(1500)
const ask = chats.find(c => c.body.companion?.intent === 'ask')
const doc = ask?.body.companion?.document
const unit = doc?.units?.find(u => String(u.n) === String(where.n))
ok('the reader is in the long chapter, the sentence past its first 9,000 characters', where.marginOn && where.place.page === where.n && where.targetAt > 9000, where)
ok('the Ask was sent', !!ask, chats.map(c => c.url))
ok('it carries the document, kind epub, every chapter', doc?.kind === 'epub' && doc.units.length === where.pages && !doc.part, doc && { kind: doc.kind, units: doc.units.length, part: !!doc.part })
ok('the current chapter\'s unit holds the selected sentence', !!unit?.text.includes(TARGET), unit && { n: unit.n, chars: unit.text.length })
const current = fallback[ask?.body.companion?.context?.paragraphIndex ?? 1] || ''
ok('the fallback window is centred on the selection and marks its cuts', current.includes(TARGET) && current.startsWith('[…] ') && current.length <= 9010, { chars: current.length, head: current.slice(0, 40) })
ok('the card no longer asks to say what is not in the text', !JSON.stringify(ask?.body.messages || []).includes('say when something is not in it'))
await browser.close()
if (failures) { console.log(`${failures} failed`); process.exit(1) }
console.log('all passed')
