import { parseChapterChatAction } from './labChapterChat'
import type { ChatConversation, ChatMessage } from '../types'
import { BOOKS } from '../data/bookRegistry'
import { localStorageProvider } from '../services/storage'
import { supabase } from '../services/supabase'
import { coerceRev, versionedWriteApplied, type VersionedStorageRow } from '../services/supabaseStorage.versioning'
import { isStuckRepeatedLine, type LabAskTurn } from './labAsk'
import { biblicalBookId } from './labPosition'
import { isUserBookId } from './userBook/userBookId'
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

function parseChatMessage(raw: unknown, bookId: string, fallbackTimestamp: number): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.id !== 'string' || !src.id || src.id.length > 160) return null
  if (src.role !== 'user' && src.role !== 'assistant') return null
  if (typeof src.content !== 'string') return null
  // Historical cross-book duplicate, verified against the complete War and Peace
  // conversation on 2026-09-08. Reject stale device copies on merge as well.
  if (bookId === 'bible' && src.id === 'msg_1780517006661_4' && src.role === 'assistant') return null
  // Classic dividers and transient error rows were persisted by older code;
  // the classic app strips them on load and so do we.
  if (src.chapterDivider != null || src.refreshAction === true) return null
  const content = src.content.trim()
  if (!content || content.length > MAX_CONTENT) return null
  if (typeof src.bookId === 'string' && src.bookId && src.bookId !== bookId) return null
  // A message without a usable time keeps its neighbour's (or its
  // conversation's), never "now": stamped with the time it was read, it would
  // move to the end of the thread on every load.
  const timestamp = isFiniteInt(src.timestamp, 1, 1e15) ? src.timestamp : fallbackTimestamp
  const source = src.source === 'voice' ? 'voice' : src.source === 'text' ? 'text' : undefined
  return {
    id: src.id,
    role: src.role,
    content,
    timestamp,
    bookId,
    chapterAction: parseChapterChatAction(src.chapterAction, bookId),
    chapterNumber: isFiniteInt(src.chapterNumber, 1, 5000) ? src.chapterNumber : undefined,
    paragraphIndex: isFiniteInt(src.paragraphIndex, 0, 10_000) ? src.paragraphIndex : undefined,
    ...(typeof src.highlightedText === 'string' && src.highlightedText ? { highlightedText: src.highlightedText.slice(0, MAX_CONTENT) } : {}),
    ...(src.isComplete === false ? { isComplete: false } : src.isComplete === true ? { isComplete: true } : {}),
    ...(source ? { source } : {}),
    ...(src.shownExplanation === true ? { shownExplanation: true } : {}),
  }
}

function parseConversation(raw: unknown, bookId: string): ChatConversation | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.id !== 'string' || !src.id || src.id.length > 160) return null
  if (typeof src.bookId === 'string' && src.bookId && src.bookId !== bookId) return null
  if (!Array.isArray(src.messages)) return null
  let fallback = isFiniteInt(src.startTimestamp, 1, 1e15) ? src.startTimestamp : isFiniteInt(src.endTimestamp, 1, 1e15) ? src.endTimestamp : 1
  const messages: ChatMessage[] = []
  for (const item of src.messages) {
    const parsed = parseChatMessage(item, bookId, fallback)
    if (!parsed) continue
    messages.push(parsed)
    fallback = parsed.timestamp
  }
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

/**
 * Past the cap, the oldest *messages* go, by their own time: a conversation
 * that began long ago but is still being added to (continued from Contents)
 * keeps its new turns. Conversations left empty are dropped.
 */
