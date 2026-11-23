#!/usr/bin/env node
// The free pages (src/seo/modernEnglishPage.ts FREE_PAGES; docs/modern-english/BUILD-BRIEF.md), built from the registry
// in `prebuild`: the modern-English page lists every book whose Modern English edition is live, the Danish page every
// book whose Danish edition is. Writes public/{slug}.html for each (generated, not committed); the Worker serves it at
// /{slug}. The pages share one stylesheet and script, versioned by their content.
import { build } from 'esbuild'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cache = join(root, 'node_modules/.cache')
mkdirSync(cache, { recursive: true })
const rendererFile = join(cache, `modern-english-build-${process.pid}.mjs`)
await build({
  entryPoints: [join(root, 'src/seo/modernEnglishPage.ts')], bundle: true, format: 'esm', platform: 'node', target: 'node20',
  outfile: rendererFile, packages: 'external', logLevel: 'silent',
})
const page = await import(pathToFileURL(rendererFile).href)
rmSync(rendererFile, { force: true })

const versioned = (path) => `${path}?v=${createHash('sha256').update(readFileSync(join(root, 'public', path))).digest('hex').slice(0, 10)}`
const assets = { css: versioned('/lab/modern-english/modern-english.css'), js: versioned('/lab/modern-english/modern-english.js') }
for (const free of page.FREE_PAGES) {
  const list = page.modernEnglishBooks(undefined, free)
  writeFileSync(join(root, `public/${free.slug}.html`), page.renderModernEnglishPage(assets, list, free))
  const unshelved = list.filter(book => !book.house).map(book => book.id)
  console.log(`[${free.slug}] ${list.length} books${unshelved.length ? `; not on a shelf: ${unshelved.join(', ')}` : ''}`)
}
