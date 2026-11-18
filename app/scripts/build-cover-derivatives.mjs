#!/usr/bin/env node
// Smaller copies of the library's painted covers (public/lab/library_2/assets/<id>.jpg, 1024 or
// 768 px wide, 450-760 KB each): WebP at the widths the surfaces draw them, so a phone, a laptop
// and a 1× desktop each take a file of about the pixels they show (book-cover.js
// PAINTED_SIZES chooses). The originals stay for the introduction's large cover and anything
// that wants the painting whole. Committed, like assets/thumbs; rerun after adding a painting:
//   node scripts/build-cover-derivatives.mjs
// Uses sharp, already installed with wrangler/miniflare. Prints the sizes table for book-cover.js,
// which src/libraryCoverDerivatives.test.ts holds to the files.
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const assets = resolve(here, '../public/lab/library_2/assets')
const out = join(assets, 'covers')
/** The derivative widths; a width at or past the painting's own is not made (no upscaling). */
export const DERIVATIVE_WIDTHS = [480, 960]
export const QUALITY = 82

/** The painted cover ids, from book-cover.js's own list (one source of truth). */
export function paintedIds() {
  const source = readFileSync(resolve(here, '../public/lab/book-cover.js'), 'utf8')
  const list = source.match(/PAINTED_COVER_IDS = Object\.freeze\(\[([^\]]*)\]\)/)?.[1] ?? ''
  return [...list.matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1])
}

export async function buildDerivatives({ ids = paintedIds(), force = false } = {}) {
  mkdirSync(out, { recursive: true })
  const sizes = {}
  for (const id of ids) {
    const source = join(assets, `${id}.jpg`)
    if (!existsSync(source)) throw new Error(`no painting for ${id}`)
    const { width, height } = await sharp(source).metadata()
    const made = []
    for (const w of DERIVATIVE_WIDTHS) {
      if (w >= width) continue
      const file = join(out, `${id}-${w}.webp`)
      if (force || !existsSync(file)) {
        const buffer = await sharp(source).resize(w, Math.round(w * height / width), { kernel: 'lanczos3' }).webp({ quality: QUALITY, effort: 6 }).toBuffer()
        writeFileSync(file, buffer)
      }
      made.push(w)
    }
    sizes[id] = { widths: made, full: width }
  }
  return sizes
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sizes = await buildDerivatives({ force: process.argv.includes('--force') })
  console.log(JSON.stringify(sizes, null, 1))
}
