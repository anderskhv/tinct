/**
 * The margin polish after Anders's hands-on test (15 Oct 2026, screenshots 133–141): no whole-PDF
 * line at the column's foot (Chat instead), no blinking caret, the highlighter and pencil in the bar,
 * delete on every card with Undo, the answer rules and retrieval, one scroll surface, and Before you
 * start opening in place. Pure rules from js/margin.js, the reader's wiring read from its source, the
 * stylesheet's rules and the requests tinct-api.js sends (fetch mocked: no network, no AI).
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildCompanionSystem, parseCompanionRequest } from './companion/companionRequest'
import { GENERAL_KNOWLEDGE_RULE, MARGIN_RULES, formatMarginDocument, parseMarginDocument } from './companion/marginContext'
import { MARGIN_ANSWER_RULES, NO_META_RULE } from './companion/marginPrompts'
import { readMarks } from './worker/routes/userBooks'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
const read = (path: string) => readFileSync(ROOT + path, 'utf8')
type Card = { id: string; kind: string; page: number; rects: number[][]; text: string; at: number; u?: number; turns?: Array<{ role: string; content: string }>; data?: Record<string, unknown>; mark?: string; note?: string }
type Mark = { id: string; page: number; rects: number[][]; text: string; color: string; at: number; u?: number; note?: string; withNote?: boolean; gone?: boolean }
interface MarginApi {
  KINDS: Record<string, string>
  PRIMER: { top: number; bottom: number }
  html: Record<string, unknown> & {
    barHtml(state: string, o: Record<string, unknown>): string
    defineHtml(d: Record<string, unknown>, o: Record<string, unknown>): string
    cardHtml(card: Card, o: Record<string, unknown>): string
    followHtml(o?: Record<string, unknown>): string
    wholeHtml(body: string, o?: Record<string, unknown>): string
  }
  deletePlan(card: Card, marks: Mark[]): { card: string | null; removeMarks: string[]; clearNote: string | null }
  mergeCards(...sets: Array<Array<Record<string, unknown>>>): Array<Record<string, unknown>>
  tombstone(id: string, at?: number): Record<string, unknown>
  chapterRefs(q: string): Array<{ kind: string; n: string }>
  namedUnits(q: string, entries: Array<{ title: string; page: number }>): Array<{ title: string; page: number; kind: string; n: string }>
  withoutRefs(q: string): string
  primerBox(from: { top: number; height: number } | null, columnHeight: number, o?: Record<string, unknown>): { start: { top: number; height: number } | null; top: number; height: number }
}
interface SearchApi { create(): { add(page: number, text: string): void; search(q: string, o?: Record<string, unknown>): Array<{ page: number; text: string }> } }
interface Api { ask(input: unknown, o: Record<string, unknown>): Promise<{ text: string }> }
let M: MarginApi, S: SearchApi, A: Api, P: Record<string, unknown>
const COLORS = [['gold', 'Gold', '', '#e2c26b'], ['sky', 'Sky', '', '#9cc3d9']]
const reader = read('app/public/lab/addbook/js/reader.js')
const css = read('app/public/lab/addbook/css/margin.css')
beforeAll(async () => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  require(ROOT + 'app/public/lab/addbook/js/doc-search.js')
  require(ROOT + 'app/public/lab/addbook/js/tinct-api.js')
  const g = globalThis as unknown as { TinctMargin: MarginApi; TinctDocSearch: SearchApi; TinctAI: Api }
  M = g.TinctMargin; S = g.TinctDocSearch; A = g.TinctAI
  P = await import(ROOT + 'app/public/lab/margin/margin-parse.js')
})
const card = (kind: string, extra: Partial<Card> = {}): Card => ({ id: 'c1', kind, page: 3, rects: [[3, 0.1, 0.2, 0.6, 0.02]], text: 'The passage.', at: 1000, turns: [{ role: 'assistant', content: 'The answer. More.' }], ...extra })

describe('1. No whole-PDF line at the margin\'s foot: Chat instead', () => {
  it('the margin draws no foot, no "/ the whole PDF" field and no foot mic', () => {
    expect(M.html).not.toHaveProperty('footHtml')
    expect(reader).not.toMatch(/mr-foot(?!-height)|footHtml|col\.foot/)
    // (The reference block keeps its own .mr-foot rules, unused; the reader's additions have none.)
    expect(css.slice(css.indexOf('/* ---------- PDF reader additions'))).not.toMatch(/\.mr-foot\b/)
  })
  it('the conversation about the whole file is the margin\'s Chat card, its field naming the file', () => {
    const html = M.html.wholeHtml('<p>x</p>')
    expect(html).toContain('<span class="mr-card__name">Chat</span>')
    expect(html).toContain('aria-label="Ask about the whole PDF"')
    expect(M.KINDS.chat).toBe('Chat')
  })
  it('"/" opens Chat; the t menu\'s Chat is the same card, and it shows even before its first question', () => {
    expect(reader).toMatch(/if \(e\.key === '\/' [^\n]*\n[^\n]*\n\s*e\.preventDefault\(\);\n\s*openWhole\(\);/)
    expect(reader).toContain("if (marginOn()) return openWhole(opts);")
    // Open (even before a first question), its own panel; folded with a thread, at the document's top (19 Oct 2026).
    expect(reader).toContain("if (col.open === 'whole') { const el = take('whole', col.el); drawWhole(el); el.style.top = '0px' }")
    expect(reader).toContain("else if (chat.turns.length || chat.live) { const el = take('whole'); drawWhole(el);")
  })
  it('Chat and the old whole-PDF card are one store (chat:{key}): every existing thread shows in Chat', () => {
    expect(reader).toMatch(/function loadTurns\(\) \{ chat\.turns = \(store\.get\('chat:' \+ state\.key\)/)
    expect(reader).toMatch(/function openWhole\(opts = \{\}\) \{\n\s*loadTurns\(\);/)
    expect(reader).toMatch(/function wholeTurns\(\) \{\n\s*const turns = chat\.turns\.map/)
  })
  it('Chat on a PDF sends the whole document, the long file\'s search passages and the whole-PDF rules (scope "whole")', async () => {
    expect(reader).toContain("const wholeDoc = marginOn() ? await marginDocumentNow(focusPage, 'whole') : null;")
    expect(reader).toContain('const found = wholeDoc ? await searchPassages(question, wholeDoc) : null;')
    expect(reader).toMatch(/pdf, document: wholeDoc, passages: found, whole: !!pdf,/)
    const sent: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => { sent.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ content: [{ type: 'text', text: 'MOCK.' }] }), { headers: { 'Content-Type': 'application/json' } }) }))
    const pdf = { pages: [{ n: '4', text: 'Page four.' }], at: 0 }
    const document = { kind: 'pdf', units: [{ n: '4', text: 'Page four.' }], part: { toc: [{ title: '7 Codes for Integers', n: '144' }], total: 640 } }
    await A.ask([{ role: 'user', content: 'rules' }, { role: 'user', content: 'What do chapters 7 and 10 say?' }], { book: { title: 'ITILA', pdf }, pdf, document, passages: [{ n: '144', text: 'Chapter 7 opens.' }], whole: true })
    const companion = sent[0].companion as Record<string, unknown>
    expect(companion.scope).toBe('whole')
    expect(companion.document).toMatchObject({ kind: 'pdf', part: { total: 640 } })
    expect(companion.passages).toEqual([{ n: '144', text: 'Chapter 7 opens.' }])
    const parsed = parseCompanionRequest(companion)!
    expect(parsed.whole).toBe(true)
    vi.unstubAllGlobals()
  })
})

describe('2. The caret', () => {
  it('no field draws a caret of its own: a field shows its caret only when focused', () => {
    expect(M.html.followHtml()).not.toContain('mr-caret')
    expect(M.html.cardHtml(card('explain'), { open: true, P })).not.toContain('mr-caret')
    expect(M.html.wholeHtml('')).not.toContain('mr-caret')
    expect(css).toMatch(/\.mr-follow__input \{[^}]*caret-color: var\(--mr-accent\);/)
    expect(css).not.toMatch(/\.mr-follow__field \.mr-caret \{[^}]*animation/)
  })
  // (21 Oct 2026: in the bar's own ink, 1px by 13px, a slow soft pulse; before, a 1.5px accent line with a full blink.)
  it('the type-to-ask hint after "Ask" is thin, in the bar\'s ink, with a soft pulse, and still with reduced motion', () => {
    expect(M.html.barHtml('menu', { colors: COLORS, current: 'gold' })).toContain('<span class="mr-bar__caret" aria-hidden="true"></span>')
    expect(css).toMatch(/\.mr-bar__caret \{ width: 1\.5px;/)
    expect(css).toMatch(/\.mr-bar__caret \{ display: inline-block; width: 1px; height: 13px; border-radius: 1px; background: var\(--mr-bar-ink\); opacity: \.7; animation: mr-blink-soft 2\.4s ease-in-out infinite; \}/)
    expect(css).toContain('@media (prefers-reduced-motion: reduce) { .mr-bar__caret { animation: none; } }')
    expect(css).toMatch(/@keyframes mr-blink-soft \{ 0%, 55% \{ opacity: \.7 \} 75%, 90% \{ opacity: \.3 \}/)
  })
})

describe('3. The highlighter and the pencil in the selection bar', () => {
  it('the highlight button is a highlighter with the current colour as a small dot; the note is a pencil', () => {
    const bar = M.html.barHtml('menu', { colors: COLORS, current: 'sky' })
    expect(bar).toMatch(/<button type="button" class="mr-bar__item is-hl" data-m="dot" aria-label="Highlight in Sky"><span class="mr-hl"><svg [^>]*>.*<\/svg><span class="mr-dot" style="--hl-current:#9cc3d9"><\/span><\/span><\/button>/)
    const note = /data-m="note" aria-label="Add note">(<svg.*?<\/svg>)/.exec(bar)![1]
    expect(note).toContain('M11.6 3.4l2.9 2.9-7.6 7.6-3.6.8.8-3.6z')
    // Not the old document icon.
    expect(bar).not.toContain('M4 2.8h7.2L14.5 6v9.2H4z')
    // The Define card's foot has the same pair.
    expect(M.html.defineHtml({ word: 'w', senses: [] }, { colors: COLORS, current: 'gold' })).toContain('class="mr-hl"')
  })
  it('both are drawn in the icons\' stroke (margin-reference.css: no fill, 1.6 stroke, round caps); the dot sits small at the pen\'s foot', () => {
    expect(css).toMatch(/\.mr-bar svg \{ width: 16px; height: 16px; fill: none; stroke: var\(--mr-bar-soft\); stroke-width: 1\.6; stroke-linecap: round; stroke-linejoin: round; \}/)
    expect(css).toMatch(/\.mr-hl \.mr-dot \{ position: absolute; right: -1px; bottom: 0; width: 7px; height: 7px;/)
  })
})

describe('4. Delete on every margin item', () => {
  const kinds = ['explain', 'simplify', 'define', 'factcheck', 'counterpoint', 'related', 'quiz', 'ask', 'figure']
  it('every card has a bin, in its head beside Minimise (21 Oct 2026: the same on every card), never in the follow-up line; open on desktop and on the phone', () => {
    for (const kind of kinds) {
      const c = card(kind, kind === 'quiz' ? { turns: [], data: { questions: [{ q: 'Q?', answer: 'A', why: '', cite: '' }], i: 0, results: [] } } : kind === 'define' ? { turns: [], data: { word: 'w', senses: [{ text: 'A sense.' }] } } : {})
      const html = M.html.cardHtml(c, { open: true, P })
      expect(html, kind).toMatch(/^<div class="mr-card__label">(?:(?!<\/div>).)*<button type="button" class="mr-card__delete" data-c="delete" aria-label="Delete">/)
      expect(html, kind).not.toMatch(/<div class="mr-card__acts">(?:(?!<\/div>).)*mr-card__delete/)
      expect(html, kind).not.toMatch(/<div class="mr-follow[^"]*">.*mr-card__delete/)
    }
    const note = M.html.cardHtml({ id: 'n-m1', kind: 'note', mark: 'm1', page: 3, rects: [[3, 0, 0, 1, 0.02]], text: 'T', note: 'My note.', at: 1 }, { open: true, P })
    expect(note).toContain('<button type="button" class="mr-card__copy" data-c="copy" aria-label="Copy">')
    expect(note).toContain('data-c="delete" aria-label="Delete note"')
    // While an answer streams there is nothing to copy yet: no action row; delete is in the head.
    const streaming = M.html.cardHtml(card('explain', { turns: [] }), { open: true, P, live: 'Partial' })
    expect(streaming).not.toContain('mr-card__copy')
    expect(streaming).not.toContain('mr-card__acts')
    expect(streaming).toMatch(/^<div class="mr-card__label">(?:(?!<\/div>).)*<button type="button" class="mr-card__delete" data-c="delete"/)
    expect(streaming).not.toMatch(/<div class="mr-follow[^"]*">.*mr-card__delete/)
    // The phone's card hides copy only.
    expect(css).toContain('.mr-sheet .mr-card__copy { display: none; }')
    expect(css).not.toContain('.mr-sheet .mr-card__acts { display: none; }')
  })
  it('a card goes as a tombstone that wins on the other device; Undo puts it back, newer again', () => {
    const c = card('explain', { u: 1000 })
    const gone = M.tombstone('c1', 2000)
    expect(M.mergeCards([c], [gone])).toEqual([gone])
    const back = { ...c, u: 3000 }
    expect(M.mergeCards([gone], [back])).toEqual([back])
  })
  it('a highlight goes with the card only when it was made after it, never one that predates it or carries its own note', () => {
    const later: Mark = { id: 'h2', page: 3, rects: [[0.1, 0.2, 0.6, 0.02]], text: 't', color: 'gold', at: 1500 }
    const earlier: Mark = { ...later, id: 'h1', at: 900 }
    const noted: Mark = { ...later, id: 'h3', note: 'Mine.' }
    const elsewhere: Mark = { ...later, id: 'h4', page: 4 }
    expect(M.deletePlan(card('explain'), [later, earlier, noted, elsewhere])).toEqual({ card: 'c1', removeMarks: ['h2'], clearNote: null })
  })
  it('a note: its note goes; its highlight too when the note made it, else the highlight stays', () => {
    const made: Mark = { id: 'm1', page: 3, rects: [[0, 0, 1, 0.02]], text: 't', color: 'gold', at: 1, note: 'N', withNote: true }
    const own: Mark = { ...made, withNote: undefined }
    const n = { id: 'n-m1', kind: 'note', mark: 'm1', page: 3, rects: [[3, 0, 0, 1, 0.02]], text: 't', at: 1 }
    expect(M.deletePlan(n, [made])).toEqual({ card: null, removeMarks: ['m1'], clearNote: null })
    expect(M.deletePlan(n, [own])).toEqual({ card: null, removeMarks: [], clearNote: 'm1' })
  })
  it('the account keeps the note\'s flag with the highlight (and only with a note)', () => {
    const base = { id: 'abcd1234', page: 2, rects: [[0, 0, 1, 0.1]], text: 't', color: 'gold', at: 5 }
    expect(readMarks([{ ...base, note: 'N', withNote: true }])).toEqual([{ ...base, note: 'N', withNote: true }])
    expect(readMarks([{ ...base, withNote: true }])).toEqual([base])
    expect(readMarks([{ ...base, withNote: 'yes' }])).toBeNull()
  })
  it('the reader: no confirm, the action aborted, the card a tombstone through the card sync, "Deleted · Undo" for a few seconds', () => {
    expect(reader).toContain("if (c === 'delete') return deleteCard(id);")
    expect(reader).toMatch(/store\.set\('cards:' \+ state\.key, keptCards\(\)\.map\(c => \(c\.id === id \? TinctMargin\.tombstone\(id\) : c\)\)\); cardsSync\.changed\(\)/)
    expect(reader).toContain("'<span>Deleted</span><span aria-hidden=\"true\">·</span><button type=\"button\" data-u=\"undo\">Undo</button>'")
    expect(reader).toContain('const UNDO_MS = 6000;')
    expect(reader).not.toMatch(/confirm\(/)
    // A note made by its own highlight says so, for delete.
    expect(reader).toContain('if (!h.note && mr.noteMade) h.withNote = true')
  })
})

describe('5. The whole-PDF answer', () => {
  it('a selected answer is painted as a selection in the margin, never as the app\'s gold highlight', () => {
    expect(css).toContain('.mr ::selection, .mr::selection { background: var(--mr-sel); color: inherit; }')
  })
  it('Chat beside the pages is capped below the column and folds when the reader moves on', () => {
    expect(css).toMatch(/\.mr-col\.is-reader \.mr-card\.is-whole\.is-open \{ max-height: min\([^;]*calc\(var\(--mr-col-height\) \* \.6\)\); \}/)
    expect(reader).toMatch(/function wholeMovedOn\(\) \{[\s\S]*?return placePage\(\) !== col\.whole\.page;\n\}/)
    expect(reader).toContain('if (wholeMovedOn()) col.open = null;')
  })
  it('names the chapters, sections, parts and appendices a question asks about', () => {
    expect(M.chapterRefs('What do chapters 7 and 10 say?')).toEqual([{ kind: 'chapter', n: '7' }, { kind: 'chapter', n: '10' }])
    expect(M.chapterRefs('Compare section 3.2, Part II and appendix A')).toEqual([{ kind: 'section', n: '3.2' }, { kind: 'part', n: 'ii' }, { kind: 'appendix', n: 'a' }])
    expect(M.chapterRefs('What is the chapter about? Explain ch. 4')).toEqual([{ kind: 'chapter', n: '4' }])
    expect(M.chapterRefs('Where is Sarsa introduced?')).toEqual([])
    expect(M.withoutRefs('What do chapters 7 and 10 say?')).toBe('What do say?')
  })
  it('finds them in the contents: "chapter 7" is "7 …" or "Chapter 7 …", never "7.1 …"', () => {
    const toc = [{ title: 'Preface', page: 3 }, { title: '7.1 The trouble', page: 145 }, { title: '7 Codes for Integers', page: 144 }, { title: 'Chapter 10: The Noisy-Channel Coding Theorem', page: 174 }, { title: '10.4 Proof of the theorem', page: 180 }, { title: 'Part II Noisy-Channel Coding', page: 150 }]
    expect(M.namedUnits('What do chapters 7 and 10 say?', toc).map(u => [u.title, u.page])).toEqual([['7 Codes for Integers', 144], ['Chapter 10: The Noisy-Channel Coding Theorem', 174]])
    expect(M.namedUnits('and section 10.4 and part II?', toc).map(u => u.page)).toEqual([180, 150])
    expect(M.namedUnits('chapter 12', toc)).toEqual([])
  })
  it('a named chapter\'s opening text goes first in the passages; the search then looks with the chapter titles', () => {
    expect(reader).toContain('const named = TinctMargin.namedUnits(question, contentsEntries()).filter(u => u.page < doc.range.from || u.page > doc.range.to).slice(0, 3);')
    expect(reader).toContain('const all = [...opening, ...found].slice(0, 6);')
    // "What do chapters 7 and 10 say?" has no searchable words once the references are gone; the titles give them.
    const index = S.create()
    index.add(144, '7 Codes for Integers. Codes for integers encode a positive integer as a self-delimiting binary string.')
    index.add(200, 'An unrelated page on Gaussian channels and noise.')
    index.add(5, 'Chapter 7 and chapter 10 are mentioned in the preface.')
    expect(index.search(M.withoutRefs('What do chapters 7 and 10 say?'), { limit: 3 })).toEqual([])
    expect(index.search('What do say? 7 Codes for Integers', { limit: 1, skip: new Set([5]) })[0].page).toBe(144)
  })
})

describe('5. The answer never talks about what it was given (server, PDF reader only)', () => {
  const bookContext = { bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1, editionLabel: 'Butler', paragraphs: ['Tell me, O muse.', 'Athena spoke.'], paragraphIndex: 1, bookId: 'odyssey', editionKey: 'original-en' }
  const pdfContext = { kind: 'pdf', bookTitle: 'ITILA', bookAuthor: 'MacKay', chapterLabel: 'Page 4', pages: [{ n: 4, text: 'Page four.' }], paragraphIndex: 0, pageNumber: 4, totalPages: 640 }
  it('is a shared margin rule, word for word as Anders gave it, in every margin prompt and in PROMPTS.md', () => {
    // 30 Oct 2026 (Anders): answers no longer narrate where a point comes from.
    expect(NO_META_RULE).toMatch(/^Never mention what text you were or were not given, or what the page or document does or does not show, and never label where a point comes from/)
    expect(NO_META_RULE).not.toContain('say "from general knowledge" when you go beyond it')
    expect(MARGIN_ANSWER_RULES).toContain(NO_META_RULE)
    expect(MARGIN_RULES).toContain(NO_META_RULE)
    expect(read('docs/margin/PROMPTS.md')).toContain(NO_META_RULE)
    for (const intent of ['ask', 'explain', 'simplify']) expect(buildCompanionSystem(parseCompanionRequest({ intent, context: pdfContext, selection: 'x', ...(intent === 'ask' ? { scope: 'whole' } : {}) })!), intent).toContain(NO_META_RULE)
  })
  it('the book reader\'s prompts are unchanged: no such rule there', () => {
    for (const intent of ['ask', 'explain']) expect(buildCompanionSystem(parseCompanionRequest({ intent, context: bookContext, selection: 'Athena spoke.' })!), intent).not.toContain(NO_META_RULE)
  })
  it('a long file\'s header keeps the general-knowledge rule and no longer asks to say what is "not supplied"', () => {
    const doc = parseMarginDocument({ kind: 'pdf', units: [{ n: '4', text: 'Page four.' }], part: { toc: [{ title: '7 Codes for Integers', n: '144' }], total: 640 } })!
    const text = formatMarginDocument(doc)
    expect(text).toContain(GENERAL_KNOWLEDGE_RULE)
    expect(text).not.toMatch(/not supplied/)
  })
})

describe('6. One scroll surface, the scrollbar at the window\'s right edge', () => {
  it('with the column the pages\' scroller runs to the window\'s edge; the pages keep left of the column\'s room', () => {
    expect(css).toContain('.lab.byob.margin-open .pdf-scroll { right: 0; }')
    expect(css).toContain('.lab.byob.margin-open .pdf-column { margin-right: calc(var(--dock-w) + 14px); }')
    expect(css).toContain('.mr-col.is-reader { pointer-events: none; }')
    expect(css).toContain('.mr-col.is-reader > * { pointer-events: auto; }')
  })
  it('the page area\'s width leaves out the column\'s room everywhere it is measured; the wheel over a card scrolls the pages', () => {
    expect(reader).toContain("const pagesWidth = () => $('scroll').clientWidth - (root.classList.contains('margin-open') ? parseFloat(getComputedStyle($('column')).marginRight) || 0 : 0);")
    expect(reader).not.toMatch(/sr\.left \+ \$\('scroll'\)\.clientWidth/)
    expect(reader).toMatch(/el\.addEventListener\('wheel', e => \{[\s\S]*?\$\('scroll'\)\.scrollBy\(/)
  })
})

describe('7. Before you start opens in place', () => {
  it('starts at its trigger and grows down to 70px above the column\'s foot; never jumps up', () => {
    const box = M.primerBox({ top: 300, height: 46 }, 800)
    expect(box.start).toEqual({ top: 286, height: 60 })
    expect(box.top).toBe(286)
    expect(box.top + box.height).toBe(800 - M.PRIMER.bottom)
  })
  it('a trigger low in the column: the primer starts as little higher as gives it room, never above 16px', () => {
    const box = M.primerBox({ top: 700, height: 46 }, 800)
    expect(box.top).toBe(800 - 70 - 360)
    expect(M.primerBox({ top: 700, height: 46 }, 420).top).toBe(M.PRIMER.top)
    expect(M.primerBox({ top: 4, height: 46 }, 800).top).toBe(0)
  })
  it('without a trigger (B on another page) it opens where it always did', () => {
    expect(M.primerBox(null, 800)).toEqual({ start: null, top: 16, height: 800 - 70 - 16 })
  })
  // Since 19 Oct 2026, night, its trigger on the wide column is the Primer of its unit's start mark (level with the
  // unit's heading): it opens under the mark.
  // (Since 21 Oct 2026 the unit's pills sit beside its heading on the page: the primer opens in the column level with it.)
  it('in the column it is part of the page (19 Oct 2026): level with its unit\'s heading, growing in place, no easing or scrolling of its own', () => {
    expect(reader).toContain('const ey = Y(pr.top + at.head.y * pr.height);')
    expect(reader).toContain('else headPills(u, p, at, seenHeads)')
    expect(reader).toContain('items.push({ el: pe, ey, top: ey, order: -0.9 });')
    expect(reader).not.toMatch(/is-growing|is-opening|primerInColumn/)
    expect(css).not.toMatch(/\.mr-primer\.is-(?:opening|growing)/)
    expect(css).toContain('.mr-col.mr-doc .mr-primer { position: absolute; left: 0; right: 0; bottom: auto; height: auto; overflow: visible; }')
  })
})

afterEach(() => { vi.unstubAllGlobals() })
