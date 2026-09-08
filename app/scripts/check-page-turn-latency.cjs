// Run from app/: TEST_ORIGIN=http://127.0.0.1:5191 node scripts/check-page-turn-latency.cjs
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')

async function main() {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 664 } })
    await page.goto(`${process.env.TEST_ORIGIN || 'http://127.0.0.1:5191'}/lab/?book=the-republic&view=book-detail`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Start reading', exact: true }).click()
    await page.waitForURL('**/lab/reader**')
    await page.waitForTimeout(1500)
    await page.keyboard.press('ArrowRight') // Dismiss the cover.
    await page.getByTestId('lab-book').waitFor()
    await page.waitForTimeout(1000)
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const samples = []
    const texts = []
    async function turn(key) {
      return page.evaluate(async (key) => {
        const start = performance.now()
        window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        const passage = document.querySelector('.lab-page-wrap > .lab-passage')
        const stage = passage.querySelector('.lab-hearing-stage')
        return {
          ms: Math.round(performance.now() - start),
          text: passage.textContent,
          animation: getComputedStyle(stage).animationDuration,
          opacity: getComputedStyle(stage).opacity,
        }
      }, key)
    }
    for (let i = 0; i < 8; i++) {
      const sample = await turn('ArrowRight')
      assert.equal(sample.animation, '0s')
      assert.equal(sample.opacity, '1')
      assert.ok(sample.text.length > 40)
      assert.notEqual(sample.text, texts.at(-1))
      texts.push(sample.text)
      samples.push(sample.ms)
      // The new page must stay put after effects settle.
      await page.waitForTimeout(240)
      assert.equal(await page.locator('.lab-page-wrap > .lab-passage').textContent(), sample.text)
    }
    for (let i = texts.length - 2; i >= 0; i--) {
      assert.equal((await turn('ArrowLeft')).text, texts[i], 'Back must restore the same page')
    }
    const median = [...samples].sort((a,b) => a-b)[Math.floor(samples.length / 2)]
    assert.ok(median < 500, `Page turns regressed to repeated layout: median ${median}ms at 4x CPU throttle`)
    const artifact = process.env.ARTIFACT_PATH || '/tmp/tinct-page-turns.png'
    await page.screenshot({ path: artifact })
    console.log(JSON.stringify({ samples, median, artifact }))
    if (process.env.RESULT_PATH) fs.writeFileSync(process.env.RESULT_PATH, JSON.stringify({ samples, median, artifact }, null, 2))
  } finally {
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
