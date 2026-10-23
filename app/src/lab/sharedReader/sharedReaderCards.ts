/**
 * A source-word card shared by the React reader's layouts. This module is pure:
 * catalogue cards use the existing versioned chat-history writer, while owned
 * text cards must be mapped to the owner's marks/cards route by its adapter.
 * No private source can become a catalogue chat row through this boundary.
 */
import type { ChatCardAnchor, ChatConversation, ChatMessage } from '../../types'
import { LAB_CHAT_CARD_DATA_CHARS, mergeChatConversations, sameChatConversations } from '../labChatHistory'
import { CARD_CONTENT_CHARS, CARD_TURNS, cardConversationId, cardQuestion } from '../marginPreview/marginPreviewCards'
import { isUserBookHex, isUserBookId, userBookId } from '../userBook/userBookId'

export type SharedCardKind = 'explain' | 'simplify' | 'define' | 'factcheck' | 'counterpoint' | 'quiz' | 'ask'
  | 'primer' | 'catchup' | 'recap'

export type SharedCardSource =
  | { kind: 'catalogue'; bookId: string }
  | { kind: 'own-text'; bookId: string; ownHex: string; converter: number; editionKey: 'own' | 'own-en' | 'own-da' }

export interface SharedReaderCard {
  source: SharedCardSource
  /** Stable across card updates and reloads; a newer revision may undo deletion. */
  id: string
  kind: SharedCardKind
  chapterNumber: number
  /** The LabHighlightRange tuple, with an exclusive toWord. Chapter cards have no range. */
  anchor?: ChatCardAnchor
  text?: string
  /** Includes the AI answer only after it is complete; the first user question is optional. */
  turns: Array<{ role: 'user' | 'assistant'; content: string; at?: number }>
  /** Bounded small state such as quiz questions/answers or a reading unit. */
  data?: unknown
  at: number
  u: number
}

export interface OwnTextCardDraft {
  v: 'text-v1'; id: string; kind: SharedCardKind
  anchor: { editionKey: string; converter: number; chapterNumber: number }
    & ({ kind: 'chapter' } | { kind: 'range'; paragraphIndex: number; fromWord: number; endParagraphIndex: number; toWord: number })
  text: string
  turns: Array<{ role: 'user' | 'assistant'; content: string; at?: number }>
  data?: Record<string, unknown>
  at: number
  u: number
}

const validTime = (value: number) => Number.isSafeInteger(value) && value > 0 && value <= 1e15
const validIndex = (value: number) => Number.isSafeInteger(value) && value >= 0 && value <= 10_000_000

function validAnchor(anchor: ChatCardAnchor | undefined, chapterNumber: number): boolean {
  if (!anchor) return true
  return !!anchor.editionKey && anchor.editionKey.length <= 80 && anchor.chapterNumber === chapterNumber
    && validIndex(anchor.paragraphIndex) && validIndex(anchor.fromWord)
    && validIndex(anchor.endParagraphIndex) && validIndex(anchor.toWord)
    && anchor.endParagraphIndex >= anchor.paragraphIndex
    && (anchor.endParagraphIndex > anchor.paragraphIndex ? anchor.toWord > 0 : anchor.toWord > anchor.fromWord)
}

function boundedData(data: unknown): Record<string, unknown> | null | undefined {
  if (data === undefined) return undefined
  try {
    const json = JSON.stringify(data)
    if (!json || json.length > LAB_CHAT_CARD_DATA_CHARS || !data || typeof data !== 'object' || Array.isArray(data)) return null
    const parsed: unknown = JSON.parse(json)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null
  } catch { return null }
}

const CARD_KINDS = new Set<SharedCardKind>(['explain', 'simplify', 'define', 'factcheck', 'counterpoint', 'quiz', 'ask', 'primer', 'catchup', 'recap'])

/** A private source-word draft. The owner adapter alone chooses the EPUB/Paste or PDF text-v1 route and writes it. */
export function ownTextCardDraft(card: SharedReaderCard): OwnTextCardDraft | null {
  if (card.source.kind !== 'own-text' || !isUserBookHex(card.source.ownHex)
    || card.source.bookId !== userBookId(card.source.ownHex)
    || !Number.isInteger(card.source.converter) || card.source.converter < 1 || card.source.converter > 1000
    || !/^(?:own|own-en|own-da)$/.test(card.source.editionKey) || !CARD_KINDS.has(card.kind)
    || !/^[A-Za-z0-9_-]{4,120}$/.test(card.id) || !Number.isInteger(card.chapterNumber)
    || card.chapterNumber < 1 || card.chapterNumber > 5000 || !validTime(card.at) || !validTime(card.u)
    || !card.turns.length || card.turns.length > 40 || !card.turns.some(turn => turn.role === 'assistant' && turn.content.trim())
    || card.turns.some(turn => !['user', 'assistant'].includes(turn.role) || !turn.content.trim()
      || turn.content.length > 12_000 || turn.at !== undefined && !validTime(turn.at))) return null
  const passage = card.text?.trim() ?? ''
  if (passage.length > 2000) return null
  const anchor = card.anchor
  if (anchor && (anchor.editionKey !== card.source.editionKey || !validAnchor(anchor, card.chapterNumber)
    || [anchor.paragraphIndex, anchor.fromWord, anchor.endParagraphIndex, anchor.toWord].some(n => n > 100_000)
    || anchor.toWord < 1)) return null
  const source = { editionKey: card.source.editionKey, converter: card.source.converter, chapterNumber: card.chapterNumber }
  const textAnchor: OwnTextCardDraft['anchor'] = anchor
    ? { ...source, kind: 'range', paragraphIndex: anchor.paragraphIndex, fromWord: anchor.fromWord,
        endParagraphIndex: anchor.endParagraphIndex, toWord: anchor.toWord }
    : { ...source, kind: 'chapter' }
  let data: Record<string, unknown> | undefined
  if (card.data !== undefined) {
    if (!card.data || typeof card.data !== 'object' || Array.isArray(card.data)) return null
    try {
      const json = JSON.stringify(card.data)
      if (!json || json.length > 16_000) return null
      const parsed: unknown = JSON.parse(json)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
      data = parsed as Record<string, unknown>
    }
    catch { return null }
  }
  return { v: 'text-v1', id: card.id, kind: card.kind, anchor: textAnchor, text: passage,
    turns: card.turns.map(turn => ({ role: turn.role, content: turn.content.trim(), ...(turn.at ? { at: turn.at } : {}) })),
    ...(data ? { data } : {}), at: card.at, u: card.u }
}

