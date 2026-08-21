import { describe, expect, it } from 'vitest'
import { labConversationState, labVoiceContext } from './labAsk'

describe('lab conversation state', () => {
  it('stays idle when the session failed', () => {
    expect(labConversationState({
      voiceState: 'answering',
      error: 'Sign in to ask by voice.',
    })).toBe('idle')
  })

  it('stays idle until the live session is listening', () => {
    expect(labConversationState({ voiceState: 'reading' })).toBe('idle')
    expect(labConversationState({ voiceState: 'conversation_idle' })).toBe('idle')
    expect(labConversationState({ voiceState: 'resume_pending' })).toBe('idle')
  })

  it('maps listening and answering only, with no thinking state', () => {
    expect(labConversationState({ voiceState: 'listening' })).toBe('listening')
    expect(labConversationState({ voiceState: 'answering' })).toBe('speaking')
    expect(Object.values({
      idle: labConversationState({ voiceState: 'reading' }),
      listening: labConversationState({ voiceState: 'listening' }),
      speaking: labConversationState({ voiceState: 'answering' }),
    })).not.toContain('thinking')
  })
})

describe('lab voice context', () => {
  it('keeps nearby paragraphs tight', () => {
    const paragraphs = Array.from({ length: 8 }, (_, index) => `Paragraph ${index + 1}`)
    const context = labVoiceContext({
      bookTitle: 'The Odyssey',
      bookAuthor: 'Homer',
      chapterLabel: 'Book 1',
      paragraphs,
      paragraphIndex: 0,
      readingAngle: 'homecoming',
    })
    expect(context.bookTitle).toBe('The Odyssey')
    expect(context.currentParagraph).toBe('Paragraph 1')
    expect(context.nearbyParagraphs?.join(' ')).toContain('Paragraph 2')
    expect(context.nearbyParagraphs?.join(' ')).not.toContain('Paragraph 8')
    expect(context.readingAngle).toBe('homecoming')
  })
})
