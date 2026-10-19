/**
 * The PDF reader's margin, PR C (docs/margin/FIXES-2026-10-15.md): Related in More and its card,
 * the quiz end card and a failed marking, a stray *word* in italics, Copy quote's printed label,
 * the margin's words for an EPUB, and what tinct-api.js sends for an EPUB and for Related, read
 * back by the Worker's parser. fetch is mocked: no network and no AI.
 */
// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import * as P from '../public/lab/margin/margin-parse.js'
import { companionTakesPassageImage, parseCompanionRequest } from './companion/companionRequest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Card = { id: string; kind: string; page: number; rects: number[][]; text: string; turns?: Array<{ role: string; content: string }>; data?: Record<string, unknown>; at: number }
interface MarginApi {
  KINDS: Record<string, string>
  CARD_KINDS: string[]
  QUIZ_ANSWER_CHARS: number
  quizLine(q: Record<string, unknown>): string
  copyQuote(o: Record<string, unknown>): string
  html: {
    moreHtml(o?: Record<string, unknown>): string
    cardHtml(card: Card, o: Record<string, unknown>): string
    cardLabel(card: Card, pageLabel: string, o?: Record<string, unknown>): string
    answerHtml(text: string, p: typeof P, o?: Record<string, unknown>): string
    foldText(card: Card, p: typeof P): string
    stackHtml(cards: Array<{ kind: string }>, max?: number, o?: Record<string, unknown>): string
    wholeHtml(body: string, o?: Record<string, unknown>): string
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

describe('Related (A5, approved 15 Oct)', () => {
  it('sits in More between Fact-check and Counterpoint, described as "Where else the text takes this up"', () => {
    const desk = M.html.moreHtml()
    expect(desk).toContain('<button type="button" class="mr-more__row" role="menuitem" data-m="related"><b>Related</b><span>Where else the text takes this up</span></button>')
    const order = [...desk.matchAll(/data-m="(\w+)"/g)].map(m => m[1])
    expect(order.slice(0, 5)).toEqual(['define', 'factcheck', 'related', 'counterpoint', 'quiz'])
    expect([...M.html.moreHtml({ phone: true }).matchAll(/data-m="(\w+)"/g)].map(m => m[1]).slice(0, 5)).toEqual(['define', 'factcheck', 'related', 'counterpoint', 'quiz'])
    expect(M.KINDS.related).toBe('Related')
    expect(M.CARD_KINDS).toContain('related')
  })

  const answer = 'Self-attention is the thread through the model.\n\n{p. 2} Background sets it against recurrence.\n{sec. 3.2} The encoder stacks it.\n{p. 99} A place this PDF does not have.'
  const card: Card = { id: 'r', kind: 'related', page: 5, rects: [[5, 0.1, 0.2, 0.5, 0.02]], text: 'Self-attention', turns: [{ role: 'assistant', content: answer }], at: 1 }
  const resolveTag = (t: { kind: string; label: string }) => (t.label === '99' ? null : { page: t.kind === 'sec' ? 6 : Number(t.label), needle: t.kind === 'sec' ? '3.2 Encoder' : '' })

  it('opens as the bottom line (no quote since 19 Oct 2026), then one row per place: its tag on the left and its line', () => {
    const html = M.html.cardHtml(card, { open: true, P, pageLabel: '5', resolve: resolveTag })
    expect(html).toContain('<span class="mr-card__name">Related · p. 5</span>')
    expect(html).not.toContain('mr-quote')
    expect(html).toContain('<span class="is-bottom-line">Self-attention is the thread through the model.</span>')
    expect(html).toContain('<button type="button" class="mr-related__row" data-page="2"><span class="mr-cite mr-related__tag">p. 2</span><span class="mr-related__line">Background sets it against recurrence.</span></button>')
    expect(html).toContain('<button type="button" class="mr-related__row" data-page="6" data-needle="3.2 Encoder"><span class="mr-cite mr-related__tag">sec. 3.2</span>')
    // A place that does not resolve is a row of text, not a button.
    expect(html).toContain('<div class="mr-related__row"><span class="mr-cite mr-related__tag">p. 99</span><span class="mr-related__line">A place this PDF does not have.</span></div>')
    expect(html).toContain('data-c="copy"')
  })

  it('folded, reads "Related · {n} places" and its bottom line', () => {
    const folded = M.html.cardHtml(card, { open: false, P, pageLabel: '5' })
    expect(folded).toBe('<button type="button" class="mr-card__label" data-c="open">Related · 3 places</button><div class="mr-card__text">Self-attention is the thread through the model.</div>')
    const one = { ...card, turns: [{ role: 'assistant', content: 'One thread.\n\n{p. 2} Only here.' }] }
    expect(M.html.cardHtml(one, { open: false, P, pageLabel: '5' })).toContain('>Related · 1 place</button>')
    // Before its answer: the plain label.
    expect(M.html.cardHtml({ ...card, turns: [] }, { open: false, P, pageLabel: '5' })).toContain('>Related · p. 5</button>')
  })

  it('in an EPUB: quoted words for a place, a row that finds them, the chapter in the label', () => {
    const epub = { ...card, page: 2, turns: [{ role: 'assistant', content: 'The vow returns.\n\n“I will not marry” Emma repeats it.\n“nowhere in the book” A place not found.' }] }
    const place = (quote: string) => (quote === 'I will not marry' ? { page: 3 } : null)
    const html = M.html.cardHtml(epub, { open: true, P, pageLabel: '2', where: { unit: 'ch.', doc: 'epub' }, place })
    expect(html).toContain('<span class="mr-card__name">Related · ch. 2</span>')
    expect(html).toContain('<button type="button" class="mr-related__row is-quote" data-page="3" data-quote="I will not marry"><span class="mr-related__quote">“I will not marry”</span> <span class="mr-related__line">Emma repeats it.</span></button>')
    expect(html).toContain('<div class="mr-related__row is-quote"><span class="mr-related__quote">“nowhere in the book”</span> ')
  })

  it('sends the related intent with the passage and its picture, which the Worker reads as a PDF passage action', async () => {
    const sent: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => { sent.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ content: [{ type: 'text', text: 'ok' }] }), { headers: { 'Content-Type': 'application/json' } }) }))
    await A.companion('related', { book: { title: 'T' }, pdf: { pages: [{ n: '12', text: 'Page.' }], at: 0 }, selection: 'Self-attention' })
    vi.unstubAllGlobals()
    const body = sent[0] as { companion: Record<string, unknown>; messages: Array<{ content: string }> }
    expect(body.messages[0].content).toBe('The selected passage.')
    const parsed = parseCompanionRequest(body.companion)!
    expect(parsed.intent).toBe('related')
    expect(parsed.pdf).toBe(true)
    expect(companionTakesPassageImage(parsed)).toBe(true)
  })
})

