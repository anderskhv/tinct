/**
 * The PDF reader's margin, PR 2 (docs/margin/BRIEF.md §3, §4, §6): the pure rules in
 * public/lab/addbook/js/margin.js for the column (card placement and its invariants, leader
 * lines, the column's place), citation tags and where they scroll to, the card store (a view
 * over the kept answers and noted highlights, merged across devices) and the cards' markup.
 * No network and no AI.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import * as P from '../public/lab/margin/margin-parse.js'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Card = { id: string; kind: string; page: number; rects: number[][]; text: string; turns?: Array<{ role: string; content: string }>; data?: Record<string, unknown>; at: number; u?: number; gone?: boolean; note?: string }
type Placed = { positions: Array<{ id: string; top: number; height: number; row?: boolean }>; gathered: string[]; stack: { top: number; height: number } | null }
type Token = { type: 'cite'; kind: string; label: string; to?: string; raw: string }
interface MarginApi {
  COL: Record<string, number>
  COLUMN_RESERVE: number
  placeCards(passages: Array<{ id: string; top: number; at?: number; fold?: boolean; keep?: boolean }>, heights: number[], columnHeight: number, o?: { open?: string | null; stackHeight?: number; top?: number; rowHeight?: number }): Placed
  leadPath(x0: number, y0: number, x1: number, y1: number): string
  hyphenWord(text: string, start: number, end: number): [number, number] | null
  columnBox(width: number, pageRight: number): { left: number; width: number } | null
  citeTarget(token: Token, o: { labels?: string[] | null; count?: number; texts?: Map<number, string> | null }): { page: number; needle: string } | null
  cardView(cards: Card[], marks: Array<Record<string, unknown>>, o?: { since?: number }): Card[]
  cardAnswered(card: Card): boolean
  mergeCards(...sets: Card[][]): Card[]
  newCard(o: Record<string, unknown>): Card
  quizScore(q: Record<string, unknown>): number
  quizReread(q: Record<string, unknown>): number
  defineAsks(hit: unknown, o: { word: string; before?: string; online: boolean }): { dictionary: boolean; inText: boolean; sense: boolean }
  parseLookup(raw: string, word: string): { word: string; pos: string; line: string } | null
  html: {
    cardHtml(card: Card, o: Record<string, unknown>): string
    answerHtml(text: string, p: typeof P, o?: Record<string, unknown>): string
    factcheckHtml(text: string, p: typeof P, o?: Record<string, unknown>): { answer: string; sources: string }
    stackHtml(cards: Array<{ kind: string }>, max?: number): string
    foldText(card: Card, p: typeof P): string
    defineHtml(d: Record<string, unknown>, o: Record<string, unknown>): string
    threadHtml(rows: unknown[], turns: unknown[], o: Record<string, unknown>): string
  }
}
let M: MarginApi
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  M = (globalThis as unknown as { TinctMargin: MarginApi }).TinctMargin
})

/* ---------- Placement: (passages, cardHeights, columnHeight) -> positions + gathered ---------- */
function rng(seed: number) { return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff } }
function invariants(passages: Array<{ id: string; top: number }>, heights: number[], H: number, out: Placed, open: string | null) {
  const boxes = out.positions.map(p => ({ ...p, bottom: p.top + p.height }))
  // Order follows the page.
  const order = passages.map(p => p.id)
  for (let i = 1; i < boxes.length; i++) expect(order.indexOf(boxes[i].id)).toBeGreaterThan(order.indexOf(boxes[i - 1].id))
  // No two boxes intersect, and every gap is at least 14px (the "more" row included).
  const all = [...boxes, ...(out.stack ? [{ id: 'stack', top: out.stack.top, bottom: out.stack.top + out.stack.height }] : [])]
  for (let i = 1; i < all.length; i++) expect(all[i].top - all[i - 1].bottom).toBeGreaterThanOrEqual(14 - 1e-9)
  // Nothing ends within 46px of the foot; the row ends by the foot; nothing above the column.
  for (const b of boxes) { expect(b.bottom).toBeLessThanOrEqual(H - 46 + 1e-9); expect(b.top).toBeGreaterThanOrEqual(0) }
  if (out.stack) expect(out.stack.top + out.stack.height).toBeLessThanOrEqual(H + 1e-9)
  // The open card is never gathered; every card is placed or gathered, once.
  if (open) { expect(out.gathered).not.toContain(open); expect(boxes.some(b => b.id === open)).toBe(true) }
  expect([...boxes.map(b => b.id), ...out.gathered].sort()).toEqual([...order].sort())
  // A gathered card leaves no stack-less gathering, and the row says how many.
  expect(!!out.stack).toBe(out.gathered.length > 0)
  // Heights are kept (the open card's at most the room there is); a card folded to a row is 28px high, never the open one.
  for (const b of boxes) expect(b.height).toBe(b.row ? 28 : Math.min(heights[order.indexOf(b.id)], H - 48))
  if (open) expect(boxes.find(b => b.id === open)!.row).toBeUndefined()
  // Gathering comes last: while cards gather, every other card but the open one is a row.
  if (out.gathered.length) for (const b of boxes) if (b.id !== open && heights[order.indexOf(b.id)] > 28) expect(b.row).toBe(true)
}

