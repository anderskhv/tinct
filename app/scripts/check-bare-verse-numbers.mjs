// A verse number with no text after it is not drawn (Anders, 27 Nov 2026). The WEB leaves seven verses out on
// purpose (Luke 17:36, Acts 8:37, 15:34 and 24:7, Romans 16:25-27) and the import kept their numbers, so Romans 16
// ended "25 26 27". The reader no longer draws such a number; the book text and every word index are untouched.
// On a built app (dist/), a reader with no account, in the five WEB chapters that hold them:
// 1. Phone (WebKit, iPhone 13) and desktop Two-page (Chromium 1440×900): every page of the chapter is walked. Each
//    verse number that has text is drawn once, the seven are never drawn, every other word of the chapter is drawn
//    at its own paragraph and word index, and no page is left without text.
// 2. Desktop Margin (the scrolling reader) and Compare (WEB beside KJV, and KJV beside WEB): the paragraph that
//    holds the number draws its other numbers and not that one.
// 3. A place saved on Romans 16's last paragraph, which is only "26 27", still opens Romans 16 at its end.
// Nothing reaches production: the built files are served here and every /api route answers 404.
//   cd app && npm run build && node scripts/check-bare-verse-numbers.mjs   (TINCT_DIST=<dir> for another build;
//   TINCT_LOCAL_READER=http://127.0.0.1:<port> for a local dev server instead of dist)
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { markInternal } from './lib/internalTraffic.cjs'

// PLAYWRIGHT_MODULE: another Playwright build (a machine whose installed browsers are not this project's).
const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium, webkit, devices } = playwright.chromium ? playwright : playwright.default

const local = process.env.TINCT_LOCAL_READER || ''
const dist = path.resolve(process.env.TINCT_DIST || (local ? 'public' : 'dist'))
const output = path.resolve(process.env.TINCT_BARE_VERSE_OUTPUT || 'artifacts/bare-verse-numbers')
await fs.mkdir(output, { recursive: true })

/** Chapter number, title, and the numbers with no verse: [paragraph, word, number]. */
const CHAPTERS = [
  [990, 'Luke 17', [[7, 0, '36']]],
  [1026, 'Acts 8', [[7, 27, '37']]],
  [1033, 'Acts 15', [[6, 48, '34']]],
  [1042, 'Acts 24', [[1, 12, '7']]],
  [1062, 'Romans 16', [[4, 65, '25'], [5, 0, '26'], [5, 1, '27']]],
]

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 900) : ''}`) }

// The chapters as the book has them: the reader's words are a whitespace split, a verse number a word of superscript digits.
const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const isNumber = word => /^[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/.test(word)
const digits = word => [...word].map(ch => SUPER.indexOf(ch)).join('')
const editionChapters = async key => new Map(JSON.parse(await fs.readFile(path.join(dist, `data/editions/bible-${key}.json`), 'utf8')).chapters.map(chapter => [chapter.number, chapter]))
const web = await editionChapters('web-en')
const chapterWords = number => web.get(number).paragraphs.map(text => text.split(/\s+/).filter(Boolean))
const bareOf = words => words.flatMap((paragraph, p) => paragraph.flatMap((word, w) => isNumber(word) && (w + 1 >= paragraph.length || isNumber(paragraph[w + 1])) ? [[p, w, digits(word)]] : []))
for (const [number, title, omitted] of CHAPTERS) {
  ok(`${title}: the book text still holds the number${omitted.length > 1 ? 's' : ''} with no verse (${omitted.map(item => item[2]).join(', ')})`,
    web.get(number).title === title && JSON.stringify(bareOf(chapterWords(number))) === JSON.stringify(omitted), bareOf(chapterWords(number)))
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.wasm': 'application/wasm' }
const server = local ? null : createServer(async (req, res) => {
  let pathname = decodeURIComponent(new URL(req.url || '/', 'http://local').pathname)
  if (pathname.startsWith('/api/')) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{}'); return }
  if (pathname === '/reader') pathname = '/app.html'
  if (pathname.endsWith('/')) pathname += 'index.html'
  const file = path.join(dist, path.normalize(pathname))
  try {
    if (!file.startsWith(dist + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
    res.end(await fs.readFile(file))
  } catch { res.writeHead(404); res.end() }
})
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = local || `http://127.0.0.1:${server.address().port}`

