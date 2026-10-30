/**
 * Margin cards in the book's chat history (Anders, 20 Oct 2026). Explain, Simplify, Define, Ask, Before you start,
 * Catch me up, Recap, Quiz me, Fact-check, Counterpoint and the rest are kept where the book's chats are,
 * `chat-history:{bookId}` (labChatHistory.ts: the device mirror and the versioned account row), so they sync,
 * export and delete as chats do, and show in the phone's chat for the book. One card is one conversation
 * (`mc_<card id>`): its question and answers are the messages, and `card` holds its kind, its passage as the book
 * reader's words, and its own small state (a quiz's answers, a chapter card's unit).
 *
 * The margin reader (reader.js) holds a card as { id, kind, page, rects, span: [page, start, end], text, turns,
 * data, at, u, gone? } with its passage as character offsets in the chapter; marginPreviewAnchors converts.
 * Pure.
 */
import type { ChatCard, ChatConversation, ChatMessage } from '../../types'
import { LAB_CHAT_CARD_DATA_CHARS } from '../labChatHistory'
import { chapterOfPage, offsetsOfRange, pageOfChapter, rangeOfOffsets } from './marginPreviewAnchors'
import type { MarginPreviewChapter } from './marginPreviewModel'

export interface MarginCardTurn { role: string; content?: string; at?: number; [key: string]: unknown }
export interface MarginCard {
  id: string
  kind?: string
  page?: number
  rects?: number[][]
  span?: [number, number, number]
  text?: string
  turns?: MarginCardTurn[]
  data?: unknown
  at?: number
  u?: number
  gone?: boolean
}

export interface MarginCardScope {
  bookId: string
  editionKey: string
  chapters: MarginPreviewChapter[]
}

/** Each write rewrites the book's whole row: a card keeps its last turns, each answer bounded. */
export const CARD_TURNS = 20
export const CARD_CONTENT_CHARS = 6_000
const CARD_PREFIX = 'mc_'

export const cardConversationId = (cardId: string) => CARD_PREFIX + cardId

/** The question a card answers, as the chat shows it (a card that starts with its answer). */
export function cardQuestion(card: MarginCard): string {
  const unit = (card.data as { unit?: { label?: string } } | undefined)?.unit?.label
  const of = unit ? ` ${unit}` : ''
  switch (card.kind) {
    case 'explain': return 'Explain this passage.'
    case 'simplify': return 'Simplify this passage.'
    case 'define': return `Define “${String(card.text || '').trim().slice(0, 80)}”.`
    case 'factcheck': return 'Evaluate this passage.'
    case 'counterpoint': return 'Give a counterpoint to this passage.'
    case 'related': return 'What does this relate to elsewhere?'
    case 'quiz': return `Quiz me${of ? ' on' + of : ''}.`
    case 'primer': return `Before you start${of ? ':' + of : ''}.`
    case 'recap': return `Recap${of}.`
    case 'catchup': return `Catch me up${of ? ' before' + of : ''}.`
    case 'figure': return 'Explain this figure.'
    default: return 'About this passage.'
  }
}

/**
 * A saved card's messages as its card shows them: without the question the card was saved with
 * ("Explain this passage.", cardQuestion), which the reader never typed (Anders, 30 Oct 2026). An Ask card keeps
 * its first message: that question is the reader's own.
 */
export function cardShownMessages<T extends { role: string }>(kind: string, messages: T[]): T[] {
  return kind !== 'ask' && messages[0]?.role === 'user' ? messages.slice(1) : messages
}

function boundedData(data: unknown): unknown {
  if (data === undefined || data === null) return undefined
  try { const text = JSON.stringify(data); return text && text.length <= LAB_CHAT_CARD_DATA_CHARS ? JSON.parse(text) : undefined } catch { return undefined }
}
const kindOf = (kind: unknown) => (typeof kind === 'string' && /^[a-z][a-z0-9-]{0,23}$/.test(kind) ? kind : 'ask')

