import { describe, expect, it, vi, beforeEach } from 'vitest'
import { buildLabTalkReference, retrieveVoicePassage } from './labDirectVoice'
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
})
