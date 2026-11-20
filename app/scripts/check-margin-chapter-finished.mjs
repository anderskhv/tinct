// A chapter read to its end in desktop Margin counts as finished (Anders,
// 5 Nov 2026: "I had actually finished 2 Maccabees 11 but it looks like I
// haven't even started it").
//   cd app && npm run build && node scripts/check-margin-chapter-finished.mjs
// The built app is served from dist/ under https://tinct.app by request
// interception; every other request is refused, so nothing leaves the machine.
// Each case opens a 2 Maccabees chapter (WEB Catholic Edition) in Margin, wheels
// down like a reader, opens Contents and reads the chapter's mark:
//  - 2 Maccabees 11 scrolled to its end: finished, a full dot, and the saved
//    place is the one the scroll left (finishing never moves it);
//  - then left through Contents for chapter 12: 11 stays finished;
//  - 2 Maccabees 12 scrolled halfway: a partial dot, not finished;
//  - 2 Maccabees 13 scrolled to its end with the pointer resting in the margin
//    (the margin rail's blank room, a portal outside the reader's React tree):
//    finished, and the place saved (Anders, 6 Nov 2026: 2 Maccabees 11-13, each
//    with margin cards, showed nothing; the old build left 0:0 and no finish).
// MARGIN_SHOTS=<dir> writes a screenshot of each Contents panel.
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const origin = 'https://tinct.app'
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const shots = process.env.MARGIN_SHOTS || ''
if (shots) await fs.mkdir(shots, { recursive: true })
const MACCABEES_11 = 1246

async function open(browser, chapter) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', colorScheme: 'dark' })
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.abort()
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    if (route.request().method() !== 'GET') return route.abort()
    if (url.pathname === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    const filename = path.resolve(dist, `.${url.pathname === '/reader' ? '/app.html' : url.pathname}`)
    if (!filename.startsWith(`${dist}/`)) return route.abort()
    try { if ((await fs.stat(filename)).isFile()) return route.fulfill({ path: filename }) } catch {}
    return route.fulfill({ status: 404, body: '' })
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${origin}/qa-seed`)
  await page.evaluate(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark', primaryEdition: 'webc-en' })))
  await page.goto(`${origin}/reader?book=bible&chapter=${chapter}&edition=webc-en&paragraph=0&word=0&sharedReader=1&layout=desktop&view=margin`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true'
    && document.querySelectorAll('[data-testid="continuous-reader"] [data-testid="lab-word"]').length > 40, null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  return { context, page, errors }
}

/** Wheel down until `share` of the chapter's scroll height is above the viewport top. */
async function wheelTo(page, share, across = .5) {
  const box = await page.getByTestId('continuous-reader').boundingBox()
  await page.mouse.move(box.x + box.width * across, box.y + box.height / 2)
  for (let i = 0; i < 200; i++) {
    const { top, max } = await page.getByTestId('continuous-reader').evaluate(host => ({ top: host.scrollTop, max: host.scrollHeight - host.clientHeight }))
    if (top >= max * share - 2) break
    await page.mouse.wheel(0, 240)
    await page.waitForTimeout(100)
  }
  await page.waitForTimeout(1200)
}

const place = page => page.getByTestId('lab-root').getAttribute('data-place')
const stored = page => page.evaluate(() => {
  const state = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}')
  return { finished: state.finished?.bible ?? [], pins: Object.values(state.books || {}).map(pin => `${pin.sequentialChapter}@${pin.paragraphIndex}:${pin.wordIndex}`) }
})
async function contents(page, chapter, name) {
  await page.getByTestId('lab-header-chapter').click()
  const row = page.getByTestId(`lab-tree-chapter-${chapter}`)
  await row.waitFor()
  await page.waitForTimeout(400)
  if (shots) await page.screenshot({ path: `${shots}/${name}.png` })
  return { label: await row.getAttribute('aria-label'), pie: await row.locator('.progress-pie').getAttribute('class').catch(() => null), percent: await row.locator('.progress-pie title').textContent().catch(() => null) }
}

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const results = []
try {
  {
    const { context, page, errors } = await open(browser, MACCABEES_11)
    await wheelTo(page, 1)
    const left = await place(page)
    const mark = await contents(page, MACCABEES_11, 'maccabees-11-end')
    assert.equal(mark.label, '2 Maccabees 11, currently reading, 100% read')
    assert.equal(mark.percent, '100% read')
    const record = await stored(page)
    assert.deepEqual(record.finished, [MACCABEES_11])
    assert.equal(await place(page), left, 'finishing never moves the reading place')
    assert.deepEqual(record.pins, [`${MACCABEES_11}@${left}`])
    await page.getByTestId(`lab-tree-chapter-${MACCABEES_11 + 1}`).click()
    await page.waitForFunction(next => document.querySelector('[data-testid="lab-root"]')?.dataset.chapter === String(next), MACCABEES_11 + 1)
    await page.waitForTimeout(1200)
    const after = await contents(page, MACCABEES_11, 'maccabees-11-after-leaving')
    assert.equal(after.label, '2 Maccabees 11, 100% read')
    assert.deepEqual((await stored(page)).finished, [MACCABEES_11])
    assert.deepEqual(errors, [])
    results.push({ case: '2 Maccabees 11 to its end', place: left, mark, after })
    await context.close()
  }
  {
    const { context, page, errors } = await open(browser, MACCABEES_11 + 1)
    await wheelTo(page, .5)
    const left = await place(page)
    const mark = await contents(page, MACCABEES_11 + 1, 'maccabees-12-half')
    const percent = Number(/(\d+)% read/.exec(mark.label)?.[1])
    assert(percent > 0 && percent < 100, mark.label)
    assert.deepEqual((await stored(page)).finished, [])
    assert.equal(await place(page), left)
    assert.deepEqual(errors, [])
    results.push({ case: '2 Maccabees 12 halfway', place: left, mark })
    await context.close()
  }
  {
    const chapter = MACCABEES_11 + 2
    const { context, page, errors } = await open(browser, chapter)
    const box = await page.getByTestId('continuous-reader').boundingBox()
    const hovered = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className, [box.x + box.width * .85, box.y + box.height / 2])
    assert.equal(hovered, 'source-margin-room', 'the pointer rests in the margin, not on the text')
    await wheelTo(page, 1, .85)
    const left = await place(page)
    assert.notEqual(left, '0:0', 'a wheel in the margin saves the place it scrolled to')
    const mark = await contents(page, chapter, 'maccabees-13-end-from-margin')
    assert.equal(mark.label, '2 Maccabees 13, currently reading, 100% read')
    const record = await stored(page)
    assert.deepEqual(record.finished, [chapter])
    assert.deepEqual(record.pins, [`${chapter}@${left}`])
    assert.deepEqual(errors, [])
    results.push({ case: '2 Maccabees 13 to its end, pointer in the margin', place: left, mark })
    await context.close()
  }
} finally { await browser.close() }
console.log(JSON.stringify(results, null, 1))
