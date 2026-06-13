#!/usr/bin/env node
/**
 * audit-seo.cjs
 *
 * Repeatable SEO guardrail for the generated Tinct surface.
 *
 * Default mode audits local generated files:
 *   npm run seo:audit
 *
 * Live mode also checks deployed HTTP behavior:
 *   npm run seo:audit -- --base=https://tinct.app
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(APP_DIR, 'public')
const READ_DIR = path.join(PUBLIC_DIR, 'read')
const EDITIONS_DIR = path.join(PUBLIC_DIR, 'data/editions')
const SITEMAP = path.join(PUBLIC_DIR, 'sitemap.xml')
const ORIGIN = 'https://tinct.app'

const HOLD_BACK_BOOK_IDS = new Set([])

const GENERIC_TITLES = new Set([
  'Tinct — A New Way to Read',
  'Tinct - A New Way to Read',
])

let failures = 0
let warnings = 0

function fail(message) {
  failures += 1
  console.error(`✗ ${message}`)
}

function warn(message) {
  warnings += 1
  console.warn(`! ${message}`)
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function parseArgs(argv) {
  const args = { base: '', limit: 0 }
  for (const arg of argv) {
    if (arg.startsWith('--base=')) args.base = arg.slice('--base='.length).replace(/\/+$/, '')
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.slice('--limit='.length)) || 0
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/audit-seo.cjs [--base=https://tinct.app] [--limit=50]')
      process.exit(0)
    } else {
      fail(`Unknown argument: ${arg}`)
    }
  }
  return args
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
}

function cleanPathFromUrl(url) {
  return new URL(url).pathname.replace(/\/$/, '') || '/'
}

function htmlPathForCleanPath(cleanPath) {
  if (cleanPath === '/read') return path.join(READ_DIR, 'index.html')
  const match = cleanPath.match(/^\/read\/([a-z0-9-]+)\/(summary|chapters|cast|themes|chapter-\d+)$/i)
  if (!match) return null
  return path.join(READ_DIR, match[1], `${match[2]}.html`)
}

function tagAttrs(tag) {
  const attrs = {}
  for (const match of tag.matchAll(/\s([a-zA-Z:-]+)=(["'])([\s\S]*?)\2/g)) {
    attrs[match[1].toLowerCase()] = match[3]
  }
  return attrs
}

function attr(html, name) {
  for (const match of html.matchAll(/<meta\s+[^>]*>/gi)) {
    const attrs = tagAttrs(match[0])
    if (attrs.name === name || attrs.property === name) return attrs.content || ''
  }
  return ''
}

function title(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || ''
}

function canonical(html) {
  return html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] || ''
}

function hasBookJsonLd(html) {
  return /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?["']@type["']\s*:\s*["']Book["'][\s\S]*?<\/script>/i.test(html)
}

function assertNoHeldBackContent(urls) {
  for (const id of HOLD_BACK_BOOK_IDS) {
    const inSitemap = urls.some(url => url.includes(`/read/${id}`))
    if (inSitemap) fail(`held-back book appears in sitemap: ${id}`)

    const readDir = path.join(READ_DIR, id)
    if (fs.existsSync(readDir)) fail(`held-back book has generated SEO pages: public/read/${id}`)

    const editionFiles = fs.existsSync(EDITIONS_DIR)
      ? fs.readdirSync(EDITIONS_DIR).filter(file => file.startsWith(`${id}-`) && file.endsWith('.json'))
      : []
    if (editionFiles.length > 0) fail(`held-back book has public edition JSON: ${editionFiles.join(', ')}`)
  }
}

function auditLocalSitemap() {
  if (!fs.existsSync(SITEMAP)) {
    fail('public/sitemap.xml is missing; run npm run sitemap')
    return []
  }

  const xml = read(SITEMAP)
  const urls = sitemapUrls(xml)
  if (urls.length === 0) fail('sitemap contains no URLs')
  else pass(`sitemap has ${urls.length} URLs`)

  const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index)
  if (duplicateUrls.length > 0) fail(`sitemap has duplicate URLs: ${[...new Set(duplicateUrls)].slice(0, 5).join(', ')}`)
  else pass('sitemap has no duplicate URLs')

  const nonCanonical = urls.filter(url => !url.startsWith(`${ORIGIN}/`))
  if (nonCanonical.length > 0) fail(`sitemap contains non-canonical hosts: ${nonCanonical.slice(0, 5).join(', ')}`)
  else pass('sitemap URLs use https://tinct.app')

  assertNoHeldBackContent(urls)

  return urls
}

function auditLocalStaticPages(urls) {
  let checked = 0
  for (const url of urls) {
    const cleanPath = cleanPathFromUrl(url)
    const htmlPath = htmlPathForCleanPath(cleanPath)
    if (!htmlPath) continue

    if (!fs.existsSync(htmlPath)) {
      fail(`sitemap URL has no static HTML file: ${cleanPath}`)
      continue
    }

    const html = read(htmlPath)
    const pageTitle = title(html)
    const description = attr(html, 'description')
    const pageCanonical = canonical(html)

    if (!pageTitle) fail(`${cleanPath} has no <title>`)
    if (GENERIC_TITLES.has(pageTitle)) fail(`${cleanPath} has generic title: ${pageTitle}`)
    if (!description || description.length < 80) fail(`${cleanPath} has missing/short meta description`)
    if (pageCanonical !== url) fail(`${cleanPath} canonical mismatch: expected ${url}, got ${pageCanonical || '(missing)'}`)
    if (html.includes('&amp;amp;')) fail(`${cleanPath} contains double-escaped &amp;amp;`)
    checked += 1
  }

  if (checked === 0) warn('no static SEO pages were checked from sitemap')
  else pass(`checked ${checked} local static SEO pages`)
}

async function fetchNoBody(url, init = {}) {
  return fetch(url, {
    redirect: 'manual',
    ...init,
    headers: {
      'User-Agent': 'Tinct SEO audit',
      ...(init.headers || {}),
    },
  })
}

async function auditLive(base, localUrls, limit) {
  const sitemapResp = await fetchNoBody(`${base}/sitemap.xml`)
  if (sitemapResp.status !== 200) {
    fail(`live sitemap returned ${sitemapResp.status}`)
    return
  }

  const liveXml = await sitemapResp.text()
  const liveUrls = sitemapUrls(liveXml)
  if (liveUrls.length !== localUrls.length) {
    fail(`live sitemap URL count differs from local: live ${liveUrls.length}, local ${localUrls.length}`)
  } else {
    pass(`live sitemap has expected ${liveUrls.length} URLs`)
  }
  assertNoHeldBackContent(liveUrls)

  const urlsToCheck = (limit > 0 ? liveUrls.slice(0, limit) : liveUrls)
  let checked = 0
  for (const canonicalUrl of urlsToCheck) {
    const url = canonicalUrl.replace(ORIGIN, base)
    const resp = await fetchNoBody(url)
    if (resp.status !== 200) {
      fail(`live URL returned ${resp.status}: ${canonicalUrl}`)
      continue
    }

    const contentType = resp.headers.get('content-type') || ''
    const isReadPage = new URL(canonicalUrl).pathname.startsWith('/read')
    if (isReadPage && contentType.includes('text/html')) {
      const html = await resp.text()
      const pageTitle = title(html)
      const description = attr(html, 'description')
      const pageCanonical = canonical(html)
      if (!pageTitle) fail(`live ${canonicalUrl} has no <title>`)
      if (GENERIC_TITLES.has(pageTitle)) fail(`live ${canonicalUrl} has generic title`)
      if (!description || description.length < 80) fail(`live ${canonicalUrl} has missing/short meta description`)
      if (pageCanonical !== canonicalUrl) fail(`live ${canonicalUrl} canonical mismatch: ${pageCanonical || '(missing)'}`)
      if (html.includes('&amp;amp;')) fail(`live ${canonicalUrl} contains double-escaped &amp;amp;`)
    }
    checked += 1
  }
  pass(`checked ${checked} live sitemap URLs${limit > 0 ? ` (limited from ${liveUrls.length})` : ''}`)

  const unknown = await fetchNoBody(`${base}/read/seo-audit-missing-book`)
  const unknownRobots = unknown.headers.get('x-robots-tag') || ''
  if (unknown.status !== 404) fail(`unknown /read book returned ${unknown.status}, expected 404`)
  else if (!unknownRobots.includes('noindex')) fail('unknown /read book is missing X-Robots-Tag noindex')
  else pass('unknown /read book returns 404 noindex')

  const bookShell = await fetchNoBody(`${base}/read/odyssey`)
  if (bookShell.status !== 200) {
    fail(`/read/odyssey returned ${bookShell.status}`)
  } else {
    const html = await bookShell.text()
    const pageCanonical = canonical(html)
    if (pageCanonical !== `${ORIGIN}/read/odyssey`) fail(`/read/odyssey canonical mismatch: ${pageCanonical || '(missing)'}`)
    if (!hasBookJsonLd(html)) fail('/read/odyssey is missing Book JSON-LD')
    else pass('/read/odyssey includes Book JSON-LD')
  }

  const knownData = await fetchNoBody(`${base}/data/editions/odyssey-modern-en.json`, { method: 'HEAD' })
  const knownDataRobots = knownData.headers.get('x-robots-tag') || ''
  if (knownData.status !== 200) fail(`known edition JSON returned ${knownData.status}`)
  else if (!knownDataRobots.includes('noindex')) fail('known edition JSON is missing X-Robots-Tag noindex')
  else pass('known edition JSON is noindex')

  const unknownData = await fetchNoBody(`${base}/data/editions/seo-audit-missing-book-modern-en.json`, { method: 'HEAD' })
  const unknownDataRobots = unknownData.headers.get('x-robots-tag') || ''
  if (unknownData.status !== 404) fail(`unknown edition JSON returned ${unknownData.status}, expected 404`)
  else if (!unknownDataRobots.includes('noindex')) fail('unknown edition JSON is missing X-Robots-Tag noindex')
  else pass('unknown edition JSON returns 404 noindex')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const urls = auditLocalSitemap()
  auditLocalStaticPages(urls)

  if (args.base) {
    await auditLive(args.base, urls, args.limit)
  }

  if (failures > 0) {
    console.error(`\nSEO audit failed: ${failures} failure${failures === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}`)
    process.exit(1)
  }

  console.log(`\nSEO audit passed: ${warnings} warning${warnings === 1 ? '' : 's'}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
