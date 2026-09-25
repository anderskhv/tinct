import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const live = process.env.LIBRARY_LIVE === '1'
const output = 'artifacts/library-two-assistant'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] })
try {
  for (const viewport of [{ width:393, height:734 }, { width:1512, height:862 }]) {
    const context = await browser.newContext({ viewport, serviceWorkers:'block', permissions:[] })
    await context.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => { throw new Error('Microphone disabled for visual acceptance') }
    })
    let chatAttempts = 0, requestedContext = ''
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url())
      if (url.pathname === '/api/lab-chat') {
        requestedContext = request.postDataJSON().system
        chatAttempts++
        return chatAttempts === 1 ? route.fulfill({ status:503, body:'Interrupted' })
          : route.fulfill({ json:{ content:[{ type:'text', text:'Try Frankenstein for an atmospheric read. [[book:frankenstein]]' }] } })
      }
      if (request.method() !== 'GET') return route.abort()
      if (!live && url.origin === 'https://tinct.app') {
        const filename = path.resolve('dist', '.' + (url.pathname === '/lab/library_2/' ? '/lab/library_2/index.html' : url.pathname))
        if (!filename.startsWith(path.resolve('dist') + '/')) return route.abort()
        try { if ((await fs.stat(filename)).isFile()) return route.fulfill({ path:filename }) } catch {}
      }
      return route.continue()
    })
    const page = await context.newPage(), errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('https://tinct.app/lab/library_2/', { waitUntil:'networkidle' })
    assert.equal(await page.locator('#librarian-live').evaluate(el => Boolean(el.shadowRoot)), false, 'assistant stays lazy')
    await page.locator('#librarian').click()
    await page.locator('#chat:not([disabled])').waitFor({ timeout:30000 })
    await page.locator('#chat').click()
    const field = page.getByRole('textbox', { name:'Message the librarian' })
    await field.fill('Something atmospheric')
    await page.getByRole('button', { name:'Send', exact:true }).click()
    await page.getByRole('button', { name:'Retry', exact:true }).click()
    const recommendation = page.locator('#librarian-live').getByRole('button', { name:/Frankenstein.*Mary Shelley/ })
    await recommendation.waitFor()
    await recommendation.locator('img').evaluate(img => img.decode())
    await page.screenshot({ path:`${output}/chat-${viewport.width}.png` })
    await recommendation.click()
    await page.locator('#book-overlay').waitFor({ state:'visible' })
    await page.waitForTimeout(2300)
    assert(await page.locator('#librarian-panel').isHidden())
    await page.locator('#librarian').click()
    await page.locator('#chat').click()
    await field.fill('What should I notice?')
    await page.getByRole('button', { name:'Send', exact:true }).click()
    await page.waitForFunction(() => !document.querySelector('#librarian-live').shadowRoot.textContent.includes('Thinking…'))
    assert(requestedContext.includes('"id":"frankenstein"'))
    await page.locator('#minimize').click()
    await page.waitForTimeout(500)
    await page.locator('#librarian').click()
    await page.locator('#talk').click()
    await page.getByTestId('lab-call').waitFor()
    await page.getByTestId('lab-call-end').click()
    await page.waitForTimeout(500)
    assert(await page.locator('#librarian-panel').isHidden())
    assert(await page.locator('#librarian').isVisible())
    assert.deepEqual(errors, [])
    console.log(`Library_2 assistant: ${viewport.width}×${viewport.height} passed (mocked AI; microphone disabled)`)
    await context.close()
  }
} finally { await browser.close() }
