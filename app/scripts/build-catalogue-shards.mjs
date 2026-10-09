#!/usr/bin/env node
// The library search's catalogue in two parts (search audit, 2026-10-08): the built
// /lab/addbook/data/catalog.json.gz split into catalog-en.json.gz (works in English, what
// every search without a chosen language reads, so it loads first: about 60% of the bytes
// and 40% of the works) and catalog-more.json.gz (every other work, fetched only when a
// search asks for another language). The search worker (public/lab/addbook/js/search-worker.js)
// reads the parts when they exist and the whole file otherwise (npm run dev). The whole file
// stays: the Worker imports books from it. Runs after `vite build` (npm run build).
//   node scripts/build-catalogue-shards.mjs [dist directory]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { gunzipSync, gzipSync } from 'node:zlib'
import { join, resolve } from 'node:path'
import { languagesOf } from '../../addbooks/site/search.js'

/** Split a catalogue ({works}) into its English works and the rest, in catalogue order. */
export function splitCatalogue(catalog) {
  const english = [], more = []
  for (const work of catalog.works) (languagesOf(work).includes('en') ? english : more).push(work)
  const head = { ...catalog }
  delete head.works
  return { english: { ...head, works: english }, more: { ...head, works: more } }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dist = resolve(process.argv[2] || 'dist')
  const dir = join(dist, 'lab/addbook/data')
  const whole = join(dir, 'catalog.json.gz')
  if (!existsSync(whole)) { console.error(`No catalogue at ${whole}`); process.exit(1) }
  const { english, more } = splitCatalogue(JSON.parse(gunzipSync(readFileSync(whole)).toString('utf8')))
  const write = (name, data) => { const bytes = gzipSync(Buffer.from(JSON.stringify(data)), { level: 9 }); writeFileSync(join(dir, name), bytes); return bytes.length }
  const en = write('catalog-en.json.gz', english), rest = write('catalog-more.json.gz', more)
  console.log(`Catalogue parts: ${english.works.length} English works (${(en / 1048576).toFixed(2)} MB), ${more.works.length} more (${(rest / 1048576).toFixed(2)} MB)`)
}
