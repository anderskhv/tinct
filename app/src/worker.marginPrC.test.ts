/**
 * The PDF reader's margin, PR C (docs/margin/FIXES-2026-10-15.md, "PR C" and the deep-test
 * additions): answer wording, the cost guards, Related, and EPUBs in the margin. Every
 * provider call is mocked; nothing reaches Anthropic or OpenAI.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MARGIN_ROUTES } from './companion/marginRoutes'
import { GENERAL_KNOWLEDGE_RULE, MARGIN_RULES, buildMarginPrefix, formatMarginPassages, parseMarginDocument } from './companion/marginContext'
import * as marginPromptText from './companion/marginPrompts'
import { CHAPTER_CHAT_INSTRUCTIONS } from './companion/chapterChatPrompt'
import { buildPrimerInstructions, buildPrimerTask } from './companion/primerPrompt'
import {
  ASK_DOCUMENT_LINE,
  ATTRIBUTION_RULE,
  MARGIN_ANSWER_RULES,
  NO_META_RULE,
  PDF_DOCUMENT_WORDING,
  WORK_FIRST_RULE,
  COUNTERPOINT_PROMPT,
  FACTCHECK_OPENING_ROUND,
  FACTCHECK_VERDICT_ROUND,
  NO_EXTRACTION_TALK_RULE,
  PICTURE_RULE,
  QUIZ_CHECK_PROMPT,
  PASSAGE_IMAGE_LINE,
  PDF_CITATION_RULE,
  PDF_EXPLAIN_FORMAT,
  PDF_EXPLAIN_PROMPT,
  PLAIN_PROSE_RULE,
  QUIZ_PASSAGE_FOCUS,
  RELATED_PROMPT,
  SIMPLIFY_PROMPT,
  factcheckPrompt,
  quizPrompt,
} from './companion/marginPrompts'
import {
  COMPANION_MAX_TOKENS,
  OWN_INPUT_CHARS,
  PASSAGE_INTENTS,
  buildCompanionSystem,
  companionAllowance,
  companionSelectionMessage,
  companionTakesPassageImage,
  marginRequestRoute,
  parseCompanionRequest,
} from './companion/companionRequest'
import { createAllowanceGate } from './worker/lib/aiAllowance'
import { handleChat } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true
const env = { ANTHROPIC_API_KEY: 'anthropic-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role', OPENAI_API_KEY: 'openai-key' }
const gateOff = { allowanceGate: createAllowanceGate({}, false) }

const PAPER = [
  'Attention Is All You Need\nAbstract The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.',
  '1 Introduction\nRecurrent neural networks have been firmly established as state of the art approaches in sequence modeling.',
  '2 Background\nSelf-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence.',
  '3 Model Architecture\nMost competitive neural sequence transduction models have an encoder-decoder structure.',
]
const document = { kind: 'pdf', units: PAPER.map((text, i) => ({ n: i + 1, text })) }
const pdfContext = (at: number) => ({
  kind: 'pdf', bookTitle: 'Attention Is All You Need', bookAuthor: 'Vaswani et al.', chapterLabel: `Page ${at}`,
  pages: [{ n: at, text: PAPER[at - 1] }], paragraphIndex: 0, pageNumber: at, totalPages: PAPER.length,
})
const margin = (intent: string, at: number, fields: Record<string, unknown> = {}) => ({ companion: { intent, context: pdfContext(at), document, ...fields } })

/** An EPUB in the PDF reader: chapters for pages, the document as `<chapter n>` units. */
const CHAPTERS = ['The first chapter. Emma Woodhouse, handsome, clever, and rich.', 'The second chapter. Mr. Weston was a native of Highbury.']
const epubDocument = { kind: 'epub', units: CHAPTERS.map((text, i) => ({ n: i + 1, text })) }
const epubContext = { kind: 'epub', bookTitle: 'Emma', bookAuthor: 'Jane Austen', chapterLabel: 'Chapter 2', pages: [{ n: 2, text: CHAPTERS[1] }], paragraphIndex: 0, pageNumber: 2, totalPages: 2 }

