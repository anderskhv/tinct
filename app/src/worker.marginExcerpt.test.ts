/**
 * The margin reader's Ask on a reader's own EPUB (9 Nov 2026: a highlighted line in Hamming's talk was said to come
 * "later in the talk than this chapter reaches"). Without the document, the chapters around the reader are an excerpt
 * and the prompt says so; with it, the chapter holding the passage is in the document. Every margin Ask opens with its
 * answer. Pure: no network and no AI.
 */
import { describe, expect, it } from 'vitest'
import { buildCompanionSystem, buildMarginSystemParts, parseCompanionRequest } from './companion/companionRequest'
import { LAB_EXCERPT_CHAPTER_LEAD, LAB_FULL_CHAPTER_LEAD } from './companion/labAskPrompt'
import { ASK_LEAD_RULE } from './companion/marginPrompts'

const TARGET = 'The misapplication of effort is a very serious matter. Just hard work is not enough - it must be applied sensibly.'
const context = (pages: Array<{ n: string; text: string }>) => ({
  bookTitle: 'You and Your Research', bookAuthor: 'Richard Hamming', chapterLabel: 'You and Your Research',
  kind: 'epub', pages, paragraphIndex: 1, lookups: false,
})
const pages = [
  { n: '2', text: 'Contents' },
  { n: '3', text: `[…] Now for the matter of drive. ${TARGET} More of the talk. […]` },
  { n: '4', text: 'Discussion' },
]

describe('the margin Ask on an own EPUB', () => {
  it('without the document: the chapters are labelled an excerpt, never the full authoritative chapter', () => {
    const request = parseCompanionRequest({ intent: 'ask', context: context(pages) })!
    expect(request.pdf).toBe(true)
    const system = buildCompanionSystem(request)
    expect(system).toContain(LAB_EXCERPT_CHAPTER_LEAD)
    expect(system).not.toContain(LAB_FULL_CHAPTER_LEAD)
    expect(system).not.toContain('This is the authoritative text.')
    expect(system).toContain(TARGET)
    expect(system).toContain(ASK_LEAD_RULE)
  })
  it('with the document: the selected sentence is in the current chapter\'s unit, and the lead rule is there', () => {
    const document = { kind: 'epub', units: [{ n: '1', text: 'You and Your Research. Richard Hamming.' }, { n: '3', text: `One of the characteristics of successful scientists is having courage. ${'Filler. '.repeat(3000)}Now for the matter of drive. ${TARGET}` }, { n: '4', text: 'Discussion' }] }
    const request = parseCompanionRequest({ intent: 'ask', context: context(pages), document })!
    // The Worker's prompt for a margin request with its document (routes/chat.ts): the cached prefix, then the place and the task.
    const parts = buildMarginSystemParts(request)!
    const system = [parts.stable, parts.part, parts.volatile].filter(Boolean).join('\n\n')
    const unit = /<chapter n="3">([\s\S]*?)<\/chapter>/.exec(system)?.[1] ?? ''
    expect(unit).toContain(TARGET)
    expect(system).toContain(ASK_LEAD_RULE)
    expect(system).not.toContain(LAB_FULL_CHAPTER_LEAD)
  })
  it('a PDF Ask has the same lead rule; the book reader keeps its full chapter lead', () => {
    const pdf = parseCompanionRequest({ intent: 'ask', context: { ...context([{ n: '12', text: TARGET }]), kind: 'pdf', paragraphIndex: 0 } })!
    expect(buildCompanionSystem(pdf)).toContain(ASK_LEAD_RULE)
    const book = parseCompanionRequest({ intent: 'ask', context: { bookTitle: 'Frankenstein', bookAuthor: 'Mary Shelley', chapterLabel: 'Letter 1', paragraphs: ['One.', 'Two.'], paragraphIndex: 0 } })!
    const system = buildCompanionSystem(book)
    expect(system).toContain(LAB_FULL_CHAPTER_LEAD)
    expect(system).not.toContain(ASK_LEAD_RULE)
  })
})
