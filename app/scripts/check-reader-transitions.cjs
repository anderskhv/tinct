// Run from app/: TEST_ORIGIN=http://127.0.0.1:5191 ENGINE=webkit node scripts/check-reader-transitions.cjs
// Uses real browser layout, chapter data and audiobook playback. No AI calls.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const engine = process.env.ENGINE || 'webkit'
const artifactDir = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-transitions'
fs.mkdirSync(artifactDir, { recursive: true })

async function snapshot(page) {
  return page.locator('.lab-page-wrap > .lab-passage').evaluate(el => {
    const words = [...el.querySelectorAll('[data-word-index][data-paragraph-index]')]
    const key = n => `${n.dataset.paragraphIndex}:${n.dataset.wordIndex}`
    const chrome = document.querySelector('.lab-bottom-chrome').getBoundingClientRect()
    return {
      keys: words.map(key), text: el.textContent,
      lastBottom: Math.max(...words.map(n => n.getBoundingClientRect().bottom)),
      chromeTop: chrome.top, transport: document.querySelector('.lab').dataset.transport,
    }
  })
}
async function turn(page, key) {
  await page.keyboard.press(key)
  await page.waitForTimeout(120)
  const immediate = await snapshot(page)
  await page.waitForTimeout(180)
  const settled = await snapshot(page)
  assert.deepEqual(settled.keys, immediate.keys, 'Page must not change after its first paint')
  assert.ok(settled.lastBottom < settled.chromeTop, 'Text must clear the progress/audio controls')
  return settled
}
async function swap(page) {
  await page.getByTestId('lab-book').evaluate(el => {
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 71, pointerType: 'touch', clientX: 190, clientY: 400 }))
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 71, pointerType: 'touch', clientX: 190, clientY: 270 }))
  })
  await page.waitForTimeout(250)
}
async function main() {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch()
  const results = []
  try {
    for (const chapter of [788, 789]) {
      const page = await browser.newPage({ viewport: { width: 393, height: 664 }, isMobile: true, hasTouch: true })
      await page.addInitScript(chapterNumber => {
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
          kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'kjv-en', compareEditionKey: 'web-en',
          savedPlace: { bookId: 'bible', chapterNumber, paragraphIndex: 0, page: 0 },
        }))
      }, chapter)
      await page.goto(`${process.env.TEST_ORIGIN || 'https://tinct.app'}/reader`, { waitUntil: 'domcontentloaded' })
      await page.getByTestId('lab-book').waitFor()
      await page.waitForTimeout(3000)
      await page.screenshot({ path: path.join(artifactDir, `${engine}-${chapter}-initial.png`) })
      await page.getByTestId('lab-v2-play').click()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing === 'true', {}, { timeout: 20000 })
      await page.waitForTimeout(400)
      await page.getByTestId('lab-v2-play').click()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing === 'false')
      await page.waitForTimeout(350)
      const first = await snapshot(page)
      assert.equal(first.transport, 'open')
      const expected = await page.getByTestId('lab-native-page-measure').first().locator('[data-native-word]').evaluateAll(nodes => nodes.map(n => `${n.dataset.paragraphIndex}:${n.dataset.wordIndex}`))
      const all = [...first.keys]
      const counts = [first.keys.length]
      const texts = [first.keys]
      for (let i = 0; i < 60 && all.length < expected.length; i++) {
        const next = await turn(page, 'ArrowRight')
        assert.equal(next.transport, 'open', 'Paused paging must retain a stable audio layout')
        assert.notDeepEqual(next.keys, texts.at(-1), 'Every turn must advance')
        if (all.length + next.keys.length < expected.length) assert.ok(next.keys.length >= 20, 'No tiny interior fragment pages')
        all.push(...next.keys)
        texts.push(next.keys)
        counts.push(next.keys.length)
      }
      assert.deepEqual(all, expected, 'Every chapter word must appear exactly once, in order')
      for (let i = texts.length - 2; i >= 0; i--) assert.deepEqual((await turn(page, 'ArrowLeft')).keys, texts[i], 'Back restores the same page')
      await turn(page, 'ArrowRight')
      await turn(page, 'ArrowRight')
      const primary = await snapshot(page)
      const place = await page.getByTestId('lab-root').getAttribute('data-place')
      await swap(page)
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-compare-active'), 'true')
      const compare = await snapshot(page)
      assert.ok(compare.keys.length >= 20, 'Compare must display a full measured page')
      await page.screenshot({ path: path.join(artifactDir, `${engine}-${chapter}-compare.png`) })
      await swap(page)
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-compare-active'), 'false')
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'), place, 'Compare must preserve primary position')
      assert.deepEqual((await snapshot(page)).keys, primary.keys, 'Return from Compare restores the primary page')
      await page.getByRole('button', { name: 'Close audio controls' }).click()
      await page.waitForTimeout(250)
      const closed = await snapshot(page)
      assert.equal(closed.transport, 'closed')
      assert.ok(closed.keys.includes(place), 'Closing transport must keep the same word in view')
      await page.screenshot({ path: path.join(artifactDir, `${engine}-${chapter}-closed.png`) })
      await page.getByTestId('lab-v2-play').click()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing === 'true')
      await page.waitForTimeout(250)
      const browsed = await turn(page, 'ArrowRight')
      await page.getByTestId('lab-back-to-audio').waitFor()
      await page.setViewportSize({ width: 393, height: 724 })
      await page.waitForTimeout(250)
      assert.ok((await snapshot(page)).keys.includes(browsed.keys[0]), 'Resize while listening must preserve the browsing word')
      await page.getByTestId('lab-back-to-audio').click()
      await page.waitForTimeout(250)
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-playing'), 'true')
      assert.ok((await snapshot(page)).keys.length >= 20)
      results.push({ chapter, words: all.length, pageWords: counts, compareWords: compare.keys.length })
      await page.close()
    }
    console.log(JSON.stringify({ engine, results, artifactDir }, null, 2))
  } finally { await browser.close() }
}
main().catch(e => { console.error(e); process.exitCode = 1 })
