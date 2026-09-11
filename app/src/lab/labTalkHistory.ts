import type { ChatConversation, ChatMessage } from '../types'
import { apiUrl } from '../utils/apiUrl'
import type { LabAskTurn } from './labAsk'
import { biblicalBookId } from './labPosition'

/**
 * Legacy lab chat state (retired 2026-09-07).
 *
 * The lab used to keep every book's chats in one blob under
 * `tinct:chat-history:lab` (keyed by biblical book / title slug) and mirror
 * it to a Worker KV row through `/api/lab-chat-history`. Chats now live in
 * the classic per-book rows (`chat-history:{bookId}`, see labChatHistory.ts).
 * What remains here is the parser, used by the Worker route and by the
 * one-time migration that folds the old blob into the per-book rows.
 */

/** Voice-session book id only. Never a persist key. */
export const LAB_CHAT_BOOK_ID = 'lab'
export const LAB_CHAT_HISTORY_STORAGE_KEY = 'tinct:chat-history:lab'

const MAX_TURNS_PER_BOOK = 600
const MAX_CONTENT = 8_000
const FORBIDDEN_BOOKS = new Set(['bible', 'lab', 'odyssey'])

export interface LabBookChat {
  bookId: string
  headerBook: string
  updatedAt: number
  conversations: ChatConversation[]
}

export interface LabChatHistoryState {
  books: Record<string, LabBookChat>
  updatedAt: number
}

function makePreview(text: string): string {
  if (text.length <= 80) return text
  return text.slice(0, 77) + '...'
}

function isFiniteInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

export function emptyLabChatHistoryState(): LabChatHistoryState {
  return { books: {}, updatedAt: 0 }
}

function parseChatMessage(raw: unknown, bookId: string): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.id !== 'string' || !src.id || src.id.length > 160) return null
  if (src.role !== 'user' && src.role !== 'assistant') return null
  if (typeof src.content !== 'string') return null
  const content = src.content.trim()
  if (!content || content.length > MAX_CONTENT) return null
  if (typeof src.bookId === 'string' && src.bookId && src.bookId !== bookId) return null
  const timestamp = isFiniteInt(src.timestamp, 1, 1e15) ? src.timestamp : Date.now()
  const source = src.source === 'voice' ? 'voice' : src.source === 'text' ? 'text' : undefined
  return {
    id: src.id,
    role: src.role,
    content,
    timestamp,
    bookId,
    chapterNumber: isFiniteInt(src.chapterNumber, 1, 2000) ? src.chapterNumber : undefined,
    paragraphIndex: isFiniteInt(src.paragraphIndex, 0, 10_000) ? src.paragraphIndex : undefined,
    isComplete: src.isComplete === false ? false : src.isComplete === true ? true : undefined,
    source,
  }
}

function parseConversation(raw: unknown, bookId: string): ChatConversation | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.id !== 'string' || !src.id || src.id.length > 160) return null
  if (typeof src.bookId === 'string' && src.bookId && src.bookId !== bookId) return null
  if (!Array.isArray(src.messages)) return null
  const messages = src.messages
    .map(item => parseChatMessage(item, bookId))
    .filter((item): item is ChatMessage => item !== null)
    .slice(0, MAX_TURNS_PER_BOOK)
  if (messages.length === 0) return null
  return {
    id: src.id,
    bookId,
    chapterNumber: isFiniteInt(src.chapterNumber, 1, 2000) ? src.chapterNumber : 1,
    paragraphIndex: isFiniteInt(src.paragraphIndex, 0, 10_000) ? src.paragraphIndex : undefined,
    startTimestamp: isFiniteInt(src.startTimestamp, 1, 1e15) ? src.startTimestamp : messages[0].timestamp,
    endTimestamp: isFiniteInt(src.endTimestamp, 1, 1e15) ? src.endTimestamp : messages[messages.length - 1].timestamp,
    messages,
    preview: typeof src.preview === 'string' ? src.preview.slice(0, 120) : makePreview(messages[0].content),
  }
}

