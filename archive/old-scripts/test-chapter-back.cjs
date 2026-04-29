// Test chapter back-navigation specifically: navigate forward to chapter 2,
// then press Left while at page 1 (which fires onPrevChapter), verify we
// land on the LAST page of chapter 1 (scrollFraction=1).
const { chromium } = require('@playwright/test')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('JS: ' + e.message))
  page.on('console', m => {
    if (m.type() === 'error') errors.push('Console: ' + m.text())
  })

  await page.goto('https://tinct.app/read', { waitUntil: 'commit' })
  await page.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('library', JSON.stringify(['odyssey']))
    localStorage.setItem('preferences', JSON.stringify({
      language: 'en', style: 'original', splitView: false, darkMode: false,
      panelOpen: false, panelTab: 'chat', splitEditionKey: 'modern-en',
      readingObjective: '', onboardingComplete: true, fontSize: 1.3, fontFamily: 'garamond',
      progressDisplay: { metric: 'percent', scope: 'book' },
    }))
    localStorage.setItem('book-onboarded:odyssey', JSON.stringify(true))
    localStorage.setItem('tinct-current-book', JSON.stringify('odyssey'))
    localStorage.setItem('device-preferences', JSON.stringify({ darkMode: false, fontSize: 1.3, fontFamily: 'garamond', splitView: false, panelOpen: false }))
  })
  await page.goto('https://tinct.app/read', { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.locator('body').click()

  let label = await page.locator('.page-nav-label').first().textContent()
  console.log('Start:', label)

  // Get to LAST page of book 1 — keep pressing right until label shows new chapter
  // For Odyssey Book I, just keep pressing right until label changes from Book I
  let prevChapter = 'I'
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(150)
    const t = await page.locator('.page-nav-label').first().textContent()
    if (t.includes('Book II') || t.includes('Book 2')) {
      console.log(`Reached chapter II at iteration ${i + 1}, label: ${t}`)
      break
    }
  }

  label = await page.locator('.page-nav-label').first().textContent()
  console.log('Now at:', label)

  // We should be on page 1 of Book II. Press Left → should go to LAST page of Book I.
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(800)
  label = await page.locator('.page-nav-label').first().textContent()
  console.log('After ArrowLeft from Book II page 1:', label)
  console.log('Expected: Book I — ... — N / N (last page of Book I)')
  console.log('Errors:', errors.length === 0 ? 'NONE' : errors.join(' | '))

  await browser.close()
})().catch(e => { console.log('Test failed:', e.message); process.exit(1) })
