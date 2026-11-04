// A tint never moves a word (Anders, 4 Nov 2026: "the text moves when I do the
// explain move", own EPUB in Margin, justified and hyphenated).
//   cd app && npm run build && node scripts/check-tint-no-reflow.mjs
// The built app is served from dist/ under https://tinct.app by request
// interception; every other request is refused and the AI routes answer with a
// local fixture, so nothing leaves the machine. Two books in desktop Margin:
// a synthetic own EPUB (seeded into IndexedDB as Add a book keeps it) at three
// widths, and Frankenstein. For every word on the reading page the check records
// which line of its paragraph it sits on and its x within the paragraph, then
// requires both to be unchanged (within 0.05px) while a passage is being
// dragged, once it is selected, while an Ask is typed about it, after the
// answer's card opens, after the folded card is opened again, and when the
// passage is saved as a highlight. Each tinted state must actually paint.
// TINT_ENGINES=chromium,webkit picks engines (default chromium);
// TINT_SHOTS=<dir> writes a screenshot per state.
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const origin = 'https://tinct.app'
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const shots = process.env.TINT_SHOTS || ''
if (shots) await fs.mkdir(shots, { recursive: true })
const engines = (process.env.TINT_ENGINES || 'chromium').split(',')

// Synthetic prose with long words, italics, curly quotes and a spaced dash, so
// justified lines are tight and the browser hyphenates some of them.
const LONG = 'Most forms of universality themselves refer to some sort of measurement – though they can always be interpreted in terms of something being <em>unlimited</em> rather than actually infinite. This is what opponents of measurement call a ‘potential quantity’ rather than a ‘realized’ one. For instance, the beginning of progress can be described either as a condition where progress in the future will be <em>unbounded</em> or as the condition where ‘an <em>indefinite</em> amount of progress will be made. But I use those concepts interchangeably, because in this context there is no substantive difference between them.'
const SHORT = 'There is a philosophy of mathematics called finitism, the doctrine that only finite abstract entities exist. So, for instance, there are infinitely many natural numbers, but finitists insist that that is just a manner of speaking. They say that the literal truth is only that there is a finite rule for generating each natural number from the previous one, and nothing literally infinite is involved.'
const PARAGRAPHS = [SHORT, LONG, SHORT, LONG, SHORT, LONG, SHORT]
const HEX = 'ab'.repeat(12)

function ownEpub() {
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">own-tint</dc:identifier><dc:title>Own Tint</dc:title><dc:creator>Test Author</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>'],
    ['OEBPS/nav.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="c1.xhtml">Window</a></li></ol></nav></body></html>'],
    ['OEBPS/c1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Window</h1>${PARAGRAPHS.map(text => `<p>${text}</p>`).join('')}</body></html>`],
  ])
}

const CASES = process.env.TINT_CASE ? [{ name: process.env.TINT_CASE, book: process.env.TINT_CASE.split('-')[0], width: Number(process.env.TINT_CASE.split('-')[1]) }] : [
  { name: 'own-1366', book: 'own', width: 1366 },
  { name: 'own-1440', book: 'own', width: 1440 },
  { name: 'own-1600', book: 'own', width: 1600 },
  { name: 'frankenstein-1440', book: 'frankenstein', width: 1440 },
]