function trimConversations(conversations: ChatConversation[]): ChatConversation[] {
  const total = conversations.reduce((sum, item) => sum + item.messages.length, 0)
  if (total <= LAB_CHAT_MAX_MESSAGES_PER_BOOK) return conversations
  const all = conversations.flatMap((conversation, c) => conversation.messages.map((message, m) => ({ c, m, at: message.timestamp })))
  all.sort((x, y) => y.at - x.at || y.c - x.c || y.m - x.m)
  const keep = new Set(all.slice(0, LAB_CHAT_MAX_MESSAGES_PER_BOOK).map(({ c, m }) => `${c}:${m}`))
  const next: ChatConversation[] = []
  conversations.forEach((conversation, c) => {
    const messages = conversation.messages.filter((_, m) => keep.has(`${c}:${m}`))
    if (messages.length === 0) return
    next.push(messages.length === conversation.messages.length ? conversation : {
      ...conversation,
      messages,
      startTimestamp: Math.max(conversation.startTimestamp, Math.min(...messages.map(message => message.timestamp))),
    })
  })
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

/**
 * Conversation order for display: oldest first, newest last, whatever order
 * the row happens to be stored in. `appendLabChatTurn` moves a continued
 * conversation to the end of the stored array, and the classic reader writes
 * this same row, so stored order is not reliably chronological — only the
 * merge sorts. Sorting here is what makes "the last turn in the thread" mean
 * "the most recent turn" for every reader of a stored row.
 */
export function sortConversationsByTime(conversations: ChatConversation[]): ChatConversation[] {
  return [...conversations].sort((x, y) => x.startTimestamp - y.startTimestamp || x.id.localeCompare(y.id))
}

/**
 * The thread: every message, ordered by its own time, oldest first. Not
 * conversation by conversation: a conversation that began days ago and was
 * continued today would otherwise sit above one that began later and ended
 * long ago, and the older exchange would read as the latest (Anders, 10 Oct
 * 2026, 1 Maccabees 2 vs Matthew 14). Equal times keep conversation order.
 */
export function turnsFromConversations(conversations: ChatConversation[]): LabAskTurn[] {
  return sortConversationsByTime(conversations)
    .flatMap(conversation => conversation.messages.map(message => ({ conversation, message })))
    .sort((x, y) => x.message.timestamp - y.message.timestamp)
    .map(({ conversation, message }) => ({
      id: message.id,
      bookId: conversation.bookId,
      chapterAction: message.chapterAction,
      role: message.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: message.content,
      timestamp: message.timestamp,
      source: message.source === 'voice' ? 'voice' as const : 'typed' as const,
      chapterNumber: message.chapterNumber ?? conversation.chapterNumber,
      paragraphIndex: message.paragraphIndex ?? conversation.paragraphIndex,
      highlightedText: message.highlightedText,
      cancelled: message.isComplete === false,
      ...(message.shownExplanation ? { shownExplanation: true } : {}),
    }))
}

/**
 * The displayed thread after a re-read of the stored history: the stored turns
 * plus every live turn the store does not have (yet): an answer still
 * arriving, a turn whose save is in flight or failed. Ordered by time; a turn
 * without one (an answer still arriving) stays at the end. A re-read can add
 * turns but never drops or reorders the ones on screen.
 */
export function reconcileTurns(live: LabAskTurn[], stored: LabAskTurn[]): LabAskTurn[] {
  const known = new Set(stored.map(turn => turn.id))
  const pending = live.filter(turn => !known.has(turn.id))
  if (pending.length === 0) return stored
  const at = (turn: LabAskTurn) => (typeof turn.timestamp === 'number' && Number.isFinite(turn.timestamp) ? turn.timestamp : Infinity)
  return [...stored, ...pending].sort((x, y) => at(x) - at(y))
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
  continued = false,
): ChatConversation[] {
  const now = enriched.timestamp
  const last = current[current.length - 1]
  if (
    last
    && last.bookId === bookId
    && last.chapterNumber === chapterNumber
    && (continued || now - last.endTimestamp < CONVERSATION_GAP_MS)
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

/** The device copy, plus anything `base` holds that it lacks (normally nothing: then the copy itself, in its stored order). */
function withUnsaved(local: ChatConversation[], base: ChatConversation[] | undefined): ChatConversation[] {
  if (!base || base.length === 0) return local
  const saved = new Set(local.flatMap(conversation => conversation.messages.map(message => message.id)))
  const missing = base.some(conversation => conversation.messages.some(message => !saved.has(message.id)))
  return missing ? mergeChatConversations(base, local) : local
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
  conversationId?: string,
  /**
   * The thread as this page last knew it. Merged under the device copy so a
   * turn whose local write failed (a full localStorage on a phone) is not
   * missing from the value the next turn commits to the account row.
   */
  base?: ChatConversation[],
): ChatConversation[] {
  let current = withUnsaved(readLabBookChat(bookId), base)
  if (!bookId || (message.bookId && message.bookId !== bookId && !(message.bookId === 'lab' && message.source === 'voice'))) return current
  if (conversationId) {
    const target = current.find(item => item.id === conversationId && item.bookId === bookId && item.chapterNumber === chapterNumber)
    if (!target) return current
    current = [...current.filter(item => item.id !== target.id), target]
  }
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
  const next = trimConversations(appendTurnToConversations(current, enriched, bookId, chapterNumber, paragraphIndex, Boolean(conversationId)))
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

/**
 * Longest a chat row read or commit may take before this device gives up on
 * it. A request that never settles (an iPhone page suspended mid-request, a
 * stalled auth refresh) otherwise holds the refresh guard and the writer's
 * in-flight slot for the rest of the page's life: no later refresh runs and
 * no later turn is uploaded. An abandoned commit that did land is harmless:
 * the next one carries a stale rev, conflicts and merges.
 */
export const LAB_CHAT_CLOUD_TIMEOUT_MS = 15_000

function withCloudTimeout<T>(run: (signal: AbortSignal | undefined) => PromiseLike<T>, label: string): Promise<T> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller?.abort()
      reject(new Error(`${label} timed out`))
    }, LAB_CHAT_CLOUD_TIMEOUT_MS)
  })
  return Promise.race([Promise.resolve(run(controller?.signal)), timeout]).finally(() => clearTimeout(timer))
}

