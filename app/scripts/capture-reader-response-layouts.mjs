// Exact built-reader passage response captures, with isolated/muted browsers and local mock answers.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5175'
const output = process.env.TINCT_RESPONSE_OUTPUT || '/tmp/tinct-reader-response-layouts'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))
const observations = []
try {
  for (const layout of ['margin', 'two-page', 'compare']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
    const page = await context.newPage(), errors = [], requests = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
        requests.push(route.request().postDataJSON())
        const text = 'The narrator presents an unfamiliar setting through concrete details. The contrast between expectation and experience makes this passage feel uncertain and invites a closer reading.'
        return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n` })
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      return route.continue()
    })
    await page.addInitScript(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', primaryEdition: 'original-en', audioEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true, compareChosen: true })))
    await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=3&word=4&sharedReader=1&layout=desktop&view=${layout}`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
    assert.equal(await page.locator('.lab').getAttribute('data-continuous-reader') === 'true', layout === 'margin', 'requested layout actually mounted')
    assert.equal(await page.locator('.lab').getAttribute('data-desktop-view') === 'compare', layout === 'compare', 'requested Compare actually mounted')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(600)
    const words = page.locator('.lab-passage [data-testid="lab-word"]:visible, .continuous-reader [data-testid="lab-word"]:visible')
    await words.nth(14).waitFor()
    const first = await words.nth(5).boundingBox(), last = await words.nth(14).boundingBox()
    assert(first && last)
    await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
    await page.mouse.down(); await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 }); await page.mouse.up()
    await page.getByTestId('lab-dbar-explain').click()
    const card = page.locator('.lab-desktop-card[data-kind="explain"]')
    await card.waitFor()
    await card.getByText(/narrator presents an unfamiliar/).waitFor()
    const box = await card.boundingBox()
    assert(box && box.width === 380 && box.x >= 0 && box.x + box.width <= 1440 && box.y + box.height <= 900)
    assert.equal(requests.length, 1)
    assert.deepEqual(errors, [])
    await page.screenshot({ path: `${output}/${layout}-explain.png` })
    observations.push({ layout, continuous: await page.locator('.lab').getAttribute('data-continuous-reader'), desktopView: await page.locator('.lab').getAttribute('data-desktop-view'), place: await page.locator('.lab').getAttribute('data-place'), card: box, bundle: await page.locator('script[src*="/assets/index-"]').getAttribute('src') })
    await card.getByRole('button', { name: 'Close card', exact: true }).click()
    assert.equal(await card.count(), 0)
    await context.close()
  }
  await fs.writeFile(`${output}/observations.json`, JSON.stringify(observations, null, 2))
  console.log(`Passage card captures passed for Margin, Two-page and Compare: ${output}`)
} finally { await browser.close() }
