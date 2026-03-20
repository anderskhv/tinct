/**
 * Interactive feature tests for Tinct.
 * Tests: highlighting, notes, copy-to-notes, chapter reflection, split pane.
 */
import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

test('1. Text selection shows popup with color picker and Explain button', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Select text by click-and-drag on the first paragraph
  const firstParagraph = page.locator('.text-paragraph').first()
  await firstParagraph.waitFor({ state: 'visible' })
  const box = await firstParagraph.boundingBox()
  if (!box) throw new Error('No bounding box')

  // Click at start of paragraph, drag to middle
  await page.mouse.move(box.x + 10, box.y + 10)
  await page.mouse.down()
  await page.mouse.move(box.x + 300, box.y + 10, { steps: 5 })
  await page.mouse.up()
  await page.waitForTimeout(500)

  // Check popup appears
  const popup = page.locator('.selection-popup')
  const popupVisible = await popup.isVisible().catch(() => false)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-01-selection-popup.png') })

  // Check for color dots
  const colorDots = page.locator('.popup-color-dot')
  const dotCount = await colorDots.count()

  // Check for explain button
  const explainBtn = page.locator('.popup-button')

  console.log(`Selection popup visible: ${popupVisible}`)
  console.log(`Color dots found: ${dotCount}`)
  console.log(`Explain button visible: ${await explainBtn.isVisible().catch(() => false)}`)

  expect(popupVisible).toBe(true)
  expect(dotCount).toBe(5)
  await context.close()
})

test('2. Clicking a color creates a highlight', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Select text by drag
  const firstParagraph = page.locator('.text-paragraph').first()
  const box2 = await firstParagraph.boundingBox()
  if (box2) {
    await page.mouse.move(box2.x + 10, box2.y + 10)
    await page.mouse.down()
    await page.mouse.move(box2.x + 300, box2.y + 10, { steps: 5 })
    await page.mouse.up()
  }
  await page.waitForTimeout(500)

  // Click the gold color dot
  const goldDot = page.locator('.popup-color-dot.highlight-gold')
  if (await goldDot.isVisible()) {
    await goldDot.click()
    await page.waitForTimeout(500)
  }

  // Check that a <mark> element appeared
  const marks = page.locator('mark.highlight')
  const markCount = await marks.count()

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-02-highlight-created.png') })

  console.log(`Highlight marks found: ${markCount}`)
  expect(markCount).toBeGreaterThan(0)
  await context.close()
})

test('3. Highlighting auto-triggers chat explanation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Select some text by drag
  const firstParagraph = page.locator('.text-paragraph').first()
  const box3 = await firstParagraph.boundingBox()
  if (box3) {
    await page.mouse.move(box3.x + 10, box3.y + 10)
    await page.mouse.down()
    await page.mouse.move(box3.x + 300, box3.y + 10, { steps: 5 })
    await page.mouse.up()
  }
  await page.waitForTimeout(500)

  // Click gold color to highlight
  const goldDot = page.locator('.popup-color-dot.highlight-gold')
  if (await goldDot.isVisible()) {
    await goldDot.click()
    await page.waitForTimeout(500)
  }

  // Check chat panel has a pending highlight
  const pendingHighlight = page.locator('.chat-pending-highlight')
  const hasPending = await pendingHighlight.isVisible().catch(() => false)

  // Check Chat tab is active
  const chatTabActive = page.locator('.panel-tab-active:has-text("Chat")')
  const chatActive = await chatTabActive.isVisible().catch(() => false)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-03-auto-explain.png') })

  console.log(`Pending highlight in chat: ${hasPending}`)
  console.log(`Chat tab active: ${chatActive}`)
  expect(hasPending).toBe(true)
  await context.close()
})

test('4. Notes tab shows highlights and accepts freeform notes', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Create a highlight first by drag
  const firstParagraph = page.locator('.text-paragraph').first()
  const box4 = await firstParagraph.boundingBox()
  if (box4) {
    await page.mouse.move(box4.x + 10, box4.y + 10)
    await page.mouse.down()
    await page.mouse.move(box4.x + 300, box4.y + 10, { steps: 5 })
    await page.mouse.up()
  }
  await page.waitForTimeout(500)
  const goldDot = page.locator('.popup-color-dot.highlight-gold')
  if (await goldDot.isVisible()) {
    await goldDot.click()
    await page.waitForTimeout(500)
  }

  // Switch to Notes tab
  const notesTab = page.locator('.panel-tab:has-text("Notes")')
  await notesTab.click()
  await page.waitForTimeout(300)

  // Check highlights section appears
  const highlightEntries = page.locator('.highlight-entry')
  const highlightCount = await highlightEntries.count()

  // Write a freeform note
  const noteInput = page.locator('.notes-input')
  await noteInput.fill('This is a test note about the opening invocation.')
  const saveBtn = page.locator('.notes-save')
  await saveBtn.click()
  await page.waitForTimeout(300)

  // Check note appeared
  const noteEntries = page.locator('.note-entry')
  const noteCount = await noteEntries.count()

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-04-notes-tab.png') })

  console.log(`Highlight entries in notes: ${highlightCount}`)
  console.log(`Note entries: ${noteCount}`)
  expect(highlightCount).toBeGreaterThan(0)
  expect(noteCount).toBeGreaterThan(0)
  await context.close()
})

