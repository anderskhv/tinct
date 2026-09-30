import { chromium, webkit } from '@playwright/test'
import { build } from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const live = process.env.READER_LIVE === '1', origin = 'https://tinct.app'
const output = 'artifacts/book-transition'
await fs.mkdir(output, { recursive: true })
const bundled = await build({ stdin: { contents: "export { chunkNarrationText, narrationTextForParagraph, sha256Hex } from './src/narration/narrationCore'", resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', write: false })
const { chunkNarrationText, narrationTextForParagraph, sha256Hex } = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const edition = JSON.parse(await fs.readFile('public/data/editions/bible-web-en.json', 'utf8'))
const outgoing = edition.chapters.find(c => c.title === 'Ezra 10')
const incoming = edition.chapters.find(c => c.title === 'Nehemiah 1')
const cueText = 'You have completed Ezra. Next book: Nehemiah.'
const results = []
for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
 const browser = await type.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) })
 try { for (const phone of [false, true]) {
  const label = engine + (phone ? '-phone' : '-desktop')
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, serviceWorkers: 'block' })
  const page = await context.newPage(), calls = [], errors = []
  page.on('pageerror', e => errors.push(e.message))
  await context.tracing.start({ screenshots: true, snapshots: true })
  try {
   await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.pathname === '/api/narration/voices') return route.fulfill({ json: { enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female', cacheIdentity: 'fixture' }] } })
    if (url.pathname === '/api/narration/ensure') {
     const body = req.postDataJSON(); calls.push(body)
     assert.equal(body.bookId, 'bible'); assert.equal(body.editionKey, 'web-en')
     assert(calls.length < 100, 'bounded mocked preparation')
     if (body.kind) { assert.equal(body.kind, 'book-transition'); assert.equal(body.chapter, outgoing.number); assert.equal(body.nextChapter, incoming.number) }
     const chapter = edition.chapters.find(c => c.number === body.chapter)
     const paragraphs = await Promise.all(body.paragraphs.map(async item => {
      const text = body.kind ? cueText : chapter.paragraphs[item.index]
      if (!text) return { paragraph: item.index, status: 'failed', reason: 'unknown_paragraph' }
      const textHash = await sha256Hex(narrationTextForParagraph(text))
      if (item.textHash) assert.equal(item.textHash, textHash)
      const chunks = chunkNarrationText(text).map(c => ({ ...c, ready: true, duration: 4,
       url: '/api/audio-file?fixture=' + (body.kind ? 'cue' : body.chapter + '-' + item.index) + '-' + c.index,
       words: null }))
      return { paragraph: item.index, status: 'ready', textHash, chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: chunks.length * 4 }
     }))
     return route.fulfill({ json: { paragraphs, generated: 0 } })
    }
    // No provider, private account or audible media requests can leave this context.
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, body: '{}' })
    if (req.method() !== 'GET' || url.origin !== origin) return route.abort()
    if (!live) {
     const file = path.resolve('dist', '.' + (['/reader'].includes(url.pathname) ? '/app.html' : url.pathname))
     if (file.startsWith(path.resolve('dist') + '/')) {
      try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
     }
     return route.abort()
    }
    return route.continue()
   })
   await page.addInitScript(({ chapter, paragraph }) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'web-en', theme: 'light', voicePersona: 'female' }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'web-en', savedPlace: { bookId: 'bible', chapterNumber: chapter, paragraphIndex: paragraph, wordIndex: 0, page: 0 } }))
    window.__audioCreates = 0; window.__played = []
    class SilentAudio extends EventTarget {
     src = ''; currentTime = 0; duration = 4; paused = true; ended = false; playbackRate = 1; autoplay = false; muted = true
     constructor() { super(); window.__audioCreates++; window.__audio = this }
     play() { this.paused = false; this.ended = false; window.__played.push(this.src); queueMicrotask(() => this.dispatchEvent(new Event('playing'))); return Promise.resolve() }
     pause() { this.paused = true }
     load() {}
     setAttribute() {}
     removeAttribute(name) { if (name === 'src') this.src = '' }
    }
    window.Audio = SilentAudio
    window.__finish = () => { const a = window.__audio; a.currentTime = 4; a.ended = true; a.dispatchEvent(new Event('ended')) }
    HTMLMediaElement.prototype.play = async function () { this.muted = true; throw Error('Unexpected native audio') }
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw Error('Microphone disabled') }
   }, { chapter: outgoing.number, paragraph: outgoing.paragraphs.length - 1 })
   await page.goto(origin + '/reader?chrome=v2', { waitUntil: 'domcontentloaded' })
   await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
   await page.evaluate(() => document.fonts.ready)
   if (live && process.env.TINCT_EXPECTED_BUNDLE) assert((await page.content()).includes(process.env.TINCT_EXPECTED_BUNDLE))
   assert.equal(calls.length, 0, 'Silent reading never prepares a cue')
   await page.getByTestId('lab-v2-play').click()
   await page.waitForFunction(() => window.__played.length > 0)
   for (let i = 0; i < 80; i++) {
    if (await page.evaluate(() => window.__audio.src.includes('fixture=cue'))) break
    await page.evaluate(() => window.__finish())
    await page.waitForTimeout(100)
   }
   await page.waitForFunction(() => window.__audio.src.includes('fixture=cue'))
   assert.equal(await page.locator('.lab').getAttribute('data-chapter'), String(outgoing.number), 'Cue precedes chapter navigation')
   assert.equal(await page.evaluate(() => window.__audioCreates), 1, 'One audio session through cue and chapter')
   assert.equal(await page.locator('.lab-hearing-word.is-current').count(), 0, 'Announcement paints no source word')
   const during = await page.locator('.lab').getAttribute('data-place')
   assert(Number(during.split(':')[0]) < outgoing.paragraphs.length, 'No synthetic reading position')
   await page.screenshot({ path: output + '/' + label + '-cue.png' })
   await page.evaluate(() => window.__finish())
   await page.waitForFunction(ch => document.querySelector('.lab')?.dataset.chapter === String(ch) && window.__audio?.src.includes('fixture=' + ch + '-'), incoming.number, { timeout: 30000 })
   assert.equal(await page.getByTestId('lab-chapter-cover').count(), 0, 'Incoming book text is visible while listening')
   assert.equal(await page.evaluate(() => window.__audioCreates), 1)
   assert.deepEqual(errors, [])
   await page.screenshot({ path: output + '/' + label + '-next-book.png' })
   results.push({ label, passed: true, announcement: cueText, nextChapter: incoming.number,
    requests: calls.length, played: await page.evaluate(() => window.__played), generated: 0 })
   console.log('BOOK_TRANSITION ' + JSON.stringify(results.at(-1)))
   await context.tracing.stop()
  } catch (error) {
   await page.screenshot({ path: output + '/' + label + '-failure.png' }).catch(() => {})
   await context.tracing.stop({ path: output + '/' + label + '-trace.zip' }).catch(() => {})
   console.log('BOOK_TRANSITION_FAILURE ' + JSON.stringify({ label, errors, calls, state: await page.evaluate(() => ({ chapter: document.querySelector('.lab')?.dataset.chapter, place: document.querySelector('.lab')?.dataset.place, played: window.__played, text: document.body.innerText.slice(-1200) })) }))
   throw error
  } finally { await context.close() }
 } } finally { await browser.close() }
}
await fs.writeFile(output + '/report.json', JSON.stringify({ live, results, generated: 0, limits: 'Mocked narration and silent player; no real-provider or private-account claim.' }, null, 2))
