/**
 * Anders's feedback of 19 Oct 2026 on the PDF reader's margin, the parts that are pure rules or requests:
 * Before you start made ahead (sent as speculative, never falling back to the guest allowance), a chat
 * reply shown as written (never stripped as an Explain opening, never bolded; the exact reply he saw),
 * and a bottom line that does not end inside parentheses. The page's behaviour is in
 * scripts/margin-check.mjs (primer-anchor, wait-dots, chat-scroll, highlight-place). fetch is mocked.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { companionAllowance, parseCompanionRequest } from './companion/companionRequest'
import * as TS from './companion/marginParse'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Card = { id: string; kind: string; page: number; rects: number[][]; text: string; at: number; turns?: Array<{ role: string; content: string }> }
interface MarginApi { html: { cardHtml(card: Card, o: Record<string, unknown>): string; threadHtml(rows: unknown[], turns: unknown[], o: Record<string, unknown>): string } }
interface Api { companion(intent: string, o: Record<string, unknown>): Promise<{ text: string }> }
let M: MarginApi, A: Api, JS: typeof TS
beforeAll(async () => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  require(ROOT + 'app/public/lab/addbook/js/tinct-api.js')
  const g = globalThis as unknown as { TinctMargin: MarginApi; TinctAI: Api }
  M = g.TinctMargin; A = g.TinctAI
  JS = await import(ROOT + 'app/public/lab/margin/margin-parse.js')
})

// The reply as the model wrote it, and as the card once showed it ("It you've highlighted ends…", bold to the quote).
const HUME = 'The sentence you\'ve highlighted ends the reply to Hume, and the one that follows ("Nor does the argument...by Russell 1913...") begins the reply to a second objection.'
const REPLY = HUME + ' That objection is about the form of the laws.\n\nSo the passage is not free of causal talk; it says where such talk belongs.'

for (const [name, P] of [['src/companion/marginParse.ts', () => TS], ['public/lab/margin/margin-parse.js', () => JS]] as const) {
  describe(`8. the selection-description cleanup (${name})`, () => {
    it('never touches a sentence where the selection is the subject of a real claim (the exact reply of 19 Oct)', () => {
      expect(P().withoutSelectionTalk(HUME)).toBe(HUME)
      expect(P().withoutTemplateTalk(REPLY)).toBe(REPLY)
      for (const text of ['The highlighted passage ends the first part.', 'The sentence you highlighted begins a new argument.', 'The selected line contains the key equation {p. 3}.']) expect(P().withoutTemplateTalk(text)).toBe(text)
    })
    it('still rewrites a sentence that only describes the selection', () => {
      expect(P().withoutTemplateTalk('The selected passage says that the drive flips some bits. The noise level is f.')).toBe('The drive flips some bits. The noise level is f.')
      expect(P().withoutTemplateTalk('The selected sentence describes a problem at the start of training.')).toBe('It describes a problem at the start of training.')
      expect(P().withoutTemplateTalk('The sentence you\'ve highlighted says that causation is a fiction in fundamental physics.')).toBe('Causation is a fiction in fundamental physics.')
      expect(P().withoutTemplateTalk('The passage explains why the laws need no causes.')).toBe('It explains why the laws need no causes.')
    })
    it('a bottom line never ends inside parentheses that open mid-sentence; one that opens the sentence ends with it', () => {
      expect(P().splitBottomLine(REPLY).lead).toBe(HUME)
      expect(P().splitBottomLine('(An aside.) The point follows.').lead).toBe('(An aside.)')
      expect(P().splitBottomLine('It holds (see p. 4). Next.').lead).toBe('It holds (see p. 4).')
      // A parenthesis never closed gives back the first end inside it.
      expect(P().splitBottomLine('It holds (as said. Then more.').lead).toBe('It holds (as said.')
    })
  })
}

describe('8. a chat reply is shown as written: plain paragraphs, never an Explain opening', () => {
  let P: unknown
  beforeAll(() => { P = JS })
  const card = (turns: Card['turns']): Card => ({ id: 'c1', kind: 'explain', page: 3, rects: [[3, 0.1, 0.2, 0.6, 0.02]], text: 'So Hume\'s argument does not apply.', at: 1000, turns })
  it('an Explain card: its own answer keeps the bold bottom line; a follow-up\'s reply is plain and unstripped', () => {
    const html = M.html.cardHtml(card([{ role: 'assistant', content: 'The selected passage says that Hume\'s objection fails here. More.' }, { role: 'user', content: 'Explain this more.' }, { role: 'assistant', content: REPLY }]), { open: true, P })
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
    const answers = doc.querySelectorAll('.mr-answer')
    expect(answers[0].querySelector('.is-bottom-line')?.textContent).toBe('Hume\'s objection fails here.')
    expect(answers[1].querySelectorAll('.is-bottom-line, strong, b')).toHaveLength(0)
    expect(answers[1].textContent).toContain(HUME)
    expect(answers[1].querySelectorAll('p')).toHaveLength(2)
    expect(doc.querySelector('.mr-you')?.getAttribute('data-turn')).toBe('1')
  })
  it('Chat: every reply is plain paragraphs; the question carries its turn for holding it near the top', () => {
    const turns = [{ role: 'user', text: 'Explain this more', quote: 'So Hume\'s argument does not apply.' }, { role: 'assistant', text: REPLY }]
    const html = M.html.threadHtml([{ type: 'turn', index: 0 }, { type: 'turn', index: 1 }], turns, { P })
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
    expect(doc.querySelectorAll('.is-bottom-line')).toHaveLength(0)
    expect(doc.querySelector('.mr-answer')?.textContent).toContain(HUME)
    expect([...doc.querySelectorAll('[data-turn="0"]')].map(n => n.className)).toEqual(['mr-quote', 'mr-you'])
  })
})

describe('2. Before you start made ahead: the request (fetch mocked)', () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })
  const pdf = { pages: [{ n: 1, text: 'The first page of the paper.' }], at: 0 }
  const book = { title: 'Constructor Theory', author: 'David Deutsch', page: 1, pages: 30 }
  const chapter = { action: { kind: 'primer', unitKey: 'all', unitTitle: 'Constructor Theory' } }
  const signIn = () => localStorage.setItem('sb-local-auth-token', JSON.stringify({ access_token: 't', expires_at: Math.floor(Date.now() / 1000) + 3600 }))
  it('goes as speculative, which the Worker reads as never charged; opened by the reader, it does not', async () => {
    const sent: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => { sent.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ content: [{ type: 'text', text: '{}' }] }), { headers: { 'Content-Type': 'application/json' } }) }))
    await A.companion('chapter', { book, pdf, chapter, speculative: true, retry: false })
    await A.companion('chapter', { book, pdf, chapter, retry: false })
    const [ahead, opened] = sent.map(b => b.companion as Record<string, unknown>)
    expect(ahead.speculative).toBe(true)
    expect(opened.speculative).toBeUndefined()
    expect(companionAllowance(parseCompanionRequest(ahead)!)).toBe('free')
    expect(companionAllowance(parseCompanionRequest(opened)!)).toBe('chat')
  })
  it('an expired sign-in never falls back to the guest allowance for it: nothing is made', async () => {
    signIn()
    const urls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string) => { urls.push(url); return new Response('{}', { status: 401 }) }))
    const e = await A.companion('chapter', { book, pdf, chapter, speculative: true, retry: false }).catch(x => x)
    expect(e.code).toBe('session_expired')
    expect(urls).toEqual(['/api/chat'])
  })
  it('the reader makes it ahead once per open, signed in only, never when kept here or with the book (reader.js)', () => {
    const reader = readFileSync(ROOT + 'app/public/lab/addbook/js/reader.js', 'utf8')
    const fn = reader.slice(reader.indexOf('function primerPrefetch() {'), reader.indexOf('/** The primer for `unit`'))
    expect(fn).toContain("if (state.kind !== 'pdf' || !primer.units || !primerHasText() || !window.TinctAI?.session?.().token) return;")
    expect(fn).toContain('if (primerAhead.key === open) return;')
    expect(fn).toContain('if (store.get(id) || primerMaking.has(id)) return;')
    expect(fn).toContain("const remote = await primerRemote('GET', unit);")
    expect(fn).toContain('makePrimer(unit, { speculative: true })')
  })
})
