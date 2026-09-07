import type { ChatConversation, ChatMessage } from '../types'
import { BOOKS } from '../data/bookRegistry'
import { localStorageProvider } from '../services/storage'
import { supabase } from '../services/supabase'
import { coerceRev, versionedWriteApplied, type VersionedStorageRow } from '../services/supabaseStorage.versioning'
import { isStuckRepeatedLine, type LabAskTurn } from './labAsk'
import { biblicalBookId } from './labPosition'
import {
  clearLabChatHistoryLocal as clearLegacyLabChatHistoryLocal,
  readLabChatHistoryLocal as readLegacyLabChatHistoryLocal,
  type LabChatHistoryState,
} from './labTalkHistory'

/**
 * One chat history per book, shared with the classic reader.
 *
 * The lab and the classic reader persist under the same storage key,
 * `chat-history:{registryBookId}` (localStorage mirror `tinct:chat-history:…`,
 * cloud row `user_data.key`), in the classic shape `ChatConversation[]`. A
 * conversation the reader had in the classic Odyssey chat therefore shows up
 * in the lab, and the other way round. The Bible is one book here (`bible`),
 * as it is in the registry and in the classic reader; chapter numbers are the
 * sequential Bible chapter, so "Romans 8" and "Genesis 1" turns sit in one
 * thread under their chapter labels.
 *
 * Signed in, the row goes through the versioned `commit_user_data` RPC with an
 * expected rev; a conflict adopts the server row, merges, and retries once.
 */

const CONVERSATION_GAP_MS = 5 * 60 * 1000
/** Oldest conversations drop first once a book's thread grows past this. */
export const LAB_CHAT_MAX_MESSAGES_PER_BOOK = 600
const MAX_CONTENT = 8_000
const LEGACY_CLOUD_MIGRATED_KEY = 'lab-chat-history-legacy-cloud-migrated'

export function labChatHistoryKey(bookId: string): string {
  return `chat-history:${bookId}`
}

function makePreview(text: string): string {
  if (text.length <= 80) return text
  return text.slice(0, 77) + '...'
}

function isFiniteInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function parseChatMessage(raw: unknown, bookId: string): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.id !== 'string' || !src.id || src.id.length > 160) return null
  if (src.role !== 'user' && src.role !== 'assistant') return null
  if (typeof src.content !== 'string') return null
  // Classic dividers and transient error rows were persisted by older code;
  // the classic app strips them on load and so do we.
  if (src.chapterDivider != null || src.refreshAction === true) return null
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
    chapterNumber: isFiniteInt(src.chapterNumber, 1, 5000) ? src.chapterNumber : undefined,
    paragraphIndex: isFiniteInt(src.paragraphIndex, 0, 10_000) ? src.paragraphIndex : undefined,
    ...(typeof src.highlightedText === 'string' && src.highlightedText ? { highlightedText: src.highlightedText.slice(0, 2000) } : {}),
    ...(src.isComplete === false ? { isComplete: false } : src.isComplete === true ? { isComplete: true } : {}),
    ...(source ? { source } : {}),
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
  if (messages.length === 0) return null
  return {
    id: src.id,
    bookId,
    chapterNumber: isFiniteInt(src.chapterNumber, 1, 5000) ? src.chapterNumber : (messages[0].chapterNumber ?? 1),
    paragraphIndex: isFiniteInt(src.paragraphIndex, 0, 10_000) ? src.paragraphIndex : undefined,
    startTimestamp: isFiniteInt(src.startTimestamp, 1, 1e15) ? src.startTimestamp : messages[0].timestamp,
    endTimestamp: isFiniteInt(src.endTimestamp, 1, 1e15) ? src.endTimestamp : messages[messages.length - 1].timestamp,
    messages,
    preview: typeof src.preview === 'string' ? src.preview.slice(0, 120) : makePreview(messages.find(m => m.role === 'user')?.content ?? messages[0].content),
    ...(typeof src.summary === 'string' && src.summary ? { summary: src.summary } : {}),
    ...(typeof src.summaryPrompt === 'string' && src.summaryPrompt ? { summaryPrompt: src.summaryPrompt } : {}),
    ...(isFiniteInt(src.summaryCreatedAt, 1, 1e15) ? { summaryCreatedAt: src.summaryCreatedAt } : {}),
  }
}

