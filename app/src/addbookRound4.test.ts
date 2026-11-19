/**
 * The PDF reader after the morning retest of 16 Oct 2026 (docs/margin/FIXES-2026-10-16.md) and the night run's
 * final round, client side. No network and no AI:
 *   1. superscripts kept in the page text as ^ (js/reading-order.js), on a PDF written by
 *      addbooks/web/test/make-pdf.mjs with a table whose exponents are set smaller and raised, read with the
 *      pdf.js the viewer ships; and the passage picture grown to a table or formula it touches (TinctMargin.mathBox);
 *   2. a table's row under its caption is never taken into the caption;
 *   4. answers that refer to their own earlier replies, and Explain's opening on the selection or the picture;
 *   5. "Go to page" by printed number before the whole book is read (js/printed-pages.js findPrinted), and a
 *      first chapter's unnumbered opening page labelled 1;
 *   A. Counterpoint without the "strongest objection … author's best reply" template;
 *   C. Fact-check's sources as tidy, labelled links.
 * Both parser twins are checked alike (src/companion/marginParse.ts and public/lab/margin/margin-parse.js).
 */
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import * as TS from './companion/marginParse'
import * as JS from '../public/lab/margin/margin-parse.js'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
const VENDOR = ROOT + 'app/public/lab/addbook/vendor/pdfjs/'

type Item = { str: string; transform: number[]; width: number; height: number; hasEOL: boolean }
type Mark = { base: number; first: boolean; last: boolean; caret: boolean; paren: boolean } | null
interface Order { roles(items: Item[], view?: number[] | null): Array<string | null>; pageText(items: Item[], roles?: Array<string | null>): string; scripts(items: Item[]): Mark[]; shown(items: Item[], marks: Mark[], i: number): string }
type Cand = { value: number; roman: boolean }
interface Printed { candidates(items: Item[], view: number[]): Cand[]; labels(perPage: Cand[][]): string[] | null; pageOf(v: string, labels: string[] | null, o: { count: number; near?: number }): number; findPrinted(v: string, perPage: Cand[][], first?: number): number }
type Box = { x: number; y: number; w: number; h: number }
interface Margin {
  mathBox(o: { box: Box | null; figures?: Box[]; captions?: Array<{ kind: string; n: string; fig: number }>; blocks?: Box[]; text?: string }): Box | null
  html: { cardHtml(card: unknown, o: Record<string, unknown>): string; foldText(card: unknown, p: unknown): string; threadHtml(rows: unknown[], turns: unknown[], o: Record<string, unknown>): string; factcheckHtml(text: string, p: unknown, o?: Record<string, unknown>): { answer: string; sources: string } }
}
type Pdf = { getPage(n: number): Promise<{ view: number[]; getTextContent(): Promise<{ items: Item[] }> }> }
let R: Order, PP: Printed, M: Margin
let pdfjs: { getDocument(o: unknown): { promise: Promise<Pdf> } }
let maker: { makePdf(o: unknown): Buffer; prose(top: number, count: number, o?: Record<string, unknown>): Array<Record<string, unknown>> }

beforeAll(async () => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  pdfjs = (globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib
  ;(globalThis as unknown as { window: unknown }).window = globalThis
  for (const f of ['reading-order.js', 'printed-pages.js', 'margin.js']) require(ROOT + 'app/public/lab/addbook/js/' + f)
  const g = globalThis as unknown as { TinctReadingOrder: Order; TinctPrintedPages: Printed; TinctMargin: Margin }
  R = g.TinctReadingOrder; PP = g.TinctPrintedPages; M = g.TinctMargin
  maker = await import(/* @vite-ignore */ pathToFileURL(ROOT + 'addbooks/web/test/make-pdf.mjs').href)
}, 60_000)

