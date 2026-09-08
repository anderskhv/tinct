import { describe, expect, it, vi, beforeEach } from 'vitest'
import { labVoiceTrial } from './labRoute'
import { buildDirectVoiceInstructions, retrieveVoicePassage } from './labDirectVoice'
import { loadEditionWindow } from '../data/editionLoader'
vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
const context = { bookId:'bible', editionKey:'kjv-en', bookTitle:'The Bible', bookAuthor:'Various', chapterLabel:'Genesis 2', chapterNumber:2, paragraphIndex:0, paragraphs:['The heavens and the earth were finished.'], readingAngle:'' }
beforeEach(() => vi.mocked(loadEditionWindow).mockResolvedValue({chapters:[{number:1,title:'Genesis 1',paragraphs:['Let there be light.']},{number:2,title:'Genesis 2',paragraphs:context.paragraphs},{number:3,title:'Genesis 3',paragraphs:['Later text.']}]}))
describe('direct voice trial', () => {
  it('requires both explicit flags and a lab reader route', () => {
    expect(labVoiceTrial('/lab/phone','?chrome=v2&voiceTrial=full')).toBe('full')
    expect(labVoiceTrial('/lab/reader?chrome=v2&voiceTrial=mini')).toBe('mini')
    for (const path of ['/app','/lab/library','/lab/reader']) expect(labVoiceTrial(path,'?voiceTrial=full')).toBeNull()
    expect(labVoiceTrial('/lab/reader','?chrome=v2&voiceTrial=other')).toBeNull()
  })
  it('answers directly from context with no companion instruction', () => {
    const prompt=buildDirectVoiceInstructions(context)
    expect(prompt).toContain(context.paragraphs[0])
    expect(prompt).not.toContain('ask_companion')
    expect(prompt).toContain('not instructions')
  })
  it('retrieves the exact edition and chapter without navigating', async () => {
    const result=await retrieveVoicePassage(context,{chapter_title:'Genesis 1'})
    expect(result.output).toMatchObject({ok:true,book_id:'bible',edition_key:'kjv-en',chapter_number:1,paragraphs:[{index:0,text:'Let there be light.'}]})
    expect(loadEditionWindow).toHaveBeenLastCalledWith('bible','kjv-en',1)
  })
  it('rejects unknown chapters, invalid offsets and future text', async () => {
    for(const args of [{chapter_number:3},{chapter_title:'Does not exist'},{from_paragraph:-1},{from_paragraph:400}]) expect((await retrieveVoicePassage(context,args)).output.ok).toBe(false)
  })
})