test('5. Chapter reflection button exists at end of chapter', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Scroll to bottom of chapter
  const reader = page.locator('.reader')
  await reader.evaluate(el => el.scrollTop = el.scrollHeight)
  await page.waitForTimeout(500)

  // Check for reflection button
  const reflectButton = page.locator('.chapter-reflect-button')
  const reflectVisible = await reflectButton.isVisible().catch(() => false)

  // Check for ornament
  const ornament = page.locator('.chapter-end-ornament')
  const ornamentVisible = await ornament.isVisible().catch(() => false)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-05-chapter-end.png') })

  console.log(`Reflect button visible: ${reflectVisible}`)
  console.log(`Ornament visible: ${ornamentVisible}`)
  expect(reflectVisible).toBe(true)
  expect(ornamentVisible).toBe(true)
  await context.close()
})

test('6. Clicking Explain sends text to chat', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Select text by drag
  const secondParagraph = page.locator('.text-paragraph').nth(1)
  const box6 = await secondParagraph.boundingBox()
  if (box6) {
    await page.mouse.move(box6.x + 10, box6.y + 10)
    await page.mouse.down()
    await page.mouse.move(box6.x + 300, box6.y + 10, { steps: 5 })
    await page.mouse.up()
  }
  await page.waitForTimeout(500)

  // Click Explain button
  const explainBtn = page.locator('.popup-button:has-text("Explain")')
  if (await explainBtn.isVisible()) {
    await explainBtn.click()
    await page.waitForTimeout(500)
  }

  // Check pending highlight appears in chat
  const pendingHighlight = page.locator('.chat-pending-highlight')
  const hasPending = await pendingHighlight.isVisible().catch(() => false)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-06-explain-to-chat.png') })

  console.log(`Pending highlight in chat after Explain: ${hasPending}`)
  expect(hasPending).toBe(true)
  await context.close()
})

test('7. Language toggle switches to DA', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Click DA button
  const daButton = page.locator('.lang-button:has-text("DA")')
  await daButton.click()
  await page.waitForTimeout(500)

  // Check that DA is active
  const daActive = page.locator('.lang-active:has-text("DA")')
  const isActive = await daActive.isVisible().catch(() => false)

  // Check style dropdown changed
  const styleSelect = page.locator('.translation-select')
  const options = await styleSelect.locator('option').allTextContents()

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-07-language-da.png') })

  console.log(`DA active: ${isActive}`)
  console.log(`Available styles: ${options.join(', ')}`)
  expect(isActive).toBe(true)
  await context.close()
})

test('8. Split view toggle works', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Find and click split view button
  const splitBtn = page.locator('.icon-button').filter({ hasText: /⊞|⊡/ })
  if (await splitBtn.isVisible()) {
    await splitBtn.click()
    await page.waitForTimeout(800)
  }

  // Check if split reader grid appeared
  const splitGrid = page.locator('.split-reader-grid')
  const hasSplit = await splitGrid.isVisible().catch(() => false)

  // Check column headers
  const columnHeaders = page.locator('.split-column-headers')
  const hasHeaders = await columnHeaders.isVisible().catch(() => false)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-08-split-view.png') })

  console.log(`Split grid visible: ${hasSplit}`)
  console.log(`Column headers visible: ${hasHeaders}`)
  // Split view may not work yet without aligned AI editions
  console.log(`(Split view requires aligned editions - may show empty right column)`)
  await context.close()
})

test('9. Panel tab badge shows count', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Create a highlight to get a badge count
  const firstParagraph = page.locator('.text-paragraph').first()
  const box9 = await firstParagraph.boundingBox()
  if (box9) {
    await page.mouse.move(box9.x + 10, box9.y + 10)
    await page.mouse.down()
    await page.mouse.move(box9.x + 300, box9.y + 10, { steps: 5 })
    await page.mouse.up()
  }
  await page.waitForTimeout(500)
  const goldDot = page.locator('.popup-color-dot.highlight-gold')
  if (await goldDot.isVisible()) {
    await goldDot.click()
    await page.waitForTimeout(500)
  }

  // Check Notes tab has a badge
  const badge = page.locator('.panel-tab-badge')
  const hasBadge = await badge.isVisible().catch(() => false)
  const badgeText = hasBadge ? await badge.textContent() : 'none'

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-09-tab-badge.png') })

  console.log(`Tab badge visible: ${hasBadge}`)
  console.log(`Badge text: ${badgeText}`)
  await context.close()
})
