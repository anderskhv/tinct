// Routed private PDF Original reader against a local built app. Every API and
// media response is synthetic; unexpected hosts and endpoints fail closed.
// PDF_ORIGINAL_DIST=dist node scripts/check-shared-reader-pdf-original.mjs
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { makePdf } from '../../addbooks/web/test/make-pdf.mjs'
import { assertBareDesktopHeader, assertNaturalCardBody, assertNoRepeatedQuote, assertRailScrollsWithSource, sourceRailGeometry, settlePaint, enforceReaderBundle } from './lib/readerParityAssertions.mjs'

const dist = path.resolve(process.env.PDF_ORIGINAL_DIST || 'dist')
const originalBytes = makePdf({ pages: [
  { lines: [{ x: 72, y: 740, size: 24, text: 'Chapter One' },{ x: 72, y: 700, size: 20, text: 'First original page with selectable source words.' }] },
  { lines: [{ x: 72, y: 700, size: 20, text: 'Second original page has its own spoken words.' }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
], outline: [{ title: 'Chapter One', page: 1 }, { title: 'Scans', page: 3 }] })
// Imported source only: no embedded outline and no persisted scan metadata.
const freshDiscoveryBytes=makePdf({pages:Array.from({length:6},(_,index)=>{const n=index+1;return {lines:[
  ...(n===1?[{x:72,y:755,size:24,text:'An argument about knowledge'},...Array.from({length:3},(_,line)=>({x:72,y:700-line*24,size:12,text:'This opening paragraph introduces the argument and establishes its printed source context.'}))]:[]),
  ...(n===1||n===4?[{x:72,y:n===1?580:735,size:20,text:n===1?'1 Introduction':'2 Consequences'}]:[]),
  ...Array.from({length:n===1?20:28},(_,line)=>({x:72,y:(n===1?530:n===4?680:735)-line*20,size:12,text:`Source paragraph ${line+1} preserves the complete printed argument and its original supporting evidence for careful reading.`})),
]}})})
const denseBytes = makePdf({ pages: [
  { lines: Array.from({ length: 80 }, (_, index) => ({ x: 72, y: 750 - index * 9, size: 8,
    text: `Dense original page line ${index + 1}. ${'source '.repeat(9)}` })) },
  { lines: [{ x: 72, y: 700, size: 20, text: 'End of dense original chapter.' }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
], outline: [{ title: 'Chapter One', page: 1 }, { title: 'Scans', page: 3 }] })
// Forty pages preserve real outline units, including a second unit with eligible Catch me up.
const parityBytes = makePdf({ pages: Array.from({ length: 40 }, (_, index) => ({ lines: [
  { x: 72, y: 735, size: 20, text: index === 0 ? '1 Introduction' : index === 20 ? '2 Consequences' : `Source page ${index + 1}` },
  ...Array.from({ length: index === 0 ? 16 : 22 }, (_, line) => ({ x: 72, y: 680 - line * 24, size: 13,
    text: `Passage ${line + 1} on page ${index + 1} preserves the original printed source words.` })),
  ...(index === 0 ? [{ x: 190, y: 125, size: 12, text: 'Figure 1. Fixture diagram' }] : []),
], ...(index === 0 ? { draw: 'q 0 G 1.5 w 190 150 180 110 re S 205 170 m 355 170 l 280 245 l h S 205 170 m 355 225 l S Q' } : {}) })), outline: [{ title: '1 Introduction', page: 1 }, { title: '2 Consequences', page: 21 }] })
const conversionBytes = makePdf({ pages: Array.from({length:3},(_,index)=>({lines:[
  {x:72,y:735,size:20,text:`Chapter ${index+1}: The conversion journey`},
  ...Array.from({length:22},(_,line)=>({x:72,y:690-line*24,size:12,text:`Page ${index+1}, passage ${line+1}: The reader follows these original words through a careful study of ideas and evidence.`})),
]})),outline:[{title:'The conversion journey',page:1}]})
const conversionScanBytes = makePdf({pages:[{images:[{x:55,y:120,w:300,h:500}]},{images:[{x:55,y:120,w:300,h:500}]}]})
const fileId = 'd'.repeat(32), owner = 'pdf-original-fixture-owner'
const bundle = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const ref = bundle && /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(await fs.readFile(path.join(dist, 'assets', bundle), 'utf8'))?.[1]
assert(ref, 'built reader must include a synthetic Supabase project reference')
const authKey = `sb-${ref}-auth-token`
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }[path.extname(file)] || 'application/octet-stream')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (url.pathname === '/qa-seed') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>PDF owner fixture</title>'); return }
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const body = await fs.readFile(file); res.writeHead(200, { 'Content-Type': mime(file) }); res.end(body) }
  catch { res.writeHead(404); res.end() }
})
server.on('connect', (_req, socket) => socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'))
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = process.env.TINCT_ORIGIN || `http://127.0.0.1:${server.address().port}`
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''

// A viewport/font resize replaces pdf.js spans. Resolve and select the current
// connected span in one browser turn, only after fit-width rendering has settled.
async function selectPdfSource(page, text) {
  await page.waitForFunction(text => {
    const sheet = document.querySelector('.pdf-original__page[data-page="1"][data-ready="true"]')
    const column = document.querySelector('.pdf-original__pages'), layer = sheet?.querySelector('.pdf-original__text')
    const span = layer && [...layer.querySelectorAll('span')].find(node => node.textContent === text)
    const parent = span?.parentElement, box = sheet?.getBoundingClientRect(), ink = span?.getBoundingClientRect()
    const expected = column && Math.max(1, Math.min(1500, Math.floor(column.clientWidth - 32)))
    const ready = span?.isConnected && parent === layer && document.fonts.status === 'loaded' && box?.width > 0 && ink?.width > 0
      && Math.abs(box.width - expected) <= 1 && Math.abs(layer.getBoundingClientRect().width - box.width) <= 1
    const key = `${column?.clientWidth}:${box?.width}:${ink?.left}:${ink?.top}`
    const prior = window.__pdfSelectionReadiness
    window.__pdfSelectionReadiness = { span, key, ready: !!ready }
    if (!ready || prior?.span !== span || prior?.key !== key || !prior.ready) return false
    const range = document.createRange(), selection = window.getSelection()
    range.selectNodeContents(span); selection.removeAllRanges(); selection.addRange(range)
    // A synchronous selection handler may have invalidated the render too.
    if (!span.isConnected || span.parentElement !== parent) return false
    parent.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    return true
  }, text, { polling: 'raf', timeout: 45000 })
}

// Saving intentionally replaces the draft rail row. Wait for the real answer,
// image decode and persisted identity before measuring or scrolling its body.
async function settledFigureCard(page, answer, id = null) {
  const result = await page.waitForFunction(({ answer, id }) => {
    const entries = [...document.querySelectorAll('[data-testid="source-margin-item"][data-open="true"]')]
    const entry = entries.find(node => id ? node.dataset.cardId === id : node.dataset.cardId?.startsWith('card:') && node.textContent.includes(answer))
    const body = entry?.querySelector('[data-testid="lab-phone-card-body"]'), image = body?.querySelector('.pdf-original__figure-thumb img')
    if (!body?.isConnected || !body.textContent.includes(answer) || !image?.complete || !image.naturalWidth) return false
    return entry.dataset.cardId
  }, { answer, id }, { polling: 'raf', timeout: 45000 })
  const savedId = await result.jsonValue()
  await result.dispose()
  await page.waitForFunction(id => {
    const entry = [...document.querySelectorAll('[data-testid="source-margin-item"]')].find(node => node.dataset.cardId === id)
    const body = entry?.querySelector('[data-testid="lab-phone-card-body"]')
    if (!body?.isConnected || entry.dataset.open !== 'true') return false
    body.scrollIntoView({ block: 'nearest' })
    const box = body.getBoundingClientRect(), prior = window.__pdfFigureReadiness
    const key = `${id}:${box.x}:${box.y}:${box.width}:${box.height}`
    window.__pdfFigureReadiness = { body, key }
    return box.width > 0 && box.height > 0 && prior?.body === body && prior?.key === key
  }, savedId, { polling: 'raf', timeout: 45000 })
  return page.locator(`[data-testid="source-margin-item"][data-card-id="${savedId}"]`)
}

async function sourceParity(page, calls, output) {
  await fs.mkdir(output, { recursive: true })
  await page.setViewportSize({ width: Number(process.env.TINCT_CAPTURE_WIDTH || 1440), height: 900 })
  const host = page.locator('.pdf-original__scroll')
  const heading = page.locator('.pdf-original__text [data-pdf-heading]').filter({ hasText: '1 Introduction' }).first()
  await heading.waitFor({ timeout: 45000 })
  await assertBareDesktopHeader(page)
  await heading.hover()
  const key = await heading.getAttribute('data-pdf-heading')
  assert(key)
  const pills = page.locator(`[data-testid="pdf-heading-actions"][data-unit-key="${key}"]`)
  await pills.waitFor()
  for (const label of ['Primer', 'Recap', 'Quiz me', 'Note']) await pills.getByRole('button', { name: label, exact: true }).waitFor()
  assert.equal(await pills.getByRole('button', { name: 'Catch me up', exact: true }).count(), 0, 'first source unit never offers previous-content catch-up')
  const headingBox = await heading.boundingBox(), pillBox = await pills.boundingBox()
  assert(headingBox && pillBox && pillBox.y < headingBox.y + headingBox.height + 12 && pillBox.y + pillBox.height > headingBox.y - 12,
    `PDF actions actually sit beside original heading ink, not the toolbar: ${JSON.stringify({ headingBox, pillBox })}`)
  await page.screenshot({ path: path.join(output, 'pdf-real-heading-hover.png') })
  await page.mouse.move(3, 3)
  await page.waitForFunction(key => { const node = document.querySelector(`[data-testid="pdf-heading-actions"][data-unit-key="${key}"]`); return node && Number(getComputedStyle(node).opacity) === 0 }, key)
  await heading.focus()
  await pills.waitFor()
  const recapPill = pills.getByRole('button', { name: 'Recap', exact: true })
  const recapBox = await recapPill.boundingBox()
  assert(recapBox)
  await heading.hover()
  await page.mouse.move(recapBox.x + recapBox.width / 2, recapBox.y + recapBox.height / 2, { steps: 12 })
  assert(await pills.evaluate(node => Number(getComputedStyle(node).opacity) > .9), 'heading-to-pill pointer movement keeps actions available across the source gap')
  await page.mouse.down(); await page.mouse.up()
  const item = host.locator('[data-testid="source-margin-item"][data-open="true"]')
  await item.waitFor()
  await item.getByText(/A grounded local fixture answer|These printed pages introduce/).first().waitFor()
  const id = await item.getAttribute('data-card-id')
  assert(id)
  await assertNaturalCardBody(item); await assertNoRepeatedQuote(item)
  const geometry = await sourceRailGeometry(page, host)
  const inkRight = await host.locator('.pdf-original__page').evaluateAll(nodes => Math.max(...nodes.map(node => node.getBoundingClientRect().right)))
  const cardBox = await item.boundingBox()
  assert(cardBox && cardBox.x >= inkRight + 10 && cardBox.width >= 220, 'original PDF source ink stays clear of a readable margin card')
  await item.getByTestId('source-margin-minimise').click()
  const folded = host.locator(`[data-testid="source-margin-item"][data-card-id="${id}"]`)
  assert.equal(await folded.getAttribute('data-open'), 'false')
  await folded.getByTestId('source-margin-open').click()
  assert.equal(await folded.getAttribute('data-open'), 'true')
  await page.screenshot({ path: path.join(output, 'pdf-source-rail-recap.png') })
  const scrollBefore = await host.evaluate(node => node.scrollTop)
  await host.evaluate(node => { node.scrollTop += 64; node.dispatchEvent(new Event('scroll', { bubbles: true })) })
  await settlePaint(page)
  assert(await host.evaluate(node => node.scrollTop) > scrollBefore)
  await assertNaturalCardBody(folded)
  await folded.getByTestId('source-margin-minimise').click()
  const marginRoom = await host.locator('.source-margin-room').boundingBox()
  assert(marginRoom)
  await page.mouse.click(marginRoom.x + Math.min(100, marginRoom.width / 2), 650)
  const noteEditor = page.getByRole('textbox', { name: 'Your note on this section', exact: true })
  await noteEditor.fill('A free note beside the original printed page.')
  // PDF note autosave deliberately debounces a typing burst for 400 ms.
  await page.waitForTimeout(550)
  const noteItem = host.locator('[data-testid="source-margin-item"][data-open="true"]')
  const noteId = await noteItem.getAttribute('data-card-id')
  assert(noteId)
  await noteItem.getByTestId('source-margin-minimise').click()
  const savedNote = host.locator(`[data-testid="source-margin-item"][data-card-id="${noteId}"]`)
  await savedNote.getByTestId('source-margin-open').click()
  assert.equal(await noteEditor.inputValue(), 'A free note beside the original printed page.', 'original-PDF free note autosaves and reopens')
  await savedNote.getByRole('button', { name: /^Delete / }).click()
  assert.equal(await savedNote.count(), 0)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await savedNote.waitFor()
  assert.equal(await host.getByTestId('source-margin-item').count(), 2, 'PDF Undo restores the free note beside the saved source answer')
  await page.screenshot({ path: path.join(output, 'pdf-free-note-undo.png') })
  // The source marker is keyboard reachable even while its quiet toolbar is hidden.
  const diagram = host.getByRole('button', { name: 'View Figure 1 on page 1', exact: true })
  await diagram.scrollIntoViewIfNeeded()
  await settlePaint(page)
  const figureScroll = await host.evaluate(node => node.scrollTop)
  await diagram.focus()
  const figureTools = page.getByRole('toolbar', { name: 'Figure 1 actions', exact: true })
  await figureTools.waitFor()
  for (const action of ['View', 'Ask', 'Explain', 'Highlight', 'Copy']) await figureTools.getByRole('button', { name: action, exact: true }).waitFor()
  await figureTools.getByRole('button', { name: 'View', exact: true }).click()
  const figureDialog = page.getByRole('dialog', { name: 'Figure 1', exact: true })
  await figureDialog.locator('img').waitFor()
  assert.equal(await host.evaluate(node => node.scrollTop), figureScroll, 'opening source figure never scrolls the reading page')
  await page.screenshot({ path: path.join(output, 'pdf-source-figure-view.png') })
  await figureDialog.getByRole('button', { name: 'Close figure', exact: true }).click()
  await figureDialog.waitFor({ state: 'hidden' })
  assert.equal(await host.evaluate(node => node.scrollTop), figureScroll, 'closing source figure keeps exact scroll offset')
  await diagram.focus()
  await figureTools.getByRole('button', { name: 'Explain', exact: true }).click()
  const figureCard = await settledFigureCard(page, 'A grounded local fixture answer.')
  await figureCard.getByText(/A grounded local fixture answer\./).waitFor({ timeout: 5000 })
  const hasImage = call => { const messages = JSON.parse(call.body || '{}').messages; return messages?.some(message => Array.isArray(message.content) && message.content.some(block => block.type === 'image' && block.source?.data)) }
  assert(hasImage(calls.filter(call => call.path === '/api/chat').at(-1)), 'rendered figure Explain sends the actual source image block')
  const figureCardId = await figureCard.getAttribute('data-card-id')
  assert(figureCardId)
  const thumb = figureCard.getByRole('button', { name: 'Show Figure 1 larger', exact: true })
  await thumb.locator('img').waitFor()
  await thumb.click()
  await page.getByRole('dialog', { name: 'Figure 1', exact: true }).getByRole('button', { name: 'Close figure', exact: true }).click()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.pdf-original__text [data-pdf-heading]').first().waitFor()
  const restoredFigure = host.locator(`[data-testid="source-margin-item"][data-card-id="${figureCardId}"]`)
  await restoredFigure.getByTestId('source-margin-open').click()
  await settledFigureCard(page, 'A grounded local fixture answer.', figureCardId)
  await restoredFigure.getByRole('button', { name: 'Show Figure 1 larger', exact: true }).locator('img').waitFor()
  await restoredFigure.getByTestId('lab-phone-card-input').fill('What does this figure add?')
  await restoredFigure.getByTestId('lab-phone-card-send').click()
  await restoredFigure.getByText(/The follow-up still sees the original source image\./).waitFor()
  assert(hasImage(calls.filter(call => call.path === '/api/chat').at(-1)), 'saved figure follow-up recaptures the source image after reload')
  await settledFigureCard(page, 'The follow-up still sees the original source image.', figureCardId)
  await settlePaint(page)
  await page.screenshot({ path: path.join(output, 'pdf-saved-figure-followup.png') })
  // Navigation is used only to bring the second original heading into the bounded render window.
  await page.getByRole('button', { name: 'Contents', exact: true }).click()
  await page.getByLabel('Go to page', { exact: true }).fill('21')
  await page.getByRole('button', { name: 'Go', exact: true }).click()
  const secondHeading = page.locator('.pdf-original__text [data-pdf-heading]').filter({ hasText: '2 Consequences' }).first()
  await secondHeading.waitFor()
  await secondHeading.hover()
  const secondKey = await secondHeading.getAttribute('data-pdf-heading')
  const secondPills = page.locator(`[data-testid="pdf-heading-actions"][data-unit-key="${secondKey}"]`)
  await secondPills.getByRole('button', { name: 'Catch me up', exact: true }).waitFor()
  assert.equal(await page.locator('canvas').count() <= 3, true, 'heading controls preserve bounded original-page canvases')
  await page.screenshot({ path: path.join(output, 'pdf-second-heading-catch-up.png') })
  await fs.writeFile(path.join(output, 'pdf-source-parity.json'), JSON.stringify({ geometry, headingBox, pillBox, calls: calls.map(call => ({ path: call.path, method: call.method })) }, null, 2))
  console.log(`Original PDF source contracts passed: heading-hover/focus, real rail, natural cards, notes/Undo, figure image/follow-up, earlier-unit catch-up. ${output}`)
}

async function conversionParity(page,hex,success,output,documentUrls) {
  await fs.mkdir(output,{recursive:true})
  await page.setViewportSize({width:1440,height:900})
  await page.locator('[data-pdf-original="true"] .pdf-original__page[data-ready="true"]').first().waitFor({timeout:45000})
  await page.getByRole('button',{name:'Contents',exact:true}).click()
  await page.getByLabel('Go to page',{exact:true}).fill('2')
  await page.getByRole('button',{name:'Go',exact:true}).click()
  await page.locator('.pdf-original__page[data-page="2"][data-ready="true"]').waitFor()
  await page.locator('.pdf-original__scroll').evaluate(host=>{
    const slot=host.querySelector('.pdf-original__slot:nth-child(2)')
    host.scrollTop=slot.offsetTop+slot.clientHeight*.42
    host.dispatchEvent(new Event('scroll',{bubbles:true}))
  })
  await settlePaint(page)
  const readPlace=()=>page.evaluate(hex=>JSON.parse(localStorage.getItem(`tinct-addbook:pos:pdf:${hex}`)||'null'),hex)
  const before=await readPlace()
  assert.equal(before.page,2,'fixture enters conversion from the second original page')
  assert(before.frac>.1 && before.frac<.9,'fixture exercises a nonzero source fraction')
  await page.getByRole('button',{name:'Appearance',exact:true}).click()
  await page.getByRole('button',{name:'Convert to Tinct book',exact:true}).waitFor()
  await page.screenshot({path:path.join(output,success?'conversion-before.png':'conversion-scan-before.png')})
  const documentsBefore=documentUrls.length
  await page.getByRole('button',{name:'Convert to Tinct book',exact:true}).click()
  if (!success) {
    await page.getByRole('status').filter({hasText:'needs recognised text'}).waitFor({timeout:45000})
    assert.equal(await page.locator('[data-pdf-original="true"]').count(),1,'failed conversion retains the original reader')
    assert.equal(documentUrls.length,documentsBefore,'failed conversion does not navigate away')
    const after=await readPlace()
    assert.equal(after.page,before.page); assert(Math.abs(after.frac-before.frac)<.03,'failed conversion retains source fraction')
    assert.equal(await page.evaluate(hex=>JSON.parse(localStorage.getItem(`tinct-addbook:edition:${hex}`)||'null'),hex),'pages')
    await page.screenshot({path:path.join(output,'conversion-scan-error.png')})
    await fs.writeFile(path.join(output,'conversion-scan.json'),JSON.stringify({before,after,documentUrls},null,2))
    return
  }
  await page.locator('[data-shared-reader="true"]:not([data-pdf-original]) [data-testid="lab-word"]').first().waitFor({timeout:60000})
  await page.waitForFunction(()=>!document.querySelector('[data-pdf-original="true"]'))
  const converted=await page.evaluate(async hex=>{
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('tinct-addbook',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
    const record=await new Promise((resolve,reject)=>{const r=db.transaction('books','readonly').objectStore('books').get(`pdf:${hex}`);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
    db.close();return {converter:record.edition?.converter,source:record.edition?.source,chapters:record.edition?.chapters.length}
  },hex)
  assert(converted.converter && converted.source==='pdf' && converted.chapters>0,'the actual PDF converter stores a legitimate text edition')
  const intoText=new URL(documentUrls.at(-1))
  assert.equal(intoText.searchParams.get('sharedReader'),'1'); assert.equal(intoText.searchParams.get('pages'),null)
  assert.equal(Number(intoText.searchParams.get('page')),before.page)
  assert(Math.abs(Number(intoText.searchParams.get('frac'))-before.frac)<.03,'Original→text URL carries source fraction')
  await settlePaint(page)
  await page.getByTestId('lab-header-aa').click()
  const formats=page.getByRole('group',{name:'Book format'})
  await formats.getByText('Tinct book',{exact:true}).waitFor()
  const textPlace=await readPlace()
  assert.equal(textPlace.page,before.page,'converted text lands on the same original page')
  assert(Math.abs(textPlace.frac-before.frac)<.06,'converted text lands at the corresponding source words')
  await page.screenshot({path:path.join(output,'conversion-tinct-book.png')})
  await page.getByTestId('lab-v2-original-pages').click()
  await page.locator('[data-pdf-original="true"] .pdf-original__page[data-page="2"][data-ready="true"]').waitFor({timeout:45000})
  const backUrl=new URL(documentUrls.at(-1))
  assert.equal(backUrl.searchParams.get('sharedReader'),'1');assert.equal(backUrl.searchParams.get('pages'),'1')
  assert.equal(Number(backUrl.searchParams.get('page')),textPlace.page)
  assert(Math.abs(Number(backUrl.searchParams.get('frac'))-textPlace.frac)<.002,`text→Original URL preserves the mapped source word (page fraction is quantised to text words): ${JSON.stringify({textPlace,back:backUrl.href})}`)
  await settlePaint(page)
  const after=await readPlace()
  assert.equal(after.page,textPlace.page)
  assert(Math.abs(after.frac-textPlace.frac)<.06,'original source reopens near the same words')
  await page.getByRole('button',{name:'Appearance',exact:true}).click()
  await page.getByRole('button',{name:'Tinct book',exact:true}).waitFor()
  await page.screenshot({path:path.join(output,'conversion-original-return.png')})
  await fs.writeFile(path.join(output,'conversion-roundtrip.json'),JSON.stringify({before,textPlace,after,converted,documentUrls},null,2))
}

async function run(name, browserType, narrationSuccess = false, sourceBytes = originalBytes) {
  const bytes = sourceBytes, sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
  const book = { id: fileId, type: 'pdf', sha256, name: 'Original source.pdf', title: 'Original source', author: 'Fixture', size: bytes.length,
    createdAt: '2026-10-23T00:00:00.000Z' }
  const browser = await markInternal(await browserType.launch({ headless: true,
    ...(name.startsWith('chromium') ? { args: ['--mute-audio', '--no-sandbox'] } : {}) }))
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage(), denied = [], errors = [], consoleErrors = [], calls = [], documentUrls=[]
  page.on('request',request=>{if(request.isNavigationRequest() && new URL(request.url()).pathname==='/reader') documentUrls.push(request.url())})
  if (name.startsWith('chromium') && process.env.PDF_CPU_RATE) {
    const session = await context.newCDPSession(page)
    await session.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.PDF_CPU_RATE) })
    if (process.env.PDF_NETWORK_LATENCY) {
      await session.send('Network.enable')
      await session.send('Network.emulateNetworkConditions', { offline: false, latency: Number(process.env.PDF_NETWORK_LATENCY), downloadThroughput: 1_000_000, uploadThroughput: 1_000_000 })
    }
    console.log(`${name}: readiness stress CPU ${process.env.PDF_CPU_RATE}x / network ${process.env.PDF_NETWORK_LATENCY || 0}ms`)
  }
  const finishOriginalPage = async number => page.locator('.pdf-original__scroll').evaluate((el, pageNumber) => {
    const sheet = el.querySelector(`.pdf-original__slot:nth-child(${pageNumber})`)
    if (!sheet) throw new Error(`original page ${pageNumber} has no continuous sheet`)
    el.scrollTop = Math.max(sheet.offsetTop, sheet.offsetTop + sheet.clientHeight - el.clientHeight + 2)
    el.dispatchEvent(new Event('scroll', { bubbles: true }))
  }, number)
  const openNotebook = async () => {
    if(await page.getByTestId('lab-header-notebook').isVisible())await page.getByTestId('lab-header-notebook').click()
    else {await page.getByTestId('lab-super').click();await page.getByTestId('lab-super-row-notebook').click()}
  }
  const narrationReady = narrationSuccess
  const visual = process.env.PDF_VISUAL_OUTPUT && name === 'chromium' ? path.resolve(process.env.PDF_VISUAL_OUTPUT) : null
  if (visual) await fs.mkdir(visual, { recursive: true })
  const sets = { marks: { list: [], rev: 0 }, cards: { list: [], rev: 0 } }
  page.on('pageerror', error => errors.push(error.stack || error.message))
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 1200)) })
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url()), p = url.pathname
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.hostname.endsWith('.supabase.co')) {
      if (p === '/auth/v1/user') return json(200, { id: owner, email: 'pdf@example.test', aud: 'authenticated' })
      if (p.startsWith('/rest/v1/')) return json(200, [])
      return json(404, {})
    }
    if (url.origin !== origin) { denied.push(url.origin); return route.abort() }
    if (p === '/qa-seed') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Synthetic private source fixture</title>' })
    if (await enforceReaderBundle(route, expectedBundle)) return
    if (!p.startsWith('/api/')) return route.continue()
    calls.push({ path: p, method: request.method(), body: request.postData() || '', bearer: request.headers().authorization?.startsWith('Bearer ') ?? false })
    if (p === '/api/public-books') return json(200, { books: [] })
    if (p === '/api/user-books') return json(200, { books: [book] })
    if (p === '/api/user-books/places') return json(200, { places: {} })
    if (p === `/api/user-books/${fileId}`) return route.fulfill({ contentType: 'application/pdf', body: bytes })
    if (p === `/api/user-books/marks/${hex}` || p === `/api/user-books/cards/${hex}`) {
      const name = p.includes('/marks/') ? 'marks' : 'cards', set = sets[name]
      if (request.method() === 'GET') return json(200, { [name]: set.list, rev: set.rev, fileId })
      const sent = request.postDataJSON()
      if (sent.expectedFileId !== fileId || sent.rev !== set.rev) return json(409, { [name]: set.list, rev: set.rev, fileId })
      set.list = sent[name]; set.rev++
      return json(200, { rev: set.rev, fileId })
    }
    if (/^\/api\/user-books\/(?:places|covers|primers)\//.test(p)) return json(200, { place: null, cover: null, primer: null })
    if (p === '/api/narration/voices') return json(200, { enabled: true, provider: 'grok', ownBooks: true,
      voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] })
    if (p === '/api/narration/own/ensure') {
      if (!narrationReady) return json(503, { error: 'Synthetic unavailable' })
      const input = request.postDataJSON()
      assert.equal(input.book, hex, 'only the owned narration route receives the private hex')
      return json(200, { paragraphs: input.paragraphs.map(({ index, text }) => {
        const words = text.trim().split(/\s+/).map((word, position, all) => ({ text: word, start: position * 2 / all.length, end: (position + 1) * 2 / all.length }))
        return { paragraph: index, status: 'ready', textHash: createHash('sha256').update(text.replace(/\s+/g, ' ').trim()).digest('hex'),
          chunkCount: 1, readyChunks: 1, duration: 2, words,
          chunks: [{ index: 0, wordFrom: 0, wordTo: words.length, ready: true, url: '/api/narration/own/audio?fixture=1',
            duration: 2, words }] }
      }) })
    }
    if (p === '/api/narration/own/audio') return route.fulfill({ contentType: 'audio/mpeg', body: Buffer.alloc(128) })
    if (p === '/api/voice-session') return narrationSuccess
      ? json(200, { value: 'synthetic-ticket', model: 'grok-voice', relay: '/api/voice-relay' })
      : json(401, { error: 'Synthetic token expired' })
    if (p === '/api/voice-usage') return json(200, { ok: true })
    if (p === '/api/chat') {
      const { companion, messages } = request.postDataJSON()
      const text = companion?.intent === 'chapter'
        ? JSON.stringify({ gist: 'These printed pages introduce an original argument.', claims: ['The opening claim.', 'A second claim.', 'The source consequence.'],
          keepInMind: ['Watch the source wording.'], map: [{ title: 'Opening', pages: 'p. 1' }, { title: 'Development', pages: 'p. 2' }, { title: 'Scan', pages: 'p. 3' }] })
        : companion?.intent === 'quiz'
          ? JSON.stringify({ questions: [{ q: 'Which page has its own spoken words?', answer: 'Page 2' }] })
        : companion?.intent === 'define'
          ? JSON.stringify({ kind: 'place', name: 'source words', description: 'The terms printed on this original PDF page.' })
          : JSON.stringify(messages).includes('What does this figure add?')
            ? 'The follow-up still sees the original source image.'
          : messages?.at(-1)?.content === 'What links these two pages?'
            ? 'The first printed page leads into the second original page.'
          : 'A grounded local fixture answer.'
      return json(200, { content: [{ text }], stop_reason: 'end_turn' })
    }
    return json(404, { error: 'fixture endpoint unavailable' })
  })
  await page.addInitScript(({ authKey, owner, theme }) => {
    localStorage.setItem(authKey, JSON.stringify({ access_token: 'pdf-fixture', refresh_token: 'pdf-fixture', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000,
      token_type: 'bearer', user: { id: owner, email: 'pdf@example.test', aud: 'authenticated' } }))
    if (theme) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme }))
    window.__speechCalls = 0
    if (window.speechSynthesis) for (const method of ['speak', 'getVoices']) {
      const original = window.speechSynthesis[method]?.bind(window.speechSynthesis)
      if (original) window.speechSynthesis[method] = (...args) => { window.__speechCalls++; return original(...args) }
    }
    window.__fakeAudio = []
    window.Audio = class extends EventTarget {
      constructor() { super(); this.src = ''; this.currentTime = 0; this.duration = 2; this.ended = false; this.paused = true;
        this.playbackRate = 1; this.preload = ''; this.error = null; window.__fakeAudio.push(this) }
      play() { this.paused = false; queueMicrotask(() => { this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing')) }); return Promise.resolve() }
      pause() { if (!this.paused) { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))) } }
      load() {} setAttribute() {} removeAttribute(name) { if (name === 'src') this.src = '' }
    }
    const node = () => ({ connect() {}, disconnect() {} })
    window.AudioContext = class {
      constructor() { this.state = 'running'; this.sampleRate = 48000; this.destination = node() }
      resume() { this.state = 'running'; return Promise.resolve() }
      close() { this.state = 'closed'; return Promise.resolve() }
      createMediaStreamSource() { return node() }
      createGain() { return { ...node(), gain: { value: 1 } } }
      createScriptProcessor() { return { ...node(), onaudioprocess: null } }
    }
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({
      getTracks: () => [{ stop() {}, readyState: 'live' }], getAudioTracks: () => [{ stop() {}, readyState: 'live' }],
    }) } })
    window.__voiceSockets = []
    window.WebSocket = class extends EventTarget {
      static OPEN = 1
      constructor(url, protocols) { super(); this.url = url; this.protocols = protocols; this.readyState = 1; this.sent = []
        window.__voiceSockets.push(this)
        queueMicrotask(() => { this.dispatchEvent(new Event('open')); this.emit({ type: 'session.created' }); this.emit({ type: 'session.updated' }) }) }
      send(value) { this.sent.push(JSON.parse(value)) }
      emit(event) { this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(event) })) }
      close() { this.readyState = 3; this.dispatchEvent(new Event('close')) }
    }
  }, { authKey, owner, theme: process.env.TINCT_CAPTURE_THEME || '' })
  try {
    await page.goto(`${origin}/qa-seed`)
    await page.evaluate(async ({ hex, owner, fileId, book, bytes, scanFailure }) => {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('tinct-addbook', 1)
        req.onupgradeneeded = () => req.result.createObjectStore('books', { keyPath: 'key' })
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
      await new Promise((resolve, reject) => {
        const tx = db.transaction('books', 'readwrite')
        tx.objectStore('books').put({ key: `pdf:${hex}`, kind: 'pdf', owner, cloudId: fileId, name: book.name,
          title: book.title, author: book.author, bytes: new Uint8Array(bytes).buffer, ...(scanFailure ? {scan:{v:1,pages:2,textPages:0,layout:{default:'pages-only'}}} : {}) })
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error)
      })
      db.close()
    }, { hex, owner, fileId, book, bytes: [...bytes], scanFailure:sourceBytes===conversionScanBytes })
    await page.goto(`${origin}/reader?userBook=${hex}&sharedReader=1&pages=1`, { waitUntil: 'domcontentloaded' })
    assert.equal(await page.title(),'Tinct','reader browser tab has the product name')
    if(sourceBytes===freshDiscoveryBytes){
      await page.locator('.pdf-original__page[data-page="1"] canvas').waitFor()
      const before=await page.locator('.pdf-original__scroll').evaluate(el=>el.scrollTop)
      await page.waitForFunction(()=>document.querySelector('.lab-header-chapter')?.textContent.includes('Introduction'),null,{timeout:45000}).catch(async error=>{console.error('FRESH_DISCOVERY_DIAGNOSTIC',JSON.stringify({errors,consoleErrors,ui:await page.locator('body').innerText(),stored:await page.evaluate(async hex=>{const db=await new Promise(resolve=>{const r=indexedDB.open('tinct-addbook',1);r.onsuccess=()=>resolve(r.result)});return new Promise(resolve=>{const r=db.transaction('books').objectStore('books').get(`pdf:${hex}`);r.onsuccess=()=>{const item=r.result;resolve({scan:item?.scan,scanOutline:item?.scanOutline});db.close()}})},hex)}));throw error})
      assert.equal(await page.locator('.pdf-original__scroll').evaluate(el=>el.scrollTop),before,'fresh local chapter discovery preserves the initial PDF place')
      await page.getByRole('button',{name:'Contents',exact:true}).click()
      await page.getByTestId('lab-toc').waitFor()
      assert.match(await page.getByTestId('lab-toc').innerText(),/Introduction/)
      assert.match(await page.getByTestId('lab-toc').innerText(),/Consequences/)
      assert.deepEqual(errors,[],'fresh heading discovery has no reader exceptions')
      assert.deepEqual(denied,[],'fresh heading discovery sends no external requests')
      console.log(`${name}: source-only PDF discovers chapters locally without changing its initial place`)
      return
    }
    if (process.env.PDF_CONVERSION_PARITY === '1') {
      await conversionParity(page,hex,sourceBytes!==conversionScanBytes,process.env.PDF_CONVERSION_OUTPUT || '/tmp/tinct-pdf-conversion',documentUrls)
      assert.deepEqual(errors,[],'conversion has no uncaught reader errors');assert.deepEqual(denied,[],'conversion fixture sends no external traffic')
      assert(!calls.some(call=>['/api/chat','/api/lab-chat'].includes(call.path)),'local conversion never calls an AI provider')
      console.log(`${name}: local conversion, source-place handoff and safe failure passed`)
      return
    }
    if (process.env.PDF_SOURCE_PARITY === '1') {
      try { await sourceParity(page, calls, process.env.TINCT_PARITY_OUTPUT || '/tmp/tinct-reader-restored-parity') }
      catch (error) {
        const folder = process.env.TINCT_PARITY_OUTPUT || '/tmp/tinct-reader-restored-parity'
        await page.screenshot({ path: path.join(folder, 'failure.png') }).catch(() => {})
        console.error('PDF request evidence', JSON.stringify(calls.filter(call => call.path === '/api/chat').map(call => { const body = JSON.parse(call.body); return { intent: body.companion?.intent, contentTypes: body.messages?.map(message => Array.isArray(message.content) ? message.content.map(block => block.type) : typeof message.content) } })))
        console.error('PDF browser errors', JSON.stringify({ errors, consoleErrors }))
        console.error('PDF source evidence', JSON.stringify(await page.evaluate(() => ({ active: document.activeElement?.outerHTML, cards: [...document.querySelectorAll('[data-testid="source-margin-item"]')].map(node => ({ id: node.dataset.cardId, open: node.dataset.open, text: node.textContent?.slice(0, 1500), html: node.querySelector('.source-margin-content')?.innerHTML.slice(0, 2500) })), figures: [...document.querySelectorAll('[data-testid="pdf-figure-source"]')].map(node => node.outerHTML), toolbars: [...document.querySelectorAll('[role="toolbar"]')].map(node => node.outerHTML) }))))
        throw error
      }
      assert.deepEqual(errors, [], 'no parity reader errors')
      assert.deepEqual(denied, [], 'no provider traffic')
      return
    }
    if (sourceBytes === denseBytes) {
      // Phone retains after-unit controls; desktop actions now belong to real source headings.
      await page.setViewportSize({ width: 390, height: 844 })
      await page.locator('.pdf-original__text').getByText(/Dense original page/).first().waitFor({ timeout: 45000 })
      await page.getByRole('button', { name: 'Next PDF page' }).click()
      await page.getByText('End of dense original chapter.').waitFor()
      await finishOriginalPage(2)
      const after = page.getByRole('complementary', { name: 'After Chapter One' })
      await after.waitFor()
      const chatBefore = calls.filter(call => call.path === '/api/chat').length
      await after.getByRole('button', { name: 'Recap' }).click()
      await page.getByText('These pages contain more text than this action can safely send.').waitFor()
      assert.equal(calls.filter(call => call.path === '/api/chat').length, chatBefore, 'dense unit Recap sends no cropped source')
      await page.keyboard.press('Escape')
      await after.getByRole('button', { name: 'Quiz me' }).click()
      await page.getByText('These pages contain more text than this action can safely send.').waitFor()
      assert.equal(calls.filter(call => call.path === '/api/chat').length, chatBefore, 'dense unit Quiz sends no cropped source')
      assert.deepEqual(errors, [], 'no dense-unit reader errors')
      assert.deepEqual(denied, [], 'no dense-unit external requests')
      console.log(`${name}: dense multi-page unit Recap and Quiz rejected without provider calls`)
      return
    }
    await page.locator('[data-pdf-original="true"] .pdf-original__text').getByText('First original page with selectable source words.').waitFor({ timeout: 45000 })
    assert.equal(await page.locator('[data-pdf-original="true"]').count(), 1)
    assert.equal(await page.locator('iframe[data-testid="margin-preview-frame"]').count(), 0)
    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-menu').waitFor()
    assert.equal(await page.getByRole('dialog',{name:'Reader menu',exact:true}).count(),0,'PDF reuses the normal reader menu')
    assert.equal(await page.getByTestId('lab-super-row-text').locator('.lab-super-row-label').innerText(),'Appearance')
    assert.equal(await page.getByTestId('lab-super-row-notebook').count(),0,'desktop Notebook is only in its toolbar')
    await fs.mkdir('/tmp/tinct-pdf-normal-menu',{recursive:true})
    await page.screenshot({path:`/tmp/tinct-pdf-normal-menu/${name}-menu.png`})
    await page.getByTestId('lab-super-row-text').click()
    await page.screenshot({path:`/tmp/tinct-pdf-normal-menu/${name}-appearance.png`})
    await page.getByRole('button',{name:'Close panel',exact:true}).click()
    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-row-chat').click()
    const menuChat=page.locator('[data-testid="source-margin-item"].is-open #pdf-question')
    await menuChat.waitFor()
    assert(await menuChat.evaluate(node=>document.activeElement===node),'PDF menu Chat is immediately ready to type')
    await page.keyboard.press('Escape')
    if (name === 'chromium') {
      const before = await page.locator('.pdf-original__scroll').evaluate(el => el.scrollTop)
      await page.getByTestId('lab-header-book').click()
      await page.getByRole('dialog', { name: 'Switch books', exact: true }).waitFor()
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('.pdf-original__scroll').evaluate(el => el.scrollTop), before, 'opening and closing the normal book picker keeps the PDF place')
      await page.getByRole('button', { name: 'Contents', exact: true }).click()
      await page.getByTestId('lab-toc').waitFor()
      assert.equal(await page.getByRole('navigation', { name: 'Chapters', exact: true }).count(), 1, 'PDF uses the normal chapter tree')
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('.pdf-original__scroll').evaluate(el => el.scrollTop), before, 'opening and closing normal contents keeps the PDF place')
      const notebook = page.getByTestId('lab-header-notebook')
      assert.equal((await notebook.textContent()).trim(), '', 'Notebook toolbar action is icon-only')
      assert.equal(await notebook.locator('svg').count(), 1)
    }
    if (!narrationSuccess) {
      await page.setViewportSize({ width: 2047, height: 1133 })
      const geometry = await page.evaluate(() => {
        const names = ['Contents', 'Appearance', 'Listen', 'Menu']
        const controls = names.map(name => {
          const button = [...document.querySelectorAll('.pdf-original-reader .lab-header button')]
            .find(item => item.getAttribute('aria-label') === name || item.textContent?.trim() === name)
          const rect = button?.getBoundingClientRect(), hit = rect && document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          return { name, rect: rect && { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
            hit: !!button && (button === hit || button.contains(hit)) }
        })
        return { controls, width: document.querySelector('.pdf-original__page[data-page="1"]')?.getBoundingClientRect().width,
          canvases: document.querySelectorAll('.pdf-original__page canvas').length }
      })
      assert(geometry.controls.every(item => item.rect && item.rect.left >= 0 && item.rect.right <= 2047
        && item.rect.top >= 0 && item.rect.bottom <= 1133 && item.hit), `wide PDF header controls are direct targets: ${JSON.stringify(geometry)}`)
      assert(geometry.width > 0 && geometry.width <= 1500, `PDF sheet uses original capped width: ${JSON.stringify(geometry)}`)
      assert(geometry.canvases <= 3, `PDF source uses bounded canvases: ${JSON.stringify(geometry)}`)
      await page.locator('.pdf-original__scroll').evaluate(el => {
        const second = el.querySelector('.pdf-original__slot:nth-child(2)')
        el.scrollTop = second.offsetTop + second.clientHeight * .25
        el.dispatchEvent(new Event('scroll', { bubbles: true }))
      })
      await page.locator('[data-testid="pdf-source-progress"][aria-label="Page 2 of 4"]').waitFor()
      await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
      await page.locator('[data-testid="pdf-source-progress"][aria-label="Page 1 of 4"]').waitFor()
      await page.setViewportSize({ width: 1100, height: 820 })
    }
    await page.waitForFunction(hex => Object.keys(localStorage).some(key => key.includes(hex) && key.startsWith('tinct-addbook:text-cards-canonical:')), hex)
    const opening = await page.evaluate(hex => ({ keys: Object.keys(localStorage).filter(key => key.includes(hex)),
      status: document.querySelector('.pdf-original-reader__status')?.textContent, owner:window.TinctAI?.session?.()?.userId }), hex)
    assert(opening.keys.some(key => key.startsWith('tinct-addbook:text-cards-canonical:')),
      `owner geometry initialized: ${JSON.stringify({ opening, calls: calls.filter(call => call.path.includes('user-books')), errors })}`)
    await selectPdfSource(page, 'First original page with selectable source words.')
    await page.getByTestId('lab-dbar-highlight').click()
    await page.locator('.pdf-original__highlight').waitFor()
    for (let i = 0; i < 60 && !calls.some(call => call.path === `/api/user-books/marks/${hex}` && call.method === 'PUT'); i++)
      await page.waitForTimeout(100)
    const markPut = calls.find(call => call.path === `/api/user-books/marks/${hex}` && call.method === 'PUT')
    assert(markPut && JSON.parse(markPut.body).expectedFileId === fileId,
      `selection must sync to the owned PDF generation; set calls: ${JSON.stringify(calls.filter(call => /\/api\/user-books\/(marks|cards)\//.test(call.path)))}`)
    assert.equal(sets.marks.list.length, 1, 'the account copy holds the saved highlight')
    await page.evaluate(({ owner, fileId, hex }) => localStorage.removeItem(`tinct-addbook:pdf-original-marks:${owner}:${fileId}:${hex}`), { owner, fileId, hex })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.pdf-original__highlight').waitFor({ timeout: 45000 })
    assert(calls.filter(call => call.path === `/api/user-books/marks/${hex}` && call.method === 'GET').length >= 2,
      'the reloaded reader fetched its cloud generation and repainted the highlight')
    if (name === 'chromium') {
      const sourceLine = () => page.locator('.pdf-original__page[data-page="1"] .pdf-original__text').getByText('First original page with selectable source words.')
      const selectSource = () => selectPdfSource(page, 'First original page with selectable source words.')
      const chooseAppearance = async theme => {
        await page.waitForFunction(() => document.querySelector('.pdf-original-reader')?.classList.contains('is-phone') === matchMedia('(max-width:700px)').matches)
        const direct = page.getByRole('button', { name: 'Appearance', exact: true })
        if (await direct.isVisible()) await direct.click()
        else { await page.getByTestId('lab-super').click(); await page.getByTestId('lab-super-row-text').click() }
        await page.getByTestId(`lab-v2-theme-${theme}`).click()
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-appearance-${theme}.png`) })
        await page.getByRole('button', { name: 'Close panel' }).click()
      }
      for (const width of [1440, 1100]) for (const theme of ['light', 'book', 'dark']) {
        await page.setViewportSize({ width, height: 900 })
        await chooseAppearance(theme)
        await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
        await page.locator('.pdf-original__page[data-page="1"][data-ready="true"]').waitFor()
        await page.waitForTimeout(120)
        assert(await page.getByRole('slider', { name: 'Original PDF position' }).isVisible(), 'desktop PDF source minimap is visible')
        assert.equal(await page.locator('.pdf-original__controls').count(), 0, 'page turns belong in the reader footer')
        assert.equal(await page.locator('.lab-header-chapter').innerText(), 'Chapter One', 'header names the current source chapter')
        const paper = await page.evaluate(() => ({ reader: getComputedStyle(document.querySelector('.pdf-original-reader')).backgroundColor, page: getComputedStyle(document.querySelector('.pdf-original__page')).backgroundColor }))
        assert.equal(paper.page, paper.reader, `PDF paper matches reader theme: ${JSON.stringify(paper)}`)
        const furniture = await page.locator('.pdf-original-reader .lab-header').evaluate(header => [...header.querySelectorAll('.lab-v2-library-back,.lab-v2-play,.lab-super')].map(node => {
          const style = getComputedStyle(node)
          return { border: style.borderTopWidth, fill: style.backgroundColor, shadow: style.boxShadow }
        }))
        assert(furniture.every(style => style.border === '0px' && style.fill === 'rgba(0, 0, 0, 0)' && style.shadow === 'none'),
          `PDF desktop header uses unboxed marks on the paper: ${JSON.stringify(furniture)}`)
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-${width}-${theme}-source.png`) })
        await selectSource()
        if (theme === 'dark') assert.equal(await sourceLine().evaluate(el => getComputedStyle(el, '::selection').color), 'rgba(0, 0, 0, 0)',
          'native selected text stays transparent so the recolored PDF canvas remains legible')
        const bar = page.getByTestId('lab-desk-bar')
        await bar.waitFor()
        const beforeBar = await bar.boundingBox()
        await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop += 40; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
        await page.waitForTimeout(100)
        const afterBar = await bar.boundingBox()
        const selectedBox = await sourceLine().boundingBox()
        // Near the header the bar must flip below the source, rather than keep
        // translating upward into the title. Both placements stay source-bound.
        const sourceGap = afterBar && selectedBox && Math.min(Math.abs(afterBar.y + afterBar.height - selectedBox.y),
          Math.abs(afterBar.y - selectedBox.y - selectedBox.height))
        assert(beforeBar && afterBar && selectedBox && Math.abs(afterBar.y - beforeBar.y) > 1 && sourceGap <= 18,
          `PDF selection toolbar follows source or flips clear of header at ${width}/${theme}: ${JSON.stringify({ beforeBar, afterBar, selectedBox, sourceGap })}`)
        const beforeCard = await page.locator('.pdf-original__scroll').evaluate(el => ({ scroll: el.scrollTop,
          width: el.querySelector('.pdf-original__page[data-page="1"]').getBoundingClientRect().width }))
        await page.getByTestId('lab-dbar-explain').click()
        const card = page.getByTestId('source-margin-item').filter({ has: page.locator('[data-testid="lab-phone-card-body"]') })
        await card.getByText('A grounded local fixture answer.').waitFor()
        await assertNoRepeatedQuote(card)
        await assertNaturalCardBody(card)
        const followHeight = await card.locator('.lab-pcard-follow-input').evaluate(el => el.getBoundingClientRect().height)
        assert(followHeight <= 48, `desktop follow-up starts as a compact field: ${followHeight}`)
        const followStyle = await card.locator('.lab-pcard-follow-box').evaluate(node => { const style = getComputedStyle(node); return { top: style.borderTopWidth, left: style.borderLeftWidth, right: style.borderRightWidth, radius: style.borderRadius, shadow: style.boxShadow } })
        assert(followStyle.top === '0px' && followStyle.left === '0px' && followStyle.right === '0px' && followStyle.radius === '0px' && followStyle.shadow === 'none',
          `PDF desktop follow-up uses the old simple underline: ${JSON.stringify(followStyle)}`)
        const cardBox = await card.boundingBox(), sheetBox = await page.locator('.pdf-original__page[data-page="1"]').boundingBox()
        const afterCard = await page.locator('.pdf-original__scroll').evaluate(el => ({ scroll: el.scrollTop,
          width: el.querySelector('.pdf-original__page[data-page="1"]').getBoundingClientRect().width }))
        assert.deepEqual(afterCard, beforeCard, 'opening a PDF card preserves source position and page breadth')
        assert(cardBox && sheetBox && cardBox.x >= sheetBox.x + sheetBox.width + 8 && cardBox.x + cardBox.width <= width - 15,
          `PDF desktop card owns the reserved right margin without source overlap: ${JSON.stringify({ width, theme, cardBox, sheetBox })}`)
        assert.equal(await page.locator('.lab-pcard-scrim').count(), 0, 'desktop PDF card has no phone scrim')
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-${width}-${theme}-card.png`) })
        await page.keyboard.press('Escape')
        const map = page.getByRole('slider', { name: 'Original PDF position' })
        await map.focus(); await page.keyboard.press('ArrowDown')
        await page.locator('[data-testid="pdf-source-progress"][aria-label="Page 2 of 4"]').waitFor()
        await page.keyboard.press('Home')
        await page.locator('[data-testid="pdf-source-progress"][aria-label="Page 1 of 4"]').waitFor()
      }
      for (const theme of ['light', 'book', 'dark']) {
        await page.setViewportSize({ width: 390, height: 844 })
        await chooseAppearance(theme)
        await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
        await page.locator('.pdf-original__page[data-page="1"][data-ready="true"]').waitFor()
        assert.equal(await page.getByRole('slider', { name: 'Original PDF position' }).count(), 0, 'phone PDF has no desktop strip')
        const phoneHeader = await page.locator('.pdf-original-reader .lab-header').boundingBox()
        assert(phoneHeader && phoneHeader.height <= 60, `phone PDF header stays in one row: ${JSON.stringify(phoneHeader)}`)
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-phone-${theme}-source.png`) })
        await selectSource()
        await page.getByTestId('lab-pbar-explain').click()
        await page.locator('.lab-pcard-dock').getByText('A grounded local fixture answer.').waitFor()
        assert.equal(await page.locator('.lab-desktop-card').count(), 0, 'phone keeps its bottom card')
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-phone-${theme}-card.png`) })
        await page.keyboard.press('Escape')
      }
      await page.setViewportSize({ width: 1100, height: 820 })
      await chooseAppearance('light')
      console.log('chromium: PDF desktop 1440/1100 light/book/dark, source-anchored toolbar, stable page/card margin, minimap navigation and phone cards passed')
    }
    await page.locator('.pdf-original__scroll').evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll',{bubbles:true}))})
    const primer=page.locator('[data-testid="pdf-heading-actions"]').first().getByRole('button',{name:'Primer',exact:true})
    await primer.focus();await primer.click()
    await page.getByText('These printed pages introduce an original argument.').waitFor()
    if (visual) await page.screenshot({ path: path.join(visual, 'pdf-original-primer.png') })
    assert.equal(await page.getByText('Key claims').count(), 1, 'structured Primer is rendered as sections')
    assert.equal(await page.getByText('"gist"').count(), 0, 'raw Primer JSON is not displayed')
    await page.keyboard.press('Escape')
    await selectPdfSource(page, 'First original page with selectable source words.')
    await page.getByTestId('lab-dbar-more').click()
    await page.getByRole('menuitem', { name: 'Define' }).click()
    await page.getByText('The terms printed on this original PDF page.').waitFor()
    if (visual) await page.screenshot({ path: path.join(visual, 'pdf-original-define.png') })
    assert.equal(await page.getByText('"description"').count(), 0, 'raw Define JSON is not displayed')
    const companionCalls = calls.filter(call => call.path === '/api/chat').map(call => JSON.parse(call.body).companion)
    assert(companionCalls.some(call => call.intent === 'chapter' && call.context.bookTitle === book.title && call.context.bookAuthor === book.author),
      'unit Primer uses owned display metadata and private page context')
    assert(companionCalls.some(call => call.intent === 'define' && call.context.bookTitle === book.title && call.context.bookAuthor === book.author),
      'selection Define uses owned display metadata')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Listen', exact: true }).click()
    for (let i = 0; i < 30 && !calls.some(call => call.path === '/api/narration/own/ensure'); i++) await page.waitForTimeout(100)
    assert(calls.some(call => call.path === '/api/narration/own/ensure'), 'Grok own-book narration path was requested')
    if (narrationSuccess) {
      await page.locator('.pdf-original__follow').waitFor({ timeout: 15000 })
      await page.evaluate(() => { const audio = window.__fakeAudio.find(item => !item.paused); if (audio) { audio.currentTime = .8; audio.dispatchEvent(new Event('timeupdate')) } })
      await page.locator('.pdf-original__follow').waitFor()
      // Continuous pages already mount page 2 and page 1's follow mark remains
      // until the next request resolves. Wait for the actual page-2 narration,
      // not the presence of either of those already-visible elements.
      const nextNarration = page.waitForRequest(request => new URL(request.url()).pathname === '/api/narration/own/ensure'
        && request.postDataJSON()?.paragraphs?.some(item => item.text.includes('Second original page has its own spoken words.')), { timeout: 15000 })
      await page.evaluate(() => { const audio = window.__fakeAudio.find(item => !item.paused); if (audio) {
        audio.currentTime = audio.duration; audio.ended = true; audio.paused = true
        audio.dispatchEvent(new Event('pause')); audio.dispatchEvent(new Event('ended'))
      } })
      await nextNarration
      await page.locator('.pdf-original__page[data-page="2"] .pdf-original__follow').waitFor({ timeout: 15000 })
      assert(calls.some(call => call.path === '/api/narration/own/ensure'
        && JSON.parse(call.body).paragraphs.some(item => item.text.includes('Second original page has its own spoken words.'))), 'next page requests its own grounded narration')
    } else assert.equal(await page.locator('.pdf-original__follow').count(), 0, 'failed narration does not paint invented word timing')
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Audio settings' }).click()
    await page.getByLabel('Narration speed').selectOption('1.5')
    assert.equal(await page.getByLabel('Narration speed').inputValue(), '1.5')
    if (narrationSuccess) await page.getByRole('button', { name: 'Pause', exact: true }).click()
    assert.equal(await page.evaluate(() => window.__speechCalls), 0, 'browser speech voice was not touched')
    await page.getByRole('button', { name: 'Close panel' }).click()
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Talk', exact: true }).click()
    await page.getByTestId('pdf-original-talk').waitFor()
    await page.getByRole('button', { name: 'Start Talk' }).waitFor()
    assert.equal(calls.some(call => call.path === '/api/voice-session'), false, 'Talk does not start without a deliberate tap')
    await page.getByRole('button', { name: 'Start Talk' }).click()
    for (let i = 0; i < 40 && !calls.some(call => call.path === '/api/voice-session'); i++) await page.waitForTimeout(100)
    assert(calls.some(call => call.path === '/api/voice-session'), 'Talk starts only on the deliberate reader tap')
    if (narrationSuccess) {
      await page.waitForFunction(() => window.__voiceSockets[0]?.sent.some(item => item.type === 'session.update'))
      const session = await page.evaluate(() => ({ url: window.__voiceSockets[0].url,
        protocol: window.__voiceSockets[0].protocols[0], update: window.__voiceSockets[0].sent.find(item => item.type === 'session.update') }))
      assert(session.url.startsWith(origin.replace(/^http/, 'ws') + '/api/voice-relay'), 'synthetic Talk socket stays same-origin')
      assert.equal(session.protocol, 'tinct-ticket.synthetic-ticket')
      assert(session.update.session.instructions.includes(book.title) && session.update.session.instructions.includes(book.author), 'Talk uses owned display metadata')
      assert(session.update.session.instructions.includes('Second original page has its own spoken words.'), 'Talk receives only actual current page source text')
      assert(!session.update.session.instructions.includes(hex), 'private file hash is absent from the voice prompt')
      await page.evaluate(() => { const socket = window.__voiceSockets[0]
        socket.emit({ type: 'input_audio_buffer.speech_started' })
        socket.emit({ type: 'input_audio_buffer.speech_stopped' })
        socket.emit({ type: 'conversation.item.input_audio_transcription.completed', transcript: 'What is printed on this page?' })
        socket.emit({ type: 'response.created', response: { id: 'fixture-answer' } })
        socket.emit({ type: 'response.output_audio_transcript.delta', delta: 'The printed source has its own words.' })
        socket.emit({ type: 'response.done', response: { id: 'fixture-answer', status: 'completed' } })
      })
      await page.getByText('What is printed on this page?').waitFor()
      await page.getByText('The printed source has its own words.').waitFor()
    } else await page.getByText('Sign in to use Talk.').waitFor()
    await page.getByRole('button', { name: 'End Talk' }).click()
    if (narrationSuccess) {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByText('Second original page has its own spoken words.').waitFor()
      await openNotebook()
      await page.getByText('What is printed on this page?').waitFor()
      await page.getByText('The printed source has its own words.').waitFor()
      await page.getByText('Saved on this device').waitFor()
      await page.getByRole('button', { name: 'Close panel' }).click()
    }
    if (visual) {
      await openNotebook()
      await page.locator('.pdf-original-reader__notebook').getByText('These printed pages introduce an original argument.', { exact: true }).waitFor()
      await page.screenshot({ path: path.join(visual, 'pdf-original-notebook.png') })
      await page.getByRole('button', { name: 'Close panel' }).click()
    }
    if (!narrationSuccess) {
      await page.getByRole('button', { name: 'Contents', exact: true }).click()
      await page.getByLabel('Go to page', { exact: true }).fill('2')
      await page.getByRole('button', { name: 'Go', exact: true }).click()
    }
    // Preserve the approved phone after-unit Recap/Quiz/Note contract; source-heading desktop actions are covered separately.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await finishOriginalPage(2)
    const after = page.getByRole('complementary', { name: 'After Chapter One' })
    await after.waitFor()
    await after.getByRole('button', { name: 'Recap' }).click()
    await page.locator('[data-testid="lab-phone-card-body"]:visible').getByText('A grounded local fixture answer.', { exact: false }).waitFor()
    await page.getByText('Source · Original PDF pages 1–2').waitFor()
    const recapCall = calls.filter(call => call.path === '/api/chat').map(call => JSON.parse(call.body))
      .find(call => call.messages?.[0]?.content === 'Summarize Chapter One.')
    assert(recapCall, 'finished unit sends an actual Recap request')
    assert.deepEqual(recapCall.companion.context.pages, [
      { n: 1, text: 'Chapter One  First original page with selectable source words.' },
      { n: 2, text: 'Second original page has its own spoken words.' },
    ], 'Recap carries complete cited source pages 1 and 2, not only the current page')
    assert.equal(recapCall.companion.context.pageNumber, 2)
    for (let i = 0; i < 60 && !sets.cards.list.some(item => item.data?.action === 'recap' && item.data?.source?.to === 2); i++) await page.waitForTimeout(100)
    assert(sets.cards.list.some(item => item.data?.action === 'recap' && item.data?.source?.from === 1 && item.data?.source?.to === 2),
      'the account copy saves a multi-page source range')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await openNotebook()
    const recapEntry = page.locator('.pdf-original-reader__saved').filter({ hasText: 'Summarize Chapter One.' }).first()
    await recapEntry.getByText('Source · Original PDF pages 1–2').waitFor()
    await recapEntry.getByRole('button', { name: 'Original PDF page 2 · recap' }).click()
    await page.getByLabel('Follow up').fill('What links these two pages?')
    const followBefore = calls.filter(call => call.path === '/api/chat').length
    await page.getByTestId('lab-phone-card-send').click()
    await page.getByText('The first printed page leads into the second original page.').waitFor()
    const followCalls = calls.filter(call => call.path === '/api/chat').slice(followBefore).map(call => JSON.parse(call.body))
    assert.equal(followCalls.length, 1, 'one saved-card follow-up request')
    assert.deepEqual(followCalls[0].companion.context.pages, recapCall.companion.context.pages,
      'saved multi-page follow-up rehydrates the full exact cited source')
    assert.deepEqual(followCalls[0].messages.map(turn => turn.content), [
      'Summarize Chapter One.', 'A grounded local fixture answer.', 'What links these two pages?',
    ], 'follow-up retains ordered saved context without dropping the original answer')
    await page.keyboard.press('Escape')
    await finishOriginalPage(2)
    await after.getByRole('button', { name: 'Quiz me' }).click()
    await page.getByTestId('lab-phone-quiz-question').getByText('Which page has its own spoken words?').waitFor()
    const quizCall = calls.filter(call => call.path === '/api/chat').map(call => JSON.parse(call.body)).find(call => call.companion?.intent === 'quiz')
    assert.deepEqual(quizCall?.companion.context.pages, recapCall.companion.context.pages, 'unit Quiz uses both exact pages')
    await page.getByTestId('lab-phone-quiz-show').click()
    await page.getByTestId('lab-phone-quiz-next').click()
    for (let i = 0; i < 60 && !sets.cards.list.some(item => item.data?.action === 'quiz' && item.data?.source?.to === 2); i++) await page.waitForTimeout(100)
    assert(sets.cards.list.some(item => item.data?.action === 'quiz' && item.data?.source?.from === 1 && item.data?.source?.to === 2),
      'completed Quiz saves one complete-unit card')
    await page.keyboard.press('Escape')
    await after.getByRole('button', { name: 'Note' }).click()
    await page.getByLabel('Your note on this section').fill('A thought about both printed pages.')
    await page.getByRole('button', { name: 'Save note' }).click()
    // Save closes the phone editor; verify the durable note below and its visible Notebook round trip after reload.
    for (let i = 0; i < 60 && !sets.cards.list.some(item => item.data?.action === 'note' && item.data?.source?.to === 2); i++) await page.waitForTimeout(100)
    assert(sets.cards.list.some(item => item.data?.action === 'note' && item.data?.source?.from === 1 && item.data?.source?.to === 2),
      'after-unit Note saves the complete source range')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await openNotebook()
    for (const fragment of ['What links these two pages?', 'The first printed page leads into the second original page.',
      'Which page has its own spoken words?', 'A thought about both printed pages.'])
      await page.locator('.pdf-original-reader__notebook').getByText(fragment, { exact: false }).first().waitFor()
    assert((await page.locator('.pdf-original-reader__saved').filter({ hasText: 'Source · Original PDF pages 1–2' }).count()) >= 3,
      'Recap, Quiz and Note retain their complete page range after reload')
    await page.getByRole('button', { name: 'Close panel' }).click()
    // A saved card can predate a scan/recovery failure. The follow-up must
    // re-read every cited page before contacting a provider, never silently
    // treat the two surviving text pages as a complete three-page answer.
    const recap = sets.cards.list.find(item => item.data?.action === 'recap' && item.data?.source?.to === 2)
    assert(recap, 'a real saved Recap supplies the owned card shape')
    const missing = structuredClone(recap)
    missing.id = 'missingpagecard'
    missing.u = Date.now() + 10
    missing.data.unit.to = 3
    missing.data.source.to = 3
    missing.turns = [{ role: 'user', content: 'Summarize every page.' }, { role: 'assistant', content: 'Saved answer with missing page.' }]
    sets.cards.list.push(missing); sets.cards.rev++
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await openNotebook()
    const missingEntry = page.locator('.pdf-original-reader__saved').filter({ hasText: 'Saved answer with missing page.' })
    await missingEntry.getByRole('button', { name: 'Original PDF page 2 · recap' }).click()
    await page.getByLabel('Follow up').fill('What about the scanned page?')
    const missingBefore = calls.filter(call => call.path === '/api/chat').length
    await page.getByTestId('lab-phone-card-send').click()
    await page.getByText('The full source for this saved answer is unavailable. This follow-up was not sent.').waitFor()
    assert.equal(calls.filter(call => call.path === '/api/chat').length, missingBefore, 'missing cited page blocks provider call')
    assert.equal(missing.turns.length, 2, 'failed follow-up does not append an invented saved answer')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Next PDF page' }).click()
    await page.getByText('Page 3 of 4', { exact: true }).waitFor()
    assert.equal(await page.locator('.pdf-original__page[data-page="3"] .pdf-original__text span').count(), 0, 'scan remains viewable without invented prose')
    assert.deepEqual(errors, [], 'no uncaught reader error')
    assert.deepEqual(denied, [], 'no external request escaped the fixture')
    if (visual) await fs.rm(path.join(visual, 'pdf-original-failure.png'), { force: true })
    console.log(`${name}: routed PDF, full-page Recap/Quiz/Note, saved cited follow-up/Notebook, ${narrationSuccess ? 'page-follow and saved Talk turn' : 'audio and Talk token failures'}, speed and scan passed`)
  } catch (error) {
    if (visual) await page.screenshot({ path: path.join(visual, 'pdf-original-failure.png') }).catch(() => {})
    throw error
  } finally { await context.close(); await browser.close() }
}
try {
  if(process.env.PDF_FRESH_DISCOVERY==='1') {
    await run('chromium-fresh-discovery',chromium,false,freshDiscoveryBytes)
    if(process.env.PDF_ORIGINAL_WEBKIT==='1')await run('webkit-fresh-discovery',webkit,false,freshDiscoveryBytes)
  }
  else if (process.env.PDF_CONVERSION_PARITY === '1') { await run('chromium-conversion',chromium,false,conversionBytes); await run('chromium-conversion-scan',chromium,false,conversionScanBytes) }
  else if (process.env.PDF_SOURCE_PARITY === '1') await run('chromium-parity', chromium, false, parityBytes)
  else {
  await run('chromium', chromium)
  await run('chromium-success', chromium, true)
  await run('chromium-dense', chromium, false, denseBytes)
  if (process.env.PDF_ORIGINAL_WEBKIT === '1') {
    await run('webkit', webkit); await run('webkit-success', webkit, true)
    await run('webkit-dense', webkit, false, denseBytes)
  }
  }
} finally { await new Promise(resolve => server.close(resolve)) }
