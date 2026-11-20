#!/usr/bin/env node
/**
 * After `vite build`: give every scene page (dist/read/{bookId}/{scene}.html and the plays' book pages in
 * dist/seo/book-pages/, scripts/seo/build-scene-pages.mjs)
 * and every chapter page (dist/seo/chapter-packs/{bookId}/{n}.txt, scripts/seo/build-chapter-pages.mjs)
 * the reader's own stylesheets, the exact <link rel="stylesheet"> tags of the built reader page (dist/app.html),
 * so a scene page and the reader are drawn by the same CSS and cannot drift. Fails the build when the reader page
 * has no stylesheet or a scene page is left without one.
 */
const fs = require('fs')
const path = require('path')

const DIST = path.resolve(__dirname, '../dist')
const PLACEHOLDER = '<!--tinct:reader-css-->'

function readerStylesheets(appHtml) {
  const links = appHtml.match(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi) || []
  // The fonts stylesheet is already on the page; the reader's own CSS is Vite's built /assets/*.css.
  return links.filter(link => /href=["']\/assets\/[^"']+\.css["']/i.test(link))
}

function stampScenePages(dist = DIST) {
  const appHtml = fs.readFileSync(path.join(dist, 'app.html'), 'utf8')
  const links = readerStylesheets(appHtml)
  if (!links.length) throw new Error('[scene pages] dist/app.html links no /assets/*.css stylesheet')
  for (const link of links) {
    const href = link.match(/href=["']([^"']+)["']/i)[1]
    if (!fs.existsSync(path.join(dist, href))) throw new Error(`[scene pages] ${href} is linked by app.html but missing from dist`)
  }
  // The tags as the reader page has them (crossorigin included), so the reader finds them in the browser's cache.
  const tags = links.join('\n  ')
  let stamped = 0
  const readDir = path.join(dist, 'read')
  for (const book of fs.existsSync(readDir) ? fs.readdirSync(readDir) : []) {
    const dir = path.join(readDir, book)
    if (!fs.statSync(dir).isDirectory()) continue
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.html')) continue
      const page = path.join(dir, file)
      const html = fs.readFileSync(page, 'utf8')
      if (!html.includes(PLACEHOLDER)) continue
      fs.writeFileSync(page, html.split(PLACEHOLDER).join(tags))
      stamped += 1
    }
  }
  // The plays' book pages (/read/{bookId}: the first scene under the play's header), kept outside /read/.
  const playBookDir = path.join(dist, 'seo', 'book-pages')
  for (const file of fs.existsSync(playBookDir) ? fs.readdirSync(playBookDir) : []) {
    if (!file.endsWith('.html')) continue
    const page = path.join(playBookDir, file)
    const html = fs.readFileSync(page, 'utf8')
    if (!html.includes(PLACEHOLDER)) continue
    fs.writeFileSync(page, html.split(PLACEHOLDER).join(tags))
    stamped += 1
  }
  // The chapter pages (scripts/seo/build-chapter-pages.mjs) are written in packs; every page in a pack gets the same tags.
  let packs = 0
  const packDir = path.join(dist, 'seo', 'chapter-packs')
  for (const book of fs.existsSync(packDir) ? fs.readdirSync(packDir) : []) {
    const dir = path.join(packDir, book)
    if (!fs.statSync(dir).isDirectory()) continue
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.txt')) continue
      const pack = path.join(dir, file)
      const text = fs.readFileSync(pack, 'utf8')
      if (!text.includes(PLACEHOLDER)) continue
      fs.writeFileSync(pack, text.split(PLACEHOLDER).join(tags))
      packs += 1
    }
  }
  console.log(`[scene pages] Stamped the reader's ${links.length} stylesheet(s) into ${stamped} scene pages and ${packs} chapter page packs`)
  return { stamped, packs, links }
}

if (require.main === module) {
  try {
    stampScenePages()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = { stampScenePages, readerStylesheets, PLACEHOLDER }
