import { describe, expect, it } from 'vitest'
import type { ChatConversation } from '../../types'
import { mergeChatConversations, parseChatConversations } from '../labChatHistory'
import { catalogueCardConversation, ownTextCardDraft, tombstoneCatalogueCard, upsertCatalogueCard, type SharedReaderCard } from './sharedReaderCards'

const card = (overrides: Partial<SharedReaderCard> = {}): SharedReaderCard => ({
  source: { kind: 'catalogue', bookId: 'bible' }, id: 'shared-1', kind: 'explain', chapterNumber: 595,
  anchor: { editionKey: 'kjv-en', chapterNumber: 595, paragraphIndex: 2, fromWord: 3, endParagraphIndex: 2, toWord: 8 },
  text: 'A quoted passage from the text', turns: [{ role: 'assistant', content: 'A grounded explanation.' }],
  at: 1000, u: 1000, ...overrides,
})

describe('shared reader card boundary', () => {
  it('keeps Bible/source-word identity and every supported action in the established chat card shape', () => {
    for (const kind of ['explain', 'simplify', 'define', 'factcheck', 'counterpoint', 'quiz', 'ask', 'primer', 'catchup', 'recap'] as const) {
      const input = card({ id: `card-${kind}`, kind })
      const saved = catalogueCardConversation(input)!
      expect(saved.id).toBe(`mc_card-${kind}`)
      expect(saved.bookId).toBe('bible')
      expect(saved.card).toMatchObject({ kind, chapterNumber: 595, anchor: input.anchor, text: input.text })
      expect(saved.messages.map(message => message.role)).toEqual(['user', 'assistant'])
      expect(saved.messages[0]).toMatchObject({ highlightedText: input.text, chapterNumber: 595, paragraphIndex: 2 })
      expect(parseChatConversations([saved], 'bible')[0].card?.anchor).toEqual(input.anchor)
    }
  })

  it('never puts owned EPUB/paste text into the catalogue history', () => {
    const privateCard = card({ source: { kind: 'own-text', bookId: 'user-book-epub-123', ownHex: 'abc123', converter: 2, editionKey: 'own-en' } })
    expect(catalogueCardConversation(privateCard)).toBeNull()
    expect(catalogueCardConversation(card({ source: { kind: 'catalogue', bookId: 'userbook-abcdef1234567890' } }))).toBeNull()
    const current = [catalogueCardConversation(card())!]
    expect(upsertCatalogueCard(current, privateCard)).toBe(current)
  })

  it('maps complete private source-word cards to the owner adapter without a PDF page or catalogue row', () => {
    const own = { kind: 'own-text' as const, bookId: 'userbook-abcdef1234567890', ownHex: 'abcdef1234567890', converter: 2, editionKey: 'own-en' as const }
    const range = { editionKey: 'own-en', chapterNumber: 2, paragraphIndex: 3, fromWord: 4, endParagraphIndex: 3, toWord: 7 }
    const privateCard = card({ source: own, id: 'own-card-one', kind: 'quiz', chapterNumber: 2, anchor: range,
      turns: [{ role: 'user', content: 'Quiz me.', at: 1000 }, { role: 'assistant', content: 'Question one.', at: 1001 }] })
    expect(catalogueCardConversation(privateCard)).toBeNull()
    expect(ownTextCardDraft(privateCard)).toMatchObject({ v: 'text-v1', id: 'own-card-one', kind: 'quiz',
      anchor: { editionKey: 'own-en', converter: 2, chapterNumber: 2, kind: 'range', paragraphIndex: 3, fromWord: 4, endParagraphIndex: 3, toWord: 7 },
      turns: [{ role: 'user', content: 'Quiz me.' }, { role: 'assistant', content: 'Question one.' }] })
    expect(ownTextCardDraft({ ...privateCard, anchor: undefined })).toMatchObject({ anchor: { editionKey: 'own-en', converter: 2, chapterNumber: 2, kind: 'chapter' } })
    expect(ownTextCardDraft({ ...privateCard, turns: [{ role: 'user', content: 'No answer.' }] })).toBeNull()
    expect(ownTextCardDraft({ ...privateCard, source: { ...own, bookId: 'userbook-someoneelse' } })).toBeNull()
    expect(ownTextCardDraft({ ...privateCard, anchor: { ...range, editionKey: 'own-da' } })).toBeNull()
  })

  it('waits for a completed answer and refuses invalid anchors or oversize cards without truncating a saved answer', () => {
    expect(catalogueCardConversation(card({ turns: [{ role: 'user', content: 'Why?' }] }))).toBeNull()
    expect(catalogueCardConversation(card({ anchor: { editionKey: 'kjv-en', chapterNumber: 595, paragraphIndex: 2, fromWord: 8, endParagraphIndex: 2, toWord: 3 } }))).toBeNull()
    expect(catalogueCardConversation(card({ anchor: { editionKey: 'kjv-en', chapterNumber: 595, paragraphIndex: 3, fromWord: 0, endParagraphIndex: 2, toWord: 8 } }))).toBeNull()
    expect(catalogueCardConversation(card({ data: { huge: 'x'.repeat(9000) } }))).toBeNull()
    expect(catalogueCardConversation(card({ text: 'x'.repeat(2001) }))).toBeNull()
    expect(catalogueCardConversation(card({ turns: [{ role: 'assistant', content: 'x'.repeat(6001) }] }))).toBeNull()
    expect(catalogueCardConversation(card({ kind: 'unknown' as SharedReaderCard['kind'] }))).toBeNull()
    expect(catalogueCardConversation(card({ data: new Date(0) }))).toBeNull()
    expect(catalogueCardConversation(card({ turns: [{ role: 'other' as 'assistant', content: 'Answer' }] }))).toBeNull()
    const own = { kind: 'own-text' as const, bookId: 'userbook-abcdef1234567890', ownHex: 'abcdef1234567890', converter: 2, editionKey: 'own-en' as const }
    expect(ownTextCardDraft(card({ source: own, id: 'own-card-one', chapterNumber: 2, anchor: undefined,
      turns: [{ role: 'assistant', content: 'x'.repeat(12_001) }] }))).toBeNull()
    expect(ownTextCardDraft(card({ source: own, id: 'own-card-one', chapterNumber: 2, anchor: undefined, data: new Date(0) }))).toBeNull()
  })

  it('merges a card without replacing live chat, then keeps a deletion across a stale device merge', () => {
    const normal: ChatConversation = { id: 'chat-1', bookId: 'bible', chapterNumber: 595, startTimestamp: 900, endTimestamp: 900,
      preview: 'A question', messages: [{ id: 'chat-message-1', role: 'user', bookId: 'bible', content: 'A question', timestamp: 900 }] }
    const stored = upsertCatalogueCard([normal], card())
    expect(stored).toHaveLength(2)
    expect(stored[0].messages[0].id).toBe('chat-message-1')
    expect(upsertCatalogueCard(stored, card())).toBe(stored)
    const answered = upsertCatalogueCard(stored, card({ u: 1200, turns: [
      { role: 'user', content: 'Explain this passage.' }, { role: 'assistant', content: 'A newer answer.' },
    ] }))
    expect(answered.find(item => item.card)?.messages.slice(-1)[0]?.content).toBe('A newer answer.')
    const gone = tombstoneCatalogueCard(answered, 'shared-1', 1300)
    expect(gone.find(item => item.card)?.card).toMatchObject({ gone: true, u: 1300 })
    expect(gone.find(item => item.card)?.messages).toEqual([])
    expect(mergeChatConversations(gone, answered).find(item => item.card)?.card?.gone).toBe(true)
    expect(upsertCatalogueCard(gone, card({ u: 1200 }))).toBe(gone)
    expect(upsertCatalogueCard(gone, card({ u: 1400 })).find(item => item.card)?.card?.gone).toBeUndefined()
    expect(gone.find(item => item.id === 'chat-1')?.messages).toHaveLength(1)
  })

  it('merges a shorter corrected card answer by revision without changing ordinary chat union', () => {
    const older = catalogueCardConversation(card({ turns: [{ role: 'assistant', content: 'An old, overlong answer with a mistaken claim.' }] }))!
    const newer = catalogueCardConversation(card({ u: 2000, turns: [{ role: 'assistant', content: 'Corrected.' }] }))!
    for (const order of [[older, newer], [newer, older]]) {
      const merged = mergeChatConversations([order[0]], [order[1]])[0]
      expect(merged.card?.u).toBe(2000)
      expect(merged.messages.slice(-1)[0]?.content).toBe('Corrected.')
      expect(merged.messages).toHaveLength(2)
    }
    const chat = (id: string, content: string): ChatConversation => ({ id: 'ordinary', bookId: 'bible', chapterNumber: 595,
      startTimestamp: 1, endTimestamp: 2, preview: 'question', messages: [{ id, role: 'user', content, timestamp: 1 }] })
    expect(mergeChatConversations([chat('a', 'first')], [chat('b', 'second')])[0].messages.map(message => message.id)).toEqual(['a', 'b'])
  })
})
