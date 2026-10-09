/**
 * The desktop reader survives a window resize: text comes back, the spread
 * fills the new window and the reader keeps their place.
 *
 * Anders, 9 Oct 2026 (tinct.app/reader, Chrome, To the Lighthouse, The Window
 * 1): switching the window from half screen to full screen left the reader
 * blank, its top bar, page arrows and foot still laid out for the half-width
 * window. A half-screen window is the phone layout (portrait, at most 1024px);
 * full screen is the desktop spread, whose default type size follows the
 * window's width, so every passing width of a maximise asked for a new
 * chapter map. Each was measured in one synchronous task, back to back, with
 * the page hidden until the last; the browser kept showing a stale frame.
 *
 * Scenarios, in Chromium and WebKit: half to full in one step and as a
 * maximise animation, full to half, back again, and a desktop window that
 * grows. After each: the page is visible with text, the place word (the
 * reader's saved place) is on screen in the same chapter, and a desktop spread
 * reaches across the window. The longest main-thread task after each resize is
 * recorded (Chromium). Where the desktop paginator is the only work (a desktop
 * window that grows) it must stay under RESIZE_MAX_TASK_MS (default 600): the
 * chapter is laid out a few pages per task. Before, that one task was the
 * whole chapter (about 0.9-1.1 s on a cloud runner for this short chapter).
 *
 * Usage (from app/): node scripts/check-reader-resize.cjs
 *   READER_BUILT=0 checks TEST_ORIGIN (default https://tinct.app) as deployed;
 *   otherwise the local dist/ is served under that origin.
 *   READER_ENGINES=chromium,webkit   ARTIFACT_DIR=artifacts/reader-resize
 */
const { markInternal } = require('./lib/internalTraffic.cjs')
const { chromium, webkit } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')

const origin = process.env.TEST_ORIGIN || 'https://tinct.app'
const built = process.env.READER_BUILT !== '0'
const out = process.env.ARTIFACT_DIR || 'artifacts/reader-resize'
fs.mkdirSync(out, { recursive: true })

const BOOK = 'to-the-lighthouse'
const MAX_TASK_MS = Number(process.env.RESIZE_MAX_TASK_MS || 600)
// Each scenario: viewport sizes in order, and how many steps the last change takes.
const SCENARIOS = [
  { name: 'half-to-full', sizes: [[1000, 1100], [2000, 1180]], steps: 1 },
  { name: 'half-to-full-animated', sizes: [[1000, 1100], [2000, 1180]], steps: 12 },
  { name: 'full-to-half', sizes: [[2000, 1100], [1000, 1100]], steps: 1 },
  { name: 'full-half-full', sizes: [[2000, 1100], [1000, 1100], [2000, 1100]], steps: 1 },
  { name: 'desktop-grows', sizes: [[1450, 900], [1900, 1000]], steps: 1 },
]

async function state(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.lab')
    const wrap = document.querySelector('.lab-page-wrap')
    const passage = wrap && [...wrap.querySelectorAll('.lab-passage')].find(node => !node.closest('.lab-page-measure'))
    let hidden = null
    for (let node = passage; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < 0.05) { hidden = node.className; break }
    }
    const words = passage ? [...passage.querySelectorAll('[data-testid="lab-word"]')].filter(word => {
      const rect = word.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight
    }) : []
    const keys = words.map(word => word.dataset.paragraphIndex + ':' + word.dataset.wordIndex)
    return {
      width: innerWidth,
      height: innerHeight,
      layout: root?.dataset.labLayout,
      ready: root?.dataset.readerReady === 'true',
      chapter: root?.dataset.chapter,
      place: root?.dataset.place,
      hidden,
      words: words.length,
      keys,
      right: Math.max(0, ...words.map(word => word.getBoundingClientRect().right)),
      left: Math.min(innerWidth, ...words.map(word => word.getBoundingClientRect().left)),
      wrap: wrap ? wrap.getBoundingClientRect().toJSON() : null,
      bundle: [...document.scripts].map(script => script.src).find(src => /assets\/index-.*\.js/.test(src)),
    }
  })
}

async function ready(page) {
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(450)
}

/** Waits until the reader shows text again after a resize. */
async function settled(page, width) {
  await page.waitForFunction(width => {
    const root = document.querySelector('.lab')
    const passage = [...document.querySelectorAll('.lab-page-wrap .lab-passage')].find(node => !node.closest('.lab-page-measure'))
    return innerWidth === width && root?.dataset.readerReady === 'true' && passage
      && getComputedStyle(passage).visibility !== 'hidden'
      && passage.querySelectorAll('[data-testid="lab-word"]').length > 20
  }, width, { timeout: 20000 })
  await page.waitForTimeout(600)
}

async function resize(page, from, to, steps) {
  for (let step = 1; step <= steps; step += 1) {
    await page.setViewportSize({
      width: Math.round(from[0] + (to[0] - from[0]) * step / steps),
      height: Math.round(from[1] + (to[1] - from[1]) * step / steps),
    })
  }
}

