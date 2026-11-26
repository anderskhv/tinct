#!/usr/bin/env node
const { markInternal } = require('../lib/internalTraffic.cjs')
/**
 * Generate the /conjecture link preview (1200x630) from og-conjecture-template.html, as generate-og-image.cjs
 * does for the brand image. The Worker names it in src/worker/routes/seo.ts CONJECTURE_SHARE.
 *
 * Usage: node scripts/seo/generate-conjecture-og-image.cjs
 */

const fs = require('fs')
const path = require('path')

async function main() {
  const { chromium } = require('@playwright/test')
  const templatePath = path.join(__dirname, 'og-conjecture-template.html')
  const outPath = path.resolve(__dirname, '../../public/brand/20261126/share-conjecture-1200x630.jpg')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })

  const browser = await markInternal(await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}))
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 88 })
  await browser.close()
  console.log(`Wrote ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
