// Page-break line check: a page whose last paragraph continues on the next
// page must end on a naturally filled line, set like any interior line.
//
// Two failures, both reported by Anders on a phone (Esther 8, 6 Oct 2026) and
// by nightly QA (Frankenstein ch. 6, Sense and Sensibility ch. 1):
//   short   - the continuing last line stops early although the next word
//             (the first word of the next page) would have fitted on it;
//   gappy   - the continuing last line is justified with a word gap wider
//             than 1.6x the font size (a short line stretched to the margin).
//
// Runs against the local build in dist/ (served through page.route, no
// network), phone layout 390x844 and 360x780, headless Chromium, muted, no
// microphone. Two widths because one Chromium release lays a line out a few
// pixels differently from another (headless shell 145 found gappy tails that
// 141 did not): the reader must hold the bar wherever its lines happen to
// break, not only where one browser version breaks them. PAGE_BREAK_WIDTHS
// overrides the widths ("390x844,360x780").
// PAGE_BREAK_LIVE=1 checks https://tinct.app instead. PAGE_BREAK_PAGES sets
// how many pages per chapter are scanned (default 30). Exit code 1 on any
// short continuing last line; gappy lines are reported, and fail too unless
// PAGE_BREAK_ALLOW_GAPS=1.
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import fs from 'node:fs/promises'
import path from 'node:path'

const origin = 'https://tinct.app'
const live = process.env.PAGE_BREAK_LIVE === '1'
const output = process.env.PAGE_BREAK_OUTPUT || 'artifacts/page-break-lines'
const pagesPerChapter = Number(process.env.PAGE_BREAK_PAGES || 30)
const allowGaps = process.env.PAGE_BREAK_ALLOW_GAPS === '1'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined
const readerShell = await fs.access('dist/app.html').then(() => '/app.html', () => '/index.html')

export const PAGE_BREAK_CHAPTERS = [
  { name: 'Confessions Book 8', book: 'confessions', chapter: 8 },
  { name: 'Frankenstein Chapter 6', book: 'frankenstein', chapter: 10 },
  { name: 'Sense and Sensibility Chapter 1', book: 'sense-and-sensibility', chapter: 1 },
  { name: 'Bible Esther 8 (BSB)', book: 'bible', edition: 'bsb-en', chapter: 434 },
]
const viewports = (process.env.PAGE_BREAK_WIDTHS || '390x844,360x780').split(',').map(value => {
  const [width, height] = value.split('x').map(Number)
  return { width, height: height || 844 }
})
const only = process.env.PAGE_BREAK_ONLY
const chapters = only ? PAGE_BREAK_CHAPTERS.filter(item => item.book === only) : PAGE_BREAK_CHAPTERS

await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, executablePath, args: ['--mute-audio'] }))

async function routeBuild(page) {
  if (live) return
  await page.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin !== origin) return route.abort()
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    if (request.method() !== 'GET') return route.abort()
    const pathname = url.pathname === '/reader' ? readerShell : url.pathname
    const file = path.resolve('dist', `.${pathname}`)
    if (file.startsWith(`${path.resolve('dist')}/`)) {
      try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
    }
    return route.abort()
  })
}

/** The page on screen: its owned word keys, the continuing last line, the first word. */
function readPage() {
  const root = document.querySelector('[data-testid="lab-root"]')
  const stage = document.querySelector('[data-testid="lab-reading-stage"]')
  const visible = node => {
    if (node.closest('.lab-page-measure')) return false
    const rect = node.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth
  }
  const words = stage ? [...stage.querySelectorAll('[data-testid="lab-word"][data-word-index]')].filter(visible) : []
  const first = words[0]
  const result = {
    place: root?.dataset.place ?? null,
    chapter: root?.dataset.chapter ?? null,
    keys: words.map(word => `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}`),
    firstWord: first ? { text: first.textContent.trim(), width: first.getBoundingClientRect().width, key: `${first.dataset.paragraphIndex}:${first.dataset.wordIndex}` } : null,
    tail: null,
  }
  const lines = stage ? [...stage.querySelectorAll('.lab-hearing-line.is-continued')].filter(visible) : []
  const line = lines[lines.length - 1]
  if (!line) return result
  const style = getComputedStyle(line)
  const box = line.getBoundingClientRect()
  const contentLeft = box.left + (parseFloat(style.paddingLeft) || 0)
  const contentRight = box.right - (parseFloat(style.paddingRight) || 0)
  const fontSize = parseFloat(style.fontSize) || 16
  // Every inked word and fragment rect, then the bottom line of them.
  const rects = []
  line.querySelectorAll('[data-testid="lab-word"], [data-testid="lab-word-fragment"]').forEach(node => {
    for (const rect of node.getClientRects()) {
      if (rect.width > 0 && rect.height > 0) rects.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, text: node.textContent, fragment: node.dataset.testid === 'lab-word-fragment' })
    }
  })
  if (rects.length === 0) return result
  const lastBottom = Math.max(...rects.map(rect => rect.bottom))
  const lastLine = rects
    .filter(rect => Math.abs(rect.bottom - lastBottom) < Math.max(4, (rect.bottom - rect.top) / 2))
    .sort((a, b) => a.left - b.left)
  let maxGap = 0
  for (let index = 1; index < lastLine.length; index += 1) maxGap = Math.max(maxGap, lastLine[index].left - lastLine[index - 1].right)
  // A natural interword space in this font, to judge whether the next word fits.
  const canvas = document.createElement('canvas').getContext('2d')
  canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  result.tail = {
    paragraphIndex: Number(line.querySelector('[data-paragraph-index]')?.dataset.paragraphIndex ?? -1),
    text: lastLine.map(rect => rect.text.trim()).join(' '),
    endsWithFragment: lastLine.at(-1)?.fragment === true,
    room: contentRight - Math.max(...lastLine.map(rect => rect.right)),
    fill: (Math.max(...lastLine.map(rect => rect.right)) - contentLeft) / (contentRight - contentLeft),
    maxGap,
    fontSize,
    space: canvas.measureText(' ').width,
    textAlignLast: style.textAlignLast,
    tailFull: line.dataset.tailFull === 'true',
  }
  return result
}

