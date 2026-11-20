/**
 * Figures in the PDF reader's margin (docs/margin/FIXES-2026-10-15.md, items 4–7, from the
 * scans, figures and long-book test): the pure rules in public/lab/addbook/js/margin.js for
 * finding figures on a page (labels inside a diagram, a figure beside text, the caption
 * fallback), keeping the figure chip inside the page and the screen, a figure's own card and
 * thread, and which figure goes with a question. No DOM, no network and no AI.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import * as P from '../public/lab/margin/margin-parse.js'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Box = { x: number; y: number; w: number; h: number }
type Span = Box & { text: string }
type Ref = { kind: string; n: string; label: string }
type Caption = Ref & { text: string; fig: number; box: Box }
type Found = { figures: Array<Box & { label?: string; caption?: string }>; captions: Caption[] }
type Card = { id: string; kind: string; page: number; rects: number[][]; text: string; turns: Array<{ role: string; content: string }>; data?: Record<string, unknown>; at: number; u?: number; gone?: boolean }
type Rect = { left: number; top: number; right: number; bottom: number }
interface Api {
  findFigures(o: { ink: Uint8Array; W: number; H: number; spans?: Span[]; formulas?: Box[] }): Found
  captionOf(text: string): Ref | null
  figureRef(text: string): Ref | null
  figureFor(o: { selection?: string; question?: string; captions?: Array<Partial<Caption>> }): Caption | null
  figureCardFor(cards: Card[], page: number, box: Box): Card | null
  placeChip(o: { box: Rect; w: number; h: number; bounds: Rect; outer?: Rect }): { left: number; top: number; side: string }
  newCard(o: Record<string, unknown>): Card
  cardView(cards: Card[], marks: unknown[]): Card[]
  mergeCards(...sets: Card[][]): Card[]
  tombstone(id: string, at?: number): Card
  CARD_KINDS: string[]
  html: { cardHtml(card: Card, o: Record<string, unknown>): string; cardLabel(card: Card, page: string): string; foldText(card: Card, p: typeof P): string; stackHtml(cards: Array<{ kind: string }>): string }
}
let M: Api
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  M = (globalThis as unknown as { TinctMargin: Api }).TinctMargin
})

/* ---------- A synthetic page: a W×H grid of ink, and text spans with their own ink ---------- */
const W = 240, H = 310
function page() {
  const ink = new Uint8Array(W * H), spans: Span[] = []
  const fill = (x0: number, y0: number, x1: number, y1: number) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ink[y * W + x] = 1 }
  const outline = (x0: number, y0: number, x1: number, y1: number) => { fill(x0, y0, x1, y0); fill(x0, y1, x1, y1); fill(x0, y0, x0, y1); fill(x1, y0, x1, y1) }
  /** Text at pixel (x, y), 3 px tall, one px of ink per character's width (with gaps), and its span. */
  const text = (x: number, y: number, str: string) => {
    const w = Math.max(2, Math.round(str.length * 1.6))
    for (let i = 0; i < w; i += 2) fill(x + i, y, x + i, y + 2)
    spans.push({ x: x / W, y: (y - 0.5) / H, w: w / W, h: 4 / H, text: str })
  }
  /** Running text: `n` lines of body text from (x, y), each `w` px wide, one line every 6 px. */
  const body = (x: number, y: number, n: number, w = 150, words = 'All the objects of human reason or enquiry may naturally be divided into two kinds') => {
    for (let k = 0; k < n; k++) { fill(x, y + k * 6, x + w, y + k * 6 + 2); spans.push({ x: x / W, y: (y + k * 6 - 0.5) / H, w: w / W, h: 4 / H, text: words }) }
  }
  return { ink, spans, fill, outline, text, body, find: (formulas: Box[] = []) => M.findFigures({ ink, W, H, spans, formulas }) }
}
/** A row of small circles (here 4×4 px outlines) across [x0, x1] at y. */
const row = (pg: ReturnType<typeof page>, n: number, y: number, x0: number, x1: number) => { for (let i = 0; i < n; i++) { const x = Math.round(x0 + (i * (x1 - x0)) / Math.max(1, n - 1)); pg.outline(x, y, x + 4, y + 4) } }
const px = (b: Box) => ({ l: b.x * W, t: b.y * H, r: (b.x + b.w) * W, b: (b.y + b.h) * H })

