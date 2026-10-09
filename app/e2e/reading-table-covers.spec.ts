import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The reading table (library_2/reading-table.js, the returning reader's desk): a cover
 * keeps its own shape. The Beginning of Infinity added as an EPUB (a 1600×2560 cover,
 * Anders 2026-10-09) stood in the fixed 2:3 box with object-fit: cover, so its top
 * "THE" and bottom "DEUTSCH" were cut off. Each book is now as wide as its cover
 * (within bounds); a cover outside the bounds is letterboxed, never stretched or cropped.
 *
 * The sample desk (?demo=reading) with two own books put in front of it (their covers
 * are data: URLs, as an added book's are): The Beginning of Infinity (tall, 0.625) and a
 * landscape PDF page (1.41, beyond the bounds); and Meditations' library painting served
 * at 0.8 (a wide library cover, through the table's prepareCover canvas). Crime and
 * Punishment keeps the library's 2:3. Nothing outside the dev server is reached.
 *
 * Run: PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium BASE_URL=http://localhost:5173 \
 *   npx playwright test -c e2e/playwright.reading-table-covers.config.ts
 * ARTIFACT_DIR=<dir> saves a screenshot of each book.
 */
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''

/** A cover with a word at its very top and bottom edge, so a crop shows at once. */
function coverSvg(width: number, height: number, top: string, middle: string, bottom: string, ground: string) {
  const size = Math.round(width * 0.11)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `<rect width="${width}" height="${height}" fill="${ground}"/>`
    + `<rect x="${width * 0.02}" y="${height * 0.01}" width="${width * 0.96}" height="${height * 0.98}" fill="none" stroke="#b3271e" stroke-width="${width * 0.012}"/>`
    + `<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.3}" fill="none" stroke="#1f4a5c" stroke-width="${width * 0.02}"/>`
    + `<text x="50%" y="${size * 1.05}" font-family="Georgia" font-size="${size}" text-anchor="middle" fill="#111">${top}</text>`
    + `<text x="50%" y="${height / 2 + size * 0.35}" font-family="Georgia" font-size="${size * 0.8}" text-anchor="middle" fill="#111">${middle}</text>`
    + `<text x="50%" y="${height - size * 0.3}" font-family="Georgia" font-size="${size}" text-anchor="middle" fill="#111">${bottom}</text></svg>`
}
const dataUrl = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

const OWN_BOOKS = [
  { bookId: 'epub:bbbbbbbbbbbbbbbbbbbbbbbb', own: true, title: 'The Beginning of Infinity', author: 'David Deutsch', cover: dataUrl(coverSvg(1600, 2560, 'THE', 'BEGINNING OF INFINITY', 'DEUTSCH', '#e9e4d6')), wordCount: 160000, tone: '#d9d3c3', chapterLabel: 'Chapter 1', headline: 'You’re at the start of Chapter 1', percent: 3, recap: null },
  { bookId: 'pdf:cccccccccccccccccccccccc', own: true, title: 'Field sketches', author: '', cover: dataUrl(coverSvg(2000, 1414, 'TOP', 'LANDSCAPE PAGE', 'BOTTOM', '#dfe8e3')), wordCount: 20000, tone: '#c9d6cf', chapterLabel: 'Page 2', headline: 'You’re on page 2', percent: 20, recap: null },
]
const WIDE_LIBRARY_COVER = coverSvg(1200, 1500, 'TOP', 'MEDITATIONS', 'BOTTOM', '#e6dcc4')

/** Covers keep their shape between these width/height ratios (table-window.js bookBox). */
const MIN_ASPECT = 0.5, MAX_ASPECT = 1

async function prepare(page: Page) {
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('**/api/**', route => route.fulfill({ status: 204, body: '' }))
  await page.route('**/library_2/assets/meditations.jpg', route => route.fulfill({ contentType: 'image/svg+xml', body: WIDE_LIBRARY_COVER }))
  // The sample desk with the reader's own books in front, as the production desk lists them.
  await page.route('**/library_2/reading-table.js**', async route => {
    const response = await route.fetch()
    const source = await response.text()
    const marker = "mode: 'returning',\n  reading: ["
    expect(source).toContain(marker)
    await route.fulfill({ response, contentType: 'text/javascript', body: source.replace(marker, `${marker}\n    ${OWN_BOOKS.map(book => JSON.stringify(book)).join(',\n    ')},`) })
  })
  await page.goto('/lab/library_2/?demo=reading')
  await page.waitForSelector('.reading-table.is-ready', { timeout: 30_000 })
}

/** Bring a book out (as its dot does) and wait for it to stand still, cover painted. */
async function choose(page: Page, title: string) {
  await page.evaluate(name => {
    const book = [...document.querySelectorAll<HTMLElement>('.rt-b')].find(b => b.getAttribute('aria-label') === name)
    if (!book) throw new Error(`no book ${name}`)
    document.querySelector<HTMLButtonElement>(`#rt-dots button[data-i="${book.dataset.i}"]`)!.click()
  }, title)
  await expect(page.locator('.rt-b.is-current')).toHaveAttribute('aria-label', title)
  await page.waitForFunction(() => {
    const img = document.querySelector<HTMLImageElement>('.rt-b.is-current .rt-front img')
    return !!img && img.complete && img.naturalWidth > 0
  })
  await page.waitForTimeout(1100)
}

/** The chosen book's cover: its painting's shape and the face it is shown on (layout size, before the 3D turn). */
function measure(page: Page) {
  return page.evaluate(() => {
    const book = document.querySelector<HTMLElement>('.rt-b.is-current')!
    const front = book.querySelector<HTMLElement>('.rt-front')!
    const img = front.querySelector<HTMLImageElement>('img')!
    return {
      natural: img.naturalWidth / img.naturalHeight,
      face: front.offsetWidth / front.offsetHeight,
      image: img.offsetWidth / img.offsetHeight,
      fit: getComputedStyle(img).objectFit,
      bookHeight: book.offsetHeight,
      tableHeight: parseFloat(getComputedStyle(document.querySelector('.reading-table')!).getPropertyValue('--bh')),
    }
  })
}

test('every cover on the reading table keeps its own shape', async ({ page }, info) => {
  await prepare(page)
  if (ARTIFACT_DIR) mkdirSync(ARTIFACT_DIR, { recursive: true })
  const cases = [
    { title: 'The Beginning of Infinity', natural: 0.625 },
    { title: 'Field sketches', natural: 2000 / 1414 },
    { title: 'Crime and Punishment', natural: 2 / 3 },
    { title: 'Meditations', natural: 0.8 },
  ]
  for (const { title, natural } of cases) {
    await choose(page, title)
    const m = await measure(page)
    if (ARTIFACT_DIR) await page.screenshot({ path: join(ARTIFACT_DIR, `${info.project.name}-${title.toLowerCase().replace(/\W+/g, '-')}.png`) })
    expect(m.natural, `${title}: the painting loaded`).toBeCloseTo(natural, 2)
    // The painting is never squeezed or cropped: the face it fills has its shape, or it is
    // letterboxed (object-fit: contain) inside a face held to the bounds.
    const inBounds = natural >= MIN_ASPECT && natural <= MAX_ASPECT
    if (inBounds) expect.soft(Math.abs(m.face / m.natural - 1), `${title}: face ${m.face.toFixed(3)} vs cover ${m.natural.toFixed(3)}`).toBeLessThan(0.02)
    else expect.soft(m.fit, `${title}: out-of-bounds cover is letterboxed`).toBe('contain')
    expect.soft(Math.abs(m.image / m.face - 1), `${title}: the image fills its face`).toBeLessThan(0.01)
    expect.soft(['contain', 'scale-down'].includes(m.fit) || Math.abs(m.face / m.natural - 1) < 0.02, `${title}: not cropped (${m.fit})`).toBe(true)
    // No book stands taller than the table's book height.
    expect.soft(m.bookHeight).toBeLessThanOrEqual(Math.ceil(m.tableHeight) + 1)
  }
})
