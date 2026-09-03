import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-stabilization-artifacts'

type Viewport = { name: string; width: number; height: number; phone?: boolean; touch?: boolean }

const VIEWPORTS: Viewport[] = [
  { name: 'phone-320', width: 320, height: 568, phone: true },
  { name: 'phone-375', width: 375, height: 667, phone: true },
  { name: 'phone-390', width: 390, height: 844, phone: true },
  { name: 'iphone-15', width: 393, height: 852, phone: true },
  { name: 'phone-430', width: 430, height: 932, phone: true },
  { name: 'tablet', width: 768, height: 1024, touch: true },
  { name: 'desktop', width: 1440, height: 900 },
]

const REAL_BIBLE_P0_WORDS = [
  ['In', 0.05, 0.53], ['the', 0.53, 0.61], ['beginning', 0.61, 0.97], ['God', 1.29, 1.39],
  ['created', 1.39, 1.81], ['the', 1.81, 2.03], ['heaven', 2.03, 2.27], ['and', 2.27, 2.49],
  ['the', 2.49, 2.61], ['earth.', 2.61, 2.89], ['And', 3.43, 3.51], ['the', 3.51, 3.61],
  ['earth', 3.61, 3.85], ['was', 3.85, 4.03], ['without', 4.03, 4.27], ['form,', 4.27, 4.71],
  ['and', 4.71, 4.95], ['void;', 4.95, 5.29], ['and', 5.57, 5.69], ['darkness', 5.69, 6.09],
  ['was', 6.09, 6.29], ['upon', 6.29, 6.55], ['the', 6.55, 6.71], ['face', 6.71, 6.93],
  ['of', 6.93, 7.11], ['the', 7.11, 7.23], ['deep.', 7.23, 7.49], ['And', 7.93, 8.15],
  ['the', 8.15, 8.27], ['Spirit', 8.27, 8.51], ['of', 8.51, 8.75], ['God', 8.75, 9.09],
  ['moved', 9.09, 9.39], ['upon', 9.39, 9.69], ['the', 9.69, 9.83], ['face', 9.83, 10.03],
  ['of', 10.03, 10.21], ['the', 10.21, 10.31], ['waters.', 10.31, 10.59], ['And', 11.19, 11.41],
  ['God', 11.41, 11.65], ['said,', 11.65, 11.99], ['Let', 12.27, 12.31], ['there', 12.31, 12.43],
  ['be', 12.43, 12.59], ['light:', 12.59, 12.87], ['and', 13.23, 13.41], ['there', 13.41, 13.53],
  ['was', 13.53, 13.63], ['light.', 13.63, 13.99], ['And', 14.53, 14.77], ['God', 14.77, 14.99],
  ['saw', 14.99, 15.27], ['the', 15.27, 15.45], ['light,', 15.45, 15.73], ['that', 15.79, 15.95],
  ['it', 15.95, 16.05], ['was', 16.05, 16.19], ['good:', 16.19, 16.47], ['and', 16.85, 17.05],
  ['God', 17.05, 17.29], ['divided', 17.29, 17.71], ['the', 17.71, 17.89], ['light', 17.89, 18.07],
  ['from', 18.07, 18.27], ['the', 18.27, 18.41], ['darkness.', 18.41, 18.83], ['And', 19.31, 19.55],
  ['God', 19.55, 19.81], ['called', 19.81, 20.07], ['the', 20.07, 20.21], ['light', 20.21, 20.41],
  ['Day,', 20.41, 20.73], ['and', 20.97, 21.11], ['the', 21.11, 21.23], ['darkness', 21.23, 21.57],
  ['he', 21.57, 21.77], ['called', 21.77, 22.03], ['Night.', 22.03, 22.33], ['And', 22.83, 23.03],
  ['the', 23.03, 23.15], ['evening', 23.15, 23.45], ['and', 23.45, 23.69], ['the', 23.69, 23.81],
  ['morning', 23.81, 24.01], ['were', 24.01, 24.23], ['the', 24.23, 24.37], ['first', 24.37, 24.59],
  ['day.', 24.59, 24.95],
] as const

