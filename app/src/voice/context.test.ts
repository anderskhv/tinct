import { describe, expect, it } from 'vitest'
import { buildVoiceInstructions } from './context'
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
  currentParagraph: 'In the beginning God created the heaven and the earth.',
  nearbyParagraphs: [],
  visibleText: 'In the beginning God created the heaven and the earth.',
}

describe('production voice knowledge policy', () => {
  const instructions = buildVoiceInstructions(context)

  it('treats reader context as a spoiler and wording boundary, not a general-knowledge restriction', () => {
    expect(instructions).toContain('The open chapter is context, not a limit on what you may know.')
    expect(instructions).toContain('literature, religion, history, philosophy, art, and other books')
    expect(instructions).toContain('For familiar, stable facts, answer directly from reliable general knowledge')
  })

  it('reserves source lookup for claims that actually need verification', () => {
    expect(instructions).toContain('requests an exact quotation or edition wording')
    expect(instructions).toContain('asks for an exhaustive absence claim')
    expect(instructions).toContain('attributes a claim to a named person')
    expect(instructions).toContain('Never claim to have checked a source unless a tool result or the supplied text supports that claim.')
  })

  it('still gives useful known context when a needed lookup is unavailable', () => {
    expect(instructions).toContain('say exactly what remains unverified in one short clause')
    expect(instructions).toContain('still answer the reliable part you do know')
  })

  it('forbids thinking preambles, restriction speeches, and research offloading', () => {
    expect(instructions).toContain('Start with the answer.')
    expect(instructions).toContain('Do not begin with a thinking preamble')
    expect(instructions).toContain('send the reader away to research it themselves')
  })
})
