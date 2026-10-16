/**
 * The margin after round 1 of the night test (15 Oct 2026, Tinct 4.08 against Gloss 4.68): a long
 * file's cached prefix byte for byte the same on every page, Related without talk about its list,
 * no pipeline wording without the document (an EPUB's Explain), Define on eponyms, and the two
 * speed trials' switches (both off). Every provider call is mocked; nothing reaches Anthropic.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildCompanionSystem, buildCompanionSystemParts, companionSelectionMessage, parseCompanionRequest } from './companion/companionRequest'
import { LAB_ASK_POLICY, buildLabAskInstructions } from './companion/labAskPrompt'
import { buildMarginPrefix, buildMarginPrefixParts, parseMarginDocument } from './companion/marginContext'
import {
  DEFINE_EPONYM_LINE, MARGIN_CHECKED_WORDS, MARGIN_CONTEXT_PARAGRAPH, MARGIN_LAB_ASK_POLICY, MARGIN_READ_LINE, PDF_CONTEXTUAL_LOOKUP_PROMPT, RELATED_PROMPT,
} from './companion/marginPrompts'
import { FACTCHECK_VERDICT_EFFORT, MARGIN_HAIKU_MODEL, MARGIN_ROUTES, QUIZ_THINKING_OFF, factcheckVerdictEffort, quizRoute } from './companion/marginRoutes'
import * as twinTs from './companion/marginParse'
import * as twinJs from '../public/lab/margin/margin-parse.js'
import { CONTEXTUAL_LOOKUP_PROMPT } from './components/reader/contextualLookup'
import { createAllowanceGate } from './worker/lib/aiAllowance'
import { handleChat } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true
const env = { ANTHROPIC_API_KEY: 'anthropic-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const gateOff = { allowanceGate: createAllowanceGate({}, false) }
type SystemBlock = { type: string; text: string; cache_control?: { type: string } }

function stubFetch() {
  const anthropic: Array<Record<string, unknown>> = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) return new Response(null, { status: 201 })
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) return Response.json({})
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropic.push(JSON.parse(String(init?.body)))
      return Response.json({ content: [{ type: 'text', text: 'An answer.' }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5 } })
    }
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  }))
  return { anthropic }
}
async function send(body: unknown) {
  const pending: Promise<unknown>[] = []
  const ctx = { waitUntil: (p: Promise<unknown>) => { pending.push(Promise.resolve(p)) } } as unknown as ExecutionContext
  const request = new Request('https://tinct.app/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' } })
  const response = await handleChat(request, env, ctx, reader, allow, gateOff)
  await Promise.all(pending)
  return response
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

/** A 640-page book sent as its part (reader.js marginDocument): the same contents on every page, the part's pages. */
const CONTENTS = [{ title: 'Preface', n: 'v' }, { title: '1 · Introduction to Information Theory', n: '1' }, { title: '2 · Probability, Entropy, and Inference', n: '20' }, { title: '4 · The Source Coding Theorem', n: '65' }]
const longDoc = (from: number, to: number) => ({
  kind: 'pdf',
  units: Array.from({ length: to - from + 1 }, (_, i) => ({ n: from + i, text: `Page ${from + i}. ${'Shannon information content '.repeat(30)}` })),
  part: { toc: CONTENTS, total: 640 },
})
const longContext = (at: number) => ({
  kind: 'pdf', bookTitle: 'Information Theory, Inference, and Learning Algorithms', bookAuthor: 'David J. C. MacKay', chapterLabel: `Page ${at}`,
  pages: [{ n: at, text: `Page ${at}.` }], paragraphIndex: 0, pageNumber: at, totalPages: 640,
})