/** A margin card as its conversation in the book's chat history, or null when it has no chapter in this edition. */
export function conversationOfCard(card: MarginCard, scope: MarginCardScope): ChatConversation | null {
  if (!card || typeof card.id !== 'string' || !card.id || card.id.length > 120) return null
  const chapter = chapterOfPage(scope.chapters, Number(card.page))
  const u = Number(card.u || card.at) || Date.now()
  const id = cardConversationId(card.id)
  if (card.gone) {
    const meta: ChatCard = { id: card.id, kind: kindOf(card.kind), chapterNumber: chapter?.number ?? 0, at: Number(card.at) || u, u, gone: true }
    return { id, bookId: scope.bookId, chapterNumber: Math.max(1, meta.chapterNumber), startTimestamp: u, endTimestamp: u, messages: [], preview: '', card: meta }
  }
  if (!chapter) return null
  const range = Array.isArray(card.span) && card.span[0] === card.page ? rangeOfOffsets(chapter, card.span[1], card.span[2]) : null
  const anchor = range ? { editionKey: scope.editionKey, chapterNumber: chapter.number, paragraphIndex: range.paragraphIndex, fromWord: range.fromWord, endParagraphIndex: range.endParagraphIndex, toWord: range.toWord } : undefined
  const at = Number(card.at) || u
  const passage = String(card.text || '').slice(0, 2000)
  const base = { bookId: scope.bookId, chapterNumber: chapter.number, ...(anchor ? { paragraphIndex: anchor.paragraphIndex } : {}) }
  const turns = (card.turns || []).filter(t => (t.role === 'user' || t.role === 'assistant') && String(t.content || '').trim()).slice(-CARD_TURNS)
  const messages: ChatMessage[] = []
  if (turns[0]?.role !== 'user') messages.push({ id: `${id}:q`, role: 'user', content: cardQuestion(card), timestamp: at, ...base, ...(passage ? { highlightedText: passage } : {}) })
  turns.forEach((t, i) => {
    const first = i === 0 && t.role === 'user'
    messages.push({
      id: `${id}:${(card.turns || []).indexOf(t)}`,
      role: t.role as 'user' | 'assistant',
      content: String(t.content).trim().slice(0, CARD_CONTENT_CHARS),
      timestamp: Math.max(at, Number(t.at) || at + i + 1),
      ...base,
      ...(first && passage ? { highlightedText: passage } : {}),
    })
  })
  // Times only rise within a card: its thread reads in order wherever it is shown.
  for (let i = 1; i < messages.length; i++) if (messages[i].timestamp <= messages[i - 1].timestamp) messages[i] = { ...messages[i], timestamp: messages[i - 1].timestamp + 1 }
  const data = boundedData(card.data)
  const meta: ChatCard = {
    id: card.id, kind: kindOf(card.kind), chapterNumber: chapter.number, at, u,
    ...(anchor ? { anchor } : {}),
    ...(passage ? { text: passage } : {}),
    ...(Array.isArray(card.rects) && card.rects.length ? { rects: card.rects.slice(0, 24) } : {}),
    ...(data !== undefined ? { data } : {}),
  }
  return {
    id, ...base, startTimestamp: messages[0].timestamp, endTimestamp: messages[messages.length - 1].timestamp,
    messages, preview: messages[0].content.slice(0, 80), card: meta,
  }
}

/** A card conversation as the margin's card, or null (a chat, or a card of another edition's text it cannot place). */
export function cardOfConversation(conversation: ChatConversation, scope: MarginCardScope): MarginCard | null {
  const meta = conversation.card
  if (!meta || conversation.bookId !== scope.bookId) return null
  const page = pageOfChapter(scope.chapters, meta.chapterNumber)
  if (meta.gone) return { id: meta.id, gone: true, u: meta.u, at: meta.at, ...(page ? { page } : {}) }
  if (!page) return null
  const chapter = chapterOfPage(scope.chapters, page)!
  const sameEdition = meta.anchor?.editionKey === scope.editionKey
  const offsets = meta.anchor && sameEdition ? offsetsOfRange(chapter, meta.anchor) : null
  const turns = conversation.messages
    .filter(m => !m.id.endsWith(':q'))
    .map(m => ({ role: m.role, content: m.content, at: m.timestamp }))
  return {
    id: meta.id, kind: meta.kind, page,
    rects: (meta.rects || []).map(r => [...r]),
    ...(offsets ? { span: [page, offsets.start, offsets.end] as [number, number, number] } : {}),
    text: meta.text || '',
    turns,
    ...(meta.data !== undefined ? { data: meta.data } : {}),
    at: meta.at, u: meta.u,
  }
}

/** The margin's cards for the book, from its chat history. */
export function marginCards(conversations: ChatConversation[], scope: MarginCardScope): MarginCard[] {
  return conversations.map(c => cardOfConversation(c, scope)).filter((c): c is MarginCard => c !== null)
}

/**
 * The cards the margin changed, as conversations to merge into the history: a card whose conversation would be the
 * same as the stored one is left out (nothing to write).
 */
export function changedCardConversations(conversations: ChatConversation[], cards: MarginCard[], scope: MarginCardScope): ChatConversation[] {
  const stored = new Map(conversations.filter(c => c.card).map(c => [c.id, c]))
  const out: ChatConversation[] = []
  const seen = new Set<string>()
  for (const card of cards || []) {
    const next = conversationOfCard(card, scope)
    if (!next || seen.has(next.id)) continue
    seen.add(next.id)
    const before = stored.get(next.id)
    if (before && JSON.stringify(before.card) === JSON.stringify(next.card) && JSON.stringify(before.messages.map(m => [m.id, m.content])) === JSON.stringify(next.messages.map(m => [m.id, m.content]))) continue
    // An older copy than the one stored (another device's later edit): the store's stands.
    if (before?.card && before.card.u > (next.card?.u ?? 0)) continue
    out.push(next)
  }
  return out
}