const bookContext = {
  bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1,
  editionLabel: 'Butler', paragraphs: ['Tell me, O muse, of that ingenious hero.', 'Athena spoke.'], paragraphIndex: 1,
  bookId: 'odyssey', editionKey: 'original-en',
}

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')
function png(width: number, height: number): string {
  const bytes = new Uint8Array(64)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52])
  new DataView(bytes.buffer).setUint32(16, width)
  new DataView(bytes.buffer).setUint32(20, height)
  return toBase64(bytes)
}
const image = { type: 'image', source: { type: 'base64', media_type: 'image/png', data: png(800, 300) } }
const withImage = (body: Record<string, unknown>) => ({ ...body, messages: [{ role: 'user', content: [image, { type: 'text', text: 'The selected passage.' }] }] })

function context() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) } } as unknown as ExecutionContext, pending }
}
function post(path: string, body: unknown) {
  return new Request(`https://tinct.app${path}`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' } })
}
const sse = (type: string, data: Record<string, unknown>) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
const streamed = (text: string) => [
  sse('message_start', { message: { usage: { input_tokens: 5 } } }),
  sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
  sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text } }),
  sse('content_block_stop', { index: 0 }),
  sse('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 3 } }),
  sse('message_stop', {}),
].join('')

type Reply = { json?: Record<string, unknown>; stream?: string }
function stubFetch(reply: () => Reply = () => ({})) {
  const anthropic: Array<Record<string, unknown>> = []
  const openai: Array<Record<string, unknown>> = []
  const rows: Array<Record<string, unknown>> = []
  const charges: string[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) { rows.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }) }
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) { charges.push(url); return Response.json({}) }
    if (url === 'https://api.openai.com/v1/responses') { openai.push(JSON.parse(String(init?.body))); return Response.json({ error: 'no search in this test' }, { status: 500 }) }
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropic.push(JSON.parse(String(init?.body)))
      const r = reply()
      if (r.stream) return new Response(r.stream, { headers: { 'content-type': 'text/event-stream' } })
      return Response.json(r.json ?? { content: [{ type: 'text', text: 'An answer.' }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5 } })
    }
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  }))
  return { anthropic, openai, rows, charges }
}
async function send(body: unknown) {
  const { ctx, pending } = context()
  const response = await handleChat(post('/api/chat', body), env, ctx, reader, allow, gateOff)
  const text = await response.text()
  await Promise.all(pending)
  return { status: response.status, text }
}
type SystemBlock = { type: string; text: string; cache_control?: { type: string } }
const systemText = (body: Record<string, unknown>) => (body.system as SystemBlock[]).map(block => block.text).join('\n\n')

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('answer wording (FIXES-2026-10-15 PR C)', () => {
  it('the shared rules ask for plain prose, first in every margin prompt', async () => {
    expect(PLAIN_PROSE_RULE).toBe('Plain prose only: no Markdown, no asterisks, no bullet characters, no em dashes.')
    expect(MARGIN_RULES).toContain(PLAIN_PROSE_RULE)
    const { anthropic } = stubFetch()
    await send(margin('counterpoint', 2, { selection: 'Recurrent neural networks' }))
    const system = anthropic[0].system as SystemBlock[]
    expect(system[0].text).toContain(PLAIN_PROSE_RULE)
    expect(system[0].cache_control).toEqual({ type: 'ephemeral' })
    // Without the document (it could not be read), the margin's prompt still carries it; the book reader's never does.
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'simplify', context: pdfContext(2), selection: 'x' })!)).toContain(PLAIN_PROSE_RULE)
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'explain', context: pdfContext(2), selection: 'x' })!)).toContain(PLAIN_PROSE_RULE)
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'explain', context: bookContext, selection: 'x' })!)).not.toContain(PLAIN_PROSE_RULE)
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'ask', context: bookContext })!)).not.toContain(PLAIN_PROSE_RULE)
  })

  it('the shared rules: work things out first, never attribute to the document what it does not say; a PDF is the document, one page per tag', async () => {
    expect(MARGIN_ANSWER_RULES).toEqual([PLAIN_PROSE_RULE, WORK_FIRST_RULE, ATTRIBUTION_RULE, NO_META_RULE])
    expect(WORK_FIRST_RULE).toBe('Work out numbers and facts before you write. Never correct yourself mid-answer.')
    expect(ATTRIBUTION_RULE).toBe('Never attribute to the document something it does not say.')
    for (const rule of MARGIN_ANSWER_RULES) expect(MARGIN_RULES).toContain(rule)
    expect(PDF_CITATION_RULE).toContain('One number per tag: write {p. 4} and {p. 5}, never {p. 4, p. 5}.')
    const { anthropic } = stubFetch()
    await send(margin('explain', 2, { selection: 'x' }))
    await send({ companion: { intent: 'explain', context: epubContext, document: epubDocument, selection: 'x' } })
    expect((anthropic[0].system as SystemBlock[])[0].text).toContain(PDF_DOCUMENT_WORDING)
    expect((anthropic[1].system as SystemBlock[])[0].text).not.toContain(PDF_DOCUMENT_WORDING)
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'counterpoint', context: pdfContext(2), selection: 'x' })!)).toContain(PDF_DOCUMENT_WORDING)
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'counterpoint', context: epubContext, selection: 'x' })!)).not.toContain(PDF_DOCUMENT_WORDING)
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'counterpoint', context: epubContext, selection: 'x' })!)).toContain('Do not draw on later chapters.')
  })

  it('Explain: an opener of at most 25 words, at most three short paragraphs, about 120 words, no notation paragraph', () => {
    expect(PDF_EXPLAIN_FORMAT).toContain('First paragraph: the answer itself, one sentence, at most 25 words.')
    expect(PDF_EXPLAIN_FORMAT).toContain('at most three short paragraphs')
    // Round 3 (16 Oct): no "any notation or terms" cue (answers then said there was no notation).
    expect(PDF_EXPLAIN_FORMAT).toContain('explaining a hard term or symbol in the sentence where it is used.')
    expect(PDF_EXPLAIN_FORMAT).not.toContain('notation')
    expect(PDF_EXPLAIN_FORMAT).toContain('About 120 words or fewer in all.')
    expect(PDF_EXPLAIN_FORMAT).not.toContain('and any notation or terms. No preamble')
    const request = parseCompanionRequest({ intent: 'explain', context: pdfContext(2), selection: 'Recurrent neural networks' })!
    expect(companionSelectionMessage(request)).toContain(PDF_EXPLAIN_PROMPT)
    expect(PDF_EXPLAIN_PROMPT).toContain(PDF_EXPLAIN_FORMAT)
  })

  it('Quiz me: every passage question tests the passage, question 1 from the passage alone; a chapter quiz is unchanged', () => {
    expect(QUIZ_PASSAGE_FOCUS).toContain('Every question must be about the selected passage and answerable from it; use the rest of the document only as background.')
    expect(QUIZ_PASSAGE_FOCUS).toContain('Question 1 must be answerable from the selected passage alone.')
    expect(quizPrompt('passage')).toContain(QUIZ_PASSAGE_FOCUS)
    expect(quizPrompt('chapter')).not.toContain(QUIZ_PASSAGE_FOCUS)
    expect(quizPrompt('chapter')).not.toContain('{focus}')
    expect(quizPrompt('passage')).not.toContain('{focus}')
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'quiz', context: pdfContext(2), selection: 'x' })!)).toContain(QUIZ_PASSAGE_FOCUS)
  })

  it('Fact-check: the new opening, the verdict once, sources other than the document preferred', () => {
    const prompt = factcheckPrompt('2026-10-15')
    expect(prompt.startsWith("Check whether the passage's factual claims still hold today and what has changed since it was written. Today's date is 2026-10-15.")).toBe(true)
    expect(prompt).toContain('Never treat the document itself as confirmation of its own claims')
    expect(prompt).toContain('State the verdict once: no other paragraph starts with a verdict word or repeats the verdict.')
    expect(prompt).toContain('Prefer primary, academic and official sources and well-known references over personal blogs, and sources other than the document itself.')
    expect(prompt).toContain('start it with one of: Holds. Partly holds. Outdated. Disputed. Can\'t check.')
  })

  // Round 3 (16 Oct): the two-part answer (a restatement, then the rewrite) is replaced by exactly one rewrite.
  it('Simplify: exactly one plain rewrite, as long as the selection, the same meaning, nothing else', () => {
    expect(SIMPLIFY_PROMPT).toContain('Give exactly one rewrite and nothing else: no preamble, no heading, no second version, no explanation or note after it.')
    expect(SIMPLIFY_PROMPT).toContain('a sentence becomes one plain sentence, a fragment a plain fragment')
    expect(SIMPLIFY_PROMPT).toContain('Add nothing the passage does not say')
    expect(SIMPLIFY_PROMPT).toContain('never finish its sentence from the words that follow it in the document')
    expect(SIMPLIFY_PROMPT).toContain('Keep the meaning exactly')
    expect(SIMPLIFY_PROMPT).not.toContain('First paragraph')
    expect(SIMPLIFY_PROMPT).not.toContain('Then the rewrite')
    expect(SIMPLIFY_PROMPT).not.toContain('that says what the passage is doing')
  })

  it('Counterpoint: the author\'s reply only from the document', () => {
    expect(COUNTERPOINT_PROMPT).toContain('Give the author\'s reply only from what the document says or plainly implies.')
  })

  it('Ask in the margin says so when the document does not explain something; the book reader\'s Ask is unchanged', async () => {
    expect(ASK_DOCUMENT_LINE).toBe('When the document does not explain something, say so before offering an explanation of your own.')
    const { anthropic } = stubFetch()
    await send({ ...margin('ask', 2), messages: [{ role: 'user', content: 'What is attention?' }] })
    expect(systemText(anthropic[0])).toContain(ASK_DOCUMENT_LINE)
    // After the breakpoint, never in the cached prefix.
    expect((anthropic[0].system as SystemBlock[])[0].text).not.toContain(ASK_DOCUMENT_LINE)
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'ask', context: bookContext })!)).not.toContain(ASK_DOCUMENT_LINE)
  })
})