/** Sanitize a stored `chat-history:{bookId}` row. Never throws; unknown shapes read as empty. */
export function parseChatConversations(raw: unknown, bookId: string): ChatConversation[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(item => parseConversation(item, bookId))
    .filter((item): item is ChatConversation => item !== null)
}

function trimConversations(conversations: ChatConversation[]): ChatConversation[] {
  let total = conversations.reduce((sum, item) => sum + item.messages.length, 0)
  if (total <= LAB_CHAT_MAX_MESSAGES_PER_BOOK) return conversations
  const next = [...conversations]
  while (next.length > 1 && total > LAB_CHAT_MAX_MESSAGES_PER_BOOK) {
    const removed = next.shift()
    total -= removed?.messages.length ?? 0
  }
  if (total > LAB_CHAT_MAX_MESSAGES_PER_BOOK && next[0]) {
    next[0] = { ...next[0], messages: next[0].messages.slice(-LAB_CHAT_MAX_MESSAGES_PER_BOOK) }
  }
  return next
}

function preferMessage(current: ChatMessage, incoming: ChatMessage): ChatMessage {
  // Same id on two devices: keep the completed / longer copy.
  if (current.isComplete === false && incoming.isComplete !== false) return incoming
  if (incoming.isComplete === false && current.isComplete !== false) return current
  return incoming.content.length > current.content.length ? incoming : current
}

/**
 * Union of two histories for one book. Conversations merge by id (their
 * messages by id, ordered by timestamp); a message id seen in an earlier
 * conversation is not repeated in a later one. Conversation summaries from
 * the classic reader survive. Order is by start time, oldest first.
 */
export function mergeChatConversations(a: ChatConversation[], b: ChatConversation[]): ChatConversation[] {
  const byId = new Map<string, ChatConversation>()
  for (const conversation of [...a, ...b]) {
    const existing = byId.get(conversation.id)
    if (!existing) {
      byId.set(conversation.id, { ...conversation, messages: [...conversation.messages] })
      continue
    }
    const messages = new Map<string, ChatMessage>()
    for (const message of [...existing.messages, ...conversation.messages]) {
      const current = messages.get(message.id)
      messages.set(message.id, current ? preferMessage(current, message) : message)
    }
    const ordered = [...messages.values()].sort((x, y) => x.timestamp - y.timestamp)
    byId.set(conversation.id, {
      ...existing,
      ...conversation,
      summary: conversation.summary ?? existing.summary,
      summaryPrompt: conversation.summaryPrompt ?? existing.summaryPrompt,
      summaryCreatedAt: conversation.summaryCreatedAt ?? existing.summaryCreatedAt,
      startTimestamp: Math.min(existing.startTimestamp, conversation.startTimestamp),
      endTimestamp: Math.max(existing.endTimestamp, conversation.endTimestamp),
      messages: ordered,
    })
  }
  const sorted = [...byId.values()].sort((x, y) => x.startTimestamp - y.startTimestamp || x.id.localeCompare(y.id))
  const seen = new Set<string>()
  const result: ChatConversation[] = []
  for (const conversation of sorted) {
    const messages = conversation.messages.filter((message) => {
      if (seen.has(message.id)) return false
      seen.add(message.id)
      return true
    })
    if (messages.length === 0) continue
    result.push({ ...conversation, messages })
  }
  return trimConversations(result)
}

