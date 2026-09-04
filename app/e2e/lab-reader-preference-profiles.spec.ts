import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-preference-profiles-artifacts'

type AppearanceEvidence = {
  layout: string | null
  theme: string | null
  fontSize: string
  alignment: string
  computedAlignment: string
  audioSpeed: string | null
  readerEdition: string | null
  place: string | null
}

async function seedReader(page: Page): Promise<void> {
  await page.goto('/lab/reader', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    // Deliberately seed V1: this browser lifecycle also proves deterministic
    // migration without requiring a separate synthetic route.
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({
      primaryEdition: 'web-en',
      compareEdition: 'kjv-en',
      audioEdition: 'web-en',
      audioSpeed: 1.5,
      compareOpen: true,
      theme: 'light',
      fontFamily: 'garamond',
      fontSize: 1.3,
      alignment: 'justify',
      lineSpacing: 'comfortable',
      margins: 'medium',
      paragraphSpacing: 'standard',
      progressDisplay: { metric: 'page', scope: 'chapter' },
    }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: 'bible',
      primaryEditionKey: 'web-en',
      compareEditionKey: 'kjv-en',
      audioEditionKey: 'web-en',
      savedPlace: {
        bookId: 'bible',
        chapterNumber: 1,
        paragraphIndex: 0,
        page: 0,
      },
    }))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
  await expect(page.getByTestId('lab-chapter-cover')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
}

async function revealPhoneControls(page: Page): Promise<void> {
  if (await page.getByTestId('lab-root').getAttribute('data-reader-controls') === 'visible') return
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reader has no visible page')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-controls', 'visible')
}

async function setAppearance(page: Page, input: {
  theme: 'Dark' | 'Book'
  fontSize: number
  alignment: 'Left' | 'Justify'
}): Promise<void> {
  if (await page.getByTestId('lab-root').getAttribute('data-lab-layout') === 'phone') {
    await revealPhoneControls(page)
  }
  await page.getByTestId('lab-gear').click()
  await page.getByTestId('lab-settings-layout').click()
  await page.getByRole('button', { name: input.theme, exact: true }).click()
  await page.getByRole('slider', { name: 'Text size' }).fill(String(input.fontSize))
  await page.getByRole('button', { name: 'All Reading Settings' }).click()
  await page.getByRole('button', { name: input.alignment, exact: true }).click()
  await page.getByRole('button', { name: 'Close settings' }).click()
}

async function evidence(page: Page): Promise<AppearanceEvidence> {
  return page.getByTestId('lab-root').evaluate((root) => {
    const lines = [...document.querySelectorAll<HTMLElement>('.lab-hearing-line')]
    const line = lines.find(candidate => candidate.getClientRects().length > 0) || lines[0]
    return {
      layout: root.getAttribute('data-lab-layout'),
      theme: root.getAttribute('data-theme'),
      fontSize: root.style.getPropertyValue('--lab-font-size'),
      alignment: root.style.getPropertyValue('--lab-text-align'),
      computedAlignment: line ? getComputedStyle(line).textAlign : '',
      audioSpeed: root.getAttribute('data-audio-speed'),
      readerEdition: root.getAttribute('data-reader-edition'),
      place: root.getAttribute('data-place'),
    }
  })
}

async function expectAppearance(page: Page, expected: Partial<AppearanceEvidence>): Promise<AppearanceEvidence> {
  await expect.poll(() => evidence(page)).toMatchObject(expected)
  return evidence(page)
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

test('phone and desktop retain separate appearance while reader and audio choices stay shared', async ({ browser }) => {
  test.setTimeout(120_000)
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await seedReader(page)

  const initialPlace = await page.getByTestId('lab-root').getAttribute('data-place')
  await setAppearance(page, { theme: 'Dark', fontSize: 1.6, alignment: 'Left' })
  const phone = await expectAppearance(page, {
    layout: 'phone', theme: 'dark', fontSize: '1.6', alignment: 'left',
    computedAlignment: 'left', audioSpeed: '1.5', readerEdition: 'web-en', place: initialPlace,
  })
  await revealPhoneControls(page)
  await page.getByTestId('lab-phone-compare').click()
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'kjv-en')
  await page.getByTestId('lab-phone-compare').click()
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'web-en')
  await page.screenshot({ path: join(ARTIFACT_DIR, 'phone-dark-left-390x844.png') })

  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-lab-layout', 'desktop')
  await setAppearance(page, { theme: 'Book', fontSize: 1, alignment: 'Justify' })
  const desktop = await expectAppearance(page, {
    layout: 'desktop', theme: 'book', fontSize: '1', alignment: 'justify',
    computedAlignment: 'justify', audioSpeed: '1.5', readerEdition: 'web-en', place: initialPlace,
  })
  await page.getByTestId('lab-desktop-compare').click()
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'true')
  await page.getByTestId('lab-desktop-compare').click()
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'false')
  await page.screenshot({ path: join(ARTIFACT_DIR, 'desktop-book-justify-1440x900.png') })

  for (let pass = 0; pass < 2; pass += 1) {
    await page.setViewportSize({ width: 390, height: 844 })
    await expectAppearance(page, {
      layout: 'phone', theme: 'dark', fontSize: '1.6', alignment: 'left',
      audioSpeed: '1.5', readerEdition: 'web-en', place: initialPlace,
    })
    await page.setViewportSize({ width: 1440, height: 900 })
    await expectAppearance(page, {
      layout: 'desktop', theme: 'book', fontSize: '1', alignment: 'justify',
      audioSpeed: '1.5', readerEdition: 'web-en', place: initialPlace,
    })
  }

  await page.reload({ waitUntil: 'networkidle' })
  const desktopReload = await expectAppearance(page, {
    layout: 'desktop', theme: 'book', fontSize: '1', alignment: 'justify',
    computedAlignment: 'justify', audioSpeed: '1.5', readerEdition: 'web-en', place: initialPlace,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  const phoneAfterDesktopReload = await expectAppearance(page, {
    layout: 'phone', theme: 'dark', fontSize: '1.6', alignment: 'left',
    computedAlignment: 'left', audioSpeed: '1.5', readerEdition: 'web-en', place: initialPlace,
  })
  await page.reload({ waitUntil: 'networkidle' })
  const phoneReload = await expectAppearance(page, {
    layout: 'phone', theme: 'dark', fontSize: '1.6', alignment: 'left',
    computedAlignment: 'left', audioSpeed: '1.5', readerEdition: 'web-en', place: initialPlace,
  })

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-prefs') || '{}'))
  expect(stored).toMatchObject({
    version: 2,
    shared: {
      primaryEdition: 'web-en',
      compareEdition: 'kjv-en',
      audioEdition: 'web-en',
      audioSpeed: 1.5,
      compareOpen: true,
    },
    phone: { theme: 'dark', fontSize: 1.6, alignment: 'left' },
    desktop: { theme: 'book', fontSize: 1, alignment: 'justify' },
  })
  writeFileSync(join(ARTIFACT_DIR, 'preference-profile-lifecycle.json'), JSON.stringify({
    phone,
    desktop,
    desktopReload,
    phoneAfterDesktopReload,
    phoneReload,
    stored,
  }, null, 2))
  await context.close()
})
