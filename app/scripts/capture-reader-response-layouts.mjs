// Exact built-reader passage response captures, with isolated/muted browsers and local mock answers.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { assertNaturalCardBody, enforceReaderBundle } from './lib/readerParityAssertions.mjs'
import { markInternal } from './lib/internalTraffic.cjs'
const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5175'
const width = Number(process.env.TINCT_CAPTURE_WIDTH || 1440)
const theme = process.env.TINCT_CAPTURE_THEME || 'book'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const layouts = (process.env.TINCT_CAPTURE_LAYOUTS || 'margin,two-page,compare').split(',')
const output = process.env.TINCT_RESPONSE_OUTPUT || '/tmp/tinct-reader-response-layouts'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))
const observations = []
try {
  for (const layout of layouts) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
    const page = await context.newPage(), errors = [], requests = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (await enforceReaderBundle(route, expectedBundle)) return
      if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
        requests.push(route.request().postDataJSON())
        const text = requests.length > 1 ? Array.from({ length: 18 }, (_, i) => `Further point ${i + 1}: the passage keeps the narrator’s stated experience connected to the surrounding chapter. A careful reading follows the contrast without losing the source words.`).join('\n\n') : 'The narrator presents an unfamiliar setting through concrete details. The contrast between expectation and experience makes this passage feel uncertain and invites a closer reading.'
        return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n` })
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      return route.continue()
    })
    await page.addInitScript(theme => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme, primaryEdition: 'original-en', audioEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true, compareChosen: true })), theme)
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
    const card = layout === 'margin' ? page.locator('[data-testid="source-margin-item"][data-open="true"]') : page.locator('.lab-desktop-card[data-kind="explain"]')
    await card.waitFor()
    await card.getByText(/narrator presents an unfamiliar/).waitFor()
    const box = await card.boundingBox()
    assert(box && box.width > 220 && box.width <= 380 && box.x >= 0 && box.x + box.width <= width)
    if (layout !== 'margin') assert(box.y + box.height <= 900)
    assert.equal(requests.length, 1)
    assert.deepEqual(errors, [])
    const headerControls = await page.locator('.lab-header .lab-header-controls button, .lab-header .lab-v2-library-back').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect(), style = getComputedStyle(node)
      return { name: node.getAttribute('aria-label') || node.textContent.trim(), width: box.width, height: box.height, radius: style.borderRadius, background: style.backgroundColor, border: style.borderWidth }
    }))
    for (const control of headerControls) { assert(control.name); assert(control.width >= 40 && control.height >= 40, `header hit target: ${JSON.stringify(control)}`) }
    const close = layout === 'margin' ? card.getByTestId('source-margin-minimise') : card.getByRole('button', { name: 'Close card', exact: true })
    await close.focus()
    const focus = await close.evaluate(node => ({ outline: getComputedStyle(node).outlineStyle, active: document.activeElement === node }))
    assert(focus.active && focus.outline !== 'none', 'bare icon retains a visible keyboard focus indicator')
    await page.screenshot({ path: `${output}/${layout}-keyboard-focus.png` })
    await close.evaluate(node => node.blur())
    await page.screenshot({ path: `${output}/${layout}-explain.png` })
    observations.push({ layout, continuous: await page.locator('.lab').getAttribute('data-continuous-reader'), desktopView: await page.locator('.lab').getAttribute('data-desktop-view'), place: await page.locator('.lab').getAttribute('data-place'), card: box, headerControls, bundle: await page.locator('script[src*="/assets/index-"]').getAttribute('src') })
    const sourcePlace = await page.locator('.lab').getAttribute('data-place')
    await card.getByTestId('lab-phone-card-input').fill('Explain the surrounding context in more detail.')
    await card.getByTestId('lab-phone-card-send').click()
    await card.getByText(/Further point 18:/).waitFor()
    if (layout === 'margin') {
      await assertNaturalCardBody(card)
      const host = page.getByTestId('continuous-reader')
      await host.evaluate(node => { node.scrollTop = 0; node.dispatchEvent(new Event('scroll', { bubbles: true })) })
      const beforeTop = await host.evaluate(node => node.scrollTop)
      await card.getByText(/Further point 18:/).scrollIntoViewIfNeeded()
      assert(await host.evaluate(node => node.scrollTop) > beforeTop, 'long follow-up uses source document scrolling')
      await assertNaturalCardBody(card)
    } else {
      const scroll = await card.locator('.lab-pcard-body').evaluate(node => { node.scrollTop = node.scrollHeight; return { client: node.clientHeight, height: node.scrollHeight, top: node.scrollTop } })
      assert(scroll.height > scroll.client && scroll.top > 0, 'long follow-up scrolls within the card')
      const followBox = await card.locator('.lab-pcard-follow').boundingBox(), currentBox = await card.boundingBox()
      assert(followBox && currentBox && followBox.y + followBox.height <= currentBox.y + currentBox.height + 1, 'follow-up stays available below the scroll body')
    }
    assert.equal(requests.length, 2, 'follow-up submits exactly once')
    assert.equal(await page.locator('.lab').getAttribute('data-place'), sourcePlace, 'reading position survives follow-up and answer scrolling')
    await page.screenshot({ path: `${output}/${layout}-followup-scroll.png` })
    assert.deepEqual(errors, [])
    await close.click()
    assert.equal(await card.count(), 0)
    if (layout === 'margin') assert.equal(await page.getByTestId('source-margin-item').count(), 1, 'fold preserves source row')
    await context.close()
  }
  await fs.writeFile(`${output}/observations.json`, JSON.stringify(observations, null, 2))
  console.log(`Passage card captures passed for ${layouts.join(', ')}: ${output}`)
} finally { await browser.close() }