export function sameChatConversations(a: ChatConversation[], b: ChatConversation[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  return JSON.stringify(a) === JSON.stringify(b)
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

// ---------------------------------------------------------------------------
// Local mirror (the same `tinct:chat-history:{bookId}` key the classic
// SupabaseStorageProvider mirrors to, so both readers see one history).

export function readLabBookChat(bookId: string): ChatConversation[] {
  if (!bookId) return []
  return parseChatConversations(localStorageProvider.get<unknown>(labChatHistoryKey(bookId)), bookId)
}

export function writeLabBookChat(bookId: string, conversations: ChatConversation[]): void {
  if (!bookId) return
  if (conversations.some(c => c.bookId !== bookId || c.messages.some(m => m.bookId && m.bookId !== bookId))) return
  localStorageProvider.set(labChatHistoryKey(bookId), conversations)
}

/** Every book's conversations on this device, for the companion's cross-book memory. */
export function readAllLabBookChats(): ChatConversation[] {
  if (typeof localStorage === 'undefined') return []
  const prefix = `tinct:${labChatHistoryKey('')}`
  const result: ChatConversation[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(prefix)) continue
      const bookId = key.slice(prefix.length)
      if (!bookId || bookId === 'lab') continue
      result.push(...readLabBookChat(bookId))
    }
  } catch { /* jsdom / private mode */ }
  return result
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
      if (enriched.role === 'user' && enriched.content !== lastMsg.content) {
        return [...current.slice(0, -1), {
          ...last,
          endTimestamp: now,
          messages: [...last.messages, enriched],
        }]
      }
      if (enriched.role === 'assistant' && enriched.content.length < lastMsg.content.length) {
        if (enriched.isComplete === false) {
          const messages = [...last.messages.slice(0, -1), { ...lastMsg, isComplete: false }]
          return [...current.slice(0, -1), { ...last, endTimestamp: now, messages }]
        }
        return current
      }
      if (enriched.role === 'assistant') {
        // A voice reply finalizes in growing pieces under new ids: extend the bubble.
        const messages = [...last.messages.slice(0, -1), { ...lastMsg, ...enriched, id: lastMsg.id }]
        return [...current.slice(0, -1), { ...last, endTimestamp: now, messages }]
      }
      return current
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

/**
 * Record a finalized Chat/Talk turn under the registry book and write the
 * local mirror. The message's `bookId` is set to the target book: a voice
 * session tags its transcripts with the session id (`lab`), never a book.
 */
export function appendLabChatTurn(
  bookId: string,
  message: ChatMessage,
  chapterNumber = 1,
  paragraphIndex?: number,
): ChatConversation[] {
  const current = readLabBookChat(bookId)
  if (!bookId) return current
  const content = (message.content || '').trim()
  if (!content) return current
  const now = message.timestamp || Date.now()
  const enriched: ChatMessage = {
    ...message,
    content,
    bookId,
    chapterNumber,
    paragraphIndex,
    timestamp: now,
  }
  const next = trimConversations(appendTurnToConversations(current, enriched, bookId, chapterNumber, paragraphIndex))
  if (next === current) return current
  writeLabBookChat(bookId, next)
  return next
}

// ---------------------------------------------------------------------------
// One-time migration of the retired `tinct:chat-history:lab` state (one blob,
// keyed by biblical book / title slug) into the per-book rows.

/** Registry id for a legacy lab key: the registry id, a title slug, else a Bible book. */
export function legacyLabBookToRegistryId(key: string, headerBook = ''): string | null {
  if (!key || key === 'lab') return null
  const direct = BOOKS.find(book => book.id === key)
  if (direct) return direct.id
  const byTitle = BOOKS.find(book => biblicalBookId(book.title) === key || (headerBook && book.title === headerBook))
  if (byTitle) return byTitle.id
  return 'bible'
}

/** Merge a legacy lab state into the per-book local rows. Returns the touched book ids. */
export function mergeLegacyLabChatState(state: LabChatHistoryState): string[] {
  const grouped = new Map<string, ChatConversation[]>()
  for (const [key, book] of Object.entries(state.books)) {
    const bookId = legacyLabBookToRegistryId(key, book.headerBook)
    if (!bookId) continue
    const list = grouped.get(bookId) ?? []
    for (const conversation of book.conversations) {
      list.push({
        ...conversation,
        bookId,
        messages: conversation.messages.map(message => ({ ...message, bookId })),
      })
    }
    grouped.set(bookId, list)
  }
  const touched: string[] = []
  for (const [bookId, incoming] of grouped) {
    const current = readLabBookChat(bookId)
    const merged = mergeChatConversations(current, incoming)
    if (!sameChatConversations(current, merged)) writeLabBookChat(bookId, merged)
    touched.push(bookId)
  }
  return touched
}

/** Migrate the device's legacy lab blob, then remove it. Idempotent; cheap once the key is gone. */
export function migrateLegacyLabChatHistoryLocal(): string[] {
  const legacy = readLegacyLabChatHistoryLocal()
  const hasLegacy = typeof localStorage !== 'undefined' && (() => {
    try { return localStorage.getItem('tinct:chat-history:lab') !== null } catch { return false }
  })()
  if (!hasLegacy) return []
  const touched = Object.keys(legacy.books).length > 0 ? mergeLegacyLabChatState(legacy) : []
  clearLegacyLabChatHistoryLocal()
  return touched
}

function legacyCloudMigratedFor(userId: string): boolean {
  const done = localStorageProvider.get<string>(LEGACY_CLOUD_MIGRATED_KEY)
  return done === userId
}

function markLegacyCloudMigrated(userId: string): void {
  localStorageProvider.set(LEGACY_CLOUD_MIGRATED_KEY, userId)
}

// ---------------------------------------------------------------------------
// Cloud: the same versioned `user_data` row the classic reader writes.

export interface LabChatCloudRow {
  conversations: ChatConversation[]
  rev: number
}

export interface LabChatCloudCommitResult {
  applied: boolean
  conflict: boolean
  row: LabChatCloudRow | null
}

export interface LabChatHistoryCloud {
  read(bookId: string): Promise<LabChatCloudRow | null>
  commit(bookId: string, conversations: ChatConversation[], expectedRev: number | null): Promise<LabChatCloudCommitResult>
}

type SupabaseLike = NonNullable<typeof supabase>

function rowFromVersioned(row: VersionedStorageRow | null | undefined, bookId: string): LabChatCloudRow | null {
  if (!row) return null
  const rev = coerceRev(row.rev) ?? 0
  if (row.value === null || row.value === undefined) return { conversations: [], rev }
  return { conversations: parseChatConversations(row.value, bookId), rev }
}

export function createLabChatHistoryCloud(userId: string, client: SupabaseLike | null = supabase): LabChatHistoryCloud | null {
  if (!client || !userId) return null
  return {
    async read(bookId) {
      const { data, error } = await client
        .from('user_data')
        .select('key, value, rev')
        .eq('user_id', userId)
        .eq('key', labChatHistoryKey(bookId))
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!data) return null
      return rowFromVersioned(data as VersionedStorageRow, bookId)
    },
    async commit(bookId, conversations, expectedRev) {
      const { data, error } = await client.rpc('commit_user_data', {
        p_user_id: userId,
        p_key: labChatHistoryKey(bookId),
        p_value: conversations,
        p_expected_rev: expectedRev ?? null,
      })
      if (error) throw new Error(error.message)
      const row = (Array.isArray(data) ? data[0] : data) as VersionedStorageRow | undefined
      const applied = versionedWriteApplied(row)
      return {
        applied,
        conflict: !applied && row?.conflict === true,
        row: rowFromVersioned(row, bookId),
      }
    },
  }
}

