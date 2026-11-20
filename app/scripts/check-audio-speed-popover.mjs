// Muted acceptance for the narration speed popover (4 Nov 2026).
//
// Production bug: in the desktop margin reader the popover was painted over
// the text but inherited `pointer-events: none` from the bottom chrome, so
// document.elementFromPoint over its control returned the book's word, the
// click went to the text and the outside-pointerdown handler closed it. Two-page
// view worked. This proves, in the margin and two-page views and on the phone,
// that every control of the popover is the topmost element at its own centre,
// that Faster and Slower change the speed the dock shows (and the root's
// data-audio-speed), that the popover stands over the speed button, and that
// Escape closes it and gives focus back to the button.
//
// READER_LIVE=1: the pages come from TINCT_ORIGIN (default https://tinct.app),
// optionally pinned to TINCT_EXPECTED_BUNDLE. Otherwise TINCT_DIST (default
// dist) is served locally. Either way narration is a local stand-in: the
// Worker's /api/narration/ensure is answered here from the repository's text
// and every clip is a silent WAV, so nothing is generated, nothing is spent and
// a guest's narration allowance never decides the result.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { build } from 'esbuild'
import { chromium } from '@playwright/test'
import { enforceReaderBundle } from './lib/readerParityAssertions.mjs'

const require = createRequire(import.meta.url)
const { markInternal } = require('./lib/internalTraffic.cjs')

const live = process.env.READER_LIVE === '1'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.ARTIFACT_DIR || 'artifacts/audio-speed-popover'

