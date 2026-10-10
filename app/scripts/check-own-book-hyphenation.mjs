// A reader's own EPUB gets the phone's planned hyphenation, like a built-in book.
//   cd app && npm run build && node scripts/check-own-book-hyphenation.mjs
// Synthetic EPUBs only (written here, never a real book). The built app is served from
// dist/ under https://tinct.app by request interception; every other request is
// refused, so nothing leaves the machine. Each book is seeded into this browser's
// IndexedDB the way Add a book keeps it (`tinct-addbook` / `books` / `epub:<hex>`),
// then opened at /reader?userBook=<hex>, 390x844, in WebKit and Chromium.
// Checks, per dc:language (missing, en, en-GB, eng, EN): the reader root's lang is
// `en`, the edition is own-en, justified paragraphs carry a hyphen plan and at least
// one planned hyphen (.lab-syl) is painted at the end of a line, with the word's
// tail starting the next line. A German book (tagged de, or untagged) gets no English plan.
// OWN_HYPHEN_SHOTS=<dir> writes a phone screenshot per run.
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const origin = 'https://tinct.app'
const dist = path.resolve('dist')
const shots = process.env.OWN_HYPHEN_SHOTS || ''
if (shots) await fs.mkdir(shots, { recursive: true })
const engines = (process.env.OWN_HYPHEN_ENGINES || 'webkit,chromium').split(',')

const ENGLISH = [
  'When a quantum system is measured, the textbooks say, a single, definite outcome was recorded and every other possibility simply vanished from the world without explanation.',
  'Yet nothing in the equations themselves suggests that a measurement appear in some privileged place; the universe, described consistently, contains every outcome the mathematics allows.',
  'Explanations of this kind are bold conjectures about unobserved reality, and their value lies precisely in how much they risk: an interpretation that forbids nothing explains nothing whatsoever.',
  'Experimenters nevertheless continued recording interference patterns, transmitting individual photons through extraordinarily delicate apparatus, and comparing measurements against predictions.',
  'Philosophers responded with increasingly elaborate interpretations, distinguishing instrumentalism, positivism and realism, and insisting that understanding requires something beyond calculation.',
]
const GERMAN = [
  'Wenn ein Quantensystem gemessen wird, sagen die Lehrbücher, wurde ein einziges, bestimmtes Ergebnis aufgezeichnet, und jede andere Möglichkeit verschwand einfach aus der Welt.',
  'Doch nichts in den Gleichungen selbst legt nahe, dass eine Messung an einem bevorzugten Ort erscheint; das Universum enthält jedes Ergebnis, das die Mathematik erlaubt.',
  'Erklärungen dieser Art sind kühne Vermutungen über die unbeobachtete Wirklichkeit, und ihr Wert liegt gerade darin, wie viel sie wagen: eine Deutung, die nichts verbietet, erklärt nichts.',
]

function ownEpub(language, paragraphs, title) {
  const lang = language == null ? '' : `<dc:language>${language}</dc:language>`
  const body = paragraphs.map(text => `<p>${text}</p>`).join('')
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">own-hyphen</dc:identifier><dc:title>${title}</dc:title><dc:creator>Test Author</dc:creator>${lang}</metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>`],
    ['OEBPS/nav.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="c1.xhtml">Measurement</a></li></ol></nav></body></html>'],
    ['OEBPS/c1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Measurement</h1>${body}${body}</body></html>`],
  ])
}

const CASES = [
  { name: 'missing', language: null, paragraphs: ENGLISH, english: true },
  { name: 'en', language: 'en', paragraphs: ENGLISH, english: true },
  { name: 'en-GB', language: 'en-GB', paragraphs: ENGLISH, english: true },
  { name: 'eng', language: 'eng', paragraphs: ENGLISH, english: true },
  { name: 'EN', language: 'EN', paragraphs: ENGLISH, english: true },
  { name: 'de', language: 'de', paragraphs: GERMAN, english: false },
  { name: 'untagged-de', language: null, paragraphs: GERMAN, english: false },
]

