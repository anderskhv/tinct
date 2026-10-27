// Private shared-reader selection controls, run against a local Vite server.
// All API/provider traffic is mocked; the browser is isolated and muted.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:3001'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = 'artifacts/shared-reader-menu'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))

async function open(theme, phone = false) {
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage()
  const chats = [], errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.abort()
    if (expectedBundle && url.pathname === '/reader') {
      const response = await route.fetch()
      const html = await response.text()
      const actual = [...html.matchAll(/\/assets\/index-[\w-]+\.js/g)].map(match => match[0])
      if (response.status() !== 200 || actual.length !== 1 || actual[0] !== expectedBundle) {
        console.error(`Menu reader document serves ${JSON.stringify(actual)}, expected ${expectedBundle}`)
        return route.abort('failed')
      }
      return route.fulfill({ response })
    }
    if (expectedBundle && /^\/assets\/index-[\w-]+\.js$/.test(url.pathname) && url.pathname !== expectedBundle) return route.abort('failed')
    if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
      const request = route.request().postDataJSON()
      chats.push(request)
      const answer = request.companion?.intent === 'quiz'
        ? JSON.stringify({ ideas: ['one'], thesis: 'a local fixture', questions: [1, 2, 3, 4].map(n => ({ idea: 0, q: `Local passage question ${n}?`, answer: 'A local answer', why: '', cite: '' })) })
        : 'A local fixture answer.'
      return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: answer } })}\n\ndata: {"type":"message_stop"}\n\n` })
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    return route.continue()
  })
  await page.addInitScript(value => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ fontFamily: 'garamond', fontSize: 1.0, fontSizeExplicit: true, theme: value, compareOpen: false }))
  }, theme)
  await page.goto(`${origin}/reader?book=frankenstein&sharedReader=1${phone ? '&layout=phone' : ''}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(400)
  assert.equal(await page.locator('.lab').getAttribute('data-shared-reader'), 'true')
  return { context, page, chats, errors }
}

async function select(page) {
  const words = page.locator('[data-testid="lab-word"]:visible')
  await words.nth(18).waitFor()
  const first = await words.nth(5).boundingBox(), last = await words.nth(18).boundingBox()
  assert(first && last)
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
  await page.mouse.up()
  await page.locator('.selection-popup, [data-testid="lab-phone-bar"]').first().waitFor()
}

