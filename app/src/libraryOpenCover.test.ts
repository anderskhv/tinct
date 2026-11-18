import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module shared by the library and the app
import { paintedCoverAt } from '../public/lab/book-cover.js'

// Opening a book (2026-10-21, scripts/check-library-speed.mjs): the book waited for its painting's
// 1024 px original (≈740 KB) before the cover moved, 0.85 s on a phone network. It opens from the
// 960 px copy the hero already uses (≈240 KB); a painting without that copy still opens from its own file.
const app = readFileSync(resolve(__dirname, '../public/lab/library_2/app.js'), 'utf8')

describe('the opening cover', () => {
  it('is asked for at the hero size', () => {
    expect(app).toContain('const COVER_OPEN_PX=COVER_HERO_PX;')
    expect(app).toContain('await Promise.all([ensureCover(book,COVER_OPEN_PX),loadIntroduction(book)')
    expect(app).not.toContain('COVER_WHOLE_PX')
  })

  it('is the 960 px copy of a painting that has one, else the painting', () => {
    expect(paintedCoverAt('candide', 960)).toBe('/lab/library_2/assets/covers/candide-960.webp')
    expect(paintedCoverAt('iliad', 960)).toBe('/lab/library_2/assets/iliad.jpg')
  })
})