/* ---------- 1 and 2: a table with superscripts, under its caption ---------- */
// Times-Roman widths at 10 pt (Adobe's metrics): what pdf.js reports for each piece, so a superscript starts where its base ends.
const TIMES: Record<string, number> = { O: 722, P: 556, E: 611, T: 611, '(': 333, ')': 333, ' ': 250, '\u00b7': 250, '.': 250, '/': 278, '=': 564, a: 444, d: 500, e: 444, h: 500, i: 278, l: 278, m: 778, n: 500, o: 500, p: 500, r: 333, s: 389, t: 278 }
const W: Record<string, number> = Object.fromEntries(Object.entries(TIMES).map(([k, v]) => [k, v / 100]))
const width = (s: string, size = 10) => [...s].reduce((sum, ch) => sum + ((/\d/.test(ch) ? 5 : W[ch] ?? 5) * size) / 10, 0)
/** One table cell set in pieces: [text, size, rise] from `x` on, each piece starting where the one before ends. */
function cell(x: number, y: number, pieces: Array<[string, number?, number?]>) {
  const out: Array<Record<string, unknown>> = []
  for (const [text, size = 10, rise = 0] of pieces) { out.push({ text, x, y: y + rise, size }); x += width(text, size) }
  return out
}
function tablePaper() {
  const lines: Array<Record<string, unknown>> = [
    ...maker.prose(760, 12, { size: 10, x: 108 }),
    { text: 'Table 1: Complexity per layer and training cost of each kind of layer.', x: 108, y: 560, size: 10 },
    // The header row under the caption, with two cells (the Attention paper's Table 2: "BLEU" beside "Training Cost").
    { text: 'Layer Type', x: 124, y: 540, size: 10 }, { text: 'Complexity per Layer', x: 240, y: 540, size: 10 }, { text: 'Training Cost', x: 383, y: 540, size: 10 },
    { text: 'Self-Attention', x: 124, y: 524, size: 10 }, ...cell(264, 524, [['O(n'], ['2', 7, 3.6], [' · d)']]), ...cell(383, 524, [['3.3 · 10'], ['18', 7, 3.6]]),
    { text: 'Recurrent', x: 124, y: 510, size: 10 }, ...cell(264, 510, [['O(n · d'], ['2', 7, 3.6], [')']]), ...cell(383, 510, [['2.3 · 10'], ['19', 7, 3.6]]),
    // A displayed formula with a two-piece exponent (the positional encoding).
    ...cell(250, 470, [['PE = sin(pos/10000'], ['2i/d', 7, 4.1], [')']]),
    // A footnote mark after a word stays as printed.
    ...cell(108, 440, [['The model relies on attention'], ['1', 7, 3.6]]),
    { text: 'alone, as the next section explains in full detail for the reader of this table and its rows.', x: 108, y: 428, size: 10 },
  ]
  return maker.makePdf({ pages: [{ lines }] })
}

describe('1. superscripts in the page text (js/reading-order.js)', () => {
  let items: Item[] = [], view: number[] = []
  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(tablePaper()), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
    const page = await pdf.getPage(1)
    items = (await page.getTextContent()).items
    view = page.view
  })

  it('keeps each exponent with its base, written with ^: n^2, d^2, 10^18, 10^19, and a two-piece exponent in brackets', () => {
    const text = R.pageText(items, R.roles(items, view))
    expect(text).toContain('O(n^2 · d)')
    expect(text).toContain('O(n · d^2)')
    expect(text).toContain('3.3 · 10^18')
    expect(text).toContain('2.3 · 10^19')
    expect(text).toContain('sin(pos/10000^(2i/d))')
    // Before this, the exponents were a figure's labels at the page's end: "O(n · d)" and "3.3 · 10".
    expect(text).not.toMatch(/O\(n · d\)(?!\^)/)
    expect(text).not.toMatch(/\n\n[\d; ]+$/)
  })

  it('a superscript has its base\'s role, never a figure label\'s', () => {
    const roles = R.roles(items, view), marks = R.scripts(items)
    const sup = items.findIndex((it, i) => it.str === '2' && marks[i])
    expect(sup).toBeGreaterThan(-1)
    expect(roles[sup]).toBe(roles[marks[sup]!.base])
    expect(roles[sup]).toBe('body')
  })

  it('a footnote mark after a word stays as printed', () => {
    const text = R.pageText(items, R.roles(items, view))
    expect(text).toContain('attention1')
    expect(text).not.toContain('attention^1')
  })

  it('the same page always gives the same text (the cached document stays the same bytes)', () => {
    const a = R.pageText(items, R.roles(items, view))
    const b = R.pageText(items.map(it => ({ ...it })), R.roles(items.map(it => ({ ...it })), view))
    expect(b).toBe(a)
  })

  it('2. a row of cells under a caption is the table\'s, never the caption\'s next line', () => {
    const text = R.pageText(items, R.roles(items, view))
    const caption = text.split('\n\n').find(p => p.startsWith('Table 1:'))
    expect(caption).toBe('Table 1: Complexity per layer and training cost of each kind of layer.')
    expect(text).toMatch(/Layer Type Complexity per Layer Training Cost/)
  })

  it('pure: an item set smaller, raised and against its base is a superscript; one on the baseline or far off is not', () => {
    const it = (str: string, x: number, y: number, size = 10, w = width(str, size)): Item => ({ str, transform: [size, 0, 0, size, x, y], width: w, height: size, hasEOL: false })
    const list = [it('x', 100, 500), it('2', 105, 503.6, 7), it(' + y', 109, 500), it('3', 140, 500, 7), it('z', 160, 500), it('k', 200, 503.6, 7)]
    const marks = R.scripts(list)
    expect(marks.map(m => (m ? m.base : null))).toEqual([null, 0, null, null, null, null])
    expect(R.shown(list, marks, 1)).toBe('^2')
    expect(R.shown(list, marks, 0)).toBe('x')
  })
})

