import { describe, expect, it } from 'vitest'
import { LAB_ASK_DANISH_EDITION_NOTE, buildLabAskInstructions, editionLanguageNote } from './labAskPrompt'

// The companion's language (Anders, 22 Oct 2026): Danish for a Danish edition, else the reader's own language.
describe('the companion answers in the reader’s language', () => {
  const context = { bookTitle: 'To the Lighthouse', bookAuthor: 'Virginia Woolf', chapterLabel: 'The Window', paragraphs: ['First.', 'Second.'], paragraphIndex: 0, bookId: 'to-the-lighthouse' }
  it('Danish for a Danish edition', () => {
    expect(editionLanguageNote('modern-da')).toBe(LAB_ASK_DANISH_EDITION_NOTE)
    const prompt = buildLabAskInstructions({ ...context, editionKey: 'modern-da' })
    expect(prompt).toContain('answer in Danish unless the reader writes in another language')
  })
  it('adds nothing for any other edition', () => {
    expect(editionLanguageNote('modern-en')).toBeNull()
    const prompt = buildLabAskInstructions({ ...context, editionKey: 'modern-en' })
    expect(prompt).not.toContain('Danish')
  })
})
