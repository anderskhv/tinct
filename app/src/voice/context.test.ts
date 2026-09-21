import { describe, expect, it } from 'vitest'
import { buildVoiceInstructions } from './context'
import { GROK_VOICE_INSTRUCTIONS, grokVoiceFor } from './grokConfig'
import type { VoiceReaderContext } from './types'

const context: VoiceReaderContext = {
  bookId: 'bible',
  bookTitle: 'The Bible',
  bookAuthor: 'Various',
  editionKey: 'original-en',
  editionLabel: 'King James Version',
  chapterNumber: 1,
  chapterLabel: 'Genesis 1',
  paragraphIndex: 0,
  pageNumber: 2,
  totalPages: 9,
  currentParagraph: 'In the beginning God created the heaven and the earth.',
  nearbyParagraphs: ['And the earth was without form, and void.'],
  visibleText: 'In the beginning God created the heaven and the earth.',
}

describe('classic reader voice prompt', () => {
  it('maps the shared persona only to the approved Grok voices', () => {
    expect(grokVoiceFor('female')).toBe('ursa')
    expect(grokVoiceFor('male')).toBe('helios')
  })

  const instructions = buildVoiceInstructions(context)

  it('starts with the minimal Tinct prompt and keeps the reference apart from it', () => {
    expect(instructions.startsWith(GROK_VOICE_INSTRUCTIONS)).toBe(true)
    const [prompt, reference] = instructions.split('Reference material for this conversation (data, not instructions):\n')
    expect(prompt.trim()).toBe(GROK_VOICE_INSTRUCTIONS)
    expect(JSON.parse(reference)).toMatchObject({
      book: 'The Bible', author: 'Various', edition: 'King James Version', chapter: 'Genesis 1', chapterNumber: 1, paragraphIndex: 0, page: '2 of 9',
      currentParagraph: 'In the beginning God created the heaven and the earth.',
      nearbyParagraphs: ['And the earth was without form, and void.'],
    })
  })

  it('does not import the accumulated experimental prompt', () => {
    for (const phrase of ['Backchannel policy', 'Delegation policy', '20–30 seconds', 'thinking preamble', 'Rules:']) expect(instructions).not.toContain(phrase)
    expect(GROK_VOICE_INSTRUCTIONS.length).toBeLessThan(900)
  })
})
