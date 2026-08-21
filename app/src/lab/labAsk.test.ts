import { describe, expect, it } from 'vitest'
import { labConversationState, labVoiceContext } from './labAsk'

describe('lab conversation state', () => {
  it('stays idle when the session failed', () => {
    expect(labConversationState({
      phase: 'speaking',
      starting: true,
      error: 'Microphone access is needed for voice.',
    })).toBe('idle')
  })

  it('shows listening while a real session is connecting', () => {
    expect(labConversationState({ phase: 'idle', starting: true })).toBe('listening')
  })

  it('passes through live phases', () => {
    expect(labConversationState({ phase: 'thinking' })).toBe('thinking')
    expect(labConversationState({ phase: 'speaking' })).toBe('speaking')
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
