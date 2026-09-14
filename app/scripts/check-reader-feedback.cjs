// TEST_ORIGIN=http://127.0.0.1:5192 node scripts/check-reader-feedback.cjs
const { webkit, chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5192'
const out = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-feedback-artifacts'
fs.mkdirSync(out, { recursive: true })

async function inspect(page) {
  return page.evaluate(() => {
    const passage = document.querySelector('.lab-page-wrap > .lab-passage')
    const wrap = passage.parentElement.getBoundingClientRect()
    const words = [...passage.querySelectorAll('[data-testid="lab-word"]')]
    const leaf = passage.getBoundingClientRect()
    const footer = document.querySelector('.lab-bottom-chrome').getBoundingClientRect()
    return {
      bookId: document.querySelector('.lab').dataset.bookId,
      chapter: document.querySelector('.lab').dataset.chapter,
      keys: words.map(w => `${w.dataset.paragraphIndex}:${w.dataset.wordIndex}`),
      whitespace: words.filter(w => /^\s|\s$/.test(w.textContent) && !w.querySelector('.lab-verse-mark')).map(w => w.textContent),
      bottom: Math.max(0, ...words.flatMap(w => [...w.getClientRects()].map(r => r.bottom))),
      limit: Math.min(leaf.bottom, footer.top),
      width: leaf.width, wrapWidth: wrap.width,
      endPage: passage.classList.contains('is-chapter-end-page'),
      text: words.map(w => w.textContent).join(' '),
      end: !!passage.querySelector('.lab-chapter-end'),
    }
  })
}
async function main() {
  const results = []
  for (const desktop of [false, true]) {
    const browser = await (desktop ? chromium : webkit).launch()
    try {
      const page = await browser.newPage({ viewport: desktop ? { width: 1440, height: 950 } : { width: 390, height: 650 }, isMobile: !desktop, hasTouch: !desktop })
      // Layout tests never invoke paid chat, audio, or account endpoints.
      await page.route('**/api/**', route => route.fulfill({ status: 404, body: '{}' }))
      await page.addInitScript(() => {
        if (localStorage.getItem('feedback-fixture')) return
        localStorage.setItem('feedback-fixture', '1')
        localStorage.setItem('tinct-lab-prefs', JSON.stringify({ fontFamily: 'garamond', fontSize: 1.3, theme: 'dark', compareOpen: true }))
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'the-republic', primaryEditionKey: 'original-en', savedPlace: { bookId: 'the-republic', chapterNumber: 1, paragraphIndex: 0, page: 0 } }))
      })
      await page.goto(origin + '/reader')
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
      await page.locator('.lab-page-wrap > .lab-passage').waitFor({ state: 'visible' })
      await page.waitForTimeout(300)
      const seen = new Set()
      const samples = []
      for (let i = 0; i < 15; i++) {
        const state = await inspect(page)
        assert.equal(state.bookId, 'the-republic', 'Requested source loaded')
        assert.equal(state.whitespace.length, 0, 'Word boxes exclude separator spaces')
        assert.ok(state.bottom < state.limit, `Page ${i + 1}: ink ${state.bottom} clears ${state.limit}`)
        if (!desktop) assert.equal(state.width, state.wrapWidth, 'Phone page keeps its full interactive width')
        for (const key of state.keys) { assert.ok(!seen.has(key), `Repeated word ${key}`); seen.add(key) }
        samples.push({ first: state.keys[0], last: state.keys.at(-1), bottom: state.bottom, limit: state.limit })
        if (i === 4) await page.screenshot({ path: path.join(out, (desktop ? 'desktop' : 'phone') + '-republic.png') })
        if (state.end) break
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(150)
      }
      // Exercise the reported short final-line layout with the actual mounted
      // reader CSS and event handlers, without changing the source/page map.
      if (!desktop) {
        const short = await page.evaluate(() => {
          const original = document.querySelector('.lab-page-wrap > .lab-passage')
          const wrap = document.createElement('div')
          wrap.className = 'lab-page-wrap'
          wrap.id = 'feedback-short-fixture'
          Object.assign(wrap.style, { position: 'fixed', top: '55px', left: '0', width: '390px', height: '550px', zIndex: '999', background: 'var(--lab-paper)' })
          const passage = original.cloneNode(true)
          passage.style.visibility = 'visible'
          const stage = passage.querySelector('.lab-hearing-stage')
          stage.replaceChildren(Object.assign(document.createElement('p'), { className: 'lab-hearing-line', textContent: 'his soul be at peace.' }))
          passage.querySelector('.lab-passage-header')?.remove()
          passage.querySelector('.lab-chapter-end')?.remove()
          wrap.append(passage)
          document.querySelector('.lab').append(wrap)
          return { width: passage.getBoundingClientRect().width, wrapWidth: wrap.getBoundingClientRect().width }
        })
        assert.equal(short.width, short.wrapWidth, 'A short final line must not center/shrink the page')
        await page.screenshot({ path: path.join(out, 'phone-short-tail.png') })
        await page.evaluate(() => document.querySelector('#feedback-short-fixture').remove())
        const before = await page.getByTestId('lab-root').getAttribute('data-place')
        await page.touchscreen.tap(385, 350)
        await page.waitForTimeout(200)
        assert.ok((await page.getByTestId('lab-root').getAttribute('data-place')) !== before || (await inspect(page)).endPage, 'Right edge stays tappable')
      }
      const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-prefs')))
      assert.equal((prefs.shared || prefs).compareOpen, true, 'Library handoff preserves Show Compare')
      await page.reload()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
      await page.getByTestId('lab-super').click()
      assert.ok(await page.getByTestId('lab-super-row-compare').isVisible(), 'Compare remains available after reload')
      results.push({ desktop, pages: samples, uniqueWords: seen.size, comparePersisted: true })
    } finally { await browser.close() }
  }
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