/**
 * Postgres JSONB refuses a string holding U+0000 or half of a UTF-16
 * surrogate pair (a preview or passage cut through an emoji), and refuses it
 * for the whole row: one such character made every later commit of that
 * book's thread fail. Strip NUL and replace unpaired surrogates with U+FFFD
 * in everything the row sends.
 */
export function cleanChatValueForCloud<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/\u0000/g, '').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\uFFFD') as T
  }
  if (Array.isArray(value)) return value.map(item => cleanChatValueForCloud(item)) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) out[key] = cleanChatValueForCloud(item)
    return out as T
  }
  return value
}

/**
 * Every cloud call the sync and the writer make, bounded in time and with the
 * value cleaned for JSONB. Applies to any `LabChatHistoryCloud`, so a hung or
 * poisoned call can never pin the refresh guard or the writer's queue.
 */
function guardedCloud(cloud: LabChatHistoryCloud): LabChatHistoryCloud {
  return {
    read: bookId => withCloudTimeout(() => cloud.read(bookId), 'chat history read'),
    commit: (bookId, conversations, expectedRev) => withCloudTimeout(
      () => cloud.commit(bookId, cleanChatValueForCloud(conversations), expectedRev),
      'chat history commit',
    ),
  }
}

type AbortableQuery<T> = PromiseLike<T> & { abortSignal?: (signal: AbortSignal) => PromiseLike<T> }