describe('answer rules from the deep test after train 2 (15 Oct, evening)', () => {
  it('every margin request carries the picture rule and the no-extraction rule in the cached prefix; the book reader never does', async () => {
    expect(PICTURE_RULE).toBe('The picture is the passage itself; never describe or read out the picture, and never say what it confirms. Answer about the passage.')
    expect(NO_EXTRACTION_TALK_RULE).toBe('Never mention text extraction, garbling, or how the document reached you.')
    expect(MARGIN_RULES).toContain(PICTURE_RULE)
    expect(MARGIN_RULES).toContain(NO_EXTRACTION_TALK_RULE)
    for (const intent of ['explain', 'simplify', 'counterpoint', 'related'] as const) {
      const { anthropic } = stubFetch()
      await send(margin(intent, 2, { selection: 'Self-attention' }))
      const prefix = (anthropic[0].system as SystemBlock[])[0]
      expect(prefix.cache_control).toEqual({ type: 'ephemeral' })
      expect(prefix.text, intent).toContain(PICTURE_RULE)
      expect(prefix.text, intent).toContain(NO_EXTRACTION_TALK_RULE)
      vi.unstubAllGlobals()
    }
    const book = buildCompanionSystem(parseCompanionRequest({ intent: 'explain', context: bookContext, selection: 'muse' })!)
    expect(book).not.toContain(PICTURE_RULE)
    expect(book).not.toContain(NO_EXTRACTION_TALK_RULE)
  })

  it('the passage-image line no longer talks about garbled extraction', () => {
    expect(PASSAGE_IMAGE_LINE).toBe('The attached image shows the passage exactly as printed. Where its equations or symbols differ from the document\'s text, trust the image.')
    expect(PASSAGE_IMAGE_LINE).not.toMatch(/garbl|extract/i)
  })

  it('quiz_check addresses the reader as you, never as "the reader\'s answer"', () => {
    expect(QUIZ_CHECK_PROMPT).toContain('Write the feedback to the reader directly, as "you" and "your answer"; never "the reader" or "the reader\'s answer".')
    expect(QUIZ_CHECK_PROMPT.startsWith('Mark the answer in <reader_answer> to a quiz question')).toBe(true)
    expect(QUIZ_CHECK_PROMPT).not.toContain("Mark the reader's answer")
  })

  it('Fact-check: the opening from the document first, then the verdict once', () => {
    const prompt = factcheckPrompt('2026-10-15')
    // Full battery on train 3: the opening is one placing sentence of at most 25 words, no summary of the document's support; at most 150 words in all.
    expect(prompt).toContain('First paragraph: one sentence of at most 25 words, from the document alone, that places the claim')
    expect(prompt).not.toContain('what the document itself offers in support')
    expect(prompt).toContain('It gives no verdict and does not summarise the document\'s support.')
    expect(prompt).toContain('At most 150 words in all, not counting the Sources: line.')
    // Fiction: real-world references, never "there is no factual claim".
    expect(prompt).toContain('If the passage is fiction, check its references to the real world')
    expect(prompt).toContain('Never open by saying there is no factual claim.')
    expect(prompt).toContain('State the verdict once: no other paragraph starts with a verdict word or repeats the verdict.')
    expect(prompt).not.toContain('Then one short paragraph for each checkable claim')
    expect(FACTCHECK_OPENING_ROUND).toContain('Write only the first paragraph now: one sentence of at most 25 words, from the document alone')
    expect(FACTCHECK_VERDICT_ROUND).toContain('Do not repeat or restate the first paragraph.')
  })
})

