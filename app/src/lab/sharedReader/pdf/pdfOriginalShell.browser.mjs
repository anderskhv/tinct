// Real pdf.js surface and shared controls, with an in-memory owner-service fixture.
// node src/lab/sharedReader/pdf/pdfOriginalShell.browser.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium, webkit } from '@playwright/test'
import { createServer } from 'vite'
import { makePdf } from '../../../../../addbooks/web/test/make-pdf.mjs'
import { markInternal } from '../../../../scripts/lib/internalTraffic.cjs'

const vite = await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/public/**', '**/data/**'] } }, logLevel: 'error' })
await vite.listen()
const origin = vite.resolvedUrls.local[0].replace(/\/$/, '')
const fixture = makePdf({ pages: [
  { lines: [{ x: 72, y: 700, size: 24, text: 'Original selectable words' }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
] }).toString('base64')
await fs.mkdir('artifacts/pdf-original-shell', { recursive: true })

try {
  const engines = [['chromium', chromium], ...(process.env.PDF_BROWSER_WEBKIT === '1' ? [['webkit', webkit]] : [])]
  for (const [name, engine] of engines) {
    const browser = await markInternal(await engine.launch({ headless: true, args: name === 'chromium' ? ['--mute-audio', '--no-sandbox'] : [] }))
    try {
      const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
      const page = await context.newPage(), errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/*', route => {
        const url = new URL(route.request().url())
        return url.origin === origin && !url.pathname.startsWith('/api/') ? route.continue() : route.abort()
      })
      await page.addInitScript(value => { window.__pdfFixture = value }, fixture)
      await page.goto(`${origin}/src/lab/sharedReader/pdf/pdfOriginalShell.browser.html`, { waitUntil: 'domcontentloaded' })
      const layer = page.locator('.pdf-original__text')
      await layer.getByText('Original selectable words').waitFor({ timeout: 30000 })
      assert.equal(await page.locator('[data-pdf-original=true]').count(), 1)
      await page.getByTestId('lab-super').click()
      await page.getByRole('button', { name: 'Primer · These pages' }).click()
      await page.getByText('The original page introduces an idea to follow.').waitFor()
      await page.getByText('Key claims').waitFor()
      assert.equal(await page.locator('.lab-pcard').getByText('"gist"').count(), 0, 'structured Primer stays readable')
      const unitCalls = await page.evaluate(() => window.__pdfCalls)
      assert.equal(unitCalls.filter(call => call.kind === 'unit-ask').length, 1)
      assert.deepEqual(unitCalls.find(call => call.kind === 'unit-ask').source.pages.map(item => item.n), [1, 2])
      assert.match(unitCalls.find(call => call.kind === 'unit-ask').source.pages[0].text, /Original selectable words/)
      assert.equal(unitCalls.find(call => call.kind === 'unit-ask').source.pages[1].text, '')
      assert.equal(unitCalls.filter(call => call.kind === 'unit-card').length, 1)
      await page.keyboard.press('Escape')
      const select = async () => layer.getByText('Original selectable words').evaluate(el => {
        const selection = window.getSelection(), range = document.createRange()
        range.selectNodeContents(el); selection.removeAllRanges(); selection.addRange(range)
        el.parentElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      })
      await select()
      await page.getByTestId('lab-dbar-highlight').click()
      await page.waitForFunction(() => window.__pdfCalls.some(call => call.kind === 'highlight'))
      await page.locator('.pdf-original__highlight').first().waitFor()
      const mark = await page.evaluate(() => window.__pdfCalls.find(call => call.kind === 'highlight'))
      assert.equal(mark.selection.page, 1)
      assert.match(mark.selection.text, /Original selectable words/)
      assert.ok(mark.selection.rects.every(rect => rect.length === 5 && rect[0] === 1))
      await page.screenshot({ path: `artifacts/pdf-original-shell/${name}-highlight.png` })
      await page.keyboard.press('Escape')
      await select()
      await page.getByTestId('lab-dbar-ask').click()
      await page.getByTestId('lab-dbar-ask-field').fill('Why this passage?')
      await page.getByTestId('lab-dbar-ask-field').press('Enter')
      await page.getByText('A local source-page answer.').waitFor()
      const calls = await page.evaluate(() => window.__pdfCalls)
      const asks = calls.filter(call => call.kind === 'ask' && call.intent === 'ask')
      assert.equal(asks.length, 1)
      assert.equal(asks[0].question, 'Why this passage?')
      assert.deepEqual(asks[0].selection.rects, mark.selection.rects)
      assert.equal(calls.filter(call => call.kind === 'card' && call.intent === 'ask').length, 1)
      await page.getByLabel('Follow up').fill('And then?')
      await page.getByTestId('lab-phone-card-send').click()
      await page.getByText('A local follow-up answer.').waitFor()
      const followed = await page.evaluate(() => window.__pdfCalls)
      assert.equal(followed.filter(call => call.kind === 'follow-ask').length, 1)
      assert.equal(followed.filter(call => call.kind === 'follow-save').length, 1)
      assert.equal(followed.find(call => call.kind === 'follow-save').question, 'And then?')
      await page.mouse.click(400, 300)
      await page.getByRole('button', { name: 'Notebook', exact: true }).click()
      await page.getByText('Original PDF page 1 · ask').waitFor()
      await page.getByRole('button', { name: 'My notes' }).click()
      assert.equal(await page.getByText('Original PDF page 1 · ask').count(), 0)
      await page.getByRole('button', { name: 'AI', exact: true }).click()
      await page.getByText('Original PDF page 1 · ask').waitFor()
      await page.getByRole('button', { name: 'Close panel' }).click()
      await page.getByRole('button', { name: 'Contents', exact: true }).click()
      await page.locator('.pdf-original-reader__page-list button', { hasText: 'Page 2' }).click()
      await page.getByText('Page 2 of 2', { exact: true }).waitFor()
      assert.equal(await layer.locator('span').count(), 0, 'scanned page has no invented text')
      await page.getByRole('button', { name: 'Reading settings' }).click()
      await page.getByLabel('Dark', { exact: true }).check()
      assert.equal(await page.locator('[data-pdf-original=true]').getAttribute('data-theme'), 'dark')
      await page.screenshot({ path: `artifacts/pdf-original-shell/${name}-dark-scan.png` })
      assert.deepEqual(errors, [])
      const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
        serviceWorkers: 'block', reducedMotion: 'reduce' })
      try {
        const phonePage = await phoneContext.newPage()
        phonePage.on('pageerror', error => errors.push(error.message))
        await phonePage.route('**/*', route => { const url = new URL(route.request().url()); return url.origin === origin && !url.pathname.startsWith('/api/') ? route.continue() : route.abort() })
        await phonePage.addInitScript(value => { window.__pdfFixture = value }, fixture)
        await phonePage.goto(`${origin}/src/lab/sharedReader/pdf/pdfOriginalShell.browser.html`, { waitUntil: 'domcontentloaded' })
        const words = phonePage.locator('.pdf-original__text').getByText('Original selectable words')
        await words.waitFor({ timeout: 30000 })
        await words.evaluate(el => { const range = document.createRange(), selected = window.getSelection(); range.selectNodeContents(el); selected.removeAllRanges(); selected.addRange(range); el.parentElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })) })
        await phonePage.getByTestId('lab-phone-bar').waitFor({ timeout: 5000 }).catch(async error => {
          const state = await phonePage.evaluate(() => ({ selection: window.getSelection()?.toString(), phone: document.querySelector('.pdf-original-reader')?.className,
            text: document.querySelector('.pdf-original__text')?.textContent, error: document.querySelector('[role=alert]')?.textContent }))
          throw new Error(`${error.message}\n${JSON.stringify(state)}\n${errors.join('\n')}`)
        })
        await phonePage.getByTestId('lab-pbar-more').click()
        await phonePage.getByRole('menuitem', { name: 'Define' }).click()
        await phonePage.getByText('Noun. An idea named by this original PDF passage.').waitFor()
        assert.equal(await phonePage.locator('.lab-pcard').getByText('"kind"').count(), 0, 'structured Define stays readable')
        assert.equal((await phonePage.evaluate(() => window.__pdfCalls)).filter(call => call.kind === 'ask' && call.intent === 'define').length, 1)
        await phonePage.screenshot({ path: `artifacts/pdf-original-shell/${name}-phone-card.png` })
      } finally { await phoneContext.close() }
      assert.deepEqual(errors, [])
      process.stdout.write(`${name}: original PDF shell selection, rects, Ask, Notebook, Contents, scan and themes passed\n`)
    } finally { await browser.close() }
  }
} finally { await vite.close() }
