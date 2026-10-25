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
      if (/\/api\/(?:lab-chat|chat)$/.test(url.pathname)) return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'A local explanation of this selected passage.' } })}\n\ndata: {"type":"message_stop"}\n\n` })
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
    assert.equal(await notebook.locator('svg').count(), 1, 'Notebook uses shared icon')
    assert.equal((await notebook.innerText()).trim(), '', 'Notebook has no visible text label')
    const readColors = () => page.locator('.lab-header-book').evaluate(node => ({ actual: getComputedStyle(node).color, ink: getComputedStyle(node.closest('.lab')).getPropertyValue('--lab-ink').trim() }))
    const idle = await readColors()
    await page.mouse.move(geometry.left + 160, 400)
    await page.mouse.wheel(0, 400)
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readingScroll === 'true')
    const scrolling = await readColors()
    assert.equal(scrolling.actual, idle.actual, 'header stays quietly muted while scrolling')
    await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color === color, idle.actual)
    assert.equal((await readColors()).actual, idle.actual, 'header stays muted when scrolling ends')
    await page.locator('.lab-header-book').hover()
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color !== color, idle.actual)
    const hovered = await readColors()
    assert.notEqual(hovered.actual, idle.actual, 'header gains ink on hover')
    await page.mouse.move(geometry.left + 160, 400)
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color === color, idle.actual)
    await notebook.focus()
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color !== color, idle.actual)
    assert.notEqual((await readColors()).actual, idle.actual, 'header gains ink for keyboard focus')
    await notebook.evaluate(node => node.blur())
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color === color, idle.actual)
    assert.equal(await page.locator('.source-minimap circle').count(), 0, 'no unexplained minimap dots')
    const opacity = await page.locator('.source-minimap-line').first().evaluate(node => +getComputedStyle(node).opacity)
    assert(opacity >= .5, 'minimap lines remain visible')
    if (width === 1440 && theme === 'book') {
      await host.evaluate(node => { node.scrollTop = 0; node.dispatchEvent(new Event('scroll')) })
      let selectionIndex = 0
      const select = async () => {
        const words = host.locator('[data-testid="lab-word"]:visible')
        const offset = selectionIndex++ * 20 + 5
        const first = await words.nth(offset).boundingBox(), last = await words.nth(offset + 9).boundingBox()
        assert(first && last)
        await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
        await page.mouse.down()
        await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
        await page.mouse.up()
        await page.getByTestId('lab-desk-bar').waitFor({ timeout: 5000 }).catch(async error => { await page.screenshot({ path: `${output}/selection-debug.png` }); console.error(JSON.stringify(await page.evaluate(() => ({ selection: window.getSelection()?.toString(), bars: [...document.querySelectorAll('[data-testid]')].map(n => n.getAttribute('data-testid')).filter(n => /bar|card|margin/.test(n)), words: [...document.querySelectorAll('.continuous-reader [data-testid="lab-word"]')].slice(0,16).map(n => { const r=n.getBoundingClientRect(); return [n.textContent,r.x,r.y] }) })))); throw error })
      }
      await select()
      await page.getByTestId('lab-dbar-highlight').click()
      await page.locator('.source-minimap-activity').first().waitFor()
      await select()
      await page.getByTestId('lab-dbar-explain').click()
      await page.getByText('A local explanation of this selected passage.', { exact: true }).waitFor()
      await page.locator('.source-minimap-card').first().waitFor()
      const leaders = await page.locator('.source-margin-leaders path').evaluateAll(paths => {
        const host = document.querySelector('[data-testid="continuous-reader"]'), hostBox = host.getBoundingClientRect()
        const borders = [...document.querySelectorAll('.continuous-reader-window')].map(node => node.getBoundingClientRect().right - hostBox.left + host.scrollLeft)
        return paths.map(node => ({ path: node.getAttribute('d'), borders }))
      })
      assert(leaders.length > 0, 'explanation has a source connector')
      for (const leader of leaders) {
        const start = Number(leader.path.match(/^M\s*([\d.-]+)/)?.[1])
        assert(leader.borders.some(border => Math.abs(border - start) <= 1), `source connector begins at page border: ${JSON.stringify(leader)}`)
      }
      assert.equal(await page.locator('.source-margin-leaders circle').count(), 0, 'source connector has no dot inside reading text')
      await page.screenshot({ path: `${output}/book-1440-activity.png` })
      assert.equal(await page.locator('[data-testid="source-margin-item"][data-open="true"]').count(), 1, 'existing explanation is open before selecting the next source')
      await select()
      await page.keyboard.type('Why this passage?')
      const field = page.locator('[data-testid="source-margin-item"][data-open="true"]').getByTestId('lab-phone-card-input')
      await field.waitFor()
      assert.equal(await field.inputValue(), 'Why this passage?', 'typing from selected source opens Ask and retains every character')
      const askCardId = await field.evaluate(node => node.closest('[data-card-id]').dataset.cardId)
      const askCard = page.locator(`[data-testid="source-margin-item"][data-card-id="${askCardId}"]`)
      assert.equal(await page.locator('.lab-pcard-typing-hint').count(), 0, 'no visible Escape hint')
      await page.keyboard.press('Escape')
      await page.waitForFunction(id => document.querySelector(`[data-testid="source-margin-item"][data-card-id="${id}"]`)?.getAttribute('data-open') === 'false', askCardId)
      await askCard.getByTestId('source-margin-open').click()
      assert.equal(await askCard.getByTestId('lab-phone-card-input').inputValue(), 'Why this passage?', 'Escape collapses card and reopening preserves draft')
      await page.mouse.click(geometry.left + 15, 600)
      await page.waitForFunction(id => document.querySelector(`[data-testid="source-margin-item"][data-card-id="${id}"]`)?.getAttribute('data-open') === 'false', askCardId)
      await askCard.getByTestId('source-margin-open').click()
      assert.equal(await askCard.getByTestId('lab-phone-card-input').inputValue(), 'Why this passage?', 'outside click collapses card and reopening preserves draft')
      await page.keyboard.press('Escape')
    }
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
