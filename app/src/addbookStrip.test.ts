// @vitest-environment jsdom
/**
 * The PDF reader's position strip and the arXiv stamp (app/public/lab/addbook/js/strip.js;
 * DECISIONS.md 2026-10-15): stamp detection and its box, the strip's lines from text items,
 * the dots kept apart, and the slider's keys. No network, no pdf.js.
 */
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type T6 = [number, number, number, number, number, number]
interface Item { str: string; transform: T6; width: number }
interface Box { x0: number; x1: number; y0: number; y1: number }
interface G { N: number; top: number; bottom: number; gap: number; band: number }
interface Page { body: { x0: number; w: number }; blocks: { y0: number; y1: number; x0: number; x1: number; n: number; last: number }[] }
interface Line { n: number; y: number; x0: number; x1: number }
interface Dot { n: number; y: number; card: boolean; label: string; color?: string }
interface StripApi {
  STAMP_RE: RegExp
  findStamp(items: Item[], page: number): Item | null
  stampBox(item: Item): Box
  boxCorners(box: Box, t: number[]): [number, number][]
  maskStamp(ctx: unknown, t: number[], box: Box): void
  pageBlocks(items: Item[], view: { width: number; height: number; transform: number[] }): Page
  geometry(N: number, top: number, bottom: number): G
  yOf(g: G, n: number, f: number): number
  atY(g: G, y: number): { n: number; f: number }
  stripLines(pages: (Page | null | undefined)[], g: G): Line[]
  spreadDots<D extends { y: number }>(dots: D[], gap?: number): D[]
  dotList(h: unknown[], c: unknown[], g: G, o?: { label?: (n: number) => string; cardLabel?: (c: { kind: string; page: number }) => string }): Dot[]
  sliderKey(key: string, page: number, N: number): number | null
  create(opts: Record<string, unknown>): { el: HTMLElement; open(): void; close(): void; update(): void; marksChanged(): void }
}
let S: StripApi
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/strip.js')
  S = (window as unknown as { TinctStrip: StripApi }).TinctStrip
})

// Attention Is All You Need (arXiv 1706.03762v7), page 1, as pdf.js gives the stamp.
const STAMP: Item = { str: 'arXiv:1706.03762v7  [cs.CL]  2 Aug 2023', transform: [0, 20, -20, 0, 32, 237], width: 341.08 }
const text = (str: string, x: number, y: number, size = 10, width = str.length * size * 0.5): Item => ({ str, transform: [size, 0, 0, size, x, y], width })

describe('the arXiv stamp', () => {
  it('is found on page 1 only, as a rotated item matching arXiv’s pattern', () => {
    expect(S.findStamp([text('Abstract', 280, 400), STAMP], 1)).toBe(STAMP)
    expect(S.findStamp([{ ...STAMP, transform: [0, -20, 20, 0, 580, 600] }], 1)).not.toBeNull()   // turned the other way
    expect(S.findStamp([{ ...STAMP, str: 'arXiv:2301.12345 [math.PR] 13 Jan 2023' }], 1)).not.toBeNull()   // 5 digits, no version
    expect(S.findStamp([STAMP], 2)).toBeNull()
    expect(S.findStamp([STAMP], 3)).toBeNull()
  })
  it('never other rotated text, nor the same words set level', () => {
    const rot = (str: string): Item => ({ ...STAMP, str })
    expect(S.findStamp([rot('Preprint. Under review.')], 1)).toBeNull()
    expect(S.findStamp([rot('arXiv:1706.03762v7 [cs.CL]')], 1)).toBeNull()
    expect(S.findStamp([rot('See arXiv:1706.03762v7 [cs.CL] 2 Aug 2023')], 1)).toBeNull()
    expect(S.findStamp([rot('arXiv:1706.03762v7 [cs.CL] 2 August 2023')], 1)).toBeNull()
    expect(S.findStamp([text('arXiv:1706.03762v7 [cs.CL] 2 Aug 2023', 72, 700)], 1)).toBeNull()
    expect(S.findStamp([], 1)).toBeNull()
  })
  it('its box: x from e − 1.0h − 2 to e + 0.3h + 2, y from f − 2 to f + width + 2 (PDF units)', () => {
    const b = S.stampBox(STAMP)
    expect(b.x0).toBeCloseTo(10); expect(b.x1).toBeCloseTo(40); expect(b.y0).toBeCloseTo(235); expect(b.y1).toBeCloseTo(580.08)
    // h is the font size, whatever the rotation's sign.
    const c = S.stampBox({ ...STAMP, transform: [0, -12, 12, 0, 100, 50], width: 200 })
    expect([c.x0, c.x1, c.y0, c.y1].map(v => +v.toFixed(2))).toEqual([86, 105.6, 48, 252])
  })
  it('goes through the viewport transform onto the canvas, and is painted white', () => {
    // A US Letter page at 2× (pdf.js: [s, 0, 0, −s, 0, H·s]).
    const vt = [2, 0, 0, -2, 0, 792 * 2]
    const pts = S.boxCorners(S.stampBox(STAMP), vt)
    expect(pts.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)])).toEqual([[20, 1114], [80, 1114], [80, 423.84], [20, 423.84]])
    const calls: string[] = []
    const ctx = { fillStyle: '', save: () => calls.push('save'), restore: () => calls.push('restore'), beginPath: () => calls.push('begin'), moveTo: (x: number, y: number) => calls.push(`M${x},${y}`), lineTo: (x: number, y: number) => calls.push(`L${+x.toFixed(2)},${+y.toFixed(2)}`), closePath: () => calls.push('close'), fill() { calls.push('fill ' + this.fillStyle) } }
    S.maskStamp(ctx, vt, S.stampBox(STAMP))
    expect(calls).toEqual(['save', 'begin', 'M20,1114', 'L80,1114', 'L80,423.84', 'L20,423.84', 'close', 'fill #fff', 'restore'])
  })
})

