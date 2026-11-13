// Book scroll: crossing a chapter line stays snappy (Anders, 13 Nov 2026: "super snappy, not laggy").
// On a built app (dist/), as an admin with book scroll on, the Nicomachean Ethics (ten chapters of 6,000 to 10,700
// words) is scrolled across three chapter lines. At each one the chapter at the reading line becomes the reader's own:
// - no animation frame from just before that handoff to a second after it runs longer than BOOK_SCROLL_CROSS_MAX_MS
//   (200 by default, a CI-safe bound; on a laptop the handoff takes under 100 ms, where it took up to a second when
//   both chapters were rendered again);
// - the page does not move: the word on the screen keeps its node and its place.
// Chromium only (Long Animation Frames). The longest frame anywhere in the scroll (painting a new chapter) is reported.
// cd app && npm run build && node scripts/check-book-scroll-speed.mjs   (TINCT_DIST=<dir> for another build)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const limit = Number(process.env.BOOK_SCROLL_CROSS_MAX_MS || 200)
const output = process.env.TINCT_BOOK_SCROLL_SPEED_OUTPUT || 'artifacts/book-scroll-speed'
await fs.mkdir(output, { recursive: true })
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
const origin = `http://127.0.0.1:${server.address().port}`
const ADMIN = '00000000-0000-4000-8000-00000000ad01'
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const result = { limit, crosses: [], longestAnywhere: 0, passed: false }
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.fulfill({ status: 401, json: {} })
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    return route.continue()
  })
  // An admin (a cached session and the cached site_admins answer, as check-book-scroll.mjs): book scroll on.
  await page.addInitScript(({ id }) => {
    if (!sessionStorage.getItem('book-scroll-speed-seeded')) {
      sessionStorage.setItem('book-scroll-speed-seeded', '1')
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', compareOpen: false }))
      localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'x', user: { id, email: null, user_metadata: {} } }))
      localStorage.setItem('tinct-site-admin', id)
    }
    window.__frames = []
    window.__handoffs = []
    try {
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__frames.push({ start: entry.startTime, duration: entry.duration }) })
        .observe({ type: 'long-animation-frame', buffered: true })
    } catch { window.__noFrames = true }
    const watch = () => {
      const lab = document.querySelector('.lab')
      if (!lab) { requestAnimationFrame(watch); return }
      let chapter = lab.dataset.chapter
      new MutationObserver(() => {
        if (lab.dataset.chapter === chapter) return
        chapter = lab.dataset.chapter
        window.__handoffs.push({ at: performance.now(), chapter: Number(chapter) })
      }).observe(lab, { attributes: true, attributeFilter: ['data-chapter'] })
    }
    requestAnimationFrame(watch)
  }, { id: ADMIN })
  // Near the end of Book 1 (9,026 words), so that Books 2, 3 and 4 become the reader's own in turn.
  await page.goto(`${origin}/reader?book=nicomachean-ethics&edition=original-en&chapter=1&paragraph=100&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  assert.equal(await page.locator('[data-book-scroll-unit]').getAttribute('data-book-scroll-unit'), 'nicomachean-ethics/book', 'the whole book scrolls')
  assert.ok(!(await page.evaluate(() => window.__noFrames)), 'this Chromium reports long animation frames')
  await page.waitForTimeout(3000)
  const own = () => page.locator('.lab').evaluate(node => Number(node.dataset.chapter))
  const first = await own()
  assert.equal(first, 1, 'Book 1 is the reader\'s own')
  await page.locator('[data-book-scroll-unit]').hover({ position: { x: 300, y: 400 } })
  const scrollFrom = await page.evaluate(() => performance.now())
  for (const target of [2, 3, 4]) {
    if (target > 2) {
      // Jump to a screen above the next chapter line, and let the page settle (its neighbour is painted).
      await page.evaluate(target => {
        const host = document.querySelector('[data-book-scroll-unit]')
        const next = host.querySelector(`[data-book-scroll-chapter="${target}"]`)
        host.scrollTop = next.getBoundingClientRect().top - host.getBoundingClientRect().top + host.scrollTop - 2500
      }, target)
      await page.waitForTimeout(2500)
    }
    // Wheel until the chapter's heading has passed the reading line, then rest: the reader takes the chapter over.
    const passed = () => page.evaluate(target => {
      const host = document.querySelector('[data-book-scroll-unit]')
      const block = host.querySelector(`[data-book-scroll-chapter="${target}"]`)
      return !!block && block.getBoundingClientRect().top < host.getBoundingClientRect().top + 100
    }, target)
    for (let step = 0; step < 200 && !(await passed()) && await own() !== target; step++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(40) }
    // The word in the middle of the screen, before the handoff (unless a wheel's rest already let it happen).
    const before = await page.evaluate(() => {
      const host = document.querySelector('[data-book-scroll-unit]')
      const box = host.getBoundingClientRect()
      const word = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('[data-word-index]')
      if (!word) return null
      window.__held = word
      return { top: word.getBoundingClientRect().top, scrollTop: host.scrollTop, chapter: Number(document.querySelector('.lab').dataset.chapter) }
    })
    const from = await page.evaluate(() => performance.now())
    await page.waitForFunction(target => Number(document.querySelector('.lab')?.dataset.chapter) === target, target, { timeout: 10000 })
    await page.waitForTimeout(1200)
    const after = await page.evaluate(() => {
      const host = document.querySelector('[data-book-scroll-unit]')
      const word = window.__held
      return word ? { connected: word.isConnected, top: word.getBoundingClientRect().top, scrollTop: host.scrollTop } : null
    })
    const data = await page.evaluate(() => ({ frames: window.__frames, handoffs: window.__handoffs }))
    const handoff = data.handoffs.find(item => item.chapter === target)
    assert.ok(handoff, `Book ${target} became the reader's own`)
    const frames = data.frames.filter(frame => frame.start + frame.duration >= Math.max(from, handoff.at - 400) && frame.start <= handoff.at + 1000)
    const longest = Math.round(Math.max(0, ...frames.map(frame => frame.duration)))
    const cross = { chapter: target, longest, frames: frames.map(frame => Math.round(frame.duration)) }
    if (before && after && before.chapter !== target) {
      cross.wordMoved = Math.round((after.top - before.top) * 10) / 10
      cross.scrolled = Math.round(after.scrollTop - before.scrollTop)
      cross.sameNode = after.connected
    }
    result.crosses.push(cross)
    console.log(`Book ${target}: longest frame at the handoff ${longest} ms`, cross)
    assert.ok(longest <= limit, `the handoff to Book ${target} held the main thread for ${longest} ms (at most ${limit})`)
    if (cross.wordMoved != null) {
      assert.ok(cross.sameNode, `the word on the screen keeps its node when Book ${target} becomes the reader's own`)
      assert.ok(Math.abs(cross.wordMoved) <= 1, `the word on the screen stays where it is (${cross.wordMoved} px)`)
    }
  }
  result.longestAnywhere = Math.round(Math.max(0, ...(await page.evaluate(() => window.__frames)).filter(frame => frame.start >= scrollFrom).map(frame => frame.duration)))
  console.log(`Longest frame anywhere in the scroll (painting a chapter as it nears): ${result.longestAnywhere} ms`)
  assert.ok(result.crosses.some(cross => cross.wordMoved != null), 'at least one handoff was watched from before it happened')
  assert.deepEqual(errors, [])
  result.passed = true
} finally {
  await fs.writeFile(`${output}/result.json`, JSON.stringify(result, null, 2))
  await browser.close()
  server.close()
}