const bundled = await build({ stdin: { contents: "export { chunkNarrationText, narrationTextForParagraph, sha256Hex } from './src/narration/narrationCore'", resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', write: false })
const { chunkNarrationText, narrationTextForParagraph, sha256Hex } = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const edition = JSON.parse(await fs.readFile('public/data/editions/the-prince-original-en.json', 'utf8'))
function silentWav(seconds, rate = 8000) {
  const samples = Math.round(seconds * rate), data = samples * 2, wav = Buffer.alloc(44 + data)
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + data, 4); wav.write('WAVE', 8); wav.write('fmt ', 12)
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(rate, 24)
  wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(data, 40)
  return wav
}
async function localEnsure(body) {
  const chapter = edition.chapters.find(c => c.number === body.chapter)
  const paragraphs = await Promise.all((body.paragraphs || []).map(async item => {
    const text = chapter?.paragraphs[item.index]
    if (typeof text !== 'string') return { paragraph: item.index, status: 'failed', reason: 'unknown_paragraph' }
    const textHash = await sha256Hex(narrationTextForParagraph(text))
    const chunks = chunkNarrationText(text).map(c => ({ index: c.index, wordFrom: c.wordFrom, wordTo: c.wordTo, ready: true, hash: `speed-${body.chapter}-${item.index}-${c.index}`,
      url: `/api/audio-file?fixture=speed-popover&clip=${body.chapter}-${item.index}-${c.index}`, duration: 20, words: null }))
    return { paragraph: item.index, status: 'ready', textHash, chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: chunks.length * 20, source: 'cache' }
  }))
  return { bookId: body.bookId, editionKey: body.editionKey, chapter: body.chapter, voice: body.voice, model: 'fixture', mode: body.mode, paragraphs, generated: 0 }
}
async function standInNarration(page, origin) {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    // Clips may be asked for from the audio base (VITE_AUDIO_BASE_URL) rather than the page's origin.
    if (url.pathname === '/api/audio-file' && url.searchParams.get('fixture') === 'speed-popover') return route.fulfill({ status: 200, contentType: 'audio/wav', headers: { 'accept-ranges': 'bytes' }, body: silentWav(20) })
    if (url.origin !== origin) return route.continue()
    if (url.pathname === '/api/narration/voices') return route.fulfill({ json: { enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female', cacheIdentity: 'fixture' }] } })
    if (url.pathname === '/api/narration/ensure') return route.fulfill({ json: await localEnsure(route.request().postDataJSON()) })
    if (url.pathname === '/api/audio-file' && url.searchParams.get('fixture') === 'speed-popover') return route.fulfill({ status: 200, contentType: 'audio/wav', headers: { 'accept-ranges': 'bytes' }, body: silentWav(20) })
    if (url.pathname.startsWith('/api/audio-manifest')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    return live ? route.continue() : route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  })
}
await fs.mkdir(output, { recursive: true })

let server = null
let origin = (process.env.TINCT_ORIGIN || 'https://tinct.app').replace(/\/+$/, '')
if (!live) {
  const dist = path.resolve(process.env.TINCT_DIST || 'dist')
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.wav': 'audio/wav' }
  server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
    if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
    try {
      const body = await fs.readFile(file)
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(body)
    } catch { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}') }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${server.address().port}`
}

const BOOK = '/reader?book=the-prince&edition=original-en&chapter=6'
const cases = [
  { name: 'desktop-margin', view: 'margin', viewport: { width: 1440, height: 900 } },
  { name: 'desktop-two-page', view: 'two-page', viewport: { width: 1440, height: 900 } },
  { name: 'phone', view: null, viewport: { width: 390, height: 844 }, phone: true },
]

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'], ...(process.env.QA_CHROMIUM ? { executablePath: process.env.QA_CHROMIUM } : {}) }))
const results = []
try {
  for (const c of cases) {
    const context = await browser.newContext({ viewport: c.viewport, hasTouch: !!c.phone, isMobile: !!c.phone, serviceWorkers: 'block', reducedMotion: 'reduce' })
    const page = await context.newPage()
    page.setDefaultTimeout(30_000)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    if (live && expectedBundle) await page.route(`${origin}/reader*`, async route => { if (!(await enforceReaderBundle(route, expectedBundle))) await route.continue() })
    await standInNarration(page, origin)
    try {
      await page.goto(origin + BOOK + (c.view ? `&view=${c.view}` : ''), { waitUntil: 'domcontentloaded' })
      await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60_000 })
      if (c.view === 'margin') assert.equal(await page.getByTestId('lab-root').getAttribute('data-continuous-reader'), 'true', 'margin view is the continuous reader')
      await page.waitForTimeout(600)
      await page.getByTestId('lab-v2-play').click()
      const speedButton = page.getByTestId('lab-hearing-speed')
      await speedButton.waitFor()
      await speedButton.click()
      const popover = page.getByTestId('lab-audio-speed-popover')
      await popover.waitFor()
      await page.waitForTimeout(250)

      // Every control is what a pointer at its centre reaches.
      const hits = await page.evaluate(() => {
        const pop = document.querySelector('[data-testid="lab-audio-speed-popover"]')
        return ['lab-audio-speed-slower', 'lab-audio-speed-value', 'lab-audio-speed-faster'].map(id => {
          const el = document.querySelector(`[data-testid="${id}"]`), r = el.getBoundingClientRect()
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          return { id, inside: !!hit && pop.contains(hit), control: !!hit && el.contains(hit), hit: hit ? `${hit.tagName}#${hit.id}.${String(hit.className).slice(0, 40)}` : null }
        })
      })
      for (const hit of hits) assert.ok(hit.inside && hit.control, `${c.name}: elementFromPoint at ${hit.id}'s centre must be that control, got ${hit.hit}`)

      // It stands over the speed button that opened it.
      const [pop, button] = [await popover.boundingBox(), await speedButton.boundingBox()]
      const centre = button.x + button.width / 2
      assert.ok(pop.y + pop.height <= button.y + 1, `${c.name}: popover sits above the speed button ${JSON.stringify({ pop, button })}`)
      assert.ok(centre >= pop.x && centre <= pop.x + pop.width, `${c.name}: popover spans the speed button's centre`)

      // A real click changes the speed and keeps the popover open.
      const value = page.getByTestId('lab-audio-speed-value')
      const before = await value.textContent()
      await page.getByTestId('lab-audio-speed-faster').click()
      await page.waitForFunction(b => document.querySelector('[data-testid="lab-audio-speed-value"]')?.textContent !== b, before, { timeout: 5000 })
      const after = await value.textContent()
      assert.equal(Number.parseFloat(after), Number.parseFloat(before) + 0.25, `${c.name}: Faster steps 0.25 (${before} → ${after})`)
      assert.equal(await speedButton.textContent(), after, `${c.name}: the dock shows the new speed`)
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-audio-speed'), String(Number.parseFloat(after)), `${c.name}: the reader's speed follows`)
      assert.ok(await popover.isVisible(), `${c.name}: the popover stays open after a click on its control`)
      await page.getByTestId('lab-audio-speed-slower').click()
      await page.waitForFunction(b => document.querySelector('[data-testid="lab-audio-speed-value"]')?.textContent === b, before, { timeout: 5000 })
      await page.screenshot({ path: `${output}/${c.name}.png` })

      await page.keyboard.press('Escape')
      await popover.waitFor({ state: 'detached', timeout: 5000 })
      assert.ok(await speedButton.evaluate(el => document.activeElement === el), `${c.name}: Escape returns focus to the speed button`)
      assert.deepEqual(errors, [], `${c.name}: no page errors`)
      results.push({ case: c.name, ok: true, hits: hits.map(h => h.id), before, after })
      console.log(`ok ${c.name}: controls on top, ${before} → ${after} → ${before}, Escape closes`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
  server?.close()
  await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
}