describe('the strip’s lines', () => {
  const view = { width: 600, height: 800, transform: [1, 0, 0, -1, 0, 800] }
  // A centred title, a three-line paragraph (its last line short), a rotated margin note and a tiny figure label.
  const items: Item[] = [
    text('A Centred Title', 240, 760, 14, 120),
    text('First line of the paragraph runs the whole width', 60, 700, 10, 480),
    text('second line of the paragraph runs the whole width', 60, 688, 10, 480),
    text('and a short last.', 60, 676, 10, 120),
    { str: 'Rotated margin note', transform: [0, 10, -10, 0, 20, 300], width: 150 },
    text('x1', 300, 400, 4, 8),
  ]
  it('a page’s blocks: rotated items and figure labels left out, the body measured from its long lines', () => {
    const page = S.pageBlocks(items, view)
    expect(page.blocks).toHaveLength(2)
    const [title, para] = page.blocks
    expect(title.n).toBe(1); expect(title.x0).toBeCloseTo(0.4); expect(title.y1).toBeCloseTo(40 / 800)
    expect(para.n).toBe(3); expect(para.x0).toBeCloseTo(0.1); expect(para.x1).toBeCloseTo(0.9); expect(para.last).toBeCloseTo(0.25)
    expect(page.body.x0).toBeCloseTo(0.1); expect(page.body.w).toBeCloseTo(0.8)
  })
  it('lays them out: x 18, at most 16px, length by width against the body, a centred block offset, one per 3px', () => {
    const page = S.pageBlocks(items, view)
    const g = S.geometry(1, 100, 900)
    const lines = S.stripLines([page], g)
    // Title: one line, offset by (0.4 − 0.1) / 0.8 of 16px, 0.25 of the body wide.
    expect(lines[0]).toMatchObject({ x0: 18 + 0.375 * 16 })
    expect(lines[0].x1 - lines[0].x0).toBeCloseTo(4)
    // The paragraph spans 800 × (700−676+10)/800 ≈ 34px: three lines (one per line of text, ≤ one per 3px), the last short.
    const para = lines.slice(1)
    expect(para).toHaveLength(3)
    expect(para.map(l => l.x0)).toEqual([18, 18, 18])
    expect(para[0].x1 - para[0].x0).toBe(16)
    expect(para[2].x1 - para[2].x0).toBeCloseTo(4)
    for (let i = 1; i < lines.length; i++) expect(lines[i].y - lines[i - 1].y).toBeGreaterThanOrEqual(3)
    for (const l of lines) expect(l.y % 1).toBe(0.5)   // crisp 1px lines
  })
  it('a page not read yet: plain, evenly spaced lines in its band', () => {
    const g = S.geometry(3, 0, 300)
    const lines = S.stripLines([S.pageBlocks(items, view), undefined, null], g)
    const plain = lines.filter(l => l.n === 2)
    expect(plain.length).toBeGreaterThan(10)
    expect(new Set(plain.map(l => l.x1 - l.x0))).toEqual(new Set([12]))
    expect(plain.every(l => l.y >= S.yOf(g, 2, 0) && l.y <= S.yOf(g, 2, 1) + 1)).toBe(true)
  })
  it('spreads pages evenly with 6px gaps (less for a long PDF) and maps y back to page and fraction', () => {
    const g = S.geometry(15, 64, 884)
    expect(g.gap).toBe(6)
    expect(g.band).toBeCloseTo((820 - 14 * 6) / 15)
    expect(S.atY(g, S.yOf(g, 9, 0.25))).toEqual({ n: 9, f: expect.closeTo(0.25, 5) })
    const long = S.geometry(300, 64, 884)
    expect(long.band).toBeGreaterThan(0)
    expect(S.yOf(long, 300, 1)).toBeCloseTo(884)
    expect(S.atY(long, 2000).n).toBe(300)
  })
})