describe('docs/margin/PROMPTS.md is in step with the prompts', () => {
  it('carries every PR C wording word for word', () => {
    const doc = readFileSync(resolve(__dirname, '../../docs/margin/PROMPTS.md'), 'utf8')
    const lines = [
      ...MARGIN_ANSWER_RULES, PDF_DOCUMENT_WORDING, PDF_CITATION_RULE, PDF_EXPLAIN_FORMAT, ASK_DOCUMENT_LINE, QUIZ_PASSAGE_FOCUS,
      ...SIMPLIFY_PROMPT.split('\n'), ...COUNTERPOINT_PROMPT.split('\n'), ...RELATED_PROMPT.split('\n'),
      ...factcheckPrompt('{today}').split('\n'),
      PICTURE_RULE, NO_EXTRACTION_TALK_RULE, PASSAGE_IMAGE_LINE, FACTCHECK_OPENING_ROUND, FACTCHECK_VERDICT_ROUND, ...QUIZ_CHECK_PROMPT.split('\n'),
      // Round 1 (15 Oct, night): the PDF reader's Define eponym line and its policy lines without the document.
      marginPromptText.DEFINE_EPONYM_LINE, marginPromptText.MARGIN_CONTEXT_PARAGRAPH, marginPromptText.MARGIN_READ_LINE, marginPromptText.MARGIN_CHECKED_WORDS,
    ]
    for (const line of lines) expect(doc, line).toContain(line)
  })
})