function abortable<T>(query: AbortableQuery<T>, signal: AbortSignal | undefined): PromiseLike<T> {
  return signal && typeof query.abortSignal === 'function' ? query.abortSignal(signal) : query
}

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
      const { data, error } = await withCloudTimeout(signal => abortable(client
        .from('user_data')
        .select('key, value, rev')
        .eq('user_id', userId)
        .eq('key', labChatHistoryKey(bookId))
        .maybeSingle(), signal), 'chat history read')
      if (error) throw new Error(error.message)
      if (!data) return null
      return rowFromVersioned(data as VersionedStorageRow, bookId)
    },
    async commit(bookId, conversations, expectedRev) {
      const { data, error } = await withCloudTimeout(signal => abortable(client.rpc('commit_user_data', {
        p_user_id: userId,
        p_key: labChatHistoryKey(bookId),
        p_value: cleanChatValueForCloud(conversations),
        p_expected_rev: expectedRev ?? null,
      }), signal), 'chat history commit')
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
  onUnavailable?: () => void
  isCurrent?: () => boolean
}): Promise<ChatConversation[]> {
  const { bookId } = input
  const cloud = guardedCloud(input.cloud)
  const local = readLabBookChat(bookId)
  try {
    let row = await cloud.read(bookId)
    for (let attempt = 0; attempt < 2; attempt++) {
      if (input.isCurrent?.() === false) return local
      const current = readLabBookChat(bookId)
      const merged = mergeChatConversations(row?.conversations ?? [], current)
      if (!sameChatConversations(current, merged)) writeLabBookChat(bookId, merged)
      if (row && sameChatConversations(row.conversations, merged)) {
        input.revs?.set(bookId, row.rev)
        return merged
      }
      // No row yet: expect rev 0 (insert only). NULL would overwrite a row
      // another device created meanwhile instead of conflicting.
      const result = await cloud.commit(bookId, merged, row?.rev ?? 0)
      if (input.isCurrent?.() === false) return local
      if (result.applied) {
        if (result.row) input.revs?.set(bookId, result.row.rev)
        return mergeChatConversations(merged, readLabBookChat(bookId))
      }
      if (!result.conflict || !result.row) return merged
      row = result.row
    }
    return readLabBookChat(bookId)
  } catch {
    input.onUnavailable?.()
    if (input.isCurrent?.() === false) return local
    // The merge may already be in the local mirror (only the commit failed):
    // show that, not the copy from before the read.
    return readLabBookChat(bookId)
  }
}

/**
 * Serialized cloud writer for chat rows: one commit in flight per book, the
 * newest queued value wins, a conflict re-reads, merges and retries once.
 * Offline or failed writes stay in the local mirror and are folded in by the
 * next `syncLabBookChatWithCloud` on open or reconnect.
 */
export function createLabChatCloudWriter(rawCloud: LabChatHistoryCloud, revs: Map<string, number> = new Map()) {
  const cloud = guardedCloud(rawCloud)
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
          // A rev this device has not seen yet is 0, never NULL: NULL makes
          // commit_user_data overwrite the row, dropping turns another device
          // committed (Invariant 9). 0 conflicts with any existing row and the
          // conflict path below merges.
          const result = await cloud.commit(bookId, value, revs.get(bookId) ?? 0)
          if (result.applied) {
            if (result.row) revs.set(bookId, result.row.rev)
            dirty = false
            continue
          }
          if (result.conflict && result.row) {
            // The queued value too: when the local mirror could not be written
            // (a full localStorage on a phone) it is the only copy of the turn.
            const merged = mergeChatConversations(result.row.conversations, mergeChatConversations(readLabBookChat(bookId), value))
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
      // A reader's own book keeps its chat on this device (lab/userBook).
      if (isUserBookId(bookId)) return
      queued.set(bookId, conversations)
      if (!inFlight.has(bookId)) void run(bookId)
    },
    /** Merge the cloud row for this book back in (open, sign-in, reconnect). */
    sync(bookId: string, onUnavailable?: () => void, isCurrent?: () => boolean) {
      if (isUserBookId(bookId)) return Promise.resolve(readLabBookChat(bookId))
      return syncLabBookChatWithCloud({ bookId, cloud: rawCloud, revs, onUnavailable, isCurrent })
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
