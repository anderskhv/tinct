// Local, muted browser check for a completed private catalogue passage card.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:3001'
const output = process.env.TINCT_CARDS_OUTPUT || '/tmp/tinct-shared-reader-cards'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true,
  executablePath: process.env.TINCT_CHROMIUM_EXECUTABLE || undefined,
  args: ['--mute-audio', '--no-sandbox', '--autoplay-policy=user-gesture-required'] }))
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
const page = await context.newPage()
const errors = []
let interrupted = false
page.on('pageerror', error => errors.push(error.message))
await page.route('**/*', route => {
  const url = new URL(route.request().url())
  if (url.origin !== origin) return route.abort()
  if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
    const request = route.request().postDataJSON()
    const answer = request?.intent === 'quiz'
      ? JSON.stringify({ questions: [1, 2, 3].map(n => ({ q: `Question ${n} from this source?`, answer: `Answer ${n}`, why: 'From the selected passage.' })) })
      : interrupted ? 'An incomplete local answer still visible while interrupted.' : 'A complete local explanation saved in the reader Notebook.'
    return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: answer } })}\n\ndata: ${interrupted ? '{"type":"message_delta","delta":{"stop_reason":"max_tokens"}}' : '{"type":"message_stop"}'}\n\n` })
  }
  if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
  return route.continue()
})

try {
  await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('continuous-reader').waitFor({ timeout: 45000 })
  const words = page.locator('[data-testid="continuous-reader"] [data-testid="lab-word"]:visible')
  await words.nth(16).waitFor()
  const first = await words.nth(5).boundingBox(), last = await words.nth(16).boundingBox()
  assert(first && last)
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
  await page.mouse.up()
  await page.getByTestId('lab-dbar-explain').click()
  await page.locator('.selection-popup.is-contextual-explain').waitFor()
  await page.waitForFunction(() => {
    const items = JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]')
    return items.some(item => item.card?.kind === 'explain' && item.messages?.some(message => message.content.includes('A complete local explanation')))
  }, null, { timeout: 15000 })
  const card = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein')).find(item => item.card?.kind === 'explain'))
  assert(card.card.anchor?.fromWord > 0, 'card keeps a nonzero source-word anchor')
  await page.keyboard.press('Escape')
  // Repeating an intentional Explain at the same source range must create a
  // second card; two subscribers to the *first* response created only one.
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
  await page.mouse.up()
  await page.getByTestId('lab-dbar-explain').click()
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]')
    .filter(item => item.card?.kind === 'explain' && !item.card.gone).length === 2, null, { timeout: 15000 })
  const repeatedCards = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]')
    .filter(item => item.card?.kind === 'explain' && !item.card.gone))
  assert.equal(new Set(repeatedCards.map(item => item.id)).size, 2, 'separate explicit actions preserve both Notebook identities')
  await page.keyboard.press('Escape')
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
  await page.mouse.up()
  await page.getByTestId('lab-dbar-more').click()
  await page.getByTestId('lab-dmore-quiz').click()
  for (let number = 1; number <= 3; number++) {
    await page.getByTestId('lab-phone-quiz-question').getByText(`Question ${number} from this source?`).waitFor()
    await page.getByTestId('lab-phone-quiz-show').click()
    await page.getByTestId('lab-phone-quiz-next').click()
  }
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]')
    .some(item => item.card?.kind === 'quiz' && item.card.anchor?.fromWord > 0 && item.messages?.at(-1)?.content?.includes('Question 3 from this source?')), null, { timeout: 15000 })
  await page.keyboard.press('Escape')
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-menu').waitFor()
  await page.getByTestId('lab-super-row-notebook').click()
  await page.screenshot({ path: `${output}/notebook-saved-card.png` })
  await page.getByRole('button', { name: `Delete Notebook entry ${card.id}` }).click()
  await page.getByRole('button', { name: 'Undo' }).click()
  const restored = await page.evaluate(id => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein')).find(item => item.id === id), card.id)
  assert(restored?.card && !restored.card.gone && restored.card.u > card.card.u, 'Undo revives the newer card revision')
  await page.getByRole('button', { name: 'Close overlay' }).click()
  if (await page.getByTestId('lab-toc').count()) await page.getByRole('button', { name: 'Back to book' }).click()
  interrupted = true
  const laterFirst = await words.nth(25).boundingBox(), laterLast = await words.nth(34).boundingBox()
  assert(laterFirst && laterLast)
  await page.mouse.move(laterFirst.x + laterFirst.width / 2, laterFirst.y + laterFirst.height / 2)
  await page.mouse.down()
  await page.mouse.move(laterLast.x + laterLast.width / 2, laterLast.y + laterLast.height / 2, { steps: 10 })
  await page.mouse.up()
  await page.getByTestId('lab-dbar-explain').click()
  await page.getByText('The explanation couldn’t be loaded. Your passage is still here.').waitFor()
  await page.waitForTimeout(300)
  const cardsAfterInterrupted = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').filter(item => item.card?.kind === 'explain' && !item.card.gone).map(item => ({ id: item.id, answer: item.messages?.at(-1)?.content?.slice(0, 80) })))
  assert.equal(cardsAfterInterrupted.length, 2, `a max_tokens interruption offers retry without marking a third card complete: ${JSON.stringify(cardsAfterInterrupted)}`)
  await page.keyboard.press('Escape')
  interrupted = false
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'tinct:chat-history:frankenstein') throw new DOMException('Fixture quota', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  const quotaFirst = await words.nth(41).boundingBox(), quotaLast = await words.nth(50).boundingBox()
  assert(quotaFirst && quotaLast)
  await page.mouse.move(quotaFirst.x + quotaFirst.width / 2, quotaFirst.y + quotaFirst.height / 2)
  await page.mouse.down()
  await page.mouse.move(quotaLast.x + quotaLast.width / 2, quotaLast.y + quotaLast.height / 2, { steps: 10 })
  await page.mouse.up()
  await page.getByTestId('lab-dbar-explain').click()
  await page.getByText('A complete local explanation saved in the reader Notebook.').waitFor()
  await page.getByText('This answer is here for now, but it could not be saved to Notebook.').waitFor()
  await page.screenshot({ path: `${output}/unsaved-full-answer.png` })
  const cardsAfterQuota = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').filter(item => item.card?.kind === 'explain' && !item.card.gone).length)
  assert.equal(cardsAfterQuota, 2, 'quota failure keeps full answer on screen without claiming a durable card')
  assert.deepEqual(errors, [])
  console.log('Shared reader completed Explain card, Notebook Delete/Undo, interruption retry, and quota unsaved full answer passed')
} finally { await browser.close() }