/**
 * Bring one book's local mirror and cloud row together: read the row, merge
 * with the local copy, write the merge locally and — when it adds anything
 * the cloud does not have — commit it with the row's rev. A conflict adopts
 * the server row, merges again and retries once. Returns what the reader
 * should see; on any failure that is the local copy.
 */
export async function syncLabBookChatWithCloud(input: {
  bookId: string
  cloud: LabChatHistoryCloud
  /** Remembers the rev of the row this device last saw, for later commits. */
  revs?: Map<string, number>
}): Promise<ChatConversation[]> {
  const { bookId, cloud } = input
  const local = readLabBookChat(bookId)
  try {
    let row = await cloud.read(bookId)
    for (let attempt = 0; attempt < 2; attempt++) {
      const merged = mergeChatConversations(row?.conversations ?? [], local)
      if (!sameChatConversations(local, merged)) writeLabBookChat(bookId, merged)
      if (row && sameChatConversations(row.conversations, merged)) {
        input.revs?.set(bookId, row.rev)
        return merged
      }
      const result = await cloud.commit(bookId, merged, row?.rev ?? null)
      if (result.applied) {
        if (result.row) input.revs?.set(bookId, result.row.rev)
        return merged
      }
      if (!result.conflict || !result.row) return merged
      row = result.row
    }
    return readLabBookChat(bookId)
  } catch {
    return local
  }
}

