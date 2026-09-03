import type { ChatConversation, ChatMessage } from '../types'
import { apiUrl } from '../utils/apiUrl'
import { isStuckRepeatedLine, type LabAskTurn } from './labAsk'
import { biblicalBookId } from './labPosition'

/** Voice-session book id only. Never a persist key — Bible is not one thread. */
export const LAB_CHAT_BOOK_ID = 'lab'
export const LAB_CHAT_HISTORY_STORAGE_KEY = 'tinct:chat-history:lab'
/** @deprecated use LAB_CHAT_HISTORY_STORAGE_KEY — kept so old imports keep compiling */
export const LAB_CHAT_HISTORY_KEY = LAB_CHAT_HISTORY_STORAGE_KEY

const CONVERSATION_GAP_MS = 5 * 60 * 1000
const MAX_TURNS_PER_BOOK = 80
const MAX_CONTENT = 8_000
const IDB_NAME = 'tinct-lab'
const IDB_STORE = 'kv'
const IDB_KEY = 'chat-history'
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

export interface LabChatBookRef {
  bookId: string
  headerBook: string
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

export function resolveLabChatBook(headerBook: string, fallback = ''): LabChatBookRef | null {
  const raw = (headerBook || fallback).trim()
  if (!raw) return null
  const bookId = biblicalBookId(raw)
  if (!bookId || FORBIDDEN_BOOKS.has(bookId)) return null
  return { bookId, headerBook: raw }
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

export function turnsFromConversations(conversations: ChatConversation[]): LabAskTurn[] {
  return conversations.flatMap(conversation => conversation.messages.map(message => ({
    id: message.id,
    role: message.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: message.content,
    source: message.source === 'voice' ? 'voice' as const : 'typed' as const,
    chapterNumber: message.chapterNumber ?? conversation.chapterNumber,
    paragraphIndex: message.paragraphIndex ?? conversation.paragraphIndex,
    cancelled: message.isComplete === false,
  })))
}

export function readLabAskTurns(bookId: string, state?: LabChatHistoryState): LabAskTurn[] {
  if (!bookId || FORBIDDEN_BOOKS.has(bookId)) return []
  const books = (state ?? readLabChatHistoryLocal()).books
  const book = books[bookId]
  if (!book) return []
  return turnsFromConversations(book.conversations)
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

function idbAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openIdb(): Promise<IDBDatabase | null> {
  if (!idbAvailable()) return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function writeIdb(state: LabChatHistoryState): Promise<void> {
  const db = await openIdb()
  if (!db) return
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(state, IDB_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    } catch {
      resolve()
    } finally {
      db.close()
    }
  })
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

export function writeLabChatHistoryLocal(state: LabChatHistoryState): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LAB_CHAT_HISTORY_STORAGE_KEY, JSON.stringify(state))
    } catch { /* quota / private mode */ }
  }
  void writeIdb(state)
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

export async function putLabChatHistoryCloud(
  token: string | null | undefined,
  state: LabChatHistoryState,
): Promise<boolean> {
  if (!token) return false
  try {
    const res = await fetch(apiUrl('/api/lab-chat-history'), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(state),
    })
    return res.ok
  } catch {
    return false
  }
}

export function createLabChatHistorySync(opts: {
  token?: string | null
  online?: () => boolean
  put?: typeof putLabChatHistoryCloud
}) {
  let dirty = false
  let last: LabChatHistoryState | null = null
  const put = opts.put ?? putLabChatHistoryCloud
  const isOnline = opts.online ?? (() => typeof navigator === 'undefined' || navigator.onLine)

  const flushCloud = async () => {
    if (!opts.token || !last) return false
    const ok = await put(opts.token, last)
    if (ok) dirty = false
    return ok
  }

  return {
    persist(state: LabChatHistoryState) {
      last = state
      writeLabChatHistoryLocal(state)
      if (!opts.token) return
      if (!isOnline()) {
        dirty = true
        return
      }
      void put(opts.token, state).then((ok) => {
        if (!ok) dirty = true
      })
    },
    async flush() {
      return flushCloud()
    },
    isDirty: () => dirty,
    canWriteCloud: () => Boolean(opts.token),
  }
}