/** The existing Margin card shape and conversation id, made from Lab source coordinates. */
export function catalogueCardConversation(card: SharedReaderCard): ChatConversation | null {
  if (card.source.kind !== 'catalogue') return null
  if (!card.source.bookId || isUserBookId(card.source.bookId) || !card.id || card.id.length > 120 || !CARD_KINDS.has(card.kind) || !Number.isInteger(card.chapterNumber)
    || card.chapterNumber < 1 || card.chapterNumber > 5000 || !validTime(card.at) || !validTime(card.u)
    || !validAnchor(card.anchor, card.chapterNumber)) return null
  const turns = card.turns
  if (!turns.length || turns.length > CARD_TURNS || !turns.some(turn => turn.role === 'assistant' && turn.content.trim())
    || turns.some(turn => !['user', 'assistant'].includes(turn.role) || !turn.content.trim()
      || turn.content.trim().length > CARD_CONTENT_CHARS || turn.at !== undefined && !validTime(turn.at))) return null
  const data = boundedData(card.data)
  if (data === null || (card.text?.trim().length ?? 0) > 2000) return null
  const id = cardConversationId(card.id)
  const passage = card.text?.trim() || ''
  const base = { bookId: card.source.bookId, chapterNumber: card.chapterNumber, ...(card.anchor ? { paragraphIndex: card.anchor.paragraphIndex } : {}) }
  const question = cardQuestion({ id: card.id, kind: card.kind, text: passage, data: card.data })
  const entries = turns[0].role === 'user' ? turns : [{ role: 'user' as const, content: question, at: card.at }, ...turns]
  const messages: ChatMessage[] = []
  entries.forEach((turn, index) => {
    const timestamp = Math.max(card.at + index, validTime(turn.at ?? 0) ? turn.at! : card.at + index, (messages[messages.length - 1]?.timestamp ?? 0) + 1)
    messages.push({
      id: `${id}:${index}`, role: turn.role, content: turn.content.trim(), timestamp,
      ...base, ...(index === 0 && passage ? { highlightedText: passage } : {}),
    })
  })
  const meta = {
    id: card.id, kind: card.kind, chapterNumber: card.chapterNumber, at: card.at, u: card.u,
    ...(card.anchor ? { anchor: card.anchor } : {}), ...(passage ? { text: passage } : {}),
    ...(data !== undefined ? { data } : {}),
  }
  return { id, ...base, startTimestamp: messages[0].timestamp, endTimestamp: messages[messages.length - 1].timestamp,
    messages, preview: messages[0].content.slice(0, 80), card: meta }
}

/** Merge into the same live list the chat writer is using, preserving other turns. */
export function upsertCatalogueCard(current: ChatConversation[], card: SharedReaderCard): ChatConversation[] {
  const next = catalogueCardConversation(card)
  if (!next) return current
  const existing = current.find(item => item.id === next.id)
  if (existing?.card && existing.card.u >= card.u && (existing.card.gone || existing.card.u > card.u)) return current
  const merged = mergeChatConversations(current, [next])
  return sameChatConversations(current, merged) ? current : merged
}

/** Tombstones win stale device copies through the existing chat-history merge. */
export function tombstoneCatalogueCard(current: ChatConversation[], cardId: string, at: number): ChatConversation[] {
  const existing = current.find(item => item.id === cardConversationId(cardId))
  if (!existing?.card || existing.card.gone || !validTime(at)) return current
  const u = Math.max(at, existing.card.u + 1)
  const tombstone: ChatConversation = {
    id: existing.id, bookId: existing.bookId, chapterNumber: existing.chapterNumber,
    startTimestamp: u, endTimestamp: u, messages: [], preview: '',
    card: { id: existing.card.id, kind: existing.card.kind, chapterNumber: existing.card.chapterNumber, at: existing.card.at, u, gone: true },
  }
  return mergeChatConversations(current, [tombstone])
}