// Retest after train 2 (15 Oct, evening): answers leaked "the text I have", "the supplied text" and "the search note I drew on".
describe('no pipeline wording in any margin prompt', () => {
  const LEAKS = [/text I have/i, /text you have/i, /supplied/i, /search note/i]
  it('none in the prompts, the shared rules, the document block, the primer, or PROMPTS.md\'s prompt blocks', () => {
    const doc = parseMarginDocument({ kind: 'pdf', units: [{ n: 1, text: 'One.' }, { n: 2, text: 'Two.' }], part: { toc: [{ title: 'Part', n: 1 }], total: 90 } })!
    const cut = parseMarginDocument({ kind: 'pdf', units: [{ n: 1, text: 'x'.repeat(10) }] })!
    const context = { bookTitle: 'T', bookAuthor: 'A', chapterLabel: 'All', paragraphs: ['<page n="1">\nOne.\n</page>'], paragraphIndex: 0, lookups: false } as never
    const texts: Array<[string, string]> = [
      ...Object.entries(marginPromptText).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, v as string] as [string, string]),
      ['quizPrompt passage', marginPromptText.quizPrompt('passage', { pdf: true })], ['quizPrompt unit', marginPromptText.quizPrompt('chapter', { pdf: true })],
      ['factcheckPrompt', marginPromptText.factcheckPrompt('2026-10-15')],
      ['MARGIN_RULES', MARGIN_RULES], ['GENERAL_KNOWLEDGE_RULE', GENERAL_KNOWLEDGE_RULE],
      ['prefix, long file', buildMarginPrefix(doc, { title: 'T', author: '' })], ['prefix, cut', buildMarginPrefix({ ...cut, cut: true }, { title: 'T', author: '' })],
      ['passages', formatMarginPassages('pdf', [{ label: '3', text: 'x' }])],
      ['primer', CHAPTER_CHAT_INSTRUCTIONS.primer],
      ['primer task, all', buildPrimerTask({ kind: 'primer', unitKey: 'all', unitTitle: 'T' }, context, doc)],
      ['primer task, unit', buildPrimerTask({ kind: 'primer', unitKey: 'outline-1', unitTitle: 'T' }, context, null)],
      ['primer instructions', buildPrimerInstructions({ kind: 'primer', unitKey: 'all', unitTitle: 'T' }, context)],
    ]
    // Round 1 (15 Oct, night): the PDF reader's Define prompt and its policy without the document are held to it too.
    for (const [name, text] of texts) for (const leak of LEAKS) expect(text, name).not.toMatch(leak)
    expect(texts.map(([name]) => name)).toEqual(expect.arrayContaining(['PDF_CONTEXTUAL_LOOKUP_PROMPT', 'MARGIN_LAB_ASK_POLICY']))
    const blocks = readFileSync(resolve(__dirname, '../../docs/margin/PROMPTS.md'), 'utf8').match(/```[\s\S]*?```/g) ?? []
    expect(blocks.length).toBeGreaterThan(5)
    for (const block of blocks) for (const leak of LEAKS) expect(block).not.toMatch(leak)
  })
  it('Fact-check names its sources by title, never the search or its notes; Simplify never returns the passage or a note about it', () => {
    expect(marginPromptText.factcheckPrompt('2026-10-15')).toContain('Name each source by its title; never mention the search itself or its notes.')
    expect(marginPromptText.SIMPLIFY_PROMPT).toContain('Never return the passage unchanged or nearly unchanged, never quote it back')
    expect(marginPromptText.SIMPLIFY_PROMPT).toContain('no explanation or note after it')
    const doc = readFileSync(resolve(__dirname, '../../docs/margin/PROMPTS.md'), 'utf8')
    // The production re-run after train 3: Explain about the text, never the selection; Counterpoint tied to the document; short Simplify selections.
    expect(marginPromptText.PDF_EXPLAIN_PROMPT.endsWith(marginPromptText.PDF_EXPLAIN_TEXT_RULE)).toBe(true)
    expect(marginPromptText.COUNTERPOINT_PROMPT).toContain('Look first for the document\'s own inconsistencies')
    expect(marginPromptText.PDF_COUNTERPOINT_PROMPT).toContain('Never a generic objection that would fit any work')
    expect(marginPromptText.SIMPLIFY_PROMPT).toContain('rewrite that fragment alone')
    // Full battery on train 3 (fiction, accuracy, leaks).
    expect(marginPromptText.SIMPLIFY_PROMPT).toContain('Match the length of the selection')
    expect(marginPromptText.SIMPLIFY_PROMPT).toContain('never write the same sentence twice')
    expect(marginPromptText.COUNTERPOINT_PROMPT).toContain('a reading of it that differs from the obvious one')
    expect(marginPromptText.COUNTERPOINT_PROMPT).toContain('with no author\'s reply')
    expect(marginPromptText.COUNTERPOINT_PROMPT).toContain('Quote the document\'s own numbers, formulas and complexities exactly as printed')
    // Round 3 (16 Oct, recheck-1): the rule that named notation and the selection's ends drew those very sentences.
    expect(marginPromptText.PDF_EXPLAIN_TEXT_RULE).toBe('Write only about what the text says and means.')
    expect(marginPromptText.PDF_EXPLAIN_PROMPT).not.toMatch(/notation|starts or stops|cut off/i)
    expect(marginPromptText.PICTURE_RULE).toContain('never say what it confirms')
    for (const line of [marginPromptText.PDF_EXPLAIN_TEXT_RULE, ...marginPromptText.SIMPLIFY_PROMPT.split('\n'), ...marginPromptText.COUNTERPOINT_PROMPT.split('\n'), ...marginPromptText.factcheckPrompt('{today}').split('\n'), ...marginPromptText.DEFINE_SENSE_PROMPT.split('\n'), ...CHAPTER_CHAT_INSTRUCTIONS.primer.split('\n')]) expect(doc, line).toContain(line)
  })
})