async function serveDist(context) {
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.abort()
    if (/\/api\/(?:lab-chat|chat)$/.test(url.pathname)) {
      return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'A local answer about this passage.' } })}\n\ndata: {"type":"message_stop"}\n\n` })
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    if (route.request().method() !== 'GET') return route.abort()
    if (url.pathname === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    const filename = path.resolve(dist, `.${url.pathname === '/reader' ? '/app.html' : url.pathname}`)
    if (!filename.startsWith(`${dist}/`)) return route.abort()
    try { if ((await fs.stat(filename)).isFile()) return route.fulfill({ path: filename }) } catch {}
    return route.fulfill({ status: 404, body: '' })
  })
}

const HOST = '[data-testid="continuous-reader"]'

/** Per paragraph, per word: [line within the paragraph, x within the paragraph] for each of its boxes. */
const layout = page => page.evaluate(host => [...document.querySelectorAll(`${host} .lab-hearing-line`)].map(p => {
  const box = p.getBoundingClientRect(), tops = []
  return [...p.querySelectorAll('[data-testid="lab-word"]')].map(word => [...word.getClientRects()].filter(rect => rect.width > 0).map(rect => {
    const top = Math.round(rect.top - box.top)
    if (!tops.includes(top)) tops.push(top)
    return [tops.indexOf(top), rect.left - box.left]
  }))
}), HOST)

function compare(before, after) {
  const moved = []
  before.forEach((words, p) => words.forEach((boxes, w) => {
    const now = after[p]?.[w] ?? []
    const same = boxes.length === now.length && boxes.every((box, i) => box[0] === now[i][0] && Math.abs(box[1] - now[i][1]) <= 0.05)
    if (!same) moved.push({ paragraph: p, word: w, before: boxes, after: now })
  }))
  return moved
}

/** Painted tint: custom-highlight ranges (and their fill layers), or the fallback's backgrounds. */
const painted = page => page.evaluate(host => {
  let ranges = 0
  CSS.highlights?.forEach(highlight => { ranges += highlight.size })
  const fills = document.querySelectorAll(`${host} .lab-highlight-fill`).length
  const words = document.querySelectorAll(`${host} .lab-hearing-word.is-selecting, ${host} .lab-hearing-word[class*="is-hl-"]`).length
  return { ranges, fills, words }
}, HOST)

const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))

async function visibleWords(page) {
  return page.evaluate(host => {
    const frame = document.querySelector(host).getBoundingClientRect()
    const header = document.querySelector('.lab-header')?.getBoundingClientRect()
    return [...document.querySelectorAll(`${host} [data-testid="lab-word"]`)].flatMap(node => {
      const rect = node.getBoundingClientRect()
      return rect.width && rect.top >= Math.max(frame.top, header?.bottom ?? 0) + 8 && rect.bottom <= frame.bottom - 24
        ? [{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }] : []
    })
  }, HOST)
}

async function drag(page, from, to, during) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(to.x, to.y, { steps: 16 })
  await settle(page)
  if (during) await during()
  await page.mouse.up()
  await page.getByTestId('lab-desk-bar').waitFor({ timeout: 5000 })
  await settle(page)
}

async function runCase(browserType, engine, testCase) {
  const browser = await markInternal(await browserType.launch({ headless: true, args: engine === 'chromium' ? ['--mute-audio'] : [] }))
  const context = await browser.newContext({ viewport: { width: testCase.width, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  await serveDist(context)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const states = []
  try {
    await page.goto(`${origin}/qa-seed`)
    await page.evaluate(async ({ hex, bytes, own }) => {
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark', ...(own ? {} : { primaryEdition: 'original-en' }) }))
      if (!own) return
      localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa', user: { id: 'u-qa', email: 'reader@example.com' } }))
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('tinct-addbook', 1)
        request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      await new Promise((resolve, reject) => {
        const tx = db.transaction('books', 'readwrite')
        tx.objectStore('books').put({ key: `epub:${hex}`, kind: 'epub', name: 'Own Tint.epub', title: 'Own Tint', owner: 'u-qa', bytes: new Uint8Array(bytes).buffer })
        tx.oncomplete = resolve
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    }, { hex: HEX, bytes: testCase.book === 'own' ? [...ownEpub()] : [], own: testCase.book === 'own' })
    const url = testCase.book === 'own'
      ? `${origin}/reader?userBook=${HEX}&layout=desktop&view=margin`
      : `${origin}/reader?book=frankenstein&chapter=2&paragraph=3&word=0&sharedReader=1&layout=desktop&view=margin`
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(host => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true'
      && document.querySelectorAll(`${host} [data-testid="lab-word"]`).length > 40, HOST, { timeout: 45000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
    await page.waitForTimeout(1200)
    const style = await page.evaluate(host => { const line = document.querySelector(`${host} .lab-hearing-line`); const css = getComputedStyle(line); return { align: css.textAlign, hyphens: css.hyphens } }, HOST)
    assert.equal(style.align, 'justify', 'the reading paragraphs are justified')
    assert.equal(style.hyphens, 'auto', 'the reading paragraphs are hyphenated')
    const base = await layout(page)
    assert(base.flat().length > 40, 'the reading page has words to measure')
    const check = async (state, expectPaint = true) => {
      await settle(page)
      const moved = compare(base, await layout(page))
      const paint = await painted(page)
      if (shots) await page.screenshot({ path: path.join(shots, `${engine}-${testCase.name}-${state}.png`) })
      states.push({ state, moved: moved.length, paint })
      const rewrapped = moved.filter(item => item.before.length !== item.after.length || item.before.some((box, i) => box[0] !== item.after[i][0]))
      assert.deepEqual(moved.slice(0, 4), [], `${state}: ${moved.length} word(s) moved, ${rewrapped.length} onto another line, in ${new Set(moved.map(item => item.paragraph)).size} paragraph(s)`)
      if (expectPaint) assert(paint.words > 0 && (paint.ranges > 0 || !(await page.evaluate(() => !!CSS.highlights))), `${state}: the tint is painted ${JSON.stringify(paint)}`)
    }
    const words = await visibleWords(page)
    assert(words.length > 60, `enough visible words to select: ${words.length}`)
    // The reported move: a passage dragged from its end back to the start of a paragraph, then asked about.
    await drag(page, words.at(-1), words[0], () => check('dragging'))
    await check('selected')
    await page.keyboard.type('Why?')
    await page.getByTestId('lab-dbar-ask-field').waitFor()
    await check('typing-ask')
    await page.getByTestId('lab-dbar-ask-field').press('Enter')
    await page.locator('[data-testid="source-margin-item"][data-open="true"]').getByText('A local answer about this passage.').first().waitFor()
    await check('answered', false)
    const open = page.locator('[data-testid="source-margin-item"][data-open="true"]')
    await open.getByTestId('source-margin-minimise').click()
    await page.locator('.source-margin-preview').first().waitFor()
    await check('card-folded', false)
    await page.locator('.source-margin-preview').first().hover()
    await check('card-hover', false)
    await page.locator('.source-margin-preview').first().click()
    await page.locator('[data-testid="source-margin-item"][data-open="true"]').first().waitFor()
    await check('card-reopened', false)
    await page.keyboard.press('Escape')
    // Selection to highlight: the chosen ink replaces the selection preview,
    // then, once dismissed, the saved mark stays. An own book's marks are kept
    // by the account's mark store, which this isolated run has no server for,
    // so the saved mark is checked on the library book.
    const again = await visibleWords(page)
    await drag(page, again[3], again.at(-4))
    await page.getByTestId('lab-dbar-highlight').click()
    await check('highlight-applied')
    if (testCase.book !== 'own') {
      await page.keyboard.press('Escape')
      await page.waitForFunction(host => document.querySelectorAll(`${host} .lab-hearing-word[class*="is-hl-"]`).length > 20, HOST)
      await check('saved-highlight')
    }
    assert.deepEqual(errors, [], 'no page errors')
    return { engine, case: testCase.name, states }
  } finally {
    await context.close()
    await browser.close()
  }
}

let failed = 0, total = 0
for (const engine of engines) {
  const browserType = engine === 'webkit' ? webkit : chromium
  for (const testCase of CASES) {
    total += 1
    try {
      const result = await runCase(browserType, engine, testCase)
      console.log(`PASS  ${engine} ${testCase.name}  ${result.states.map(item => `${item.state}:${item.moved}`).join(' ')}`)
    } catch (error) {
      failed += 1
      console.log(`FAIL  ${engine} ${testCase.name}  ${error.message.split("\n")[0]}  ${(error.stack || "").split("\n").find(line => line.includes("check-tint-no-reflow")) || ""}`)
    }
  }
}
console.log(`\n${total - failed}/${total} passed`)
process.exit(failed ? 1 : 0)
