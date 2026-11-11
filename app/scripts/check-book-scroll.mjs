// Whole-book scroll (admin try-out, Anders 11 Nov 2026): off for everyone but a site admin.
// Non-admin: no book-scroll DOM, even with ?bookScroll=1. Admin (a cached Supabase session plus the cached
// site_admins answer for that user, all network to Supabase refused): book scroll on by default, the Bible scrolls
// one biblical book, chapter ends say Summary, transcripts keep their bold speakers, reload keeps the exact word,
// and Appearance › Whole-book scroll turns it off and on for this device at the same place.
// Run against a dev or preview server: TINCT_ORIGIN=http://127.0.0.1:5175 node scripts/check-book-scroll.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5175'
const output = process.env.TINCT_BOOK_SCROLL_OUTPUT || 'artifacts/book-scroll'
await fs.mkdir(output, { recursive: true })
const ADMIN = '00000000-0000-4000-8000-00000000ad01'
const results = []

async function open(engine, name, admin) {
  const browser = await markInternal(await engine.launch({ headless: true }))
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.fulfill({ status: 401, json: {} })
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    return route.continue()
  })
  await page.addInitScript(({ admin, id }) => {
    if (sessionStorage.getItem('book-scroll-seeded')) return
    sessionStorage.setItem('book-scroll-seeded', '1')
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', compareOpen: false }))
    if (admin) {
      localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'x', user: { id, email: null, user_metadata: {} } }))
      localStorage.setItem('tinct-site-admin', id)
    }
  }, { admin, id: ADMIN })
  const ready = () => page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  return { browser, page, errors, ready, name }
}

for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  // Everyone else: the one-chapter reader, whatever the link says.
  {
    const s = await open(engine, name, false)
    const result = { engine: name, run: 'non-admin', passed: false }
    try {
      for (const q of ['', '&bookScroll=1']) {
        await s.page.goto(`${origin}/reader?book=bible&edition=kjv-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop${q}`, { waitUntil: 'domcontentloaded' }); await s.ready()
        assert.equal(await s.page.locator('[data-book-scroll-unit]').count(), 0, `no book scroll for a non-admin (${q || 'no switch'})`)
        await s.page.getByRole('slider', { name: 'Chapter position', exact: true }).waitFor()
      }
      await s.page.getByTestId('lab-header-aa').click()
      assert.equal(await s.page.getByTestId('lab-v2-book-scroll').count(), 0, 'no Whole-book scroll switch for a non-admin')
      assert.deepEqual(s.errors, [])
      result.passed = true
    } catch (error) { result.error = error.stack; await s.page.screenshot({ path: `${output}/${name}-non-admin-failure.png` }).catch(() => {}) }
    finally { await s.browser.close(); results.push(result) }
  }
  // An admin: book scroll on by default.
  {
    const s = await open(engine, name, true)
    const result = { engine: name, run: 'admin', passed: false }
    const { page } = s
    try {
      // Opening deep in a long unit lands on the chapter asked for, after the placeholders above it take their
      // measured heights (11 Nov 2026, default edition: Genesis 30 opened on Genesis 19, Psalm 22 on Psalm 1).
      for (const [chapter, unit] of [[30, 'bible/Genesis/1'], [500, 'bible/Psalms/479']]) {
        await page.goto(`${origin}/reader?book=bible&chapter=${chapter}&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
        assert.equal(await page.locator('[data-book-scroll-unit]').getAttribute('data-book-scroll-unit'), unit)
        await page.waitForTimeout(2500)
        const atLine = await page.locator('[data-book-scroll-unit]').evaluate(node => {
          const box = node.getBoundingClientRect()
          const word = [...node.querySelectorAll('[data-testid="lab-word"], [data-testid="lab-opening-word"]')].find(item => item.getBoundingClientRect().top >= box.top + 60)
          return word ? `${word.closest('[data-book-scroll-chapter]')?.getAttribute('data-book-scroll-chapter')}/${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : 'none'
        })
        assert.equal(atLine, `${chapter}/0:0`, `chapter ${chapter} opens at its first word`)
      }
      await page.goto(`${origin}/reader?book=bible&edition=kjv-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      const host = page.locator('[data-book-scroll-unit]')
      await host.waitFor()
      assert.equal(await host.getAttribute('data-book-scroll-unit'), 'bible/Genesis/1', 'the Bible scrolls one biblical book')
      await page.getByRole('slider', { name: 'Book position', exact: true }).waitFor()
      assert.equal(await page.locator('[data-map-chapter-mark]').count(), 50, "Genesis's overview marks its fifty chapters")
      // Chapter ends say Summary.
      await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      const scroller = page.locator('[data-book-scroll-unit]')
      await scroller.hover()
      for (let step = 0; step < 24 && !(await page.getByRole('button', { name: 'Summary of this chapter', exact: true }).count()); step++) {
        await page.mouse.wheel(0, 700); await page.waitForTimeout(80)
      }
      for (const label of ['Summary of this chapter', 'Quiz me on this chapter', 'Chapter note']) await page.getByRole('button', { name: label, exact: true }).first().waitFor()
      assert.equal(await page.getByRole('button', { name: /^Recap/ }).count(), 0, 'no Recap pill at a chapter end')
      // Transcripts keep their bold speakers.
      await page.goto(`${origin}/reader?book=bold-conjectures-volume-1&edition=original-en&chapter=3&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      await page.locator('.lab-transcript-speaker').first().waitFor()
      assert.equal(await page.locator('.lab-transcript-speaker').first().evaluate(node => getComputedStyle(node).fontWeight), '600', 'speaker names are bold in book scroll')
      // Reload keeps the exact word.
      await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=3&paragraph=4&word=6&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      await page.waitForTimeout(1500)
      const place = await page.locator('.lab').evaluate(node => node.dataset.chapter + '/' + node.dataset.place)
      await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' }); await s.ready(); await page.waitForTimeout(1500)
      assert.equal(await page.locator('.lab').evaluate(node => node.dataset.chapter + '/' + node.dataset.place), place, 'reload keeps the exact word')
      // Appearance › Whole-book scroll: off, same place; on again.
      const toggle = async expected => {
        await page.getByTestId('lab-header-aa').click()
        const sw = page.getByTestId('lab-v2-book-scroll')
        await sw.waitFor()
        assert.equal(await sw.getAttribute('aria-checked'), String(!expected))
        await page.screenshot({ path: `${output}/${name}-appearance-switch-${expected ? 'on' : 'off'}.png` })
        await Promise.all([page.waitForEvent('load'), sw.click()])
        await s.ready(); await page.waitForTimeout(1500)
        assert.equal(await page.locator('[data-book-scroll-unit]').count(), expected ? 1 : 0, `book scroll ${expected ? 'on' : 'off'} after the switch`)
        assert.equal(await page.locator('.lab').evaluate(node => node.dataset.chapter + '/' + node.dataset.place), place, 'the switch keeps the place')
      }
      await toggle(false)
      await toggle(true)
      assert.deepEqual(s.errors, [])
      result.passed = true
    } catch (error) { result.error = error.stack; await page.screenshot({ path: `${output}/${name}-admin-failure.png` }).catch(() => {}) }
    finally { await s.browser.close(); results.push(result) }
  }
}
console.log(JSON.stringify(results, null, 2))
if (results.some(result => !result.passed)) process.exit(1)