describe('1. the passage picture takes in a table or formula it touches (TinctMargin.mathBox)', () => {
  const figures = [{ x: 0.1, y: 0.3, w: 0.8, h: 0.2 }, { x: 0.1, y: 0.7, w: 0.5, h: 0.2 }]
  const captions = [{ kind: 'table', n: '1', fig: 0 }, { kind: 'figure', n: '2', fig: 1 }]
  const blocks = [{ x: 0.3, y: 0.55, w: 0.4, h: 0.05 }]
  it('grows the passage box to the table it overlaps', () => {
    expect(M.mathBox({ box: { x: 0.2, y: 0.35, w: 0.2, h: 0.02 }, figures, captions, blocks })).toEqual({ x: 0.1, y: 0.3, w: 0.8, h: 0.2 })
  })
  it('to a displayed formula it overlaps', () => {
    const got = M.mathBox({ box: { x: 0.35, y: 0.56, w: 0.1, h: 0.02 }, figures, captions, blocks })!
    expect(got.x).toBeCloseTo(0.3); expect(got.w).toBeCloseTo(0.4); expect(got.y).toBeCloseTo(0.55)
  })
  it('to the table the passage names on its page ("as Table 1 shows")', () => {
    const got = M.mathBox({ box: { x: 0.1, y: 0.1, w: 0.8, h: 0.03 }, figures, captions, blocks, text: 'self-attention is faster, as Table 1 shows' })!
    expect(got).toEqual({ x: 0.1, y: 0.1, w: 0.8, h: 0.4 })
  })
  it('never for a figure, a table on another page, or a passage that touches neither (the passage crop goes, as before)', () => {
    expect(M.mathBox({ box: { x: 0.2, y: 0.75, w: 0.1, h: 0.02 }, figures, captions, blocks })).toBeNull()
    expect(M.mathBox({ box: { x: 0.2, y: 0.05, w: 0.1, h: 0.02 }, figures, captions, blocks, text: 'see Table 4' })).toBeNull()
    expect(M.mathBox({ box: null, figures, captions, blocks })).toBeNull()
  })
})

