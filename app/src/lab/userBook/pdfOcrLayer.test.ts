/**
 * A recognised scan's text laid over its page images (public/lab/addbook/js/pdf-ocr.js, the scans test
 * of 15 Oct 2026): the page's printed lines found in its ink, the recognised blocks placed on them
 * (by each block's box from recognition, else in reading order), and the lines turned into pdf.js
 * text items that the PDF viewer's text layer positions exactly where the ink is.
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))

type Box = [number, number, number, number]
interface Block { t: string; x: string; b?: Box }
interface Line { text: string; kind: string; box: Box }
interface Layer {
  pageText: (page: { blocks: Block[] }) => string
  inkMask: (data: Uint8ClampedArray, w: number, h: number) => Uint8Array
  findLines: (mask: Uint8Array, w: number, h: number, region?: number[]) => Array<{ x0: number; y0: number; x1: number; y1: number }>
  layoutPage: (page: { blocks: Block[] }, mask: Uint8Array, w: number, h: number) => Line[]
  textItems: (lines: Line[], vp: { width: number; height: number; transform: number[] }) => Array<{ str: string; width: number; transform: number[]; hasEOL: boolean; kind: string }>
}
let L: Layer
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-ocr.js')
  L = (globalThis as unknown as { TinctPdfOcr: Layer }).TinctPdfOcr
})

const W = 600, H = 800
/** A page image: paper, with ink rectangles ("words") at [x0, y0, x1, y1] pixels. */
function page(words: Box[], paper = 240, ink = 30) {
  const data = new Uint8ClampedArray(W * H * 4).fill(paper)
  for (let i = 3; i < data.length; i += 4) data[i] = 255
  for (const [x0, y0, x1, y1] of words) for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * W + x) * 4; data[i] = data[i + 1] = data[i + 2] = ink }
  return data
}
/** A line of `n` words, each 40 px wide with 12 px gaps, from x, its ink `h` tall. */
const line = (x: number, y: number, n: number, h = 14): Box[] => Array.from({ length: n }, (_, i) => [x + i * 52, y, x + i * 52 + 40, y + h])

describe('the page\'s ink: printed lines', () => {
  it('finds each line with its ink\'s extent, and joins an i\'s dot to its line', () => {
    const data = page([...line(60, 100, 9), ...line(60, 130, 9), ...line(60, 160, 5), [80, 94, 84, 97]])
    const lines = L.findLines(L.inkMask(data, W, H), W, H)
    expect(lines.map(l => [l.x0, l.y0, l.x1, l.y1])).toEqual([[60, 94, 516, 114], [60, 130, 516, 144], [60, 160, 308, 174]])
  })
  it('reads a grey scan: ink is what is well darker than the paper, whatever the paper\'s shade', () => {
    const lines = L.findLines(L.inkMask(page(line(60, 100, 4), 190, 90), W, H), W, H)
    expect(lines).toHaveLength(1)
  })
})

describe('placing the recognised blocks', () => {
  it('with boxes from recognition: each block on the lines inside its box, words in proportion to each line\'s width', () => {
    const data = page([...line(60, 100, 9), ...line(60, 130, 4), ...line(60, 300, 6, 12)])
    const blocks: Block[] = [
      { t: 'p', x: 'one two three four five six seven eight nine ten eleven twelve thirteen', b: [100, 115, 870, 185] },
      { t: 'cap', x: 'Figure 1: a caption here now', b: [100, 370, 620, 395] },
    ]
    const out = L.layoutPage({ blocks }, L.inkMask(data, W, H), W, H)
    expect(out.map(l => [l.kind, l.text])).toEqual([
      ['p', 'one two three four five six seven eight nine'],
      ['p', 'ten eleven twelve thirteen'],
      ['cap', 'Figure 1: a caption here now'],
    ])
    expect(out[0].box.map(v => Math.round(v * 1000))).toEqual([100, 125, 860, 143])
    expect(out[2].box.map(v => Math.round(v * 1000))).toEqual([100, 375, 600, 390])
  })
  it('an algorithm box keeps its own lines when its lines and the ink agree', () => {
    const data = page([...line(80, 200, 3), ...line(80, 222, 5), ...line(80, 244, 2)])
    const out = L.layoutPage({ blocks: [{ t: 'alg', x: 'Algorithm 1 Training\nfor k steps do sample\nend for', b: [120, 240, 600, 330] }] }, L.inkMask(data, W, H), W, H)
    expect(out.map(l => l.text)).toEqual(['Algorithm 1 Training', 'for k steps do sample', 'end for'])
    expect(out.every(l => l.kind === 'alg')).toBe(true)
  })
  it('a box with no ink inside (a model\'s box a little off, a faint print) still gets its words, spread over the box', () => {
    const out = L.layoutPage({ blocks: [{ t: 'fn', x: '1 A footnote that the ink does not show.', b: [100, 900, 900, 930] }] }, L.inkMask(page([]), W, H), W, H)
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ text: '1 A footnote that the ink does not show.', kind: 'fn' })
    expect(out[0].box[1]).toBeCloseTo(0.9, 2)
  })
  it('without boxes (pages recognised before 15 Oct 2026): blocks in order over the lines, left column before right', () => {
    // A title across the page, then two columns of eight lines each.
    const words = [...line(150, 60, 6, 18)]
    for (let k = 0; k < 8; k++) { words.push(...line(40, 120 + k * 24, 5)); words.push(...line(330, 120 + k * 24, 5)) }
    const text = (side: string) => Array.from({ length: 40 }, (_, i) => `${side}${i}`).join(' ')
    const blocks: Block[] = [{ t: 'h1', x: 'A Title Across The Whole Page' }, { t: 'p', x: text('left') }, { t: 'p', x: text('right') }]
    const out = L.layoutPage({ blocks }, L.inkMask(page(words), W, H), W, H)
    expect(out[0]).toMatchObject({ kind: 'h1', text: 'A Title Across The Whole Page' })
    expect(out).toHaveLength(17)
    expect(out.slice(1, 9).every(l => l.box[0] < 0.1 && l.text.startsWith('left'))).toBe(true)
    expect(out.slice(9).every(l => l.box[0] > 0.5 && l.text.startsWith('right'))).toBe(true)
    expect(out.slice(1, 9).map(l => l.text).join(' ')).toBe(blocks[1].x)
    // Each line has the five words its ink shows.
    expect(out[1].text).toBe('left0 left1 left2 left3 left4')
    expect(out[1].box[1]).toBeCloseTo(120 / H, 6)
    expect(out[9].box[1]).toBeCloseTo(120 / H, 6)
  })
  it('a page whose image is all picture (no lines of print) still carries its text', () => {
    const data = page([[0, 0, W, H]], 240, 100)
    const out = L.layoutPage({ blocks: [{ t: 'p', x: 'Some recognised words.' }] }, L.inkMask(data, W, H), W, H)
    expect(out.map(l => l.text).join(' ')).toBe('Some recognised words.')
  })
})

