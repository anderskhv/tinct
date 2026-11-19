import { describe, expect, it, vi, beforeEach } from 'vitest'
import { BOOK_PASSAGE_TOOL, SHOWN_EXPLANATION_LABEL, VOICE_PASSAGE_CHAR_BUDGET, buildLabTalkReference, retrieveVoicePassage } from './labDirectVoice'
import { loadEditionWindow } from '../data/editionLoader'
vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
const context = { bookId:'bible', editionKey:'kjv-en', bookTitle:'The Bible', bookAuthor:'Various', chapterLabel:'Genesis 2', chapterNumber:2, paragraphIndex:0, paragraphs:['The heavens and the earth were finished.'], readingAngle:'' }
beforeEach(() => vi.mocked(loadEditionWindow).mockResolvedValue({chapters:[{number:1,title:'Genesis 1',paragraphs:['Let there be light.']},{number:2,title:'Genesis 2',paragraphs:context.paragraphs},{number:3,title:'Genesis 3',paragraphs:['Later text.']}]}))
describe('direct voice reference', () => {
  it('carries position, edition, passage and the Explain quote with its explanation as data', () => {
    const reference = JSON.parse(buildLabTalkReference(context, [
      { role: 'user', content: 'Explain this passage.', highlightedText: 'the heavens and the earth were finished' },
      { role: 'assistant', content: 'The earlier explanation.' },
    ])) as Record<string, unknown>
    expect(reference).toMatchObject({ book: 'The Bible', edition: 'kjv-en', chapter: 'Genesis 2', chapterNumber: 2, paragraphIndex: 0 })
    expect(reference.excerpt).toEqual([{ paragraphIndex: 0, text: context.paragraphs[0] }])
    expect(reference.recentConversation).toEqual([
      { role: 'user', quote: 'the heavens and the earth were finished', content: 'Explain this passage.' },
      { role: 'assistant', content: 'The earlier explanation.' },
    ])
    expect(buildLabTalkReference(context, []).length).toBeLessThan(2000)
    expect(buildLabTalkReference(context, [])).not.toMatch(/you are|never|always/i)
  })
  it('labels a kept quick-model explanation as shown and unverified, with its passage', () => {
    const reference = JSON.parse(buildLabTalkReference(context, [
      { role: 'user', content: 'Who made it?' },
      { role: 'assistant', content: 'God, in the account.' },
      { role: 'user', content: 'Explain this passage.', highlightedText: 'the heavens and the earth were finished', shownExplanation: true },
      { role: 'assistant', content: 'The quick explanation.', shownExplanation: true },
    ])) as { recentConversation: unknown[] }
    expect(reference.recentConversation).toEqual([
      { role: 'user', content: 'Who made it?' },
      { role: 'assistant', content: 'God, in the account.' },
      { role: 'shown_explanation', about: SHOWN_EXPLANATION_LABEL, quote: 'the heavens and the earth were finished', content: 'The quick explanation.' },
    ])
    expect(SHOWN_EXPLANATION_LABEL).toMatch(/quicker model\. Unverified: not your earlier answer/)
  })
  it('drops cancelled turns and keeps only the latest four', () => {
    const turns = Array.from({ length: 6 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `turn ${i}` }))
    const reference = JSON.parse(buildLabTalkReference(context, [{ role: 'assistant', content: 'cut off', cancelled: true }, ...turns])) as { recentConversation: Array<{ content: string }> }
    expect(reference.recentConversation.map(turn => turn.content)).toEqual(['turn 2', 'turn 3', 'turn 4', 'turn 5'])
  })
  it('retrieves the exact edition and chapter without navigating', async () => {
    const result=await retrieveVoicePassage(context,{chapter_title:'Genesis 1'})
    expect(result.output).toMatchObject({ok:true,book_id:'bible',edition_key:'kjv-en',chapter_number:1,paragraphs:[{index:0,text:'Let there be light.'}]})
    expect(loadEditionWindow).toHaveBeenLastCalledWith('bible','kjv-en',1)
  })
  it('rejects unknown chapters, invalid offsets and future text', async () => {
    for(const args of [{chapter_number:3},{chapter_title:'Does not exist'},{from_paragraph:-1},{from_paragraph:400}]) expect((await retrieveVoicePassage(context,args)).output.ok).toBe(false)
  })
  it('refuses later chapter numbers without loading the edition', async () => {
    vi.mocked(loadEditionWindow).mockClear()
    expect((await retrieveVoicePassage(context,{chapter_number:999})).output).toMatchObject({ok:false,reason:'later_chapter_spoiler_boundary'})
    expect(loadEditionWindow).not.toHaveBeenCalled()
  })
  it('never scripts a spoken retrieval failure and answers requested later-book questions from knowledge', async () => {
    const later = await retrieveVoicePassage(context,{chapter_number:3})
    expect(later.output).toMatchObject({ok:false,reason:'later_chapter_spoiler_boundary'})
    expect(later.responseInstructions).toMatch(/requested spoiler: answer it/)
    for(const args of [{chapter_number:3},{chapter_title:'Does not exist'},{from_paragraph:400}]) {
      const instructions = (await retrieveVoicePassage(context,args)).responseInstructions ?? ''
      expect(instructions).toMatch(/Answer the reader's actual question from your knowledge of the book/)
      expect(instructions).toMatch(/Never mention the lookup/)
      expect(instructions).not.toMatch(/Explain .*could not be retrieved/)
    }
  })
  it('reads a range of earlier chapters in one call for a recap, never past the reader (14 Oct 2026)', async () => {
    const lighthouse = { ...context, bookId: 'to-the-lighthouse', editionKey: 'original-en', chapterLabel: 'Chapter 5', chapterNumber: 5 }
    const chapters = [1, 2, 3, 4, 5].map(number => ({ number, title: `Chapter ${number}`, paragraphs: Array.from({ length: 20 }, (_, i) => `Chapter ${number} paragraph ${i}.`) }))
    vi.mocked(loadEditionWindow).mockResolvedValue({ chapters } as never)
    const result = await retrieveVoicePassage(lighthouse, { chapter_number: 2, through_chapter_number: 4 })
    const output = result.output as { ok: boolean; chapters: Array<{ chapter_number: number; paragraphs: Array<{ text: string }> }> }
    expect(output.ok).toBe(true)
    expect(output.chapters.map(chapter => chapter.chapter_number)).toEqual([2, 3, 4])
    // Whole short chapters, not a six-paragraph opening.
    expect(output.chapters.every(chapter => chapter.paragraphs.length === 20)).toBe(true)
    expect(result.responseInstructions).toMatch(/never offer to pull up or read a chapter/)
    expect(result.responseInstructions).toMatch(/Never tell the reader what text you have or lack/)
    expect((await retrieveVoicePassage(lighthouse, { chapter_number: 2, through_chapter_number: 9 })).output).toMatchObject({ ok: false, reason: 'later_chapter_spoiler_boundary' })
    expect(BOOK_PASSAGE_TOOL.parameters.properties).toHaveProperty('through_chapter_number')
    expect(BOOK_PASSAGE_TOOL.description).toMatch(/pass chapter_number and through_chapter_number together/)
    expect(BOOK_PASSAGE_TOOL.description).toMatch(/never tell the reader what text you have or offer to pull a chapter up/)
  })
  it('returns a whole chapter up to the budget with a continuation, not six paragraphs', async () => {
    const long = Array.from({ length: 400 }, (_, i) => `Paragraph ${i} ${'word '.repeat(40)}`)
    vi.mocked(loadEditionWindow).mockResolvedValue({ chapters: [{ number: 1, title: 'Genesis 1', paragraphs: long }, { number: 2, title: 'Genesis 2', paragraphs: context.paragraphs }] } as never)
    const output = (await retrieveVoicePassage(context, { chapter_number: 1 })).output as { paragraphs: Array<{ index: number; text: string }>; next_from_paragraph?: number }
    expect(output.paragraphs.length).toBeGreaterThan(6)
    expect(output.paragraphs.reduce((sum, p) => sum + p.text.length, 0)).toBeLessThanOrEqual(VOICE_PASSAGE_CHAR_BUDGET)
    expect(output.next_from_paragraph).toBe(output.paragraphs.length)
  })
})