describe('finding figures on a page (item 5)', () => {
  it('a diagram whose rows are joined only by their labels is one figure (TD-Gammon, Figure 16.1)', () => {
    const pg = page()
    pg.body(30, 20, 8, 180)
    // Three rows of units, each too flat to be a figure alone, 14 px apart, a label between each.
    row(pg, 3, 100, 110, 130); pg.text(96, 108, 'predicted probability of winning')
    row(pg, 8, 114, 90, 150); pg.text(100, 122, 'hidden units (40-80)')
    row(pg, 14, 128, 75, 165); pg.text(88, 134, 'backgammon position (198 input units)')
    pg.text(70, 148, 'Figure 1. A network of three layers of units that rates a position.')
    pg.body(30, 162, 10, 180)
    const { figures, captions } = pg.find()
    expect(figures).toHaveLength(1)
    const f = px(figures[0])
    // The whole diagram, its labels with it (the last one under the bottom row too); not the caption or the text.
    expect(f.t).toBeLessThanOrEqual(100); expect(f.b).toBeGreaterThanOrEqual(136); expect(f.b).toBeLessThan(147)
    expect(f.l).toBeLessThanOrEqual(76); expect(f.r).toBeGreaterThanOrEqual(168)
    expect(captions.map(c => [c.label, c.fig])).toEqual([['Figure 1', 0]])
    expect(figures[0].label).toBe('Figure 1')
    expect(figures[0].caption).toMatch(/^Figure 1\. A network/)
  })
  it('the same diagram with its labels blanked as text (as before) falls apart into nothing', () => {
    const pg = page()
    row(pg, 3, 100, 110, 130); row(pg, 8, 114, 90, 150); row(pg, 14, 128, 75, 165)
    // Labels long enough to be running text are blanked: then no row is tall enough to count.
    pg.text(60, 108, 'predicted probability of winning, the value the network gives the position')
    pg.text(60, 122, 'hidden units, forty to eighty of them, each joined to every input unit here')
    expect(pg.find().figures).toHaveLength(0)
  })
  it('a figure beside running text is found, and the text beside it never joins it (ResNet Figure 2)', () => {
    const pg = page()
    pg.body(20, 20, 5, 200)
    // A block diagram at the page's left edge: two boxes, a line through them, labels inside and beside.
    pg.outline(3, 60, 45, 68); pg.outline(3, 80, 45, 88); pg.fill(24, 50, 24, 110); pg.outline(20, 112, 28, 120)
    pg.text(8, 63, 'weight layer'); pg.text(8, 83, 'weight layer'); pg.text(27, 73, 'relu'); pg.text(50, 98, 'x identity')
    // Body text beside it, on the same lines as its labels, 30 px to its right.
    pg.body(75, 56, 12, 150)
    pg.text(3, 128, 'Figure 2. Residual learning:'); pg.text(3, 134, 'a building block.')
    pg.body(20, 150, 10, 200)
    const { figures, captions } = pg.find()
    expect(figures).toHaveLength(1)
    const f = px(figures[0])
    expect(f.l).toBeLessThan(4); expect(f.r).toBeLessThan(75); expect(f.t).toBeLessThanOrEqual(50); expect(f.b).toBeGreaterThanOrEqual(120)
    expect(captions[0]).toMatchObject({ label: 'Figure 2', text: 'Figure 2. Residual learning: a building block.', fig: 0 })
  })
  it('a short line of a paragraph is never a figure', () => {
    const pg = page()
    pg.body(20, 20, 6, 200); pg.text(20, 56, 'foregoing.'); pg.text(20, 62, 'the end'); pg.body(20, 80, 6, 200)
    expect(pg.find().figures).toHaveLength(0)
  })
  it('pieces of inline maths at the ends of running lines are blanked with their lines, never a figure', () => {
    const pg = page()
    for (let k = 0; k < 10; k++) { pg.body(20, 30 + k * 6, 1, 140); pg.fill(175, 30 + k * 6, 196, 32 + k * 6); pg.spans.push({ x: 175 / W, y: (30 + k * 6 - 0.5) / H, w: 22 / W, h: 4 / H, text: '(x−µ)²' }) }
    expect(pg.find().figures).toHaveLength(0)
  })
  it('keeps a captioned shaded chart with three small explanatory lines at its bottom', () => {
    const pg=page()
    pg.body(20,10,4,200)
    pg.fill(20,50,220,200)
    pg.text(25,55,'Figur 3')
    pg.body(25,180,3,180,'Notes: the plotted values describe the daily reference rate and its observations.')
    const result=pg.find()
    expect(result.figures).toHaveLength(1)
    expect(result.captions[0].label).toBe('Figure 3')
  })
  it('the fallback: a figure larger than half the page is found from its caption', () => {
    const pg = page()
    pg.body(20, 6, 2, 200)
    pg.fill(20, 20, 220, 240)
    pg.text(20, 250, 'Figure 3. Training on ImageNet: thin curves are training error.')
    pg.body(20, 262, 3, 200)
    const { figures, captions } = pg.find()
    expect(figures).toHaveLength(1)
    expect(captions[0]).toMatchObject({ label: 'Figure 3', fig: 0 })
    expect(figures[0].h).toBeGreaterThan(0.6)
  })
  it('the fallback: a table of bare cells (often taken for formulas) is found under its caption', () => {
    const pg = page()
    pg.body(20, 20, 8, 200)
    pg.text(30, 80, 'Table 1. Error rates on the test set, by depth of the network.')
    const cells = [['Depth', 'Plain', 'Residual'], ['18', '27.94', '27.88'], ['34', '28.54', '25.03'], ['50', '-', '22.85']]
    cells.forEach((r, i) => r.forEach((c, k) => pg.text(70 + k * 40, 90 + i * 6, c)))
    pg.body(20, 130, 8, 200)
    // The cells' lines are taken for a displayed formula, as the reader's layout did on the figure paper.
    const { figures, captions } = pg.find([{ x: 68 / W, y: 89 / H, w: 100 / W, h: 26 / H }])
    expect(captions).toEqual([expect.objectContaining({ kind: 'table', label: 'Table 1', fig: 0, text: 'Table 1. Error rates on the test set, by depth of the network.' })])
    const f = px(figures[0])
    expect(f.t).toBeGreaterThan(84); expect(f.l).toBeLessThan(72); expect(f.r).toBeGreaterThan(150); expect(f.b).toBeLessThan(128)
  })
  it('a figure found only in part grows to the ink between its caption and the text above (ResNet Figure 2)', () => {
    const pg = page()
    pg.body(20, 20, 4, 200)
    // An upper part too small to be a figure, well apart from the lower part.
    pg.outline(100, 50, 110, 54)
    pg.fill(80, 70, 140, 110)
    pg.text(80, 116, 'Figure 2. A building block.')
    pg.body(20, 130, 6, 200)
    const f = px(pg.find().figures[0])
    expect(f.t).toBeLessThanOrEqual(50); expect(f.b).toBeGreaterThanOrEqual(110)
  })
})