describe('card placement', () => {
  it('a card sits at its passage’s first line less 4px; a collision moves it 14px below the card before', () => {
    const out = M.placeCards([{ id: 'a', top: 100 }, { id: 'b', top: 120 }, { id: 'c', top: 400 }], [60, 60, 60], 700)
    expect(out.positions).toEqual([{ id: 'a', top: 96, height: 60 }, { id: 'b', top: 170, height: 60 }, { id: 'c', top: 396, height: 60 }])
    expect(out.gathered).toEqual([])
    expect(out.stack).toBeNull()
  })
  it('two passages on the same line keep the page’s order and do not overlap', () => {
    const out = M.placeCards([{ id: 'left', top: 200 }, { id: 'right', top: 200 }], [50, 50], 700)
    expect(out.positions.map(p => [p.id, p.top])).toEqual([['left', 196], ['right', 260]])
  })
  it('cards that would run past the foot move up into the room above their passages, rather than gathering', () => {
    // Passages in the lower half of the screen (the Gloss test, 15 Oct: four cards gathered while 550px stood empty above).
    const passages = [{ id: 'a', top: 100 }, { id: 'b', top: 500 }, { id: 'c', top: 520 }, { id: 'd', top: 540 }]
    const out = M.placeCards(passages, [80, 160, 40, 40], 700, { stackHeight: 34 })
    expect(out.gathered).toEqual([])
    expect(out.stack).toBeNull()
    expect(out.positions.map(p => [p.id, p.top, p.row])).toEqual([['a', 96, undefined], ['b', 652 - 40 - 14 - 40 - 14 - 160, undefined], ['c', 652 - 40 - 14 - 40, undefined], ['d', 652 - 40, undefined]])
    invariants(passages, [80, 160, 40, 40], 700, out, null)
    // Nothing moves up when there is room below.
    expect(M.placeCards([{ id: 'x', top: 300 }], [80], 700).positions[0].top).toBe(296)
  })
  it('when moving up is not enough, the oldest cards fold to one-line rows first; the newest stay as they were', () => {
    const passages = [400, 420, 440, 460, 480, 500].map((top, i) => ({ id: 'c' + i, top, at: [5, 1, 6, 2, 4, 3][i] }))
    const out = M.placeCards(passages, [120, 120, 120, 120, 120, 120], 700, { stackHeight: 34 })
    expect(out.gathered).toEqual([])
    const rows = out.positions.filter(p => p.row).map(p => p.id)
    // c1 (made first) folds first, then c3: only as many as it takes (six cards of 120px need two rows in 652px).
    expect(rows).toEqual(['c1', 'c3'])
    invariants(passages, Array(6).fill(120), 700, out, null)
  })
  it('the open card never folds; the others gather into the "more" row only when even one-line rows no longer fit', () => {
    const n = 20, passages = Array.from({ length: n }, (_, i) => ({ id: 'c' + i, top: 300 + i * 10, at: i }))
    const heights = Array(n).fill(90)
    const out = M.placeCards(passages, heights, 600, { stackHeight: 34, open: 'c4' })
    expect(out.positions.find(p => p.id === 'c4')!.row).toBeUndefined()
    expect(out.gathered.length).toBeGreaterThan(0)
    // The last on the page gather; everything placed is a row except the open card.
    expect(out.gathered).toEqual(passages.slice(n - out.gathered.length).map(p => p.id))
    invariants(passages, heights, 600, out, 'c4')
  })
  it('a card kept whole (a quiz still streaming: keep, fold false) never folds or gathers, however crowded', () => {
    const passages = Array.from({ length: 20 }, (_, i) => ({ id: 'c' + i, top: 200 + i * 10, at: i, ...(i === 2 ? { keep: true, fold: false } : {}) }))
    const heights = Array(20).fill(90)
    const out = M.placeCards(passages, heights, 600, { stackHeight: 34, open: 'c9' })
    const quiz = out.positions.find(p => p.id === 'c2')!
    expect(quiz.row).toBeUndefined()
    expect(quiz.height).toBe(90)
    expect(out.gathered).not.toContain('c2')
    expect(out.gathered.length).toBeGreaterThan(0)
  })
  it('eight cards on one page fit as cards and rows, with no "more" row', () => {
    for (const H of [652, 760, 854]) {
      const passages = Array.from({ length: 8 }, (_, i) => ({ id: 'c' + i, top: 120 + i * 60, at: i }))
      const heights = Array(8).fill(64)
      const out = M.placeCards(passages, heights, H, { stackHeight: 34, open: 'c7' })
      expect(out.gathered).toEqual([])
      invariants(passages, heights, H, out, 'c7')
    }
  })
  it('the open card is never gathered: it keeps its place or moves up, and the cards before it make room', () => {
    const out = M.placeCards([{ id: 'a', top: 300 }, { id: 'b', top: 320 }, { id: 'open', top: 600 }], [60, 60, 300], 700, { open: 'open' })
    const open = out.positions.find(p => p.id === 'open')!
    expect(open.top + open.height).toBeLessThanOrEqual(700 - 48)
    invariants([{ id: 'a', top: 300 }, { id: 'b', top: 320 }, { id: 'open', top: 600 }], [60, 60, 300], 700, out, 'open')
    // A passage at the very bottom of the screen: its open card stays inside the column.
    const low = M.placeCards([{ id: 'x', top: 690 }], [200], 700, { open: 'x' })
    expect(low.positions[0].top + 200).toBeLessThanOrEqual(700 - 46)
    // At the very top: none sits above the column (under the top bar).
    expect(M.placeCards([{ id: 'y', top: -30 }], [80], 700).positions[0].top).toBe(0)
  })
  it('an open card taller than the column keeps the room there is (its body scrolls)', () => {
    const out = M.placeCards([{ id: 'long', top: 50 }], [2400], 700, { open: 'long' })
    expect(out.positions).toEqual([{ id: 'long', top: 0, height: 700 - 48 }])
  })
  it('up to ten cards on one page, with any heights, ages and open card: the invariants always hold', () => {
    const r = rng(7)
    for (let run = 0; run < 400; run++) {
      const n = 1 + Math.floor(r() * 10), H = 300 + Math.floor(r() * 700)
      const tops = Array.from({ length: n }, () => Math.floor(r() * (H + 100)) - 50).sort((a, b) => a - b)
      const passages = tops.map((top, i) => ({ id: 'c' + i, top }))
      const heights = passages.map(() => 30 + Math.floor(r() * (r() < 0.2 ? 900 : 160)))
      const open = r() < 0.6 ? passages[Math.floor(r() * n)].id : null
      invariants(passages, heights, H, M.placeCards(passages, heights, H, { open, stackHeight: 34 }), open)
      // With ages: the same invariants, and a row is never newer than a card that kept its height.
      const aged = passages.map(p => ({ ...p, at: Math.floor(r() * 1000) }))
      const out = M.placeCards(aged, heights, H, { open, stackHeight: 34 })
      invariants(aged, heights, H, out, open)
      const age = (id: string) => aged.find(p => p.id === id)!.at
      const kept = out.positions.filter(p => !p.row && p.id !== open && heights[aged.findIndex(a => a.id === p.id)] > 28)
      for (const row of out.positions.filter(p => p.row)) for (const k of kept) expect(age(row.id)).toBeLessThanOrEqual(age(k.id))
    }
  })
})