try {
  for (const [theme, colors] of Object.entries({ light: ['rgb(37, 37, 37)', 'rgb(244, 242, 237)'], book: ['rgb(56, 42, 32)', 'rgb(242, 229, 206)'], dark: ['rgb(54, 52, 49)', 'rgb(243, 238, 229)'] })) {
    const { context, page, chats, errors } = await open(theme)
    try {
      await select(page)
      const bar = page.getByTestId('lab-desk-bar')
      await bar.waitFor()
      const selectedWords = await page.locator('.lab-hearing-word.is-selecting').allTextContents()
      assert(selectedWords.length >= 4)
      const actual = await bar.evaluate(node => { const style = getComputedStyle(node); return [style.backgroundColor, style.color, style.borderWidth] })
      assert.deepEqual(actual.slice(0, 2), colors, theme)
      assert.equal(actual[2], '1px')
      await page.waitForTimeout(200)
      await page.screenshot({ path: `${output}/desktop-${theme}.png` })
      await page.getByTestId('lab-dbar-more').click()
      await page.getByRole('menuitem', { name: /Quiz me/ }).waitFor()
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('role')), 'menuitem')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Escape')
      assert.equal(await page.getByTestId('lab-desk-more').count(), 0)
      assert.equal(await bar.count(), 1)
      await page.getByTestId('lab-dbar-more').click()
      await page.getByRole('menuitem', { name: /Quiz me/ }).click()
      const card = page.locator('.lab-desktop-card .lab-pcard-body')
      await card.waitFor()
      await page.getByTestId('lab-phone-quiz-question').waitFor()
      assert.match(await page.getByTestId('lab-phone-quiz-question').textContent(), /Local passage question 1/)
      const cardBox = await page.locator('.lab-pcard').boundingBox()
      assert(cardBox && cardBox.width <= 442 && cardBox.x >= 0 && cardBox.x + cardBox.width <= 1441, `desktop Quiz card stays contained: ${JSON.stringify(cardBox)}`)
      await page.screenshot({ path: `${output}/desktop-${theme}-quiz.png` })
      await page.keyboard.press('Escape')
      await page.locator('.lab-pcard').waitFor({ state: 'hidden' })
      await select(page)
      await page.getByTestId('lab-dbar-ask').click()
      const askCard = page.locator('.lab-desktop-card[data-kind="ask"]')
      const field = page.getByTestId('lab-dbar-ask-field')
      await field.waitFor()
      assert.equal(await askCard.count(), 0, 'desktop Ask composes in place before sending')
      await page.keyboard.type('Why does this happen?')
      assert.equal(await field.inputValue(), 'Why does this happen?', 'immediate typing retains every character')
      await page.screenshot({ path: `${output}/desktop-${theme}-ask.png` })
      await page.keyboard.press('Escape')
      await field.waitFor({state:'hidden'})
      await page.getByTestId('lab-dbar-ask').click()
      await field.fill('Why does this happen?')
      const questionResponse = page.waitForResponse(response => /\/api\/(?:lab-chat|chat)$/.test(new URL(response.url()).pathname) && (response.request().postData() || '').includes('Why does this happen?'))
      if (theme === 'light') await field.press('Enter')
      else await page.getByRole('button', {name:'Send question',exact:true}).click()
      await questionResponse
      await page.getByTestId('lab-ask-pane').waitFor()
      const questionRequests = chats.filter(body => JSON.stringify(body).includes('Why does this happen?'))
      assert.equal(questionRequests.length, 1, 'Ask sends one question request alongside the earlier Quiz request')
      const sent = JSON.stringify(questionRequests[0])
      assert(sent.includes('[The reader highlighted this passage:'), 'Ask includes a quoted selected passage')
      for (const word of selectedWords.slice(0, 4)) assert(sent.includes(word.trim()), `Ask carries selected word ${word}`)
      assert.equal(await page.locator('.lab-desktop-card[data-kind="ask"]').count(), 0, 'Ask opens Chat without a duplicate passage card')
      assert.equal(await page.getByTestId('lab-ask-turn-user').filter({hasText:'Why does this happen?'}).count(), 1, 'the submitted question appears once in Chat')
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  }
  // The route's initial desktop hint must not freeze phone selection routing.
  {
    const { context, page, errors } = await open('light')
    try {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.waitForFunction(() => document.querySelector('.lab')?.classList.contains('is-margin-phone'))
      await select(page)
      await page.getByTestId('lab-phone-bar').waitFor()
      assert.equal(await page.locator('.selection-popup').count(), 0)
      await page.keyboard.press('Escape')
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.waitForFunction(() => !document.querySelector('.lab')?.classList.contains('is-margin-phone'))
      await select(page)
      await page.getByTestId('lab-desk-bar').waitFor()
      assert.equal(await page.getByTestId('lab-phone-bar').count(), 0)
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  }
  for (const theme of ['light', 'book', 'dark', 'eink']) {
    const { context, page, errors } = await open(theme === 'eink' ? 'light' : theme, true)
    try {
      if (theme === 'eink') await page.evaluate(() => { document.documentElement.dataset.eink = 'true' })
      await select(page)
      const popup = page.getByTestId('lab-phone-bar')
      await popup.waitFor()
      const styles = await popup.evaluate(node => { const s = getComputedStyle(node); return [s.backgroundColor, s.color, s.boxShadow] })
      const colors = theme === 'eink' ? ['rgb(17, 17, 17)', 'rgb(255, 255, 255)']
        : { light: ['rgb(37, 37, 37)', 'rgb(244, 242, 237)'], book: ['rgb(56, 42, 32)', 'rgb(242, 229, 206)'], dark: ['rgb(54, 52, 49)', 'rgb(243, 238, 229)'] }[theme]
      assert.deepEqual(styles.slice(0, 2), colors)
      if (theme === 'eink') assert.equal(styles[2], 'none')
      for (const name of ['Ask', 'Explain', 'Simplify', 'More', 'Add note']) assert.equal(await popup.getByRole('button', { name, exact: true }).count(), 1)
      assert.equal(await page.locator('.selection-popup').count(), 0, 'phone uses the original compact Margin bar')
      const barBox = await popup.boundingBox()
      assert(barBox && barBox.x >= 0 && barBox.x + barBox.width <= 390, 'phone selection controls fit the viewport')
      await popup.getByRole('button', { name: 'More', exact: true }).click()
      for (const name of ['Define', 'Evaluate', 'Counterpoint', 'Quiz me', 'Copy']) assert.equal(await page.getByRole('menuitem', { name, exact: true }).count(), 1)
      await page.waitForTimeout(200)
      await page.screenshot({ path: `${output}/phone-${theme}.png` })
      await popup.getByRole('button', { name: 'More', exact: true }).click()
      await popup.getByRole('button', { name: 'Explain', exact: true }).click()
      await page.getByTestId('lab-phone-card-answer').waitFor()
      assert.match(await page.getByTestId('lab-phone-card-answer').innerText(), /local fixture answer/i)
      assert.equal(await page.locator('.lab-pcard').count(), 1, 'Explain opens one shared bottom card')
      const cardBox = await page.locator('.lab-pcard').boundingBox()
      assert(cardBox && cardBox.x >= 0 && cardBox.x + cardBox.width <= 391 && cardBox.y + cardBox.height <= 845, 'answer card stays on screen')
      await page.screenshot({ path: `${output}/phone-${theme}-explain.png` })
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  }
  console.log(`Shared reader menu browser check passed: three desktop themes, Ask/Escape/submit/context, More keyboard, contained Quiz cards, four phone looks. Screenshots: ${output}`)
} finally { await browser.close() }
