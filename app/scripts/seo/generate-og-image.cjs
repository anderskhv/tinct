#!/usr/bin/env node
/**
 * Generate app/public/og-image.png (1200x630) from og-image-template.html
 * using Playwright. Pure typography in the Tinct visual identity.
 *
 * Usage: node scripts/seo/generate-og-image.cjs
 */

const path = require('path')

async function main() {
  const { chromium } = require('@playwright/test')
  const templatePath = path.join(__dirname, 'og-image-template.html')
  const outPath = path.resolve(__dirname, '../../public/og-image.png')

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: outPath, type: 'png' })
  await browser.close()
  console.log(`Wrote ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
