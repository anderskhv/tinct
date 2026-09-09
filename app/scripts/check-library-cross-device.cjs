// Real library/reader UI and text; account, AI and audio requests are intercepted.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5191'
const engine = process.env.ENGINE || 'chromium'
const libraryPath = origin.includes('127.0.0.1') ? '/lab/library' : '/library'
const artifacts = process.env.ARTIFACT_DIR || '/tmp/tinct-library-cross-device'
const supabaseUrl = process.env.VITE_SUPABASE_URL
if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is required')
fs.mkdirSync(artifacts, { recursive: true })
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'fixture@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }
const exp = Math.floor(Date.now() / 1000) + 3600
const token = [{ alg: 'HS256', typ: 'JWT' }, { sub: user.id, exp, role: 'authenticated' }, 'fixture'].map(x => typeof x === 'string' ? x : Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')
const now = Date.now()
const pin = (bookId, updatedAt, extra = {}) => ({ bookId, headerBook: bookId, chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 2, wordIndex: 4, primaryEditionKey: 'original-en', deviceId: 'phone', rev: 1, updatedAt, ...extra })
const bible = pin('proverbs', now - 100000, { headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, primaryEditionKey: 'kjv-en' })
const midsummer = pin('midsummer', now - 200000)
const democracy = pin('democracy-in-america', now - 1000, { headerBook: 'Democracy in America' })
const local = { owner: user.id, books: { proverbs: bible, midsummer }, finished: {}, hidden: {}, lastSettledBookId: 'proverbs', lastSettledAt: bible.updatedAt, updatedAt: bible.updatedAt, deviceId: 'desktop' }
const remote = { ...local, books: { ...local.books, 'democracy-in-america': democracy, 'crime-and-punishment': pin('crime-and-punishment', now - 5000), 'the-republic': pin('the-republic', now - 10000) }, lastSettledBookId: democracy.bookId, lastSettledAt: democracy.updatedAt, updatedAt: democracy.updatedAt, deviceId: 'phone' }
async function main() {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch()
  const results = []
  let activePage, activeScenario
  try {
    for (const scenario of (process.env.SCENARIOS?.split(',') || ['pending-continue', 'return-to-library', 'direct-reader', 'explicit-book'])) {
      const page = await browser.newPage({ viewport: process.env.TEST_WIDTH ? { width: Number(process.env.TEST_WIDTH), height: 1000 } : { width: 390, height: 844 }, isMobile: !process.env.TEST_WIDTH, hasTouch: !process.env.TEST_WIDTH })
      activePage = page; activeScenario = scenario
      let server = scenario === 'return-to-library' ? local : remote
      let release
      const gate = new Promise(resolve => { release = resolve })
      let gets = 0
      const writes = []
      await page.route('**/api/**', async route => {
        if (new URL(route.request().url()).pathname === '/api/lab-position') {
          if (route.request().method() === 'PUT') { writes.push(route.request().postDataJSON()); return route.fulfill({ json: server }) }
          gets++
          if (scenario === 'pending-continue' && gets === 1) await gate
          return route.fulfill({ json: server })
        }
        return route.fulfill({ status: 404, json: {} })
      })
      await page.route(supabaseUrl + '/**', route => route.fulfill({ json: route.request().url().includes('/auth/') ? user : [] }))
      await page.addInitScript(({ key, user, token, exp, local }) => {
        window.addEventListener('tinct:lab-reader-handoff', e => sessionStorage.setItem('fixture:last-handoff', JSON.stringify(e.detail)))
        window.__focusTrace = []
        const setAttribute = Element.prototype.setAttribute
        Element.prototype.setAttribute = function(name, value) {
          if (name === 'aria-current' && value === 'true') window.__focusTrace.push({ at: performance.now(), book: this.dataset.nowBook, stack: new Error().stack })
          return setAttribute.call(this, name, value)
        }

        if (sessionStorage.getItem('cross-device-fixture')) return
        sessionStorage.setItem('cross-device-fixture', '1')
        localStorage.setItem(key, JSON.stringify({ access_token: token, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user }))
        localStorage.setItem('tinct-lab-position', JSON.stringify(local))
      }, { key: 'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token', user, token, exp, local })
      if (scenario === 'direct-reader') {
        await page.goto(origin + '/reader', { waitUntil: 'domcontentloaded' })
      } else {
        await page.goto(origin + libraryPath, { waitUntil: 'domcontentloaded' })
        await page.waitForFunction(count => document.querySelector('[data-reading-memory-recap]')?.dataset.readingNow === count, scenario === 'explicit-book' ? '5' : '2')
        if (scenario === 'explicit-book') {
          await page.locator('[data-recap-open="bible"]').click()
          if (new URL(page.url()).pathname !== '/reader') {
            await Promise.race([page.waitForURL('**/reader'), page.locator('[data-recap-continue="bible"]').click()])
          }
          await page.waitForURL('**/reader', { timeout: 20000 })
        } else if (scenario === 'pending-continue') {
          await page.locator('[data-recap-continue]').click()
          await page.waitForTimeout(250)
          assert.equal(new URL(page.url()).pathname, libraryPath, 'Local preview cannot launch a stale position while the account check is pending')
          release()
          await page.waitForURL('**/reader', { timeout: 20000 })
        } else {
          server = remote
          await page.evaluate(() => window.dispatchEvent(new Event('focus')))
          await page.waitForFunction(() => document.querySelector('[data-reading-memory-recap]')?.dataset.readingNow === '5')
          const focus = await page.locator('[data-reading-memory-recap]').getAttribute('data-book')
          if (focus !== 'democracy-in-america') fs.writeFileSync(path.join(artifacts, `${engine}-focus-debug.json`), JSON.stringify(await page.evaluate(() => window.__focusTrace), null, 2))
          assert.equal(focus, 'democracy-in-america')
          await page.screenshot({ path: path.join(artifacts, `${engine}-${scenario}.png`) })
          results.push({ scenario, books: 5, latest: 'democracy-in-america', gets })
          await page.close()
          continue
        }
      }
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', {}, { timeout: 20000 })
      const state = await page.locator('.lab').evaluate(root => ({ book: root.dataset.bookId, chapter: root.dataset.chapter, place: root.dataset.place }))
      assert.equal(state.book, scenario === 'explicit-book' ? 'bible' : democracy.bookId)
      assert.equal(state.chapter, scenario === 'explicit-book' ? '645' : '1')
      assert.equal(state.place, '2:4')
      await page.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('tinct-lab-position')).books).length === 5)
      await page.waitForTimeout(500)
      assert.equal(await page.locator('.lab').getAttribute('data-book-id'), state.book, 'Late account sync cannot replace an explicitly selected book')
      const arrow = page.getByTestId('lab-page-next')
      if (process.env.TEST_WIDTH) {
        const centres = await arrow.evaluate(button => {
          const a = button.getBoundingClientRect(), b = button.querySelector('svg').getBoundingClientRect()
          return { dx: a.x + a.width / 2 - b.x - b.width / 2, dy: a.y + a.height / 2 - b.y - b.height / 2 }
        })
        assert.ok(Math.abs(centres.dx) < 0.6 && Math.abs(centres.dy) < 0.6, JSON.stringify(centres))
      }
      await page.screenshot({ path: path.join(artifacts, `${engine}-${scenario}.png`) })
      results.push({ scenario, ...state, gets, books: 5, writes: writes.length })
      await page.close()
    }
  } catch (error) {
    if (activePage && !activePage.isClosed()) {
      await activePage.screenshot({ path: path.join(artifacts, `${engine}-failure.png`) })
      fs.writeFileSync(path.join(artifacts, `${engine}-failure.json`), JSON.stringify({ scenario: activeScenario, ...await activePage.evaluate(() => ({ root: { ...document.querySelector('.lab')?.dataset }, focus: window.__focusTrace, handoff: sessionStorage.getItem('fixture:last-handoff'), positions: localStorage.getItem('tinct-lab-position') })) }, null, 2))
    }
    throw error
  } finally { await browser.close() }
  fs.writeFileSync(path.join(artifacts, `${engine}-results.json`), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
