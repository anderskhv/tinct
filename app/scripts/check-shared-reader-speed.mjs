// Built-app shared reader latency, with a local static server and no provider calls.
// cd app && node scripts/check-shared-reader-speed.mjs
// SHARED_SPEED_RUNS=3 (default), SHARED_SPEED_CASES=frankenstein,war-and-peace,bible
// SHARED_SPEED_OUT=artifacts/shared-reader-speed.json persists the raw runs.
// This measures the current dist/ bundle, never Vite transform or production.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

// Point at an immutable copy of dist when other agents may be building.
const dist = path.resolve(process.env.SHARED_SPEED_DIST || 'dist'), runs = Math.max(1, Number(process.env.SHARED_SPEED_RUNS || 3))
const cases = (process.env.SHARED_SPEED_CASES || 'frankenstein,war-and-peace,bible').split(',').filter(Boolean)
const profiles = (process.env.SHARED_SPEED_PROFILES || 'desktop,slow').split(',').filter(Boolean)
const out = process.env.SHARED_SPEED_OUT || ''
const remoteFirst = process.env.SHARED_SPEED_REMOTE === '1'
const targets = { desktopFirstText: 1500, slowFirstText: 3000, selection: 100, card: 150 }
const caseInfo = { frankenstein: { edition: 'original-en', chapter: 3 }, 'war-and-peace': { edition: 'original-en', chapter: 2 }, bible: { edition: 'kjv-en', chapter: 1 }, macbeth: { edition: 'original-en', chapter: 2 } }
const prose = Array.from({length: 60}, (_, i) => `<p>Paragraph ${i + 1}. The reader kept a careful record of every chapter, the day it was read, and each note it inspired. At dawn the library opened again, and the same familiar pages waited in their proper order.</p>`).join('')
const ownEpubBytes = zip([
  ['mimetype', 'application/epub+zip'],
  ['META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
  ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">speed-local-epub</dc:identifier><dc:title>Private Reading Fixture</dc:title><dc:creator>A Local Author</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>'],
  ['OEBPS/c1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter One</title></head><body><h1>Chapter One</h1>${prose}</body></html>`],
])
const ownPdfBytes = await fs.readFile('../addbooks/web/test/pdf-fixtures/prose_book.pdf')
const ownFixtures = Object.fromEntries([['own-epub', 'epub', ownEpubBytes], ['own-pdf', 'pdf', ownPdfBytes]].map(([caseId, type, bytes]) => {
  const sha256 = createHash('sha256').update(bytes).digest('hex'), id = sha256.slice(0, 24)
  return [caseId, { id, type, bytes, sha256, fileId: (type === 'pdf' ? 'd' : 'a').repeat(32), name: `Local ${type.toUpperCase()} fixture.${type}`, title: `Private ${type.toUpperCase()} fixture`, author: 'A Local Author', size: bytes.length, createdAt: '2026-10-23T00:00:00.000Z', metadataRev: 0 }]
}))
for (const [caseId, fixture] of Object.entries(ownFixtures)) caseInfo[caseId] = { own: fixture }
const ownBooks = Object.values(ownFixtures).map(({bytes,fileId,...book}) => ({...book,id:fileId}))
const supabaseBundle = (await fs.readdir(path.join(dist,'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const supabaseText = supabaseBundle ? await fs.readFile(path.join(dist,'assets',supabaseBundle),'utf8') : ''
const syntheticAuthStorageKey = `sb-${/https:\/\/([a-z0-9]+)\.supabase\.co/.exec(supabaseText)?.[1] || 'speed-only'}-auth-token`
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream')
const fileCache = new Map()
let origin
const denied = []
const fileDownloads = new Map()
const ownApiCalls = []
const server = createServer(async (req, res) => {
  const target = new URL(req.url || '/', origin || 'http://127.0.0.1')
  if (target.origin !== origin) { denied.push(target.href); res.writeHead(403); res.end(); return }
  const p = target.pathname
  if (p === '/qa-seed') { res.setHeader('Content-Type', 'text/html'); res.setHeader('Cache-Control', 'no-store'); res.end('<!doctype html><title>Reader speed cache warmup</title>'); return }
  if (p.startsWith('/api/')) {
    if (remoteFirst && /\/api\/user-books/.test(p)) ownApiCalls.push({path:p,method:req.method,auth:req.headers.authorization?.startsWith('Bearer '),range:req.headers.range})
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'application/json')
    if (p === '/api/public-books') res.end('{"books":[]}')
    else if (p === '/api/user-books') res.end(JSON.stringify({books:ownBooks}))
    else if (p === '/api/user-books/places') res.end('{"places":{}}')
    else if (/^\/api\/user-books\/(?:text-)?(?:marks|cards)\/[0-9a-f]{24}$/.test(p)) res.end(JSON.stringify({marks:[],cards:[],rev:0,fileId:Object.values(ownFixtures).find(book=>p.endsWith(book.id))?.fileId||'a'.repeat(32)}))
    else if (/^\/api\/user-books\/(?:places|covers)\/[0-9a-f]{24}$/.test(p)) res.end('{"place":null,"cover":null}')
    else if (/^\/api\/user-books\/primers\/[0-9a-f]{24}$/.test(p)) res.end('{"primer":null}')
    else if (Object.values(ownFixtures).some(book => p === `/api/user-books/${book.fileId}` || p === `/api/user-books/${book.id}`)) {
      const book = Object.values(ownFixtures).find(item => p === `/api/user-books/${item.fileId}` || p === `/api/user-books/${item.id}`)
      fileDownloads.set(book.id, (fileDownloads.get(book.id) || 0) + 1)
      res.setHeader('Content-Type', book.type === 'pdf' ? 'application/pdf' : 'application/epub+zip')
      res.end(book.bytes)
    }
    else if (p === '/api/narration/voices') res.end('{"enabled":false,"voices":[]}')
    else if (p === '/api/lab-chat' || p === '/api/chat') {
      res.setHeader('Content-Type', 'text/event-stream')
      res.end('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A local fixture answer."}}\n\ndata: {"type":"message_stop"}\n\n')
    } else { res.statusCode = 404; res.end('{"error":"not_found"}') }
    return
  }
  const file = path.resolve(dist, '.' + (p === '/reader' ? '/app.html' : p))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    let entry = fileCache.get(file)
    if (!entry) {
      const body = await fs.readFile(file), type = mime(file)
      entry = { body, type, gz: /^(text|application\/json|image\/svg)/.test(type) && body.length > 1024 ? gzipSync(body) : null, etag: `"${createHash('sha1').update(body).digest('hex').slice(0, 16)}"` }
      fileCache.set(file, entry)
    }
    const cache = entry.type.includes('text/html') ? 'no-store' : /^\/assets\/[\w.-]+-[\w-]{8}\.\w+$/.test(p) ? 'public, max-age=31536000, immutable'
      : /^\/(?:lab|omarchy)\/[\w\-./]+\.(?:js|css)$/.test(p) && /^[\w.-]+$/.test(target.searchParams.get('v') || '') ? 'public, max-age=86400' : 'public, max-age=0, must-revalidate'
    const headers = { 'Content-Type': entry.type, 'Cache-Control': cache, ETag: entry.etag }
    if (req.headers['if-none-match'] === entry.etag && !entry.type.includes('text/html')) { res.writeHead(304, headers); res.end(); return }
    if (entry.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' }); res.end(entry.gz); return }
    res.writeHead(200, headers); res.end(entry.body)
  } catch { res.writeHead(404); res.end() }
})
// Chromium's proxy sends HTTPS traffic as CONNECT, outside the HTTP request
// listener. Reject and account for that path too; a provider must never be
// contacted by this harness.
server.on('connect', (req, socket) => { denied.push(`CONNECT ${req.url}`); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n') })
server.on('upgrade', (req, socket) => { denied.push(`UPGRADE ${req.url}`); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n') })
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
origin = `http://127.0.0.1:${server.address().port}`

function clock({ bookId, edition, chapter, ownPdf, ownEpub }) {
  if (edition) sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId, primaryEditionKey: edition, savedPlace: { bookId, chapterNumber: chapter, paragraphIndex: 0, wordIndex: 0, page: 0 } }))
  const score = window.__readerSpeed = { firstText: null, selectUp: null, selectionBar: null, cardTap: null, cardShell: null }
  // Detailed pointer/mutation tracing is diagnostic only; leave it out of
  // acceptance timings so observers and per-move bookkeeping do not skew them.
  if (ownEpub && new URLSearchParams(location.search).has('traceOwnDrag')) {
    score.trace = []
    const passageIds = new WeakMap(); let nextPassageId = 0
    for (const name of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture']) addEventListener(name,event => {
      const passage = event.target?.closest?.('.lab-passage')
      if (passage && !passageIds.has(passage)) passageIds.set(passage,++nextPassageId)
      const atPoint=document.elementFromPoint(event.clientX,event.clientY)
      score.trace.push({event:name,x:Math.round(event.clientX),y:Math.round(event.clientY),target:event.target?.className?.baseVal || event.target?.className || event.target?.tagName,passage:passage && passageIds.get(passage),connected:passage?.isConnected, passages:document.querySelectorAll('.lab-passage').length,point:atPoint?.getAttribute?.('data-word-index') ?? atPoint?.closest?.('[data-testid="lab-word"]')?.getAttribute('data-word-index'),selecting:document.querySelectorAll('.lab-hearing-word.is-selecting').length})
      if (score.trace.length > 25) score.trace.shift()
    },true)
    addEventListener('DOMContentLoaded',() => {
      new MutationObserver(() => {
        const bars = document.querySelectorAll('[data-testid="lab-desk-bar"]').length
        const prior=score.lastBarCount ?? 0
        if (bars !== prior) { score.trace.push({event:'bar-count',bars}); score.lastBarCount=bars }
      }).observe(document.body,{childList:true,subtree:true})
    },{once:true})
  }
  const visible = node => { if (!node) return false; const r = node.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= innerHeight) return false; const s = getComputedStyle(node); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity !== 0 }
  const pending = new Set()
  const afterPaint = (field, ready) => {
    if (score[field] != null || pending.has(field) || !ready()) return
    pending.add(field)
    // The current rAF precedes paint. The next one proves the visible DOM had
    // an opportunity to paint, with a conservative extra frame of latency.
    requestAnimationFrame(() => { pending.delete(field); if (score[field] == null && ready()) score[field] = performance.now() })
  }
  for (const type of ['pointerup', 'mouseup']) addEventListener(type, () => { if (score.selectUp == null) score.selectUp = performance.now() }, true)
  addEventListener('click', event => { if (event.target.closest('[data-testid="lab-dbar-ask"], [role="menuitem"], .selection-popup button, .pdf-original-reader__phone-actions button')) score.cardTap = performance.now() }, true)
  const frame = () => {
    afterPaint('firstText', () => { const passage = document.querySelector('.lab-page-wrap'), pdfText = passage?.querySelector('.pdf-original__text'), pdfCanvas = passage?.querySelector('.pdf-original__page canvas'); return visible(passage) && (ownPdf ? visible(pdfCanvas) && pdfCanvas.width > 1 && pdfCanvas.height > 1 && visible(pdfText?.querySelector('span')) && pdfText.textContent.trim().length > 40 : passage.textContent.trim().length > 40) })
    if (score.selectUp != null) afterPaint('selectionBar', () => visible(document.querySelector('[data-testid="lab-desk-bar"]')) || visible(document.querySelector('.selection-popup.is-shared-reader')) || visible(document.querySelector('.pdf-original-reader__phone-actions')))
    if (score.cardTap != null) afterPaint('cardShell', () => visible(document.querySelector('.lab-pcard, .selection-popup.is-contextual-explain')))
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
const median = list => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)]
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'], proxy: { server: origin } }))
const results = []
async function sample(bookId, profile, index) {
  const info = caseInfo[bookId]
  assert(info, `unknown case ${bookId}`)
  const context = await browser.newContext({ viewport: profile === 'desktop' ? { width: 1440, height: 900 } : { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  let cdp
  if (profile === 'slow') {
    cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 })
  }
  if (info.own) {
    // A synthetic session and a byte-identical account copy. The SDK sees a
    // far-future fake token; any auth fetch is answered in the page itself.
    // The proxy still rejects all external HTTP/HTTPS traffic.
    await page.addInitScript(({key}) => {
      localStorage.setItem(key, JSON.stringify({access_token:'speed-only',refresh_token:'speed-only',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+36000,token_type:'bearer',user:{id:'speed-owner',email:'speed@example.test',aud:'authenticated'}}))
      const original = window.fetch
      window.fetch = (input, init) => {
        let url; try { url = new URL(typeof input === 'string' ? input : input.url, location.href) } catch { return original.call(window,input,init) }
        if (url.hostname.endsWith('.supabase.co')) {
          if (url.pathname === '/auth/v1/user') return Promise.resolve(new Response(JSON.stringify({id:'speed-owner',email:'speed@example.test',aud:'authenticated'}), {status:200,headers:{'Content-Type':'application/json'}}))
          if (url.pathname.startsWith('/rest/v1/')) return Promise.resolve(new Response('[]', {status:200,headers:{'Content-Type':'application/json'}}))
          return Promise.resolve(new Response('{}', {status:404,headers:{'Content-Type':'application/json'}}))
        }
        return original.call(window,input,init)
      }
    }, {key:syntheticAuthStorageKey})
  }
  await page.addInitScript(clock, { bookId, edition: info.edition, chapter: info.chapter, ownPdf:info.own?.type === 'pdf', ownEpub:info.own?.type === 'epub' })
  try {
    if (info.own) {
      await page.goto(`${origin}/qa-seed`, {waitUntil:'domcontentloaded'})
      if (!remoteFirst) await page.evaluate(({book,bytes}) => new Promise((resolve,reject) => {
        const open = indexedDB.open('tinct-addbook',1)
        open.onupgradeneeded = () => { if (!open.result.objectStoreNames.contains('books')) open.result.createObjectStore('books',{keyPath:'key'}) }
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const db=open.result, tx=db.transaction('books','readwrite')
          tx.objectStore('books').put({key:`${book.type}:${book.id}`,kind:book.type,owner:'speed-owner',cloudId:book.fileId,name:book.name,title:book.title,author:book.author,bytes:new Uint8Array(bytes).buffer})
          tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)
        }
      }), {book:info.own,bytes:[...info.own.bytes]})
    }
    // Same context, same book and device: cache fonts, JavaScript and chapter
    // payload first. The timed navigation below still fetches its HTML fresh.
    const readerUrl = `${origin}/reader?sharedReader=1${info.own ? `&userBook=${info.own.id}` : ''}${info.own?.type === 'pdf' ? '&pages=1&page=2' : ''}${profile === 'slow' ? '&layout=phone' : ''}${process.env.SHARED_SPEED_TRACE === '1' && info.own?.type === 'epub' ? '&traceOwnDrag=1' : ''}`
    const downloadsBefore = info.own ? fileDownloads.get(info.own.id) || 0 : 0
    const ready = () => window.__readerSpeed?.firstText != null && (document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true' || document.querySelector('.pdf-original__text')?.textContent?.trim().length > 40)
    await page.goto(readerUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(ready, null, { timeout: 45000 }).catch(async error => {
      const state=await page.evaluate(() => ({clock:window.__readerSpeed,body:document.body?.innerText.slice(0,500),pdf:!!document.querySelector('.pdf-original'),pdfText:document.querySelector('.pdf-original__text')?.textContent?.slice(0,120),page:document.querySelector('.pdf-original__page')?.getAttribute('data-page'),root:document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady,alert:document.querySelector('[role="alert"]')?.textContent}))
      throw new Error(`cold reader opening failed ${JSON.stringify({bookId,profile,state,errors,denied,ownApiCalls:ownApiCalls.slice(-30)})}`,{cause:error})
    })
    const coldFirstText = await page.evaluate(() => window.__readerSpeed.firstText)
    const coldFileDownloads = info.own ? (fileDownloads.get(info.own.id) || 0) - downloadsBefore : 0
    const downloadsBeforeWarm = info.own ? fileDownloads.get(info.own.id) || 0 : 0
    await page.goto(`${origin}/qa-seed`, { waitUntil: 'domcontentloaded' })
    await page.goto(readerUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(ready, null, { timeout: 45000 }).catch(async error => {
      const state = await page.evaluate(() => ({ url: location.href, clock: window.__readerSpeed, title: document.title, root: document.querySelector('[data-testid="lab-root"]')?.outerHTML.slice(0, 300), text: document.body?.innerText.slice(0, 500) })).catch(e => String(e))
      throw new Error(`reader opening failed ${JSON.stringify({ bookId, profile, state, errors, denied })}`, { cause: error })
    })
    const firstText = await page.evaluate(() => window.__readerSpeed.firstText)
    const pdf = info.own?.type === 'pdf' && await page.locator('.pdf-original__text span:visible').count() > 2
    if (info.own?.type === 'pdf' && !pdf) console.log('PDF_SURFACE', JSON.stringify(await page.evaluate(() => ({text:document.body.innerText.slice(0,400), pdf:!!document.querySelector('.pdf-original'), pdfText:document.querySelector('.pdf-original__text')?.textContent?.slice(0,100), root:document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady, words:document.querySelectorAll('[data-testid="lab-word"]').length, error:document.querySelector('[role="alert"]')?.textContent}))))
    const words = page.locator(pdf ? '.pdf-original__text span:visible' : bookId === 'macbeth' ? '.lab-page-wrap [data-testid="lab-word"][data-paragraph-index="0"]:visible' : '.lab-page-wrap [data-testid="lab-word"]:visible')
    const endWord = pdf ? 2 : bookId === 'macbeth' ? 9 : info.own ? 8 : 18
    await words.nth(endWord).waitFor()
    const first = await words.nth(pdf ? 0 : info.own ? 2 : 5).boundingBox(), last = await words.nth(endWord).boundingBox()
    assert(first && last, 'visible words for selection')
    const profileSelection = process.env.SHARED_SPEED_PROFILE === '1' && profile === 'slow' && bookId === 'war-and-peace' && index === 0
    await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
    await page.mouse.down()
    await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 8 })
    if (profileSelection) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.start') }
    await page.mouse.up()
    await page.waitForFunction(() => window.__readerSpeed?.selectionBar != null, null, { timeout: 10000 }).catch(async error => {
      const state = await page.evaluate(({first,last}) => ({ clock: window.__readerSpeed, first, last, atFirst: document.elementFromPoint(first.x+first.width/2,first.y+first.height/2)?.outerHTML.slice(0,200), atLast: document.elementFromPoint(last.x+last.width/2,last.y+last.height/2)?.outerHTML.slice(0,200), selection: getSelection()?.toString().slice(0, 100), bars: document.querySelectorAll('[data-testid="lab-desk-bar"]').length, popup: document.querySelectorAll('.selection-popup.is-shared-reader').length, text: document.body.innerText.slice(0, 300) }), {first,last})
      throw new Error(`selection failed ${JSON.stringify({bookId,profile,state})}`, { cause: error })
    })
    if (profileSelection) {
      const { profile: cpu } = await cdp.send('Profiler.stop')
      const count = new Map(); for (const id of cpu.samples || []) count.set(id, (count.get(id) || 0) + 1)
      const top = cpu.nodes.map(node => ({ fn: node.callFrame.functionName, file: node.callFrame.url.split('/').at(-1), line: node.callFrame.lineNumber + 1, samples: count.get(node.id) || 0 })).filter(row => row.samples > 0).sort((a, b) => b.samples - a.samples).slice(0, 25)
      console.log('SELECTION_PROFILE ' + JSON.stringify({bookId,profile,top}))
      if (out) { await fs.mkdir(path.dirname(out), {recursive:true}); await fs.writeFile(out.replace(/\.json$/,'-selection.cpuprofile'), JSON.stringify(cpu)) }
    }
    const bar = profile === 'desktop' ? page.getByTestId('lab-desk-bar') : page.locator(pdf ? '.pdf-original-reader__phone-actions' : '.selection-popup.is-shared-reader')
    await bar.waitFor()
    if (profile === 'desktop' && pdf) await page.getByTestId('lab-dbar-explain').click()
    else if (profile === 'desktop') { await page.getByTestId('lab-dbar-more').click(); await page.getByRole('menuitem', { name: /Quiz me/ }).click() }
    else await bar.getByRole('button', { name: 'Explain' }).click()
    await page.waitForFunction(() => window.__readerSpeed?.cardShell != null, null, { timeout: 10000 }).catch(async error => {
      const state = await page.evaluate(() => ({ clock: window.__readerSpeed, cards: [...document.querySelectorAll('[class*="card"], [class*="popup"], [role="dialog"]')].filter(n=>n.textContent.includes('A local fixture')).slice(-12).map(n => ({ class: n.className, tag:n.tagName, text: n.textContent.slice(0,90), rect: n.getBoundingClientRect().toJSON() })), text: document.body.innerText.slice(-500) }))
      throw new Error(`card shell failed ${JSON.stringify({bookId,profile,state})}`, {cause:error})
    })
    const marks = await page.evaluate(() => ({ ...window.__readerSpeed, edition: document.querySelector('[data-testid="lab-root"]')?.dataset.readerEdition, format:document.querySelector('.pdf-original') ? 'original-pdf' : 'react-text' }))
    assert.deepEqual(errors, [], 'no uncaught reader errors')
    return { bookId, profile, index, coldFirstText: Math.round(coldFirstText), coldFileDownloads, warmFileDownloads: info.own ? (fileDownloads.get(info.own.id) || 0) - downloadsBeforeWarm : 0, firstText: Math.round(firstText), selection: Math.round(marks.selectionBar - marks.selectUp), card: Math.round(marks.cardShell - marks.cardTap), edition: marks.edition, format:marks.format }
  } finally { await context.close() }
}
try {
  for (const bookId of cases) for (const profile of profiles) for (let index = 0; index < runs; index++) {
    const row = await sample(bookId, profile, index)
    results.push(row)
    console.log(`RUN ${bookId} ${profile} ${index + 1}/${runs}: cold text ${row.coldFirstText} ms, warm text ${row.firstText} ms, selection ${row.selection} ms, card ${row.card} ms`)
  }
  const failures = []
  for (const bookId of cases) for (const profile of profiles) {
    const rows = results.filter(row => row.bookId === bookId && row.profile === profile)
    const cold = median(rows.map(row => row.coldFirstText)), first = median(rows.map(row => row.firstText)), selection = median(rows.map(row => row.selection)), card = median(rows.map(row => row.card))
    console.log(`MEDIAN ${bookId} ${profile}: cold text ${cold} ms, warm text ${first} ms (target ${profile === 'desktop' ? 'warm ≤'+targets.desktopFirstText : 'cold ≤'+targets.slowFirstText}), selection ${selection} ms (≤${targets.selection}), card ${card} ms (≤${targets.card})`)
    if ((profile === 'desktop' ? first : cold) > (profile === 'desktop' ? targets.desktopFirstText : targets.slowFirstText)) failures.push(`${bookId} ${profile} text ${profile === 'desktop' ? first : cold}`)
    if (selection > targets.selection) failures.push(`${bookId} ${profile} selection ${selection}`)
    if (card > targets.card) failures.push(`${bookId} ${profile} card ${card}`)
  }
  assert.deepEqual(denied, [], 'proxy never saw an external host')
  if (out) { await fs.mkdir(path.dirname(out), { recursive: true }); await fs.writeFile(out, JSON.stringify({ bundle: dist, origin: 'loopback', paint: 'next rAF after visible DOM', cache: 'HTML no-store; hashed assets immutable; tagged scripts one day; other files revalidate via ETag; text gzip >1 KiB; cold first navigation, warmed static cache second navigation in same fresh context', ownSource: remoteFirst ? 'empty IDB then mocked private account download' : 'byte-identical owner-bound IndexedDB record seeded before cold navigation', fixtures: Object.fromEntries(Object.entries(ownFixtures).map(([id,fixture]) => [id,{ sizeBytes:fixture.bytes.length, sha256:fixture.sha256, description:id==='own-epub'?'one synthetic chapter, 60 paragraphs': 'local prose_book.pdf original page and text layer' }])), profiles: { desktop: '1440x900', slow: '390x844, Chromium 4x CPU, 60ms RTT, 9Mbps down' }, targets, results, failures }, null, 2)) }
  console.log(failures.length ? `MISSED ${failures.join('; ')}` : 'All shared reader speed targets met')
  if (failures.length) process.exitCode = 1
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
