// Isolated genuine PDF selection regression, including native mouse dragging.
import assert from 'node:assert/strict'
import { chromium, webkit } from '@playwright/test'
import { createServer } from 'vite'
import { makePdf } from '../../../../../addbooks/web/test/make-pdf.mjs'

const vite = await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/public/**', '**/data/**'] } }, logLevel: 'error' })
await vite.listen()
const origin = vite.resolvedUrls.local[0].replace(/\/$/, '')
const fixture = makePdf({ pages: [
  { size: [400, 400], lines: [
    { x: 45, y: 340, size: 18, text: 'A source heading' },
    { x: 45, y: 290, size: 14, text: 'Beginning words of a paragraph' },
    { x: 45, y: 265, size: 14, text: 'Second line with justified words' },
    { x: 45, y: 240, size: 14, text: 'Last words on the first page' },
  ] },
  { size: [400, 400], lines: [
    { x: 45, y: 340, size: 18, text: 'Another source heading' },
    { x: 45, y: 290, size: 14, text: 'Finishing words on the second page' },
    { x: 45, y: 265, size: 14, text: 'A final unselected line' },
  ] },
] }).toString('base64')
try {
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await engine.launch({ headless: true, args: name === 'chromium' ? ['--mute-audio', '--no-sandbox'] : [] })
    try {
      const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, serviceWorkers: 'block' })
      await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort())
      await page.addInitScript(value => { window.__pdfFixture = value }, fixture)
      await page.goto(`${origin}/src/lab/sharedReader/pdf/pdfOriginal.browser.html?continuous`, { waitUntil: 'domcontentloaded' })
      await page.getByText('Finishing words on the second page', { exact: true }).waitFor()
      // Make both source pages visible without introducing artificial text DOM.
      await page.addStyleTag({ content: '#app{width:420px;height:1150px}.pdf-original__pages{width:100%!important}.pdf-original__scroll{margin:0!important;padding-bottom:0!important}' })
      const point = async (text, offset) => page.getByText(text, { exact: true }).evaluate((el, at) => {
        const range = document.createRange(); range.setStart(el.firstChild, at); range.setEnd(el.firstChild, at + 1)
        const box = range.getBoundingClientRect(); return { x: box.left + 1, y: box.top + box.height / 2 }
      }, offset)
      const drag = async (start, end) => {
        await page.evaluate(() => { window.getSelection().removeAllRanges(); window.__selectedPdf = [] })
        await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(end.x, end.y, { steps: 18 }); await page.mouse.up()
        await page.waitForFunction(() => window.__selectedPdf.length > 0)
        await page.waitForFunction(() => document.querySelectorAll('.pdf-original__selection i').length > 0)
        return page.evaluate(() => ({ saved: window.__selectedPdf.at(-1), paint: [...document.querySelectorAll('.pdf-original__selection i')].map(el => {
          const box = el.getBoundingClientRect(), sheet = el.closest('.pdf-original__page').getBoundingClientRect()
          return { x: (box.left - sheet.left) / sheet.width, y: (box.top - sheet.top) / sheet.height, w: box.width / sheet.width, h: box.height / sheet.height }
        }) }))
      }
      const a = await point('A source heading', 0), b = await point('Second line with justified words', 30)
      const forward = await drag(a, b)
      assert.match(forward.saved.text, /A source heading Beginning words of a paragraph Second line/)
      assert.ok(forward.paint.length >= 3)
      assert.ok(forward.paint.every(rect => rect.x > .08 && rect.w < .85 && rect.y > .08 && rect.h < .08), 'no page-wide or blank-margin selection paint')
      const reverse = await drag(b, a)
      assert.equal(reverse.saved.text, forward.saved.text, 'native backwards drag preserves source reading order')
      const c = await point('Last words on the first page', 0), d = await point('Finishing words on the second page', 14)
      const crossing = await drag(c, d)
      assert.deepEqual(crossing.saved.pages.map(part => part.n), [1, 2])
      assert.ok(crossing.saved.rects.every(([, x, y, w, h]) => x > .08 && w < .85 && y > .08 && h < .08), 'saved cross-page boxes contain source text only')
      assert.equal(await page.locator('.pdf-original__text').first().evaluate(el => getComputedStyle(el, '::selection').backgroundColor), 'rgba(0, 0, 0, 0)')
      await page.evaluate(() => window.getSelection().removeAllRanges())
      await page.waitForFunction(() => !document.querySelector('.pdf-original__selection'))
      process.stdout.write(`${name}: heading, multiline forward/backward and cross-page native drag use ink-only live/saved geometry\n`)
    } finally { await browser.close() }
  }
} finally { await vite.close() }
