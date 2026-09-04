import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-maximal-fill-artifacts'
const PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
const CLEARANCE_PX = 24

type ReaderSeed = {
  bookId: string
  primaryEditionKey: string
  chapterNumber?: number
  fontSize?: number
  fontFamily?: 'garamond' | 'baskerville' | 'sourceserif'
}

type WordPlace = {
  text: string
  paragraphIndex: number
  wordIndex: number
}

function readerContext(browser: Browser, width: number, height: number, phone: boolean): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width, height },
    isMobile: phone,
    hasTouch: phone || width <= 768,
    userAgent: phone ? PHONE_UA : undefined,
  })
}

async function putReaderState(page: Page, seed: ReaderSeed): Promise<void> {
  await page.evaluate((value) => {
    const appearance = {
      theme: 'dark',
      fontFamily: value.fontFamily || 'garamond',
      fontSize: value.fontSize || 1.3,
      alignment: 'justify',
      lineSpacing: 'comfortable',
      margins: 'medium',
      paragraphSpacing: 'standard',
      progressDisplay: { metric: 'page', scope: 'chapter' },
    }
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({
      version: 2,
      shared: {
        primaryEdition: value.primaryEditionKey,
        compareEdition: value.primaryEditionKey,
        audioEdition: value.primaryEditionKey,
        audioSpeed: 1,
        compareOpen: false,
      },
      phone: appearance,
      desktop: appearance,
    }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: value.bookId,
      primaryEditionKey: value.primaryEditionKey,
      savedPlace: {
        bookId: value.bookId,
        chapterNumber: value.chapterNumber || 1,
        paragraphIndex: 0,
        page: 0,
      },
    }))
  }, seed)
}

async function waitForSettledText(page: Page): Promise<string> {
  let previous = ''
  let stableReads = 0
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const text = (await page.getByTestId('lab-book').innerText())
      .replace(/Keep this passage/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    stableReads = text && text === previous ? stableReads + 1 : 0
    if (stableReads >= 3) return text
    previous = text
    await page.waitForTimeout(75)
  }
  throw new Error(`Reader page did not settle; last text was: ${previous.slice(-120)}`)
}