describe('a long file\'s cached prefix is byte for byte the same on every page (MacKay, round 1)', () => {
  it('two requests on pages of different chapters send the same first block; two in one chapter the same two blocks', async () => {
    const { anthropic } = stubFetch()
    // Chapter 1 (pages 1 to 19) at page 2 and page 9; chapter 4 (65 to 90) at page 79: the same route (Explain).
    await send({ companion: { intent: 'explain', context: longContext(2), document: longDoc(1, 19), selection: 'a noisy disk drive' } })
    await send({ companion: { intent: 'explain', context: longContext(9), document: longDoc(1, 19), selection: 'parity-check bits' } })
    await send({ companion: { intent: 'explain', context: longContext(79), document: longDoc(65, 90), selection: 'the source coding theorem' } })
    const [a, b, c] = anthropic.map(body => body.system as SystemBlock[])
    // Different pages of the book, same route: the first block is the same bytes, with a breakpoint at its end.
    expect(a[0].text).toBe(c[0].text)
    expect(a[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(c[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(a[0].text).toContain('<contents>\nPreface (page v)\n1 · Introduction to Information Theory (page 1)')
    expect(a[0].text).not.toContain('<document>')
    // The part's text is the second cached block: the same in the chapter, another for chapter 4.
    expect(a[1]).toEqual(b[1])
    expect(a[1].cache_control).toEqual({ type: 'ephemeral' })
    expect(a[1].text.startsWith('The part the reader is in: pages 1 to 19.\n\n<document>\n<page n="1">')).toBe(true)
    expect(c[1].text.startsWith('The part the reader is in: pages 65 to 90.')).toBe(true)
    // Nothing that moves with the request comes before a breakpoint: the place and the action follow, uncached.
    for (const system of [a, b, c]) {
      expect(system).toHaveLength(3)
      expect(system[2].cache_control).toBeUndefined()
      expect(system[0].text + system[1].text).not.toMatch(/The reader is on page|Explain the passage|noisy disk|parity-check|source coding theorem/)
    }
    expect(a[2].text).toContain('The reader is on page 2 of 640.')
    expect(b[2].text).toContain('The reader is on page 9 of 640.')
    // Two blocks with breakpoints: within the API's four.
    expect(a.filter(block => block.cache_control)).toHaveLength(2)
  })

  it('every passage action and Ask on the same model share the first block; a short file stays one block', () => {
    const doc = parseMarginDocument(longDoc(65, 90))!
    const parts = buildMarginPrefixParts(doc, { title: 'T', author: 'A' })
    expect(parts.part).toBeDefined()
    expect(buildMarginPrefix(doc, { title: 'T', author: 'A' })).toBe(`${parts.stable}\n\n${parts.part}`)
    // Another part of the same file: the same first block.
    expect(buildMarginPrefixParts(parseMarginDocument(longDoc(300, 320))!, { title: 'T', author: 'A' }).stable).toBe(parts.stable)
    const short = parseMarginDocument({ kind: 'pdf', units: [{ n: 1, text: 'One.' }, { n: 2, text: 'Two.' }] })!
    const one = buildMarginPrefixParts(short, { title: 'T', author: 'A' })
    expect(one.part).toBeUndefined()
    expect(one.stable).toContain('The whole document follows, page by page.\n\n<document>\n<page n="1">')
  })
})

describe('Related never narrates its list (round 1: "is the selected passage itself, so it is not listed here")', () => {
  it('the prompt says only what to leave out', () => {
    expect(RELATED_PROMPT).toContain('Answer only with where else the document takes the idea up: leave the selected passage itself out, and never say what is or is not listed.')
    expect(RELATED_PROMPT).not.toContain('Do not list the selected passage itself.')
  })
  it('both parser twins drop a row or a bottom-line sentence that talks about what is listed', () => {
    const answer = 'The apple runs through Part II. The selected passage itself is not listed here.\n\n“the apple lodged” is the selected passage itself, so it is not listed here.\n“his father threw” Gregor\'s father bombards him with apples.\n{p. 5} Where it is first named.'
    for (const twin of [twinTs, twinJs] as Array<{ parseRelated: (text: string) => { lead: string; rows: Array<{ text: string; quote: string | null }> } }>) {
      const parsed = twin.parseRelated(answer)
      expect(parsed.lead).toBe('The apple runs through Part II.')
      expect(parsed.rows.map(row => row.text)).toEqual(['Gregor\'s father bombards him with apples.', 'Where it is first named.'])
    }
    // An answer without such talk is untouched.
    expect(twinTs.parseRelated('A thread. Its second sentence.\n\n{p. 5} Here.').lead).toBe('A thread. Its second sentence.')
  })
})

describe('no pipeline wording without the document (an EPUB\'s Explain said "the passage around it has not been supplied")', () => {
  const epubContext = { kind: 'epub', bookTitle: 'Metamorphosis', bookAuthor: 'Franz Kafka', chapterLabel: 'II', pages: [{ n: 2, text: 'An apple thrown without much force.' }], paragraphIndex: 0 }
  const bookContext = { bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1, editionLabel: 'Butler', paragraphs: ['Tell me, O muse.', 'Athena spoke.'], paragraphIndex: 1, bookId: 'odyssey', editionKey: 'original-en' }
  it('the PDF reader\'s margin opens with the policy in its own words; the book reader\'s is the shared one, byte for byte', () => {
    for (const intent of ['explain', 'define', 'simplify', 'counterpoint', 'related', 'quiz'] as const) {
      const request = parseCompanionRequest({ intent, context: epubContext, selection: 'An apple' })!
      const system = buildCompanionSystem(request)
      expect(system, intent).not.toMatch(/supplied|payload|text you have|text I have/i)
      expect(system.startsWith(MARGIN_LAB_ASK_POLICY), intent).toBe(true)
    }
    expect(MARGIN_LAB_ASK_POLICY).toContain(MARGIN_CONTEXT_PARAGRAPH)
    expect(MARGIN_LAB_ASK_POLICY).toContain(MARGIN_READ_LINE)
    expect(MARGIN_LAB_ASK_POLICY).toContain(MARGIN_CHECKED_WORDS)
    expect(MARGIN_LAB_ASK_POLICY).not.toBe(LAB_ASK_POLICY)
    // The book reader: unchanged.
    const book = parseCompanionRequest({ intent: 'explain', context: bookContext, selection: 'Athena spoke.' })!
    expect(buildCompanionSystem(book)).toBe(buildLabAskInstructions({ ...bookContext, lookups: false }, { nearby: 2 }))
    expect(buildCompanionSystemParts(book)!.stable.startsWith(LAB_ASK_POLICY)).toBe(true)
    expect(LAB_ASK_POLICY).toContain('The supplied text is supporting context')
  })
})

describe('Define in the PDF reader: no "supplied", and eponyms are terms (round 1: "Parzen" was "not a standalone character")', () => {
  it('the PDF prompt reads "the passage", carries the eponym line after the line for words, and the book reader\'s prompt is unchanged', () => {
    expect(PDF_CONTEXTUAL_LOOKUP_PROMPT).not.toMatch(/supplied/i)
    expect(PDF_CONTEXTUAL_LOOKUP_PROMPT).toContain('Identify what the selected word or phrase denotes in the passage before answering.')
    expect(PDF_CONTEXTUAL_LOOKUP_PROMPT).toContain(`concise contextual meaning, including an archaic form if relevant.\n${DEFINE_EPONYM_LINE}\nReturn only one JSON object`)
    expect(DEFINE_EPONYM_LINE).toContain('Parzen window')
    const define = parseCompanionRequest({ intent: 'define', context: longContext(5), selection: 'Parzen' })!
    expect(companionSelectionMessage(define)).toBe(`${PDF_CONTEXTUAL_LOOKUP_PROMPT}\n<word>Parzen</word>`)
    expect(CONTEXTUAL_LOOKUP_PROMPT).toContain('in the supplied passage')
    expect(CONTEXTUAL_LOOKUP_PROMPT).not.toContain(DEFINE_EPONYM_LINE)
  })
})

describe('speed trials: one-line switches, on since the night of 15–16 Oct (measured against off)', () => {
  it('Quiz me: adaptive thinking at low effort when off; thinking disabled at low effort when on', () => {
    expect(QUIZ_THINKING_OFF).toBe(true)
    expect(MARGIN_ROUTES.quiz).toEqual(quizRoute(true))
    expect(quizRoute(false)).toEqual({ model: MARGIN_HAIKU_MODEL, effort: 'low', maxTokens: 6000 })
    expect(quizRoute(true)).toEqual({ model: MARGIN_HAIKU_MODEL, effort: 'low', maxTokens: 6000, thinking: { type: 'disabled' } })
  })
  it('Fact-check\'s verdict round: the route\'s effort when off; low when on', () => {
    expect(FACTCHECK_VERDICT_EFFORT).toBe('low')
    expect(factcheckVerdictEffort()).toBe('low')
    expect(factcheckVerdictEffort(null)).toBe('medium')
    expect(factcheckVerdictEffort('low')).toBe('low')
  })
})