describe('Quiz me (FIXES-2026-10-15 PR C and the deep test)', () => {
  const questions = [{ q: 'Q one?', answer: 'A', why: '', cite: '' }, { q: 'Q two?', answer: 'B', why: '', cite: '' }, { q: 'Q three?', answer: 'C', why: '', cite: '' }]
  const quiz = (data: Record<string, unknown>): Card => ({ id: 'q', kind: 'quiz', page: 12, rects: [[12, 0, 0, 1, 0.02]], text: 'p', at: 1, data: { questions, i: 0, results: [], ...data } })

  it('leaves "Show answer" questions out of the score and says so: "1 of 2 answered, 1 shown"', () => {
    const results = [{ answer: 'a', verdict: 'right' }, { shown: true }, { answer: 'c', verdict: 'not_yet' }]
    expect(M.quizLine({ questions, results })).toBe('1 of 2 answered, 1 shown')
    expect(M.quizLine({ questions, results: [{ verdict: 'right' }, { verdict: 'right' }, { verdict: 'nearly' }] })).toBe('2 of 3')
    expect(M.quizLine({ questions, results: [{ shown: true }, { shown: true }, { shown: true }] })).toBe('3 of 3 shown')
    const done = M.html.cardHtml(quiz({ i: 2, done: true, results }), { open: true, P, pageLabel: '12' })
    expect(done).toContain('<span class="is-bottom-line">1 of 2 answered, 1 shown</span>')
    expect(done).toContain('data-c="again">Try another quiz</button>')
    expect(M.html.foldText(quiz({ i: 2, done: true, results }), P)).toBe('1 of 2 answered, 1 shown')
  })

  it('the last question\'s link is "See your score"; the others "Next question"', () => {
    const marked = { answer: 'a', verdict: 'right', feedback: 'Yes.' }
    expect(M.html.cardHtml(quiz({ i: 0, results: [marked] }), { open: true, P, pageLabel: '12' })).toContain('data-c="next">Next question →</button>')
    const last = M.html.cardHtml(quiz({ i: 2, results: [marked, marked, marked] }), { open: true, P, pageLabel: '12' })
    expect(last).toContain('data-c="next">See your score →</button>')
    expect(last).not.toContain('Next question')
  })

  it('a marking that failed shows its error with the answer field still there', () => {
    const failed = M.html.cardHtml(quiz({}), { open: true, P, pageLabel: '12', status: 'The answer could not be loaded. Try again.' })
    expect(failed).toContain('<p class="mr-status" role="status">The answer could not be loaded. Try again.</p>')
    expect(failed).toContain('class="mr-follow__input"')
    expect(failed).toContain('data-c="show">Show answer</button>')
    expect(M.QUIZ_ANSWER_CHARS).toBe(2000)
  })
})

