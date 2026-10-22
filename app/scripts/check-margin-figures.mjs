#!/usr/bin/env node
// Margin view's figures and classic-reader books (launch, 22 Oct 2026). Headless Chromium against a local dev server,
// muted, every API call mocked (nothing reaches production, no AI):
//
//   npx vite --port 6140 --strictPort &
//   PREVIEW_ORIGIN=http://127.0.0.1:6140 CHROMIUM_PATH=… node scripts/check-margin-figures.mjs
//
// At 1440×900: each book opens in margin view at a figure's chapter (the link's place, the paragraph after the figure);
// the figure is drawn there as an image that loads, with its caption, one block at its paragraph index (the chapter's
// blocks are the edition's paragraphs, one for one), and the view's place is the paragraph asked for. Hamlet and Othello
// (plays) open in the classic book reader, not margin view. Paradise Lost (lines in its text) keeps its line breaks.
// Screenshots go to OUT (default artifacts/margin-figures).
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ORIGIN = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:6140'
const OUT = resolve(process.env.OUT || 'artifacts/margin-figures')
mkdirSync(OUT, { recursive: true })
const EXEC = process.env.CHROMIUM_PATH || undefined
const FIG = '￼'

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 400) : ''}`) }

/** Each book's first figure in its main edition (original-en: these books have no Modern English). */
const BOOKS = [
  { bookId: 'lords-of-the-cosmos', figure: 'f1' },
  { bookId: 'bold-conjectures-volume-2', figure: 'f1' },
  { bookId: 'the-farthest-reaches', figure: 'f1' },
]
const edition = bookId => JSON.parse(readFileSync(resolve(`public/data/editions/${bookId}-original-en.json`), 'utf8'))

const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] })
const newPage = async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.route(/\/api\//, route => route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' }))
  const page = await context.newPage()
  const images = []
  page.on('request', r => { if (r.url().includes('/data/figures/')) images.push(r.url()) })
  return { context, page, images }
}
const frameOf = async page => (await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 30000 })).contentFrame()

for (const { bookId, figure } of BOOKS) {
  const data = edition(bookId)
  const index = data.chapters.findIndex(c => c.paragraphs.includes(FIG + figure))
  const chapter = data.chapters[index], para = chapter.paragraphs.indexOf(FIG + figure)
  const meta = chapter.figures.find(f => f.id === figure)
  const { context, page, images } = await newPage()
  // The paragraph after the figure: the place must land there, so the figure did not move any index.
  const after = Math.min(para + 1, chapter.paragraphs.length - 1)
  await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=1&chapter=${chapter.number}&paragraph=${after}&word=0`, { waitUntil: 'domcontentloaded' })
  const frame = await frameOf(page)
  const sel = `.tb-chapter .tb-fig[data-figure="${figure}"]`
  await frame.waitForSelector(sel, { timeout: 30000 }).catch(() => null)
  await frame.waitForTimeout(2500)
  const spot = await frame.evaluate(() => { try { return epubHold.exact ? { page: epubHold.exact.page, para: epubHold.exact.para } : null } catch { return null } })
  const where = await frame.evaluate(({ sel, n }) => {
    const nodes = [...document.querySelectorAll('.tb-chapter')], node = nodes[n]
    const fig = node?.querySelector(sel)
    // Blocks as reader.js epubParas counts them: the innermost blocks with text.
    const BLOCKS = 'p,h1,h2,h3,h4,h5,h6,li,dt,dd,figcaption,pre,blockquote,div,td,th,caption'
    const paras = node ? [...node.querySelectorAll(BLOCKS)].filter(el => !el.querySelector(BLOCKS) && el.textContent.trim()) : []
    // The heading is not a block (a <header> of spans): every block is an edition paragraph.
    return { paras: paras.length, figIndex: paras.indexOf(fig), caption: fig?.querySelector('.pt-cap')?.textContent || null, src: fig?.querySelector('img')?.getAttribute('src') || null }
  }, { sel, n: index })
  ok(`${bookId}: chapter ${chapter.number} draws one block per edition paragraph`, where.paras === chapter.paragraphs.length, { blocks: where.paras, paragraphs: chapter.paragraphs.length })
  ok(`${bookId}: ${figure} stands at its paragraph (${para})`, where.figIndex === para, where)
  ok(`${bookId}: ${figure} caption as the edition's`, (where.caption || '').replace(/​/g, '') === String(meta.caption || '').replace(/\s+/g, ' ').trim(), where.caption?.slice(0, 80))
  ok(`${bookId}: the place is the paragraph after the figure (${after})`, spot && spot.page === index + 1 && spot.para === after, spot)
  // In view: the image loads, at its shape, inside the column.
  await frame.evaluate(sel => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), sel)
  await frame.waitForFunction(sel => { const i = document.querySelector(sel + ' img'); return i && i.complete && i.naturalWidth > 0 }, sel, { timeout: 15000 }).catch(() => null)
  const img = await frame.evaluate(sel => {
    const i = document.querySelector(sel + ' img'), col = document.querySelector(sel).closest('.epub-pg')
    if (!i) return null
    const r = i.getBoundingClientRect(), c = col.getBoundingClientRect()
    return { natural: [i.naturalWidth, i.naturalHeight], drawn: [Math.round(r.width), Math.round(r.height)], inColumn: r.left >= c.left - 1 && r.right <= c.right + 1, imgs: document.querySelectorAll('.tb-chapter img').length }
  }, sel)
  ok(`${bookId}: ${figure} image loaded in the column`, !!img && img.natural[0] > 0 && img.inColumn && img.drawn[1] > 40 && img.drawn[1] <= 900 * 0.8, img)
  ok(`${bookId}: the image was requested`, images.some(u => u.includes(meta.src)), images.slice(0, 3))
  await page.screenshot({ path: join(OUT, `${bookId}-${figure}.png`) })
  await context.close()
}

