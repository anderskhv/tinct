// Isolated, muted visual acceptance for the wider margin reader and quiet header.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { enforceReaderBundle } from './lib/readerParityAssertions.mjs'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = process.env.TINCT_ORIGIN || `http://127.0.0.1:${server.address().port}`
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_REFINEMENT_OUTPUT || '/tmp/tinct-margin-refinements'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const results = []
try {
  for (const width of [1440, 1920]) for (const theme of ['book', 'light', 'dark']) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (await enforceReaderBundle(route, expectedBundle)) return
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      return route.continue()
    })
    await page.addInitScript(theme => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme, primaryEdition: 'original-en' })), theme)
    await page.goto(`${origin}/reader?book=frankenstein&chapter=2&paragraph=3&word=4&sharedReader=1&layout=desktop&view=margin`)
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
    const host = page.getByTestId('continuous-reader')
    await host.waitFor()
    await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
    const geometry = await page.locator('.continuous-reader-window').first().evaluate(node => {
      const box = node.getBoundingClientRect(), css = getComputedStyle(node)
      return { left: box.left, right: box.right, width: box.width, measure: box.width - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight) }
    })
    assert(geometry.measure > 608, `reading measure exceeds previous 38rem: ${JSON.stringify(geometry)}`)
    assert(geometry.measure <= 840 && width - geometry.right >= 300, 'reading measure stays bounded with room for margin notes')
    const notebook = page.getByTestId('lab-header-notebook')
    const notebookBox = await notebook.boundingBox(), playBox = await page.locator('.lab-header .lab-v2-play').boundingBox()
    assert(notebookBox && playBox && notebookBox.x + notebookBox.width <= playBox.x + 1, 'Notebook sits immediately left of Play')
    const readColors = () => page.locator('.lab-header-book').evaluate(node => ({ actual: getComputedStyle(node).color, ink: getComputedStyle(node.closest('.lab')).getPropertyValue('--lab-ink').trim() }))
    const idle = await readColors()
    await page.mouse.move(geometry.left + 160, 400)
    await page.mouse.wheel(0, 400)
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readingScroll === 'true')
    const scrolling = await readColors()
    assert.notEqual(scrolling.actual, idle.actual, 'header ink visibly greys while scrolling')
    await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color === color, idle.actual)
    assert.equal((await readColors()).actual, idle.actual, 'header ink returns when scrolling ends')
    assert.equal(await page.locator('.source-minimap circle').count(), 0, 'no unexplained minimap dots')
    const opacity = await page.locator('.source-minimap-line').first().evaluate(node => +getComputedStyle(node).opacity)
    assert(opacity >= .5, 'minimap lines remain visible')
    await page.screenshot({ path: `${output}/${theme}-${width}.png` })
    await notebook.click()
    await page.getByRole('region', { name: 'Notebook', exact: true }).waitFor()
    assert.deepEqual(errors, [])
    results.push({ width, theme, geometry, idle: idle.actual, scrolling: scrolling.actual, opacity })
    await context.close()
  }
  await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ passed: results.length, output, results }))
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
