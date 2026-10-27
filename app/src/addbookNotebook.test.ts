/**
 * The Notebook of the margin reader (Anders, 19 Oct 2026, after Gloss's): the pure part of
 * public/lab/addbook/js/notebook.js (its entries from the margin's own store, the All · My notes · AI
 * filter, the count line, relative times, the Markdown of Copy all and Download), and how the reader
 * wires it (no new storage; desktop only; a mirror byte for byte). No DOM, no network, no AI.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Entry = { id: string; source: string; kind: string; mine: boolean; page: number; quote: string; q: string; a: string; follow: Array<{ q: string; a: string }>; note?: string; word?: string; unit?: string; at: number }
interface NotebookApi {
  KINDS: Record<string, string>
  plain(text: string): string
  entriesOf(o: { cards?: unknown[]; marks?: unknown[] }): Entry[]
  filterEntries(list: Entry[], filter?: string): Entry[]
  countLine(n: number): string
  ago(at: number, now?: number): string
  toMarkdown(list: Entry[], o?: { title?: string; author?: string; place?: (e: Entry) => string }): string
  fileName(title: string): string
}
require(ROOT + 'app/public/lab/addbook/js/notebook.js')
const N = (globalThis as unknown as { TinctNotebook: NotebookApi }).TinctNotebook
const NOW = Date.UTC(2026, 9, 19, 12)
const min = 60_000

const cards = [
  { id: 'c1', kind: 'explain', page: 3, text: 'The passage explained.', turns: [{ role: 'assistant', content: '**Bottom line.** It holds {p. 4}. See [the source](https://example.org/x).' }, { role: 'user', content: 'Why?' }, { role: 'assistant', content: 'Because.' }], at: NOW - 5 * min },
  { id: 'c2', kind: 'ask', page: 4, text: 'An asked passage.', turns: [{ role: 'user', content: 'What does it mean?' }, { role: 'assistant', content: 'It means this.' }], at: NOW - 30 * min },
  { id: 'c3', kind: 'define', page: 5, text: 'variance', data: { word: 'variance', senses: [{ text: 'Spread round a mean.' }, { text: 'Difference.' }] }, turns: [], at: NOW - 3 * 3600_000 },
  { id: 'c4', kind: 'quiz', page: 6, text: '', data: { unit: { key: 'u1', label: 'Chapter 2' }, questions: [{ q: 'First?', answer: 'Ideas', why: 'Named first.' }, { q: 'Second?', answer: 'Facts', why: '' }] }, at: NOW - 26 * 3600_000 },
  { id: 'c5', kind: 'factcheck', page: 7, text: 'A claim.', turns: [{ role: 'assistant', content: 'Holds. The verdict.' }], at: NOW - 3 * 86400_000 },
  { id: 'c6', kind: 'counterpoint', page: 7, text: 'Another.', turns: [{ role: 'assistant', content: 'The objection.' }], at: NOW - 10 * 86400_000 },
  { id: 'c7', kind: 'simplify', page: 8, text: 'Simple.', turns: [{ role: 'assistant', content: 'Simpler.' }], at: NOW - 40 * 86400_000 },
  // Left out: deleted (a tombstone), never answered, and not a card of the margin's kinds.
  { id: 'gone', gone: true, u: NOW },
  { id: 'c8', kind: 'explain', page: 2, text: 'Unanswered.', turns: [], at: NOW - min },
  { id: 'c9', kind: 'whole', page: 1, text: '', turns: [{ role: 'assistant', content: 'Chat.' }], at: NOW },
]
const marks = [
  { id: 'm1', page: 3, text: 'A noted line.', note: 'My note.', withNote: true, color: 'gold', at: NOW - 2 * min },
  { id: 'm2', page: 9, text: 'A plain highlight.', color: 'blue', at: NOW - 400 * 86400_000 },
  { id: 'm3', gone: true },
]

describe('the margin batch\'s cards in the Notebook (19 Oct 2026)', () => {
  const unit = { key: 'u1', label: 'Chapter 2' }
  const list = N.entriesOf({
    cards: [
      { id: 'p1', kind: 'ask', page: 9, text: '', data: { unit, pill: 'recap' }, turns: [{ role: 'assistant', content: 'The recap.' }], at: NOW - min },
      { id: 'p2', kind: 'ask', page: 4, text: '', data: { unit, pill: 'catchup' }, turns: [{ role: 'assistant', content: 'So far.' }], at: NOW - 2 * min },
    ],
    // A margin note: a highlight record with no passage (its one box has no size).
    marks: [{ id: 'mn', page: 5, rects: [[1, 0.4, 0, 0]], text: '', note: 'A thought in the margin.', withNote: true, at: NOW - 3 * min }],
  })
  it('names a unit\'s pill cards by their pill, under AI, their chip the unit', () => {
    const ai = N.filterEntries(list, 'ai')
    expect(ai.map(e => e.id)).toEqual(['p1', 'p2'])
    expect(N.toMarkdown(ai)).toContain('## Recap · Chapter 2')
    expect(N.toMarkdown(ai)).toContain('## Catch me up · Chapter 2')
    expect(ai.map(e => e.unit)).toEqual(['Chapter 2', 'Chapter 2'])
  })
  it('lists a margin note under My notes, with no passage', () => {
    expect(N.filterEntries(list, 'mine')).toMatchObject([{ id: 'n-mn', kind: 'note', quote: '', note: 'A thought in the margin.' }])
  })
})

describe('the entries, from the margin\'s own store', () => {
  const list = N.entriesOf({ cards, marks })
  it('are every answered card and every highlight, newest first', () => {
    expect(list.map(e => e.id)).toEqual(['n-m1', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'h-m2'])
    expect(list.map(e => N.KINDS[e.kind])).toEqual(['Note', 'Explain', 'Ask', 'Define', 'Quiz', 'Evaluate', 'Counterpoint', 'Simplify', 'Highlight'])
  })
  it('have their question and answer, in plain prose, and the follow-ups under them', () => {
    const [note, explain, ask, define, quiz] = list
    expect(explain).toMatchObject({ quote: 'The passage explained.', q: '', a: 'Bottom line. It holds (p. 4). See the source.', follow: [{ q: 'Why?', a: 'Because.' }] })
    expect(ask).toMatchObject({ q: 'What does it mean?', a: 'It means this.', follow: [] })
    expect(define).toMatchObject({ word: 'variance', a: '1. Spread round a mean.\n2. Difference.' })
    expect(quiz).toMatchObject({ unit: 'Chapter 2', quote: '', q: 'First?', a: 'Ideas. Named first.', follow: [{ q: 'Second?', a: 'Facts' }] })
    expect(note).toMatchObject({ source: 'mark', mark: 'm1', kind: 'note', mine: true, quote: 'A noted line.', note: 'My note.' })
  })
  it('filter as All, My notes (the reader\'s own notes and highlights) and AI (the answers)', () => {
    expect(N.filterEntries(list, 'all')).toHaveLength(9)
    expect(N.filterEntries(list, 'mine').map(e => e.kind)).toEqual(['note', 'highlight'])
    expect(N.filterEntries(list, 'ai').every(e => !['note', 'highlight'].includes(e.kind))).toBe(true)
    expect(N.filterEntries(list, 'ai')).toHaveLength(7)
  })
  it('count as entries (the list mixes questions, answers, notes and highlights)', () => {
    expect([0, 1, 2, 10].map(N.countLine)).toEqual(['0 entries', '1 entry', '2 entries', '10 entries'])
  })
  it('say when, from now', () => {
    expect(N.ago(NOW - 20_000, NOW)).toBe('Just now')
    expect(N.ago(NOW - 5 * min, NOW)).toBe('5 min ago')
    expect(N.ago(NOW - 3 * 3600_000, NOW)).toBe('3 h ago')
    expect(N.ago(NOW - 26 * 3600_000, NOW)).toBe('Yesterday')
    expect(N.ago(NOW - 3 * 86400_000, NOW)).toBe('3 days ago')
    // Older: the date (this year's without the year), in the reader's own time zone.
    expect(N.ago(NOW - 40 * 86400_000, NOW)).toBe(new Date(NOW - 40 * 86400_000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))
    expect(N.ago(NOW - 400 * 86400_000, NOW)).toMatch(/^\d{1,2} Sept? 2025$/)
  })
})

describe('Copy all and Download: Markdown made on the device', () => {
  const list = N.entriesOf({ cards, marks })
  const md = N.toMarkdown(list, { title: 'A Treatise', author: 'Ann Example', place: e => `p. ${e.page}` })
  it('names the book, counts the entries, and gives each its kind, place, passage, questions and answers', () => {
    expect(md.startsWith('# A Treatise: notebook\n\nAnn Example\n\n9 entries\n')).toBe(true)
    expect(md.match(/^## /gm)).toHaveLength(9)
    expect(md).toContain('## Explain · p. 3\n\n_')
    expect(md).toContain('> The passage explained.\n\n**A.** Bottom line. It holds (p. 4). See the source.\n\n**Q.** Why?\n\n**A.** Because.')
    expect(md).toContain('## Define · variance · p. 5')
    expect(md).toContain('## Quiz · Chapter 2')
    expect(md).toContain('## Note · p. 3')
    expect(md).toContain('> A noted line.\n\nMy note.')
    expect(md).toContain('## Highlight · p. 9')
  })
  it('a file named by the book, safe on every system', () => {
    expect(N.fileName('A Treatise: Of Small/Things?')).toBe('A Treatise Of Small Things notebook.md')
    expect(N.fileName('')).toBe('Notebook notebook.md')
  })
})

describe('how the reader wires it', () => {
  const reader = readFileSync(ROOT + 'app/public/lab/addbook/js/reader.js', 'utf8')
  const html = readFileSync(ROOT + 'app/public/lab/addbook/index.html', 'utf8')
  const css = readFileSync(ROOT + 'app/public/lab/addbook/css/notebook.css', 'utf8')
  it('reads the margin\'s store (cards, highlights) and keeps nothing of its own', () => {
    expect(reader).toContain("data: () => (hasBook() ? { cards: keptCards().map(nbShown), marks: highlights() } : { cards: [], marks: [] }),")
    const nb = readFileSync(ROOT + 'app/public/lab/addbook/js/notebook.js', 'utf8')
    expect(nb).not.toMatch(/localStorage|indexedDB|fetch\(|store\.set/)
  })
  it('opens from a top bar button beside Aa, loads before the reader, and is hidden on phones', () => {
    expect(html).toContain('<button type="button" class="byob-nb" id="notebookBtn" aria-label="Notebook" aria-expanded="false" aria-controls="notebook"></button>\n      <button type="button" class="byob-aa" id="aaBtn"')
    expect(html.indexOf('js/notebook.js')).toBeLessThan(html.indexOf('js/reader.js'))
    expect(css).toContain('.lab.byob.is-phone .byob-nb, .lab.byob.is-phone .nb { display: none !important; }')
    expect(css).not.toMatch(/monospace|uppercase|letter-spacing:\s*[1-9]/)
  })
})
