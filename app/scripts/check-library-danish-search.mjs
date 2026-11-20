// Library search in Danish (Anders, 13 Nov 2026: "'Den lille prinsesse' actually works").
// Types Danish titles, Danish author spellings and their keyboard spellings without æ, ø and å
// into the library's search and expects the right book first. Runs against a dev server:
//   VITE_SHARED_READER_DEFAULT=1 npx vite --port 5270   (from app/)
//   node scripts/check-library-danish-search.mjs        (LIBRARY_URL overrides the address)
// SHOTS=<dir> also saves "Den lille prinsesse" found, on desktop (1440×900) and phone (390×844).
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const base = process.env.LIBRARY_URL || 'http://localhost:5270/library'
const shots = process.env.SHOTS || ''

// [query, the book expected first, {author} when any book by that author is right, or {absent}
// for a book Tinct has no Danish text for yet: its Danish title must not find it (Anders,
// 2026-11-13), only its English title and author do. Move a book up when its Danish edition publishes.
export const QUERIES = [
  ['Den lille prinsesse', 'a-little-princess'],
  ['den lille', 'a-little-princess'],
  ['den lil', 'a-little-princess'],
  ['prinsesse', 'a-little-princess'],
  ['DEN LILLE PRINSESSE', 'a-little-princess'],
  ['A Little Princess', 'a-little-princess'],
  ['Forbrydelse og straf', 'crime-and-punishment'],
  ['forbrydelse', 'crime-and-punishment'],
  ['Crime and Punishment', 'crime-and-punishment'],
  ['Fyrsten', 'the-prince'],
  ['Krigskunsten', 'the-art-of-war'],
  ['Kunsten at føre krig', 'the-art-of-war'],
  ['Kunsten at fore krig', 'the-art-of-war'],
  ['Kunsten at foere krig', 'the-art-of-war'],
  ['Håndbogen', 'the-manual'],
  ['Haandbogen', 'the-manual'],
  ['Handbogen', 'the-manual'],
  ['Stormfulde højder', 'wuthering-heights'],
  ['stormfulde hoejder', 'wuthering-heights'],
  ['stormfulde hojder', 'wuthering-heights'],
  ['Selvbetragtninger', 'meditations'],
  ['Alice i Eventyrland', 'alice-in-wonderland'],
  ['Jorden rundt i 80 dage', 'around-the-world-80-days'],
  ['Mesteren og Margarita', 'master-and-margarita'],
  ['Pride and Prejudice', 'pride-and-prejudice'],
  ['Stolthed og fordom', { absent: 'pride-and-prejudice' }],
  ['Den guddommelige komedie', { absent: 'divine-comedy' }],
  ['Brødrene Karamasov', { absent: 'brothers-karamazov' }],
  ['Bibelen', { absent: 'bible' }],
  ['Købmanden i Venedig', { absent: 'merchant-of-venice' }],
  ['Frygt og Bæven', { absent: 'fear-and-trembling' }],
  ['Søren Kierkegaard', 'fear-and-trembling'],
  ['Soeren Kierkegaard', 'fear-and-trembling'],
  ['Platon', { author: 'Plato' }],
  ['Dostojevskij', { author: 'Fyodor Dostoevsky' }],
  ['Sofokles', { author: 'Sophocles' }],
]

/** The books the results list, in order: rows of the grouped search, or the plain covers. */
async function resultIds(page) {
  return page.evaluate(() => [...document.querySelectorAll('#search-results [data-row-key^="book:"], #search-results canvas[data-book]')]
    .map(node => node.dataset.rowKey ? node.dataset.rowKey.slice(5) : node.dataset.book))
}

async function search(page, query) {
  await page.fill('#search-input', '')
  await page.fill('#search-input', query)
  // The library's own books are ranked at once (oninput); give the row a frame to paint.
  await page.waitForFunction(q => document.getElementById('search-input').value === q, query)
  await page.waitForTimeout(120)
  return resultIds(page)
}

async function openSearch(page) {
  await page.goto(base + (base.includes('?') ? '&' : '?') + 'view=new', { waitUntil: 'domcontentloaded' })
  await page.locator('#search-toggle').waitFor()
  // The catalogue (with every book's other titles) has loaded once a search-only book exists.
  await page.waitForFunction(() => !!window.__library2CatalogueShared, null, { timeout: 60000 })
  await page.evaluate(() => window.__library2CatalogueShared)
  await page.waitForTimeout(500)
  await page.locator('#search-toggle').click()
  await page.waitForFunction(() => !document.getElementById('search-panel').hidden)
}

const browser = await chromium.launch()
const failures = []
try {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(60000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*.mp4', route => route.abort())
  await openSearch(page)
  const catalogue = await page.evaluate(() => window.__library2CatalogueShared)
  const authorOf = new Map(catalogue.books.map(book => [book.id, book.author]))
  for (const [query, expected] of QUERIES) {
    const ids = await search(page, query)
    const first = ids[0] || null
    const ok = typeof expected === 'string' ? first === expected
      : expected.absent ? !ids.includes(expected.absent)
      : authorOf.get(first) === expected.author
    console.log(`${ok ? 'PASS' : 'FAIL'} ${JSON.stringify(query)} -> ${first}${ok ? '' : ` (expected ${JSON.stringify(expected)}; top: ${ids.slice(0, 4).join(', ')})`}`)
    if (!ok) failures.push(query)
  }
  if (errors.length) { console.log('PAGE ERRORS ' + JSON.stringify(errors)); failures.push('page errors') }
  await context.close()

  if (shots) {
    fs.mkdirSync(shots, { recursive: true })
    for (const [name, viewport] of [['desktop-1440x900', { width: 1440, height: 900 }], ['phone-390x844', { width: 390, height: 844 }]]) {
      const shotContext = await browser.newContext({ serviceWorkers: 'block', viewport, deviceScaleFactor: 2, ...(viewport.width < 500 ? { isMobile: true, hasTouch: true } : {}) })
      const shotPage = await shotContext.newPage()
      shotPage.setDefaultTimeout(60000)
      await shotPage.route('**/*.mp4', route => route.abort())
      await openSearch(shotPage)
      const ids = await search(shotPage, 'Den lille prinsesse')
      if (ids[0] !== 'a-little-princess') failures.push(`screenshot ${name}`)
      await shotPage.waitForTimeout(1500)
      const file = path.join(shots, `den-lille-prinsesse-${name}.png`)
      await shotPage.screenshot({ path: file })
      console.log('SHOT ' + file)
      await shotContext.close()
    }
  }
} finally {
  await browser.close()
}
console.log(failures.length ? `DANISH_SEARCH_FAILED ${failures.length}: ${JSON.stringify(failures)}` : `DANISH_SEARCH_OK ${QUERIES.length} queries`)
process.exit(failures.length ? 1 : 0)
