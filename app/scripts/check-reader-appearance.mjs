// Isolated, muted acceptance for desktop layout defaults, appearance and source-word continuity.
// API/provider requests are mocked; catalogue text is served by the local build.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { enforceReaderBundle } from './lib/readerParityAssertions.mjs'
import { markInternal } from './lib/internalTraffic.cjs'
const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5173'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_APPEARANCE_OUTPUT || '/tmp/tinct-reader-appearance'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true,
  executablePath: process.env.TINCT_CHROMIUM_EXECUTABLE || undefined,
  args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))
const observations = []
try {
  for (const theme of ['light', 'book', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
    const page = await context.newPage(), errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (await enforceReaderBundle(route, expectedBundle)) return
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      return route.continue()
    })
    await page.addInitScript(theme => {
      if (!localStorage.getItem('tinct-lab-prefs')) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme, primaryEdition: 'original-en', audioEdition: 'original-en', compareOpen: false, compareChosen: true }))
    }, theme)
    const ready = () => page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
    const place = () => page.locator('.lab').getAttribute('data-place')
    const settings = async () => { await page.getByTestId('lab-header-aa').click(); await page.getByRole('heading', { name: 'Appearance', exact: true }).waitFor() }
    await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=3&word=4&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' })
    await ready()
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await place(), '3:4')
    await settings()
    assert.equal(await page.getByTestId('lab-v2-layout-two-page').getAttribute('aria-pressed'), 'true')
    assert.equal(await page.locator('.lab-v2-layout-miniature[aria-hidden="true"]').count(), 3)
    const layoutSurface = await page.getByRole('group', { name: 'Layout', exact: true }).evaluate(node => { const style = getComputedStyle(node); return { radius: style.borderRadius, background: style.backgroundColor } })
    assert.equal(layoutSurface.radius, '0px', 'desktop layout choices follow straight rules')
    assert(['transparent', 'rgba(0, 0, 0, 0)'].includes(layoutSurface.background), 'layout chooser has no filled group box')
    const restoreRadius = await page.getByRole('button', { name: 'Restore defaults', exact: true }).evaluate(node => getComputedStyle(node).borderRadius)
    assert.equal(restoreRadius, '0px', 'desktop Appearance actions use straight rules')
    await page.screenshot({ path: `${output}/appearance-${theme}.png` })
    await page.getByTestId('lab-v2-layout-margin').click()
    await page.getByTestId('continuous-reader').waitFor()
    await page.waitForTimeout(600)
    assert.equal(await place(), '3:4', 'Margin preserves the requested source word')
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready()
    await page.getByTestId('continuous-reader').waitFor()
    assert.equal(await place(), '3:4', 'Margin reload preserves the requested source word')
    await settings(); await page.getByTestId('lab-v2-layout-two-page').click()
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.continuousReader !== 'true')
    await page.waitForTimeout(600)
    assert.equal(await place(), '3:4', 'Two-page preserves the requested source word')
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready()
    assert.equal(await place(), '3:4', 'Two-page reload preserves the requested source word')
    await settings()
    assert.equal(await page.getByTestId('lab-v2-layout-two-page').getAttribute('aria-pressed'), 'true')
    await page.getByTestId('lab-v2-layout-compare').click()
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.desktopView === 'compare' || [...document.querySelectorAll('h2')].some(node => node.textContent === 'Compare version'))
    if (await page.getByRole('heading', { name: 'Compare version', exact: true }).count()) {
      const loaded = page.waitForResponse(response => response.url().includes('frankenstein') && response.url().includes('modern-en'), { timeout: 5000 }).catch(() => null)
      await page.locator('[data-edition="modern-en"]').click()
      await loaded
      await page.waitForTimeout(100)
      await page.getByTestId('lab-v2-layout-compare').click()
    }
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.desktopView === 'compare')
    assert.equal(await place(), '3:4', 'Compare preserves the main source coordinate')
    observations.push({ theme, place: await place(), layouts: await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:reader-desktop-layout') || '{}')), errors })
    assert.deepEqual(errors, [])
    await context.close()
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' })
  const page = await context.newPage()
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.abort()
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    return route.continue()
  })
  await page.goto(`${origin}/reader?book=frankenstein&chapter=2&sharedReader=1&layout=phone`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  assert.equal(await page.getByTestId('lab-header-aa').count(), 0)
  await page.getByTestId('lab-super').click(); await page.getByTestId('lab-super-row-text').click()
  assert.equal(await page.locator('.lab-v2-layout-choices').count(), 0, 'phone has no desktop layout chooser')
  await page.screenshot({ path: `${output}/appearance-phone.png` })
  await context.close()
  await fs.writeFile(`${output}/observations.json`, JSON.stringify(observations, null, 2))
  console.log(`Appearance browser acceptance passed: three themes, defaults, Margin/Two-page reload, Compare and exact source word; phone chooser unchanged. ${output}`)
} finally { await browser.close() }