function appendTurnToConversations(
  current: ChatConversation[],
  enriched: ChatMessage,
  bookId: string,
  chapterNumber: number,
  paragraphIndex: number | undefined,
): ChatConversation[] {
  const now = enriched.timestamp
  const last = current[current.length - 1]
  if (
    last
    && last.bookId === bookId
    && last.chapterNumber === chapterNumber
    && now - last.endTimestamp < CONVERSATION_GAP_MS
  ) {
    if (last.messages.some(item => item.id === enriched.id)) return current
    const lastMsg = last.messages[last.messages.length - 1]
    if (
      lastMsg
      && lastMsg.role === 'assistant'
      && enriched.role === 'assistant'
      && isStuckRepeatedLine(lastMsg.content, enriched.content)
    ) {
      return current
    }
    if (lastMsg && lastMsg.role === enriched.role && lastMsg.source === enriched.source) {
      if (enriched.role === 'user' && enriched.id !== lastMsg.id && enriched.content !== lastMsg.content) {
        return [...current.slice(0, -1), {
          ...last,
          endTimestamp: now,
          messages: [...last.messages, enriched],
        }]
      }
      if (enriched.role === 'user' && enriched.content !== lastMsg.content) {
        return [...current.slice(0, -1), {
          ...last,
          endTimestamp: now,
          messages: [...last.messages, enriched],
        }]
      }
      if (enriched.content.length < lastMsg.content.length) {
        if (enriched.isComplete === false) {
          const messages = [...last.messages.slice(0, -1), { ...lastMsg, isComplete: false }]
          return [...current.slice(0, -1), { ...last, endTimestamp: now, messages }]
        }
        return current
      }
      const messages = [...last.messages.slice(0, -1), { ...lastMsg, ...enriched, id: lastMsg.id }]
      return [...current.slice(0, -1), { ...last, endTimestamp: now, messages }]
    }
    return [...current.slice(0, -1), {
      ...last,
      endTimestamp: now,
      messages: [...last.messages, enriched],
    }]
  }
  return [...current, {
    id: `conv_lab_${bookId}_${now}`,
    bookId,
    chapterNumber,
    paragraphIndex,
    startTimestamp: now,
    endTimestamp: now,
    messages: [enriched],
    preview: enriched.role === 'user' ? makePreview(enriched.content) : '',
  }]
}

/** Persist a finalized lab Talk/Ask turn under a biblical book, never bible/lab/odyssey. */
export function persistLabTalkTurn(
  message: ChatMessage,
  chapterNumber = 1,
  paragraphIndex?: number,
  book?: LabChatBookRef | string,
): LabChatHistoryState {
  const resolved = typeof book === 'string' || !book
    ? resolveLabChatBook(typeof book === 'string' ? book : '', message.bookId === 'lab' || message.bookId === 'bible' ? '' : (message.bookId || ''))
    : resolveLabChatBook(book.headerBook, book.bookId)
  const state = readLabChatHistoryLocal()
  if (!resolved) return state
  const content = (message.content || '').trim()
  if (!content) return state
  const now = message.timestamp || Date.now()
  const enriched: ChatMessage = {
    ...message,
    content,
    bookId: resolved.bookId,
    chapterNumber,
    paragraphIndex,
    timestamp: now,
  }
  const existing = state.books[resolved.bookId]
  const conversations = appendTurnToConversations(
    existing?.conversations || [],
    enriched,
    resolved.bookId,
    chapterNumber,
    paragraphIndex,
  )
  const next: LabChatHistoryState = {
    books: {
      ...state.books,
      [resolved.bookId]: {
        bookId: resolved.bookId,
        headerBook: resolved.headerBook,
        updatedAt: now,
        conversations: trimConversations(conversations),
      },
    },
    updatedAt: now,
  }
  writeLabChatHistoryLocal(next)
  return next
}

export function readLabTalkHistory(bookId?: string): ChatConversation[] {
  const state = readLabChatHistoryLocal()
  if (bookId) return state.books[bookId]?.conversations || []
  return Object.values(state.books).flatMap(book => book.conversations)
}

export function dumpLabTalkTurns(turns: LabAskTurn[]): void {
  if (typeof window === 'undefined') return
  ;(window as Window & { __tinctLabTalk?: LabAskTurn[] }).__tinctLabTalk = turns
}
