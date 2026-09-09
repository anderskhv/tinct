// Run from app/: TEST_ORIGIN=https://tinct.app ENGINE=webkit node scripts/check-reader-return.cjs
// Isolated fixture account; every account request/write is intercepted. Real book text and browser layout.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5191'
const engine = process.env.ENGINE || 'chromium'
const artifacts = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-return'
fs.mkdirSync(artifacts, { recursive: true })
const supabaseUrl = process.env.VITE_SUPABASE_URL
if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is required for the intercepted fixture session')
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'fixture@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }
const exp = Math.floor(Date.now() / 1000) + 3600
const token = [{ alg: 'HS256', typ: 'JWT' }, { sub: user.id, exp, role: 'authenticated' }, 'fixture'].map(x => typeof x === 'string' ? x : Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')
async function main() {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch()
  const results = []
  try {
    for (const scenario of ['slow-supporting-data', 'slow-position', 'different-book']) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
      let release
      const gate = new Promise(resolve => { release = resolve })
      const now = Date.now()
      const local = { bookId: 'jeremiah', headerBook: 'Jeremiah', chapterNumber: 44, sequentialChapter: 789, paragraphIndex: 2, wordIndex: 3, primaryEditionKey: 'kjv-en', updatedAt: now - 100000, deviceId: 'laptop', rev: 1 }
      const remote = scenario === 'different-book'
        ? { ...local, bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2, sequentialChapter: 2, primaryEditionKey: 'original-en', paragraphIndex: 1, wordIndex: 4, updatedAt: now - 1000, deviceId: 'phone' }
        : { ...local, bookId: 'proverbs', headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, paragraphIndex: 3, wordIndex: 7, updatedAt: now - 1000, deviceId: 'phone' }
      const record = { owner: user.id, books: { jeremiah: local, [remote.bookId]: remote }, finished: {}, hidden: {}, lastSettledBookId: remote.bookId, lastSettledAt: remote.updatedAt, updatedAt: remote.updatedAt, deviceId: 'phone' }
      const holdSupporting = scenario !== 'slow-position'
      await page.route('**/api/**', async route => {
        const pathname = new URL(route.request().url()).pathname
        if (pathname === '/api/lab-position') {
          await new Promise(resolve => setTimeout(resolve, scenario === 'slow-position' ? 4000 : 250))
          return route.fulfill({ json: record })
        }
        if (pathname.includes('audio-manifest')) { if (holdSupporting) await gate; return route.fulfill({ json: { paragraphs: [] } }) }
        return route.fulfill({ status: 404, json: {} })
      })
      await page.route('**/*threads.json*', async route => { if (holdSupporting) await gate; return route.fulfill({ json: { characters: [] } }) })
      await page.route(supabaseUrl + '/**', route => route.fulfill({ json: route.request().url().includes('/auth/') ? user : [] }))
      await page.addInitScript(({ key, user, token, exp, local }) => {
        localStorage.setItem(key, JSON.stringify({ access_token: token, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user }))
        localStorage.setItem('tinct-lab-position', JSON.stringify({ owner: user.id, books: { jeremiah: local }, finished: {}, hidden: {}, lastSettledBookId: 'jeremiah', lastSettledAt: local.updatedAt, updatedAt: local.updatedAt, deviceId: 'laptop' }))
        const poll = () => {
          const root = document.querySelector('.lab')
          const passage = document.querySelector('.lab-page-wrap > .lab-passage')
          if (!window.firstPaint && root?.dataset.readerReady === 'true' && passage && getComputedStyle(passage).visibility !== 'hidden') {
            window.firstPaint = { at: performance.now(), chapter: root.dataset.chapter, place: root.dataset.place, book: root.dataset.bookId }
          }
          requestAnimationFrame(poll)
        }
        requestAnimationFrame(poll)
      }, { key: 'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token', user, token, exp, local })
      await page.goto(origin + '/reader', { waitUntil: 'domcontentloaded' })
      if (scenario === 'slow-position') {
        await page.waitForTimeout(3200)
        assert.equal(await page.evaluate(() => window.firstPaint || null), null, 'Never reveal local progress while the account position is still pending')
      }
      await page.waitForFunction(() => window.firstPaint, {}, { timeout: 15000 })
      const first = await page.evaluate(() => window.firstPaint)
      assert.equal(first.chapter, String(remote.sequentialChapter))
      assert.equal(first.place, `${remote.paragraphIndex}:${remote.wordIndex}`)
      assert.equal(first.book, remote.bookId === 'odyssey' ? 'odyssey' : 'bible')
      release()
      await page.waitForTimeout(700)
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'), first.place, 'Supporting data must not reset the saved word')
      const savedWord = page.locator(`.lab-page-wrap > .lab-passage [data-paragraph-index="${remote.paragraphIndex}"][data-word-index="${remote.wordIndex}"]`).first()
      await savedWord.waitFor({ state: 'visible' })
      await page.screenshot({ path: path.join(artifacts, `${engine}-${scenario}.png`) })
      results.push({ scenario, first })
      await page.close()
    }
  } finally { await browser.close() }
  fs.writeFileSync(path.join(artifacts, `${engine}-return-results.json`), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
