/**
 * Escape closes the Chat panel on the phone — the regression guard for the
 * key that PR #45 taught only the desktop.
 *
 * A phone with a hardware or Bluetooth keyboard is the case here, so the
 * check drives a real key press at 393x852 and asserts three things: the
 * panel closes, the super-menu it was chosen from does not come back in its
 * place, and the half-typed line is still in the composer when Chat reopens.
 *
 * Nothing reaches the API: /api/** is answered locally, exactly as the lab
 * shot scripts stub it, and no chat is ever sent.
 *
 * Usage: node scripts/check-phone-chat-escape.cjs <baseUrl> <outDir>
 */

const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const BASE = process.argv[2] || 'http://127.0.0.1:4202'
const OUT = process.argv[3] || '/tmp/tinct-phone-chat-escape'
const EXECUTABLE = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const DRAFT = 'why does Athene go to Ithaca'

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ executablePath: EXECUTABLE })
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  await page.route('**/api/**', route => route.fulfill({ status: 404, body: '{}' }))
  await page.addInitScript(() => {
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en', compareEditionKey: 'modern-en',
      savedPlace: { bookId: 'odyssey', chapterNumber: 1, paragraphIndex: 0, page: 0 },
    }))
  })
  await page.goto(`${BASE}/lab/phone?chrome=v2`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('lab-book').waitFor()
  await page.waitForTimeout(2500)

  const root = page.getByTestId('lab-root')
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-chat').click()
  await page.waitForTimeout(600)
  await page.getByTestId('lab-ask-input').fill(DRAFT)
  await page.waitForTimeout(250)
  assert.ok((await root.getAttribute('class')).includes('has-phone-ask'), 'Chat must be open before Escape')
  await page.screenshot({ path: path.join(OUT, 'phone-chat-open.png') })

  await page.keyboard.press('Escape')
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'phone-chat-after-escape.png') })

  const classes = await root.getAttribute('class')
  assert.ok(!classes.includes('has-phone-ask'), 'Escape must close the Chat panel on the phone')
  assert.equal(await root.getAttribute('data-super-menu'), 'closed', 'The super-menu must not reopen in the panel’s place')
  assert.equal(await page.locator('[data-testid="lab-super-layer"]').count(), 0, 'No menu layer may be left over the page')
  assert.equal(await page.locator('[data-testid="lab-ask-composer"]').count(), 0, 'The composer must be gone with the panel')

  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-chat').click()
  await page.waitForTimeout(600)
  assert.equal(await page.getByTestId('lab-ask-input').inputValue(), DRAFT, 'The draft must survive the close')
  await page.screenshot({ path: path.join(OUT, 'phone-chat-draft-kept.png') })

  await browser.close()
  console.log('phone Escape: panel closed, menu stayed shut, draft kept')
}

main().catch(error => { console.error(error); process.exit(1) })
