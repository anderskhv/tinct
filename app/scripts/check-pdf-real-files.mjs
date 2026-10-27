// Actual file picker and supplied PDF bytes; synthetic account/API and AI.
// Does not prove production storage durability or provider answer quality.
// Routed private PDF Original reader against a local built app. Every API and
// media response is synthetic; unexpected hosts and endpoints fail closed.
// PDF_REAL_ACTIONS=1 PDF_REAL_ENGINE=webkit node scripts/check-pdf-real-files.mjs <local PDFs>
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit, expect } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { settlePaint, enforceReaderBundle } from './lib/readerParityAssertions.mjs'

const dist = path.resolve(process.env.PDF_ORIGINAL_DIST || 'dist')
const fileId = 'd'.repeat(32), owner = 'pdf-original-fixture-owner'
const bundle = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const ref = bundle && /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(await fs.readFile(path.join(dist, 'assets', bundle), 'utf8'))?.[1]
assert(ref, 'built reader must include a synthetic Supabase project reference')
const authKey = `sb-${ref}-auth-token`
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }[path.extname(file)] || 'application/octet-stream')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (url.pathname === '/qa-seed') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><meta charset="utf-8"><title>PDF owner fixture</title>'); return }
  if (url.pathname === '/lab/addbook/' && url.searchParams.has('userBook')) { res.writeHead(308, { Location: '/reader' + url.search }); res.end(); return }
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const body = await fs.readFile(file); res.writeHead(200, { 'Content-Type': mime(file) }); res.end(body) }
  catch { res.writeHead(404); res.end() }
})
server.on('connect', (_req, socket) => socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'))
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''

async function run(name, browserType, filePath, samplePages, primerPage, expectedRegions = {}) {
  const bytes = await fs.readFile(filePath), sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
  const pendingUpload = true
  let accountUploaded = !pendingUpload
  const book = { id: fileId, type: 'pdf', sha256, name: path.basename(filePath), title: '', author: '', size: bytes.length,
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
  // Let the synthetic account acknowledge the position before replacing its
  // document. WebKit reports intercepted keepalive fetches aborted by reload
  // as page errors even when the application's fetch rejection is caught.
  // This also verifies durable position sync instead of masking those errors.
  const reloadSavedPage = async () => {
    await page.waitForFunction(hex => {
      const kept = JSON.parse(localStorage.getItem(`tinct-addbook:pos:pdf:${hex}`) || 'null')
      return !kept?.at || kept.savedAt === kept.at
    }, hex, { timeout: 15000 })
    await page.reload({ waitUntil: 'domcontentloaded' })
  }
  const narrationSuccess = false, narrationReady = false
  const visual = process.env.PDF_VISUAL_OUTPUT && name === 'chromium' ? path.resolve(process.env.PDF_VISUAL_OUTPUT) : null
  if (visual) await fs.mkdir(visual, { recursive: true })
  const places = {}
  const sets = { marks: { list: [], rev: 0 }, cards: { list: [], rev: 0 } }
  page.on('pageerror', error => { console.log(`${name}: page error at ${page.url()}: ${error.message}`); errors.push(error.stack || error.message) })
  page.on('requestfailed', request => console.log(`${name}: failed ${request.method()} ${request.url()}: ${request.failure()?.errorText}`))
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 1200)) })
  // Position writes use keepalive on reload. Keep their synthetic API handler
  // on the context so it survives the outgoing document, including in WebKit.
  await context.route(url => url.hostname.endsWith('.supabase.co') || url.origin !== origin || url.pathname.startsWith('/api/'), async route => {
    const request = route.request(), url = new URL(request.url()), p = url.pathname
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.hostname.endsWith('.supabase.co')) {
      if (p === '/auth/v1/user') return json(200, { id: owner, email: 'pdf@example.test', aud: 'authenticated' })
      if (p.startsWith('/rest/v1/')) return json(200, [])
      return json(404, {})
    }
    if (url.origin !== origin) { denied.push(url.origin); return route.abort() }
    if (p === '/qa-seed') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><title>Synthetic private source fixture</title>' })
    if (await enforceReaderBundle(route, expectedBundle)) return
    if (!p.startsWith('/api/')) return route.continue()
    calls.push({ path: p, method: request.method(), body: request.postData() || '', bearer: request.headers().authorization?.startsWith('Bearer ') ?? false })
    if (p === '/api/public-books') return json(200, { books: [] })
    if (p === '/api/user-books') {
      if (request.method() === 'POST') {
        assert.equal(createHash('sha256').update(request.postDataBuffer()).digest('hex'), sha256, 'account copy preserves original PDF bytes')
        accountUploaded = true
        return json(201, {book})
      }
      return json(200, { books: accountUploaded ? [book] : [] })
    }
    if (p === '/api/user-books/places') return json(200, { places })
    if (p === `/api/user-books/places/${hex}` && request.method() === 'PUT') {
      const sent = request.postDataJSON(), current = places[hex]
      if ((current?.rev ?? 0) !== sent.rev) return json(409, { place: current ?? null })
      places[hex] = { ...sent.place, rev: sent.rev + 1 }
      return json(200, { place: places[hex] })
    }
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
      if (messages?.at(-1)?.content === 'What links these two pages?') await new Promise(resolve => setTimeout(resolve, 1000))
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
  if(process.env.PDF_REGION_DEBUG) await page.addInitScript(()=>{
    let regions
    Object.defineProperty(window,'TinctPdfRegions',{configurable:true,get:()=>regions,set:value=>{
      const find=value.find
      value.find=(input,margin)=>{const result=find(input,margin);window.__pdfRegionDebug.push({stage:'regions',input:{...input,ink:Array.from(input.ink)},result});return result}
      regions=value
    }})
    let api
    window.__pdfRegionDebug=[]
    Object.defineProperty(window,'TinctMargin',{configurable:true,get:()=>api,set:value=>{
      const find=value.findFigures
      value.findFigures=(input)=>{const result=find(input);window.__pdfRegionDebug.push({input:{...input,ink:Array.from(input.ink)},result});return result}
      api=value
    }})
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
  const output = path.resolve(process.env.PDF_REAL_OUTPUT || '/tmp/tinct-pdf-real-files', path.basename(filePath, '.pdf').replace(/[^a-z0-9-]/gi, '_'), name)
  await fs.mkdir(output, { recursive: true })
  try {
    await page.goto(`${origin}/qa-seed`)
    await page.addScriptTag({url:origin+'/lab/wait-ring.js'})
    await page.addStyleTag({url:origin+'/lab/tinct-ui.css'})
    await page.evaluate(async () => {
      document.documentElement.classList.add('signed-in')
      const { openFileDialog } = await import('/lab/library_2/add-to-tinct.js')
      openFileDialog()
    })
    console.log(name, path.basename(filePath), 'selecting file')
    await page.locator('input[type=file]').setInputFiles(filePath)
    const rights = page.locator('.own-file-rights-box')
    await rights.waitFor({ timeout: 30000 })
    await rights.check()
    await page.locator('.own-file-continue').click()
    await page.waitForURL('**/reader?**', { timeout: 45000, waitUntil: 'domcontentloaded' })
    console.log(name, path.basename(filePath), 'reader opened')
    await page.locator('.pdf-original__page canvas').first().waitFor({ timeout: 120000 })
    await settlePaint(page)
    // Let the actual local title/chapter scan finish; opening a canvas alone is not acceptance.
    await expect.poll(() => page.evaluate(async hex => {
      const db=await new Promise(resolve=>{const r=indexedDB.open('tinct-addbook',1);r.onsuccess=()=>resolve(r.result)})
      const scan=await new Promise(resolve=>{const r=db.transaction('books').objectStore('books').get(`pdf:${hex}`);r.onsuccess=()=>resolve(r.result?.scan)})
      db.close();return !!scan
    },hex), {timeout:30000}).toBe(true)
    await page.screenshot({path:path.join(output,'opened.png')})
    assert(accountUploaded, 'actual selected file must pass byte-exact simulated upload')
    const samples=[]
    for(const number of samplePages) {
      await page.locator('.pdf-original__scroll').evaluate((host,n)=>{const slot=host.querySelector(`.pdf-original__slot[data-page="${n}"]`);if(!slot)throw Error('Missing source page');host.scrollTop=slot.offsetTop},number)
      const sheet=page.locator(`.pdf-original__page[data-page="${number}"][data-ready="true"]`)
      await sheet.waitFor({timeout:45000});await settlePaint(page)
      // Allow asynchronous region detection to settle independently of canvas paint.
      await page.waitForTimeout(500)
      const sample=await sheet.evaluate(node=>({page:Number(node.dataset.page),text:node.querySelector('.pdf-original__text')?.textContent?.slice(0,200),figures:[...node.querySelectorAll('[data-testid="pdf-figure-source"]')].map(n=>n.getAttribute('aria-label')),headings:[...node.querySelectorAll('[data-testid="pdf-heading-actions"]')].map(n=>n.getAttribute('aria-label'))}))
      for(const label of expectedRegions[number] || []) assert(sample.figures.some(name=>name.includes(label)),`page ${number} must expose ${label} actions`)
      samples.push(sample)
      await page.screenshot({path:path.join(output,`page-${number}.png`)})
    }
    if (process.env.PDF_REAL_ACTIONS === '1') {
      // Exercise native selection over the actual PDF text layer, not seeded marks.
      const selectable=page.locator(`.pdf-original__page[data-page="${samplePages.at(-1)}"][data-ready="true"] .pdf-original__text span`).filter({hasText:/[A-Za-z]{4}/})
      // PDF item order can put the chart title before the prose above it.
      // Select the uppermost source line, including scans whose OCR spans are short.
      const targetIndex=await selectable.evaluateAll(nodes=>nodes.map((node,index)=>({index,node,box:node.getBoundingClientRect()}))
        .filter(({node})=>node.textContent.length>20 && !node.hasAttribute('data-pdf-heading'))
        .sort((a,b)=>a.box.top-b.box.top || a.box.left-b.box.left)[0]?.index ?? -1)
      assert(targetIndex>=0,'sample page must expose selectable source text')
      const target=selectable.nth(targetIndex)
      await target.scrollIntoViewIfNeeded();await settlePaint(page)
      const drag=await target.evaluate(node=>{
        const text=node.firstChild,range=document.createRange()
        range.setStart(text,0);range.setEnd(text,Math.min(15,text.textContent.length))
        const r=range.getBoundingClientRect()
        return {x:r.left+1,y:r.top+r.height/2,end:r.right-1,transform:node.style.transform}
      })
      await page.mouse.move(drag.x,drag.y);await page.mouse.down()
      await page.mouse.move(drag.end,drag.y,{steps:15});await page.mouse.up()
      await expect(page.getByTestId('lab-dbar-highlight')).toBeVisible()
      await page.getByTestId('lab-dbar-highlight').click()
      await expect.poll(()=>sets.marks.list.length,{timeout:15000}).toBeGreaterThan(0)
      await page.screenshot({path:path.join(output,'native-highlight.png')})
      await page.getByTestId('lab-super').click()
      await page.getByText('Summarize', {exact:true}).click()
      await expect(page.getByText('A grounded local fixture answer.',{exact:false})).toBeVisible({timeout:45000})
      const summary = calls.filter(c=>c.path==='/api/chat').map(c=>JSON.parse(c.body)).at(-1)
      await expect.poll(()=>sets.cards.list.length,{timeout:15000}).toBeGreaterThan(0)
      const source=sets.cards.list.at(-1)?.data?.unit
      assert(source,'summary must retain its chapter source')
      assert.deepEqual(summary.companion.document.units.map(p=>p.n),Array.from({length:source.to-source.from+1},(_,i)=>source.from+i),'summary includes its whole chapter, including chapters longer than twenty pages')
      const follow=page.getByPlaceholder('Ask a follow-up')
      await follow.fill('What links these two pages?');await follow.press('Enter')
      await expect(page.getByText('What links these two pages?',{exact:false})).toBeVisible()
      await expect(page.getByTestId('lab-phone-card-wait')).toBeVisible()
      await page.screenshot({path:path.join(output,'followup-pending.png')})
      await expect(page.getByText('The first printed page leads into the second original page.',{exact:false})).toBeVisible()
      await page.screenshot({path:path.join(output,'followup-complete.png')})
      await page.keyboard.press('Escape')
      const figure=page.getByTestId('pdf-figure-source').first()
      if(await figure.count()) {
        await figure.focus()
        const toolbar=page.getByRole('toolbar').filter({has:page.getByRole('button',{name:'View',exact:true})})
        await toolbar.getByRole('button',{name:'View',exact:true}).click()
        await expect(page.getByRole('dialog').locator('img')).toBeVisible()
        await page.screenshot({path:path.join(output,'figure-open.png')})
        await page.getByRole('button',{name:'Close figure',exact:true}).click()
        await figure.focus();await toolbar.getByRole('button',{name:'Explain',exact:true}).click()
        await expect(page.getByText('A grounded local fixture answer.').last()).toBeVisible()
        const figureRequest=JSON.parse(calls.filter(c=>c.path==='/api/chat').at(-1).body)
        assert(figureRequest.messages.some(m=>Array.isArray(m.content)&&m.content.some(b=>b.type==='image')),'figure explanation sends its actual pixels')
        assert.equal(await page.locator('.pdf-original__figure-thumb').count(),0,'answer does not quote the figure again')
        await page.keyboard.press('Escape')
      }
      if(primerPage) {
        await page.locator('.pdf-original__scroll').evaluate((host,n)=>{host.scrollTop=host.querySelector(`.pdf-original__slot[data-page="${n}"]`).offsetTop},primerPage)
        const sheet=page.locator(`.pdf-original__page[data-page="${primerPage}"][data-ready="true"]`)
        await sheet.waitFor({timeout:30000})
        const primer=sheet.getByRole('button',{name:'Primer',exact:true}).first()
        await primer.focus();await expect(primer).toBeVisible()
        await page.screenshot({path:path.join(output,'primer-pills.png')})
        await primer.click()
        await expect(page.getByTestId('pdf-original-primer')).toBeVisible({timeout:30000})
        await page.screenshot({path:path.join(output,'primer-answer.png')})
        await page.keyboard.press('Escape')
      }
      await page.getByTestId('lab-super').click()
      const chatsBeforeCatchup=calls.filter(c=>c.path==='/api/chat').length
      await page.getByTestId('lab-super-row-catchup').click()
      await expect.poll(()=>calls.filter(c=>c.path==='/api/chat').length,{timeout:45000}).toBeGreaterThan(chatsBeforeCatchup)
      await expect(page.getByText('A grounded local fixture answer.',{exact:false}).last()).toBeVisible({timeout:45000})
      const catchupRequest=JSON.parse(calls.filter(c=>c.path==='/api/chat').at(-1).body)
      const atPage=catchupRequest.companion.context.pageNumber
      assert.deepEqual(catchupRequest.companion.document.units.map(p=>p.n),Array.from({length:atPage-1},(_,i)=>i+1),'catch-up covers all completed pages and sends no future pages')
      await page.screenshot({path:path.join(output,'catchup-answer.png')})
      await page.keyboard.press('Escape')
      await reloadSavedPage()
      await page.locator('.pdf-original__page canvas').first().waitFor({timeout:45000})
      await expect.poll(()=>sets.cards.list.length).toBeGreaterThan(0)
      assert(sets.marks.list.length>0,'native highlight remains in simulated account after reload')
    }
    await fs.writeFile(path.join(output,'samples.json'),JSON.stringify(samples,null,2))
    if(process.env.PDF_REGION_DEBUG) await fs.writeFile(path.join(output,'region-debug.json'),JSON.stringify(await page.evaluate(()=>window.__pdfRegionDebug)))
    const inventory = await page.evaluate(async hex => {
      const db=await new Promise(resolve=>{const r=indexedDB.open('tinct-addbook',1);r.onsuccess=()=>resolve(r.result)})
      const item=await new Promise(resolve=>{const r=db.transaction('books').objectStore('books').get(`pdf:${hex}`);r.onsuccess=()=>resolve(r.result)})
      db.close()
      return {title:item?.title,name:item?.name,scan:item?.scan,pages:document.querySelectorAll('.pdf-original__slot').length}
    },hex)
    await fs.writeFile(path.join(output,'inspection.json'),JSON.stringify({inventory,calls,errors,denied},null,2))
    assert.deepEqual(errors,[], 'no reader exceptions')
    assert.deepEqual(denied,[], 'no unexpected external traffic')
    console.log(JSON.stringify({file:path.basename(filePath),engine:name,uploaded:accountUploaded,title:inventory.title,pages:inventory.pages,errors,denied}))
  } catch(error) {
    await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{})
    await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({message:String(error),url:page.url(),cardHTML:await page.locator('.pdf-original-reader__thread').evaluateAll(nodes=>nodes.map(n=>n.outerHTML)).catch(()=>[]),body:await page.locator('body').innerText().catch(()=>''),calls,errors,consoleErrors,denied},null,2))
    throw error
  } finally {await context.close();await browser.close()}
}
try {
  const files=process.argv.slice(2)
  assert(files.length,'Supply local PDF paths; this harness never downloads user documents.')
  const samples=JSON.parse(process.env.PDF_REAL_SAMPLE_PAGES || '[]')
  const primers=JSON.parse(process.env.PDF_REAL_PRIMER_PAGES || '[]')
  const expectedRegions=JSON.parse(process.env.PDF_REAL_EXPECT_REGIONS || '[]')
  for(const [index,file] of files.entries()) {
    try {const engine=process.env.PDF_REAL_ENGINE || 'chromium';await run(engine,engine==='webkit'?webkit:chromium,file,samples[index] || [1,2,3],primers[index],expectedRegions[index])} catch(error) {console.error(path.basename(file),String(error));process.exitCode=1}
  }
} finally {server.close()}