describe('figures after the retest (15 Oct): regions, pairing and diagrams', () => {
  it('a formula between a figure and its caption is part of the figure (ResNet Figure 2: "F(x) + x" and the relu under it)', () => {
    const pg = page()
    pg.body(20, 20, 4, 200)
    pg.outline(40, 50, 90, 58); pg.outline(40, 66, 90, 74); pg.fill(64, 44, 64, 80)
    pg.text(46, 53, 'weight layer'); pg.text(46, 69, 'weight layer')
    // The adder and the relu under it, set as a displayed formula.
    pg.outline(58, 84, 70, 92); pg.fill(64, 92, 64, 98)
    const formula = { x: 40 / W, y: 83 / H, w: 40 / W, h: 16 / H }
    pg.text(30, 104, 'Figure 2. Residual learning: a building block.')
    pg.body(20, 118, 8, 200)
    const { figures, captions } = pg.find([formula])
    expect(captions.map(c => c.label)).toEqual(['Figure 2'])
    const f = px(figures[captions[0].fig])
    expect(f.t).toBeLessThanOrEqual(45); expect(f.b).toBeGreaterThanOrEqual(98)
  })
  it('a centred caption never runs on into the wider line of text under it', () => {
    const pg = page()
    pg.body(20, 20, 4, 200)
    pg.fill(60, 50, 160, 90)
    pg.text(70, 96, 'Figure 2. Residual learning: a building block.')
    pg.body(20, 103, 6, 200)
    expect(pg.find().captions[0].text).toBe('Figure 2. Residual learning: a building block.')
  })
  it('"Figure 1.18 shows …" in running text is no caption (it read as "Figure 1")', () => {
    expect(M.captionOf('Figure 1.18 shows the performance of repetition codes')).toBeNull()
    expect(M.captionOf('Figure 1.4 . The binary symmetric channel.')).toMatchObject({ label: 'Figure 1.4' })
    expect(M.captionOf('Table 8. Object detection mAP')).toMatchObject({ label: 'Table 8' })
  })
  it('two columns, a figure and a table side by side, each with its caption: never one region, never grown over the figure above (ResNet Figure 7 and Table 8)', () => {
    const pg = page()
    // A full-width figure and its full-width caption at the top.
    pg.fill(30, 10, 210, 50)
    pg.text(20, 56, 'Figure 6. Training on CIFAR-10. Dashed lines denote training error, and bold lines denote testing error.')
    // Left: two plots, then Figure 7's caption; right: a table above Table 7's caption, then another table above Table 8's.
    pg.fill(24, 70, 108, 96); pg.fill(24, 104, 108, 128); pg.fill(24, 96, 24, 104)
    pg.text(18, 134, 'Figure 7. Standard deviations of layer responses.')
    const cells = (y: number) => [['metric', 'mAP@.5', 'mAP@[.5,.95]'], ['VGG-16', '41.5', '21.2']].forEach((r, i) => r.forEach((c, k) => pg.text(134 + k * 26, y + i * 6, c)))
    cells(72); pg.outline(130, 70, 205, 84)
    pg.text(122, 90, 'Table 7. Object detection mAP on the PASCAL VOC test sets.')
    cells(104); pg.outline(130, 102, 205, 116)
    pg.text(122, 121, 'Table 8. Object detection mAP on the COCO validation set.')
    pg.body(20, 150, 10, 90); pg.body(122, 150, 10, 90)
    const { figures, captions } = pg.find()
    const of = (label: string) => px(figures[captions.find(c => c.label === label)!.fig])
    expect(captions.map(c => c.label).sort()).toEqual(['Figure 6', 'Figure 7', 'Table 7', 'Table 8'])
    // Figure 7 keeps to the left column, under Figure 6's caption.
    expect(of('Figure 7').r).toBeLessThan(120); expect(of('Figure 7').t).toBeGreaterThan(60)
    // Each table caption takes the table above it.
    expect(of('Table 7').b).toBeLessThan(90); expect(of('Table 8').t).toBeGreaterThan(95); expect(of('Table 8').b).toBeLessThan(121)
    // Figure 6 is the top figure only.
    expect(of('Figure 6').b).toBeLessThan(56)
  })
  it('a caption set in the margin, well beside its figure, is that figure\'s; stacked figures with a caption each stay apart (MacKay)', () => {
    const pg = page()
    pg.body(25, 10, 4, 135)
    // Two plots stacked in the text column, captions in the right margin, each level with its plot's top.
    pg.outline(56, 40, 116, 82); pg.fill(60, 60, 110, 62)
    pg.outline(56, 86, 116, 126); pg.fill(60, 100, 110, 102)
    pg.text(165, 42, 'Figure 3.1. The probability'); pg.text(165, 48, 'density P(x | λ).')
    pg.text(165, 88, 'Figure 3.2. The probability'); pg.text(165, 94, 'density, three values.')
    pg.body(25, 140, 8, 135)
    const { figures, captions } = pg.find()
    const of = (label: string) => px(figures[captions.find(c => c.label === label)!.fig])
    expect(of('Figure 3.1').t).toBeLessThanOrEqual(41); expect(of('Figure 3.1').b).toBeLessThan(87)
    expect(of('Figure 3.2').t).toBeGreaterThanOrEqual(84); expect(of('Figure 3.2').b).toBeGreaterThanOrEqual(125)
  })
  it('a table of digits beside a margin caption is its figure (MacKay Figure 1.10)', () => {
    const pg = page()
    pg.body(25, 10, 6, 135)
    const rows = ['s 0 0 1 0 1 1 0', 't 000 000 111 000 111 111 000', 'n 000 001 000 000 101 000 000', 'r 000 001 111 000 010 111 000']
    rows.forEach((r, i) => pg.text(66, 50 + i * 6, r))
    pg.text(165, 50, 'Figure 1.10. Decoding the received'); pg.text(165, 56, 'vector from figure 1.8.')
    pg.body(25, 90, 8, 135)
    const { figures, captions } = pg.find()
    expect(captions.map(c => c.label)).toEqual(['Figure 1.10'])
    const f = px(figures[captions[0].fig])
    expect(f.l).toBeLessThanOrEqual(67); expect(f.t).toBeLessThanOrEqual(51); expect(f.b).toBeGreaterThanOrEqual(70); expect(f.r).toBeLessThan(165)
  })
  it('text the page does not show is left out: a labelled diagram under a clipped page of hidden text is found (TD-Gammon, Figure 16.1)', () => {
    const pg = page()
    pg.body(20, 10, 3, 200)
    row(pg, 1, 40, 150, 150); pg.text(140, 32, 'predicted probability')
    row(pg, 5, 56, 125, 185); pg.text(190, 58, 'hidden units')
    row(pg, 9, 76, 120, 195); pg.text(130, 84, 'backgammon position (198 input units)')
    for (let x = 122; x < 196; x += 6) pg.fill(x, 44, x, 76)
    // Hidden lines of another page, clipped out of sight, across the diagram: no ink of their own.
    for (let k = 0; k < 8; k++) pg.spans.push({ x: 118 / W, y: (38 + k * 6) / H, w: 110 / W, h: 4 / H, text: 'is the vector of all modifiable parameters (in this case, the weights of the network)' })
    pg.text(130, 94, 'Figure 16.1: The TD-Gammon ANN')
    pg.body(20, 104, 8, 200)
    const { figures, captions } = pg.find()
    expect(captions.map(c => c.label)).toEqual(['Figure 16.1'])
    const f = px(figures[captions[0].fig])
    expect(f.t).toBeLessThanOrEqual(41); expect(f.b).toBeGreaterThanOrEqual(80); expect(f.l).toBeLessThanOrEqual(121)
  })
  it('text wrapped beside a figure, in short lines, is never part of it (the backgammon board)', () => {
    const pg = page()
    // Eight short lines of prose on the left, the board on the right.
    for (let k = 0; k < 8; k++) pg.body(20, 30 + k * 6, 1, 80, 'each other going in different directions')
    pg.outline(110, 30, 200, 76); pg.fill(120, 36, 190, 70)
    pg.body(20, 90, 6, 200)
    const { figures } = pg.find()
    expect(figures).toHaveLength(1)
    expect(px(figures[0]).l).toBeGreaterThan(102)
  })
})