;(async () => {
  const results = []
  const engines = [chromium, webkit].filter(engine => (process.env.READER_ENGINES || 'chromium,webkit').split(',').includes(engine.name()))
  for (const engine of engines) {
    const browser = await markInternal(await engine.launch({ args: engine === chromium ? ['--mute-audio'] : [] }))
    for (const scenario of SCENARIOS) {
      const name = `${engine.name()}-${scenario.name}`
      const [first] = scenario.sizes
      const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: first[0], height: first[1] } })
      if (built) await context.route('**/*', route => {
        const url = new URL(route.request().url())
        if (url.origin !== origin) return route.abort()
        const file = path.resolve('dist', '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
        return file.startsWith(path.resolve('dist') + '/') && fs.existsSync(file) && fs.statSync(file).isFile()
          ? route.fulfill({ path: file }) : route.fulfill({ status: 404, body: '{}' })
      })
      await context.route('**/api/**', route => route.fulfill({ status: 404, body: '{}' }))
      await context.route('**/*supabase.co/**', route => route.abort())
      await context.addInitScript(book => {
        HTMLMediaElement.prototype.play = async () => {}
        window.__longTasks = []
        try {
          new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__longTasks.push([entry.startTime, entry.duration]) })
            .observe({ type: 'longtask', buffered: true })
        } catch { /* WebKit has no long-task timing */ }
        if (sessionStorage.getItem('resize-seeded')) return
        sessionStorage.setItem('resize-seeded', '1')
        localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark', compareOpen: false }))
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: book, primaryEditionKey: 'original-en',
          savedPlace: { bookId: book, chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, page: 0 } }))
      }, BOOK)
      const page = await context.newPage()
      page.setDefaultTimeout(30000)
      const record = { name, checks: [] }
      try {
        await page.goto(origin + '/reader')
        await ready(page)
        // A few pages in, as in the report ("3 / 275 of book").
        for (let turn = 0; turn < 2; turn += 1) {
          const before = await page.locator('.lab').evaluate(node => node.dataset.place)
          await page.keyboard.press('ArrowRight')
          await page.waitForFunction(before => document.querySelector('.lab')?.dataset.place !== before, before)
          await ready(page)
        }
        const start = await state(page)
        assert.ok(start.words > 20 && !start.hidden, `${name}: text before the resize`)
        assert.ok(start.keys.includes(start.place), `${name}: the place word is on screen before the resize`)
        await page.screenshot({ path: path.join(out, `${name}-0-before.png`) })
        for (let index = 1; index < scenario.sizes.length; index += 1) {
          const from = scenario.sizes[index - 1], to = scenario.sizes[index]
          const last = index === scenario.sizes.length - 1
          const t0 = await page.evaluate(() => performance.now())
          await resize(page, from, to, last ? scenario.steps : 1)
          await settled(page, to[0])
          const after = await state(page)
          const longest = await page.evaluate(t0 => Math.round(Math.max(0, ...window.__longTasks.filter(([at]) => at >= t0).map(([, duration]) => duration))), t0)
          await page.screenshot({ path: path.join(out, `${name}-${index}-${to[0]}x${to[1]}.png`) })
          const check = { size: to, before: start.place, after: after.place, layout: after.layout, words: after.words, first: after.keys[0], right: Math.round(after.right), longestTaskMs: longest }
          record.checks.push(check)
          assert.equal(after.chapter, start.chapter, `${name}: same chapter after resizing to ${to}`)
          assert.equal(after.place, start.place, `${name}: the saved place is unchanged after resizing to ${to}`)
          assert.ok(after.keys.includes(start.place), `${name}: the place word ${start.place} is on screen at ${to}: ${JSON.stringify(check)}`)
          if (after.layout === 'desktop' && to[0] >= 1400) {
            // A two-leaf spread: text on both sides of the window's middle, reaching its right part.
            assert.ok(after.left < to[0] * 0.25 && after.right > to[0] * 0.75, `${name}: the spread fills ${to[0]}px: ${JSON.stringify(check)}`)
          }
          assert.ok(after.right <= to[0] + 1, `${name}: no text beyond the window`)
          if (engine === chromium && scenario.name === 'desktop-grows') {
            assert.ok(longest < MAX_TASK_MS, `${name}: re-measuring the spread kept the page responsive (longest task ${longest} ms, limit ${MAX_TASK_MS})`)
          }
        }
        results.push(record)
      } catch (error) {
        await page.screenshot({ path: path.join(out, `${name}-failure.png`) }).catch(() => {})
        record.error = String(error && error.message || error)
        results.push(record)
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2))
        throw error
      } finally {
        await context.close()
      }
    }
    await browser.close()
  }
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
})().catch(error => { console.error(error); process.exit(1) })