describe('text items for the text layer', () => {
  // pdf.js's Util.transform, to check where the viewer would put each span.
  const mul = (m: number[], n: number[]) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]]
  const spanOf = (item: { transform: number[]; width: number }, vp: { transform: number[] }, scale: number) => {
    // buildTextLayer (reader.js): left = tx[4], top = tx[5] - size * 0.86, width = item.width * scale, at a viewport of `scale`.
    const tx = mul(vp.transform.map((v, i) => (i < 4 ? v * scale : v * scale)), item.transform)
    const size = Math.hypot(tx[2], tx[3])
    return { left: tx[4], top: tx[5] - size * 0.86, size, width: item.width * scale, angle: Math.atan2(tx[1], tx[0]) }
  }
  it('puts each line\'s span over its ink: top-left at the box, width the box\'s, size from its height, upright', () => {
    const vp = { width: 612, height: 792, transform: [1, 0, 0, -1, 0, 792] }
    const [item] = L.textItems([{ text: 'A line of words', kind: 'p', box: [0.1, 0.2, 0.6, 0.22] }], vp)
    expect(item).toMatchObject({ str: 'A line of words', hasEOL: true, kind: 'p' })
    const span = spanOf(item, vp, 1.5)
    expect(span.left).toBeCloseTo(0.1 * 612 * 1.5, 6)
    expect(span.top).toBeCloseTo(0.2 * 792 * 1.5, 6)
    expect(span.width).toBeCloseTo(0.5 * 612 * 1.5, 6)
    expect(span.size).toBeCloseTo(0.02 * 792 * 1.5 / 0.95, 6)
    expect(span.angle).toBeCloseTo(0, 9)
  })
  it('holds on a page whose view box does not start at zero', () => {
    const vp = { width: 500, height: 700, transform: [1, 0, 0, -1, -20, 730] }
    const [item] = L.textItems([{ text: 'x', kind: 'p', box: [0.5, 0.5, 0.7, 0.52] }], vp)
    const tx = mul(vp.transform, item.transform)
    expect(tx[4]).toBeCloseTo(250, 6)
    expect(tx[5] - Math.hypot(tx[2], tx[3]) * 0.86).toBeCloseTo(350, 6)
  })
})

describe('the recognised page\'s text, as the margin\'s companion reads it', () => {
  it('blocks in order, captions, algorithm lines and footnotes kept, running heads, footers and page numbers left out', () => {
    expect(L.pageText({ blocks: [
      { t: 'head', x: 'GENERATIVE ADVERSARIAL NETS' }, { t: 'h2', x: '3 Adversarial nets' }, { t: 'p', x: 'The adversarial\nmodelling framework.' },
      { t: 'alg', x: 'Algorithm 1\n  for k steps do' }, { t: 'cap', x: 'Figure 1: losses.' }, { t: 'fn', x: '1 A note.' }, { t: 'num', x: '3' },
    ] })).toBe('3 Adversarial nets\n\nThe adversarial modelling framework.\n\nAlgorithm 1\nfor k steps do\n\nFigure 1: losses.\n\n1 A note.')
  })
})
