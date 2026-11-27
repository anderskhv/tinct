#!/usr/bin/env node
// The Shakespeare page (src/seo/shakespearePage.ts; mockup approved by Anders, 27 Nov 2026), built in `prebuild`:
// the plays from the registry, the passage from Hamlet's two edition files.
// Writes public/shakespeare.html (generated, not committed); the Worker serves it at /shakespeare. Its stylesheets
// and script are versioned by their content.
import { build } from 'esbuild'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cache = join(root, 'node_modules/.cache')
mkdirSync(cache, { recursive: true })
const rendererFile = join(cache, `shakespeare-build-${process.pid}.mjs`)
await build({
  entryPoints: [join(root, 'src/seo/shakespearePage.ts')], bundle: true, format: 'esm', platform: 'node', target: 'node20',
  outfile: rendererFile, packages: 'external', logLevel: 'silent',
})
const page = await import(pathToFileURL(rendererFile).href)
rmSync(rendererFile, { force: true })

const versioned = (path) => `${path}?v=${createHash('sha256').update(readFileSync(join(root, 'public', path))).digest('hex').slice(0, 10)}`
const edition = (name) => JSON.parse(readFileSync(join(root, 'public/data/editions', name), 'utf8'))
const assets = {
  tokens: versioned('/lab/tinct-ui.css'), about: versioned('/lab/try/try.css'),
  css: versioned('/lab/shakespeare/shakespeare.css'), js: versioned('/lab/shakespeare/shakespeare.js'),
}
const { bookId } = page.DEMO_PASSAGE
const plays = page.shakespearePlays()
const play = plays.find(entry => entry.id === bookId)
if (!play) throw new Error(`[shakespeare] ${bookId} is not among the plays with a live Modern English edition`)
const demo = page.shakespeareDemo(edition(`${bookId}-original-en.json`), edition(`${bookId}-modern-en.json`), edition(`${bookId}-lines.json`), play)
writeFileSync(join(root, 'public/shakespeare.html'), page.renderShakespearePage(assets, { plays, demo }))
console.log(`[shakespeare] shakespeare.html: ${plays.length} plays; ${demo.title}, ${demo.scene}, ${demo.rows.length} rows`)
