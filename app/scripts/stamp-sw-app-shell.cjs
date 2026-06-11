#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const appHtmlPath = path.join(dist, 'app.html')
const swPath = path.join(dist, 'sw.js')
const fontCssPath = path.join(dist, 'fonts', 'tinct-fonts.css')

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function addLocalUrl(urls, raw) {
  if (!raw || !raw.startsWith('/')) return
  if (raw.startsWith('//')) return
  urls.add(raw.split(/[?#]/)[0])
}

if (!fs.existsSync(appHtmlPath)) {
  throw new Error(`Missing ${appHtmlPath}`)
}
if (!fs.existsSync(swPath)) {
  throw new Error(`Missing ${swPath}`)
}

const urls = new Set(['/app.html'])
const appHtml = read(appHtmlPath)
for (const match of appHtml.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
  addLocalUrl(urls, match[1])
}

if (fs.existsSync(fontCssPath)) {
  addLocalUrl(urls, '/fonts/tinct-fonts.css')
  const fontCss = read(fontCssPath)
  for (const match of fontCss.matchAll(/url\(([^)]+)\)/g)) {
    const cleaned = match[1].trim().replace(/^["']|["']$/g, '')
    if (cleaned.startsWith('/')) {
      addLocalUrl(urls, cleaned)
    } else if (cleaned && !cleaned.includes(':')) {
      addLocalUrl(urls, `/fonts/${cleaned}`)
    }
  }
}

const sortedUrls = [...urls].sort()
const digest = crypto
  .createHash('sha256')
  .update(sortedUrls.join('\n'))
  .digest('hex')
  .slice(0, 12)

let sw = read(swPath)
sw = sw.replace(
  /const APP_SHELL_CACHE_NAME = ['"][^'"]+['"]/,
  `const APP_SHELL_CACHE_NAME = 'tinct-app-shell-${digest}'`,
)
sw = sw.replace(
  /const APP_SHELL_PRECACHE_URLS = \[[\s\S]*?\]/,
  `const APP_SHELL_PRECACHE_URLS = ${JSON.stringify(sortedUrls, null, 2)}`,
)

fs.writeFileSync(swPath, sw)
console.log(`[sw] Stamped app shell cache tinct-app-shell-${digest} with ${sortedUrls.length} URLs`)