describe('the column and its leader lines', () => {
  it('380px, 56px right of the page, at least 24px from the window; hidden below 1180px (marks instead)', () => {
    expect(M.columnBox(1440, 980)).toEqual({ left: 1036, width: 380 })
    expect(M.columnBox(1440, 1200)).toEqual({ left: 1440 - 24 - 380, width: 380 })
    expect(M.columnBox(1181, 700)).toEqual({ left: 756, width: 380 })
    expect(M.columnBox(1179, 700)).toBeNull()
    // The page area leaves room for the gap, the column and its margin (the docked chat's --dock-w).
    expect(M.COLUMN_RESERVE + 14 + 16).toBe(56 + 380 + 24)
  })
  it('a line from the dot (8px right of the page) curves to the card’s label line, as the mockup draws it', () => {
    expect(M.leadPath(752, 330, 794, 360)).toBe('M752 330 C 776 330 772 360 794 360')
    expect(M.COL.dot).toBe(8)
    expect(M.COL.r).toBe(2.6)
  })
})

describe('citation tags', () => {
  const tok = (text: string) => P.citationTokens(text)[0] as Token
  const texts = new Map([[3, 'Section text (1.1) more'], [4, 'Figure 1.3. The bars\n2.4 Results follow'], [5, 'Table 2: values and Eq. 7']])
  it('a page citation scrolls to the page with that printed label, else that page number when the PDF has no labels', () => {
    const labels = ['i', 'ii', '1', '2', '3']
    expect(M.citeTarget(tok('{p. 3}'), { labels, count: 5 })).toEqual({ page: 5, needle: '' })
    expect(M.citeTarget(tok('{p. ii}'), { labels, count: 5 })).toEqual({ page: 2, needle: '' })
    expect(M.citeTarget(tok('{pp. 1–2}'), { labels, count: 5 })).toEqual({ page: 3, needle: '' })
    expect(M.citeTarget(tok('{p. 9}'), { labels, count: 5 })).toBeNull()
    expect(M.citeTarget(tok('{p. 4}'), { labels: null, count: 5 })).toEqual({ page: 4, needle: '' })
    expect(M.citeTarget(tok('{p. 6}'), { labels: null, count: 5 })).toBeNull()
  })
  it('equations, figures, tables and sections scroll to the page that prints them; unknown ones resolve to nothing', () => {
    expect(M.citeTarget(tok('{eq. 1.1}'), { count: 5, texts })).toEqual({ page: 3, needle: '(1.1)' })
    expect(M.citeTarget(tok('{eq. 7}'), { count: 5, texts })).toEqual({ page: 5, needle: 'Eq. 7' })
    expect(M.citeTarget(tok('{fig. 1.3}'), { count: 5, texts })).toEqual({ page: 4, needle: 'Figure 1.3' })
    expect(M.citeTarget(tok('{table 2}'), { count: 5, texts })).toEqual({ page: 5, needle: 'Table 2' })
    expect(M.citeTarget(tok('{sec. 2.4}'), { count: 5, texts })?.page).toBe(4)
    expect(M.citeTarget(tok('{fig. 1.4}'), { count: 5, texts })).toBeNull()
    expect(M.citeTarget(tok('{eq. 1.1}'), { count: 5, texts: null })).toBeNull()
  })
  // Retest after train 2: an unresolvable one used to stay as written, braces and all ("{p. 1}"); it now shows without them.
  it('a resolvable token renders as a tag carrying its page; an unresolvable one stays text, without its braces', () => {
    const resolveTag = (t: Token) => M.citeTarget(t, { labels: null, count: 5, texts })
    const html = M.html.answerHtml('It holds {p. 4}. See {fig. 9.9} and {eq. 1.1}.', P, { resolve: resolveTag })
    expect(html).toContain('<button type="button" class="mr-cite" data-page="4">p. 4</button>')
    expect(html).toContain('See fig. 9.9 and')
    expect(html).not.toContain('{fig. 9.9}')
    expect(html).toContain('<button type="button" class="mr-cite" data-page="3" data-needle="(1.1)">eq. 1.1</button>')
    expect(M.html.answerHtml('No tags here {p. 4}.', P)).toContain('No tags here p. 4.')
    // Not a citation at all: as written.
    expect(M.html.answerHtml('A set {x} here.', P)).toContain('A set {x} here.')
  })
})

