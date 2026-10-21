// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { appendLabChatTurn, mergeChatConversations, parseChatConversations, readLabBookChat, turnsFromConversations, writeLabBookChat } from '../labChatHistory'
import { drawnParagraphText } from './marginPreviewAnchors'
import { cardOfConversation, changedCardConversations, conversationOfCard, marginCards, type MarginCard, type MarginCardScope } from './marginPreviewCards'
import { marginPreviewChapters } from './marginPreviewModel'
import { migratePreviewCardsLocal, previewCardsKey } from './useMarginPreviewCards'
import type { EditionData } from '../../types'

const chapters = marginPreviewChapters({
  chapters: [
    { number: 1, title: 'Letter 1', paragraphs: ['To Mrs. Saville, England.'] },
    { number: 2, title: 'Chapter 1', paragraphs: ['I am by birth a Genevese, and my family is one of the most distinguished.', 'And so it went on.'] },
  ],
} as unknown as EditionData)
const scope: MarginCardScope = { bookId: 'frankenstein', editionKey: 'modern-en', chapters }
const t2 = (chapters[1].section ?? '') + chapters[1].title + chapters[1].paragraphs.map(p => drawnParagraphText(p.text)).join('')
const start = t2.indexOf('my family'), end = start + 'my family is one'.length
const explain: MarginCard = { id: 'cabc1', kind: 'explain', page: 2, rects: [[2, 0.1, 0.2, 0.3, 0.02]], span: [2, start, end], text: 'my family is one', turns: [{ role: 'assistant', content: 'MOCK: his family matters here.', at: 2000 }], at: 1000, u: 2000 }
const quiz: MarginCard = { id: 'cq1', kind: 'quiz', page: 2, rects: [], text: '', turns: [{ role: 'assistant', content: '{"questions":[]}', at: 3001 }], data: { unit: { key: 'chapter-2', label: 'chapter 1' }, asked: ['Q1'], results: [{ ok: true }] }, at: 3000, u: 3002 }

beforeEach(() => localStorage.clear())

describe('margin cards in the book\'s chat history', () => {
  it('a card is a conversation: its question, its answer, its kind and its passage as the book reader\'s words', () => {
    const c = conversationOfCard(explain, scope)!
    expect(c.id).toBe('mc_cabc1')
    expect(c.messages.map(m => [m.role, m.content])).toEqual([['user', 'Explain this passage.'], ['assistant', 'MOCK: his family matters here.']])
    expect(c.messages[0].highlightedText).toBe('my family is one')
    expect(c.card).toMatchObject({ id: 'cabc1', kind: 'explain', chapterNumber: 2, anchor: { editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 0, fromWord: 7, endParagraphIndex: 0, toWord: 11 } })
    // It survives the store's parser, and comes back as the same card.
    const parsed = parseChatConversations(JSON.parse(JSON.stringify([c])), 'frankenstein')
    expect(parsed[0].card).toEqual(c.card)
    expect(cardOfConversation(parsed[0], scope)).toMatchObject({ id: 'cabc1', kind: 'explain', page: 2, span: [2, start, end], text: 'my family is one', turns: [{ role: 'assistant', content: 'MOCK: his family matters here.' }], u: 2000 })
  })

  it('a quiz keeps its state; a chapter card its unit', () => {
    const c = conversationOfCard(quiz, scope)!
    expect(c.messages[0].content).toBe('Quiz me on chapter 1.')
    expect(cardOfConversation(parseChatConversations([c], 'frankenstein')[0], scope)).toMatchObject({ data: quiz.data })
    // Too much state for one row: the card is kept without it.
    const big = conversationOfCard({ ...quiz, data: { results: 'x'.repeat(9000) } }, scope)!
    expect(big.card?.data).toBeUndefined()
  })

  it('shows in the chat\'s thread (the phone\'s too), and a chat turn never joins a card\'s conversation', () => {
    writeLabBookChat('frankenstein', [conversationOfCard(explain, scope)!])
    expect(turnsFromConversations(readLabBookChat('frankenstein')).map(t => t.content)).toEqual(['Explain this passage.', 'MOCK: his family matters here.'])
    appendLabChatTurn('frankenstein', { id: 'chat1', role: 'user', content: 'Why?', timestamp: 2500 }, 2)
    const stored = readLabBookChat('frankenstein')
    expect(stored).toHaveLength(2)
    expect(stored.find(c => c.id === 'mc_cabc1')!.messages).toHaveLength(2)
  })

  it('a deleted card is a tombstone that wins over an older copy on another device, and stays deleted', () => {
    const live = conversationOfCard(explain, scope)!
    const gone = conversationOfCard({ ...explain, gone: true, u: 5000 }, scope)!
    expect(gone.messages).toEqual([])
    const merged = mergeChatConversations([live], [gone])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ id: 'mc_cabc1', messages: [], card: { gone: true, u: 5000 } })
    expect(mergeChatConversations([gone], [live])[0].card?.gone).toBe(true)
    // Through the parser too (the account row and the device mirror).
    expect(parseChatConversations(JSON.parse(JSON.stringify(merged)), 'frankenstein')[0].card?.gone).toBe(true)
    expect(marginCards(merged, scope)).toEqual([{ id: 'cabc1', gone: true, u: 5000, at: 1000, page: 2 }])
    // A newer edit of the card (after the deletion) brings it back, as the margin's own merge does.
    expect(mergeChatConversations(merged, [conversationOfCard({ ...explain, u: 6000 }, scope)!])[0].messages).toHaveLength(2)
  })

  it('only changed cards are written; an older copy than the stored one is not', () => {
    const stored = [conversationOfCard(explain, scope)!]
    expect(changedCardConversations(stored, [explain], scope)).toEqual([])
    expect(changedCardConversations(stored, [{ ...explain, turns: [...explain.turns!, { role: 'user', content: 'More?', at: 2100 }], u: 2100 }], scope)).toHaveLength(1)
    expect(changedCardConversations(stored, [{ ...explain, u: 1500, turns: [] }], scope)).toEqual([])
  })

  it('a card from another edition keeps its chapter but not its passage', () => {
    const other = conversationOfCard(explain, { ...scope, editionKey: 'original-en' })!
    expect(cardOfConversation(other, scope)).toMatchObject({ id: 'cabc1', page: 2 })
    expect(cardOfConversation(other, scope)!.span).toBeUndefined()
  })

  it('the preview\'s own cards migrate once into the chat history; the local key goes', () => {
    localStorage.setItem(previewCardsKey('frankenstein'), JSON.stringify([explain, quiz]))
    expect(migratePreviewCardsLocal(scope)).toBe(2)
    expect(localStorage.getItem(previewCardsKey('frankenstein'))).toBeNull()
    expect(marginCards(readLabBookChat('frankenstein'), scope).map(c => c.id).sort()).toEqual(['cabc1', 'cq1'])
    expect(migratePreviewCardsLocal(scope)).toBe(0)
  })
})