/* ---------- 5. Go to page by printed number ---------- */
describe('5. "Go to page" by printed number (js/printed-pages.js)', () => {
  // Sutton and Barto's shape: 22 pages of roman front matter, chapter 1 opening unnumbered at file page 23, then
  // arabic numbers 22 behind the file's (printed 423 is file page 445), a chapter opening without a number here and there.
  const OFFSET = 22, COUNT = 548
  const perPage: Cand[][] = Array.from({ length: COUNT }, (_, i) => {
    const n = i + 1
    if (n <= OFFSET) return n % 3 === 0 ? [] : [{ value: n, roman: true }]
    if (n === OFFSET + 1 || n === 442 || n === 443) return []
    return [{ value: n - OFFSET, roman: false }]
  })

  it('the whole book\'s labels: printed 423 is file page 445, and the unnumbered first chapter opening is page 1', () => {
    const labels = PP.labels(perPage)!
    expect(labels[444]).toBe('423')
    expect(labels[22]).toBe('1')
    expect(PP.pageOf('423', labels, { count: COUNT })).toBe(445)
    expect(PP.pageOf('1', labels, { count: COUNT })).toBe(23)
    expect(PP.pageOf('xii', labels, { count: COUNT })).toBe(12)
  })

  it('before the whole book is read: the pages from the number on give the same page', () => {
    const near = (v: number) => { const from = Math.max(1, v - 6), to = Math.min(COUNT, from + 90); return PP.findPrinted(String(v), perPage.slice(from - 1, to), from) }
    expect(near(423)).toBe(445)
    expect(near(445)).toBe(467)
    expect(near(1)).toBe(23)
    expect(near(420)).toBe(442)
    expect(PP.findPrinted('xii', perPage.slice(0, 40), 1)).toBe(12)
  })

  it('nothing found (no printed numbers in reach) is 0, so the typed number falls back to the file\'s page', () => {
    expect(PP.findPrinted('423', Array.from({ length: 30 }, () => []), 417)).toBe(0)
    expect(PP.findPrinted('', perPage, 1)).toBe(0)
  })
})

/* ---------- 4, A, B, C: the answer parsers, both twins ---------- */
for (const [name, P] of [['src/companion/marginParse.ts', TS], ['public/lab/margin/margin-parse.js', JS]] as const) {
  describe(`answers as the card shows them (${name})`, () => {
    it('4. Chat never refers to its own earlier replies', () => {
      expect(P.withoutSelfReference('This also corrects my earlier remark. The model has six layers {p. 3}.')).toBe('The model has six layers {p. 3}.')
      expect(P.withoutSelfReference('As I said earlier, the encoder stacks six identical layers.')).toBe('The encoder stacks six identical layers.')
      expect(P.withoutSelfReference('I can be more specific than before: each layer has two sub-layers.')).toBe('Each layer has two sub-layers.')
      // The same words elsewhere stay.
      for (const text of ['The authors correct an earlier estimate on p. 5.', 'Jennie is John\'s sister, as the narrator said before.', 'Training took 12 hours, more than before.']) expect(P.withoutSelfReference(text)).toBe(text)
    })

    it('4. Explain never opens on the picture', () => {
      expect(P.withoutPictureTalk('The image shows the abstract line about recurrence. It says the model drops recurrence {p. 1}.')).toBe('It says the model drops recurrence {p. 1}.')
      expect(P.withoutPictureTalk('In the image, the line reads as printed. The model drops recurrence.')).toBe('The model drops recurrence.')
      expect(P.withoutPictureTalk('The figure shows two curves.')).toBe('The figure shows two curves.')
    })

    it('B. Explain starts with the meaning: no "The selected sentence…", no "No special notation…"', () => {
      expect(P.withoutTemplateTalk('The selected sentence describes a problem at the start of training. G is the generator.')).toBe('It describes a problem at the start of training. G is the generator.')
      expect(P.withoutTemplateTalk('The selected passage says that the drive flips some bits. The noise level is f.')).toBe('The drive flips some bits. The noise level is f.')
      expect(P.withoutTemplateTalk('Entropy measures surprise. No special notation or technical terms appear in this line.')).toBe('Entropy measures surprise.')
      expect(P.withoutTemplateTalk('There are no symbols used here.')).toBe('')
      // Content that uses the words stays.
      for (const text of ['The equations here are not linear.', 'The passage of time matters to her.', 'No symbol is more famous than pi in this book.']) expect(P.withoutTemplateTalk(text)).toBe(text)
    })

    it('A. Counterpoint without "The strongest objection is that" or the author\'s best reply', () => {
      const night = 'The strongest objection is that the speed claim compares models trained on different budgets.\n\nThe document gives 12 hours on eight P100 GPUs {p. 8}. The author\'s best reply is that the comparison uses the paper\'s own estimates {p. 6}.'
      expect(P.counterpointAnswer(night)).toBe('The speed claim compares models trained on different budgets.\n\nThe document gives 12 hours on eight P100 GPUs {p. 8}.')
      const fiction = 'Her disagreement reads as a symptom, not a judgment.\n\nShe writes that she cries at nothing {p. 5}.\n\nThe author\'s best reply, drawn from the text, is that her protest is sincere {p. 1}.'
      expect(P.counterpointAnswer(fiction)).toBe('Her disagreement reads as a symptom, not a judgment.\n\nShe writes that she cries at nothing {p. 5}.')
      const clean = 'Adversarial nets beat DBN on TFD (2057 against 1909) but trail Stacked CAE (2110) {table 1}.\n\nSo the samples carry the claim.'
      expect(P.counterpointAnswer(clean)).toBe(clean)
    })

    it('C. sources: the page\'s own title without the site\'s name, a repeated title once', () => {
      expect(P.sourceTitle('Deep Residual Learning for Image Recognition | IEEE Conference Publication | IEEE Xplore')).toBe('Deep Residual Learning for Image Recognition')
      expect(P.sourceTitle('deep-residual-networks/README.md at master · KaimingHe/deep-residual-networks · GitHub')).toBe('deep-residual-networks/README.md at master')
      expect(P.sourceTitle('What is the BLEU score? (Data Science Stack Exchange)')).toBe('What is the BLEU score?')
      expect(P.sourceTitle('Britannica (boiling point)')).toBe('Britannica (boiling point)')
      const got = P.parseSourcesLine('Sources: [Attention is All You Need](https://arxiv.org/abs/1706.03762) · [Attention Is All You Need, Vaswani et al., 2017](https://papers.nips.cc/paper/7181) · [NLP-progress](https://nlpprogress.com/)')
      expect(got).toEqual([{ title: 'Attention is All You Need', url: 'https://arxiv.org/abs/1706.03762' }, { title: 'NLP-progress', url: 'https://nlpprogress.com/' }])
    })
  })
}