describe('captions and the figures questions name (items 5, 7)', () => {
  it('reads a caption’s own label at the start of a line, not a reference in running text', () => {
    expect(M.captionOf('Figure 2. Residual learning: a building block.')).toEqual({ kind: 'figure', n: '2', label: 'Figure 2' })
    expect(M.captionOf('Fig. 3 The training curves')).toMatchObject({ label: 'Figure 3' })
    expect(M.captionOf('Figure 16.1: The TD-Gammon network')).toMatchObject({ n: '16.1' })
    expect(M.captionOf('Table 1: Error rates')).toEqual({ kind: 'table', n: '1', label: 'Table 1' })
    expect(M.captionOf('TABLE 4. Results')).toMatchObject({ label: 'Table 4' })
    expect(M.captionOf('Figure 2 shows that deeper plain nets do worse')).toBeNull()
    expect(M.captionOf('As Figure 2. shows')).toBeNull()
  })
  it('finds the figure a question names: "Figure N", "Fig. N", "fig N", "Table N"', () => {
    expect(M.figureRef('What follows the addition in Figure 2?')).toEqual({ kind: 'figure', n: '2', label: 'Figure 2' })
    expect(M.figureRef('In Fig. 6, what colour is the 1202-layer curve?')).toMatchObject({ n: '6' })
    expect(M.figureRef('what does fig 3.1 show')).toMatchObject({ n: '3.1' })
    expect(M.figureRef('Which row of Table 1 is best?')).toMatchObject({ kind: 'table', n: '1' })
    expect(M.figureRef('What is a figure of speech?')).toBeNull()
  })
  it('a named figure goes, else the figure of a selected caption; only one on the page; else none (the passage crop)', () => {
    const captions = [{ kind: 'figure', n: '1', label: 'Figure 1', fig: 0 }, { kind: 'figure', n: '2', label: 'Figure 2', fig: 1 }, { kind: 'table', n: '1', label: 'Table 1', fig: 2 }]
    expect(M.figureFor({ selection: 'Figure 2. Residual learning: a building block.', captions })?.fig).toBe(1)
    expect(M.figureFor({ question: 'What does Fig. 1 show?', captions })?.fig).toBe(0)
    expect(M.figureFor({ question: 'Compare with Figure 1', selection: 'Figure 2. Residual learning.', captions })?.fig).toBe(0)
    expect(M.figureFor({ question: 'Explain Table 1', captions })?.fig).toBe(2)
    expect(M.figureFor({ question: 'What does Figure 7 show?', captions })).toBeNull()
    expect(M.figureFor({ question: 'Why does this hold?', selection: 'A passage that mentions Figure 2 in passing.', captions })).toBeNull()
  })
})