export function parseLabBookChat(raw: unknown): LabBookChat | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.bookId !== 'string' || !src.bookId || src.bookId.length > 80) return null
  if (FORBIDDEN_BOOKS.has(src.bookId)) return null
  if (typeof src.headerBook !== 'string' || !src.headerBook || src.headerBook.length > 80) return null
  if (biblicalBookId(src.headerBook) !== src.bookId && biblicalBookId(src.bookId) !== src.bookId) return null
  if (!isFiniteInt(src.updatedAt, 1, 1e15)) return null
  if (!Array.isArray(src.conversations)) return null
  const conversations = src.conversations
    .map(item => parseConversation(item, src.bookId))
    .filter((item): item is ChatConversation => item !== null)
  return {
    bookId: src.bookId,
    headerBook: src.headerBook,
    updatedAt: src.updatedAt,
    conversations: trimConversations(conversations),
  }
}

export function parseLabChatHistoryState(raw: unknown): LabChatHistoryState {
  // Legacy persist was ChatConversation[] under bookId `lab`. Do not import it
  // (and never treat it as bible / furthest-chapter recovery).
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyLabChatHistoryState()
  const src = raw as Record<string, unknown>
  const books: Record<string, LabBookChat> = {}
  if (src.books && typeof src.books === 'object') {
    for (const [key, value] of Object.entries(src.books as Record<string, unknown>)) {
      const book = parseLabBookChat(value)
      if (!book || book.bookId !== key) continue
      books[key] = book
    }
  }
  const updatedAt = isFiniteInt(src.updatedAt, 0, 1e15) ? src.updatedAt : 0
  return { books, updatedAt }
}

function trimConversations(conversations: ChatConversation[]): ChatConversation[] {
  let total = conversations.reduce((sum, item) => sum + item.messages.length, 0)
  if (total <= MAX_TURNS_PER_BOOK) return conversations
  const next = [...conversations]
  while (next.length > 1 && total > MAX_TURNS_PER_BOOK) {
    const removed = next.shift()
    total -= removed?.messages.length ?? 0
  }
  if (total > MAX_TURNS_PER_BOOK && next[0]) {
    next[0] = { ...next[0], messages: next[0].messages.slice(-MAX_TURNS_PER_BOOK) }
  }
  return next
}

export function mergeLabChatHistoryStates(local: LabChatHistoryState, cloud: LabChatHistoryState): LabChatHistoryState {
  const books: Record<string, LabBookChat> = { ...local.books }
  for (const [bookId, incoming] of Object.entries(cloud.books)) {
    if (incoming.bookId !== bookId || FORBIDDEN_BOOKS.has(bookId)) continue
    const existing = books[bookId]
    if (!existing || incoming.updatedAt > existing.updatedAt) {
      books[bookId] = incoming
    }
  }
  return {
    books,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  }
}

export function readLabChatHistoryLocal(): LabChatHistoryState {
  if (typeof localStorage === 'undefined') return emptyLabChatHistoryState()
  try {
    const raw = localStorage.getItem(LAB_CHAT_HISTORY_STORAGE_KEY)
    if (!raw) return emptyLabChatHistoryState()
    return parseLabChatHistoryState(JSON.parse(raw))
  } catch {
    return emptyLabChatHistoryState()
  }
}

export function clearLabChatHistoryLocal(): void {
  try { localStorage.removeItem(LAB_CHAT_HISTORY_STORAGE_KEY) } catch { /* jsdom */ }
}

export async function fetchLabChatHistoryCloud(token: string | null | undefined): Promise<LabChatHistoryState | null> {
  if (!token) return null
  try {
    const res = await fetch(apiUrl('/api/lab-chat-history'), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return parseLabChatHistoryState(await res.json())
  } catch {
    return null
  }
}

export function dumpLabTalkTurns(turns: LabAskTurn[]): void {
  if (typeof window === 'undefined') return
  ;(window as Window & { __tinctLabTalk?: LabAskTurn[] }).__tinctLabTalk = turns
}