async function openReader(page: Page, seed: ReaderSeed): Promise<string> {
  await page.goto('/lab/reader', { waitUntil: 'domcontentloaded' })
  await putReaderState(page, seed)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', seed.bookId)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
  await expect(page.getByTestId('lab-chapter-cover')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  return waitForSettledText(page)
}

async function turnPage(page: Page, direction: -1 | 1): Promise<void> {
  const root = page.getByTestId('lab-root')
  const before = await root.getAttribute('data-place')
  if (await root.getAttribute('data-lab-layout') === 'phone') {
    const box = await page.getByTestId('lab-book').boundingBox()
    if (!box) throw new Error('Reader page has no pointer bounds')
    if (await page.evaluate(() => navigator.maxTouchPoints > 0)) {
      await page.touchscreen.tap(direction > 0 ? box.x + box.width - 5 : box.x + 5, box.y + box.height / 2)
    } else {
      await page.mouse.click(direction > 0 ? box.x + box.width - 5 : box.x + 5, box.y + box.height / 2)
    }
  } else {
    await page.getByTestId(direction > 0 ? 'lab-page-next' : 'lab-page-prev').click()
  }
  await expect.poll(() => root.getAttribute('data-place')).not.toBe(before)
  await waitForSettledText(page)
}

async function visibleWordEdge(page: Page, edge: 'first' | 'last'): Promise<WordPlace> {
  return page.getByTestId('lab-book').evaluate((book, requestedEdge) => {
    const words = [...book.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')]
    const word = requestedEdge === 'first' ? words[0] : words[words.length - 1]
    if (!word) throw new Error('No visible reader word')
    return {
      text: (word.textContent || '').trim(),
      paragraphIndex: Number(word.dataset.paragraphIndex),
      wordIndex: Number(word.dataset.wordIndex),
    }
  }, edge)
}

async function boundaryEvidence(page: Page) {
  const root = page.getByTestId('lab-root')
  const place = await root.getAttribute('data-place')
  const lastWord = await visibleWordEdge(page, 'last')
  const text = await waitForSettledText(page)

  await turnPage(page, 1)
  const firstOmittedWord = await visibleWordEdge(page, 'first')
  await turnPage(page, -1)
  await expect(root).toHaveAttribute('data-place', place || '')

  const geometry = await page.getByTestId('lab-book').evaluate((book, input) => {
    const wrap = document.querySelector<HTMLElement>('.lab-page-wrap')
    const passage = book.closest<HTMLElement>('.lab-passage') || book
    const words = [...book.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')]
    const last = words[words.length - 1]
    const line = last?.closest<HTMLElement>('.lab-hearing-line')
    if (!wrap || !last || !line) throw new Error('Missing painted reader geometry')

    const bars = [...document.querySelectorAll<HTMLElement>(
      '.lab-phone-bar, .lab-page-turn, .lab-phone-transport, .lab-hearing-transport',
    )]
      .map(node => node.getBoundingClientRect())
      .filter(rect => rect.height > 1 && rect.top > 0)
    const chromeTop = bars.length
      ? Math.min(...bars.map(rect => rect.top))
      : wrap.getBoundingClientRect().bottom
    const currentRects = words.flatMap(word => [...word.getClientRects()])
      .filter(rect => rect.width > 0 && rect.height > 8)
    const paintedBottom = Math.max(...currentRects.map(rect => rect.bottom))

    const sameParagraph = input.lastWord.paragraphIndex === input.firstOmittedWord.paragraphIndex
    const trialLine = sameParagraph ? line : document.createElement('p')
    if (!sameParagraph) {
      trialLine.className = 'lab-hearing-line'
      line.after(trialLine)
    }
    const trial = document.createElement('span')
    trial.className = 'lab-hearing-word'
    trial.textContent = `${sameParagraph ? ' ' : ''}${input.firstOmittedWord.text}`
    trialLine.append(trial)
    const trialRects = [...trial.getClientRects()].filter(rect => rect.width > 0 && rect.height > 8)
    const trialBottom = trialRects.length ? Math.max(...trialRects.map(rect => rect.bottom)) : Infinity
    const wrapOverflow = wrap.scrollHeight - wrap.clientHeight
    const passageOverflow = passage.scrollHeight - passage.clientHeight
    const trialFits = trialBottom < chromeTop - input.clearance
      && wrapOverflow <= 1
    trial.remove()
    if (!sameParagraph) trialLine.remove()

    return {
      paintedBottom,
      chromeTop,
      clearance: chromeTop - paintedBottom,
      lineHeight: Number.parseFloat(getComputedStyle(line).lineHeight),
      trialBottom,
      trialFits,
      wrapOverflow,
      passageOverflow,
    }
  }, { lastWord, firstOmittedWord, clearance: CLEARANCE_PX })

  expect(geometry.paintedBottom).toBeLessThan(geometry.chromeTop - CLEARANCE_PX)
  expect(geometry.wrapOverflow).toBeLessThanOrEqual(1)
  expect(geometry.trialFits, `first omitted word “${firstOmittedWord.text}” still fits`).toBe(false)
  return { place, text, lastWord, firstOmittedWord, ...geometry }
}

async function verifyReversibleAndReload(
  page: Page,
  seed: ReaderSeed,
  startText: string,
  stepsFromStart: number,
): Promise<void> {
  const root = page.getByTestId('lab-root')
  const place = await root.getAttribute('data-place')
  const text = await waitForSettledText(page)
  for (let run = 0; run < 3; run += 1) {
    await turnPage(page, 1)
    await turnPage(page, -1)
    await expect(root).toHaveAttribute('data-place', place || '')
    expect(await waitForSettledText(page)).toBe(text)
  }
  await page.waitForTimeout(1_250)
  // Reload from the same coherent ReaderSession anchor so this regression
  // isolates page-map determinism from cloud/local position-write timing.
  await putReaderState(page, seed)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
  await page.evaluate(() => document.fonts.ready)
  let reloadedText = await waitForSettledText(page)
  expect(reloadedText).toBe(startText)
  for (let step = 0; step < stepsFromStart; step += 1) {
    await turnPage(page, 1)
  }
  reloadedText = await waitForSettledText(page)
  expect(reloadedText).toBe(text)
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

test('WebKit-sized Midsummer page keeps the fitting word after “come I,”', async ({ browser }, testInfo) => {
  const context = await readerContext(browser, 580, 650, true)
  const page = await context.newPage()
  const seed: ReaderSeed = {
    bookId: 'midsummer',
    primaryEditionKey: 'original-en',
    fontSize: 1.4,
  }
  const startText = await openReader(page, seed)
  await turnPage(page, 1)
  await turnPage(page, 1)
  const evidence = await boundaryEvidence(page)
  expect(evidence.text).toMatch(/EGEUS\. Full of vexation come I, with$/)
  expect(evidence.lastWord.text).toBe('with')
  expect(evidence.firstOmittedWord.text).toBe('complaint')
  await verifyReversibleAndReload(page, seed, startText, 2)

  const prefix = `${testInfo.project.name}-midsummer-580x650`
  await page.screenshot({ path: join(ARTIFACT_DIR, `${prefix}.png`) })
  writeFileSync(join(ARTIFACT_DIR, `${prefix}.json`), JSON.stringify(evidence, null, 2))
  await context.close()
})

test('WebKit-sized Genesis page never strands a fitting word after “There”', async ({ browser }, testInfo) => {
  const context = await readerContext(browser, 597, 710, true)
  const page = await context.newPage()
  const seed: ReaderSeed = {
    bookId: 'bible',
    primaryEditionKey: 'modern-en',
    fontSize: 1.6,
  }
  const startText = await openReader(page, seed)
  let text = startText
  const traversed = [text]
  for (let pageIndex = 0; pageIndex < 3 && !text.includes('There'); pageIndex += 1) {
    await turnPage(page, 1)
    text = await waitForSettledText(page)
    traversed.push(text)
  }
  expect(traversed.join(' ')).toContain('There was evening')
  const evidence = await boundaryEvidence(page)
  if (testInfo.project.name === 'webkit') {
    expect(evidence.text).toMatch(/There was evening, and$/)
    expect(evidence.lastWord.text).toBe('and')
    expect(evidence.firstOmittedWord.text.toLowerCase()).toBe('there')
  }
  await verifyReversibleAndReload(page, seed, startText, traversed.length - 1)

  const prefix = `${testInfo.project.name}-genesis-modern-597x710`
  await page.screenshot({ path: join(ARTIFACT_DIR, `${prefix}.png`) })
  writeFileSync(join(ARTIFACT_DIR, `${prefix}.json`), JSON.stringify(evidence, null, 2))
  await context.close()
})

for (const viewport of [
  { name: 'phone-390', width: 390, height: 844, phone: true },
  { name: 'iphone-15', width: 393, height: 852, phone: true },
  { name: 'tablet', width: 768, height: 1024, phone: false },
  { name: 'desktop', width: 1440, height: 900, phone: false },
]) {
  test(`representative prose is maximally filled and reversible at ${viewport.width}×${viewport.height}`, async ({ browser }, testInfo) => {
    const context = await readerContext(browser, viewport.width, viewport.height, viewport.phone)
    const page = await context.newPage()
    const seed: ReaderSeed = {
      bookId: 'meditations',
      primaryEditionKey: 'original-en',
      chapterNumber: 4,
      fontSize: 1.3,
    }
    const startText = await openReader(page, seed)
    const evidence = await boundaryEvidence(page)
    await verifyReversibleAndReload(page, seed, startText, 0)

    const prefix = `${testInfo.project.name}-${viewport.name}`
    await page.screenshot({ path: join(ARTIFACT_DIR, `${prefix}.png`) })
    writeFileSync(join(ARTIFACT_DIR, `${prefix}.json`), JSON.stringify(evidence, null, 2))
    await context.close()
  })
}