describe('Related (A5, approved 15 Oct)', () => {
  it('is a passage intent of the PDF reader only, with its prompt, its route and the whole document', async () => {
    expect(PASSAGE_INTENTS.has('related')).toBe(true)
    expect(parseCompanionRequest({ intent: 'related', context: bookContext, selection: 'x' })).toBeNull()
    expect(parseCompanionRequest({ intent: 'related', context: pdfContext(2) })).toBeNull()
    const request = parseCompanionRequest(margin('related', 2, { selection: 'Self-attention' }).companion)!
    expect(request.intent).toBe('related')
    expect(COMPANION_MAX_TOKENS.related).toBe(500)
    expect(companionAllowance(request)).toBe('chat')
    expect(marginRequestRoute(request)).toEqual(MARGIN_ROUTES.related)
    expect(companionSelectionMessage(request)).toBe('<selected_passage>\nSelf-attention\n</selected_passage>')
    expect(RELATED_PROMPT).toContain('Find where else the document takes up the idea in the selected passage')
    expect(RELATED_PROMPT).toContain('Then two to five places, in the document\'s order.')
    expect(RELATED_PROMPT).toContain('leave the selected passage itself out, and never say what is or is not listed.')

    const { anthropic, openai, charges, rows } = stubFetch(() => ({ stream: streamed('Self-attention runs through the model.\n\n{p. 3} The encoder stacks it.') }))
    const { status, text } = await send({ ...withImage(margin('related', 2, { selection: 'Self-attention' })), stream: true })
    expect(status).toBe(200)
    expect(text).toContain('The encoder stacks it.')
    const body = anthropic[0]
    expect(body.model).toBe(MARGIN_ROUTES.related.model)
    expect(body.output_config).toEqual({ effort: MARGIN_ROUTES.related.effort })
    expect(body.max_tokens).toBe(MARGIN_ROUTES.related.maxTokens)
    expect(body).not.toHaveProperty('tools')
    // A Haiku lookup: thinking off (the max_tokens hotfix, #453).
    expect(body.thinking).toEqual(MARGIN_ROUTES.related.thinking)
    expect(MARGIN_ROUTES.related.thinking).toEqual({ type: 'disabled' })
    expect(openai).toHaveLength(0)
    const system = body.system as SystemBlock[]
    expect(system[0].text).toContain('<page n="4">')
    expect(system[0].text).not.toContain(RELATED_PROMPT)
    expect(system[1].text).toContain(RELATED_PROMPT)
    expect(system[1].text).toContain(PASSAGE_IMAGE_LINE)
    expect(JSON.stringify(body.messages)).toContain('"type":"image"')
    // Charged like Ask: once, and metered as chat.
    expect(charges).toHaveLength(1)
    expect(rows.map(row => row.feature)).toEqual(['chat'])
  })
})

