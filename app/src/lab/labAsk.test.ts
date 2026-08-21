import { describe, expect, it } from 'vitest'
import { VOICE_AGENT_POLICY } from '../voice/context'
import {
  buildLabConversationInstructions,
  LAB_CONVERSATION_POLICY,
  labConversationState,
  numberedChapterParagraphs,
} from './labAsk'

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

describe('lab conversation brief', () => {
  const paragraphs = [
    'Tell me, O Muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy.',
    'So now all who escaped death in battle or by shipwreck had got safely home except Ulysses, and he, though he was longing to return to his wife and country, was detained by the goddess Calypso, who had got him into a large cave and wanted to marry him.',
    'Now Neptune had gone off to the Ethiopians, who are at the world’s end, and lie in two halves, the one looking West and the other East.',
    ...Array.from({ length: 5 }, (_, index) => `Later paragraph ${index + 4}`),
  ]

  it('sends the full numbered chapter so Book 1 paragraph 2 is in the payload', () => {
    const instructions = buildLabConversationInstructions({
      bookTitle: 'The Odyssey',
      bookAuthor: 'Homer',
      chapterLabel: 'Book 1',
      paragraphs,
      paragraphIndex: 0,
      readingAngle: 'homecoming',
    })

    expect(numberedChapterParagraphs(paragraphs)).toContain('2. So now all who escaped death')
    expect(instructions).toContain('1. Tell me, O Muse')
    expect(instructions).toContain('2. So now all who escaped death')
    expect(instructions).toContain('8. Later paragraph 8')
    expect(instructions).toContain('The reader is on paragraph 1 of 8')
    expect(instructions).toContain('homecoming')
  })

  it('uses a desk conversation brief and a hard spoiler rule', () => {
    const instructions = buildLabConversationInstructions({
      bookTitle: 'The Odyssey',
      bookAuthor: 'Homer',
      chapterLabel: 'Book 1',
      paragraphs,
      paragraphIndex: 0,
    })

    expect(LAB_CONVERSATION_POLICY).toContain('conversation at the desk')
    expect(instructions).toContain('only have this chapter so far')
    expect(instructions).toContain('No ending')
    expect(instructions).toContain('Do not ask them to paste it')
    expect(instructions).toContain('Do not say you lack the book')
    expect(instructions).not.toContain('return control to audiobook')
    expect(instructions).not.toContain('20–30 seconds')
    expect(instructions).not.toContain(VOICE_AGENT_POLICY)
  })
})