describe('the cards apply them (js/margin.js)', () => {
  const base = { id: 'c1', page: 1, rects: [[1, 0.1, 0.1, 0.5, 0.02]], text: 'being more parallelizable', at: 1 }
  it('A. a Counterpoint card, open and folded, shows no author\'s reply', () => {
    const card = { ...base, kind: 'counterpoint', turns: [{ role: 'assistant', content: 'The strongest objection is that budgets differ.\n\nThe document gives 12 hours {p. 8}. The author\'s best reply is that it is fair.' }] }
    const html = M.html.cardHtml(card, { open: true, P: JS, pageLabel: '1' })
    expect(html).not.toContain('best reply')
    expect(html).toContain('Budgets differ.')
    expect(M.html.foldText(card, JS)).toBe('Budgets differ. The document gives 12 hours.')
  })
  it('4. Chat\'s thread drops an answer\'s reference to its own earlier reply', () => {
    const html = M.html.threadHtml([{ type: 'turn', index: 0 }, { type: 'turn', index: 1 }], [{ role: 'user', text: 'Who is Jennie?' }, { role: 'assistant', text: 'This also corrects my earlier remark. Jennie is John\'s sister {p. 5}.' }], { P: JS })
    expect(html).not.toContain('earlier remark')
    expect(html).toContain('Jennie is John')
  })
  it('C. Fact-check\'s sources: led by "Sources", tidy titles, as links', () => {
    const f = M.html.factcheckHtml('Holds. It still stands.\n\nSources: [Deep Residual Learning for Image Recognition | IEEE Conference Publication | IEEE Xplore](https://ieeexplore.ieee.org/document/7780459)', JS)
    expect(f.sources).toBe('<div class="mr-sources"><span class="mr-sources__label">Sources</span><a href="https://ieeexplore.ieee.org/document/7780459" target="_blank" rel="noopener noreferrer">Deep Residual Learning for Image Recognition</a></div>')
  })
})
