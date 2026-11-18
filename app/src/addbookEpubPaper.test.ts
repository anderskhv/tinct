/**
 * Tinct paper for an EPUB of the reader's own (Anders, 20 Oct 2026): reader-layout.js paper() sets the text exactly as
 * the preview's marginPreviewPaper does for the same stored preferences and window (read only here: src/lab is not
 * changed by this test).
 */
import { describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import { parseLabPrefs } from './lab/labPrefs'
import { marginPreviewPaper } from './lab/marginPreview/marginPreviewModel'

const require = createRequire(import.meta.url)
require('../public/lab/addbook/js/reader-layout.js')
const RL = (globalThis as unknown as { TinctReaderLayout: { paper(raw: unknown, width: number): Record<string, unknown> } }).TinctReaderLayout

describe('own EPUB paper = the preview\'s paper', () => {
  const cases: Array<[string, unknown]> = [
    ['nothing stored', null],
    ['a theme only (v1)', { theme: 'dark' }],
    ['v2, desktop choices', { version: 2, shared: { theme: 'dark' }, phone: { fontSize: 1.6, fontSizeExplicit: true }, desktop: { theme: 'dark', fontFamily: 'garamond', fontSize: 1.3, fontSizeExplicit: true, lineSpacing: 'open', paragraphSpacing: 'generous', margins: 'wide', alignment: 'left', alignmentExplicit: true } }],
    ['v2, numbers', { version: 2, shared: {}, phone: {}, desktop: { fontFamily: 'baskerville', lineSpacing: 1.55, paragraphSpacing: 0.4, margins: 1.2 } }],
  ]
  for (const [name, stored] of cases) for (const width of [1280, 1440, 2000]) {
    it(`${name} at ${width}px`, () => {
      const raw = stored == null ? null : JSON.stringify(stored)
      const prefs = parseLabPrefs(raw ? JSON.parse(raw) : null, 'desktop')
      const want = marginPreviewPaper(prefs, width)
      const got = RL.paper(raw, width)
      expect(got.fontFamily).toBe(want.fontFamily)
      expect(got.fontSize as number).toBeCloseTo(want.fontSize, 6)
      expect(got.headingSize as number).toBeCloseTo(want.headingSize, 6)
      expect(got.lineHeight).toBe(want.lineHeight)
      expect(got.paragraphGap).toBe(want.paragraphGap)
      expect(got.align).toBe(want.align)
      expect(got.measure as number).toBeCloseTo(want.measure, 6)
    })
  }
})
