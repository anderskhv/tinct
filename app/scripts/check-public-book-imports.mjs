#!/usr/bin/env node
// Catalogue-wide import check for "Add to Tinct" (src/worker/routes/publicBooks.ts).
//
// Samples works per source library from the Add-a-book catalogue and runs the real
// import pipeline against the real libraries: the Worker's download (allowlist,
// redirects, size and time limits), the reader's own converter
// (src/lab/userBook/epubEdition.ts, here with jsdom's DOMParser), the Worker's
// check of the converted text against the EPUB, and the shelf rules. No AI calls:
// classification runs on the deterministic rules only.
//
// A work passes when: the download works, conversion succeeds, chapters > 0, the
// EPUB's own title and author match the catalogue's, the text verifies, and a
// shelf is assigned. Libraries below ~90% belong in EXCLUDED_SOURCES
// (public/lab/public-books.js) until fixed.
//
//   node scripts/check-public-book-imports.mjs [--per-library 30] [--seed 20261006] [--only Gutenberg,Wikisource] [--out results.json]
//
// Run from app/. Uses the network; honours HTTPS_PROXY. Writes only --out (default: none).
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback }
const PER_LIBRARY = Number(opt('--per-library', '30'))
const SEED = Number(opt('--seed', '20261006'))
const OUT = opt('--out', null)
const CATALOG = resolve(opt('--catalog', 'public/lab/addbook/data/catalog.json.gz'))
const PAUSE_MS = Number(opt('--pause', '800'))
const ONLY = opt('--only', null)?.split(',') ?? null

// ---- The pipeline's own modules, bundled once (TypeScript) ----
const { build } = await import('esbuild')
const work = mkdtempSync(join(tmpdir(), 'tinct-import-check-'))
const entry = join(work, 'entry.ts')
const root = resolve('.')
writeFileSync(entry, `
export { downloadEpub, parseChapters, publicEditionKey } from ${JSON.stringify(join(root, 'src/worker/routes/publicBooks.ts'))}
export { epubSourceLetters, verifyEditionAgainstSource } from ${JSON.stringify(join(root, 'src/worker/lib/epubSource.ts'))}
export { classifyWork, SHELVES } from ${JSON.stringify(join(root, 'src/worker/lib/publicBookClassify.ts'))}
export { epubToEdition } from ${JSON.stringify(join(root, 'src/lab/userBook/epubEdition.ts'))}
export { importableWork, allowedSourceUrl, normalizeText, IMPORT_SOURCES, EXCLUDED_SOURCES } from ${JSON.stringify(join(root, 'public/lab/public-books.js'))}
`)
const bundle = join(work, 'pipeline.mjs')
await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', target: 'node20', outfile: bundle, logLevel: 'error' })
const P = await import(pathToFileURL(bundle).href)
rmSync(work, { recursive: true, force: true })

// The converter is browser code: give it jsdom's DOMParser.
const { JSDOM } = await import('jsdom')
globalThis.DOMParser = new JSDOM('').window.DOMParser

// Outbound requests through the session proxy, when there is one.
let fetchImpl = globalThis.fetch
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy
if (proxy) {
  const undici = await import('undici')
  const dispatcher = new undici.ProxyAgent(proxy)
  fetchImpl = (url, init = {}) => undici.fetch(url, { ...init, dispatcher })
}

