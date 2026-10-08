// Reader chrome and type polish (Anders, 8 Oct 2026), against a running reader
// (TEST_ORIGIN, default the dev server on :3001). Headless Chromium, no
// network beyond the origin: every /api call is answered 404.
//
// Desktop 1440x900, light and dark, and 1280/1728 for the default size:
//   - the chapter pill's label is never clipped, any length: its text and its
//     italic ink fit the label box ("Ezra 9", "Psalms 119");
//   - a reader who never set a size reads at about 65-75 characters a line;
//   - dark paper has no visible frame line round the leaf;
//   - folios and chapter progress are set as the phone sets its progress line
//     (the reading face, 12px).
// Phone 390x844 (Bible, WEB and BSB):
//   - a verse number is followed by the narrow no-break space (U+202F), which
//     a justified line never stretches;
//   - no paragraph's last line is justified: only a page tail whose paragraph
//     continues may be (and verse lines never are).
// ARTIFACT_DIR keeps screenshots (default /tmp/tinct-reader-chrome-polish).
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const { markInternal } = require('./lib/internalTraffic.cjs')

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:3001'
const out = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-chrome-polish'
fs.mkdirSync(out, { recursive: true })

async function open(browser, { bookId, edition, chapter, width, height, mobile = false, scheme = 'light' }) {
  const page = await browser.newPage({ serviceWorkers: 'block', viewport: { width, height }, isMobile: mobile, hasTouch: mobile, colorScheme: scheme })
  await page.route('**/api/**', route => route.fulfill({ status: 404, body: '{}' }))
  await page.goto(`${origin}/reader?book=${bookId}&edition=${edition}&chapter=${chapter}`)
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true'
    && document.querySelector('.lab-page-wrap > .lab-passage [data-testid="lab-word"]'), null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
  return page
}

const results = []
const browser = await markInternal(await chromium.launch())
try {
  // Desktop: pill, frame, folios.
  for (const [bookId, chapter, scheme] of [['bible', 412, 'light'], ['bible', 412, 'dark'], ['bible', 597, 'light']]) {
    const page = await open(browser, { bookId, edition: 'web-en', chapter, width: 1440, height: 900, scheme })
    const r = await page.evaluate(() => {
      const label = document.querySelector('.lab-header-chapter-label')
      const style = getComputedStyle(label)
      const ctx = document.createElement('canvas').getContext('2d')
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const ink = ctx.measureText(label.textContent)
      const wrap = getComputedStyle(document.querySelector('[data-testid="lab-page-wrap"]'))
      const reader = getComputedStyle(document.querySelector('.lab-page-wrap > .lab-passage .lab-hearing-line')).fontFamily
      const folio = getComputedStyle(document.querySelector('[data-testid="lab-desktop-page-footers"]'))
      const progress = getComputedStyle(document.querySelector('.lab-chapter-progress-info'))
      return {
        text: label.textContent, scrollWidth: label.scrollWidth, clientWidth: label.clientWidth, scrollHeight: label.scrollHeight, clientHeight: label.clientHeight,
        inkRight: ink.actualBoundingBoxRight,
        padRight: parseFloat(style.paddingRight), textWidth: ink.width,
        night: document.querySelector('.lab').classList.contains('is-night'), border: wrap.borderTopColor,
        reader, folio: [folio.fontFamily, folio.fontSize], progress: [progress.fontFamily, progress.fontSize],
      }
    })
    assert.ok(r.scrollWidth <= r.clientWidth && r.scrollHeight <= r.clientHeight, `Chapter label "${r.text}" overflows its box: ${JSON.stringify(r)}`)
    assert.ok(r.inkRight <= r.textWidth + r.padRight, `Italic ink of "${r.text}" passes the label's right edge: ${JSON.stringify(r)}`)
    if (r.night) assert.match(r.border, /rgba\(.*,\s*0\)|transparent/, `Dark leaf shows a frame line: ${r.border}`)
    assert.equal(r.folio[0], r.reader, 'Folios in the reading face')
    assert.equal(r.progress[0], r.reader, 'Chapter progress in the reading face')
    assert.deepEqual([r.folio[1], r.progress[1]], ['12px', '12px'])
    await page.screenshot({ path: `${out}/desktop-${chapter}-${scheme}.png` })
    results.push({ desktop: `${chapter} ${scheme}`, label: r.text })
    await page.close()
  }

  // Desktop default size: characters per line in the default face, per window.
  for (const [width, height] of [[1280, 800], [1440, 900], [1728, 1117]]) {
    const page = await open(browser, { bookId: 'pride-and-prejudice', edition: 'original-en', chapter: 2, width, height })
    const cpl = await page.evaluate(() => {
      const paragraphs = [...document.querySelectorAll('.lab-page-wrap > .lab-passage p.lab-hearing-line')]
      const style = getComputedStyle(paragraphs[0])
      const ctx = document.createElement('canvas').getContext('2d')
      ctx.font = `${style.fontSize} ${style.fontFamily}`
      const text = paragraphs.map(p => p.textContent).join(' ').replace(/\s+/g, ' ')
      return Math.round(paragraphs[0].getBoundingClientRect().width / (ctx.measureText(text).width / text.length))
    })
    assert.ok(cpl >= 60 && cpl <= 78, `${width}px: ${cpl} characters a line`)
    results.push({ width, charactersPerLine: cpl })
    await page.close()
  }

  // Phone: verse spacing and paragraph-final lines.
  for (const [edition, chapter] of [['web-en', 927], ['bsb-en', 648]]) {
    const page = await open(browser, { bookId: 'bible', edition, chapter, width: 390, height: 844, mobile: true })
    for (let turn = 0; turn < 4; turn += 1) {
      const r = await page.evaluate(() => {
        const passage = document.querySelector('.lab-page-wrap > .lab-passage')
        const units = [...passage.querySelectorAll('.lab-verse-unit')].map(unit => unit.textContent)
        const justifiedEnds = [...passage.querySelectorAll('p.lab-hearing-line, .lab-verse-line')]
          .filter(block => getComputedStyle(block).textAlignLast === 'justify')
          .filter(block => !(block.matches('p.is-continued[data-tail-full="true"]')))
          .map(block => block.textContent.slice(-40))
        return { units, justifiedEnds }
      })
      assert.ok(r.units.every(text => /^\d+ \S/.test(text)), `Verse unit spacing: ${JSON.stringify(r.units)}`)
      assert.deepEqual(r.justifiedEnds, [], 'A paragraph-final line is justified')
      if (turn === 0) await page.screenshot({ path: `${out}/phone-${edition}-${chapter}.png` })
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(250)
    }
    results.push({ phone: `${edition} ${chapter}`, ok: true })
    await page.close()
  }
  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
