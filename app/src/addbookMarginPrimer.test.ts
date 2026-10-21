/**
 * The PDF reader's Before you start, PR 3 (docs/margin/BRIEF.md §5, PROMPTS.md "Before you start"):
 * a PDF's units from its outline, where the trigger is offered, how it names its unit, the map's
 * page ranges, the trigger's and the primer's markup, placement with the trigger above the cards,
 * and the requests tinct-api.js sends (the chapter action `primer`, and Quiz me on a whole unit),
 * read back by the Worker's own parser. fetch is mocked: no network and no AI.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import * as P from '../public/lab/margin/margin-parse.js'
import { parseCompanionRequest } from './companion/companionRequest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Unit = { key: string; title: string; from: number; start: number; to: number }
type Token = { type: 'cite'; kind: string; label: string; to?: string; raw: string }
interface MarginApi {
  PRIMER: { top: number; bottom: number; units: number }
  COL: Record<string, number>
  primerUnits(entries: Array<{ title: string; page: number | null }>, count: number): Unit[]
  unitAt(units: Unit[], page: number): Unit | null
  atUnitStart(unit: Unit | null, page: number): boolean
  unitPhrase(unit: Unit | null): string
  mapPages(text: string): Token | null
  citeTarget(token: Token, o: { labels?: string[] | null; count?: number }): { page: number } | null
  placeCards(passages: Array<{ id: string; top: number; at?: number; fold?: boolean; keep?: boolean }>, heights: number[], columnHeight: number, o?: Record<string, unknown>): { positions: Array<{ id: string; top: number; height: number; row?: boolean }>; gathered: string[]; stack: { top: number } | null }
  cardView(cards: Array<Record<string, unknown>>, marks: unknown[]): Array<{ id: string }>
  html: {
    triggerHtml(unit: Unit): string
    primerHtml(p: unknown, o: Record<string, unknown>): string
    primerSections(p: unknown): Array<{ title: string; items: unknown[] }>
    cardLabel(card: Record<string, unknown>, page: string): string
  }
}
interface Api { companion(intent: string, o: Record<string, unknown>): Promise<{ text: string }> }
let M: MarginApi
let A: Api
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  require(ROOT + 'app/public/lab/addbook/js/tinct-api.js')
  M = (globalThis as unknown as { TinctMargin: MarginApi }).TinctMargin
  A = (globalThis as unknown as { TinctAI: Api }).TinctAI
})

describe('a PDF’s units (the top-level outline entries as page ranges)', () => {
  it('each entry runs to the page before the next; the first also takes the pages before it; keys name the outline index', () => {
    const units = M.primerUnits([{ title: 'Chapter 1. Of Ideas', page: 2 }, { title: 'Chapter 2. Of Impressions', page: 5 }, { title: 'Chapter 3', page: 9 }], 45)
    expect(units).toEqual([
      { key: 'outline-0', title: 'Chapter 1. Of Ideas', from: 1, start: 2, to: 4 },
      { key: 'outline-1', title: 'Chapter 2. Of Impressions', from: 5, start: 5, to: 8 },
      { key: 'outline-2', title: 'Chapter 3', from: 9, start: 9, to: 45 },
    ])
  })
  it('a PDF of fewer than 40 pages is one unit, "all", outline or not (a paper\'s primer covers the whole paper)', () => {
    const outline = [{ title: 'Abstract', page: 1 }, { title: '1 Introduction', page: 2 }, { title: '2 Background', page: 2 }, { title: '3 Model Architecture', page: 2 }, { title: 'References', page: 10 }]
    expect(M.primerUnits(outline, 15)).toEqual([{ key: 'all', title: '', from: 1, start: 1, to: 15 }])
    expect(M.primerUnits(outline, 39)).toEqual([{ key: 'all', title: '', from: 1, start: 1, to: 39 }])
    expect(M.primerUnits(outline, 40).map(u => u.key)).toEqual(['outline-0', 'outline-1', 'outline-4'])
  })
  it('a PDF without an outline (or none that resolves) is one unit, "all"', () => {
    expect(M.primerUnits([], 8)).toEqual([{ key: 'all', title: '', from: 1, start: 1, to: 8 }])
    expect(M.primerUnits([{ title: 'Lost', page: null }, { title: '', page: 3 }, { title: 'Past the end', page: 99 }], 8)).toEqual([{ key: 'all', title: '', from: 1, start: 1, to: 8 }])
  })
  it('entries out of order are put in page order; a second entry on the same page is left out; keys stay the outline’s', () => {
    const units = M.primerUnits([{ title: 'B', page: 6 }, { title: 'A', page: 1 }, { title: 'A again', page: 1 }], 50)
    expect(units.map(u => [u.key, u.from, u.to])).toEqual([['outline-1', 1, 5], ['outline-0', 6, 50]])
    // Every key is one the Worker's storage accepts.
    for (const u of units) expect(u.key).toMatch(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/)
  })
  it('the unit a page is in, and where the trigger is offered (the unit’s start, and a title page before the first)', () => {
    const units = M.primerUnits([{ title: 'Chapter 1', page: 2 }, { title: 'Chapter 2', page: 5 }], 40)
    expect(M.unitAt(units, 1)?.key).toBe('outline-0')
    expect(M.unitAt(units, 7)?.key).toBe('outline-1')
    expect([1, 2, 3, 4, 5, 6].map(n => M.atUnitStart(M.unitAt(units, n), n))).toEqual([true, true, false, false, true, false])
    expect(M.atUnitStart(null, 1)).toBe(false)
  })
  it('names its unit as the mockup does ("chapter 1"), else as "the" and its heading; the whole file is "the whole PDF"', () => {
    const u = (title: string): Unit => ({ key: 'outline-0', title, from: 1, start: 1, to: 2 })
    expect(M.unitPhrase(u('Chapter 1. Of Ideas'))).toBe('chapter 1')
    expect(M.unitPhrase(u('CHAPTER 12: Rates'))).toBe('chapter 12')
    expect(M.unitPhrase(u('Section 2.4 Order'))).toBe('section 2.4')
    // A heading without a chapter number: "the" and its words in lower case, its own number dropped; acronyms kept.
    expect(M.unitPhrase(u('Introduction.'))).toBe('the introduction')
    expect(M.unitPhrase(u('1 Introduction'))).toBe('the introduction')
    expect(M.unitPhrase(u('3 Model Architecture'))).toBe('the model architecture')
    expect(M.unitPhrase(u('The Problem'))).toBe('the problem')
    expect(M.unitPhrase(u('BLEU Results'))).toBe('the BLEU results')
    expect(M.unitPhrase({ key: 'all', title: '', from: 1, start: 1, to: 9 })).toBe('the whole PDF')
  })
})

describe('the trigger and the primer’s markup', () => {
  const resolveCite = (t: Token) => M.citeTarget(t, { labels: null, count: 640 })
  const primer = {
    gist: 'The chapter sets up two tools.',
    claims: [{ text: 'Variances add.', cite: '{p. 12}' }, { text: 'Stirling holds.', cite: '{p. 13}' }, { text: 'No page.', cite: '' }],
    keepInMind: ['Natural logs, then base 2.'],
    map: [{ title: 'Why probability first', pages: 'pp. 9–10' }, { title: 'Exercises', pages: 'p. 19' }, { title: 'Unprinted', pages: '' }],
  }
  it('the trigger, a folded card: the label "Before you start", then the line about the unit, naming no section (the kind is known only once made); no keycap', () => {
    const unit = { key: 'outline-0', title: 'Chapter 1. Of Ideas', from: 1, start: 2, to: 4 }
    const div = document.createElement('div')
    div.innerHTML = M.html.triggerHtml(unit)
    expect(div.querySelector('.mr-trigger__title')?.textContent).toBe('Before you start')
    expect(div.querySelector('.mr-trigger__sub')?.textContent).toBe('The gist and a map of chapter 1.')
    expect(div.querySelector('.mr-key')).toBeNull()
    div.innerHTML = M.html.triggerHtml({ key: 'all', title: '', from: 1, start: 1, to: 15 })
    expect(div.textContent).toBe('Before you startThe gist and a map of the whole PDF.')
  })
  it('a primer stored before kinds still renders as it did: title with Minimise and the bin (21 Oct 2026, no ×), gist, numbered Key claims with cite tags, Keep in mind, Map rows, the quiz row, the footer', () => {
    const div = document.createElement('div')
    div.innerHTML = M.html.primerHtml(primer, { P, resolve: resolveCite })
    expect(div.querySelector('h4')?.textContent).toBe('Before you start')
    expect(div.querySelector('.mr-primer__close')?.getAttribute('aria-label')).toBe('Minimise')
    expect(div.querySelector('h4 .mr-primer__delete')?.getAttribute('data-c')).toBe('delete')
    expect([...div.querySelectorAll('.mr-primer__head')].map(h => h.textContent)).toEqual(['Key claims', 'Keep in mind', 'Map'])
    expect([...div.querySelectorAll('.mr-primer__claims li')].map(li => li.textContent)).toEqual(['1Variances add. p. 12', '2Stirling holds. p. 13', '3No page.'])
    expect([...div.querySelectorAll('.mr-primer__claims .mr-cite')].map(b => (b as HTMLElement).dataset.page)).toEqual(['12', '13'])
    expect(div.querySelector('.mr-primer__keep')?.textContent).toBe('Natural logs, then base 2.')
    const rows = [...div.querySelectorAll('.mr-map__row')]
    expect(rows.map(r => [r.tagName, (r as HTMLElement).dataset.page ?? null])).toEqual([['BUTTON', '9'], ['BUTTON', '19'], ['DIV', null]])
    // No count until a quiz on the unit knows it (questions scale with the unit's length); the footer is Redo alone.
    expect(div.querySelector('.mr-quiz-row')?.textContent).toBe('Quiz me on this chapter→')
    expect(div.querySelector('.mr-primer__foot')?.textContent).toBe('Redo')
    div.innerHTML = M.html.primerHtml(primer, { P, resolve: resolveCite, quizCount: 5 })
    expect(div.querySelector('.mr-quiz-row')?.textContent).toBe('Quiz me on this chapter5 questions →')
  })
  // Each kind's sections (PROMPTS.md, chapter action `primer`), as the parser gives them.
  const map = primer.map
  const kinds = {
    paper: [{ title: 'Key claims', items: [{ text: 'Variances add.', cite: '{p. 12}' }, { text: 'Stirling holds.', cite: '{p. 13}' }] }, { title: 'Keep in mind', items: [{ text: 'Natural logs, then base 2.', cite: '' }] }],
    textbook: [{ title: 'What you’ll learn', items: [{ text: 'Why codes trade rate for error.', cite: '{p. 12}' }, { text: 'What capacity means.', cite: '{p. 14}' }] }, { title: 'Ideas to hold onto', items: [{ text: 'Redundancy buys reliability.', cite: '{p. 13}' }] }, { title: 'Terms', items: [{ term: 'Rate', meaning: 'Bits of message per bit sent.' }, { term: 'Capacity', meaning: 'The best rate with vanishing error.' }] }],
    narrative: [{ title: 'Where we are', items: [{ text: 'A ship becalmed off Ithaca.', cite: '{p. 9}' }] }, { title: 'People', items: [{ term: 'Telemachus', meaning: 'Odysseus’s son, not yet grown.' }] }, { title: 'Threads to watch', items: [{ text: 'Whether the suitors will act.', cite: '' }] }],
    practical: [{ title: 'What it covers', items: [{ text: 'Setting up the meter.', cite: '{p. 9}' }] }, { title: 'Steps or topics', items: [{ text: 'Calibrate.', cite: '{p. 10}' }, { text: 'Measure.', cite: '{p. 11}' }] }],
    other: [{ title: 'Key points', items: [{ text: 'A draft agenda.', cite: '{p. 9}' }, { text: 'Two votes.', cite: '{p. 10}' }] }, { title: 'Keep in mind', items: [{ text: 'Dates may move.', cite: '' }] }],
  }
  it('each kind: the gist first, its sections under their italic labels, the map, Quiz me; terms as "term — meaning"; the unit named under the title', () => {
    const div = document.createElement('div')
    for (const [kind, sections] of Object.entries(kinds)) {
      div.innerHTML = M.html.primerHtml({ kind, gist: 'The gist.', sections, map }, { P, resolve: resolveCite, unit: 'Chapter 1: Introduction to Information Theory' })
      expect([...div.querySelectorAll('.mr-primer__head')].map(h => h.textContent), kind).toEqual([...sections.map(x => x.title), 'Map'])
      // The order: title, the unit's name, the gist, the sections, the map, the quiz row, the footer.
      expect([...div.children].map(c => c.className || c.tagName).slice(0, 3), kind).toEqual(['mr-primer__title', 'mr-primer__unit', 'mr-primer__gist'])
      expect(div.querySelector('.mr-primer__unit')?.textContent).toBe('Chapter 1: Introduction to Information Theory')
      expect(div.querySelector('.mr-quiz-row')?.textContent, kind).toBe('Quiz me on this chapter→')
      // A paper's, a textbook's or other's first section is numbered, as Key claims always was; a story's situation and a guide's scope are not; steps are.
      expect([...div.querySelectorAll('ol.mr-primer__claims')].map(ol => ol.querySelectorAll('li').length), kind).toEqual({ paper: [2], textbook: [2], narrative: [], practical: [2], other: [2] }[kind])
    }
    div.innerHTML = M.html.primerHtml({ kind: 'textbook', gist: 'The gist.', sections: kinds.textbook, map }, { P, resolve: resolveCite })
    expect(div.querySelector('.mr-primer__unit')).toBeNull()
    const terms = [...div.querySelectorAll('.mr-primer__keep')].at(-1)!
    expect([...terms.querySelectorAll('li')].map(li => li.textContent)).toEqual(['Rate — Bits of message per bit sent.', 'Capacity — The best rate with vanishing error.'])
    expect(div.querySelector('ol.mr-primer__claims .mr-cite')?.getAttribute('data-page')).toBe('12')
    // Steps are numbered; a guide's scope is not; a single point is never numbered.
    div.innerHTML = M.html.primerHtml({ kind: 'practical', gist: 'The gist.', sections: kinds.practical, map }, { P, resolve: resolveCite })
    expect([...div.querySelectorAll('ol.mr-primer__claims')].map(ol => ol.previousElementSibling?.textContent)).toEqual(['Steps or topics'])
    div.innerHTML = M.html.primerHtml({ kind: 'paper', gist: 'The gist.', sections: [{ title: 'Key claims', items: [{ text: 'One.', cite: '' }] }], map }, { P, resolve: resolveCite })
    expect(div.querySelector('ol')).toBeNull()
    // Terms are escaped like everything else.
    div.innerHTML = M.html.primerHtml({ kind: 'textbook', gist: 'g', sections: [{ title: '<b>T</b>', items: [{ term: '<i>x</i>', meaning: 'y' }] }], map }, { P, resolve: resolveCite, unit: '<b>u</b>' })
    expect(div.querySelector('b, i')).toBeNull()
  })
  it('primerSections reads both shapes: its own sections, or claims and cautions as Key claims and Keep in mind', () => {
    expect(M.html.primerSections(primer).map((x: { title: string }) => x.title)).toEqual(['Key claims', 'Keep in mind'])
    expect(M.html.primerSections({ ...primer, keepInMind: [] }).map((x: { title: string }) => x.title)).toEqual(['Key claims'])
    expect(M.html.primerSections({ kind: 'narrative', gist: 'g', sections: kinds.narrative, map })).toEqual(kinds.narrative)
  })
  it('while it is made: the title and a status line for the wait ring; when it could not be: the reason and Redo', () => {
    const div = document.createElement('div')
    div.innerHTML = M.html.primerHtml(null, { wait: true })
    expect(div.querySelector('.mr-wait')?.getAttribute('role')).toBe('status')
    expect(div.querySelector('.mr-map')).toBeNull()
    div.innerHTML = M.html.primerHtml(null, { status: 'No connection. Check your internet and try again.' })
    expect(div.querySelector('.mr-status')?.textContent).toBe('No connection. Check your internet and try again.')
    expect(div.querySelector('[data-c="redo"]')?.textContent).toBe('Redo')
  })
  it('a map of the document\'s own numbered headings shows each heading once: "1 Introduction", never "1 · 1 Introduction"', () => {
    const div = document.createElement('div')
    const map = [{ title: 'Abstract', pages: 'p. 1' }, { title: '1 Introduction', pages: 'p. 2' }, { title: '3.2 Attention', pages: 'pp. 3–5' }, { title: 'A. Appendix', pages: 'p. 13' }]
    div.innerHTML = M.html.primerHtml({ ...primer, map }, { P, resolve: resolveCite })
    expect([...div.querySelectorAll('.mr-map__row')].map(r => r.textContent)).toEqual(['Abstractp. 1', '1 Introductionp. 2', '3.2 Attentionpp. 3–5', 'A. Appendixp. 13'])
    expect(div.querySelector('.mr-map__n')).toBeNull()
    expect([...div.querySelectorAll('.mr-map__row')].every(r => r.classList.contains('is-own'))).toBe(true)
    // Headings without numbers keep the count.
    div.innerHTML = M.html.primerHtml({ ...primer, map: [{ title: 'Why probability first', pages: 'pp. 9–10' }, { title: 'Exercises', pages: 'p. 11' }] }, { P, resolve: resolveCite })
    expect([...div.querySelectorAll('.mr-map__n')].map(n => n.textContent)).toEqual(['1', '2'])
  })
  it('text from the model is escaped, never markup', () => {
    const div = document.createElement('div')
    div.innerHTML = M.html.primerHtml({ ...primer, gist: '<img src=x onerror=alert(1)>', map: [{ title: '<b>x</b>', pages: '<i>1</i>' }] }, { P, resolve: resolveCite })
    expect(div.querySelector('img, b, i')).toBeNull()
  })
  it('a map row’s printed range as a citation: "pp. 9–10", "p. 12", "9-10", roman labels; anything else stays text', () => {
    expect(M.mapPages('pp. 9–10')).toMatchObject({ kind: 'pp', label: '9', to: '10' })
    expect(M.mapPages('p. 12')).toMatchObject({ kind: 'p', label: '12' })
    expect(M.mapPages('9-10')).toMatchObject({ kind: 'pp', label: '9', to: '10' })
    expect(M.mapPages('pp. xi–xiv')).toMatchObject({ kind: 'pp', label: 'xi', to: 'xiv' })
    expect(M.mapPages('')).toBeNull()
    expect(M.mapPages('see chapter 2')).toBeNull()
  })
})

describe('placement with the trigger above the cards', () => {
  it('no card starts above the room the trigger keeps; the invariants still hold', () => {
    const passages = [{ id: 'a', top: 0 }, { id: 'b', top: 10 }, { id: 'c', top: 300 }]
    const out = M.placeCards(passages, [60, 60, 60], 700, { top: 98 })
    expect(out.positions.map(p => p.top)).toEqual([98, 172, 296])
    const open = M.placeCards(passages, [60, 600, 60], 700, { top: 98, open: 'b' })
    // The open card keeps its place below the trigger; nothing moves above it.
    expect(open.positions.every(p => p.top >= 98)).toBe(true)
    expect(open.positions.find(p => p.id === 'b')).toBeTruthy()
    const all = [...open.positions].sort((x, y) => x.top - y.top)
    for (let i = 1; i < all.length; i++) expect(all[i].top).toBeGreaterThanOrEqual(all[i - 1].top + all[i - 1].height + 14)
    expect(M.placeCards(passages, [60, 60, 60], 700)).toEqual(M.placeCards(passages, [60, 60, 60], 700, { top: 0 }))
  })
  it('the trigger placed with the cards (keep): at its page’s first line less 4px, never folded or gathered, the cards after it in page order', () => {
    const passages = [{ id: 'trigger', top: 120, fold: false, keep: true }, ...Array.from({ length: 14 }, (_, i) => ({ id: 'c' + i, top: 140 + i * 20, at: i }))]
    const heights = [50, ...Array(14).fill(70)]
    const out = M.placeCards(passages, heights, 600, { stackHeight: 34 })
    const trig = out.positions.find(p => p.id === 'trigger')!
    expect(trig.row).toBeUndefined()
    expect(trig.height).toBe(50)
    expect(out.gathered).not.toContain('trigger')
    expect(out.gathered.length).toBeGreaterThan(0)
    expect(out.positions[0].id).toBe('trigger')
    // With room, it sits at its line less 4px.
    expect(M.placeCards(passages.slice(0, 2), heights.slice(0, 2), 600).positions[0].top).toBe(116)
  })
  it('the trigger and the primer keep the mockup’s distances: 16px from the column’s top, 70px from its bottom', () => {
    expect(M.PRIMER).toEqual({ top: 16, bottom: 70, units: 40 })
  })
})

describe('Quiz me on a whole unit, kept as a card', () => {
  it('is left out of the passage view (it sits at the column’s top) and is labelled with its unit', () => {
    const card = { id: 'q1', kind: 'quiz', page: 2, rects: [[2, 0, 0, 0, 0]], text: '', turns: [], at: 1, data: { unit: { key: 'outline-0', label: 'chapter 1' }, questions: [], i: 0, results: [] } }
    expect(M.cardView([card], [])).toEqual([])
    expect(M.html.cardLabel(card, '2')).toBe('Quiz me · chapter 1')
    expect(M.html.cardLabel({ ...card, data: { unit: { key: 'all', label: 'Whole PDF' } } }, '2')).toBe('Quiz me · Whole PDF')
  })
})

describe('the requests (fetch mocked)', () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })
  const pdf = { pages: [{ n: '9', text: '1.1 Why probability first\nText.' }, { n: '10', text: 'More.' }, { n: 11, text: '1.2 Two distributions\nText.' }], at: 0 }
  const book = { title: 'Probability and Inference', author: 'D. M.', chapter: 'Chapter 1', page: 9, pages: 640 }
  function capture(reply: string) {
    const sent: Array<{ url: string; body: Record<string, unknown> }> = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
      sent.push({ url, body: JSON.parse(String(init.body)) })
      return new Response(JSON.stringify({ content: [{ type: 'text', text: reply }] }), { headers: { 'Content-Type': 'application/json' } })
    }))
    return sent
  }
  it('Before you start: intent "chapter" with the action primer, the unit’s pages as a PDF, no book id; the Worker reads it as a primer request', async () => {
    const sent = capture('{"gist":"…"}')
    await A.companion('chapter', { book, pdf, chapter: { action: { kind: 'primer', unitKey: 'outline-0', unitTitle: 'Chapter 1' } }, stream: false })
    const companion = sent[0].body.companion as Record<string, unknown>
    expect(companion).toMatchObject({ intent: 'chapter', chapter: { action: { kind: 'primer', unitKey: 'outline-0', unitTitle: 'Chapter 1' } }, context: { kind: 'pdf', pages: pdf.pages, bookTitle: book.title } })
    expect((companion.context as Record<string, unknown>).bookId).toBeUndefined()
    expect(companion.selection).toBeUndefined()
    const parsed = parseCompanionRequest(companion)
    expect(parsed).toMatchObject({ intent: 'chapter', chapter: { action: { kind: 'primer', unitKey: 'outline-0', unitTitle: 'Chapter 1' } }, pdf: true })
    expect(parsed!.context!.paragraphs[0]).toBe('<page n="9">\n1.1 Why probability first\nText.\n</page>')
    expect(sent[0].body.stream).toBe(false)
  })
  it('the whole file is the unit "all"; a bad unit key is refused by the Worker', async () => {
    let sent = capture('{}')
    await A.companion('chapter', { book, pdf, chapter: { action: { kind: 'primer', unitKey: 'all', unitTitle: 'Probability and Inference' } } })
    expect(parseCompanionRequest(sent[0].body.companion)).toMatchObject({ chapter: { action: { unitKey: 'all' } } })
    sent = capture('{}')
    await A.companion('chapter', { book, pdf, chapter: { action: { kind: 'primer', unitKey: '../x', unitTitle: 'T' } } })
    expect(parseCompanionRequest(sent[0].body.companion)).toBeNull()
  })
  it('another chapter action never rides along: only the primer is sent from the PDF reader', async () => {
    const sent = capture('{}')
    await A.companion('chapter', { book, pdf, chapter: { action: { kind: 'discuss', bookId: 'odyssey' } } })
    expect((sent[0].body.companion as Record<string, unknown>).chapter).toBeUndefined()
  })
  it('Quiz me on this chapter: `quiz` with no selection and the unit’s pages; the Worker reads it as a chapter quiz', async () => {
    const sent = capture('{"questions":[]}')
    await A.companion('quiz', { book, pdf, stream: false })
    const companion = sent[0].body.companion as Record<string, unknown>
    expect(companion.selection).toBeUndefined()
    const parsed = parseCompanionRequest(companion)
    expect(parsed).toMatchObject({ intent: 'quiz', pdf: true })
    expect(parsed!.selection).toBeUndefined()
    expect(parsed!.context!.paragraphs).toHaveLength(3)
  })
})
