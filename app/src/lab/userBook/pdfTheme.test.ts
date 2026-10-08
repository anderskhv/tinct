/**
 * The PDF viewer follows the reader's theme (addbooks/web/src/js/pdf-theme.js):
 * the same stored setting as the reader (labPrefs.ts), and pages recoloured
 * for the dark theme with pictures kept as drawn.
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { parseLabStoredPrefs } from '../labPrefs'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))

interface Rect { x: number; y: number; r: number; b: number }
interface PdfThemeApi {
  PALETTE: Record<'light' | 'book' | 'dark' | 'eink', { paper: string; ink: string }>
  resolveTheme: (raw: string | null, layout: 'phone' | 'desktop', systemDark: boolean, eink: boolean) => string
  withTheme: (raw: string | null, layout: 'phone' | 'desktop', theme: string) => string | null
  readEink: (search: string, stored: string | null) => boolean
  imageRects: (opList: { fnArray: number[]; argsArray: unknown[] }, OPS: Record<string, number>, vt: number[], w: number, h: number) => Rect[]
  recolourDark: (data: Uint8ClampedArray, w: number, h: number, keep?: Rect[]) => Uint8ClampedArray
}
let theme: PdfThemeApi
beforeAll(() => {
  require(ROOT + 'addbooks/web/src/js/pdf-theme.js')
  theme = (globalThis as unknown as { TinctPdfTheme: PdfThemeApi }).TinctPdfTheme
})

const v2 = (phone: string, desktop: string) => JSON.stringify({ version: 2, shared: { primaryEdition: 'original-en' }, phone: { theme: phone }, desktop: { theme: desktop } })

describe('PDF theme: the reader’s own setting', () => {
  it('reads each layout’s theme, the system theme and e-ink', () => {
    expect(theme.resolveTheme(v2('dark', 'book'), 'phone', false, false)).toBe('dark')
    expect(theme.resolveTheme(v2('dark', 'book'), 'desktop', false, false)).toBe('book')
    expect(theme.resolveTheme(v2('system', 'system'), 'desktop', true, false)).toBe('dark')
    expect(theme.resolveTheme(null, 'desktop', false, false)).toBe('light')
    expect(theme.resolveTheme(JSON.stringify({ darkMode: true }), 'phone', false, false)).toBe('dark')
    expect(theme.resolveTheme(v2('dark', 'dark'), 'phone', false, true)).toBe('eink')
    expect(theme.readEink('?eink=1', null)).toBe(true)
    expect(theme.readEink('', 'eink')).toBe(true)
    expect(theme.readEink('?eink=0', 'eink')).toBe(false)
  })

  it('writes a choice the reader reads back, for that layout only', () => {
    const raw = theme.withTheme(v2('light', 'light'), 'desktop', 'dark')!
    const prefs = parseLabStoredPrefs(JSON.parse(raw)) as unknown as { desktop: { theme: string }; phone: { theme: string } }
    expect(prefs.desktop.theme).toBe('dark')
    expect(prefs.phone.theme).toBe('light')
    expect(theme.resolveTheme(raw, 'desktop', false, false)).toBe('dark')
    expect(theme.withTheme('{not json', 'desktop', 'dark')).toBeNull()
    expect(theme.withTheme(v2('light', 'light'), 'desktop', 'sepia')).toBeNull()
  })

  it('uses the reader’s papers', () => {
    expect(theme.PALETTE.light.paper).toBe('#ece7db')
    expect(theme.PALETTE.book.paper).toBe('#e7dcc7')
    expect(theme.PALETTE.dark).toEqual({ paper: '#171411', ink: '#bdb3a7' })
  })
})

describe('PDF theme: dark pages', () => {
  const px = (...colours: number[][]) => new Uint8ClampedArray(colours.flatMap(c => [...c, 255]))
  it('turns white paper dark and black text light; colours keep their hue', () => {
    const out = theme.recolourDark(px([255, 255, 255], [0, 0, 0], [200, 30, 30]), 3, 1)
    expect([...out.slice(0, 3)]).toEqual([0x17, 0x14, 0x11])
    expect([...out.slice(4, 7)]).toEqual([0xbd, 0xb3, 0xa7])
    const [r, g, b] = out.slice(8, 11)
    expect(r).toBeGreaterThan(g)
    expect(r).toBeGreaterThan(b)
  })
  it('keeps pictures as drawn, dimmed, not as negatives', () => {
    const out = theme.recolourDark(px([255, 255, 255], [250, 250, 250]), 2, 1, [{ x: 1, y: 0, r: 2, b: 1 }])
    expect([...out.slice(0, 3)]).toEqual([0x17, 0x14, 0x11])
    expect(out[4]).toBeGreaterThan(180)
  })
  it('finds where pictures are painted, but not a page-sized scan', () => {
    const OPS = { save: 10, restore: 11, transform: 12, paintImageXObject: 85, paintFormXObjectBegin: 74, paintFormXObjectEnd: 75 }
    const vt = [1, 0, 0, -1, 0, 800] // PDF space to canvas pixels, 600 x 800
    const list = {
      fnArray: [10, 12, 85, 11, 10, 12, 85, 11],
      argsArray: [null, [200, 0, 0, 100, 50, 600], null, null, null, [600, 0, 0, 800, 0, 0], null, null],
    }
    expect(theme.imageRects(list, OPS, vt, 600, 800)).toEqual([{ x: 50, y: 100, r: 250, b: 200 }])
  })
})