function readerContext(browser: Browser, viewport: Viewport): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.phone,
    hasTouch: viewport.phone || viewport.touch,
    userAgent: viewport.phone
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
      : undefined,
  })
}

async function seedReader(page: Page, input: {
  bookId: string
  primaryEditionKey: string
  compareEditionKey?: string
  saved?: boolean
  alignment?: 'left' | 'justify'
  fontSize?: number
}): Promise<void> {
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem('tinct:test-reader-stabilization-seeded') === 'true') return
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({
      primaryEdition: seed.primaryEditionKey,
      compareEdition: seed.compareEditionKey,
      compareOpen: !!seed.compareEditionKey,
      alignment: seed.alignment || 'justify',
      fontSize: seed.fontSize,
      theme: 'light',
    }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: seed.bookId,
      primaryEditionKey: seed.primaryEditionKey,
      compareEditionKey: seed.compareEditionKey,
      ...(seed.saved ? { savedPlace: { bookId: seed.bookId, chapterNumber: 1, paragraphIndex: 0, page: 0 } } : {}),
    }))
    sessionStorage.setItem('tinct:test-reader-stabilization-seeded', 'true')
  }, input)
}

async function installStableAudio(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    class StableAudio extends EventTarget {
      src = ''
      currentTime = 0
      duration = 30
      playbackRate = 1
      paused = true
      preload = 'auto'
      constructor() {
        super()
        ;(window as typeof window & { __labTestAudio?: StableAudio }).__labTestAudio = this
      }
      load() {}
      removeAttribute(name: string) { if (name === 'src') this.src = '' }
      pause() { this.paused = true }
      play() {
        this.paused = false
        queueMicrotask(() => this.dispatchEvent(new Event('playing')))
        return Promise.resolve()
      }
    }
    Object.defineProperty(window, 'Audio', {
      configurable: true,
      value: StableAudio,
    })
  })
}

async function setAudioTime(page: Page, seconds: number): Promise<void> {
  await page.evaluate((time) => {
    const audio = (window as typeof window & { __labTestAudio?: HTMLAudioElement }).__labTestAudio
    if (!audio) throw new Error('Test audio is not initialized')
    audio.currentTime = time
    audio.dispatchEvent(new Event('timeupdate'))
  }, seconds)
}

async function tapCoverForward(page: Page, touch: boolean): Promise<void> {
  const cover = page.getByTestId('lab-chapter-cover')
  const box = await cover.boundingBox()
  if (!box) throw new Error('Frontispiece has no bounds')
  const x = box.x + box.width - 12
  const y = box.y + box.height / 2
  if (touch) await page.touchscreen.tap(x, y)
  else await cover.click({ position: { x: box.width - 12, y: box.height / 2 } })
}

async function textAlignments(page: Page): Promise<string[]> {
  return page.locator('.lab-hearing-line:visible').evaluateAll(lines => (
    [...new Set(lines.map(line => getComputedStyle(line).textAlign))]
  ))
}

async function ensurePhoneControls(page: Page): Promise<void> {
  if (await page.getByTestId('lab-root').getAttribute('data-reader-controls') === 'visible') return
  const book = page.getByTestId('lab-book')
  const box = await book.boundingBox()
  if (!box) throw new Error('Reader page has no bounds')
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-controls', 'visible')
  await expect(page.getByTestId('lab-phone-bar')).toBeVisible()
}

async function selectAlignment(page: Page, value: 'Left' | 'Justify', phone: boolean): Promise<void> {
  if (phone) await ensurePhoneControls(page)
  await page.getByTestId('lab-gear').click()
  await page.getByTestId('lab-settings-layout').click()
  await page.getByRole('button', { name: 'All Reading Settings' }).click()
  await page.getByRole('button', { name: value, exact: true }).click()
  await page.getByRole('button', { name: 'Close settings' }).click()
  await expect.poll(() => textAlignments(page)).toEqual([value.toLowerCase()])
}

