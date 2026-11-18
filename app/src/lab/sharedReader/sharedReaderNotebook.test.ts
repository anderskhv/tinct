import { expect, it } from 'vitest'
import type { ChatConversation } from '../../types'
import type { LabHighlight } from '../labHighlights'
import { sharedNotebookFilename, sharedNotebookMarkdown } from './sharedReaderNotebook'

const mark: LabHighlight = { id: 'hl-1780000000000-a', bookId: 'epub:abc', editionKey: 'own-en', chapterNumber: 2,
  paragraphIndex: 1, fromWord: 0, endParagraphIndex: 1, toWord: 3, color: 'gold', text: 'A saved quote', note: 'My note' }
const card: ChatConversation = { id: 'mc-one', bookId: 'epub:abc', chapterNumber: 2, startTimestamp: 1780000000001,
  endTimestamp: 1780000000002, preview: 'Explain', messages: [
    { id: 'q', role: 'user', content: 'Explain this.', timestamp: 1780000000001 },
    { id: 'a', role: 'assistant', content: 'A full answer.', timestamp: 1780000000002 },
  ], card: { id: 'one', kind: 'explain', chapterNumber: 2, text: 'A saved quote', at: 1780000000001, u: 1780000000002 } }

it('exports only this book, including unanswered legacy original-page records and full card turns', () => {
  const markdown = sharedNotebookMarkdown({ title: 'My EPUB', bookId: 'epub:abc', editionKey: 'own-en', highlights: [mark, { ...mark, id: 'other', bookId: 'emma', text: 'Other book' }],
    chapterNotes: [], conversations: [card, { ...card, id: 'mc-other', bookId: 'emma', messages: [{ ...card.messages[0], content: 'Other chat' }] }],
    legacyOwnEpubItems: [{ id: 'old-card', kind: 'card', page: 14, text: 'Old passage', note: 'My old note', at: 1780000000003,
      turns: [{ role: 'user', content: 'What happened?' }, { role: 'assistant', content: 'Original answer' }], data: { quiz: { score: 1 } } }],
    chapterTitle: n => `Chapter ${n}`, quote: highlight => highlight.text || null })
  expect(markdown).toContain('3 entries')
  expect(markdown).toContain('Original EPUB page 14')
  expect(markdown).toContain('> Old passage')
  expect(markdown).toContain('Original answer')
  expect(markdown).toContain('**Q.** What happened?')
  expect(markdown).toContain('**A.** Original answer')
  expect(markdown).toContain('"score": 1')
  expect(markdown).toContain('**Q.** Explain this.')
  expect(markdown).toContain('**A.** A full answer.')
  expect(markdown).toContain('> A saved quote')
  expect(markdown).toContain('My note')
  expect(markdown).not.toContain('Other book')
  expect(markdown).not.toContain('Other chat')
  expect(markdown.indexOf('Original EPUB page 14')).toBeLessThan(markdown.indexOf('## explain'))
})

it('excludes tombstones and safely names a Markdown download', () => {
  const markdown = sharedNotebookMarkdown({ title: 'Book', bookId: 'emma', editionKey: 'original-en', highlights: [], chapterNotes: [],
    conversations: [{ ...card, bookId: 'emma', messages: [], card: { ...card.card!, gone: true } }], chapterTitle: () => 'Chapter', quote: () => null })
  expect(markdown).toContain('0 entries')
  expect(sharedNotebookFilename('Bad / title:*?')).toBe('Bad title notebook.md')
})
