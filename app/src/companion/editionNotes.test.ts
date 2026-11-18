import { describe, expect, it } from 'vitest'
import { WEBC_NUMBERING_NOTE, editionNumberingNote } from './editionNotes'
import { buildLabAskInstructions, type LabAskContext } from './labAskPrompt'
import { buildLabTalkReference } from '../lab/labDirectVoice'

const context = (bookId: string, editionKey: string): LabAskContext => ({
  bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Esther 4', chapterNumber: 430,
  editionLabel: 'World English Bible, Catholic Edition', paragraphs: ['¹ But Mordecai, having perceived what was done…'],
  paragraphIndex: 0, bookId, editionKey,
})

describe('Catholic Bible numbering note', () => {
  it('is given for the Bible in the Catholic edition only', () => {
    expect(editionNumberingNote('bible', 'webc-en')).toBe(WEBC_NUMBERING_NOTE)
    expect(editionNumberingNote('bible', 'bible-webc-en')).toBe(WEBC_NUMBERING_NOTE)
    expect(editionNumberingNote('bible', 'web-en')).toBeNull()
    expect(editionNumberingNote('bible', 'kjv-en')).toBeNull()
    expect(editionNumberingNote('odyssey', 'webc-en')).toBeNull()
    expect(editionNumberingNote(undefined, undefined)).toBeNull()
  })

  it('maps the old Vulgate numbering to this edition', () => {
    for (const fragment of ['10:4–13 and 11:1', '11:2–12', '12:1–6', '13:1–7', '13:8–18', '14:1–19', '15:1–16', '16:1–24', 'Daniel (Greek) 13', 'Daniel 3:24–90']) {
      expect(WEBC_NUMBERING_NOTE).toContain(fragment)
    }
  })

  it('reaches the chat system prompt and the Talk reference for the Catholic edition', () => {
    expect(buildLabAskInstructions(context('bible', 'webc-en'))).toContain(WEBC_NUMBERING_NOTE)
    expect(JSON.parse(buildLabTalkReference(context('bible', 'webc-en'), [])).editionNote).toBe(WEBC_NUMBERING_NOTE)
  })

  it('is absent from other editions and books', () => {
    expect(buildLabAskInstructions(context('bible', 'web-en'))).not.toContain('Edition note')
    expect(buildLabAskInstructions(context('odyssey', 'original-en'))).not.toContain('Edition note')
    expect(JSON.parse(buildLabTalkReference(context('bible', 'kjv-en'), [])).editionNote).toBeUndefined()
  })
})
