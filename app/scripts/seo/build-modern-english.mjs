#!/usr/bin/env node
// The modern-English page (src/seo/modernEnglishPage.ts; docs/modern-english/BUILD-BRIEF.md), built from the registry
// in `prebuild`: every book whose Modern English edition is live. Writes public/modern-english.html and its Danish
// sibling public/nudansk.html (generated, not committed); the Worker serves them at /modern-english and /nudansk.
// Their stylesheet and script are versioned by their content.
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
// The English page and its Danish sibling (/nudansk, Anders 26 Nov 2026), from the same renderer.
for (const [locale, file, list] of [['en', 'modern-english.html', page.modernEnglishBooks()], ['da', 'nudansk.html', page.nudanskBooks()]]) {
  writeFileSync(join(root, 'public', file), page.renderModernEnglishPage(assets, list, locale))
  const unshelved = list.filter(book => !book.house).map(book => book.id)
  console.log(`[modern-english] ${file}: ${list.length} books${unshelved.length ? `; not on a shelf: ${unshelved.join(', ')}` : ''}`)
}