// ---- Sample ----
const catalogue = JSON.parse(gunzipSync(readFileSync(CATALOG)).toString('utf8'))
let state = SEED >>> 0
const random = () => { state = (Math.imul(state ^ (state >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0; return state / 4294967296 }
const byLibrary = new Map()
for (const w of catalogue.works) {
  const e = w.editions?.[0]
  if (!e?.epubUrl || !P.IMPORT_SOURCES[e.source] || (ONLY && !ONLY.includes(e.source))) continue
  if (!byLibrary.has(e.source)) byLibrary.set(e.source, [])
  byLibrary.get(e.source).push(w)
}
const samples = new Map()
for (const [library, works] of byLibrary) {
  const pool = [...works]
  const picked = []
  while (picked.length < PER_LIBRARY && pool.length) picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0])
  samples.set(library, picked)
}

// ---- Checks ----
const tokens = text => new Set(P.normalizeText(text).split(' ').filter(t => t.length > 2))
function titleMatches(catalogueTitle, epubTitle) {
  const a = P.normalizeText(catalogueTitle), b = P.normalizeText(epubTitle)
  if (!a || !b) return false
  if (a === b || a.includes(b) || b.includes(a)) return true
  const ta = tokens(catalogueTitle), tb = tokens(epubTitle)
  if (!ta.size) return a.slice(0, 12) === b.slice(0, 12)
  return [...ta].filter(t => tb.has(t)).length / ta.size >= 0.5
}
function authorMatches(w, epubAuthor) {
  const names = (w.authors || []).map(p => p.name).filter(Boolean)
  if (!names.length) return true // anonymous: nothing to compare
  const have = P.normalizeText(epubAuthor)
  if (!have) return false
  return names.some(name => {
    const parts = P.normalizeText(name).split(' ').filter(t => t.length > 1)
    return parts.some(part => have.split(' ').includes(part))
  })
}

async function check(w) {
  const e = w.editions[0]
  const row = { id: w.id, title: w.title, language: (w.language || []).join(','), url: e.epubUrl, stage: 'download', ok: false }
  const started = Date.now()
  try {
    const bytes = await P.downloadEpub(e.source, e.epubUrl, fetchImpl)
    row.bytes = bytes.byteLength
    row.stage = 'convert'
    const edition = await P.epubToEdition(bytes)
    row.chapters = edition.chapters.length
    row.paragraphs = edition.chapters.reduce((n, c) => n + c.paragraphs.length, 0)
    row.stage = 'chapters'
    if (!edition.chapters.length || !row.paragraphs) throw new Error('no chapters')
    row.stage = 'metadata'
    row.epubTitle = edition.title
    row.epubAuthor = edition.author
    if (!titleMatches(w.title, edition.title)) throw new Error(`title "${edition.title}"`)
    if (!authorMatches(w, edition.author)) throw new Error(`author "${edition.author}"`)
    row.stage = 'verify'
    const chapters = P.parseChapters({ chapters: edition.chapters })
    if (!chapters) throw new Error('over the upload limits')
    const verified = P.verifyEditionAgainstSource(chapters, await P.epubSourceLetters(bytes))
    if (!verified) throw new Error('text not found in the EPUB')
    row.removed = verified.removedParagraphs
    row.stage = 'shelf'
    const placed = await P.classifyWork(w, null)
    if (!placed.shelfIds.length || !P.SHELVES[placed.shelfIds[0]]) throw new Error('no shelf')
    row.shelf = placed.shelfIds[0]
    row.confidence = placed.confidence
    row.stage = 'done'
    row.ok = true
  } catch (error) {
    row.error = error?.code || error?.message || String(error)
  }
  row.ms = Date.now() - started
  return row
}

const pause = ms => new Promise(r => setTimeout(r, ms))
const results = {}
await Promise.all([...samples].map(async ([library, works]) => {
  const rows = []
  for (const w of works) {
    rows.push(await check(w))
    process.stderr.write(`${library}: ${rows.length}/${works.length} ${rows.at(-1).ok ? 'ok' : 'FAIL ' + rows.at(-1).stage + ' ' + rows.at(-1).error}\n`)
    await pause(PAUSE_MS)
  }
  results[library] = rows
}))

// ---- Report ----
const summary = Object.entries(results).map(([library, rows]) => {
  const passed = rows.filter(r => r.ok).length
  const failures = {}
  for (const r of rows.filter(r => !r.ok)) failures[r.stage] = (failures[r.stage] || 0) + 1
  return { library, sampled: rows.length, passed, rate: rows.length ? passed / rows.length : 0, failures, lowConfidence: rows.filter(r => r.confidence === 'low').length }
}).sort((a, b) => b.rate - a.rate)
console.log(`Add to Tinct import check · ${new Date().toISOString()} · seed ${SEED} · ${PER_LIBRARY} per library\n`)
console.log('| Library | Sampled | Passed | Rate | Failures by stage | Rule default (low confidence) |')
console.log('|---|---|---|---|---|---|')
for (const s of summary) console.log(`| ${s.library} | ${s.sampled} | ${s.passed} | ${(s.rate * 100).toFixed(0)}% | ${Object.entries(s.failures).map(([k, v]) => `${k} ${v}`).join(', ') || '–'} | ${s.lowConfidence} |`)
const below = summary.filter(s => s.rate < 0.9).map(s => s.library)
console.log(`\nBelow 90% (exclude in public-books.js EXCLUDED_SOURCES): ${below.length ? below.join(', ') : 'none'}`)
if (OUT) writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), seed: SEED, perLibrary: PER_LIBRARY, summary, results }, null, 2))
