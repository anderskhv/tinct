/**
 * Figure and table crops (Anders, 19 Oct 2026, Constructor Theory p. 14, Table 1): the found box snapped to the page's
 * own drawing with the labels round it (TinctMargin.snapFigure), and a caption set in close pieces read as printed
 * (TinctMargin.findFigures). Page fractions throughout.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Box = { x: number; y: number; w: number; h: number }
type Span = Box & { text: string }
let M: {
  SNAP: { pad: number }
  snapFigure(f: Box, shapes: Box[], labels: Box[], caps: Box[]): Box
  findFigures(o: { ink: Uint8Array; W: number; H: number; spans: Span[]; shapes?: Box[] }): { figures: Box[]; captions: Array<{ label: string; text: string; fig: number }> }
}
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  M = (globalThis as unknown as { TinctMargin: typeof M }).TinctMargin
})
// Table 1 as the section paper sets it (612 x 792 pt): its rules, the header above them, the row label at their left.
const pt = (x0: number, y0: number, x1: number, y1: number): Box => ({ x: x0 / 612, y: (792 - y1) / 792, w: (x1 - x0) / 612, h: (y1 - y0) / 792 })
const RULES = [pt(190, 350, 440, 350.6), pt(190, 539.4, 440, 540), pt(190, 350, 190.6, 540), pt(439.4, 350, 440, 540), pt(240, 350, 240.6, 540), pt(190, 500, 440, 500.6)]
const OUTPUT = pt(365, 545, 390, 553), INPUT = pt(177, 405, 186, 424), CAPTION = pt(214, 336, 362, 345)
const near = (a: number, b: number, d = 1e-6) => Math.abs(a - b) <= d

describe('snapFigure', () => {
  it('a found box a few points off snaps to the rules, takes in the header and the row label, pads 3 pt, and stops short of the caption', () => {
    const found = { x: 0.281, y: 0.298, w: 0.4417, h: 0.2613 }
    const out = M.snapFigure(found, RULES, [OUTPUT, INPUT], [CAPTION])
    const P = M.SNAP.pad
    expect(near(out.x, INPUT.x - P)).toBe(true)
    expect(near(out.y, OUTPUT.y - P)).toBe(true)
    expect(near(out.x + out.w, 440 / 612 + P)).toBe(true)
    expect(near(out.y + out.h, (792 - 350) / 792 + P)).toBe(true)
    expect(out.y + out.h).toBeLessThanOrEqual(CAPTION.y)
  })
  it('without a drawing (or a little of one) the found box stays', () => {
    const found = { x: 0.2, y: 0.2, w: 0.4, h: 0.3 }
    expect(M.snapFigure(found, [], [], [])).toEqual(found)
    expect(M.snapFigure(found, [{ x: 0.25, y: 0.25, w: 0.02, h: 0.02 }], [], [])).toEqual(found)
  })
  it('never reaches for the page\'s frame or a rule far beyond the figure', () => {
    const found = { x: 0.31, y: 0.31, w: 0.41, h: 0.25 }
    const out = M.snapFigure(found, [...RULES, { x: 0.01, y: 0.01, w: 0.98, h: 0.98 }, { x: 0.1, y: 0.62, w: 0.8, h: 0.001 }], [], [])
    expect(out.x).toBeGreaterThan(0.3)
    expect(out.y + out.h).toBeLessThan(0.57)
  })
})

describe('a caption set in close pieces', () => {
  it('reads as printed: a space only where the PDF leaves one ("Table 1: A classification of constructions")', () => {
    const W = 600, H = 800, ink = new Uint8Array(W * H)
    // The pieces at their printed places (9 pt Times on a 612 pt page), as the text layer gives them: "Table " carries its space.
    const y = 0.565, h = 0.0125, at = (x: number) => x / 612
    const spans: Span[] = [
      { x: at(214), y, w: at(20.5), h, text: 'Table ' }, { x: at(236.75), y, w: at(4.5), h, text: '1' },
      { x: at(241.25), y, w: at(17.5), h, text: ': A c' }, { x: at(258.75), y, w: at(103.5), h, text: 'lassification of constructions' },
    ]
    for (const s of spans) for (let yy = Math.floor(s.y * H); yy <= (s.y + s.h) * H; yy++) for (let xx = Math.floor(s.x * W); xx <= (s.x + s.w) * W; xx++) ink[yy * W + xx] = 1
    // The table above it: a box of ink.
    for (let yy = 250; yy < 440; yy++) for (let xx = 190; xx < 430; xx++) if (yy === 250 || yy === 439 || xx === 190 || xx === 429) ink[yy * W + xx] = 1
    const found = M.findFigures({ ink, W, H, spans })
    const cap = found.captions.find(c => c.label === 'Table 1')
    expect(cap?.text).toBe('Table 1: A classification of constructions')
  })
})