// Plays open in the classic book reader: no margin view frame.
for (const bookId of ['hamlet', 'othello']) {
  const { context, page } = await newPage()
  await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-shakespeare]', { timeout: 30000 }).catch(() => null)
  const state = await page.evaluate(() => ({ frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]'), shakespeare: !!document.querySelector('[data-shakespeare]') }))
  ok(`${bookId}: opens in the classic reader, not margin view`, !state.frame && state.shakespeare, state)
  await page.screenshot({ path: join(OUT, `${bookId}-classic.png`) })
  await context.close()
}

// Paradise Lost keeps its lines in margin view (each verse paragraph's line breaks are in its text).
{
  const data = JSON.parse(readFileSync(resolve('public/data/editions/paradise-lost-modern-en.json'), 'utf8'))
  const { context, page } = await newPage()
  await page.goto(`${ORIGIN}/reader?book=paradise-lost&margin=1&edition=original-en&chapter=1&paragraph=0&word=0`, { waitUntil: 'domcontentloaded' })
  const frame = await frameOf(page)
  await frame.waitForSelector('.tb-chapter .tb-p', { timeout: 30000 })
  await frame.waitForTimeout(1500)
  const lines = await frame.evaluate(() => {
    const p = [...document.querySelectorAll('.tb-chapter')][0].querySelectorAll('.tb-p')[1]
    const breaks = (p.textContent.match(/\n/g) || []).length
    const lh = parseFloat(getComputedStyle(p).lineHeight) || 30
    return { breaks, lines: Math.round(p.getBoundingClientRect().height / lh), ws: getComputedStyle(p).whiteSpace, head: p.textContent.slice(0, 60) }
  })
  ok('paradise-lost: margin view keeps the verse lines', lines.breaks > 3 && lines.lines >= lines.breaks + 1 && lines.ws === 'pre-line', lines)
  void data
  await page.screenshot({ path: join(OUT, 'paradise-lost-margin.png') })
  await context.close()
}

await browser.close()
console.log(failures ? `${failures} failed` : 'all passed')
process.exit(failures ? 1 : 0)