describe('cost guards (FIXES-2026-10-15 PR C)', () => {
  it('never calls use_message for a never-charged feature, streamed or not', async () => {
    for (const [companion, stream] of [
      [margin('define_sense', 2, { selection: 'attention', senses: ['a', 'b'] }).companion, false],
      [margin('quiz_check', 2, { quiz: { question: 'Q', expected: 'E', answer: 'A' } }).companion, false],
      [margin('quiz_check', 2, { quiz: { question: 'Q', expected: 'E', answer: 'A' } }).companion, true],
      [{ intent: 'explain', context: bookContext, selection: 'Athena spoke.', speculative: true }, true],
    ] as const) {
      const { charges, rows } = stubFetch(() => (stream ? { stream: streamed('{"sense": 1}') } : {}))
      const { status } = await send({ companion, stream })
      expect(status).toBe(200)
      expect(charges, JSON.stringify(companion).slice(0, 60)).toHaveLength(0)
      expect(rows.map(row => row.feature)).toEqual(['explain_speculative'])
      vi.unstubAllGlobals()
    }
    // A charged one still is.
    const { charges } = stubFetch()
    await send(margin('counterpoint', 2, { selection: 'x' }))
    expect(charges).toHaveLength(1)
  })

  it('define_sense and quiz_check send the cached document plus at most 2,000 characters of their own', async () => {
    expect(OWN_INPUT_CHARS).toBe(2_000)
    const sense = parseCompanionRequest(margin('define_sense', 2, { selection: 'attention', senses: Array(5).fill('s'.repeat(500)) }).companion)!
    expect(sense.selection!.length + sense.senses!.join('').length).toBeLessThanOrEqual(2_000)
    expect(sense.senses).toHaveLength(4)
    const check = parseCompanionRequest(margin('quiz_check', 2, { quiz: { question: 'q'.repeat(1_000), expected: 'e'.repeat(1_000), why: 'w'.repeat(1_000), answer: 'a'.repeat(2_000) } }).companion)!
    const q = check.quizCheck!
    expect(q.question.length + q.expected.length + (q.why ?? '').length + q.answer.length).toBeLessThanOrEqual(2_000)
    expect(q.answer.length).toBeGreaterThanOrEqual(800)
    // A short answer is kept whole.
    expect(parseCompanionRequest(margin('quiz_check', 2, { quiz: { question: 'Q?', expected: 'E.', answer: 'My answer.' } }).companion)!.quizCheck!.answer).toBe('My answer.')

    const { anthropic } = stubFetch()
    await send(margin('quiz_check', 2, { quiz: { question: 'q'.repeat(1_000), expected: 'e'.repeat(1_000), why: 'w'.repeat(1_000), answer: 'a'.repeat(5_000) } }))
    const turn = String((anthropic[0].messages as Array<{ content: string }>)[0].content)
    const own = turn.replace(/<\/?(?:question|expected|why|reader_answer)>/g, '').replace(/\n/g, '')
    expect(own.length).toBeLessThanOrEqual(2_000)
    // The document is still there, before the breakpoint.
    expect((anthropic[0].system as SystemBlock[])[0].text).toContain('<page n="1">')
  })

  it('refuses a speculative Simplify with 400 and makes no call', async () => {
    const { anthropic } = stubFetch()
    const { status } = await send(margin('simplify', 2, { selection: 'x', speculative: true }))
    expect(status).toBe(400)
    expect(anthropic).toHaveLength(0)
  })
})