describe('answers in plain prose', () => {
  it('shows a stray *word* in italics and never a star; leaves lone stars and products alone', () => {
    const html = M.html.answerHtml('It is *not* the same. A *long phrase here* too.\n\nThen 2*3 and a note*.', P)
    expect(html).toContain('It is <em>not</em> the same.')
    expect(html).toContain('A <em>long phrase here</em> too.')
    expect(html).toContain('Then 2*3 and a note*.')
    const folded = M.html.foldText({ id: 'e', kind: 'explain', page: 1, rects: [], text: '', at: 1, turns: [{ role: 'assistant', content: 'It is *not* the same.' }] }, P)
    expect(folded).toBe('It is not the same.')
  })
})

describe('Copy quote and the margin\'s words for an EPUB', () => {
  it('Copy quote names the printed page label, or an EPUB\'s chapter', () => {
    expect(M.copyQuote({ text: ' The  passage. ', title: 'Kittel', page: 'xii' })).toBe('“The passage.”\n— Kittel, p. xii')
    expect(M.copyQuote({ text: 'Words.', title: 'Emma', page: '3', place: 'ch. 3' })).toBe('“Words.”\n— Emma, ch. 3')
  })

  it('names chapters and "the whole book" for an EPUB; a PDF keeps pages and "the whole PDF"', () => {
    const card: Card = { id: 'c', kind: 'explain', page: 3, rects: [[3, 0, 0, 1, 0.02]], text: 't', at: 1 }
    expect(M.html.cardLabel(card, '3', { unit: 'ch.', doc: 'epub' })).toBe('Explain · ch. 3')
    expect(M.html.cardLabel(card, '3')).toBe('Explain · p. 3')
    expect(M.html.cardLabel({ ...card, kind: 'whole' }, '3', { doc: 'epub' })).toBe('Whole book')
    expect(M.html.stackHtml([{ kind: 'note' }], Infinity, { doc: 'epub' })).toBe('<span>1 more in this chapter</span><span>Your note</span>')
    // No foot line since 15 Oct (Anders): the whole file's conversation is Chat, which still names the file in its field's label.
    expect(M.html).not.toHaveProperty('footHtml')
    expect(M.html.wholeHtml('', { doc: 'epub' })).toContain('<span class="mr-card__name">Chat</span>')
    expect(M.html.wholeHtml('', { doc: 'epub' })).toContain('aria-label="Ask about the whole book"')
    expect(M.html.wholeHtml('')).toContain('aria-label="Ask about the whole PDF"')
  })

  it('an EPUB\'s requests say kind "epub": the Worker reads them as the PDF reader\'s, with chapters and no picture', async () => {
    const sent: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => { sent.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ content: [{ type: 'text', text: 'ok' }] }), { headers: { 'Content-Type': 'application/json' } }) }))
    const document = { kind: 'epub', units: [{ n: 1, text: 'Chapter one.' }, { n: 2, text: 'Chapter two.' }] }
    await A.companion('counterpoint', { book: { title: 'Emma' }, pdf: { pages: [{ n: '2', text: 'Chapter two.' }], at: 0, kind: 'epub' }, selection: 'two', document })
    vi.unstubAllGlobals()
    const companion = (sent[0] as { companion: Record<string, unknown> }).companion
    expect((companion.context as { kind: string }).kind).toBe('epub')
    expect((companion.document as { kind: string }).kind).toBe('epub')
    const parsed = parseCompanionRequest(companion)!
    expect(parsed.pdf).toBe(true)
    expect(parsed.epub).toBe(true)
    expect(parsed.document?.kind).toBe('epub')
    expect(companionTakesPassageImage(parsed)).toBe(false)
  })
})

// Anders, 15 Oct: "Keep it pdf for now"; 19 Oct 2026: EPUBs open in Margin view on the desktop (TinctReaderLayout.epubView).
describe('the EPUB margin switch', () => {
  it('is on, on the desktop only, and marginOn() consults it: an EPUB at a phone\'s width keeps the popup and the docked chat', () => {
    const reader = readFileSync(ROOT + 'app/public/lab/addbook/js/reader.js', 'utf8')
    expect(reader).toContain('const EPUB_MARGIN = true;')
    expect(reader).toContain("const marginOn = () => hasBook() && (state.kind === 'pdf' || (state.kind === 'epub' && epubMargin()));")
    expect(reader).toContain("const epubMargin = () => (EPUB_MARGIN && innerWidth >= 700) || window.TinctEpubMargin === true;")
    // The mirror ships the same switch.
    expect(readFileSync(ROOT + 'addbooks/web/src/js/reader.js', 'utf8')).toContain('const EPUB_MARGIN = true;')
  })
})

afterEach(() => { vi.unstubAllGlobals() })
