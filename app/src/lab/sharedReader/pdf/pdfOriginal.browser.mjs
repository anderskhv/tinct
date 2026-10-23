// Run against a local Vite server only: node src/lab/sharedReader/pdf/pdfOriginal.browser.mjs
import assert from 'node:assert/strict'
import { chromium, webkit } from '@playwright/test'
import { createServer } from 'vite'
import { makePdf } from '../../../../../addbooks/web/test/make-pdf.mjs'

const vite = process.env.TINCT_ORIGIN ? null : await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/public/**', '**/data/**'] } }, logLevel: 'error' })
if (vite) await vite.listen()
const origin = process.env.TINCT_ORIGIN || vite.resolvedUrls.local[0].replace(/\/$/, '')
if (!['127.0.0.1', 'localhost', '::1'].includes(new URL(origin).hostname)) throw new Error('PDF browser test requires a local Vite origin')
const fixture = makePdf({ pages: [
  { lines: [{ x: 72, y: 700, size: 24, text: 'Original selectable words' }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
] }).toString('base64')

try { for (const [name, browserType] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await browserType.launch({ headless: true, args: name === 'chromium' ? ['--mute-audio', '--no-sandbox'] : [] })
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 900, height: 700 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.origin === origin && !url.pathname.startsWith('/api/') ? route.continue() : route.abort()
  })
  await page.addInitScript(value => { window.__pdfFixture = value }, fixture)
  try {
    await page.goto(`${origin}/src/lab/sharedReader/pdf/pdfOriginal.browser.html`, { waitUntil: 'domcontentloaded' })
    const layer = page.locator('.pdf-original__text')
    await layer.getByText('Original selectable words').waitFor({ timeout: 30000 })
    assert.equal(await page.locator('canvas').count(), 1)
    assert.deepEqual(await page.locator('canvas').evaluate(el => [el.width > 0, el.height > 0]), [true, true])
    await layer.getByText('Original selectable words').evaluate(el => {
      const selection = window.getSelection(), range = document.createRange()
      range.selectNodeContents(el)
      selection.removeAllRanges()
      selection.addRange(range)
      el.parentElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })
    await page.waitForFunction(() => window.__selectedPdf?.length === 1)
    const selected = await page.evaluate(() => window.__selectedPdf[0])
    assert.equal(selected.page, 1)
    assert.match(selected.text, /Original selectable words/)
    assert.ok(selected.rects.length && selected.rects.every(([, x, y, w, h]) => x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 1 && y + h <= 1), 'selected text has page-fraction geometry')
    const scroller = page.locator('.pdf-original__scroll')
    await scroller.evaluate(el => { el.scrollTop = 180; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
    const fraction = await page.evaluate(() => JSON.parse(sessionStorage.getItem('pdf-place') || '{}').frac)
    assert.ok(fraction > 0 && fraction < 1)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await layer.getByText('Original selectable words').waitFor()
    assert.ok(Math.abs(await scroller.evaluate(el => el.scrollTop) - 180) <= 1, 'reload restores original page fraction')
    await page.getByRole('button', { name: 'Next PDF page' }).click()
    await page.getByText('Page 2 of 2').waitFor()
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('pdf-place') || '{}').page === 2)
    assert.equal(await layer.locator('span').count(), 0, 'the scanned page has no invented text')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('Page 2 of 2').waitFor()
    assert.equal(await page.locator('canvas').count(), 1, 'reload keeps a bounded canvas')
    assert.deepEqual(errors, [])
    process.stdout.write(`${name}: real PDF text selection, scan page, and reload passed\n`)
  } finally { await browser.close() }
} } finally { await vite?.close() }