describe('the figure chip stays inside the page and the screen (item 6)', () => {
  const view = { left: 0, top: 56, right: 1440, bottom: 900 }
  it('sits 4px above the figure, right-aligned with it, when that fits', () => {
    expect(M.placeChip({ box: { left: 400, top: 300, right: 800, bottom: 500 }, w: 330, h: 34, bounds: { left: 300, top: 56, right: 900, bottom: 900 } })).toEqual({ left: 470, top: 262, side: 'above' })
  })
  it('a figure at the page’s left edge: the chip moves right, inside the page (ResNet Figure 2)', () => {
    const at = M.placeChip({ box: { left: 302, top: 300, right: 420, bottom: 500 }, w: 330, h: 34, bounds: { left: 300, top: 56, right: 900, bottom: 900 } })
    expect(at.left).toBe(308); expect(at.side).toBe('above')
  })
  it('a figure at the right edge of the screen: the chip stays on screen', () => {
    const at = M.placeChip({ box: { left: 1300, top: 300, right: 1500, bottom: 500 }, w: 330, h: 34, bounds: { left: 1000, top: 56, right: 1440, bottom: 900 } })
    expect(at.left + 330).toBeLessThanOrEqual(1440 - 8)
  })
  it('a figure just under the top bar: the chip goes below it; a figure filling the screen: just inside its top', () => {
    expect(M.placeChip({ box: { left: 400, top: 70, right: 800, bottom: 300 }, w: 330, h: 34, bounds: { ...view, left: 300, right: 900 } })).toEqual({ left: 470, top: 304, side: 'below' })
    expect(M.placeChip({ box: { left: 400, top: 10, right: 800, bottom: 1200 }, w: 330, h: 34, bounds: { ...view, left: 300, right: 900 } })).toEqual({ left: 470, top: 64, side: 'inside' })
  })
  it('a chip wider than the page on screen (a phone) is kept inside the screen instead', () => {
    const at = M.placeChip({ box: { left: 20, top: 300, right: 120, bottom: 400 }, w: 330, h: 34, bounds: { left: 16, top: 56, right: 330, bottom: 844 }, outer: { left: 0, top: 56, right: 360, bottom: 844 } })
    expect(at.left).toBeGreaterThanOrEqual(8); expect(at.left + 330).toBeLessThanOrEqual(352)
  })
})