async function settle(page) {
  let previous = ''
  let stable = 0
  const deadline = Date.now() + 8000
  while (Date.now() < deadline) {
    const state = await page.evaluate(readPage)
    const signature = JSON.stringify([state.place, state.keys, state.tail?.text])
    stable = signature === previous ? stable + 1 : 0
    if (stable >= 2) return state
    previous = signature
    await page.waitForTimeout(200)
  }
  return page.evaluate(readPage)
}

const report = []
let failures = 0
for (const viewport of viewports) for (const item of chapters) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = async function play() { this.muted = true }
    if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw new Error('no microphone in page-break check') } })
  })
  await routeBuild(page)
  const query = new URLSearchParams({ book: item.book, chapter: String(item.chapter), layout: 'phone' })
  if (item.edition) query.set('edition', item.edition)
  await page.goto(`${origin}/reader?${query}&margin=0`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1500)
  const pages = []
  let state = await settle(page)
  for (let index = 0; index < pagesPerChapter; index += 1) {
    pages.push(state)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(250)
    const next = await settle(page)
    // Past the chapter's last page the reader opens the next chapter: stop.
    if (next.keys.length === 0 || next.chapter !== state.chapter || JSON.stringify(next.keys) === JSON.stringify(state.keys)) break
    state = next
  }
  const short = []
  const gappy = []
  pages.forEach((current, index) => {
    const tail = current.tail
    const following = pages[index + 1]
    if (!tail || !following?.firstWord) return
    const label = { page: index + 1, last: tail.text.split(' ').slice(-6).join(' '), next: following.firstWord.text, fill: Number(tail.fill.toFixed(3)), room: Math.round(tail.room), maxGapEm: Number((tail.maxGap / tail.fontSize).toFixed(2)) }
    // Short: the next page's first word, with its space, would have fitted
    // on this line, or the line was left ragged by more than a word space
    // though it continues. A justified line reaches the margin (room ~0).
    if (!tail.endsWithFragment && tail.room >= following.firstWord.width + tail.space - 0.5) short.push(label)
    if (tail.maxGap > 1.6 * tail.fontSize) gappy.push(label)
  })
  const continuing = pages.filter((current, index) => current.tail && pages[index + 1]).length
  report.push({ chapter: item.name, viewport: `${viewport.width}x${viewport.height}`, pages: pages.length, continuing, short, gappy, errors })
  console.log(`${item.name} @${viewport.width}: ${pages.length} pages, ${continuing} continuing last lines, ${short.length} short, ${gappy.length} gappy`)
  for (const entry of short) console.log(`  SHORT page ${entry.page}: "…${entry.last}" | "${entry.next}" (fill ${entry.fill}, room ${entry.room}px)`)
  for (const entry of gappy) console.log(`  GAPPY page ${entry.page}: "…${entry.last}" | "${entry.next}" (fill ${entry.fill}, largest gap ${entry.maxGapEm}em)`)
  if (errors.length) console.log(`  page errors: ${errors.join(' | ')}`)
  failures += short.length + (allowGaps ? 0 : gappy.length) + (pages.length < 2 ? 1 : 0)
  await page.screenshot({ path: `${output}/${item.book}-${item.chapter}-${viewport.width}-last.png` })
  await context.close()
}
await fs.writeFile(`${output}/report.json`, `${JSON.stringify(report, null, 2)}\n`)
await browser.close()
if (failures > 0) {
  console.error(`page-break check failed: ${failures} problem(s); see ${output}/report.json`)
  process.exit(1)
}
console.log('page-break check passed')