const external = []
const errors = []
async function reader(browser, options) {
  const context = await browser.newContext({ ...options, serviceWorkers: 'block' })
  await context.route('**/*', route => {
    const u = new URL(route.request().url())
    if (u.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    if (u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue()
    external.push(`${u.hostname}${u.pathname}`)
    return route.abort()
  })
  // A returning reader: no first-visit hint over the text.
  await context.addInitScript(() => { try { localStorage.setItem('tinct:selection-actions-used', '1'); localStorage.setItem('tinct:wipe-v1-done', '1') } catch { /* private mode */ } })
  const page = await context.newPage()
  page.setDefaultTimeout(30000)
  page.on('pageerror', error => errors.push(error.message))
  return { context, page }
}
const open = async (page, search) => {
  await page.goto(`${origin}/reader?book=bible&sharedReader=1${search}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 90000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(2200)
}
const rootState = page => page.getByTestId('lab-root').evaluate(root => ({ chapter: root.dataset.chapter, place: root.dataset.place, edition: root.dataset.readerEdition, compare: root.dataset.compareActive }))

/**
 * The reader's own words now in the view (never a measuring copy, never a neighbouring chapter's): where each is, what
 * it draws, and whether it has ink on screen. `column`: 'compare' reads Compare's second column, else the main text.
 */
const shownWords = (page, column) => page.evaluate(column => {
  const inView = rect => rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight
  return [...document.querySelectorAll('[data-testid="lab-word"][data-paragraph-index][data-word-index]')]
    .filter(node => !node.closest('.lab-page-measure, .lab-desktop-measure') && (column === 'any' || !!node.closest('.lab-book-col-compare') === (column === 'compare')))
    .map(node => ({
      p: Number(node.dataset.paragraphIndex), w: Number(node.dataset.wordIndex),
      text: (node.textContent || '').replace(/[\s ­]/g, ''),
      number: node.querySelector('.lab-verse-mark')?.textContent ?? null,
      ink: [...node.getClientRects()].some(inView),
    }))
}, column)

/** Walks the chapter page by page from its first, and holds what each page drew against the book's own words. */
async function walk(page, label, number, title, omitted, column, screenshot) {
  const words = chapterWords(number)
  let lastPage = null
  const bare = new Set(omitted.map(([p, w]) => `${p}:${w}`))
  const seen = new Map()
  const pages = []
  let wrong = []
  for (let turn = 0; turn < 60; turn += 1) {
    const state = await rootState(page)
    if (state.chapter !== String(number)) break
    const shown = await shownWords(page, column)
    const inked = shown.filter(word => word.ink)
    // Beside the KJV's Romans 16:25-27 the WEB's column is rightly empty: a page has text when either column has.
    const onPage = column === 'compare' ? (await shownWords(page, 'any')).filter(word => word.ink) : inked
    const key = JSON.stringify(onPage.map(word => `${word.p}:${word.w}`))
    if (pages.length && pages[pages.length - 1].key === key) break
    pages.push({ key, inked: onPage.length })
    if (screenshot) lastPage = await page.screenshot()
    for (const word of shown) {
      const at = `${word.p}:${word.w}`
      const source = words[word.p]?.[word.w]
      if (bare.has(at)) { if (word.text !== '' || word.number != null || word.ink) wrong.push({ at, drew: word.text }) ; continue }
      if (!word.ink) continue
      seen.set(at, (seen.get(at) ?? 0) + 1)
      // Compare's column prints the number as the book's own superscript; the reading column as small raised digits.
      const expected = source == null ? null : isNumber(source) ? (column === 'compare' ? source : digits(source)) : source
      // A page may open on the rest of a word whose start the page before showed with a hyphen ("be-" | "lieved").
      const continued = expected != null && !isNumber(source) && word.text.length > 0 && word.text !== expected && expected.endsWith(word.text) && word === inked[0]
      if ((word.text !== expected && !continued) || (column !== 'compare' && (word.number != null) !== isNumber(source ?? ''))) wrong.push({ at, drew: word.text, book: source })
    }
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(700)
  }
  const all = words.flatMap((paragraph, p) => paragraph.map((_, w) => `${p}:${w}`)).filter(at => !bare.has(at))
  const missing = all.filter(at => !seen.has(at))
  const twice = all.filter(at => (seen.get(at) ?? 0) > 1)
  const numbers = words.flatMap((paragraph, p) => paragraph.flatMap((word, w) => isNumber(word) && !bare.has(`${p}:${w}`) ? [`${p}:${w}`] : []))
  ok(`${label} ${title}: ${pages.length} pages, ${numbers.length} verse numbers drawn once each, ${omitted.map(item => item[2]).join(', ')} not drawn, every other word at its own index`,
    pages.length > 0 && wrong.length === 0 && missing.length === 0 && twice.length === 0 && numbers.every(at => seen.get(at) === 1),
    { pages: pages.map(item => item.inked), wrong: wrong.slice(0, 6), missing: missing.slice(0, 6), twice: twice.slice(0, 6) })
  ok(`${label} ${title}: no page without text`, pages.every(item => item.inked > 0), pages.map(item => item.inked))
  if (screenshot && lastPage) await fs.writeFile(path.join(output, screenshot), lastPage)
  return pages.length
}

const phone = await markInternal(await webkit.launch({ headless: true }))
try {
  const { context, page } = await reader(phone, { ...devices['iPhone 13'], deviceScaleFactor: 2 })
  for (const [number, title, omitted] of CHAPTERS) {
    await open(page, `&edition=web-en&chapter=${number}&paragraph=0&word=0&layout=phone`)
    const count = await walk(page, 'phone', number, title, omitted)
    if (number === 1062) {
      // 3. The place a reader may have saved on the paragraph that is only "26 27".
      await open(page, `&edition=web-en&chapter=1062&paragraph=5&word=0&layout=phone`)
      const state = await rootState(page)
      const shown = (await shownWords(page)).filter(word => word.ink)
      const tail = shown.slice(-3).map(word => word.text).join(' ')
      ok('phone Romans 16: a place saved on its last paragraph opens the chapter at its end, on "you all! Amen."',
        state.chapter === '1062' && tail === 'you all! Amen.' && await page.locator('[data-testid="lab-page-wrap"] .lab-chapter-end').first().isVisible(), { state, tail, pages: count })
      await page.screenshot({ path: path.join(output, 'phone-romans-16-end.png') })
    }
  }
  await context.close()
} finally { await phone.close() }

const desktop = await markInternal(await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined, args: ['--mute-audio'] }))
try {
  const viewport = { viewport: { width: 1440, height: 900 } }
  const twoPage = await reader(desktop, viewport)
  for (const [number, title, omitted] of CHAPTERS) {
    await open(twoPage.page, `&edition=web-en&chapter=${number}&paragraph=0&word=0&layout=desktop&view=two-page`)
    await walk(twoPage.page, 'two-page', number, title, omitted, undefined, number === 1062 ? 'two-page-romans-16-end.png' : undefined)
  }
  // 2. Margin: the scrolling reader, opened at the paragraph that holds the number.
  for (const [number, title, omitted] of CHAPTERS) for (const p of [...new Set(omitted.map(item => item[0]))]) {
    await open(twoPage.page, `&edition=web-en&chapter=${number}&paragraph=${p}&word=0&layout=desktop&view=margin&bookScroll=0`)
    const paragraph = (await shownWords(twoPage.page)).filter(word => word.p === p)
    const source = chapterWords(number)[p]
    const bare = new Set(omitted.filter(item => item[0] === p).map(item => item[1]))
    const expected = source.map((word, w) => bare.has(w) ? '' : isNumber(word) ? digits(word) : word)
    ok(`margin ${title} paragraph ${p + 1}: its ${source.length} words in place, ${omitted.filter(item => item[0] === p).map(item => item[2]).join(', ')} not drawn`,
      await twoPage.page.getByTestId('continuous-reader').count() > 0 && JSON.stringify(paragraph.map(word => word.text)) === JSON.stringify(expected)
        && paragraph.every(word => (word.number != null) === (!bare.has(word.w) && isNumber(source[word.w]))),
      { drew: paragraph.map(word => word.text).join(' ').slice(0, 200), words: paragraph.length })
    if (number === 1062 && p === 4) await twoPage.page.screenshot({ path: path.join(output, 'margin-romans-16-end.png') })
  }
  await twoPage.context.close()

  // 2. Compare. WEB as the reading edition beside KJV: the reading column is walked as above.
  const webFirst = await reader(desktop, viewport)
  for (const [number, title, omitted] of CHAPTERS.filter(item => [990, 1062].includes(item[0]))) {
    await open(webFirst.page, `&edition=web-en&compare=kjv-en&chapter=${number}&paragraph=0&word=0&layout=desktop&view=compare`)
    const state = await rootState(webFirst.page)
    ok(`Compare, WEB beside KJV, ${title}: both editions show`, state.compare === 'true' && state.edition === 'web-en', state)
    await walk(webFirst.page, 'Compare (WEB reading)', number, title, omitted, undefined, number === 1062 ? 'compare-web-kjv-romans-16-end.png' : undefined)
  }
  await webFirst.context.close()
  // KJV as the reading edition beside WEB: Compare's own column draws the WEB.
  const webBeside = await reader(desktop, viewport)
  for (const [number, title, omitted] of CHAPTERS.filter(item => [990, 1062].includes(item[0]))) {
    await open(webBeside.page, `&edition=kjv-en&compare=web-en&chapter=${number}&paragraph=0&word=0&layout=desktop&view=compare`)
    const state = await rootState(webBeside.page)
    ok(`Compare, KJV beside WEB, ${title}: both editions show`, state.compare === 'true' && state.edition === 'kjv-en', state)
    await walk(webBeside.page, 'Compare (WEB beside)', number, title, omitted, 'compare', number === 1062 ? 'compare-kjv-web-romans-16-end.png' : undefined)
  }
  await webBeside.context.close()
} finally { await desktop.close() }

server?.close()
ok('no page errors', errors.length === 0, errors.slice(0, 5))
ok('nothing reached any other host', external.length === 0, [...new Set(external)].slice(0, 10))
console.log(failures ? `${failures} check(s) failed` : 'all checks passed', `· screenshots in ${output}`)
process.exit(failures ? 1 : 0)