describe('an EPUB in the PDF reader', () => {
  it('is the PDF reader\'s margin with chapters: no page citation rule, no picture, chapter markers', async () => {
    const parsed = parseCompanionRequest({ intent: 'simplify', context: epubContext, document: epubDocument, selection: 'Emma Woodhouse' })!
    expect(parsed.pdf).toBe(true)
    expect(parsed.epub).toBe(true)
    expect(companionTakesPassageImage(parsed)).toBe(false)
    expect(marginRequestRoute(parsed)).toEqual(MARGIN_ROUTES.simplify)
    // A registered book that says it is an EPUB is still a registered book.
    expect(parseCompanionRequest({ intent: 'ask', context: { ...bookContext, kind: 'epub' } })).not.toHaveProperty('pdf')
    // Without a document, no page citation rule either.
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'counterpoint', context: epubContext, selection: 'x' })!)).not.toContain(PDF_CITATION_RULE)

    const { anthropic } = stubFetch()
    for (const intent of ['related', 'counterpoint', 'quiz']) {
      await send(withImage({ companion: { intent, context: epubContext, document: epubDocument, selection: 'Mr. Weston' } }))
    }
    for (const body of anthropic) {
      expect(JSON.stringify(body.messages)).not.toContain('"type":"image"')
      const system = body.system as SystemBlock[]
      expect(system[0].text).toContain('<chapter n="1">\nThe first chapter.')
      expect(system[0].text).toContain('name the chapter and quote a few of its words')
      expect(system[0].text).not.toContain(PDF_CITATION_RULE)
      expect(system[1].text).toContain('The reader is on chapter 2 of 2.')
      expect(system[1].text).not.toContain(PASSAGE_IMAGE_LINE)
    }
  })
})
