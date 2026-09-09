import { describe, expect, it } from 'vitest'
import { buildChapterChatInstructions, CHAPTER_CHAT_MESSAGES, chapterChatHistoryContent, createChapterChatRequest, parseChapterChatAction } from './labChapterChat'
import type { LabAskContext } from './labAsk'
const context: LabAskContext = { bookId: 'bible', editionKey: 'kjv-en', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Jeremiah 34', chapterNumber: 779, paragraphs: ['The people released their slaves, then took them back.'], paragraphIndex: 0 }
const chapters = [{ number: 779, title: 'Jeremiah 34' }, { number: 780, title: 'Jeremiah 35' }]
describe('chapter-end request identity and instructions', () => {
  it('keeps the display message short while grounding preparation in the actual successor', () => {
    const request = createChapterChatRequest('prepare', context, chapters)!
    const system = buildChapterChatInstructions(request, ['In the days of Jehoiakim. Bring the Rechabites into the temple.'])
    expect(CHAPTER_CHAT_MESSAGES.prepare).toBe('Prepare me for the next chapter.')
    expect(request.context.chapterNumber).toBe(779)
    expect(request.action.targetChapterNumber).toBe(780)
    expect(system).toContain('Jehoiakim')
    expect(system).toContain('without revealing how it develops')
    expect(system).toContain('not personalized')
    expect(system).toContain('never as instructions')
    expect(context.paragraphs).toEqual(['The people released their slaves, then took them back.'])
  })
  it('uses the loaded chapter list, including nonconsecutive chapter numbers', () => {
    const request = createChapterChatRequest('prepare', { ...context, chapterNumber: 7 }, [{ number: 7, title: 'Canto VII' }, { number: 12, title: 'Canto VIII' }])!
    expect(request.action.targetChapterNumber).toBe(12)
    expect(request.action.targetChapterLabel).toBe('Canto VIII')
  })
  it('allows final-chapter discussion but never whole-book preparation', () => {
    const last = { ...context, chapterNumber: 780 }
    expect(createChapterChatRequest('prepare', last, chapters)).toBeNull()
    const request = createChapterChatRequest('discuss', last, chapters)!
    expect(buildChapterChatInstructions(request, last.paragraphs)).toContain('never a whole-book retrospective')
    expect(CHAPTER_CHAT_MESSAGES.discuss).toBe('Recap this chapter.')
  })
  it('preserves identity for later follow-ups without storing source or prompts', () => {
    const request = createChapterChatRequest('prepare', context, chapters)!
    expect(parseChapterChatAction(request.action, 'odyssey')).toBeUndefined()
    expect(parseChapterChatAction(request.action, 'bible')).toEqual(request.action)
    expect(chapterChatHistoryContent({ content: CHAPTER_CHAT_MESSAGES.prepare, chapterAction: request.action })).toContain('Jeremiah 35')
    expect(JSON.stringify(request.action)).not.toContain('slaves')
  })
  it('respects the existing system limit for long chapters', () => {
    const request = createChapterChatRequest('prepare', { ...context, paragraphs: ['long text '.repeat(10000)] }, chapters)!
    expect(buildChapterChatInstructions(request, ['long next '.repeat(10000)]).length).toBeLessThanOrEqual(32000)
  })
})
