// Writes the anchors between two editions of a book whose paragraphs do not line up
// (src/lab/labEditionAnchorsBuild.ts: what an anchor is and how they are found).
// Deterministic, offline, no model: word counts and the rare words both texts share.
//
//   node scripts/build-edition-anchors.mjs <bookId> <editionA> <editionB>
//   node scripts/build-edition-anchors.mjs odyssey original-en verse-en
//
// `editionA` is the one the book's other aligned editions are paragraphed like (they read through it).
// Output: src/data/editionAnchors/<bookId>.json. src/lab/labEditionAnchors.test.ts holds that file to what
// this gives for the served texts, so a changed edition text fails the test until the anchors are rebuilt.
// Ship a file only after reading where its switches land, chapter by chapter (the PR that added Odyssey lists them).
import { build } from 'esbuild'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [bookId, a, b] = process.argv.slice(2)
if (!bookId || !a || !b) { console.error('usage: build-edition-anchors.mjs <bookId> <editionA> <editionB>'); process.exit(1) }

const bundle = resolve(root, 'node_modules/.cache/edition-anchors-build.mjs')
mkdirSync(dirname(bundle), { recursive: true })
await build({ entryPoints: [resolve(root, 'src/lab/labEditionAnchorsBuild.ts')], bundle: true, format: 'esm', platform: 'node', outfile: bundle, logLevel: 'silent' })
const { buildEditionAnchorFile } = await import(pathToFileURL(bundle).href)
rmSync(bundle, { force: true })

const edition = key => JSON.parse(readFileSync(resolve(root, `public/data/editions/${bookId}-${key}.json`), 'utf8'))
const file = buildEditionAnchorFile(bookId, { key: a, data: edition(a) }, { key: b, data: edition(b) })
const out = resolve(root, `src/data/editionAnchors/${bookId}.json`)
// One chapter per line: a small file, and a readable diff when a text changes.
const chapters = Object.entries(file.chapters).map(([number, chapter]) => `    ${JSON.stringify(number)}: ${JSON.stringify(chapter)}`).join(',\n')
writeFileSync(out, `{\n  "format": ${JSON.stringify(file.format)},\n  "version": ${file.version},\n  "bookId": ${JSON.stringify(file.bookId)},\n  "a": ${JSON.stringify(file.a)},\n  "b": ${JSON.stringify(file.b)},\n  "chapters": {\n${chapters}\n  }\n}\n`)
const counts = Object.values(file.chapters).map(chapter => chapter.anchors.length)
console.log(`${out}: ${counts.length} chapters, ${counts.reduce((x, y) => x + y, 0)} anchors (${Math.min(...counts)} to ${Math.max(...counts)} a chapter)`)