/**
 * Serialized cloud writer for chat rows: one commit in flight per book, the
 * newest queued value wins, a conflict re-reads, merges and retries once.
 * Offline or failed writes stay in the local mirror and are folded in by the
 * next `syncLabBookChatWithCloud` on open or reconnect.
 */
export function createLabChatCloudWriter(cloud: LabChatHistoryCloud, revs: Map<string, number> = new Map()) {
  const queued = new Map<string, ChatConversation[]>()
  const inFlight = new Set<string>()
  let dirty = false

  const run = async (bookId: string) => {
    inFlight.add(bookId)
    try {
      while (queued.has(bookId)) {
        const value = queued.get(bookId) as ChatConversation[]
        queued.delete(bookId)
        try {
          const result = await cloud.commit(bookId, value, revs.get(bookId) ?? null)
          if (result.applied) {
            if (result.row) revs.set(bookId, result.row.rev)
            dirty = false
            continue
          }
          if (result.conflict && result.row) {
            const merged = mergeChatConversations(result.row.conversations, readLabBookChat(bookId))
            writeLabBookChat(bookId, merged)
            revs.set(bookId, result.row.rev)
            const retry = await cloud.commit(bookId, merged, result.row.rev)
            if (retry.applied && retry.row) {
              revs.set(bookId, retry.row.rev)
              dirty = false
              continue
            }
          }
          dirty = true
        } catch {
          dirty = true
        }
      }
    } finally {
      inFlight.delete(bookId)
      if (queued.has(bookId)) void run(bookId)
    }
  }

  return {
    push(bookId: string, conversations: ChatConversation[]) {
      queued.set(bookId, conversations)
      if (!inFlight.has(bookId)) void run(bookId)
    },
    /** Merge the cloud row for this book back in (open, sign-in, reconnect). */
    sync(bookId: string) {
      return syncLabBookChatWithCloud({ bookId, cloud, revs })
    },
    isDirty: () => dirty,
    revs,
  }
}

/**
 * Signed-in, once per account per device: fold the retired KV blob
 * (`/api/lab-chat-history`) into the per-book rows so chats from before this
 * change reach every device through the versioned rows.
 */
export async function migrateLegacyLabChatHistoryCloud(input: {
  userId: string
  fetchLegacy: () => Promise<LabChatHistoryState | null>
}): Promise<string[]> {
  if (legacyCloudMigratedFor(input.userId)) return []
  let touched: string[] = []
  try {
    const legacy = await input.fetchLegacy()
    if (legacy && Object.keys(legacy.books).length > 0) touched = mergeLegacyLabChatState(legacy)
  } catch {
    return []
  }
  markLegacyCloudMigrated(input.userId)
  return touched
}