describe('a figure’s card: beside the figure, one thread per figure (item 4)', () => {
  const box = { x: 0.32, y: 0.3, w: 0.35, h: 0.12 }
  const figureCard = (extra: Record<string, unknown> = {}) => M.newCard({ kind: 'figure', page: 1, anchor: [{ n: 1, ...box }], text: 'Figure 1. A network of three layers of units that rates a position.', data: { region: 'figure', label: 'Figure 1', labels: 'hidden units (40-80)' }, ...extra })
  it('is a kept card whose passage is the figure’s box, shown with the others and merged across devices as they are', () => {
    expect(M.CARD_KINDS).toContain('figure')
    const card = figureCard()
    expect(card.rects).toEqual([[1, 0.32, 0.3, 0.35, 0.12]])
    expect(M.cardView([card], []).map(c => c.id)).toEqual([card.id])
    const later = { ...card, turns: [{ role: 'assistant', content: 'Three rows of units.' }], u: card.u! + 5 }
    expect(M.mergeCards([card], [later])).toEqual([later])
    expect(M.cardView(M.mergeCards([card], [M.tombstone(card.id, card.u! + 9)]), [])).toEqual([])
  })
  it('the same figure finds its card again; another figure, or another page, does not', () => {
    const card = figureCard()
    expect(M.figureCardFor([card], 1, { x: 0.321, y: 0.302, w: 0.349, h: 0.118 })?.id).toBe(card.id)
    expect(M.figureCardFor([card], 2, box)).toBeNull()
    expect(M.figureCardFor([card], 1, { x: 0.1, y: 0.6, w: 0.3, h: 0.2 })).toBeNull()
    expect(M.figureCardFor([{ ...card, gone: true }], 1, box)).toBeNull()
  })
  it('its label is the caption’s ("Figure 1 · p. 1"); folded, the answer, else the caption', () => {
    const card = figureCard()
    expect(M.html.cardLabel(card, '1')).toBe('Figure 1 · p. 1')
    expect(M.html.cardLabel({ ...card, data: { region: 'formula' } }, '4')).toBe('Formula · p. 4')
    expect(M.html.foldText(card, P)).toBe('Figure 1. A network of three layers of units that rates a position.')
    expect(M.html.foldText({ ...card, turns: [{ role: 'assistant', content: 'Three rows of units.' }] }, P)).toBe('Three rows of units.')
    expect(M.html.stackHtml([card])).toContain('Figure')
  })
  it('open: the thumbnail at the top (its room kept while it is drawn), the caption, then the thread with every question', () => {
    const card = { ...figureCard(), turns: [{ role: 'assistant', content: 'Three rows of units.' }, { role: 'user', content: 'What are the rows?' }, { role: 'assistant', content: 'Layers.' }] }
    const open = M.html.cardHtml(card, { open: true, P, pageLabel: '1', thumb: 'data:image/jpeg;base64,AAAA', thumbRatio: 2.5 })
    const doc = new DOMParser().parseFromString(`<div>${open}</div>`, 'text/html')
    const body = doc.querySelector('.mr-card__body')!
    expect(body.firstElementChild!.className).toBe('mr-thumb')
    expect(body.querySelector('.mr-thumb')!.getAttribute('style')).toBe('aspect-ratio:2.500')
    expect(body.querySelector('.mr-thumb img')!.getAttribute('alt')).toBe('Figure 1 · p. 1')
    expect(body.querySelector('.mr-quote')!.textContent).toMatch(/^Figure 1\. A network/)
    expect([...body.querySelectorAll('.mr-you')].map(e => e.textContent)).toEqual(['What are the rows?'])
    expect(body.querySelectorAll('.mr-answer')).toHaveLength(2)
    // While the thumbnail is drawn (thumb '', narrow windows and the phone): the box with its room, no picture yet.
    const waiting = new DOMParser().parseFromString(M.html.cardHtml(card, { open: true, P, pageLabel: '1', thumb: '', thumbRatio: 2.5 }), 'text/html')
    expect(waiting.querySelector('.mr-thumb')!.children).toHaveLength(0)
    // The wide column (Anders, 19 Oct 2026, night): no thumbnail given, no picture; the card starts with the caption.
    const wide = new DOMParser().parseFromString(`<div>${M.html.cardHtml(card, { open: true, P, pageLabel: '1' })}</div>`, 'text/html')
    expect(wide.querySelector('.mr-thumb')).toBeNull()
    expect(wide.querySelector('.mr-card__body')!.firstElementChild!.className).toBe('mr-quote')
    // A first question asked from Chat shows as the reader's bubble.
    const chat = M.html.cardHtml({ ...figureCard(), turns: [{ role: 'user', content: 'What do the rows stand for?' }] }, { open: true, P, pageLabel: '1' })
    expect(chat).toContain('<div class="mr-you" data-turn="0">What do the rows stand for?</div>')
  })
})