async function pageGeometry(page: Page) {
  return page.evaluate(() => {
    const book = document.querySelector<HTMLElement>('[data-testid="lab-book"]')!
    const line = document.querySelector<HTMLElement>('.lab-hearing-line')!
    const rect = (element: HTMLElement) => {
      const box = element.getBoundingClientRect()
      return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 10) / 10)
    }
    return { book: rect(book), line: rect(line), align: getComputedStyle(line).textAlign }
  })
}

async function turnReadingPage(page: Page, direction: -1 | 1, phoneLayout: boolean): Promise<void> {
  if (!phoneLayout) {
    await page.getByTestId(direction > 0 ? 'lab-page-next' : 'lab-page-prev').click()
    return
  }
  const book = page.getByTestId('lab-book')
  const box = await book.boundingBox()
  if (!box) throw new Error('Reader page has no bounds')
  await page.touchscreen.tap(
    direction > 0 ? box.x + box.width - 6 : box.x + 6,
    box.y + box.height / 2,
  )
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

for (const viewport of VIEWPORTS) {
  test(`frontispiece is chrome-free and advances reliably at ${viewport.name}`, async ({ browser }) => {
    const context = await readerContext(browser, viewport)
    const page = await context.newPage()
    await seedReader(page, { bookId: 'meditations', primaryEditionKey: 'original-en' })
    await page.goto('/lab/reader', { waitUntil: 'networkidle' })
    const root = page.getByTestId('lab-root')
    const cover = page.getByTestId('lab-chapter-cover')
    await expect(root).toHaveAttribute('data-cover-page', 'true')
    await expect(root).toHaveAttribute('data-reader-controls', 'hidden')
    await expect(page.locator('.lab-header')).toHaveCount(0)
    await expect(page.getByTestId('lab-bottom-chrome')).toHaveCount(0)
    await expect(page.getByTestId('lab-desktop-action-rail')).toHaveCount(0)
    const [rootBox, coverBox] = await Promise.all([root.boundingBox(), cover.boundingBox()])
    expect(rootBox).toBeTruthy()
    expect(coverBox).toBeTruthy()
    expect(Math.abs((rootBox?.width || 0) - (coverBox?.width || 0))).toBeLessThanOrEqual(1)
    expect(Math.abs((rootBox?.height || 0) - (coverBox?.height || 0))).toBeLessThanOrEqual(1)
    await page.screenshot({ path: join(ARTIFACT_DIR, `frontispiece-${viewport.name}.png`) })

    await expect(root).toHaveAttribute('data-reader-ready', 'true')
    await tapCoverForward(page, !!viewport.phone || !!viewport.touch)
    await expect(root).toHaveAttribute('data-cover-page', 'false')
    await expect(page.locator('.lab-header')).toBeVisible()
    if (await root.getAttribute('data-lab-layout') === 'phone') {
      await expect(page.getByTestId('lab-phone-bar')).toBeVisible()
    } else {
      await expect(page.getByTestId('lab-desktop-action-rail')).toBeVisible()
    }
    await expect(page.getByTestId('lab-reading-stage')).toBeVisible()
    await page.waitForTimeout(500)

    await page.reload({ waitUntil: 'networkidle' })
    await expect(root).toHaveAttribute('data-book-id', 'meditations')
    await expect(root).toHaveAttribute('data-cover-page', 'false')
    await expect(page.getByTestId('lab-chapter-cover')).toHaveCount(0)
    await expect(page.getByTestId('lab-reading-stage')).toBeVisible()
    await context.close()
  })
}

test('Left and Justify remain distinct through reader lifecycle transitions', async ({ browser }) => {
  test.setTimeout(420_000)
  const measurements: Record<string, unknown> = {}
  for (const viewport of VIEWPORTS) {
    const context = await readerContext(browser, viewport)
    await installStableAudio(context)
    const page = await context.newPage()
    await seedReader(page, {
      bookId: 'war-and-peace',
      primaryEditionKey: 'original-en',
      compareEditionKey: 'modern-en',
      saved: true,
      alignment: 'justify',
    })
    await page.route('**/api/audio-manifest**', route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 30 }] }),
    }))
    await page.route('**/api/audio-file**', route => route.fulfill({ status: 404, body: 'Not found' }))
    await page.goto('/lab/reader', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'war-and-peace')
    const phoneLayout = await page.getByTestId('lab-root').getAttribute('data-lab-layout') === 'phone'
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    const justify = await pageGeometry(page)
    await selectAlignment(page, 'Left', phoneLayout)
    const left = await pageGeometry(page)
    expect(left.align).toBe('left')
    expect(justify.align).toBe('justify')
    if (viewport.name === 'iphone-15') {
      await page.screenshot({ path: join(ARTIFACT_DIR, 'alignment-left-iphone-15.png') })
    }
    await selectAlignment(page, 'Justify', phoneLayout)
    const placeBeforeTurn = await page.getByTestId('lab-root').getAttribute('data-place')
    await turnReadingPage(page, 1, phoneLayout)
    await expect.poll(() => page.getByTestId('lab-root').getAttribute('data-place')).not.toBe(placeBeforeTurn)
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    await turnReadingPage(page, -1, phoneLayout)
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    await page.waitForTimeout(250)

    if (phoneLayout) await ensurePhoneControls(page)
    const beforeAudio = await pageGeometry(page)
    await page.getByTestId('lab-listen').click()
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-playing', 'true')
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    const duringAudio = await pageGeometry(page)
    expect(duringAudio.book).toEqual(beforeAudio.book)
    expect(duringAudio.line).toEqual(beforeAudio.line)
    await page.getByTestId('lab-hearing-speed').click()
    await page.getByRole('slider', { name: 'Playback speed' }).fill('1.5')
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    const afterSpeed = await pageGeometry(page)
    expect(afterSpeed.book).toEqual(beforeAudio.book)
    expect(afterSpeed.line).toEqual(beforeAudio.line)
    await page.getByTestId(phoneLayout ? 'lab-listen' : 'lab-hearing-pause').click()
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-playing', 'false')
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    const afterPause = await pageGeometry(page)
    expect(afterPause.book).toEqual(beforeAudio.book)
    expect(afterPause.line).toEqual(beforeAudio.line)
    measurements[viewport.name] = { justify, left, beforeAudio, duringAudio, afterSpeed, afterPause }

    if (phoneLayout) await ensurePhoneControls(page)
    await page.getByTestId(phoneLayout ? 'lab-phone-compare' : 'lab-desktop-compare').click()
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'true')
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    await page.getByTestId(phoneLayout ? 'lab-phone-compare' : 'lab-desktop-compare').click()
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'false')
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])

    if (phoneLayout) await ensurePhoneControls(page)
    await page.getByTestId('lab-gear').click()
    await page.getByTestId('lab-settings-layout').click()
    await page.getByRole('button', { name: 'Book', exact: true }).click()
    await page.getByRole('button', { name: 'Close settings' }).click()
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'war-and-peace')
    await expect.poll(() => textAlignments(page)).toEqual(['justify'])
    await context.close()
  }
  writeFileSync(join(ARTIFACT_DIR, 'alignment-lifecycle-measurements.json'), JSON.stringify(measurements, null, 2))
})

