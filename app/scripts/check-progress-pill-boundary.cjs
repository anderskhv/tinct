/**
 * The chapter progress pill never shows a mismatched pair.
 *
 * Crossing Odyssey Book 1 into Book 2 on a phone, the pill used to read
 * "68 / 1,891 of book" for about a second and a half — the new chapter's
 * words divided by a page size a provisional map had only guessed at —
 * before settling on "50 / 1,413". This walks the boundary with a
 * MutationObserver plus a per-frame sample of the pill, and asserts that
 * every pair it ever displayed is one of the two settled pairs.
 *
 * No AI calls: /api/** is answered locally and audio is never started.
 *
 * Usage: node scripts/check-progress-pill-boundary.cjs <baseUrl> <outDir>
 */

const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const BASE = process.argv[2] || 'http://127.0.0.1:4202'
const OUT = process.argv[3] || '/tmp/tinct-progress-pill'
const EXECUTABLE = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

/** Samples the pill on every mutation and every frame, keeping each change. */
const OBSERVE = () => {
  window.__pill = []
  const record = () => {
    const el = document.querySelector('[data-testid="lab-chapter-progress"]')
    const root = document.querySelector('[data-testid="lab-root"]')
    if (!el) return
    const entry = {
      text: el.textContent || '',
      chapter: root && root.getAttribute('data-chapter'),
      t: Math.round(performance.now()),
    }
    const last = window.__pill[window.__pill.length - 1]
    if (!last || last.text !== entry.text || last.chapter !== entry.chapter) window.__pill.push(entry)
  }
  const frame = () => { try { record() } catch { /* torn-down document */ } requestAnimationFrame(frame) }
  const start = () => {
    new MutationObserver(record).observe(document.documentElement, {
      subtree: true, childList: true, characterData: true, attributes: true,
    })
    requestAnimationFrame(frame)
  }
  if (document.documentElement) start()
  else document.addEventListener('readystatechange', function once() {
    if (!document.documentElement) return
    document.removeEventListener('readystatechange', once)
    start()
  })
}

const pairOf = sample => {
  const match = /^([\d,]+) \/ ([\d,]+)/.exec(sample.text.trim())
  return match ? `${match[1]} / ${match[2]}` : null
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ executablePath: EXECUTABLE })
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  await page.route('**/api/**', route => route.fulfill({ status: 404, body: '{}' }))
  await page.addInitScript(() => {
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en', compareEditionKey: 'modern-en',
      savedPlace: { bookId: 'odyssey', chapterNumber: 1, paragraphIndex: 0, page: 0 },
    }))
  })
  await page.addInitScript(OBSERVE)
  await page.goto(`${BASE}/lab/phone?chrome=v2`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('lab-book').waitFor()
  await page.waitForTimeout(3000)

  const root = page.getByTestId('lab-root')
  assert.equal(await root.getAttribute('data-chapter'), '1', 'The walk starts in Book 1')
  await page.screenshot({ path: path.join(OUT, 'pill-book-1.png') })

  for (let i = 0; i < 400; i++) {
    if (await root.getAttribute('data-chapter') !== '1') break
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(70)
  }
  assert.equal(await root.getAttribute('data-chapter'), '2', 'The walk must cross into Book 2')
  await page.waitForTimeout(2500)
  await page.screenshot({ path: path.join(OUT, 'pill-book-2.png') })

  const samples = await page.evaluate(() => window.__pill || [])
  await browser.close()
  fs.writeFileSync(path.join(OUT, 'pill-samples.json'), JSON.stringify(samples, null, 1))
  assert.ok(samples.length > 5, 'The observer must have caught the walk')

  const inChapter1 = samples.filter(sample => sample.chapter === '1' && pairOf(sample))
  const inChapter2 = samples.filter(sample => sample.chapter === '2' && pairOf(sample))
  assert.ok(inChapter1.length > 0 && inChapter2.length > 0, 'Both sides of the boundary must be sampled')

  const settledBefore = pairOf(inChapter1[inChapter1.length - 1])
  const settledAfter = pairOf(inChapter2[inChapter2.length - 1])
  const allowed = new Set([settledBefore, settledAfter])
  const strays = inChapter2.map(pairOf).filter(pair => !allowed.has(pair))
  assert.deepEqual(strays, [], `The pill showed a pair no layout produced: ${strays.join(', ')} (settled ${settledBefore} then ${settledAfter})`)

  console.log(`pill across the boundary: ${settledBefore} → ${inChapter2.map(pairOf).join(' → ')} (${samples.length} samples)`)
}

main().catch(error => { console.error(error); process.exit(1) })
