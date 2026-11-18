import { existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module shared with the library
import { PAINTED_COVER_IDS, PAINTED_SIZES, paintedCoverAt, paintedCoverSources, resolveBookCover } from '../public/lab/book-cover.js'
import { DERIVATIVE_WIDTHS, paintedIds } from '../scripts/build-cover-derivatives.mjs'

/**
 * Responsive painted covers (2026-10-10). The paintings are 1024 (or 768) px wide and 450-760 KB
 * each; the shelves draw them at 106-212 CSS px, the desk at 150-234, the hero at 184-297. Each
 * surface now takes the smallest copy with at least the pixels it draws.
 */
const assets = resolve(process.cwd(), 'public/lab/library_2/assets')
const sharp = createRequire(import.meta.url)('sharp') as (file: string) => { metadata: () => Promise<{ width?: number; height?: number; format?: string }> }

describe('painted covers: the derivatives on disk are the ones book-cover.js names', () => {
  it('every painting has its copies, at the widths the sizes table says, as WebP, narrower than the painting', async () => {
    expect(paintedIds()).toEqual([...PAINTED_COVER_IDS])
    for (const id of PAINTED_COVER_IDS) {
      const sizes = PAINTED_SIZES[id] || PAINTED_SIZES.default
      const painting = await sharp(resolve(assets, `${id}.jpg`)).metadata()
      expect(painting.width, `${id} painting width`).toBe(sizes.full)
      // The widths the script would make for this painting: every derivative width below its own.
      expect([...sizes.widths], id).toEqual(DERIVATIVE_WIDTHS.filter(w => w < painting.width!))
      for (const width of sizes.widths) {
        const file = resolve(assets, 'covers', `${id}-${width}.webp`)
        expect(existsSync(file), file).toBe(true)
        const meta = await sharp(file).metadata()
        expect(meta.format).toBe('webp')
        expect(meta.width).toBe(width)
        expect(meta.height).toBe(Math.round(width * painting.height! / painting.width!))
      }
    }
    // No stray copies of paintings that no longer exist.
    for (const file of readdirSync(resolve(assets, 'covers'))) expect(PAINTED_COVER_IDS.some((id: string) => file.startsWith(id + '-')), file).toBe(true)
  })
  it('a surface takes the smallest copy with at least the pixels it draws, else the painting', () => {
    expect(paintedCoverAt('frankenstein', 318)).toBe('/lab/library_2/assets/covers/frankenstein-480.webp')
    expect(paintedCoverAt('frankenstein', 480)).toBe('/lab/library_2/assets/covers/frankenstein-480.webp')
    expect(paintedCoverAt('frankenstein', 481)).toBe('/lab/library_2/assets/covers/frankenstein-960.webp')
    expect(paintedCoverAt('frankenstein', 1320)).toBe('/lab/library_2/assets/frankenstein.jpg')
    expect(paintedCoverAt('frankenstein')).toBe('/lab/library_2/assets/frankenstein.jpg')
    expect(paintedCoverAt('iliad', 600)).toBe('/lab/library_2/assets/iliad.jpg')
    expect(paintedCoverAt('iliad', 300)).toBe('/lab/library_2/assets/covers/iliad-480.webp')
    expect(paintedCoverAt('moby-dick', 300)).toBeNull()
    expect(paintedCoverSources('confessions')).toEqual([{ src: '/lab/library_2/assets/covers/confessions-480.webp', width: 480 }, { src: '/lab/library_2/assets/confessions.jpg', width: 768 }])
  })
  it('the srcset names every copy, so an <img> with sizes picks by its own width and the screen', () => {
    expect(resolveBookCover({ bookId: 'odyssey' })).toEqual({ src: '/lab/library_2/assets/odyssey.jpg', srcSet: '/lab/library_2/assets/thumbs/odyssey.webp 240w, /lab/library_2/assets/covers/odyssey-480.webp 480w, /lab/library_2/assets/covers/odyssey-960.webp 960w, /lab/library_2/assets/odyssey.jpg 1024w' })
    expect(resolveBookCover({ bookId: 'the-republic' })?.srcSet).toBe('/lab/library_2/assets/thumbs/the-republic.webp 240w, /lab/library_2/assets/covers/the-republic-480.webp 480w, /lab/library_2/assets/the-republic.jpg 768w')
  })
})