test('trusted sidecars drive one-word follow while a missing sidecar stays paragraph-level', async ({ browser }) => {
  const evidence: Record<string, unknown> = {}

  for (const mode of ['trusted-bible', 'missing-war-and-peace', 'missing-odyssey'] as const) {
    const context = await readerContext(browser, { name: mode, width: 390, height: 844, phone: true })
    await installStableAudio(context)
    const page = await context.newPage()
    const requests: string[] = []
    const consoleOutput: string[] = []
    page.on('request', request => {
      if (request.url().includes('/api/audio-')) requests.push(decodeURIComponent(request.url()))
    })
    page.on('console', message => consoleOutput.push(`${message.type()}: ${message.text()}`))
    const trusted = mode === 'trusted-bible'
    await seedReader(page, trusted
      ? { bookId: 'bible', primaryEditionKey: 'kjv-en', saved: true, fontSize: 2.2 }
      : { bookId: mode === 'missing-odyssey' ? 'odyssey' : 'war-and-peace', primaryEditionKey: 'original-en', saved: true })
    await page.route('**/api/audio-manifest**', route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: trusted ? 24.95 : 30 }],
      }),
    }))
    await page.route('**/api/audio-file**', route => {
      const path = new URL(route.request().url()).searchParams.get('path') || ''
      if (trusted && path.endsWith('/words.json')) {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            chapter: 1,
            paragraphs: [{
              paragraph: 0,
              file: 'p0.mp3',
              words: REAL_BIBLE_P0_WORDS.map(([text, start, end]) => ({ text, start, end })),
            }],
          }),
        })
      }
      return route.fulfill({ status: 404, body: 'Not found' })
    })
    await page.goto('/lab/reader', { waitUntil: 'networkidle' })
    await page.getByTestId('lab-listen').click()
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-playing', 'true')

    if (trusted) {
      await setAudioTime(page, 0.7)
      await expect(page.getByTestId('lab-hearing-current')).toContainText('beginning')
      expect(await page.locator('.lab-hearing-word.is-current').count()).toBe(1)
      expect(await page.locator('.lab-hearing-word.is-line').count()).toBe(0)
      const currentBeforeRate = await page.getByTestId('lab-hearing-current').innerText()
      await page.getByTestId('lab-hearing-speed').click()
      await page.getByRole('slider', { name: 'Playback speed' }).fill('2')
      expect(await page.getByTestId('lab-hearing-current').innerText()).toBe(currentBeforeRate)
      await setAudioTime(page, 1.5)
      await expect(page.getByTestId('lab-hearing-current')).toContainText('created')
      const openingText = await page.getByTestId('lab-hearing-stage').innerText()
      await setAudioTime(page, 20.5)
      await expect.poll(() => page.getByTestId('lab-hearing-stage').innerText()).not.toBe(openingText)
      expect(await page.locator('.lab-hearing-word.is-current').count()).toBe(1)
    } else {
      await setAudioTime(page, 0.7)
      expect(await page.locator('.lab-hearing-word.is-current').count()).toBe(0)
      expect(await page.locator('.lab-hearing-word.is-line').count()).toBeGreaterThan(0)
      expect(await page.locator('.lab-hearing-line.is-paragraph-current').count()).toBe(1)
      expect(await page.locator('.lab-hearing-word.is-line').first().evaluate(node => getComputedStyle(node).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
      await setAudioTime(page, 12)
      expect(await page.locator('.lab-hearing-word.is-current').count()).toBe(0)
      expect(await page.locator('.lab-hearing-word.is-line').count()).toBeGreaterThan(0)
    }

    evidence[mode] = {
      requests,
      consoleOutput,
      currentWords: await page.locator('.lab-hearing-word.is-current').count(),
      paragraphWords: await page.locator('.lab-hearing-word.is-line').count(),
      currentParagraphs: await page.locator('.lab-hearing-line.is-paragraph-current').count(),
      geometry: await pageGeometry(page),
    }
    await page.screenshot({ path: join(ARTIFACT_DIR, `audio-${mode}-390x844.png`) })
    await page.getByTestId('lab-listen').click()
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-playing', 'false')
    await context.close()
  }

  writeFileSync(join(ARTIFACT_DIR, 'audio-follow-evidence.json'), JSON.stringify(evidence, null, 2))
})
