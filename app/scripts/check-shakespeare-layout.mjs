import { chromium, webkit, devices } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const live = process.env.SHAKESPEARE_LIVE === '1'
const origin = 'https://tinct.app', output = 'artifacts/shakespeare-layout'
await fs.mkdir(output, { recursive: true })
const results = []
async function prepare(context) {
  await context.addInitScript(() => {
    HTMLMediaElement.prototype.play = async function () { this.muted = true }
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw Error('Disabled for silent acceptance') }
  })
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin || route.request().method() !== 'GET') return route.abort()
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    if (live) return route.continue()
    const file = path.resolve('dist', '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/library' ? '/lab/index.html' : url.pathname))
    if (file.startsWith(path.resolve('dist') + '/')) try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
    return route.abort()
  })
}
async function boot(page, scenario) {
  await page.addInitScript(s => {
    if (sessionStorage.getItem('qa:shakespeare')) return
    sessionStorage.setItem('qa:shakespeare', '1')
    const appearance = { alignment: s.alignment, alignmentExplicit: s.explicit, fontSize: s.size, shakespeareLayout: s.layout }
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ version: 2, shared: { primaryEdition: 'original-en', compareEdition: 'modern-en' }, phone: appearance, desktop: appearance }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: s.book, primaryEditionKey: 'original-en', savedPlace: { bookId: s.book, chapterNumber: s.chapter, paragraphIndex: s.paragraph, wordIndex: 0, page: 0 } }))
  }, scenario)
  await page.goto(origin + '/reader?chrome=v2', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(800)
}
async function inspect(page, scenario) {
  const state = await page.getByTestId('lab-root').evaluate(root => {
    const visible = node => node.getBoundingClientRect().width > 0 && !node.closest('.lab-page-measure')
    const words = [...root.querySelectorAll('[data-testid="lab-word"]')].filter(visible)
    const lines = [...root.querySelectorAll('.lab-verse-line')].filter(visible)
    const speakers = [...root.querySelectorAll('.lab-verse-speaker')].filter(node => !node.closest('.lab-page-measure'))
    const markers = [...root.querySelectorAll('.lab-verse-break')].filter(visible)
    return { desktop: root.classList.contains('is-desktop'), layout: root.dataset.shakespeareLayout, align: root.style.getPropertyValue('--lab-text-align'), place: root.dataset.place,
      words: words.map(n => ({ key: `${n.dataset.paragraphIndex}:${n.dataset.wordIndex}`, text: n.textContent })),
      openingOffsets: [...root.querySelectorAll('.lab-verse-line')].filter(n => visible(n) && n.querySelector('.lab-verse-speaker')).map(n => {
        const speaker = n.querySelector('.lab-verse-speaker [data-testid="lab-word"]')
        const dialogue = n.querySelector('.lab-verse-dialogue [data-testid="lab-word"]')
        return speaker && dialogue ? Math.abs(speaker.getBoundingClientRect().left - dialogue.getBoundingClientRect().left) : 0
      }),
      lineDisplays: lines.map(n => getComputedStyle(n).display),
      speakers: speakers.map(n => ({ display: getComputedStyle(n).display, font: parseFloat(getComputedStyle(n).fontSize), parentFont: parseFloat(getComputedStyle(n.parentElement).fontSize) })),
      markers: markers.map(n => { const previous = [...n.parentElement.querySelectorAll('[data-testid="lab-word"]')].at(-1); const r = n.getBoundingClientRect(), p = previous?.getClientRects(); const last = p?.[p.length - 1]; return { attached: !last || (r.top < last.bottom && r.bottom > last.top), content: getComputedStyle(n, '::after').content, text: n.textContent } }),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    }
  })
  assert.equal(state.layout, scenario.phone && scenario.layout === 'flowing' ? 'flowing' : 'verse')
  assert.equal(state.align, scenario.explicit ? scenario.alignment : 'left')
  assert(state.words.length > 0, 'reader paints indexed words')
  assert.equal(new Set(state.words.map(w => w.key)).size, state.words.length, 'word indices are unique')
  assert(!state.overflow, 'no horizontal overflow')
  if (state.desktop) for (const offset of state.openingOffsets) assert(offset < 2, 'speaker and first dialogue line share the verse margin')
  for (const display of state.lineDisplays) assert.equal(display, state.layout === 'flowing' ? 'inline' : 'block')
  for (const speaker of state.speakers) if (state.layout === 'flowing' || state.desktop) { assert.equal(speaker.display, 'block'); assert(speaker.font >= 14 && Math.abs(speaker.font - Math.max(14, speaker.parentFont * .63)) < 1) }
  for (const marker of state.markers) { assert(marker.attached, 'verse marker stays with preceding word'); assert.equal(marker.text, '', 'marker is not added to source text'); assert(marker.content.includes('·')) }
  if (state.layout === 'verse') assert.equal(state.markers.length, 0)
  return state
}
for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
  const browser = await browserType.launch({ headless: true, args: engine === 'chromium' ? ['--mute-audio'] : [] })
  try {
    const scenarios = []
    for (const width of [320, 390]) for (const layout of ['verse', 'flowing']) for (const size of [1.3, 2.2]) for (const alignment of ['left', 'justify']) scenarios.push({ width, layout, size, alignment, explicit: true, phone: true, book: 'macbeth', chapter: 1, paragraph: 0 })
    for (const layout of ['verse', 'flowing']) for (const size of [1.3, 2.2]) for (const alignment of ['left', 'justify']) scenarios.push({ width: 320, layout, size, alignment, explicit: true, phone: true, book: 'hamlet', chapter: 8, paragraph: 23 })
    scenarios.push({ width: 390, layout: 'flowing', size: 1.3, alignment: 'justify', explicit: false, phone: true, book: 'hamlet', chapter: 7, paragraph: 121 })
    for (const size of [1.3, 2.2]) for (const alignment of ['left', 'justify']) scenarios.push({ width: 1440, layout: 'verse', size, alignment, explicit: true, phone: false, book: 'hamlet', chapter: 20, paragraph: 169 })
    for (const width of [820, 1180, 1440]) scenarios.push({ width, layout: 'flowing', size: 1.3, alignment: 'justify', explicit: false, phone: false, book: 'macbeth', chapter: 1, paragraph: 0 })
    for (const [index, scenario] of scenarios.entries()) {
      const tablet = !scenario.phone && scenario.width < 1400
      const device = scenario.phone ? devices['iPhone 13'] : tablet ? devices['iPad Pro 11'] : {}
      const context = await browser.newContext({ ...device, viewport: { width: scenario.width, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
      await prepare(context)
      const page = await context.newPage()
      try {
        await boot(page, scenario)
        const state = await inspect(page, scenario)
        if (index === 0 || index === 7 || index === 15 || index >= 24) {
          await page.screenshot({ path: `${output}/${engine}-${index}.png` })
          if (scenario.width === 1440 && scenario.size === 1.3 && scenario.explicit && scenario.alignment === 'left') {
            const shot = await page.screenshot({ type: 'jpeg', quality: 65 })
            console.log('REVIEW_BEGIN', engine + '-desktop-speakers')
            const encoded = shot.toString('base64')
            for (let offset = 0; offset < encoded.length; offset += 4000) console.log('REVIEW_CHUNK', encoded.slice(offset, offset + 4000))
            console.log('REVIEW_END', engine + '-desktop-speakers')
          }
        }
        // Use actual settings once to verify persistence and no font-triggered switching.
        if (index === 0 || tablet || scenario.width === 1440) {
          await page.getByTestId('lab-super').click({ force: true })
          await page.getByTestId('lab-super-row-settings').click()
          await page.getByTestId('lab-v2-advanced').click()
          const choice = page.getByLabel('Shakespeare layout')
          assert.equal(await choice.count(), scenario.phone ? 1 : 0)
          if (scenario.phone) {
            await choice.selectOption('flowing')
            await page.reload()
            await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true')
            assert.equal(await page.getByTestId('lab-root').getAttribute('data-shakespeare-layout'), 'flowing')
            const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-prefs')))
            assert.equal(prefs.phone.shakespeareLayout, 'flowing')
          }
        }
        results.push({ engine, scenario, state })
        console.log('PASS', engine, index, scenario.book, scenario.width, scenario.layout, scenario.size, scenario.alignment)
      } catch (error) { await page.screenshot({ path: `${output}/${engine}-${index}-failure.png` }); throw error } finally { await context.close() }
    }
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block', reducedMotion })
      await prepare(context)
      const page = await context.newPage()
      await page.goto(origin + '/library')
      const edge = page.locator('.library-dock-edge rect')
      await edge.waitFor({ state: 'attached' })
      const timing = await edge.evaluate(n => n.getAnimations().map(a => a.effect.getTiming()))
      if (reducedMotion === 'reduce') assert.equal(timing.length, 0)
      else { assert.equal(timing.length, 1); assert.equal(timing[0].iterations, 3); assert.equal(timing[0].duration, 3200) }
      await page.getByRole('button', { name: 'Search', exact: true }).click()
      await page.getByRole('button', { name: 'Close', exact: true }).click()
      await page.waitForTimeout(10000)
      assert.equal(await edge.evaluate(n => n.getAnimations().filter(a => a.playState === 'running').length), 0)
      assert.equal(await edge.evaluate(n => getComputedStyle(n).opacity), '0')
      assert.equal(await page.locator('.library-glass-dock > button').count(), 3)
      await page.screenshot({ path: `${output}/${engine}-library-${reducedMotion}.png` })
      results.push({ engine, reducedMotion, timing, stopped: true })
      await context.close()
    }
  } finally { await browser.close(); await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2)) }
}