describe('the answer in a card', () => {
  it('the first sentence of the first paragraph is the bottom line, in weight 600; Markdown bold is never parsed', () => {
    const html = M.html.answerHtml('Because the tosses are independent. So the variances add.\n\nA second paragraph.', P)
    expect(html).toBe('<p><span class="is-bottom-line">Because the tosses are independent.</span> So the variances add.</p><p>A second paragraph.</p>')
    const bold = M.html.answerHtml('The **first** words. More.', P)
    expect(bold).toBe('<p><span class="is-bottom-line">The first words.</span> More.</p>')
    expect(bold).not.toContain('<strong>')
  })
  it('a wide equation in a code fence is its own block (it scrolls sideways inside the answer)', () => {
    expect(M.html.answerHtml('The bottom line.\n\n```\nx = a + b + c + d\n```', P)).toContain('<pre>x = a + b + c + d</pre>')
  })
  it('Fact-check: the verdict line, each claim’s verdict word in italic secondary, sources as plain links', () => {
    const f = M.html.factcheckHtml('Holds. The standard form.\n\nHolds. Below 1% from x = 9.\n\nNote. Context.\n\nSources: [NIST](https://dlmf.nist.gov/5.11) · [Wikipedia](https://en.wikipedia.org/wiki/S)', P)
    expect(f.answer).toContain('<span class="is-bottom-line">Holds. The standard form.</span>')
    expect(f.answer).toContain('<p><span class="mr-verdict">Holds.</span> Below 1% from x = 9.</p>')
    expect(f.answer).toContain('<p><span class="mr-verdict">Note.</span> Context.</p>')
    // Led by "Sources" since the night run's final round (16 Oct: the bare titles read as a raw tail).
    expect(f.sources).toBe('<div class="mr-sources"><span class="mr-sources__label">Sources</span><a href="https://dlmf.nist.gov/5.11" target="_blank" rel="noopener noreferrer">NIST</a><a href="https://en.wikipedia.org/wiki/S" target="_blank" rel="noopener noreferrer">Wikipedia</a></div>')
  })
  it('Fact-check, doc-first (15 Oct): the opening in plain text, then the verdict as the bottom line, then a note and the sources; folded, the verdict line', () => {
    const text = 'The passage claims 28.4 BLEU; the paper offers Table 2.\n\nPartly holds. The score stands, but later systems beat it.\n\nNote. A landmark.\n\nSources: [NLP-progress](https://nlpprogress.com/)'
    const f = M.html.factcheckHtml(text, P)
    expect(f.answer.indexOf('<div class="mr-answer mr-opening"><p>The passage claims 28.4 BLEU; the paper offers Table 2.</p></div>')).toBe(0)
    expect(f.answer).toContain('<span class="is-bottom-line">Partly holds. The score stands, but later systems beat it.</span>')
    expect(f.answer).toContain('<p><span class="mr-verdict">Note.</span> A landmark.</p>')
    expect(f.answer).not.toMatch(/is-bottom-line">The passage/)
    expect(f.sources).toContain('NLP-progress')
    // Streaming, before the verdict: the opening alone, never bolded as a bottom line.
    const live = M.html.factcheckHtml('The passage claims 28.4 BLEU; the paper offers Table 2.', P, { live: true })
    expect(live.answer).toBe('<div class="mr-answer mr-opening"><p>The passage claims 28.4 BLEU; the paper offers Table 2.</p></div>')
    const base = { id: 'f1', page: 1, rects: [[1, 0.1, 0.2, 0.5, 0.02]], at: 1, text: 'Our model achieves 28.4 BLEU.' }
    const streaming = M.html.cardHtml({ ...base, kind: 'factcheck', turns: [] }, { open: true, P, pageLabel: '1', live: 'The passage claims 28.4 BLEU.', status: 'Checking sources…' })
    expect(streaming).toContain('<p>The passage claims 28.4 BLEU.</p>')
    expect(streaming.indexOf('Checking sources…')).toBeGreaterThan(streaming.indexOf('The passage claims'))
    expect(streaming).not.toContain('is-bottom-line')
    // Folded: the verdict line, not the opening.
    expect(M.html.foldText({ ...base, kind: 'factcheck', turns: [{ role: 'assistant', content: text }] }, P)).toBe('Partly holds. The score stands, but later systems beat it. Note. A landmark.')
    // An answer written before 15 Oct (verdict first) reads as it did.
    const old = M.html.factcheckHtml('Holds. The standard form.\n\nNote. Context.', P)
    expect(old.answer.startsWith('<div class="mr-answer"><p><span class="is-bottom-line">Holds. The standard form.</span>')).toBe(true)
  })
  it('open cards: label and close, the passage quoted (cut at 120), the bubble for Ask only, copy, the follow-up line', () => {
    const base = { id: 'c1', page: 12, rects: [[12, 0.1, 0.2, 0.5, 0.02]], at: 1, text: 'x'.repeat(200) }
    const ask = M.html.cardHtml({ ...base, kind: 'ask', turns: [{ role: 'user', content: 'Why?' }, { role: 'assistant', content: 'Because. More.' }] }, { open: true, P, pageLabel: '12' })
    expect(ask).toContain('<span class="mr-card__name">Ask · p. 12</span>')
    expect(ask).toContain('class="mr-card__close"')
    expect(ask).toContain('<div class="mr-you">Why?</div>')
    expect(ask).toMatch(/<div class="mr-quote">x{119}…<\/div>/)
    expect(ask).toContain('data-c="copy"')
    expect(ask).toContain('class="mr-follow"')
    const simplify = M.html.cardHtml({ ...base, kind: 'simplify', turns: [{ role: 'assistant', content: 'Plainly. Words.' }] }, { open: true, P, pageLabel: '12' })
    expect(simplify).not.toContain('mr-you')
    // While Fact-check searches: the status line, no copy yet.
    const checking = M.html.cardHtml({ ...base, kind: 'factcheck', turns: [] }, { open: true, P, pageLabel: '12', live: '', status: 'Checking sources…' })
    expect(checking).toContain('<p class="mr-status" role="status">Checking sources…</p>')
    expect(checking).not.toContain('data-c="copy"')
    // Folded: the label and two lines' words, no tags.
    const folded = M.html.cardHtml({ ...base, kind: 'explain', turns: [{ role: 'assistant', content: 'Each bar {p. 12} is a chance.' }] }, { open: false, P, pageLabel: '12' })
    expect(folded).toBe('<button type="button" class="mr-card__label" data-c="open">Explain · p. 12</button><div class="mr-card__text">Each bar is a chance.</div>')
  })
  it('Quiz me: "1 of 3", the question, Show answer; marked: the bubble, Right./Nearly./Not yet., the cite, Next question →; then the score and the one to reread', () => {
    const questions = [{ q: 'Q one?', answer: '2.5', why: 'Because.', cite: '{p. 12}' }, { q: 'Q two?', answer: 'B', why: '', cite: '' }, { q: 'Q three?', answer: 'C', why: '', cite: '{eq. 1.2}' }]
    const quiz = (data: Record<string, unknown>) => ({ id: 'q', kind: 'quiz', page: 12, rects: [[12, 0, 0, 1, 0.02]], text: 'p', at: 1, data: { questions, i: 0, results: [], ...data } })
    const resolveTag = () => ({ page: 12, needle: '' })
    const ask = M.html.cardHtml(quiz({}), { open: true, P, pageLabel: '12', resolve: resolveTag })
    expect(ask).toContain('<span class="mr-card__count">1 of 3</span>')
    expect(ask).toContain('<div class="mr-question">Q one?</div>')
    expect(ask).toContain('data-c="show">Show answer</button>')
    const marked = M.html.cardHtml(quiz({ results: [{ answer: '2.5', verdict: 'right', feedback: 'Yes.' }] }), { open: true, P, pageLabel: '12', resolve: resolveTag })
    expect(marked).toContain('<div class="mr-you">2.5</div><div class="mr-answer"><p><span class="is-bottom-line">Right.</span> Yes. <button type="button" class="mr-cite" data-page="12">p. 12</button></p></div>')
    expect(marked).toContain('Next question →')
    expect(marked).not.toContain('Show answer')
    const shown = M.html.cardHtml(quiz({ results: [{ shown: true }] }), { open: true, P, pageLabel: '12' })
    expect(shown).toContain('<span class="is-bottom-line">2.5</span> Because.')
    const done = { questions, i: 2, done: true, results: [{ answer: 'a', verdict: 'right' }, { answer: 'b', verdict: 'nearly' }, { answer: 'c', verdict: 'right' }] }
    expect(M.quizScore(done)).toBe(2)
    expect(M.quizReread(done)).toBe(1)
    expect(M.quizReread({ questions, results: [{ verdict: 'nearly' }, { verdict: 'not_yet' }, { shown: true }] })).toBe(1)
    expect(M.quizReread({ questions, results: [{ verdict: 'right' }, { verdict: 'right' }, { verdict: 'right' }] })).toBe(-1)
    const doneHtml = M.html.cardHtml(quiz(done), { open: true, P, pageLabel: '12' })
    expect(doneHtml).toContain('<span class="is-bottom-line">2 of 3</span>')
    expect(doneHtml).toContain('<p>Q two?</p>')
    // FIXES-2026-10-15 PR C: the end card offers another quiz; no answer field.
    expect(doneHtml).toContain('<button type="button" class="mr-follow__link" data-c="again">Try another quiz</button>')
    expect(doneHtml).not.toContain('mr-follow__input')
  })
  it('the "more" row: "{n} more on this page" and the kinds that fit', () => {
    expect(M.html.stackHtml([{ kind: 'note' }, { kind: 'counterpoint' }, { kind: 'note' }])).toBe('<span>3 more on this page</span><span>Your note · Counterpoint</span>')
    expect(M.html.stackHtml([{ kind: 'note' }, { kind: 'counterpoint' }], 1)).toBe('<span>2 more on this page</span><span>Your note</span>')
  })
})

describe('the card store', () => {
  const card = (id: string, u: number, extra: Partial<Card> = {}): Card => ({ id, kind: 'explain', page: 2, rects: [[2, 0.1, 0.3, 0.5, 0.02]], text: 't', turns: [], at: 1, u, ...extra })
  it('merges two devices’ cards as the highlights merge: a union by id, the newer edit wins, a removal is a tombstone', () => {
    const a = [card('c1', 5, { turns: [{ role: 'assistant', content: 'old' }] }), card('c2', 5)]
    const b = [card('c1', 9, { turns: [{ role: 'assistant', content: 'new' }] }), { id: 'c2', gone: true, u: 7 } as Card, card('c3', 3)]
    const merged = M.mergeCards(a, b)
    expect(merged.find(c => c.id === 'c1')?.turns?.[0].content).toBe('new')
    expect(merged.find(c => c.id === 'c2')?.gone).toBe(true)
    expect(merged.map(c => c.id).sort()).toEqual(['c1', 'c2', 'c3'])
    expect(M.mergeCards(b, a)).toEqual(merged)
  })
  it('the view: kept answers not removed, and every highlight with a note, in page order (line, then left to right)', () => {
    const answered = { turns: [{ role: 'assistant', content: 'An answer.' }] }
    const cards = [card('late', 1, { ...answered, rects: [[3, 0.1, 0.1, 0.2, 0.02]] }), card('right', 1, { ...answered, rects: [[2, 0.6, 0.5, 0.2, 0.02]] }), card('left', 1, { ...answered, rects: [[2, 0.1, 0.501, 0.2, 0.02]] }), { id: 'g', gone: true, u: 1 } as Card]
    const marks = [{ id: 'm1', page: 2, rects: [[0.1, 0.2, 0.4, 0.02]], text: 'p', color: 'gold', note: 'Mine.', at: 1 }, { id: 'm2', page: 2, rects: [[0.1, 0.3, 0.4, 0.02]], text: 'p', color: 'sky', at: 1 }]
    const view = M.cardView(cards, marks)
    expect(view.map(c => c.id)).toEqual(['n-m1', 'left', 'right', 'late'])
    expect(view[0]).toMatchObject({ kind: 'note', note: 'Mine.', rects: [[2, 0.1, 0.2, 0.4, 0.02]] })
  })
  it('a kept card without its answer (cut off, 15 Oct) is not shown, unless made this visit; notes, Ask and Define always are', () => {
    const at = (n: number) => ({ at: n, rects: [[2, 0.1, 0.1 + n / 100, 0.2, 0.02]] as Card['rects'] })
    const cards = [
      card('empty', 1, { ...at(1), turns: [{ role: 'assistant', content: '' }] }),
      card('blank', 1, { ...at(2), kind: 'factcheck', turns: [{ role: 'assistant', content: '  \n ' }] }),
      card('none', 1, { ...at(3), kind: 'counterpoint', turns: [] }),
      card('quiz', 1, { ...at(4), kind: 'quiz', turns: [], data: { questions: [], i: 0, results: [] } }),
      card('fresh', 1, { ...at(50), kind: 'simplify', turns: [] }),
      card('ok', 1, { ...at(5), turns: [{ role: 'assistant', content: 'An answer.' }] }),
      card('ask', 1, { ...at(6), kind: 'ask', turns: [{ role: 'user', content: 'Why?' }] }),
      card('define', 1, { ...at(7), kind: 'define', turns: [], data: { word: 'w', line: 'A word.' } }),
    ]
    const marks = [{ id: 'm1', page: 2, rects: [[0.1, 0.9, 0.4, 0.02]], text: 'p', color: 'gold', note: 'Mine.', at: 1 }]
    expect(M.cardView(cards, marks).map(c => c.id)).toEqual(['ok', 'ask', 'define', 'n-m1'])
    // Made at or after this visit began: its answer may still be on the way.
    expect(M.cardView(cards, marks, { since: 50 }).map(c => c.id)).toEqual(['ok', 'ask', 'define', 'fresh', 'n-m1'])
    expect(cards.map(c => M.cardAnswered(c))).toEqual([false, false, false, false, false, true, true, true])
     // Release train 2: Related (PR C) is an answer, so an empty one is hidden; a figure's card (PR E) is a thread, kept as Ask is.
    expect(M.cardAnswered(card('rel', 1, { ...at(8), kind: 'related', turns: [] }))).toBe(false)
    expect(M.cardAnswered(card('rel2', 1, { ...at(9), kind: 'related', turns: [{ role: 'assistant', content: 'It returns {p. 4}.' }] }))).toBe(true)
    expect(M.cardAnswered(card('fig', 1, { ...at(10), kind: 'figure', turns: [] }))).toBe(true)
  })
  it('a new card keeps its passage in page fractions and bounds its words', () => {
    const c = M.newCard({ kind: 'simplify', page: 4, anchor: [{ n: 4, x: 0.123456, y: 0.5, w: 0.2, h: 0.01 }], text: 'y'.repeat(3000), at: 1000 })
    expect(c).toMatchObject({ kind: 'simplify', page: 4, rects: [[4, 0.1235, 0.5, 0.2, 0.01]], at: 1000, u: 1000, turns: [] })
    expect(c.text).toHaveLength(2000)
    expect(c.id).toMatch(/^[0-9a-z]{4,32}$/)
  })
})

describe('Define and the hyphenated word (the deep test, 15 Oct)', () => {
  it('a double-click on part of a hyphenated word widens to the whole word', () => {
    const t = 'an auto-regressive model, self-evident; not - this'
    const at = (w: string, from = 0) => { const i = t.indexOf(w, from); return [i, i + w.length] as const }
    expect(M.hyphenWord(t, ...at('regressive'))).toEqual(at('auto-regressive'))
    expect(M.hyphenWord(t, ...at('auto'))).toEqual(at('auto-regressive'))
    expect(M.hyphenWord(t, ...at('evident'))).toEqual(at('self-evident'))
    // A trailing space from the double-click is dropped; plain words and a spaced dash stay as they are.
    const [s0, e0] = at('regressive'); expect(M.hyphenWord(t, s0, e0 + 1)).toEqual(at('auto-regressive'))
    expect(M.hyphenWord(t, ...at('model'))).toBeNull()
    expect(M.hyphenWord(t, ...at('this'))).toBeNull()
    expect(M.hyphenWord('state‑of‑the‑art', 6, 8)).toEqual([0, 16])
  })
  // Re-check 2 (16 Oct): Define arrived all at once; "In this text" keeps its place first while it is written.
  it('while the meaning in this text is written: its label first with the wait, the dictionary senses below at once', () => {
    const div = document.createElement('div')
    div.innerHTML = M.html.defineHtml({ word: 'attention', source: 'Dictionary', inWait: true, senses: [{ text: 'the work of providing treatment' }] }, { colors: [['gold', 'Gold', '#000', '#000']], current: 'gold' })
    const wait = div.querySelector('.mr-define__in.mr-define__wait')!
    expect(wait.textContent).toBe('In this text')
    expect(wait.compareDocumentPosition(div.querySelector('.mr-define__senses')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // Its words as they stream replace the wait.
    div.innerHTML = M.html.defineHtml({ word: 'attention', source: 'Dictionary', inWait: false, inText: 'A mechanism that weighs', senses: [{ text: 'the work of providing treatment' }] }, { colors: [['gold', 'Gold', '#000', '#000']], current: 'gold' })
    expect(div.querySelector('.mr-define__wait')).toBeNull()
    expect(div.querySelector('.mr-define__in')!.textContent).toBe('In this textA mechanism that weighs')
  })
  it('when no dictionary sense fits: "In this text" and its meaning first, the dictionary senses below; the part of speech when known', () => {
    const div = document.createElement('div')
    div.innerHTML = M.html.defineHtml({ word: 'attention', pos: 'noun', source: 'Dictionary', inText: 'A mechanism that weighs every position of a sequence against the others.', senses: [{ text: 'the work of providing treatment' }, { text: 'a courteous act' }] }, { colors: [['gold', 'Gold', '#000', '#000']], current: 'gold' })
    const inText = div.querySelector('.mr-define__in')!
    expect(inText.querySelector('.mr-define__label')?.textContent).toBe('In this text')
    expect(inText.textContent).toBe('In this textA mechanism that weighs every position of a sequence against the others.')
    expect(inText.compareDocumentPosition(div.querySelector('.mr-define__senses')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(div.querySelector('.mr-define__pos')?.textContent).toBe('noun')
    // The dictionary alone (offline, or a sense fits): no "In this text".
    div.innerHTML = M.html.defineHtml({ word: 'attention', source: 'Dictionary', senses: [{ text: 'the work of providing treatment' }] }, { colors: [['gold', 'Gold', '#000', '#000']], current: 'gold' })
    expect(div.querySelector('.mr-define__in')).toBeNull()
    // The kept card: "In this text" first, folded to its meaning.
    const card = M.newCard({ kind: 'define', page: 3, anchor: [{ n: 3, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }], text: 'attention', data: { word: 'attention', senses: [{ text: 'a courteous act' }], inText: 'A mechanism that weighs positions.' } })
    div.innerHTML = M.html.cardHtml(card, { open: true, P, pageLabel: '3' })
    expect([...div.querySelectorAll('.mr-answer p')].map(p => p.textContent)).toEqual(['In this text', 'A mechanism that weighs positions.', 'a courteous act'])
    expect(M.html.foldText(card, P)).toBe('A mechanism that weighs positions.')
  })
  it('the "In this text" line shows its {p. N} citations as tags, in the Define card and the kept card, folded without them', () => {
    const resolve = (t: Token) => (t.label === '3' ? { page: 3, needle: '' } : null)
    const div = document.createElement('div')
    div.innerHTML = M.html.defineHtml({ word: 'transduction', source: 'Dictionary', inText: 'Turning one sequence into another {p. 3}.', senses: [{ text: 'the action of transducing' }] }, { colors: [['gold', 'Gold', '#000', '#000']], current: 'gold', P, resolve })
    const tag = div.querySelector('.mr-define__in .mr-cite') as HTMLElement
    expect(tag?.textContent).toBe('p. 3')
    expect(tag?.dataset.page).toBe('3')
    expect(div.querySelector('.mr-define__in')!.textContent).not.toContain('{p. 3}')
    const card = M.newCard({ kind: 'define', page: 3, anchor: [{ n: 3, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }], text: 'transduction', data: { word: 'transduction', senses: [], inText: 'Turning one sequence into another {p. 3}.' } })
    div.innerHTML = M.html.cardHtml(card, { open: true, P, pageLabel: '3', resolve })
    expect((div.querySelector('.mr-answer .is-bottom-line .mr-cite') as HTMLElement)?.dataset.page).toBe('3')
    expect(M.html.foldText(card, P)).toBe('Turning one sequence into another.')
  })
})

/* ---------- Retest after train 2 (15 Oct, evening) ---------- */
describe('Define: "In this text" for dictionary words too (ensemble, perplexity, saturate)', () => {
  // The offline dictionary over the repo's own files (public/data/dict), as the PDF reader loads them.
  const { readFile } = require('node:fs/promises') as typeof import('node:fs/promises')
  require(ROOT + 'app/public/lab/addbook/js/dictionary.js')
  const D = (globalThis as unknown as { TinctDictionary: unknown }).TinctDictionary as { createDictionary(o: { fetchImpl: (url: string) => Promise<Response> }): { lookup(w: string): Promise<{ word: string; definitions: string[] } | null> } }
  const dict = D.createDictionary({ fetchImpl: async url => new Response(await readFile(ROOT + 'app/public' + url, 'utf8')) })
  const cases: Array<[string, string, string]> = [
    // [selected word, the dictionary's headword, the companion's mocked in-text meaning]
    ['ensembles', 'ensemble', 'Noun. A set of separately trained models whose predictions are combined {p. 1}.'],
    ['perplexity', 'perplexity', 'Noun. A measure of how well a language model predicts text; lower is better {pp. 8}.'],
    ['saturates', 'saturate', 'Verb. Of a unit: to reach the flat part of its curve, where the gradient vanishes (p. 3).'],
  ]
  it.each(cases)('%s: the dictionary has it, and online the in-text meaning is still asked and shown first, its citation a tag', async (word, head, reply) => {
    const hit = await dict.lookup(word)
    expect(hit?.word).toBe(head)
    expect(hit!.definitions.length).toBeGreaterThan(0)
    expect(M.defineAsks(hit, { word, before: 'the model ', online: true })).toEqual({ dictionary: true, inText: true, sense: true })
    // Offline: the dictionary alone.
    expect(M.defineAsks(hit, { word, before: 'the model ', online: false })).toEqual({ dictionary: true, inText: false, sense: false })
    const found = M.parseLookup(JSON.stringify({ kind: 'definition', definition: reply }), word)!
    const resolve = (t: Token) => (['1', '3', '8'].includes(t.label) ? { page: Number(t.label), needle: '' } : null)
    const div = document.createElement('div')
    div.innerHTML = M.html.defineHtml({ word: hit!.word, pos: found.pos, source: 'Dictionary', inText: found.line, senses: hit!.definitions.slice(0, 3).map(text => ({ text })) }, { colors: [['gold', 'Gold', '#000', '#000']], current: 'gold', P, resolve })
    const inText = div.querySelector('.mr-define__in')!
    expect(inText.querySelector('.mr-define__label')?.textContent).toBe('In this text')
    expect(inText.compareDocumentPosition(div.querySelector('.mr-define__senses')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(inText.querySelectorAll('.mr-cite')).toHaveLength(1)
    expect(inText.textContent).not.toMatch(/[{}]|\(p\./)
  })
  it('a name mid-sentence asks the companion only, as before', () => {
    expect(M.defineAsks({ word: 'parzen', definitions: ['x'] }, { word: 'Parzen', before: 'a Gaussian ', online: true })).toEqual({ dictionary: false, inText: true, sense: false })
    expect(M.defineAsks(null, { word: 'maxout', online: true })).toEqual({ dictionary: false, inText: true, sense: false })
  })
})

describe('citation tags in every card, live and kept (retest: "{pp. 5}", "(p. 2)", "p. 5p. 6")', () => {
  const resolve = (t: Token) => (Number(t.label) <= 9 ? { page: Number(t.label), needle: '' } : null)
  const reply = 'It is fitted by cross validation {p. 5}{p. 6}. The proof uses it {pp. 5}, as the decoder does (p. 2). Nothing on {p. 99}.'
  const tags = (div: HTMLElement) => [...div.querySelectorAll('.mr-cite')].map(t => (t as HTMLElement).textContent)
  for (const kind of ['explain', 'ask', 'counterpoint']) {
    it(`${kind}: every form is a tag, two tags never run together, a place this PDF lacks loses its braces`, () => {
      const div = document.createElement('div')
      const kept = M.newCard({ kind, page: 5, anchor: [{ n: 5, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }], text: 'a passage', turns: kind === 'ask' ? [{ role: 'user', content: 'Why?' }, { role: 'assistant', content: reply }] : [{ role: 'assistant', content: reply }] })
      for (const o of [{}, { live: reply }]) {
        const card = 'live' in o ? { ...kept, turns: kind === 'ask' ? [kept.turns![0]] : [] } : kept
        div.innerHTML = M.html.cardHtml(card, { open: true, P, pageLabel: '5', resolve, ...o })
        expect(tags(div)).toEqual(['p. 5', 'p. 6', 'p. 5', 'p. 2'])
        const text = div.querySelector('.mr-card__body')!.textContent!
        expect(text).toContain('p. 5, p. 6')
        expect(text).not.toMatch(/p\. 5p\. 6|[{}]/)
        expect(text).toContain('Nothing on p. 99.')
      }
    })
  }
})

describe('Simplify cards: never the passage again, no note about the rewrite', () => {
  const passage = 'procedure for G is to maximize the probability of D making a mistake'
  const card = (content: string) => M.newCard({ kind: 'simplify', page: 1, anchor: [{ n: 1, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }], text: passage, turns: [{ role: 'assistant', content }] })
  const answer = (c: Card, o: Record<string, unknown> = {}) => { const div = document.createElement('div'); div.innerHTML = M.html.cardHtml(c, { open: true, P, pageLabel: '1', ...o }); return [...div.querySelectorAll('.mr-answer p')].map(p => p.textContent) }
  it('drops a copy of the passage and a closing note, kept and folded', () => {
    const c = card('The training procedure for G is to maximize the probability of D making a mistake.\n\nThe generator is trained to make the discriminator wrong as often as it can.\n\nThe rewrite is a restatement of the selected sentence.')
    expect(answer(c)).toEqual(['The generator is trained to make the discriminator wrong as often as it can.'])
    expect(M.html.foldText(c, P)).toBe('The generator is trained to make the discriminator wrong as often as it can.')
  })
  it('says so in one short line when only the passage came back; while it streams, shows what has come', () => {
    const c = card('The training procedure for G is to maximize the probability of D making a mistake.')
    expect(answer(c)).toEqual(['This passage is already in plain words.'])
    expect(M.html.foldText(c, P)).toBe('This passage is already in plain words.')
    expect(answer({ ...c, turns: [] }, { live: 'The training procedure for G is to maximize the probability of D making a mistake.' })).toEqual(['The training procedure for G is to maximize the probability of D making a mistake.'])
  })
})

describe('after the full battery on train 3', () => {
  it('a section run on after a sentence (text extracted without line breaks) is a tag: "sec. 3"', () => {
    const texts = new Map([[3, 'recurrence and convolutions entirely. 3 Model Architecture Most competitive neural sequence transduction models']])
    const tok = (raw: string) => P.citationTokens(raw)[0] as Token
    expect(M.citeTarget(tok('{sec. 3}'), { count: 9, texts })).toEqual({ page: 3, needle: '3 Model' })
    expect(M.citeTarget(tok('{sec. 4}'), { count: 9, texts })).toBeNull()
    const resolve = (t: Token) => M.citeTarget(t, { count: 9, texts })
    const div = document.createElement('div')
    div.innerHTML = M.html.defineHtml({ word: 'auto-regressive', source: 'Dictionary', inText: 'Generating one symbol at a time {sec. 3}.', senses: [] }, { colors: [['gold', 'Gold', '#000', '#000']], current: 'gold', P, resolve })
    expect((div.querySelector('.mr-define__in .mr-cite') as HTMLElement)?.dataset.page).toBe('3')
  })
  it('no card shows a sentence about the passage picture; a figure\'s card keeps its picture talk', () => {
    const a = [{ n: 1, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }]
    const div = document.createElement('div')
    div.innerHTML = M.html.cardHtml(M.newCard({ kind: 'explain', page: 1, anchor: a, text: 'x', turns: [{ role: 'assistant', content: 'The image confirms this passage reads as printed. It drops recurrence.' }] }), { open: true, P, pageLabel: '1' })
    expect(div.querySelector('.mr-card__body')!.textContent).not.toContain('image confirms')
    expect(div.querySelector('.mr-card__body')!.textContent).toContain('It drops recurrence.')
    div.innerHTML = M.html.cardHtml(M.newCard({ kind: 'figure', page: 1, anchor: a, text: 'Figure 1', turns: [{ role: 'user', content: 'What is it?' }, { role: 'assistant', content: 'The image matches the caption: a stack of six layers.' }] }), { open: true, P, pageLabel: '1' })
    expect(div.querySelector('.mr-card__body')!.textContent).toContain('The image matches the caption')
  })
  // recheck-1 (16 Oct): Explain's template lines, open and folded; a bare "eq. 1" is a tag only where the PDF has it.
  it('an Explain card never shows "no notation" or "the passage is cut off", open or folded', () => {
    const a = [{ n: 1, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }]
    const c = M.newCard({ kind: 'explain', page: 1, anchor: a, text: 'x', turns: [{ role: 'assistant', content: 'The symbol f is the noise level.\n\nThe passage is cut off mid-sentence here, so the rest follows. There is no notation in this passage.' }] })
    const div = document.createElement('div')
    div.innerHTML = M.html.cardHtml(c, { open: true, P, pageLabel: '1' })
    const text = div.querySelector('.mr-card__body')!.textContent!
    expect(text).toContain('The symbol f is the noise level.')
    expect(text).not.toMatch(/cut off|no notation/)
    div.innerHTML = M.html.cardHtml(c, { open: false, P, pageLabel: '1' })
    expect(div.textContent).not.toMatch(/cut off|no notation/)
    const texts = new Map([[1, 'The value function V(G, D) (1) is the game.']])
    const resolve = (t: Token) => M.citeTarget(t, { count: 1, texts })
    div.innerHTML = M.html.cardHtml(M.newCard({ kind: 'explain', page: 1, anchor: a, text: 'x', turns: [{ role: 'assistant', content: 'It is a game, as in equation (1) eq. 1. See also eq. 2 there.' }] }), { open: true, P, pageLabel: '1', resolve })
    expect([...div.querySelectorAll('.mr-cite')].map(el => el.textContent)).toEqual(['eq. 1'])
    expect(div.querySelector('.mr-card__body')!.textContent).toContain('See also eq. 2 there.')
  })
  it('a Simplify card leaves out what was pasted from the page (o.source)', () => {
    const a = [{ n: 1, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }]
    const source = 'It is always the same shape, only very numerous. And it is like a woman stooping down and creeping about behind that pattern.'
    const c = M.newCard({ kind: 'simplify', page: 1, anchor: a, text: 'It is always the same shape, only very numerous', turns: [{ role: 'assistant', content: 'The shape never changes; there are just very many of them.\n\nAnd it is like a woman stooping down and creeping about behind that pattern.' }] })
    const div = document.createElement('div')
    div.innerHTML = M.html.cardHtml(c, { open: true, P, pageLabel: '1', source })
    expect([...div.querySelectorAll('.mr-answer p')].map(p => p.textContent)).toEqual(['The shape never changes; there are just very many of them.'])
  })
})

describe('a bare trailing page in a card (night smoke run)', () => {
  it('shows as a tag, live and kept', () => {
    const a = [{ n: 1, x: 0.1, y: 0.2, w: 0.1, h: 0.02 }]
    const resolve = (t: Token) => (t.label === '1' ? { page: 1, needle: '' } : null)
    const content = 'The generator is trained to make the discriminator get things wrong as often as it can p. 1.'
    const c = M.newCard({ kind: 'simplify', page: 1, anchor: a, text: 'procedure for G is to maximize the probability of D making a mistake', turns: [{ role: 'assistant', content }] })
    const div = document.createElement('div')
    for (const o of [{}, { live: content }]) {
      div.innerHTML = M.html.cardHtml('live' in o ? { ...c, turns: [] } : c, { open: true, P, pageLabel: '1', resolve, ...o })
      expect((div.querySelector('.mr-answer .mr-cite') as HTMLElement)?.dataset.page).toBe('1')
      expect(div.querySelector('.mr-answer')!.textContent).toBe('The generator is trained to make the discriminator get things wrong as often as it can p. 1.')
    }
  })
})