describe('dots', () => {
  it('never touch: pushed 6px apart, in order', () => {
    const out = S.spreadDots([{ y: 100 }, { y: 101 }, { y: 50 }, { y: 103 }, { y: 120 }])
    expect(out.map(d => d.y)).toEqual([50, 100, 106, 112, 120])
  })
  it('a highlight in its colour, a card filled, a note as its highlight’s dot only, with the cards’ own labels', () => {
    const g = S.geometry(10, 0, 1000)
    const marks = [
      { id: 'a', page: 4, rects: [[0.1, 0.5, 0.8, 0.02]], color: 'rose', note: 'Why the scaling exists.' },
      { id: 'b', page: 1, rects: [[0.1, 0.2, 0.8, 0.02]], color: 'sky' },
      { id: 'c', page: 2, rects: [[0.1, 0.2, 0.8, 0.02]], color: 'gold', gone: true },
    ]
    const cards = [
      { id: 'x', kind: 'explain', page: 9, rects: [[9, 0.1, 0.3, 0.5, 0.02]] },
      { id: 'n-a', kind: 'note', page: 4, rects: [[4, 0.1, 0.5, 0.8, 0.02]] },
      { id: 'y', kind: 'explain', page: 9, rects: [[9, 0.1, 0.3, 0.5, 0.02]], gone: true },
    ]
    const dots = S.dotList(marks, cards, g, { label: n => (n === 9 ? 'ix' : String(n)), cardLabel: c => `Explain · p. ${c.page === 9 ? 'ix' : c.page}` })
    expect(dots.map(d => [d.n, d.card, d.label, d.color || ''])).toEqual([
      [1, false, 'p. 1', '#a6c2ee'],
      [4, false, 'Your note · p. 4', '#eba7ad'],
      [9, true, 'Explain · p. ix', ''],
    ])
    expect(dots[2].y).toBeCloseTo(S.yOf(g, 9, 0.31))
  })
})

describe('the slider', () => {
  it('Arrow keys and PageUp/PageDown move one page; Home and End go to the ends; other keys do nothing', () => {
    expect(S.sliderKey('ArrowDown', 4, 15)).toBe(5)
    expect(S.sliderKey('ArrowRight', 4, 15)).toBe(5)
    expect(S.sliderKey('PageDown', 4, 15)).toBe(5)
    expect(S.sliderKey('ArrowUp', 4, 15)).toBe(3)
    expect(S.sliderKey('ArrowLeft', 4, 15)).toBe(3)
    expect(S.sliderKey('PageUp', 4, 15)).toBe(3)
    expect(S.sliderKey('PageUp', 1, 15)).toBe(1)
    expect(S.sliderKey('PageDown', 15, 15)).toBe(15)
    expect(S.sliderKey('Home', 7, 15)).toBe(1)
    expect(S.sliderKey('End', 7, 15)).toBe(15)
    expect(S.sliderKey('Enter', 7, 15)).toBeNull()
    expect(S.sliderKey('a', 7, 15)).toBeNull()
  })
  it('in the reader: a slider named Pages, “p. 4 of 15”, and a key moves the reader one page', async () => {
    const rects = (top: number, h: number) => ({ top, bottom: top + h, height: h, left: 56, right: 900, width: 844, x: 56, y: top, toJSON() {} })
    // 15 pages of 1100px with 18px gaps under a 50px bar; the reader is a third of the way down page 4.
    const scrollTop = 3 * 1118 + 360
    const sheets = Array.from({ length: 15 }, (_, i) => ({ getBoundingClientRect: () => rects(50 + i * 1118 - scrollTop, 1100) }))
    const scroll = document.createElement('div'); scroll.getBoundingClientRect = () => rects(50, 850) as DOMRect
    const header = document.createElement('header'); header.getBoundingClientRect = () => rects(0, 50) as DOMRect
    const root = document.createElement('div'); document.body.append(root)
    const goTo = vi.fn()
    const strip = S.create({ root, scroll, header, enabled: () => true, count: () => 15, sheet: (n: number) => sheets[n - 1], text: () => new Promise(() => {}), highlights: () => [], cards: () => [], cardLabel: () => '', label: (n: number) => String(n), goTo })
    strip.open()
    await new Promise(r => setTimeout(r, 50))
    const el = root.querySelector('.pdf-strip') as HTMLElement
    expect(el).toBe(strip.el)
    expect(el.getAttribute('role')).toBe('slider')
    expect(el.getAttribute('aria-label')).toBe('Pages')
    expect(el.getAttribute('aria-valuetext')).toBe('p. 4 of 15')
    expect([el.getAttribute('aria-valuemin'), el.getAttribute('aria-valuemax'), el.getAttribute('aria-valuenow')]).toEqual(['1', '15', '4'])
    expect(el.tabIndex).toBe(0)
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }))
    expect(goTo).toHaveBeenLastCalledWith({ page: 5, frac: expect.closeTo(360 / 1100, 3) })
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(goTo).toHaveBeenLastCalledWith({ page: 3, frac: expect.closeTo(360 / 1100, 3) })
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    expect(goTo).toHaveBeenLastCalledWith({ page: 1, frac: 0 })
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', ctrlKey: true, bubbles: true }))
    expect(goTo).toHaveBeenCalledTimes(3)
    strip.close()
    expect(el.hidden).toBe(true)
  })
})
