// Test back-chapter navigation: from chapter 2 → previous chapter,
// expect to land on LAST page of chapter 1 (scrollFraction=1).
const { chromium } = require('@playwright/test')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  const logs = []
  page.on('pageerror', e => errors.push('JS: ' + e.message))
  page.on('console', m => {
    if (m.type() === 'error') errors.push('Console: ' + m.text())
    else if (m.type() === 'log') logs.push(m.text())
  })

  // Seed bypass
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

  // Check we're in chapter 1
  let label = await page.locator('.page-nav-label').first().textContent().catch(() => 'NONE')
  console.log('Initial label:', label)

  if (label === 'NONE') {
    console.log('Reader didn\'t render. Body excerpt:', (await page.locator('body').innerText()).slice(0, 300))
    await browser.close()
    return
  }

  // Press right arrow many times to advance into chapter 2 or 3
  console.log('Pressing right arrow to advance chapters...')
  await page.locator('body').click() // ensure focus
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)
  }
  label = await page.locator('.page-nav-label').first().textContent().catch(() => 'NONE')
  console.log('After 30 right-arrow presses, label:', label)

  // Now press LEFT until we're at page 1 of current chapter, then one more to go back chapter
  // Actually simpler: just press Left until we hit a chapter boundary visible from label
  console.log('Pressing left arrow to go back...')
  for (let i = 0; i < 6; i++) {
    const before = await page.locator('.page-nav-label').first().textContent().catch(() => 'NONE')
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(400)
    const after = await page.locator('.page-nav-label').first().textContent().catch(() => 'NONE')
    console.log(`  Left arrow ${i + 1}: ${before} → ${after}`)
  }

  console.log('Errors:', errors.length === 0 ? 'NONE' : errors.join(' | '))
  await browser.close()
})().catch(e => { console.log('Test failed:', e.message); process.exit(1) })
