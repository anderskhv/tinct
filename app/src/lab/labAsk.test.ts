import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { VOICE_AGENT_POLICY } from '../voice/context'
import {
  buildLabAskInstructions,
  labConversationState,
  numberedLabChapter,
} from './labAsk'

describe('lab conversation state', () => {
  it('stays idle when the session failed', () => {
    expect(labConversationState({
      voiceState: 'answering',
      error: 'Sign in to ask by voice.',
      starting: true,
    })).toBe('idle')
  })

  it('goes connecting the moment start is requested', () => {
    expect(labConversationState({ voiceState: 'reading' })).toBe('idle')
    expect(labConversationState({ voiceState: 'reading', starting: true })).toBe('connecting')
    expect(labConversationState({ voiceState: 'conversation_idle' })).toBe('connecting')
    expect(labConversationState({ voiceState: 'resume_pending' })).toBe('connecting')
  })

  it('maps listening and answering, with connecting instead of a thinking state', () => {
    expect(labConversationState({ voiceState: 'listening' })).toBe('listening')
    expect(labConversationState({ voiceState: 'answering' })).toBe('speaking')
    expect(Object.values({
      idle: labConversationState({ voiceState: 'reading' }),
      connecting: labConversationState({ voiceState: 'reading', starting: true }),
      listening: labConversationState({ voiceState: 'listening' }),
      speaking: labConversationState({ voiceState: 'answering' }),
    })).not.toContain('thinking')
  })
})

describe('lab ask context', () => {
  const paragraphs = [
    'Tell me, O Muse, of that ingenious hero.',
    'So now all who escaped death in battle or by shipwreck had got safely home except Ulysses.',
    'Now Neptune had gone off to the Ethiopians.',
  ]

  it('numbers the full chapter so paragraph 2 is in the payload', () => {
    const numbered = numberedLabChapter(paragraphs)
    expect(numbered).toContain('[1] Tell me, O Muse')
    expect(numbered).toContain('[2] So now all who escaped death')
    expect(numbered).toContain('[3] Now Neptune')
  })

  it('sends the whole chapter and refuses later plot', () => {
    const instructions = buildLabAskInstructions({
      bookTitle: 'The Odyssey',
      bookAuthor: 'Homer',
      chapterLabel: 'Book 1',
      paragraphs,
      paragraphIndex: 0,
      readingAngle: 'homecoming',
    })
    expect(instructions).toContain('[2] So now all who escaped death')
    expect(instructions).toContain('only have this chapter so far')
    expect(instructions).toContain('Do not ask them to paste')
    expect(instructions).toContain('Do not say you lack the book')
    expect(instructions).toContain('no Book 3')
    expect(instructions).toContain('no ending')
    expect(instructions).toContain('Reading angle: homecoming')
    expect(instructions).not.toContain(VOICE_AGENT_POLICY)
    expect(instructions).not.toContain('Speak for about 20')
    expect(instructions).not.toContain('resume_audiobook')
    expect(instructions).not.toContain('return control to audiobook')
  })

  it('leaves production in-car instructions on the AudioStrip path', () => {
    const strip = readFileSync(resolve(__dirname, '../components/AudioStrip.tsx'), 'utf8')
    const session = readFileSync(resolve(__dirname, '../hooks/useVoiceSession.ts'), 'utf8')
    const context = readFileSync(resolve(__dirname, '../voice/context.ts'), 'utf8')
    expect(context).toContain('Speak for about 20–30 seconds')
    expect(context).toContain('resume_audiobook')
    expect(session).toContain('Production AudioStrip leaves this unset')
    expect(strip).not.toContain("from '../lab/")
    expect(strip).not.toContain('buildLabAskInstructions')
  })
})

describe('lab voice phase is not a timer', () => {
  it('only maps the live voice machine, including cancellable connecting', () => {
    expect(labConversationState({ voiceState: 'reading', starting: true })).toBe('connecting')
    expect(labConversationState({ voiceState: 'reading', starting: false })).toBe('idle')
    expect(labConversationState({ voiceState: 'listening', starting: false })).toBe('listening')
    expect(labConversationState({ voiceState: 'reading', starting: true, error: 'stopped' })).toBe('idle')
  })
})
