#!/usr/bin/env node
const { markInternal } = require('../lib/internalTraffic.cjs')
/**
 * Generate the current 1200x630 social preview from og-image-template.html.
 *
 * Usage: node scripts/seo/generate-og-image.cjs
 */

const path = require('path')

async function main() {
  const { chromium } = require('@playwright/test')
  const templatePath = path.join(__dirname, 'og-image-template.html')
  const legacyPath = path.resolve(__dirname, '../../public/og-image.png')
  const currentPath = path.resolve(__dirname, '../../public/og-image-v4.jpg')
  // The Worker puts this one on every page that is not a book's (src/worker/routes/seo.ts BRAND_IMAGE).
  const brandPath = path.resolve(__dirname, '../../public/brand/20261125/share-tinct-1200x630.jpg')

  const browser = await markInternal(await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}))
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: currentPath, type: 'jpeg', quality: 88 })
  await page.screenshot({ path: brandPath, type: 'jpeg', quality: 88 })
  await page.screenshot({ path: legacyPath, type: 'png' })
  await browser.close()
  console.log(`Wrote ${currentPath}, ${brandPath} and refreshed legacy ${legacyPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