async function serveDist(context) {
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin || route.request().method() !== 'GET') return route.abort()
    if (url.pathname === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    const pathname = url.pathname === '/reader' ? '/app.html' : url.pathname
    const filename = path.resolve(dist, `.${pathname}`)
    if (!filename.startsWith(`${dist}/`)) return route.abort()
    try { if ((await fs.stat(filename)).isFile()) return route.fulfill({ path: filename }) } catch {}
    return route.fulfill({ status: 404, body: '' })
  })
}

async function runCase(browserType, engine, testCase, index) {
  const browser = await markInternal(await browserType.launch({ headless: true }))
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' })
  await serveDist(context)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const hex = (index.toString(16) + 'ab'.repeat(12)).slice(0, 24)
  const bytes = [...ownEpub(testCase.language, testCase.paragraphs, `Own Hyphens ${testCase.name}`)]
  await page.goto(`${origin}/qa-seed`)
  await page.evaluate(async ({ hex, bytes, title }) => {
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa', user: { id: 'u-qa', email: 'reader@example.com' } }))
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key: `epub:${hex}`, kind: 'epub', name: `${title}.epub`, title, owner: 'u-qa', bytes: new Uint8Array(bytes).buffer })
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { hex, bytes, title: `Own Hyphens ${testCase.name}` })
  await page.goto(`${origin}/reader?userBook=${hex}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true'
    && document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length > 1, null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1500)
  const state = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    const visible = node => { const rect = node.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && !node.closest('.lab-page-measure, .lab-native-page-flow') }
    const lines = [...root.querySelectorAll('.lab-page-wrap .lab-hearing-line')].filter(visible)
    const planned = lines.filter(line => line.classList.contains('has-hyphen-plan'))
    // A planned hyphen that was used: the head of the word ends one line, its tail starts the next.
    const used = []
    for (const syl of [...root.querySelectorAll('.lab-page-wrap .lab-syl')].filter(visible)) {
      const word = syl.closest('.lab-hearing-word')
      const rects = [...word.getClientRects()].filter(rect => rect.width > 0)
      if (rects.length >= 2 && rects[1].top > rects[0].top + 2) used.push({ word: word.textContent, head: syl.textContent, after: getComputedStyle(syl, '::after').content })
    }
    return {
      lang: root.lang,
      edition: root.dataset.readerEdition,
      lines: lines.length,
      planned: planned.length,
      used,
      textAlign: lines[0] ? getComputedStyle(lines[0]).textAlign : '',
    }
  })
  if (shots) await page.screenshot({ path: path.join(shots, `${engine}-${testCase.name}.png`) })
  await context.close()
  await browser.close()
  return { engine, case: testCase.name, ...state, errors }
}

const results = []
let failed = 0
for (const engine of engines) {
  const browserType = engine === 'webkit' ? webkit : chromium
  for (const [index, testCase] of CASES.entries()) {
    const result = await runCase(browserType, engine, testCase, index)
    results.push(result)
    try {
      assert.deepEqual(result.errors, [], 'no page errors')
      assert(result.lines > 0, 'the reading page shows paragraphs')
      assert.equal(result.textAlign, 'justify', 'phone paragraphs are justified')
      if (testCase.english) {
        assert.equal(result.lang, 'en', 'the passage is marked English')
        assert.equal(result.edition, 'own-en', 'the own edition is English')
        assert(result.planned > 0, 'justified paragraphs carry a hyphen plan')
        assert(result.used.length > 0, 'a planned hyphen ends a loose line, the word continuing on the next')
        assert(result.used.every(item => /\\?00AD|­/u.test(item.after)), 'the planned hyphen is drawn by CSS')
      } else {
        assert.notEqual(result.lang, 'en', 'German text is not marked English')
        assert.equal(result.planned, 0, 'German text gets no English plan')
        assert.equal(result.used.length, 0, 'German text gets no planned English hyphens')
      }
      console.log(`PASS  ${engine} ${testCase.name}  lang=${result.lang} edition=${result.edition} planned=${result.planned}/${result.lines} used=${result.used.map(item => item.word).join(',')}`)
    } catch (error) {
      failed += 1
      console.log(`FAIL  ${engine} ${testCase.name}  ${error.message}  ${JSON.stringify(result)}`)
    }
  }
}
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
